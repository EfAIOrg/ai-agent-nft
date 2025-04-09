# Performance Testing Module Documentation

## Overview

The performance testing module evaluates how quickly and efficiently the Devin.ai API responds to requests. It measures response times, throughput, and resource utilization under various conditions to ensure the API meets performance requirements.

## Test Files

- `src/tests/performance/test_response_time.py`: Tests API response time for various query types

## Key Metrics

- **Response Time**: Time taken for the API to respond to a request
- **Throughput**: Number of requests processed per unit of time
- **Resource Utilization**: CPU, memory, and network usage during request processing

## Test Cases

### Response Time Tests

The `TestResponseTime` class in `test_response_time.py` contains tests that measure the response time of the Devin.ai API for different types of queries:

```python
class TestResponseTime:
    """Response time test cases."""
    
    @pytest.mark.parametrize("query", [
        "What is the capital of France?",
        "Write a simple Python function to calculate factorial",
        "Explain the difference between REST and GraphQL",
        "How do I fix a memory leak in a Node.js application?",
        "Create a React component for a login form",
    ])
    def test_simple_query_response_time(self, api_client, query, benchmark):
        """Test response time for simple queries."""
        # Using pytest-benchmark to measure response time
        result = benchmark(
            api_client.send_query,
            query=query
        )
        
        # Assert response status
        assert result["status_code"] == 200, f"Failed with status {result['status_code']}"
        
        # Assert response time is within threshold
        assert result["response_time"] < RESPONSE_TIME_THRESHOLD, \
            f"Response time {result['response_time']}s exceeds threshold {RESPONSE_TIME_THRESHOLD}s"
    
    def test_complex_query_response_time(self, api_client, benchmark):
        """Test response time for a complex query."""
        complex_query = """
        Create a Python class for managing a list of tasks with the following features:
        1. Add a task with a title, description, and due date
        2. Mark tasks as complete
        3. Filter tasks by completion status and due date
        4. Sort tasks by due date
        5. Export tasks to JSON
        """
        
        result = benchmark(
            api_client.send_query,
            query=complex_query
        )
        
        # Assert response status
        assert result["status_code"] == 200, f"Failed with status {result['status_code']}"
        
        # For complex queries, we might allow a longer response time
        assert result["response_time"] < RESPONSE_TIME_THRESHOLD * 3, \
            f"Response time {result['response_time']}s exceeds threshold {RESPONSE_TIME_THRESHOLD * 3}s"
```

## Configuration

Performance tests use the following configuration parameters from `src/config/config.py`:

```python
DEFAULT_CONFIG = {
    "performance": {
        "response_time_threshold_ms": 1000,  # Maximum acceptable response time in milliseconds
        "concurrent_users": 10,              # Number of concurrent users for load testing
        "test_duration_seconds": 60,         # Duration of performance tests
    },
    # ... other configuration sections
}
```

## Running Performance Tests

To run all performance tests:

```bash
pytest src/tests/performance/
```

To run a specific performance test:

```bash
pytest src/tests/performance/test_response_time.py::TestResponseTime::test_simple_query_response_time
```

## Interpreting Results

Performance test results include:

- **Pass/Fail Status**: Whether the API met the performance thresholds
- **Response Time Statistics**: Min, max, mean, median, and percentile response times
- **Benchmark Comparison**: Comparison with previous benchmark results (if available)

## Extending Performance Tests

To add new performance tests:

1. Create a new test file in the `src/tests/performance/` directory
2. Import the necessary modules and fixtures
3. Define test cases that measure specific performance aspects
4. Use the `benchmark` fixture to measure performance metrics
5. Assert that the results meet the defined thresholds

Example of a new performance test:

```python
def test_concurrent_requests_performance(api_client, benchmark):
    """Test performance under concurrent requests."""
    def make_concurrent_requests():
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(api_client.send_query, query="Simple query") for _ in range(10)]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
        return results
    
    results = benchmark(make_concurrent_requests)
    
    # Assert all requests succeeded
    assert all(result["status_code"] == 200 for result in results)
    
    # Calculate average response time
    avg_response_time = sum(result["response_time"] for result in results) / len(results)
    
    # Assert average response time is within threshold
    assert avg_response_time < RESPONSE_TIME_THRESHOLD * 1.5, \
        f"Average response time {avg_response_time}s exceeds threshold {RESPONSE_TIME_THRESHOLD * 1.5}s"
```

## Related Modules

- [Scalability Testing](./scalability.md): Tests how the API performs under increasing load
- [API Client](./api_client.md): Documentation for the Devin.ai API client used in tests
