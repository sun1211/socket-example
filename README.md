# Socket.IO Demo

A simple real-time chat application demonstrating Socket.IO with a standalone HTML client and Node.js server.

## Features

- **Real-time messaging** - Instant chat between multiple clients
- **Typing indicators** - See when others are typing
- **Connection status** - Visual connection state indicators
- **Custom events** - Send and receive custom Socket.IO events
- **Responsive design** - Works on desktop and mobile
- **Sound notifications** - Audio alerts for new messages

## Quick Start

### 1. Start the Server

```bash
# Install dependencies
npm install

# Run the server
npm start
```

The server will start on `http://localhost:3000`

### 2. Open the Client

Simply open `index.html` in your web browser. The client will automatically connect to `http://localhost:3000`.

## Usage

1. **Connect** - Click the "Connect" button to establish connection
2. **Chat** - Type messages and press Enter or click Send
3. **Custom Events** - Use the "Custom Event" button to test custom Socket.IO events
4. **Disconnect** - Use the "Disconnect" button to close the connection

## Server Events

The server handles these Socket.IO events:

- `chat message` - Broadcasts messages to all clients
- `typing` - Shows typing indicators to other users
- `custom event` - Processes custom data and responds
- `private message` - Sends direct messages between users

## Client Features

- **Auto-reconnection** - Automatically reconnects on connection loss
- **Message history** - Scrollable chat history
- **Typing detection** - Shows when users are typing
- **Connection info** - Displays Socket ID and connection status

## Customization

- Change server URL in the client interface
- Modify styling in the HTML file
- Add new Socket.IO events in `server.ts`
- Customize message handling and UI behavior

## Requirements

- Node.js (for server)
- Modern web browser (for client)
- Socket.IO v4.7.5+

## Architecture

- **Client**: Standalone HTML file with Socket.IO client library
- **Server**: Express.js + Socket.IO server with TypeScript
- **Communication**: WebSocket with polling fallback