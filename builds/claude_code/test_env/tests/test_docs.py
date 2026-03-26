# Validates: REQ-F-DOCS-001
"""Smoke test: user guide exists and covers the three required sections."""
from pathlib import Path


README = Path(__file__).parents[2] / "README.md"


class TestUserGuide:
    def test_installation_section_present(self):
        text = README.read_text()
        assert any(
            kw in text.lower() for kw in ("install", "gen-install", "setup")
        ), "README must contain an installation section"

    def test_first_session_section_present(self):
        text = README.read_text()
        assert any(
            kw in text.lower() for kw in ("first session", "getting started", "quickstart", "quick start")
        ), "README must contain a first-session / getting-started section"

    def test_operating_loop_section_present(self):
        text = README.read_text()
        assert any(
            kw in text.lower() for kw in ("operating loop", "gen-start", "gen-iterate", "gen-gaps")
        ), "README must reference the operating loop commands"
