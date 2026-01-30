"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = require("./app");
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const poll_socket_1 = require("./sockets/poll.socket");
const startServer = async () => {
    try {
        console.log('🔧 Initializing Live Polling System...');
        // Connect to MongoDB
        console.log('📦 Connecting to MongoDB...');
        await (0, db_1.connectDB)();
        // Create Express app
        console.log('🎯 Creating Express application...');
        const app = (0, app_1.createApp)();
        // Create HTTP server
        const server = http_1.default.createServer(app);
        // Initialize Socket.io
        console.log('⚡ Initializing Socket.io...');
        const io = new socket_io_1.Server(server, {
            cors: {
                origin: 'http://localhost:5173',
                methods: ['GET', 'POST'],
            },
        });
        // Setup socket handlers
        (0, poll_socket_1.setupPollSocket)(io);
        // Start server
        server.listen(env_1.config.PORT, () => {
            console.log(`\n${'='.repeat(50)}`);
            console.log(`✅ SERVER READY`);
            console.log(`${'='.repeat(50)}`);
            console.log(`🚀 API Server: http://localhost:${env_1.config.PORT}`);
            console.log(`📡 WebSocket: ws://localhost:${env_1.config.PORT}`);
            console.log(`🌐 Frontend: http://localhost:5173`);
            console.log(`📚 Health Check: http://localhost:${env_1.config.PORT}/health`);
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
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
