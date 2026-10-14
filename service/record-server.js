const express = require("express");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const app = express();
const PORT = 3001;
const RECORD_DIR = path.join(os.homedir(), "Projects", "record");

app.use(express.json());

const STREAMS = {
    varzesh: "http://s6.cdn3.iranseda.ir:1935/liveedge/radio-varzesh/chunklist_w83714761.m3u8",
    javan: "http://s6.cdn3.iranseda.ir:1935/liveedge/radio-javan/chunklist_w9784270.m3u8",
    ava: "http://s2.cdn1.iranseda.ir:1935/liveedge/radio-avaa/chunklist_w903692364.m3u8"
};

let recording = null;

app.get("/", (req, res) => {
    res.json({ status: "record server ok", recording: Boolean(recording) });
});

app.post("/record/start", (req, res) => {
    if (recording) {
        return res.status(409).json({ error: "A recording is already running." });
    }

    const station = req.body.station;
    const streamUrl = STREAMS[station];

    if (!streamUrl) {
        return res.status(400).json({ error: "Unknown station." });
    }

    fs.mkdirSync(RECORD_DIR, { recursive: true });

    const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-");

    const outputPath = path.join(RECORD_DIR, `${station}-${timestamp}.mp3`);

    const ffmpeg = spawn("ffmpeg", [
        "-hide_banner",
        "-loglevel", "warning",
        "-y",
        "-i", streamUrl,
        "-vn",
        "-c:a", "libmp3lame",
        "-b:a", "128k",
        "-content_type", "audio/mpeg",
        outputPath
    ]);

    recording = {
        station,
        outputPath,
        process: ffmpeg,
        startedAt: new Date().toISOString()
    };

    ffmpeg.on("error", (error) => {
        console.error("FFmpeg failed:", error.message);
        if (recording?.process === ffmpeg) recording = null;
    });

    ffmpeg.on("close", (code) => {
        console.log(`FFmpeg exited with code ${code}`);
        if (recording?.process === ffmpeg) recording = null;
    });

    res.json({
        status: "recording_started",
        station,
        file: outputPath
    });
});

app.post("/record/stop", (req, res) => {
    if (!recording) {
        return res.status(409).json({ error: "No recording is running." });
    }

    const active = recording;
    recording = null;

    active.process.once("close", (code) => {
        const exists = fs.existsSync(active.outputPath);
        const size = exists ? fs.statSync(active.outputPath).size : 0;

        res.json({
            status: "recording_stopped",
            station: active.station,
            file: active.outputPath,
            size,
            ffmpegExitCode: code
        });
    });

    active.process.kill("SIGINT");
});

app.get("/record/status", (req, res) => {
    res.json({
        recording: Boolean(recording),
        station: recording?.station ?? null,
        startedAt: recording?.startedAt ?? null
    });
});

app.listen(PORT, "127.0.0.1", () => {
    console.log(`Recording server running at http://127.0.0.1:${PORT}`);
});