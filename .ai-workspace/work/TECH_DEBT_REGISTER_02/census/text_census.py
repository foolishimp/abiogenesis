#!/usr/bin/env python3
"""Text-level census of the TypeScript tenant: tests, support, fixtures, scripts,
design notes, comment markers, environment variables and duplicated blocks.

Usage: python3 text_census.py <repoRoot> <outDir> [suite.tap]

It reads files and git history only. Outputs are JSON files in <outDir>.
"""
import collections, hashlib, json, os, re, subprocess, sys

repo = os.path.abspath(sys.argv[1])
out = os.path.abspath(sys.argv[2])
tap = sys.argv[3] if len(sys.argv) > 3 else None
T = os.path.join(repo, "build_tenants/abiogenesis/typescript")
os.makedirs(out, exist_ok=True)
SKIP = {"node_modules", "build", "dist", ".git", "test_runs", "evidence", "proof", "artifacts"}


def walk(root, exts):
    for d, dirs, files in os.walk(root):
        dirs[:] = [x for x in dirs if x not in SKIP]
        for f in files:
            if f.endswith(exts):
                yield os.path.join(d, f)


def read(p):
    try:
        if os.path.getsize(p) > 4_000_000:
            return ""
        with open(p, encoding="utf-8", errors="replace") as fh:
            return fh.read()
    except OSError:
        return ""


def rel(p):
    return os.path.relpath(p, T)


def dump(name, value):
    with open(os.path.join(out, name), "w", encoding="utf-8") as fh:
        json.dump(value, fh, indent=1, sort_keys=True)


src = sorted(walk(os.path.join(T, "code/src"), (".ts",)))
tests = sorted(p for p in walk(os.path.join(T, "test_env/tests"), (".mjs",)))
test_side = sorted(walk(os.path.join(T, "test_env"), (".mjs", ".ts", ".js", ".cjs"))) + sorted(walk(os.path.join(T, "scripts"), (".mjs",)))
text = {p: read(p) for p in set(src) | set(test_side)}

# ---------------------------------------------------------------- tests
SKIP_CALL = re.compile(r"\b(?:test|it|describe)\.(skip|todo)\b|\bskip\s*:")
ENV = re.compile(r"process\.env\.([A-Z][A-Z0-9_]+)|process\.env\[\s*['\"]([A-Z][A-Z0-9_]+)['\"]\s*\]")
rows = []
for p in tests:
    t = text[p]
    rows.append({
        "file": rel(p), "lines": t.count("\n") + 1,
        "testCalls": len(re.findall(r"^\s*(?:await\s+)?(?:test|it)\(", t, re.M)),
        "skipSites": len(SKIP_CALL.findall(t)),
        "env": sorted({a or b for a, b in ENV.findall(t)}),
        "importsBuild": sorted(set(re.findall(r"build/code/src/([a-z_0-9/]+)\.js", t))),
        "spawnsProcess": bool(re.search(r"child_process|spawn\(|execFile", t)),
    })
dump("tests.json", rows)

scripts_pkg = json.load(open(os.path.join(T, "package.json")))["scripts"]
named = set(re.findall(r"test_env/tests/([A-Za-z0-9_.-]+\.test\.mjs)", " ".join(scripts_pkg.values())))
dump("tests-not-in-any-npm-script.json", sorted(os.path.basename(p) for p in tests if os.path.basename(p) not in named))

if tap and os.path.exists(tap):
    reasons = collections.Counter()
    slow = []
    for line in open(tap, encoding="utf-8", errors="replace"):
        m = re.search(r"# SKIP\s*(.*)$", line)
        if m:
            reasons[re.sub(r"[0-9a-f]{8,}|/[^ ]+", "…", m.group(1).strip())[:140]] += 1
        m = re.match(r"\s*[✔✖]\s+(.*) \(([0-9.]+)ms\)\s*$", line)
        if m and float(m.group(2)) > 60000:
            slow.append({"test": m.group(1)[:160], "seconds": round(float(m.group(2)) / 1000)})
    dump("suite-skip-reasons.json", reasons.most_common())
    dump("suite-slow-tests.json", sorted(slow, key=lambda r: -r["seconds"])[:80])

