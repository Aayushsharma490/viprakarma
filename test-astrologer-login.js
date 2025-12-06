// const fetch = require('node-fetch');

async function testLogin() {
  try {
    const response = await fetch('http://localhost:3000/api/astrologer/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rajesh@kundali.com',
        password: 'Astro@123'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testLogin();
