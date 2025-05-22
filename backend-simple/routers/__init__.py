from .summary import router as summary_router

# Create router registry
routers = {
    "summary": {
        "router": summary_router,
        "prefix": "/api",
        "tags": ["summary"]
    }
} 