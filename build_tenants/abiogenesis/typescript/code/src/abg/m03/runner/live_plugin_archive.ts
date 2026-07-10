import {
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  writeFileSync
} from "node:fs";
import { createHash } from "node:crypto";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

const LIVE_PLUGIN_ARCHIVE_VERSION = 1;
const REQUEST_FILE = "request.json";
const COMPLETION_FILE = "completion.json";

type CanonicalScalar = null | boolean | number | string;
interface CanonicalJsonArray extends ReadonlyArray<CanonicalJson> {
  readonly canonicalJsonArrayBrand?: never;
}
interface CanonicalJsonObject {
  readonly [key: string]: CanonicalJson;
}
type CanonicalJson = CanonicalScalar | CanonicalJsonArray | CanonicalJsonObject;

export type LivePluginArchiveSeam = "dispatch" | "evaluation";

interface LivePluginArchiveRequestBody {
  readonly kind: "live_plugin_effect_request";
  readonly version: typeof LIVE_PLUGIN_ARCHIVE_VERSION;
  readonly cCallRef: string;
  readonly seam: LivePluginArchiveSeam;
  readonly pluginRef: string;
  readonly capabilityDigest: string;
  readonly manifestDigest: string;
  readonly effectInputDigest: string;
}

interface LivePluginArchiveRequest extends LivePluginArchiveRequestBody {
  readonly requestDigest: string;
}

interface LivePluginArchiveCompletion {
  readonly kind: "live_plugin_effect_completion";
  readonly version: typeof LIVE_PLUGIN_ARCHIVE_VERSION;
  readonly cCallRef: string;
  readonly seam: LivePluginArchiveSeam;
  readonly pluginRef: string;
  readonly requestDigest: string;
  readonly outcomeDigest: string;
  readonly artifactDigests: Readonly<Record<string, string>>;
  readonly outcome: unknown;
  readonly completionDigest: string;
}

export interface LivePluginArchiveOpenInput {
  readonly archiveRoot: string;
  readonly cCallRef: string;
  readonly seam: LivePluginArchiveSeam;
  readonly pluginRef: string;
  readonly capability: unknown;
  readonly manifest: unknown;
  readonly effectInput: unknown;
  readonly resumeExisting?: boolean | undefined;
}

export interface FreshLivePluginArchive {
  readonly state: "fresh";
  readonly archiveRoot: string;
  readonly bundleRoot: string;
  readonly bundleId: string;
  readonly label: string;
  readonly requestDigest: string;
  readonly path: (relativePath: string) => string;
  readonly writeText: (relativePath: string, text: string) => string;
  readonly existingRegularPath: (relativePath: string) => string | null;
  readonly complete: (outcome: unknown) => void;
}

export interface ReusedLivePluginArchive {
  readonly state: "reused";
  readonly archiveRoot: string;
  readonly bundleRoot: string;
  readonly bundleId: string;
  readonly label: string;
  readonly requestDigest: string;
  readonly outcome: unknown;
}

export type LivePluginArchiveOpenResult =
  | FreshLivePluginArchive
  | ReusedLivePluginArchive;

export class LivePluginArchiveError extends Error {
  readonly code:
    | "archive_identity_conflict"
    | "archive_incomplete"
    | "archive_tampered"
    | "archive_unconfined";
  readonly evidencePaths: readonly string[];

  constructor(
    code: LivePluginArchiveError["code"],
    message: string,
    evidencePaths: readonly string[] = Object.freeze([])
  ) {
    super(`${code}: ${message}`);
    this.name = "LivePluginArchiveError";
    this.code = code;
    this.evidencePaths = Object.freeze([...evidencePaths]);
  }
}

function errorCode(error: unknown): unknown {
  return typeof error === "object" && error !== null && "code" in error
    ? Reflect.get(error, "code")
    : null;
}

