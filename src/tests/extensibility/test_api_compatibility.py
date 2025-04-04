"""Tests for API compatibility and extensibility."""
import json
import requests
import semver
from typing import Dict, Any
import pytest
from src.utils.api_client import DevinClient
from src.config.config import CONFIG

@pytest.fixture
def api_client():
    """Create API client fixture."""
    return DevinClient(
        base_url=pytest.config.getoption("--api-url"),
        api_key=pytest.config.getoption("--api-key")
    )

class TestAPICompatibility:
    """Test cases for API compatibility and extensibility."""
    
    def test_api_versioning(self, api_client):
        """Test API version information is available and correctly formatted."""
        try:
            response = api_client.session.get(f"{api_client.base_url}/version")
            response.raise_for_status()
            
            version_data = response.json()
            
            assert "version" in version_data, "API response missing version information"
            assert semver.VersionInfo.isvalid(version_data["version"]), \
                f"API version {version_data['version']} does not follow semantic versioning"
                
        except requests.exceptions.RequestException:
            pytest.skip("Version endpoint not available")
    
    def test_backward_compatibility(self, api_client):
        """Test backward compatibility with previous API versions."""
        try:
            response = api_client.session.get(f"{api_client.base_url}/versions")
            response.raise_for_status()
            
            versions_data = response.json()
            assert "supported_versions" in versions_data, "API response missing supported versions"
            
            min_supported = CONFIG["extensibility"]["api_backward_compatibility_versions"]
            assert len(versions_data["supported_versions"]) >= min_supported, \
                f"API supports {len(versions_data['supported_versions'])} versions, " \
                f"expected at least {min_supported}"
                
        except requests.exceptions.RequestException:
            pytest.skip("Versions endpoint not available")
            
    def test_feature_discovery(self, api_client):
        """Test API feature discovery mechanism."""
        try:
            response = api_client.session.get(f"{api_client.base_url}/features")
            response.raise_for_status()
            
            features_data = response.json()
            
            assert "features" in features_data, "API response missing features information"
            assert isinstance(features_data["features"], list), "Features should be a list"
            
            if features_data["features"]:
                for feature in features_data["features"]:
                    assert "name" in feature, "Feature missing name"
                    assert "enabled" in feature, "Feature missing enabled status"
                    assert "deprecated" in feature, "Feature missing deprecation status"
                
        except requests.exceptions.RequestException:
            pytest.skip("Features endpoint not available")
