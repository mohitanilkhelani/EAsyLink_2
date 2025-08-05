# models.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func, Text, Boolean
from sqlalchemy.orm import relationship
from database import Base
import os

SQL_SCHEMA = os.getenv("SQL_SCHEMA", "dbo")

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": SQL_SCHEMA}
    id = Column(Integer, primary_key=True)
    username = Column(String(255), unique=True, index=True)
    password_hash = Column(String(255))
    first_name = Column(String(255))
    last_name = Column(String(255))
    credentials = relationship("UserCredential", back_populates="user", uselist=False)

class UserCredential(Base):
    __tablename__ = "user_credentials"
    __table_args__ = {"schema": SQL_SCHEMA}
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey(f"{SQL_SCHEMA}.users.id"))
    client_id = Column(String(255))
    tenant_id = Column(String(255))
    secret_enc = Column(String(2048))
    user = relationship("User", back_populates="credentials")


class UserDashboardLayout(Base):
    __tablename__ = "user_dashboard_layouts"
    __table_args__ = {"schema": SQL_SCHEMA}
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey(f"{SQL_SCHEMA}.users.id"))
    layout_name = Column(String(255))
    description = Column(Text, nullable=True)
    layout_data = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    is_favorite = Column(Boolean, default=False)
    user = relationship("User", backref="dashboard_layouts")