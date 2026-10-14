const http = require("http");
const { spawn } = require("child_process");

const PORT = 3002;

const STREAMS = {
  "/live.mp3":
    "http://s2.cdn3.iranseda.ir:1935/liveedge/radio-avaa/chunklist_w1690798985.m3u8",

  "/varzesh.mp3":
    "http://s6.cdn3.iranseda.ir:1935/liveedge/radio-varzesh/chunklist_w83714761.m3u8",

  "/javan.mp3":
    "http://s6.cdn3.iranseda.ir:1935/liveedge/radio-javan/chunklist_w9784270.m3u8"
};

const server = http.createServer((req, res) => {
  const streamUrl = STREAMS[req.url];

  if (!streamUrl) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  res.writeHead(200, {
    "Content-Type": "audio/mpeg",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*"
  });

  const ffmpeg = spawn("ffmpeg", [
    "-hide_banner",
    "-loglevel", "warning",
    "-i", streamUrl,
    "-vn",
    "-c:a", "libmp3lame",
    "-b:a", "128k",
    "-f", "mp3",
    "pipe:1"
  ]);

  ffmpeg.stdout.pipe(res);

  ffmpeg.stderr.on("data", (data) => {
    process.stderr.write(data);
  });

  const stop = () => {
    if (!ffmpeg.killed) {
      ffmpeg.kill("SIGTERM");
    }
  };

  req.on("close", stop);
  res.on("close", stop);

  ffmpeg.on("error", (error) => {
    console.error("FFmpeg error:", error.message);
    if (!res.writableEnded) res.destroy(error);
  });

  ffmpeg.on("close", (code) => {
    console.log("FFmpeg exited:", code);
    if (!res.writableEnded) res.end();
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`MP3 stream server: http://127.0.0.1:${PORT}`);
});