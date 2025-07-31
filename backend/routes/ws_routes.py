import nanoid
from fastapi import APIRouter, HTTPException, Depends
from backend.db import engine
from sqlmodel import Session, select

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
        ws = session.exec(select(Workspace)).all()
        return {"success": True, "message": "Workspace fetched successfully.", "workspaces": ws}
    except Exception as e:
        print(e)
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
    """
    Delete a workspace by ID.

    Args:
        id (str): The ID of the workspace to delete.

    Returns:
        dict: A dictionary containing the success state and a message.
    """
    try:
        ws = session.get(Workspace, id)
        if ws is None:
            return {"success": False, "message": "Workspace not found."}
        session.delete(ws)
        session.commit()
        return {"success": True, "message": "Workspace deleted successfully."}
    except Exception as e:
        return {"success": False, "message": str(e)}

@router.get("/copyws/{id}")
async def copy_ws(id: str, session: Session = Depends(get_session)):
    """
    Copy a workspace by ID.

    Args:
        id (str): The ID of the workspace to copy.

    Returns:
        dict: A dictionary containing the success state, a message and the copied workspace.
    """
    try:
        ws = session.get(Workspace, id)
        if ws is None:
            return {"success": False, "message": "Workspace not found."}
        new_ws = ws.model_copy()
        new_ws.id = nanoid.generate()
        new_ws.name = f"{ws.name} (Copy)"

        session.add(new_ws)
        session.commit()
        session.refresh(new_ws)

        return {"success": True, "message": "Workspace copied successfully.", "workspace": new_ws}
    except Exception as e:
        return {"success": False, "message": str(e)}

@router.put("/editws/{id}")
async def edit_ws(id: str, data: Workspace, session: Session = Depends(get_session)):
    """
    Edit a workspace by ID.

    Args:
        id (str): The ID of the workspace to edit.
        data (Workspace): The updated workspace data.

    Returns:
        dict: A dictionary containing the success state and a message.
    """
    try:
        ws = session.get(Workspace, id)
        if ws is None:
            return {"success": False, "message": "Workspace not found."}
        ws.name = data.name
        ws.description = data.description
        ws.modelType = data.modelType
        session.commit()
        return {"success": True, "message": "Workspace edited successfully."}
    except Exception as e:
        return {"success": False, "message": str(e)}