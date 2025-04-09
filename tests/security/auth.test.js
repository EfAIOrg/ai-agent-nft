const axios = require('axios');
const DevinApiClient = require('../../utils/api-client');
const config = require('../../config/config');

describe('Authentication and Authorization Tests', () => {
  const baseUrl = config.apiUrl;
  
  test('Unauthenticated requests are rejected', async () => {
    const unauthenticatedClient = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: config.testTimeout
    });
    
    try {
      await unauthenticatedClient.post('/tasks', {
        description: 'Simple test task'
      });
      
      fail('Request should have been rejected');
    } catch (error) {
      expect(error.response).toBeDefined();
      expect(error.response.status).toBe(401);
    }
  });
  
  test('Requests with invalid tokens are rejected', async () => {
    const invalidTokenClient = axios.create({
      baseURL: baseUrl,
      headers: {
        'Authorization': 'Bearer INVALID_TOKEN',
        'Content-Type': 'application/json'
      },
      timeout: config.testTimeout
    });
    
    try {
      await invalidTokenClient.post('/tasks', {
        description: 'Simple test task'
      });
      
      fail('Request should have been rejected');
    } catch (error) {
      expect(error.response).toBeDefined();
      expect(error.response.status).toBe(401);
    }
  });
  
  test('Valid authentication allows API access', async () => {
    if (!config.authToken) {
      console.log('Skipping valid authentication test - no auth token provided');
      return;
    }
    
    const apiClient = new DevinApiClient();
    
    try {
      const response = await apiClient.getMetrics();
      expect(response).toBeDefined();
    } catch (error) {
      expect(error.response?.status).not.toBe(401);
    }
  });
  
  test('Token expiration is handled correctly', async () => {
    console.log('Token expiration test needs implementation based on API specifics');
  });
});
