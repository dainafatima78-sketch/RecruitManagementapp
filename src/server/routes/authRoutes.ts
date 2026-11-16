import { Router } from 'express';
import { storage, verifyPassword } from '../storage';
import { AuthenticatedRequest, requireAuth } from '../auth';

const router = Router();

// Register
router.post('/register', (req, res) => {
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

    const existingUser = storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const newUser = storage.createUser(name.trim(), email.trim(), password);
    const session = storage.createSession(newUser.id);

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
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: error.message || 'Server error during registration.' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = verifyPassword(password, user.salt, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const session = storage.createSession(user.id);
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

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
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message || 'Server error during login.' });
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
router.post('/logout', (req: AuthenticatedRequest, res) => {
  const token = req.cookies?.recruitai_session || req.sessionToken;
  if (token) {
    storage.deleteSession(token);
  }
  res.clearCookie('recruitai_session');
  return res.json({ success: true, message: 'Successfully signed out.' });
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
