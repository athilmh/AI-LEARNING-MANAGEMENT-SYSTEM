const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function check() {
    try {
        const user = await User.findOne({ where: { email: 'athilmh@gmail.com' } });
        if (!user) {
            console.log('User not found');
            process.exit(0);
        }
        console.log('Stored Hash:', user.password);
        const isMatch = await bcrypt.compare('admin123', user.password);
        console.log('Match result for admin123:', isMatch);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
