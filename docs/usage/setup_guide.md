# Setup Guide for Devin.ai Non-Functional Testing

This guide provides instructions for setting up the Devin.ai non-functional testing framework.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Git

## Installation Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/EfAIOrg/ai-agent-nft.git
   cd ai-agent-nft
   ```

2. **Create a Virtual Environment (Recommended)**

   ```bash
   python -m venv venv
   ```

   Activate the virtual environment:

   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

3. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

   Note: Some dependencies may require system-level packages. If you encounter issues, check the error messages for specific requirements.

4. **Environment Configuration**

   Create a `.env` file in the root directory with the following variables:

   ```
   DEVIN_API_URL=https://api.devin.ai
   DEVIN_API_KEY=your_api_key_here
   CONFIG_PATH=path/to/custom/config.yaml  # Optional
   DEVIN_LOG_PATH=path/to/logs  # Optional
   ```

   Replace `your_api_key_here` with your actual Devin.ai API key.

5. **Verify Setup**

   Run the verification script to ensure everything is set up correctly:

   ```bash
   python verify_setup.py
   ```

   This script checks:
   - Python version
   - Required dependencies
   - Environment variables
   - Project structure

## Troubleshooting

### Common Issues

1. **Missing Dependencies**

   If you encounter errors about missing modules, try reinstalling the requirements:

   ```bash
   pip install -r requirements.txt --force-reinstall
   ```

2. **API Connection Issues**

   - Verify your API key is correct
   - Check network connectivity to the Devin.ai API
   - Ensure the API URL is correct

3. **Python Version Compatibility**

   If you encounter syntax errors or other compatibility issues, verify you're using Python 3.8 or higher:

   ```bash
   python --version
   ```

### Getting Help

If you continue to experience issues, please:

1. Check the [GitHub Issues](https://github.com/EfAIOrg/ai-agent-nft/issues) for similar problems
2. Create a new issue with details about your environment and the specific error messages

## Next Steps

After completing the setup, proceed to the [Configuration Guide](./configuration_guide.md) to learn how to configure the tests for your specific needs.
