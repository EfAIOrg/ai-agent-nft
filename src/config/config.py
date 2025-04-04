"""Configuration module for non-functional tests."""
import os
from pathlib import Path
import yaml
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).parent.parent.parent

DEFAULT_CONFIG = {
    "performance": {
        "response_time_threshold_ms": 1000,
        "concurrent_users": 10,
        "test_duration_seconds": 60,
    },
    "scalability": {
        "max_users": 100,
        "ramp_up_time_seconds": 30,
        "steady_state_time_seconds": 300,
    },
    "reliability": {
        "test_duration_hours": 24,
        "expected_availability_percent": 99.9,
        "max_errors_per_minute": 1,
    },
    "security": {
        "scan_timeout_seconds": 300,
        "csrf_protection_enabled": True,
        "input_validation_level": "strict",
    },
    "maintainability": {
        "code_complexity_threshold": 10,
        "min_documentation_coverage": 80,
        "max_method_length": 50,
    },
    "extensibility": {
        "api_backward_compatibility_versions": 2,
        "plugin_isolation_level": "high",
    },
    "observability": {
        "min_log_level": "info",
        "metrics_retention_days": 30,
        "trace_sampling_rate": 0.1,
    },
    "manageability": {
        "config_validation_level": "strict",
        "resource_limit_enforcement": True,
    },
    "recovery": {
        "backup_frequency_hours": 24,
        "max_recovery_time_minutes": 15,
        "data_consistency_check_enabled": True,
    }
}

def load_config(config_path=None):
    """
    Load configuration from a YAML file or use default.
    
    Args:
        config_path: Path to configuration file
        
    Returns:
        dict: Configuration dictionary
    """
    if config_path and os.path.exists(config_path):
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
            for section in DEFAULT_CONFIG:
                if section in config:
                    DEFAULT_CONFIG[section].update(config[section])
                else:
                    config[section] = DEFAULT_CONFIG[section]
            return config
    return DEFAULT_CONFIG

CONFIG = load_config(os.getenv('CONFIG_PATH'))
