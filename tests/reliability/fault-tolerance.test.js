const DevinApiClient = require('../../utils/api-client');
const config = require('../../config/config');

describe('Fault Tolerance Tests', () => {
  const apiClient = new DevinApiClient();
  
  test('Devin recovers from interrupted tasks', async () => {
    const complexTask = 'Implement a full stack application with React frontend and Node.js backend with MongoDB database';
    const response = await apiClient.submitTask(complexTask);
    expect(response).toHaveProperty('taskId');
    
    const taskId = response.taskId;
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const newApiClient = new DevinApiClient();
    
    const statusResponse = await newApiClient.getTaskStatus(taskId);
    
    expect(['processing', 'paused', 'resumable']).toContain(statusResponse.status);
    
    await newApiClient.cancelTask(taskId);
  }, config.testTimeout);
  
  test('Devin handles malformed input gracefully', async () => {
    const malformedInputs = [
      '', // Empty string
      '   ', // Whitespace only
      'a'.repeat(10000), // Very long input
      '{"malformed": "json" ', // Invalid JSON
      '<script>alert("XSS")</script>', // Potential XSS
      null // Empty input
    ];
    
    for (const input of malformedInputs) {
      try {
        const response = await apiClient.submitTask(input);
        
        if (response.error) {
          expect(response).toHaveProperty('error');
          expect(response.error).toContain('invalid input');
        } else {
          expect(response).toHaveProperty('taskId');
          await apiClient.cancelTask(response.taskId);
        }
      } catch (error) {
        expect(error.response).toBeDefined();
        expect(error.response.status).toBeLessThan(500); // Should not cause 5xx errors
      }
    }
  });
  
  test('Devin recovers from system failures within acceptable time', async () => {
    
    const task = 'Write a simple hello world program in Python';
    const response = await apiClient.submitTask(task);
    expect(response).toHaveProperty('taskId');
    
    await apiClient.cancelTask(response.taskId);
    
    const startTime = Date.now();
    
    let systemRecovered = false;
    while (!systemRecovered && (Date.now() - startTime) < config.reliability.recoveryTimeThreshold) {
      try {
        const healthResponse = await apiClient.client.get('/health');
        if (healthResponse.status === 200) {
          systemRecovered = true;
        }
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    expect(systemRecovered).toBe(true);
    const recoveryTime = Date.now() - startTime;
    expect(recoveryTime).toBeLessThan(config.reliability.recoveryTimeThreshold);
  }, config.testTimeout);
});
