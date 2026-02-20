"""
Text chat endpoint logic — Gemini 2.0 Flash with Maps + Search grounding.

TODO:
- [ ] Build conversation history from frontend `history` array
- [ ] Call Gemini with Maps grounding and extract widget_token
- [ ] Handle cases where widget_token is null (no places mentioned)
"""

import os
from google import genai
from google.genai import types
from prompts import SYSTEM_PROMPT

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])


def chat_with_maps(message: str, lat: float, lng: float, history: list) -> dict:
    # TODO: implement — see plan section 3
    raise NotImplementedError("Wire up Gemini 2.0 Flash with Maps grounding")
