import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = os.getenv(
        "DATABASE_URL", "sqlite+aiosqlite:///./nexus.db"
    )
    secret_key: str = "nexus_iitrpr_hackathon_2026"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    huggingface_api_key: str = ""
    upload_dir: str = os.getenv("UPLOAD_DIR", "static/uploads")

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
