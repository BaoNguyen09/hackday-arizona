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
.venv\Scripts\activate      # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # add your GEMINI_API_KEY
uvicorn main:app --reload --port 8000 or fastapi dev
```

Get your API key at https://aistudio.google.com

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend dev server runs on http://localhost:5173 and proxies `/chat`, `/health`, and `/voice` to the backend at :8000.

## API Contract

See [API.md](API.md) for the full contract between frontend and backend. This is the single source of truth — backend owners update it when endpoints change.

Interactive REST docs (while backend is running): http://localhost:8000/docs

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
