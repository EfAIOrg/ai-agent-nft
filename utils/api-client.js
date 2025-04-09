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
    this.retryCount = 0;
    this.maxRetries = config.recovery.maxRetries;
    this.retryDelay = config.recovery.retryDelayMs;
  }

  async submitTask(taskDescription) {
    try {
      const response = await this.client.post('/v1/sessions', {
        prompt: taskDescription,
        snapshot_id: "snapshot-9918e79f495949009348fd97b0ff5091" // Default snapshot ID, can be made configurable
      });
      
      return {
        taskId: response.data.session_id,
        url: response.data.url
      };
    } catch (error) {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Retrying submitTask (${this.retryCount}/${this.maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.submitTask(taskDescription);
      }
      console.error('Error submitting task:', error);
      throw error;
    }
  }

  async getTaskStatus(taskId) {
    try {
      const response = await this.client.get(`/v1/sessions/${taskId}`);
      
      return {
        status: response.data.status || 'in_progress',
        result: response.data.result || {}
      };
    } catch (error) {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Retrying getTaskStatus (${this.retryCount}/${this.maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.getTaskStatus(taskId);
      }
      console.error('Error getting task status:', error);
      throw error;
    }
  }

  async cancelTask(taskId) {
    try {
      const response = await this.client.delete(`/v1/sessions/${taskId}`);
      
      return {
        success: true,
        message: 'Task cancelled successfully'
      };
    } catch (error) {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Retrying cancelTask (${this.retryCount}/${this.maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.cancelTask(taskId);
      }
      console.error('Error canceling task:', error);
      throw error;
    }
  }

  async getMetrics() {
    try {
      const response = await this.client.get(`/v1${config.observability.metricsEndpoint}`);
      return response.data;
    } catch (error) {
      console.error('Error getting metrics:', error);
      throw error;
    }
  }

  async getLogs() {
    try {
      const response = await this.client.get(`/v1${config.observability.logsEndpoint}`);
      return response.data;
    } catch (error) {
      console.error('Error getting logs:', error);
      throw error;
    }
  }

  async getAdminStatus() {
    try {
      const adminClient = axios.create({
        baseURL: config.manageability.adminApiUrl,
        headers: {
          'Authorization': `Bearer ${config.authToken}`,
          'Content-Type': 'application/json'
        },
        timeout: config.testTimeout
      });
      
      const response = await adminClient.get('/v1/status');
      return response.data;
    } catch (error) {
      console.error('Error getting admin status:', error);
      throw error;
    }
  }

  resetRetryCount() {
    this.retryCount = 0;
  }
}

module.exports = DevinApiClient;
