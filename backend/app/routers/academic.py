from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db
from app.models.models import TimetableEntry, Assignment, Submission, User
from app.utils.auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/api/academic", tags=["Academic Cockpit"])


# ---- Timetable ----
class TimetableCreate(BaseModel):
    course_code: str
    course_name: str
    instructor: str = ""
    day_of_week: int  # 0=Mon ... 6=Sun
    start_time: str  # "09:00"
    end_time: str
    room: str = ""


class TimetableResponse(BaseModel):
    id: int
    course_code: str
    course_name: str
    instructor: str
    day_of_week: int
    start_time: str
    end_time: str
    room: str
    is_cancelled: bool
    cancel_reason: str

    class Config:
        from_attributes = True


@router.get("/timetable", response_model=List[TimetableResponse])
async def get_timetable(
    day: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(TimetableEntry).where(TimetableEntry.user_id == current_user.id)
    if day is not None:
        query = query.where(TimetableEntry.day_of_week == day)
    query = query.order_by(TimetableEntry.day_of_week, TimetableEntry.start_time)

    result = await db.execute(query)
    entries = result.scalars().all()
    return [TimetableResponse.model_validate(e) for e in entries]


@router.post("/timetable", response_model=TimetableResponse, status_code=201)
async def add_timetable_entry(
    data: TimetableCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    entry = TimetableEntry(
        user_id=current_user.id,
        course_code=data.course_code,
        course_name=data.course_name,
        instructor=data.instructor,
        day_of_week=data.day_of_week,
        start_time=data.start_time,
        end_time=data.end_time,
        room=data.room,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return TimetableResponse.model_validate(entry)


@router.delete("/timetable/{entry_id}")
async def remove_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TimetableEntry).where(
            TimetableEntry.id == entry_id,
            TimetableEntry.user_id == current_user.id,
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    await db.delete(entry)
    await db.commit()
    return {"status": "deleted"}


@router.patch("/timetable/{entry_id}/cancel")
async def cancel_class(
    entry_id: int,
    reason: str = "Cancelled by instructor",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(TimetableEntry).where(TimetableEntry.id == entry_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    entry.is_cancelled = True
    entry.cancel_reason = reason
    await db.commit()
    return {"status": "cancelled", "reason": reason}


# ---- Assignments (LMS Lite) ----
class AssignmentCreate(BaseModel):
    course_code: str
    title: str
    description: str = ""
    due_date: str  # ISO
    max_marks: float = 100.0


class AssignmentResponse(BaseModel):
    id: int
    course_code: str
    title: str
    description: str
    due_date: str
    max_marks: float
    instructor_name: str = ""
    created_at: str

    class Config:
        from_attributes = True


class SubmissionCreate(BaseModel):
    assignment_id: int
    file_url: str = ""
    remarks: str = ""


class SubmissionResponse(BaseModel):
    id: int
    assignment_id: int
    student_name: str = ""
    file_url: str
    remarks: str
    marks: Optional[float] = None
    submitted_at: str

    class Config:
        from_attributes = True


@router.get("/assignments", response_model=List[AssignmentResponse])
async def list_assignments(
    course_code: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Assignment)
    if course_code:
        query = query.where(Assignment.course_code == course_code)
    query = query.order_by(Assignment.due_date)

    result = await db.execute(query)
    assignments = result.scalars().all()

    response = []
    for a in assignments:
        instr_q = await db.execute(select(User).where(User.id == a.instructor_id))
        instr = instr_q.scalar_one_or_none()
        response.append(AssignmentResponse(
            id=a.id, course_code=a.course_code, title=a.title,
            description=a.description,
            due_date=a.due_date.isoformat() if a.due_date else "",
            max_marks=a.max_marks,
            instructor_name=instr.full_name if instr else "",
            created_at=a.created_at.isoformat() if a.created_at else "",
        ))
    return response


@router.post("/assignments", response_model=AssignmentResponse, status_code=201)
async def create_assignment(
    data: AssignmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    assignment = Assignment(
        instructor_id=current_user.id,
        course_code=data.course_code,
        title=data.title,
        description=data.description,
        due_date=datetime.fromisoformat(data.due_date),
        max_marks=data.max_marks,
    )
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)
    return AssignmentResponse(
        id=assignment.id, course_code=assignment.course_code,
        title=assignment.title, description=assignment.description,
        due_date=assignment.due_date.isoformat(),
        max_marks=assignment.max_marks,
        instructor_name=current_user.full_name,
        created_at=assignment.created_at.isoformat() if assignment.created_at else "",
    )


@router.post("/submissions", response_model=SubmissionResponse, status_code=201)
async def submit_assignment(
    data: SubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    submission = Submission(
        assignment_id=data.assignment_id,
        student_id=current_user.id,
        file_url=data.file_url,
        remarks=data.remarks,
    )
    db.add(submission)
    await db.commit()
    await db.refresh(submission)
    return SubmissionResponse(
        id=submission.id, assignment_id=submission.assignment_id,
        student_name=current_user.full_name,
        file_url=submission.file_url, remarks=submission.remarks,
        marks=submission.marks,
        submitted_at=submission.submitted_at.isoformat() if submission.submitted_at else "",
    )


@router.get("/submissions/{assignment_id}", response_model=List[SubmissionResponse])
async def get_submissions(assignment_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Submission).where(Submission.assignment_id == assignment_id)
    )
    subs = result.scalars().all()
    response = []
    for s in subs:
        student_q = await db.execute(select(User).where(User.id == s.student_id))
        student = student_q.scalar_one_or_none()
        response.append(SubmissionResponse(
            id=s.id, assignment_id=s.assignment_id,
            student_name=student.full_name if student else "",
            file_url=s.file_url, remarks=s.remarks,
            marks=s.marks,
            submitted_at=s.submitted_at.isoformat() if s.submitted_at else "",
        ))
    return response


@router.patch("/submissions/{submission_id}/grade")
async def grade_submission(
    submission_id: int,
    marks: float,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Submission).where(Submission.id == submission_id))
    sub = result.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    sub.marks = marks
    await db.commit()
    return {"status": "graded", "marks": marks}
