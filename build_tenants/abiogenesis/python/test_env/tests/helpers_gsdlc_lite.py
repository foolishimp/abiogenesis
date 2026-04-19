# Implements: REQ-P-SCENARIOS
# Validates: REQ-P-SCENARIOS
from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
import textwrap
from pathlib import Path

from gtl.algebra import deferred_refinement, graph_function_for_vector
from gtl.function_model import EnvRef, GraphFunction
from gtl.graph import Context, Graph, Node
from gtl.module_model import Module
from gtl.operator_model import Evaluator, Operator, F_D, F_P
from gtl.work_model import ContractRef, Job, Role
from tests.helpers_obligation_ledger import declared_test_graph_vector as GraphVector


REQ_TO_DESIGN_EDGE = "requirements→design"
DESIGN_TO_REVIEW_EDGE = "design→design_review"
REVIEW_TO_CODE_EDGE = "design_review→code"
DESIGN_TO_CODE_EDGE = "design→code"
REQ_TO_DECOMPOSITION_EDGE = "requirements→decomposition"
DECOMPOSITION_TO_DEPENDENCY_EDGE = "decomposition→dependency_chain"
DEPENDENCY_TO_SEQUENCING_EDGE = "dependency_chain→sequencing"
SEQUENCING_TO_DESIGN_EDGE = "sequencing→design"
DESIGN_ARTIFACT_PATH = Path("output/design.md")
DESIGN_REVIEW_ARTIFACT_PATH = Path("output/design_review.md")
CODE_ARTIFACT_PATH = Path("output/project_service.py")
DECOMPOSITION_ARTIFACT_PATH = Path("output/decomposition.md")
DEPENDENCY_CHAIN_ARTIFACT_PATH = Path("output/dependency_chain.md")
SEQUENCING_ARTIFACT_PATH = Path("output/sequencing.md")
MODULE_REQUIREMENTS = ("REQ-GSDLCLITE-001", "REQ-GSDLCLITE-002", "REQ-GSDLCLITE-003")
ZOOM_REQUIREMENTS = ("REQ-GSDLCLITE-ZOOM-001",)
PENDING_DIGEST = "sha256:" + ("0" * 64)


def sha256(text: str) -> str:
    return "sha256:" + hashlib.sha256(text.encode("utf-8")).hexdigest()


def design_checker_script() -> str:
    return textwrap.dedent(
        """\
        from __future__ import annotations

        import json
        import re
        import sys
        from pathlib import Path


        def _extract_requirement_ids(text: str) -> list[str]:
            return sorted(set(re.findall(r"^# (REQ-[A-Z0-9-]+)\\b", text, re.MULTILINE)))


        def main() -> int:
            if len(sys.argv) != 3:
                print("usage: check_design_standard.py <requirements.md> <design.md>", file=sys.stderr)
                return 2

            requirements = Path(sys.argv[1])
            design = Path(sys.argv[2])
            if not requirements.exists():
                print("requirements artifact missing", file=sys.stderr)
                return 1
            if not design.exists():
                print("design artifact missing", file=sys.stderr)
                return 1

            requirements_text = requirements.read_text(encoding="utf-8")
            design_text = design.read_text(encoding="utf-8")
            requirement_ids = _extract_requirement_ids(requirements_text)
            if not requirement_ids:
                print("no requirement family ids found", file=sys.stderr)
                return 1

            missing = [req for req in requirement_ids if req not in design_text]
            if missing:
                print(f"design missing requirement traceability: {missing}", file=sys.stderr)
                return 1

            for header in (
                "## Components",
                "## Interfaces",
                "## Decomposition",
                "## Dependency Chain",
                "## Sequencing",
                "## Traceability",
            ):
                if header not in design_text:
                    print(f"design missing header {header}", file=sys.stderr)
                    return 1

            comp_start = design_text.find("## Components")
            comp_end = design_text.find("\\n## ", comp_start + 1)
            comp_section = design_text[comp_start:] if comp_end == -1 else design_text[comp_start:comp_end]
            component_count = len(re.findall(r"^- \\*\\*\\w", comp_section, re.MULTILINE))
            if component_count < 2:
                print("design must declare at least two components", file=sys.stderr)
                return 1

            decomposition_steps = re.findall(r"^\\d+\\.\\s+.+", design_text, re.MULTILINE)
            if len(decomposition_steps) < 3:
                print("design must declare at least three decomposition/sequencing steps", file=sys.stderr)
                return 1

            if "create_project" not in design_text or "archive_project" not in design_text or "search_projects" not in design_text:
                print("design must declare create_project, archive_project, and search_projects interfaces", file=sys.stderr)
                return 1

            if "ProjectService -> ProjectStore" not in design_text:
                print("design must declare the ProjectService -> ProjectStore dependency chain", file=sys.stderr)
                return 1

            print(json.dumps({
                "requirements": requirement_ids,
                "component_count": component_count,
                "decomposition_step_count": len(decomposition_steps),
                "status": "design standard satisfied",
            }))
            return 0


        if __name__ == "__main__":
            raise SystemExit(main())
        """
    )


def code_checker_script() -> str:
    return textwrap.dedent(
        """\
        from __future__ import annotations

        import json
        import re
        import sys
        from pathlib import Path


        def main() -> int:
            if len(sys.argv) != 3:
                print("usage: check_code_standard.py <design.md> <project_service.py>", file=sys.stderr)
                return 2

            design = Path(sys.argv[1])
            code = Path(sys.argv[2])
            if not design.exists():
                print("design artifact missing", file=sys.stderr)
                return 1
            if not code.exists():
                print("code artifact missing", file=sys.stderr)
                return 1

            design_text = design.read_text(encoding="utf-8")
            code_text = code.read_text(encoding="utf-8")

            if "ProjectService" not in design_text:
                print("design missing ProjectService component", file=sys.stderr)
                return 1

            required_symbols = (
                "class ProjectService",
                "def create_project(",
                "def archive_project(",
                "def search_projects(",
            )
            missing = [symbol for symbol in required_symbols if symbol not in code_text]
            if missing:
                print(f"code missing required symbols: {missing}", file=sys.stderr)
                return 1

            if re.search(r"\\bTODO\\b|\\bplaceholder\\b", code_text, re.IGNORECASE):
                print("code contains placeholder markers", file=sys.stderr)
                return 1

            if re.search(r"^\\s*pass\\s*$", code_text, re.MULTILINE):
                print("code contains pass statements", file=sys.stderr)
                return 1

            print(json.dumps({
                "symbols": [symbol.replace('class ', '').replace('def ', '').replace('(', '') for symbol in required_symbols],
                "status": "code standard satisfied",
            }))
            return 0


        if __name__ == "__main__":
            raise SystemExit(main())
        """
    )


