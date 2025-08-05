# auth.py

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, jwk
import requests

router = APIRouter()

# Azure AD config (replace with your values)
TENANT_ID = "<YOUR_TENANT_ID>"
AUDIENCE = "<YOUR_API_CLIENT_ID>"  # Application (client) ID of your API
ISSUER = f"https://login.microsoftonline.com/{TENANT_ID}/v2.0"
JWKS_URL = f"{ISSUER}/discovery/v2.0/keys"

bearer_scheme = HTTPBearer()

_jwks_cache = None
def get_jwk():
    global _jwks_cache
    if _jwks_cache is None:
        _jwks_cache = requests.get(JWKS_URL).json()
    return _jwks_cache

def verify_jwt(token: str):
    jwks = get_jwk()
    unverified_header = jwt.get_unverified_header(token)
    for key in jwks["keys"]:
        if key["kid"] == unverified_header["kid"]:
            public_key = jwk.construct(key)
            break
    else:
        raise HTTPException(status_code=401, detail="Invalid token header: kid not found")
    try:
        # jose requires the key in PEM or JWK format, so pass the JWK directly
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=AUDIENCE,
            issuer=ISSUER,
        )
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token validation error: {str(e)}")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    token = credentials.credentials
    payload = verify_jwt(token)
    return payload