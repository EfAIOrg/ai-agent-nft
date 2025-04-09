# Test Execution Guide for Devin.ai Non-Functional Testing

This guide provides instructions for running the Devin.ai non-functional tests.

## Prerequisites

Before running tests, ensure you have:

1. Completed the [Setup Guide](./setup_guide.md)
2. Configured the framework as described in the [Configuration Guide](./configuration_guide.md)
3. Activated your virtual environment (if using one)

## Running Tests

### Running All Tests

To run all non-functional tests:

```bash
pytest
```

This will execute all test modules in the `src/tests` directory.

### Running Specific Test Categories

To run tests for a specific non-functional aspect:

```bash
# Run performance tests
pytest src/tests/performance/

# Run security tests
pytest src/tests/security/

# Run scalability tests
pytest src/tests/scalability/

# Run reliability tests
pytest src/tests/reliability/

# Run maintainability tests
pytest src/tests/maintainability/

# Run extensibility tests
pytest src/tests/extensibility/

# Run observability tests
pytest src/tests/observability/

# Run manageability tests
pytest src/tests/manageability/

# Run recovery tests
pytest src/tests/recovery/
```

### Running Individual Test Files

To run a specific test file:

```bash
pytest src/tests/performance/test_response_time.py
```

### Running Specific Test Methods

To run a specific test method:

```bash
pytest src/tests/performance/test_response_time.py::TestResponseTime::test_simple_query_response_time
```

## Test Options

### Verbose Output

For more detailed test output:

```bash
pytest -v
```

### Parallel Test Execution

To run tests in parallel (faster execution):

```bash
pytest -xvs -n auto
```

This uses the `pytest-xdist` plugin to distribute tests across multiple processes.

### Generating Reports

To generate an HTML report:

```bash
pytest --html=reports/report.html
```

For code coverage reports:

```bash
pytest --cov=src --cov-report=html
```

### Filtering Tests

To run tests matching a specific pattern:

```bash
pytest -k "response_time"
```

This will run all tests with "response_time" in their names.

## Special Test Types

### Load Testing with Locust

For load testing using Locust:

```bash
cd src/tests/scalability
locust -f locustfile.py --headless -u 100 -r 10 -t 5m --host=https://api.devin.ai
```

Parameters:
- `-u 100`: Simulate 100 users
- `-r 10`: Spawn 10 users per second
- `-t 5m`: Run for 5 minutes
- `--host`: Target host URL

For the web interface, omit the `--headless` flag and access the Locust UI at http://localhost:8089.

### Security Scanning

To run security scans:

```bash
# Run Bandit for Python code security analysis
bandit -r src/

# Run Safety to check dependencies for vulnerabilities
safety check -r requirements.txt
```

## Environment-Specific Testing

### Testing Against Different Environments

To test against different environments, update the API URL:

```bash
# Test against development environment
pytest --api-url=https://dev-api.devin.ai

# Test against staging environment
pytest --api-url=https://staging-api.devin.ai

# Test against production environment
pytest --api-url=https://api.devin.ai
```

### Testing with Different API Keys

To test with different API keys:

```bash
pytest --api-key=your_api_key_here
```

## Continuous Integration

The repository includes GitHub Actions workflows for automated testing. These workflows run:

1. On every push to the main branch
2. On every pull request to the main branch
3. On a daily schedule
4. Manually via workflow dispatch

To view the workflow configuration, see `.github/workflows/run-tests.yml`.

## Troubleshooting

### Common Test Failures

1. **API Connection Issues**
   - Check your internet connection
   - Verify API key is valid
   - Ensure API endpoint is accessible

2. **Timeout Errors**
   - Increase test timeout settings
   - Check if the API is experiencing high load

3. **Assertion Failures**
   - Review test thresholds in configuration
   - Check if API behavior has changed

### Debugging Tests

For detailed debugging:

```bash
pytest --pdb
```

This will drop into the Python debugger on test failures.

## Next Steps

After running tests, proceed to the [Reporting Guide](./reporting_guide.md) to learn how to interpret test results and generate reports.
