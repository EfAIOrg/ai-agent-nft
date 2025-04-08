const axios = require('axios');
const config = require('../../config/config');

describe('Authentication and Authorization Tests', () => {
  const baseUrl = config.apiUrl;
  
  test('Unauthenticated requests are rejected', async () => {
    try {
      await axios.post(`${baseUrl}/tasks`, {
        description: 'Simple test task'
      });
      
      fail('Request should have been rejected');
    } catch (error) {
      expect(error.response).toBeDefined();
      expect(error.response.status).toBe(401);
    }
  });
  
  test('Requests with invalid tokens are rejected', async () => {
    try {
      await axios.post(`${baseUrl}/tasks`, {
        description: 'Simple test task'
      }, {
        headers: {
          Authorization: 'Bearer INVALID_TOKEN'
        }
      });
      
      fail('Request should have been rejected');
    } catch (error) {
      expect(error.response).toBeDefined();
      expect(error.response.status).toBe(401);
    }
  });
  
  test('Token expiration is handled correctly', async () => {
    
    
    console.log('Token expiration test needs implementation based on API specifics');
  });
});
