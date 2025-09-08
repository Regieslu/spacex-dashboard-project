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
    """Excepción personalizada para errores de la API de SpaceX"""
    def __init__(self, message: str, status_code: int = None, details: dict = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)

async def fetch(path: str):
    """Función mejorada para hacer requests a la API de SpaceX con manejo robusto de errores"""
    key = f"spacex:{path}"
    
    # Verificar cache primero
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
                    message=f"Recurso no encontrado: {path}",
                    status_code=404,
                    details={"path": path, "api_response": resp.text}
                )
            elif resp.status_code == 429:
                logger.warning(f"Rate limit exceeded for {path}")
                raise SpaceXAPIError(
                    message="Demasiadas solicitudes a la API de SpaceX. Intenta más tarde.",
                    status_code=429,
                    details={"path": path, "retry_after": resp.headers.get("Retry-After")}
                )
            elif resp.status_code >= 500:
                logger.error(f"SpaceX API server error for {path}: {resp.status_code}")
                raise SpaceXAPIError(
                    message="Error interno del servidor de SpaceX",
                    status_code=resp.status_code,
                    details={"path": path, "api_response": resp.text}
                )
            else:
                logger.error(f"Unexpected status code for {path}: {resp.status_code}")
                raise SpaceXAPIError(
                    message=f"Error inesperado de la API de SpaceX: {resp.status_code}",
                    status_code=resp.status_code,
                    details={"path": path, "api_response": resp.text}
                )
                
    except httpx.TimeoutException:
        logger.error(f"Timeout error for {path}")
        raise SpaceXAPIError(
            message="Timeout al conectar con la API de SpaceX",
            status_code=408,
            details={"path": path, "timeout": "30s"}
        )
    except httpx.ConnectError:
        logger.error(f"Connection error for {path}")
        raise SpaceXAPIError(
            message="Error de conexión con la API de SpaceX",
            status_code=503,
            details={"path": path}
        )
    except httpx.RequestError as e:
        logger.error(f"Request error for {path}: {str(e)}")
        raise SpaceXAPIError(
            message="Error de solicitud a la API de SpaceX",
            status_code=500,
            details={"path": path, "error": str(e)}
        )
    except Exception as e:
        logger.error(f"Unexpected error for {path}: {str(e)}")
        raise SpaceXAPIError(
            message="Error inesperado al obtener datos de SpaceX",
            status_code=500,
            details={"path": path, "error": str(e)}
        )

async def launches():
    """Obtener todos los lanzamientos con manejo de errores"""
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
    """Obtener todos los cohetes con manejo de errores"""
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
    """Obtener datos de Starlink con manejo de errores"""
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
    """Obtener próximos lanzamientos con manejo de errores"""
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