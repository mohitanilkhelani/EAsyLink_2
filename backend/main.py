# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
import models
from auth import router as auth_router
from layouts import router as layouts_router
from user import router as user_router
from reports import router as reports_router
from embed import router as embed_router

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev, "*" is fine. For prod, list your frontend URL(s)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(layouts_router)
app.include_router(user_router)
app.include_router(reports_router)
app.include_router(embed_router)

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "EAsyLink backend is running"}
