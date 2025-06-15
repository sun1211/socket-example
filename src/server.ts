import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
// import path from 'path';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Optional: Serve static files if needed
// app.use(express.static(path.join(__dirname, 'public')));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Send welcome message to the connected client
  socket.emit('message', {
    user: 'Server',
    text: 'Welcome to the chat!',
    timestamp: new Date().toISOString()
  });

  // Broadcast to all clients that a new user joined
  socket.broadcast.emit('message', {
    user: 'Server',
    text: `${socket.id} joined the chat`,
    timestamp: new Date().toISOString()
  });

  // Handle chat messages
  socket.on('chat message', (data) => {
    console.log(`Message from ${socket.id}:`, data);
    
    // Broadcast message to all connected clients
    io.emit('message', {
      user: socket.id,
      text: data.message,
      timestamp: new Date().toISOString()
    });
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.broadcast.emit('user typing', {
      user: socket.id,
      isTyping: data.isTyping
    });
  });

  // Handle custom events
  socket.on('custom event', (data) => {
    console.log('Custom event received:', data);
    socket.emit('custom response', {
      message: 'Custom event processed',
      originalData: data
    });
  });

  // Handle private messages
  socket.on('private message', (data) => {
    const { targetSocketId, message } = data;
    socket.to(targetSocketId).emit('private message', {
      from: socket.id,
      message: message,
      timestamp: new Date().toISOString()
    });
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
    
    // Broadcast to all clients that user left
    socket.broadcast.emit('message', {
      user: 'Server',
      text: `${socket.id} left the chat`,
      timestamp: new Date().toISOString()
    });
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Socket.IO server is ready for connections');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
  });
});