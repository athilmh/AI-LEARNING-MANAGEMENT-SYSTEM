const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Progress = sequelize.define('Progress', {
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
  module_id: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  content_id: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  
  // Progress tracking
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  score: {
    type: DataTypes.DECIMAL(5, 2)
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  time_spent: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Time spent in seconds'
  },
  
  // Quiz/Assignment specific
  answers: {
    type: DataTypes.JSON
  },
  feedback: {
    type: DataTypes.TEXT
  },
  
  // AI insights
  struggling_areas: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  recommended_review: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  
  last_accessed: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'progress',
  indexes: [
    {
      fields: ['user_id', 'course_id']
    },
    {
      fields: ['user_id', 'course_id', 'module_id', 'content_id']
    }
  ]
});

module.exports = Progress;
