from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import logging
from dotenv import load_dotenv

# Import centralized routers
from routers import routers

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)

# Load environment variables
load_dotenv()

app = FastAPI(
    title="OpenBookLM Simple Backend",
    description="Simplified backend for text summarization using OpenAI API",
    version="0.1.0"
)

# Get frontend URL from environment variable, default to localhost:3000
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

# Add CORS middleware with configurable frontend URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include all routers from the registry
for router_config in routers.values():
    app.include_router(
        router_config["router"],
        prefix=router_config["prefix"],
        tags=router_config["tags"]
    )

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True) 