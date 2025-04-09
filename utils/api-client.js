const axios = require('axios');
const config = require('../config/config');

class DevinApiClient {
  constructor(baseUrl = config.apiUrl, authToken = config.authToken) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      timeout: config.testTimeout
    });
    
    this.adminClient = axios.create({
      baseURL: config.manageability.adminApiUrl,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      timeout: config.testTimeout
    });
    
    this.retryCount = 0;
    this.maxRetries = config.recovery.maxRetries;
    this.retryDelay = config.recovery.retryDelayMs;
  }

  /**
   * Execute an API request with retry logic
   * @param {Function} apiCall - Function that returns a promise for the API call
   * @param {string} operationName - Name of the operation for logging
   * @returns {Promise<any>} - Response data from the API
   */
  async executeWithRetry(apiCall, operationName) {
    try {
      const response = await apiCall();
      this.resetRetryCount(); // Reset retry count on success
      return response.data;
    } catch (error) {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Retrying ${operationName} (${this.retryCount}/${this.maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.executeWithRetry(apiCall, operationName);
      }
      console.error(`Error in ${operationName}:`, error);
      this.resetRetryCount(); // Reset retry count after max retries
      throw error;
    }
  }

  async submitTask(taskDescription) {
    return this.executeWithRetry(
      () => this.client.post('/tasks', { description: taskDescription }),
      'submitTask'
    );
  }

  async getTaskStatus(taskId) {
    return this.executeWithRetry(
      () => this.client.get(`/tasks/${taskId}`),
      'getTaskStatus'
    );
  }

  async cancelTask(taskId) {
    return this.executeWithRetry(
      () => this.client.delete(`/tasks/${taskId}`),
      'cancelTask'
    );
  }

  async getMetrics() {
    return this.executeWithRetry(
      () => this.client.get(config.observability.metricsEndpoint),
      'getMetrics'
    );
  }

  async getLogs() {
    return this.executeWithRetry(
      () => this.client.get(config.observability.logsEndpoint),
      'getLogs'
    );
  }

  async getAdminStatus() {
    return this.executeWithRetry(
      () => this.adminClient.get('/status'),
      'getAdminStatus'
    );
  }

  resetRetryCount() {
    this.retryCount = 0;
  }
}

module.exports = DevinApiClient;
