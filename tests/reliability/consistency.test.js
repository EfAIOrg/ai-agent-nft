const DevinApiClient = require('../../utils/api-client');
const { 
  pollTaskUntilComplete, 
  safelyCancelTask, 
  calculateSimilarity, 
  calculateAverageSimilarity 
} = require('../../utils/test-utils');
const config = require('../../config/config');

describe('Consistency Tests', () => {
  const apiClient = new DevinApiClient();
  const iterations = config.reliability.testIterations;
  
  const consistentTask = 'Create a function that converts temperatures from Celsius to Fahrenheit';
  
  test(`Devin produces consistent results for the same task over ${iterations} iterations`, async () => {
    const results = [];
    const taskIds = [];
    
    for (let i = 0; i < iterations; i++) {
      const response = await apiClient.submitTask(consistentTask);
      expect(response).toHaveProperty('taskId');
      taskIds.push(response.taskId);
      
      const result = await pollTaskUntilComplete(apiClient, response.taskId);
      results.push(result);
    }
    
    await Promise.all(taskIds.map(taskId => safelyCancelTask(apiClient, taskId)));
    
    const resultSimilarityMatrix = [];
    for (let i = 0; i < results.length; i++) {
      resultSimilarityMatrix[i] = [];
      for (let j = 0; j < results.length; j++) {
        const similarity = calculateSimilarity(results[i], results[j]);
        resultSimilarityMatrix[i][j] = similarity;
      }
    }
    
    const averageSimilarity = calculateAverageSimilarity(resultSimilarityMatrix);
    console.log(`Average similarity across ${iterations} iterations: ${averageSimilarity}`);
    expect(averageSimilarity).toBeGreaterThan(0.8);
  }, config.testTimeout * iterations);
});
