const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { User } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/',
    protect,
    authorize('admin'),
    async (req, res, next) => {
        try {
            const users = await User.findAll({
                attributes: { exclude: ['password'] }
            });

            res.json({
                success: true,
                count: users.length,
                data: users
            });
        } catch (error) {
            next(error);
        }
    });

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private
router.get('/:id',
    protect,
    async (req, res, next) => {
        try {
            const user = await User.findByPk(req.params.id, {
                attributes: { exclude: ['password'] }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    });

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id',
    protect,
    [
        body('name').optional().notEmpty().withMessage('Name cannot be empty'),
        body('email').optional().isEmail().withMessage('Please include a valid email'),
        body('role').optional().isIn(['student', 'instructor', 'admin']).withMessage('Invalid role')
    ],
    validate,
    async (req, res, next) => {
        try {
            const user = await User.findByPk(req.params.id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Check if user is admin or updating own profile
            if (req.user.role !== 'admin' && req.user.id !== user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to update this profile'
                });
            }

            // If changing role, must be admin
            if (req.body.role && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to change role'
                });
            }

            const { name, email, role } = req.body;
            const updateFields = {};
            if (name) updateFields.name = name;
            if (email) updateFields.email = email;
            if (role) updateFields.role = role;

            await user.update(updateFields);

            res.json({
                success: true,
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id',
    protect,
    authorize('admin'),
    async (req, res, next) => {
        try {
            const user = await User.findByPk(req.params.id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            await user.destroy();

            res.json({
                success: true,
                message: 'User deleted'
            });
        } catch (error) {
            next(error);
        }
    });

// @route   PATCH /api/users/:id/status
// @desc    Approve or reject student
// @access  Private (Admin, Instructor)
router.patch('/:id/status',
    protect,
    authorize('admin', 'instructor'),
    async (req, res, next) => {
        try {
            const { status } = req.body;
            if (!['active', 'rejected'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status'
                });
            }

            const user = await User.findByPk(req.params.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User found'
                });
            }

            await user.update({ status });

            res.json({
                success: true,
                data: {
                    id: user.id,
                    name: user.name,
                    status: user.status
                }
            });
        } catch (error) {
            next(error);
        }
    });

module.exports = router;
