const User = require('./User');
const Course = require('./Course');
const Enrollment = require('./Enrollment');
const Progress = require('./Progress');
const Message = require('./Message');

// User associations
User.hasMany(Course, { 
  foreignKey: 'instructor_id', 
  as: 'courses' 
});
User.hasMany(Enrollment, { 
  foreignKey: 'user_id', 
  as: 'enrollments' 
});
User.hasMany(Progress, { 
  foreignKey: 'user_id', 
  as: 'progress' 
});
User.hasMany(Message, { 
  foreignKey: 'sender_id', 
  as: 'messages' 
});

// Course associations
Course.belongsTo(User, { 
  foreignKey: 'instructor_id', 
  as: 'instructor' 
});
Course.hasMany(Enrollment, { 
  foreignKey: 'course_id', 
  as: 'enrollments' 
});
Course.hasMany(Progress, { 
  foreignKey: 'course_id', 
  as: 'progress' 
});
Course.hasMany(Message, { 
  foreignKey: 'course_id', 
  as: 'messages' 
});

// Enrollment associations
Enrollment.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user' 
});
Enrollment.belongsTo(Course, { 
  foreignKey: 'course_id', 
  as: 'course' 
});

// Progress associations
Progress.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user' 
});
Progress.belongsTo(Course, { 
  foreignKey: 'course_id', 
  as: 'course' 
});

// Message associations
Message.belongsTo(User, { 
  foreignKey: 'sender_id', 
  as: 'sender' 
});
Message.belongsTo(Course, { 
  foreignKey: 'course_id', 
  as: 'course' 
});
Message.belongsTo(Message, { 
  foreignKey: 'reply_to_id', 
  as: 'replyTo' 
});

module.exports = {
  User,
  Course,
  Enrollment,
  Progress,
  Message
};