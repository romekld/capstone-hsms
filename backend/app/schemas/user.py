from pydantic import BaseModel


class UserSchema(BaseModel):
    id: int
    email: str
    full_name: str
    roles: list[str]
    health_station_id: int | None
    is_active: bool

    model_config = {"from_attributes": True}


class UserListItem(BaseModel):
    id: int
    email: str
    full_name: str
    roles: list[str]
    health_station_id: int | None
    is_active: bool
    created_at: str  # ISO 8601 — serialized from datetime in service layer

    model_config = {"from_attributes": True}
