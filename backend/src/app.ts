import express, { Express } from 'express';
import cors from 'cors';
import pollRoutes from './routes/poll.routes';

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/polls', pollRoutes);

  // 404 handler - MUST be last
  app.use((req, res) => {
    console.warn(`❌ 404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({ error: 'Route not found', path: req.path, method: req.method });
  });

  // Error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('❌ Server error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  });

  return app;
};
