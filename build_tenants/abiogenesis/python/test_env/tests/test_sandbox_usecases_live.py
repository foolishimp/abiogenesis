# Validates: REQ-R-ABG3-TRANSPORT
# Validates: REQ-R-ABG3-INTERPRET
"""
Sandbox use cases — live transport qualification lane.

These are opt-in qualification tests. They reuse the real sandbox/bootstrap and
manifest production path, then hand the prompt to a real agent transport.

Unlike the fake lane, this is a qualification test:
- the live agent must produce or update the sandbox artifact
- a deterministic judge evaluates that artifact
- the judge result is ingested through the real assess-result protocol
- the engine must converge after that ingestion
"""
from __future__ import annotations

import json
import os
from pathlib import Path

import pytest

from genesis.cli_adapter import _assess_result_cmd
from genesis.binding import PrecomputedManifest, WorkSurface, module_to_executable_jobs
from genesis.install import workspace_bootstrap
from genesis.interpret import Traversal, TraversalRuntime, traverse
from genesis.projection import project
from genesis.selection import SelectionDecision
from genesis.services import Scope, gen_gaps, gen_iterate
from genesis.transport import call_agent, has_agent
from sandbox_runtime import install_real_sandbox

from helpers_intent_requirements import (
    ARTIFACT_PATH as I2R_ARTIFACT_PATH,
    EDGE_NAME as I2R_EDGE_NAME,
    intent_requirements_module,
    judge_intent_traceability,
    run_requirements_standard_check,
    write_result_file as write_i2r_result_file,
)
from helpers_requirements_uat import (
    ARTIFACT_PATH as R2U_ARTIFACT_PATH,
    EDGE_NAME as R2U_EDGE_NAME,
    judge_uat_scenario_quality,
    requirements_uat_module,
    run_uat_standard_check,
    write_result_file as write_r2u_result_file,
)
from helpers_gsdlc_lite import (
    CODE_ARTIFACT_PATH as GL_CODE_ARTIFACT_PATH,
    DECOMPOSITION_ARTIFACT_PATH as GL_DECOMPOSITION_ARTIFACT_PATH,
    DECOMPOSITION_TO_DEPENDENCY_EDGE as GL_DECOMPOSITION_TO_DEPENDENCY_EDGE,
    DEPENDENCY_CHAIN_ARTIFACT_PATH as GL_DEPENDENCY_CHAIN_ARTIFACT_PATH,
    DEPENDENCY_TO_SEQUENCING_EDGE as GL_DEPENDENCY_TO_SEQUENCING_EDGE,
    DESIGN_REVIEW_ARTIFACT_PATH as GL_DESIGN_REVIEW_ARTIFACT_PATH,
    DESIGN_TO_REVIEW_EDGE as GL_DESIGN_TO_REVIEW_EDGE,
    DESIGN_ARTIFACT_PATH as GL_DESIGN_ARTIFACT_PATH,
    DESIGN_TO_CODE_EDGE as GL_DESIGN_TO_CODE_EDGE,
    REQ_TO_DESIGN_EDGE as GL_REQ_TO_DESIGN_EDGE,
    REQ_TO_DECOMPOSITION_EDGE as GL_REQ_TO_DECOMPOSITION_EDGE,
    REVIEW_TO_CODE_EDGE as GL_REVIEW_TO_CODE_EDGE,
    SEQUENCING_ARTIFACT_PATH as GL_SEQUENCING_ARTIFACT_PATH,
    SEQUENCING_TO_DESIGN_EDGE as GL_SEQUENCING_TO_DESIGN_EDGE,
    gsdlc_lite_module,
    gsdlc_lite_review_module,
    gsdlc_lite_zoom_module,
    judge_code_quality,
    judge_design_quality,
    judge_design_review_quality,
    run_code_standard_check,
    run_design_standard_check,
    run_design_review_standard_check,
    write_result_file as write_gsdlc_result_file,
)


pytestmark = [pytest.mark.live_fp, pytest.mark.timeout(600)]


def _live_enabled() -> bool:
    return os.environ.get("CODEX_LIVE_FP") == "1" and has_agent("claude")


