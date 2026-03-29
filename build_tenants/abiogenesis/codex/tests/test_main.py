# Validates: REQ-F-TAG-001
# Validates: REQ-F-COV-001
# Validates: REQ-F-EVAL-004
# Validates: REQ-F-EVAL-001
# Validates: REQ-F-BIND-001
from __future__ import annotations

import json
import sys
from types import SimpleNamespace

import genesis.__main__ as main_mod
from genesis.__main__ import _check_req_coverage, _check_tags, _validate_emit_payload
from genesis.bind import run_fd_evaluator
from gtl.core import Asset, Edge, Evaluator, Operator, F_D, F_P


def test_check_tags_fails_for_untagged_file(tmp_path, capsys):
    (tmp_path / "x.py").write_text("print('x')\n")
    rc = _check_tags("implements", str(tmp_path))
    assert rc == 1
    result = json.loads(capsys.readouterr().out)
    assert result["untagged_count"] == 1


def test_check_req_coverage_uses_package_requirements(tmp_path, capsys, monkeypatch):
    pkg = SimpleNamespace(requirements=["REQ-F-ONE", "REQ-F-TWO"])
    module = SimpleNamespace(pkg=pkg)
    monkeypatch.setitem(sys.modules, "fake_pkg", module)
    feature_dir = tmp_path / "features"
    feature_dir.mkdir()
    (feature_dir / "one.yml").write_text("satisfies: ['REQ-F-ONE']\n")
    rc = _check_req_coverage("", str(feature_dir), package_ref="fake_pkg:pkg")
    assert rc == 1
    result = json.loads(capsys.readouterr().out)
    assert "REQ-F-TWO" in result["uncovered"]


def test_validate_emit_payload_rejects_missing_spec_hash():
    errors = _validate_emit_payload(
        "assessed",
        {"kind": "fp", "edge": "design→code", "evaluator": "done", "result": "pass"},
    )
    assert errors


def test_run_fd_evaluator_uses_codex_pythonpath(tmp_path):
    src = Asset(name="design", id_format="DES-{SEQ}")
    tgt = Asset(name="code", id_format="CODE-{SEQ}")
    op = Operator("agent", F_P, "agent://codex/test")
    edge = Edge(name="design→code", source=src, target=tgt, using=[op])
    evaluator = Evaluator(
        "show_genesis",
        F_D,
        "prints resolved genesis module path",
        command="python -c \"import genesis; print(genesis.__file__)\"",
    )
    passes, detail = run_fd_evaluator(evaluator, {"status": "in_progress"}, tmp_path)
    assert passes is True
    assert "build_tenants/abiogenesis/codex/code/genesis/__init__.py" in detail["stdout"]


def test_main_resolves_codex_package_and_worker(monkeypatch, tmp_path, capsys):
    class DummyStream:
        workflow_version = "unknown"

    monkeypatch.setattr(main_mod, "workspace_bootstrap", lambda workspace: DummyStream())
    monkeypatch.setattr(main_mod, "gen_gaps", lambda scope, stream: {"status": "converged"})
    rc = main_mod.main(
        [
            "gaps",
            "--workspace",
            str(tmp_path),
            "--package",
            "gtl_spec.packages.abiogenesis:package",
            "--worker",
            "gtl_spec.packages.abiogenesis:worker",
        ]
    )
    assert rc == 0
    result = json.loads(capsys.readouterr().out)
    assert result["status"] == "converged"


def test_validate_emit_payload_accepts_run_bound_shape():
    errors = _validate_emit_payload(
        "approved",
        {"kind": "fh_review", "edge": "design→code", "actor": "human"},
    )
    assert not errors
