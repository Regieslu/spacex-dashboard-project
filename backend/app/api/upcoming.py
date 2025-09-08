from fastapi import APIRouter
from app.services.spacex import upcoming_launches as get_upcoming_launches

router = APIRouter()

@router.get("")
async def list_upcoming_launches():
  data = await get_upcoming_launches()
  return data