def design_review_checker_script() -> str:
    return textwrap.dedent(
        """\
        from __future__ import annotations

        import json
        import re
        import sys
        from pathlib import Path


        def _extract_requirement_ids(text: str) -> list[str]:
            return sorted(set(re.findall(r"^# (REQ-[A-Z0-9-]+)\\b", text, re.MULTILINE)))


        def main() -> int:
            if len(sys.argv) != 3:
                print("usage: check_design_review_standard.py <requirements.md> <design_review.md>", file=sys.stderr)
                return 2

            requirements = Path(sys.argv[1])
            review = Path(sys.argv[2])
            if not requirements.exists():
                print("requirements artifact missing", file=sys.stderr)
                return 1
            if not review.exists():
                print("design review artifact missing", file=sys.stderr)
                return 1

            requirement_ids = _extract_requirement_ids(requirements.read_text(encoding="utf-8"))
            review_text = review.read_text(encoding="utf-8")
            if not requirement_ids:
                print("no requirement family ids found", file=sys.stderr)
                return 1

            for header in (
                "## Architecture Review",
                "## Traceability Review",
                "## Sequencing Review",
                "## Overall Decision",
            ):
                if header not in review_text:
                    print(f"design review missing header {header}", file=sys.stderr)
                    return 1

            missing = [req for req in requirement_ids if req not in review_text]
            if missing:
                print(f"design review missing requirement traceability: {missing}", file=sys.stderr)
                return 1

            if "approved" not in review_text.lower():
                print("design review must state an approval decision", file=sys.stderr)
                return 1

            print(json.dumps({
                "requirements": requirement_ids,
                "status": "design review standard satisfied",
            }))
            return 0


        if __name__ == "__main__":
            raise SystemExit(main())
        """
    )


def design_artifact() -> str:
    return textwrap.dedent(
        """\
        # Design — Project Lifecycle Service

        ## Components

        - **ProjectService** — owns project creation, archival, and search orchestration. Enforces owner assignment and read-only behavior for archived projects.
        - **ProjectStore** — persists project records and archived status. Supports read-only retrieval for archived projects.

        ## Interfaces

        - create_project(name, owner) -> project record
        - archive_project(project_id) -> archived project record
        - search_projects(query) -> matching project summaries

        ## Decomposition

        1. Establish the ProjectService surface for creation, archival, and search behavior.
        2. Isolate persistence concerns in ProjectStore so service logic stays focused on workflow rules.
        3. Define validation and read-only rules before implementation so code sequencing follows the design.

        ## Dependency Chain

        - ProjectService -> ProjectStore
        - ProjectService -> validation rules for owner assignment
        - ProjectService -> archived read-only policy

        ## Sequencing

        1. Implement ProjectStore and record shape.
        2. Implement ProjectService.create_project with owner validation.
        3. Implement ProjectService.archive_project and ProjectService.search_projects against the store.

        ## Traceability

        - REQ-PROJ-001 is realized through ProjectService.create_project and owner assignment validation.
        - REQ-PROJ-002 is realized through ProjectService.archive_project and ProjectService.search_projects.
        """
    )


def code_artifact() -> str:
    return textwrap.dedent(
        """\
        from __future__ import annotations

        from dataclasses import dataclass


        @dataclass
        class ProjectRecord:
            project_id: str
            name: str
            owner: str | None
            archived: bool = False


        class ProjectService:
            def __init__(self) -> None:
                self._projects: dict[str, ProjectRecord] = {}
                self._next_id = 1

            def create_project(self, name: str, owner: str | None) -> ProjectRecord:
                if not name.strip():
                    raise ValueError("project name is required")
                if owner is None or not owner.strip():
                    raise ValueError("owner is required")
                record = ProjectRecord(
                    project_id=str(self._next_id),
                    name=name.strip(),
                    owner=owner.strip(),
                )
                self._projects[record.project_id] = record
                self._next_id += 1
                return record

            def archive_project(self, project_id: str) -> ProjectRecord:
                record = self._projects[project_id]
                record.archived = True
                return record

            def search_projects(self, query: str) -> list[ProjectRecord]:
                query_lc = query.lower()
                return [
                    record
                    for record in self._projects.values()
                    if query_lc in record.name.lower()
                ]
        """
    )


def design_review_artifact() -> str:
    return textwrap.dedent(
        """\
        # Design Review — Project Lifecycle Service

        ## Architecture Review

        - Approved: ProjectService and ProjectStore remain clearly separated.
        - Approved: create_project, archive_project, and search_projects stay on the service boundary.

        ## Traceability Review

        - REQ-PROJ-001 is covered by owner validation and project creation flow.
        - REQ-PROJ-002 is covered by archived searchability and read-only handling.

        ## Sequencing Review

        - Approved: ProjectStore lands first, then creation flow, then archival and search behavior.
        - Approved: sequencing is explicit and implementation-ready.

        ## Overall Decision

        - Approved for implementation.
        """
    )


def decomposition_artifact() -> str:
    return textwrap.dedent(
        """\
        # Decomposition Plan

        1. Create the ProjectService orchestration slice.
        2. Establish the ProjectStore persistence slice.
        3. Separate validation and archived read-only policy as supporting slices.
        """
    )


def dependency_chain_artifact() -> str:
    return textwrap.dedent(
        """\
        # Dependency Chain

        - ProjectService -> ProjectStore
        - ProjectService -> owner validation
        - ProjectService -> archived read-only policy
        """
    )


