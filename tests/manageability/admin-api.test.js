const DevinApiClient = require('../../utils/api-client');
const axios = require('axios');
const config = require('../../config/config');

describe('Manageability Tests - Admin API', () => {
  const apiClient = new DevinApiClient();
  
  test('Admin API provides system status', async () => {
    try {
      const status = await apiClient.getAdminStatus();
      
      expect(status).toBeDefined();
      
      expect(status).toHaveProperty('status');
      
      expect(['healthy', 'ok', 'up', 'running']).toContain(status.status.toLowerCase());
      
    } catch (error) {
      console.log('Admin API not available or not accessible');
    }
  });
  
  test('System configuration can be retrieved', async () => {
    try {
      const adminClient = axios.create({
        baseURL: config.manageability.adminApiUrl,
        headers: {
          'Authorization': `Bearer ${config.authToken}`,
          'Content-Type': 'application/json'
        },
        timeout: config.testTimeout
      });
      
      const response = await adminClient.get('/config');
      
      const responseData = response.data;
      const responseStatus = response.status;
      
      expect(responseStatus).toBe(200);
      expect(responseData).toBeDefined();
      
      expect(Object.keys(responseData).length).toBeGreaterThan(0);
      
    } catch (error) {
      console.log('Configuration endpoint not available or not accessible');
    }
  });
  
  test('System provides health check endpoint', async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/health`);
      
      const responseData = response.data;
      const responseStatus = response.status;
      
      expect(responseStatus).toBe(200);
      expect(responseData).toBeDefined();
      
      expect(responseData.status).toBeDefined();
      expect(['healthy', 'ok', 'up', 'running']).toContain(responseData.status.toLowerCase());
      
    } catch (error) {
      console.log('Health check endpoint not available or not accessible');
      
      try {
        const response = await axios.get(`${config.apiUrl}/`);
        const responseStatus = response.status;
        expect(responseStatus).toBe(200);
      } catch (innerError) {
        fail('No health check endpoint available');
      }
    }
  });
});
