import sys
import unittest
from pathlib import Path
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app


class RoadmapFallbackTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)
        self.payload = {
            "targetCareer": "Data Scientist",
            "currentSkills": ["Python", "SQL"],
            "timelineMonths": 6,
        }

    def test_returns_fallback_when_ai_generation_fails(self) -> None:
        with patch(
            "app.api.routes.ollama_client.generate",
            new=AsyncMock(side_effect=Exception("Ollama unavailable")),
        ):
            response = self.client.post("/roadmap-generator", json=self.payload)

        self.assertEqual(response.status_code, 200)

        body = response.json()
        self.assertEqual(body["targetCareer"], self.payload["targetCareer"])
        self.assertEqual(body["timelineMonths"], self.payload["timelineMonths"])
        self.assertIn("built-in planner", body["summary"])
        self.assertGreaterEqual(len(body["steps"]), 3)
        self.assertEqual(body["steps"][0]["phase"], 1)


if __name__ == "__main__":
    unittest.main()
