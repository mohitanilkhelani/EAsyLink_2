# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from dotenv import load_dotenv
import mysql.connector

load_dotenv()

DATABASE_URL = (
    f"mysql+mysqlconnector://{os.getenv('SQL_USER')}:{os.getenv('SQL_PASS')}"
    f"@{os.getenv('SQL_SERVER')}/{os.getenv('SQL_DB')}"
)
engine = create_engine(DATABASE_URL, fast_executemany=True)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
