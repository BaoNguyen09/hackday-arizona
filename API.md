# Dishcovery API Contract

**Base URL:** `http://localhost:8000` (or ngrok URL for demo)

Frontend Vite dev server proxies `/chat`, `/health`, and `/voice` to the backend automatically.

---

## GET /health

Health check for readiness.

**Response:**
```json
{ "status": "ok" }
```

---

## POST /chat

Text chat with Maps + Search grounding.

**Request body:**
```json
{
  "message": "string — user's message",
  "lat": 32.2319,
  "lng": -110.9501,
  "history": [
    { "role": "user", "content": "previous user message" },
    { "role": "model", "content": "previous assistant reply" }
  ]
}
```

- `lat`, `lng` — optional, defaults to U of A coordinates.
- `history` — optional, defaults to empty array. Send previous turns for multi-turn conversation.

**Response:**
```json
{
  "reply": "string — assistant's text response (may contain markdown)",
  "widget_token": "string | null — Google Maps widget context token"
}
```

- If `widget_token` is `null`, hide or disable the Maps widget (no places were grounded).
- If non-null, use it to render the Maps widget iframe.

---

## WebSocket /voice

Real-time voice conversation via Gemini Live API.

**URL:** `ws://localhost:8000/voice?lat=32.2319&lng=-110.9501`

Query params `lat` and `lng` are optional (default: U of A coords).

### Client -> Server

- **Binary frames only.** Raw PCM audio: 16-bit, 16 kHz, mono.
- Send chunks continuously while the user is speaking.

### Server -> Client

Two types of frames:

1. **Binary frames** — PCM audio to play back (24 kHz). Use a separate `AudioContext` for playback.

2. **Text frames** — JSON string. Parse and check which key is present:
   ```json
   { "transcript": "what the user or model said" }
   ```
   or:
   ```json
   { "widget_token": "maps widget context token" }
   ```
   A single text frame contains only one of these keys.

### Notes
- Widget token works the same as in POST /chat — use it for the Maps iframe.
- On disconnect, clean up mic stream and audio playback.
