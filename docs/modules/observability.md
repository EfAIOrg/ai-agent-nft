# Observability Testing Module Documentation

## Overview

The observability testing module evaluates how well the Devin.ai API can be monitored and debugged. It tests logging, metrics collection, and tracing capabilities to ensure the system provides sufficient visibility into its internal operations.

## Test Files

- `src/tests/observability/test_logging.py`: Tests logging format and content

## Key Metrics

- **Logging Quality**: Completeness and usefulness of logs
- **Metrics Collection**: Availability and accuracy of performance metrics
- **Tracing Capabilities**: Ability to trace requests through the system
- **Alerting Mechanisms**: Effectiveness of alerting for critical issues
- **Debugging Tools**: Availability of tools for debugging issues

## Test Cases

### Logging Tests

The `TestLogging` class contains tests that evaluate logging format and content:

```python
class TestLogging:
    """Test cases for logging and observability."""
    
    def test_log_format(self):
        """Test log format includes required fields."""
        # Path to log file or log endpoint
        log_path = pytest.config.getoption("--log-path", None)
        if not log_path:
            pytest.skip("Log path not provided")
            
        try:
            # If it's a URL, fetch logs via API
            if log_path.startswith("http"):
                response = requests.get(
                    log_path,
                    headers={"Authorization": f"Bearer {pytest.config.getoption('--api-key')}"}
                )
                response.raise_for_status()
                log_entries = response.json()
            else:
                # Otherwise read from file
                with open(log_path, 'r') as f:
                    log_content = f.read()
                    # Try to parse as JSON Lines
                    try:
                        log_entries = [json.loads(line) for line in log_content.strip().split('\n')]
                    except json.JSONDecodeError:
                        # If not JSON, treat as plain text and just check format
                        log_entries = log_content.strip().split('\n')
        except (FileNotFoundError, requests.exceptions.RequestException):
            pytest.skip("Could not access log content")
            return
            
        # Define expected log fields (adjust based on actual logging format)
        required_fields = ['timestamp', 'level', 'message']
        
        if isinstance(log_entries, list) and log_entries and isinstance(log_entries[0], dict):
            # JSON format logs
            for entry in log_entries[:10]:  # Check first 10 entries
                for field in required_fields:
                    assert field in entry, f"Log entry missing required field '{field}'"
        else:
            # Text format logs
            timestamp_pattern = r'\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}'
            level_pattern = r'(DEBUG|INFO|WARNING|ERROR|CRITICAL)'
            
            # Check first 10 entries
            for entry in log_entries[:10]:
                # Verify timestamp exists
                assert re.search(timestamp_pattern, entry), f"Log entry missing timestamp: {entry}"
                # Verify log level exists
                assert re.search(level_pattern, entry), f"Log entry missing log level: {entry}"
    
    def test_metrics_endpoint(self, api_client):
        """Test metrics endpoint availability and format."""
        try:
            response = api_client.session.get(f"{api_client.base_url}/metrics")
            response.raise_for_status()
            
            metrics_data = response.json()
            
            # Verify basic metrics information is available
            assert "metrics" in metrics_data, "API response missing metrics information"
            
            # Check for essential metrics categories
            essential_categories = ["performance", "errors", "usage"]
            for category in essential_categories:
                assert category in metrics_data["metrics"], f"Metrics missing essential category: {category}"
                
        except requests.exceptions.RequestException:
            pytest.skip("Metrics endpoint not available")
```

## Configuration

Observability tests use the following configuration parameters from `src/config/config.py`:

```python
DEFAULT_CONFIG = {
    "observability": {
        "min_log_level": "info",           # Minimum log level to record
        "metrics_retention_days": 30,       # Number of days to retain metrics
        "trace_sampling_rate": 0.1,         # Percentage of requests to trace
    },
    # ... other configuration sections
}
```

## Running Observability Tests

To run all observability tests:

```bash
pytest src/tests/observability/
```

To run a specific observability test:

```bash
pytest src/tests/observability/test_logging.py::TestLogging::test_log_format
```

### Testing with Different Log Sources

To test with different log sources:

```bash
# Test with a log file
pytest src/tests/observability/test_logging.py --log-path=/path/to/logs/devin.log

# Test with a log endpoint
pytest src/tests/observability/test_logging.py --log-path=https://api.devin.ai/logs
```

## Interpreting Results

Observability test results include:

- **Log Format Compliance**: Whether logs follow the expected format
- **Required Field Presence**: Whether logs contain all required fields
- **Metrics Availability**: Whether metrics endpoints are available
- **Metrics Completeness**: Whether metrics include all essential categories

Key indicators of observability issues:

- **Missing Log Fields**: Logs missing required fields
- **Inconsistent Log Format**: Logs with inconsistent format
- **Missing Metrics**: Metrics missing essential categories
- **Unavailable Endpoints**: Metrics or logging endpoints not available

## Extending Observability Tests

To add new observability tests:

1. Create a new test file in the `src/tests/observability/` directory
2. Import the necessary modules and fixtures
3. Define test cases that evaluate specific observability aspects
4. Assert that the results meet the defined requirements

Example of a new observability test:

```python
def test_tracing_capabilities(self, api_client):
    """Test distributed tracing capabilities."""
    # Generate a trace ID
    trace_id = str(uuid.uuid4())
    
    # Send a request with the trace ID
    result = api_client.send_query(
        query="Test query",
        headers={"X-Trace-ID": trace_id}
    )
    
    # Assert the request succeeded
    assert result["status_code"] == 200, f"Request failed with status {result['status_code']}"
    
    # Check if the trace is available in the tracing system
    try:
        response = api_client.session.get(
            f"{api_client.base_url}/traces/{trace_id}"
        )
        response.raise_for_status()
        
        trace_data = response.json()
        
        # Verify trace information is available
        assert "spans" in trace_data, "Trace missing spans information"
        assert len(trace_data["spans"]) > 0, "Trace contains no spans"
        
    except requests.exceptions.RequestException:
        pytest.skip("Tracing endpoint not available")
```

## Related Modules

- [Reliability Testing](./reliability.md): Tests API availability and fault tolerance
- [Manageability Testing](./manageability.md): Tests configuration and resource management
- [API Client](./api_client.md): Documentation for the Devin.ai API client used in tests
