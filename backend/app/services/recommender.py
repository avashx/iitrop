"""
Recommendation engine for nearby places.
Uses simple content-based filtering with tag similarity.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import NearbyPlace, PlaceReview


def _jaccard_similarity(set_a: set, set_b: set) -> float:
    if not set_a or not set_b:
        return 0.0
    intersection = set_a & set_b
    union = set_a | set_b
    return len(intersection) / len(union)


async def recommend_places(
    db: AsyncSession,
    user_preferences: Optional[List[str]] = None,
    category: Optional[str] = None,
    limit: int = 5
) -> List[dict]:
    """
    Recommend nearby places based on:
    1. User preference tags (vibe matching)
    2. Average rating
    3. Category filter
    """
    query = select(NearbyPlace)
    if category:
        query = query.where(NearbyPlace.category == category)

    result = await db.execute(query)
    places = result.scalars().all()

    if not places:
        return []

    scored = []
    pref_set = set(t.lower().strip() for t in (user_preferences or []))

    for place in places:
        tags = set(t.strip().lower() for t in (place.vibe_tags or "").split(",") if t.strip())

        # tag similarity score
        tag_score = _jaccard_similarity(pref_set, tags) if pref_set else 0

        # fetch average rating
        reviews_q = await db.execute(
            select(PlaceReview.rating).where(PlaceReview.place_id == place.id)
        )
        ratings = [r[0] for r in reviews_q.fetchall()]
        avg_rating = sum(ratings) / len(ratings) if ratings else 3.0
        review_count = len(ratings)

        # weighted final score
        final_score = (tag_score * 0.4) + (avg_rating / 5.0 * 0.4) + (min(review_count, 20) / 20 * 0.2)

        scored.append({
            "place_id": place.id,
            "name": place.name,
            "category": place.category,
            "description": place.description,
            "address": place.address,
            "vibe_tags": place.vibe_tags,
            "avg_rating": round(avg_rating, 1),
            "review_count": review_count,
            "student_discount": place.student_discount,
            "score": round(final_score, 3),
            "image_url": place.image_url,
            "opening_hours": place.opening_hours,
        })

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:limit]
