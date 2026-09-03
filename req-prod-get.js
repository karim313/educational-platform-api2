const https = require('https');

const options = {
  hostname: 'educational-platform-api2-production-d04a.up.railway.app',
  port: 443,
  path: '/api/auth/register',
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let body = '';
  res.on('data', (chunk) => body += chunk.toString());
  res.on('end', () => console.log(`BODY: ${body}`));
});

req.end();
