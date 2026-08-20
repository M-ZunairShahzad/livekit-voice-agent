from fastapi import (
    APIRouter, 
    HTTPException,
    Depends,
    status
)
from backend.database_engine.database import get_db
from sqlalchemy.orm import Session
from backend.sqlalchemy_models.models import Doctor, Specialization, DoctorAvailability
from backend.scheemas.doctor_sheema import DoctorResponse, DoctorCreate, AvailabilityOutput

router = APIRouter(
    prefix="/doctors",
    tags=["Doctors"],
)

def build_doctor_response(new_doctor: Doctor) -> DoctorResponse:
    doctor_response = DoctorResponse(
            doctor_id = new_doctor.doctor_id, 
            full_name = new_doctor.full_name, 
            qualification = new_doctor.qualification, 
            status= new_doctor.status, 
            specializations = [s.name for s in new_doctor.specializations], 
            availabilities = [
                AvailabilityOutput.model_validate(slot)
                for slot in new_doctor.availabilities
            ]
        )
        
    return doctor_response
    
# POST localhost/doctors
# Create a new doctor profile.
@router.post("/", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
def create_doctor(payload: DoctorCreate, db: Session = Depends(get_db)):
    new_doctor = Doctor(
        full_name = payload.full_name, 
        qualification = payload.qualification,
        status = payload.status
    )
    db.add(new_doctor)
    db.flush()
    if payload.specializations:
        for name in payload.specializations:
            specialization = db.query(Specialization).filter(
                Specialization.name == name
            ).first()
            if not specialization:
                specialization = Specialization(
                    name = name
                )
                db.add(specialization)
                db.flush()
            new_doctor.specializations.append(specialization)
            # specialization.doctors.append(new_doctor) # duplicate key crash
    for slot in payload.availabilities:
        availability = DoctorAvailability(
            doctor_id = new_doctor.doctor_id,
            day_of_week = slot.day_of_week,
            start_time = slot.start_time,
            end_time = slot.end_time
        )
        db.add(availability)
    db.commit()
    db.refresh(new_doctor)
    return build_doctor_response(new_doctor)
    
        
# GET localhost/doctors
# Return all registered doctors
@router.get("/", response_model=list[DoctorResponse], status_code=status.HTTP_200_OK)
def get_all_doctors(db:Session = Depends(get_db)):
    doctors = db.query(Doctor).all()
    return [build_doctor_response(doctor) for doctor in doctors]

# GET /doctors/{doctor_id}
# Return a single doctor by ID.
@router.get("/{doctor_id}", response_model=DoctorResponse, status_code=status.HTTP_200_OK)
def get_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.doctor_id == doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Doctor with id {doctor_id} not found.",
        )
    return build_doctor_response(doctor)


# DELETE /doctors/{doctor_id}
# Delete a doctor by ID.
@router.delete("/{doctor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.doctor_id == doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Doctor with id {doctor_id} not found.",
        )
    db.delete(doctor)
    db.commit()