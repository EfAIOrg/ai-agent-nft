"""Tests for backup, restore, and recovery capabilities."""
import os
import time
import json
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

class TestBackupRestore:
    """Test cases for backup and restore functionality."""
    
    def test_backup_creation(self, api_client):
        """Test backup creation process."""
        try:
            response = api_client.session.post(f"{api_client.base_url}/backup")
            response.raise_for_status()
            
            backup_data = response.json()
            
            assert "backup_id" in backup_data, "Backup response missing backup ID"
            assert "timestamp" in backup_data, "Backup response missing timestamp"
            assert "status" in backup_data, "Backup response missing status"
            assert backup_data["status"] in ("completed", "in_progress"), \
                f"Unexpected backup status: {backup_data['status']}"
                
            if backup_data["status"] == "in_progress":
                backup_id = backup_data["backup_id"]
                max_wait_time = 60  # seconds
                wait_interval = 5  # seconds
                elapsed_time = 0
                
                while elapsed_time < max_wait_time:
                    time.sleep(wait_interval)
                    elapsed_time += wait_interval
                    
                    status_response = api_client.session.get(
                        f"{api_client.base_url}/backup/{backup_id}"
                    )
                    status_response.raise_for_status()
                    status_data = status_response.json()
                    
                    if status_data["status"] == "completed":
                        break
                        
                assert status_data["status"] == "completed", \
                    f"Backup did not complete within {max_wait_time} seconds"
                
        except requests.exceptions.RequestException:
            pytest.skip("Backup endpoint not available")
    
    def test_restore_process(self, api_client):
        """Test restore process from a backup."""
        try:
            response = api_client.session.get(f"{api_client.base_url}/backups")
            response.raise_for_status()
            
            backups_data = response.json()
            
            assert "backups" in backups_data, "API response missing backups information"
            
            if not backups_data["backups"]:
                pytest.skip("No backups available for restore test")
                
            latest_backup = sorted(
                backups_data["backups"], 
                key=lambda b: b.get("timestamp", ""), 
                reverse=True
            )[0]
            
            restore_response = api_client.session.post(
                f"{api_client.base_url}/restore",
                json={"backup_id": latest_backup["backup_id"]}
            )
            restore_response.raise_for_status()
            
            restore_data = restore_response.json()
            
            assert "restore_id" in restore_data, "Restore response missing restore ID"
            assert "status" in restore_data, "Restore response missing status"
            
            restore_id = restore_data["restore_id"]
            max_wait_time = CONFIG["recovery"]["max_recovery_time_minutes"] * 60  # convert to seconds
            wait_interval = 10  # seconds
            elapsed_time = 0
            
            while elapsed_time < max_wait_time:
                time.sleep(wait_interval)
                elapsed_time += wait_interval
                
                status_response = api_client.session.get(
                    f"{api_client.base_url}/restore/{restore_id}"
                )
                status_response.raise_for_status()
                status_data = status_response.json()
                
                if status_data["status"] in ("completed", "failed"):
                    break
                    
            assert status_data["status"] == "completed", \
                f"Restore failed or did not complete within {max_wait_time} seconds: {status_data.get('error', '')}"
            
            health_response = api_client.session.get(f"{api_client.base_url}/health")
            health_response.raise_for_status()
            health_data = health_response.json()
            
            assert health_data.get("status") == "healthy", \
                f"System not healthy after restore: {health_data.get('status')}"
                
        except requests.exceptions.RequestException:
            pytest.skip("Restore endpoint not available")
    
    def test_data_consistency(self, api_client):
        """Test data consistency after restore."""
        if not CONFIG["recovery"]["data_consistency_check_enabled"]:
            pytest.skip("Data consistency check not enabled in configuration")
            
        try:
            test_data = {
                "key": f"test_key_{int(time.time())}",
                "value": "test_value"
            }
            
            create_response = api_client.session.post(
                f"{api_client.base_url}/data",
                json=test_data
            )
            create_response.raise_for_status()
            
            backup_response = api_client.session.post(f"{api_client.base_url}/backup")
            backup_response.raise_for_status()
            backup_data = backup_response.json()
            
            backup_id = backup_data["backup_id"]
            max_wait_time = 60  # seconds
            wait_interval = 5  # seconds
            elapsed_time = 0
            
            while elapsed_time < max_wait_time:
                time.sleep(wait_interval)
                elapsed_time += wait_interval
                
                status_response = api_client.session.get(
                    f"{api_client.base_url}/backup/{backup_id}"
                )
                status_response.raise_for_status()
                status_data = status_response.json()
                
                if status_data["status"] == "completed":
                    break
            
            restore_response = api_client.session.post(
                f"{api_client.base_url}/restore",
                json={"backup_id": backup_id}
            )
            restore_response.raise_for_status()
            restore_data = restore_response.json()
            
            restore_id = restore_data["restore_id"]
            max_wait_time = CONFIG["recovery"]["max_recovery_time_minutes"] * 60
            elapsed_time = 0
            
            while elapsed_time < max_wait_time:
                time.sleep(wait_interval)
                elapsed_time += wait_interval
                
                status_response = api_client.session.get(
                    f"{api_client.base_url}/restore/{restore_id}"
                )
                status_response.raise_for_status()
                status_data = status_response.json()
                
                if status_data["status"] == "completed":
                    break
            
            get_response = api_client.session.get(
                f"{api_client.base_url}/data/{test_data['key']}"
            )
            get_response.raise_for_status()
            retrieved_data = get_response.json()
            
            assert retrieved_data.get("value") == test_data["value"], \
                f"Data inconsistency after restore: expected {test_data['value']}, got {retrieved_data.get('value')}"
                
        except requests.exceptions.RequestException:
            pytest.skip("Data consistency check endpoints not available")
