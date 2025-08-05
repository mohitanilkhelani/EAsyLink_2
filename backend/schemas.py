# schemas.py
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class RegisterModel(BaseModel):
    username: str
    password: str
    first_name: str
    last_name: str

class CredentialModel(BaseModel):
    client_id: str
    tenant_id: str
    secret: str

class EmbedReportRequest(BaseModel):
    group_id: str
    report_id: str
    dataset_id: str


class ReportComment(BaseModel):
    text: str
    author: str
    author_id: Optional[str] = None
    date: Optional[str] = None
    
class UpdateCommentsRequest(BaseModel):
    report_id: str
    comments: List[ReportComment]
    
class LayoutReportModel(BaseModel):
    report_id: str
    group_id: str          
    dataset_id: Optional[str] = None
    report_name: Optional[str] = None
    comments: Optional[List[ReportComment]] = []  # <-- Change here!


class DashboardLayoutModel(BaseModel):
    layout_name: str
    description: Optional[str] = None
    layout_data: List[LayoutReportModel]