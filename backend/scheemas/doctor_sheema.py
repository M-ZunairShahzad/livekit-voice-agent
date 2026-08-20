from datetime import time
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from backend.sqlalchemy_models.models import DoctorStatus

# ──────────────────────────────────────────────────────────────
# AVAILABILITY SCHEMAS
# Used as nested objects inside DoctorCreate and DoctorResponse.
# Not used in any standalone endpoint.
# ──────────────────────────────────────────────────────────────

# Nested inside → POST /doctors       (request body)
class AvailabilityInput(BaseModel):
    """
    What the frontend sends for a single schedule slot.
    Example: { day_of_week: "Monday", start_time: "09:00", end_time: "17:00" }
    """
    day_of_week: str
    start_time: time
    end_time: time

# Nested inside → GET  /doctors       (response body)
#                 GET  /doctors/{doctor_id}  (response body)
class AvailabilityOutput(BaseModel):
    """
    What the API returns for a single schedule slot.
    Includes availability_id so the frontend can reference it (e.g. for delete).
    """
    model_config = ConfigDict(from_attributes=True)
    availability_id: int
    day_of_week: str
    start_time: time
    end_time: time

# ──────────────────────────────────────────────────────────────
# DOCTOR SCHEMAS
# ──────────────────────────────────────────────────────────────

# POST /doctors
# Creates a new doctor with qualifications, status, optional specializations, and availability slots.
class DoctorCreate(BaseModel):
    """
    Payload the frontend sends to CREATE a doctor.
    Specializations are plain strings — the route handles
    DB lookup/creation of Specialization rows internally.
    """
    full_name: str
    qualification: list[str]
    status: DoctorStatus
    specializations: Optional[list[str]] = Field(default_factory=list)
    availabilities: list[AvailabilityInput]

# GET  /doctors              → returns list[DoctorResponse]
# GET  /doctors/{doctor_id}  → returns single DoctorResponse
class DoctorResponse(BaseModel):
    """
    What the API returns when reading a doctor.
    from_attributes=True lets Pydantic build this directly
    from a SQLAlchemy ORM Doctor object.
    Specializations are flattened to plain strings for the frontend.
    """
    model_config = ConfigDict(from_attributes=True)
    doctor_id: int
    full_name: str
    qualification: list[str]
    status: DoctorStatus
    specializations: list[str]
    availabilities: list[AvailabilityOutput]

# DELETE /doctors/{doctor_id}
# No schema needed — doctor_id is taken from the URL path parameter directly.
