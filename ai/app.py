import json
import os
import random

from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

CORS(app, origins=[
    "http://localhost:8080",
    "https://aminsalarvand.github.io"
])

MOODS_FILE = Path(__file__).with_name("moods.json")

with MOODS_FILE.open("r", encoding="utf-8") as file:
    MOOD_KEYWORDS = json.load(file)


@app.route("/")
def health():
    return jsonify({
        "status": "ok"
    })


@app.route("/api/mood", methods=["POST"])
def detect_mood():
    data = request.get_json(silent=True) or {}

    text = data.get("text", "")

    if not isinstance(text, str):
        return jsonify({
            "error": "Text must be a string"
        }), 400

    text = text.lower().strip()

    if not text:
        return jsonify({
            "error": "Text cannot be empty"
        }), 400

    mood = None

    for current_mood, keywords in MOOD_KEYWORDS.items():
        if any(word in text for word in keywords):
            mood = current_mood
            break

    if mood is None:
        mood = random.choice(list(MOOD_KEYWORDS.keys()))

    return jsonify({
        "mood": mood
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )