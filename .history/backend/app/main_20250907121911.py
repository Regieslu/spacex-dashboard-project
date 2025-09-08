from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import launches, rockets, starlink

app = FastAPI(title="SpaceX BFF")

app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:5173"], #vite
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

app.include_router(launches.router, prefix="/api/launches", tags=["launches"])
app.include_router(rockets.router, prefix="/api/rockets", tags=["rockets"])
app.include_router(starlink.router, prefix="/api/starlink", tags=["starlink"])
app.include_router(next_launches.router, prefix="/api/next_launches", tags=["next_launches"])
