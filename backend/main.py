from fastapi import FastAPI, WebSocket, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Dishcovery API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default coords: University of Arizona
DEFAULT_LAT = 32.2319
DEFAULT_LNG = -110.9501


class ChatRequest(BaseModel):
    message: str
    lat: float = DEFAULT_LAT
    lng: float = DEFAULT_LNG
    history: list = []


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/chat")
async def chat(req: ChatRequest):
    from gemini_chat import chat_with_maps
    try:
        return chat_with_maps(req.message, req.lat, req.lng, req.history)
    except Exception as e:
        from google.genai import errors as genai_errors
        if isinstance(e, genai_errors.ClientError) and getattr(e, "code", None) == 429:
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Gemini API quota exceeded. Try again in a minute or check your plan.",
                },
            )
        raise


@app.websocket("/voice")
async def voice(
    websocket: WebSocket,
    lat: float = Query(DEFAULT_LAT),
    lng: float = Query(DEFAULT_LNG),
):
    await websocket.accept()
    from gemini_live import run_voice_session
    await run_voice_session(websocket, lat, lng)
