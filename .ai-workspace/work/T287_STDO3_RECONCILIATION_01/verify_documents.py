"""Focused checks for the exact reconciliation delta; no runtime execution."""
from pathlib import Path
import difflib
import hashlib
import json
import re
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[3]
WORK = Path(__file__).resolve().parent
METHOD = Path("/Users/jim/Library/Application Support/STDO/releases/v3.0.0-rc.1/standards")
checks = []


def check(name, passed, detail=None):
    checks.append({"check": name, "passed": bool(passed), "detail": detail})


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else None


root_preimages = json.loads((WORK / "root-preimages.json").read_text())
product_preimages = json.loads((WORK / "product-writer/preimages.json").read_text())["files"]
preimages = {
    row["path"]: WORK / "root-preimages" / row["path"]
    for row in root_preimages
}
preimages.update({
    row["path"]: WORK / "product-writer/preimages" / row["path"]
    for row in product_preimages
})
preimages["build_tenants/abiogenesis/typescript/design/M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md"] = (
    WORK / "calculus-writer/M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.preimage.md"
)
new_paths = {
    "build_tenants/abiogenesis/typescript/design/ABI5_STDO3_COMPUTATIONAL_BINDING.md",
    ".ai-workspace/comments/codex/20261021_STDO3_ABG5_RECONCILIATION.md",
}
changed_paths = sorted(set(preimages) | new_paths)


def anchors(path):
    result = set()
    in_fence = False
    for line in path.read_text().splitlines():
        if line.startswith("```"):
            in_fence = not in_fence
        if in_fence:
            continue
        match = re.match(r"^#{1,6}\s+(.+?)\s*#*\s*$", line)
        if match:
            title = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", match[1])
            title = re.sub(r"[^\w\s-]", "", title.lower()).replace(" ", "-")
            result.add(title)
        result.update(re.findall(r'<a\s+(?:name|id)=["\']([^"\']+)', line))
    return result


link_pattern = re.compile(r"(?<!!)\[[^\]\n]*\]\((?:<([^>]+)>|([^\s)]+))\)")
checked_links = []
for rel in changed_paths:
    path = ROOT / rel
    check("exists:" + rel, path.is_file())
    if not path.is_file():
        continue
    before = preimages[rel].read_text().splitlines() if rel in preimages else []
    after = path.read_text().splitlines()
    added = [line[2:] for line in difflib.ndiff(before, after) if line.startswith("+ ")]
    check("added-whitespace:" + rel, all(s.rstrip() == s for s in added))
    for match in link_pattern.finditer("\n".join(added)):
        uri = unquote(match[1] or match[2])
        if uri.startswith(("https://", "http://", "mailto:")):
            continue
        target, _, anchor = uri.partition("#")
        if target.startswith("stdo://releases/v3.0.0-rc.1/standards/"):
            dest = METHOD / target.split("/standards/", 1)[1]
        elif target.startswith("repo://abiogenesis/"):
            dest = ROOT / target.removeprefix("repo://abiogenesis/")
        elif "://" in target:
            check("unsupported-link:" + rel, False, uri)
            continue
        else:
            dest = (path.parent / target).resolve() if target else path
        exists = dest.exists()
        valid_anchor = not anchor or (dest.is_file() and anchor in anchors(dest))
        check("link:" + rel, exists and valid_anchor, uri)
        checked_links.append(uri)

initial = json.loads((WORK / "basis.json").read_text())
preserved = []
for row in initial["files"]:
    if row["path"] in changed_paths:
        continue
    ok = digest(ROOT / row["path"]) == row["sha256"]
    check("unrelated-source:" + row["path"], ok)
    preserved.append(row["path"])
for row in initial["preexisting_dirty"]:
    if row["path"] not in changed_paths:
        check("preexisting-dirty:" + row["path"], digest(ROOT / row["path"]) == row["sha256"])

ticket = (ROOT / ".ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md").read_text()
check("one-current-delivery-plan", ticket.count("\n## Current Delivery Plan\n") == 1)
old_ticket = preimages[".ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md"].read_text()
old_header = old_ticket.split("\n\n", 1)[1].split("## Current integration design constraint")[0]
check("historical-routing-preserved", old_header.rstrip() in ticket)
check("historical-routing-fenced", "```text\n- id: T-287" in ticket and "```\n\n## Prior Execution And Design Records" in ticket)

requirements = sorted((ROOT / "specification/requirements").glob("*/REQ-*.md"))
missing = []
for path in requirements:
    text = path.read_text()
    index = (path.parent / "README.md").read_text()
    if "Status" not in text or "Category" not in text or path.name not in index:
        missing.append(str(path.relative_to(ROOT)))
check("requirement-classification-and-index", not missing, {"families": len(requirements), "missing": missing})

check("all-selected-families-routed", all(
    f"F{n:02}" in (ROOT / "build_tenants/abiogenesis/typescript/design/ABI5_STDO3_COMPUTATIONAL_BINDING.md").read_text()
    for n in [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14, 15, 16, 17]
) if (ROOT / "build_tenants/abiogenesis/typescript/design/ABI5_STDO3_COMPUTATIONAL_BINDING.md").exists() else False)

result = {
    "checks": checks,
    "changed_paths": changed_paths,
    "counts": {
        "checks": len(checks),
        "passed": sum(c["passed"] for c in checks),
        "links": len(checked_links),
        "unrelated_source_files_preserved": len(preserved),
    },
}
(WORK / "document-checks.json").write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps({"counts": result["counts"], "failures": [c for c in checks if not c["passed"]]}, indent=2))
raise SystemExit(0 if all(c["passed"] for c in checks) else 1)