@pytest.mark.usecase_id("requirements_to_uat")
@pytest.mark.skipif(not _live_enabled(), reason="set CODEX_LIVE_FP=1 and ensure claude is available")
def test_requirements_to_uat_live_qualification(run_archive):
    workspace = run_archive.workspace
    install_real_sandbox(workspace, archive=run_archive)
    stream = workspace_bootstrap(workspace)
    module = requirements_uat_module(workspace)
    scope = Scope(module=module, workspace_root=workspace)
    run_archive.note("scenario", lane="live", edge=R2U_EDGE_NAME, agent="claude")
    assert any(event["event_type"] == "genesis_installed" for event in stream.all_events())

    result = gen_iterate(scope, stream)
    assert result["status"] == "iterated"
    manifest = json.loads(Path(result["fp_manifest_path"]).read_text(encoding="utf-8"))
    artifact_path = workspace / R2U_ARTIFACT_PATH
    placeholder_size = artifact_path.stat().st_size
    result_path = Path(manifest["result_path"])
    run_archive.update_summary(
        lane="live",
        edge=R2U_EDGE_NAME,
        manifest_id=manifest["manifest_id"],
        blocking_reason=result["blocking_reason"],
        transport_method="subprocess",
        transport_agent="claude",
        model_id="agent-default:claude",
    )

    response = call_agent(
        manifest["prompt"],
        str(workspace),
        agent="claude",
        timeout=240,
        retries=0,
    )
    run_archive.capture_text("raw_response.txt", response)

    assert response.strip() != ""
    assert artifact_path.exists()
    assert artifact_path.stat().st_size > placeholder_size, "live agent must update the sandbox artifact"

    check = run_uat_standard_check(workspace)
    run_archive.log_subprocess("check_uat_standard.py", check)
    assert check.returncode == 0, check.stderr or check.stdout
    check_payload = json.loads(check.stdout)
    run_archive.capture_json("uat_standard_check.json", check_payload)
    run_archive.update_summary(
        fd_check_status=check_payload["status"],
        fd_check_requirement_count=len(check_payload["requirements"]),
        fd_check_case_count=check_payload["case_count"],
    )

    assessments = judge_uat_scenario_quality(artifact_path)
    assert all(a["result"] == "pass" for a in assessments), assessments[0]["evidence"]

    write_r2u_result_file(
        result_path,
        edge=R2U_EDGE_NAME,
        actor="live_fp_judge",
        assessments=assessments,
    )
    rc = _assess_result_cmd(str(result_path), workspace)
    assert rc == 0

    gaps = gen_gaps(scope, stream)
    assert gaps["converged"] is True
    assert gaps["total_delta"] == 0
    run_archive.update_summary(converged=True, total_delta=0)


@pytest.mark.usecase_id("intent_to_requirements")
@pytest.mark.skipif(not _live_enabled(), reason="set CODEX_LIVE_FP=1 and ensure claude is available")
def test_intents_to_requirements_live_qualification(run_archive):
    workspace = run_archive.workspace
    install_real_sandbox(workspace, archive=run_archive)
    stream = workspace_bootstrap(workspace)
    module = intent_requirements_module(workspace)
    scope = Scope(module=module, workspace_root=workspace)
    run_archive.note("scenario", lane="live", edge=I2R_EDGE_NAME, agent="claude")
    assert any(event["event_type"] == "genesis_installed" for event in stream.all_events())

    result = gen_iterate(scope, stream)
    assert result["status"] == "iterated"
    manifest = json.loads(Path(result["fp_manifest_path"]).read_text(encoding="utf-8"))
    artifact_path = workspace / I2R_ARTIFACT_PATH
    placeholder_size = artifact_path.stat().st_size
    result_path = Path(manifest["result_path"])
    run_archive.update_summary(
        lane="live",
        edge=I2R_EDGE_NAME,
        manifest_id=manifest["manifest_id"],
        blocking_reason=result["blocking_reason"],
        transport_method="subprocess",
        transport_agent="claude",
        model_id="agent-default:claude",
    )

    response = call_agent(
        manifest["prompt"],
        str(workspace),
        agent="claude",
        timeout=120,
        retries=0,
    )
    run_archive.capture_text("raw_response.txt", response)

    assert response.strip() != ""
    assert artifact_path.exists()
    assert artifact_path.stat().st_size > placeholder_size, "live agent must update the sandbox artifact"

    check = run_requirements_standard_check(workspace)
    run_archive.log_subprocess("check_requirements_standard.py", check)
    assert check.returncode == 0, check.stderr or check.stdout
    check_payload = json.loads(check.stdout)
    run_archive.capture_json("requirements_standard_check.json", check_payload)
    run_archive.update_summary(
        fd_check_status=check_payload["status"],
        fd_check_family_count=len(check_payload["families"]),
        fd_check_ac_count=check_payload["ac_count"],
    )

    assessments = judge_intent_traceability(artifact_path)
    assert all(a["result"] == "pass" for a in assessments), assessments[0]["evidence"]

    write_i2r_result_file(
        result_path,
        edge=I2R_EDGE_NAME,
        actor="live_requirements_judge",
        assessments=assessments,
    )
    rc = _assess_result_cmd(str(result_path), workspace)
    assert rc == 0

    gaps = gen_gaps(scope, stream)
    assert gaps["converged"] is True
    assert gaps["total_delta"] == 0
    run_archive.update_summary(converged=True, total_delta=0)


