import tiktoken
from functools import lru_cache

@lru_cache(maxsize=1)
def get_tokenizer(model_name="gpt-3.5-turbo"):
    """Get a tokenizer for the specified model with caching."""
    try:
        encoding = tiktoken.encoding_for_model(model_name)
    except KeyError:
        # Fall back to cl100k_base for newer models not yet in tiktoken
        encoding = tiktoken.get_encoding("cl100k_base")
    return encoding

def count_tokens(text, model_name="gpt-3.5-turbo"):
    """Count the number of tokens in the given text for the specified model."""
    if not text:
        return 0
    
    tokenizer = get_tokenizer(model_name)
    return len(tokenizer.encode(text))

def truncate_text_to_tokens(text, max_tokens, model_name="gpt-3.5-turbo"):
    """Truncate text to be at most max_tokens tokens."""
    if not text:
        return ""
    
    tokenizer = get_tokenizer(model_name)
    tokens = tokenizer.encode(text)
    
    if len(tokens) <= max_tokens:
        return text
    
    truncated_tokens = tokens[:max_tokens]
    return tokenizer.decode(truncated_tokens) 