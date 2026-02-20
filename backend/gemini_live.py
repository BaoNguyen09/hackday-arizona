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
from google import genai
from google.genai import types
from prompts import SYSTEM_PROMPT

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

LIVE_MODEL = "gemini-2.5-flash-native-audio-preview-12-2025"


async def run_voice_session(websocket, lat: float, lng: float):
    # TODO: implement — see plan section 5
    raise NotImplementedError("Wire up Gemini Live API voice proxy")
