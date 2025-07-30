# embed.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from cryptography.fernet import Fernet
import os
import requests
from models import User, UserCredential
from schemas import EmbedReportRequest
from auth import get_current_user
from database import get_db
from fastapi import Request

router = APIRouter()

FERNET_KEY = os.getenv("FERNET_KEY")
fernet = Fernet(FERNET_KEY.encode())

def get_access_token(client_id, tenant_id, secret):
    authority = f"https://login.microsoftonline.com/{tenant_id}"
    token_url = f"{authority}/oauth2/v2.0/token"
    data = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": secret,
        "scope": "https://analysis.windows.net/powerbi/api/.default",
    }
    resp = requests.post(token_url, data=data, verify=False)
    resp.raise_for_status()
    return resp.json()["access_token"]

@router.post("/embed-report")
async def embed_report(
    req: EmbedReportRequest,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        print("--- /embed-report CALLED ---")
        print("Raw incoming request body:", await request.body())  # Correct usage!
        print("Parsed Pydantic model:", req.model_dump())
        cred = db.query(UserCredential).filter_by(user_id=user.id).first()
        if not cred:
            raise HTTPException(400, "No Power BI credentials set for user.")
        client_id, tenant_id = cred.client_id, cred.tenant_id
        secret = fernet.decrypt(cred.secret_enc.encode()).decode()
        token = get_access_token(client_id, tenant_id, secret)
        api_base = "https://api.powerbi.com/v1.0/myorg"

        group_id = req.group_id
        report_id = req.report_id

        # Fetch report info
        headers = {"Authorization": f"Bearer {token}"}
        url = f"{api_base}/groups/{group_id}/reports/{report_id}"
        resp = requests.get(url, headers=headers, timeout=20, verify=False)
        if not resp.ok:
            print("Power BI report info response:", resp.text)
            raise HTTPException(400, "Failed to fetch report info from Power BI")
        rpt_info = resp.json()
        embed_url = rpt_info.get("embedUrl")
        dataset_id = rpt_info.get("datasetId") or req.dataset_id

        # Generate embed token
        payload = {
            "reports": [{"id": report_id, "groupId": group_id}],
            "datasets": [{"id": dataset_id}],
            "targetWorkspaces": [{"id": group_id}],
            "accessLevel": "View",
        }
        token_resp = requests.post(
            f"{api_base}/generateToken", headers=headers, json=payload, verify=False
        )
        if not token_resp.ok:
            print("Power BI embed token response:", token_resp.text)
            raise HTTPException(400, "Failed to generate embed token from Power BI")

        embed_token = token_resp.json()["token"]
        print({
            "embed_token": embed_token,
            "embed_url": embed_url,
            "report_id": report_id,
            "group_id": group_id,
            "dataset_id": dataset_id,
            "report_name": rpt_info.get("name"),
        })
        return {
            "embed_token": embed_token,
            "embed_url": embed_url,
            "report_id": report_id,
            "group_id": group_id,
            "dataset_id": dataset_id,
            "report_name": rpt_info.get("name"),
        }
    except Exception as e:
        import traceback
        print("ERROR in /embed-report:", e)
        traceback.print_exc()
        raise HTTPException(500, f"Internal error in /embed-report: {str(e)}")
    
    
@router.post("/create-embed")
async def create_powerbi_embed(
    req: EmbedReportRequest,   # Same schema as your existing one!
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        print("--- /embed-report CALLED ---")
        print("Raw incoming request body:", await request.body())  # Correct usage!
        print("Parsed Pydantic model:", req.model_dump())
        cred = db.query(UserCredential).filter_by(user_id=user.id).first()
        if not cred:
            raise HTTPException(400, "No Power BI credentials set for user.")
        client_id, tenant_id = cred.client_id, cred.tenant_id
        secret = fernet.decrypt(cred.secret_enc.encode()).decode()
        token = get_access_token(client_id, tenant_id, secret)
        api_base = "https://api.powerbi.com/v1.0/myorg"

        group_id = getattr(req, "group_id", None) or getattr(req, "workspace_id", None)
        if not group_id:
            raise HTTPException(422, "Missing group_id/workspace_id in payload.")

        # Fetch report info (get embedUrl dynamically)
        headers = {"Authorization": f"Bearer {token}"}
        url = f"{api_base}/groups/{group_id}/reports/{req.report_id}"
        resp = requests.get(
            url,
            headers=headers,
            timeout=20,
            verify=False,
        )
        if not resp.ok:
            print("Power BI report info response:", resp.text)
            raise HTTPException(400, "Failed to fetch report info from Power BI")
        rpt_info = resp.json()
        embed_url = rpt_info.get("embedUrl")
        dataset_id = rpt_info.get("datasetId") or req.dataset_id

        # Generate embed token
        payload = {
            "reports": [{"id": req.report_id, "groupId": group_id}],
            "datasets": [{"id": dataset_id}],
            "targetWorkspaces": [{"id": group_id}],
            "accessLevel": "View",
        }
        token_resp = requests.post(
            f"{api_base}/generateToken", headers=headers, json=payload, verify=False
        )
        if not token_resp.ok:
            print("Power BI embed token response:", token_resp.text)
            raise HTTPException(400, "Failed to generate embed token from Power BI")

        embed_token = token_resp.json()["token"]
        return {
            "embed_token": embed_token,
            "embed_url": embed_url,
            "report_id": req.report_id,
            "group_id": group_id,
            "dataset_id": dataset_id,
            "report_name": rpt_info.get("name"),
        }
    except Exception as e:
        import traceback
        print("ERROR in /create-embed:", e)
        traceback.print_exc()
        raise HTTPException(500, f"Internal error in /create-embed: {str(e)}")