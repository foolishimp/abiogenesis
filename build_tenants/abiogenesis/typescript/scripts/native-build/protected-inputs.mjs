// The declared native build inputs of the physical-path observer and their exact protected placement.
//
// One relation, consumed by scripts/build-native.mjs in both of its declared modes and by the qualification
// preparation tools (test_env/qualification/native-inputs.mjs):
//   - ordinary producer mode reads the declared absolute host inputs, verified before and after compilation;
//   - qualified recipe mode (--protected-inputs) reads only the protected copies staged at
//     <package>/<protectedPlacement.root>/<relativeRoot><suffix>, which preserves the toolchain bin/lib/resource,
//     SDK and Node-header hierarchy, plus a byte-verified execution view of the declared execution members that
//     the build derives under its own build/ territory (a C2 snapshot carries bytes, never executable modes).
// Host paths are inspectable acquisition coordinates, never a fallback of the protected mode. Nothing here
// downloads, installs or modifies a protected copy or the host toolchain; the only mode change is on the derived
// execution view.
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { chmod, copyFile, lstat, mkdir, readFile, realpath, stat } from "node:fs/promises";
import { dirname, isAbsolute, join, normalize, posix } from "node:path";

export const INPUTS_RELATIVE_PATH = "scripts/native-build-inputs.json";
export const EXECUTION_VIEW_RELATIVE_PATH = "build/.native-build/inputs";
export const EXECUTION_VIEW_MODE = 0o755;
const SHA256 = /^[0-9a-f]{64}$/u;

export function fail(message) {
  throw new Error(`native build refused: ${message}`);
}

export const sha256Bytes = bytes => createHash("sha256").update(bytes).digest("hex");
export async function sha256File(path) {
  return sha256Bytes(await readFile(path));
}

/** Lexical containment of normalized absolute or relative paths. */
export const within = (path, root) => path === root || path.startsWith(root + "/");

function isNormalizedRelative(path) {
  return typeof path === "string" && path !== "" && !path.includes("\0") && !path.includes("\\") && !posix.isAbsolute(path) &&
    posix.normalize(path) === path && path.split("/").every(segment => segment !== "" && segment !== "." && segment !== "..");
}

function absolutePath(value, owner) {
  if (typeof value !== "string" || !isAbsolute(value) || normalize(value) !== value || value.length < 2 || value.endsWith("/"))
    fail(`${owner} must be one normalized absolute path`);
  return value;
}

function relativePath(value, owner) {
  if (!isNormalizedRelative(value)) fail(`${owner} must be one normalized relative path`);
  return value;
}

function stringArray(value, owner) {
  if (!Array.isArray(value) || value.length === 0 || value.some(item => typeof item !== "string" || item === ""))
    fail(`${owner} must be a non-empty string array`);
  return value;
}

/** The name under which a case- and normalization-insensitive volume (APFS default) stores a relative path. */
const nameKey = path => path.normalize("NFD").toLowerCase();

/**
 * Collision-free placement of relative paths in one root: every path normalized and relative, no two paths
 * naming the same entry on a case- or normalization-insensitive volume, and no placed file standing where
 * another placed path needs a directory. Returns every problem found; empty means placeable.
 */
export function placementCollisions(paths) {
  const problems = [], byKey = new Map();
  for (const path of paths) {
    if (!isNormalizedRelative(path)) { problems.push(`not a normalized relative path: ${JSON.stringify(path)}`); continue; }
    const key = nameKey(path);
    if (byKey.has(key)) problems.push(`${byKey.get(key)} and ${path} name one placed entry`);
    else byKey.set(key, path);
  }
  for (const [key, path] of byKey) {
    for (let cut = key.indexOf("/"); cut !== -1; cut = key.indexOf("/", cut + 1)) {
      const ancestor = byKey.get(key.slice(0, cut));
      if (ancestor !== undefined) problems.push(`${ancestor} is placed as a file but is a directory of ${path}`);
    }
  }
  return problems;
}

