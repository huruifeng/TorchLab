from fastapi import APIRouter, HTTPException, Depends
from backend.db import engine
from sqlmodel import Session

from backend.db import get_session
from backend.models.Workspace import Workspace

router = APIRouter()

@router.get("/")
async def ws_root():
    return {"Message": "Hello Workspace."}

@router.get("/getws")
async def get_ws(session: Session = Depends(get_session)):
    """
    Get all workspaces.

    Returns:
        dict: A dictionary containing the success state, a message and the list of workspaces.
    """
    try:
        ws = session.exec(Workspace.select()).all()
        return {"success": True, "message": "Workspace fetched successfully.", "workspaces": ws}
    except Exception as e:
        return {"success": False, "message": str(e)}

@router.post("/createws")
async def create_ws(data: Workspace, session: Session = Depends(get_session)):
    """
    Create a new workspace.

    Args:
        data (Workspace): The data of the new workspace.

    Returns:
        dict: A dictionary containing the success state, a message and the created workspace.
    """
    try:
        # Add the new workspace to the database
        session.add(data)
        # Commit the changes
        session.commit()
        # Refresh the data to get the new ID
        session.refresh(data)
        # Return a success message with the created workspace
        return {"success": True, "message": "Workspace created successfully.", "workspace": data}
    except Exception as e:
        # Return an error message if any exception occurs
        return {"success": False, "message": str(e)}

@router.delete("/deletews/{id}")
async def delete_ws(id: str, session: Session = Depends(get_session)):
    try:
        session.exec(Workspace.delete().where(Workspace.id == id))
        session.commit()
        return {"success": True, "message": "Workspace deleted successfully."}
    except Exception as e:
        return {"success": False, "message": str(e)}