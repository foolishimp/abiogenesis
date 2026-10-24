// Evidence mirrors (register TD-19). A tracked path under .ai-workspace/ is
// never a copy of a repository tree, an install, a build output or a prior
// proof tree: a package record names its cut by commit hash and each finite
// input by path and digest. This check classifies each tracked path under
// .ai-workspace/ by the first segment below .ai-workspace/ that marks a copied
// tree (MARKERS; `code/src` is two segments) and takes the path above that
// segment as the mirror root. The historical roots and their tracked path
// counts are listed in .ai-workspace/evidence/TREE_MIRROR_INVENTORY.json, a
// derived read model this script writes with --write; it is not authority. A
// root absent from the inventory, or a root with more tracked paths than the
// inventory lists, is an offender: a new copy. Fewer is lawful; deletion is a
// later and separate decision. Offenders print as `<root>: <count> ...`; any
// offender exits 1.
//
// Only the index is read: `git ls-files`, and with --write also
// `git cat-file` and `git grep`. No disk walk, no network, no dependency
// outside Node.
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const tenantRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(tenantRoot, "../../..");
const tenantPrefix = "build_tenants/abiogenesis/typescript/";
const WORKSPACE = ".ai-workspace";
const INVENTORY = ".ai-workspace/evidence/TREE_MIRROR_INVENTORY.json";

// Segments that open a copied tree: the repository's own top-level trees
// (`build_tenants`, `specification`, a nested `.ai-workspace`), the tenant's
// top-level trees copied without the tenant prefix (`code/src`, `test_env`)
// and an install (`node_modules`). `contracts` is not one: a package record
// keeps its own run outputs under that name.
const REPOSITORY_MARKERS = ["build_tenants", "specification", ".ai-workspace"];
const TENANT_MARKERS = ["code/src", "test_env"];
const INSTALL_MARKERS = ["node_modules"];
const MARKERS = [...REPOSITORY_MARKERS, ...TENANT_MARKERS, ...INSTALL_MARKERS];
const SINGLE_SEGMENT_MARKERS = new Set(MARKERS.filter((marker) => !marker.includes("/")));

// Records this package writes about the debt itself; they name roots as
// evidence of the debt, not as consumers, and are not counted as references.
const REFERENCE_EXCLUSIONS = [INVENTORY, ".ai-workspace/work/T290_DEBT_WAVE_01/"];

const order = (left, right) => (left < right ? -1 : left > right ? 1 : 0);

