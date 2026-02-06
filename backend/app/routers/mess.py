from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.models import MessMenu, MessRating, MealType, User
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/mess", tags=["Mess Menu"])


class MenuCreate(BaseModel):
    date: str
    meal_type: str
    items: str
    nutritional_info: str = ""
    allergens: str = ""


class MenuResponse(BaseModel):
    id: int
    date: str
    meal_type: str
    items: str
    nutritional_info: str
    allergens: str
    avg_rating: Optional[float] = None
    rating_count: int = 0

    class Config:
        from_attributes = True


class RatingCreate(BaseModel):
    menu_id: int
    rating: int
    comment: str = ""


class RatingResponse(BaseModel):
    id: int
    menu_id: int
    rating: int
    comment: str
    username: str = ""

    class Config:
        from_attributes = True


@router.get("/today", response_model=List[MenuResponse])
async def get_today_menu(db: AsyncSession = Depends(get_db)):
    today = date.today().isoformat()
    result = await db.execute(select(MessMenu).where(MessMenu.date == today))
    menus = result.scalars().all()

    response = []
    for menu in menus:
        ratings_q = await db.execute(
            select(func.avg(MessRating.rating), func.count(MessRating.id))
            .where(MessRating.menu_id == menu.id)
        )
        row = ratings_q.first()
        avg_r = round(row[0], 1) if row[0] else None
        count_r = row[1] or 0

        response.append(MenuResponse(
            id=menu.id, date=menu.date, meal_type=menu.meal_type.value,
            items=menu.items, nutritional_info=menu.nutritional_info,
            allergens=menu.allergens, avg_rating=avg_r, rating_count=count_r,
        ))
    return response


@router.get("/week", response_model=List[MenuResponse])
async def get_week_menu(start_date: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(MessMenu).where(MessMenu.date >= start_date).order_by(MessMenu.date, MessMenu.meal_type)
    )
    menus = result.scalars().all()
    response = []
    for menu in menus:
        ratings_q = await db.execute(
            select(func.avg(MessRating.rating), func.count(MessRating.id))
            .where(MessRating.menu_id == menu.id)
        )
        row = ratings_q.first()
        response.append(MenuResponse(
            id=menu.id, date=menu.date, meal_type=menu.meal_type.value,
            items=menu.items, nutritional_info=menu.nutritional_info,
            allergens=menu.allergens,
            avg_rating=round(row[0], 1) if row[0] else None,
            rating_count=row[1] or 0,
        ))
    return response


@router.post("/menu", response_model=MenuResponse, status_code=201)
async def create_menu(
    data: MenuCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    menu = MessMenu(
        date=data.date,
        meal_type=MealType(data.meal_type),
        items=data.items,
        nutritional_info=data.nutritional_info,
        allergens=data.allergens,
    )
    db.add(menu)
    await db.commit()
    await db.refresh(menu)
    return MenuResponse(
        id=menu.id, date=menu.date, meal_type=menu.meal_type.value,
        items=menu.items, nutritional_info=menu.nutritional_info,
        allergens=menu.allergens,
    )


@router.post("/rate", response_model=RatingResponse, status_code=201)
async def rate_meal(
    data: RatingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be 1-5")

    rating = MessRating(
        menu_id=data.menu_id,
        user_id=current_user.id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(rating)
    await db.commit()
    await db.refresh(rating)
    return RatingResponse(
        id=rating.id, menu_id=rating.menu_id,
        rating=rating.rating, comment=rating.comment,
        username=current_user.username,
    )


@router.get("/ratings/{menu_id}", response_model=List[RatingResponse])
async def get_ratings(menu_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(MessRating).where(MessRating.menu_id == menu_id)
    )
    ratings = result.scalars().all()
    response = []
    for r in ratings:
        user_q = await db.execute(select(User.username).where(User.id == r.user_id))
        uname = user_q.scalar_one_or_none() or "anon"
        response.append(RatingResponse(
            id=r.id, menu_id=r.menu_id, rating=r.rating,
            comment=r.comment, username=uname,
        ))
    return response
