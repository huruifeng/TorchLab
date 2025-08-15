from fastapi.testclient import TestClient
from backend.main import app  # Import your FastAPI app

# Create a TestClient instance for your app
client = TestClient(app)

def test_read_root():
    """Test the root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message":  "Hello, Welcome to TorchLab!"}

def test_read_workspace():
    """Test the /workspaces endpoint."""
    response = client.get("/workspaces")
    assert response.status_code == 200
    assert response.json() == {"Message": "Hello TorchLab Workspaces."}

def test_create_workspace():
    """Test the /workspaces/createws endpoint."""
    response = client.post("/workspaces/createws", json={"id": "temptestws123","name": "Test Workspace", "description": "This is a test workspace."})
    assert response.status_code == 200
    assert response.json()["success"]

def test_get_workspace():
    """Test the /workspaces/getws/{id} endpoint."""
    response = client.get("/workspaces/getws")
    assert response.status_code == 200
    assert response.json()["success"]

def test_get_workspace_by_id():
    """Test the /workspaces/getws/{id} endpoint."""
    response = client.get("/workspaces/getwsbyid/temptestws123")
    assert response.status_code == 200
    assert response.json()["success"]

def test_delete_workspace():
    """Test the /workspaces/deletews/{id} endpoint."""
    response = client.delete("/workspaces/deletews/temptestws123")
    assert response.status_code == 200
    assert response.json()["success"]

