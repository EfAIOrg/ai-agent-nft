"""Load testing for Devin.ai using Locust."""
import time
import random
from locust import HttpUser, task, between
from src.config.config import CONFIG

SAMPLE_QUERIES = [
    "What is the capital of France?",
    "How do I write a unit test in Python?",
    "Explain Docker in simple terms",
    "Write a function to reverse a string in JavaScript",
    "What are the SOLID principles?",
    "How does a binary search algorithm work?",
    "Explain the difference between REST and GraphQL",
    "What are the best practices for password storage?",
    "How do I deploy a Flask application to AWS?",
    "Create a simple React component",
]

class DevinUser(HttpUser):
    """Simulated user for load testing."""
    
    wait_time = between(1, 5)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if hasattr(self.environment.parsed_options, "api_key"):
            self.client.headers.update({
                "Authorization": f"Bearer {self.environment.parsed_options.api_key}"
            })
    
    @task(10)
    def simple_query(self):
        """Send a random simple query."""
        query = random.choice(SAMPLE_QUERIES)
        with self.client.post(
            "/query", 
            json={"query": query},
            catch_response=True
        ) as response:
            if response.status_code != 200:
                response.failure(f"Failed with status code {response.status_code}")
            else:
                response_time_ms = response.elapsed.total_seconds() * 1000
                threshold_ms = CONFIG["performance"]["response_time_threshold_ms"] 
                if response_time_ms > threshold_ms:
                    response.failure(f"Response time {response_time_ms}ms exceeded threshold {threshold_ms}ms")
    
    @task(1)
    def complex_query(self):
        """Send a more complex query that requires more processing."""
        complex_query = """
        Create a Python class for managing a list of tasks with the following features:
        1. Add a task with a title, description, and due date
        2. Mark tasks as complete
        3. Filter tasks by completion status and due date
        """
        self.client.post("/query", json={"query": complex_query})
