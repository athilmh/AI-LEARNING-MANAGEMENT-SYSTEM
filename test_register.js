const axios = require('axios');

async function testRegister() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            role: 'student'
        });
        console.log('Registration Success:', res.data.success);
        process.exit(0);
    } catch (err) {
        console.error('Registration Failed:', err.response?.data || err.message);
        process.exit(1);
    }
}

testRegister();
