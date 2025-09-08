import time, httpx
from cachetools import TTLCache

BASE = "https://api.spacexdata.com/v4"
cache = TTLCache(maxsize=8, ttl=600)

async def fetch(path: str):
  key = f"spacex:{path}"
  if key in cache:
    return cache[key]
  async with httpx.AsyncClient(timeout=15) as client:
    resp = await client.get(f"{BASE}/{path}")
    resp.raise_for_status()
    data = resp.json()
    cache[key] = data
    return data
  
async def launches():
  return await fetch("launches")

async def rockets():
  return await fetch("rockets")

async def starlink():
  return await fetch("starlink")

async def next_launches():
  return await fetch("launches/upcoming")