@pytest.mark.usecase_id("gsdlc_lite")
@pytest.mark.skipif(not _live_enabled(), reason="set CODEX_LIVE_FP=1 and ensure claude is available")
def test_gsdlc_lite_requirements_design_code_live_qualification(run_archive):
    workspace = run_archive.workspace
    install_real_sandbox(workspace, archive=run_archive)
    stream = workspace_bootstrap(workspace)
    module = gsdlc_lite_module(workspace)
    scope = Scope(module=module, workspace_root=workspace)
    run_archive.note("scenario", lane="live", edge_chain=(GL_REQ_TO_DESIGN_EDGE, GL_DESIGN_TO_CODE_EDGE), agent="claude")
    assert any(event["event_type"] == "genesis_installed" for event in stream.all_events())

    first = gen_iterate(scope, stream)
    assert first["status"] == "iterated"
    first_manifest = json.loads(Path(first["fp_manifest_path"]).read_text(encoding="utf-8"))
    assert first_manifest["edge"] == GL_REQ_TO_DESIGN_EDGE
    design_path = workspace / GL_DESIGN_ARTIFACT_PATH
    design_placeholder_size = design_path.stat().st_size

    design_response = call_agent(
        first_manifest["prompt"],
        str(workspace),
        agent="claude",
        timeout=240,
        retries=0,
    )
    run_archive.capture_text("raw_response_requirements_design.txt", design_response)

    assert design_response.strip() != ""
    assert design_path.exists()
    assert design_path.stat().st_size > design_placeholder_size, "live agent must update design.md"

    design_check = run_design_standard_check(workspace)
    run_archive.log_subprocess("check_design_standard.py", design_check)
    assert design_check.returncode == 0, design_check.stderr or design_check.stdout
    design_check_payload = json.loads(design_check.stdout)
    run_archive.capture_json("design_standard_check.json", design_check_payload)

    design_assessments = judge_design_quality(design_path)
    assert all(a["result"] == "pass" for a in design_assessments), design_assessments[0]["evidence"]
    write_gsdlc_result_file(
        Path(first_manifest["result_path"]),
        edge=GL_REQ_TO_DESIGN_EDGE,
        actor="live_design_judge",
        assessments=design_assessments,
    )
    assert _assess_result_cmd(str(first_manifest["result_path"]), workspace) == 0

    second = gen_iterate(scope, stream)
    assert second["status"] == "iterated"
    second_manifest = json.loads(Path(second["fp_manifest_path"]).read_text(encoding="utf-8"))
    assert second_manifest["edge"] == GL_DESIGN_TO_CODE_EDGE
    code_path = workspace / GL_CODE_ARTIFACT_PATH
    code_placeholder_size = code_path.stat().st_size

    code_response = call_agent(
        second_manifest["prompt"],
        str(workspace),
        agent="claude",
        timeout=240,
        retries=0,
    )
    run_archive.capture_text("raw_response_design_code.txt", code_response)

    assert code_response.strip() != ""
    assert code_path.exists()
    assert code_path.stat().st_size > code_placeholder_size, "live agent must update project_service.py"

    code_check = run_code_standard_check(workspace)
    run_archive.log_subprocess("check_code_standard.py", code_check)
    assert code_check.returncode == 0, code_check.stderr or code_check.stdout
    code_check_payload = json.loads(code_check.stdout)
    run_archive.capture_json("code_standard_check.json", code_check_payload)

    code_assessments = judge_code_quality(code_path)
    assert all(a["result"] == "pass" for a in code_assessments), code_assessments[0]["evidence"]
    write_gsdlc_result_file(
        Path(second_manifest["result_path"]),
        edge=GL_DESIGN_TO_CODE_EDGE,
        actor="live_code_judge",
        assessments=code_assessments,
    )
    assert _assess_result_cmd(str(second_manifest["result_path"]), workspace) == 0

    gaps = gen_gaps(scope, stream)
    assert gaps["converged"] is True
    assert gaps["total_delta"] == 0
    run_archive.update_summary(
        lane="live",
        edges=[GL_REQ_TO_DESIGN_EDGE, GL_DESIGN_TO_CODE_EDGE],
        design_manifest_id=first_manifest["manifest_id"],
        code_manifest_id=second_manifest["manifest_id"],
        transport_method="subprocess",
        transport_agent="claude",
        model_id="agent-default:claude",
        fd_design_status=design_check_payload["status"],
        fd_code_status=code_check_payload["status"],
        converged=True,
        total_delta=0,
    )


