# Configuration Guide for Devin.ai Non-Functional Testing

This guide explains how to configure the Devin.ai non-functional testing framework to suit your specific requirements.

## Configuration Methods

The framework supports three methods of configuration, in order of precedence:

1. **Command-line Arguments**: Highest priority, overrides other settings
2. **Environment Variables**: Medium priority, overrides default settings
3. **Configuration Files**: Low priority, overrides hardcoded defaults
4. **Default Values**: Lowest priority, used when no other configuration is provided

## Command-line Arguments

When running tests with pytest, you can provide the following command-line arguments:

```bash
pytest --api-url=https://api.devin.ai \
       --api-key=your_api_key \
       --report-path=./custom-reports \
       --log-path=./logs/devin.log
```

### Available Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--api-url` | Devin.ai API URL | Value from DEVIN_API_URL env var or "https://api.devin.ai" |
| `--api-key` | Devin.ai API key | Value from DEVIN_API_KEY env var |
| `--report-path` | Path to save test reports | "reports" |
| `--log-path` | Path to log file or log endpoint | Value from DEVIN_LOG_PATH env var |

## Environment Variables

Create a `.env` file in the root directory or set environment variables directly:

```
DEVIN_API_URL=https://api.devin.ai
DEVIN_API_KEY=your_api_key_here
CONFIG_PATH=./config/custom-config.yaml
DEVIN_LOG_PATH=./logs/devin.log
```

### Available Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEVIN_API_URL` | Devin.ai API URL | "https://api.devin.ai" |
| `DEVIN_API_KEY` | Devin.ai API key | None (required) |
| `CONFIG_PATH` | Path to custom configuration file | None |
| `DEVIN_LOG_PATH` | Path to log file or log endpoint | None |

## Configuration Files

Create a YAML configuration file to customize test parameters. The default location is specified by the `CONFIG_PATH` environment variable.

Example configuration file:

```yaml
performance:
  response_time_threshold_ms: 1500
  concurrent_users: 20
  test_duration_seconds: 120

scalability:
  max_users: 200
  ramp_up_time_seconds: 60
  steady_state_time_seconds: 600

reliability:
  test_duration_hours: 12
  expected_availability_percent: 99.95
  max_errors_per_minute: 0.5

security:
  scan_timeout_seconds: 600
  csrf_protection_enabled: true
  input_validation_level: strict

maintainability:
  code_complexity_threshold: 8
  min_documentation_coverage: 90
  max_method_length: 40

extensibility:
  api_backward_compatibility_versions: 3
  plugin_isolation_level: high

observability:
  min_log_level: debug
  metrics_retention_days: 60
  trace_sampling_rate: 0.2

manageability:
  config_validation_level: strict
  resource_limit_enforcement: true

recovery:
  backup_frequency_hours: 12
  max_recovery_time_minutes: 10
  data_consistency_check_enabled: true
```

## Configuration Module

The configuration module (`src/config/config.py`) handles loading and merging configuration from all sources. It provides a unified `CONFIG` dictionary that can be imported and used throughout the test suite.

```python
from src.config.config import CONFIG

# Access configuration values
response_time_threshold = CONFIG["performance"]["response_time_threshold_ms"]
```

## Default Configuration

The default configuration values are defined in the `DEFAULT_CONFIG` dictionary in `src/config/config.py`. These values are used when no other configuration is provided.

## Configuration Validation

The framework validates configuration values to ensure they are within acceptable ranges. If a configuration value is invalid, a warning is logged and the default value is used instead.

## Next Steps

After configuring the framework, proceed to the [Test Execution Guide](./execution_guide.md) to learn how to run tests.
