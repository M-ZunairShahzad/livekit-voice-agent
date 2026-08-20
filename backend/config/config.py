from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

class Settings(BaseSettings):
    # ▶ Pydantic automatically looks for a DATABASE_URL , 
    # environment variable for this field.
    
    database_url: str = ""
    livekit_url: str = ""
    livekit_api_key: str = ""
    livekit_api_secret: str = ""
    deepgram_api_key: str = ""
    google_api_key: str = ""
    groq_api_key: str = ""
    backend_url: str = "http://127.0.0.1:8000"
    
    # ▶ During local dev, Pydantic loads env variables 
    # from the .env file, but in production, it can 
    # read variables directly from the os environment.
    
    # ▶ What is model_config ? 
    # In very simple words, mode_config is setting for 
    # pydantic. I am telling pydantic that here are some rules, 
    # that how this Settings class should behave. 
    
    # ▶ model_config is a special attribute that Pydantic 
    # looks for automatically, Pydantic uses it internally
    # when this cretes: settings = Settings()
    
    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent.parent / ".env",  # always points to backend/.env, 
        env_file_encoding="utf-8"
    )
    
# This single instance is used throughout the application
setting = Settings()