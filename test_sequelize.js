const { User } = require('./models');

async function test() {
    try {
        console.log('User model:', User ? 'Exists' : 'Missing');
        console.log('User.sequelize:', User.sequelize ? 'Exists' : 'Missing');
        if (User.sequelize) {
            const email = 'admin@lms.com';
            const user = await User.findOne({
                where: User.sequelize.where(
                    User.sequelize.fn('LOWER', User.sequelize.col('email')),
                    User.sequelize.fn('LOWER', email)
                )
            });
            console.log('User found:', user ? user.email : 'No');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

test();
