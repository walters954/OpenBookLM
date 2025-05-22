"""
Constants for token management across different LLM models.
This file centralizes token limits and other model-specific parameters.
"""

# Dictionary of model configurations
MODEL_CONFIGS = {
    # GPT-3.5 Turbo (4K) configuration
    "gpt-3.5-turbo": {
        "max_tokens_per_chunk": 3000,  # Max tokens per API request
        "context_window": 4000,  # Total context window size
        "chunk_overlap": 100,  # Overlap between chunks
        "target_summary_tokens": 800,  # Target length for summaries
        "overhead_tokens": 100,  # System prompt, formatting, etc.
        "name": "gpt-3.5-turbo",
    },
    
    # GPT-3.5 Turbo (16K) configuration
    "gpt-3.5-turbo-16k": {
        "max_tokens_per_chunk": 8000,  # Max tokens per API request
        "context_window": 16000,  # Total context window size 
        "chunk_overlap": 200,  # Overlap between chunks
        "target_summary_tokens": 1000,  # Target length for summaries
        "overhead_tokens": 100,  # System prompt, formatting, etc.
        "name": "gpt-3.5-turbo-16k",
    },
    
    # GPT-4 Turbo configuration
    "gpt-4-turbo": {
        "max_tokens_per_chunk": 8000,  # Max tokens per API request
        "context_window": 128000,  # Total context window size
        "chunk_overlap": 200,  # Overlap between chunks
        "target_summary_tokens": 1200,  # Target length for summaries
        "overhead_tokens": 100,  # System prompt, formatting, etc.
        "name": "gpt-4-turbo",
    },
    
    # GPT-4 (8K) configuration
    "gpt-4": {
        "max_tokens_per_chunk": 4000,  # Max tokens per API request
        "context_window": 8000,  # Total context window size
        "chunk_overlap": 200,  # Overlap between chunks
        "target_summary_tokens": 1000,  # Target length for summaries
        "overhead_tokens": 100,  # System prompt, formatting, etc.
        "name": "gpt-4",
    },
}

# Default model to use
DEFAULT_MODEL = "gpt-3.5-turbo"

def get_model_config(model_name=None):
    """
    Get the configuration for a specific model.
    Falls back to the default model if the requested model is not found.
    
    Args:
        model_name: Name of the model to get configuration for
        
    Returns:
        Dictionary containing model configuration parameters
    """
    if not model_name:
        model_name = DEFAULT_MODEL
        
    return MODEL_CONFIGS.get(model_name, MODEL_CONFIGS[DEFAULT_MODEL]) 