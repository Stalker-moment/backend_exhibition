const axios = require('axios');
const crypto = require('crypto');

// Parameters
const clientId = '9jjda48p5cnt9yqfhr5p';
const secret = 'e7df26639c924b178357d6366e700775';
const timestampMillis = Date.now().toString();  // Timestamp in milliseconds
const signMethod = 'HMAC-SHA256';

// Construct the string to sign
const stringToSign = `client_id=${clientId}&t=${timestampMillis}`;
const sign = crypto.createHmac('sha256', secret).update(stringToSign).digest('hex').toUpperCase();

// Debug outputs
console.log("Client ID:", clientId);
console.log("Timestamp (Millis):", timestampMillis);
console.log("String to Sign:", stringToSign);
console.log("Generated Sign:", sign);

// API Request to get access token
axios.get(`https://openapi.tuyaus.com/v1.0/token?grant_type=1`, {
  headers: {
    'sign_method': signMethod,
    'client_id': clientId,
    't': timestampMillis,
    'Content-Type': 'application/json',
    'sign': sign
  }
})
.then(response => {
    console.log("Response:", response.data);
  const accessToken = response.data.result.access_token;
  const refreshToken = response.data.result.refresh_token;
  console.log("Access Token:", accessToken);
  console.log("Refresh Token:", refreshToken);
})
.catch(error => {
  console.error('Error:', error.response ? error.response.data : error.message);
});