import time
import httpx
from cachetools import TTLCache
from fastapi import HTTPException
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE = "https://api.spacexdata.com/v4"
cache = TTLCache(maxsize=8, ttl=600)

class SpaceXAPIError(Exception):
    """Custom exception for SpaceX API errors"""
    def __init__(self, message: str, status_code: int = None, details: dict = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)

async def fetch(path: str):
    """Improved function to make requests to the SpaceX API with robust error handling"""
    key = f"spacex:{path}"
    
    # Check cache first
    if key in cache:
        logger.info(f"Cache hit for {path}")
        return cache[key]
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            logger.info(f"Fetching data from SpaceX API: {path}")
            resp = await client.get(f"{BASE}/{path}")
            
            # Verificar si la respuesta es exitosa
            if resp.status_code == 200:
                data = resp.json()
                cache[key] = data
                logger.info(f"Successfully cached data for {path}")
                return data
            elif resp.status_code == 404:
                logger.warning(f"Resource not found: {path}")
                raise SpaceXAPIError(
                    message=f"Resource not found: {path}",
                    status_code=404,
                    details={"path": path, "api_response": resp.text}
                )
            elif resp.status_code == 429:
                logger.warning(f"Rate limit exceeded for {path}")
                raise SpaceXAPIError(
                    message="Too many requests to the SpaceX API. Try again later.",
                    status_code=429,
                    details={"path": path, "retry_after": resp.headers.get("Retry-After")}
                )
            elif resp.status_code >= 500:
                logger.error(f"SpaceX API server error for {path}: {resp.status_code}")
                raise SpaceXAPIError(
                    message="Internal server error of SpaceX",
                    status_code=resp.status_code,
                    details={"path": path, "api_response": resp.text}
                )
            else:
                logger.error(f"Unexpected status code for {path}: {resp.status_code}")
                raise SpaceXAPIError(
                    message=f"Unexpected error of the SpaceX API: {resp.status_code}",
                    status_code=resp.status_code,
                    details={"path": path, "api_response": resp.text}
                )
                
    except httpx.TimeoutException:
        logger.error(f"Timeout error for {path}")
        raise SpaceXAPIError(
            message="Timeout of connection with the SpaceX API",
            status_code=408,
            details={"path": path, "timeout": "30s"}
        )
    except httpx.ConnectError:
        logger.error(f"Connection error for {path}")
        raise SpaceXAPIError(
            message="Error of connection with the SpaceX API",
            status_code=503,
            details={"path": path}
        )
    except httpx.RequestError as e:
        logger.error(f"Request error for {path}: {str(e)}")
        raise SpaceXAPIError(
            message="Error of request to the SpaceX API",
            status_code=500,
            details={"path": path, "error": str(e)}
        )
    except Exception as e:
        logger.error(f"Unexpected error for {path}: {str(e)}")
        raise SpaceXAPIError(
            message="Unexpected error getting data from SpaceX",
            status_code=500,
            details={"path": path, "error": str(e)}
        )

async def launches():
    """Get all launches with error handling"""
    try:
        return await fetch("launches")
    except SpaceXAPIError as e:
        logger.error(f"Error fetching launches: {e.message}")
        raise HTTPException(
            status_code=e.status_code or 500,
            detail={
                "message": e.message,
                "details": e.details,
                "timestamp": time.time()
            }
        )

async def rockets():
    """Get all rockets with error handling"""
    try:
        return await fetch("rockets")
    except SpaceXAPIError as e:
        logger.error(f"Error fetching rockets: {e.message}")
        raise HTTPException(
            status_code=e.status_code or 500,
            detail={
                "message": e.message,
                "details": e.details,
                "timestamp": time.time()
            }
        )

async def starlink():
    """Get Starlink data with error handling"""
    try:
        return await fetch("starlink")
    except SpaceXAPIError as e:
        logger.error(f"Error fetching starlink: {e.message}")
        raise HTTPException(
            status_code=e.status_code or 500,
            detail={
                "message": e.message,
                "details": e.details,
                "timestamp": time.time()
            }
        )

async def upcoming_launches():
    """Get upcoming launches with error handling"""
    try:
        return await fetch("launches/upcoming")
    except SpaceXAPIError as e:
        logger.error(f"Error fetching upcoming launches: {e.message}")
        raise HTTPException(
            status_code=e.status_code or 500,
            detail={
                "message": e.message,
                "details": e.details,
                "timestamp": time.time()
            }
        )