function git(args, input) {
  const result = spawnSync("git", ["-C", repositoryRoot, ...args], {
    input: input === undefined ? undefined : Buffer.from(input, "utf8"), maxBuffer: 1024 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  // `git grep` exits 1 when nothing matches.
  if (result.status !== 0 && !(args[0] === "grep" && result.status === 1)) {
    throw new Error(`git ${args[0]} exited ${result.status}: ${result.stderr.toString("utf8").trim()}`);
  }
  return result.stdout;
}

const nulSeparated = (buffer) => buffer.toString("utf8").split("\0").filter((entry) => entry.length > 0);

/** The mirror root and marker of a tracked path, or null when no marker opens a copied tree. */
function classify(path) {
  const segments = path.split("/");
  for (let index = 1; index < segments.length - 1; index++) {
    const segment = segments[index];
    let marker = null;
    if (segment === "code") {
      if (segments[index + 1] === "src" && index + 1 < segments.length - 1) marker = "code/src";
    } else if (SINGLE_SEGMENT_MARKERS.has(segment)) marker = segment;
    if (marker !== null) return { root: segments.slice(0, index).join("/"), marker };
  }
  return null;
}

function rootCounts(paths) {
  const counts = new Map();
  for (const path of paths) {
    const classified = classify(path);
    if (classified !== null) counts.set(classified.root, (counts.get(classified.root) ?? 0) + 1);
  }
  return counts;
}

function check() {
  const counts = rootCounts(nulSeparated(git(["ls-files", "-z", "--", WORKSPACE])));
  const inventory = JSON.parse(readFileSync(join(repositoryRoot, INVENTORY), "utf8"));
  const inventoried = new Map(inventory.roots.map((row) => [row.root, row.paths]));
  const offenders = [];
  for (const [root, count] of [...counts].sort(([left], [right]) => order(left, right))) {
    const listed = inventoried.get(root);
    if (listed === undefined) offenders.push(`${root}: ${count} tracked path(s), not inventoried`);
    else if (count > listed) offenders.push(`${root}: ${count} tracked path(s), ${listed} inventoried`);
  }
  for (const offender of offenders) console.error(offender);
  if (offenders.length > 0) {
    console.error(
      `check-evidence-mirrors: ${offenders.length} mirror root(s) under .ai-workspace hold tracked paths the inventory does not list, a new copy; name the cut by commit hash and each input by path and digest instead`,
    );
    process.exit(1);
  }
  console.log(
    `check-evidence-mirrors: ${counts.size} tracked mirror roots under .ai-workspace, all inventoried; no new copy`,
  );
}

// ---------------------------------------------------------------------------
// --write: the inventory.

/** The owning record: `work/<record>`, `comments/<agent>/<post>`, `evidence/<record>`, `context/<area>/<kind>/<entry>`. */
function ownerOf(root) {
  const segments = root.split("/");
  const depth = segments[1] === "comments" ? 4 : segments[1] === "context" ? 5 : 3;
  return segments.slice(0, Math.min(depth, segments.length - 1)).join("/");
}

// The kind of copy: by what its tracked paths are, then by what the root's
// own path says it holds, then by its markers. A root none of these names,
// whose tree positions are not tracked at this index and whose blobs are not
// tracked elsewhere, is `unclassified`.
const SANDBOX_SEGMENTS = new Set(["sandbox", "worksite", "worksite-result", "supplied-work", "unit-runs", "workspace"]);
const BUILD_SEGMENT = /^(?:build|build-\d+|baseline-build|compiled|compiled-\d+|emitted|dist)$/u;
const INSTALL_SEGMENTS = new Set(["node_modules", "package", "installed", "extracted", "bootstrap", "install"]);

function kindOf(row) {
  const segments = row.root.split("/");
  const below = segments.slice(row.owner.split("/").length);
  if (/^\.ai-workspace\/work\/T287_SANDBOX_UAT_RUN_02\/operator\/[^/]+\/source$/u.test(row.root)) return "uat-run-source";
  if (row.entries.every((entry) => /\.(?:diff|patch)$/u.test(entry.path))) return "patch-layout";
  if (row.entries.every((entry) => posix.basename(entry.path) === ".gitignore")) return "ignore-skeleton";
  if (segments.some((segment) => SANDBOX_SEGMENTS.has(segment))) return "sandbox-worksite";
  if (row.markers.every((marker) => INSTALL_MARKERS.includes(marker)) ||
    below.some((segment) => INSTALL_SEGMENTS.has(segment))) return "install";
  if (below.some((segment) => BUILD_SEGMENT.test(segment))) return "build-output";
  if (row.markers.includes("build_tenants") || row.markers.includes(".ai-workspace")) return "repository-tree";
  if (row.pathsAtHead === 0 && row.pathsDuplicated === 0) return "unclassified";
  return row.markers.includes("specification") ? "repository-tree" : "tenant-tree";
}

function lsFilesStaged(pathspec) {
  const entries = [];
  for (const record of nulSeparated(git(["ls-files", "-s", "-z", "--", ...pathspec]))) {
    const tab = record.indexOf("\t");
    const [mode, oid] = record.slice(0, tab).split(" ");
    entries.push({ mode, oid, path: record.slice(tab + 1) });
  }
  return entries;
}

function objectSizes(oids) {
  const unique = [...new Set(oids)];
  const sizes = new Map();
  if (unique.length === 0) return sizes;
  const lines = git(["cat-file", "--batch-check=%(objectname) %(objectsize)"], unique.join("\n") + "\n")
    .toString("utf8").trim().split("\n");
  for (const line of lines) {
    const [oid, size] = line.split(" ");
    sizes.set(oid, Number(size));
  }
  return sizes;
}

/** Reads blobs from the object store in batches; yields [oid, Buffer]. */
function* readBlobs(oids, sizes) {
  const unique = [...new Set(oids)];
  const budget = 256 * 1024 * 1024;
  for (let start = 0; start < unique.length;) {
    let end = start, total = 0;
    while (end < unique.length && (end === start || total + sizes.get(unique[end]) <= budget)) total += sizes.get(unique[end++]);
    const batch = unique.slice(start, end);
    const output = git(["cat-file", "--batch"], batch.join("\n") + "\n");
    let offset = 0;
    for (const oid of batch) {
      const newline = output.indexOf(10, offset);
      const header = output.subarray(offset, newline).toString("utf8").split(" ");
      const size = Number(header[2]);
      yield [oid, output.subarray(newline + 1, newline + 1 + size)];
      offset = newline + 1 + size + 1;
    }
    start = end;
  }
}

// The cut a root mirrors: the first commit named by a freeze, manifest,
// basis or report file of the owning record, nearest directory first.
const CUT_FILES = [/^freeze\.json$/u, /^source-manifest\.json$/u, /^basis\.json$/u, /^L2-candidate-freeze.*\.json$/u, /^report\.md$/u, /^return\.md$/u];
const HEX_RUN = /(?<![0-9a-f])[0-9a-f]{7,40}(?![0-9a-f])/gu;
const COMMIT_WORD = /commit|head|cut|basis|base/iu;

function cutCandidates(text) {
  const candidates = [];
  text.split("\n").forEach((line, index) => {
    for (const match of line.matchAll(HEX_RUN)) {
      if (match[0].length === 40 || (match[0].length <= 12 && /[a-f]/u.test(match[0]) && COMMIT_WORD.test(line))) {
        candidates.push({ token: match[0], line: index + 1 });
      }
    }
  });
  return candidates;
}

function verifyCommits(tokens) {
  const unique = [...new Set(tokens)];
  const commits = new Map();
  if (unique.length === 0) return commits;
  const lines = git(["cat-file", "--batch-check=%(objectname) %(objecttype)"], unique.map((token) => `${token}^{commit}`).join("\n") + "\n")
    .toString("utf8").trim().split("\n");
  unique.forEach((token, index) => {
    const [oid, type] = lines[index].split(" ");
    if (type === "commit") commits.set(token, oid);
  });
  return commits;
}

// References: a tracked `.md` or `.json` file outside the root's marked trees
// whose text names a path inside it. Two candidate sets: the files that name
// an owning record's directory (`git grep -l -F` over the owners' names, the
// one segment every absolute, repository-relative and .ai-workspace-relative
// mention of a root passes through), and the files outside every mirror
// below a root's parent directory (where a mention relative to the file's own
// directory is written). Each path-like token of a candidate is resolved
// from its .ai-workspace segment, through the owner's name it contains, or
// else against the file's directory, and attributed to the deepest root that
// contains the resolved path.
const TOKEN = /[A-Za-z0-9_@+~.\-/]+/gu;

function grepFiles(patterns, pathspec) {
  if (patterns.length === 0) return [];
  return nulSeparated(git(["grep", "--cached", "-l", "-z", "-F", "--no-color", ...patterns.flatMap((pattern) => ["-e", pattern]), "--", ...pathspec]));
}

function startsWithMarker(token) {
  return MARKERS.some((marker) => token === marker || token.startsWith(marker + "/"));
}

function write() {
  const workspace = lsFilesStaged([WORKSPACE]);
  const everything = lsFilesStaged([]);
  const tracked = new Set(everything.map((entry) => entry.path));
  const oidOf = new Map(everything.map((entry) => [entry.path, entry.oid]));
  const oidPaths = new Map();
  for (const entry of everything) oidPaths.set(entry.oid, (oidPaths.get(entry.oid) ?? 0) + 1);

  const rows = new Map();
  const filesIn = new Map();
  for (const entry of workspace) {
    const directory = posix.dirname(entry.path);
    if (!filesIn.has(directory)) filesIn.set(directory, []);
    filesIn.get(directory).push(entry.path);
    const classified = classify(entry.path);
    if (classified === null) continue;
    if (!rows.has(classified.root)) {
      rows.set(classified.root, { root: classified.root, owner: ownerOf(classified.root), markers: new Set(), entries: [] });
    }
    const row = rows.get(classified.root);
    row.markers.add(classified.marker);
    row.entries.push({ ...entry, marker: classified.marker });
  }
  const roots = [...rows.keys()].sort(order);
  const sizes = objectSizes(workspace.map((entry) => entry.oid));

  // Size, kind and the paths whose tree position is tracked at this index.
  for (const row of rows.values()) {
    row.paths = row.entries.length;
    row.bytes = row.entries.reduce((total, entry) => total + sizes.get(entry.oid), 0);
    row.pathsAtHead = row.entries.filter((entry) => {
      const below = entry.path.slice(row.root.length + 1);
      if (INSTALL_MARKERS.includes(entry.marker)) return false;
      return tracked.has(TENANT_MARKERS.includes(entry.marker) ? tenantPrefix + below : below);
    }).length;
    const inRoot = new Map();
    for (const entry of row.entries) inRoot.set(entry.oid, (inRoot.get(entry.oid) ?? 0) + 1);
    row.pathsDuplicated = row.entries.filter((entry) => oidPaths.get(entry.oid) > inRoot.get(entry.oid)).length;
    row.markers = [...row.markers].sort(order);
    row.kind = kindOf(row);
  }

  // Cuts.
  const examined = new Map();
  for (const row of rows.values()) {
    row.cutFiles = [];
    for (let directory = posix.dirname(row.root); ; directory = posix.dirname(directory)) {
      const files = (filesIn.get(directory) ?? []).filter((path) => CUT_FILES.some((pattern) => pattern.test(posix.basename(path))));
      files.sort((left, right) => {
        const rank = (path) => CUT_FILES.findIndex((pattern) => pattern.test(posix.basename(path)));
        return rank(left) - rank(right) || order(left, right);
      });
      row.cutFiles.push(...files);
      if (directory === row.owner || directory.split("/").length <= 2) break;
    }
    for (const path of row.cutFiles) examined.set(path, null);
  }
  const examinedPaths = [...examined.keys()];
  const textSizes = objectSizes(examinedPaths.map((path) => oidOf.get(path)));
  const textByOid = new Map(readBlobs(examinedPaths.map((path) => oidOf.get(path)), textSizes));
  for (const path of examinedPaths) examined.set(path, cutCandidates(textByOid.get(oidOf.get(path)).toString("utf8")));
  textByOid.clear();
  const commits = verifyCommits([...examined.values()].flat().map((candidate) => candidate.token));
  for (const row of rows.values()) {
    row.cut = null;
    for (const path of row.cutFiles) {
      const found = examined.get(path).find((candidate) => commits.has(candidate.token));
      if (found !== undefined) {
        row.cut = { commit: commits.get(found.token), file: path, line: found.line };
        break;
      }
    }
  }

  // How much of each root equals the tree of its named cut: the classified
  // paths whose blob is the blob at the same position in that commit.
  const cutTrees = new Map();
  for (const commit of new Set([...rows.values()].filter((row) => row.cut !== null).map((row) => row.cut.commit))) {
    const tree = new Map();
    for (const record of nulSeparated(git(["ls-tree", "-r", "-z", "--full-tree", commit, "--", "build_tenants", "specification"]))) {
      const tab = record.indexOf("\t");
      tree.set(record.slice(tab + 1), record.slice(0, tab).split(" ")[2]);
    }
    cutTrees.set(commit, tree);
  }
  for (const row of rows.values()) {
    if (row.cut === null) continue;
    const tree = cutTrees.get(row.cut.commit);
    row.cut.pathsMatching = row.entries.filter((entry) => {
      const below = entry.path.slice(row.root.length + 1);
      return tree.get(TENANT_MARKERS.includes(entry.marker) ? tenantPrefix + below : below) === entry.oid;
    }).length;
  }

  // References.
  const rootSet = new Set(roots);
  const deepestRoot = (path) => {
    const segments = path.replace(/\/+$/u, "").split("/");
    for (let length = segments.length; length >= 3; length--) {
      const prefix = segments.slice(0, length).join("/");
      if (rootSet.has(prefix)) return prefix;
    }
    return null;
  };
  const insideMirror = (path, root) => rows.get(root).markers.some((marker) => path.startsWith(`${root}/${marker}/`));
  const insideAnyMirror = (path) => path.startsWith(WORKSPACE + "/") && classify(path) !== null;
  const excluded = (path) => REFERENCE_EXCLUSIONS.some((exclusion) => path === exclusion || (exclusion.endsWith("/") && path.startsWith(exclusion)));
  const exclusionSpec = REFERENCE_EXCLUSIONS.map((exclusion) => `:(exclude)${exclusion.endsWith("/") ? exclusion + "**" : exclusion}`);
  const document = (path) => path.endsWith(".md") || path.endsWith(".json");

  // Owners by directory name, and by their parent's name and their own when
  // two owners share a name (work/<record> and evidence/<record>).
  const owners = [...new Set(roots.map((root) => rows.get(root).owner))].sort(order);
  const ownersByName = new Map();
  for (const owner of owners) {
    const name = posix.basename(owner);
    if (!ownersByName.has(name)) ownersByName.set(name, []);
    ownersByName.get(name).push(owner);
  }
  const ownerByPair = new Map(owners.map((owner) => [owner.split("/").slice(-2).join("/"), owner]));
  const candidates = new Set(grepFiles([...ownersByName.keys()].map((name) => name + "/"), ["*.md", "*.json", ...exclusionSpec]));
  const rootParents = new Set(roots.map((root) => posix.dirname(root)));
  for (const entry of workspace) {
    if (!document(entry.path) || insideAnyMirror(entry.path)) continue;
    for (let directory = posix.dirname(entry.path); directory.includes("/"); directory = posix.dirname(directory)) {
      if (rootParents.has(directory)) { candidates.add(entry.path); break; }
    }
  }
  for (const path of [...candidates]) if (excluded(path) || !oidOf.has(path) || !document(path)) candidates.delete(path);

  const resolve = (token, directory) => {
    if (token.startsWith(WORKSPACE + "/")) return token;
    const absoluteAt = token.startsWith("/") ? token.indexOf(`/${WORKSPACE}/`) : -1;
    if (absoluteAt >= 0) return token.slice(absoluteAt + 1);
    const segments = token.split("/");
    for (let index = 0; index < segments.length - 1; index++) {
      const named = ownersByName.get(segments[index]);
      if (named === undefined) continue;
      const owner = named.length === 1 ? named[0]
        : index > 0 ? ownerByPair.get(`${segments[index - 1]}/${segments[index]}`) : undefined;
      if (owner !== undefined) return [owner, ...segments.slice(index + 1)].join("/");
    }
    if (token.startsWith("/")) return null;
    const bare = token.replace(/^(?:\.\/)+/u, "");
    if (startsWithMarker(bare)) return null;
    return posix.normalize(posix.join(directory, bare));
  };
  for (const row of rows.values()) row.references = new Set();
  const pathsByOid = new Map();
  for (const path of [...candidates].sort(order)) {
    const oid = oidOf.get(path);
    if (!pathsByOid.has(oid)) pathsByOid.set(oid, []);
    pathsByOid.get(oid).push(path);
  }
  const candidateSizes = objectSizes([...pathsByOid.keys()]);
  for (const [oid, blob] of readBlobs([...pathsByOid.keys()], candidateSizes)) {
    const tokens = new Set();
    for (const match of blob.toString("utf8").matchAll(TOKEN)) {
      if (match[0].includes("/")) tokens.add(match[0].replace(/\.+$/u, ""));
    }
    for (const path of pathsByOid.get(oid)) {
      const directory = posix.dirname(path);
      for (const token of tokens) {
        const target = resolve(token, directory);
        const root = target === null ? null : deepestRoot(target);
        if (root !== null && !insideMirror(path, root)) rows.get(root).references.add(path);
      }
    }
  }

  // The inventory.
  const output = roots.map((root) => {
    const row = rows.get(root);
    const references = [...row.references].sort(order);
    return {
      root: row.root,
      owner: row.owner,
      kind: row.kind,
      markers: row.markers,
      paths: row.paths,
      pathsAtHead: row.pathsAtHead,
      pathsDuplicated: row.pathsDuplicated,
      bytes: row.bytes,
      cut: row.cut,
      ...(row.cut === null ? { cutLookedIn: row.cutFiles } : {}),
      references,
      referencesOutsideMirrors: references.filter((path) => !insideAnyMirror(path)).length,
    };
  });
  const sum = (selected, field) => selected.reduce((total, row) => total + row[field], 0);
  const group = (key) => Object.fromEntries([...new Set(output.map(key))].sort(order).map((value) => {
    const selected = output.filter((row) => key(row) === value);
    return [value, { roots: selected.length, paths: sum(selected, "paths"), bytes: sum(selected, "bytes") }];
  }));
  const inventory = {
    kind: "tree_mirror_inventory",
    schemaVersion: "1.0.0",
    standing: "Derived read model, not authority. Written by `node scripts/check-evidence-mirrors.mjs --write` from the tenant directory; `npm run lint:evidence` refuses a mirror root absent from it or holding more tracked paths than it lists. It is the reference inventory TD-19 requires before any historical deletion; it authorizes none.",
    rules: {
      root: "Each tracked path under .ai-workspace/ is classified by the first segment below .ai-workspace/ that opens a copied tree (markers); the mirror root is the path above that segment. `paths` and `bytes` count the classified paths of the root (logical blob bytes from git cat-file --batch-check, duplicates counted).",
      markers: MARKERS,
      owner: "work/<record>, evidence/<record>, comments/<agent>/<post>, context/<area>/<kind>/<entry>.",
      kind: "In this order. uat-run-source: work/T287_SANDBOX_UAT_RUN_02/operator/<run>/source. patch-layout: every classified path is a .diff or .patch, laid out by repository path (authored patches, not a copy). ignore-skeleton: every classified path is a .gitignore (the per-directory ignore files of a copied tree whose listed files stay untracked). sandbox-worksite: the root path has a segment sandbox, worksite, worksite-result, supplied-work, unit-runs or workspace (a sandbox's or a harness run's own worksite). install: only node_modules paths, or a segment node_modules, package, installed, extracted, bootstrap or install below the owner. build-output: a segment build, build-<n>, baseline-build, compiled, compiled-<n>, emitted or dist below the owner. repository-tree: a build_tenants or nested .ai-workspace marker. unclassified: pathsAtHead and pathsDuplicated both 0. repository-tree: a specification marker. tenant-tree: otherwise.",
      pathsAtHead: "Classified paths whose position below the root (under build_tenants/abiogenesis/typescript/ for a tenant marker) is a tracked path at this index; names only, not bytes.",
      pathsDuplicated: "Classified paths whose blob is also tracked at a path outside the root.",
      cut: "The first commit (a 40-hex run, or a 7-12-hex run with a letter on a line naming a commit, head, cut, basis or base, verified as a commit object) in freeze.json, source-manifest.json, basis.json, L2-candidate-freeze*.json, report.md or return.md directly in the root's parent directory, then in each ancestor up to the owner; null with cutLookedIn (every file examined) otherwise. The commit is the one the record names, not proved to be the copied tree: cut.pathsMatching counts the classified paths whose blob equals the blob at the same position (under build_tenants/abiogenesis/typescript/ for a tenant marker) in that commit's build_tenants/ and specification/ trees.",
      references: "Tracked .md and .json files outside the root's marked trees whose text names a path inside the root. Candidates: the files git grep -l -F finds for any owner's directory name followed by a slash, and the .md and .json files outside every mirror below any root's parent directory. Each path-like token is resolved from its first .ai-workspace segment when it starts there or is absolute; else through the owner's name it contains (with the preceding segment when two owners share the name); else against the file's directory (a token that starts with a marker names a live repository path and is skipped). It is attributed to the deepest root containing the resolved path. Excluded: this inventory and .ai-workspace/work/T290_DEBT_WAVE_01/. referencesOutsideMirrors counts the references not themselves inside a mirror root.",
    },
    roots: output,
    totals: {
      roots: output.length,
      paths: sum(output, "paths"),
      bytes: sum(output, "bytes"),
      rootsWithZeroReferences: output.filter((row) => row.references.length === 0).length,
      rootsWithZeroReferencesOutsideMirrors: output.filter((row) => row.referencesOutsideMirrors === 0).length,
      rootsWithKnownCut: output.filter((row) => row.cut !== null).length,
      rootsWithKnownCutMatchingAPath: output.filter((row) => row.cut !== null && row.cut.pathsMatching > 0).length,
      byArea: group((row) => row.root.split("/")[1]),
      byKind: group((row) => row.kind),
    },
  };
  writeFileSync(join(repositoryRoot, INVENTORY), JSON.stringify(inventory, null, 2) + "\n");
  console.log(
    `check-evidence-mirrors: wrote ${INVENTORY}: ${inventory.totals.roots} mirror roots, ${inventory.totals.paths} tracked paths, ${inventory.totals.bytes} logical bytes`,
  );
}

const args = process.argv.slice(2);
if (args.length === 0) check();
else if (args.length === 1 && args[0] === "--write") write();
else {
  console.error("usage: node scripts/check-evidence-mirrors.mjs [--write]");
  process.exit(2);
}