def sequencing_artifact() -> str:
    return textwrap.dedent(
        """\
        # Sequencing Plan

        1. Implement ProjectStore primitives.
        2. Implement ProjectService.create_project with owner validation.
        3. Implement archive and search behavior with read-only archived handling.
        """
    )


def judge_design_quality(artifact: Path) -> list[dict]:
    content = artifact.read_text(encoding="utf-8")
    failures: list[str] = []

    for header in ("## Components", "## Interfaces", "## Decomposition", "## Dependency Chain", "## Sequencing"):
        if header not in content:
            failures.append(f"design missing {header} section")

    comp_start = content.find("## Components")
    comp_end = content.find("\n## ", comp_start + 1)
    comp_section = content[comp_start:] if comp_end == -1 else content[comp_start:comp_end]
    if len(re.findall(r"^- \*\*\w", comp_section, re.MULTILINE)) < 2:
        failures.append("design does not declare multiple components")

    if "ProjectService -> ProjectStore" not in content:
        failures.append("design does not declare a ProjectService -> ProjectStore dependency chain")

    sequencing_steps = re.findall(r"^\d+\.\s+.+", content, re.MULTILINE)
    if len(sequencing_steps) < 3:
        failures.append("design does not express a multi-step sequencing plan")

    if re.search(r"^\s*(from|import|class|def)\b", content, re.MULTILINE):
        failures.append("design leaks code-level syntax")

    if re.search(r"\b(todo|tbd|placeholder)\b", content, re.IGNORECASE):
        failures.append("design contains placeholder language")

    if failures:
        return [{
            "evaluator": "design_quality",
            "result": "fail",
            "evidence": "; ".join(failures),
        }]

    return [{
        "evaluator": "design_quality",
        "result": "pass",
        "evidence": "design defines components, interfaces, and traceability without collapsing into code",
    }]


def judge_code_quality(artifact: Path) -> list[dict]:
    content = artifact.read_text(encoding="utf-8")
    failures: list[str] = []

    for symbol in ("create_project", "archive_project", "search_projects"):
        if symbol not in content:
            failures.append(f"code does not implement {symbol}")

    if re.search(r"\b(todo|tbd|placeholder)\b", content, re.IGNORECASE):
        failures.append("code contains placeholder language")

    if re.search(r"^\s*pass\s*$", content, re.MULTILINE):
        failures.append("code contains pass statements")

    if "raise NotImplementedError" in content:
        failures.append("code contains NotImplementedError stubs")

    if failures:
        return [{
            "evaluator": "code_quality",
            "result": "fail",
            "evidence": "; ".join(failures),
        }]

    return [{
        "evaluator": "code_quality",
        "result": "pass",
        "evidence": "code implements the designed service surface without placeholder stubs",
    }]


def judge_design_review_quality(artifact: Path) -> list[dict]:
    content = artifact.read_text(encoding="utf-8")

    def _outcome(name: str, ok: bool, evidence: str) -> dict:
        return {
            "evaluator": name,
            "result": "pass" if ok else "fail",
            "evidence": evidence,
        }

    architecture_ok = (
        "## Architecture Review" in content
        and "ProjectService" in content
        and "ProjectStore" in content
    )
    traceability_ok = (
        "## Traceability Review" in content
        and "REQ-PROJ-001" in content
        and "REQ-PROJ-002" in content
    )
    sequencing_ok = (
        "## Sequencing Review" in content
        and (
            "approved" in content.lower()
            or bool(re.search(r"^\d+\.\s+.+", content, re.MULTILINE))
            or "implementation sequence" in content.lower()
        )
    )

    return (
        _outcome(
            "design_review_architecture",
            architecture_ok,
            "architecture review confirms component and boundary coherence"
            if architecture_ok else
            "architecture review section is incomplete or missing component references",
        ),
        _outcome(
            "design_review_traceability",
            traceability_ok,
            "traceability review confirms requirement coverage"
            if traceability_ok else
            "traceability review section is incomplete or missing requirement ids",
        ),
        _outcome(
            "design_review_sequencing",
            sequencing_ok,
            "sequencing review confirms implementation order is explicit"
            if sequencing_ok else
            "sequencing review section is incomplete or lacks explicit ordering",
        ),
    )


def to_fulfillment_assessments(assessments: list[dict]) -> list[dict]:
    return [
        {
            "id": assessment["evaluator"],
            "fulfillment_status": "fulfilled" if assessment["result"] == "pass" else "unfulfilled",
            "fulfillment_detail": assessment.get("evidence", ""),
            "blocking_reasons": (
                [assessment.get("evidence", "")]
                if assessment["result"] == "fail" and assessment.get("evidence")
                else []
            ),
            "evidence_refs": (
                [assessment.get("evidence", "")]
                if assessment["result"] == "pass" and assessment.get("evidence")
                else []
            ),
        }
        for assessment in assessments
    ]


def write_result_file(
    result_path: Path,
    *,
    edge: str,
    actor: str,
    fulfillment_assessments: list[dict],
) -> None:
    result_path.parent.mkdir(parents=True, exist_ok=True)
    result_path.write_text(
        json.dumps(
            {
                "edge": edge,
                "actor": actor,
                "fulfillment_assessments": fulfillment_assessments,
            },
            indent=2,
        ),
        encoding="utf-8",
    )


def run_design_standard_check(workspace: Path) -> subprocess.CompletedProcess[str]:
    checker = workspace / "checks" / "check_design_standard.py"
    requirements = workspace / "docs" / "requirements.md"
    artifact = workspace / DESIGN_ARTIFACT_PATH
    return subprocess.run(
        [sys.executable, str(checker), str(requirements), str(artifact)],
        cwd=str(workspace),
        capture_output=True,
        text=True,
        timeout=30,
    )


def run_code_standard_check(workspace: Path) -> subprocess.CompletedProcess[str]:
    checker = workspace / "checks" / "check_code_standard.py"
    design = workspace / DESIGN_ARTIFACT_PATH
    artifact = workspace / CODE_ARTIFACT_PATH
    return subprocess.run(
        [sys.executable, str(checker), str(design), str(artifact)],
        cwd=str(workspace),
        capture_output=True,
        text=True,
        timeout=30,
    )


