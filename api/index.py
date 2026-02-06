"""
Vercel serverless entry-point.
Wraps the FastAPI app so Vercel's Python runtime can serve it.
"""

import os
import sys

# Let Python find the backend package
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Vercel's filesystem is read-only; use /tmp for the SQLite file
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:////tmp/nexus.db")
os.environ.setdefault("UPLOAD_DIR", "/tmp/uploads")

from app.main import app  # noqa: E402  (the FastAPI instance Vercel looks for)
