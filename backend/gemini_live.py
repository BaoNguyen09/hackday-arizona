"""
Voice WebSocket proxy — Browser <-> FastAPI <-> Gemini Live API.

Architecture:
  Browser sends: raw PCM audio chunks (16-bit, 16kHz, mono) as binary frames
  Browser receives:
    - binary frames = PCM audio to play back (24kHz)
    - text frames   = JSON with { "transcript": ... } or { "widget_token": ... }

TODO:
- [ ] Build LiveConnectConfig with Maps + Search grounding
- [ ] Proxy audio from browser WebSocket to Gemini Live session
- [ ] Forward audio + transcript + widget_token back to browser
- [ ] Handle disconnect / cleanup gracefully
"""

import os
import json
import asyncio
from prompts import SYSTEM_PROMPT

# Optional: only load Gemini client when not mocking
try:
    from google import genai
    from google.genai import types
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", ""))
except Exception:
    client = None

LIVE_MODEL = "gemini-2.5-flash-native-audio-preview-12-2025"


async def _mock_voice_session(websocket, lat: float, lng: float):
    """Echo-style mock for testing frontend without Gemini Live API. Set MOCK_VOICE=1 to use."""
    await websocket.send_text(json.dumps({"transcript": "(listening...)"}))
    chunk_count = 0
    try:
        while True:
            msg = await asyncio.wait_for(websocket.receive(), timeout=60.0)
            if msg.get("type") == "websocket.disconnect":
                break
            if "bytes" in msg:
                chunk_count += 1
                # After a few chunks, simulate a reply: transcript + widget_token
                if chunk_count == 10:
                    await websocket.send_text(json.dumps({"transcript": "I heard you! Here are some spots."}))
                    await websocket.send_text(json.dumps({"widget_token": "mock-widget-token-for-testing"}))
                    # Optional: send 0.1s of silence (24kHz 16-bit mono) so playback path is exercised
                    num_samples = int(0.1 * 24000)
                    await websocket.send_bytes(b"\x00\x00" * num_samples)
            await asyncio.sleep(0.01)
    except asyncio.TimeoutError:
        pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass


async def run_voice_session(websocket, lat: float, lng: float):
    if os.environ.get("MOCK_VOICE") == "1":
        await _mock_voice_session(websocket, lat, lng)
        return
    if not client:
        await websocket.send_text(json.dumps({"transcript": "Voice backend not configured (no GEMINI_API_KEY)."}))
        await websocket.close()
        return
    # TODO: implement — see plan section 5
    raise NotImplementedError("Wire up Gemini Live API voice proxy")
