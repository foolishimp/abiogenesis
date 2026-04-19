# Validates: REQ-R-ABG3-PROVENANCE
# Validates: REQ-M-GTL3-PROVENANCE
"""
Provenance integration tests for the active runtime provenance surface.

Six integration scenarios that exercise the full provenance model end-to-end
against a real workspace, without mocking any engine internals.

  IT-1  Bootstrap seeds active-workflow.json → versioned runtime by construction
  IT-2  emit-event annotates workflow_version from active-workflow.json (no Scope needed)
  IT-3  Stale F_P (req_hash format) rejected when workflow version is known
  IT-4  F_H approval invalidated when workflow version changes
  IT-5  approved_carry_forward in manifest allows crossing a version boundary
  IT-6  Pre-provenance approved (no workflow_version field) is always rejected

These tests are integration acceptance gates, not unit-test-only checks.

NOTE: _write_manifest uses the path convention:
  .genesis/workflows/{pkg}/{variant}/{version}/manifest.json
where workflow "abiogenesis.standard@0.2.0" → pkg="abiogenesis", variant="standard",
version="0.2.0". Adjust path if implementation uses a different convention (e.g. v0_2_0).
"""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from gtl.algebra import deferred_refinement
from gtl.function_model import EnvRef, GraphFunction
from gtl.graph import Graph, Node, Context
from gtl.module_model import Module
from gtl.operator_model import Evaluator, Operator, F_D, F_P, F_H, Rule
from gtl.work_model import Job as GtlJob, ContractRef
from tests.helpers_obligation_ledger import declared_test_graph_vector as GraphVector

