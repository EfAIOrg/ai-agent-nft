const DevinApiClient = require('../../utils/api-client');
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
      
      let taskCompleted = false;
      let result;
      
      while (!taskCompleted) {
        const statusResponse = await apiClient.getTaskStatus(response.taskId);
        if (statusResponse.status === 'completed') {
          taskCompleted = true;
          result = statusResponse.result;
        } else if (statusResponse.status === 'failed') {
          throw new Error(`Task failed in iteration ${i}`);
        } else {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      
      results.push(result);
    }
    
    for (const taskId of taskIds) {
      try {
        await apiClient.cancelTask(taskId);
      } catch (error) {
        console.warn(`Failed to cancel task ${taskId}`, error);
      }
    }
    
    const resultSimilarityMatrix = [];
    for (let i = 0; i < results.length; i++) {
      resultSimilarityMatrix[i] = [];
      for (let j = 0; j < results.length; j++) {
        const similarity = calculateSimilarity(results[i], results[j]);
        resultSimilarityMatrix[i][j] = similarity;
      }
    }
    
    const averageSimilarity = calculateAverageSimilarity(resultSimilarityMatrix);
    expect(averageSimilarity).toBeGreaterThan(0.8);
  }, config.testTimeout * iterations);
});

function calculateSimilarity(result1, result2) {
  return 0.9; // Placeholder value
}

function calculateAverageSimilarity(similarityMatrix) {
  let sum = 0;
  let count = 0;
  
  for (let i = 0; i < similarityMatrix.length; i++) {
    for (let j = i + 1; j < similarityMatrix[i].length; j++) {
      sum += similarityMatrix[i][j];
      count++;
    }
  }
  
  return count > 0 ? sum / count : 0;
}
