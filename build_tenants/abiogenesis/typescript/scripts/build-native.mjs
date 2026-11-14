// Builds the prebuilt Darwin arm64 Node-API 8 physical-path observer into
// build/native from the exact inputs declared by scripts/native-build-inputs.json.
//
//   node scripts/build-native.mjs                  verify inputs, compile, link, verify
//   node scripts/build-native.mjs --verify-inputs  verify the declared closure only
//
// Every declared input row is verified before compilation and again after
// linking; a missing or changed input refuses. Compilation uses the declared
// absolute compiler, SDK, Node-API headers, target and flags in a closed
// environment. Its scratch lives under build/, which clean already owns. There is
// no consumer compilation, download or host-selected variant: a host that
// cannot reproduce the declared target fails the producer build.
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, mkdir, open, readFile, rename, rm, stat } from "node:fs/promises";
import { dirname, isAbsolute, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const inputsPath = join(packageRoot, "scripts", "native-build-inputs.json");
const SHA256 = /^[0-9a-f]{64}$/u;
const MH_MAGIC_64 = 0xfeedfacf;
const CPU_TYPE_ARM64 = 0x0100000c;
const MH_BUNDLE = 0x8;

function fail(message) {
  throw new Error(`native build refused: ${message}`);
}

async function sha256File(path) {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

function packagePath(relativePath, owner) {
  if (typeof relativePath !== "string" || relativePath === "" || isAbsolute(relativePath) ||
    normalize(relativePath) !== relativePath || relativePath.startsWith(".."))
    fail(`${owner} must be one normalized package-relative path`);
  return join(packageRoot, relativePath);
}

function stringArray(value, owner) {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== "string" || item === ""))
    fail(`${owner} must be a non-empty string array`);
  return value;
}

async function readInputs() {
  const document = JSON.parse(await readFile(inputsPath, "utf8"));
  if (document?.kind !== "abg_native_build_inputs" || document.schemaVersion !== 1) fail("unknown inputs document");
  const { target, source, output, toolchain, environment, compileArgs, linkArgs, inputFiles } = document;
  if (target?.platform !== "darwin" || target.arch !== "arm64" || target.nodeApiVersion !== 8 ||
    target.triple !== "arm64-apple-macos11.0") fail("declared target must be Darwin arm64 Node-API 8");
  if (typeof source?.sha256 !== "string" || !SHA256.test(source.sha256)) fail("source row needs one sha256");
  if (output !== "build/native/abg_physical_path.node") fail("output must be the declared build/native member");
  if (typeof toolchain?.clang !== "string" || !isAbsolute(toolchain.clang)) fail("compiler must be one absolute path");
  if (environment === null || typeof environment !== "object" || Array.isArray(environment) ||
    Object.values(environment).some((value) => typeof value !== "string")) fail("environment must map names to strings");
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
  for (const required of [toolchain.clang, toolchain.linker]) {
    if (!seen.has(required)) fail(`toolchain member is not a bound input: ${required}`);
  }
  return { ...document, sourcePath: packagePath(source.path, "source.path"), outputPath: packagePath(output, "output") };
}

/** Checks every declared row and the package source; collects all failures. */
async function verifyInputs(inputs) {
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
  try {
    const status = await lstat(inputs.sourcePath);
    if (!status.isFile()) failures.push(`${inputs.source.path}: not a regular file`);
    else {
      const actual = await sha256File(inputs.sourcePath);
      if (actual !== inputs.source.sha256) failures.push(`${inputs.source.path}: sha256 ${actual} != ${inputs.source.sha256}`);
    }
  } catch (error) {
    failures.push(`${inputs.source.path}: ${error.code ?? String(error)}`);
  }
  if (failures.length > 0) fail(`declared native inputs changed or missing:\n  ${failures.join("\n  ")}`);
}

async function machOBundleArm64(path) {
  const handle = await open(path, "r");
  try {
    const header = Buffer.alloc(16);
    const { bytesRead } = await handle.read(header, 0, header.length, 0);
    if (bytesRead !== header.length) return false;
    return header.readUInt32LE(0) === MH_MAGIC_64 && header.readUInt32LE(4) === CPU_TYPE_ARM64 &&
      header.readUInt32LE(12) === MH_BUNDLE;
  } finally {
    await handle.close();
  }
}

async function run(inputs, args, cwd) {
  try {
    await execFileAsync(inputs.toolchain.clang, args, {
      cwd, env: { ...inputs.environment, TMPDIR: cwd }, encoding: "utf8", maxBuffer: 1 << 24, timeout: 120000,
    });
  } catch (error) {
    fail(`compiler exited ${error.code ?? "abnormally"}: ${String(error.stderr ?? error.message).trim()}`);
  }
}

async function build(inputs) {
  if (process.platform !== "darwin" || process.arch !== "arm64")
    fail(`declared Darwin arm64 target cannot be produced on ${process.platform}-${process.arch}`);
  await verifyInputs(inputs);
  const work = join(packageRoot, "build", ".native-build");
  await rm(work, { recursive: true, force: true });
  await mkdir(work, { recursive: true });
  try {
    const object = join(work, "abg_physical_path.o");
    const linked = join(work, "abg_physical_path.node");
    await run(inputs, [...inputs.compileArgs, "-o", object, inputs.sourcePath], work);
    await run(inputs, [...inputs.linkArgs, "-o", linked, object], work);
    if (!(await machOBundleArm64(linked))) fail("linked output is not one arm64 Mach-O bundle");
    await verifyInputs(inputs);
    await mkdir(dirname(inputs.outputPath), { recursive: true });
    await rename(linked, inputs.outputPath);
    return sha256File(inputs.outputPath);
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}

const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && args[0] !== "--verify-inputs")) {
  console.error("usage: node scripts/build-native.mjs [--verify-inputs]");
  process.exit(2);
}
try {
  const inputs = await readInputs();
  if (args[0] === "--verify-inputs") {
    await verifyInputs(inputs);
    console.log(`native inputs verified: ${inputs.inputFiles.length} files and ${inputs.source.path}`);
  } else {
    const digest = await build(inputs);
    console.log(`native observer built: ${inputs.output} sha256 ${digest}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
