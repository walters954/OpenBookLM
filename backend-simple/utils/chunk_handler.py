import logging
import asyncio
from typing import List, Dict, Any
import aiofiles

from utils.token_counter import count_tokens, truncate_text_to_tokens
from api.openai_helpers import make_api_call
from utils.decorators import timeit, retry_with_backoff

# Constants for token management
MAX_TOKENS_PER_CHUNK = 3000  # Max tokens per API request
CONTEXT_WINDOW = 4000  # Default for GPT-3.5-turbo
CHUNK_OVERLAP = 100  # Overlap between chunks
TARGET_SUMMARY_TOKENS = 800  # Target length for summaries
OVERHEAD_TOKENS = 100  # System prompt, formatting, etc.
MAX_INPUT_TOKENS = CONTEXT_WINDOW - TARGET_SUMMARY_TOKENS - OVERHEAD_TOKENS

# Prompt for summarization
SUMMARY_PROMPT = """You are a precise summarization assistant. Your task is to create a DETAILED summary of TARGET_TOKENS tokens. \
Your summary MUST be EXACTLY TARGET_TOKENS tokens long. Not shorter, not longer.
 
Instructions:
1. Keep title and author if available
2. Use a conversational tone
3. Include all key points, main arguments, and important details
4. Expand each point with relevant examples and context
5. If your summary is too short, add more details until you reach TARGET_TOKENS tokens
6. Do not include: references, citations, release notes, trademarks, source code, logos, disclaimers, legal notices, or appendices

Required summary length: TARGET_TOKENS tokens. You MUST hit this target.

Text to summarize:
"""

# Add a logger
logger = logging.getLogger(__name__)

# Define status tracking classes
class ProcessingStatus:
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    ERROR = "error"

class ProcessingProgress:
    def __init__(self):
        self.status = ProcessingStatus.PENDING
        self.progress = 0
        self.total_chunks = 0
        self.processed_chunks = 0
        self.current_chunk = 0
        self.error = None

    def update(self, chunk_num: int, total_chunks: int):
        self.current_chunk = chunk_num
        self.total_chunks = total_chunks
        self.processed_chunks = chunk_num
        self.progress = int((chunk_num / total_chunks) * 100)
        self.status = ProcessingStatus.PROCESSING

    def complete(self):
        self.status = ProcessingStatus.COMPLETED
        self.progress = 100

    def set_error(self, error: str):
        self.status = ProcessingStatus.ERROR
        self.error = error

# Global progress tracker
processing_progress = ProcessingProgress()

def split_text_into_chunks(text: str) -> List[str]:
    """Split text into chunks that fit within token limits."""
    if not text:
        return []
        
    # First split into paragraphs
    paragraphs = text.split('\n\n')
    chunks = []
    current_chunk = []
    current_tokens = 0
    
    for paragraph in paragraphs:
        paragraph = paragraph.strip()
        if not paragraph:
            continue
            
        # Count tokens in this paragraph
        para_tokens = count_tokens(paragraph)
        
        # If paragraph alone exceeds limit, split it
        if para_tokens > MAX_INPUT_TOKENS:
            # If we have a current chunk, add it first
            if current_chunk:
                chunks.append('\n\n'.join(current_chunk))
                current_chunk = []
                current_tokens = 0
            
            # Split paragraph into sentences
            sentences = paragraph.split('. ')
            temp_chunk = []
            temp_tokens = 0
            
            for sentence in sentences:
                sentence = sentence.strip()
                if not sentence:
                    continue
                    
                sent_tokens = count_tokens(sentence)
                
                # If adding this sentence would exceed limit
                if temp_tokens + sent_tokens > MAX_INPUT_TOKENS:
                    # Save current temp chunk if it exists
                    if temp_chunk:
                        chunks.append('. '.join(temp_chunk) + '.')
                        temp_chunk = []
                        temp_tokens = 0
                
                # Add sentence to temp chunk
                temp_chunk.append(sentence)
                temp_tokens += sent_tokens
            
            # Add any remaining sentences
            if temp_chunk:
                chunks.append('. '.join(temp_chunk) + '.')
            
        # If adding this paragraph would exceed limit
        elif current_tokens + para_tokens > MAX_INPUT_TOKENS:
            # Save current chunk and start new one
            chunks.append('\n\n'.join(current_chunk))
            current_chunk = [paragraph]
            current_tokens = para_tokens
            
        # Add paragraph to current chunk
        else:
            current_chunk.append(paragraph)
            current_tokens += para_tokens
    
    # Add final chunk if it exists
    if current_chunk:
        chunks.append('\n\n'.join(current_chunk))
    
    logger.info(f"Split text into {len(chunks)} chunks")
    return chunks

