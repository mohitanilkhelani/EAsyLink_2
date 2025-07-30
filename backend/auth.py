# auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.hash import bcrypt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from models import User
from schemas import RegisterModel
from database import get_db

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

@router.post("/register")
def register(data: RegisterModel, db: Session = Depends(get_db)):
    if db.query(User).filter_by(username=data.username).first():
        raise HTTPException(400, "User already exists")
    user = User(
        username=data.username,
        password_hash=bcrypt.hash(data.password),
        first_name=data.first_name,
        last_name=data.last_name
    )
    db.add(user)
    db.commit()
    return {"msg": "User registered"}

@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter_by(username=form.username).first()
    if not user or not bcrypt.verify(form.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    return {
        "access_token": user.username,
        "token_type": "bearer",
        "user": {
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
        }
    }

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = db.query(User).filter_by(username=token).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user")
    return user
