import os
from cryptography.fernet import Fernet
import requests
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models import UserCredential

FERNET_KEY = os.getenv("FERNET_KEY")
if not FERNET_KEY:
    raise RuntimeError("FERNET_KEY environment variable is not set.")
fernet = Fernet(FERNET_KEY.encode())

def get_powerbi_credentials(db: Session, user):
    cred = db.query(UserCredential).filter_by(user_id=user.id).first()
    if not cred:
        raise HTTPException(400, "No Power BI credentials set for user.")
    client_id, tenant_id = cred.client_id, cred.tenant_id
    secret = fernet.decrypt(cred.secret_enc.encode()).decode()
    return client_id, tenant_id, secret

def get_access_token(client_id, tenant_id, secret):
    authority = f"https://login.microsoftonline.com/{tenant_id}"
    token_url = f"{authority}/oauth2/v2.0/token"
    data = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": secret,
        "scope": "https://analysis.windows.net/powerbi/api/.default",
    }
    resp = requests.post(token_url, data=data, verify=False, timeout=10)
    if not resp.ok:
        raise HTTPException(400, f"Failed to get Power BI token: {resp.text}")
    return resp.json()["access_token"]
