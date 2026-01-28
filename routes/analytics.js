const express = require('express');
const router = express.Router();
const { User, Enrollment, Course } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { sequelize } = require('../config/database');

// @route   GET /api/analytics/students
// @desc    Get all students with their progress overview
// @access  Private (Admin, Instructor)
router.get('/students',
    protect,
    authorize('admin', 'instructor'),
    async (req, res, next) => {
        try {
            const students = await User.findAll({
                where: { role: 'student' },
                attributes: ['id', 'name', 'email', 'avatar', 'points', 'level', 'status', 'last_login'],
                include: [
                    {
                        model: Enrollment,
                        as: 'enrollments',
                        attributes: ['progress', 'status', 'last_accessed'],
                        include: [{ model: Course, as: 'course', attributes: ['title'] }]
                    }
                ],
                order: [['points', 'DESC']]
            });

            // Transform data for the dashboard
            const studentData = students.map(student => {
                const enrollments = student.enrollments || [];
                const avgProgress = enrollments.length > 0
                    ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
                    : 0;

                return {
                    id: student.id,
                    name: student.name,
                    email: student.email,
                    avatar: student.avatar,
                    points: student.points,
                    level: student.level,
                    status: student.status,
                    lastLogin: student.last_login,
                    coursesEnrolled: enrollments.length,
                    averageProgress: avgProgress,
                    status: student.status,
                    enrollments: enrollments.map(e => ({
                        id: e.id,
                        status: e.status,
                        progress: e.progress,
                        courseTitle: e.course?.title
                    })),
                    topCourse: enrollments.length > 0
                        ? enrollments.sort((a, b) => b.progress - a.progress)[0].course?.title
                        : 'None'
                };
            });

            res.json({
                success: true,
                count: studentData.length,
                data: studentData
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   GET /api/analytics/progress/:userId
// @desc    Get detailed progress for a specific student
// @access  Private (Admin, Instructor)
router.get('/progress/:userId',
    protect,
    authorize('admin', 'instructor'),
    async (req, res, next) => {
        try {
            const enrollments = await Enrollment.findAll({
                where: { user_id: req.params.userId },
                include: [{ model: Course, as: 'course', attributes: ['title', 'category'] }]
            });

            res.json({
                success: true,
                data: enrollments
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   GET /api/analytics/public-stats
// @desc    Get aggregate stats for landing page
// @access  Public
router.get('/public-stats', async (req, res, next) => {
    try {
        const studentCount = await User.count({ where: { role: 'student' } });
        const totalPoints = await User.sum('points', { where: { role: 'student' } }) || 0;

        const instructors = await User.findAll({
            where: { role: 'instructor' },
            attributes: ['name', 'bio', 'avatar', 'department']
        });

        res.json({
            success: true,
            data: {
                studentCount,
                totalPoints,
                instructors: instructors.map(i => ({
                    name: i.name,
                    specialty: i.department || 'Expert Instructor',
                    bio: i.bio || 'Industry professional with years of experience.'
                }))
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
