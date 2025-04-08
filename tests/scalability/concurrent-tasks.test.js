const DevinApiClient = require('../../utils/api-client');
const { testTasks } = require('../../utils/test-data');
const config = require('../../config/config');

describe('Scalability Tests - Concurrent Task Handling', () => {
  const apiClient = new DevinApiClient();
  
  test('Handles multiple concurrent tasks efficiently', async () => {
    const concurrentTasks = config.scalability.maxConcurrentRequests;
    const taskDescriptions = [];
    
    for (let i = 0; i < concurrentTasks; i++) {
      const taskIndex = i % testTasks.length;
      taskDescriptions.push(testTasks[taskIndex].description);
    }
    
    console.log(`Testing with ${concurrentTasks} concurrent tasks`);
    
    const startTime = Date.now();
    
    const taskPromises = taskDescriptions.map(description => 
      apiClient.submitTask(description)
    );
    
    const responses = await Promise.all(taskPromises);
    const taskIds = responses.map(response => response.taskId);
    
    expect(taskIds.length).toBe(concurrentTasks);
    
    for (const response of responses) {
      expect(response).toHaveProperty('taskId');
    }
    
    const endTime = Date.now();
    const totalTimeMs = endTime - startTime;
    const avgTimePerTaskMs = totalTimeMs / concurrentTasks;
    
    console.log(`Total time: ${totalTimeMs}ms`);
    console.log(`Average time per task: ${avgTimePerTaskMs}ms`);
    
    const expectedMaxTime = 2000; // 2 second per task submission
    expect(avgTimePerTaskMs).toBeLessThan(expectedMaxTime);
    
    const cleanupPromises = taskIds.map(id => apiClient.cancelTask(id));
    await Promise.all(cleanupPromises);
  }, config.testTimeout * 2);
  
  test('Scales with increasing load without degradation', async () => {
    const maxTasks = config.scalability.maxConcurrentRequests;
    const stepSize = config.scalability.stepSize;
    
    const performanceResults = [];
    
    for (let numTasks = stepSize; numTasks <= maxTasks; numTasks += stepSize) {
      const taskDescriptions = [];
      
      for (let i = 0; i < numTasks; i++) {
        const taskIndex = i % testTasks.length;
        taskDescriptions.push(testTasks[taskIndex].description);
      }
      
      console.log(`Testing with ${numTasks} concurrent tasks`);
      
      const startTime = Date.now();
      
      const taskPromises = taskDescriptions.map(description => 
        apiClient.submitTask(description)
      );
      
      const responses = await Promise.all(taskPromises);
      const taskIds = responses.map(response => response.taskId);
      
      const endTime = Date.now();
      const totalTimeMs = endTime - startTime;
      const avgTimePerTaskMs = totalTimeMs / numTasks;
      
      performanceResults.push({
        numTasks,
        totalTimeMs,
        avgTimePerTaskMs
      });
      
      console.log(`${numTasks} tasks - Avg time: ${avgTimePerTaskMs}ms`);
      
      const cleanupPromises = taskIds.map(id => apiClient.cancelTask(id));
      await Promise.all(cleanupPromises);
    }
    
    for (let i = 1; i < performanceResults.length; i++) {
      const currentResult = performanceResults[i];
      const previousResult = performanceResults[i - 1];
      
      const degradationFactor = (currentResult.avgTimePerTaskMs / previousResult.avgTimePerTaskMs);
      
      console.log(`Load increase from ${previousResult.numTasks} to ${currentResult.numTasks} tasks - Degradation factor: ${degradationFactor}`);
      
      expect(degradationFactor).toBeLessThan(1.5);
    }
  }, config.testTimeout * 5);
});