def run_design_review_standard_check(workspace: Path) -> subprocess.CompletedProcess[str]:
    checker = workspace / "checks" / "check_design_review_standard.py"
    requirements = workspace / "docs" / "requirements.md"
    artifact = workspace / DESIGN_REVIEW_ARTIFACT_PATH
    return subprocess.run(
        [sys.executable, str(checker), str(requirements), str(artifact)],
        cwd=str(workspace),
        capture_output=True,
        text=True,
        timeout=30,
    )


def write_gsdlc_lite_workspace(
    workspace: Path,
    *,
    design_placeholder: str = "# placeholder\n",
    review_placeholder: str = "# placeholder\n",
    code_placeholder: str = "# placeholder\n",
) -> dict[str, str]:
    docs = workspace / "docs"
    docs.mkdir(parents=True, exist_ok=True)
    output = workspace / "output"
    output.mkdir(parents=True, exist_ok=True)
    checks = workspace / "checks"
    checks.mkdir(parents=True, exist_ok=True)

    requirements_text = textwrap.dedent(
        """\
        # REQ-PROJ-001 — Project Creation and Ownership

        **Status**: Draft
        **Category**: Capability
        **Date**: 2026-03-27
        **Derives from**: scenario-gsdlc-lite

        ## Acceptance Criteria

        **REQ-PROJ-001-001**: The system shall allow a user to create and save a project.
        **REQ-PROJ-001-002**: The system shall require an owner to be assigned during project creation.

        # REQ-PROJ-002 — Archived Project Discovery

        **Status**: Draft
        **Category**: Capability
        **Date**: 2026-03-27
        **Derives from**: scenario-gsdlc-lite

        ## Acceptance Criteria

        **REQ-PROJ-002-001**: Archived projects shall remain searchable.
        **REQ-PROJ-002-002**: Archived projects shall open in read-only mode.
        """
    )
    design_standard_text = textwrap.dedent(
        """\
        # Design Standard

        - The design artifact must include Components, Interfaces, and Traceability sections.
        - The design artifact must include Decomposition, Dependency Chain, and Sequencing sections.
        - Every REQ family id from docs/requirements.md must appear in the Traceability section.
        - The design must declare at least two components.
        - The design must declare create_project, archive_project, and search_projects interfaces.
        - The design must declare a ProjectService -> ProjectStore dependency chain.
        - The design must express at least three ordered decomposition/sequencing steps.
        - The design remains implementation-light and should not collapse into code syntax.
        """
    )
    code_standard_text = textwrap.dedent(
        """\
        # Code Standard

        - The code artifact must implement the designed ProjectService surface.
        - The code artifact must define create_project, archive_project, and search_projects.
        - The code artifact must not contain TODO markers, placeholders, or pass stubs.
        - The code artifact may be minimal but must be runnable Python.
        """
    )
    design_review_standard_text = textwrap.dedent(
        """\
        # Design Review Standard

        - The design review artifact must include Architecture Review, Traceability Review, Sequencing Review, and Overall Decision sections.
        - The design review artifact must reference every requirement family id from docs/requirements.md.
        - The design review artifact must state an approval decision.
        """
    )
    design_output_contract_text = textwrap.dedent(
        """\
        # Design Output Contract

        Update output/design.md.

        Requirements:
        - Include sections titled Components, Interfaces, Decomposition, Dependency Chain, Sequencing, and Traceability.
        - Declare at least two components as bullet items under ## Components: - **Name** — description
        - Include create_project, archive_project, and search_projects interfaces.
        - Declare the ProjectService -> ProjectStore dependency chain.
        - Include at least three ordered decomposition/sequencing steps.
        - Trace the design back to REQ-PROJ-001 and REQ-PROJ-002.
        - Keep the design implementation-light.
        """
    )
    design_review_output_contract_text = textwrap.dedent(
        """\
        # Design Review Output Contract

        Update output/design_review.md.

        Requirements:
        - Include sections titled Architecture Review, Traceability Review, Sequencing Review, and Overall Decision.
        - Reference REQ-PROJ-001 and REQ-PROJ-002.
        - Explicitly state whether the design is approved for implementation.
        """
    )
    code_output_contract_text = textwrap.dedent(
        """\
        # Code Output Contract

        Update output/project_service.py.

        Requirements:
        - Implement a ProjectService surface.
        - Include create_project, archive_project, and search_projects.
        - Keep the code free of TODO markers, placeholders, and pass stubs.
        - Align the code with the design in output/design.md.
        """
    )

    (docs / "requirements.md").write_text(requirements_text, encoding="utf-8")
    (docs / "design_standard.md").write_text(design_standard_text, encoding="utf-8")
    (docs / "design_review_standard.md").write_text(design_review_standard_text, encoding="utf-8")
    (docs / "code_standard.md").write_text(code_standard_text, encoding="utf-8")
    (docs / "design_output_contract.md").write_text(design_output_contract_text, encoding="utf-8")
    (docs / "design_review_output_contract.md").write_text(design_review_output_contract_text, encoding="utf-8")
    (docs / "code_output_contract.md").write_text(code_output_contract_text, encoding="utf-8")
    (checks / "check_design_standard.py").write_text(design_checker_script(), encoding="utf-8")
    (checks / "check_design_review_standard.py").write_text(design_review_checker_script(), encoding="utf-8")
    (checks / "check_code_standard.py").write_text(code_checker_script(), encoding="utf-8")
    (output / "design.md").write_text(design_placeholder, encoding="utf-8")
    (output / "design_review.md").write_text(review_placeholder, encoding="utf-8")
    (output / "project_service.py").write_text(code_placeholder, encoding="utf-8")
    (output / "decomposition.md").write_text("# placeholder\n", encoding="utf-8")
    (output / "dependency_chain.md").write_text("# placeholder\n", encoding="utf-8")
    (output / "sequencing.md").write_text("# placeholder\n", encoding="utf-8")
    return {
        "requirements": requirements_text,
        "design_standard": design_standard_text,
        "design_review_standard": design_review_standard_text,
        "code_standard": code_standard_text,
        "design_output_contract": design_output_contract_text,
        "design_review_output_contract": design_review_output_contract_text,
        "code_output_contract": code_output_contract_text,
    }


