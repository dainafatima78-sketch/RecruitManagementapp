import { Request, Response, NextFunction } from 'express';
import { storage } from './storage.js';
import { UserRecord } from './types.js';
import { getPostgresPool, getPostgresSession } from './postgres.js';

export interface AuthenticatedRequest extends Request {
  user?: UserRecord;
  sessionToken?: string;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token = req.cookies?.recruitai_session;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  try {
    const postgresPool = getPostgresPool();
    if (!postgresPool && process.env.VERCEL) {
      return res.status(503).json({ error: 'Authentication database is not configured. Set DATABASE_URL in Vercel Project Settings.' });
    }

    if (postgresPool) {
      const auth = await getPostgresSession(token);
      if (!auth) {
        res.clearCookie('recruitai_session');
        return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
      }

      req.user = auth.user;
      req.sessionToken = token;
      return next();
    }

    const session = storage.getSession(token);
    if (!session) {
      res.clearCookie('recruitai_session');
      return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
    }

    const user = storage.getUserById(session.userId);
    if (!user) {
      storage.deleteSession(token);
      res.clearCookie('recruitai_session');
      return res.status(401).json({ error: 'User account not found.' });
    }

    req.user = user;
    req.sessionToken = token;
    return next();
  } catch (error) {
    console.error('Authentication lookup error:', error);
    return res.status(500).json({ error: 'Authentication service is unavailable.' });
  }
}
