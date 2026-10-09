from __future__ import annotations
import base64
from typing import Any
from groq import Groq
from groq import APIConnectionError, APIStatusError, RateLimitError, AuthenticationError
from ..config import Settings

class LLMServiceError(RuntimeError): pass

def friendly_error(exc: Exception) -> str:
    if isinstance(exc, AuthenticationError) or getattr(exc, "status_code", None) in (401, 403):
        return "Groq rejected the credentials. Check GROQ_API_KEY on the backend."
    if isinstance(exc, RateLimitError) or getattr(exc, "status_code", None) == 429:
        return "Groq rate limit or quota reached. Please wait and try again."
    if isinstance(exc, APIConnectionError):
        return "Groq could not be reached. Check the backend network connection."
    status = getattr(exc, "status_code", None)
    if status == 404 or "model" in str(exc).lower() and "not found" in str(exc).lower():
        return "The configured Groq model is unavailable. Update GROQ_TEXT_MODEL or GROQ_VISION_MODEL."
    return "Groq could not complete the request. Please try again."

class GroqService:
    def __init__(self, settings: Settings, client: Any | None = None):
        self.settings = settings
        if not settings.groq_api_key and client is None:
            raise LLMServiceError("Groq is not configured. Add GROQ_API_KEY to backend/.env.")
        self.client = client or Groq(api_key=settings.groq_api_key)

    def complete(self, messages: list[dict[str, Any]], language: str = "English") -> str:
        if not messages or not any(m.get("role") == "user" and str(m.get("content", "")).strip() for m in messages):
            raise LLMServiceError("Please enter a question.")
        system = {"role": "system", "content": f"You are AgriMitra, a careful agriculture assistant for Indian farmers. Reply in {language}. Give practical step-by-step guidance, ask clarifying questions when needed, acknowledge uncertainty, avoid unsafe pesticide mixing or unsupported dosages, and recommend a local agricultural officer for serious cases."}
        try:
            response = self.client.chat.completions.create(model=self.settings.groq_text_model, messages=[system, *messages[-self.settings.max_history_messages:]], temperature=0.3, max_completion_tokens=1200)
        except Exception as exc:
            raise LLMServiceError(friendly_error(exc)) from exc
        text = getattr(response.choices[0].message, "content", None) if getattr(response, "choices", None) else None
        if not text or not text.strip(): raise LLMServiceError("Groq returned an empty response.")
        return text.strip()

    def analyze_image(self, image_bytes: bytes, mime_type: str, prompt: str, language: str = "English") -> str:
        if not image_bytes: raise LLMServiceError("Please upload an image.")
        encoded = base64.b64encode(image_bytes).decode("utf-8")
        content = [{"type": "text", "text": f"Reply in {language}. {prompt} Explain uncertainty and safe next steps; do not claim a definitive diagnosis."}, {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{encoded}"}}]
        try:
            response = self.client.chat.completions.create(model=self.settings.groq_vision_model, messages=[{"role": "user", "content": content}], temperature=0.2, max_completion_tokens=900)
        except Exception as exc:
            raise LLMServiceError(friendly_error(exc)) from exc
        text = getattr(response.choices[0].message, "content", None) if getattr(response, "choices", None) else None
        if not text or not text.strip(): raise LLMServiceError("The vision model returned an empty response.")
        return text.strip()
