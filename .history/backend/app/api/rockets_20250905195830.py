from fastapi import APIRouter, Query
from app.services.spacex import rockets as get_rockets

router = APIRouter()

@router.get("")
async def list_rockets():
  data = await get_rockets()
  return data