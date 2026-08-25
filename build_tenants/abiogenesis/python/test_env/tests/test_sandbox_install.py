# Validates: REQ-R-ABG3-EVENTS
# Validates: REQ-R-ABG3-INTERPRET
# Validates: REQ-R-ABG3-CORRECTION
# Validates: REQ-R-ABG3-CONTINUATION
# Validates: REQ-R-ABG3-RUN
"""
Sandbox install tests for the current runtime.

These tests validate the real bootstrap surface used by the retained suite:
`gen-install.py`, the installed `.genesis` runtime, and `workspace_bootstrap()`.
"""
from __future__ import annotations

import json
import sys
import textwrap
from pathlib import Path

import pytest

from genesis import __version__ as GENESIS_VERSION
from genesis.events import EventStream, emit
from genesis.install import workspace_bootstrap
from genesis.projection import project
from sandbox_runtime import install_real_sandbox, run_installed_genesis


def _fp_result_payload(
    edge: str,
    *,
    actor: str,
    obligation_id: str = "code_complete",
    fulfillment_status: str = "fulfilled",
    fulfillment_detail: str = "ok",
    extra: dict[str, object] | None = None,
) -> dict[str, object]:
    payload: dict[str, object] = {
        "edge": edge,
        "actor": actor,
        "fulfillment_assessments": [
            {
                "id": obligation_id,
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
    if extra:
        payload.update(extra)
    return payload


def _router_dispatch_module_source() -> str:
    return textwrap.dedent(
        """\
        from gtl.algebra import deferred_refinement
        from gtl.function_model import EnvRef, GraphFunction
        from gtl.graph import Graph, GraphVector, Node
        from gtl.obligation_ledger import declared_fulfillment_obligation, obligation_ledger_declarations
        from gtl.module_model import Module
        from gtl.operator_model import Evaluator, F_P
        from gtl.work_model import ContractRef, Job, Role
        from genesis.binding import Worker, module_to_executable_jobs

        constructor = Role(name="constructor")
        design = Node(name="design", schema="Design")
        code = Node(name="code", schema="Code")
        code_complete = Evaluator("code_complete", F_P, "code satisfies the design contract")
        vector = GraphVector(
            name="design→code",
            source=design,
            target=code,
            evaluators=(code_complete,),
            declarations=obligation_ledger_declarations(
                obligation_source_kind="test_declared_fp_obligations",
                obligation_source_ref="test://sandbox_install#design→code",
                obligation_kind="fp_evaluator_obligation",
                carry_rule="declared_fulfillment_obligation_set_totality",
                fulfillment_rule="per_obligation_fp_assessment",
                evidence_policy="agent_supplied_evidence_refs",
                obligations=(
                    declared_fulfillment_obligation(
                        "code_complete",
                        evaluator="code_complete",
                        statement=code_complete.description,
                        source_kind="test_declared_fp_obligations",
                        source_refs=("test://sandbox_install#design→code/obligation/0",),
                    ),
                ),
            ),
        )
        graph = Graph(
            name="runtime_identity_contract",
            inputs=(design,),
            outputs=(code,),
            nodes=(design, code),
            vectors=(vector,),
        )
        graph_function = GraphFunction.from_graph(
            name=vector.name,
            graph=graph,
            environment=EnvRef.from_contract(requires=(design,), provides=(code,)),
        )
        module = Module(
            name="runtime_identity_contract",
            graphs=(graph,),
            graph_functions=(graph_function,),
            refinement_boundaries=(deferred_refinement(vector.name, inputs=(design,), outputs=(code,)),),
            jobs=(Job(name=vector.name, contracts=(ContractRef(kind="graph_function", target_id=graph_function.id),), roles=(constructor,)),),
            roles=(constructor,),
            metadata={"requirements": ["REQ-R-ABG3-BINDING-006", "REQ-R-ABG3-EVENTS-003"]},
        )
        worker = Worker(
            id="abiogenesis_python_router",
            can_execute=module_to_executable_jobs(module),
            role_ids=(constructor.id,),
            authority_ref="runtime://role-dispatch",
        )
        """
    )


def _multi_target_router_module_source() -> str:
    return textwrap.dedent(
        """\
        from gtl.algebra import deferred_refinement
        from gtl.function_model import EnvRef, GraphFunction
        from gtl.graph import Graph, GraphVector, Node
        from gtl.obligation_ledger import declared_fulfillment_obligation, obligation_ledger_declarations
        from gtl.module_model import Module
        from gtl.operator_model import Evaluator, F_P
        from gtl.work_model import ContractRef, Job, Role
        from genesis.binding import Worker, module_to_executable_jobs

        constructor = Role(name="constructor")
        design = Node(name="design", schema="Design")
        code = Node(name="code", schema="Code")
        review = Node(name="review", schema="Review")

        code_complete = Evaluator("code_complete", F_P, "code satisfies the design contract")
        review_complete = Evaluator("review_complete", F_P, "review satisfies the design contract")

        code_vector = GraphVector(
            name="design→code",
            source=design,
            target=code,
            evaluators=(code_complete,),
            declarations=obligation_ledger_declarations(
                obligation_source_kind="test_declared_fp_obligations",
                obligation_source_ref="test://sandbox_install#design→code",
                obligation_kind="fp_evaluator_obligation",
                carry_rule="declared_fulfillment_obligation_set_totality",
                fulfillment_rule="per_obligation_fp_assessment",
                evidence_policy="agent_supplied_evidence_refs",
                obligations=(
                    declared_fulfillment_obligation(
                        "code_complete",
                        evaluator="code_complete",
                        statement=code_complete.description,
                        source_kind="test_declared_fp_obligations",
                        source_refs=("test://sandbox_install#design→code/obligation/0",),
                    ),
                ),
            ),
        )
        review_vector = GraphVector(
            name="design→review",
            source=design,
            target=review,
            evaluators=(review_complete,),
            declarations=obligation_ledger_declarations(
                obligation_source_kind="test_declared_fp_obligations",
                obligation_source_ref="test://sandbox_install#design→review",
                obligation_kind="fp_evaluator_obligation",
                carry_rule="declared_fulfillment_obligation_set_totality",
                fulfillment_rule="per_obligation_fp_assessment",
                evidence_policy="agent_supplied_evidence_refs",
                obligations=(
                    declared_fulfillment_obligation(
                        "review_complete",
                        evaluator="review_complete",
                        statement=review_complete.description,
                        source_kind="test_declared_fp_obligations",
                        source_refs=("test://sandbox_install#design→review/obligation/0",),
                    ),
                ),
            ),
        )

        code_graph = Graph(
            name="code_contract",
            inputs=(design,),
            outputs=(code,),
            nodes=(design, code),
            vectors=(code_vector,),
        )
        review_graph = Graph(
            name="review_contract",
            inputs=(design,),
            outputs=(review,),
            nodes=(design, review),
            vectors=(review_vector,),
        )

        code_fn = GraphFunction.from_graph(
            name="code_fn",
            graph=code_graph,
            environment=EnvRef.from_contract(requires=(design,), provides=(code,)),
            declarations={"operator_handles": ("code-flow",)},
        )
        review_fn = GraphFunction.from_graph(
            name="review_fn",
            graph=review_graph,
            environment=EnvRef.from_contract(requires=(design,), provides=(review,)),
            declarations={"operator_handles": ("review-flow",)},
        )

        module = Module(
            name="multi_target_runtime_contract",
            graphs=(code_graph, review_graph),
            graph_functions=(code_fn, review_fn),
            refinement_boundaries=(
                deferred_refinement(code_vector.name, inputs=(design,), outputs=(code,)),
                deferred_refinement(review_vector.name, inputs=(design,), outputs=(review,)),
            ),
            jobs=(
                Job(name=code_vector.name, contracts=(ContractRef(kind="graph_function", target_id=code_fn.id),), roles=(constructor,)),
                Job(name=review_vector.name, contracts=(ContractRef(kind="graph_function", target_id=review_fn.id),), roles=(constructor,)),
            ),
            roles=(constructor,),
            metadata={"requirements": ["REQ-P-POLICY-009", "REQ-P-POLICY-010"]},
        )
        worker = Worker(
            id="abiogenesis_python_router",
            can_execute=module_to_executable_jobs(module),
            role_ids=(constructor.id,),
            authority_ref="runtime://role-dispatch",
        )
        """
    )


def _deterministic_runtime_module_source() -> str:
    return textwrap.dedent(
        """\
        from gtl.algebra import deferred_refinement
        from gtl.function_model import EnvRef, GraphFunction
        from gtl.graph import Graph, GraphVector, Node
        from gtl.operator_model import Evaluator, F_D
        from gtl.module_model import Module
        from gtl.work_model import ContractRef, Job, Role
        from genesis.binding import Worker, module_to_executable_jobs

        constructor = Role(name="constructor")
        design = Node(name="design", schema="Design")
        code = Node(name="code", schema="Code")
        code_ready = Evaluator(
            "code_ready",
            F_D,
            "deterministic code readiness passes",
            binding="exec://python -c 'import sys; sys.exit(0)'",
        )
        vector = GraphVector(
            name="design→code",
            source=design,
            target=code,
            evaluators=(code_ready,),
        )
        graph = Graph(
            name="deterministic_runtime_contract",
            inputs=(design,),
            outputs=(code,),
            nodes=(design, code),
            vectors=(vector,),
        )
        graph_function = GraphFunction.from_graph(
            name="code_fn",
            graph=graph,
            environment=EnvRef.from_contract(requires=(design,), provides=(code,)),
            declarations={"operator_handles": ("code-flow",)},
        )
        module = Module(
            name="deterministic_runtime_contract",
            graphs=(graph,),
            graph_functions=(graph_function,),
            refinement_boundaries=(deferred_refinement(vector.name, inputs=(design,), outputs=(code,)),),
            jobs=(Job(name=vector.name, contracts=(ContractRef(kind="graph_function", target_id=graph_function.id),), roles=(constructor,)),),
            roles=(constructor,),
            metadata={"requirements": ["REQ-P-POLICY-009"]},
        )
        worker = Worker(
            id="abiogenesis_python_router",
            can_execute=module_to_executable_jobs(module),
            role_ids=(constructor.id,),
            authority_ref="runtime://role-dispatch",
        )
        """
    )


def _write_runtime_contract(workspace: Path, *extra_lines: str) -> None:
    (workspace / ".genesis" / "genesis.yml").write_text(
        "runtime_contract: runtime.yml\n",
        encoding="utf-8",
    )
    lines = [
        "module: demo_runtime:module",
        "worker: demo_runtime:worker",
        "runtime_build: abiogenesis_python_router",
        "runtime_worker_id: codex",
        "runtime_backend: codex",
        "runtime_authority_ref: runtime://role-dispatch",
        "runtime_assignment_source: runtime://session-override/constructor",
        "runtime_resolved_runtime_ref: runtime://resolved/constructor/codex",
        *extra_lines,
    ]
    (workspace / "runtime.yml").write_text("\n".join(lines) + "\n", encoding="utf-8")


def _write_operator_asset_registry_script(workspace: Path, payload: dict[str, object]) -> str:
    script = workspace / "operator_asset_query.py"
    script.write_text(
        "import json\n"
        f"payload = {repr(payload)}\n"
        "print(json.dumps(payload))\n",
        encoding="utf-8",
    )
    return f"{sys.executable} {script}"


@pytest.mark.integration
class TestSandboxInstall:
    @pytest.mark.usecase_id("sandbox_install")
    def test_real_install_copies_complete_engine_runtime(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)

        source_root = Path(__file__).resolve().parents[2] / "code" / "genesis"
        installed_root = workspace / ".genesis" / "genesis"
        source_modules = {path.name for path in source_root.glob("*.py")}
        installed_modules = {path.name for path in installed_root.glob("*.py")}

        assert installed_modules == source_modules
        run_archive.update_summary(installed_module_count=len(installed_modules))

    @pytest.mark.usecase_id("sandbox_install")
    def test_install_creates_full_ai_workspace_skeleton_before_runtime_bootstrap(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)

        assert (workspace / ".ai-workspace" / "events" / "events.jsonl").is_file()
        assert (workspace / ".ai-workspace" / "features" / "active").is_dir()
        assert (workspace / ".ai-workspace" / "features" / "completed").is_dir()
        assert (workspace / ".ai-workspace" / "context").is_dir()
        assert (workspace / ".ai-workspace" / "reviews" / "pending").is_dir()
        assert (workspace / ".ai-workspace" / "reviews" / "proxy-log").is_dir()
        assert (workspace / ".ai-workspace" / "comments" / "claude").is_dir()
        assert (workspace / ".ai-workspace" / "agents").is_dir()
        assert (workspace / ".ai-workspace" / "runtime").is_dir()
        active_workflow = json.loads(
            (workspace / ".ai-workspace" / "runtime" / "active-workflow.json").read_text(encoding="utf-8")
        )
        assert active_workflow == {
            "workflow": "abiogenesis.standard",
            "version": GENESIS_VERSION,
        }
        run_archive.update_summary(workspace_skeleton="installed")

    @pytest.mark.usecase_id("sandbox_install")
    def test_install_vendors_builder_docs_and_full_standards_tree(self, run_archive):
        workspace = run_archive.workspace
        install_payload = install_real_sandbox(workspace, archive=run_archive)
        docs_root = workspace / ".genesis" / "docs"
        agents_text = (workspace / "AGENTS.md").read_text(encoding="utf-8")
        claude_text = (workspace / "CLAUDE.md").read_text(encoding="utf-8")

        assert (docs_root / "README.md").is_file()
        assert (docs_root / "ABG_GTL_SCHEMATICS.md").is_file()
        assert (docs_root / "GTL_HELLO_WORLD_EXAMPLES.md").is_file()
        assert (docs_root / "LLM_GTL_APP_BUILDER_GUIDE.md").is_file()
        assert (docs_root / "USER_GUIDE.md").is_file()
        assert (docs_root / "GTL_BOOTLOADER.md").is_file()
        assert not (docs_root / "GTL_Technical_Guide.md").exists()
        assert (docs_root / "standards" / "SPEC_METHOD.md").is_file()
        assert (docs_root / "standards" / "POSTING_GUIDE.md").is_file()
        assert (docs_root / "standards" / "WRITING_GUIDE.md").is_file()
        assert (docs_root / "standards" / "templates" / "requirements" / "STARTER_REQUIREMENTS_TEMPLATE.md").is_file()
        assert "workspace://.genesis/docs/LLM_GTL_APP_BUILDER_GUIDE.md" in agents_text
        assert "workspace://.genesis/docs/standards/SPEC_METHOD.md" in agents_text
        assert "workspace://.genesis/docs/standards/POSTING_GUIDE.md" in agents_text
        assert "workspace://.ai-workspace/comments/README.md" in agents_text
        assert "workspace://.genesis/docs/LLM_GTL_APP_BUILDER_GUIDE.md" in claude_text
        assert "workspace://.genesis/docs/standards/SPEC_METHOD.md" in claude_text
        assert "workspace://.genesis/docs/standards/POSTING_GUIDE.md" in claude_text
        assert "workspace://.ai-workspace/comments/README.md" in claude_text
        assert install_payload["agents_md"] in {"created", "updated", "appended"}
        assert install_payload["claude_md"] in {"created", "updated", "appended"}
        assert "LLM_GTL_APP_BUILDER_GUIDE.md" in install_payload["docs_files"]
        assert "ABG_GTL_SCHEMATICS.md" in install_payload["docs_files"]
        assert "GTL_HELLO_WORLD_EXAMPLES.md" in install_payload["docs_files"]
        assert "GTL_BOOTLOADER.md" in install_payload["docs_files"]
        assert install_payload["standards_file_count"] > 0
        run_archive.update_summary(
            installed_docs=len(install_payload["docs_files"]),
            installed_standards_files=install_payload["standards_file_count"],
        )

    @pytest.mark.usecase_id("sandbox_install")
    def test_install_seeds_project_owned_spec_and_tenant_templates(self, run_archive):
        workspace = run_archive.workspace
        install_payload = install_real_sandbox(workspace, archive=run_archive)

        assert (workspace / "README.md").is_file()
        assert not (workspace / "specification" / "standards").exists()
        assert (workspace / "specification" / "INTENT.md").is_file()
        assert (workspace / "specification" / "PRODUCT.md").is_file()
        assert (workspace / "specification" / "GOALS.md").is_file()
        assert (workspace / "specification" / "requirements" / "README.md").is_file()
        assert (workspace / "specification" / "requirements" / "00-starter.md").is_file()
        assert (workspace / "docs" / "README.md").is_file()
        assert (workspace / "build_tenants" / "TENANT_REGISTRY.md").is_file()
        assert (workspace / "build_tenants" / "common" / "README.md").is_file()
        assert (workspace / "build_tenants" / "common" / "design" / "README.md").is_file()
        assert (workspace / "build_tenants" / "project_package" / "python" / "README.md").is_file()
        assert (workspace / "build_tenants" / "project_package" / "python" / "design" / "README.md").is_file()
        assert (workspace / "build_tenants" / "project_package" / "python" / "design" / "fp" / "INTENT.md").is_file()
        assert (workspace / "build_tenants" / "project_package" / "python" / "code" / "README.md").is_file()
        assert (workspace / "build_tenants" / "project_package" / "python" / "code" / "__init__.py").is_file()
        assert (workspace / "build_tenants" / "project_package" / "python" / "code" / "app_bootstrap.py").is_file()

        registry_text = (workspace / "build_tenants" / "TENANT_REGISTRY.md").read_text(encoding="utf-8")
        starter_req_text = (workspace / "specification" / "requirements" / "00-starter.md").read_text(encoding="utf-8")
        intent_text = (workspace / "specification" / "INTENT.md").read_text(encoding="utf-8")
        readme_text = (workspace / "README.md").read_text(encoding="utf-8")
        app_bootstrap_text = (workspace / "build_tenants" / "project_package" / "python" / "code" / "app_bootstrap.py").read_text(encoding="utf-8")
        assert "build_tenants/project_package/python/" in registry_text
        assert "REQ-PROJECT_PACKAGE-STARTER-001" in starter_req_text
        assert ".genesis/docs/standards/SPEC_METHOD.md" in readme_text
        assert ".genesis/docs/standards/" in intent_text
        assert "def bootstrap(" in app_bootstrap_text
        assert "def initialize(" in app_bootstrap_text
        assert "def gaps(" in app_bootstrap_text
        assert "def iterate(" in app_bootstrap_text
        assert "def start(" in app_bootstrap_text
        assert install_payload["scaffolded_files"]
        run_archive.update_summary(scaffolded_files=len(install_payload["scaffolded_files"]))

    @pytest.mark.usecase_id("sandbox_install")
    def test_runtime_source_keeps_emit_as_only_write_boundary_and_removes_drift_names(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)

        source_root = Path(__file__).resolve().parents[2] / "code" / "genesis"
        append_offenders: list[str] = []
        drift_offenders: list[str] = []
        forbidden_terms = (
            "bad" + "_output",
            "auto_fp_dispatch_" + "handled",
            "auto_fp_dispatch_" + "available",
            "auto_fh_approve_" + "available",
        )

        for path in sorted(source_root.glob("*.py")):
            text = path.read_text(encoding="utf-8")
            if path.name != "events.py":
                for lineno, line in enumerate(text.splitlines(), 1):
                    if "runtime.stream.append(" in line or "stream.append(" in line:
                        append_offenders.append(f"{path.name}:{lineno}:{line.strip()}")
            for term in forbidden_terms:
                if term in text:
                    drift_offenders.append(f"{path.name}:{term}")

        assert append_offenders == [], append_offenders
        assert drift_offenders == [], drift_offenders

    @pytest.mark.usecase_id("sandbox_install")
    def test_installed_runtime_can_execute_emit_event_from_workspace(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)

        emitted = run_installed_genesis(
            workspace,
            "emit-event",
            "--type",
            "approved",
            "--data",
            json.dumps({"kind": "fh_review", "edge": "design→code", "actor": "tester"}),
            archive=run_archive,
            label="installed genesis emit-event",
        )

        assert emitted.returncode == 0, emitted.stderr
        payload = json.loads(emitted.stdout)
        assert payload["status"] == "ok"
        assert payload["event_type"] == "approved"

        events_path = workspace / ".ai-workspace" / "events" / "events.jsonl"
        events = [
            json.loads(line)
            for line in events_path.read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]
        assert events[-1]["event_type"] == "approved"
        assert events[-1]["data"]["kind"] == "fh_review"
        assert events[-1]["data"]["workflow_version"] == f"abiogenesis.standard@{GENESIS_VERSION}"
        run_archive.update_summary(installed_runtime_event_count=len(events))

    @pytest.mark.usecase_id("sandbox_install")
    def test_workspace_bootstrap_creates_runtime_directories(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        stream = workspace_bootstrap(workspace)
        run_archive.note("scenario", lane="install", operation="workspace_bootstrap")

        assert isinstance(stream, EventStream)
        assert (workspace / ".ai-workspace" / "events" / "events.jsonl").is_file()
        assert (workspace / ".ai-workspace" / "features" / "active").is_dir()
        assert (workspace / ".ai-workspace" / "features" / "completed").is_dir()
        assert (workspace / ".ai-workspace" / "context").is_dir()
        assert (workspace / ".ai-workspace" / "reviews" / "pending").is_dir()
        assert (workspace / ".ai-workspace" / "comments" / "claude").is_dir()
        active_workflow = json.loads(
            (workspace / ".ai-workspace" / "runtime" / "active-workflow.json").read_text(encoding="utf-8")
        )
        assert active_workflow["workflow"] == "abiogenesis.standard"
        assert active_workflow["version"] == GENESIS_VERSION
        assert any(event["event_type"] == "genesis_installed" for event in stream.all_events())
        run_archive.update_summary(operation="workspace_bootstrap", event_stream_bound=True)

    @pytest.mark.usecase_id("sandbox_install")
    def test_workspace_bootstrap_is_idempotent(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        stream1 = workspace_bootstrap(workspace)
        stream2 = workspace_bootstrap(workspace)

        assert stream1.path == stream2.path
        events = stream2.all_events()
        assert len(events) == 1
        assert events[0]["event_type"] == "genesis_installed"
        run_archive.update_summary(operation="workspace_bootstrap_idempotent", event_count=0)

    @pytest.mark.usecase_id("sandbox_install")
    def test_emit_writes_through_bound_stream(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        stream = workspace_bootstrap(workspace)

        emit("approved", {"kind": "fh_review", "edge": "design→code", "actor": "tester"})

        events = stream.all_events()
        assert len(events) == 2
        assert events[0]["event_type"] == "genesis_installed"
        assert events[1]["event_type"] == "approved"
        assert events[1]["data"]["kind"] == "fh_review"
        assert events[1]["data"]["edge"] == "design→code"
        run_archive.update_summary(operation="emit", total_events=len(events))

    @pytest.mark.usecase_id("sandbox_install")
    def test_installed_cli_preserves_router_and_selected_execution_identity(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        (workspace / "demo_runtime.py").write_text(_router_dispatch_module_source(), encoding="utf-8")
        (workspace / ".genesis" / "genesis.yml").write_text(
            "runtime_contract: runtime.yml\n",
            encoding="utf-8",
        )
        (workspace / "runtime.yml").write_text(
            "\n".join(
                (
                    "module: demo_runtime:module",
                    "worker: demo_runtime:worker",
                    "runtime_build: abiogenesis_python_router",
                    "runtime_worker_id: codex",
                    "runtime_backend: codex",
                    "runtime_authority_ref: runtime://role-dispatch",
                    "runtime_assignment_source: runtime://session-override/constructor",
                    "runtime_resolved_runtime_ref: runtime://resolved/constructor/codex",
                )
            )
            + "\n",
            encoding="utf-8",
        )

        iterate = run_installed_genesis(
            workspace,
            "iterate",
            archive=run_archive,
            label="installed genesis iterate router-dispatch",
        )
        assert iterate.returncode == 0, iterate.stderr
        iterate_payload = json.loads(iterate.stdout)
        assert iterate_payload["status"] == "iterated"
        assert iterate_payload["blocking_reason"] == "fp_dispatch"
        manifest = json.loads(Path(iterate_payload["fp_manifest_path"]).read_text(encoding="utf-8"))
        result_path = Path(manifest["result_path"])
        result_path.write_text(
            json.dumps(
                _fp_result_payload(
                    "design→code",
                    actor="live_fp_judge",
                    fulfillment_detail="router-dispatched execution completed successfully",
                    extra={
                        "worker_id": "codex",
                        "backend_id": "codex",
                        "role_id": manifest["role_id"],
                        "assignment_source": "runtime://session-override/constructor",
                        "resolved_runtime_ref": "runtime://resolved/constructor/codex",
                    },
                )
            ),
            encoding="utf-8",
        )

        assessed = run_installed_genesis(
            workspace,
            "assess-result",
            "--result",
            str(result_path),
            archive=run_archive,
            label="installed genesis assess-result router-dispatch",
        )
        assert assessed.returncode == 0, assessed.stderr

        events = [
            json.loads(line)
            for line in (workspace / ".ai-workspace" / "events" / "events.jsonl").read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]
        provenance_events = {
            event["event_type"]: event["data"]
            for event in events
            if event["event_type"] in {"run_bound", "run_started", "vector_started", "fp_dispatched", "assessed"}
        }
        assert set(provenance_events) == {"run_bound", "run_started", "vector_started", "fp_dispatched", "assessed"}

        for event_type in ("run_bound", "run_started", "vector_started", "fp_dispatched", "assessed"):
            data = provenance_events[event_type]
            assert data["role_id"] == manifest["role_id"]
            assert data["selected_worker_id"] == "codex"
            assert data["selected_backend"] == "codex"
            assert data["assignment_source"] == "runtime://session-override/constructor"
            assert data["resolved_runtime_ref"] == "runtime://resolved/constructor/codex"

        assert provenance_events["run_bound"]["worker_id"] == "abiogenesis_python_router"
        assert provenance_events["run_bound"]["authority_ref"] == "runtime://role-dispatch"
        assert provenance_events["vector_started"]["worker_id"] == "abiogenesis_python_router"
        assert provenance_events["vector_started"]["build"] == "abiogenesis_python_router"
        assert provenance_events["assessed"]["actor"] == "live_fp_judge"
        run_archive.update_summary(
            selected_worker="codex",
            selected_backend="codex",
            router_worker="abiogenesis_python_router",
            provenance_event_types=sorted(provenance_events),
        )

    @pytest.mark.usecase_id("sandbox_install")
    def test_installed_start_graph_function_target_drives_selected_manifest_and_event_chain(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        (workspace / "demo_runtime.py").write_text(_multi_target_router_module_source(), encoding="utf-8")
        _write_runtime_contract(workspace)

        started = run_installed_genesis(
            workspace,
            "start",
            "--scope",
            "workspace",
            "--target",
            "graph_function:code-flow",
            "--until",
            "first_traversal",
            archive=run_archive,
            label="installed genesis start graph_function target",
        )
        assert started.returncode == 0, started.stderr
        started_payload = json.loads(started.stdout)
        assert started_payload["target"] == "graph_function:code-flow"
        assert started_payload["edge"] == "design→code"
        assert started_payload["stop_predicate"] == "dispatch_required"

        manifest = json.loads(Path(started_payload["fp_manifest_path"]).read_text(encoding="utf-8"))
        assert manifest["edge"] == "design→code"

        result_path = Path(manifest["result_path"])
        result_path.write_text(
            json.dumps(
                _fp_result_payload(
                    manifest["edge"],
                    actor="graph_function_target_tester",
                    obligation_id="code_complete",
                    fulfillment_detail="graph-function targeted chain completed",
                )
            ),
            encoding="utf-8",
        )
        assessed = run_installed_genesis(
            workspace,
            "assess-result",
            "--result",
            str(result_path),
            archive=run_archive,
            label="installed genesis assess-result graph_function target",
        )
        assert assessed.returncode == 0, assessed.stderr

        events = [
            json.loads(line)
            for line in (workspace / ".ai-workspace" / "events" / "events.jsonl").read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]
        dispatched_edges = [event["data"].get("edge") for event in events if event["event_type"] == "fp_dispatched"]
        assessed_edges = [event["data"].get("edge") for event in events if event["event_type"] == "assessed"]
        assert "design→code" in dispatched_edges
        assert "design→review" not in dispatched_edges
        assert "design→code" in assessed_edges
        assert "design→review" not in assessed_edges

    @pytest.mark.usecase_id("sandbox_install")
    def test_installed_start_asset_target_drives_selected_manifest_and_event_chain(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        (workspace / "demo_runtime.py").write_text(_multi_target_router_module_source(), encoding="utf-8")
        asset_command = _write_operator_asset_registry_script(
            workspace,
            {
                "assets": [
                    {
                        "asset_id": "code_surface",
                        "uri": "file://build/code",
                        "metadata": {"relative_path": "build/code.py"},
                        "checkpoint": {"path_kind": "file", "exists": True},
                        "operator_target": {"kind": "graph_function", "handle": "code-flow"},
                    }
                ]
            },
        )
        _write_runtime_contract(
            workspace,
            f'operator_asset_contract: {json.dumps({"command": asset_command})}',
        )

        started = run_installed_genesis(
            workspace,
            "start",
            "--scope",
            "workspace",
            "--target",
            "asset:code_surface",
            "--until",
            "first_traversal",
            archive=run_archive,
            label="installed genesis start asset target",
        )
        assert started.returncode == 0, started.stderr
        started_payload = json.loads(started.stdout)
        assert started_payload["target"] == "asset:code_surface"
        assert started_payload["asset_id"] == "code_surface"
        assert started_payload["edge"] == "design→code"
        assert started_payload["stop_predicate"] == "dispatch_required"

        manifest = json.loads(Path(started_payload["fp_manifest_path"]).read_text(encoding="utf-8"))
        assert manifest["edge"] == "design→code"

        result_path = Path(manifest["result_path"])
        result_path.write_text(
            json.dumps(
                _fp_result_payload(
                    manifest["edge"],
                    actor="asset_target_tester",
                    obligation_id="code_complete",
                    fulfillment_detail="asset-targeted chain completed",
                )
            ),
            encoding="utf-8",
        )
        assessed = run_installed_genesis(
            workspace,
            "assess-result",
            "--result",
            str(result_path),
            archive=run_archive,
            label="installed genesis assess-result asset target",
        )
        assert assessed.returncode == 0, assessed.stderr

        events = [
            json.loads(line)
            for line in (workspace / ".ai-workspace" / "events" / "events.jsonl").read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]
        dispatched_edges = [event["data"].get("edge") for event in events if event["event_type"] == "fp_dispatched"]
        assessed_edges = [event["data"].get("edge") for event in events if event["event_type"] == "assessed"]
        assert "design→code" in dispatched_edges
        assert "design→review" not in dispatched_edges
        assert "design→code" in assessed_edges
        assert "design→review" not in assessed_edges

    @pytest.mark.usecase_id("sandbox_install")
    def test_installed_start_root_mode_supervised_converges_over_deterministic_chain(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        (workspace / "demo_runtime.py").write_text(_deterministic_runtime_module_source(), encoding="utf-8")
        _write_runtime_contract(workspace)

        started = run_installed_genesis(
            workspace,
            "start",
            "--scope",
            "workspace",
            "--target",
            "next",
            "--until",
            "converged",
            "--root-mode",
            "supervised",
            archive=run_archive,
            label="installed genesis start root-mode supervised",
        )
        assert started.returncode == 0, started.stderr
        payload = json.loads(started.stdout)
        assert payload["status"] in {"converged", "nothing_to_do"}
        assert payload["root_mode"] == "supervised"
        assert payload["root_supervision"] is True
        assert isinstance(payload.get("live_status"), dict)
        assert payload["live_status"]["asset_type"] == "run_status"
        assert payload["live_status"]["event_count"] == 0

    @pytest.mark.usecase_id("sandbox_install")
    def test_installed_runtime_reset_audit_supersedes_active_run_post_mortem(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        (workspace / "demo_runtime.py").write_text(_router_dispatch_module_source(), encoding="utf-8")
        (workspace / ".genesis" / "genesis.yml").write_text(
            "runtime_contract: runtime.yml\n",
            encoding="utf-8",
        )
        (workspace / "runtime.yml").write_text(
            "\n".join(
                (
                    "module: demo_runtime:module",
                    "worker: demo_runtime:worker",
                    "runtime_build: abiogenesis_python_router",
                    "runtime_worker_id: codex",
                    "runtime_backend: codex",
                    "runtime_authority_ref: runtime://role-dispatch",
                    "runtime_assignment_source: runtime://session-override/constructor",
                    "runtime_resolved_runtime_ref: runtime://resolved/constructor/codex",
                )
            )
            + "\n",
            encoding="utf-8",
        )

        iterate = run_installed_genesis(
            workspace,
            "iterate",
            archive=run_archive,
            label="installed genesis iterate reset-audit",
        )
        assert iterate.returncode == 0, iterate.stderr
        iterate_payload = json.loads(iterate.stdout)
        manifest = json.loads(Path(iterate_payload["fp_manifest_path"]).read_text(encoding="utf-8"))
        reset = run_installed_genesis(
            workspace,
            "emit-event",
            "--type",
            "reset",
            "--data",
            json.dumps(
                {
                    "scope": "workspace",
                    "actor": "tester",
                    "reason": "restart corrected execution",
                }
            ),
            archive=run_archive,
            label="installed genesis reset active run",
        )
        assert reset.returncode == 0, reset.stderr

        stream = EventStream.open(workspace)
        events = stream.all_events()
        event_types = [event["event_type"] for event in events]
        assert event_types[-2:] == ["reset", "run_superseded"]

        superseded = events[-1]
        assert superseded["event_type"] == "run_superseded"
        assert superseded["data"]["superseded_run_id"] == manifest["run_id"]
        assert superseded["data"]["superseded_by"].startswith("reset:")

        run_projection = project(stream, "run", manifest["run_id"])
        assert run_projection["status"] == "superseded"
        run_archive.update_summary(
            reset_run_id=manifest["run_id"],
            reset_terminal_event=superseded["event_type"],
            reset_terminal_status=run_projection["status"],
        )

    @pytest.mark.usecase_id("sandbox_install")
    def test_installed_runtime_reset_audit_supersedes_open_continuation_post_mortem(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        (workspace / "demo_runtime.py").write_text(_router_dispatch_module_source(), encoding="utf-8")
        (workspace / ".genesis" / "genesis.yml").write_text(
            "runtime_contract: runtime.yml\n",
            encoding="utf-8",
        )
        (workspace / "runtime.yml").write_text(
            "\n".join(
                (
                    "module: demo_runtime:module",
                    "worker: demo_runtime:worker",
                    "runtime_build: abiogenesis_python_router",
                    "runtime_worker_id: codex",
                    "runtime_backend: codex",
                    "runtime_authority_ref: runtime://role-dispatch",
                )
            )
            + "\n",
            encoding="utf-8",
        )

        iterate = run_installed_genesis(
            workspace,
            "iterate",
            archive=run_archive,
            label="installed genesis iterate continuation-audit",
        )
        assert iterate.returncode == 0, iterate.stderr
        iterate_payload = json.loads(iterate.stdout)
        manifest = json.loads(Path(iterate_payload["fp_manifest_path"]).read_text(encoding="utf-8"))
        result_path = Path(manifest["result_path"])
        result_path.write_text(
            json.dumps(
                _fp_result_payload(
                    manifest["edge"],
                    actor="live_fp_judge",
                    fulfillment_status="unfulfilled",
                    fulfillment_detail="returned code does not satisfy the contract",
                )
            ),
            encoding="utf-8",
        )

        assessed = run_installed_genesis(
            workspace,
            "assess-result",
            "--result",
            str(result_path),
            archive=run_archive,
            label="installed genesis assess-result continuation-audit",
        )
        assert assessed.returncode == 0, assessed.stderr

        pre_reset_events = EventStream.open(workspace).all_events()
        continuation_id = next(
            event["data"]["continuation_id"]
            for event in reversed(pre_reset_events)
            if event["event_type"] == "continuation_opened"
        )

        reset = run_installed_genesis(
            workspace,
            "emit-event",
            "--type",
            "reset",
            "--data",
            json.dumps(
                {
                    "scope": "workspace",
                    "actor": "tester",
                    "reason": "discard stale repair obligation",
                }
            ),
            archive=run_archive,
            label="installed genesis reset continuation-audit",
        )
        assert reset.returncode == 0, reset.stderr

        stream = EventStream.open(workspace)
        events = stream.all_events()
        event_types = [event["event_type"] for event in events]
        assert event_types[-3:] == ["reset", "continuation_superseded", "run_superseded"]
        assert events[-2]["data"]["continuation_id"] == continuation_id

        continuation_projection = project(stream, "continuation", continuation_id)
        assert continuation_projection["status"] == "superseded"
        run_archive.update_summary(
            superseded_continuation_id=continuation_id,
            continuation_terminal_event=events[-2]["event_type"],
            continuation_terminal_status=continuation_projection["status"],
        )
