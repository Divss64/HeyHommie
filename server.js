// server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
  socket.on('join-room', ({ name, room }, callback) => {
    socket.join(room);
    socket.data.username = name;
    socket.data.room = room;
    socket.to(room).emit('user-joined', name);
    if (typeof callback === 'function') callback();
  });

  socket.on('send', ({ room, message, timestamp }) => {
    const senderName = socket.data.username;
    if (senderName && room) {
      socket.to(room).emit('receive', {
        name: senderName,
        message,
        timestamp
      });
    }
  });

  socket.on('typing', ({ room, name }) => {
    socket.to(room).emit('show-typing', name);
  });

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
  console.log(`Server running at: http://localhost:${PORT}`);
});
