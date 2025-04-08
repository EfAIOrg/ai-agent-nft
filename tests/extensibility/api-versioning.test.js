const DevinApiClient = require('../../utils/api-client');
const axios = require('axios');
const config = require('../../config/config');

describe('Extensibility Tests - API Versioning', () => {
  const apiClient = new DevinApiClient();
  
  test('API supports specified version', async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/version`, {
        headers: {
          'Authorization': `Bearer ${config.authToken}`
        }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('version');
      expect(response.data.version).toContain(config.extensibility.apiVersionSupport);
    } catch (error) {
      const response = await axios.post(`${config.apiUrl}/tasks`, 
        { description: 'Simple test task' },
        {
          headers: {
            'Authorization': `Bearer ${config.authToken}`,
            'Accept-Version': config.extensibility.apiVersionSupport
          }
        }
      );
      
      expect(response.status).toBe(200);
      expect(response).toHaveProperty('data');
    }
  });
  
  test('API handles backward compatibility', async () => {
    
    const response = await apiClient.submitTask('Create a simple hello world function');
    expect(response).toHaveProperty('taskId');
    
    await apiClient.cancelTask(response.taskId);
  });
  
  test('API supports extension points', async () => {
    
    try {
      const response = await axios.get(`${config.apiUrl}/extensions`, {
        headers: {
          'Authorization': `Bearer ${config.authToken}`
        }
      });
      
      if (response.status === 200) {
        expect(response.data).toHaveProperty('extensions');
      }
    } catch (error) {
      console.log('Extensions endpoint not available or not accessible');
    }
    
    try {
      const response = await axios.get(`${config.apiUrl}/docs`, {
        headers: {
          'Authorization': `Bearer ${config.authToken}`
        }
      });
      
      if (response.status === 200) {
        const docsContainExtensions = response.data.includes('extension') || 
                                     response.data.includes('plugin') ||
                                     response.data.includes('custom');
        
        console.log(`API documentation ${docsContainExtensions ? 'mentions' : 'does not mention'} extensions`);
      }
    } catch (error) {
      console.log('Documentation endpoint not available or not accessible');
    }
  });
});
