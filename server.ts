import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { UPLOADS_DIR } from './server/db';
import aiRoutes from './server/routes/aiRoutes';
import authRoutes from './server/routes/authRoutes';
import communityRoutes from './server/routes/communityRoutes';
import courseRoutes from './server/routes/courseRoutes';
import courseTutorRoutes from './server/routes/courseTutorRoutes';
import dashboardRoutes from './server/routes/dashboardRoutes';
import learningRoutes from './server/routes/learningRoutes';
import notificationRoutes from './server/routes/notificationRoutes';
import platformRoutes from './server/routes/platformRoutes';
import questionGeneratorRoutes from './server/routes/questionGeneratorRoutes';
import finalExamRoutes from './server/routes/finalExamRoutes';
import { attachWebSocketHub } from './server/wsHub';

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/uploads', express.static(UPLOADS_DIR));

  app.use('/api', authRoutes);
  app.use('/api', courseRoutes);
  app.use('/api', courseTutorRoutes);
  app.use('/api', questionGeneratorRoutes);
  app.use('/api', finalExamRoutes);
  app.use('/api', dashboardRoutes);
  app.use('/api', learningRoutes);
  app.use('/api', communityRoutes);
  app.use('/api', platformRoutes);
  app.use('/api', notificationRoutes);
  app.use('/api', aiRoutes);

  attachWebSocketHub(httpServer);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Mafia platform server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
