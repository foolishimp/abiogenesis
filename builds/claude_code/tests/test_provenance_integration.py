# Implements: REQ-F-TEST-001
# Validates: REQ-F-PROV-001
# Validates: REQ-F-PROV-002
# Validates: REQ-F-PROV-003
# Validates: REQ-F-PROV-004
# Validates: REQ-F-PROV-005
"""
Provenance integration tests — REQ-F-PROV-001 through REQ-F-PROV-005.

Six integration scenarios that exercise the full provenance model end-to-end
against a real workspace, without mocking any engine internals.

  IT-1  No provenance file: no active-workflow.json → unversioned fallback behaviour
  IT-2  emit-event annotates workflow_version from active-workflow.json (no Scope needed)
  IT-3  Stale F_P (req_hash format) rejected when workflow version is known
  IT-4  F_H approval invalidated when workflow version changes
  IT-5  approved_carry_forward in manifest allows crossing a version boundary
  IT-6  Pre-provenance approved (no workflow_version field) rejected when version known

These tests fail until Part B (REQ-F-PROV-001) is implemented. They are the
acceptance gate, not the unit-test suite.

NOTE: _write_manifest uses the path convention:
  .genesis/workflows/{pkg}/{variant}/{version}/manifest.json
where workflow "genesis_sdlc.standard@0.2.0" → pkg="genesis_sdlc", variant="standard",
version="0.2.0". Adjust path if implementation uses a different convention (e.g. v0_2_0).
"""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from gtl.core import (
    Asset, Context, Edge, Evaluator, Job, Operator, Package, Rule, Worker,
    F_D, F_P, F_H, consensus,
)

from genesis.bind import req_hash, job_evaluator_hash  # job_evaluator_hash: new in Part B
from genesis.core import workspace_bootstrap
from genesis.commands import Scope, gen_gaps


# ── Helpers ───────────────────────────────────────────────────────────────────

def _write_active_workflow(workspace: Path, workflow: str, version: str) -> None:
    """Write active-workflow.json to .ai-workspace/runtime/ (mutable state)."""
    runtime_dir = workspace / ".ai-workspace" / "runtime"
    runtime_dir.mkdir(parents=True, exist_ok=True)
    (runtime_dir / "active-workflow.json").write_text(
        json.dumps({"workflow": workflow, "version": version})
    )


def _write_manifest(
    workspace: Path,
    workflow_version: str,
    carry_forward: list[dict],
) -> None:
    """
    Write manifest.json at the path the commands layer discovers.

    workflow_version "genesis_sdlc.standard@0.2.0"
      → .genesis/workflows/genesis_sdlc/standard/0.2.0/manifest.json
    """
    workflow, version = workflow_version.split("@", 1)
    parts = workflow.split(".", 1)          # ["genesis_sdlc", "standard"]
    pkg_name = parts[0]
    variant = parts[1] if len(parts) > 1 else "default"
    version_dir = "v" + version.replace(".", "_")
    manifest_dir = workspace / ".genesis" / "workflows" / pkg_name / variant / version_dir
    manifest_dir.mkdir(parents=True, exist_ok=True)
    (manifest_dir / "manifest.json").write_text(json.dumps({
        "workflow": workflow,
        "version": version,
        "approved_carry_forward": carry_forward,
    }))


def _make_fp_package() -> tuple[Package, Worker, Job]:
    """Package with one F_P evaluator only — no F_D subprocess dependency."""
    design = Asset(name="design", id_format="DES-{SEQ}")
    code = Asset(name="code", id_format="CODE-{SEQ}", lineage=[design])
    eval_fp = Evaluator("code_complete", F_P, "Code implements the spec fully")
    op = Operator("claude_agent", F_P, "agent://claude/genesis")
    rule = Rule("gate", approve=consensus(1, 1))
    edge = Edge(
        name="design→code",
        source=design, target=code,
        using=[op], rule=rule, context=[],
    )
    job = Job(edge=edge, evaluators=[eval_fp])
    pkg = Package(
        name="prov_fp_test",
        assets=[design, code],
        edges=[edge],
        operators=[op],
        rules=[rule],
        contexts=[],
        requirements=["REQ-PROV-001"],
    )
    worker = Worker(id="claude_code", can_execute=[job])
    return pkg, worker, job


