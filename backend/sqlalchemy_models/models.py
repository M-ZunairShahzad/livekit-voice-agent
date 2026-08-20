from sqlalchemy import (
    Boolean,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    Time,
)

from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from datetime import time
from decimal import Decimal
from enum import Enum as PythonEnum

class Base(DeclarativeBase):
    """ Every table you make like class Doctor(Base): must inherit from it. It's a registry. When you write Doctor, LabTest, 
        FAQ, etc. and inherit from Base, SQLAlchemy automatically registers them inside Base."""
    pass

class DoctorStatus(str, PythonEnum):
    """Use in Doctor table"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ONLEAVE = "onleave"
    
class FAQCategory(str, PythonEnum):
    """Use in FAQ table"""
    DOCTOR = "doctor"
    LAB = "lab"
    CLINICS = "clinics"
    
class Doctor(Base):
    """
    **doctors** table in Neon db
    
    Relationships:-
    
    - **secondary** = means Many to Many relationship. One Doctor can have MANY specializations, and one Specialization can have MANY doctors.
    - **list["Specialization"]**  =  It will be a Python list of Specialization objects.
    - **secondary** = doctors Table use **doctor_specializations** junction table to link with **specializations** table.
    - **back_populates** = Bidirectional link between **doctors** table and **specilizations** table.
    - **list["DoctorAvailability"]** = 1 doctor has many rows in doctor_availability table. It will be a Python list of DoctorAvailability objects.
    
    """

    __tablename__="doctors"
    
    doctor_id: Mapped[int] = mapped_column(
        Integer, 
        primary_key=True, 
        autoincrement=True
    )
    
    full_name: Mapped[str] = mapped_column(
        String(255), 
        nullable=False
    )
    
    qualification: Mapped[list[str]] = mapped_column(
        ARRAY(String), 
        nullable=False
    )
    
    status: Mapped[DoctorStatus] = mapped_column(
        Enum(
            DoctorStatus, # Use my python Enum class.
            name = "doctor_status", # In postgres, name is doctor_status
            native_enum = True, #  Only active, inactive, onleave are allowed.
            values_callable=lambda x: [e.value for e in x]
        ),
        nullable=False
    )
    
    # Relationship with specializations table.
    # doctor.specializations
    specializations: Mapped[list["Specialization"]] = relationship(
        secondary="doctor_specializations",
        back_populates="doctors", # points to Specialization.doctors
    )
    
    # Relationship  with doctor_availability table.
    availabilities: Mapped[list["DoctorAvailability"]] = relationship(
        back_populates="doctor",
        cascade="all, delete-orphan", # if i delete anything from the doctors table then also delete from the doctor availability table as well. the relation between both tables is 1 (doctor) to M (doctor avail). we write this cascade line in 1 always
    )
    
class Specialization(Base):
    """
    **specializations** table in Neon db.
    
    Relationship :
    
    -  **secondary="doctor_specializations"** means M to M relationship between doctors and specilizations table using junction table.
    
    """
    
    __tablename__ = "specializations"

    specialization_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
    )

    # Relationship with doctors
    # specialization.doctors
    doctors: Mapped[list["Doctor"]] = relationship(
        secondary="doctor_specializations",
        back_populates="specializations", # points to Doctor.specializations
    )

class DoctorSpecialization(Base):
    __tablename__ = "doctor_specializations"
    
    doctor_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey (
            "doctors.doctor_id",
            ondelete="CASCADE"
        ),
        primary_key=True,
    )
    
    specialization_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "specializations.specialization_id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    )

class DoctorAvailability(Base):
    __tablename__ = "doctor_availability"
    
    availability_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )
    
    doctor_id: Mapped[int]= mapped_column(
        Integer,
        ForeignKey(
            "doctors.doctor_id",
            ondelete="CASCADE"
        ),
        nullable=False
    )
    
    day_of_week: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )
    
    start_time: Mapped[time] = mapped_column(
        Time,
        nullable=False
    )
    
    end_time: Mapped[time] = mapped_column(
        Time,
        nullable= False
    )
    
    # relationship with doctor
    doctor: Mapped["Doctor"] = relationship(
        back_populates="availabilities"
    )
    
class LabTest(Base):
    __tablename__ = "lab_tests"

    test_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )
    test_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
    )
    price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )
    is_available: Mapped[bool | None] = mapped_column(
        Boolean,
        nullable=True,
        server_default="true",
    )
    
class LabTiming(Base):
    __tablename__ = "lab_timings"

    timing_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    day_of_week: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        unique=True,
    )

    opening_time: Mapped[time | None] = mapped_column(
        Time,
        nullable=True,
    )

    closing_time: Mapped[time | None] = mapped_column(
        Time,
        nullable=True,
    )

    is_closed: Mapped[bool | None] = mapped_column(
        Boolean,
        nullable=True,
        server_default="false",
    )

class ClinicTiming(Base):
    __tablename__ = "clinic_timings"

    timing_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    day_of_week: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        unique=True,
    )

    opening_time: Mapped[time | None] = mapped_column(
        Time,
        nullable=True,
    )

    closing_time: Mapped[time | None] = mapped_column(
        Time,
        nullable=True,
    )

    is_closed: Mapped[bool | None] = mapped_column(
        Boolean,
        nullable=True,
        server_default="false",
    )
    
class FAQ(Base):
    __tablename__ = "faqs"

    faq_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    question: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    answer: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    category: Mapped[FAQCategory] = mapped_column(
        Enum(
            FAQCategory,
            name="faq_category",
            native_enum=True,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
    )