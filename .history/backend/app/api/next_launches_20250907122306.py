from fastapi import APIRouter
from app.services.spacex import next_launches as get_next_launches

router = APIRouter()

@router.get("")
async def list_next_launches():
  data = await get_next_launches()
  return data