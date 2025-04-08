import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter } from 'k6/metrics';

const API_URL = __ENV.DEVIN_API_URL || 'https://api.devin.ai';
const AUTH_TOKEN = __ENV.DEVIN_AUTH_TOKEN || 'your_token_here';

const errors = new Counter('errors');

export const options = {
  stages: [
    { duration: '30s', target: 5 },  // Ramp up to 5 users
    { duration: '1m', target: 5 },   // Stay at 5 users for 1 minute
    { duration: '30s', target: 10 }, // Ramp up to 10 users
    { duration: '1m', target: 10 },  // Stay at 10 users for 1 minute
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    errors: ['count<10'],             // Error count should be less than 10
  },
};

const TASK_DESCRIPTIONS = [
  'Fix a simple bug in a React component',
  'Create a new API endpoint in Express.js',
  'Debug a Python function that\'s returning incorrect results'
];

export default function () {
  const randomTaskIndex = Math.floor(Math.random() * TASK_DESCRIPTIONS.length);
  const payload = JSON.stringify({
    description: TASK_DESCRIPTIONS[randomTaskIndex]
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`
    },
  };

  const response = http.post(`${API_URL}/tasks`, payload, params);
  
  const success = check(response, {
    'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'response has taskId': (r) => r.json('taskId') !== undefined,
  });

  if (!success) {
    errors.add(1);
    console.log(`Failed request: ${response.status} - ${response.body}`);
  }

  sleep(1);
}
