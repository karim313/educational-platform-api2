const https = require('https');

const data = JSON.stringify({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'student'
});

const options = {
  hostname: 'educational-platform-api2-production-d04a.up.railway.app',
  port: 443,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let body = '';
  res.on('data', (chunk) => {
    body += chunk.toString();
  });
  res.on('end', () => console.log(`BODY: ${body}`));
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
