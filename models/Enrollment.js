const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'completed', 'dropped', 'suspended'),
    defaultValue: 'pending'
  },
  progress: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  completed_modules: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of completed module IDs'
  },

  // Time tracking
  time_spent: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Time spent in seconds'
  },
  last_accessed: {
    type: DataTypes.DATE
  },

  // Performance
  average_score: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  quizzes_taken: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  quizzes_passed: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  // Dates
  enrolled_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  completed_at: {
    type: DataTypes.DATE
  },

  // Certificate
  certificate_url: {
    type: DataTypes.STRING(255)
  },
  certificate_issued: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'enrollments',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'course_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['course_id']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Enrollment;