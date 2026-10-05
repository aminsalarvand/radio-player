from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

CORS(app, origins=[
    "http://localhost:8080",
    "https://aminsalarvand.github.io"
])


@app.route("/api/mood", methods=["POST"])
def detect_mood():
    data = request.get_json() or {}

    text = data.get("text", "").lower()

    if any(word in text for word in [
        "happy",
        "joy",
        "good",
        "great",
        "excited",
        "energetic",
        "cheerful"
    ]):
        mood = "happy"

    elif any(word in text for word in [
        "sad",
        "unhappy",
        "depressed",
        "upset",
        "lonely",
        "down"
    ]):
        mood = "sad"

    elif any(word in text for word in [
        "calm",
        "relaxed",
        "peaceful",
        "quiet",
        "stress",
        "stressed"
    ]):
        mood = "calm"

    else:
        mood = "neutral"

    return jsonify({
        "mood": mood
    })


if __name__ == "__main__":
    import os

    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )