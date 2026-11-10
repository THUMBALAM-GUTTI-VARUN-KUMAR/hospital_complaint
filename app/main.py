"""CAREVOICE Backend Application Entrypoint.

Public Hospital Grievance Registration and Monitoring System.
"""

import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import DATABASE_URL, init_db
from app.routers import complaints, dashboard, feedback

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context for startup and shutdown routines."""
    # Initialize database schemas
    init_db()
    yield


app = FastAPI(
    title="CAREVOICE API",
    description="Public Hospital Grievance Registration and Monitoring System Backend",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure CORS for React Frontend and external clients
raw_origins = os.getenv("CORS_ORIGINS", "")
if raw_origins:
    origins = [orig.strip() for orig in raw_origins.split(",") if orig.strip()]
else:
    origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
    ]

# If '*' in origins, allow all origins
allow_all = "*" in origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(complaints.router)
app.include_router(dashboard.router)
app.include_router(feedback.router)


@app.get("/", tags=["Health"])
def root():
    """Root health and service status endpoint."""
    return {
        "service": "CAREVOICE Backend API",
        "status": "healthy",
        "version": "1.0.0",
        "database_backend": "PostgreSQL (Supabase)",
        "docs_url": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Detailed health check endpoint."""
    return {
        "status": "up",
        "database": "configured",
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global catch-all exception handler to return structured JSON errors."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": str(exc),
            "path": request.url.path,
        },
    )
