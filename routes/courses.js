const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { Course, Enrollment, User } = require('../models');
const { protect, authorize, checkCourseOwnership } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { Op } = require('sequelize');

// @route   GET /api/courses
router.get('/', async (req, res, next) => {
  try {
    const { category, level, search, sort = 'created_at', order = 'DESC', limit = 10, page = 1 } = req.query;
    
    const where = { status: 'published' };
    
    if (category) where.category = category;
    if (level) where.level = level;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: courses } = await Course.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'instructor',
        attributes: ['id', 'name', 'avatar', 'email']
      }],
      order: [[sort, order]],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      count: courses.length,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / parseInt(limit)),
      data: courses
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/courses/:id
router.get('/:id', async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'instructor',
        attributes: ['id', 'name', 'avatar', 'email', 'bio']
      }]
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    let enrollmentStatus = null;
    if (req.headers.authorization) {
      const jwt = require('jsonwebtoken');
      const token = req.headers.authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const enrollment = await Enrollment.findOne({
          where: {
            user_id: decoded.id,
            course_id: course.id
          }
        });
        if (enrollment) {
          enrollmentStatus = {
            enrolled: true,
            progress: parseFloat(enrollment.progress),
            status: enrollment.status
          };
        }
      } catch (err) {
        // Invalid token
      }
    }

    res.json({
      success: true,
      data: course,
      enrollmentStatus
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/courses
router.post('/',
  protect,
  authorize('instructor', 'admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('level').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level')
  ],
  validate,
  async (req, res, next) => {
    try {
      const courseData = {
        ...req.body,
        instructor_id: req.user.id
      };

      const course = await Course.create(courseData);
      
      await req.user.addBadge({
        name: 'Course Creator',
        icon: '📚',
        description: 'Created your first course',
        category: 'achievement'
      });

      res.status(201).json({
        success: true,
        data: course
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/courses/:id
router.put('/:id',
  protect,
  authorize('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const course = await Course.findByPk(req.params.id);
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      if (req.user.role === 'instructor' && course.instructor_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      await course.update(req.body);
      
      await course.reload({
        include: [{
          model: User,
          as: 'instructor',
          attributes: ['name', 'email']
        }]
      });

      res.json({
        success: true,
        data: course
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/courses/:id
router.delete('/:id',
  protect,
  authorize('instructor', 'admin'),
  async (req, res, next) => {
    try {
      const course = await Course.findByPk(req.params.id);
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      if (req.user.role === 'instructor' && course.instructor_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      await Enrollment.destroy({ where: { course_id: req.params.id } });
      await course.destroy();

      res.json({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
