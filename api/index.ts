import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '../src/server/routes/authRoutes.js';
import jobRoutes from '../src/server/routes/jobRoutes.js';
import candidateRoutes from '../src/server/routes/candidateRoutes.js';
import matchingRoutes from '../src/server/routes/matchingRoutes.js';
import interviewRoutes from '../src/server/routes/interviewRoutes.js';
import dashboardRoutes from '../src/server/routes/dashboardRoutes.js';
import aiAssistantRoutes from '../src/server/routes/aiAssistantRoutes.js';
import teamRoutes from '../src/server/routes/teamRoutes.js';
import { initializePostgresDatabase } from '../src/server/postgres.js';

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', (_req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

let dbInitPromise: Promise<boolean> | null = null;

app.use((_req, _res, next) => {
  if (!dbInitPromise) {
    dbInitPromise = initializePostgresDatabase();
  }
  dbInitPromise.then(() => next(), next);
});

// Register routes
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

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', server: 'vercel-serverless', time: new Date().toISOString() });
});

app.all(['/api', '/api/*'], (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

export default app;

