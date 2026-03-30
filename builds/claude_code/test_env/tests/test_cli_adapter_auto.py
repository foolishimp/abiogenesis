# Validates: REQ-R-ABG2-INTERPRET
# Validates: REQ-R-ABG2-SELFHOSTING
from __future__ import annotations

from pathlib import Path

from genesis import cli_adapter
from genesis import services


def test_run_start_auto_invokes_fp_dispatch_hook_and_retries(monkeypatch, tmp_path: Path):
    results = iter(
        (
            {
                "status": "iterated",
                "blocking_reason": "fp_dispatch",
                "edge": "requirements→design",
                "fp_manifest_path": str(tmp_path / "manifest.json"),
            },
            {
                "status": "converged",
                "message": "done",
            },
        )
    )
    hook_calls: list[tuple[str, Path]] = []

    def fake_gen_start(scope, stream, auto=False):
        assert auto is False
        return next(results)

    def fake_fp_dispatch(result, workspace):
        hook_calls.append((result["edge"], workspace))
        return True

    def fake_resolve(mod_ref, hook_name):
        if hook_name == "auto_fp_dispatch":
            return fake_fp_dispatch
        return None

    monkeypatch.setattr(services, "gen_start", fake_gen_start)
    monkeypatch.setattr(cli_adapter, "_resolve_runtime_hook", fake_resolve)

    result = cli_adapter._run_start_auto(
        object(),
        object(),
        workspace=tmp_path,
        mod_ref="demo.module:module",
        human_proxy=False,
    )

    assert result["status"] == "converged"
    assert result["auto"] is True
    assert hook_calls == [("requirements→design", tmp_path)]


def test_run_start_auto_human_proxy_handles_fh_gate_and_retries(monkeypatch, tmp_path: Path):
    results = iter(
        (
            {
                "status": "pending",
                "blocking_reason": "fh_gate",
                "edge": "design→review",
            },
            {
                "status": "converged",
                "message": "done",
            },
        )
    )
    approvals: list[str] = []

    def fake_gen_start(scope, stream, auto=False):
        assert auto is False
        return next(results)

    def fake_resolve(mod_ref, hook_name):
        return None

    def fake_emit_human_proxy_approval(workspace, edge):
        approvals.append(edge)

    monkeypatch.setattr(services, "gen_start", fake_gen_start)
    monkeypatch.setattr(cli_adapter, "_resolve_runtime_hook", fake_resolve)
    monkeypatch.setattr(cli_adapter, "_emit_human_proxy_approval", fake_emit_human_proxy_approval)

    result = cli_adapter._run_start_auto(
        object(),
        object(),
        workspace=tmp_path,
        mod_ref="demo.module:module",
        human_proxy=True,
    )

    assert result["status"] == "converged"
    assert result["auto"] is True
    assert result["human_proxy"] is True
    assert approvals == ["design→review"]
