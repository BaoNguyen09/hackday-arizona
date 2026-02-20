#!/usr/bin/env python3
"""
Verify that POST /chat returns a reply and (when Maps grounding is used) a non-null widget_token.
Run with backend server up: uvicorn main:app --reload
Usage: python verify_grounding.py [base_url]
"""

import json
import sys
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000"


def main():
    url = f"{BASE}/chat"
    body = json.dumps({
        "message": "Best tacos near University of Arizona?",
        "lat": 32.2319,
        "lng": -110.9501,
        "history": [],
    }).encode("utf-8")
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode() if e.fp else ""
        print(f"HTTP {e.code}: {body}")
        return 1
    except Exception as e:
        print(f"Request failed: {e}")
        return 1

    reply = data.get("reply", "")
    widget_token = data.get("widget_token")

    print("Reply (first 300 chars):")
    print(reply[:300] + ("..." if len(reply) > 300 else ""))
    print()
    if widget_token:
        print("Maps grounding: OK — widget_token is present (length %d)" % len(widget_token))
        print("Frontend can use this token to render the Maps widget.")
    else:
        print("Maps grounding: no widget_token in this response.")
        print("(Normal if the model did not ground in places, or if the API did not return one.)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
