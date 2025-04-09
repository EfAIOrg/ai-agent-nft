"""Tests for measuring Devin.ai response time."""
import pytest
from src.utils.api_client import DevinClient
from src.config.config import CONFIG

RESPONSE_TIME_THRESHOLD = CONFIG["performance"]["response_time_threshold_ms"] / 1000  # convert to seconds

@pytest.fixture
def api_client(api_url, api_key):
    """Create API client fixture."""
    return DevinClient(
        base_url=api_url,
        api_key=api_key
    )

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
        result = benchmark(
            api_client.send_query,
            query=query
        )
        
        assert result["status_code"] == 200, f"Failed with status {result['status_code']}"
        
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
        
        assert result["status_code"] == 200, f"Failed with status {result['status_code']}"
        
        assert result["response_time"] < RESPONSE_TIME_THRESHOLD * 3, \
            f"Response time {result['response_time']}s exceeds threshold {RESPONSE_TIME_THRESHOLD * 3}s"