def gsdlc_lite_module(workspace: Path) -> Module:
    texts = write_gsdlc_lite_workspace(workspace)

    requirements = Node(
        name="requirements",
        schema="RequirementsDoc",
        markov=("keys_tagged", "traceable", "implementation_ready"),
    )
    design = Node(
        name="design",
        schema="DesignDoc",
        markov=("components_declared", "interfaces_declared", "traceable_to_requirements"),
    )
    code = Node(
        name="code",
        schema="CodeArtifact",
        markov=("service_surface_implemented", "basic_quality_satisfied"),
    )

    ctx_requirements = Context(
        name="requirements_source",
        locator="workspace://docs/requirements.md",
        digest=sha256(texts["requirements"]),
    )
    ctx_design_standard = Context(
        name="design_standard",
        locator="workspace://docs/design_standard.md",
        digest=sha256(texts["design_standard"]),
    )
    ctx_code_standard = Context(
        name="code_standard",
        locator="workspace://docs/code_standard.md",
        digest=sha256(texts["code_standard"]),
    )
    ctx_design_output_contract = Context(
        name="design_output_contract",
        locator="workspace://docs/design_output_contract.md",
        digest=sha256(texts["design_output_contract"]),
    )
    ctx_code_output_contract = Context(
        name="code_output_contract",
        locator="workspace://docs/code_output_contract.md",
        digest=sha256(texts["code_output_contract"]),
    )
    ctx_live_design = Context(
        name="design_artifact",
        locator="workspace://output/design.md",
        digest=PENDING_DIGEST,
    )

    req_design_fd_cmd = "exec://python checks/check_design_standard.py docs/requirements.md output/design.md"
    design_code_fd_cmd = "exec://python checks/check_code_standard.py output/design.md output/project_service.py"

    req_design_fd = Evaluator(
        "design_standard",
        F_D,
        "design artifact conforms to the declared design standard",
        binding=req_design_fd_cmd,
    )
    req_design_fp = Evaluator(
        "design_quality",
        F_P,
        "design defines coherent components and interfaces without collapsing into code",
    )
    design_code_fd = Evaluator(
        "code_standard",
        F_D,
        "code artifact conforms to the declared code standard",
        binding=design_code_fd_cmd,
    )
    design_code_fp = Evaluator(
        "code_quality",
        F_P,
        "code implements the designed service surface without placeholder stubs",
    )

    op_req_design_fd = Operator("design_standard_check", F_D, req_design_fd_cmd)
    op_req_design_fp = Operator("design_author", F_P, "agent://architecture/design")
    op_design_code_fd = Operator("code_standard_check", F_D, design_code_fd_cmd)
    op_design_code_fp = Operator("code_author", F_P, "agent://implementation/code")

    req_to_design = GraphVector(
        name=REQ_TO_DESIGN_EDGE,
        source=requirements,
        target=design,
        operators=(op_req_design_fd, op_req_design_fp),
        evaluators=(req_design_fd, req_design_fp),
        contexts=(ctx_requirements, ctx_design_standard, ctx_design_output_contract),
    )
    design_to_code = GraphVector(
        name=DESIGN_TO_CODE_EDGE,
        source=design,
        target=code,
        operators=(op_design_code_fd, op_design_code_fp),
        evaluators=(design_code_fd, design_code_fp),
        contexts=(ctx_requirements, ctx_live_design, ctx_code_standard, ctx_code_output_contract),
    )

    graph = Graph(
        name="gsdlc_lite_delivery",
        inputs=(requirements,),
        outputs=(code,),
        nodes=(requirements, design, code),
        vectors=(req_to_design, design_to_code),
    )
    gf_req_to_design = _graph_function_for_vector(req_to_design)
    gf_design_to_code = _graph_function_for_vector(design_to_code)
    jobs = (
        Job(name=req_to_design.name, contracts=(ContractRef(kind="graph_function", target_id=gf_req_to_design.id),)),
        Job(name=design_to_code.name, contracts=(ContractRef(kind="graph_function", target_id=gf_design_to_code.id),)),
    )
    return Module(
        name="gsdlc_lite_delivery",
        graphs=(graph,),
        graph_functions=(gf_req_to_design, gf_design_to_code),
        refinement_boundaries=(
            deferred_refinement(req_to_design.name, inputs=(requirements,), outputs=(design,)),
            deferred_refinement(design_to_code.name, inputs=(design,), outputs=(code,)),
        ),
        jobs=jobs,
        operators=(op_req_design_fd, op_req_design_fp, op_design_code_fd, op_design_code_fp),
        evaluators=(req_design_fd, req_design_fp, design_code_fd, design_code_fp),
        metadata={"requirements": list(MODULE_REQUIREMENTS)},
    )


def _graph_function(name: str, graph: Graph, *, tags: tuple[str, ...] = ()) -> GraphFunction:
    return GraphFunction.from_graph(
        name=name,
        graph=graph,
        environment=EnvRef.from_contract(requires=graph.inputs, provides=graph.outputs),
        tags=tags,
    )


def _graph_function_for_vector(vector: GraphVector) -> GraphFunction:
    return graph_function_for_vector(vector)


