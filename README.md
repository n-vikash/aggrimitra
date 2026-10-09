# AgriMitra

AgriMitra is a React + Vite and FastAPI agriculture assistant for Indian farmers. It uses the official Groq Python SDK for text and vision requests, SQLite for conversation persistence, and keeps all credentials on the backend.

## Features

- Chat in English, Hindi, or Telugu with conversation context
- Agriculture guidance for crops, irrigation, soil, pests, harvesting, and disease questions
- Plant image analysis using Groq's documented vision model `qwen/qwen3.8-27b`
- Crop recommendation form with transparent limitations
- Optional live weather through OpenWeatherMap; no live weather is invented when unconfigured
- Official-source links for selected Indian schemes
- SQLite conversation history, clear/new chat controls, validation, loading, and error states
- Responsive agriculture-themed React UI with Tailwind CSS and Lucide icons

## Current Groq integration

The backend uses `Groq().chat.completions.create(...)`, the official SDK method documented by Groq. The default text model is `openai/gpt-oss-120b`. The default vision model is `qwen/qwen3.8-27b`, which is configured separately because ordinary text models should not be assumed to accept images. Confirm model access in your Groq account before deployment; model availability can change.

## Setup on macOS/Linux

```bash
git clone <your-repository-url> agrimitra
cd agrimitra
cp .env.example .env
# Edit .env and add a newly created GROQ_API_KEY.
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cd frontend
npm install
cd ..
```

Start the backend:

```bash
uvicorn backend.main:app --reload --port 8000
```

In another terminal, start the frontend:

```bash
cd frontend
npm run dev
```

Open http://localhost:5173.

## Windows PowerShell

```powershell
git clone <your-repository-url> agrimitra
cd agrimitra
Copy-Item .env.example .env
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
cd frontend
npm install
cd ..
uvicorn backend.main:app --reload --port 8000
```

Open a second PowerShell window:

```powershell
cd path\to\agrimitra\frontend
npm run dev
```

## Environment variables

Create a Groq key at https://console.groq.com/keys and place it only in the root/backend environment. Never put it in `frontend/.env`, React source, browser storage, logs, or GitHub.

```env
GROQ_API_KEY=your-new-key
GROQ_TEXT_MODEL=openai/gpt-oss-120b
GROQ_VISION_MODEL=qwen/qwen3.8-27b
WEATHER_API_KEY=
DATABASE_URL=sqlite:///./agrimitra.db
FRONTEND_ORIGIN=http://localhost:5173
```

The API key previously pasted into chat should be revoked and replaced. Do not use it for deployment.

## Tests

```bash
pytest -q backend/tests
npm run build --prefix frontend
```

Backend tests mock Groq and verify context, model selection, image content formatting, missing configuration, empty responses, and safe error handling. A live Groq request is not run unless a valid key is configured in the environment.

## API endpoints

- `GET /health`
- `POST /api/chat`
- `GET /api/conversations`
- `GET /api/conversations/{id}`
- `DELETE /api/conversations/{id}`
- `POST /api/disease`
- `POST /api/crop-recommendations`
- `POST /api/weather`
- `GET /api/schemes`

## Deployment

Deploy the FastAPI service and frontend separately. Set `GROQ_API_KEY`, model variables, `DATABASE_URL`, and `FRONTEND_ORIGIN` through the host's secret manager. Build the frontend with `npm run build`; serve `frontend/dist` with a static host. Run the API with `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`.

For production, use managed persistent storage instead of local SQLite if multiple backend instances are required. Restrict CORS to the exact deployed frontend origin, add authentication before exposing private conversation history, and keep request/file limits enabled.

## Safety and limitations

AI output is general guidance, not a professional diagnosis or guarantee of yield. Image analysis reports visual possibilities and uncertainty. Do not use it as a substitute for a qualified agricultural officer. Verify scheme eligibility and deadlines on the linked official portals. Weather is only reported when the configured provider returns actual data.

## Sources

- Groq quickstart: https://console.groq.com/docs/quickstart
- Groq text generation: https://console.groq.com/docs/text-chat
- Groq supported models: https://console.groq.com/docs/models
- Groq vision: https://console.groq.com/docs/vision
