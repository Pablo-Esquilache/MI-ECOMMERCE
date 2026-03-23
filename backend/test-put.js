const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/pedidos/26/estado',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', d => process.stdout.write(d));
});

req.on('error', error => console.error(error));
req.write(JSON.stringify({ estado: 'pagado' }));
req.end();
