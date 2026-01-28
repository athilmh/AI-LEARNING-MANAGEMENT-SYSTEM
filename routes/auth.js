const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { validate } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @route   POST /api/auth/register
router.post('/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['student', 'instructor', 'admin']).withMessage('Invalid role')
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role || 'student',
        status: (role === 'admin' || role === 'instructor') ? 'active' : 'pending'
      });

      await user.addBadge({
        name: 'Welcome',
        icon: '🎉',
        description: 'Joined the platform',
        category: 'milestone'
      });

      const token = generateToken(user.id);

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          points: user.points,
          level: user.level
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

const { sequelize } = require('../config/database');

// @route   POST /api/auth/login
router.post('/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      console.log(`Login attempt for: ${email}`);

      const user = await User.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('email')),
          sequelize.fn('LOWER', email)
        )
      });

      if (!user) {
        console.log(`Login failed: User with email ${email} not found`);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      console.log(`User found: ${user.email}, Status: ${user.status}, Role: ${user.role}`);

      if (user.status !== 'active') {
        console.log(`Login failed: User status is ${user.status}`);
        return res.status(403).json({
          success: false,
          message: user.status === 'pending'
            ? 'Account is pending approval'
            : 'Account is inactive. Please contact administrator'
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        console.log(`❌ Login failed: Password mismatch for ${email}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      console.log(`✅ Login successful for: ${email} (${user.role})`);
      user.last_login = new Date();
      await user.save();

      const token = generateToken(user.id);

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          points: user.points,
          level: user.level,
          avatar: user.avatar
        }
      });
    } catch (error) {
      console.error('🔥 Login Error:', error);
      next(error);
    }
  }
);

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// @route   PUT /api/auth/updateprofile
router.put('/updateprofile',
  protect,
  [
    body('name').optional().trim().notEmpty(),
    body('bio').optional().trim(),
    body('phone').optional().trim()
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, bio, phone, avatar, department } = req.body;

      const updateFields = {};
      if (name) updateFields.name = name;
      if (bio) updateFields.bio = bio;
      if (phone) updateFields.phone = phone;
      if (avatar) updateFields.avatar = avatar;
      if (department) updateFields.department = department;

      await req.user.update(updateFields);

      res.json({
        success: true,
        user: req.user
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/auth/preferences
router.put('/preferences', protect, async (req, res, next) => {
  try {
    const { pace, difficulty, preferredTopics, learningStyle } = req.body;

    const preferences = req.user.learning_preferences || {};

    if (pace) preferences.pace = pace;
    if (difficulty) preferences.difficulty = difficulty;
    if (preferredTopics) preferences.preferred_topics = preferredTopics;
    if (learningStyle) preferences.learning_style = learningStyle;

    await req.user.update({ learning_preferences: preferences });

    res.json({
      success: true,
      message: 'Learning preferences updated',
      preferences: req.user.learning_preferences
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
