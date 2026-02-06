from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
import json
from app.database import get_db
from app.models.models import MailItem, MailCategory, User
from app.utils.auth import get_current_user
from app.services.mail_ai import process_mail

router = APIRouter(prefix="/api/mail", tags=["Mail Summarizer"])


class MailCreate(BaseModel):
    subject: str
    sender: str
    body: str


class MailResponse(BaseModel):
    id: int
    subject: str
    sender: str
    body: str
    summary: str
    category: str
    priority_score: float
    action_items: List[str]
    deadline: str
    is_read: bool
    received_at: str

    class Config:
        from_attributes = True


class MailBulkCreate(BaseModel):
    emails: List[MailCreate]


@router.post("/summarize", response_model=MailResponse, status_code=201)
async def summarize_mail(
    data: MailCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # run AI summarizer
    ai_result = process_mail(data.subject, data.body)

    mail = MailItem(
        user_id=current_user.id,
        subject=data.subject,
        sender=data.sender,
        body=data.body,
        summary=ai_result["summary"],
        category=MailCategory(ai_result["category"]),
        priority_score=ai_result["priority_score"],
        action_items=ai_result["action_items"],
        deadline=ai_result["deadline"],
    )
    db.add(mail)
    await db.commit()
    await db.refresh(mail)

    actions = json.loads(mail.action_items) if mail.action_items else []
    return MailResponse(
        id=mail.id,
        subject=mail.subject,
        sender=mail.sender,
        body=mail.body,
        summary=mail.summary,
        category=mail.category.value,
        priority_score=mail.priority_score,
        action_items=actions,
        deadline=mail.deadline,
        is_read=mail.is_read,
        received_at=mail.received_at.isoformat() if mail.received_at else "",
    )


@router.post("/bulk", response_model=List[MailResponse], status_code=201)
async def bulk_summarize(
    data: MailBulkCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    results = []
    for email_data in data.emails:
        ai_result = process_mail(email_data.subject, email_data.body)
        mail = MailItem(
            user_id=current_user.id,
            subject=email_data.subject,
            sender=email_data.sender,
            body=email_data.body,
            summary=ai_result["summary"],
            category=MailCategory(ai_result["category"]),
            priority_score=ai_result["priority_score"],
            action_items=ai_result["action_items"],
            deadline=ai_result["deadline"],
        )
        db.add(mail)
        await db.commit()
        await db.refresh(mail)

        actions = json.loads(mail.action_items) if mail.action_items else []
        results.append(MailResponse(
            id=mail.id,
            subject=mail.subject,
            sender=mail.sender,
            body=mail.body,
            summary=mail.summary,
            category=mail.category.value,
            priority_score=mail.priority_score,
            action_items=actions,
            deadline=mail.deadline,
            is_read=mail.is_read,
            received_at=mail.received_at.isoformat() if mail.received_at else "",
        ))
    return results


@router.get("/inbox", response_model=List[MailResponse])
async def get_inbox(
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(MailItem).where(MailItem.user_id == current_user.id)
    if category:
        query = query.where(MailItem.category == MailCategory(category))
    query = query.order_by(MailItem.priority_score.desc(), MailItem.received_at.desc())

    result = await db.execute(query)
    mails = result.scalars().all()

    return [
        MailResponse(
            id=m.id, subject=m.subject, sender=m.sender, body=m.body,
            summary=m.summary, category=m.category.value,
            priority_score=m.priority_score,
            action_items=json.loads(m.action_items) if m.action_items else [],
            deadline=m.deadline, is_read=m.is_read,
            received_at=m.received_at.isoformat() if m.received_at else "",
        )
        for m in mails
    ]


@router.patch("/{mail_id}/read")
async def mark_read(
    mail_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MailItem).where(MailItem.id == mail_id, MailItem.user_id == current_user.id)
    )
    mail = result.scalar_one_or_none()
    if not mail:
        raise HTTPException(status_code=404, detail="Mail not found")
    mail.is_read = True
    await db.commit()
    return {"status": "marked as read"}


@router.delete("/{mail_id}")
async def delete_mail(
    mail_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MailItem).where(MailItem.id == mail_id, MailItem.user_id == current_user.id)
    )
    mail = result.scalar_one_or_none()
    if not mail:
        raise HTTPException(status_code=404, detail="Mail not found")
    await db.delete(mail)
    await db.commit()
    return {"status": "deleted"}
