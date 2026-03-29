# Validates: REQ-R-ABG2-SELFHOSTING-002
from __future__ import annotations

import re
from pathlib import Path

CATEGORY_VALUES = {
    "Capability",
    "Constraint / Guarantee",
    "Governance",
    "Verification",
}
INTENT_REF_RE = re.compile(r"\bINT(?:-GTL2)?-\d{3}[A-Z]?\b")
REQ_REF_RE = re.compile(r"\bREQ-[A-Z]-[A-Z0-9]+(?:-[A-Z0-9]+)*\b")
LINK_RE = re.compile(r"\[[^\]]+\]\(([^)]+)\)")


def _repo_root() -> Path:
    current = Path(__file__).resolve()
    for candidate in current.parents:
        if (candidate / "specification").is_dir() and (candidate / "build_tenants").is_dir():
            return candidate
    raise AssertionError("unable to locate abiogenesis repo root from test path")


REPO_ROOT = _repo_root()
SPEC_ROOT = REPO_ROOT / "specification"
REQUIREMENTS_ROOT = SPEC_ROOT / "requirements"
PYTHON_DESIGN_ROOT = REPO_ROOT / "build_tenants" / "abiogenesis" / "python" / "design"
COMMON_DESIGN_ROOT = REPO_ROOT / "build_tenants" / "common" / "design"

REQUIREMENT_FILES = sorted(path for path in REQUIREMENTS_ROOT.glob("*/*.md") if path.name.startswith("REQ-"))
ADR_FILES = sorted(PYTHON_DESIGN_ROOT.glob("adrs/ADR-*.md"))
STRUCTURAL_DESIGN_FILES = sorted(PYTHON_DESIGN_ROOT.glob("GTL_2_*.md"))
COMMON_MODULE_SURFACES = [COMMON_DESIGN_ROOT / "module_decomp.md"] + sorted((COMMON_DESIGN_ROOT / "modules").glob("*.yml"))
SCENARIO_DESIGN_FILES = sorted(PYTHON_DESIGN_ROOT.glob("SCENARIO_V2_*.md")) + [
    PYTHON_DESIGN_ROOT / "GSDLC_LITE_ABG_1_0_QUALIFICATION_LADDER.md"
]


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _metadata_value(text: str, label: str) -> str | None:
    match = re.search(rf"^\*\*{re.escape(label)}\*\*:\s*(.+)$", text, re.MULTILINE)
    if match:
        return match.group(1).strip()
    return None


def _known_intent_ids() -> set[str]:
    ids: set[str] = set()
    for path in (SPEC_ROOT / "INTENT.md", SPEC_ROOT / "GTL_2_CONSTITUTIONAL_DESIGN.md"):
        ids.update(INTENT_REF_RE.findall(_read(path)))
    return ids


def _live_requirement_families() -> set[str]:
    return {path.stem for path in REQUIREMENT_FILES}


def _is_known_requirement_ref(ref: str, families: set[str]) -> bool:
    return any(ref == family or ref.startswith(f"{family}-") for family in families)


def _resolve_links(text: str, base: Path) -> list[Path]:
    resolved: list[Path] = []
    for target in LINK_RE.findall(text):
        if target.startswith("http://") or target.startswith("https://"):
            continue
        if target.startswith("/"):
            resolved.append(Path(target))
        else:
            resolved.append((base.parent / target).resolve())
    return resolved