function protectedPlacement(document, seen, toolchain) {
  const placement = document.protectedPlacement;
  if (placement === null || typeof placement !== "object" || Array.isArray(placement)) fail("protectedPlacement must be one object");
  relativePath(placement.root, "protectedPlacement.root");
  if (within(placement.root, "build") || within(placement.root, "node_modules") || within(placement.root, "code"))
    fail("protectedPlacement.root must lie outside the build, dependency and source territories");
  if (!Array.isArray(placement.hierarchy) || placement.hierarchy.length === 0) fail("protectedPlacement.hierarchy must be non-empty");
  const ids = new Set();
  for (const root of placement.hierarchy) {
    if (root === null || typeof root !== "object" || Object.keys(root).sort().join(",") !== "hostRoot,id,relativeRoot" ||
      typeof root.id !== "string" || root.id === "" || ids.has(root.id)) fail("every hierarchy row must be exactly {id,hostRoot,relativeRoot} with a unique id");
    ids.add(root.id);
    absolutePath(root.hostRoot, `hierarchy ${root.id} hostRoot`);
    relativePath(root.relativeRoot, `hierarchy ${root.id} relativeRoot`);
  }
  for (const [n, a] of placement.hierarchy.entries()) for (const b of placement.hierarchy.slice(n + 1)) {
    if (within(a.hostRoot, b.hostRoot) || within(b.hostRoot, a.hostRoot)) fail(`hierarchy host roots ${a.id} and ${b.id} overlap`);
    if (within(nameKey(a.relativeRoot), nameKey(b.relativeRoot)) || within(nameKey(b.relativeRoot), nameKey(a.relativeRoot)))
      fail(`protected placement collision: hierarchy roots ${a.id} and ${b.id} share one placed subtree`);
  }
  const members = stringArray(placement.executionMembers, "protectedPlacement.executionMembers");
  if (new Set(members).size !== members.length) fail("protectedPlacement.executionMembers must be unique");
  for (const member of members) if (!seen.has(member)) fail(`execution member is not a bound input: ${member}`);
  for (const required of [toolchain.clang, toolchain.linker, ...toolchain.linkerLoadedLibraries])
    if (!members.includes(required)) fail(`execution view lacks a required member: ${required}`);
  return placement;
}

/** Strict validation of the inputs document; returns it with its package-relative source and output paths resolved. */
export function parseNativeBuildInputs(document, packageRoot) {
  if (document?.kind !== "abg_native_build_inputs" || document.schemaVersion !== 1) fail("unknown inputs document");
  const { target, source, output, toolchain, environment, compileArgs, linkArgs, inputFiles } = document;
  if (target?.platform !== "darwin" || target.arch !== "arm64" || target.nodeApiVersion !== 8 ||
    target.triple !== "arm64-apple-macos11.0") fail("declared target must be Darwin arm64 Node-API 8");
  if (typeof source?.sha256 !== "string" || !SHA256.test(source.sha256)) fail("source row needs one sha256");
  relativePath(source.path, "source.path");
  if (output !== "build/native/abg_physical_path.node") fail("output must be the declared build/native member");
  if (toolchain === null || typeof toolchain !== "object") fail("toolchain must be one object");
  for (const key of ["clang", "linker", "toolchainBin", "sdk", "nodeApiInclude", "resourceDir"]) absolutePath(toolchain[key], `toolchain.${key}`);
  if (dirname(toolchain.clang) !== toolchain.toolchainBin || dirname(toolchain.linker) !== toolchain.toolchainBin)
    fail("compiler and linker must lie in the declared toolchain bin directory");
  stringArray(toolchain.linkerLoadedLibraries, "toolchain.linkerLoadedLibraries");
  if (environment === null || typeof environment !== "object" || Array.isArray(environment) ||
    Object.values(environment).some(value => typeof value !== "string")) fail("environment must map names to strings");
  stringArray(compileArgs, "compileArgs");
  stringArray(linkArgs, "linkArgs");
  if (!Array.isArray(inputFiles) || inputFiles.length === 0) fail("inputFiles must be non-empty");
  const seen = new Set();
  for (const row of inputFiles) {
    if (row === null || typeof row !== "object" || Object.keys(row).sort().join(",") !== "path,sha256" ||
      typeof row.path !== "string" || !isAbsolute(row.path) || normalize(row.path) !== row.path ||
      typeof row.sha256 !== "string" || !SHA256.test(row.sha256)) fail("every inputFiles row must be exactly {path,sha256} with an absolute path");
    if (seen.has(row.path)) fail(`duplicate input row ${row.path}`);
    seen.add(row.path);
  }
  for (const required of [toolchain.clang, toolchain.linker, ...toolchain.linkerLoadedLibraries])
    if (!seen.has(required)) fail(`toolchain member is not a bound input: ${required}`);
  protectedPlacement(document, seen, toolchain);
  const parsed = { ...document, sourcePath: join(packageRoot, source.path), outputPath: join(packageRoot, output) };
  protectedPlacementRows(parsed);
  return parsed;
}

