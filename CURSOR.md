# Dishcovery — Cursor Agent Context

This file gives Cursor agents (and teammates) full context on the project, architecture, task ownership, and implementation details. Read this before making changes.

## What is this?

A voice-first food discovery PWA for Hack Arizona HackDay 2026. User taps mic, says what they're craving, Gemini responds in voice with real nearby restaurant recommendations backed by live Google Maps data. Text chat also works.

Target prize: **Best Use of Gemini**.

## Hard constraints

- No database. No auth. No deploy pipeline.
- Gemini is the entire brain — text chat uses Maps + Search grounding, voice uses the Live API.
- Default location: University of Arizona (32.2319, -110.9501). Fall back to this if GPS is denied.
- `widget_token` can be `null` — always handle that case (hide Maps widget).

## File ownership and task split

### Backend A — Text chat foundation
**Files:** `backend/main.py`, `backend/gemini_chat.py`, `backend/prompts.py`

Tasks:
1. Implement `chat_with_maps()` in `gemini_chat.py`:
   - Build `contents` from `history` array + current user message
   - Use `GenerateContentConfig` with `system_instruction=SYSTEM_PROMPT`
   - Tools: `Tool(google_maps=GoogleMaps())` + `Tool(google_search=GoogleSearch())`
   - `tool_config=ToolConfig(retrieval_config=RetrievalConfig(lat_lng=LatLng(latitude=lat, longitude=lng)))`
   - Model: `gemini-2.0-flash`
   - Extract `response.text` as `reply` and `response.candidates[0].grounding_metadata.google_maps_widget_context_token` as `widget_token` (safe try/except, default None)
   - Return `{"reply": ..., "widget_token": ...}`
2. The `/health` and `/chat` endpoints in `main.py` are already wired — just implement the function above.
3. Tune `SYSTEM_PROMPT` in `prompts.py` if responses aren't good.

### Backend B — Voice WebSocket proxy
**Files:** `backend/gemini_live.py`, adds `/voice` route to `backend/main.py`

Tasks:
1. Implement `run_voice_session()` in `gemini_live.py`:
   - Build `LiveConnectConfig` with `response_modalities=["AUDIO"]`, same tools/tool_config as chat
   - `input_audio_transcription={}` and `output_audio_transcription={}` for transcripts
   - `async with client.aio.live.connect(model=LIVE_MODEL, config=live_config) as session:`
   - Two concurrent loops via `asyncio.gather`:
     - **receive_from_browser:** `async for message in websocket.iter_bytes()` -> `session.send(realtimeInput audio, PCM 16kHz)`
     - **send_to_browser:** `async for response in session.receive()` -> send binary audio back, send JSON text frames for transcript and widget_token
   - Model: `gemini-2.5-flash-native-audio-preview-12-2025`
2. The `/voice` WebSocket endpoint in `main.py` is already wired.
3. **Critical:** Verify `session.receive()` response shape against the current `google-genai` SDK. The attributes (`response.data`, `response.text`, etc.) may differ from pseudocode.

### Frontend
**Files:** Everything in `frontend/src/`

Tasks (in order — each step is independently demoable):
1. **Text chat loop:** Wire `App.jsx` `handleSend` to `POST /chat`, update `messages` state + `widgetToken`. `ChatWindow`, `ChatInput`, `MessageBubble` are stubbed and styled.
2. **Maps widget:** In `MapsWidget.jsx`, render iframe with `widget_token`. Check Gemini Maps grounding docs for the exact iframe URL format.
3. **Voice mode:** Implement `useVoice.js` hook:
   - Open `WS /voice?lat=X&lng=Y`
   - Capture mic via `getUserMedia` + `AudioWorklet` (or `ScriptProcessor`)
   - Resample to 16-bit PCM at 16kHz mono, send as binary frames
   - Receive binary (24kHz PCM) -> play via `AudioContext`
   - Receive text (JSON) -> parse `transcript` and `widget_token`
   - Wire to `MicButton.jsx`
4. **Favorites:** `useFavorites.js` is already implemented (localStorage). Wire to UI.
5. **PWA:** `manifest.json` and `sw.js` are in place. Add app icons (192px + 512px).

## API contract

See [API.md](API.md) — this is the source of truth for all endpoint shapes. Update it when you change an endpoint.

Summary:
- `GET /health` -> `{ "status": "ok" }`
- `POST /chat` -> request: `{ message, lat, lng, history }` -> response: `{ reply, widget_token }`
- `WS /voice?lat=&lng=` -> binary PCM in (16kHz) / binary PCM out (24kHz) + JSON text frames

## Design system

- Background: `#111111`
- Card: `#1c1c1c`
- Accent: `#f97316` (orange-500)
- Accent glow: `#431407`
- Text: `#f5f5f5`
- Subtext: `#9ca3af`
- User bubbles: orange filled, right-aligned
- Assistant bubbles: dark card with left orange border, left-aligned
- Mic button: pulsing orange circle when active, solid when idle

## Key libraries

### Backend (Python)
- `google-genai` — Gemini SDK. Use `genai.Client(api_key=...)` for both chat and live.
- `fastapi` — HTTP + WebSocket server.
- `python-dotenv` — loads `.env` for `GEMINI_API_KEY`.

### Frontend (JS)
- React 19 + Vite
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin, import `@import "tailwindcss"` in CSS)
- No component library — custom components with Tailwind classes

## Gotchas

- CORS middleware in `main.py` must be registered BEFORE route definitions (it already is).
- Use `gemini-2.0-flash` for text/maps. Use `gemini-2.5-flash-native-audio-preview-12-2025` for voice. Do NOT mix these up.
- Browser mic must output 16-bit PCM at 16kHz mono. Use `AudioContext.sampleRate` resampling if needed.
- Gemini Live responds at 24kHz — use a separate `AudioContext` for playback.
- If `widget_token` is null, hide the Maps panel entirely. Don't render a broken iframe.
- GPS permission denied -> silently fall back to U of A coordinates.
