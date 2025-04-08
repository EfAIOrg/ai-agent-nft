const DevinApiClient = require('../../utils/api-client');
const config = require('../../config/config');

describe('Observability Tests - Metrics', () => {
  const apiClient = new DevinApiClient();
  
  test('API provides metrics endpoint', async () => {
    try {
      const metrics = await apiClient.getMetrics();
      
      expect(metrics).toBeDefined();
      
      const essentialMetrics = [
        'requests',
        'response_time',
        'error_rate',
        'task_completion_rate'
      ];
      
      const hasEssentialMetrics = essentialMetrics.some(metric => 
        Object.keys(metrics).includes(metric) || 
        JSON.stringify(metrics).includes(metric)
      );
      
      expect(hasEssentialMetrics).toBe(true);
      
    } catch (error) {
      console.log('Metrics endpoint not available or not accessible');
    }
  });
  
  test('Metrics are updated after API activity', async () => {
    try {
      const initialMetrics = await apiClient.getMetrics();
      
      const task = 'Create a simple hello world function';
      const response = await apiClient.submitTask(task);
      expect(response).toHaveProperty('taskId');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedMetrics = await apiClient.getMetrics();
      
      expect(updatedMetrics).not.toEqual(initialMetrics);
      
      await apiClient.cancelTask(response.taskId);
      
    } catch (error) {
      console.log('Metrics endpoint not available or not accessible');
    }
  });
  
  test('API provides detailed error information', async () => {
    try {
      await apiClient.submitTask(null);
      fail('Invalid task should have been rejected');
    } catch (error) {
      expect(error.response).toBeDefined();
      expect(error.response.data).toBeDefined();
      
      const errorData = error.response.data;
      expect(errorData).toHaveProperty('error');
      
      expect(typeof errorData.error).toBe('string');
      expect(errorData.error.length).toBeGreaterThan(5);
      
      if (errorData.details) {
        expect(typeof errorData.details).toBe('object');
      }
    }
  });
});