def _make_fh_package() -> tuple[Package, Worker, Job]:
    """Package with F_P + F_H evaluators — no F_D subprocess dependency."""
    design = Asset(name="design", id_format="DES-{SEQ}")
    code = Asset(name="code", id_format="CODE-{SEQ}", lineage=[design])
    eval_fp = Evaluator("code_complete", F_P, "Code implements the spec fully")
    eval_fh = Evaluator("design_approved", F_H, "Human confirms design is correct")
    op_agent = Operator("claude_agent", F_P, "agent://claude/genesis")
    op_human = Operator("human_gate", F_H, "fh://single")
    rule = Rule("gate", approve=consensus(1, 1))
    edge = Edge(
        name="design→code",
        source=design, target=code,
        using=[op_agent, op_human], rule=rule, context=[],
    )
    job = Job(edge=edge, evaluators=[eval_fp, eval_fh])
    pkg = Package(
        name="prov_fh_test",
        assets=[design, code],
        edges=[edge],
        operators=[op_agent, op_human],
        rules=[rule],
        contexts=[],
        requirements=["REQ-PROV-002"],
    )
    worker = Worker(id="claude_code", can_execute=[job])
    return pkg, worker, job


# ── IT-1: No provenance file fallback ─────────────────────────────────────────

class TestBackwardCompat:
    """
    IT-1: No active-workflow.json present → engine behaviour identical to
    pre-provenance. All existing convergence semantics preserved.
    """

    def test_scope_workflow_version_unknown_without_file(self, tmp_path):
        """scope.workflow_version == 'unknown' when active-workflow.json absent."""
        workspace_bootstrap(tmp_path)
        pkg, worker, _ = _make_fp_package()
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)
        assert scope.workflow_version == "unknown"

    def test_fp_old_req_hash_converges_when_version_unknown(self, tmp_path):
        """Old req_hash format accepted for F_P assessed event when workflow_version is 'unknown'."""
        stream = workspace_bootstrap(tmp_path)
        pkg, worker, _ = _make_fp_package()
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)

        old_hash = req_hash(pkg.requirements)
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": old_hash,
        })

        result = gen_gaps(scope, stream)
        assert result["converged"] is True, (
            "No provenance file: req_hash spec_hash must be accepted when "
            "workflow_version is unknown"
        )

    def test_fh_accepted_by_edge_name_when_version_unknown(self, tmp_path):
        """approved accepted by edge name alone when workflow_version is 'unknown'."""
        stream = workspace_bootstrap(tmp_path)
        pkg, worker, job = _make_fh_package()
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)

        old_hash = req_hash(pkg.requirements)
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": old_hash,
        })
        stream.append("approved", {
            "kind": "fh_review",
            "edge": "design→code",
            "actor": "test_human",
            # no workflow_version field — pre-provenance format
        })

        result = gen_gaps(scope, stream)
        assert result["converged"] is True, (
            "No provenance file: approved without workflow_version field must be "
            "accepted by edge name alone when engine workflow_version is unknown"
        )


# ── IT-2: Annotation ──────────────────────────────────────────────────────────

