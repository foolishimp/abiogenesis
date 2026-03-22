# Validates: REQ-F-CMD-001
# Validates: REQ-F-CMD-002
# Validates: REQ-F-CMD-003
# Validates: REQ-F-CMD-004
# Validates: REQ-F-GATE-002
# Validates: REQ-F-PROV-002
# Validates: REQ-F-PROV-003
"""Tests for genesis.commands — Scope, gen_gaps, gen_iterate, gen_start."""
import json
import pytest
from pathlib import Path
from gtl.core import (
    Asset, Context, Edge, Evaluator, Job, Operator, Package,
    Rule, Worker,
    F_D, F_P, F_H, consensus,
)

from genesis.core import EventStream, workspace_bootstrap
from genesis.commands import (
    Scope, gen_gaps, gen_iterate, gen_start, _scoped_jobs, _known_feature_ids,
    _read_workflow_version, _read_carry_forward,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _make_package_and_worker():
    """Minimal Package + Worker for testing commands. One F_P evaluator — always has gap."""
    intent = Asset(name="intent", id_format="INT-{SEQ}")
    code = Asset(name="code", id_format="CODE-{SEQ}")
    op = Operator("claude_agent", F_P, "agent://claude/genesis")
    edge = Edge(name="intent→code", source=intent, target=code, using=[op])
    job = Job(edge=edge, evaluators=[Evaluator("code_complete", F_P, "LLM check")])
    rule = Rule("gate", approve=consensus(1, 1))
    ctx = Context(name="bootloader", locator="workspace://gtl_spec/GTL_BOOTLOADER.md",
                  digest="sha256:" + "0" * 64)
    pkg = Package(
        name="test_package",
        assets=[intent, code],
        edges=[edge],
        operators=[op],
        rules=[rule],
        contexts=[ctx],
    )
    worker = Worker(id="claude_code", can_execute=[job])
    return pkg, worker, job


def _make_fd_only_package_and_worker():
    """Package + Worker with one always-failing F_D evaluator — no F_P, no F_H."""
    src = Asset(name="source", id_format="SRC-{SEQ}")
    tgt = Asset(name="output", id_format="OUT-{SEQ}", lineage=[src])
    op = Operator("checker", F_D, "exec://false")
    edge = Edge(name="source→output", source=src, target=tgt, using=[op])
    job = Job(edge=edge, evaluators=[
        Evaluator("always_fail", F_D, "sentinel must exist",
                  command="python -c 'import sys; sys.exit(1)'"),
    ])
    pkg = Package(name="fd_pkg", assets=[src, tgt], edges=[edge], operators=[op])
    worker = Worker(id="checker_worker", can_execute=[job])
    return pkg, worker, job


def _make_fh_package_and_worker():
    """Package + Worker with one F_H evaluator — resolves via approved event."""
    src = Asset(name="draft", id_format="DRAFT-{SEQ}")
    tgt = Asset(name="approved", id_format="APR-{SEQ}", lineage=[src])
    op = Operator("human", F_H, "fh://single")
    edge = Edge(name="draft→approved", source=src, target=tgt, using=[op])
    job = Job(edge=edge, evaluators=[Evaluator("sign_off", F_H, "Human approval")])
    pkg = Package(name="fh_pkg", assets=[src, tgt], edges=[edge], operators=[op])
    worker = Worker(id="reviewer", can_execute=[job])
    return pkg, worker, job


def _make_scope(tmp_path: Path, pkg, worker=None, edge: str = None, feature: str = None) -> Scope:
    return Scope(
        package=pkg,
        workspace_root=tmp_path,
        feature=feature,
        edge=edge,
        worker=worker,
    )


def _make_stream(tmp_path: Path) -> EventStream:
    return workspace_bootstrap(tmp_path)


# ── Scope ─────────────────────────────────────────────────────────────────────

class TestScope:
    def test_scope_fields(self, tmp_path):
        pkg, _, _ = _make_package_and_worker()
        scope = Scope(package=pkg, workspace_root=tmp_path)
        assert scope.build == "claude_code"
        assert scope.feature is None
        assert scope.edge is None

    def test_edge_override(self, tmp_path):
        pkg, _, _ = _make_package_and_worker()
        scope = Scope(package=pkg, workspace_root=tmp_path, edge="design→code")
        assert scope.edge == "design→code"


# ── _scoped_jobs ──────────────────────────────────────────────────────────────

class TestScopedJobs:
    def test_no_filter_returns_all(self, tmp_path):
        pkg, worker, job = _make_package_and_worker()
        scope = _make_scope(tmp_path, pkg)
        jobs = _scoped_jobs(scope, worker)
        assert job in jobs

    def test_edge_filter(self, tmp_path):
        pkg, worker, job = _make_package_and_worker()
        scope = _make_scope(tmp_path, pkg, edge="intent→code")
        jobs = _scoped_jobs(scope, worker)
        assert len(jobs) == 1
        assert jobs[0].edge.name == "intent→code"

    def test_non_matching_edge_returns_empty(self, tmp_path):
        pkg, worker, _ = _make_package_and_worker()
        scope = _make_scope(tmp_path, pkg, edge="nonexistent→edge")
        jobs = _scoped_jobs(scope, worker)
        assert jobs == []

    def test_unknown_feature_fails_closed(self, tmp_path):
        """G4: unknown scope.feature returns empty — fails closed."""
        pkg, worker, _ = _make_package_and_worker()
        scope = _make_scope(tmp_path, pkg, feature="REQ-F-UNKNOWN")
        jobs = _scoped_jobs(scope, worker)
        assert jobs == []

    def test_known_feature_passes_existence_check(self, tmp_path):
        """G4 V1 semantics: known feature validates existence; all jobs returned
        (V1 has single trajectory — --feature does not narrow scope, only validates)."""
        pkg, worker, job = _make_package_and_worker()
        features_dir = tmp_path / ".ai-workspace" / "features" / "active"
        features_dir.mkdir(parents=True)
        (features_dir / "REQ-F-CORE.yml").write_text("feature: REQ-F-CORE\n")
        scope = _make_scope(tmp_path, pkg, feature="REQ-F-CORE")
        jobs = _scoped_jobs(scope, worker)
        # All jobs returned — V1 single trajectory, no per-job feature routing
        assert job in jobs
        assert len(jobs) == len(worker.can_execute)

    def test_known_feature_ids_reads_active_and_completed(self, tmp_path):
        """_known_feature_ids reads both active/ and completed/ subdirs."""
        active = tmp_path / ".ai-workspace" / "features" / "active"
        completed = tmp_path / ".ai-workspace" / "features" / "completed"
        active.mkdir(parents=True)
        completed.mkdir(parents=True)
        (active / "REQ-F-CORE.yml").write_text("")
        (completed / "REQ-F-BIND.yml").write_text("")
        ids = _known_feature_ids(tmp_path)
        assert "REQ-F-CORE" in ids
        assert "REQ-F-BIND" in ids


# ── gen_gaps ──────────────────────────────────────────────────────────────────

class TestGenGaps:
    def test_returns_gap_report(self, tmp_path):
        pkg, worker, _ = _make_package_and_worker()
        stream = _make_stream(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker=worker)
        result = gen_gaps(scope, stream)
        assert "gaps" in result
        assert "total_delta" in result
        assert result["jobs_considered"] >= 1

    def test_empty_scope_returns_error(self, tmp_path):
        pkg, worker, _ = _make_package_and_worker()
        stream = _make_stream(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker=worker, edge="no→match")
        result = gen_gaps(scope, stream)
        assert result["status"] == "error"

    def test_converged_field_false_when_gap(self, tmp_path):
        pkg, worker, _ = _make_package_and_worker()
        stream = _make_stream(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker=worker)
        result = gen_gaps(scope, stream)
        # F_P evaluator unresolved — not converged
        assert result["converged"] is False

    def test_emits_edge_converged_when_delta_zero(self, tmp_path):
        """gen_gaps emits exactly one edge_converged with required fields on first delta=0."""
        pkg, worker, _ = _make_fh_package_and_worker()
        stream = _make_stream(tmp_path)
        stream.append("approved", {
            "kind": "fh_review", "edge": "draft→approved", "actor": "human", "evaluator": "sign_off",
        })
        scope = _make_scope(tmp_path, pkg, worker=worker)
        result = gen_gaps(scope, stream)
        assert result["converged"] is True
        certs = [
            e for e in stream.all_events()
            if e["event_type"] == "edge_converged"
            and e["data"]["edge"] == "draft→approved"
        ]
        assert len(certs) == 1
        assert certs[0]["data"]["target"] == "approved"
        assert certs[0]["data"]["delta"] == 0
        assert certs[0]["data"]["certified_by"] == "gen_gaps"

    def test_repeated_gen_gaps_does_not_duplicate_edge_converged(self, tmp_path):
        """gen_gaps is idempotent: repeated calls on a converged workspace emit only one certificate."""
        pkg, worker, _ = _make_fh_package_and_worker()
        stream = _make_stream(tmp_path)
        stream.append("approved", {
            "kind": "fh_review", "edge": "draft→approved", "actor": "human", "evaluator": "sign_off",
        })
        scope = _make_scope(tmp_path, pkg, worker=worker)
        gen_gaps(scope, stream)
        gen_gaps(scope, stream)
        gen_gaps(scope, stream)
        certs = [
            e for e in stream.all_events()
            if e["event_type"] == "edge_converged"
            and e["data"]["edge"] == "draft→approved"
        ]
        assert len(certs) == 1  # exactly one, not three

    def test_no_edge_converged_when_gap_exists(self, tmp_path):
        """gen_gaps does not emit edge_converged when delta > 0."""
        pkg, worker, _ = _make_package_and_worker()
        stream = _make_stream(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker=worker)
        gen_gaps(scope, stream)
        assert not any(
            e["event_type"] == "edge_converged" for e in stream.all_events()
        )


# ── gen_iterate ───────────────────────────────────────────────────────────────

class TestGenIterate:
    def test_returns_iterated_status(self, tmp_path):
        pkg, worker, _ = _make_package_and_worker()
        stream = _make_stream(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker=worker)
        result = gen_iterate(scope, stream)
        assert result["status"] == "iterated"

    def test_nothing_to_do_when_no_jobs(self, tmp_path):
        pkg, worker, _ = _make_package_and_worker()
        stream = _make_stream(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker=worker, edge="no→match")
        result = gen_iterate(scope, stream)
        assert result["status"] == "nothing_to_do"

    def test_edge_started_emitted(self, tmp_path):
        pkg, worker, _ = _make_package_and_worker()
        stream = _make_stream(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker=worker)
        gen_iterate(scope, stream)
        events = stream.all_events()
        assert any(e["event_type"] == "edge_started" for e in events)

    def test_on_fp_dispatch_called(self, tmp_path):
        pkg, worker, _ = _make_package_and_worker()
        stream = _make_stream(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker=worker)
        dispatched = []
        gen_iterate(scope, stream, on_fp_dispatch=lambda b: dispatched.append(b))
        assert len(dispatched) == 1

    def test_returns_converged_when_all_evaluators_pass(self, tmp_path):
        """gen_iterate returns 'converged' when no unconverged job is found."""
        pkg, worker, _ = _make_fh_package_and_worker()
        stream = _make_stream(tmp_path)
        stream.append("approved", {
            "kind": "fh_review",
            "edge": "draft→approved",
            "actor": "human",
            "evaluator": "sign_off",
        })
        scope = _make_scope(tmp_path, pkg, worker=worker)
        result = gen_iterate(scope, stream)
        assert result["status"] == "converged"


# ── gen_start ─────────────────────────────────────────────────────────────────

class TestGenStart:
    def test_returns_iterated_when_work_pending(self, tmp_path):
        pkg, worker, _ = _make_package_and_worker()
        stream = _make_stream(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker=worker)
        result = gen_start(scope, stream)
        assert result["status"] == "iterated"

    def test_returns_nothing_to_do_when_no_jobs(self, tmp_path):
        pkg, worker, _ = _make_package_and_worker()
        stream = _make_stream(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker=worker, edge="no→match")
        result = gen_start(scope, stream)
        assert result["status"] == "nothing_to_do"

    def test_auto_loop_stops_on_fp_dispatch(self, tmp_path):
        """gen_start with auto=True stops after first F_P dispatch — waits for actor."""
        pkg, worker, _ = _make_package_and_worker()  # has F_P evaluator
        stream = _make_stream(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker=worker)
        dispatched = []
        result = gen_start(scope, stream, auto=True, on_fp_dispatch=dispatched.append)
        assert result.get("auto") is True
        assert result.get("stopped_by") == "fp_dispatch"
        assert len(dispatched) == 1

    def test_auto_loop_converges(self, tmp_path):
        """gen_start with auto=True returns converged when all evaluators pass."""
        pkg, worker, _ = _make_fh_package_and_worker()
        stream = _make_stream(tmp_path)
        stream.append("approved", {
            "kind": "fh_review", "edge": "draft→approved", "actor": "human", "evaluator": "sign_off",
        })
        scope = _make_scope(tmp_path, pkg, worker=worker)
        result = gen_start(scope, stream, auto=True)
        assert result["status"] == "converged"

    def test_auto_loop_stops_on_fd_gap(self, tmp_path):
        """gen_start with auto=True stops after first F_D gap — cannot auto-resolve."""
        pkg, worker, _ = _make_fd_only_package_and_worker()
        stream = _make_stream(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker=worker)
        result = gen_start(scope, stream, auto=True)
        assert result.get("auto") is True
        assert result.get("stopped_by") == "fd_gap"
        # Only one iteration: edge_started + found(fd_gap), not repeated
        events = stream.all_events()
        assert sum(1 for e in events if e["event_type"] == "edge_started") == 1

    def test_returns_converged_when_all_evaluators_pass(self, tmp_path):
        """gen_start returns 'converged' when _derive_state finds total_delta=0."""
        pkg, worker, _ = _make_fh_package_and_worker()
        stream = _make_stream(tmp_path)
        stream.append("approved", {
            "kind": "fh_review",
            "edge": "draft→approved",
            "actor": "human",
            "evaluator": "sign_off",
        })
        scope = _make_scope(tmp_path, pkg, worker=worker)
        result = gen_start(scope, stream)
        assert result["status"] == "converged"


# ── REQ-F-GATE-002: F_D blocks F_P manifest production ────────────────────────

class TestFdGateNoManifest:
    """REQ-F-GATE-002: gen_iterate must not produce an fp_manifest_path when F_D is red."""

    def _make_mixed_fd_fp_package(self):
        """Package with one always-failing F_D and one F_P evaluator."""
        src = Asset(name="design", id_format="DES-{SEQ}")
        tgt = Asset(name="code", id_format="CODE-{SEQ}", lineage=[src])
        op_fd = Operator("checker", F_D, "exec://false")
        op_fp = Operator("agent", F_P, "agent://claude/genesis")
        edge = Edge(name="design→code", source=src, target=tgt, using=[op_fd, op_fp])
        job = Job(edge=edge, evaluators=[
            Evaluator("impl_tags", F_D, "tags must exist",
                      command="python -c 'import sys; sys.exit(1)'"),
            Evaluator("code_complete", F_P, "agent check"),
        ])
        pkg = Package(name="mixed_pkg", assets=[src, tgt], edges=[edge],
                      operators=[op_fd, op_fp])
        worker = Worker(id="claude_code", can_execute=[job])
        return pkg, worker

    def test_no_manifest_when_fd_failing(self, tmp_path):
        """gen_iterate returns fd_gap without producing fp_manifest_path."""
        pkg, worker = self._make_mixed_fd_fp_package()
        stream = workspace_bootstrap(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker=worker)
        result = gen_iterate(scope, stream)
        assert result.get("stopped_by") == "fd_gap"
        assert "fp_manifest_path" not in result, (
            "fp_manifest_path must not be present when F_D is failing"
        )

    def test_no_edge_started_when_fd_blocking_fp(self, tmp_path):
        """No edge_started event when gen_iterate returns early due to F_D gate."""
        pkg, worker = self._make_mixed_fd_fp_package()
        stream = workspace_bootstrap(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker=worker)
        gen_iterate(scope, stream)
        events = stream.all_events()
        assert not any(e["event_type"] == "edge_started" for e in events)

    def test_found_emitted_when_fd_blocking_fp(self, tmp_path):
        """found (fd_gap) IS emitted in early return so gen_start auto-loop detects it."""
        pkg, worker = self._make_mixed_fd_fp_package()
        stream = workspace_bootstrap(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker=worker)
        gen_iterate(scope, stream)
        events = stream.all_events()
        assert any(e["event_type"] == "found" for e in events), (
            "found (fd_gap) must be in stream so gen_start(auto=True) stops at fd_gap"
        )

    def test_gen_start_auto_stops_at_fd_gap_with_mixed_evaluators(self, tmp_path):
        """gen_start(auto=True) stops with fd_gap when F_D+F_P both failing."""
        pkg, worker = self._make_mixed_fd_fp_package()
        stream = workspace_bootstrap(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker=worker)
        result = gen_start(scope, stream, auto=True)
        assert result.get("stopped_by") == "fd_gap", (
            f"Expected fd_gap, got: {result.get('stopped_by')} — "
            "auto-loop must not run to max_iterations"
        )


# ── REQ-F-CMD-004: edge_converged deduplication by (edge, feature) ─────────────

class TestEdgeConvergedDedup:
    """REQ-F-CMD-004: gen_gaps() emits edge_converged per (edge, feature) pair."""

    def _make_fh_converged_package(self):
        """Package with one F_H evaluator — converged when approved event exists."""
        src = Asset(name="src", id_format="SRC-{SEQ}")
        tgt = Asset(name="out", id_format="OUT-{SEQ}", lineage=[src])
        op = Operator("human", F_H, "fh://single")
        edge = Edge(name="src→out", source=src, target=tgt, using=[op])
        job = Job(edge=edge, evaluators=[Evaluator("approved", F_H, "human sign-off")])
        pkg = Package(name="conv_pkg", assets=[src, tgt], edges=[edge], operators=[op])
        worker = Worker(id="claude_code", can_execute=[job])
        return pkg, worker

    def _write_feature(self, tmp_path: Path, feature_id: str) -> None:
        """Create a minimal feature YAML so _known_feature_ids() recognises it."""
        active = tmp_path / ".ai-workspace" / "features" / "active"
        active.mkdir(parents=True, exist_ok=True)
        (active / f"{feature_id}.yml").write_text(
            f"id: {feature_id}\ntitle: test\nstatus: iterating\nsatisfies: []\n"
        )

    def test_two_features_get_separate_certificates(self, tmp_path):
        """Two feature IDs on the same converged edge each get their own certificate."""
        pkg, worker = self._make_fh_converged_package()
        stream = workspace_bootstrap(tmp_path)
        self._write_feature(tmp_path, "FEAT-001")
        self._write_feature(tmp_path, "FEAT-002")
        # Single approved covers the edge for both features
        stream.append("approved", {"kind": "fh_review", "edge": "src→out", "actor": "human"})

        scope_f1 = _make_scope(tmp_path, pkg, worker=worker, feature="FEAT-001")
        gen_gaps(scope_f1, stream)

        scope_f2 = _make_scope(tmp_path, pkg, worker=worker, feature="FEAT-002")
        gen_gaps(scope_f2, stream)

        certs = [
            e for e in stream.all_events()
            if e["event_type"] == "edge_converged"
        ]
        features_certified = {c["data"].get("feature") for c in certs}
        assert "FEAT-001" in features_certified
        assert "FEAT-002" in features_certified

    def test_same_feature_not_duplicated(self, tmp_path):
        """Calling gen_gaps twice for the same feature does not emit duplicate certificates."""
        pkg, worker = self._make_fh_converged_package()
        stream = workspace_bootstrap(tmp_path)
        self._write_feature(tmp_path, "FEAT-001")
        stream.append("approved", {"kind": "fh_review", "edge": "src→out", "actor": "human"})
        scope = _make_scope(tmp_path, pkg, worker=worker, feature="FEAT-001")

        gen_gaps(scope, stream)
        gen_gaps(scope, stream)

        certs = [
            e for e in stream.all_events()
            if e["event_type"] == "edge_converged"
            and e["data"].get("feature") == "FEAT-001"
        ]
        assert len(certs) == 1, "Duplicate certificate emitted for same (edge, feature)"


# ── _read_workflow_version ─────────────────────────────────────────────────────

class TestReadWorkflowVersion:
    def test_returns_unknown_when_file_absent(self, tmp_path):
        """No active-workflow.json → 'unknown' (never raises)."""
        assert _read_workflow_version(tmp_path) == "unknown"

    def test_returns_formatted_string_when_valid(self, tmp_path):
        runtime = tmp_path / ".ai-workspace" / "runtime"
        runtime.mkdir(parents=True)
        (runtime / "active-workflow.json").write_text(
            json.dumps({"workflow": "genesis_sdlc.standard", "version": "0.2.1"}),
            encoding="utf-8",
        )
        assert _read_workflow_version(tmp_path) == "genesis_sdlc.standard@0.2.1"

    def test_returns_unknown_on_invalid_json(self, tmp_path):
        runtime = tmp_path / ".ai-workspace" / "runtime"
        runtime.mkdir(parents=True)
        (runtime / "active-workflow.json").write_text("not json", encoding="utf-8")
        assert _read_workflow_version(tmp_path) == "unknown"

    def test_returns_unknown_when_keys_missing(self, tmp_path):
        runtime = tmp_path / ".ai-workspace" / "runtime"
        runtime.mkdir(parents=True)
        (runtime / "active-workflow.json").write_text(
            json.dumps({"workflow": "genesis_sdlc.standard"}),  # no "version"
            encoding="utf-8",
        )
        assert _read_workflow_version(tmp_path) == "unknown"

    def test_returns_unknown_when_values_not_strings(self, tmp_path):
        runtime = tmp_path / ".ai-workspace" / "runtime"
        runtime.mkdir(parents=True)
        (runtime / "active-workflow.json").write_text(
            json.dumps({"workflow": "genesis_sdlc.standard", "version": 123}),
            encoding="utf-8",
        )
        assert _read_workflow_version(tmp_path) == "unknown"


# ── _read_carry_forward ───────────────────────────────────────────────────────

def _write_manifest(tmp_path: Path, workflow_version: str, carry_forward: list) -> None:
    """Write a manifest.json at the versioned path matching _read_carry_forward's lookup."""
    workflow, version = workflow_version.split("@", 1)
    parts = workflow.split(".", 1)
    pkg_name = parts[0]
    variant = parts[1] if len(parts) > 1 else "default"
    version_dir = "v" + version.replace(".", "_")
    manifest_dir = (
        tmp_path / ".genesis" / "workflows" / pkg_name / variant / version_dir
    )
    manifest_dir.mkdir(parents=True)
    (manifest_dir / "manifest.json").write_text(
        json.dumps({"approved_carry_forward": carry_forward}),
        encoding="utf-8",
    )


class TestReadCarryForward:
    def _scope_with_version(self, tmp_path: Path, version: str) -> Scope:
        """Build a minimal Scope but override workflow_version without reading disk."""
        pkg, _, _ = _make_package_and_worker()
        s = Scope(package=pkg, workspace_root=tmp_path)
        object.__setattr__(s, "workflow_version", version)  # bypass frozen field
        return s

    def test_returns_empty_when_version_unknown(self, tmp_path):
        pkg, _, _ = _make_package_and_worker()
        scope = Scope(package=pkg, workspace_root=tmp_path)
        # No active-workflow.json → workflow_version == "unknown"
        assert _read_carry_forward(scope) == []

    def test_reads_manifest_from_correct_versioned_path(self, tmp_path):
        """Manifest at .genesis/workflows/genesis_sdlc/standard/v0_2_1/manifest.json."""
        version = "genesis_sdlc.standard@0.2.1"
        cf_entry = [{"edge": "design→code", "from_version": "genesis_sdlc.standard@0.2.0"}]
        _write_manifest(tmp_path, version, cf_entry)
        scope = self._scope_with_version(tmp_path, version)
        result = _read_carry_forward(scope)
        assert result == cf_entry

    def test_returns_empty_when_manifest_absent(self, tmp_path):
        version = "genesis_sdlc.standard@0.2.1"
        scope = self._scope_with_version(tmp_path, version)
        assert _read_carry_forward(scope) == []

    def test_returns_empty_when_key_missing_from_manifest(self, tmp_path):
        version = "genesis_sdlc.standard@0.2.1"
        workflow, ver = version.split("@", 1)
        pkg_name, variant = workflow.split(".", 1)
        version_dir = "v" + ver.replace(".", "_")
        manifest_dir = tmp_path / ".genesis" / "workflows" / pkg_name / variant / version_dir
        manifest_dir.mkdir(parents=True)
        (manifest_dir / "manifest.json").write_text(
            json.dumps({"other_key": []}), encoding="utf-8"
        )
        scope = self._scope_with_version(tmp_path, version)
        assert _read_carry_forward(scope) == []


# ── Runtime contract: configured active_workflow and workflow_root ─────────────

class TestRuntimeContractPaths:
    """Configured paths from genesis.yml override .genesis/ fallback."""

    def test_read_workflow_version_from_configured_path(self, tmp_path):
        """active_workflow_path overrides .genesis/active-workflow.json."""
        # Write active-workflow.json to a custom location
        custom_dir = tmp_path / ".gsdlc" / "release"
        custom_dir.mkdir(parents=True)
        (custom_dir / "active-workflow.json").write_text(
            json.dumps({"workflow": "genesis_sdlc.standard", "version": "1.0.0b1"}),
            encoding="utf-8",
        )
        result = _read_workflow_version(tmp_path, ".gsdlc/release/active-workflow.json")
        assert result == "genesis_sdlc.standard@1.0.0b1"

    def test_read_workflow_version_fallback_to_genesis(self, tmp_path):
        """Without .ai-workspace/runtime/ or active_workflow_path, falls back to .genesis/ (legacy)."""
        genesis_dir = tmp_path / ".genesis"
        genesis_dir.mkdir(parents=True)
        (genesis_dir / "active-workflow.json").write_text(
            json.dumps({"workflow": "genesis_sdlc.standard", "version": "0.2.1"}),
            encoding="utf-8",
        )
        result = _read_workflow_version(tmp_path)
        assert result == "genesis_sdlc.standard@0.2.1"

    def test_read_workflow_version_configured_path_not_found(self, tmp_path):
        """Configured path that doesn't exist → 'unknown'."""
        result = _read_workflow_version(tmp_path, ".gsdlc/release/active-workflow.json")
        assert result == "unknown"

    def test_scope_uses_configured_active_workflow_path(self, tmp_path):
        """Scope.__post_init__ reads from active_workflow_path when set."""
        custom_dir = tmp_path / ".gsdlc" / "release"
        custom_dir.mkdir(parents=True)
        (custom_dir / "active-workflow.json").write_text(
            json.dumps({"workflow": "genesis_sdlc.standard", "version": "1.0.0b1"}),
            encoding="utf-8",
        )
        pkg, _, worker = _make_package_and_worker()
        scope = Scope(
            package=pkg, workspace_root=tmp_path, worker=worker,
            active_workflow_path=".gsdlc/release/active-workflow.json",
        )
        assert scope.workflow_version == "genesis_sdlc.standard@1.0.0b1"

    def test_carry_forward_reads_from_configured_workflow_root(self, tmp_path):
        """workflow_root overrides .genesis/workflows/ for manifest lookup."""
        version = "genesis_sdlc.standard@1.0.0b1"
        cf_entry = [{"edge": "design→code", "from_version": "genesis_sdlc.standard@0.5.0"}]

        # Write manifest to custom workflow root
        custom_wf = tmp_path / ".gsdlc" / "release" / "workflows"
        manifest_dir = custom_wf / "genesis_sdlc" / "standard" / "v1_0_0b1"
        manifest_dir.mkdir(parents=True)
        (manifest_dir / "manifest.json").write_text(
            json.dumps({"approved_carry_forward": cf_entry}),
            encoding="utf-8",
        )

        pkg, _, worker = _make_package_and_worker()
        scope = Scope(
            package=pkg, workspace_root=tmp_path, worker=worker,
            active_workflow_path=".gsdlc/release/active-workflow.json",
            workflow_root=".gsdlc/release/workflows",
        )
        object.__setattr__(scope, "workflow_version", version)
        result = _read_carry_forward(scope)
        assert result == cf_entry

    def test_carry_forward_fallback_to_genesis_workflows(self, tmp_path):
        """Without workflow_root, falls back to .genesis/workflows/."""
        version = "genesis_sdlc.standard@0.2.1"
        cf_entry = [{"edge": "intent→requirements"}]
        _write_manifest(tmp_path, version, cf_entry)

        pkg, _, worker = _make_package_and_worker()
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)
        object.__setattr__(scope, "workflow_version", version)
        result = _read_carry_forward(scope)
        assert result == cf_entry


