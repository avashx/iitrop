from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.models import CabTrip, TripStatus, User, trip_passengers
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/cab", tags=["Cab Sharing"])


class TripCreate(BaseModel):
    origin: str
    destination: str
    departure_time: str  # ISO format
    seats_total: int = 4
    price_per_person: float = 0.0
    notes: str = ""
    contact_number: str = ""


class TripResponse(BaseModel):
    id: int
    origin: str
    destination: str
    departure_time: str
    seats_total: int
    seats_available: int
    price_per_person: float
    notes: str
    status: str
    contact_number: str
    creator_name: str = ""
    passenger_count: int = 0
    created_at: str

    class Config:
        from_attributes = True


@router.get("/trips", response_model=List[TripResponse])
async def list_trips(
    destination: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(CabTrip).where(CabTrip.status == TripStatus.open)
    if destination:
        query = query.where(CabTrip.destination.ilike(f"%{destination}%"))
    query = query.order_by(CabTrip.departure_time)

    result = await db.execute(query)
    trips = result.scalars().all()

    response = []
    for trip in trips:
        creator_q = await db.execute(select(User).where(User.id == trip.creator_id))
        creator = creator_q.scalar_one_or_none()
        response.append(TripResponse(
            id=trip.id, origin=trip.origin, destination=trip.destination,
            departure_time=trip.departure_time.isoformat() if trip.departure_time else "",
            seats_total=trip.seats_total, seats_available=trip.seats_available,
            price_per_person=trip.price_per_person, notes=trip.notes,
            status=trip.status.value, contact_number=trip.contact_number,
            creator_name=creator.full_name if creator else "",
            passenger_count=trip.seats_total - trip.seats_available,
            created_at=trip.created_at.isoformat() if trip.created_at else "",
        ))
    return response


@router.post("/trips", response_model=TripResponse, status_code=201)
async def create_trip(
    data: TripCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    trip = CabTrip(
        creator_id=current_user.id,
        origin=data.origin,
        destination=data.destination,
        departure_time=datetime.fromisoformat(data.departure_time),
        seats_total=data.seats_total,
        seats_available=data.seats_total - 1,  # creator takes one seat
        price_per_person=data.price_per_person,
        notes=data.notes,
        contact_number=data.contact_number or current_user.phone,
    )
    db.add(trip)
    await db.commit()
    await db.refresh(trip)

    return TripResponse(
        id=trip.id, origin=trip.origin, destination=trip.destination,
        departure_time=trip.departure_time.isoformat(),
        seats_total=trip.seats_total, seats_available=trip.seats_available,
        price_per_person=trip.price_per_person, notes=trip.notes,
        status=trip.status.value, contact_number=trip.contact_number,
        creator_name=current_user.full_name,
        passenger_count=1,
        created_at=trip.created_at.isoformat() if trip.created_at else "",
    )


@router.post("/trips/{trip_id}/join")
async def join_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(CabTrip).where(CabTrip.id == trip_id))
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.seats_available <= 0:
        raise HTTPException(status_code=400, detail="No seats available")
    if trip.creator_id == current_user.id:
        raise HTTPException(status_code=400, detail="You created this trip")

    # check if already joined
    check = await db.execute(
        select(trip_passengers).where(
            trip_passengers.c.trip_id == trip_id,
            trip_passengers.c.user_id == current_user.id,
        )
    )
    if check.first():
        raise HTTPException(status_code=400, detail="Already joined this trip")

    await db.execute(
        trip_passengers.insert().values(trip_id=trip_id, user_id=current_user.id)
    )
    trip.seats_available -= 1
    if trip.seats_available == 0:
        trip.status = TripStatus.full
    await db.commit()
    return {"status": "joined", "seats_remaining": trip.seats_available}


@router.post("/trips/{trip_id}/leave")
async def leave_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(CabTrip).where(CabTrip.id == trip_id))
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    check = await db.execute(
        select(trip_passengers).where(
            trip_passengers.c.trip_id == trip_id,
            trip_passengers.c.user_id == current_user.id,
        )
    )
    if not check.first():
        raise HTTPException(status_code=400, detail="You are not in this trip")

    await db.execute(
        trip_passengers.delete().where(
            trip_passengers.c.trip_id == trip_id,
            trip_passengers.c.user_id == current_user.id,
        )
    )
    trip.seats_available += 1
    trip.status = TripStatus.open
    await db.commit()
    return {"status": "left", "seats_remaining": trip.seats_available}


@router.delete("/trips/{trip_id}")
async def cancel_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CabTrip).where(CabTrip.id == trip_id, CabTrip.creator_id == current_user.id)
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    trip.status = TripStatus.cancelled
    await db.commit()
    return {"status": "cancelled"}