class TestWorkflowVersionAnnotation:
    """
    IT-2: emit-event reads active-workflow.json directly (no Scope) and annotates
    workflow_version onto every emitted event.
    """

    def test_emit_event_annotates_workflow_version_from_file(self, tmp_path):
        """Events written via emit-event carry workflow_version from active-workflow.json."""
        _write_active_workflow(tmp_path, "genesis_sdlc.standard", "0.2.0")
        workspace_bootstrap(tmp_path)

        from genesis.__main__ import _emit_event_cmd

        data = json.dumps({"edge": "design→code", "actor": "test_human", "kind": "fh_review"})
        rc = _emit_event_cmd("approved", data, tmp_path)
        assert rc == 0

        events_file = tmp_path / ".ai-workspace" / "events" / "events.jsonl"
        events = [
            json.loads(line)
            for line in events_file.read_text().splitlines()
            if line.strip()
        ]
        review_events = [e for e in events if e["event_type"] == "approved"]
        assert review_events, "approved event must be written"
        assert review_events[-1]["data"]["workflow_version"] == "genesis_sdlc.standard@0.2.0", (
            "emit-event must annotate workflow_version from active-workflow.json"
        )

    def test_emit_event_annotates_unknown_when_file_absent(self, tmp_path):
        """Events written via emit-event carry workflow_version='unknown' when file absent."""
        workspace_bootstrap(tmp_path)

        from genesis.__main__ import _emit_event_cmd

        data = json.dumps({"edge": "design→code", "actor": "test_human", "kind": "fh_review"})
        _emit_event_cmd("approved", data, tmp_path)

        events_file = tmp_path / ".ai-workspace" / "events" / "events.jsonl"
        events = [
            json.loads(line)
            for line in events_file.read_text().splitlines()
            if line.strip()
        ]
        review_events = [e for e in events if e["event_type"] == "approved"]
        assert review_events[-1]["data"]["workflow_version"] == "unknown"

    def test_emit_event_reads_configured_active_workflow(self, tmp_path):
        """emit-event honours active_workflow from genesis.yml runtime contract."""
        # Write active-workflow.json to the gsdlc release territory (not .genesis/)
        release_dir = tmp_path / ".gsdlc" / "release"
        release_dir.mkdir(parents=True)
        (release_dir / "active-workflow.json").write_text(
            json.dumps({"workflow": "genesis_sdlc.standard", "version": "1.0.0b1"})
        )
        # Write genesis.yml with the runtime contract pointing to the release territory
        genesis_dir = tmp_path / ".genesis"
        genesis_dir.mkdir(parents=True, exist_ok=True)
        (genesis_dir / "genesis.yml").write_text(
            "package: gtl_spec.packages.test:package\n"
            "worker: gtl_spec.packages.test:worker\n"
            "pythonpath:\n  - .gsdlc/release\n"
            "active_workflow: .gsdlc/release/active-workflow.json\n"
        )
        workspace_bootstrap(tmp_path)

        from genesis.__main__ import _emit_event_cmd

        data = json.dumps({"edge": "design→code", "actor": "test_human", "kind": "fh_review"})
        rc = _emit_event_cmd("approved", data, tmp_path)
        assert rc == 0

        events_file = tmp_path / ".ai-workspace" / "events" / "events.jsonl"
        events = [
            json.loads(line)
            for line in events_file.read_text().splitlines()
            if line.strip()
        ]
        review_events = [e for e in events if e["event_type"] == "approved"]
        assert review_events, "approved event must be written"
        assert review_events[-1]["data"]["workflow_version"] == "genesis_sdlc.standard@1.0.0b1", (
            "emit-event must read active_workflow from genesis.yml, not .genesis/active-workflow.json"
        )

    def test_emit_event_does_not_require_scope_object(self, tmp_path):
        """_emit_event_cmd takes only (event_type, data_json, workspace) — no Scope."""
        _write_active_workflow(tmp_path, "genesis_sdlc.standard", "0.2.0")
        workspace_bootstrap(tmp_path)

        from genesis.__main__ import _emit_event_cmd
        import inspect
        sig = inspect.signature(_emit_event_cmd)
        params = list(sig.parameters.keys())
        # Must not require a Scope parameter
        assert "scope" not in params, (
            "_emit_event_cmd must not accept a Scope parameter — "
            "it runs pre-stack and reads workflow provenance from the filesystem directly"
        )
        assert len(params) == 3, (
            f"Expected (event_type, data_json, workspace), got {params}"
        )


