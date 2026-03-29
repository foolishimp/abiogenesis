# Validates: REQ-R-ABG2-SELFHOSTING-002
from __future__ import annotations

import json
import importlib
import os
import re
import subprocess
import sys
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
PYTHON_TENANT_ROOT = REPO_ROOT / "build_tenants" / "abiogenesis" / "python"
PYTHON_CODE_ROOT = PYTHON_TENANT_ROOT / "code"
PYTHON_TEST_SURFACE_MAP = PYTHON_TENANT_ROOT / "test_env" / "test_surface_map.md"
PYTHON_TEST_ROOT = PYTHON_TENANT_ROOT / "test_env" / "tests"
PYTHON_GTL_ROOT = PYTHON_CODE_ROOT / "gtl"
PYTHON_GENESIS_ROOT = PYTHON_CODE_ROOT / "genesis"
PYTHON_DESIGN_ROOT = REPO_ROOT / "build_tenants" / "abiogenesis" / "python" / "design"
COMMON_DESIGN_ROOT = REPO_ROOT / "build_tenants" / "common" / "design"
COMMON_QUALIFICATION_ROOT = REPO_ROOT / "build_tenants" / "common" / "qualification"

REQUIREMENT_FILES = sorted(path for path in REQUIREMENTS_ROOT.glob("*/*.md") if path.name.startswith("REQ-"))
ADR_FILES = sorted(PYTHON_DESIGN_ROOT.glob("adrs/ADR-*.md"))
STRUCTURAL_DESIGN_FILES = sorted(PYTHON_DESIGN_ROOT.glob("GTL_2_*.md"))
COMMON_STRUCTURAL_DESIGN_FILES = [
    COMMON_DESIGN_ROOT / "module_decomp.md",
    COMMON_DESIGN_ROOT / "design_surface_map.md",
]
COMMON_MODULE_SURFACES = sorted((COMMON_DESIGN_ROOT / "modules").glob("*.yml"))
COMMON_QUALIFICATION_FILES = [COMMON_QUALIFICATION_ROOT / "qualification_surface_map.md"]
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


def _package_requirement_keys() -> set[str]:
    module = importlib.import_module("gtl_spec.packages.abiogenesis")
    requirements = getattr(module.module, "metadata", {}).get("requirements", [])
    return set(requirements)


def _is_known_requirement_ref(ref: str, families: set[str]) -> bool:
    return any(ref == family or ref.startswith(f"{family}-") for family in families)


def _section_covers_requirement_ref(ref: str, section_refs: set[str]) -> bool:
    return any(
        ref == section_ref
        or ref.startswith(f"{section_ref}-")
        or section_ref.startswith(f"{ref}-")
        for section_ref in section_refs
    )


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


def _python_env() -> dict[str, str]:
    env = os.environ.copy()
    path_entries = [str(PYTHON_CODE_ROOT), str(PYTHON_TEST_ROOT)]
    current = env.get("PYTHONPATH")
    if current:
        path_entries.append(current)
    env["PYTHONPATH"] = ":".join(path_entries)
    return env


def _run_genesis_json(*args: str) -> dict[str, object]:
    completed = subprocess.run(
        [sys.executable, "-m", "genesis", *args],
        cwd=REPO_ROOT,
        env=_python_env(),
        capture_output=True,
        text=True,
        check=False,
    )
    assert completed.returncode == 0, (
        f"genesis {' '.join(args)} failed\n"
        f"stdout:\n{completed.stdout}\n"
        f"stderr:\n{completed.stderr}"
    )
    try:
        return json.loads(completed.stdout)
    except json.JSONDecodeError as exc:
        raise AssertionError(
            f"genesis {' '.join(args)} did not return JSON\nstdout:\n{completed.stdout}"
        ) from exc


def _requirement_metadata(path: Path) -> tuple[str | None, str | None]:
    text = _read(path)
    return _metadata_value(text, "Status"), _metadata_value(text, "Category")


def _active_capability_requirement_families() -> set[str]:
    families: set[str] = set()
    for group in ("gtl", "abg"):
        for path in sorted((REQUIREMENTS_ROOT / group).glob("REQ-*.md")):
            status, category = _requirement_metadata(path)
            if status == "Active" and category == "Capability":
                families.add(path.stem)
    return families


def _tagged_requirement_refs(root: Path, marker: str) -> set[str]:
    refs: set[str] = set()
    pattern = re.compile(
        rf"^\s*#\s*{re.escape(marker)}:\s*(REQ-[A-Z]-[A-Z0-9]+(?:-[A-Z0-9]+)*)",
        re.MULTILINE,
    )
    for path in sorted(root.rglob("*.py")):
        if path.name == "__init__.py":
            continue
        refs.update(pattern.findall(_read(path)))
    return refs


def _test_surface_map_sections() -> dict[str, str]:
    text = _read(PYTHON_TEST_SURFACE_MAP)
    parts = re.split(r"^### (test_[^\n]+\.py)\s*$", text, flags=re.MULTILINE)
    sections: dict[str, str] = {}
    for i in range(1, len(parts), 2):
        sections[parts[i].strip()] = parts[i + 1]
    return sections


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