def gsdlc_lite_zoom_module(workspace: Path) -> Module:
    texts = write_gsdlc_lite_workspace(workspace)

    docs = workspace / "docs"
    zoom_decomposition_contract = textwrap.dedent(
        """\
        # Decomposition Output Contract

        Update output/decomposition.md with the major design slices required before full design synthesis.

        Requirements:
        - Declare at least three named design slices.
        - Keep the slices user-facing and implementation-light.
        - Make sure the slices can be carried forward into dependency and sequencing planning.
        """
    )
    zoom_dependency_contract = textwrap.dedent(
        """\
        # Dependency Chain Output Contract

        Update output/dependency_chain.md with the dependency relationships between the decomposed slices.

        Requirements:
        - Reference the declared decomposition slices by name.
        - Express the ProjectService -> ProjectStore dependency chain explicitly.
        - Keep the dependency chain aligned to project creation, archive, and search behavior.
        """
    )
    zoom_sequencing_contract = textwrap.dedent(
        """\
        # Sequencing Output Contract

        Update output/sequencing.md with the ordered implementation sequence for the decomposed slices.

        Requirements:
        - Express at least three ordered implementation steps.
        - Reference the decomposed slices and dependency chain by name.
        - Preserve the ordering needed to synthesize the final design artifact.
        """
    )
    (docs / "decomposition_output_contract.md").write_text(zoom_decomposition_contract, encoding="utf-8")
    (docs / "dependency_chain_output_contract.md").write_text(zoom_dependency_contract, encoding="utf-8")
    (docs / "sequencing_output_contract.md").write_text(zoom_sequencing_contract, encoding="utf-8")

    requirements = Node(
        name="requirements",
        schema="RequirementsDoc",
        markov=("keys_tagged", "traceable", "implementation_ready"),
    )
    decomposition = Node(
        name="decomposition",
        schema="DecompositionPlan",
        markov=("slices_declared",),
    )
    dependency_chain = Node(
        name="dependency_chain",
        schema="DependencyChain",
        markov=("dependencies_declared",),
    )
    sequencing = Node(
        name="sequencing",
        schema="SequencingPlan",
        markov=("order_declared",),
    )
    design = Node(
        name="design",
        schema="DesignDoc",
        markov=("components_declared", "interfaces_declared", "traceable_to_requirements"),
    )
    code = Node(
        name="code",
        schema="CodeArtifact",
        markov=("service_surface_implemented", "basic_quality_satisfied"),
    )

    ctx_requirements = Context(
        name="requirements_source",
        locator="workspace://docs/requirements.md",
        digest=sha256(texts["requirements"]),
    )
    ctx_design_standard = Context(
        name="design_standard",
        locator="workspace://docs/design_standard.md",
        digest=sha256(texts["design_standard"]),
    )
    ctx_design_output_contract = Context(
        name="design_output_contract",
        locator="workspace://docs/design_output_contract.md",
        digest=sha256(texts["design_output_contract"]),
    )
    ctx_decomposition_output = Context(
        name="decomposition_output_contract",
        locator="workspace://docs/decomposition_output_contract.md",
        digest=sha256(zoom_decomposition_contract),
    )
    ctx_dependency_output = Context(
        name="dependency_chain_output_contract",
        locator="workspace://docs/dependency_chain_output_contract.md",
        digest=sha256(zoom_dependency_contract),
    )
    ctx_sequencing_output = Context(
        name="sequencing_output_contract",
        locator="workspace://docs/sequencing_output_contract.md",
        digest=sha256(zoom_sequencing_contract),
    )
    ctx_live_design = Context(
        name="design_artifact",
        locator="workspace://output/design.md",
        digest=PENDING_DIGEST,
    )
    ctx_live_decomposition = Context(
        name="decomposition_artifact",
        locator="workspace://output/decomposition.md",
        digest=PENDING_DIGEST,
    )
    ctx_live_dependency_chain = Context(
        name="dependency_chain_artifact",
        locator="workspace://output/dependency_chain.md",
        digest=PENDING_DIGEST,
    )
    ctx_live_sequencing = Context(
        name="sequencing_artifact",
        locator="workspace://output/sequencing.md",
        digest=PENDING_DIGEST,
    )
    ctx_code_standard = Context(
        name="code_standard",
        locator="workspace://docs/code_standard.md",
        digest=sha256(texts["code_standard"]),
    )
    ctx_code_output_contract = Context(
        name="code_output_contract",
        locator="workspace://docs/code_output_contract.md",
        digest=sha256(texts["code_output_contract"]),
    )

    zoom_fp = Evaluator(
        "zoom_progress",
        F_P,
        "zoomed design planning step advances decomposition and sequencing",
    )
    code_standard = Evaluator(
        "code_standard",
        F_D,
        "code artifact conforms to the declared code standard",
        binding="exec://python checks/check_code_standard.py output/design.md output/project_service.py",
    )
    code_quality = Evaluator(
        "code_quality",
        F_P,
        "code implements the designed service surface without placeholder stubs",
    )
    op_zoom = Operator("zoom_author", F_P, "agent://architecture/zoom")
    op_code_fd = Operator("code_standard_check", F_D, "exec://python checks/check_code_standard.py output/design.md output/project_service.py")
    op_code_fp = Operator("code_author", F_P, "agent://implementation/code")

    outer_req_to_design = GraphVector(
        name=REQ_TO_DESIGN_EDGE,
        source=requirements,
        target=design,
        operators=(op_zoom,),
        evaluators=(zoom_fp,),
        contexts=(ctx_requirements, ctx_design_standard, ctx_design_output_contract),
    )
    design_to_code = GraphVector(
        name=DESIGN_TO_CODE_EDGE,
        source=design,
        target=code,
        operators=(op_code_fd, op_code_fp),
        evaluators=(code_standard, code_quality),
        contexts=(ctx_requirements, ctx_live_design, ctx_code_standard, ctx_code_output_contract),
    )
    outer_graph = Graph(
        name="gsdlc_lite_zoom_outer",
        inputs=(requirements,),
        outputs=(code,),
        nodes=(requirements, design, code),
        vectors=(outer_req_to_design, design_to_code),
    )

    direct_profile = _graph_function(
        "direct_design_profile",
        Graph(
            name="direct_design_profile",
            inputs=(requirements,),
            outputs=(design,),
            nodes=(requirements, design),
            vectors=(
                GraphVector(
                    name=REQ_TO_DESIGN_EDGE,
                    source=requirements,
                    target=design,
                    operators=(op_zoom,),
                    evaluators=(zoom_fp,),
                    contexts=(ctx_requirements, ctx_design_standard, ctx_design_output_contract),
                ),
            ),
        ),
        tags=("profile:direct",),
    )
    zoomed_profile = _graph_function(
        "zoomed_design_profile",
        Graph(
            name="zoomed_design_profile",
            inputs=(requirements,),
            outputs=(design,),
            nodes=(requirements, decomposition, dependency_chain, sequencing, design),
            vectors=(
                GraphVector(
                    name=REQ_TO_DECOMPOSITION_EDGE,
                    source=requirements,
                    target=decomposition,
                    operators=(op_zoom,),
                    evaluators=(zoom_fp,),
                    contexts=(ctx_requirements, ctx_decomposition_output),
                ),
                GraphVector(
                    name=DECOMPOSITION_TO_DEPENDENCY_EDGE,
                    source=decomposition,
                    target=dependency_chain,
                    operators=(op_zoom,),
                    evaluators=(zoom_fp,),
                    contexts=(
                        ctx_requirements,
                        ctx_dependency_output,
                        ctx_live_decomposition,
                    ),
                ),
                GraphVector(
                    name=DEPENDENCY_TO_SEQUENCING_EDGE,
                    source=dependency_chain,
                    target=sequencing,
                    operators=(op_zoom,),
                    evaluators=(zoom_fp,),
                    contexts=(
                        ctx_requirements,
                        ctx_sequencing_output,
                        ctx_live_decomposition,
                        ctx_live_dependency_chain,
                    ),
                ),
                GraphVector(
                    name=SEQUENCING_TO_DESIGN_EDGE,
                    source=sequencing,
                    target=design,
                    operators=(op_zoom,),
                    evaluators=(zoom_fp,),
                    contexts=(
                        ctx_requirements,
                        ctx_design_standard,
                        ctx_design_output_contract,
                        ctx_live_decomposition,
                        ctx_live_dependency_chain,
                        ctx_live_sequencing,
                    ),
                ),
            ),
        ),
        tags=("profile:zoomed", "zoomed_design",),
    )

    from gtl.algebra import candidate_family

    design_family = candidate_family(
        "requirements→design_profiles",
        inputs=(requirements,),
        outputs=(design,),
        candidates=(direct_profile, zoomed_profile),
        policy_hints={"profiles": ("direct", "zoomed")},
        tags=("zoom_selection",),
    )

    design_to_code_graph_function = _graph_function_for_vector(design_to_code)
    jobs = (
        Job(name=outer_req_to_design.name, contracts=(ContractRef(kind="graph_function", target_id=direct_profile.id),)),
        Job(name=design_to_code.name, contracts=(ContractRef(kind="graph_function", target_id=design_to_code_graph_function.id),)),
    )
    return Module(
        name="gsdlc_lite_zoom_delivery",
        graphs=(outer_graph,),
        graph_functions=(direct_profile, zoomed_profile, design_to_code_graph_function),
        candidate_families=(design_family,),
        refinement_boundaries=(
            deferred_refinement(REQ_TO_DECOMPOSITION_EDGE, inputs=(requirements,), outputs=(decomposition,)),
            deferred_refinement(DECOMPOSITION_TO_DEPENDENCY_EDGE, inputs=(decomposition,), outputs=(dependency_chain,)),
            deferred_refinement(DEPENDENCY_TO_SEQUENCING_EDGE, inputs=(dependency_chain,), outputs=(sequencing,)),
            deferred_refinement(SEQUENCING_TO_DESIGN_EDGE, inputs=(sequencing,), outputs=(design,)),
            deferred_refinement(DESIGN_TO_CODE_EDGE, inputs=(design,), outputs=(code,)),
        ),
        jobs=jobs,
        operators=(op_zoom, op_code_fd, op_code_fp),
        evaluators=(zoom_fp, code_standard, code_quality),
        metadata={"requirements": list(ZOOM_REQUIREMENTS)},
    )