export async function readNativeBuildInputs(packageRoot) {
  let document;
  try { document = JSON.parse(await readFile(join(packageRoot, INPUTS_RELATIVE_PATH), "utf8")); }
  catch (error) { fail(`inputs document unreadable: ${error.code ?? String(error)}`); }
  return parseNativeBuildInputs(document, packageRoot);
}

/** The protected relative path (below protectedPlacement.root) of one declared host file or directory. */
export function placementRelative(inputs, hostPath) {
  const roots = inputs.protectedPlacement.hierarchy.filter(root => within(hostPath, root.hostRoot));
  if (roots.length !== 1) fail(roots.length === 0 ? `native input lies outside every declared hierarchy root: ${hostPath}`
    : `native input lies under several hierarchy roots: ${hostPath}`);
  return roots[0].relativeRoot + hostPath.slice(roots[0].hostRoot.length);
}

/** Every declared input row at its exact collision-free protected relative path. */
export function protectedPlacementRows(inputs) {
  const executable = new Set(inputs.protectedPlacement.executionMembers);
  const rows = inputs.inputFiles.map(row => Object.freeze({ hostPath: row.path, relativePath: placementRelative(inputs, row.path),
    sha256: row.sha256, execution: executable.has(row.path) }));
  const collisions = placementCollisions(rows.map(row => row.relativePath));
  if (collisions.length > 0) fail(`protected placement collision:\n  ${collisions.join("\n  ")}`);
  return Object.freeze(rows);
}

/** One digest over a placed inventory: relative path, content, length and permission bits of every member. */
export function inventoryDigest(members) {
  const rows = [...members].sort((a, b) => a.relativePath < b.relativePath ? -1 : a.relativePath > b.relativePath ? 1 : 0)
    .map(member => [member.relativePath, member.sha256, member.byteCount, member.mode]);
  return sha256Bytes(Buffer.from(JSON.stringify(rows), "utf8"));
}

/**
 * Reads every row below root: a regular file (never a symbolic link), physically at root/<relativePath>, with its
 * declared bytes. Returns all failures and, when there are none, the inventory digest.
 */
export async function verifyPlacedRows(root, rows) {
  const failures = [], members = [];
  let realRoot;
  try { realRoot = await realpath(root); }
  catch (error) { return { failures: [`${root}: ${error.code ?? String(error)}`], digest: null, members }; }
  for (const row of rows) {
    const path = join(root, row.relativePath);
    try {
      const status = await lstat(path);
      if (!status.isFile()) { failures.push(`${row.relativePath}: not a regular file`); continue; }
      if (await realpath(path) !== join(realRoot, row.relativePath)) { failures.push(`${row.relativePath}: resolves outside its placement`); continue; }
      const bytes = await readFile(path), actual = sha256Bytes(bytes);
      if (actual !== row.sha256) { failures.push(`${row.relativePath}: sha256 ${actual} != ${row.sha256}`); continue; }
      members.push({ relativePath: row.relativePath, sha256: actual, byteCount: bytes.length, mode: status.mode & 0o7777 });
    } catch (error) {
      failures.push(`${row.relativePath}: ${error.code ?? String(error)}`);
    }
  }
  return { failures, digest: failures.length === 0 ? inventoryDigest(members) : null, members };
}

/** The declared host rows verified in place (ordinary producer mode). */
export async function hostInputFailures(inputs) {
  const failures = [];
  for (const row of inputs.inputFiles) {
    try {
      const status = await stat(row.path);
      if (!status.isFile()) { failures.push(`${row.path}: not a regular file`); continue; }
      const actual = await sha256File(row.path);
      if (actual !== row.sha256) failures.push(`${row.path}: sha256 ${actual} != ${row.sha256}`);
    } catch (error) {
      failures.push(`${row.path}: ${error.code ?? String(error)}`);
    }
  }
  return failures;
}

export async function sourceFailures(inputs) {
  try {
    const status = await lstat(inputs.sourcePath);
    if (!status.isFile()) return [`${inputs.source.path}: not a regular file`];
    const actual = await sha256File(inputs.sourcePath);
    return actual === inputs.source.sha256 ? [] : [`${inputs.source.path}: sha256 ${actual} != ${inputs.source.sha256}`];
  } catch (error) {
    return [`${inputs.source.path}: ${error.code ?? String(error)}`];
  }
}

