# Validates: REQ-R-ABG3-PAYLOAD
# Validates: T-095-PY
from __future__ import annotations

import re
from pathlib import Path


ALLOWED_AUDIT_STATUSES = {
    "covered",
    "new acceptance criterion needed",
    "new implementation ticket needed",
    "out of scope with rationale",
}


def _repo_root() -> Path:
    current = Path(__file__).resolve()
    for candidate in current.parents:
        if (candidate / "specification").is_dir() and (candidate / "build_tenants").is_dir():
            return candidate
    raise AssertionError("unable to locate abiogenesis repo root from test path")


REPO_ROOT = _repo_root()
PAYLOAD_REQUIREMENT = REPO_ROOT / "specification" / "requirements" / "abg" / "REQ-R-ABG3-PAYLOAD.md"
SCENARIO_11 = REPO_ROOT / "specification" / "scenarios" / "11-event-sourced-payload-ledger-uat.md"
TICKET_ROOT = REPO_ROOT / ".ai-workspace" / "tickets"


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _t095_py_ticket_path() -> Path:
    candidates: list[Path] = []
    for state in ("active", "completed", "backlog"):
        candidates.extend(sorted((TICKET_ROOT / state).glob("T-095-PY-*.md")))
    assert candidates, "missing T-095-PY payload-ledger parity audit ticket"
    return candidates[0]


def _payload_requirement_refs() -> set[str]:
    return set(re.findall(r"\bREQ-R-ABG3-PAYLOAD-\d{3}\b", _read(PAYLOAD_REQUIREMENT)))


def _scenario_11_case_names() -> set[str]:
    text = _read(SCENARIO_11)
    match = re.search(r"## Required Testcases\n(?P<body>.*?)(?:\n## |\Z)", text, re.DOTALL)
    assert match, "Scenario 11 lacks a Required Testcases section"
    cases: set[str] = set()
    for line in match.group("body").splitlines():
        if not line.startswith("| "):
            continue
        cells = [cell.strip().strip("`") for cell in line.strip("|").split("|")]
        if not cells or cells[0] in {"Case", "---"} or cells[0].startswith("---"):
            continue
        cases.add(cells[0])
    assert cases, "Scenario 11 Required Testcases table has no cases"
    return cases


def _audit_rows(ticket_text: str) -> dict[str, tuple[str, str, str]]:
    rows: dict[str, tuple[str, str, str]] = {}
    for line in ticket_text.splitlines():
        if not line.startswith("| "):
            continue
        cells = [cell.strip().strip("`") for cell in line.strip("|").split("|")]
        if len(cells) < 4 or cells[0] in {"Obligation", "Scenario 11 case", "---"}:
            continue
        status = cells[1]
        if status in ALLOWED_AUDIT_STATUSES:
            rows[cells[0]] = (status, cells[2], cells[3])
    return rows


def test_t095_py_forensic_audit_covers_every_payload_requirement_acceptance_criterion() -> None:
    ticket_text = _read(_t095_py_ticket_path())
    rows = _audit_rows(ticket_text)
    missing = sorted(ref for ref in _payload_requirement_refs() if ref not in rows)
    assert not missing, "T-095-PY forensic audit omits payload AC rows: " + ", ".join(missing)

    statuses = {rows[ref][0] for ref in _payload_requirement_refs()}
    assert statuses <= ALLOWED_AUDIT_STATUSES
    assert "new implementation ticket needed" in statuses, (
        "Python payload parity audit must not masquerade as no-gap sufficiency"
    )


def test_t095_py_forensic_audit_covers_every_scenario_11_case() -> None:
    ticket_text = _read(_t095_py_ticket_path())
    rows = _audit_rows(ticket_text)
    scenario_cases = _scenario_11_case_names()
    missing = sorted(case for case in scenario_cases if case not in rows)
    assert not missing, "T-095-PY forensic audit omits Scenario 11 cases: " + ", ".join(missing)


def test_t095_py_forensic_audit_keeps_python_payload_parity_paused() -> None:
    ticket_text = _read(_t095_py_ticket_path())
    assert "status: paused" in ticket_text
    assert "review_status: suspended_by_tenant_registry" in ticket_text
    assert "not an implementation claim" in ticket_text
    assert "TypeScript payload-ledger proof is treated as Python proof" in ticket_text
    assert "Python cannot" in ticket_text
    assert "no-gap payload-ledger waiver" in ticket_text
    assert "Python work paused" in ticket_text
