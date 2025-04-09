# Manageability Testing Module Documentation

## Overview

The manageability testing module evaluates how easily the Devin.ai API can be configured, administered, and managed. It tests configuration management, resource management, and administrative capabilities to ensure the system can be effectively operated and maintained.

## Test Files

- `src/tests/manageability/test_configuration.py`: Tests configuration management capabilities

## Key Metrics

- **Configuration Management**: Ease of changing and validating configuration
- **Resource Management**: Ability to manage system resources
- **User Management**: Ease of managing users and permissions
- **Administrative Controls**: Availability and effectiveness of administrative controls
- **Operational Procedures**: Clarity and effectiveness of operational procedures

## Test Cases

### Configuration Management Tests

The `TestConfigurationManagement` class contains tests that evaluate configuration management capabilities:

```python
class TestConfigurationManagement:
    """Test cases for configuration management."""
    
    def test_config_validation(self, api_client):
        """Test configuration validation."""
        invalid_config = {
            "performance": {
                "response_time_threshold_ms": "not_a_number",  # Invalid type
            }
        }
        
        try:
            response = api_client.session.post(
                f"{api_client.base_url}/config",
                json=invalid_config
            )
            
            assert response.status_code in (400, 422), \
                f"Expected validation error (400/422), got {response.status_code}"
                
            error_data = response.json()
            assert "error" in error_data, "Error response missing error information"
            assert "validation" in error_data["error"].lower(), \
                f"Error message does not indicate validation issue: {error_data['error']}"
                
        except requests.exceptions.RequestException:
            pytest.skip("Config endpoint not available")
    
    def test_resource_limits(self, api_client):
        """Test resource limit enforcement."""
        try:
            response = api_client.session.get(f"{api_client.base_url}/limits")
            response.raise_for_status()
            
            limits_data = response.json()
            
            assert "limits" in limits_data, "API response missing limits information"
            
            essential_limits = ["requests_per_minute", "max_query_length", "max_concurrent_requests"]
            for limit in essential_limits:
                assert limit in limits_data["limits"], f"Limits missing essential category: {limit}"
                
            if CONFIG["manageability"]["resource_limit_enforcement"]:
                assert limits_data.get("enforcement_enabled", False), \
                    "Resource limit enforcement is disabled but should be enabled"
                
        except requests.exceptions.RequestException:
            pytest.skip("Limits endpoint not available")
    
    def test_dynamic_configuration(self, api_client):
        """Test dynamic configuration updates."""
        test_config = {
            "logging": {
                "level": "DEBUG"
            }
        }
        
        try:
            get_response = api_client.session.get(f"{api_client.base_url}/config")
            get_response.raise_for_status()
            original_config = get_response.json()
            
            update_response = api_client.session.post(
                f"{api_client.base_url}/config",
                json=test_config
            )
            update_response.raise_for_status()
            
            get_updated_response = api_client.session.get(f"{api_client.base_url}/config")
            get_updated_response.raise_for_status()
            updated_config = get_updated_response.json()
            
            assert updated_config.get("logging", {}).get("level") == "DEBUG", \
                "Configuration update was not applied"
                
            api_client.session.post(
                f"{api_client.base_url}/config",
                json=original_config
            )
                
        except requests.exceptions.RequestException:
            pytest.skip("Config endpoint not available or does not support updates")
```

## Configuration

Manageability tests use the following configuration parameters from `src/config/config.py`:

```python
DEFAULT_CONFIG = {
    "manageability": {
        "config_validation_level": "strict",  # Level of configuration validation
        "resource_limit_enforcement": True,    # Whether resource limits should be enforced
    },
    # ... other configuration sections
}
```

## Running Manageability Tests

To run all manageability tests:

```bash
pytest src/tests/manageability/
```

To run a specific manageability test:

```bash
pytest src/tests/manageability/test_configuration.py::TestConfigurationManagement::test_config_validation
```

## Interpreting Results

Manageability test results include:

- **Configuration Validation**: Whether the API validates configuration properly
- **Resource Limit Enforcement**: Whether the API enforces resource limits
- **Dynamic Configuration**: Whether the API supports dynamic configuration updates
- **Administrative Controls**: Whether administrative controls are available and effective

Key indicators of manageability issues:

- **Poor Configuration Validation**: API does not properly validate configuration
- **Missing Resource Limits**: API does not enforce resource limits
- **Static Configuration**: API does not support dynamic configuration updates
- **Limited Administrative Controls**: API does not provide sufficient administrative controls

## Extending Manageability Tests

To add new manageability tests:

1. Create a new test file in the `src/tests/manageability/` directory
2. Import the necessary modules and fixtures
3. Define test cases that evaluate specific manageability aspects
4. Assert that the results meet the defined requirements

Example of a new manageability test:

```python
def test_user_management(self, api_client):
    """Test user management capabilities."""
    # Check if there's a user management endpoint
    try:
        response = api_client.session.get(f"{api_client.base_url}/users")
        response.raise_for_status()
        
        users_data = response.json()
        
        # Verify user information is available
        assert "users" in users_data, "API response missing users information"
        assert isinstance(users_data["users"], list), "Users should be a list"
        
        # Create a test user
        test_user = {
            "username": f"test_user_{int(time.time())}",
            "email": f"test_{int(time.time())}@example.com",
            "role": "viewer"
        }
        
        create_response = api_client.session.post(
            f"{api_client.base_url}/users",
            json=test_user
        )
        create_response.raise_for_status()
        
        # Verify user was created
        get_response = api_client.session.get(f"{api_client.base_url}/users")
        get_response.raise_for_status()
        updated_users_data = get_response.json()
        
        assert any(user["username"] == test_user["username"] for user in updated_users_data["users"]), \
            "Test user was not created"
            
        # Clean up - delete the test user
        delete_response = api_client.session.delete(
            f"{api_client.base_url}/users/{test_user['username']}"
        )
        delete_response.raise_for_status()
            
    except requests.exceptions.RequestException:
        pytest.skip("User management endpoints not available")
```

## Related Modules

- [Observability Testing](./observability.md): Tests logging and metrics collection
- [Recovery Testing](./recovery.md): Tests backup, restore, and disaster recovery
- [API Client](./api_client.md): Documentation for the Devin.ai API client used in tests
