const DevinApiClient = require('../../utils/api-client');
const { safelyCancelTask } = require('../../utils/test-utils');
const { testTasks } = require('../../utils/test-data');
const config = require('../../config/config');

describe('Response Time Tests', () => {
  const apiClient = new DevinApiClient();
  const timeoutThreshold = config.usability.responseTimeThreshold || 30000;

  const runTests = async () => {
    const results = await Promise.all(
      testTasks.map(async (task) => {
        const startTime = Date.now();
        
        try {
          const submissionResponse = await apiClient.submitTask(task.description);
          const taskId = submissionResponse.taskId;
          const responseTime = Date.now() - startTime;
          
          await safelyCancelTask(apiClient, taskId);
          
          return {
            task,
            responseTime,
            success: true,
            taskId
          };
        } catch (error) {
          console.error(`Error testing ${task.name}:`, error.message);
          return {
            task,
            success: false,
            error: error.message
          };
        }
      })
    );
    
    return results;
  };

  test('All tasks respond within the timeout threshold', async () => {
    const results = await runTests();
    
    results.forEach(result => {
      if (result.success) {
        console.log(`Response time for ${result.task.name} (${result.task.complexity} complexity): ${result.responseTime}ms`);
        expect(result.responseTime).toBeLessThan(timeoutThreshold);
      } else {
        console.error(`Test for ${result.task.name} failed: ${result.error}`);
        fail(`Test for ${result.task.name} failed: ${result.error}`);
      }
    });
    
    const failedTests = results.filter(result => !result.success);
    expect(failedTests.length).toBe(0);
  }, config.testTimeout);
});