function canonicalize(value: unknown, at: string): CanonicalJson {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "string"
  ) {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError(`${at} contains a non-finite number`);
    }
    return value;
  }
  if (Array.isArray(value)) {
    return Object.freeze(
      value.map((row, index) => canonicalize(row, `${at}[${String(index)}]`))
    );
  }
  if (typeof value === "object" && value !== null) {
    const out: Record<string, CanonicalJson> = {};
    for (const key of Object.keys(value).sort()) {
      if (Reflect.get(value, key) !== undefined) {
        out[key] = canonicalize(Reflect.get(value, key), `${at}.${key}`);
      }
    }
    return Object.freeze(out);
  }
  throw new TypeError(`${at} contains a non-JSON value (${typeof value})`);
}

function canonicalJson(value: unknown): string {
  return `${JSON.stringify(canonicalize(value, "archive value"), null, 2)}\n`;
}

function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

function digest(value: unknown): string {
  return sha256(canonicalJson(value));
}

function isWithin(root: string, candidate: string): boolean {
  const rel = relative(root, candidate);
  return rel === "" || (!rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel));
}

function existingPathHasSymlink(root: string, candidate: string): boolean {
  const rel = relative(root, candidate);
  if (rel === "") {
    return lstatSync(root).isSymbolicLink();
  }
  let current = root;
  for (const component of rel.split(sep)) {
    current = join(current, component);
    const row = lstatSync(current, { throwIfNoEntry: false });
    if (row === undefined) {
      return false;
    }
    if (row.isSymbolicLink()) {
      return true;
    }
  }
  return false;
}

function assertConfined(root: string, candidate: string, label: string): string {
  const resolved = resolve(candidate);
  if (!isWithin(root, resolved)) {
    throw new LivePluginArchiveError(
      "archive_unconfined",
      `${label} escapes the admitted archive root`
    );
  }
  if (existingPathHasSymlink(root, resolved)) {
    throw new LivePluginArchiveError(
      "archive_unconfined",
      `${label} contains a symbolic-link component`
    );
  }
  return resolved;
}

function ensureDirectory(root: string, directoryPath: string, label: string): void {
  const target = assertConfined(root, directoryPath, label);
  if (target === root) {
    return;
  }
  const parent = dirname(target);
  if (parent !== target) {
    ensureDirectory(root, parent, `${label} parent`);
  }
  try {
    mkdirSync(target);
  } catch (error) {
    const code = errorCode(error);
    if (code !== "EEXIST") {
      throw error;
    }
  }
  const row = lstatSync(target);
  if (row.isSymbolicLink() || !row.isDirectory()) {
    throw new LivePluginArchiveError(
      "archive_unconfined",
      `${label} is not a confined directory`
    );
  }
}

function writeExclusive(root: string, filePath: string, text: string, label: string): void {
  const target = assertConfined(root, filePath, label);
  ensureDirectory(root, dirname(target), `${label} directory`);
  writeFileSync(target, text, { encoding: "utf8", flag: "wx" });
}

function readRegular(root: string, filePath: string, label: string): string {
  const target = assertConfined(root, filePath, label);
  const row = lstatSync(target);
  if (row.isSymbolicLink() || !row.isFile()) {
    throw new LivePluginArchiveError(
      "archive_tampered",
      `${label} is not a regular file`
    );
  }
  return readFileSync(target, "utf8");
}

function tryExistingRegular(root: string, filePath: string): string | null {
  const target = assertConfined(root, filePath, "archive evidence");
  const row = lstatSync(target, { throwIfNoEntry: false });
  return row?.isFile() === true ? target : null;
}

function existingEffectEvidencePaths(
  root: string,
  bundleRoot: string
): readonly string[] {
  const launchPath = tryExistingRegular(root, join(bundleRoot, "launch.json"));
  const outputPath = tryExistingRegular(root, join(bundleRoot, "output.txt"));
  const traceResultPath = tryExistingRegular(
    root,
    join(bundleRoot, "trace", "result.json")
  );
  return Object.freeze([
    ...(launchPath === null ? [] : [launchPath]),
    ...(outputPath === null ? [] : [outputPath]),
    ...(traceResultPath === null ? [] : [traceResultPath])
  ]);
}

