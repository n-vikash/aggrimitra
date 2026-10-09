import httpx
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from ..config import get_settings
from ..schemas import CropRequest, WeatherRequest
from ..services.groq_service import GroqService, LLMServiceError

router = APIRouter(prefix="/api", tags=["features"])

@router.post("/disease")
async def disease(file: UploadFile = File(...), language: str = Form("English")):
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}: raise HTTPException(415, "Upload a JPG, PNG, or WebP image.")
    data = await file.read()
    if len(data) > 20 * 1024 * 1024: raise HTTPException(413, "Image must be smaller than 20 MB.")
    try: return {"analysis": GroqService(get_settings()).analyze_image(data, file.content_type, "Analyze this crop image for possible visible disease or stress. List observations, possible causes, confidence limits, and safe next steps.", language)}
    except LLMServiceError as exc: raise HTTPException(503, str(exc))

@router.post("/crop-recommendations")
def crop(request: CropRequest):
    return {"recommendations": [{"crop": "Rice / Paddy", "reason": "Often suitable where water is reliably available during the season; confirm local variety and soil drainage with an extension officer."}, {"crop": "Millets", "reason": "Can be a practical option in lower-water conditions; match the variety to local rainfall and soil."}], "note": "These are general suggestions, not a guaranteed yield prediction. Consult local agricultural guidance before planting."}

@router.post("/weather")
async def weather(request: WeatherRequest):
    settings = get_settings()
    if not settings.weather_api_key: return {"available": False, "message": "Live weather is not configured. Add WEATHER_API_KEY to enable it; no live conditions are being invented."}
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            response = await client.get("https://api.openweathermap.org/data/2.5/weather", params={"q": request.location, "appid": settings.weather_api_key, "units": "metric"})
            response.raise_for_status(); data = response.json()
        return {"available": True, "location": data.get("name"), "temperature_c": data.get("main", {}).get("temp"), "description": data.get("weather", [{}])[0].get("description"), "source": "OpenWeather"}
    except httpx.HTTPError: raise HTTPException(502, "Weather provider could not be reached or rejected the location.")

@router.get("/schemes")
def schemes():
    return {"schemes": [{"name": "PM-KISAN", "description": "Check the official portal for current eligibility and installments.", "url": "https://pmkisan.gov.in/"}, {"name": "Agriculture Infrastructure Fund", "description": "Review the official government information before applying.", "url": "https://agriinfra.dac.gov.in/"}, {"name": "myScheme agriculture listings", "description": "Search schemes by state and farmer profile.", "url": "https://www.myscheme.gov.in/"}]}
