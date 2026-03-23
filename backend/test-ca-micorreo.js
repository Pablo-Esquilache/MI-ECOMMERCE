const USER = 'pabloesquilache@gmail.com';
const PASS = 'Pablo3454!';
const API_BASE_URL = 'https://apitest.correoargentino.com.ar/micorreo/v1';

async function testAuth() {
  const credentials = Buffer.from(`${USER}:${PASS}`).toString('base64');
  console.log(`Auth Hash: ${credentials}`);

  console.log('\n--- Testing /token with NO body ---');
  try {
    const res1 = await fetch(`${API_BASE_URL}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`
      }
      // No body
    });
    console.log('Status:', res1.status, res1.statusText);
    const text1 = await res1.text();
    console.log('Body:', text1);
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testAuth();
