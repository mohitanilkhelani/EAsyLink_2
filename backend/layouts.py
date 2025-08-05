from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
import json
from models import UserDashboardLayout
from schemas import DashboardLayoutModel, UpdateCommentsRequest
from auth import get_current_user
from database import get_db

router = APIRouter()

@router.post("/dashboard-layout")
def save_dashboard_layout(
    layout: DashboardLayoutModel,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    user_id = user["oid"]
    existing = (
        db.query(UserDashboardLayout)
        .filter_by(user_id=user_id, layout_name=layout.layout_name)
        .first()
    )
    # Just pass through the data, don't dict() if already dicts!
    layout_json = json.dumps([
        item.dict() if hasattr(item, "dict") else item
        for item in layout.layout_data
    ])
    
    if existing:
        existing.layout_data = layout_json
        existing.description = layout.description
    else:
        existing = UserDashboardLayout(
            user_id=user_id,
            layout_name=layout.layout_name,
            description=layout.description,
            layout_data=layout_json,
        )
        db.add(existing)
    db.commit()
    return {
        "msg": f"Layout '{layout.layout_name}' saved.",
        "id": existing.id,
        "user_id": existing.user_id,
        "layout_name": existing.layout_name,
        "description": existing.description,
        "created_at": existing.created_at,
        "layout_data": json.loads(existing.layout_data),
    }
    
@router.get("/dashboard-layouts")
def get_dashboard_layouts(
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    user_id = user["oid"]
    layouts = (
        db.query(UserDashboardLayout)
        .filter_by(user_id=user_id)
        .order_by(UserDashboardLayout.is_favorite.desc(), UserDashboardLayout.created_at.desc())
        .all()
    )
    return [
        {
            "id": l.id,
            "layout_name": l.layout_name,
            "description": l.description,
            "created_at": l.created_at,
            "user_id": l.user_id,
            "created_by": (
                f"{(getattr(l.user, 'first_name', '') or '').title()} {(getattr(l.user, 'last_name', '') or '').title()}".strip()
                if l.user else None
            ),
            "is_favorite": l.is_favorite,
        }
        for l in layouts
    ]

@router.post("/dashboard-layouts/{layout_id}/favorite")
def set_favorite(
    layout_id: int,
    favorite: bool = Query(...),
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    layout = (
        db.query(UserDashboardLayout)
        .filter_by(user_id=user.id, id=layout_id)
        .first()
    )
    if not layout:
        raise HTTPException(404, "Layout not found.")
    layout.is_favorite = favorite
    db.commit()
    db.refresh(layout)
    return {"id": layout.id, "is_favorite": layout.is_favorite}


@router.get("/dashboard-layout/{layout_id}")
def get_dashboard_layout(
    layout_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    layout = (
        db.query(UserDashboardLayout)
        .filter_by(user_id=user.id, id=layout_id)
        .first()
    )
    if not layout:
        raise HTTPException(404, "Layout not found.")
    return {
        "id": layout.id,
        "layout_name": layout.layout_name,
        "description": layout.description,  # add description
        "layout_data": json.loads(layout.layout_data),
        "created_at": layout.created_at,
        "user_id": layout.user_id,
        "created_by": getattr(layout, "created_by", None),  # if you have it
    }
    
    
@router.delete("/dashboard-layout/{layout_id}")
def delete_dashboard_layout(
    layout_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    existing = (
        db.query(UserDashboardLayout)
        .filter_by(user_id=user.id, id=layout_id)
        .first()
    )
    if not existing:
        raise HTTPException(404, "Layout not found.")
    db.delete(existing)
    db.commit()
    return {"msg": f"Layout deleted.", "id": layout_id, "user_id": user.id}


@router.put("/dashboard-layout/{layout_id}")
def update_dashboard_layout(
    layout_id: int,
    layout: DashboardLayoutModel,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    existing = (
        db.query(UserDashboardLayout)
        .filter_by(user_id=user.id, id=layout_id)
        .first()
    )
    if not existing:
        raise HTTPException(404, "Layout not found.")

    # layout_data is a list of dicts from Pydantic, so dump as JSON
    layout_data_dicts = [item.dict() for item in layout.layout_data]
    layout_json = json.dumps(layout_data_dicts)

    existing.layout_name = layout.layout_name
    existing.description = layout.description
    existing.layout_data = layout_json

    db.commit()
    db.refresh(existing)

    return {
        "msg": f"Layout '{existing.layout_name}' updated.",
        "id": existing.id,
        "user_id": existing.user_id,
        "layout_name": existing.layout_name,
        "description": existing.description,
        "created_at": existing.created_at,
        "layout_data": json.loads(existing.layout_data),
    }
    
@router.put("/dashboard-layout/{layout_id}/report-comments")
def update_report_comments(
    layout_id: int,
    payload: UpdateCommentsRequest,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    layout = (
        db.query(UserDashboardLayout)
        .filter_by(user_id=user.id, id=layout_id)
        .first()
    )
    if not layout:
        raise HTTPException(404, "Layout not found.")

    layout_data = json.loads(layout.layout_data)
    found = False

    for report in layout_data:
        if report.get("report_id") == payload.report_id:
            report["comments"] = [comment.dict() for comment in payload.comments]
            found = True
            break

    if not found:
        raise HTTPException(404, "Report not found in layout.")

    layout.layout_data = json.dumps(layout_data)
    db.commit()
    db.refresh(layout)
    return {"msg": "Comments updated.", "layout_id": layout_id, "report_id": payload.report_id}