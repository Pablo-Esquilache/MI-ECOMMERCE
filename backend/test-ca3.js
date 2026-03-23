const USER = 'pabloesquilache@gmail.com';
const PASS = 'Pablo3454!';
const API_BASE_URL = 'https://api.correoargentino.com.ar/micorreo/v1';

async function testAuthAndQuote() {
  const credentials = Buffer.from(`${USER}:${PASS}`).toString('base64');
  let token = null;
  
  console.log('--- TESTING /token ---');
  try {
    const res = await fetch(`${API_BASE_URL}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // WooCommerce plugin sends an implicit empty body when not defined in wp_remote_post
      body: JSON.stringify({}) 
    });
    
    console.log('Status:', res.status, res.statusText);
    const data = await res.json();
    console.log('Response:', data);
    
    if (data.token) {
      token = data.token;
      console.log('\nGot token! Proceeding to quote...\n');
    }
  } catch (e) {
    console.error('Token Error:', e.message);
  }

  if (!token) return;

  console.log('--- TESTING /rates ---');
  try {
    const bodyParams = {
      customerId: "24449842", // We need the real customer_id, guessing for now or seeing if it accepts without it
      postalCodeOrigin: "1000",
      postalCodeDestination: "7600",
      deliveredType: "D", // D = Domicilio, S = Sucursal
      dimensions: [10, 10, 10] // width, length, height as integers
    };

    const res2 = await fetch(`${API_BASE_URL}/rates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(bodyParams)
    });
    
    console.log('Quotes Status:', res2.status, res2.statusText);
    const text2 = await res2.text();
    console.log('Quotes Response:', text2);
  } catch (e) {
    console.error('Quotes Error:', e.message);
  }
}

testAuthAndQuote();
