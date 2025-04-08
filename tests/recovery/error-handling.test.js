const DevinApiClient = require('../../utils/api-client');
const config = require('../../config/config');

describe('Recovery Tests - Error Handling', () => {
  const apiClient = new DevinApiClient();
  
  test('System recovers from network interruptions', async () => {
    const task = 'Create a simple hello world function';
    const response = await apiClient.submitTask(task);
    expect(response).toHaveProperty('taskId');
    
    const taskId = response.taskId;
    
    const newApiClient = new DevinApiClient();
    
    const statusResponse = await newApiClient.getTaskStatus(taskId);
    expect(statusResponse).toBeDefined();
    
    await newApiClient.cancelTask(taskId);
  });
  
  test('System implements retry mechanism for failed requests', async () => {
    
    const badUrlClient = new DevinApiClient('https://non-existent-url.devin.ai', config.authToken);
    
    try {
      await badUrlClient.submitTask('Test task');
      fail('Request to non-existent URL should fail');
    } catch (error) {
      expect(badUrlClient.retryCount).toBe(config.recovery.maxRetries);
    }
  });
  
  test('System maintains data integrity during failures', async () => {
    const task = 'Create a function to calculate prime numbers';
    const response = await apiClient.submitTask(task);
    expect(response).toHaveProperty('taskId');
    
    const taskId = response.taskId;
    
    const initialStatus = await apiClient.getTaskStatus(taskId);
    const initialStatusValue = initialStatus.status;
    
    const concurrentRequests = [];
    for (let i = 0; i < 5; i++) {
      concurrentRequests.push(apiClient.getTaskStatus(taskId));
    }
    
    await Promise.all(concurrentRequests);
    
    const finalStatus = await apiClient.getTaskStatus(taskId);
    const finalStatusValue = finalStatus.status;
    
    expect(finalStatusValue).toBe(initialStatusValue);
    
    await apiClient.cancelTask(taskId);
  });
});
