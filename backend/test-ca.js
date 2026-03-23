const USER = 'pabloesquilache@gmail.com';
const PASS = 'Pablo3454!';
const API_BASE_URL = 'https://api.correoargentino.com.ar/micorreo/v1';

async function testAuth() {
  const credentials = Buffer.from(`${USER}:${PASS}`).toString('base64');
  
  console.log('Testing with JSON body...');
  try {
    const res1 = await fetch(`${API_BASE_URL}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ grant_type: 'client_credentials' })
    });
    console.log('JSON Status:', res1.status, res1.statusText);
    const text1 = await res1.text();
    console.log('JSON Body:', text1);
    console.log(res1.headers);
  } catch (e) {
    console.error('JSON Error:', e.message);
  }

  console.log('\n----------------\n');

  console.log('Testing with URL-encoded body...');
  try {
    const res2 = await fetch(`${API_BASE_URL}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });
    console.log('URL-encoded Status:', res2.status, res2.statusText);
    const text2 = await res2.text();
    console.log('URL-encoded Body:', text2);
  } catch (e) {
    console.error('URL-encoded Error:', e.message);
  }
}

testAuth();
