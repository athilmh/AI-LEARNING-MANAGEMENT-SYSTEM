const { spawn } = require('child_process');
const axios = require('axios');

async function captureError() {
    console.log('Starting server...');
    const server = spawn('node', ['server.js'], { cwd: process.cwd() });

    server.stdout.on('data', (data) => {
        console.log(`SERVER STDOUT: ${data}`);
    });

    server.stderr.on('data', (data) => {
        console.error(`SERVER STDERR: ${data}`);
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Attempting login...');
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@lms.com',
            password: 'admin123'
        });
        console.log('Login Success:', res.data);
    } catch (err) {
        console.error('Login Failed Response:', err.response ? err.response.data : err.message);
    }

    server.kill();
    process.exit(0);
}

captureError();
