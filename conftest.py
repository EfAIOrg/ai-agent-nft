"""Pytest configuration file."""
import os
import pytest
from dotenv import load_dotenv

load_dotenv()

def pytest_addoption(parser):
    """Add command-line options for tests."""
    parser.addoption(
        "--api-url",
        default=os.getenv("DEVIN_API_URL", "https://api.devin.ai"),
        help="Devin.ai API URL"
    )
    parser.addoption(
        "--api-key",
        default=os.getenv("DEVIN_API_KEY"),
        help="Devin.ai API key"
    )
    parser.addoption(
        "--report-path",
        default="reports",
        help="Path to save test reports"
    )
    parser.addoption(
        "--log-path",
        default=os.getenv("DEVIN_LOG_PATH"),
        help="Path to log file or log endpoint"
    )

@pytest.fixture
def api_url(request):
    """Get API URL from command line or environment."""
    return request.config.getoption("--api-url")

@pytest.fixture
def api_key(request):
    """Get API key from command line or environment."""
    return request.config.getoption("--api-key")

@pytest.fixture
def report_path(request):
    """Get report path from command line."""
    return request.config.getoption("--report-path")

@pytest.fixture
def log_path(request):
    """Get log path from command line or environment."""
    return request.config.getoption("--log-path")

@pytest.fixture(scope="session", autouse=True)
def setup_logging(request):
    """Set up logging for tests."""
    import logging
    
    reports_dir = request.config.getoption("--report-path")
    os.makedirs(reports_dir, exist_ok=True)
    
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        filename=f"{reports_dir}/test_run.log"
    )
