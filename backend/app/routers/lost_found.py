from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db
from app.models.models import LostFoundItem, LostFoundType, User
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/lost-found", tags=["Lost & Found"])


class LFCreate(BaseModel):
    item_type: str  # "lost" or "found"
    title: str
    description: str
    location: str = ""
    image_url: str = ""
    contact_info: str = ""
    category: str = "other"


class LFResponse(BaseModel):
    id: int
    item_type: str
    title: str
    description: str
    location: str
    image_url: str
    contact_info: str
    category: str
    is_resolved: bool
    reporter_name: str = ""
    created_at: str

    class Config:
        from_attributes = True


@router.get("/items", response_model=List[LFResponse])
async def list_items(
    item_type: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(LostFoundItem).where(LostFoundItem.is_resolved == False)
    if item_type:
        query = query.where(LostFoundItem.item_type == LostFoundType(item_type))
    if category:
        query = query.where(LostFoundItem.category == category)
    if search:
        query = query.where(
            LostFoundItem.title.ilike(f"%{search}%") |
            LostFoundItem.description.ilike(f"%{search}%")
        )
    query = query.order_by(LostFoundItem.created_at.desc())

    result = await db.execute(query)
    items = result.scalars().all()

    response = []
    for item in items:
        user_q = await db.execute(select(User).where(User.id == item.reporter_id))
        user = user_q.scalar_one_or_none()
        response.append(LFResponse(
            id=item.id, item_type=item.item_type.value, title=item.title,
            description=item.description, location=item.location,
            image_url=item.image_url, contact_info=item.contact_info,
            category=item.category, is_resolved=item.is_resolved,
            reporter_name=user.full_name if user else "",
            created_at=item.created_at.isoformat() if item.created_at else "",
        ))
    return response


@router.post("/items", response_model=LFResponse, status_code=201)
async def create_item(
    data: LFCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    item = LostFoundItem(
        reporter_id=current_user.id,
        item_type=LostFoundType(data.item_type),
        title=data.title,
        description=data.description,
        location=data.location,
        image_url=data.image_url,
        contact_info=data.contact_info or current_user.phone,
        category=data.category,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)

    return LFResponse(
        id=item.id, item_type=item.item_type.value, title=item.title,
        description=item.description, location=item.location,
        image_url=item.image_url, contact_info=item.contact_info,
        category=item.category, is_resolved=item.is_resolved,
        reporter_name=current_user.full_name,
        created_at=item.created_at.isoformat() if item.created_at else "",
    )


@router.patch("/{item_id}/resolve")
async def resolve_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LostFoundItem).where(
            LostFoundItem.id == item_id,
            LostFoundItem.reporter_id == current_user.id,
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.is_resolved = True
    await db.commit()
    return {"status": "resolved"}


@router.delete("/{item_id}")
async def delete_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LostFoundItem).where(
            LostFoundItem.id == item_id,
            LostFoundItem.reporter_id == current_user.id,
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    await db.delete(item)
    await db.commit()
    return {"status": "deleted"}
