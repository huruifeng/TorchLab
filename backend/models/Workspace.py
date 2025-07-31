from sqlmodel import SQLModel, Field, Relationship
import nanoid
from datetime import date


class WorkspaceBase(SQLModel):
    name: str = Field(default="My Workspace")
    description: str = Field(default="My Workspace Description")
    createdAt: str = Field(default_factory=lambda: date.today().isoformat())
    lastModified: str = Field(default_factory=lambda: date.today().isoformat())
    modelType: str = Field(default="Custom")
    status: str = Field(default="Draft")

class Workspace(WorkspaceBase, table=True):
    id: str = Field(default_factory=nanoid.generate, primary_key=True)

    def get_name(self):
        return self.name

    def get_description(self):
        return self.description

    def get_id(self):
        return self.id

    def get_model_type(self):
        return self.modelType

    def get_status(self):
        return self.status
