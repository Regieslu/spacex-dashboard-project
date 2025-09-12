from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging
import time
from app.api import launches, rockets, starlink, upcoming
import os

origins = [
    "http://localhost:5173",
    "https://spacex-dashboard-project-9vlx.vercel.app",
    "https://spacex-dashboard-project-*.vercel.app",
    "https://*.vercel.app",
]

if os.getenv("ENVIRONMENT") == "production":
    origins = [
        "https://spacex-dashboard-project-9vlx.vercel.app",
        "https://spacex-dashboard-project-*.vercel.app",
        "https://*.vercel.app",
    ]

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SpaceX BFF")

# Middleware de CORS
app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Middleware global for error handling
@app.middleware("http")
async def error_handling_middleware(request: Request, call_next):
    start_time = time.time()
    
    try:
        response = await call_next(request)
        
        # Log of successful requests
        process_time = time.time() - start_time
        logger.info(f"Request successful: {request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s")
        
        return response
        
    except HTTPException as e:
        # Handle HTTPExceptions of FastAPI
        process_time = time.time() - start_time
        logger.error(f"HTTP Error: {request.method} {request.url.path} - {e.status_code} - {process_time:.3f}s")
        
        return JSONResponse(
            status_code=e.status_code,
            content={
                "error": True,
                "message": e.detail.get("message", str(e.detail)) if isinstance(e.detail, dict) else str(e.detail),
                "details": e.detail.get("details", {}) if isinstance(e.detail, dict) else {},
                "timestamp": e.detail.get("timestamp", time.time()) if isinstance(e.detail, dict) else time.time(),
                "path": request.url.path,
                "method": request.method
            }
        )
        
    except RequestValidationError as e:
        # Handle validation errors
        process_time = time.time() - start_time
        logger.error(f"Validation Error: {request.method} {request.url.path} - {process_time:.3f}s")
        
        return JSONResponse(
            status_code=422,
            content={
                "error": True,
                "message": "Error de validación en la solicitud",
                "details": e.errors(),
                "timestamp": time.time(),
                "path": request.url.path,
                "method": request.method
            }
        )
        
    except Exception as e:
        # Handle unexpected errors
        process_time = time.time() - start_time
        logger.error(f"Unexpected Error: {request.method} {request.url.path} - {str(e)} - {process_time:.3f}s")
        
        return JSONResponse(
            status_code=500,
            content={
                "error": True,
                "message": "Error interno del servidor",
                "details": {"error": str(e)},
                "timestamp": time.time(),
                "path": request.url.path,
                "method": request.method
            }
        )

# Incluir routers
app.include_router(launches.router, prefix="/api/launches", tags=["launches"])
app.include_router(rockets.router, prefix="/api/rockets", tags=["rockets"])
app.include_router(starlink.router, prefix="/api/starlink", tags=["starlink"])
app.include_router(upcoming.router, prefix="/api/launches/upcoming", tags=["upcoming"])

# Endpoint de salud
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "service": "SpaceX BFF"
    }
