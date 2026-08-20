from fastapi import (
    APIRouter, 
    HTTPException,
    Depends,
    status
)
from backend.database_engine.database import get_db
from sqlalchemy.orm import Session
from backend.sqlalchemy_models.models import LabTiming
from backend.scheemas.lab_scheema import LabScheduleCreate, LabScheduleResponse, LabTimingResponse

router = APIRouter(
    prefix="/lab/timings",
    tags=["lab Timings"],
)

def build_response_model(saved_timings: list[LabTiming]) -> LabScheduleResponse:
    return LabScheduleResponse(
        timings = [LabTimingResponse.model_validate(t) for t in saved_timings]
    )

# POST /lab/timings
# Saves the full 7-day lab operational schedule in one request.
# All 7 days always exist in the frontend by default.

@router.post("/", response_model=LabScheduleResponse, status_code=status.HTTP_201_CREATED)
def create_lab_timings(payload: LabScheduleCreate, db: Session = Depends(get_db)):
    saved_timings = []
    for slot in payload.timings:
        existing = db.query(LabTiming).filter(
            LabTiming.day_of_week == slot.day_of_week
        ).first()    
        if existing:
            # UPDATE the existing row
            existing.opening_time = slot.opening_time
            existing.closing_time = slot.closing_time
            existing.is_closed = slot.is_closed
            saved_timings.append(existing)
        else:
            # Insert a new row
            new_timing = LabTiming(
                day_of_week=slot.day_of_week,
                opening_time = slot.opening_time,
                closing_time = slot.closing_time,
                is_closed = slot.is_closed,
            )
            db.add(new_timing)
            saved_timings.append(new_timing)
    db.commit()
    # Refresh all rows so their IDs and DB-generated values are loaded
    for timing in saved_timings:
        db.refresh(timing)
    return build_response_model(saved_timings)        
        
# GET /lab/timings
# Returns the full saved 7-day lab schedule.
@router.get("/", response_model=LabScheduleResponse, status_code=status.HTTP_200_OK)
def get_lab_timings(db: Session = Depends(get_db)):
    timings = db.query(LabTiming).all()
    return build_response_model(timings)