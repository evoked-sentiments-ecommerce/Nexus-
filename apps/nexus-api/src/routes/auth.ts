import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';
import { generateToken, generateRefreshToken } from '../services/jwtService';
import { comparePassword, validatePasswordStrength } from '../services/passwordService';

export const authRouter = Router();
const userRepository = AppDataSource.getRepository(User);

// Register endpoint
authRouter.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('name').notEmpty().trim(),
    body('password').isLength({ min: 8 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, name, password } = req.body;

      // Check password strength
      const passwordCheck = validatePasswordStrength(password);
      if (!passwordCheck.valid) {
        return res.status(400).json({ error: 'Password does not meet requirements', details: passwordCheck.errors });
      }

      // Check if user already exists
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      // Create new user
      const user = userRepository.create({ email, name, password });
      await userRepository.save(user);

      const token = generateToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

      res.status(201).json({
        message: 'User registered successfully',
        user: { id: user.id, email: user.email, name: user.name },
        token,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Login endpoint
authRouter.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await userRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = generateToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

      res.json({
        message: 'Login successful',
        user: { id: user.id, email: user.email, name: user.name },
        token,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get current user endpoint
authRouter.get('/me', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await userRepository.findOne({ where: { id: req.user.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
    });
  } catch (error) {
    next(error);
  }
});

// Logout endpoint (client-side token removal)
authRouter.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logout successful' });
});
