require('dotenv').config();

console.log('Environment variables loaded. API URL:', process.env.DEVIN_API_URL);
console.log('Auth token defined:', process.env.DEVIN_AUTH_TOKEN ? 'Yes' : 'No');
