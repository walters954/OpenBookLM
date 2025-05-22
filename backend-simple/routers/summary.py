from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import logging
import requests
from bs4 import BeautifulSoup
from fastapi.responses import JSONResponse
import os

from ..utils.chunk_handler import process_text_document, get_processing_status
from ..utils.decorators import timeit

# Initialize logger
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Define request models
class TextSummaryRequest(BaseModel):
    text: str
    model_name: Optional[str] = "gpt-3.5-turbo"

class WebsiteSourceRequest(BaseModel):
    url: str
    notebookId: Optional[str] = None
    userId: Optional[str] = None
    model_name: Optional[str] = "gpt-3.5-turbo"

@router.post("/summarize")
@timeit
async def summarize_text(request: TextSummaryRequest) -> Dict[str, Any]:
    """Summarize text content directly."""
    try:
        logger.info("Processing text summarization request")
        
        if not request.text:
            raise HTTPException(
                status_code=400,
                detail="Text content is required"
            )
            
        result = await process_text_document(request.text, request.model_name)
        return result
        
    except Exception as e:
        logger.error(f"Error processing text: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing text: {str(e)}"
        )

@router.post("/website")
@timeit
async def process_website(request: WebsiteSourceRequest) -> Dict[str, Any]:
    """Fetch and summarize content from a website URL."""
    try:
        logger.info(f"Processing website URL: {request.url}")
        
        # Fetch website content
        response = requests.get(request.url, timeout=10)  # Add timeout
        response.raise_for_status()
        
        # Parse HTML and extract text
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()
            
        # Get text content
        text = soup.get_text()
        
        # Clean up text (remove extra whitespace)
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        # Process the text content
        result = await process_text_document(text, request.model_name)
        
        return JSONResponse(content=result)
        
    except requests.RequestException as e:
        logger.error(f"Failed to fetch website: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to fetch website: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error processing website: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing website: {str(e)}"
        )

@router.get("/status")
async def get_processing_status_endpoint() -> Dict[str, Any]:
    """Get current processing status."""
    status = await get_processing_status()
    return status 