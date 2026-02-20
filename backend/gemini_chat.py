"""
Text chat endpoint logic — Gemini 2.0 Flash with Maps + Search grounding.
"""

import logging
import os
from google import genai

logger = logging.getLogger(__name__)
from google.genai import types
from prompts import SYSTEM_PROMPT

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])


def chat_with_maps(message: str, lat: float, lng: float, history: list) -> dict:
    # Build contents: history (role + content) + current user message
    contents = []
    for turn in history:
        role = turn.get("role", "user")
        content = turn.get("content", "")
        if not content:
            continue
        # API uses "user" and "model"
        role = "model" if role == "model" else "user"
        contents.append(
            types.Content(
                role=role,
                parts=[types.Part.from_text(text=content)],
            )
        )
    contents.append(
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=message)],
        )
    )

    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        tools=[
            types.Tool(google_maps=types.GoogleMaps(enable_widget=True)),
            types.Tool(google_search=types.GoogleSearch()),
        ],
        tool_config=types.ToolConfig(
            retrieval_config=types.RetrievalConfig(
                lat_lng=types.LatLng(latitude=lat, longitude=lng)
            )
        ),
        temperature=0.7,
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=contents,
        config=config,
    )

    reply = response.text or ""

    widget_token = None
    try:
        if response.candidates:
            candidate = response.candidates[0]
            logger.debug("Candidate has grounding_metadata: %s", hasattr(candidate, "grounding_metadata"))
            if hasattr(candidate, "grounding_metadata"):
                meta = candidate.grounding_metadata
                logger.debug("Grounding metadata type: %s", type(meta))
                logger.debug("Grounding metadata dir: %s", dir(meta) if meta else None)
                if meta:
                    # Try different attribute names
                    if hasattr(meta, "google_maps_widget_context_token"):
                        widget_token = meta.google_maps_widget_context_token
                        logger.debug("Found widget_token via google_maps_widget_context_token")
                    elif hasattr(meta, "googleMapsWidgetContextToken"):
                        widget_token = meta.googleMapsWidgetContextToken
                        logger.debug("Found widget_token via googleMapsWidgetContextToken")
                    # Also check if it's a dict-like object
                    elif isinstance(meta, dict):
                        widget_token = meta.get("google_maps_widget_context_token") or meta.get("googleMapsWidgetContextToken")
                        logger.debug("Found widget_token via dict access")
    except Exception as e:
        logger.warning("Error extracting widget_token: %s", e, exc_info=True)

    if widget_token:
        logger.info("Maps grounding: widget_token present (len=%d)", len(widget_token))
    else:
        logger.info("Maps grounding: no widget_token found")

    return {"reply": reply, "widget_token": widget_token}
