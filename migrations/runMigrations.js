const { sequelize } = require('../config/database');
const models = require('../models');

const runMigrations = async () => {
  try {
    console.log('🔄 Starting database migration...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync all models (creates tables)
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ All tables created/updated successfully');
    
    // Create indexes
    console.log('📊 Creating indexes...');
    
    // Additional custom indexes can be added here
   
  console.log('📊 Creating indexes...');

  await sequelize.query(
    'CREATE INDEX idx_users_points ON users(points)'
  );

  await sequelize.query(
    'CREATE INDEX idx_courses_rating ON courses(average_rating)'
  );

  await sequelize.query(
    'CREATE INDEX idx_enrollments_user_progress ON enrollments(user_id, progress)'
  );

    
    console.log('✅ Indexes created successfully');
    console.log('✨ Migration completed!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();
