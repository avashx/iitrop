from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db
from app.models.models import NearbyPlace, PlaceReview, User
from app.utils.auth import get_current_user
from app.services.recommender import recommend_places

router = APIRouter(prefix="/api/explorer", tags=["Explorer's Guide"])


class PlaceCreate(BaseModel):
    name: str
    category: str
    description: str = ""
    address: str = ""
    latitude: float = 0.0
    longitude: float = 0.0
    phone: str = ""
    image_url: str = ""
    vibe_tags: str = ""
    avg_cost: float = 0.0
    opening_hours: str = ""
    student_discount: bool = False


class PlaceResponse(BaseModel):
    id: int
    name: str
    category: str
    description: str
    address: str
    latitude: float
    longitude: float
    phone: str
    image_url: str
    vibe_tags: str
    avg_cost: float
    opening_hours: str
    student_discount: bool
    avg_rating: Optional[float] = None
    review_count: int = 0

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    place_id: int
    rating: int  # 1-5
    comment: str = ""


class ReviewResponse(BaseModel):
    id: int
    place_id: int
    rating: int
    comment: str
    username: str = ""
    created_at: str

    class Config:
        from_attributes = True


@router.get("/places", response_model=List[PlaceResponse])
async def list_places(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(NearbyPlace)
    if category:
        query = query.where(NearbyPlace.category == category)
    if search:
        query = query.where(
            NearbyPlace.name.ilike(f"%{search}%") |
            NearbyPlace.description.ilike(f"%{search}%") |
            NearbyPlace.vibe_tags.ilike(f"%{search}%")
        )
    query = query.order_by(NearbyPlace.name)

    result = await db.execute(query)
    places = result.scalars().all()

    response = []
    for p in places:
        reviews_q = await db.execute(
            select(PlaceReview.rating).where(PlaceReview.place_id == p.id)
        )
        ratings = [r[0] for r in reviews_q.fetchall()]
        avg_r = round(sum(ratings) / len(ratings), 1) if ratings else None

        response.append(PlaceResponse(
            id=p.id, name=p.name, category=p.category,
            description=p.description, address=p.address,
            latitude=p.latitude, longitude=p.longitude,
            phone=p.phone, image_url=p.image_url,
            vibe_tags=p.vibe_tags, avg_cost=p.avg_cost,
            opening_hours=p.opening_hours, student_discount=p.student_discount,
            avg_rating=avg_r, review_count=len(ratings),
        ))
    return response


@router.get("/places/{place_id}", response_model=PlaceResponse)
async def get_place(place_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(NearbyPlace).where(NearbyPlace.id == place_id))
    place = result.scalar_one_or_none()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")

    reviews_q = await db.execute(
        select(PlaceReview.rating).where(PlaceReview.place_id == place.id)
    )
    ratings = [r[0] for r in reviews_q.fetchall()]
    avg_r = round(sum(ratings) / len(ratings), 1) if ratings else None

    return PlaceResponse(
        id=place.id, name=place.name, category=place.category,
        description=place.description, address=place.address,
        latitude=place.latitude, longitude=place.longitude,
        phone=place.phone, image_url=place.image_url,
        vibe_tags=place.vibe_tags, avg_cost=place.avg_cost,
        opening_hours=place.opening_hours, student_discount=place.student_discount,
        avg_rating=avg_r, review_count=len(ratings),
    )


@router.post("/places", response_model=PlaceResponse, status_code=201)
async def create_place(
    data: PlaceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    place = NearbyPlace(**data.model_dump())
    db.add(place)
    await db.commit()
    await db.refresh(place)
    return PlaceResponse(
        id=place.id, name=place.name, category=place.category,
        description=place.description, address=place.address,
        latitude=place.latitude, longitude=place.longitude,
        phone=place.phone, image_url=place.image_url,
        vibe_tags=place.vibe_tags, avg_cost=place.avg_cost,
        opening_hours=place.opening_hours, student_discount=place.student_discount,
    )


@router.post("/reviews", response_model=ReviewResponse, status_code=201)
async def add_review(
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be 1-5")

    review = PlaceReview(
        place_id=data.place_id,
        user_id=current_user.id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return ReviewResponse(
        id=review.id, place_id=review.place_id,
        rating=review.rating, comment=review.comment,
        username=current_user.username,
        created_at=review.created_at.isoformat() if review.created_at else "",
    )


@router.get("/reviews/{place_id}", response_model=List[ReviewResponse])
async def get_reviews(place_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PlaceReview).where(PlaceReview.place_id == place_id)
        .order_by(PlaceReview.created_at.desc())
    )
    reviews = result.scalars().all()
    response = []
    for r in reviews:
        user_q = await db.execute(select(User.username).where(User.id == r.user_id))
        uname = user_q.scalar_one_or_none() or "anon"
        response.append(ReviewResponse(
            id=r.id, place_id=r.place_id, rating=r.rating,
            comment=r.comment, username=uname,
            created_at=r.created_at.isoformat() if r.created_at else "",
        ))
    return response


@router.get("/recommend")
async def get_recommendations(
    vibes: Optional[str] = None,  # comma-separated
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    prefs = [v.strip() for v in vibes.split(",")] if vibes else None
    results = await recommend_places(db, user_preferences=prefs, category=category)
    return results
