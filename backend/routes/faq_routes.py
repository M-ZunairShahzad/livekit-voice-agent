from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
    status
)
from backend.database_engine.database import get_db
from sqlalchemy.orm import Session
from backend.sqlalchemy_models.models import FAQ
from backend.scheemas.clinic_scheema import FaqCreate, FaqAllCreate, FaqResponse, FaqAllResponse

router = APIRouter(
    prefix="/faqs",
    tags=["FAQs"],
)


def build_faq_response(faq: FAQ) -> FaqResponse:
    return FaqResponse.model_validate(faq)


# POST /faqs
# Frontend sends all FAQs at once via "Save All FAQs" button.
# Each FAQ is inserted as a new row — no upsert needed here
# because FAQs are not unique by day like timings.
@router.post("/", response_model=FaqAllResponse, status_code=status.HTTP_201_CREATED)
def save_faqs(payload: FaqAllCreate, db: Session = Depends(get_db)):
    saved_faqs = []

    for faq_data in payload.faqs:
        new_faq = FAQ(
            question=faq_data.question,
            answer=faq_data.answer,
            category=faq_data.category,
        )
        db.add(new_faq)
        saved_faqs.append(new_faq)

    db.commit()

    for faq in saved_faqs:
        db.refresh(faq)

    return FaqAllResponse(faqs=[build_faq_response(f) for f in saved_faqs])


# GET /faqs
# Returns all FAQs (used for the full knowledge base list).
@router.get("/", response_model=FaqAllResponse, status_code=status.HTTP_200_OK)
def get_all_faqs(db: Session = Depends(get_db)):
    faqs = db.query(FAQ).all()
    return FaqAllResponse(faqs=[build_faq_response(f) for f in faqs])


# GET /faqs/{faq_id}
# Returns a single FAQ by ID.
@router.get("/{faq_id}", response_model=FaqResponse, status_code=status.HTTP_200_OK)
def get_faq(faq_id: int, db: Session = Depends(get_db)):
    faq = db.query(FAQ).filter(FAQ.faq_id == faq_id).first()
    if not faq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"FAQ with id {faq_id} not found.",
        )
    return build_faq_response(faq)


# DELETE /faqs/{faq_id}
# Deletes a single FAQ by ID (the trash icon on each FAQ card).
@router.delete("/{faq_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_faq(faq_id: int, db: Session = Depends(get_db)):
    faq = db.query(FAQ).filter(FAQ.faq_id == faq_id).first()
    if not faq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"FAQ with id {faq_id} not found.",
        )
    db.delete(faq)
    db.commit()