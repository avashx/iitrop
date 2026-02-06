from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
import os, uuid
from app.database import get_db
from app.models.models import MarketplaceItem, ItemStatus, User
from app.utils.auth import get_current_user
from app.config import get_settings

router = APIRouter(prefix="/api/marketplace", tags=["Marketplace"])
settings = get_settings()


class ItemCreate(BaseModel):
    title: str
    description: str
    price: float
    category: str
    condition: str = "good"
    image_url: str = ""


class ItemResponse(BaseModel):
    id: int
    title: str
    description: str
    price: float
    category: str
    condition: str
    image_url: str
    status: str
    views: int
    seller_name: str = ""
    seller_username: str = ""
    created_at: str

    class Config:
        from_attributes = True


class ItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    status: Optional[str] = None


@router.get("/items", response_model=List[ItemResponse])
async def list_items(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(MarketplaceItem).where(MarketplaceItem.status == ItemStatus.active)
    if category:
        query = query.where(MarketplaceItem.category == category)
    if min_price is not None:
        query = query.where(MarketplaceItem.price >= min_price)
    if max_price is not None:
        query = query.where(MarketplaceItem.price <= max_price)
    if search:
        query = query.where(
            MarketplaceItem.title.ilike(f"%{search}%") |
            MarketplaceItem.description.ilike(f"%{search}%")
        )
    query = query.order_by(MarketplaceItem.created_at.desc())

    result = await db.execute(query)
    items = result.scalars().all()

    response = []
    for item in items:
        seller_q = await db.execute(select(User).where(User.id == item.seller_id))
        seller = seller_q.scalar_one_or_none()
        response.append(ItemResponse(
            id=item.id, title=item.title, description=item.description,
            price=item.price, category=item.category, condition=item.condition,
            image_url=item.image_url, status=item.status.value, views=item.views,
            seller_name=seller.full_name if seller else "",
            seller_username=seller.username if seller else "",
            created_at=item.created_at.isoformat() if item.created_at else "",
        ))
    return response


@router.get("/items/{item_id}", response_model=ItemResponse)
async def get_item(item_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MarketplaceItem).where(MarketplaceItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # increment views
    item.views += 1
    await db.commit()

    seller_q = await db.execute(select(User).where(User.id == item.seller_id))
    seller = seller_q.scalar_one_or_none()

    return ItemResponse(
        id=item.id, title=item.title, description=item.description,
        price=item.price, category=item.category, condition=item.condition,
        image_url=item.image_url, status=item.status.value, views=item.views,
        seller_name=seller.full_name if seller else "",
        seller_username=seller.username if seller else "",
        created_at=item.created_at.isoformat() if item.created_at else "",
    )


@router.post("/items", response_model=ItemResponse, status_code=201)
async def create_item(
    data: ItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    item = MarketplaceItem(
        seller_id=current_user.id,
        title=data.title,
        description=data.description,
        price=data.price,
        category=data.category,
        condition=data.condition,
        image_url=data.image_url,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)

    return ItemResponse(
        id=item.id, title=item.title, description=item.description,
        price=item.price, category=item.category, condition=item.condition,
        image_url=item.image_url, status=item.status.value, views=item.views,
        seller_name=current_user.full_name,
        seller_username=current_user.username,
        created_at=item.created_at.isoformat() if item.created_at else "",
    )


@router.put("/items/{item_id}", response_model=ItemResponse)
async def update_item(
    item_id: int,
    data: ItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MarketplaceItem).where(
            MarketplaceItem.id == item_id,
            MarketplaceItem.seller_id == current_user.id,
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found or not owned by you")

    if data.title:
        item.title = data.title
    if data.description:
        item.description = data.description
    if data.price is not None:
        item.price = data.price
    if data.status:
        item.status = ItemStatus(data.status)

    await db.commit()
    await db.refresh(item)

    return ItemResponse(
        id=item.id, title=item.title, description=item.description,
        price=item.price, category=item.category, condition=item.condition,
        image_url=item.image_url, status=item.status.value, views=item.views,
        seller_name=current_user.full_name,
        seller_username=current_user.username,
        created_at=item.created_at.isoformat() if item.created_at else "",
    )


@router.delete("/items/{item_id}")
async def delete_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MarketplaceItem).where(
            MarketplaceItem.id == item_id,
            MarketplaceItem.seller_id == current_user.id,
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    await db.delete(item)
    await db.commit()
    return {"status": "deleted"}


@router.get("/my-listings", response_model=List[ItemResponse])
async def my_listings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MarketplaceItem).where(MarketplaceItem.seller_id == current_user.id)
        .order_by(MarketplaceItem.created_at.desc())
    )
    items = result.scalars().all()
    return [
        ItemResponse(
            id=i.id, title=i.title, description=i.description,
            price=i.price, category=i.category, condition=i.condition,
            image_url=i.image_url, status=i.status.value, views=i.views,
            seller_name=current_user.full_name,
            seller_username=current_user.username,
            created_at=i.created_at.isoformat() if i.created_at else "",
        )
        for i in items
    ]
