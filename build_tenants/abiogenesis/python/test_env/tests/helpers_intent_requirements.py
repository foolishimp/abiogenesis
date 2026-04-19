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
from gtl.function_model import GraphFunction
from gtl.graph import Context, Graph, Node
from gtl.module_model import Module
from gtl.operator_model import Evaluator, Operator, F_D, F_P
from gtl.work_model import ContractRef, Job
from tests.helpers_obligation_ledger import declared_test_graph_vector as GraphVector


EDGE_NAME = "intents→requirements"
ARTIFACT_PATH = Path("output/requirements.md")
INTENT_IDS = tuple(f"intent-{n:03d}" for n in range(1, 6))
MODULE_REQUIREMENTS = ("REQ-I2R-001", "REQ-I2R-002", "REQ-I2R-003")


def sha256(text: str) -> str:
    return "sha256:" + hashlib.sha256(text.encode("utf-8")).hexdigest()


def _graph_function_for_vector(vector: GraphVector) -> GraphFunction:
    return graph_function_for_vector(vector)

def requirements_checker_script() -> str:
    return textwrap.dedent(
        """\
        from __future__ import annotations

        import json
        import re
        import sys
        from pathlib import Path

        ALLOWED_CATEGORIES = {"Capability", "Constraint / Guarantee", "Governance", "Verification"}
        ALLOWED_INTENTS = {f"intent-{n:03d}" for n in range(1, 6)}


        def main() -> int:
            if len(sys.argv) != 2:
                print("usage: check_requirements_standard.py <requirements.md>", file=sys.stderr)
                return 2

            artifact = Path(sys.argv[1])
            if not artifact.exists():
                print("requirements artifact missing", file=sys.stderr)
                return 1

            content = artifact.read_text(encoding="utf-8")

            family_ids = re.findall(r"^## (REQ-[A-Z0-9-]+)\\b", content, re.MULTILINE)
            if not family_ids:
                print("no requirement families found", file=sys.stderr)
                return 1
            if len(family_ids) != len(set(family_ids)):
                print("duplicate requirement family ids", file=sys.stderr)
                return 1

            for family_id in family_ids:
                marker = f"## {family_id}"
                start = content.find(marker)
                end = content.find("\\n## ", start + 1)
                section = content[start:] if end == -1 else content[start:end]
                for header in ("| Status |", "| Category |", "| Date |", "| Derives from |"):
                    if header not in section:
                        print(f"{family_id} missing header {header}", file=sys.stderr)
                        return 1

                category_match = re.search(r"\\| Category \\|\\s*(.+?)\\s*\\|", section)
                if not category_match:
                    print(f"{family_id} missing category value", file=sys.stderr)
                    return 1
                category = category_match.group(1).strip()
                if category not in ALLOWED_CATEGORIES:
                    print(
                        f"{family_id} category {category!r} not in allowed set "
                        f"{sorted(ALLOWED_CATEGORIES)}",
                        file=sys.stderr,
                    )
                    return 1

                derives_match = re.search(r"\\| Derives from \\|\\s*(.+?)\\s*\\|", section)
                if not derives_match:
                    print(f"{family_id} missing derives-from value", file=sys.stderr)
                    return 1
                derived_ids = {
                    item.strip()
                    for item in derives_match.group(1).split(",")
                    if item.strip()
                }
                if not derived_ids:
                    print(f"{family_id} must trace to at least one intent id", file=sys.stderr)
                    return 1
                if not derived_ids.issubset(ALLOWED_INTENTS):
                    print(
                        f"{family_id} derives-from contains unknown intent ids: "
                        f"{sorted(derived_ids - ALLOWED_INTENTS)}",
                        file=sys.stderr,
                    )
                    return 1

                family_ac_ids = re.findall(
                    rf"\\*\\*({re.escape(family_id)}-AC-\\d{{2}})\\*\\*",
                    section,
                )
                if not family_ac_ids:
                    print(f"{family_id} has no family-scoped acceptance criteria", file=sys.stderr)
                    return 1

            ac_ids = re.findall(r"\\*\\*(REQ-[A-Z0-9-]+-AC-\\d{2})\\*\\*", content)
            if not ac_ids:
                print("no acceptance criteria ids found", file=sys.stderr)
                return 1
            if len(ac_ids) != len(set(ac_ids)):
                print("duplicate acceptance criterion ids", file=sys.stderr)
                return 1

            derives = re.findall(r"\\| Derives from \\|\\s*(.+?)\\s*\\|", content)
            if not derives:
                print("no derives-from metadata found", file=sys.stderr)
                return 1

            print(json.dumps({
                "families": family_ids,
                "ac_count": len(ac_ids),
                "status": "requirements standard satisfied",
            }))

            return 0


        if __name__ == "__main__":
            raise SystemExit(main())
        """
    )


