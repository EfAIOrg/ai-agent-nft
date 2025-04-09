const axios = require('axios');
const config = require('../../config/config');
const { fail } = require('@jest/globals');

describe('Authentication and Authorization Tests', () => {
  const baseUrl = config.apiUrl;
  
  test('Unauthenticated requests are rejected', async () => {
    try {
      await axios.post(`${baseUrl}/v1/sessions`, {
        prompt: 'Simple test task',
        snapshot_id: "snapshot-9918e79f495949009348fd97b0ff5091"
      });
      
      fail('Request should have been rejected');
    } catch (error) {
      expect(error.response).toBeDefined();
      expect(error.response.status).toBe(401);
    }
  });
  
  test('Requests with invalid tokens are rejected', async () => {
    try {
      await axios.post(`${baseUrl}/v1/sessions`, {
        prompt: 'Simple test task',
        snapshot_id: "snapshot-9918e79f495949009348fd97b0ff5091"
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
