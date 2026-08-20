from fastapi import (
    APIRouter, 
    Depends,
    status
)
from backend.database_engine.database import get_db
from sqlalchemy.orm import Session
from backend.sqlalchemy_models.models import ClinicTiming
from backend.scheemas.clinic_scheema import ClinicScheduleCreate, ClinicScheduleResponse, ClinicTimingResponse

router = APIRouter(
    prefix="/clinic/timings",
    tags=["Clinic Timings"],
)


def build_response_model(saved_timings: list[ClinicTiming]) -> ClinicScheduleResponse:
    return ClinicScheduleResponse(
        timings = [ClinicTimingResponse.model_validate(t) for t in saved_timings]
    )
    
# POST /clinic/timings
@router.post("/", response_model=ClinicScheduleResponse, status_code=status.HTTP_201_CREATED)
def create_clinic_timings(payload: ClinicScheduleCreate, db: Session = Depends(get_db)):
    saved_timings = []
    for slot in payload.timings:
        # existing = <ClinicTiming(id=1, day_of_week="Monday", start_time=09:00, end_time=17:00)>
        existing = db.query(ClinicTiming).filter(
                    ClinicTiming.day_of_week == slot.day_of_week
                ).first()  
        if existing: 
            existing.opening_time = slot.opening_time
            existing.closing_time = slot.closing_time
            existing.is_closed = slot.is_closed
            saved_timings.append(existing)
        else:
            new_timing = ClinicTiming(
                day_of_week=slot.day_of_week,
                opening_time = slot.opening_time,
                closing_time = slot.closing_time,
                is_closed = slot.is_closed,
            )
            db.add(new_timing)
            saved_timings.append(new_timing)
    db.commit()
    for timing in saved_timings:
        db.refresh(timing)
    return build_response_model(saved_timings)      

# GET /clinic/timings
# Returns the full saved 7-day clinic schedule.
@router.get("/", response_model=ClinicScheduleResponse, status_code=status.HTTP_200_OK)
def get_clinic_timings(db: Session = Depends(get_db)):
    timings = db.query(ClinicTiming).all()
    return build_response_model(timings)