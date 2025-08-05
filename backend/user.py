from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import UserCredential, User
from schemas import CredentialModel
from database import get_db
from auth import get_current_user
from cryptography.fernet import Fernet
import os

router = APIRouter()
fernet = Fernet(os.getenv("FERNET_KEY"))

@router.post("/credentials")
def set_credentials(
    data: CredentialModel, 
    db: Session = Depends(get_db), 
    user = Depends(get_current_user)
):
    user_id = user["oid"]
    enc_secret = fernet.encrypt(data.secret.encode()).decode()
    cred = db.query(UserCredential).filter_by(user_id=user_id).first()
    if cred:
        cred.client_id = data.client_id
        cred.tenant_id = data.tenant_id
        cred.secret_enc = enc_secret
    else:
        cred = UserCredential(
            user_id=user_id,
            client_id=data.client_id,
            tenant_id=data.tenant_id,
            secret_enc=enc_secret,
        )
        db.add(cred)
    db.commit()
    return {"msg": "Credentials updated"}

@router.get("/credentials")
def get_credentials(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    user_id = user["oid"]
    cred = db.query(UserCredential).filter_by(user_id=user_id).first()
    if not cred:
        raise HTTPException(404, "No credentials found")
    secret = fernet.decrypt(cred.secret_enc.encode()).decode()
    return {
        "client_id": cred.client_id,
        "tenant_id": cred.tenant_id,
        "secret": secret
    }