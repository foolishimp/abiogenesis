from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
import textwrap
from pathlib import Path

from gtl.algebra import deferred_refinement
from gtl.graph import Context, Graph, GraphVector, Node
from gtl.module_model import Module
from gtl.operator_model import Evaluator, Operator, F_D, F_P
from gtl.work_model import ContractRef, Job


EDGE_NAME = "requirements→uat_tests"
ARTIFACT_PATH = Path("output/uat_tests.md")
REQUIREMENT_IDS = ("REQ-PROJ-001", "REQ-PROJ-002")
MODULE_REQUIREMENTS = ("REQ-R2U-001", "REQ-R2U-002", "REQ-R2U-003")


def sha256(text: str) -> str:
    return "sha256:" + hashlib.sha256(text.encode("utf-8")).hexdigest()


def uat_checker_script() -> str:
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
                print("usage: check_uat_standard.py <requirements.md> <uat_tests.md>", file=sys.stderr)
                return 2

            requirements = Path(sys.argv[1])
            uat = Path(sys.argv[2])
            if not requirements.exists():
                print("requirements artifact missing", file=sys.stderr)
                return 1
            if not uat.exists():
                print("uat tests artifact missing", file=sys.stderr)
                return 1

            requirements_text = requirements.read_text(encoding="utf-8")
            uat_text = uat.read_text(encoding="utf-8")

            required_ids = _extract_requirement_ids(requirements_text)
            if not required_ids:
                print("no requirement family ids found", file=sys.stderr)
                return 1

            covered_ids = sorted(set(re.findall(r"REQ-[A-Z0-9-]+", uat_text)))
            missing = sorted(set(required_ids) - set(covered_ids))
            if missing:
                print(f"missing requirement coverage: {missing}", file=sys.stderr)
                return 1

            case_titles = re.findall(r"^##\\s+.+", uat_text, re.MULTILINE)
            if len(case_titles) < 2:
                print("fewer than two UAT cases found", file=sys.stderr)
                return 1

            if not re.search(r"^1\\.\\s+", uat_text, re.MULTILINE):
                print("no numbered steps found", file=sys.stderr)
                return 1

            expected_results = re.findall(r"^\\*\\*Expected Result\\*\\*:", uat_text, re.MULTILINE)
            if len(expected_results) < len(case_titles):
                print("each UAT case must declare an Expected Result", file=sys.stderr)
                return 1

            if not re.search(r"(edge case|boundary|error|invalid|negative|timeout|empty)", uat_text, re.IGNORECASE):
                print("no edge case coverage found", file=sys.stderr)
                return 1

            print(json.dumps({
                "requirements": required_ids,
                "covered_requirements": covered_ids,
                "case_count": len(case_titles),
                "status": "uat standard satisfied",
            }))
            return 0


        if __name__ == "__main__":
            raise SystemExit(main())
        """
    )


def requirements_uat_artifact() -> str:
    return textwrap.dedent(
        """\
        # UAT Test Cases

        ## UAT-001 — Create and Save a Project
        **Requirements**: REQ-PROJ-001
        **Scenario**: Normal Flow
        1. Open the project workspace.
        2. Enter a valid project name and owner.
        3. Save the project.
        **Expected Result**: The project is created, saved, and visible in the active project list.

        ## UAT-002 — Archived Project Remains Searchable Read-Only
        **Requirements**: REQ-PROJ-002
        **Scenario**: Edge Case
        1. Archive an existing project with retained history.
        2. Search for the archived project from the global project search.
        3. Open the archived project from the search result.
        **Expected Result**: The archived project is found and opens in read-only mode without exposing edit actions.
        """
    )


def judge_uat_scenario_quality(artifact: Path) -> list[dict]:
    content = artifact.read_text(encoding="utf-8")
    failures: list[str] = []

    case_titles = re.findall(r"^##\s+(.+)", content, re.MULTILINE)
    case_count = len(case_titles)
    if case_count < 2:
        failures.append("fewer than two user-facing UAT cases were produced")

    scenario_labels = [
        label.lower()
        for label in re.findall(r"\*\*Scenario\*\*:\s*(.+)", content)
    ]
    title_labels = [title.lower() for title in case_titles]
    all_labels = scenario_labels + title_labels

    edge_markers = ("edge case", "boundary", "error", "invalid", "negative", "timeout", "empty")
    has_edge_case = any(any(marker in label for marker in edge_markers) for label in all_labels)
    has_normal_case = any(not any(marker in label for marker in edge_markers) for label in all_labels)

    if not has_normal_case:
        failures.append("no normal-flow UAT case found")
    if not has_edge_case:
        failures.append("no edge-case UAT case found")

    if re.search(r"\b(todo|tbd|placeholder)\b", content, re.IGNORECASE):
        failures.append("artifact still contains placeholder language")

    if re.search(r"\b(python|pytest|sql|docker|kubernetes|fastapi|react)\b", content, re.IGNORECASE):
        failures.append("artifact leaks implementation detail into UAT output")

    if failures:
        return [{
            "evaluator": "scenario_quality",
            "result": "fail",
            "evidence": "; ".join(failures),
        }]

    return [{
        "evaluator": "scenario_quality",
        "result": "pass",
        "evidence": "uat scenarios are concrete, user-facing, and include both normal and edge flows",
    }]


def write_result_file(result_path: Path, *, edge: str, actor: str, assessments: list[dict]) -> None:
    result_path.parent.mkdir(parents=True, exist_ok=True)
    result_path.write_text(
        json.dumps(
            {
                "edge": edge,
                "actor": actor,
                "assessments": assessments,
            },
            indent=2,
        ),
        encoding="utf-8",
    )


def run_uat_standard_check(workspace: Path) -> subprocess.CompletedProcess[str]:
    checker = workspace / "checks" / "check_uat_standard.py"
    requirements = workspace / "docs" / "requirements.md"
    artifact = workspace / ARTIFACT_PATH
    return subprocess.run(
        [sys.executable, str(checker), str(requirements), str(artifact)],
        cwd=str(workspace),
        capture_output=True,
        text=True,
        timeout=30,
    )


def write_requirements_uat_workspace(workspace: Path, *, placeholder: str = "# placeholder\n") -> dict[str, str]:
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
        **Derives from**: scenario-requirements-to-uat

        ## Acceptance Criteria

        **REQ-PROJ-001-001**: The system shall allow a user to create and save a project.
        **REQ-PROJ-001-002**: The system shall allow a user to assign an owner when creating a project.

        # REQ-PROJ-002 — Archived Project Visibility

        **Status**: Draft
        **Category**: Capability
        **Date**: 2026-03-27
        **Derives from**: scenario-requirements-to-uat

        ## Acceptance Criteria

        **REQ-PROJ-002-001**: Archived projects shall remain searchable.
        **REQ-PROJ-002-002**: Archived projects shall open in read-only mode.
        """
    )
    standard_text = textwrap.dedent(
        """\
        # UAT Standard

        - Every UAT case must reference one or more REQ family ids from docs/requirements.md.
        - Each UAT case must have numbered executable steps.
        - Each UAT case must declare an Expected Result.
        - The UAT artifact must include at least one edge case.
        - The UAT artifact must remain user-facing and implementation-neutral.
        """
    )
    output_contract_text = textwrap.dedent(
        """\
        # Output Contract

        Update output/uat_tests.md.

        Requirements:
        - Produce at least two UAT cases.
        - Reference REQ family ids from docs/requirements.md.
        - Include numbered steps for each case.
        - Include an Expected Result for each case.
        - Include at least one normal-flow case and one edge-case scenario.
        - Keep the artifact user-facing and implementation-neutral.
        """
    )

    (docs / "requirements.md").write_text(requirements_text, encoding="utf-8")
    (docs / "testing_standards.md").write_text(standard_text, encoding="utf-8")
    (docs / "output_contract.md").write_text(output_contract_text, encoding="utf-8")
    (checks / "check_uat_standard.py").write_text(uat_checker_script(), encoding="utf-8")
    (output / "uat_tests.md").write_text(placeholder, encoding="utf-8")
    return {
        "requirements": requirements_text,
        "testing_standards": standard_text,
        "output_contract": output_contract_text,
    }