@pytest.mark.usecase_id("gsdlc_lite_review")
@pytest.mark.skipif(not _live_enabled(), reason="set CODEX_LIVE_FP=1 and ensure claude is available")
def test_gsdlc_lite_design_review_live_qualification(run_archive):
    workspace = run_archive.workspace
    install_real_sandbox(workspace, archive=run_archive)
    stream = workspace_bootstrap(workspace)
    module = gsdlc_lite_review_module(workspace)
    scope = Scope(module=module, workspace_root=workspace)
    run_archive.note(
        "scenario",
        lane="live",
        edge_chain=(GL_REQ_TO_DESIGN_EDGE, GL_DESIGN_TO_REVIEW_EDGE, GL_REVIEW_TO_CODE_EDGE),
        agent="claude",
    )
    assert any(event["event_type"] == "genesis_installed" for event in stream.all_events())

    first = gen_iterate(scope, stream)
    assert first["status"] == "iterated"
    first_manifest = json.loads(Path(first["fp_manifest_path"]).read_text(encoding="utf-8"))
    assert first_manifest["edge"] == GL_REQ_TO_DESIGN_EDGE
    design_path = workspace / GL_DESIGN_ARTIFACT_PATH
    design_placeholder_size = design_path.stat().st_size

    design_response = call_agent(
        first_manifest["prompt"],
        str(workspace),
        agent="claude",
        timeout=240,
        retries=0,
    )
    run_archive.capture_text("raw_response_requirements_design.txt", design_response)
    assert design_response.strip() != ""
    assert design_path.exists()
    assert design_path.stat().st_size > design_placeholder_size

    design_check = run_design_standard_check(workspace)
    run_archive.log_subprocess("check_design_standard.py", design_check)
    assert design_check.returncode == 0, design_check.stderr or design_check.stdout
    design_check_payload = json.loads(design_check.stdout)
    run_archive.capture_json("design_standard_check.json", design_check_payload)

    design_assessments = judge_design_quality(design_path)
    assert all(a["result"] == "pass" for a in design_assessments), design_assessments[0]["evidence"]
    write_gsdlc_result_file(
        Path(first_manifest["result_path"]),
        edge=GL_REQ_TO_DESIGN_EDGE,
        actor="live_design_judge",
        assessments=design_assessments,
    )
    assert _assess_result_cmd(str(first_manifest["result_path"]), workspace) == 0

    second = gen_iterate(scope, stream)
    assert second["status"] == "iterated"
    second_manifest = json.loads(Path(second["fp_manifest_path"]).read_text(encoding="utf-8"))
    assert second_manifest["edge"] == GL_DESIGN_TO_REVIEW_EDGE
    review_path = workspace / GL_DESIGN_REVIEW_ARTIFACT_PATH
    review_placeholder_size = review_path.stat().st_size

    review_response = call_agent(
        second_manifest["prompt"],
        str(workspace),
        agent="claude",
        timeout=240,
        retries=0,
    )
    run_archive.capture_text("raw_response_design_review.txt", review_response)
    assert review_response.strip() != ""
    assert review_path.exists()
    assert review_path.stat().st_size > review_placeholder_size

    review_check = run_design_review_standard_check(workspace)
    run_archive.log_subprocess("check_design_review_standard.py", review_check)
    assert review_check.returncode == 0, review_check.stderr or review_check.stdout
    review_check_payload = json.loads(review_check.stdout)
    run_archive.capture_json("design_review_standard_check.json", review_check_payload)

    review_assessments = list(judge_design_review_quality(review_path))
    assert all(a["result"] == "pass" for a in review_assessments), review_assessments[0]["evidence"]
    write_gsdlc_result_file(
        Path(second_manifest["result_path"]),
        edge=GL_DESIGN_TO_REVIEW_EDGE,
        actor="live_design_review_judge",
        assessments=review_assessments,
    )
    assert _assess_result_cmd(str(second_manifest["result_path"]), workspace) == 0

    third = gen_iterate(scope, stream)
    assert third["status"] == "iterated"
    third_manifest = json.loads(Path(third["fp_manifest_path"]).read_text(encoding="utf-8"))
    assert third_manifest["edge"] == GL_REVIEW_TO_CODE_EDGE
    code_path = workspace / GL_CODE_ARTIFACT_PATH
    code_placeholder_size = code_path.stat().st_size

    code_response = call_agent(
        third_manifest["prompt"],
        str(workspace),
        agent="claude",
        timeout=240,
        retries=0,
    )
    run_archive.capture_text("raw_response_review_code.txt", code_response)
    assert code_response.strip() != ""
    assert code_path.exists()
    assert code_path.stat().st_size > code_placeholder_size

    code_check = run_code_standard_check(workspace)
    run_archive.log_subprocess("check_code_standard.py", code_check)
    assert code_check.returncode == 0, code_check.stderr or code_check.stdout
    code_check_payload = json.loads(code_check.stdout)
    run_archive.capture_json("code_standard_check.json", code_check_payload)

    code_assessments = judge_code_quality(code_path)
    assert all(a["result"] == "pass" for a in code_assessments), code_assessments[0]["evidence"]
    write_gsdlc_result_file(
        Path(third_manifest["result_path"]),
        edge=GL_REVIEW_TO_CODE_EDGE,
        actor="live_code_judge",
        assessments=code_assessments,
    )
    assert _assess_result_cmd(str(third_manifest["result_path"]), workspace) == 0

    final_gaps = gen_gaps(scope, stream)
    assert final_gaps["converged"] is True
    assert final_gaps["total_delta"] == 0
    run_archive.update_summary(
        lane="live",
        edges=[GL_REQ_TO_DESIGN_EDGE, GL_DESIGN_TO_REVIEW_EDGE, GL_REVIEW_TO_CODE_EDGE],
        design_manifest_id=first_manifest["manifest_id"],
        review_manifest_id=second_manifest["manifest_id"],
        code_manifest_id=third_manifest["manifest_id"],
        review_assessment_count=len(review_assessments),
        transport_method="subprocess",
        transport_agent="claude",
        model_id="agent-default:claude",
        fd_design_status=design_check_payload["status"],
        fd_review_status=review_check_payload["status"],
        fd_code_status=code_check_payload["status"],
        converged=True,
        total_delta=0,
    )