# ── M2: CLI _emit_event_cmd governance validation ────────────────────────────

class TestEmitEventGovernanceValidation:
    """Governance validation in _emit_event_cmd for prime event types."""

    def test_revoked_requires_kind(self, tmp_path):
        """revoked without kind is rejected."""
        workspace_bootstrap(tmp_path)
        from genesis.__main__ import _emit_event_cmd
        import json
        data = json.dumps({"edge": "design→code", "actor": "human", "reason": "retracted"})
        rc = _emit_event_cmd("revoked", data, tmp_path)
        assert rc == 1

    def test_revoked_requires_edge(self, tmp_path):
        """revoked without edge is rejected."""
        workspace_bootstrap(tmp_path)
        from genesis.__main__ import _emit_event_cmd
        import json
        data = json.dumps({"kind": "fh_approval", "actor": "human", "reason": "retracted"})
        rc = _emit_event_cmd("revoked", data, tmp_path)
        assert rc == 1

    def test_revoked_requires_actor(self, tmp_path):
        """revoked without actor is rejected."""
        workspace_bootstrap(tmp_path)
        from genesis.__main__ import _emit_event_cmd
        import json
        data = json.dumps({"kind": "fh_approval", "edge": "design→code", "reason": "retracted"})
        rc = _emit_event_cmd("revoked", data, tmp_path)
        assert rc == 1

    def test_revoked_requires_reason(self, tmp_path):
        """revoked without reason is rejected."""
        workspace_bootstrap(tmp_path)
        from genesis.__main__ import _emit_event_cmd
        import json
        data = json.dumps({"kind": "fh_approval", "edge": "design→code", "actor": "human"})
        rc = _emit_event_cmd("revoked", data, tmp_path)
        assert rc == 1

    def test_revoked_valid_payload_succeeds(self, tmp_path):
        """revoked with all required fields succeeds."""
        workspace_bootstrap(tmp_path)
        from genesis.__main__ import _emit_event_cmd
        import json
        data = json.dumps({"kind": "fh_approval", "edge": "design→code", "actor": "human", "reason": "retracted"})
        rc = _emit_event_cmd("revoked", data, tmp_path)
        assert rc == 0

    def test_approved_without_kind_rejected(self, tmp_path):
        """approved without kind is rejected."""
        workspace_bootstrap(tmp_path)
        from genesis.__main__ import _emit_event_cmd
        import json
        data = json.dumps({"edge": "design→code", "actor": "human"})
        rc = _emit_event_cmd("approved", data, tmp_path)
        assert rc == 1

    def test_assessed_fp_without_spec_hash_rejected(self, tmp_path):
        """assessed{kind: fp} without spec_hash is rejected."""
        workspace_bootstrap(tmp_path)
        from genesis.__main__ import _emit_event_cmd
        import json
        data = json.dumps({"kind": "fp", "edge": "design→code", "result": "pass", "evaluator": "code_complete"})
        rc = _emit_event_cmd("assessed", data, tmp_path)
        assert rc == 1

    def test_assessed_fh_review_without_actor_rejected(self, tmp_path):
        """assessed{kind: fh_review} without actor is rejected."""
        workspace_bootstrap(tmp_path)
        from genesis.__main__ import _emit_event_cmd
        import json
        data = json.dumps({"kind": "fh_review", "edge": "design→code", "result": "reject"})
        rc = _emit_event_cmd("assessed", data, tmp_path)
        assert rc == 1


# ── IT-3: Stale F_P rejected ──────────────────────────────────────────────────