def gsdlc_lite_review_module(workspace: Path) -> Module:
    texts = write_gsdlc_lite_workspace(workspace)

    requirements = Node(
        name="requirements",
        schema="RequirementsDoc",
        markov=("keys_tagged", "traceable", "implementation_ready"),
    )
    design = Node(
        name="design",
        schema="DesignDoc",
        markov=("components_declared", "interfaces_declared", "traceable_to_requirements"),
    )
    design_review = Node(
        name="design_review",
        schema="DesignReviewDoc",
        markov=("approved_for_implementation", "traceable_review", "sequencing_reviewed"),
    )
    code = Node(
        name="code",
        schema="CodeArtifact",
        markov=("service_surface_implemented", "basic_quality_satisfied"),
    )

    ctx_requirements = Context(
        name="requirements_source",
        locator="workspace://docs/requirements.md",
        digest=sha256(texts["requirements"]),
    )
    ctx_design_standard = Context(
        name="design_standard",
        locator="workspace://docs/design_standard.md",
        digest=sha256(texts["design_standard"]),
    )
    ctx_design_review_standard = Context(
        name="design_review_standard",
        locator="workspace://docs/design_review_standard.md",
        digest=sha256(texts["design_review_standard"]),
    )
    ctx_design_output_contract = Context(
        name="design_output_contract",
        locator="workspace://docs/design_output_contract.md",
        digest=sha256(texts["design_output_contract"]),
    )
    ctx_design_review_output_contract = Context(
        name="design_review_output_contract",
        locator="workspace://docs/design_review_output_contract.md",
        digest=sha256(texts["design_review_output_contract"]),
    )
    ctx_code_standard = Context(
        name="code_standard",
        locator="workspace://docs/code_standard.md",
        digest=sha256(texts["code_standard"]),
    )
    ctx_code_output_contract = Context(
        name="code_output_contract",
        locator="workspace://docs/code_output_contract.md",
        digest=sha256(texts["code_output_contract"]),
    )
    ctx_live_design = Context(
        name="design_artifact",
        locator="workspace://output/design.md",
        digest=PENDING_DIGEST,
    )
    ctx_live_design_review = Context(
        name="design_review_artifact",
        locator="workspace://output/design_review.md",
        digest=PENDING_DIGEST,
    )

    design_standard = Evaluator(
        "design_standard",
        F_D,
        "design artifact conforms to the declared design standard",
        binding="exec://python checks/check_design_standard.py docs/requirements.md output/design.md",
    )
    design_quality = Evaluator(
        "design_quality",
        F_P,
        "design defines coherent components and interfaces without collapsing into code",
    )
    design_review_standard = Evaluator(
        "design_review_standard",
        F_D,
        "design review artifact conforms to the declared review standard",
        binding="exec://python checks/check_design_review_standard.py docs/requirements.md output/design_review.md",
    )
    design_review_architecture = Evaluator(
        "design_review_architecture",
        F_P,
        "review confirms architectural separation and service/store boundary clarity",
    )
    design_review_traceability = Evaluator(
        "design_review_traceability",
        F_P,
        "review confirms requirement traceability is preserved through the design",
    )
    design_review_sequencing = Evaluator(
        "design_review_sequencing",
        F_P,
        "review confirms the design sequencing is explicit and implementation-ready",
    )
    code_standard = Evaluator(
        "code_standard",
        F_D,
        "code artifact conforms to the declared code standard",
        binding="exec://python checks/check_code_standard.py output/design.md output/project_service.py",
    )
    code_quality = Evaluator(
        "code_quality",
        F_P,
        "code implements the designed service surface without placeholder stubs",
    )

    op_design_fd = Operator("design_standard_check", F_D, "exec://python checks/check_design_standard.py docs/requirements.md output/design.md")
    op_design_fp = Operator("design_author", F_P, "agent://architecture/design")
    op_review_fd = Operator("design_review_standard_check", F_D, "exec://python checks/check_design_review_standard.py docs/requirements.md output/design_review.md")
    op_review_fp = Operator("design_review_author", F_P, "agent://architecture/design-review")
    op_code_fd = Operator("code_standard_check", F_D, "exec://python checks/check_code_standard.py output/design.md output/project_service.py")
    op_code_fp = Operator("code_author", F_P, "agent://implementation/code")

    req_to_design = GraphVector(
        name=REQ_TO_DESIGN_EDGE,
        source=requirements,
        target=design,
        operators=(op_design_fd, op_design_fp),
        evaluators=(design_standard, design_quality),
        contexts=(ctx_requirements, ctx_design_standard, ctx_design_output_contract),
    )
    design_to_review = GraphVector(
        name=DESIGN_TO_REVIEW_EDGE,
        source=design,
        target=design_review,
        operators=(op_review_fd, op_review_fp),
        evaluators=(
            design_review_standard,
            design_review_architecture,
            design_review_traceability,
            design_review_sequencing,
        ),
        contexts=(
            ctx_requirements,
            ctx_live_design,
            ctx_design_review_standard,
            ctx_design_review_output_contract,
        ),
    )
    review_to_code = GraphVector(
        name=REVIEW_TO_CODE_EDGE,
        source=design_review,
        target=code,
        operators=(op_code_fd, op_code_fp),
        evaluators=(code_standard, code_quality),
        contexts=(
            ctx_requirements,
            ctx_live_design,
            ctx_live_design_review,
            ctx_code_standard,
            ctx_code_output_contract,
        ),
    )

    graph = Graph(
        name="gsdlc_lite_review_delivery",
        inputs=(requirements,),
        outputs=(code,),
        nodes=(requirements, design, design_review, code),
        vectors=(req_to_design, design_to_review, review_to_code),
    )
    gf_req_to_design = _graph_function_for_vector(req_to_design)
    gf_design_to_review = _graph_function_for_vector(design_to_review)
    gf_review_to_code = _graph_function_for_vector(review_to_code)
    jobs = (
        Job(name=req_to_design.name, contracts=(ContractRef(kind="graph_function", target_id=gf_req_to_design.id),)),
        Job(name=design_to_review.name, contracts=(ContractRef(kind="graph_function", target_id=gf_design_to_review.id),)),
        Job(name=review_to_code.name, contracts=(ContractRef(kind="graph_function", target_id=gf_review_to_code.id),)),
    )
    return Module(
        name="gsdlc_lite_review_delivery",
        graphs=(graph,),
        graph_functions=(gf_req_to_design, gf_design_to_review, gf_review_to_code),
        refinement_boundaries=(
            deferred_refinement(req_to_design.name, inputs=(requirements,), outputs=(design,)),
            deferred_refinement(design_to_review.name, inputs=(design,), outputs=(design_review,)),
            deferred_refinement(review_to_code.name, inputs=(design_review,), outputs=(code,)),
        ),
        jobs=jobs,
        operators=(
            op_design_fd,
            op_design_fp,
            op_review_fd,
            op_review_fp,
            op_code_fd,
            op_code_fp,
        ),
        evaluators=(
            design_standard,
            design_quality,
            design_review_standard,
            design_review_architecture,
            design_review_traceability,
            design_review_sequencing,
            code_standard,
            code_quality,
        ),
        rules=(),
        metadata={"requirements": list(MODULE_REQUIREMENTS) + ["REQ-GSDLCLITE-REVIEW-001"]},
    )