/** The protected root of a package: a real directory physically at <package>/<protectedPlacement.root>. */
export async function protectedRootOf(packageRoot, inputs) {
  const lexical = join(packageRoot, inputs.protectedPlacement.root);
  let physical;
  try { physical = await realpath(lexical); }
  catch (error) { fail(`declared native inputs changed or missing:\n  ${inputs.protectedPlacement.root}: ${error.code ?? String(error)}`); }
  if (physical !== join(await realpath(packageRoot), inputs.protectedPlacement.root) || !(await lstat(lexical)).isDirectory())
    fail(`protected placement root is not a directory physically inside the package: ${inputs.protectedPlacement.root}`);
  const hostRoots = inputs.protectedPlacement.hierarchy.map(root => root.hostRoot);
  if (hostRoots.some(root => within(physical, root) || within(root, physical))) fail("protected placement root overlaps a declared host root");
  return physical;
}

/**
 * Derives the execution view: each execution member copied from its protected copy into executionRoot at the
 * same relative path (so the linker's @executable_path/../lib/ rpath stays inside the view), its permission set
 * there, and the view verified against the declared bytes. executionRoot must not exist. Protected copies are
 * read only. Returns the verified view inventory.
 */
export async function deriveExecutionView(protectedRoot, executionRoot, rows) {
  let exists = true;
  try { await lstat(executionRoot); } catch (error) { if (error.code !== "ENOENT") throw error; exists = false; }
  if (exists) fail(`execution view already exists: ${executionRoot}`);
  const members = rows.filter(row => row.execution);
  for (const row of members) {
    const from = join(protectedRoot, row.relativePath), to = join(executionRoot, row.relativePath);
    await mkdir(dirname(to), { recursive: true });
    await copyFile(from, to, constants.COPYFILE_EXCL | constants.COPYFILE_FICLONE);
    await chmod(to, EXECUTION_VIEW_MODE);
  }
  const view = await verifyPlacedRows(executionRoot, members);
  if (view.failures.length > 0) fail(`execution view differs from the protected inputs:\n  ${view.failures.join("\n  ")}`);
  if (view.members.some(member => member.mode !== EXECUTION_VIEW_MODE)) fail("execution view permissions were not established");
  return view;
}

/**
 * The qualified recipe command: the declared compile/link arguments with every host input path replaced by its
 * protected copy (SDK, Node-API headers, compiler resources) or execution-view member (compiler, -B linker
 * directory), an explicit -resource-dir, and a PATH holding only the execution view's bin directory, so no
 * program or input can resolve to the host toolchain. Any remaining host path refuses.
 */
export function protectedCommand(inputs, { protectedRoot, executionRoot }) {
  const toolchain = inputs.toolchain;
  const placed = host => join(protectedRoot, placementRelative(inputs, host));
  const viewed = host => join(executionRoot, placementRelative(inputs, host));
  const viewBin = viewed(toolchain.toolchainBin), resourceDir = placed(toolchain.resourceDir);
  const table = new Map([[toolchain.toolchainBin, viewBin], [toolchain.sdk, placed(toolchain.sdk)], [toolchain.nodeApiInclude, placed(toolchain.nodeApiInclude)]]);
  const hostRoots = inputs.protectedPlacement.hierarchy.map(root => root.hostRoot);
  const namesHost = value => hostRoots.some(root => value.includes(root)) || inputs.inputFiles.some(row => value.includes(row.path));
  const rewrite = arg => {
    if (table.has(arg)) return table.get(arg);
    for (const flag of ["-I", "-B", "-isysroot"]) if (arg.startsWith(flag) && table.has(arg.slice(flag.length))) return flag + table.get(arg.slice(flag.length));
    if (namesHost(arg)) fail(`argument names a host input with no protected placement: ${arg}`);
    return arg;
  };
  const command = { compiler: viewed(toolchain.clang), linker: viewed(toolchain.linker), linkerDirectory: viewBin, resourceDir,
    sdk: table.get(toolchain.sdk), include: table.get(toolchain.nodeApiInclude),
    compileArgs: [...inputs.compileArgs.map(rewrite), "-resource-dir", resourceDir],
    linkArgs: [...inputs.linkArgs.map(rewrite), "-resource-dir", resourceDir],
    environment: { ...inputs.environment, PATH: viewBin } };
  const residue = [command.compiler, ...command.compileArgs, ...command.linkArgs, ...Object.values(command.environment)].filter(namesHost);
  if (residue.length > 0) fail(`protected command still names host inputs: ${residue.join(" ")}`);
  return Object.freeze(command);
}