class TestStaleFpRejected:
    """
    IT-3: Old req_hash spec_hash is rejected for F_P assessed events when workflow
    version is known. New job_evaluator_hash is required.
    """

    def test_stale_req_hash_not_accepted_when_version_known(self, tmp_path):
        """req_hash format assessed event does not converge when workflow_version is known."""
        _write_active_workflow(tmp_path, "genesis_sdlc.standard", "0.2.0")
        stream = workspace_bootstrap(tmp_path)
        pkg, worker, _ = _make_fp_package()
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)

        assert scope.workflow_version == "genesis_sdlc.standard@0.2.0"

        stale_hash = req_hash(pkg.requirements)   # old format
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": stale_hash,
        })

        result = gen_gaps(scope, stream)
        assert result["converged"] is False, (
            "Old req_hash spec_hash must not satisfy F_P gate when "
            "workflow_version is known (job_evaluator_hash required)"
        )
        failing = [f for g in result["gaps"] for f in g["failing"]]
        assert "code_complete" in failing

    def test_job_evaluator_hash_accepted_when_version_known(self, tmp_path):
        """job_evaluator_hash format assessed event converges when workflow_version is known."""
        _write_active_workflow(tmp_path, "genesis_sdlc.standard", "0.2.0")
        stream = workspace_bootstrap(tmp_path)
        pkg, worker, job = _make_fp_package()
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)

        new_hash = job_evaluator_hash(job)
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": new_hash,
        })

        result = gen_gaps(scope, stream)
        assert result["converged"] is True, (
            "job_evaluator_hash spec_hash must satisfy F_P gate when "
            "workflow_version is known"
        )

    def test_changed_evaluator_invalidates_prior_assessment(self, tmp_path):
        """
        Changing an evaluator changes job_evaluator_hash. Prior assessed event
        with old hash becomes stale and does not converge.
        """
        _write_active_workflow(tmp_path, "genesis_sdlc.standard", "0.2.0")
        stream = workspace_bootstrap(tmp_path)
        pkg, worker, job = _make_fp_package()
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)

        # Emit assessment against the ORIGINAL job
        original_hash = job_evaluator_hash(job)
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": original_hash,
        })

        # Simulate evaluator change by building a new job with different description
        changed_eval = Evaluator(
            "code_complete", F_P, "Code implements the spec AND passes all edge cases"
        )
        changed_job = Job(edge=job.edge, evaluators=[changed_eval])
        changed_pkg = Package(
            name=pkg.name,
            assets=pkg.assets, edges=pkg.edges, operators=pkg.operators,
            rules=pkg.rules, contexts=pkg.contexts,
            requirements=pkg.requirements,
        )
        changed_worker = Worker(id="claude_code", can_execute=[changed_job])
        scope2 = Scope(package=changed_pkg, workspace_root=tmp_path, worker=changed_worker)

        result = gen_gaps(scope2, stream)
        assert result["converged"] is False, (
            "Prior assessed event must not converge after evaluator description changes "
            "(job_evaluator_hash covers description)"
        )


# ── IT-4: Approval version binding ────────────────────────────────────────────