def intent_requirements_artifact() -> str:
    return textwrap.dedent(
        """\
        ## REQ-PROJ-001 Project Lifecycle

        | Field | Value |
        |-------|-------|
        | Status | Draft |
        | Category | Capability |
        | Date | 2026-03-27 |
        | Derives from | intent-001, intent-002, intent-003, intent-005 |

        ### Acceptance Criteria

        - **REQ-PROJ-001-AC-01** — The system shall allow users to create and save projects.
        - **REQ-PROJ-001-AC-02** — The system shall allow users to assign owners to projects.
        - **REQ-PROJ-001-AC-03** — The system shall allow users to archive projects without deleting history.
        - **REQ-PROJ-001-AC-04** — Archived projects shall remain searchable in read-only mode.

        ## REQ-PROJ-002 Project Audit Trail

        | Field | Value |
        |-------|-------|
        | Status | Draft |
        | Category | Governance |
        | Date | 2026-03-27 |
        | Derives from | intent-004 |

        ### Acceptance Criteria

        - **REQ-PROJ-002-AC-01** — The system shall record an audit trail for project changes.
        """
    )


def judge_intent_traceability(artifact: Path) -> list[dict]:
    content = artifact.read_text(encoding="utf-8")
    failures: list[str] = []

    found_intents = set(re.findall(r"intent-\d{3}", content))
    missing = sorted(set(INTENT_IDS) - found_intents)
    if missing:
        failures.append(f"missing intent traceability: {missing}")

    family_ids = set(re.findall(r"^## (REQ-[A-Z0-9-]+)\b", content, re.MULTILINE))
    if not family_ids:
        failures.append("no tagged requirement families found")

    if re.search(r"\\b(python|pytest|sql|docker|kubernetes|fastapi|react)\\b", content, re.IGNORECASE):
        failures.append("artifact leaks implementation detail into requirements")

    if failures:
        return [{
            "evaluator": "intent_traceability",
            "result": "fail",
            "evidence": "; ".join(failures),
        }]

    return [{
        "evaluator": "intent_traceability",
        "result": "pass",
        "evidence": "all five intents are traceable through tagged requirement families",
    }]


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


def run_requirements_standard_check(workspace: Path) -> subprocess.CompletedProcess[str]:
    checker = workspace / "checks" / "check_requirements_standard.py"
    artifact = workspace / ARTIFACT_PATH
    return subprocess.run(
        [sys.executable, str(checker), str(artifact)],
        cwd=str(workspace),
        capture_output=True,
        text=True,
        timeout=30,
    )


