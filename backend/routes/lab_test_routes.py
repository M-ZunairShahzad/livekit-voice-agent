from fastapi import (
    APIRouter, 
    HTTPException,
    Depends,
    status
)
from backend.database_engine.database import get_db
from sqlalchemy.orm import Session
from backend.sqlalchemy_models.models import LabTest
from backend.scheemas.lab_scheema import LabTestCreate, LabTestResponse

router = APIRouter(
    prefix="/lab/test",
    tags=["lab Tests"],
)

def build_response_model(new_test: LabTest) -> LabTestResponse:
    lab_test_response = LabTestResponse(
        test_id = new_test.test_id, 
        test_name = new_test.test_name, 
        price = new_test.price,
        is_available = new_test.is_available
    )
    return lab_test_response
    
# POST /lab/tests
# Adds a single new lab test to the catalog.
@router.post("/", response_model=LabTestResponse, status_code=status.HTTP_201_CREATED)
def create_lab_test(payload: LabTestCreate, db: Session = Depends(get_db)):
    new_test = LabTest(
        test_name = payload.test_name, 
        price = payload.price, 
        is_available = payload.is_available
    )
    db.add(new_test)
    db.flush()
    db.commit()
    db.refresh(new_test)
    return build_response_model(new_test)

# GET  /lab/tests → returns list[LabTestResponse]
@router.get("/", response_model=list[LabTestResponse], status_code=status.HTTP_200_OK)
def get_all_lab_test(db:Session = Depends(get_db)):
    lab_tests = db.query(LabTest).all()
    return [build_response_model(test) for test in lab_tests]

# GET  /lab/tests/{test_id} → returns single LabTestResponse
@router.get("/{test_id}", response_model=LabTestResponse, status_code=status.HTTP_200_OK)
def get_lab_test(test_id: int, db:Session = Depends(get_db)):
    lab_test = db.query(LabTest).filter(LabTest.test_id == test_id).first()
    if not lab_test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lab test with id {test_id} not found.",
        )
    return build_response_model(lab_test) 

# DELETE /lab/tests/{test_id}
@router.delete("/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lab_test(test_id: int, db: Session = Depends(get_db)):
    lab_test = db.query(LabTest).filter(LabTest.test_id == test_id).first()
    if not lab_test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lab test with id {test_id} not found.",
        )
    db.delete(lab_test)
    db.commit()