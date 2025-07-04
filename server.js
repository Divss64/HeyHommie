import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Socket.IO server with CORS for Netlify frontend
const io = new Server(server, {
  cors: {
    origin: "*", // You can restrict this to your Netlify domain in production
    methods: ["GET", "POST"]
  }
});

// Optional: Serve static files (if you host frontend here too)
app.use(express.static(path.join(__dirname, 'public')));

// Handle Socket.IO connections
io.on('connection', socket => {
  // Join a room
  socket.on('join-room', ({ name, room }, callback) => {
    socket.join(room);
    socket.data.username = name;
    socket.data.room = room;

    socket.to(room).emit('user-joined', name);

    if (typeof callback === 'function') {
      callback(); // Notify client of successful join
    }
  });

  // Send a message
  socket.on('send', ({ room, message }) => {
    const senderName = socket.data.username;
    if (senderName && room) {
      socket.to(room).emit('receive', {
        name: senderName,
        message
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const name = socket.data.username;
    const room = socket.data.room;
    if (name && room) {
      socket.to(room).emit('user-left', name);
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
});
