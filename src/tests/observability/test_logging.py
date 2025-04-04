"""Tests for logging and observability."""
import re
import json
import logging
import pytest
import requests
from src.utils.api_client import DevinClient
from src.config.config import CONFIG

@pytest.fixture
def api_client():
    """Create API client fixture."""
    return DevinClient(
        base_url=pytest.config.getoption("--api-url"),
        api_key=pytest.config.getoption("--api-key")
    )

class TestLogging:
    """Test cases for logging and observability."""
    
    def test_log_format(self):
        """Test log format includes required fields."""
        log_path = pytest.config.getoption("--log-path", None)
        if not log_path:
            pytest.skip("Log path not provided")
            
        try:
            if log_path.startswith("http"):
                response = requests.get(
                    log_path,
                    headers={"Authorization": f"Bearer {pytest.config.getoption('--api-key')}"}
                )
                response.raise_for_status()
                log_entries = response.json()
            else:
                with open(log_path, 'r') as f:
                    log_content = f.read()
                    try:
                        log_entries = [json.loads(line) for line in log_content.strip().split('\n')]
                    except json.JSONDecodeError:
                        log_entries = log_content.strip().split('\n')
        except (FileNotFoundError, requests.exceptions.RequestException):
            pytest.skip("Could not access log content")
            return
            
        required_fields = ['timestamp', 'level', 'message']
        
        if isinstance(log_entries, list) and log_entries and isinstance(log_entries[0], dict):
            for entry in log_entries[:10]:  # Check first 10 entries
                for field in required_fields:
                    assert field in entry, f"Log entry missing required field '{field}'"
        else:
            timestamp_pattern = r'\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}'
            level_pattern = r'(DEBUG|INFO|WARNING|ERROR|CRITICAL)'
            
            for entry in log_entries[:10]:
                assert re.search(timestamp_pattern, entry), f"Log entry missing timestamp: {entry}"
                assert re.search(level_pattern, entry), f"Log entry missing log level: {entry}"
    
    def test_metrics_endpoint(self, api_client):
        """Test metrics endpoint availability and format."""
        try:
            response = api_client.session.get(f"{api_client.base_url}/metrics")
            response.raise_for_status()
            
            metrics_data = response.json()
            
            assert "metrics" in metrics_data, "API response missing metrics information"
            
            essential_categories = ["performance", "errors", "usage"]
            for category in essential_categories:
                assert category in metrics_data["metrics"], f"Metrics missing essential category: {category}"
                
        except requests.exceptions.RequestException:
            pytest.skip("Metrics endpoint not available")
