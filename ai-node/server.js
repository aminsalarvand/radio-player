const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        status: "ok"
    });
});

app.post("/api/mood", (req, res) => {
    const text = (req.body.text || "").toLowerCase();

    let mood = "neutral";

    const happyWords = [
        // English
        "happy",
        "joy",
        "good",
        "great",
        "excited",
        "energetic",
        "cheerful",

        // Persian
        "خوشحالم",
        "خوشحال",
        "شاد",
        "شادم",
        "سرحالم",
        "هیجان زده",
        "هیجان‌زده",
        "انرژی دارم",
        "عالیه",
        "عالی"
    ];

    const sadWords = [
        // English
        "sad",
        "unhappy",
        "depressed",
        "upset",
        "lonely",
        "down",

        // Persian
        "ناراحتم",
        "ناراحت",
        "غمگین",
        "غمگینم",
        "دلم گرفته",
        "حالم خوب نیست",
        "تنها هستم",
        "تنهایی",
        "بی حوصله",
        "بی‌حوصله"
    ];

    const calmWords = [
        // English
        "calm",
        "relaxed",
        "peaceful",
        "quiet",
        "stress",
        "stressed",

        // Persian
        "آرامم",
        "آرام",
        "آرومم",
        "آروم",
        "ریلکس",
        "آسوده",
        "استرس دارم",
        "استرس",
        "نگرانم",
        "نگران"
    ];

    if (happyWords.some(word => text.includes(word))) {
        mood = "happy";
    } else if (sadWords.some(word => text.includes(word))) {
        mood = "sad";
    } else if (calmWords.some(word => text.includes(word))) {
        mood = "calm";
    }

    res.json({
        mood: mood
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI server running on port ${PORT}`);
});