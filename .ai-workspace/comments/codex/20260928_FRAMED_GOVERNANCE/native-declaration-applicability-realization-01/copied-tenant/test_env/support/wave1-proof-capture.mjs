#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
    .join(",")}}`;
}

function sha256Bytes(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function sha256Canonical(value) {
  return sha256Bytes(Buffer.from(canonicalJson(value), "utf8"));
}

function requiredString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

function normalizedDigest(value, label) {
  const digest = requiredString(value, label);
  const normalized = digest.startsWith("sha256:") ? digest : `sha256:${digest}`;
  if (!/^sha256:[0-9a-f]{64}$/.test(normalized)) {
    throw new TypeError(`${label} must be one lowercase SHA-256 digest`);
  }
  return normalized;
}

async function fileBlob(path) {
  const bytes = await readFile(path);
  return {
    byteLength: bytes.byteLength,
    sha256: sha256Bytes(bytes),
  };
}

function selectedEnvironment({ artifactPath, installHost, artifactSha256 }) {
  return Object.freeze({
    ABI5_WAVE1_FROZEN_ARTIFACT_PATH: artifactPath,
    ABI5_WAVE1_FROZEN_ARTIFACT_SHA256: artifactSha256,
    ABI5_WAVE1_FROZEN_INSTALL_HOST: installHost,
    HOME: requiredString(process.env.HOME, "HOME"),
    LANG: "C",
    LC_ALL: "C",
    NODE_OPTIONS: "",
    PATH: requiredString(process.env.PATH, "PATH"),
    TMPDIR: process.env.TMPDIR ?? "/private/tmp",
    TZ: "UTC",
  });
}

function execute(executable, argv, options) {
  return new Promise((resolveResult, reject) => {
    const child = spawn(executable, argv, {
      cwd: options.cwd,
      env: options.environment,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const stdout = [];
    const stderr = [];
    child.stdout.on("data", (chunk) => stdout.push(Buffer.from(chunk)));
    child.stderr.on("data", (chunk) => stderr.push(Buffer.from(chunk)));
    child.once("error", reject);
    child.once("close", (exitCode, signal) => {
      resolveResult({
        exitCode,
        signal,
        stdout: Buffer.concat(stdout),
        stderr: Buffer.concat(stderr),
      });
    });
  });
}

export async function captureWave1ProofExecution({
  artifactPath,
  installHost,
  expectedArtifactSha256,
  captureDirectory,
  cwd,
  testSourcePath,
  argv,
}) {
  const selectedArtifactPath = resolve(requiredString(artifactPath, "artifactPath"));
  const selectedInstallHost = resolve(requiredString(installHost, "installHost"));
  const selectedCaptureDirectory = resolve(
    requiredString(captureDirectory, "captureDirectory"),
  );
  const selectedCwd = resolve(requiredString(cwd, "cwd"));
  const selectedTestSourcePath = isAbsolute(testSourcePath)
    ? resolve(testSourcePath)
    : resolve(selectedCwd, requiredString(testSourcePath, "testSourcePath"));
  const expectedDigest = normalizedDigest(
    expectedArtifactSha256,
    "expectedArtifactSha256",
  );
  if (!Array.isArray(argv) || argv.length === 0 ||
      argv.some((value) => typeof value !== "string" || value.length === 0)) {
    throw new TypeError("argv must contain the exact non-empty Node arguments");
  }

  const artifactBefore = await fileBlob(selectedArtifactPath);
  if (artifactBefore.sha256 !== expectedDigest) {
    throw new TypeError(
      `frozen artifact digest mismatch: expected ${expectedDigest}, received ${artifactBefore.sha256}`,
    );
  }
  const testSourceBefore = await fileBlob(selectedTestSourcePath);
  const environment = selectedEnvironment({
    artifactPath: selectedArtifactPath,
    installHost: selectedInstallHost,
    artifactSha256: expectedDigest,
  });
  const executable = resolve(process.execPath);
  const execution = await execute(executable, [...argv], {
    cwd: selectedCwd,
    environment,
  });
  const artifactAfter = await fileBlob(selectedArtifactPath);
  const testSourceAfter = await fileBlob(selectedTestSourcePath);
  if (canonicalJson(artifactBefore) !== canonicalJson(artifactAfter)) {
    throw new TypeError("frozen artifact bytes changed during proof execution");
  }
  if (canonicalJson(testSourceBefore) !== canonicalJson(testSourceAfter)) {
    throw new TypeError("selected test source bytes changed during proof execution");
  }

  await mkdir(dirname(selectedCaptureDirectory), { recursive: true });
  await mkdir(selectedCaptureDirectory, { recursive: false });
  const stdoutRef = "stdout.bin";
  const stderrRef = "stderr.bin";
  const manifestRef = "capture.json";
  await writeFile(join(selectedCaptureDirectory, stdoutRef), execution.stdout, {
    flag: "wx",
  });
  await writeFile(join(selectedCaptureDirectory, stderrRef), execution.stderr, {
    flag: "wx",
  });
  const body = {
    kind: "wave1_proof_execution_capture",
    schemaVersion: "5.0.0",
    executable,
    argv: [...argv],
    cwd: selectedCwd,
    environment,
    artifact: {
      path: selectedArtifactPath,
      before: artifactBefore,
      after: artifactAfter,
    },
    testSource: {
      path: selectedTestSourcePath,
      before: testSourceBefore,
      after: testSourceAfter,
    },
    result: {
      exitCode: execution.exitCode,
      signal: execution.signal,
      stdout: {
        path: stdoutRef,
        byteLength: execution.stdout.byteLength,
        sha256: sha256Bytes(execution.stdout),
      },
      stderr: {
        path: stderrRef,
        byteLength: execution.stderr.byteLength,
        sha256: sha256Bytes(execution.stderr),
      },
    },
  };
  const manifest = {
    ...body,
    captureDigest: sha256Canonical(body),
  };
  const manifestPath = join(selectedCaptureDirectory, manifestRef);
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
  });
  return {
    manifest,
    manifestPath,
    manifestBlob: await fileBlob(manifestPath),
  };
}

function parseArguments(argv) {
  const separator = argv.indexOf("--");
  if (separator === -1 || separator === argv.length - 1) {
    throw new TypeError("capture command requires -- followed by exact Node arguments");
  }
  const parsed = { argv: argv.slice(separator + 1) };
  const options = argv.slice(0, separator);
  for (let index = 0; index < options.length; index += 2) {
    const flag = options[index];
    const value = options[index + 1];
    if (value === undefined) throw new TypeError(`${flag} requires a value`);
    if (flag === "--artifact") parsed.artifactPath = value;
    else if (flag === "--install-host") parsed.installHost = value;
    else if (flag === "--expected-sha256") parsed.expectedArtifactSha256 = value;
    else if (flag === "--capture-directory") parsed.captureDirectory = value;
    else if (flag === "--cwd") parsed.cwd = value;
    else if (flag === "--test-source") parsed.testSourcePath = value;
    else throw new TypeError(`unknown argument ${flag}`);
  }
  return parsed;
}

async function main() {
  const captured = await captureWave1ProofExecution(
    parseArguments(process.argv.slice(2)),
  );
  process.stdout.write(`${JSON.stringify({
    manifestPath: captured.manifestPath,
    manifestSha256: captured.manifestBlob.sha256,
    captureDigest: captured.manifest.captureDigest,
    exitCode: captured.manifest.result.exitCode,
    stdoutSha256: captured.manifest.result.stdout.sha256,
    stderrSha256: captured.manifest.result.stderr.sha256,
  })}\n`);
  if (captured.manifest.result.exitCode !== 0) {
    process.exitCode = captured.manifest.result.exitCode ?? 1;
  }
}

if (process.argv[1] !== undefined &&
    resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error.stack ?? String(error)}\n`);
    process.exitCode = 1;
  });
}
