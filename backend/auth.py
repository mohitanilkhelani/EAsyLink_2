# auth.py

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from models import User
from database import get_db
import os

# Azure AD config
TENANT_ID = os.getenv("AZURE_AD_TENANT_ID")
CLIENT_ID = os.getenv("AZURE_AD_CLIENT_ID")
JWKS_URL = f"https://login.microsoftonline.com/{TENANT_ID}/discovery/v2.0/keys"
AUDIENCE = CLIENT_ID

import requests

class AzureADBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super().__init__(auto_error=auto_error)
        self.jwks = None

    def get_jwks(self):
        if not self.jwks:
            resp = requests.get(JWKS_URL)
            resp.raise_for_status()
            self.jwks = resp.json()
        return self.jwks

    async def __call__(self, request: Request) -> str:
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)
        if credentials:
            token = credentials.credentials
            try:
                jwks = self.get_jwks()
                unverified_header = jwt.get_unverified_header(token)
                rsa_key = {}
                for key in jwks["keys"]:
                    if key["kid"] == unverified_header["kid"]:
                        rsa_key = {
                            "kty": key["kty"],
                            "kid": key["kid"],
                            "use": key["use"],
                            "n": key["n"],
                            "e": key["e"]
                        }
                if not rsa_key:
                    raise HTTPException(status_code=401, detail="Invalid token header")
                payload = jwt.decode(
                    token,
                    rsa_key,
                    algorithms=["RS256"],
                    audience=AUDIENCE,
                    issuer=f"https://login.microsoftonline.com/{TENANT_ID}/v2.0"
                )
                return payload
            except JWTError as e:
                raise HTTPException(status_code=401, detail=f"Token validation error: {str(e)}")
        else:
            raise HTTPException(status_code=401, detail="Invalid authorization code.")

azure_ad_scheme = AzureADBearer()

def get_current_user(
    payload: dict = Depends(azure_ad_scheme),
    db: Session = Depends(get_db)
):
    # Extract unique Azure AD user id (oid or sub)
    aad_oid = payload.get("oid") or payload.get("sub")
    if not aad_oid:
        raise HTTPException(status_code=401, detail="No Azure AD user id in token.")
    user = db.query(User).filter_by(aad_oid=aad_oid).first()
    if not user:
        # Create user on first login
        user = User(
            aad_oid=aad_oid,
            username=payload.get("preferred_username") or payload.get("upn") or payload.get("email"),
            first_name=payload.get("given_name"),
            last_name=payload.get("family_name"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user
