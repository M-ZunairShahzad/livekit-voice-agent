from datetime import time
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict

# ──────────────────────────────────────────────────────────────
# LAB TEST SCHEMAS
# ──────────────────────────────────────────────────────────────

# POST /lab/tests
# Adds a single new lab test to the catalog.
class LabTestCreate(BaseModel):
    """
    Payload the frontend sends to CREATE a lab test.
    Maps to: lab_tests table.
    - test_name  : unique name of the test (e.g. CBC, Lipid Profile)
    - price      : cost in PKR — Decimal to avoid floating point errors
    - is_available: toggle — defaults True if not sent
    """
    test_name: str
    price: Decimal
    is_available: bool = True

# GET  /lab/tests              → returns list[LabTestResponse]
# GET  /lab/tests/{test_id}    → returns single LabTestResponse
class LabTestResponse(BaseModel):
    """
    What the API returns when reading a lab test (for the catalog card).
    from_attributes=True lets Pydantic build this from a SQLAlchemy LabTest ORM object.
    """
    model_config = ConfigDict(from_attributes=True)
    test_id: int
    test_name: str
    price: Decimal
    is_available: bool


# DELETE /lab/tests/{test_id}
# No schema needed — test_id is taken from the URL path parameter directly.

# ──────────────────────────────────────────────────────────────
# LAB TIMING SCHEMAS
# ──────────────────────────────────────────────────────────────

# Nested inside → POST /lab/timings  (request body)
class LabTimingInput(BaseModel):
    """
    One row in the 7-day lab operational schedule.
    Maps to: lab_timings table.
    - day_of_week  : e.g. "Monday", "Sunday"
    - opening_time : None when is_closed=True (dash shown in UI)
    - closing_time : None when is_closed=True
    - is_closed    : Sunday is Closed — times become None
    """
    day_of_week: str
    opening_time: Optional[time] = None
    closing_time: Optional[time] = None
    is_closed: bool = False

# Nested inside → GET /lab/timings  (response body)
class LabTimingResponse(BaseModel):
    """
    What the API returns for a single day timing row.
    from_attributes=True lets Pydantic build this from a SQLAlchemy LabTiming ORM object.
    """
    model_config = ConfigDict(from_attributes=True)
    timing_id: int
    day_of_week: str
    opening_time: Optional[time] = None
    closing_time: Optional[time] = None
    is_closed: bool

# POST /lab/timings
# Saves the full 7-day lab operational schedule in one request.
# All 7 days always exist in the frontend by default.
class LabScheduleCreate(BaseModel):
    timings: list[LabTimingInput]

# GET /lab/timings
# Returns the full saved 7-day lab operational schedule.
class LabScheduleResponse(BaseModel):
    timings: list[LabTimingResponse]