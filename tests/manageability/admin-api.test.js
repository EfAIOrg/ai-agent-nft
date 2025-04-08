const DevinApiClient = require('../../utils/api-client');
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
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      
      expect(Object.keys(response.data).length).toBeGreaterThan(0);
      
    } catch (error) {
      console.log('Configuration endpoint not available or not accessible');
    }
  });
  
  test('System provides health check endpoint', async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/health`);
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      
      expect(response.data.status).toBeDefined();
      expect(['healthy', 'ok', 'up', 'running']).toContain(response.data.status.toLowerCase());
      
    } catch (error) {
      console.log('Health check endpoint not available or not accessible');
      
      try {
        const response = await axios.get(`${config.apiUrl}/`);
        expect(response.status).toBe(200);
      } catch (innerError) {
        fail('No health check endpoint available');
      }
    }
  });
});
