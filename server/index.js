javascript
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const { executeJava, executePython } = require("./execution");

const app = express();
const server = http.createServer(app);

/* -------------------- CORS CONFIG -------------------- */

const allowedOrigins = [
  "http://localhost:3000",
  "https://code-compiler-sand.vercel.app"
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  })
);

app.use(express.json());

/* -------------------- SOCKET.IO SETUP -------------------- */

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  },
  transports: ["websocket", "polling"]
});

/* -------------------- HEALTH CHECK -------------------- */

app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    engine: "Native Java & Python (Socket.io Enabled)"
  });
});

/* -------------------- HTTP EXECUTION (LEGACY) -------------------- */

app.post("/api/execute/java", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  try {
    const result = await executeJava(code);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* -------------------- SOCKET.IO CODE EXECUTION -------------------- */

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  let currentProcess = null;

  socket.on("run-code", async ({ language, code }) => {
    if (!code) {
      socket.emit("error", "No code provided");
      return;
    }

    const onOutput = (data) => socket.emit("stdout", data);
    const onError = (data) => socket.emit("stderr", data);
    const onStatus = (status) => socket.emit("status", status);

    socket.emit("status", "Initializing...");

    try {
      if (language === "java") {
        currentProcess = await executeJava(code, {
          onOutput,
          onError,
          onStatus
        });
      } 
      else if (language === "python") {
        currentProcess = await executePython(code, {
          onOutput,
          onError,
          onStatus
        });
      } 
      else {
        socket.emit("stderr", "Unsupported language");
      }

    } catch (err) {
      socket.emit("stderr", `Critical Engine Error: ${err.message}`);
    }
  });

  /* ---------- INPUT FROM TERMINAL ---------- */

  socket.on("input", (data) => {
    if (currentProcess && currentProcess.stdin && !currentProcess.killed) {
      currentProcess.stdin.write(data);
    }
  });

  /* ---------- CLIENT DISCONNECT ---------- */

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    if (currentProcess) {
      currentProcess.kill();
    }
  });
});

/* -------------------- SERVER START -------------------- */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```