def requirements_uat_module(workspace: Path) -> Module:
    texts = write_requirements_uat_workspace(workspace)

    requirements = Node(
        name="requirements",
        schema="RequirementsDoc",
        markov=("keys_tagged", "traceable", "uat_ready"),
    )
    uat_tests = Node(
        name="uat_tests",
        schema="AcceptanceTests",
        markov=("all_reqs_covered", "steps_executable", "expected_results_defined"),
    )

    ctx_requirements = Context(
        name="requirements_source",
        locator="workspace://docs/requirements.md",
        digest=sha256(texts["requirements"]),
    )
    ctx_standards = Context(
        name="testing_standards",
        locator="workspace://docs/testing_standards.md",
        digest=sha256(texts["testing_standards"]),
    )
    ctx_output_contract = Context(
        name="output_contract",
        locator="workspace://docs/output_contract.md",
        digest=sha256(texts["output_contract"]),
    )

    check_cmd = "exec://python checks/check_uat_standard.py docs/requirements.md output/uat_tests.md"
    eval_fd = Evaluator(
        "uat_standard",
        F_D,
        "uat tests artifact conforms to the declared UAT standard",
        binding=check_cmd,
    )
    eval_fp = Evaluator(
        "scenario_quality",
        F_P,
        "uat scenarios are concrete, user-facing, and include both normal and edge flows",
    )
    op_fd = Operator("uat_standard_check", F_D, check_cmd)
    op_fp = Operator("uat_author", F_P, "agent://qa/test_design")

    vector = GraphVector(
        name=EDGE_NAME,
        source=requirements,
        target=uat_tests,
        operators=(op_fd, op_fp),
        evaluators=(eval_fd, eval_fp),
        contexts=(ctx_requirements, ctx_standards, ctx_output_contract),
    )
    graph = Graph(
        name="requirements_uat_delivery",
        inputs=(requirements,),
        outputs=(uat_tests,),
        nodes=(requirements, uat_tests),
        vectors=(vector,),
    )
    job = Job(
        name=vector.name,
        contracts=(ContractRef(kind="graph_vector", target_id=vector.id),),
    )
    return Module(
        name="requirements_uat_delivery",
        graphs=(graph,),
        refinement_boundaries=(
            deferred_refinement(vector.name, inputs=(requirements,), outputs=(uat_tests,)),
        ),
        jobs=(job,),
        operators=(op_fd, op_fp),
        evaluators=(eval_fd, eval_fp),
        metadata={"requirements": list(MODULE_REQUIREMENTS)},
    )
