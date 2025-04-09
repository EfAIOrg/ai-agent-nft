# Reliability Testing Module Documentation

## Overview

The reliability testing module evaluates how dependable the Devin.ai API is over time. It tests the system's ability to maintain consistent performance, handle failures gracefully, and recover from errors to ensure high availability and fault tolerance.

## Test Files

- `src/tests/reliability/test_availability.py`: Tests API availability and fault tolerance

## Key Metrics

- **Availability**: Percentage of time the service is operational
- **Error Rate**: Frequency of failures during normal operation
- **Recovery Time**: Time to recover from failures
- **Consistency**: Consistency of results across multiple requests
- **Fault Tolerance**: Ability to handle partial system failures

## Test Cases

### Availability Tests

The `TestAvailability` class contains tests that evaluate the API's continuous availability and fault tolerance:

```python
class TestAvailability:
    """Test cases for system availability."""
    
    def test_continuous_availability(self, api_client):
        """Test continuous availability over an extended period."""
        # Configuration
        test_duration = 3600  # 1 hour (adjust as needed)
        check_interval = 10   # seconds
        expected_availability = CONFIG["reliability"]["expected_availability_percent"] / 100
        
        start_time = time.time()
        end_time = start_time + test_duration
        
        success_count = 0
        total_count = 0
        
        while time.time() < end_time:
            total_count += 1
            result = api_client.send_query(query="Simple availability check query")
            
            if result["status_code"] == 200:
                success_count += 1
            
            # Sleep until next check
            time.sleep(check_interval)
        
        # Calculate availability percentage
        availability = success_count / total_count if total_count > 0 else 0
        
        # Assert availability meets or exceeds expected threshold
        assert availability >= expected_availability, \
            f"Availability {availability:.2%} is below expected {expected_availability:.2%}"
    
    def test_fault_tolerance(self, api_client):
        """Test system's ability to handle concurrent load without failure."""
        # Number of concurrent requests
        concurrent_requests = 20
        queries = ["Simple query" for _ in range(concurrent_requests)]
        
        # Use ThreadPoolExecutor to send concurrent requests
        with concurrent.futures.ThreadPoolExecutor(max_workers=concurrent_requests) as executor:
            futures = [executor.submit(api_client.send_query, query=query) for query in queries]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
        
        # Count successful responses
        success_count = sum(1 for result in results if result["status_code"] == 200)
        
        # Assert that most requests were successful (allowing for some failures)
        assert success_count >= concurrent_requests * 0.9, \
            f"Only {success_count} of {concurrent_requests} requests succeeded"
```

## Configuration

Reliability tests use the following configuration parameters from `src/config/config.py`:

```python
DEFAULT_CONFIG = {
    "reliability": {
        "test_duration_hours": 24,              # Duration of long-running reliability tests
        "expected_availability_percent": 99.9,  # Expected system availability percentage
        "max_errors_per_minute": 1,             # Maximum acceptable error rate
    },
    # ... other configuration sections
}
```

## Running Reliability Tests

To run all reliability tests:

```bash
pytest src/tests/reliability/
```

To run a specific reliability test:

```bash
pytest src/tests/reliability/test_availability.py::TestAvailability::test_continuous_availability
```

### Long-Running Tests

Some reliability tests are designed to run for extended periods. For these tests, you can adjust the test duration:

```bash
# Run with a shorter duration for quick testing
RELIABILITY_TEST_DURATION_MINUTES=5 pytest src/tests/reliability/test_availability.py::TestAvailability::test_continuous_availability

# Run with full duration for comprehensive testing
pytest src/tests/reliability/test_availability.py::TestAvailability::test_continuous_availability
```

## Interpreting Results

Reliability test results include:

- **Availability Percentage**: Percentage of successful requests
- **Error Patterns**: Patterns in errors that occurred during testing
- **Recovery Metrics**: How quickly the system recovered from failures
- **Consistency Metrics**: How consistent results were across requests

Key indicators of reliability issues:

- **Low Availability**: Availability below the expected threshold
- **High Error Rate**: More errors than the acceptable threshold
- **Slow Recovery**: Recovery time exceeding the acceptable threshold
- **Inconsistent Results**: Results that vary significantly across identical requests

## Extending Reliability Tests

To add new reliability tests:

1. Create a new test file in the `src/tests/reliability/` directory
2. Import the necessary modules and fixtures
3. Define test cases that evaluate specific reliability aspects
4. Assert that the results meet the defined thresholds

Example of a new reliability test:

```python
def test_error_recovery(api_client):
    """Test recovery from errors."""
    # First, send a malformed request to trigger an error
    error_result = api_client.send_query(query={"malformed": "request"})
    
    # Then, send a valid request to check recovery
    valid_result = api_client.send_query(query="Valid request after error")
    
    # Assert that the system recovered and processed the valid request
    assert valid_result["status_code"] == 200, \
        f"System did not recover from error, got status {valid_result['status_code']}"
```

## Related Modules

- [Performance Testing](./performance.md): Tests API response time and efficiency
- [Recovery Testing](./recovery.md): Tests backup, restore, and disaster recovery
- [API Client](./api_client.md): Documentation for the Devin.ai API client used in tests
