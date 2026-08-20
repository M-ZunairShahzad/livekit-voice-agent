from backend.config.config import setting
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

engine = create_engine(
    setting.database_url,
    pool_pre_ping=True,   # test connection before use — auto-reconnects if Neon dropped it
    pool_recycle=300,     # recycle connections every 5 minutes — prevents stale SSL connections
)

SessionLocal = sessionmaker(
    autoflush=False, 
    autocommit=False,
    bind=engine # "Use this engine when this session needs to talk to the database"
)

Base = declarative_base() # "Base will inherit in tables, so the table will be a part of ORM". See the Sqlalchemy_models.py

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() # make the engine alive, but release the session resources, normally this is done when we finally flsuh, and commit. close() does not mean the flush and commit. 