const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  role: {
    type: DataTypes.ENUM('student', 'instructor', 'admin'),
    defaultValue: 'student'
  },
  avatar: {
    type: DataTypes.STRING(255)
  },
  bio: {
    type: DataTypes.TEXT
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  department: {
    type: DataTypes.STRING(100)
  },

  // Gamification
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  badges: {
    type: DataTypes.JSON,
    defaultValue: []
  },

  // AI Personalization
  learning_preferences: {
    type: DataTypes.JSON,
    defaultValue: {
      pace: 'medium',
      difficulty: 'beginner',
      preferred_topics: [],
      learning_style: 'visual'
    }
  },
  skill_level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner'
  },

  // Activity tracking
  status: {
    type: DataTypes.ENUM('pending', 'active', 'rejected'),
    defaultValue: 'pending'
  },
  last_login: {
    type: DataTypes.DATE
  },

  // Analytics
  total_time_spent: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total time spent in seconds'
  },
  courses_completed: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'users',
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['role']
    },
    {
      fields: ['points']
    }
  ]
});

// Hash password before saving
User.beforeSave(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

// Instance methods
User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.addPoints = async function (points) {
  this.points += points;
  this.level = Math.floor(this.points / 1000) + 1;
  return await this.save();
};

User.prototype.addBadge = async function (badge) {
  const badges = this.badges || [];
  const exists = badges.some(b => b.name === badge.name);

  if (!exists) {
    badges.push({
      name: badge.name,
      icon: badge.icon,
      description: badge.description,
      category: badge.category,
      earnedAt: new Date()
    });
    this.badges = badges;
    return await this.save();
  }
  return this;
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;
