from fastapi import APIRouter, HTTPException, Depends
from backend.db import engine
from sqlmodel import Session

from backend.db import get_session
from backend.models.Workspace import Workspace

router = APIRouter()

@router.get("/")
async def ws_root():
    return {"Message": "Hello Workspace."}


@router.post("/createws")
async def create_ws(data: Workspace, session: Session = Depends(get_session)):
    try:
        session.add(data)
        session.commit()
        session.refresh(data)
        return {"success": True, "message": "Workspace created successfully.", "workspace": data}
    except Exception as e:
        return {"success": False, "message": str(e)}

@router.get("/getws")
async def get_ws(session: Session = Depends(get_session)):
    try:
        ws = session.exec(Workspace.select()).all()
        return {"success": True, "message": "Workspace fetched successfully.", "workspaces": ws}
    except Exception as e:
        return {"success": False, "message": str(e)}