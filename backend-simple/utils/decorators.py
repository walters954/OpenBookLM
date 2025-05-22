import time
import asyncio
import functools
import logging
from typing import Callable, Any
import random

logger = logging.getLogger(__name__)

def timeit(func):
    """Decorator to measure and log the execution time of a function."""
    @functools.wraps(func)
    async def async_wrapper(*args, **kwargs):
        start_time = time.time()
        result = await func(*args, **kwargs)
        end_time = time.time()
        logger.info(f"{func.__name__} took {end_time - start_time:.2f} seconds")
        return result

    @functools.wraps(func)
    def sync_wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        logger.info(f"{func.__name__} took {end_time - start_time:.2f} seconds")
        return result

    return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper

def retry_with_backoff(max_retries=3, base_delay=1, max_delay=60):
    """Decorator to retry a function with exponential backoff."""
    def decorator(func):
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries - 1:
                        logger.error(f"Failed after {max_retries} attempts: {str(e)}")
                        raise
                    
                    delay = min(base_delay * (2 ** attempt), max_delay)
                    jitter = random.uniform(0, 0.1 * delay)  # Add jitter (0-10%)
                    wait_time = delay + jitter
                    
                    logger.warning(f"Attempt {attempt + 1} failed: {str(e)}. Retrying in {wait_time:.2f} seconds...")
                    await asyncio.sleep(wait_time)

        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries - 1:
                        logger.error(f"Failed after {max_retries} attempts: {str(e)}")
                        raise
                    
                    delay = min(base_delay * (2 ** attempt), max_delay)
                    jitter = random.uniform(0, 0.1 * delay)  # Add jitter (0-10%)
                    wait_time = delay + jitter
                    
                    logger.warning(f"Attempt {attempt + 1} failed: {str(e)}. Retrying in {wait_time:.2f} seconds...")
                    time.sleep(wait_time)

        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator 