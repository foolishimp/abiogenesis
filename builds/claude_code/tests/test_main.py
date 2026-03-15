# Validates: REQ-F-CMD-001
# Validates: REQ-F-CMD-002
# Validates: REQ-F-CMD-003
"""Tests for genesis.__main__ — CLI entry point and check-tags command."""
import json
import pytest
import sys
from pathlib import Path
from io import StringIO
from unittest.mock import patch

from genesis.__main__ import _build_parser, _check_tags


# ── _build_parser ─────────────────────────────────────────────────────────────

class TestBuildParser:
    def test_parser_created(self):
        p = _build_parser()
        assert p is not None

    def test_start_command_exists(self):
        p = _build_parser()
        args = p.parse_args(["start"])
        assert args.command == "start"
        assert args.auto is False

    def test_start_auto_flag(self):
        p = _build_parser()
        args = p.parse_args(["start", "--auto"])
        assert args.auto is True

    def test_start_feature_flag(self):
        p = _build_parser()
        args = p.parse_args(["start", "--feature", "REQ-F-CORE"])
        assert args.feature == "REQ-F-CORE"

    def test_start_edge_flag(self):
        p = _build_parser()
        args = p.parse_args(["start", "--edge", "design→code"])
        assert args.edge == "design→code"

    def test_iterate_command_exists(self):
        p = _build_parser()
        args = p.parse_args(["iterate"])
        assert args.command == "iterate"

    def test_gaps_command_exists(self):
        p = _build_parser()
        args = p.parse_args(["gaps"])
        assert args.command == "gaps"

    def test_check_tags_command_exists(self):
        p = _build_parser()
        args = p.parse_args(["check-tags", "--type", "implements", "--path", "."])
        assert args.command == "check-tags"
        assert args.type == "implements"

    def test_check_tags_validates_type(self):
        p = _build_parser()
        args = p.parse_args(["check-tags", "--type", "validates", "--path", "."])
        assert args.type == "validates"


# ── _check_tags ───────────────────────────────────────────────────────────────

class TestCheckTags:
    def test_missing_path_returns_1(self, tmp_path, capsys):
        rc = _check_tags("implements", str(tmp_path / "nonexistent"))
        assert rc == 1

    def test_all_tagged_returns_0(self, tmp_path, capsys):
        f = tmp_path / "core.py"
        f.write_text("# Implements: REQ-001\ndef foo(): pass\n")
        rc = _check_tags("implements", str(tmp_path))
        assert rc == 0
        out = capsys.readouterr().out
        result = json.loads(out)
        assert result["passes"] is True
        assert result["untagged_count"] == 0

    def test_untagged_returns_1(self, tmp_path, capsys):
        f = tmp_path / "core.py"
        f.write_text("def foo(): pass\n")
        rc = _check_tags("implements", str(tmp_path))
        assert rc == 1
        out = capsys.readouterr().out
        result = json.loads(out)
        assert result["passes"] is False
        assert result["untagged_count"] == 1

    def test_init_py_excluded(self, tmp_path, capsys):
        (tmp_path / "__init__.py").write_text("# no tag\n")
        rc = _check_tags("implements", str(tmp_path))
        assert rc == 0  # __init__.py is excluded from check

    def test_validates_tag_type(self, tmp_path, capsys):
        f = tmp_path / "test_x.py"
        f.write_text("# Validates: REQ-001\ndef test_foo(): pass\n")
        rc = _check_tags("validates", str(tmp_path))
        assert rc == 0

    def test_validates_tag_fails_without_tag(self, tmp_path, capsys):
        f = tmp_path / "test_x.py"
        f.write_text("def test_foo(): pass\n")
        rc = _check_tags("validates", str(tmp_path))
        assert rc == 1

    def test_directory_scan_recursive(self, tmp_path, capsys):
        sub = tmp_path / "sub"
        sub.mkdir()
        (sub / "deep.py").write_text("# Implements: REQ-001\n")
        rc = _check_tags("implements", str(tmp_path))
        assert rc == 0
