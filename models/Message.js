const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('text', 'file', 'announcement'),
    defaultValue: 'text'
  },
  file_url: {
    type: DataTypes.STRING(255)
  },
  
  // Thread support
  reply_to_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'messages',
      key: 'id'
    }
  },
  
  // Engagement
  likes: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of user IDs who liked'
  },
  
  is_edited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'messages',
  indexes: [
    {
      fields: ['course_id']
    },
    {
      fields: ['sender_id']
    },
    {
      fields: ['reply_to_id']
    }
  ]
});

module.exports = Message;