def test_shared_common_design_surfaces_trace_to_live_requirement_families() -> None:
    families = _live_requirement_families()

    for path in COMMON_STRUCTURAL_DESIGN_FILES:
        assert path.exists(), f"missing shared design surface {path}"
        text = _read(path)
        req_refs = REQ_REF_RE.findall(text)
        assert req_refs, f"{path.name} does not name any live requirement families"
        for ref in req_refs:
            assert _is_known_requirement_ref(ref, families), f"{path.name} references unknown requirement ref {ref}"

        derives = _metadata_value(text, "Derived from") or _metadata_value(text, "Derives from")
        assert derives, f"{path.name} is missing derived-from metadata"
        links = _resolve_links(derives, path)
        assert links, f"{path.name} has no resolvable authority links in its derived-from metadata"
        for link in links:
            assert link.exists(), f"{path.name} links to missing authority surface {link}"

    for path in COMMON_MODULE_SURFACES:
        assert path.exists(), f"missing shared module surface {path}"
        text = _read(path)
        req_refs = REQ_REF_RE.findall(text)
        assert req_refs, f"{path.name} does not name any live requirement families"
        for ref in req_refs:
            assert _is_known_requirement_ref(ref, families), f"{path.name} references unknown requirement ref {ref}"


def test_shared_common_qualification_surfaces_trace_to_live_requirement_families() -> None:
    families = _live_requirement_families()

    for path in COMMON_QUALIFICATION_FILES:
        assert path.exists(), f"missing shared qualification surface {path}"
        text = _read(path)
        req_refs = REQ_REF_RE.findall(text)
        assert req_refs, f"{path.name} does not name any live requirement families"
        for ref in req_refs:
            assert _is_known_requirement_ref(ref, families), f"{path.name} references unknown requirement ref {ref}"

        derives = _metadata_value(text, "Derived from") or _metadata_value(text, "Derives from")
        assert derives, f"{path.name} is missing derived-from metadata"
        links = _resolve_links(derives, path)
        assert links, f"{path.name} has no resolvable authority links in its derived-from metadata"
        for link in links:
            assert link.exists(), f"{path.name} links to missing authority surface {link}"


def test_python_test_surface_map_covers_existing_tests_with_requirement_and_design_trace() -> None:
    families = _live_requirement_families()
    known_refs = families | _package_requirement_keys()
    sections = _test_surface_map_sections()
    test_files = sorted(path for path in PYTHON_TEST_ROOT.glob("test_*.py"))

    assert PYTHON_TEST_SURFACE_MAP.exists(), f"missing test surface map {PYTHON_TEST_SURFACE_MAP}"
    assert len(sections) == len(test_files), "test surface map does not cover the full python test corpus"

    for path in test_files:
        section = sections.get(path.name)
        assert section is not None, f"{path.name} is missing from test surface map"

        section_req_refs = set(REQ_REF_RE.findall(section))
        assert section_req_refs, f"{path.name} has no requirement trace in test surface map"
        for ref in section_req_refs:
            assert _is_known_requirement_ref(ref, known_refs), (
                f"{path.name} references unknown requirement ref {ref} in test surface map"
            )

        links = _resolve_links(section, PYTHON_TEST_SURFACE_MAP)
        assert links, f"{path.name} has no design links in test surface map"
        for link in links:
            assert link.exists(), f"{path.name} links to missing design surface {link}"

        file_validates = set(re.findall(r"^#\s*Validates:\s*(REQ-[A-Z]-[A-Z0-9]+(?:-[A-Z0-9]+)*)", _read(path), re.MULTILINE))
        missing = sorted(ref for ref in file_validates if not _section_covers_requirement_ref(ref, section_req_refs))
        assert not missing, f"{path.name} is missing validated requirement refs in test surface map: {missing}"


def test_python_tenant_requirement_and_test_coverage_gate_is_green() -> None:
    checks = (
        (
            "check-tags",
            "--type",
            "implements",
            "--path",
            "build_tenants/abiogenesis/python/code/gtl/",
        ),
        (
            "check-tags",
            "--type",
            "implements",
            "--path",
            "build_tenants/abiogenesis/python/code/genesis/",
        ),
        (
            "check-tags",
            "--type",
            "validates",
            "--path",
            "build_tenants/abiogenesis/python/test_env/tests/",
        ),
    )

    for command in checks:
        result = _run_genesis_json(*command)
        assert result.get("passes") is True, f"coverage gate failed for {' '.join(command)}: {result}"

    families = _active_capability_requirement_families()
    code_refs = _tagged_requirement_refs(PYTHON_GTL_ROOT, "Implements") | _tagged_requirement_refs(
        PYTHON_GENESIS_ROOT, "Implements"
    )
    test_refs = _tagged_requirement_refs(PYTHON_TEST_ROOT, "Validates")

    missing_impl = sorted(family for family in families if family not in code_refs)
    missing_validates = sorted(family for family in families if family not in test_refs)
    assert not missing_impl, f"missing implementation trace coverage for capability families: {missing_impl}"
    assert not missing_validates, (
        f"missing test trace coverage for capability families: {missing_validates}"
    )


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
