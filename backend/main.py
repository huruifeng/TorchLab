from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.settings import settings

from backend.db import create_db_and_tables
from backend.routes import ws_routes
app = FastAPI(debug=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend's URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_event_handler("startup", create_db_and_tables)

@app.get("/")
async def root():
    return "Hello, Welcome to TorchLab!"

app.include_router(ws_routes.router, prefix="/workspaces")


if __name__ == "__main__":
    import uvicorn
    print("Starting FastAPI server on port", settings.uvicorn_port)
    uvicorn.run(app,
                host=settings.uvicorn_host,
                port=settings.uvicorn_port,
                log_level=settings.uvicorn_log_level,
                )

    # nohup python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4 --proxy-headers >> backend.log 2>&1 &
    # nohup python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload --proxy-headers >> backend.log 2>&1 &
