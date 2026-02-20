# Dishcovery

Voice-first food discovery PWA powered by Gemini. Tap the mic, say what you're craving, and Dishcovery responds — in voice — with real nearby restaurant recommendations backed by live Google Maps data. Also works as a regular chatbot for those who prefer typing.

Built at Hack Arizona HackDay 2026. Target prize: **Best Use of Gemini**.

## Demo

Open the app on your phone, tap mic, say *"I'm starving, something spicy and cheap near here"* — Gemini responds in voice while the Maps widget populates with real places on screen.

## Architecture

```
Browser GPS
    |
React PWA (Vite + Tailwind)
  |-- Text mode -->  POST /chat  -->  FastAPI  -->  Gemini 2.0 Flash (Maps + Search grounding)
  |-- Voice mode ->  WS /voice   -->  FastAPI  -->  Gemini Live API (audio in/out, Maps tool)
                                                        |
                                              Response: text + audio + widget_token
                                                        |
                              Frontend: chat bubble + voice playback + Maps widget
```

No database. No auth. The whole "brain" is Gemini + Maps.

## Project Structure

```
hackday-arizona/
|-- backend/
|   |-- main.py            # FastAPI app: /health, /chat, /voice endpoints
|   |-- gemini_chat.py     # Text chat with Maps + Search grounding
|   |-- gemini_live.py     # Voice WebSocket proxy to Gemini Live API
|   |-- prompts.py         # Shared system prompt
|   |-- requirements.txt
|   +-- .env.example
|-- frontend/
|   |-- public/
|   |   |-- manifest.json  # PWA manifest
|   |   +-- sw.js          # Service worker stub
|   +-- src/
|       |-- App.jsx
|       |-- components/
|       |   |-- ChatWindow.jsx
|       |   |-- ChatInput.jsx
|       |   |-- MessageBubble.jsx
|       |   |-- MapsWidget.jsx
|       |   |-- MicButton.jsx
|       |   +-- SuggestedPrompts.jsx
|       +-- hooks/
|           |-- useLocation.js
|           |-- useVoice.js
|           +-- useFavorites.js
|-- API.md                  # API contract (source of truth for frontend/backend)
|-- CURSOR.md               # Build plan + context for Cursor agents
+-- README.md
```

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # add your GEMINI_API_KEY
uvicorn main:app --reload --port 8000
```

If you see **Address already in use**, either stop the other process using port 8000 (e.g. `lsof -i :8000` then `kill <PID>`) or run on another port: `uvicorn main:app --reload --port 8001`.

If `uvicorn` is not found, either activate the venv first (`source .venv/bin/activate`) or run:
`./.venv/bin/uvicorn main:app --reload --port 8000`

Get your API key at https://aistudio.google.com

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend dev server runs on http://localhost:5173 and proxies `/chat`, `/health`, and `/voice` to the backend at :8000.

For the **Maps widget** (when the model returns places), create a `frontend/.env` with a Google Maps JavaScript API key and enable **Maps JavaScript API** and **Places API** for that key in [Google Cloud Console](https://console.cloud.google.com/apis/library):

```bash
VITE_GOOGLE_MAPS_API_KEY=your_maps_platform_key
```

This is separate from the Gemini API key used by the backend.

## API Contract

See [API.md](API.md) for the full contract between frontend and backend. This is the single source of truth — backend owners update it when endpoints change.

Interactive REST docs (while backend is running): http://localhost:8000/docs

### Verify Maps grounding

When the model recommends real places, the API returns a **non-null `widget_token`** that the frontend uses to show the Maps widget. To confirm grounding is working:

1. **From the terminal** (with the backend running):
   ```bash
   cd backend && python verify_grounding.py
   ```
   The script calls `POST /chat` with a place-seeking message and prints whether `widget_token` is present.

2. **In the server log** — when a request returns a widget token, you’ll see:  
   `Maps grounding: widget_token present (len=...)`

3. **In the app** — if the frontend Maps widget is wired to `widget_token`, you should see a map with pins when the reply recommends places.

If `widget_token` is always `null`, check that your prompt asks for real places (e.g. “best tacos near campus”) and that your Gemini project has access to the grounding tools.

## Tech Stack

- **Backend:** Python + FastAPI
- **Frontend:** React + Vite + Tailwind CSS
- **Chat AI:** Gemini 2.0 Flash + Google Maps grounding + Google Search grounding
- **Voice AI:** Gemini Live API (`gemini-2.5-flash-native-audio-preview`)
- **Voice transport:** WebSocket (backend proxies to Live API)
- **Location:** Browser `navigator.geolocation`
- **Favorites:** `localStorage`
- **PWA:** `manifest.json` + service worker stub
- **Deploy:** localhost + ngrok for demo

## Team

- **Backend A** — `/health`, `/chat`, `gemini_chat.py`, `prompts.py` (foundation)
- **Backend B** — `/voice`, `gemini_live.py` (voice layer)
- **Frontend** — React UI, voice hook, Maps widget, PWA

## License

MIT
