import {
  closeSync,
  constants,
  fstatSync,
  lstatSync,
  openSync,
  readdirSync,
  realpathSync,
  statfsSync,
  type BigIntStats,
} from "node:fs";
import {
  lstat as lstatAsync,
  open as openAsync,
  readdir as readdirAsync,
  realpath as realpathAsync,
  statfs as statfsAsync,
  type FileHandle,
} from "node:fs/promises";
import { createRequire } from "node:module";
import { basename, dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

// Read-only physical observation for the protected-root relation (T-293 B21).
//
// One I/O program serves the synchronous C2 host and the asynchronous C0,
// native and helper boundaries: observation code is written once as a
// generator of filesystem operations and run by `runPhysicalSync` or
// `runPhysicalAsync`. The prebuilt Node-API module supplies descriptor
// metadata only (F_GETPATH_NOFIRMLINK, fstatfs and a bounded getfsstat);
// descriptor custody, identity rechecks and every comparison stay here and in
// `physical_path_relation.ts`. Native failure or absence is reported, never
// replaced by a lexical answer. Nothing here writes, retains filesystem state
// across calls, or starts a process.

/** A descriptor held by the running program; `handle` is set under the async driver. */
export interface PhysicalDescriptor {
  readonly fd: number;
  readonly handle?: FileHandle;
}

export type PhysicalOp =
  | { readonly op: "lstat"; readonly path: string }
  | { readonly op: "realpath"; readonly path: string }
  | { readonly op: "openDirectory"; readonly path: string; readonly followFinal: boolean }
  | { readonly op: "fstat"; readonly descriptor: PhysicalDescriptor }
  | { readonly op: "close"; readonly descriptor: PhysicalDescriptor }
  | { readonly op: "readdir"; readonly path: string }
  | { readonly op: "statfsType"; readonly path: string };

export type PhysicalProgram<T> = Generator<PhysicalOp, T, unknown>;

function errnoCode(error: unknown): string | null {
  const code = (error as NodeJS.ErrnoException | null)?.code;
  return typeof code === "string" ? code : null;
}

function directoryFlags(followFinal: boolean): number {
  return constants.O_RDONLY | constants.O_DIRECTORY | (followFinal ? 0 : constants.O_NOFOLLOW);
}

function performSync(op: PhysicalOp): unknown {
  switch (op.op) {
    case "lstat":
      try { return lstatSync(op.path, { bigint: true }); }
      catch (error) { if (errnoCode(error) === "ENOENT") return null; throw error; }
    case "realpath": return realpathSync.native(op.path);
    case "openDirectory": return { fd: openSync(op.path, directoryFlags(op.followFinal)) };
    case "fstat": return fstatSync(op.descriptor.fd, { bigint: true });
    case "close": closeSync(op.descriptor.fd); return undefined;
    case "readdir": return readdirSync(op.path);
    case "statfsType":
      try { return statfsSync(op.path).type; } catch { return null; }
  }
}

async function performAsync(op: PhysicalOp): Promise<unknown> {
  switch (op.op) {
    case "lstat":
      try { return await lstatAsync(op.path, { bigint: true }); }
      catch (error) { if (errnoCode(error) === "ENOENT") return null; throw error; }
    case "realpath": return realpathAsync(op.path);
    case "openDirectory": {
      const handle = await openAsync(op.path, directoryFlags(op.followFinal));
      return { fd: handle.fd, handle };
    }
    case "fstat":
      return op.descriptor.handle === undefined
        ? fstatSync(op.descriptor.fd, { bigint: true })
        : op.descriptor.handle.stat({ bigint: true });
    case "close":
      if (op.descriptor.handle === undefined) closeSync(op.descriptor.fd);
      else await op.descriptor.handle.close();
      return undefined;
    case "readdir": return readdirAsync(op.path);
    case "statfsType":
      try { return (await statfsAsync(op.path)).type; } catch { return null; }
  }
}

/** Runs one physical program with synchronous filesystem calls. */
export function runPhysicalSync<T>(program: PhysicalProgram<T>): T {
  let step = program.next();
  while (!step.done) {
    let value: unknown;
    try { value = performSync(step.value); }
    catch (error) { step = program.throw(error); continue; }
    step = program.next(value);
  }
  return step.value as T;
}

/** Runs the same physical program with asynchronous filesystem calls. */
export async function runPhysicalAsync<T>(program: PhysicalProgram<T>): Promise<T> {
  let step = program.next();
  while (!step.done) {
    let value: unknown;
    try { value = await performAsync(step.value); }
    catch (error) { step = program.throw(error); continue; }
    step = program.next(value);
  }
  return step.value as T;
}

export function* physicalLstat(path: string): PhysicalProgram<BigIntStats | null> {
  return (yield { op: "lstat", path }) as BigIntStats | null;
}

export function* physicalRealpath(path: string): PhysicalProgram<string> {
  return (yield { op: "realpath", path }) as string;
}

export function* physicalOpenDirectory(path: string, followFinal: boolean): PhysicalProgram<PhysicalDescriptor> {
  return (yield { op: "openDirectory", path, followFinal }) as PhysicalDescriptor;
}

export function* physicalFstat(descriptor: PhysicalDescriptor): PhysicalProgram<BigIntStats> {
  return (yield { op: "fstat", descriptor }) as BigIntStats;
}

export function* physicalClose(descriptor: PhysicalDescriptor): PhysicalProgram<void> {
  yield { op: "close", descriptor };
}

export function* physicalReaddir(path: string): PhysicalProgram<readonly string[]> {
  return (yield { op: "readdir", path }) as readonly string[];
}

/** The volume type number, or null when metadata is unavailable. */
export function* physicalStatfsType(path: string): PhysicalProgram<number | null> {
  const type = yield { op: "statfsType", path };
  return typeof type === "number" ? type : null;
}

/** Lossless device/inode identity. */
export function physicalIdentity(status: BigIntStats): string {
  return `${status.dev}:${status.ino}`;
}

// ---------------------------------------------------------------------------
// Native metadata module: lazy, exact package-relative, Darwin arm64 only.

const NATIVE_RELATIVE_PATH = "../../../native/abg_physical_path.node";
const NATIVE_TARGET = Object.freeze({
  platform: "darwin", arch: "arm64", abi: "abg-physical-path/1", nodeApiVersion: 8,
});
/** Upper bound on complete mount populations; a larger table is incomplete. */
export const PHYSICAL_MOUNT_POPULATION_LIMIT = 1024;

export interface NativePhysicalPathModule {
  readonly target: Readonly<Record<string, unknown>>;
  backingPath(fd: number): unknown;
  descriptorMount(fd: number): unknown;
  mountPopulation(limit: number): unknown;
}

let nativeState: { readonly module: NativePhysicalPathModule } | { readonly failure: string } | undefined;

function nativeModuleShape(value: unknown): value is NativePhysicalPathModule {
  if (value === null || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  const target = candidate["target"] as Record<string, unknown> | undefined;
  return target !== null && typeof target === "object" &&
    Object.entries(NATIVE_TARGET).every(([name, expected]) => target[name] === expected) &&
    typeof candidate["backingPath"] === "function" &&
    typeof candidate["descriptorMount"] === "function" &&
    typeof candidate["mountPopulation"] === "function";
}

/** The loaded native module, or the reason it is unavailable. Loads once on
 * first use from this package's own `build/native` member; the exports object
 * is consulted on every call. */
function loadPhysicalPathNative(): { readonly module: NativePhysicalPathModule } | { readonly failure: string } {
  try {
    const path = fileURLToPath(new URL(NATIVE_RELATIVE_PATH, import.meta.url));
    const loaded: unknown = createRequire(import.meta.url)(path);
    return nativeModuleShape(loaded)
      ? { module: loaded }
      : { failure: "native physical-path observer does not declare the Darwin arm64 Node-API 8 target" };
  } catch (error) {
    return { failure: `native physical-path observer is unavailable: ${String(error)}` };
  }
}

export function physicalPathNative(): NativePhysicalPathModule | string {
  const state = nativeState ?? (nativeState = loadPhysicalPathNative());
  return "module" in state ? state.module : state.failure;
}

/** Exact UTF-8 text of kernel bytes; other bytes get a NUL-prefixed form that
 * never equals a path. */
function kernelText(value: unknown): string {
  if (!Buffer.isBuffer(value)) throw new TypeError("native physical-path field is not bytes");
  const text = value.toString("utf8");
  return Buffer.from(text, "utf8").equals(value) && !text.includes("\0") ? text : `\0hex:${value.toString("hex")}`;
}

/** One mount record: identity and topology fields, never space counters. */
export interface PhysicalMount {
  readonly key: string;
  readonly fsid: string;
  readonly type: number;
  readonly subtype: number;
  readonly flags: number;
  readonly flagsExt: number;
  readonly owner: number;
  readonly fstypename: string;
  readonly mntonname: string;
  readonly mntfromname: string;
}

function uint32(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 0xffffffff) {
    throw new TypeError("native physical-path field is not an unsigned 32-bit integer");
  }
  return value;
}

function decodeMount(value: unknown): PhysicalMount {
  if (value === null || typeof value !== "object") throw new TypeError("native mount record is not an object");
  const record = value as Record<string, unknown>;
  const fsidValue = record["fsid"];
  if (!Array.isArray(fsidValue) || fsidValue.length !== 2) throw new TypeError("native mount fsid is malformed");
  const fsid = `${uint32(fsidValue[0])}:${uint32(fsidValue[1])}`;
  const fields = {
    fsid,
    type: uint32(record["type"]),
    subtype: uint32(record["subtype"]),
    flags: uint32(record["flags"]),
    flagsExt: uint32(record["flagsExt"]),
    owner: uint32(record["owner"]),
    fstypename: kernelText(record["fstypename"]),
    mntonname: kernelText(record["mntonname"]),
    mntfromname: kernelText(record["mntfromname"]),
  };
  return Object.freeze({ key: JSON.stringify(Object.values(fields)), ...fields });
}

/** A mount population; `complete` only when the bounded read held every row. */
export interface PhysicalPopulation {
  readonly complete: boolean;
  readonly mounts: readonly PhysicalMount[];
  readonly signature: string;
  readonly failure: string | null;
}

export function observeMountPopulation(native: NativePhysicalPathModule): PhysicalPopulation {
  try {
    const value = native.mountPopulation(PHYSICAL_MOUNT_POPULATION_LIMIT);
    if (value === null || typeof value !== "object") throw new TypeError("native mount population is malformed");
    const record = value as Record<string, unknown>;
    const entries = record["entries"];
    if (!Array.isArray(entries) || typeof record["complete"] !== "boolean" || record["count"] !== entries.length) {
      throw new TypeError("native mount population is malformed");
    }
    const mounts = entries.map(decodeMount);
    const complete = record["complete"] === true && mounts.length > 0;
    return Object.freeze({
      complete,
      mounts: Object.freeze(mounts),
      signature: JSON.stringify(mounts.map((mount) => mount.key).sort()),
      failure: complete ? null : "mount population is truncated or empty",
    });
  } catch (error) {
    return Object.freeze({ complete: false, mounts: Object.freeze([]), signature: "", failure: `mount population unavailable: ${String(error)}` });
  }
}

/** Path components of an absolute path; `/` has none. */
export function physicalComponents(path: string): readonly string[] {
  return path.split(sep).filter(Boolean);
}

/** The physical coordinate of an opened existing directory or file. */
export interface PhysicalCoordinate {
  /** Lossless dev:ino of the opened node. */
  readonly identity: string;
  /** F_GETPATH_NOFIRMLINK components, rechecked against the node identity. */
  readonly backing: readonly string[];
  readonly mount: PhysicalMount;
}

/**
 * Where a requested path lies. `lexicalExisting` is the stored-spelling anchor
 * (nearest existing directory, or the parent of an existing non-directory);
 * `suffix` holds the names below it, of which the first `suffixExisting` exist.
 * `physical` is null when native evidence is unavailable or failed a recheck.
 */
export interface PhysicalLocation {
  readonly requested: string;
  readonly lexicalExisting: string;
  readonly suffix: readonly string[];
  readonly suffixExisting: number;
  readonly anchorIdentity: string;
  readonly physical: PhysicalCoordinate | null;
  readonly failure: string | null;
}

/** Binds a held descriptor to its backing path and mount record and rechecks
 * that the backing path and the requested path still name that node. */
export function* observeDescriptorCoordinate(
  path: string,
  descriptor: PhysicalDescriptor,
  opened: BigIntStats,
): PhysicalProgram<{ readonly physical: PhysicalCoordinate | null; readonly failure: string | null }> {
  const native = physicalPathNative();
  if (typeof native === "string") return { physical: null, failure: native };
  let backing: string;
  let mount: PhysicalMount;
  try {
    backing = kernelText(native.backingPath(descriptor.fd));
    mount = decodeMount(native.descriptorMount(descriptor.fd));
  } catch (error) {
    return { physical: null, failure: `native descriptor observation failed: ${String(error)}` };
  }
  const identity = physicalIdentity(opened);
  if (!backing.startsWith("/") || resolve(backing) !== backing) {
    return { physical: null, failure: "descriptor backing path is not absolute and normalized" };
  }
  try {
    const backingStatus = yield* physicalLstat(backing);
    if (backingStatus === null || backingStatus.isSymbolicLink() || physicalIdentity(backingStatus) !== identity) {
      return { physical: null, failure: "descriptor backing path does not name the opened node" };
    }
    if ((yield* physicalRealpath(backing)) !== backing) {
      return { physical: null, failure: "descriptor backing path is not its stored spelling" };
    }
    const requestedStatus = yield* physicalLstat(path);
    if (requestedStatus === null || requestedStatus.isSymbolicLink() || physicalIdentity(requestedStatus) !== identity) {
      return { physical: null, failure: "requested path changed while its descriptor was observed" };
    }
  } catch (error) {
    return { physical: null, failure: `descriptor backing recheck failed: ${String(error)}` };
  }
  return { physical: Object.freeze({ identity, backing: Object.freeze(physicalComponents(backing)), mount }), failure: null };
}

/** Opens one existing stored-spelling directory without following its final
 * component and observes its coordinate; the descriptor is always closed. */
function* observeDirectoryAnchor(path: string, status: BigIntStats): PhysicalProgram<{
  readonly physical: PhysicalCoordinate | null; readonly failure: string | null;
}> {
  const native = physicalPathNative();
  if (typeof native === "string") return { physical: null, failure: native };
  const descriptor = yield* physicalOpenDirectory(path, false);
  try {
    const opened = yield* physicalFstat(descriptor);
    if (!opened.isDirectory() || physicalIdentity(opened) !== physicalIdentity(status)) {
      return { physical: null, failure: "anchor identity changed while it was opened" };
    }
    return yield* observeDescriptorCoordinate(path, descriptor, opened);
  } finally {
    yield* physicalClose(descriptor);
  }
}

/**
 * The physical location of a planned path. Preserves the existing planned-path
 * law: nearest existing ancestor, no symlink, directory kind, stored spelling;
 * an existing non-directory resolves through its parent with its stored name.
 * Lexical-rule violations throw; native uncertainty is reported in `failure`.
 */
export function* observePlannedLocation(path: string): PhysicalProgram<PhysicalLocation> {
  const requested = resolve(path);
  let anchor = requested;
  const suffix: string[] = [];
  let suffixExisting = 0;
  const final = yield* physicalLstat(requested);
  if (final !== null && final.isSymbolicLink()) throw new TypeError("planned path is a symlink");
  if (final !== null && !final.isDirectory()) {
    if ((yield* physicalRealpath(requested)) !== requested) throw new TypeError("planned path is not physical-canonical");
    anchor = dirname(requested);
    suffix.push(basename(requested));
    suffixExisting = 1;
  }
  for (;;) {
    const status = anchor === requested ? final : yield* physicalLstat(anchor);
    if (status === null) {
      const parent = dirname(anchor);
      if (parent === anchor) throw new TypeError("planned path has no existing ancestor");
      suffix.unshift(basename(anchor));
      anchor = parent;
      continue;
    }
    if (status.isSymbolicLink() || !status.isDirectory()) {
      throw new TypeError("planned path crosses a symlink or non-directory node");
    }
    if ((yield* physicalRealpath(anchor)) !== anchor) throw new TypeError("planned path is not physical-canonical");
    const observed = yield* observeDirectoryAnchor(anchor, status);
    return Object.freeze({
      requested, lexicalExisting: anchor, suffix: Object.freeze(suffix), suffixExisting,
      anchorIdentity: physicalIdentity(status), ...observed,
    });
  }
}

/** The location of an existing node through a descriptor the caller already
 * holds (for example a file opened for reading); the caller keeps custody. */
export function* observeHeldNodeLocation(path: string, descriptor: PhysicalDescriptor): PhysicalProgram<PhysicalLocation> {
  const opened = yield* physicalFstat(descriptor);
  const observed = yield* observeDescriptorCoordinate(path, descriptor, opened);
  return Object.freeze({
    requested: resolve(path), lexicalExisting: resolve(path), suffix: Object.freeze([]), suffixExisting: 0,
    anchorIdentity: physicalIdentity(opened), ...observed,
  });
}

/** Rechecks a location after acquisition: the anchor keeps its identity and
 * the first absent suffix name is still absent. */
export function* recheckPlannedLocation(location: PhysicalLocation): PhysicalProgram<string | null> {
  try {
    const anchor = yield* physicalLstat(location.lexicalExisting);
    if (anchor === null || physicalIdentity(anchor) !== location.anchorIdentity) return "planned anchor changed during observation";
    const firstMissing = location.suffix[location.suffixExisting];
    if (firstMissing !== undefined &&
      (yield* physicalLstat(resolve(location.lexicalExisting, ...location.suffix.slice(0, location.suffixExisting + 1)))) !== null) {
      return "a previously absent planned component appeared during observation";
    }
    return null;
  } catch (error) {
    return `planned location recheck failed: ${String(error)}`;
  }
}

/** Where a mount attaches, observed through its parent directory only: the
 * mounted volume itself is never opened or listed. */
export interface PhysicalAttachmentParent {
  readonly backing: readonly string[];
  readonly mount: PhysicalMount;
  /** Stored final component, when it was required and resolved. */
  readonly storedName: string | null;
}

/** Observes the parent of an attachment point. `resolveName` asks for the
 * stored final component through a parent listing. Null when unobservable. */
export function* observeAttachmentParent(mount: PhysicalMount, resolveName: (backing: readonly string[]) => boolean): PhysicalProgram<PhysicalAttachmentParent | null> {
  const native = physicalPathNative();
  if (typeof native === "string" || !mount.mntonname.startsWith("/") || resolve(mount.mntonname) !== mount.mntonname ||
    mount.mntonname === "/") return null;
  const parentPath = dirname(mount.mntonname);
  const finalName = basename(mount.mntonname);
  let descriptor: PhysicalDescriptor;
  try { descriptor = yield* physicalOpenDirectory(parentPath, true); }
  catch { return null; }
  try {
    const opened = yield* physicalFstat(descriptor);
    let backingText: string;
    let parentMount: PhysicalMount;
    try {
      backingText = kernelText(native.backingPath(descriptor.fd));
      parentMount = decodeMount(native.descriptorMount(descriptor.fd));
    } catch { return null; }
    if (!opened.isDirectory() || !backingText.startsWith("/") || resolve(backingText) !== backingText) return null;
    const backing = physicalComponents(backingText);
    if (!resolveName(backing)) return { backing, mount: parentMount, storedName: null };
    const before = yield* physicalLstat(parentPath);
    const entries = yield* physicalReaddir(parentPath);
    const after = yield* physicalLstat(parentPath);
    const identity = physicalIdentity(opened);
    if (before === null || after === null || physicalIdentity(before) !== identity || physicalIdentity(after) !== identity) {
      return { backing, mount: parentMount, storedName: null };
    }
    let storedName: string | null = entries.includes(finalName) ? finalName : null;
    if (storedName === null) {
      const fold = (name: string): string => name.normalize("NFC").toLowerCase();
      const candidates = entries.filter((entry) => fold(entry) === fold(finalName));
      storedName = candidates.length === 1 ? candidates[0]! : null;
    }
    return { backing, mount: parentMount, storedName };
  } catch {
    return null;
  } finally {
    yield* physicalClose(descriptor);
  }
}
