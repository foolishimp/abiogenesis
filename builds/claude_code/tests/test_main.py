# Validates: REQ-F-CMD-001
# Validates: REQ-F-CMD-002
# Validates: REQ-F-CMD-003
# Validates: REQ-F-TAG-001
# Validates: REQ-F-TAG-002
# Validates: REQ-F-COV-001
"""Tests for genesis.__main__ — CLI entry point and check-tags command."""
import json
import pytest
import sys
from pathlib import Path
from io import StringIO
from unittest.mock import patch

from genesis.__main__ import _build_parser, _check_tags, _check_req_coverage


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

    def test_check_req_coverage_command_exists(self):
        p = _build_parser()
        args = p.parse_args(["check-req-coverage", "--spec", "spec.py", "--features", "features/"])
        assert args.command == "check-req-coverage"
        assert args.spec == "spec.py"
        assert args.features == "features/"

    def test_check_req_coverage_package_flag(self):
        p = _build_parser()
        args = p.parse_args(["check-req-coverage", "--package", "mymod:myvar", "--features", "features/"])
        assert args.package == "mymod:myvar"
        assert args.spec is None


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


# ── _check_req_coverage ───────────────────────────────────────────────────────

class TestCheckReqCoverage:
    def _write_spec(self, path: Path, content: str) -> Path:
        f = path / "spec.py"
        f.write_text(content)
        return f

    def _write_feature(self, features_dir: Path, name: str, satisfies: list[str]) -> None:
        features_dir.mkdir(parents=True, exist_ok=True)
        content = f"feature: {name}\nsatisfies: {satisfies}\n"
        (features_dir / f"{name}.yml").write_text(content)

    def test_missing_spec_returns_1(self, tmp_path, capsys):
        features = tmp_path / "features"
        features.mkdir()
        rc = _check_req_coverage(str(tmp_path / "no_spec.py"), str(features))
        assert rc == 1

    def test_missing_features_dir_returns_1(self, tmp_path, capsys):
        spec = self._write_spec(tmp_path, "# REQ-F-CORE-001\n")
        rc = _check_req_coverage(str(spec), str(tmp_path / "no_features"))
        assert rc == 1

    def test_all_covered_returns_0(self, tmp_path, capsys):
        spec = self._write_spec(tmp_path, "# REQ-F-CORE-001 is defined here\n")
        features = tmp_path / "features"
        self._write_feature(features, "core", ["REQ-F-CORE-001"])
        rc = _check_req_coverage(str(spec), str(features))
        assert rc == 0
        result = json.loads(capsys.readouterr().out)
        assert result["passes"] is True
        assert result["uncovered"] == []

    def test_uncovered_key_returns_1(self, tmp_path, capsys):
        spec = self._write_spec(tmp_path, "# REQ-F-CORE-001 and REQ-F-BIND-001\n")
        features = tmp_path / "features"
        self._write_feature(features, "core", ["REQ-F-CORE-001"])  # BIND not covered
        rc = _check_req_coverage(str(spec), str(features))
        assert rc == 1
        result = json.loads(capsys.readouterr().out)
        assert result["passes"] is False
        assert "REQ-F-BIND-001" in result["uncovered"]

    def test_no_req_keys_in_spec_passes(self, tmp_path, capsys):
        spec = self._write_spec(tmp_path, "# no requirements here\n")
        features = tmp_path / "features"
        features.mkdir()
        rc = _check_req_coverage(str(spec), str(features))
        assert rc == 0

    def test_recursive_feature_scan(self, tmp_path, capsys):
        spec = self._write_spec(tmp_path, "# REQ-F-CORE-001\n")
        features = tmp_path / "features"
        sub = features / "active"
        self._write_feature(sub, "core", ["REQ-F-CORE-001"])
        rc = _check_req_coverage(str(spec), str(features))
        assert rc == 0

    def test_result_json_structure(self, tmp_path, capsys):
        spec = self._write_spec(tmp_path, "# REQ-F-CORE-001\n")
        features = tmp_path / "features"
        self._write_feature(features, "core", ["REQ-F-CORE-001"])
        _check_req_coverage(str(spec), str(features))
        result = json.loads(capsys.readouterr().out)
        assert "spec_keys" in result
        assert "covered_count" in result
        assert "total_count" in result
        assert "uncovered" in result
        assert "passes" in result

    def test_package_ref_covered(self, tmp_path, capsys, monkeypatch):
        """--package path: Package.requirements is the canonical source."""
        from unittest.mock import MagicMock
        import sys
        pkg = MagicMock()
        pkg.requirements = ["REQ-F-CORE-001", "REQ-F-BIND-001"]
        fake_mod = MagicMock()
        fake_mod.my_pkg = pkg
        monkeypatch.setitem(sys.modules, "my_spec_mod", fake_mod)

        features = tmp_path / "features"
        self._write_feature(features, "core", ["REQ-F-CORE-001"])
        self._write_feature(features, "bind", ["REQ-F-BIND-001"])

        rc = _check_req_coverage("", str(features), package_ref="my_spec_mod:my_pkg")
        assert rc == 0
        result = json.loads(capsys.readouterr().out)
        assert result["passes"] is True
        assert sorted(result["spec_keys"]) == ["REQ-F-BIND-001", "REQ-F-CORE-001"]

    def test_package_ref_uncovered(self, tmp_path, capsys, monkeypatch):
        """Package.requirements with a missing key returns rc=1."""
        from unittest.mock import MagicMock
        import sys
        pkg = MagicMock()
        pkg.requirements = ["REQ-F-CORE-001", "REQ-F-MISSING-001"]
        fake_mod = MagicMock()
        fake_mod.my_pkg = pkg
        monkeypatch.setitem(sys.modules, "my_spec_mod2", fake_mod)

        features = tmp_path / "features"
        self._write_feature(features, "core", ["REQ-F-CORE-001"])

        rc = _check_req_coverage("", str(features), package_ref="my_spec_mod2:my_pkg")
        assert rc == 1
        result = json.loads(capsys.readouterr().out)
        assert result["passes"] is False
        assert "REQ-F-MISSING-001" in result["uncovered"]

    def test_package_ref_bad_format_returns_1(self, tmp_path, capsys):
        """MODULE:VAR format enforced — colon required."""
        features = tmp_path / "features"
        features.mkdir()
        rc = _check_req_coverage("", str(features), package_ref="no_colon_here")
        assert rc == 1

    def test_package_ref_import_error_returns_1(self, tmp_path, capsys):
        """Unimportable module returns rc=1."""
        features = tmp_path / "features"
        features.mkdir()
        rc = _check_req_coverage("", str(features), package_ref="no_such_module_xyz:var")
        assert rc == 1
