# Scalability Testing Module Documentation

## Overview

The scalability testing module evaluates how well the Devin.ai API handles increasing workloads. It measures the system's ability to scale up or down based on demand, identifying performance bottlenecks and capacity limits.

## Test Files

- `src/tests/scalability/locustfile.py`: Load testing script using Locust

## Key Metrics

- **Load Capacity**: Maximum number of concurrent users before performance degradation
- **Scaling Efficiency**: How performance changes with increased load
- **Resource Scaling**: How resource usage scales with workload
- **Response Time Under Load**: How response time changes as load increases
- **Error Rate Under Load**: How error rate changes as load increases

## Test Cases

### Load Testing with Locust

The `locustfile.py` script defines a simulated user behavior for load testing:

```python
class DevinUser(HttpUser):
    """Simulated user for load testing."""
    
    # Wait time between requests
    wait_time = between(1, 5)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Add authentication header if API key is provided
        if hasattr(self.environment.parsed_options, "api_key"):
            self.client.headers.update({
                "Authorization": f"Bearer {self.environment.parsed_options.api_key}"
            })
    
    @task(10)
    def simple_query(self):
        """Send a random simple query."""
        query = random.choice(SAMPLE_QUERIES)
        with self.client.post(
            "/query", 
            json={"query": query},
            catch_response=True
        ) as response:
            if response.status_code != 200:
                response.failure(f"Failed with status code {response.status_code}")
            else:
                # Check response time against threshold
                response_time_ms = response.elapsed.total_seconds() * 1000
                threshold_ms = CONFIG["performance"]["response_time_threshold_ms"] 
                if response_time_ms > threshold_ms:
                    response.failure(f"Response time {response_time_ms}ms exceeded threshold {threshold_ms}ms")
    
    @task(1)
    def complex_query(self):
        """Send a more complex query that requires more processing."""
        complex_query = """
        Create a Python class for managing a list of tasks with the following features:
        1. Add a task with a title, description, and due date
        2. Mark tasks as complete
        3. Filter tasks by completion status and due date
        """
        self.client.post("/query", json={"query": complex_query})
```

This script simulates users sending both simple and complex queries to the API, with a 10:1 ratio of simple to complex queries.

## Configuration

Scalability tests use the following configuration parameters from `src/config/config.py`:

```python
DEFAULT_CONFIG = {
    "scalability": {
        "max_users": 100,                   # Maximum number of concurrent users
        "ramp_up_time_seconds": 30,         # Time to ramp up to full user load
        "steady_state_time_seconds": 300,   # Time to maintain full user load
    },
    # ... other configuration sections
}
```

## Running Scalability Tests

### Running Locust Tests

To run load tests using Locust:

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

### Running Stress Tests

To run stress tests that gradually increase load until failure:

```bash
cd src/tests/scalability
locust -f locustfile.py --headless -u 1000 -r 20 -t 30m --host=https://api.devin.ai --step-load --step-users=50 --step-time=1m
```

This will increase the user count by 50 every minute until reaching 1000 users or until the system fails.

## Interpreting Results

Locust generates detailed reports including:

- **Request Statistics**: Response times, request counts, and failure rates
- **Response Time Distribution**: Percentile breakdown of response times
- **Requests Per Second**: Throughput over time
- **Number of Users**: User count over time
- **Failures**: Detailed information about failed requests

Key indicators of scalability issues:

- **Increasing Response Times**: Response times that grow linearly or exponentially with user count
- **Increasing Error Rates**: Error rates that grow with user count
- **Resource Saturation**: CPU, memory, or network utilization reaching 100%
- **Throughput Plateau**: Throughput that stops increasing despite increasing user count

## Extending Scalability Tests

To add new scalability tests:

1. Modify the `locustfile.py` to include new user behaviors
2. Create custom load profiles for specific scenarios
3. Add new metrics to track during load testing

Example of adding a new user behavior:

```python
@task(5)
def search_query(self):
    """Send a search query."""
    search_term = random.choice(["Python", "JavaScript", "Docker", "AWS", "React"])
    self.client.post("/search", json={"query": search_term})
```

## Related Modules

- [Performance Testing](./performance.md): Tests API response time and efficiency
- [Reliability Testing](./reliability.md): Tests API availability and fault tolerance
- [API Client](./api_client.md): Documentation for the Devin.ai API client used in tests
