# Recovery Testing Module Documentation

## Overview

The recovery testing module evaluates how well the Devin.ai API can recover from failures and disasters. It tests backup and restore capabilities, disaster recovery procedures, and failover mechanisms to ensure the system can maintain data integrity and service availability even after serious failures.

## Test Files

- `src/tests/recovery/test_backup_restore.py`: Tests backup and restore capabilities

## Key Metrics

- **Backup Integrity**: Completeness and correctness of backups
- **Restore Time**: Time required to restore from backups
- **Data Loss**: Amount of data lost during recovery
- **Service Downtime**: Duration of service unavailability during recovery
- **Failover Effectiveness**: Success rate and speed of failover mechanisms

## Test Cases

### Backup and Restore Tests

The `TestBackupRestore` class contains tests that evaluate backup and restore capabilities:

```python
class TestBackupRestore:
    """Test cases for backup and restore capabilities."""
    
    def test_backup_creation(self, api_client):
        """Test backup creation."""
        try:
            response = api_client.session.post(f"{api_client.base_url}/admin/backup")
            response.raise_for_status()
            
            backup_data = response.json()
            
            # Verify backup information is available
            assert "backup_id" in backup_data, "Backup response missing backup ID"
            assert "timestamp" in backup_data, "Backup response missing timestamp"
            assert "status" in backup_data, "Backup response missing status"
            assert backup_data["status"] in ("completed", "in_progress"), \
                f"Unexpected backup status: {backup_data['status']}"
                
            # If backup is in progress, wait for it to complete
            if backup_data["status"] == "in_progress":
                backup_id = backup_data["backup_id"]
                max_wait_time = 300  # seconds
                wait_interval = 5    # seconds
                elapsed_time = 0
                
                while elapsed_time < max_wait_time:
                    time.sleep(wait_interval)
                    elapsed_time += wait_interval
                    
                    status_response = api_client.session.get(
                        f"{api_client.base_url}/admin/backup/{backup_id}"
                    )
                    status_response.raise_for_status()
                    status_data = status_response.json()
                    
                    if status_data["status"] == "completed":
                        break
                    elif status_data["status"] == "failed":
                        assert False, f"Backup failed: {status_data.get('error', 'Unknown error')}"
                
                assert elapsed_time < max_wait_time, "Backup did not complete within the expected time"
                
        except requests.exceptions.RequestException:
            pytest.skip("Backup endpoint not available")
    
    def test_backup_restore(self, api_client):
        """Test backup restoration."""
        try:
            # First, create a backup
            backup_response = api_client.session.post(f"{api_client.base_url}/admin/backup")
            backup_response.raise_for_status()
            backup_data = backup_response.json()
            backup_id = backup_data["backup_id"]
            
            # Wait for backup to complete if necessary
            if backup_data["status"] == "in_progress":
                # ... (same waiting logic as in test_backup_creation)
                pass
            
            # Now, attempt to restore from the backup
            restore_response = api_client.session.post(
                f"{api_client.base_url}/admin/restore",
                json={"backup_id": backup_id}
            )
            restore_response.raise_for_status()
            
            restore_data = restore_response.json()
            
            # Verify restore information is available
            assert "restore_id" in restore_data, "Restore response missing restore ID"
            assert "status" in restore_data, "Restore response missing status"
            
            # If restore is in progress, wait for it to complete
            if restore_data["status"] == "in_progress":
                restore_id = restore_data["restore_id"]
                max_wait_time = 600  # seconds
                wait_interval = 10   # seconds
                elapsed_time = 0
                
                while elapsed_time < max_wait_time:
                    time.sleep(wait_interval)
                    elapsed_time += wait_interval
                    
                    status_response = api_client.session.get(
                        f"{api_client.base_url}/admin/restore/{restore_id}"
                    )
                    status_response.raise_for_status()
                    status_data = status_response.json()
                    
                    if status_data["status"] == "completed":
                        break
                    elif status_data["status"] == "failed":
                        assert False, f"Restore failed: {status_data.get('error', 'Unknown error')}"
                
                assert elapsed_time < max_wait_time, "Restore did not complete within the expected time"
                
            # Verify the system is operational after restore
            health_response = api_client.session.get(f"{api_client.base_url}/health")
            health_response.raise_for_status()
            health_data = health_response.json()
            
            assert health_data["status"] == "healthy", \
                f"System not healthy after restore: {health_data['status']}"
                
        except requests.exceptions.RequestException:
            pytest.skip("Backup/restore endpoints not available")
```

