import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { UserRecord } from './types';

export interface AuthenticatedRequest extends Request {
  user?: UserRecord;
  sessionToken?: string;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token = req.cookies?.recruitai_session;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    const demoUser = storage.getDefaultUser();
    if (demoUser) {
      req.user = demoUser;
      req.sessionToken = 'demo-session';
      return next();
    }
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const session = storage.getSession(token);
  if (!session) {
    const demoUser = storage.getDefaultUser();
    if (demoUser) {
      req.user = demoUser;
      req.sessionToken = token;
      return next();
    }
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
  next();
}