# ---------------------------------------------------------------- support, fixtures, scripts
def referenced(basename, universe):
    stem = re.escape(basename)
    return sum(1 for p in universe if re.search(stem, text.get(p, "")))


support = sorted(walk(os.path.join(T, "test_env/support"), (".mjs", ".ts", ".js")))
dump("support-unreferenced.json", sorted(rel(p) for p in support if referenced(os.path.basename(p), [q for q in test_side if q != p]) == 0))
fixtures_root = os.path.join(T, "test_env/fixtures")
fixture_units = sorted(os.listdir(fixtures_root)) if os.path.isdir(fixtures_root) else []
dump("fixtures-unreferenced.json", sorted(u for u in fixture_units if referenced(u, [q for q in test_side if os.sep + "fixtures" + os.sep + u not in q]) == 0))
script_files = sorted(os.listdir(os.path.join(T, "scripts")))
all_text_for_scripts = " ".join(scripts_pkg.values()) + " ".join(text[p] for p in test_side)
dump("scripts.json", [{"script": s, "inNpmScripts": s in " ".join(scripts_pkg.values()), "mentions": all_text_for_scripts.count(s)} for s in script_files])
dump("npm-scripts.json", scripts_pkg)

# ---------------------------------------------------------------- design notes
design_dir = os.path.join(T, "design")
design = sorted(p for p in walk(design_dir, (".md",)))
last = {}
try:
    log = subprocess.run(["git", "-C", repo, "log", "--name-only", "--format=@%cs", "--", os.path.relpath(design_dir, repo)],
                         capture_output=True, text=True, check=True).stdout
    date = None
    for line in log.splitlines():
        if line.startswith("@"):
            date = line[1:]
        elif line.strip() and line not in last:
            last[line.strip()] = date
except Exception as exc:  # pragma: no cover
    last = {"error": str(exc)}
spec_files = sorted(walk(os.path.join(repo, "specification"), (".md",)))
other = {p: read(p) for p in spec_files + design}
ticket_dir = os.path.join(repo, ".ai-workspace/tickets/active")
tickets = {p: read(p) for p in walk(ticket_dir, (".md",))} if os.path.isdir(ticket_dir) else {}
src_blob = "\n".join(text[p] for p in src)
test_blob = "\n".join(text[p] for p in test_side)
PATHREF = re.compile(r"`((?:code/src|test_env|scripts|design|contracts)/[A-Za-z0-9_./-]+\.[a-z]+)")
drows = []
for p in design:
    name = os.path.basename(p)
    body = other[p]
    dangling = sorted({r for r in PATHREF.findall(body) if not os.path.exists(os.path.join(T, r))})
    drows.append({
        "file": name, "lines": body.count("\n") + 1, "lastCommit": last.get(os.path.relpath(p, repo)),
        "mentionedInSource": src_blob.count(name), "mentionedInTests": test_blob.count(name),
        "mentionedInSpecification": sum(1 for q in spec_files if name in other[q]),
        "mentionedInOtherDesign": sum(1 for q in design if q != p and name in other[q]),
        "mentionedInActiveTickets": sum(1 for q in tickets if name in tickets[q]),
        "danglingPathRefs": dangling[:12], "danglingPathRefCount": len(dangling),
        "status": (re.search(r"^\*\*Status\*\*:\s*(.+)$", body, re.M) or re.search(r"^- status:\s*(.+)$", body, re.M) or [None, None])[1],
    })
dump("design.json", drows)

