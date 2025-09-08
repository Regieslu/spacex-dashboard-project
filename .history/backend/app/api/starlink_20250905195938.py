from fastapi import APIRouter
from app.services.spacex import starlink as get_starlink

router = APIRouter()

@router.get("/starlink")
async def list_starlink():
  data = await get_starlink()
  return data