class TestApprovalVersionBinding:
    """
    IT-4: approved event is bound to the workflow version it was emitted under.
    Upgrading the workflow reopens edges that were approved under the prior version.
    """

    def test_approval_accepted_when_version_matches(self, tmp_path):
        """approved with matching workflow_version satisfies F_H gate."""
        _write_active_workflow(tmp_path, "genesis_sdlc.standard", "0.2.0")
        stream = workspace_bootstrap(tmp_path)
        pkg, worker, job = _make_fh_package()
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)

        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": job_evaluator_hash(job),
            "workflow_version": "genesis_sdlc.standard@0.2.0",
        })
        stream.append("approved", {
            "kind": "fh_review",
            "edge": "design→code",
            "actor": "test_human",
            "workflow_version": "genesis_sdlc.standard@0.2.0",
        })

        result = gen_gaps(scope, stream)
        assert result["converged"] is True

    def test_approval_rejected_when_version_mismatches(self, tmp_path):
        """approved from old version does not satisfy F_H gate at current version."""
        _write_active_workflow(tmp_path, "genesis_sdlc.standard", "0.2.0")
        stream = workspace_bootstrap(tmp_path)
        pkg, worker, job = _make_fh_package()
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)

        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": job_evaluator_hash(job),
            "workflow_version": "genesis_sdlc.standard@0.2.0",
        })
        stream.append("approved", {
            "kind": "fh_review",
            "edge": "design→code",
            "actor": "test_human",
            "workflow_version": "genesis_sdlc.standard@0.1.0",  # prior version
        })

        result = gen_gaps(scope, stream)
        assert result["converged"] is False, (
            "Approval from old workflow version must not satisfy F_H gate"
        )
        failing = [f for g in result["gaps"] for f in g["failing"]]
        assert "design_approved" in failing

    def test_workflow_upgrade_reopens_previously_converged_edge(self, tmp_path):
        """
        Full upgrade simulation: workspace converged at 0.1.0, upgrade to 0.2.0,
        edge reopens because approval was for 0.1.0.
        """
        # Phase 1: converge at 0.1.0
        _write_active_workflow(tmp_path, "genesis_sdlc.standard", "0.1.0")
        stream = workspace_bootstrap(tmp_path)
        pkg, worker, job = _make_fh_package()
        scope_v1 = Scope(package=pkg, workspace_root=tmp_path, worker=worker)

        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": job_evaluator_hash(job),
            "workflow_version": "genesis_sdlc.standard@0.1.0",
        })
        stream.append("approved", {
            "kind": "fh_review",
            "edge": "design→code",
            "actor": "test_human",
            "workflow_version": "genesis_sdlc.standard@0.1.0",
        })

        result_v1 = gen_gaps(scope_v1, stream)
        assert result_v1["converged"] is True, "Precondition: must be converged at 0.1.0"

        # Phase 2: upgrade to 0.2.0 — rewrite active-workflow.json
        _write_active_workflow(tmp_path, "genesis_sdlc.standard", "0.2.0")
        scope_v2 = Scope(package=pkg, workspace_root=tmp_path, worker=worker)

        result_v2 = gen_gaps(scope_v2, stream)
        assert result_v2["converged"] is False, (
            "Edge must reopen after workflow upgrade — "
            "approval was for 0.1.0, current version is 0.2.0"
        )


# ── IT-5: Carry-forward ───────────────────────────────────────────────────────

