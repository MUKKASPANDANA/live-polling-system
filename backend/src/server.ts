import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app';
import { connectDB } from './config/db';
import { config } from './config/env';
import { setupPollSocket } from './sockets/poll.socket';

const startServer = async () => {
  try {
    console.log('🔧 Initializing Live Polling System...');
    
    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await connectDB();

    // Create Express app
    console.log('🎯 Creating Express application...');
    const app = createApp();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.io
    console.log('⚡ Initializing Socket.io...');
    const io = new Server(server, {
      cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
      },
    });

    // Setup socket handlers
    setupPollSocket(io);

    // Start server
    server.listen(config.PORT, () => {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`✅ SERVER READY`);
      console.log(`${'='.repeat(50)}`);
      console.log(`🚀 API Server: http://localhost:${config.PORT}`);
      console.log(`📡 WebSocket: ws://localhost:${config.PORT}`);
      console.log(`🌐 Frontend: http://localhost:5173`);
      console.log(`📚 Health Check: http://localhost:${config.PORT}/health`);
      console.log(`${'='.repeat(50)}\n`);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n⛔ Shutting down...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
