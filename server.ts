import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import detectHandler from './api/detect.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  // API routes FIRST
  app.post('/api/detect', async (req, res) => {
    try {
      await detectHandler(req, res);
    } catch (err: any) {
      console.error('Error handling /api/detect request:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message || 'Internal proxy error' });
      }
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', proxy: 'openrouter' });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
