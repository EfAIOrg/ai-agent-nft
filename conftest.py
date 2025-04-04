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

@pytest.fixture(scope="session", autouse=True)
def setup_logging(request):
    """Set up logging for tests."""
    import logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        filename=f"{request.config.getoption('--report-path')}/test_run.log"
    )