@pytest.mark.usecase_id("gsdlc_lite_zoom")
@pytest.mark.skipif(not _live_enabled(), reason="set CODEX_LIVE_FP=1 and ensure claude is available")
def test_gsdlc_lite_zoom_design_live_qualification(run_archive):
    workspace = run_archive.workspace
    install_real_sandbox(workspace, archive=run_archive)
    stream = workspace_bootstrap(workspace)
    module = gsdlc_lite_zoom_module(workspace)
    scope = Scope(module=module, workspace_root=workspace)
    run_archive.note("scenario", lane="live", edge=GL_REQ_TO_DESIGN_EDGE, selection="zoomed_design_profile", agent="claude")
    assert any(event["event_type"] == "genesis_installed" for event in stream.all_events())

    executable_job = module_to_executable_jobs(module)[0]
    runtime = TraversalRuntime(
        module=module,
        executable_job=executable_job,
        precomputed=PrecomputedManifest(
            executable_job=executable_job,
            current_asset={},
            failing_evaluators=list(executable_job.vector.evaluators),
            passing_evaluators=[],
            fd_results={},
            relevant_contexts={},
        ),
        workspace_root=workspace,
        stream=stream,
        worker=scope.worker,
        spec_hash="spec-gsdlc-zoom-live",
        work_key=executable_job.vector.id,
    )
    selected = traverse(
        Traversal(
            work_key=executable_job.vector.id,
            target=module.candidate_families[0],
            selection=SelectionDecision(
                contract_id=executable_job.vector.id,
                work_key=executable_job.vector.id,
                graph_function="zoomed_design_profile",
                selected_by="live_test_policy",
                selection_mode="explicit",
                rationale="exercise live zoomed design decomposition",
            ),
            evaluators=executable_job.vector.evaluators,
        ),
        runtime=runtime,
        surface=WorkSurface(),
    )
    assert selected.result["status"] == "selected"
    frame_state = project(stream, "frame", selected.result["frame_id"])
    assert frame_state["status"] == "open"

    active_scope = Scope(
        module=module,
        workspace_root=workspace,
        worker=scope.worker,
    )

    zoom_steps = (
        (GL_REQ_TO_DECOMPOSITION_EDGE, GL_DECOMPOSITION_ARTIFACT_PATH),
        (GL_DECOMPOSITION_TO_DEPENDENCY_EDGE, GL_DEPENDENCY_CHAIN_ARTIFACT_PATH),
        (GL_DEPENDENCY_TO_SEQUENCING_EDGE, GL_SEQUENCING_ARTIFACT_PATH),
        (GL_SEQUENCING_TO_DESIGN_EDGE, GL_DESIGN_ARTIFACT_PATH),
    )
    manifest_ids: list[str] = []
    for edge_name, artifact_relpath in zoom_steps:
        result = gen_iterate(active_scope, stream)
        assert result["status"] == "iterated"
        assert result["blocking_reason"] == "fp_dispatch"
        manifest = json.loads(Path(result["fp_manifest_path"]).read_text(encoding="utf-8"))
        assert manifest["edge"] == edge_name
        manifest_ids.append(manifest["manifest_id"])

        artifact_path = workspace / artifact_relpath
        placeholder_size = artifact_path.stat().st_size if artifact_path.exists() else 0
        response = call_agent(
            manifest["prompt"],
            str(workspace),
            agent="claude",
            timeout=240,
            retries=0,
        )
        run_archive.capture_text(f"raw_response_{edge_name.replace('→', '_')}.txt", response)
        assert response.strip() != ""
        assert artifact_path.exists()
        assert artifact_path.stat().st_size > placeholder_size

        write_gsdlc_result_file(
            Path(manifest["result_path"]),
            edge=edge_name,
            actor="live_zoom_judge",
            assessments=[{
                "evaluator": "zoom_progress",
                "result": "pass",
                "evidence": f"{artifact_relpath.name} updated with non-empty content",
            }],
        )
        assert _assess_result_cmd(str(manifest["result_path"]), workspace) == 0

    design_check = run_design_standard_check(workspace)
    run_archive.log_subprocess("check_design_standard.py", design_check)
    assert design_check.returncode == 0, design_check.stderr or design_check.stdout
    design_check_payload = json.loads(design_check.stdout)
    run_archive.capture_json("design_standard_check.json", design_check_payload)
    design_assessments = judge_design_quality(workspace / GL_DESIGN_ARTIFACT_PATH)
    assert all(a["result"] == "pass" for a in design_assessments), design_assessments[0]["evidence"]

    final_gaps = gen_gaps(active_scope, stream)
    assert final_gaps["converged"] is True
    assert final_gaps["total_delta"] == 0

    run_archive.update_summary(
        lane="live",
        selection="zoomed_design_profile",
        zoom_manifest_ids=manifest_ids,
        design_manifest_id=manifest_ids[-1],
        transport_method="subprocess",
        transport_agent="claude",
        model_id="agent-default:claude",
        fd_design_status=design_check_payload["status"],
        converged=True,
        total_delta=0,
    )
