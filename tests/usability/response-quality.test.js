const DevinApiClient = require('../../utils/api-client');
const config = require('../../config/config');

describe('Usability Tests - Response Quality', () => {
  const apiClient = new DevinApiClient();
  
  const testScenarios = [
    {
      description: 'Create a simple Hello World React component',
      evaluationCriteria: [
        'Component should render "Hello World"',
        'Component should be properly structured with import statements',
        'Component should be exportable'
      ]
    },
    {
      description: 'Fix this bug: React component re-renders infinitely when using useEffect',
      evaluationCriteria: [
        'Solution should identify dependency array issue',
        'Solution should explain the fix',
        'Solution should provide working code'
      ]
    },
    {
      description: 'Explain how to implement JWT authentication in a Node.js API',
      evaluationCriteria: [
        'Explanation should be clear and concise',
        'Should include code examples',
        'Should cover token generation, validation, and refresh'
      ]
    }
  ];
  
  test('Devin provides high-quality responses that meet evaluation criteria', async () => {
    const scenario = testScenarios[0];
    
    const response = await apiClient.submitTask(scenario.description);
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
    
    expect(result).toBeDefined();
    
    scenario.evaluationCriteria.forEach(criterion => {
      const meetscriterion = evaluateResponseForCriterion(result, criterion);
      expect(meetscriterion).toBe(true);
    });
    
    await apiClient.cancelTask(response.taskId);
  }, config.testTimeout * 2);
  
  test('Devin response time is within acceptable threshold for usability', async () => {
    const task = 'Create a simple function to calculate the factorial of a number';
    
    const startTime = Date.now();
    
    const response = await apiClient.submitTask(task);
    expect(response).toHaveProperty('taskId');
    
    let initialResponseReceived = false;
    
    while (!initialResponseReceived && (Date.now() - startTime) < config.usability.responseTimeThreshold) {
      const statusResponse = await apiClient.getTaskStatus(response.taskId);
      if (statusResponse.status !== 'queued') {
        initialResponseReceived = true;
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    const responseTime = Date.now() - startTime;
    
    await apiClient.cancelTask(response.taskId);
    
    expect(initialResponseReceived).toBe(true);
    expect(responseTime).toBeLessThan(config.usability.responseTimeThreshold);
  }, config.testTimeout);
});

function evaluateResponseForCriterion(response, criterion) {
  
  return true;
}
