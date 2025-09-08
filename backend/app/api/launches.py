from fastapi import APIRouter, Query
from app.services.spacex import launches as get_launches

router = APIRouter()

@router.get("")
async def list_launches(success: bool | None = Query(None), rocket: str | None = None):
  data = await get_launches()
  if success is not None:
    data = [launch for launch in data if launch["success"] == success]
  if rocket is not None:
    data = [launch for launch in data if launch["rocket"] == rocket]
  return data