function collectArtifacts(
  root: string,
  directoryPath: string,
  prefix = ""
): Readonly<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const name of readdirSync(directoryPath).sort()) {
    const absolutePath = assertConfined(root, join(directoryPath, name), "bundle artifact");
    const relativePath = prefix.length === 0 ? name : `${prefix}/${name}`;
    if (relativePath === COMPLETION_FILE) {
      continue;
    }
    const row = lstatSync(absolutePath);
    if (row.isDirectory()) {
      Object.assign(out, collectArtifacts(root, absolutePath, relativePath));
      continue;
    }
    if (!row.isFile()) {
      throw new LivePluginArchiveError(
        "archive_tampered",
        `bundle artifact ${relativePath} is not a regular file`
      );
    }
    out[relativePath] = sha256(readFileSync(absolutePath));
  }
  return Object.freeze(out);
}

function parseRecord(text: string, label: string): Readonly<Record<string, unknown>> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new LivePluginArchiveError(
      "archive_tampered",
      `${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`
    );
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new LivePluginArchiveError(
      "archive_tampered",
      `${label} is not a JSON object`
    );
  }
  const record: Record<string, unknown> = {};
  for (const key of Object.keys(parsed)) {
    record[key] = Reflect.get(parsed, key);
  }
  return Object.freeze(record);
}

function sameStringRecord(
  left: Readonly<Record<string, string>>,
  right: unknown
): boolean {
  if (typeof right !== "object" || right === null || Array.isArray(right)) {
    return false;
  }
  const rows: Record<string, unknown> = {};
  for (const key of Object.keys(right)) {
    rows[key] = Reflect.get(right, key);
  }
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(rows).sort();
  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every(
      (key, index) =>
        key === rightKeys[index] &&
        typeof rows[key] === "string" &&
        rows[key] === left[key]
    )
  );
}

function requestFor(input: LivePluginArchiveOpenInput): LivePluginArchiveRequest {
  const body: LivePluginArchiveRequestBody = Object.freeze({
    kind: "live_plugin_effect_request",
    version: LIVE_PLUGIN_ARCHIVE_VERSION,
    cCallRef: input.cCallRef,
    seam: input.seam,
    pluginRef: input.pluginRef,
    capabilityDigest: digest(input.capability),
    manifestDigest: digest(input.manifest),
    effectInputDigest: digest(input.effectInput)
  });
  return Object.freeze({ ...body, requestDigest: digest(body) });
}

function admitArchivedRequest(text: string): LivePluginArchiveRequest {
  const row = parseRecord(text, REQUEST_FILE);
  const keys = Object.keys(row).sort();
  const expectedKeys = [
    "capabilityDigest",
    "cCallRef",
    "effectInputDigest",
    "kind",
    "manifestDigest",
    "pluginRef",
    "requestDigest",
    "seam",
    "version"
  ].sort();
  if (
    keys.length !== expectedKeys.length ||
    !keys.every((key, index) => key === expectedKeys[index])
  ) {
    throw new LivePluginArchiveError(
      "archive_tampered",
      "request carries an unknown or missing field"
    );
  }
  if (
    row["kind"] !== "live_plugin_effect_request" ||
    row["version"] !== LIVE_PLUGIN_ARCHIVE_VERSION ||
    typeof row["cCallRef"] !== "string" ||
    (row["seam"] !== "dispatch" && row["seam"] !== "evaluation") ||
    typeof row["pluginRef"] !== "string" ||
    typeof row["capabilityDigest"] !== "string" ||
    typeof row["manifestDigest"] !== "string" ||
    typeof row["effectInputDigest"] !== "string" ||
    typeof row["requestDigest"] !== "string"
  ) {
    throw new LivePluginArchiveError(
      "archive_tampered",
      "request carries an invalid field value"
    );
  }
  const body: LivePluginArchiveRequestBody = Object.freeze({
    kind: row["kind"],
    version: row["version"],
    cCallRef: row["cCallRef"],
    seam: row["seam"],
    pluginRef: row["pluginRef"],
    capabilityDigest: row["capabilityDigest"],
    manifestDigest: row["manifestDigest"],
    effectInputDigest: row["effectInputDigest"]
  });
  if (row["requestDigest"] !== digest(body)) {
    throw new LivePluginArchiveError(
      "archive_tampered",
      "request digest does not match its body"
    );
  }
  return Object.freeze({ ...body, requestDigest: row["requestDigest"] });
}

