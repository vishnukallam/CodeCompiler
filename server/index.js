const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://code-compiler-sand.vercel.app"
    ],
    methods: ["GET", "POST"]
  }
});

const cors = require("cors");

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://code-compiler-sand.vercel.app"
  ]
}));
app.use(cors());
app.use(express.json());

const { executeJava, executePython } = require('./execution');

// Health / status endpoint
app.get('/api/status', (req, res) => {
    res.json({ status: 'online', engine: 'Native Java & Python (Socket.io Enabled)' });
});

// Java Execution Endpoint (Legacy HTTP support)
app.post('/api/execute/java', async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'No code provided' });
    try {
        const result = await executeJava(code);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Socket.io for Interactivity
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    let currentProcess = null;

    socket.on('run-code', async ({ language, code }) => {
        if (!code) return socket.emit('error', 'No code provided');

        const onOutput = (data) => socket.emit('stdout', data);
        const onError = (data) => socket.emit('stderr', data);
        const onStatus = (status) => socket.emit('status', status);

        socket.emit('status', 'Initializing...');

        try {
            if (language === 'java') {
                currentProcess = await executeJava(code, { onOutput, onError, onStatus });
            } else if (language === 'python') {
                currentProcess = await executePython(code, { onOutput, onError, onStatus });
            }
        } catch (err) {
            socket.emit('stderr', `Critical Engine Error: ${err.message}`);
        }
    });

    socket.on('input', (data) => {
        if (currentProcess && currentProcess.stdin && !currentProcess.killed) {
            currentProcess.stdin.write(data);
        }
    });

    socket.on('disconnect', () => {
        if (currentProcess) {
            currentProcess.kill();
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (Socket.io ready)`);
});
