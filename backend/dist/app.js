"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const poll_routes_1 = __importDefault(require("./routes/poll.routes"));
const createApp = () => {
    const app = (0, express_1.default)();
    // Middleware
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });
    // API Routes
    app.use('/api/polls', poll_routes_1.default);
    // 404 handler - MUST be last
    app.use((req, res) => {
        console.warn(`❌ 404 - Route not found: ${req.method} ${req.path}`);
        res.status(404).json({ error: 'Route not found', path: req.path, method: req.method });
    });
    // Error handler
    app.use((err, req, res, next) => {
        console.error('❌ Server error:', err);
        res.status(500).json({ error: 'Internal server error', message: err.message });
    });
    return app;
};
exports.createApp = createApp;
