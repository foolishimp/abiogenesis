"""Verify the bounded library-design delta without executing the runtime."""
from pathlib import Path
from urllib.parse import unquote
import difflib
import hashlib
import json
import re

WORK = Path(__file__).resolve().parent
ROOT = WORK.parents[2]
METHOD = Path("/Users/jim/Library/Application Support/STDO/releases/v3.0.0-rc.1/standards")
preimages = {
    row["path"]: WORK / "root-preimages" / row["path"]
    for row in json.loads((WORK / "root-preimages.json").read_text())
}
new_design = "build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md"
changed = sorted([*preimages, new_design])
checks = []


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else None


def check(name, valid, detail=None):
    checks.append({"check": name, "passed": bool(valid), "detail": detail})


def anchors(path):
    found = set()
    fence = False
    for line in path.read_text().splitlines():
        if line.startswith("```"):
            fence = not fence
        if fence:
            continue
        match = re.match(r"^#{1,6}\s+(.+?)\s*#*\s*$", line)
        if match:
            title = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", match[1])
            found.add(re.sub(r"[^\w\s-]", "", title.lower()).replace(" ", "-"))
        found.update(re.findall(r'<a\s+(?:id|name)=["\']([^"\']+)', line))
    return found


links = 0
for name in changed:
    path = ROOT / name
    check("exists:" + name, path.is_file())
    if not path.is_file():
        continue
    before = preimages[name].read_text().splitlines() if name in preimages else []
    after = path.read_text().splitlines()
    added = [line[2:] for line in difflib.ndiff(before, after) if line.startswith("+ ")]
    check("added-whitespace:" + name, all(line.rstrip() == line for line in added))
    for match in re.finditer(r"(?<!!)\[[^\]\n]*\]\((?:<([^>]+)>|([^\s)]+))\)", "\n".join(added)):
        uri = unquote(match[1] or match[2])
        if uri.startswith(("http://", "https://", "mailto:")):
            continue
        target, _, anchor = uri.partition("#")
        if target.startswith("stdo://releases/v3.0.0-rc.1/standards/"):
            dest = METHOD / target.split("/standards/", 1)[1]
        elif target.startswith("repo://abiogenesis/"):
            dest = ROOT / target.removeprefix("repo://abiogenesis/")
        elif "://" in target:
            check("unresolved-basis-link:" + name, False, uri)
            continue
        else:
            dest = (path.parent / target).resolve() if target else path
        valid = dest.exists() and (not anchor or (dest.is_file() and anchor in anchors(dest)))
        check("reference:" + name, valid, uri)
        links += 1

basis = json.loads((WORK / "basis.json").read_text())
preserved = [row for row in basis["files"] if row["path"] not in changed]
for row in preserved:
    check("preserved-source:" + row["path"], digest(ROOT / row["path"]) == row["sha256"])
for row in basis["preexisting_dirty"]:
    if row["path"] not in changed:
        check("preserved-dirty:" + row["path"], digest(ROOT / row["path"]) == row["sha256"])

supplements = {
    "build_tenants/abiogenesis/typescript/package.json": "17cefea93264afda099d65b81443bd9461f5b7b6c99484bb1d1cde4f8061b6c9",
    "build_tenants/abiogenesis/typescript/package-lock.json": "df8d50ad51f46c58d9a38bcc3dd864de0e43337dc8990886b93ad46ab298ef12",
}
for name, expected in supplements.items():
    check("foundation-source:" + name, digest(ROOT / name) == expected)

ticket = ".ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md"
current = (ROOT / ticket).read_text()
prior = preimages[ticket].read_text()
marker = "## Historical Routing Snapshot\n"
check("one-current-delivery-plan", current.count("\n## Current Delivery Plan\n") == 1)
check("historical-ticket-tail-preserved", current.split(marker, 1)[1] == prior.split(marker, 1)[1])
check("library-design-precedes-application",
      current.index("| Common computational capability library design |") <
      current.index("| Apply library design to D1/D4 boundaries |"))

old_freeze = json.loads((ROOT / basis["prior_accepted_reconciliation"]).read_text())
for row in old_freeze["files"]:
    retained = preimages.get(row["path"], ROOT / row["path"])
    check("prior-accepted-cut-retained:" + row["path"], digest(retained) == row["sha256"])

result = {
    "changed_paths": changed,
    "counts": {
        "checks": len(checks),
        "passed": sum(row["passed"] for row in checks),
        "references": links,
        "unrelated_source_files_preserved": len(preserved),
        "unchanged_production_typescript_files": sum(
            row["path"].startswith("build_tenants/abiogenesis/typescript/code/src/")
            and row["path"].endswith(".ts") for row in preserved
        ),
    },
    "checks": checks,
    "scope": "Document references, exact identity and preservation only; no runtime or semantic outcome proof.",
}
(WORK / "document-checks.json").write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps(result["counts"], indent=2))
failures = [row for row in checks if not row["passed"]]
for row in failures:
    print(json.dumps(row))
raise SystemExit(bool(failures))
