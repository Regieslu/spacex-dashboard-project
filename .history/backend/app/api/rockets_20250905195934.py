from fastapi import APIRouter
from app.services.spacex import rockets as get_rockets

router = APIRouter()

@router.get("/rockets")
async def list_rockets():
  data = await get_rockets()
  return data