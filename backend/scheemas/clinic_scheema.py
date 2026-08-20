from datetime import time
from typing import Optional
from pydantic import BaseModel, ConfigDict
from backend.sqlalchemy_models.models import FAQCategory


# ──────────────────────────────────────────────────────────────
# clinic timings scheema
# ──────────────────────────────────────────────────────────────

# Nested inside → POST /clinic/timings  (request body)
class ClinicTimingInput(BaseModel):
    """
    One row in the 7-day clinic operational schedule.
    Maps to: clinic_timings table.
    - day_of_week  : e.g. "Monday", "Sunday"
    - opening_time : None when is_closed=True (dash shown in UI)
    - closing_time : None when is_closed=True
    - is_closed    : toggled off days, times become None
    """
    day_of_week: str
    opening_time: Optional[time] = None
    closing_time: Optional[time] = None
    is_closed: bool = False
    
# Nested inside → GET /clinic/timings  (response body)    
class ClinicTimingResponse(BaseModel):
    """
    What the API returns for a single day timing row.
    from_attributes=True lets Pydantic build this from a SQLAlchemy ClinicTiming ORM object.
    """
    model_config = ConfigDict(from_attributes=True)
    timing_id: int
    day_of_week: str
    opening_time: Optional[time] = None
    closing_time: Optional[time] = None
    is_closed: bool
    
# POST /clinic/timings
# Saves the full 7-day clinic schedule in one request.
class ClinicScheduleCreate(BaseModel):
    timings: list[ClinicTimingInput]
    

# GET /clinic/timings
# Returns the full saved 7-day clinic schedule.
class ClinicScheduleResponse(BaseModel):
    timings: list[ClinicTimingResponse]
    
# ──────────────────────────────────────────────────────────────
# Faq scheema
# ──────────────────────────────────────────────────────────────

# Nested inside → POST /clinic/faqs  (request body)
class FaqCreate(BaseModel):
    question: str
    answer: str
    category: FAQCategory
    
# Nested
# GET  /clinic/faqs              → returns list[FaqResponse]
# GET  /clinic/faqs/{faq_id}     → returns single FaqResponse
class FaqResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    faq_id: int  
    question: str
    answer: str
    category: FAQCategory
        
# POST /clinic/faqs
# Frontend sends all FAQs at once via "Save All FAQs" button.
class FaqAllCreate(BaseModel):
    faqs: list[FaqCreate]
    
# GET /clinic/faqs
class FaqAllResponse(BaseModel):
    faqs: list[FaqResponse]
    
# DELETE /clinic/faqs/{faq_id}
# No schema needed — faq_id is taken from the URL path parameter directly.
