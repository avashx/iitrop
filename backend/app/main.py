import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import init_db
from app.routers import auth, mess, mail, marketplace, lost_found, cab, academic, explorer, chat


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Run startup / shutdown logic."""
    await init_db()
    yield  # app is running
    # shutdown logic (if any) goes here


app = FastAPI(
    title="Project Nexus – IIT Ropar Campus Super-App",
    description="Backend API for the campus super-app covering daily pulse, student exchange, explorer guide and academic cockpit.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS – allow the React dev server and any deployed frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# static uploads folder
upload_dir = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# ---- register routers ----
app.include_router(auth.router)
app.include_router(mess.router)
app.include_router(mail.router)
app.include_router(marketplace.router)
app.include_router(lost_found.router)
app.include_router(cab.router)
app.include_router(academic.router)
app.include_router(explorer.router)
app.include_router(chat.router)


@app.get("/", tags=["root"])
async def root():
    return {
        "message": "Project Nexus API is running.",
        "docs": "/docs",
    }
