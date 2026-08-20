from  fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import (
    clinic_timing_routes, 
    doctor_routes, 
    faq_routes, 
    lab_test_routes, 
    lab_timing_route,
    livekit_token_routes,
)

app = FastAPI(
    title="Mid City Clinic API", 
    description="Backend API for the Mid City Clinic Data Management System.",
    version = "1.0.0"
)

app.add_middleware(
    CORSMiddleware, 
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://livekit-voice-agent-mu.vercel.app",
    ], 
    allow_credentials=True, 
    allow_methods=["*"], # GET, POST, DELETE, PATCH etc.
    allow_headers=["*"],
)

app.include_router(doctor_routes.router)
app.include_router(lab_test_routes.router)
app.include_router(lab_timing_route.router)
app.include_router(clinic_timing_routes.router)
app.include_router(faq_routes.router)
app.include_router(livekit_token_routes.router)

@app.get("/")
def root():
    return {"status": "ok", "message": "Mid city Clinic API is running"}