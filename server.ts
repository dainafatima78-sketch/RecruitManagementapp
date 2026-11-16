import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './src/server/routes/authRoutes';
import jobRoutes from './src/server/routes/jobRoutes';
import candidateRoutes from './src/server/routes/candidateRoutes';
import matchingRoutes from './src/server/routes/matchingRoutes';
import interviewRoutes from './src/server/routes/interviewRoutes';
import dashboardRoutes from './src/server/routes/dashboardRoutes';
import aiAssistantRoutes from './src/server/routes/aiAssistantRoutes';
import teamRoutes from './src/server/routes/teamRoutes';
import { initializePostgresDatabase } from './src/server/postgres';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Dynamic CORS configuration supporting Vercel previews & production domain
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  process.env.APP_URL
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost')
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for API consumers while supporting credentials
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Ensure all /api responses default to application/json
app.use('/api', (_req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// REST API routes with primary and singular aliases
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/match', matchingRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiAssistantRoutes);
app.use('/api/team', teamRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Catch-all for unhandled /api/* routes to prevent them from falling through to Vite index.html
app.all(['/api', '/api/*'], (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(404).json({
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// Express error-handling middleware for /api routes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled API Server Error:', err);
  if (req.path.startsWith('/api') || req.url.startsWith('/api')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(err.status || err.statusCode || 500).json({
      error: err.message || 'Internal Server Error'
    });
  }
  next(err);
});

// Setup Vite or static serving
async function startServer() {
  // Initialize PostgreSQL database if connection string provided
  await initializePostgresDatabase();

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RecruitAI server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