# ---------------------------------------------------------------- markers and env vars in source
MARK = re.compile(r"\b(TODO|FIXME|XXX|HACK|legacy|deprecated|compat(?:ibility)?|temporary|for now|no longer|historical|retired|superseded|obsolete|workaround|unused|dead code)\b", re.I)
marks = collections.Counter()
sites = []
for p in src:
    for n, line in enumerate(text[p].splitlines(), 1):
        if "//" not in line and "*" not in line:
            continue
        comment = line[line.find("//"):] if "//" in line else line
        for m in MARK.findall(comment):
            marks[m.lower()] += 1
            sites.append({"file": rel(p), "line": n, "marker": m.lower(), "text": line.strip()[:200]})
dump("markers.json", {"counts": marks.most_common(), "sites": sites})
env_src = collections.defaultdict(set)
env_test = collections.defaultdict(set)
for p in src:
    for a, b in ENV.findall(text[p]):
        env_src[a or b].add(rel(p))
for p in test_side:
    for a, b in ENV.findall(text[p]):
        env_test[a or b].add(rel(p))
dump("env.json", {"source": {k: sorted(v) for k, v in env_src.items()},
                  "testSide": {k: len(v) for k, v in sorted(env_test.items())}})

# ---------------------------------------------------------------- duplicated blocks in source
WINDOW = 10
norm = {}
for p in src:
    lines = []
    for n, line in enumerate(text[p].splitlines(), 1):
        s = re.sub(r"\s+", " ", line.strip())
        if len(s) < 12 or s.startswith(("//", "*", "/*", "import ", "export {", "} from", "}")):
            continue
        lines.append((n, s))
    norm[p] = lines
index = collections.defaultdict(list)
for p, lines in norm.items():
    for i in range(len(lines) - WINDOW + 1):
        h = hashlib.blake2b("\n".join(s for _, s in lines[i:i + WINDOW]).encode(), digest_size=8).digest()
        index[h].append((p, i))
pairs = collections.defaultdict(list)  # (fileA, fileB) -> window starts
for h, occ in index.items():
    if 2 <= len(occ) <= 6:
        for a in range(len(occ)):
            for b in range(a + 1, len(occ)):
                (pa, ia), (pb, ib) = occ[a], occ[b]
                if pa == pb and abs(ia - ib) < WINDOW:
                    continue
                key = (pa, pb) if (pa, ia) <= (pb, ib) else (pb, pa)
                pairs[key].append((ia, ib) if key == (pa, pb) else (ib, ia))
clones = []
for (pa, pb), starts in pairs.items():
    starts.sort()
    run = [starts[0]]
    for s in starts[1:] + [None]:
        if s is not None and s[0] == run[-1][0] + 1 and s[1] == run[-1][1] + 1:
            run.append(s)
            continue
        length = len(run) + WINDOW - 1
        clones.append({"a": rel(pa), "aLine": norm[pa][run[0][0]][0], "b": rel(pb), "bLine": norm[pb][run[0][1]][0], "normalizedLines": length})
        if s is not None:
            run = [s]
clones.sort(key=lambda c: -c["normalizedLines"])
dump("clones.json", clones[:400])
dup_by_pair = collections.Counter()
for c in clones:
    dup_by_pair[(c["a"], c["b"])] += c["normalizedLines"]
dump("clones-by-file-pair.json", [{"a": a, "b": b, "normalizedLines": n} for (a, b), n in dup_by_pair.most_common(80)])

print(json.dumps({
    "sourceFiles": len(src), "testFiles": len(tests), "testSideFiles": len(test_side),
    "testsNotInAnyNpmScript": sum(1 for p in tests if os.path.basename(p) not in named),
    "designNotes": len(design), "designNeverMentionedAnywhere": sum(1 for d in drows if d["mentionedInSource"] + d["mentionedInTests"] + d["mentionedInSpecification"] + d["mentionedInOtherDesign"] + d["mentionedInActiveTickets"] == 0),
    "designWithDanglingRefs": sum(1 for d in drows if d["danglingPathRefCount"]),
    "markers": dict(marks.most_common(12)), "envInSource": len(env_src), "envOnTestSide": len(env_test),
    "cloneRegions": len(clones), "cloneLinesTop400": sum(c["normalizedLines"] for c in clones[:400]),
}, indent=1))