def test_requirement_families_have_method_metadata_and_live_intent_refs() -> None:
    known_intents = _known_intent_ids()
    assert known_intents, "no intent ids discovered in abiogenesis constitutional sources"

    for path in REQUIREMENT_FILES:
        text = _read(path)
        status = _metadata_value(text, "Status")
        category = _metadata_value(text, "Category")
        date = _metadata_value(text, "Date")
        derives = _metadata_value(text, "Derives from")

        assert status, f"{path.name} is missing **Status** metadata"
        assert category in CATEGORY_VALUES, f"{path.name} has unknown category: {category!r}"
        assert date, f"{path.name} is missing **Date** metadata"
        assert derives, f"{path.name} is missing **Derives from** metadata"

        intent_refs = INTENT_REF_RE.findall(derives)
        assert intent_refs or "SPEC_METHOD.md" in derives, (
            f"{path.name} derives from neither a live intent id nor SPEC_METHOD authority"
        )
        for ref in intent_refs:
            assert ref in known_intents, f"{path.name} derives from unknown intent id {ref}"
        if "SPEC_METHOD.md" in derives:
            assert (SPEC_ROOT / "SPEC_METHOD.md").is_file(), "SPEC_METHOD.md missing from specification root"


def test_adrs_implement_live_requirement_families() -> None:
    families = _live_requirement_families()
    assert families, "no live requirement families discovered"

    for path in ADR_FILES:
        text = _read(path)
        implements = _metadata_value(text, "Implements")
        assert implements, f"{path.name} is missing **Implements** metadata"
        refs = REQ_REF_RE.findall(implements)
        assert refs, f"{path.name} does not name any live requirement authority in **Implements**"
        for ref in refs:
            assert _is_known_requirement_ref(ref, families), f"{path.name} implements unknown requirement ref {ref}"


def test_structural_design_docs_trace_to_live_requirement_surfaces() -> None:
    families = _live_requirement_families()

    for path in STRUCTURAL_DESIGN_FILES:
        text = _read(path)
        derives = _metadata_value(text, "Derived from") or _metadata_value(text, "Derives from")
        assert derives, f"{path.name} is missing derived-from metadata"

        links = _resolve_links(derives, path)
        assert links, f"{path.name} has no resolvable authority links in its derived-from metadata"
        for link in links:
            assert link.exists(), f"{path.name} links to missing authority surface {link}"

        req_refs = REQ_REF_RE.findall(text)
        has_requirement_root_ref = "specification/requirements/" in text
        assert req_refs or has_requirement_root_ref, (
            f"{path.name} does not reference live requirement authority"
        )
        for ref in req_refs:
            assert _is_known_requirement_ref(ref, families), f"{path.name} references unknown requirement ref {ref}"


def test_shared_module_surfaces_trace_to_live_requirement_families() -> None:
    families = _live_requirement_families()

    for path in COMMON_MODULE_SURFACES:
        assert path.exists(), f"missing shared module surface {path}"
        text = _read(path)
        req_refs = REQ_REF_RE.findall(text)
        assert req_refs or path.name == "module_decomp.md", f"{path.name} does not name any live requirement families"
        for ref in req_refs:
            assert _is_known_requirement_ref(ref, families), f"{path.name} references unknown requirement ref {ref}"

        if path.suffix == ".md":
            derives = _metadata_value(text, "Derived from") or _metadata_value(text, "Derives from")
            assert derives, f"{path.name} is missing derived-from metadata"
            links = _resolve_links(derives, path)
            assert links, f"{path.name} has no resolvable authority links in its derived-from metadata"
            for link in links:
                assert link.exists(), f"{path.name} links to missing authority surface {link}"


def test_scenario_design_surfaces_trace_to_intent_and_method() -> None:
    for path in SCENARIO_DESIGN_FILES:
        text = _read(path)
        derives = _metadata_value(text, "Derives from")
        assert derives, f"{path.name} is missing **Derives from** metadata"

        links = _resolve_links(derives, path)
        assert links, f"{path.name} has no resolvable authority links in its derives-from metadata"
        for link in links:
            assert link.exists(), f"{path.name} links to missing authority surface {link}"

        if path.name.startswith("SCENARIO_V2_"):
            assert "INTENT.md" in derives, f"{path.name} must derive from INTENT.md"
            assert "SPEC_METHOD.md" in derives, f"{path.name} must derive from SPEC_METHOD.md"
        assert "REQ-" in text or "requirements ->" in text or "intent ->" in text, (
            f"{path.name} does not expose a clear constitutional traversal surface"
        )
