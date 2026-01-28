const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  instructor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  thumbnail: {
    type: DataTypes.STRING(255)
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner'
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  
  // Course content (stored as JSON)
  modules: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Course modules with content'
  },
  
  // Enrollment info
  enrollment_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  max_enrollments: {
    type: DataTypes.INTEGER
  },
  
  // Pricing
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft'
  },
  
  // Metadata
  duration: {
    type: DataTypes.INTEGER,
    comment: 'Duration in minutes'
  },
  language: {
    type: DataTypes.STRING(50),
    defaultValue: 'English'
  },
  
  // Ratings
  average_rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  total_reviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  // AI-related
  prerequisites: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  learning_outcomes: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  ai_summary: {
    type: DataTypes.TEXT
  },
  difficulty_score: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    validate: {
      min: 1,
      max: 10
    }
  }
}, {
  tableName: 'courses',
  indexes: [
    {
      fields: ['instructor_id']
    },
    {
      fields: ['category']
    },
    {
      fields: ['level']
    },
    {
      fields: ['status']
    },
    {
      fields: ['average_rating']
    }
  ]
});

// Instance methods
Course.prototype.calculateDuration = function() {
  let total = 0;
  const modules = this.modules || [];
  
  modules.forEach(module => {
    if (module.content) {
      module.content.forEach(content => {
        if (content.duration) total += content.duration;
      });
    }
  });
  
  this.duration = total;
  return this.save();
};

module.exports = Course;
