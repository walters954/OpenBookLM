import os
from openai import AsyncOpenAI
from dotenv import load_dotenv
import asyncio

# Load environment variables
load_dotenv()

# Get API key from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found in environment variables")

async def test_openai():
    # Create client with minimal parameters
    client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    
    # Test completion
    response = await client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Hello, world!"}
        ]
    )
    
    print(response.choices[0].message.content)

if __name__ == "__main__":
    asyncio.run(test_openai()) 