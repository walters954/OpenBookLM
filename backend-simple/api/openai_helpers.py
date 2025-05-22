import os
import logging
import asyncio
import time
from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Constants for API request timeout
BASE_TIMEOUT = 30
CONNECT_TIMEOUT = 10  # Time to establish connection
BASE_READ_TIMEOUT = 30  # Base time to wait for response
TIMEOUT_PER_1K_TOKENS = 3  # Additional seconds per 1K tokens

# Initialize logger
logger = logging.getLogger(__name__)

# Get API key from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found in environment variables")

# Initialize OpenAI client - use only documented parameters
client = AsyncOpenAI(
    api_key=OPENAI_API_KEY,
    timeout=BASE_TIMEOUT
)

def calculate_timeout(num_tokens: int) -> float:
    """Calculate appropriate timeout based on input token count."""
    return BASE_TIMEOUT + (num_tokens / 1000) * TIMEOUT_PER_1K_TOKENS

class APIError(Exception):
    """Custom exception for API errors with handling logic."""
    def __init__(self, message: str, status_code: Optional[int] = None):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)
    
    async def handle(self, attempt: int, max_retries: int) -> None:
        """Handle API errors with appropriate backoff based on status code."""
        if self.status_code:
            if self.status_code == 429:  # Rate limit
                wait_time = 2 * (2 ** attempt)
                logger.warning(f"Rate limited. Waiting {wait_time} seconds...")
                await asyncio.sleep(wait_time)
            elif self.status_code >= 500:  # Server error
                wait_time = 1 * (2 ** attempt)
                logger.warning(f"Server error. Waiting {wait_time} seconds...")
                await asyncio.sleep(wait_time)
            else:  # Client error
                if attempt < max_retries - 1:
                    wait_time = 1 * (2 ** attempt)
                    logger.warning(f"Client error. Waiting {wait_time} seconds...")
                    await asyncio.sleep(wait_time)
                else:
                    logger.error(f"Unrecoverable client error: {self.message}")
        else:
            wait_time = 1 * (2 ** attempt)
            logger.warning(f"Unknown error. Waiting {wait_time} seconds...")
            await asyncio.sleep(wait_time)

async def make_api_call(
    messages: List[Dict[str, str]],
    model_name: str = "gpt-3.5-turbo",
    temperature: float = 0.7,
    max_tokens: int = 1000,
    timeout: Optional[float] = None
) -> str:
    """Make an API call to OpenAI with appropriate error handling."""
    try:
        # Calculate timeout if not provided
        if timeout is None:
            # Estimate token count from messages
            from utils.token_counter import count_tokens
            input_tokens = sum(count_tokens(msg["content"]) for msg in messages)
            timeout = calculate_timeout(input_tokens)
        
        # Make the API call
        response = await asyncio.wait_for(
            client.chat.completions.create(
                model=model_name,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            ),
            timeout=timeout
        )
        
        return response.choices[0].message.content
        
    except asyncio.TimeoutError:
        logger.error(f"Request timed out after {timeout} seconds")
        raise APIError(f"Request timed out after {timeout} seconds")
        
    except Exception as e:
        status_code = getattr(e, "status_code", None)
        error_message = str(e)
        logger.error(f"OpenAI API error: {error_message}")
        raise APIError(error_message, status_code) 