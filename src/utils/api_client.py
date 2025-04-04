"""API client for interacting with Devin.ai."""
import time
import logging
import requests
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

class DevinClient:
    """Client for interacting with Devin.ai API."""
    
    def __init__(self, base_url: str, api_key: Optional[str] = None, timeout: int = 30):
        """
        Initialize the client.
        
        Args:
            base_url: Base URL for the Devin.ai API
            api_key: API key for authentication
            timeout: Request timeout in seconds
        """
        self.base_url = base_url
        self.api_key = api_key
        self.timeout = timeout
        self.session = requests.Session()
        if api_key:
            self.session.headers.update({"Authorization": f"Bearer {api_key}"})
    
    def send_query(self, query: str, **kwargs) -> Dict[Any, Any]:
        """
        Send a query to Devin.ai.
        
        Args:
            query: Query text
            **kwargs: Additional parameters
            
        Returns:
            Response from the API
        """
        start_time = time.time()
        try:
            response = self.session.post(
                f"{self.base_url}/query",
                json={"query": query, **kwargs},
                timeout=self.timeout
            )
            response.raise_for_status()
            return {
                "status_code": response.status_code,
                "response_time": time.time() - start_time,
                "data": response.json(),
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {str(e)}")
            return {
                "status_code": getattr(e.response, "status_code", 500) if hasattr(e, "response") else 500,
                "response_time": time.time() - start_time,
                "error": str(e),
            }