def gsdlc_lite_role_module(workspace: Path) -> Module:
    base = gsdlc_lite_review_module(workspace)
    designer = Role(name="designer", tags=("phase:design",))
    reviewer = Role(name="reviewer", tags=("phase:review",))
    coder = Role(name="coder", tags=("phase:code",))

    req_to_design, design_to_review, review_to_code = base.graphs[0].vectors
    graph_function_by_name = {graph_function.name: graph_function for graph_function in base.graph_functions}
    jobs = (
        Job(
            name=req_to_design.name,
            contracts=(ContractRef(kind="graph_function", target_id=graph_function_by_name[req_to_design.name].id),),
            roles=(designer,),
        ),
        Job(
            name=design_to_review.name,
            contracts=(ContractRef(kind="graph_function", target_id=graph_function_by_name[design_to_review.name].id),),
            roles=(reviewer,),
        ),
        Job(
            name=review_to_code.name,
            contracts=(ContractRef(kind="graph_function", target_id=graph_function_by_name[review_to_code.name].id),),
            roles=(coder,),
        ),
    )
    return Module(
        name="gsdlc_lite_role_delivery",
        graphs=base.graphs,
        graph_functions=base.graph_functions,
        refinement_boundaries=base.refinement_boundaries,
        candidate_families=base.candidate_families,
        jobs=jobs,
        roles=(designer, reviewer, coder),
        operators=base.operators,
        evaluators=base.evaluators,
        rules=base.rules,
        imports=base.imports,
        metadata={**base.metadata, "requirements": list(base.metadata.get("requirements", [])) + ["REQ-GSDLCLITE-ROLE-001"]},
    )
