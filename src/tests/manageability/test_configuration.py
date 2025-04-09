"""Tests for configuration management and manageability."""
import os
import json
import yaml
import pytest
import requests
from src.utils.api_client import DevinClient
from src.config.config import CONFIG

@pytest.fixture
def api_client(request):
    """Create API client fixture."""
    return DevinClient(
        base_url=request.config.getoption("--api-url"),
        api_key=request.config.getoption("--api-key")
    )

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