class TestCarryForward:
    """
    IT-5: approved_carry_forward in manifest.json allows a prior-version approval
    to satisfy the F_H gate at the current version.
    """

    def test_carry_forward_allows_prior_version_approval(self, tmp_path):
        """Approval at 0.1.0 satisfies F_H gate at 0.2.0 when manifest declares carry-forward."""
        _write_active_workflow(tmp_path, "genesis_sdlc.standard", "0.2.0")
        _write_manifest(tmp_path, "genesis_sdlc.standard@0.2.0", carry_forward=[
            {"edge": "design→code", "from_version": "genesis_sdlc.standard@0.1.0"},
        ])
        stream = workspace_bootstrap(tmp_path)
        pkg, worker, job = _make_fh_package()
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)

        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": job_evaluator_hash(job),
            "workflow_version": "genesis_sdlc.standard@0.2.0",
        })
        stream.append("approved", {
            "kind": "fh_review",
            "edge": "design→code",
            "actor": "test_human",
            "workflow_version": "genesis_sdlc.standard@0.1.0",   # prior version
        })

        result = gen_gaps(scope, stream)
        assert result["converged"] is True, (
            "Carry-forward: approval at 0.1.0 must satisfy F_H gate at 0.2.0 "
            "when manifest declares approved_carry_forward from 0.1.0"
        )

    def test_carry_forward_wrong_from_version_fails(self, tmp_path):
        """Carry-forward requires exact from_version match — wrong version still fails."""
        _write_active_workflow(tmp_path, "genesis_sdlc.standard", "0.2.0")
        _write_manifest(tmp_path, "genesis_sdlc.standard@0.2.0", carry_forward=[
            {"edge": "design→code", "from_version": "genesis_sdlc.standard@0.1.0"},
        ])
        stream = workspace_bootstrap(tmp_path)
        pkg, worker, job = _make_fh_package()
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)

        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": job_evaluator_hash(job),
            "workflow_version": "genesis_sdlc.standard@0.2.0",
        })
        # Approval from 0.0.1 — not the carry_forward from_version (0.1.0)
        stream.append("approved", {
            "kind": "fh_review",
            "edge": "design→code",
            "actor": "test_human",
            "workflow_version": "genesis_sdlc.standard@0.0.1",
        })

        result = gen_gaps(scope, stream)
        assert result["converged"] is False, (
            "Carry-forward requires exact from_version match; 0.0.1 ≠ 0.1.0 must fail"
        )

    def test_no_carry_forward_in_manifest_fails(self, tmp_path):
        """Manifest without approved_carry_forward still rejects prior-version approval."""
        _write_active_workflow(tmp_path, "genesis_sdlc.standard", "0.2.0")
        _write_manifest(tmp_path, "genesis_sdlc.standard@0.2.0", carry_forward=[])
        stream = workspace_bootstrap(tmp_path)
        pkg, worker, job = _make_fh_package()
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)

        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": job_evaluator_hash(job),
            "workflow_version": "genesis_sdlc.standard@0.2.0",
        })
        stream.append("approved", {
            "kind": "fh_review",
            "edge": "design→code",
            "actor": "test_human",
            "workflow_version": "genesis_sdlc.standard@0.1.0",
        })

        result = gen_gaps(scope, stream)
        assert result["converged"] is False


# ── IT-6: Pre-provenance rejection ────────────────────────────────────────────

class TestPreProvenanceRejection:
    """
    IT-6: approved events with no workflow_version field (pre-provenance,
    emitted before Part B was deployed) are rejected when the engine has a known
    workflow_version. No special-casing or grace period.
    """

    def test_pre_provenance_approval_rejected_when_version_known(self, tmp_path):
        """approved without workflow_version field fails when version known."""
        _write_active_workflow(tmp_path, "genesis_sdlc.standard", "0.2.0")
        stream = workspace_bootstrap(tmp_path)
        pkg, worker, job = _make_fh_package()
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)

        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": job_evaluator_hash(job),
            "workflow_version": "genesis_sdlc.standard@0.2.0",
        })
        # Pre-provenance: no workflow_version field on the approval
        stream.append("approved", {
            "kind": "fh_review",
            "edge": "design→code",
            "actor": "test_human",
            # workflow_version intentionally absent
        })

        result = gen_gaps(scope, stream)
        assert result["converged"] is False, (
            "Pre-provenance approved (no workflow_version) must NOT satisfy "
            "F_H gate when engine has a known workflow_version. "
            "event.data.get('workflow_version') returns None; "
            "None != current_workflow_version → rejected."
        )
        failing = [f for g in result["gaps"] for f in g["failing"]]
        assert "design_approved" in failing

    def test_pre_provenance_approval_accepted_when_version_unknown(self, tmp_path):
        """
        Pre-provenance approved is accepted when engine workflow_version is
        'unknown' (no provenance file). Absence of active-workflow.json = unversioned mode.
        """
        stream = workspace_bootstrap(tmp_path)
        pkg, worker, job = _make_fh_package()
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)

        assert scope.workflow_version == "unknown"

        old_hash = req_hash(pkg.requirements)
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": old_hash,
        })
        stream.append("approved", {
            "kind": "fh_review",
            "edge": "design→code",
            "actor": "test_human",
            # no workflow_version field
        })

        result = gen_gaps(scope, stream)
        assert result["converged"] is True, (
            "Pre-provenance approval must be accepted when workflow_version is unknown "
            "(no provenance file — unversioned mode)"
        )
