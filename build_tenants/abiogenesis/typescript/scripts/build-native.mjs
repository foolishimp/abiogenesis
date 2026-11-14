// Builds the prebuilt Darwin arm64 Node-API 8 physical-path observer into
// build/native from the exact inputs declared by scripts/native-build-inputs.json.
//
//   node scripts/build-native.mjs                                     verify host inputs, compile, link, verify
//   node scripts/build-native.mjs --verify-inputs                     verify the declared host closure only
//   node scripts/build-native.mjs --protected-inputs                  qualified recipe mode (below)
//   node scripts/build-native.mjs --verify-inputs --protected-inputs  verify the protected placement only
//
// Ordinary producer mode verifies every declared host input row before compilation and again after linking; a
// missing or changed input refuses. Compilation uses the declared absolute compiler, SDK, Node-API headers,
// target and flags in a closed environment.
//
// Qualified recipe mode reads no host toolchain path. Every declared row must be a regular file with its declared
// bytes at its exact protected placement (scripts/native-build/protected-inputs.mjs) inside this package. Because
// a C2 snapshot carries bytes without executable modes, the build derives a fresh execution view of the declared
// execution members under build/.native-build, sets their modes there only, and verifies the view and every
// protected copy before and after compilation. The compiler, -B linker directory, -isysroot SDK, -resource-dir
// and -I headers all name protected copies or that view; PATH holds only the view's bin directory. The report
// line records the relocated roots, arguments and digests.
//
// Scratch lives under build/, which clean already owns, and is removed after either mode. There is no consumer
// compilation, download or host-selected variant: a host that cannot reproduce the declared target fails the
// producer build.
import { execFile } from "node:child_process";
import { mkdir, open, rename, rm, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { EXECUTION_VIEW_RELATIVE_PATH, deriveExecutionView, fail, hostInputFailures, protectedCommand, protectedPlacementRows,
  protectedRootOf, readNativeBuildInputs, sha256File, sourceFailures, verifyPlacedRows } from "./native-build/protected-inputs.mjs";

const execFileAsync = promisify(execFile);
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MH_MAGIC_64 = 0xfeedfacf;
const CPU_TYPE_ARM64 = 0x0100000c;
const MH_BUNDLE = 0x8;

function refuseChanged(failures) {
  if (failures.length > 0) fail(`declared native inputs changed or missing:\n  ${failures.join("\n  ")}`);
}

/** Checks every declared host row and the package source; collects all failures. */
async function verifyHostInputs(inputs) {
  refuseChanged([...(await hostInputFailures(inputs)), ...(await sourceFailures(inputs))]);
}

/** Checks every protected copy and the package source; returns the protected inventory digest. */
async function verifyProtectedInputs(inputs, protectedRoot, rows) {
  const placed = await verifyPlacedRows(protectedRoot, rows);
  refuseChanged([...placed.failures, ...(await sourceFailures(inputs))]);
  return placed.digest;
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

async function run(executable, environment, args, cwd) {
  try {
    await execFileAsync(executable, args, {
      cwd, env: { ...environment, TMPDIR: cwd }, encoding: "utf8", maxBuffer: 1 << 24, timeout: 120000,
    });
  } catch (error) {
    fail(`compiler exited ${error.code ?? "abnormally"}: ${String(error.stderr ?? error.message).trim()}`);
  }
}

function requireDeclaredTarget() {
  if (process.platform !== "darwin" || process.arch !== "arm64")
    fail(`declared Darwin arm64 target cannot be produced on ${process.platform}-${process.arch}`);
}

/** Compiles and links in the fresh work directory with one selected compiler, environment and argument set. */
async function compileAndLink(inputs, compiler, environment, compileArgs, linkArgs, work) {
  const object = join(work, "abg_physical_path.o");
  const linked = join(work, "abg_physical_path.node");
  await run(compiler, environment, [...compileArgs, "-o", object, inputs.sourcePath], work);
  await run(compiler, environment, [...linkArgs, "-o", linked, object], work);
  if (!(await machOBundleArm64(linked))) fail("linked output is not one arm64 Mach-O bundle");
  return { linked, compileArgv: [compiler, ...compileArgs, "-o", object, inputs.sourcePath], linkArgv: [compiler, ...linkArgs, "-o", linked, object] };
}

async function publish(inputs, linked) {
  await mkdir(dirname(inputs.outputPath), { recursive: true });
  await rename(linked, inputs.outputPath);
  return { path: inputs.outputPath, bytes: (await stat(inputs.outputPath)).size, sha256: await sha256File(inputs.outputPath) };
}

async function freshWork() {
  const work = join(packageRoot, "build", ".native-build");
  await rm(work, { recursive: true, force: true });
  await mkdir(work, { recursive: true });
  return work;
}

async function buildFromHost(inputs) {
  requireDeclaredTarget();
  await verifyHostInputs(inputs);
  const work = await freshWork();
  try {
    const { linked } = await compileAndLink(inputs, inputs.toolchain.clang, inputs.environment, inputs.compileArgs, inputs.linkArgs, work);
    await verifyHostInputs(inputs);
    return (await publish(inputs, linked)).sha256;
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}

async function buildFromProtected(inputs) {
  requireDeclaredTarget();
  const rows = protectedPlacementRows(inputs);
  const protectedRoot = await protectedRootOf(packageRoot, inputs);
  const protectedBeforeDigest = await verifyProtectedInputs(inputs, protectedRoot, rows);
  const work = await freshWork();
  try {
    const executionRoot = join(packageRoot, EXECUTION_VIEW_RELATIVE_PATH);
    const executionBefore = await deriveExecutionView(protectedRoot, executionRoot, rows);
    const command = protectedCommand(inputs, { protectedRoot, executionRoot });
    const compiled = await compileAndLink(inputs, command.compiler, command.environment, command.compileArgs, command.linkArgs, work);
    const executionAfter = await verifyPlacedRows(executionRoot, rows.filter(row => row.execution));
    if (executionAfter.failures.length > 0 || executionAfter.digest !== executionBefore.digest)
      fail(`execution view changed during compilation:\n  ${executionAfter.failures.join("\n  ")}`);
    const protectedAfterDigest = await verifyProtectedInputs(inputs, protectedRoot, rows);
    if (protectedAfterDigest !== protectedBeforeDigest) fail("protected inputs changed during compilation");
    const output = await publish(inputs, compiled.linked);
    console.log(JSON.stringify({ kind: "abg_native_protected_build", protectedRoot, executionRoot, compiler: command.compiler,
      linker: command.linker, linkerDirectory: command.linkerDirectory, resourceDir: command.resourceDir, sdk: command.sdk,
      include: command.include, environment: command.environment, compileArgv: compiled.compileArgv, linkArgv: compiled.linkArgv,
      protectedMembers: rows.length, executionMembers: executionBefore.members.length,
      protectedBeforeDigest, protectedAfterDigest, executionBeforeDigest: executionBefore.digest, executionAfterDigest: executionAfter.digest,
      output }));
    return output.sha256;
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}

const args = process.argv.slice(2);
const known = new Set(["--verify-inputs", "--protected-inputs"]);
if (args.length > 2 || args.some(arg => !known.has(arg)) || new Set(args).size !== args.length) {
  console.error("usage: node scripts/build-native.mjs [--verify-inputs] [--protected-inputs]");
  process.exit(2);
}
try {
  const inputs = await readNativeBuildInputs(packageRoot);
  const verifyOnly = args.includes("--verify-inputs"), protectedMode = args.includes("--protected-inputs");
  if (verifyOnly && protectedMode) {
    const rows = protectedPlacementRows(inputs);
    const digest = await verifyProtectedInputs(inputs, await protectedRootOf(packageRoot, inputs), rows);
    console.log(`protected native inputs verified: ${rows.length} files under ${inputs.protectedPlacement.root} and ${inputs.source.path}; inventory ${digest}`);
  } else if (verifyOnly) {
    await verifyHostInputs(inputs);
    console.log(`native inputs verified: ${inputs.inputFiles.length} files and ${inputs.source.path}`);
  } else {
    const digest = protectedMode ? await buildFromProtected(inputs) : await buildFromHost(inputs);
    console.log(`native observer built: ${inputs.output} sha256 ${digest}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
