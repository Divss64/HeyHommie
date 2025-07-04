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
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
  // User joins room
  socket.on('join-room', ({ name, room }, callback) => {
    socket.join(room);
    socket.data.username = name;
    socket.data.room = room;
    socket.to(room).emit('user-joined', name);
    callback(); // Confirm join to client
  });

  // User sends message
  socket.on('send', message => {
    const senderName = socket.data.username;
    const room = socket.data.room;
    if (senderName && room) {
      socket.to(room).emit('receive', {
        name: senderName,
        message
      });
    }
  });

  // User disconnects
  socket.on('disconnect', () => {
    const name = socket.data.username;
    const room = socket.data.room;
    if (name && room) {
      socket.to(room).emit('user-left', name);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
});
