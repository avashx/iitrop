#!/bin/bash
cd /Users/Vashishth/Downloads/iitrop/backend
exec /Users/Vashishth/Downloads/iitrop/.venv/bin/python -m uvicorn app.main:app --port 8000 --reload
