"""Tests for code quality and maintainability."""
import os
import subprocess
import json
import pytest
from pathlib import Path
from src.config.config import CONFIG

class TestCodeQuality:
    """Test cases for code quality and maintainability."""
    
    def test_code_complexity(self):
        """Test code complexity using radon."""
        code_path = os.getenv("CODE_REPO_PATH", "./code_repo")
        
        result = subprocess.run(
            ["radon", "cc", "--json", code_path],
            capture_output=True,
            text=True
        )
        
        complexity_data = json.loads(result.stdout)
        
        threshold = CONFIG["maintainability"]["code_complexity_threshold"]
        violations = []
        
        for file_path, blocks in complexity_data.items():
            for block in blocks:
                if block["complexity"] > threshold:
                    violations.append(
                        f"{file_path}:{block['line_number']} - {block['name']} has complexity {block['complexity']}"
                    )
                    
        assert not violations, f"Code complexity violations found:\n" + "\n".join(violations)
        
    def test_documentation_coverage(self):
        """Test documentation coverage."""
        code_path = os.getenv("CODE_REPO_PATH", "./code_repo")
        
        result = subprocess.run(
            ["pylint", "--disable=all", "--enable=missing-docstring", 
             "--output-format=json", code_path],
            capture_output=True,
            text=True
        )
        
        try:
            lint_data = json.loads(result.stdout)
        except json.JSONDecodeError:
            pytest.skip("Could not parse pylint output")
            return
            
        missing_docs = [msg for msg in lint_data if msg["symbol"] == "missing-docstring"]
        
        min_coverage = CONFIG["maintainability"]["min_documentation_coverage"]
        if len(lint_data) > 0:
            coverage = (len(lint_data) - len(missing_docs)) / len(lint_data) * 100
            assert coverage >= min_coverage, \
                f"Documentation coverage {coverage:.2f}% is below minimum required {min_coverage}%"
