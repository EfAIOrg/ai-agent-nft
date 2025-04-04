"""Verify that the environment is correctly set up for testing."""
import os
import sys
import importlib.util
from pathlib import Path

def check_dependency(module_name):
    """Check if a Python module is installed."""
    try:
        importlib.util.find_spec(module_name)
        return True
    except ImportError:
        return False

def main():
    """Run verification checks."""
    print("Verifying Devin.ai Non-Functional Testing environment setup...")
    
    python_version = sys.version_info
    print(f"Python version: {python_version.major}.{python_version.minor}.{python_version.micro}")
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
        print("ERROR: Python 3.8 or higher is required")
        return False
    
    required_modules = [
        "pytest", "locust", "requests", "pyyaml", "dotenv", "semver", 
        "radon", "pylint", "flake8", "prometheus_client"
    ]
    
    missing_modules = []
    for module in required_modules:
        if not check_dependency(module):
            missing_modules.append(module)
    
    if missing_modules:
        print(f"ERROR: Missing required dependencies: {', '.join(missing_modules)}")
        print("Please install them using: pip install -r requirements.txt")
        return False
    
    required_env_vars = ["DEVIN_API_URL", "DEVIN_API_KEY"]
    missing_env_vars = []
    
    for var in required_env_vars:
        if not os.getenv(var):
            missing_env_vars.append(var)
    
    if missing_env_vars:
        print(f"WARNING: Missing environment variables: {', '.join(missing_env_vars)}")
        print("These will need to be provided when running tests.")
    
    project_root = Path(__file__).parent
    required_dirs = [
        "src/tests/performance",
        "src/tests/scalability",
        "src/tests/reliability",
        "src/tests/security",
        "src/tests/maintainability",
        "src/tests/extensibility",
        "src/tests/observability",
        "src/tests/manageability",
        "src/tests/recovery",
        "src/utils",
        "src/config",
        "docs",
        "reports"
    ]
    
    missing_dirs = []
    for dir_path in required_dirs:
        if not (project_root / dir_path).exists():
            missing_dirs.append(dir_path)
    
    if missing_dirs:
        print(f"ERROR: Missing required directories: {', '.join(missing_dirs)}")
        return False
    
    print("Verification complete. Environment is correctly set up for testing.")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
