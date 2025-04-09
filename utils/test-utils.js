/**
 * Common test utilities for Devin API tests
 */
const config = require('../config/config');

/**
 * Polls a task until it reaches a completed or failed state
 * @param {Object} apiClient - Instance of DevinApiClient
 * @param {string} taskId - ID of the task to poll
 * @param {number} pollInterval - Interval between polls in ms (default: 5000)
 * @param {number} timeout - Maximum time to poll in ms (default: config.testTimeout)
 * @returns {Promise<Object>} - Task result
 */
async function pollTaskUntilComplete(apiClient, taskId, pollInterval = 5000, timeout = config.testTimeout) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const statusResponse = await apiClient.getTaskStatus(taskId);
    
    if (statusResponse.status === 'completed') {
      return statusResponse.result;
    } else if (statusResponse.status === 'failed') {
      throw new Error(`Task ${taskId} failed: ${statusResponse.error || 'Unknown error'}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  
  throw new Error(`Task ${taskId} timed out after ${timeout}ms`);
}

/**
 * Safely cancels a task, logging but not throwing errors
 * @param {Object} apiClient - Instance of DevinApiClient
 * @param {string} taskId - ID of the task to cancel
 */
async function safelyCancelTask(apiClient, taskId) {
  try {
    await apiClient.cancelTask(taskId);
  } catch (error) {
    console.warn(`Failed to cancel task ${taskId}:`, error.message);
  }
}

/**
 * Calculates similarity between two strings or objects
 * @param {any} result1 - First result to compare
 * @param {any} result2 - Second result to compare
 * @returns {number} - Similarity score between 0 and 1
 */
function calculateSimilarity(result1, result2) {
  if (typeof result1 === 'string' && typeof result2 === 'string') {
    return calculateStringSimilarity(result1, result2);
  }
  
  try {
    const str1 = JSON.stringify(result1);
    const str2 = JSON.stringify(result2);
    return calculateStringSimilarity(str1, str2);
  } catch (error) {
    console.warn('Error comparing objects:', error.message);
    return 0;
  }
}

/**
 * Calculates similarity between two strings using Levenshtein distance
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Similarity score between 0 and 1
 */
function calculateStringSimilarity(str1, str2) {
  if (!str1 && !str2) return 1;
  if (!str1 || !str2) return 0;
  
  const len1 = str1.length;
  const len2 = str2.length;
  
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(len1, len2);
  
  return 1 - (distance / maxLength);
}

/**
 * Calculates Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Levenshtein distance
 */
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  
  const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));
  
  for (let i = 0; i <= len1; i++) {
    matrix[i][0] = i;
  }
  
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return matrix[len1][len2];
}

/**
 * Calculates average similarity from a similarity matrix
 * @param {Array<Array<number>>} similarityMatrix - Matrix of similarity scores
 * @returns {number} - Average similarity score
 */
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

module.exports = {
  pollTaskUntilComplete,
  safelyCancelTask,
  calculateSimilarity,
  calculateAverageSimilarity
};
