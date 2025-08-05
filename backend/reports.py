from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import User  # Add UserCredential if you use it here
from database import get_db
from auth import get_current_user
from powerbi_utils import get_powerbi_credentials, get_access_token
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests

router = APIRouter()

def get_workspaces(headers):
    api_base = "https://api.powerbi.com/v1.0/myorg"
    resp = requests.get(f"{api_base}/groups", headers=headers, verify=False, timeout=20)
    if not resp.ok:
        raise HTTPException(400, f"Failed to fetch workspaces: {resp.text}")
    return resp.json()["value"]

def fetch_reports_for_workspace(ws, headers, api_base):
    ws_id = ws["id"]
    ws_name = ws.get("name", "")
    try:
        resp = requests.get(
            f"{api_base}/groups/{ws_id}/reports",
            headers=headers,
            verify=False,
            timeout=20
        )
        reports = resp.json().get("value", []) if resp.ok else []
    except Exception:
        reports = []
    return [
        {
            "report_name": rpt.get("name"),
            "report_id": rpt.get("id"),
            "workspace_id": ws_id,
            "workspace_name": ws_name,
            "embed_url": rpt.get("embedUrl"),
            "dataset_id": rpt.get("datasetId"),
        }
        for rpt in reports
    ]

@router.get("/reports")
def get_all_reports(
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    user_id = user["oid"]
    # 1. Get Power BI credentials and token
    client_id, tenant_id, secret = get_powerbi_credentials(db, user_id)
    token = get_access_token(client_id, tenant_id, secret)
    api_base = "https://api.powerbi.com/v1.0/myorg"
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get all workspaces
    workspaces = get_workspaces(headers)

    # 3. Fetch all reports concurrently per workspace
    all_reports = []
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [
            executor.submit(fetch_reports_for_workspace, ws, headers, api_base)
            for ws in workspaces
        ]
        for future in as_completed(futures):
            all_reports.extend(future.result())

    return all_reports