function sameResumeIdentity(
  archived: LivePluginArchiveRequest,
  current: LivePluginArchiveRequest
): boolean {
  return (
    archived.cCallRef === current.cCallRef &&
    archived.seam === current.seam &&
    archived.pluginRef === current.pluginRef &&
    archived.capabilityDigest === current.capabilityDigest &&
    archived.effectInputDigest === current.effectInputDigest
  );
}

function completionBody(
  request: LivePluginArchiveRequest,
  outcome: unknown,
  artifactDigests: Readonly<Record<string, string>>
): Omit<LivePluginArchiveCompletion, "completionDigest"> {
  return Object.freeze({
    kind: "live_plugin_effect_completion",
    version: LIVE_PLUGIN_ARCHIVE_VERSION,
    cCallRef: request.cCallRef,
    seam: request.seam,
    pluginRef: request.pluginRef,
    requestDigest: request.requestDigest,
    outcomeDigest: digest(outcome),
    artifactDigests,
    outcome: canonicalize(outcome, "completion outcome")
  });
}

function verifyCompletion(
  root: string,
  bundleRoot: string,
  request: LivePluginArchiveRequest
): unknown {
  const completionPath = join(bundleRoot, COMPLETION_FILE);
  let completionText: string;
  try {
    completionText = readRegular(root, completionPath, COMPLETION_FILE);
  } catch (error) {
    const code = errorCode(error);
    if (code === "ENOENT") {
      throw new LivePluginArchiveError(
        "archive_incomplete",
        "request exists without completion; external work will not be repeated",
        existingEffectEvidencePaths(root, bundleRoot)
      );
    }
    throw error;
  }
  const completion = parseRecord(completionText, COMPLETION_FILE);
  const keys = Object.keys(completion).sort();
  const expectedKeys = [
    "artifactDigests",
    "cCallRef",
    "completionDigest",
    "kind",
    "outcome",
    "outcomeDigest",
    "pluginRef",
    "requestDigest",
    "seam",
    "version"
  ].sort();
  if (
    keys.length !== expectedKeys.length ||
    !keys.every((key, index) => key === expectedKeys[index])
  ) {
    throw new LivePluginArchiveError(
      "archive_tampered",
      "completion carries an unknown or missing field"
    );
  }
  if (
    completion["kind"] !== "live_plugin_effect_completion" ||
    completion["version"] !== LIVE_PLUGIN_ARCHIVE_VERSION ||
    completion["cCallRef"] !== request.cCallRef ||
    completion["seam"] !== request.seam ||
    completion["pluginRef"] !== request.pluginRef ||
    completion["requestDigest"] !== request.requestDigest
  ) {
    throw new LivePluginArchiveError(
      "archive_tampered",
      "completion identity does not match request identity"
    );
  }
  const outcome = completion["outcome"];
  if (completion["outcomeDigest"] !== digest(outcome)) {
    throw new LivePluginArchiveError(
      "archive_tampered",
      "completion outcome digest does not match its outcome"
    );
  }
  const body = {
    kind: completion["kind"],
    version: completion["version"],
    cCallRef: completion["cCallRef"],
    seam: completion["seam"],
    pluginRef: completion["pluginRef"],
    requestDigest: completion["requestDigest"],
    outcomeDigest: completion["outcomeDigest"],
    artifactDigests: completion["artifactDigests"],
    outcome
  };
  if (completion["completionDigest"] !== digest(body)) {
    throw new LivePluginArchiveError(
      "archive_tampered",
      "completion digest does not match its body"
    );
  }
  const actualArtifacts = collectArtifacts(root, bundleRoot);
  if (!sameStringRecord(actualArtifacts, completion["artifactDigests"])) {
    throw new LivePluginArchiveError(
      "archive_tampered",
      "bundle artifact set or digest differs from completion"
    );
  }
  return outcome;
}

