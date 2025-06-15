# Socket.IO Guide

A comprehensive guide covering essential Socket.IO concepts, implementation patterns, and best practices for real-time communication.

## Table of Contents

1. [What is Socket.IO and how does it differ from WebSockets?](#1-what-is-socketio-and-how-does-it-differ-from-websockets)
2. [What are the main Socket.IO events?](#2-what-are-the-main-socketio-events)
3. [How do you emit and listen to events in Socket.IO?](#3-how-do-you-emit-and-listen-to-events-in-socketio)
4. [Explain namespaces and rooms in Socket.IO](#4-explain-namespaces-and-rooms-in-socketio)
5. [What are rooms in Socket.IO and how do you use them?](#5-what-are-rooms-in-socketio-and-how-do-you-use-them)
6. [How to implement private messaging using Socket.IO?](#6-how-to-implement-private-messaging-using-socketio)
7. [How do you handle middleware/authentication?](#7-how-do-you-handle-middlewareauthentication)
8. [Scaling across servers — how?](#8-scaling-across-servers--how)
9. [How do you implement rate limiting?](#9-how-do-you-implement-rate-limiting)

---

## 1. What is Socket.IO and how does it differ from WebSockets?

Socket.IO is a library that enables real-time, bidirectional communication between clients and servers.
While WebSocket is a protocol

## 2. What are the main Socket.IO events?

Connection events, message events

```javascript
// Common events:
io.on('connection', (socket) => {
  // Built-in events
  socket.on('connect', () => {});
  socket.on('disconnect', () => {});
  socket.on('error', (err) => {});
  
  // Custom events
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});
```

## 3. How do you emit and listen to events in Socket.IO?

.emit() to send, .on() to listen.

```javascript
// Server
io.on('connection', socket => {
  socket.on('chat message', msg => {
    console.log('Message:', msg);
    io.emit('chat message', msg); // broadcast to all
  });
});

// Client
socket.emit('chat message', 'Hello World');
socket.on('chat message', msg => {
  console.log('Received:', msg);
});
```

## 4. Explain namespaces and rooms in Socket.IO

Namespaces allow you to split socket logic over different endpoints

```javascript
// Server
const chat = io.of('/chat');
chat.on('connection', socket => {
  console.log('Chat user connected');
  socket.emit('hello', 'Welcome to chat namespace');
});

// Client
const chatSocket = io('/chat');
chatSocket.on('hello', msg => {
  console.log(msg);
});
```

## 5. What are rooms in Socket.IO and how do you use them?

Rooms let you group sockets for targeted broadcasting.

```javascript
// Server
io.on('connection', socket => {
  socket.on('joinRoom', room => {
    socket.join(room);
    socket.to(room).emit('message', `A new user joined ${room}`);
  });

  socket.on('sendMessage', ({ room, message }) => {
    io.to(room).emit('message', message);
  });
});
```

## 6. How to implement private messaging using Socket.IO?

Use socket IDs or rooms with authentication access

```javascript
// Server
io.on('connection', socket => {
  socket.on('privateMessage', ({ to, message }) => {
    io.to(to).emit('privateMessage', message);
  });
});

// Client (send)
socket.emit('privateMessage', { to: 'socketId123', message: 'Hi there' });
```

## 7. How do you handle middleware/authentication?

### Connection Middleware
Runs when a client first connects

#### Basic Authentication Middleware

```javascript
const io = require('socket.io')(3000);
const jwt = require('jsonwebtoken');

// Connection-level middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    socket.user = {
      id: decoded.userId,
      role: decoded.role
    };
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Protected event handler
io.on('connection', (socket) => {
  console.log(`User ${socket.user.id} connected`);
  
  socket.on('private-action', (data) => {
    // Only reaches here if authentication passed
    console.log(`Action from user ${socket.user.id}`);
  });
});
```

#### Namespace Middleware
Specific to a namespace

```javascript
const adminNamespace = io.of('/admin');

adminNamespace.use((socket, next) => {
  if (!socket.user || socket.user.role !== 'admin') {
    return next(new Error('Admin access required'));
  }
  next();
});

adminNamespace.on('connection', (socket) => {
  console.log(`Admin ${socket.user.id} connected`);
});
```

#### Event Middleware
Intercepts specific events

```javascript
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

// Express-style middleware for specific events
function validateMessage(req, res, next) {
  if (!req.body.content || req.body.content.length > 1000) {
    return next(new Error('Invalid message content'));
  }
  next();
}

io.on('connection', (socket) => {
  socket.use((event, next) => {
    if (event[0] === 'send-message') {
      return wrap(validateMessage)(socket, next);
    }
    next();
  });
  
  socket.on('send-message', (message) => {
    // Only reaches here if validation passed
    io.emit('new-message', message);
  });
});
```

#### Error Handling
Proper error propagation

## 8. Scaling across servers — how?

Use Redis adapter to sync events between multiple Node instances.

```
Clients → Load Balancer → Socket.IO Servers ←→ Redis (Adapter + Pub/Sub)
```

## 9. How do you implement rate limiting?

We use Middleware or custom timestamp logic per socket.

```javascript
// Redis rate limiter example
const limiter = rateLimit({
  redis: redisClient,
  windowMs: 60000, // 1 minute
  max: 100, // 100 requests
  onThrottle: (socket) => {
    socket.emit('rate-limit', { retryIn: 60 });
    socket.disconnect();
  }
});
io.use(limiter);
```