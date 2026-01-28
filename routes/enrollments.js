const express = require('express');
const router = express.Router();
const { Enrollment, Course, User } = require('../models');
const { protect } = require('../middleware/auth');

// @route   POST /api/enrollments
router.post('/', protect, async (req, res, next) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const existingEnrollment = await Enrollment.findOne({
      where: {
        user_id: req.user.id,
        course_id: courseId
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    const enrollment = await Enrollment.create({
      user_id: req.user.id,
      course_id: courseId
    });

    course.enrollment_count += 1;
    await course.save();

    const userEnrollments = await Enrollment.count({ where: { user_id: req.user.id } });
    if (userEnrollments === 1) {
      await req.user.addBadge({
        name: 'First Steps',
        icon: '🎓',
        description: 'Enrolled in your first course',
        category: 'milestone'
      });
    }

    res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/enrollments/my
router.get('/my', protect, async (req, res, next) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: Course,
        as: 'course',
        attributes: ['id', 'title', 'description', 'thumbnail', 'duration', 'category', 'level']
      }],
      order: [['enrolled_at', 'DESC']]
    });

    res.json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/enrollments/:id/progress
router.put('/:id/progress', protect, async (req, res, next) => {
  try {
    const { moduleId, progress } = req.body;
    
    const enrollment = await Enrollment.findByPk(req.params.id);
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    if (enrollment.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (moduleId) {
      const completedModules = enrollment.completed_modules || [];
      if (!completedModules.includes(moduleId)) {
        completedModules.push(moduleId);
        enrollment.completed_modules = completedModules;
      }
    }
    
    if (progress !== undefined) {
      enrollment.progress = progress;
    }

    enrollment.last_accessed = new Date();
    await enrollment.save();

    if (enrollment.progress >= 100 && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.completed_at = new Date();
      await enrollment.save();

      await req.user.addPoints(500);
      await req.user.addBadge({
        name: 'Course Complete',
        icon: '🏆',
        description: 'Completed a course',
        category: 'achievement'
      });

      req.user.courses_completed += 1;
      await req.user.save();
    }

    res.json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;