function admittedArchiveRoot(archiveRoot: string): string {
  mkdirSync(archiveRoot, { recursive: true });
  return realpathSync(archiveRoot);
}

export function openLivePluginArchive(
  input: LivePluginArchiveOpenInput
): LivePluginArchiveOpenResult {
  if (input.cCallRef.length === 0) {
    throw new TypeError("live plugin archive requires a non-empty cCallRef");
  }
  const request = requestFor(input);
  const archiveRoot = admittedArchiveRoot(input.archiveRoot);
  const callsRoot = join(archiveRoot, "by-c-call");
  ensureDirectory(archiveRoot, callsRoot, "by-c-call archive root");
  const bundleId = sha256(input.cCallRef);
  const bundleRoot = assertConfined(
    archiveRoot,
    join(callsRoot, bundleId),
    "per-c-call bundle"
  );
  const label = `live-fp-${input.seam}-${bundleId}`;
  let fresh = false;
  try {
    mkdirSync(bundleRoot);
    fresh = true;
  } catch (error) {
    const code = errorCode(error);
    if (code !== "EEXIST") {
      throw error;
    }
  }
  const bundleRow = lstatSync(bundleRoot);
  if (bundleRow.isSymbolicLink() || !bundleRow.isDirectory()) {
    throw new LivePluginArchiveError(
      "archive_unconfined",
      "per-c-call bundle is not a confined directory"
    );
  }
  if (!fresh) {
    const requestPath = join(bundleRoot, REQUEST_FILE);
    let existingRequest: string;
    try {
      existingRequest = readRegular(archiveRoot, requestPath, REQUEST_FILE);
    } catch (error) {
      const code = errorCode(error);
      if (code === "ENOENT") {
        throw new LivePluginArchiveError(
          "archive_incomplete",
          "per-c-call bundle exists without request; execution refused"
        );
      }
      throw error;
    }
    const archivedRequest = admitArchivedRequest(existingRequest);
    const exactRequest = existingRequest === canonicalJson(request);
    if (
      !exactRequest &&
      (input.resumeExisting !== true ||
        !sameResumeIdentity(archivedRequest, request))
    ) {
      throw new LivePluginArchiveError(
        "archive_identity_conflict",
        "the same cCallRef is bound to different effect truth"
      );
    }
    const admittedRequest = exactRequest ? request : archivedRequest;
    return Object.freeze({
      state: "reused",
      archiveRoot,
      bundleRoot,
      bundleId,
      label,
      requestDigest: admittedRequest.requestDigest,
      outcome: verifyCompletion(archiveRoot, bundleRoot, admittedRequest)
    });
  }

  writeExclusive(
    archiveRoot,
    join(bundleRoot, REQUEST_FILE),
    canonicalJson(request),
    REQUEST_FILE
  );
  const pathFor = (relativePath: string): string => {
    if (relativePath.length === 0) {
      throw new LivePluginArchiveError(
        "archive_unconfined",
        `invalid bundle-relative path ${JSON.stringify(relativePath)}`
      );
    }
    return assertConfined(
      bundleRoot,
      isAbsolute(relativePath)
        ? relativePath
        : resolve(bundleRoot, relativePath),
      relativePath
    );
  };
  return Object.freeze({
    state: "fresh",
    archiveRoot,
    bundleRoot,
    bundleId,
    label,
    requestDigest: request.requestDigest,
    path: pathFor,
    writeText: (relativePath: string, text: string): string => {
      const target = pathFor(relativePath);
      writeExclusive(archiveRoot, target, text, relativePath);
      return target;
    },
    existingRegularPath: (relativePath: string): string | null =>
      tryExistingRegular(archiveRoot, pathFor(relativePath)),
    complete: (outcome: unknown): void => {
      const artifacts = collectArtifacts(archiveRoot, bundleRoot);
      const body = completionBody(request, outcome, artifacts);
      const completion: LivePluginArchiveCompletion = Object.freeze({
        ...body,
        completionDigest: digest(body)
      });
      writeExclusive(
        archiveRoot,
        join(bundleRoot, COMPLETION_FILE),
        canonicalJson(completion),
        COMPLETION_FILE
      );
    }
  });
}
