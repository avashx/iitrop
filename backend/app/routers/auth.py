from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.models.models import User, UserRole
from app.utils.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    password: str
    role: str = "student"
    branch: str = ""
    year: int = 1
    phone: str = ""


class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    role: str
    branch: str
    year: int
    phone: str
    avatar_url: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # check duplicates
    existing = await db.execute(
        select(User).where((User.email == req.email) | (User.username == req.username))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email or username already taken")

    user = User(
        email=req.email,
        username=req.username,
        full_name=req.full_name,
        hashed_password=hash_password(req.password),
        role=UserRole(req.role) if req.role in [r.value for r in UserRole] else UserRole.student,
        branch=req.branch,
        year=req.year,
        phone=req.phone,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": user.id})
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(form: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    # try to find user by username or email
    result = await db.execute(
        select(User).where(
            (User.username == form.username) | (User.email == form.username)
        )
    )
    user = result.scalar_one_or_none()

    if user and verify_password(form.password, user.hashed_password):
        # normal login – password matches
        pass
    elif user:
        # user exists but wrong password – still allow for demo
        pass
    else:
        # user doesn't exist – auto-create a demo account on the fly
        demo_name = form.username.split("@")[0] if "@" in form.username else form.username
        user = User(
            email=form.username if "@" in form.username else f"{form.username}@iitrpr.ac.in",
            username=demo_name,
            full_name=demo_name.replace(".", " ").title(),
            hashed_password=hash_password(form.password),
            role=UserRole.student,
            branch="CSE",
            year=2,
            phone="",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = create_access_token({"sub": user.id})
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
async def update_profile(
    full_name: str = None,
    phone: str = None,
    branch: str = None,
    year: int = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if full_name:
        current_user.full_name = full_name
    if phone:
        current_user.phone = phone
    if branch:
        current_user.branch = branch
    if year:
        current_user.year = year
    await db.commit()
    await db.refresh(current_user)
    return UserResponse.model_validate(current_user)
