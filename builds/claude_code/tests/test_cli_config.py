# Validates: REQ-F-CMD-001
# Validates: REQ-F-CMD-002
# Validates: REQ-F-CMD-003
"""
Tests for .genesis/genesis.yml config resolution and gen-install.py.

Covers:
  - _load_project_config: reads/parses .genesis/genesis.yml
  - _import_symbol: imports MODULE:VAR, error paths
  - CLI resolution: missing config, flags override config, wrong symbol type
  - gen-install.py: writes genesis.yml, starter spec, reinstall idempotence
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import pytest
from pathlib import Path

from genesis.__main__ import _import_symbol, _load_project_config
from genesis.core import workspace_bootstrap


# ── Helpers ───────────────────────────────────────────────────────────────────

def _subprocess_env(workspace: Path) -> dict:
    root = Path(__file__).resolve().parent.parent.parent.parent
    env = os.environ.copy()
    # workspace first: lets tests import spec.packages.test_pkg before
    # the abiogenesis-root spec/ package shadows it.
    paths = [
        str(workspace),
        str(root / "builds" / "claude_code" / "code"),
        str(root),
    ]
    existing = env.get("PYTHONPATH", "")
    env["PYTHONPATH"] = os.pathsep.join(paths + ([existing] if existing else []))
    return env


def _write_minimal_pkg(workspace: Path, slug: str = "test_pkg") -> Path:
    """Write a minimal importable Package/Worker module under workspace/spec/packages/."""
    pkg_dir = workspace / "spec" / "packages"
    pkg_dir.mkdir(parents=True, exist_ok=True)
    (workspace / "spec" / "__init__.py").touch()
    (workspace / "spec" / "packages" / "__init__.py").touch()
    pkg_file = pkg_dir / f"{slug}.py"
    pkg_file.write_text(
        "from gtl.core import Asset, Edge, Evaluator, Job, Operator, Package, Worker, F_P\n"
        f"src = Asset(name='src', id_format='SRC-{{SEQ}}')\n"
        f"tgt = Asset(name='tgt', id_format='TGT-{{SEQ}}', lineage=[src])\n"
        "op = Operator('agent', F_P, 'agent://test')\n"
        "edge = Edge(name='src\u2192tgt', source=src, target=tgt, using=[op])\n"
        "job = Job(edge=edge, evaluators=[Evaluator('done', F_P, 'check')])\n"
        f"package = Package(name='{slug}', assets=[src, tgt], edges=[edge], operators=[op])\n"
        "worker = Worker(id='test_worker', can_execute=[job])\n"
    )
    return pkg_file


def _run_gaps(workspace: Path, extra_args: list = ()) -> subprocess.CompletedProcess:
    cmd = [sys.executable, "-m", "genesis", "gaps", "--workspace", str(workspace)]
    return subprocess.run(
        list(cmd) + list(extra_args),
        capture_output=True, text=True,
        cwd=str(workspace),
        env=_subprocess_env(workspace),
    )


# ── _load_project_config ──────────────────────────────────────────────────────

class TestLoadProjectConfig:
    def test_missing_file_returns_empty(self, tmp_path):
        assert _load_project_config(tmp_path) == {}

    def test_reads_package_and_worker(self, tmp_path):
        (tmp_path / ".genesis").mkdir()
        (tmp_path / ".genesis" / "genesis.yml").write_text(
            "package: spec.packages.foo:package\n"
            "worker: spec.packages.foo:worker\n"
        )
        cfg = _load_project_config(tmp_path)
        assert cfg["package"] == "spec.packages.foo:package"
        assert cfg["worker"] == "spec.packages.foo:worker"

    def test_ignores_comments_and_blank_lines(self, tmp_path):
        (tmp_path / ".genesis").mkdir()
        (tmp_path / ".genesis" / "genesis.yml").write_text(
            "# Genesis project config\n"
            "\n"
            "package: spec.packages.foo:package\n"
        )
        cfg = _load_project_config(tmp_path)
        assert set(cfg.keys()) == {"package"}

    def test_strips_whitespace(self, tmp_path):
        (tmp_path / ".genesis").mkdir()
        (tmp_path / ".genesis" / "genesis.yml").write_text(
            "package:  spec.packages.foo:package  \n"
            "worker:   spec.packages.foo:worker   \n"
        )
        cfg = _load_project_config(tmp_path)
        assert cfg["package"] == "spec.packages.foo:package"
        assert cfg["worker"] == "spec.packages.foo:worker"


# ── _import_symbol ────────────────────────────────────────────────────────────

class TestImportSymbol:
    def _add_module(self, tmp_path: Path, name: str, content: str) -> None:
        (tmp_path / f"{name}.py").write_text(content)
        if str(tmp_path) not in sys.path:
            sys.path.insert(0, str(tmp_path))

    def teardown_method(self, method):
        for key in list(sys.modules.keys()):
            if key.startswith("_tmp_test_"):
                del sys.modules[key]

    def test_valid_import_returns_symbol(self, tmp_path):
        self._add_module(tmp_path, "_tmp_test_a", "MY_VAR = 42\n")
        result = _import_symbol("_tmp_test_a:MY_VAR", tmp_path)
        assert result == 42

    def test_missing_colon_raises_value_error(self, tmp_path):
        with pytest.raises(ValueError, match="MODULE:VAR"):
            _import_symbol("nocoion", tmp_path)

    def test_bad_module_raises_import_error(self, tmp_path):
        with pytest.raises(ImportError):
            _import_symbol("nonexistent_module_xyz_abc:foo", tmp_path)

    def test_missing_var_raises_import_error(self, tmp_path):
        self._add_module(tmp_path, "_tmp_test_b", "X = 1\n")
        with pytest.raises(ImportError, match="not found"):
            _import_symbol("_tmp_test_b:DOES_NOT_EXIST", tmp_path)


# ── CLI config resolution ─────────────────────────────────────────────────────

@pytest.mark.e2e
class TestCLIConfigResolution:
    def test_missing_config_exits_1(self, tmp_path):
        """No .genesis/genesis.yml and no flags → exit 1 with clear message."""
        workspace_bootstrap(tmp_path)
        result = _run_gaps(tmp_path)
        assert result.returncode == 1
        assert "no package/worker" in result.stderr

    def test_flags_resolve_package_and_worker(self, tmp_path):
        """--package and --worker flags are sufficient; no config file needed."""
        workspace_bootstrap(tmp_path)
        _write_minimal_pkg(tmp_path)
        result = _run_gaps(tmp_path, [
            "--package", "spec.packages.test_pkg:package",
            "--worker",  "spec.packages.test_pkg:worker",
        ])
        assert result.returncode == 0, result.stderr
        data = json.loads(result.stdout)
        assert "gaps" in data

    def test_config_file_resolves_without_flags(self, tmp_path):
        """.genesis/genesis.yml provides package/worker without any CLI flags."""
        workspace_bootstrap(tmp_path)
        _write_minimal_pkg(tmp_path)
        (tmp_path / ".genesis").mkdir(exist_ok=True)
        (tmp_path / ".genesis" / "genesis.yml").write_text(
            "package: spec.packages.test_pkg:package\n"
            "worker:  spec.packages.test_pkg:worker\n"
        )
        result = _run_gaps(tmp_path)
        assert result.returncode == 0, result.stderr
        data = json.loads(result.stdout)
        assert "gaps" in data

    def test_flags_override_config(self, tmp_path):
        """CLI flags take precedence over .genesis/genesis.yml."""
        workspace_bootstrap(tmp_path)
        _write_minimal_pkg(tmp_path)
        (tmp_path / ".genesis").mkdir(exist_ok=True)
        # Config points to a nonexistent module
        (tmp_path / ".genesis" / "genesis.yml").write_text(
            "package: nonexistent.module:package\n"
            "worker:  nonexistent.module:worker\n"
        )
        # Flags override to the real package — should succeed
        result = _run_gaps(tmp_path, [
            "--package", "spec.packages.test_pkg:package",
            "--worker",  "spec.packages.test_pkg:worker",
        ])
        assert result.returncode == 0, result.stderr

    def test_wrong_symbol_type_exits_1(self, tmp_path):
        """Symbol that is not a Package → clear error, exit 1."""
        workspace_bootstrap(tmp_path)
        pkg_dir = tmp_path / "spec" / "packages"
        pkg_dir.mkdir(parents=True, exist_ok=True)
        (tmp_path / "spec" / "__init__.py").touch()
        (tmp_path / "spec" / "packages" / "__init__.py").touch()
        (pkg_dir / "bad_pkg.py").write_text(
            "package = 'not_a_package'\nworker = 'not_a_worker'\n"
        )
        result = _run_gaps(tmp_path, [
            "--package", "spec.packages.bad_pkg:package",
            "--worker",  "spec.packages.bad_pkg:worker",
        ])
        assert result.returncode == 1
        assert "Package" in result.stderr

    def test_bad_module_path_exits_1(self, tmp_path):
        """Non-importable module path → exit 1 with import error."""
        workspace_bootstrap(tmp_path)
        result = _run_gaps(tmp_path, [
            "--package", "nonexistent.module.xyz:package",
            "--worker",  "nonexistent.module.xyz:worker",
        ])
        assert result.returncode == 1
        assert "Cannot import" in result.stderr


# ── gen-install.py ────────────────────────────────────────────────────────────

@pytest.mark.e2e
class TestGenInstall:
    _installer = (
        Path(__file__).resolve().parent.parent.parent.parent
        / "builds" / "claude_code" / "code" / "gen-install.py"
    )

    def _install(self, target: Path, extra_args: list = ()) -> dict:
        result = subprocess.run(
            [sys.executable, str(self._installer), "--target", str(target)]
            + list(extra_args),
            capture_output=True, text=True,
        )
        return json.loads(result.stdout) if result.stdout.strip() else {}

    def test_writes_genesis_yml(self, tmp_path):
        self._install(tmp_path)
        config = tmp_path / ".genesis" / "genesis.yml"
        assert config.exists()
        text = config.read_text()
        assert "package:" in text
        assert "worker:" in text

    def test_writes_starter_spec(self, tmp_path):
        self._install(tmp_path)
        starter = tmp_path / "spec" / "packages" / "project_package.py"
        assert starter.exists()

    def test_custom_slug(self, tmp_path):
        self._install(tmp_path, ["--project-slug", "my_domain"])
        assert (tmp_path / "spec" / "packages" / "my_domain.py").exists()
        config_text = (tmp_path / ".genesis" / "genesis.yml").read_text()
        assert "my_domain" in config_text

    def test_reinstall_does_not_clobber_starter_spec(self, tmp_path):
        """Starter spec is user data — reinstall must not overwrite it."""
        self._install(tmp_path)
        starter = tmp_path / "spec" / "packages" / "project_package.py"
        starter.write_text(starter.read_text() + "\n# user edit\n")
        self._install(tmp_path)
        assert "# user edit" in starter.read_text()

    def test_reinstall_overwrites_genesis_yml(self, tmp_path):
        """genesis.yml is engine config — reinstall rewrites it (idempotent)."""
        self._install(tmp_path)
        first = (tmp_path / ".genesis" / "genesis.yml").read_text()
        self._install(tmp_path)
        second = (tmp_path / ".genesis" / "genesis.yml").read_text()
        assert first == second

    def test_invalid_slug_exits_1(self, tmp_path):
        result = subprocess.run(
            [sys.executable, str(self._installer),
             "--target", str(tmp_path), "--project-slug", "not-valid!"],
            capture_output=True, text=True,
        )
        assert result.returncode == 1
        assert "identifier" in result.stderr
