import { Router } from 'express';
import { storage, verifyPassword } from '../storage.js';
import { AuthenticatedRequest, requireAuth } from '../auth.js';
import {
  createPostgresSession,
  createPostgresUser,
  deletePostgresSession,
  getPostgresPool,
  getPostgresUserByEmail
} from '../postgres.js';

const router = Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, acceptTerms } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Work email is required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }
    if (!acceptTerms) {
      return res.status(400).json({ error: 'You must accept the terms of service.' });
    }

    const postgresPool = getPostgresPool();
    if (!postgresPool && process.env.VERCEL) {
      return res.status(503).json({ error: 'Authentication database is not configured. Set DATABASE_URL in Vercel Project Settings.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = postgresPool
      ? await getPostgresUserByEmail(normalizedEmail)
      : storage.getUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const newUser = postgresPool
      ? await createPostgresUser(name.trim(), normalizedEmail, password)
      : storage.createUser(name.trim(), normalizedEmail, password);
    const session = postgresPool
      ? await createPostgresSession(newUser.id, 7 * 24 * 60 * 60 * 1000)
      : storage.createSession(newUser.id);

    res.cookie('recruitai_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    storage.logActivity(newUser.id, 'job_created', 'Account Created', `Workspace initialized for ${newUser.name}`, newUser.name);

    return res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      token: session.token
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error during registration.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const postgresPool = getPostgresPool();
    if (!postgresPool && process.env.VERCEL) {
      return res.status(503).json({ error: 'Authentication database is not configured. Set DATABASE_URL in Vercel Project Settings.' });
    }

    const user = postgresPool
      ? await getPostgresUserByEmail(email.trim().toLowerCase())
      : storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = verifyPassword(password, user.salt, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    const session = postgresPool
      ? await createPostgresSession(user.id, maxAge)
      : storage.createSession(user.id, maxAge);

    res.cookie('recruitai_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge
    });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: session.token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error during login.' });
  }
});

// Get Current User
router.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  return res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Logout
router.post('/logout', async (req: AuthenticatedRequest, res) => {
  const token = req.cookies?.recruitai_session || req.sessionToken;
  try {
    if (token) {
      if (getPostgresPool()) {
        await deletePostgresSession(token);
      } else {
        storage.deleteSession(token);
      }
    }
    res.clearCookie('recruitai_session');
    return res.json({ success: true, message: 'Successfully signed out.' });
  } catch (error) {
    console.error('Logout error:', error);
    res.clearCookie('recruitai_session');
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error during logout.' });
  }
});

// Forgot Password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  // Consistent generic response to prevent email enumeration
  return res.json({
    success: true,
    message: 'If an account exists for this email address, password reset instructions have been dispatched.'
  });
});

export default router;