# ── workflow_version annotation in emitted events ─────────────────────────────

class TestWorkflowVersionAnnotation:
    """REQ-F-PROV-002: engine-emitted events carry workflow_version."""

    def _install_active_workflow(self, tmp_path: Path, version: str = "0.2.1") -> None:
        runtime = tmp_path / ".ai-workspace" / "runtime"
        runtime.mkdir(parents=True, exist_ok=True)
        (runtime / "active-workflow.json").write_text(
            json.dumps({"workflow": "genesis_sdlc.standard", "version": version}),
            encoding="utf-8",
        )

    def test_edge_converged_carries_workflow_version(self, tmp_path):
        """gen_gaps emits edge_converged with workflow_version in data (REQ-F-PROV-002)."""
        self._install_active_workflow(tmp_path)
        pkg, worker, _ = _make_fh_package_and_worker()
        stream = workspace_bootstrap(tmp_path)
        stream.append("approved", {
            "kind": "fh_review",
            "edge": "draft→approved",
            "actor": "human",
            "workflow_version": "genesis_sdlc.standard@0.2.1",
        })
        scope = _make_scope(tmp_path, pkg, worker=worker)
        gen_gaps(scope, stream)
        certs = [
            e for e in stream.all_events()
            if e["event_type"] == "edge_converged"
        ]
        assert len(certs) == 1
        assert certs[0]["data"].get("workflow_version") == "genesis_sdlc.standard@0.2.1"

    def test_edge_started_carries_workflow_version(self, tmp_path):
        """gen_iterate emits edge_started with workflow_version in data (REQ-F-PROV-002)."""
        self._install_active_workflow(tmp_path)
        pkg, worker, _ = _make_package_and_worker()
        stream = workspace_bootstrap(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker=worker)
        gen_iterate(scope, stream)
        started = [
            e for e in stream.all_events()
            if e["event_type"] == "edge_started"
        ]
        assert len(started) == 1
        assert started[0]["data"].get("workflow_version") == "genesis_sdlc.standard@0.2.1"