@retry_with_backoff()
async def process_chunk(chunk: str, model_name: str) -> str:
    """Process a single chunk to generate a summary."""
    chunk_tokens = count_tokens(chunk)
    if chunk_tokens > MAX_TOKENS_PER_CHUNK:
        logger.warning(f"Chunk size ({chunk_tokens}) exceeds max tokens ({MAX_TOKENS_PER_CHUNK})")
        # Truncate chunk if needed
        chunk = truncate_text_to_tokens(chunk, MAX_TOKENS_PER_CHUNK - OVERHEAD_TOKENS)
        
    prompt_with_count = SUMMARY_PROMPT.replace("TARGET_TOKENS", str(TARGET_SUMMARY_TOKENS))
    messages = [
        {"role": "system", "content": "You are a helpful assistant that summarizes text accurately."},
        {"role": "user", "content": f"{prompt_with_count}\n{chunk}"}
    ]

    return await make_api_call(messages=messages, model_name=model_name)

@retry_with_backoff()
async def combine_summaries(summaries: List[str], model_name: str) -> str:
    """Combine multiple summaries into one cohesive summary."""
    if not summaries:
        return ""
    if len(summaries) == 1:
        return summaries[0]

    # Check total size before combining
    total_tokens = sum(count_tokens(s) for s in summaries)
    if total_tokens > MAX_TOKENS_PER_CHUNK * 2:
        # If too large, recursively combine smaller groups
        mid = len(summaries) // 2
        first_half = await combine_summaries(summaries[:mid], model_name)
        second_half = await combine_summaries(summaries[mid:], model_name)
        combined = [first_half, second_half]
    else:
        combined = summaries

    # Format summaries with part numbers
    combined_text = "\n\n".join([f"Part {i+1}:\n{summary}" for i, summary in enumerate(combined)])
    
    prompt = f"""Combine these summaries into a single coherent summary of approximately {TARGET_SUMMARY_TOKENS} tokens. 
Maintain all important information, avoid redundancy, and ensure smooth transitions between topics.

{combined_text}"""

    messages = [
        {"role": "system", "content": "You are a helpful assistant that combines text summaries."},
        {"role": "user", "content": prompt}
    ]

    return await make_api_call(messages=messages, model_name=model_name)

@timeit
async def process_text_document(text: str, model_name: str = "gpt-3.5-turbo") -> Dict[str, Any]:
    """Process a text document by chunking, summarizing each chunk, and combining summaries."""
    try:
        processing_progress.status = ProcessingStatus.PROCESSING
        chunks = split_text_into_chunks(text)
        processing_progress.total_chunks = len(chunks)
        
        summaries = []
        for i, chunk in enumerate(chunks, 1):
            processing_progress.update(i, len(chunks))
            summary = await process_chunk(chunk, model_name)
            if summary:
                summaries.append(summary)
                
        if not summaries:
            error = "No valid summaries generated"
            processing_progress.set_error(error)
            return {
                "status": ProcessingStatus.ERROR,
                "error": error
            }
            
        final_summary = await combine_summaries(summaries, model_name)
        
        processing_progress.complete()
        return {
            "status": ProcessingStatus.COMPLETED,
            "summary": final_summary,
            "progress": 100
        }
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error processing text: {error_msg}")
        processing_progress.set_error(error_msg)
        return {
            "status": ProcessingStatus.ERROR,
            "error": error_msg,
            "progress": processing_progress.progress
        }

async def get_processing_status() -> Dict[str, Any]:
    """Get the current processing status."""
    return {
        "status": processing_progress.status,
        "progress": processing_progress.progress,
        "error": processing_progress.error
    } 