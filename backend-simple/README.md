# OpenBookLM Simple Backend

A simplified backend for OpenBookLM that focuses only on text summarization using the OpenAI API.

## Features

-   Text summarization via OpenAI API
-   Website content extraction and summarization
-   Chunking of large texts with token limits
-   Combining summaries into a coherent final summary
-   Processing status tracking

## Getting Started

### Prerequisites

-   Python 3.8+ (tested with Python 3.13)
-   OpenAI API Key

### Installation

1. Clone the repository
2. Navigate to the `backend-simple` directory
3. Create a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate   # On Windows: venv\Scripts\activate
    ```
4. Upgrade pip and install dependencies:
    ```bash
    pip install --upgrade pip setuptools wheel
    pip install fastapi uvicorn openai python-dotenv aiofiles requests beautifulsoup4 python-multipart tiktoken
    ```
    
    **Note:** If you encounter issues with `tiktoken` on Python 3.13, install the latest version separately:
    ```bash
    pip install tiktoken
    ```

5. Set up environment variables - A `.env` file should already exist with the following format:
    ```
    OPENAI_API_KEY=your_openai_api_key_here
    FRONTEND_URL=http://localhost:3000
    PORT=8000
    DEFAULT_MODEL=gpt-3.5-turbo
    ```

### Running the Server

1. Activate the virtual environment:
    ```bash
    source venv/bin/activate   # On Windows: venv\Scripts\activate
    ```

2. Run the FastAPI server:
    ```bash
    python main.py
    ```

The server will start at http://localhost:8000 (or the port specified in your `.env` file)

### Verifying the Installation

You can verify the server is running by visiting:
- Health check: http://localhost:8000/health
- API documentation: http://localhost:8000/docs

## API Endpoints

### 1. Summarize Text

```
POST /api/summarize
```

**Request Body:**

```json
{
    "text": "Long text to summarize...",
    "model_name": "gpt-3.5-turbo" // Optional, defaults to gpt-3.5-turbo
}
```

**Response:**

```json
{
    "status": "completed",
    "summary": "Summarized text...",
    "progress": 100
}
```

### 2. Summarize Website Content

```
POST /api/website
```

**Request Body:**

```json
{
    "url": "https://example.com/article",
    "model_name": "gpt-3.5-turbo" // Optional
}
```

**Response:**

```json
{
    "status": "completed",
    "summary": "Summarized website content...",
    "progress": 100
}
```

### 3. Get Processing Status

```
GET /api/status
```

**Response:**

```json
{
    "status": "processing",
    "progress": 65,
    "error": null
}
```

## Configuration

The following environment variables can be set in the `.env` file:

-   `OPENAI_API_KEY`: Your OpenAI API key
-   `FRONTEND_URL`: URL of the frontend for CORS (default: http://localhost:3000)
-   `PORT`: Port to run the server on (default: 8000)

## Token Limits and Chunking

The system manages token limits as follows:

-   Maximum tokens per chunk: 3,000
-   Context window for gpt-3.5-turbo: 4,000 tokens
-   Target summary length: 800 tokens

Large texts are automatically split into chunks, processed separately, and then combined into a final summary.
