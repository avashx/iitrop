import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float,
    DateTime, ForeignKey, Enum, Table
)
from sqlalchemy.orm import relationship
from app.database import Base
import enum


# ---------- enums ----------
class UserRole(str, enum.Enum):
    student = "student"
    faculty = "faculty"
    admin = "admin"


class ItemStatus(str, enum.Enum):
    active = "active"
    sold = "sold"
    reserved = "reserved"
    expired = "expired"


class LostFoundType(str, enum.Enum):
    lost = "lost"
    found = "found"


class TripStatus(str, enum.Enum):
    open = "open"
    full = "full"
    completed = "completed"
    cancelled = "cancelled"


class MealType(str, enum.Enum):
    breakfast = "breakfast"
    lunch = "lunch"
    snacks = "snacks"
    dinner = "dinner"


class MailCategory(str, enum.Enum):
    academic = "academic"
    event = "event"
    urgent = "urgent"
    administrative = "administrative"
    general = "general"


# ---------- association tables ----------
trip_passengers = Table(
    "trip_passengers", Base.metadata,
    Column("trip_id", Integer, ForeignKey("cab_trips.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
)


# ---------- user ----------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(200), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.student)
    branch = Column(String(100), default="")
    year = Column(Integer, default=1)
    phone = Column(String(20), default="")
    avatar_url = Column(String(500), default="")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # relationships
    marketplace_items = relationship("MarketplaceItem", back_populates="seller")
    lost_found_posts = relationship("LostFoundItem", back_populates="reporter")
    created_trips = relationship("CabTrip", back_populates="creator")
    joined_trips = relationship("CabTrip", secondary=trip_passengers, back_populates="passengers")
    timetable_entries = relationship("TimetableEntry", back_populates="user")
    mess_ratings = relationship("MessRating", back_populates="user")
    mail_items = relationship("MailItem", back_populates="user")
    assignments_created = relationship("Assignment", back_populates="instructor")
    submissions = relationship("Submission", back_populates="student")
    explorer_reviews = relationship("PlaceReview", back_populates="user")


# ---------- mess ----------
class MessMenu(Base):
    __tablename__ = "mess_menus"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    meal_type = Column(Enum(MealType), nullable=False)
    items = Column(Text, nullable=False)  # comma-separated list
    nutritional_info = Column(Text, default="")
    allergens = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    ratings = relationship("MessRating", back_populates="menu")


class MessRating(Base):
    __tablename__ = "mess_ratings"

    id = Column(Integer, primary_key=True, index=True)
    menu_id = Column(Integer, ForeignKey("mess_menus.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    menu = relationship("MessMenu", back_populates="ratings")
    user = relationship("User", back_populates="mess_ratings")


# ---------- mail ----------
class MailItem(Base):
    __tablename__ = "mail_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(500), nullable=False)
    sender = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    summary = Column(Text, default="")
    category = Column(Enum(MailCategory), default=MailCategory.general)
    priority_score = Column(Float, default=0.0)
    action_items = Column(Text, default="")  # JSON list of extracted tasks
    deadline = Column(String(50), default="")
    is_read = Column(Boolean, default=False)
    received_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="mail_items")


# ---------- marketplace ----------
class MarketplaceItem(Base):
    __tablename__ = "marketplace_items"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    category = Column(String(100), nullable=False)
    condition = Column(String(50), default="good")
    image_url = Column(String(500), default="")
    status = Column(Enum(ItemStatus), default=ItemStatus.active)
    views = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    seller = relationship("User", back_populates="marketplace_items")


# ---------- lost and found ----------
class LostFoundItem(Base):
    __tablename__ = "lost_found_items"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_type = Column(Enum(LostFoundType), nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(300), default="")
    image_url = Column(String(500), default="")
    contact_info = Column(String(200), default="")
    is_resolved = Column(Boolean, default=False)
    category = Column(String(100), default="other")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    reporter = relationship("User", back_populates="lost_found_posts")


# ---------- cab sharing ----------
class CabTrip(Base):
    __tablename__ = "cab_trips"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    origin = Column(String(200), nullable=False)
    destination = Column(String(200), nullable=False)
    departure_time = Column(DateTime, nullable=False)
    seats_total = Column(Integer, default=4)
    seats_available = Column(Integer, default=3)
    price_per_person = Column(Float, default=0.0)
    notes = Column(Text, default="")
    status = Column(Enum(TripStatus), default=TripStatus.open)
    contact_number = Column(String(20), default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    creator = relationship("User", back_populates="created_trips")
    passengers = relationship("User", secondary=trip_passengers, back_populates="joined_trips")


# ---------- timetable ----------
class TimetableEntry(Base):
    __tablename__ = "timetable_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_code = Column(String(20), nullable=False)
    course_name = Column(String(200), nullable=False)
    instructor = Column(String(200), default="")
    day_of_week = Column(Integer, nullable=False)  # 0=Monday ... 6=Sunday
    start_time = Column(String(5), nullable=False)  # HH:MM
    end_time = Column(String(5), nullable=False)
    room = Column(String(50), default="")
    is_cancelled = Column(Boolean, default=False)
    cancel_reason = Column(String(300), default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="timetable_entries")


# ---------- LMS ----------
class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    instructor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_code = Column(String(20), nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text, default="")
    due_date = Column(DateTime, nullable=False)
    max_marks = Column(Float, default=100.0)
    attachment_url = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    instructor = relationship("User", back_populates="assignments_created")
    submissions = relationship("Submission", back_populates="assignment")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_url = Column(String(500), default="")
    remarks = Column(Text, default="")
    marks = Column(Float, nullable=True)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)

    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User", back_populates="submissions")


# ---------- explorer / nearby ----------
class NearbyPlace(Base):
    __tablename__ = "nearby_places"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False)
    category = Column(String(100), nullable=False)  # restaurant, cafe, shop, etc
    description = Column(Text, default="")
    address = Column(String(500), default="")
    latitude = Column(Float, default=0.0)
    longitude = Column(Float, default=0.0)
    phone = Column(String(20), default="")
    image_url = Column(String(500), default="")
    vibe_tags = Column(String(500), default="")  # comma-sep: study-friendly, date-spot, etc
    avg_cost = Column(Float, default=0.0)
    opening_hours = Column(String(200), default="")
    student_discount = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    reviews = relationship("PlaceReview", back_populates="place")


class PlaceReview(Base):
    __tablename__ = "place_reviews"

    id = Column(Integer, primary_key=True, index=True)
    place_id = Column(Integer, ForeignKey("nearby_places.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    place = relationship("NearbyPlace", back_populates="reviews")
    user = relationship("User", back_populates="explorer_reviews")
