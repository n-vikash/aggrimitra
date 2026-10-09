from pydantic import BaseModel, Field
from typing import Optional

class ChatRequest(BaseModel):
    conversation_id: Optional[int] = None
    message: str = Field(min_length=1, max_length=8000)
    language: str = Field(default="English", pattern="^(English|Hindi|Telugu)$")

class ChatResponse(BaseModel):
    conversation_id: int
    reply: str

class CropRequest(BaseModel):
    state: str = Field(min_length=2, max_length=80)
    district: str = Field(min_length=2, max_length=80)
    season: str = Field(min_length=2, max_length=40)
    soil_type: str = Field(min_length=2, max_length=80)
    water_availability: str = Field(min_length=2, max_length=80)
    soil_test: str = Field(default="", max_length=1000)

class WeatherRequest(BaseModel):
    location: str = Field(min_length=2, max_length=100)
