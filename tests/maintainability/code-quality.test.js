const DevinApiClient = require('../../utils/api-client');
const config = require('../../config/config');

describe('Maintainability Tests - Code Quality', () => {
  const apiClient = new DevinApiClient();
  
  test('Devin generates code with acceptable complexity', async () => {
    const task = 'Create a Node.js utility function that sorts an array of objects by multiple properties';
    
    const response = await apiClient.submitTask(task);
    expect(response).toHaveProperty('taskId');
    
    let taskCompleted = false;
    let result;
    
    while (!taskCompleted) {
      const statusResponse = await apiClient.getTaskStatus(response.taskId);
      if (statusResponse.status === 'completed') {
        taskCompleted = true;
        result = statusResponse.result;
      } else if (statusResponse.status === 'failed') {
        throw new Error('Task failed');
      } else {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    const complexity = analyzeCodeComplexity(result);
    
    expect(complexity).toBeLessThan(config.maintainability.codeComplexityThreshold);
    
    await apiClient.cancelTask(response.taskId);
  }, config.testTimeout * 2);
  
  test('Devin generates well-documented code', async () => {
    const task = 'Create a well-documented JavaScript function to validate email addresses';
    
    const response = await apiClient.submitTask(task);
    expect(response).toHaveProperty('taskId');
    
    let taskCompleted = false;
    let result;
    
    while (!taskCompleted) {
      const statusResponse = await apiClient.getTaskStatus(response.taskId);
      if (statusResponse.status === 'completed') {
        taskCompleted = true;
        result = statusResponse.result;
      } else if (statusResponse.status === 'failed') {
        throw new Error('Task failed');
      } else {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    const hasDocumentation = checkForDocumentation(result);
    expect(hasDocumentation).toBe(true);
    
    await apiClient.cancelTask(response.taskId);
  }, config.testTimeout * 2);
});

function analyzeCodeComplexity(code) {
  
  let complexity = 0;
  const lines = code.split('\n');
  
  for (const line of lines) {
    if (line.includes('for ') || line.includes('while ') || 
        line.includes('if ') || line.includes('switch ')) {
      complexity++;
    }
  }
  
  return complexity;
}

function checkForDocumentation(code) {
  
  return code.includes('/**') || code.includes('//');
}
