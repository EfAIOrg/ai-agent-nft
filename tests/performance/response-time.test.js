const DevinApiClient = require('../../utils/api-client');
const { testTasks } = require('../../utils/test-data');
const config = require('../../config/config');

describe('Response Time Tests', () => {
  const apiClient = new DevinApiClient();
  const timeoutThreshold = 30000; // 30 seconds

  testTasks.forEach(task => {
    test(`Response time for ${task.name} task (${task.complexity} complexity)`, async () => {
      const startTime = Date.now();

      const submissionResponse = await apiClient.submitTask(task.description);
      expect(submissionResponse).toHaveProperty('taskId');

      const taskId = submissionResponse.taskId;
      const responseTime = Date.now() - startTime;

      console.log(`Response time for ${task.name}: ${responseTime}ms`);
      
      await apiClient.cancelTask(taskId);
      
      expect(responseTime).toBeLessThan(timeoutThreshold);
    }, config.testTimeout);
  });
});
