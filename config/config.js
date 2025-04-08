module.exports = {
  apiUrl: process.env.DEVIN_API_URL || 'https://api.devin.ai',
  authToken: process.env.DEVIN_AUTH_TOKEN,
  testTimeout: process.env.TEST_TIMEOUT || 60000,
  performance: {
    concurrentUsers: process.env.CONCURRENT_USERS || 5,
    testDuration: process.env.TEST_DURATION || '1m',
    rampUpTime: process.env.RAMP_UP_TIME || '10s',
  },
  reliability: {
    testIterations: process.env.TEST_ITERATIONS || 10,
    errorThreshold: process.env.ERROR_THRESHOLD || 0.01,
    recoveryTimeThreshold: process.env.RECOVERY_TIME_THRESHOLD || 5000,
  },
  security: {
    scanTimeout: process.env.SCAN_TIMEOUT || 300000,
  },
  scalability: {
    maxConcurrentRequests: process.env.MAX_CONCURRENT_REQUESTS || 50,
    stepSize: process.env.STEP_SIZE || 5,
  },
  usability: {
    responseTimeThreshold: process.env.RESPONSE_TIME_THRESHOLD || 2000,
  },
  maintainability: {
    codeComplexityThreshold: process.env.CODE_COMPLEXITY_THRESHOLD || 10,
  },
  extensibility: {
    apiVersionSupport: process.env.API_VERSION_SUPPORT || 'v1',
  },
  observability: {
    metricsEndpoint: process.env.METRICS_ENDPOINT || '/metrics',
    logsEndpoint: process.env.LOGS_ENDPOINT || '/logs',
  },
  manageability: {
    adminApiUrl: process.env.ADMIN_API_URL || 'https://admin.devin.ai',
  },
  recovery: {
    maxRetries: process.env.MAX_RETRIES || 3,
    retryDelayMs: process.env.RETRY_DELAY_MS || 1000,
  }
};