from genesis import __version__ as GENESIS_VERSION
from genesis.binding import ExecutableJob, Worker
from genesis.events import EventContext, emit
from genesis.fulfillment_ledger import make_published_fulfillment_ledger_ref
from genesis.provenance import WorkflowVersionError, executable_job_hash, req_hash, spec_hash_for
from genesis.install import workspace_bootstrap
from genesis.services import Scope, gen_gaps, module_to_executable_jobs


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

    workflow_version "abiogenesis.standard@0.2.0"
      → .genesis/workflows/abiogenesis/standard/0.2.0/manifest.json
    """
    workflow, version = workflow_version.split("@", 1)
    parts = workflow.split(".", 1)          # ["abiogenesis", "standard"]
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


def _make_fp_module() -> Module:
    """Module with one F_P evaluator only — no F_D subprocess dependency."""
    design = Node(name="design")
    code = Node(name="code")
    eval_fp = Evaluator("code_complete", F_P, "Code implements the spec fully")
    op = Operator("claude_agent", F_P, "agent://claude/genesis")

    vector = GraphVector(
        name="design→code",
        source=design, target=code,
        operators=(op,),
        evaluators=(eval_fp,),
    )
    graph = Graph(
        name="prov_fp_test",
        inputs=(design,), outputs=(code,),
        nodes=(design, code),
        vectors=(vector,),
    )
    graph_function = GraphFunction.from_graph(
        name=vector.name,
        graph=graph,
        environment=EnvRef.from_contract(requires=(design,), provides=(code,)),
    )
    job = GtlJob(name=vector.name, contracts=(ContractRef(kind="graph_function", target_id=graph_function.id),))
    return Module(
        name="prov_fp_test",
        graphs=(graph,),
        graph_functions=(graph_function,),
        refinement_boundaries=(
            deferred_refinement(vector.name, inputs=(design,), outputs=(code,)),
        ),
        jobs=(job,),
        metadata={"requirements": ["REQ-PROV-001"]},
    )


def _make_fh_module() -> Module:
    """Module with F_P + F_H evaluators — no F_D subprocess dependency."""
    design = Node(name="design")
    code = Node(name="code")
    eval_fp = Evaluator("code_complete", F_P, "Code implements the spec fully")
    eval_fh = Evaluator("design_approved", F_H, "Human confirms design is correct")
    op_agent = Operator("claude_agent", F_P, "agent://claude/genesis")
    op_human = Operator("human_gate", F_H, "fh://single")

    vector = GraphVector(
        name="design→code",
        source=design, target=code,
        operators=(op_agent, op_human),
        evaluators=(eval_fp, eval_fh),
    )
    graph = Graph(
        name="prov_fh_test",
        inputs=(design,), outputs=(code,),
        nodes=(design, code),
        vectors=(vector,),
    )
    graph_function = GraphFunction.from_graph(
        name=vector.name,
        graph=graph,
        environment=EnvRef.from_contract(requires=(design,), provides=(code,)),
    )
    job = GtlJob(name=vector.name, contracts=(ContractRef(kind="graph_function", target_id=graph_function.id),))
    return Module(
        name="prov_fh_test",
        graphs=(graph,),
        graph_functions=(graph_function,),
        refinement_boundaries=(
            deferred_refinement(vector.name, inputs=(design,), outputs=(code,)),
        ),
        jobs=(job,),
        metadata={"requirements": ["REQ-PROV-002"]},
    )


def _job_from_module(module: Module) -> ExecutableJob:
    """Extract the first Job from a Module."""
    jobs = module_to_executable_jobs(module)
    return jobs[0]


def _current_spec_hash(module: Module, workflow_version: str) -> str:
    """Return the canonical runtime spec-hash for a module under a workflow version."""
    return spec_hash_for(
        workflow_version=workflow_version,
        executable_job=_job_from_module(module),
        requirements=module.metadata.get("requirements", ()),
    )


def _append_fp_assessment(
    stream,
    *,
    workspace: Path,
    edge: str,
    obligation_id: str,
    spec_hash: str,
    workflow_version: str | None = None,
    admission_required: bool = False,
    fulfillment_status: str = "fulfilled",
    fulfillment_detail: str = "assessment satisfied",
) -> None:
    ledger_dir = workspace / ".ai-workspace" / "fp_ledgers"
    ledger_dir.mkdir(parents=True, exist_ok=True)
    manifest_slug = edge.replace("→", "_").replace("/", "_")
    manifest_id = f"{manifest_slug}_{obligation_id}_{spec_hash}"
    ledger_path = ledger_dir / f"{manifest_id}.json"
    ledger = {
        "manifest_id": manifest_id,
        "edge": edge,
        "spec_hash": spec_hash,
        "workflow_version": workflow_version,
        "admission_required": admission_required,
        "admitted": not admission_required,
        "admission_basis": "test_fixture" if not admission_required else "pending_fh_review",
        "carry_converged": True,
        "fulfillment_converged": fulfillment_status == "fulfilled",
        "edge_converged": fulfillment_status == "fulfilled" and not admission_required,
        "obligations": [
            {
                "id": obligation_id,
                "evaluator": obligation_id,
                "fulfillment_status": fulfillment_status,
                "fulfillment_detail": fulfillment_detail,
                "blocking_reasons": (
                    [fulfillment_detail]
                    if fulfillment_status in {"blocked", "unfulfilled"} and fulfillment_detail
                    else []
                ),
                "evidence_refs": (
                    [fulfillment_detail]
                    if fulfillment_status in {"fulfilled", "partial"} and fulfillment_detail
                    else []
                ),
            }
        ],
    }
    ledger_path.write_text(json.dumps(ledger, indent=2), encoding="utf-8")

    payload = {
        "kind": "fp",
        "edge": edge,
        "obligation_id": obligation_id,
        "spec_hash": spec_hash,
        "manifest_id": manifest_id,
        "published_ledger_ref": make_published_fulfillment_ledger_ref(
            manifest_id=manifest_id
        ),
    }
    if workflow_version is not None:
        payload["workflow_version"] = workflow_version
    emit(
        "assessed",
        payload,
        stream=stream,
        context=EventContext(workflow_version=workflow_version or "unknown"),
    )


# ── IT-1: Bootstrap provenance by construction ───────────────────────────────

class TestBootstrapProvenance:
    """
    IT-1: workspace_bootstrap seeds active-workflow.json so runtime provenance is
    versioned by construction. Missing metadata is a defect, not a fallback mode.
    """

    def test_workspace_bootstrap_seeds_default_workflow_version(self, tmp_path):
        """workspace_bootstrap seeds abiogenesis.standard@<engine version> by default."""
        workspace_bootstrap(tmp_path)
        module = _make_fp_module()
        scope = Scope(module=module, workspace_root=tmp_path)

        assert scope.workflow_version == f"abiogenesis.standard@{GENESIS_VERSION}"

    def test_scope_fails_closed_when_active_workflow_metadata_missing(self, tmp_path):
        """Scope construction fails closed if active-workflow.json is removed or absent."""
        workspace_bootstrap(tmp_path)
        active_workflow = tmp_path / ".ai-workspace" / "runtime" / "active-workflow.json"
        active_workflow.unlink()

        module = _make_fp_module()
        with pytest.raises(WorkflowVersionError, match="active workflow metadata missing"):
            Scope(module=module, workspace_root=tmp_path)

    def test_fp_old_req_hash_rejected_under_seeded_runtime_provenance(self, tmp_path):
        """Old req_hash format is rejected even on the default bootstrapped runtime."""
        stream = workspace_bootstrap(tmp_path)
        module = _make_fp_module()
        scope = Scope(module=module, workspace_root=tmp_path)

        old_hash = req_hash(module.metadata["requirements"])
        _append_fp_assessment(
            stream,
            workspace=tmp_path,
            edge="design→code",
            obligation_id="code_complete",
            spec_hash=old_hash,
        )

        result = gen_gaps(scope, stream)
        assert result["converged"] is False

    def test_fh_requires_versioned_approval_under_seeded_runtime_provenance(self, tmp_path):
        """Bare edge-name approvals do not satisfy F_H on the default bootstrapped runtime."""
        stream = workspace_bootstrap(tmp_path)
        module = _make_fh_module()
        scope = Scope(module=module, workspace_root=tmp_path)

        _append_fp_assessment(
            stream,
            workspace=tmp_path,
            edge="design→code",
            obligation_id="code_complete",
            spec_hash=_current_spec_hash(module, scope.workflow_version),
            workflow_version=scope.workflow_version,
            admission_required=True,
        )
        emit(
            "approved",
            {
                "kind": "fh_review",
                "edge": "design→code",
                "actor": "test_human",
            },
            stream=stream,
            context=EventContext(workflow_version="unknown"),
        )

        result = gen_gaps(scope, stream)
        assert result["converged"] is False


# ── IT-2: Annotation ──────────────────────────────────────────────────────────

class TestWorkflowVersionAnnotation:
    """
    IT-2: emit-event reads active-workflow.json directly (no Scope) and annotates
    workflow_version onto every emitted event.
    """

    def test_emit_event_annotates_workflow_version_from_file(self, tmp_path):
        """Events written via emit-event carry workflow_version from active-workflow.json."""
        _write_active_workflow(tmp_path, "abiogenesis.standard", "0.2.0")
        workspace_bootstrap(tmp_path)

        from genesis.cli_adapter import _emit_event_cmd

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
        assert review_events[-1]["data"]["workflow_version"] == "abiogenesis.standard@0.2.0", (
            "emit-event must annotate workflow_version from active-workflow.json"
        )

    def test_emit_event_fails_closed_when_active_workflow_metadata_missing(self, tmp_path):
        """emit-event fails closed if active-workflow.json is missing."""
        workspace_bootstrap(tmp_path)
        (tmp_path / ".ai-workspace" / "runtime" / "active-workflow.json").unlink()

        from genesis.cli_adapter import _emit_event_cmd

        data = json.dumps({"edge": "design→code", "actor": "test_human", "kind": "fh_review"})
        rc = _emit_event_cmd("approved", data, tmp_path)
        assert rc == 1

        events_file = tmp_path / ".ai-workspace" / "events" / "events.jsonl"
        events = [
            json.loads(line)
            for line in events_file.read_text().splitlines()
            if line.strip()
        ]
        review_events = [e for e in events if e["event_type"] == "approved"]
        assert review_events == []

    def test_emit_event_reads_configured_active_workflow(self, tmp_path):
        """emit-event honours active_workflow from genesis.yml runtime contract."""
        # Write active-workflow.json to a project-owned configured runtime-contract path.
        workflow_dir = tmp_path / ".genesis" / "workflows" / "abiogenesis" / "standard" / "v1_0_0b1"
        workflow_dir.mkdir(parents=True, exist_ok=True)
        (workflow_dir / "active-workflow.json").write_text(
            json.dumps({"workflow": "abiogenesis.standard", "version": "1.0.0b1"})
        )
        # Write genesis.yml with the runtime contract pointing to that configured path.
        genesis_dir = tmp_path / ".genesis"
        genesis_dir.mkdir(parents=True, exist_ok=True)
        (genesis_dir / "genesis.yml").write_text(
            "package: gtl_spec.packages.test:package\n"
            "worker: gtl_spec.packages.test:worker\n"
            "pythonpath:\n  - .genesis/workflows/abiogenesis/standard/v1_0_0b1\n"
            "active_workflow: .genesis/workflows/abiogenesis/standard/v1_0_0b1/active-workflow.json\n"
        )
        workspace_bootstrap(tmp_path)

        from genesis.cli_adapter import _emit_event_cmd

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
        assert review_events[-1]["data"]["workflow_version"] == "abiogenesis.standard@1.0.0b1", (
            "emit-event must read active_workflow from genesis.yml, not the default "
            ".ai-workspace/runtime/active-workflow.json"
        )

    def test_emit_event_does_not_require_scope_object(self, tmp_path):
        """_emit_event_cmd takes only (event_type, data_json, workspace) — no Scope."""
        _write_active_workflow(tmp_path, "abiogenesis.standard", "0.2.0")
        workspace_bootstrap(tmp_path)

        from genesis.cli_adapter import _emit_event_cmd
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
        from genesis.cli_adapter import _emit_event_cmd
        import json
        data = json.dumps({"edge": "design→code", "actor": "human", "reason": "retracted"})
        rc = _emit_event_cmd("revoked", data, tmp_path)
        assert rc == 1

    def test_revoked_requires_edge(self, tmp_path):
        """revoked without edge is rejected."""
        workspace_bootstrap(tmp_path)
        from genesis.cli_adapter import _emit_event_cmd
        import json
        data = json.dumps({"kind": "fh_approval", "actor": "human", "reason": "retracted"})
        rc = _emit_event_cmd("revoked", data, tmp_path)
        assert rc == 1

    def test_revoked_requires_actor(self, tmp_path):
        """revoked without actor is rejected."""
        workspace_bootstrap(tmp_path)
        from genesis.cli_adapter import _emit_event_cmd
        import json
        data = json.dumps({"kind": "fh_approval", "edge": "design→code", "reason": "retracted"})
        rc = _emit_event_cmd("revoked", data, tmp_path)
        assert rc == 1

    def test_revoked_requires_reason(self, tmp_path):
        """revoked without reason is rejected."""
        workspace_bootstrap(tmp_path)
        from genesis.cli_adapter import _emit_event_cmd
        import json
        data = json.dumps({"kind": "fh_approval", "edge": "design→code", "actor": "human"})
        rc = _emit_event_cmd("revoked", data, tmp_path)
        assert rc == 1

    def test_revoked_valid_payload_succeeds(self, tmp_path):
        """revoked with all required fields succeeds."""
        workspace_bootstrap(tmp_path)
        from genesis.cli_adapter import _emit_event_cmd
        import json
        data = json.dumps({"kind": "fh_approval", "edge": "design→code", "actor": "human", "reason": "retracted"})
        rc = _emit_event_cmd("revoked", data, tmp_path)
        assert rc == 0

    def test_approved_without_kind_rejected(self, tmp_path):
        """approved without kind is rejected."""
        workspace_bootstrap(tmp_path)
        from genesis.cli_adapter import _emit_event_cmd
        import json
        data = json.dumps({"edge": "design→code", "actor": "human"})
        rc = _emit_event_cmd("approved", data, tmp_path)
        assert rc == 1

    def test_assessed_fp_without_spec_hash_rejected(self, tmp_path):
        """assessed{kind: fp} without spec_hash is rejected."""
        workspace_bootstrap(tmp_path)
        from genesis.cli_adapter import _emit_event_cmd
        import json
        data = json.dumps(
            {
                "kind": "fp",
                "edge": "design→code",
                "obligation_id": "code_complete",
                "fulfillment_status": "fulfilled",
            }
        )
        rc = _emit_event_cmd("assessed", data, tmp_path)
        assert rc == 1

    def test_assessed_fh_review_without_actor_rejected(self, tmp_path):
        """assessed{kind: fh_review} without actor is rejected."""
        workspace_bootstrap(tmp_path)
        from genesis.cli_adapter import _emit_event_cmd
        import json
        data = json.dumps({"kind": "fh_review", "edge": "design→code", "result": "reject"})
        rc = _emit_event_cmd("assessed", data, tmp_path)
        assert rc == 1


# ── IT-3: Stale F_P rejected ──────────────────────────────────────────────────

class TestStaleFpRejected:
    """
    IT-3: Old req_hash spec_hash is rejected for F_P assessed events when workflow
    version is known. New executable_job_hash is required.
    """

    def test_stale_req_hash_not_accepted_when_version_known(self, tmp_path):
        """req_hash format assessed event does not converge when workflow_version is known."""
        _write_active_workflow(tmp_path, "abiogenesis.standard", "0.2.0")
        stream = workspace_bootstrap(tmp_path)
        module = _make_fp_module()
        scope = Scope(module=module, workspace_root=tmp_path)

        assert scope.workflow_version == "abiogenesis.standard@0.2.0"

        stale_hash = req_hash(module.metadata["requirements"])   # old format
        _append_fp_assessment(
            stream,
            workspace=tmp_path,
            edge="design→code",
            obligation_id="code_complete",
            spec_hash=stale_hash,
        )

        result = gen_gaps(scope, stream)
        assert result["converged"] is False, (
            "Old req_hash spec_hash must not satisfy F_P gate when "
            "workflow_version is known (canonical versioned spec_hash required)"
        )
        failing = [f for g in result["gaps"] for f in g["failing"]]
        assert "code_complete" in failing

    def test_executable_job_hash_accepted_when_version_known(self, tmp_path):
        """executable_job_hash format assessed event converges when workflow_version is known."""
        _write_active_workflow(tmp_path, "abiogenesis.standard", "0.2.0")
        stream = workspace_bootstrap(tmp_path)
        module = _make_fp_module()
        scope = Scope(module=module, workspace_root=tmp_path)

        new_hash = _current_spec_hash(module, scope.workflow_version)
        _append_fp_assessment(
            stream,
            workspace=tmp_path,
            edge="design→code",
            obligation_id="code_complete",
            spec_hash=new_hash,
        )

        result = gen_gaps(scope, stream)
        assert result["converged"] is True, (
            "canonical versioned spec_hash must satisfy F_P gate when "
            "workflow_version is known"
        )

    def test_changed_evaluator_invalidates_prior_assessment(self, tmp_path):
        """
        Changing an evaluator changes executable_job_hash. Prior assessed event
        with old hash becomes stale and does not converge.
        """
        _write_active_workflow(tmp_path, "abiogenesis.standard", "0.2.0")
        stream = workspace_bootstrap(tmp_path)
        module = _make_fp_module()
        scope = Scope(module=module, workspace_root=tmp_path)

        # Emit assessment against the ORIGINAL job
        original_hash = _current_spec_hash(module, scope.workflow_version)
        _append_fp_assessment(
            stream,
            workspace=tmp_path,
            edge="design→code",
            obligation_id="code_complete",
            spec_hash=original_hash,
        )

        # Simulate evaluator change by building a new module with different description
        design = Node(name="design")
        code = Node(name="code")
        changed_eval = Evaluator(
            "code_complete", F_P, "Code implements the spec AND passes all edge cases"
        )
        op = Operator("claude_agent", F_P, "agent://claude/genesis")
        changed_vec = GraphVector(
            name="design→code",
            source=design, target=code,
            operators=(op,),
            evaluators=(changed_eval,),
        )
        changed_graph = Graph(
            name="prov_fp_test",
            inputs=(design,), outputs=(code,),
            nodes=(design, code),
            vectors=(changed_vec,),
        )
        changed_graph_function = GraphFunction.from_graph(
            name=changed_vec.name,
            graph=changed_graph,
            environment=EnvRef.from_contract(requires=(design,), provides=(code,)),
        )
        changed_job = GtlJob(
            name=changed_vec.name,
            contracts=(ContractRef(kind="graph_function", target_id=changed_graph_function.id),),
        )
        changed_module = Module(
            name="prov_fp_test",
            graphs=(changed_graph,),
            graph_functions=(changed_graph_function,),
            refinement_boundaries=(
                deferred_refinement(changed_vec.name, inputs=(design,), outputs=(code,)),
            ),
            jobs=(changed_job,),
            metadata={"requirements": ["REQ-PROV-001"]},
        )
        scope2 = Scope(module=changed_module, workspace_root=tmp_path)

        result = gen_gaps(scope2, stream)
        assert result["converged"] is False, (
            "Prior assessed event must not converge after evaluator description changes "
            "(executable_job_hash covers description)"
        )

    def test_changed_environment_invalidates_prior_assessment(self, tmp_path):
        """
        Changing the cumulative environment contract changes executable_job_hash.
        Prior assessed event with the old environment becomes stale.
        """
        _write_active_workflow(tmp_path, "abiogenesis.standard", "0.2.0")
        stream = workspace_bootstrap(tmp_path)
        module = _make_fp_module()
        scope = Scope(module=module, workspace_root=tmp_path)

        original_hash = _current_spec_hash(module, scope.workflow_version)
        _append_fp_assessment(
            stream,
            workspace=tmp_path,
            edge="design→code",
            obligation_id="code_complete",
            spec_hash=original_hash,
        )
        assert gen_gaps(scope, stream)["converged"] is True

        design = Node(name="design")
        code = Node(name="code")
        carried_requirements = Node(name="requirements_context")
        code_complete = Evaluator(
            "code_complete", F_P, "Code implements the spec"
        )
        op = Operator("claude_agent", F_P, "agent://claude/genesis")
        vec = GraphVector(
            name="design→code",
            source=design, target=code,
            operators=(op,),
            evaluators=(code_complete,),
        )
        graph = Graph(
            name="prov_fp_test",
            inputs=(design,), outputs=(code,),
            nodes=(design, code),
            vectors=(vec,),
        )
        changed_graph_function = GraphFunction.from_graph(
            name=vec.name,
            graph=graph,
            environment=EnvRef.from_contract(
                requires=(design,),
                provides=(code,),
                carries=(design, carried_requirements, code),
            ),
        )
        changed_job = GtlJob(
            name=vec.name,
            contracts=(ContractRef(kind="graph_function", target_id=changed_graph_function.id),),
        )
        changed_module = Module(
            name="prov_fp_test",
            graphs=(graph,),
            graph_functions=(changed_graph_function,),
            refinement_boundaries=(
                deferred_refinement(vec.name, inputs=(design,), outputs=(code,)),
            ),
            jobs=(changed_job,),
            metadata={"requirements": ["REQ-PROV-001"]},
        )
        changed_scope = Scope(module=changed_module, workspace_root=tmp_path)

        changed_hash = _current_spec_hash(changed_module, changed_scope.workflow_version)
        assert changed_hash != original_hash
        result = gen_gaps(changed_scope, stream)
        assert result["converged"] is False, (
            "Prior assessed event must not converge after the cumulative environment "
            "contract changes"
        )


# ── IT-4: Approval version binding ────────────────────────────────────────────

class TestApprovalVersionBinding:
    """
    IT-4: approved event is bound to the workflow version it was emitted under.
    Upgrading the workflow reopens edges that were approved under the prior version.
    """

    def test_approval_accepted_when_version_matches(self, tmp_path):
        """approved with matching workflow_version satisfies F_H gate."""
        _write_active_workflow(tmp_path, "abiogenesis.standard", "0.2.0")
        stream = workspace_bootstrap(tmp_path)
        module = _make_fh_module()
        scope = Scope(module=module, workspace_root=tmp_path)

        _append_fp_assessment(
            stream,
            workspace=tmp_path,
            edge="design→code",
            obligation_id="code_complete",
            spec_hash=_current_spec_hash(module, scope.workflow_version),
            workflow_version="abiogenesis.standard@0.2.0",
            admission_required=True,
        )
        emit(
            "approved",
            {
                "kind": "fh_review",
                "edge": "design→code",
                "actor": "test_human",
                "workflow_version": "abiogenesis.standard@0.2.0",
            },
            stream=stream,
            context=EventContext(workflow_version="abiogenesis.standard@0.2.0"),
        )

        result = gen_gaps(scope, stream)
        assert result["converged"] is True

    def test_approval_rejected_when_version_mismatches(self, tmp_path):
        """approved from old version does not satisfy F_H gate at current version."""
        _write_active_workflow(tmp_path, "abiogenesis.standard", "0.2.0")
        stream = workspace_bootstrap(tmp_path)
        module = _make_fh_module()
        scope = Scope(module=module, workspace_root=tmp_path)

        _append_fp_assessment(
            stream,
            workspace=tmp_path,
            edge="design→code",
            obligation_id="code_complete",
            spec_hash=_current_spec_hash(module, scope.workflow_version),
            workflow_version="abiogenesis.standard@0.2.0",
            admission_required=True,
        )
        emit(
            "approved",
            {
                "kind": "fh_review",
                "edge": "design→code",
                "actor": "test_human",
                "workflow_version": "abiogenesis.standard@0.1.0",  # prior version
            },
            stream=stream,
            context=EventContext(workflow_version="abiogenesis.standard@0.1.0"),
        )

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
        _write_active_workflow(tmp_path, "abiogenesis.standard", "0.1.0")
        stream = workspace_bootstrap(tmp_path)
        module = _make_fh_module()
        scope_v1 = Scope(module=module, workspace_root=tmp_path)

        _append_fp_assessment(
            stream,
            workspace=tmp_path,
            edge="design→code",
            obligation_id="code_complete",
            spec_hash=_current_spec_hash(module, scope_v1.workflow_version),
            workflow_version="abiogenesis.standard@0.1.0",
            admission_required=True,
        )
        emit(
            "approved",
            {
                "kind": "fh_review",
                "edge": "design→code",
                "actor": "test_human",
                "workflow_version": "abiogenesis.standard@0.1.0",
            },
            stream=stream,
            context=EventContext(workflow_version="abiogenesis.standard@0.1.0"),
        )

        result_v1 = gen_gaps(scope_v1, stream)
        assert result_v1["converged"] is True, "Precondition: must be converged at 0.1.0"

        # Phase 2: upgrade to 0.2.0 — rewrite active-workflow.json
        _write_active_workflow(tmp_path, "abiogenesis.standard", "0.2.0")
        scope_v2 = Scope(module=module, workspace_root=tmp_path)

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
        _write_active_workflow(tmp_path, "abiogenesis.standard", "0.2.0")
        _write_manifest(tmp_path, "abiogenesis.standard@0.2.0", carry_forward=[
            {"edge": "design→code", "from_version": "abiogenesis.standard@0.1.0"},
        ])
        stream = workspace_bootstrap(tmp_path)
        module = _make_fh_module()
        scope = Scope(module=module, workspace_root=tmp_path)

        _append_fp_assessment(
            stream,
            workspace=tmp_path,
            edge="design→code",
            obligation_id="code_complete",
            spec_hash=_current_spec_hash(module, scope.workflow_version),
            workflow_version="abiogenesis.standard@0.2.0",
            admission_required=True,
        )
        emit(
            "approved",
            {
                "kind": "fh_review",
                "edge": "design→code",
                "actor": "test_human",
                "workflow_version": "abiogenesis.standard@0.1.0",   # prior version
            },
            stream=stream,
            context=EventContext(workflow_version="abiogenesis.standard@0.1.0"),
        )

        result = gen_gaps(scope, stream)
        assert result["converged"] is True, (
            "Carry-forward: approval at 0.1.0 must satisfy F_H gate at 0.2.0 "
            "when manifest declares approved_carry_forward from 0.1.0"
        )

    def test_carry_forward_wrong_from_version_fails(self, tmp_path):
        """Carry-forward requires exact from_version match — wrong version still fails."""
        _write_active_workflow(tmp_path, "abiogenesis.standard", "0.2.0")
        _write_manifest(tmp_path, "abiogenesis.standard@0.2.0", carry_forward=[
            {"edge": "design→code", "from_version": "abiogenesis.standard@0.1.0"},
        ])
        stream = workspace_bootstrap(tmp_path)
        module = _make_fh_module()
        scope = Scope(module=module, workspace_root=tmp_path)

        _append_fp_assessment(
            stream,
            workspace=tmp_path,
            edge="design→code",
            obligation_id="code_complete",
            spec_hash=_current_spec_hash(module, scope.workflow_version),
            workflow_version="abiogenesis.standard@0.2.0",
            admission_required=True,
        )
        # Approval from 0.0.1 — not the carry_forward from_version (0.1.0)
        emit(
            "approved",
            {
                "kind": "fh_review",
                "edge": "design→code",
                "actor": "test_human",
                "workflow_version": "abiogenesis.standard@0.0.1",
            },
            stream=stream,
            context=EventContext(workflow_version="abiogenesis.standard@0.0.1"),
        )

        result = gen_gaps(scope, stream)
        assert result["converged"] is False, (
            "Carry-forward requires exact from_version match; 0.0.1 != 0.1.0 must fail"
        )

    def test_no_carry_forward_in_manifest_fails(self, tmp_path):
        """Manifest without approved_carry_forward still rejects prior-version approval."""
        _write_active_workflow(tmp_path, "abiogenesis.standard", "0.2.0")
        _write_manifest(tmp_path, "abiogenesis.standard@0.2.0", carry_forward=[])
        stream = workspace_bootstrap(tmp_path)
        module = _make_fh_module()
        scope = Scope(module=module, workspace_root=tmp_path)

        _append_fp_assessment(
            stream,
            workspace=tmp_path,
            edge="design→code",
            obligation_id="code_complete",
            spec_hash=_current_spec_hash(module, scope.workflow_version),
            workflow_version="abiogenesis.standard@0.2.0",
            admission_required=True,
        )
        emit(
            "approved",
            {
                "kind": "fh_review",
                "edge": "design→code",
                "actor": "test_human",
                "workflow_version": "abiogenesis.standard@0.1.0",
            },
            stream=stream,
            context=EventContext(workflow_version="abiogenesis.standard@0.1.0"),
        )

        result = gen_gaps(scope, stream)
        assert result["converged"] is False


# ── IT-6: Pre-provenance rejection ────────────────────────────────────────────

class TestPreProvenanceRejection:
    """
    IT-6: approved events with no workflow_version field (pre-provenance,
    emitted before Part B was deployed) are rejected. No special-casing,
    no grace period, and no unversioned runtime mode.
    """

    def test_pre_provenance_approval_rejected_when_version_known(self, tmp_path):
        """approved without workflow_version field fails when version known."""
        _write_active_workflow(tmp_path, "abiogenesis.standard", "0.2.0")
        stream = workspace_bootstrap(tmp_path)
        module = _make_fh_module()
        scope = Scope(module=module, workspace_root=tmp_path)

        _append_fp_assessment(
            stream,
            workspace=tmp_path,
            edge="design→code",
            obligation_id="code_complete",
            spec_hash=_current_spec_hash(module, scope.workflow_version),
            workflow_version="abiogenesis.standard@0.2.0",
            admission_required=True,
        )
        # Pre-provenance: no workflow_version field on the approval
        emit(
            "approved",
            {
                "kind": "fh_review",
                "edge": "design→code",
                "actor": "test_human",
                # workflow_version intentionally absent
            },
            stream=stream,
            context=EventContext(workflow_version="unknown"),
        )

        result = gen_gaps(scope, stream)
        assert result["converged"] is False, (
            "Pre-provenance approved (no workflow_version) must NOT satisfy "
            "F_H gate when engine has a known workflow_version. "
            "event.data.get('workflow_version') returns None; "
            "None != current_workflow_version -> rejected."
        )
        failing = [f for g in result["gaps"] for f in g["failing"]]
        assert "design_approved" in failing

    def test_pre_provenance_approval_rejected_when_runtime_metadata_missing(self, tmp_path):
        """
        Removing active-workflow.json is a runtime defect, not an unversioned mode.
        """
        workspace_bootstrap(tmp_path)
        (tmp_path / ".ai-workspace" / "runtime" / "active-workflow.json").unlink()

        module = _make_fh_module()
        with pytest.raises(WorkflowVersionError, match="active workflow metadata missing"):
            Scope(module=module, workspace_root=tmp_path)