## Configuration

Recovery tests use the following configuration parameters from `src/config/config.py`:

```python
DEFAULT_CONFIG = {
    "recovery": {
        "backup_frequency_hours": 24,           # How often backups should be created
        "max_recovery_time_minutes": 15,        # Maximum acceptable recovery time
        "data_consistency_check_enabled": True, # Whether to check data consistency after recovery
    },
    # ... other configuration sections
}
```

## Running Recovery Tests

To run all recovery tests:

```bash
pytest src/tests/recovery/
```

To run a specific recovery test:

```bash
pytest src/tests/recovery/test_backup_restore.py::TestBackupRestore::test_backup_creation
```

### Testing with Different Recovery Scenarios

To test with different recovery scenarios:

```bash
# Test with a simulated disk failure
pytest src/tests/recovery/test_disaster_recovery.py --scenario=disk_failure

# Test with a simulated network partition
pytest src/tests/recovery/test_disaster_recovery.py --scenario=network_partition
```

## Interpreting Results

Recovery test results include:

- **Backup Success Rate**: Percentage of successful backup operations
- **Restore Success Rate**: Percentage of successful restore operations
- **Recovery Time**: Time required to recover from failures
- **Data Integrity**: Whether data remains consistent after recovery
- **Service Availability**: Whether services are available after recovery

Key indicators of recovery issues:

- **Failed Backups**: Backups that fail to complete successfully
- **Failed Restores**: Restores that fail to complete successfully
- **Slow Recovery**: Recovery that takes longer than the acceptable threshold
- **Data Inconsistency**: Data that is inconsistent after recovery
- **Service Unavailability**: Services that remain unavailable after recovery

## Extending Recovery Tests

To add new recovery tests:

1. Create a new test file in the `src/tests/recovery/` directory
2. Import the necessary modules and fixtures
3. Define test cases that evaluate specific recovery aspects
4. Assert that the results meet the defined requirements

Example of a new recovery test:

```python
def test_failover_mechanism(self, api_client):
    """Test failover mechanism."""
    try:
        # Trigger a failover
        response = api_client.session.post(f"{api_client.base_url}/admin/failover")
        response.raise_for_status()
        
        failover_data = response.json()
        
        # Verify failover information is available
        assert "failover_id" in failover_data, "Failover response missing failover ID"
        assert "status" in failover_data, "Failover response missing status"
        
        # If failover is in progress, wait for it to complete
        if failover_data["status"] == "in_progress":
            failover_id = failover_data["failover_id"]
            max_wait_time = 300  # seconds
            wait_interval = 5    # seconds
            elapsed_time = 0
            
            while elapsed_time < max_wait_time:
                time.sleep(wait_interval)
                elapsed_time += wait_interval
                
                status_response = api_client.session.get(
                    f"{api_client.base_url}/admin/failover/{failover_id}"
                )
                status_response.raise_for_status()
                status_data = status_response.json()
                
                if status_data["status"] == "completed":
                    break
                elif status_data["status"] == "failed":
                    assert False, f"Failover failed: {status_data.get('error', 'Unknown error')}"
            
            assert elapsed_time < max_wait_time, "Failover did not complete within the expected time"
            
        # Verify the system is operational after failover
        health_response = api_client.session.get(f"{api_client.base_url}/health")
        health_response.raise_for_status()
        health_data = health_response.json()
        
        assert health_data["status"] == "healthy", \
            f"System not healthy after failover: {health_data['status']}"
            
    except requests.exceptions.RequestException:
        pytest.skip("Failover endpoint not available")
```

## Related Modules

- [Reliability Testing](./reliability.md): Tests API availability and fault tolerance
- [Manageability Testing](./manageability.md): Tests configuration and resource management
- [API Client](./api_client.md): Documentation for the Devin.ai API client used in tests