def write_intent_requirements_workspace(workspace: Path, *, placeholder: str = "# placeholder\\n") -> dict[str, str]:
    docs = workspace / "docs"
    docs.mkdir(parents=True, exist_ok=True)
    output = workspace / "output"
    output.mkdir(parents=True, exist_ok=True)
    checks = workspace / "checks"
    checks.mkdir(parents=True, exist_ok=True)

    intents_text = textwrap.dedent(
        """\
        # Intents

        - intent-001: Users can create and save projects.
        - intent-002: Users can assign owners to projects.
        - intent-003: Users can archive projects without deleting history.
        - intent-004: The system shall record an audit trail for project changes.
        - intent-005: Archived projects shall be searchable in read-only mode.
        """
    )
    standard_text = textwrap.dedent(
        """\
        # Requirements Standard

        - Every requirement family must have a stable REQ-* id.
        - Every family must declare Status, Category, Date, and Derives from metadata.
        - Category must be one of: Capability, Constraint / Guarantee, Governance, Verification.
        - Every acceptance criterion id must derive from its family id.
        - Family ids must be unique.
        - Acceptance criterion ids must be unique.
        - Every requirement family must trace to one or more source intents using only intent-001 through intent-005.
        - Requirements remain implementation-neutral.

        Format:
        - Each requirement family is a level-2 heading: ## REQ-NNN Title
        - Metadata is a markdown table with rows: Status, Category, Date, Derives from
        - Each acceptance criterion is a bullet: - **REQ-NNN-AC-NN** — description
        """
    )
    output_contract_text = textwrap.dedent(
        """\
        # Output Contract

        Update output/requirements.md.

        Requirements:
        - Produce one or more requirement families with REQ-* identifiers.
        - Use a level-2 heading for each family: ## REQ-NNN Title
        - Include a markdown table with Status, Category, Date, and Derives from rows for each family.
        - Use only these categories: Capability, Constraint / Guarantee, Governance, Verification.
        - Include uniquely tagged acceptance criteria under each family as bullet items.
        - Format each AC as: - **REQ-NNN-AC-NN** — description (two-digit AC number, dash separator)
        - Every acceptance criterion id must use its parent family id as prefix.
        - Ensure the source intents intent-001 through intent-005 are traceable.
        - Keep the artifact implementation-neutral.
        """
    )

    (docs / "intents.md").write_text(intents_text, encoding="utf-8")
    (docs / "requirements_standard.md").write_text(standard_text, encoding="utf-8")
    (docs / "output_contract.md").write_text(output_contract_text, encoding="utf-8")
    (checks / "check_requirements_standard.py").write_text(requirements_checker_script(), encoding="utf-8")
    (output / "requirements.md").write_text(placeholder, encoding="utf-8")
    return {
        "intents": intents_text,
        "requirements_standard": standard_text,
        "output_contract": output_contract_text,
    }


def intent_requirements_module(workspace: Path) -> Module:
    texts = write_intent_requirements_workspace(workspace)

    intents = Node(
        name="intents",
        schema="IntentList",
        markov=("problem_stated", "value_proposition_clear", "scope_bounded"),
    )
    requirements = Node(
        name="requirements",
        schema="RequirementsDoc",
        markov=("keys_tagged", "traceable_to_intents", "standard_compliant"),
    )

    ctx_intents = Context(
        name="intent_source",
        locator="workspace://docs/intents.md",
        digest=sha256(texts["intents"]),
    )
    ctx_standard = Context(
        name="requirements_standard",
        locator="workspace://docs/requirements_standard.md",
        digest=sha256(texts["requirements_standard"]),
    )
    ctx_output = Context(
        name="output_contract",
        locator="workspace://docs/output_contract.md",
        digest=sha256(texts["output_contract"]),
    )

    check_cmd = "exec://python checks/check_requirements_standard.py output/requirements.md"
    eval_fd = Evaluator(
        "tag_compliance",
        F_D,
        "requirements artifact conforms to the declared requirements-tagging standard",
        binding=check_cmd,
    )
    eval_fp = Evaluator(
        "intent_traceability",
        F_P,
        "requirements trace back to all five source intents without losing structural clarity",
    )
    op_fd = Operator("requirements_standard_check", F_D, check_cmd)
    op_fp = Operator("requirements_author", F_P, "agent://analysis/requirements")

    vector = GraphVector(
        name=EDGE_NAME,
        source=intents,
        target=requirements,
        operators=(op_fd, op_fp),
        evaluators=(eval_fd, eval_fp),
        contexts=(ctx_intents, ctx_standard, ctx_output),
    )
    graph = Graph(
        name="intent_requirements_delivery",
        inputs=(intents,),
        outputs=(requirements,),
        nodes=(intents, requirements),
        vectors=(vector,),
    )
    graph_function = _graph_function_for_vector(vector)
    job = Job(
        name=vector.name,
        contracts=(ContractRef(kind="graph_function", target_id=graph_function.id),),
    )
    return Module(
        name="intent_requirements_delivery",
        graphs=(graph,),
        graph_functions=(graph_function,),
        refinement_boundaries=(
            deferred_refinement(vector.name, inputs=(intents,), outputs=(requirements,)),
        ),
        jobs=(job,),
        operators=(op_fd, op_fp),
        evaluators=(eval_fd, eval_fp),
        metadata={"requirements": list(MODULE_REQUIREMENTS)},
    )
