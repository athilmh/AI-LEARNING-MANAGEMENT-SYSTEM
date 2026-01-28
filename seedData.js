const { sequelize } = require('./config/database');
const { User, Course, Enrollment, Progress, Message } = require('./models');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync database
    await sequelize.sync({ force: true }); // WARNING: This drops all tables
    console.log('✅ Database synced (all data cleared)');

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@lms.com',
      password: 'admin123',
      role: 'admin',
      bio: 'System Administrator',
      points: 5000,
      level: 5,
      status: 'active'
    });
    console.log('✅ Admin created');

    // Create Instructors
    const instructor1 = await User.create({
      name: 'Dr. Sarah Johnson',
      email: 'sarah@lms.com',
      password: 'instructor123',
      role: 'instructor',
      bio: 'Expert in Web Development with 10+ years experience',
      department: 'Computer Science',
      points: 3000,
      level: 3,
      avatar: 'https://i.pravatar.cc/150?img=1',
      status: 'active'
    });

    const instructor2 = await User.create({
      name: 'Prof. Michael Chen',
      email: 'michael@lms.com',
      password: 'instructor123',
      role: 'instructor',
      bio: 'Data Science and AI specialist',
      department: 'Data Science',
      points: 4000,
      level: 4,
      avatar: 'https://i.pravatar.cc/150?img=2',
      status: 'active'
    });
    console.log('✅ Instructors created');

    // Create Students
    const students = [];
    for (let i = 1; i <= 10; i++) {
      const student = await User.create({
        name: `Student ${i}`,
        email: `student${i}@lms.com`,
        password: 'student123',
        role: 'student',
        points: Math.floor(Math.random() * 2000),
        level: Math.floor(Math.random() * 3) + 1,
        avatar: `https://i.pravatar.cc/150?img=${i + 10}`,
        status: 'active',
        learning_preferences: {
          pace: ['slow', 'medium', 'fast'][Math.floor(Math.random() * 3)],
          difficulty: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
          preferred_topics: ['programming', 'design', 'data science'].slice(0, Math.floor(Math.random() * 3) + 1),
          learning_style: ['visual', 'auditory', 'reading', 'kinesthetic'][Math.floor(Math.random() * 4)]
        }
      });
      students.push(student);
    }
    console.log('✅ Students created');

    // Create Courses
    const webDevCourse = await Course.create({
      title: 'Full Stack Web Development Bootcamp',
      description: 'Learn HTML, CSS, JavaScript, React, Node.js, and PostgreSQL. Build real-world projects and deploy them to production.',
      instructor_id: instructor1.id,
      category: 'Web Development',
      level: 'beginner',
      tags: ['javascript', 'react', 'node', 'postgresql', 'fullstack'],
      status: 'published',
      price: 99.99,
      duration: 4800,
      average_rating: 4.7,
      enrollment_count: 0,
      language: 'English',
      learning_outcomes: [
        'Build responsive websites with HTML, CSS, and JavaScript',
        'Create dynamic web apps with React',
        'Develop REST APIs with Node.js and Express',
        'Work with PostgreSQL databases',
        'Deploy applications to cloud platforms'
      ],
      prerequisites: ['Basic computer skills', 'Willingness to learn'],
      modules: [
        {
          id: 'mod1',
          title: 'HTML & CSS Fundamentals',
          description: 'Learn the basics of web development',
          order: 1,
          estimatedTime: 600,
          content: [
            {
              id: 'content1',
              type: 'video',
              title: 'Introduction to HTML',
              url: 'https://example.com/video1.mp4',
              duration: 30
            },
            {
              id: 'content2',
              type: 'text',
              title: 'HTML Elements Overview',
              text: 'HTML elements are the building blocks of web pages...'
            },
            {
              id: 'content3',
              type: 'quiz',
              title: 'HTML Basics Quiz',
              questions: [
                {
                  id: 'q1',
                  question: 'What does HTML stand for?',
                  type: 'multiple-choice',
                  options: [
                    'Hyper Text Markup Language',
                    'High Tech Modern Language',
                    'Home Tool Markup Language',
                    'Hyperlinks and Text Markup Language'
                  ],
                  correctAnswer: 'Hyper Text Markup Language',
                  points: 10
                },
                {
                  id: 'q2',
                  question: 'Which HTML tag is used for the largest heading?',
                  type: 'multiple-choice',
                  options: ['<h1>', '<h6>', '<head>', '<heading>'],
                  correctAnswer: '<h1>',
                  points: 10
                }
              ]
            }
          ]
        },
        {
          id: 'mod2',
          title: 'JavaScript Essentials',
          description: 'Master JavaScript programming',
          order: 2,
          estimatedTime: 900,
          content: [
            {
              id: 'content4',
              type: 'video',
              title: 'JavaScript Variables and Data Types',
              url: 'https://example.com/video2.mp4',
              duration: 45
            },
            {
              id: 'content5',
              type: 'document',
              title: 'JavaScript Cheat Sheet',
              url: 'https://example.com/js-cheatsheet.pdf'
            }
          ]
        },
        {
          id: 'mod3',
          title: 'React Framework',
          description: 'Build modern web applications',
          order: 3,
          estimatedTime: 1200,
          content: []
        }
      ]
    });

    const dataScienceCourse = await Course.create({
      title: 'Data Science with Python',
      description: 'Master data analysis, visualization, and machine learning with Python. Work with real datasets and build predictive models.',
      instructor_id: instructor2.id,
      category: 'Data Science',
      level: 'intermediate',
      tags: ['python', 'machine-learning', 'pandas', 'numpy', 'sklearn'],
      status: 'published',
      price: 129.99,
      duration: 6000,
      average_rating: 4.8,
      enrollment_count: 0,
      learning_outcomes: [
        'Perform data analysis with Pandas',
        'Create visualizations with Matplotlib and Seaborn',
        'Build machine learning models with scikit-learn',
        'Deploy ML models to production'
      ],
      modules: [
        {
          id: 'mod1',
          title: 'Python for Data Science',
          description: 'Learn Python basics for data science',
          order: 1,
          estimatedTime: 800
        }
      ]
    });

    const aiCourse = await Course.create({
      title: 'Introduction to Artificial Intelligence',
      description: 'Explore AI concepts, neural networks, and deep learning. Build intelligent systems from scratch.',
      instructor_id: instructor2.id,
      category: 'Artificial Intelligence',
      level: 'advanced',
      tags: ['ai', 'deep-learning', 'neural-networks', 'tensorflow', 'pytorch'],
      status: 'published',
      price: 149.99,
      duration: 7200,
      average_rating: 4.9,
      enrollment_count: 0,
      modules: []
    });

    const mobileDevCourse = await Course.create({
      title: 'Mobile App Development with React Native',
      description: 'Build native mobile apps for iOS and Android using React Native',
      instructor_id: instructor1.id,
      category: 'Mobile Development',
      level: 'intermediate',
      tags: ['react-native', 'mobile', 'ios', 'android'],
      status: 'published',
      price: 119.99,
      duration: 5400,
      average_rating: 4.6,
      enrollment_count: 0,
      modules: []
    });

    console.log('✅ Courses created');

    // Create Enrollments
    const enrollmentData = [];

    // Enroll first 5 students in Web Dev course
    for (let i = 0; i < 5; i++) {
      const progress = Math.floor(Math.random() * 80) + 10;
      enrollmentData.push({
        user_id: students[i].id,
        course_id: webDevCourse.id,
        progress: progress,
        status: progress >= 100 ? 'completed' : 'active',
        average_score: 60 + Math.floor(Math.random() * 35),
        time_spent: Math.floor(Math.random() * 10000) + 3600,
        quizzes_taken: Math.floor(Math.random() * 5) + 1,
        quizzes_passed: Math.floor(Math.random() * 4) + 1,
        last_accessed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      });
    }

    // Enroll students 3-7 in Data Science course
    for (let i = 2; i < 7; i++) {
      const progress = Math.floor(Math.random() * 70) + 15;
      enrollmentData.push({
        user_id: students[i].id,
        course_id: dataScienceCourse.id,
        progress: progress,
        status: progress >= 100 ? 'completed' : 'active',
        average_score: 65 + Math.floor(Math.random() * 30),
        time_spent: Math.floor(Math.random() * 8000) + 2000,
        quizzes_taken: Math.floor(Math.random() * 6) + 1,
        quizzes_passed: Math.floor(Math.random() * 5) + 1,
        last_accessed: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000)
      });
    }

    // Enroll students 6-9 in AI course
    for (let i = 5; i < 9; i++) {
      enrollmentData.push({
        user_id: students[i].id,
        course_id: aiCourse.id,
        progress: Math.floor(Math.random() * 50) + 5,
        status: 'active',
        average_score: 70 + Math.floor(Math.random() * 25),
        time_spent: Math.floor(Math.random() * 6000) + 1000,
        quizzes_taken: Math.floor(Math.random() * 4),
        quizzes_passed: Math.floor(Math.random() * 3),
        last_accessed: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000)
      });
    }

    await Enrollment.bulkCreate(enrollmentData);
    console.log('✅ Enrollments created');

    // Update course enrollment counts
    await webDevCourse.update({ enrollment_count: 5 });
    await dataScienceCourse.update({ enrollment_count: 5 });
    await aiCourse.update({ enrollment_count: 4 });

    // Create some progress records
    const progressData = [];
    for (let i = 0; i < 3; i++) {
      progressData.push({
        user_id: students[i].id,
        course_id: webDevCourse.id,
        module_id: 'mod1',
        content_id: 'content1',
        completed: true,
        score: 80 + Math.floor(Math.random() * 20),
        attempts: 1,
        time_spent: 1800
      });

      progressData.push({
        user_id: students[i].id,
        course_id: webDevCourse.id,
        module_id: 'mod1',
        content_id: 'content3',
        completed: true,
        score: 75 + Math.floor(Math.random() * 25),
        attempts: Math.floor(Math.random() * 2) + 1,
        time_spent: 600,
        answers: {
          q1: 'Hyper Text Markup Language',
          q2: '<h1>'
        }
      });
    }

    await Progress.bulkCreate(progressData);
    console.log('✅ Progress records created');

    // Create some messages
    const messageData = [
      {
        course_id: webDevCourse.id,
        sender_id: instructor1.id,
        content: 'Welcome to the Full Stack Web Development Bootcamp! Feel free to ask any questions.',
        type: 'announcement'
      },
      {
        course_id: webDevCourse.id,
        sender_id: students[0].id,
        content: 'Thank you! Excited to learn.',
        type: 'text'
      },
      {
        course_id: webDevCourse.id,
        sender_id: students[1].id,
        content: 'Can you recommend any resources for practicing JavaScript?',
        type: 'text'
      }
    ];

    await Message.bulkCreate(messageData);
    console.log('✅ Messages created');

    // Add some badges to students
    await students[0].addBadge({
      name: 'First Steps',
      icon: '🎓',
      description: 'Enrolled in your first course',
      category: 'milestone'
    });

    await students[0].addBadge({
      name: 'Quick Learner',
      icon: '⚡',
      description: 'Completed 5 lessons in one day',
      category: 'achievement'
    });

    console.log('\n✅ Database seeded successfully!\n');
    console.log('📝 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:      admin@lms.com      / admin123');
    console.log('Instructor: sarah@lms.com      / instructor123');
    console.log('Instructor: michael@lms.com    / instructor123');
    console.log('Student:    student1@lms.com   / student123');
    console.log('           (student1-10 available)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
};

seedData();