import { pathRelation, pathWithin } from "./path_confinement.js";
import {
  observeAttachmentParent,
  observeMountPopulation,
  observePlannedLocation,
  physicalComponents,
  physicalPathNative,
  physicalStatfsType,
  recheckPlannedLocation,
  type PhysicalLocation,
  type PhysicalMount,
  type PhysicalPopulation,
  type PhysicalProgram,
} from "./physical_path_observation.js";

// The one protected-root relation (T-293 B05/B21). It answers `separate`,
// `overlap` or `indeterminate` for a planned path against protected roots.
//
// Demonstrated overlap is decided first from lexical, identity and descriptor
// backing-path evidence, before any separation support is required. Positive
// separation then needs: native evidence for every anchor; complete, equal
// mount populations bracketing acquisition; both anchors on one positively
// identified APFS mount instance with unique population membership; and no
// unhandled attachment beneath any compared recursive scope. Ancestor
// mismatch, realpath or unequal device numbers alone never separate.
//
// Modes: `contained` (C0 files/parents, context nodes, the directional
// Product-root rule) refuses equality or containment and permits a proven
// enclosing ancestor; `enclosing` (native W, C2 archive) also refuses enclosure
// and treats the target as a recursive scope. Protected roots are always
// recursive. Owners map overlap to their existing refusal and indeterminate to
// the existing `invalid_coordinate` uncertainty.

export type PhysicalSeparation = "separate" | "overlap" | "indeterminate";
export type PhysicalRelationMode = "contained" | "enclosing";

export interface PhysicalFinding {
  readonly separation: Exclude<PhysicalSeparation, "separate">;
  readonly target: string;
  readonly protectedRoot: string;
  readonly reason: string;
}

const MNT_UNION = 0x20;
const MNT_LOCAL = 0x1000;
const BLOCK_DEVICE_SOURCE = /^\/dev\/disk\d+(?:s\d+)*$/u;

function prefixOf(prefix: readonly string[], full: readonly string[]): boolean {
  return prefix.length <= full.length && prefix.every((name, index) => full[index] === name);
}

function strictPrefixOf(prefix: readonly string[], full: readonly string[]): boolean {
  return prefix.length < full.length && prefixOf(prefix, full);
}

/** Backing components followed by the unresolved suffix. */
function coordinates(location: PhysicalLocation): readonly string[] {
  return location.physical === null ? [] : [...location.physical.backing, ...location.suffix];
}

function existingCount(location: PhysicalLocation): number {
  return location.physical === null ? 0 : location.physical.backing.length + location.suffixExisting;
}

function hasMissing(location: PhysicalLocation): boolean {
  return location.suffix.length > location.suffixExisting;
}

/** These native name models establish only the bounded ASCII distinction.
 * A platform name alone excludes neither FAT/short-name nor Windows aliases.
 * Unknown metadata supplies no positive separation evidence. */
function asciiNameModel(type: number | null): boolean {
  if (type === null) return false;
  if (process.platform === "darwin") return type === 26; // APFS
  if (process.platform === "linux") return type === 0xef53 || type === 0x01021994; // ext, tmpfs
  return false;
}

function asciiDistinct(left: string, right: string): boolean {
  const leftAscii = /^[\x20-\x7e]*/u.exec(left)![0].toLowerCase();
  const rightAscii = /^[\x20-\x7e]*/u.exec(right)![0].toLowerCase();
  const common = Math.min(leftAscii.length, rightAscii.length);
  return leftAscii.slice(0, common) !== rightAscii.slice(0, common) ||
    (leftAscii.length === left.length && rightAscii.length === right.length && leftAscii !== rightAscii);
}

/** Demonstrated overlap only; null means no overlap was witnessed. */
function overlapWitness(target: PhysicalLocation, protectedRoot: PhysicalLocation, mode: PhysicalRelationMode): string | null {
  const lexicalInside = pathWithin(pathRelation(protectedRoot.requested, target.requested));
  const lexicalEnclosing = pathWithin(pathRelation(target.requested, protectedRoot.requested));
  if (lexicalInside || (mode === "enclosing" && lexicalEnclosing)) return "requested paths overlap";
  if (target.anchorIdentity === protectedRoot.anchorIdentity &&
    (prefixOf(protectedRoot.suffix, target.suffix) || (mode === "enclosing" && prefixOf(target.suffix, protectedRoot.suffix)))) {
    return "anchors are one filesystem object";
  }
  if (target.physical !== null && protectedRoot.physical !== null) {
    if (target.physical.identity === protectedRoot.physical.identity &&
      (prefixOf(protectedRoot.suffix, target.suffix) || (mode === "enclosing" && prefixOf(target.suffix, protectedRoot.suffix)))) {
      return "descriptors identify one filesystem object";
    }
    const left = coordinates(target);
    const right = coordinates(protectedRoot);
    if (prefixOf(right, left) || (mode === "enclosing" && prefixOf(left, right))) return "descriptor backing paths overlap";
  }
  return null;
}

/** Where an unhandled mount attaches: the exact location, an ancestor bound
 * beneath which it attaches, or unknown (null). */
export interface AttachmentLocation {
  readonly bound: readonly string[] | null;
  readonly exact: boolean;
}

/** Stable separation support shared by every comparison of one acquisition. */
export interface PhysicalEvidence {
  readonly failure: string | null;
  readonly population: readonly PhysicalMount[];
  readonly attachments: ReadonlyMap<string, AttachmentLocation>;
}

function openableContainer(mount: PhysicalMount): boolean {
  return (mount.fstypename === "apfs" || mount.fstypename === "hfs") &&
    (mount.flags & MNT_LOCAL) !== 0 && (mount.flags & MNT_UNION) === 0;
}

function uniqueMember(population: readonly PhysicalMount[], mount: PhysicalMount): boolean {
  return population.filter((row) => row.key === mount.key).length === 1 &&
    population.filter((row) => row.fsid === mount.fsid).length === 1;
}

/** An attachment that cannot alias a compared scope: one uniquely attached
 * local non-union APFS/HFS block-device volume distinct from every anchor. */
function handledAttachment(mount: PhysicalMount, population: readonly PhysicalMount[], anchorFsids: ReadonlySet<string>): boolean {
  return openableContainer(mount) && BLOCK_DEVICE_SOURCE.test(mount.mntfromname) &&
    uniqueMember(population, mount) && !anchorFsids.has(mount.fsid);
}

function* locateAttachment(
  mount: PhysicalMount,
  population: readonly PhysicalMount[],
  scopes: readonly (readonly string[])[],
  memo: Map<string, AttachmentLocation>,
): PhysicalProgram<AttachmentLocation> {
  const known = memo.get(mount.key);
  if (known !== undefined) return known;
  let located: AttachmentLocation = { bound: null, exact: false };
  if (mount.mntonname.startsWith("/") && mount.mntonname !== "/") {
    const lexical = physicalComponents(mount.mntonname);
    const unopenable = population
      .filter((row) => row.key !== mount.key && row.mntonname.startsWith("/") &&
        strictPrefixOf(physicalComponents(row.mntonname), lexical) && !openableContainer(row))
      .sort((left, right) => physicalComponents(right.mntonname).length - physicalComponents(left.mntonname).length);
    const container = unopenable[0];
    if (container !== undefined) {
      // Never enter a non-local container; the mount lies somewhere beneath it.
      const outer = yield* locateAttachment(container, population, scopes, memo);
      located = { bound: outer.bound, exact: false };
    } else {
      const parent = yield* observeAttachmentParent(mount,
        (backing) => scopes.some((scope) => strictPrefixOf(backing, scope)));
      if (parent !== null && uniqueMember(population, parent.mount) && openableContainer(parent.mount)) {
        located = parent.storedName === null
          ? { bound: parent.backing, exact: false }
          : { bound: [...parent.backing, parent.storedName], exact: true };
      }
    }
  }
  memo.set(mount.key, located);
  return located;
}

function attachmentRelevant(location: AttachmentLocation, scope: readonly string[]): boolean {
  if (location.bound === null) return true;
  return location.exact
    ? prefixOf(scope, location.bound) || prefixOf(location.bound, scope)
    : prefixOf(scope, location.bound) || strictPrefixOf(location.bound, scope);
}

/** Locates every unhandled attachment that could matter to a recursive scope. */
function* acquireAttachments(
  population: PhysicalPopulation,
  anchors: readonly PhysicalLocation[],
  scopes: readonly (readonly string[])[],
): PhysicalProgram<ReadonlyMap<string, AttachmentLocation>> {
  const anchorKeys = new Set(anchors.flatMap((anchor) => anchor.physical === null ? [] : [anchor.physical.mount.key]));
  const anchorFsids = new Set(anchors.flatMap((anchor) => anchor.physical === null ? [] : [anchor.physical.mount.fsid]));
  const memo = new Map<string, AttachmentLocation>();
  const attachments = new Map<string, AttachmentLocation>();
  for (const mount of population.mounts) {
    if (mount.mntonname === "/" || anchorKeys.has(mount.key) ||
      handledAttachment(mount, population.mounts, anchorFsids)) continue;
    attachments.set(mount.key, yield* locateAttachment(mount, population.mounts, scopes, memo));
  }
  return attachments;
}

/** Positive separation or uncertainty, after no overlap was witnessed. */
function separationVerdict(
  target: PhysicalLocation,
  protectedRoot: PhysicalLocation,
  mode: PhysicalRelationMode,
  evidence: PhysicalEvidence,
  nameModel: boolean,
): { readonly separation: PhysicalSeparation; readonly reason: string } {
  const witnessed = overlapWitness(target, protectedRoot, mode);
  if (witnessed !== null) return { separation: "overlap", reason: witnessed };
  if (target.physical === null || protectedRoot.physical === null) {
    return { separation: "indeterminate", reason: target.failure ?? protectedRoot.failure ?? "native evidence is unavailable" };
  }
  if (evidence.failure !== null) return { separation: "indeterminate", reason: evidence.failure };
  const mount = target.physical.mount;
  if (mount.key !== protectedRoot.physical.mount.key) {
    return { separation: "indeterminate", reason: "anchors are not on one mount instance; cross-mount separation is unsupported" };
  }
  if (mount.fstypename !== "apfs" || (mount.flags & MNT_LOCAL) === 0 || (mount.flags & MNT_UNION) !== 0 ||
    !BLOCK_DEVICE_SOURCE.test(mount.mntfromname) || !uniqueMember(evidence.population, mount)) {
    return { separation: "indeterminate", reason: "anchor mount is not one positively identified APFS instance with unique population membership" };
  }
  const scopes = mode === "enclosing" ? [coordinates(protectedRoot), coordinates(target)] : [coordinates(protectedRoot)];
  for (const [key, location] of evidence.attachments) {
    if (scopes.some((scope) => attachmentRelevant(location, scope))) {
      const attached = evidence.population.find((row) => row.key === key);
      return { separation: "indeterminate", reason: `unhandled mount attachment may lie beneath a compared scope (${attached?.fstypename ?? "unknown"})` };
    }
  }
  const targetParts = coordinates(target);
  const protectedParts = coordinates(protectedRoot);
  const targetExisting = existingCount(target);
  const protectedExisting = existingCount(protectedRoot);
  // A node strictly shallower than the protected root cannot lie inside it.
  if (mode === "contained" && targetParts.length < protectedParts.length) return { separation: "separate", reason: "proven enclosing ancestor" };
  let uncertain = false;
  for (let index = 0; index < Math.min(targetParts.length, protectedParts.length); index += 1) {
    const left = targetParts[index]!;
    const right = protectedParts[index]!;
    if (left === right) continue;
    // An alias of an existing stored component would resolve to it or fail the
    // stored-spelling check, instead of remaining a different missing name.
    if (index < targetExisting || index < protectedExisting) return { separation: "separate", reason: "distinct existing branch" };
    if (asciiDistinct(left, right) && nameModel) return { separation: "separate", reason: "distinct ASCII names under the volume name model" };
    uncertain = true;
  }
  if (uncertain) {
    return { separation: "indeterminate", reason: "missing path components are not distinguished on this volume" };
  }
  return targetParts.length >= protectedParts.length || mode === "enclosing"
    ? { separation: "overlap", reason: "backing coordinates overlap" }
    : { separation: "separate", reason: "proven enclosing ancestor" };
}

function populationFailure(before: PhysicalPopulation | null, after: PhysicalPopulation | null): string | null {
  if (before === null || after === null) return "mount population is unavailable";
  if (!before.complete) return before.failure ?? "mount population is incomplete";
  if (!after.complete) return after.failure ?? "mount population is incomplete";
  return before.signature === after.signature ? null : "mount population changed during observation";
}

function* nameModelFor(target: PhysicalLocation, protectedRoots: readonly PhysicalLocation[]): PhysicalProgram<boolean> {
  if (!hasMissing(target) || !protectedRoots.some(hasMissing)) return false;
  return asciiNameModel(yield* physicalStatfsType(target.lexicalExisting));
}

function preferred(findings: readonly PhysicalFinding[]): PhysicalFinding | null {
  return findings.find((finding) => finding.separation === "overlap") ?? findings[0] ?? null;
}

export interface PhysicalSeparationRequest {
  readonly targets: readonly string[];
  readonly protectedRoots: readonly string[];
  readonly mode: PhysicalRelationMode;
}

/**
 * One bracketed acquisition for planned targets against protected roots.
 * Returns the first demonstrated overlap, else the first uncertainty, else
 * null when every pair is positively separate. Lexical-rule violations (a
 * symlink, a non-directory ancestor, a non-stored spelling) throw.
 */
export function* physicalSeparationProgram(request: PhysicalSeparationRequest): PhysicalProgram<PhysicalFinding | null> {
  const native = physicalPathNative();
  const before = typeof native === "string" ? null : observeMountPopulation(native);
  const targets: PhysicalLocation[] = [];
  for (const path of request.targets) targets.push(yield* observePlannedLocation(path));
  const protectedRoots: PhysicalLocation[] = [];
  for (const path of request.protectedRoots) protectedRoots.push(yield* observePlannedLocation(path));
  const overlaps: PhysicalFinding[] = [];
  for (const target of targets) {
    for (const protectedRoot of protectedRoots) {
      const reason = overlapWitness(target, protectedRoot, request.mode);
      if (reason !== null) overlaps.push({ separation: "overlap", target: target.requested, protectedRoot: protectedRoot.requested, reason });
    }
  }
  if (overlaps.length > 0) return overlaps[0]!;
  const anchors = [...targets, ...protectedRoots];
  let failure: string | null = typeof native === "string" ? native : null;
  let attachments: ReadonlyMap<string, AttachmentLocation> = new Map();
  if (failure === null && before !== null && before.complete && anchors.every((anchor) => anchor.physical !== null)) {
    const scopes = [
      ...protectedRoots.map(coordinates),
      ...(request.mode === "enclosing" ? targets.map(coordinates) : []),
    ];
    attachments = yield* acquireAttachments(before, anchors, scopes);
  }
  for (const anchor of anchors) failure ??= yield* recheckPlannedLocation(anchor);
  const after = typeof native === "string" ? null : observeMountPopulation(native);
  failure ??= populationFailure(before, after);
  const evidence: PhysicalEvidence = { failure, population: before?.mounts ?? [], attachments };
  const findings: PhysicalFinding[] = [];
  for (const target of targets) {
    const nameModel = yield* nameModelFor(target, protectedRoots);
    for (const protectedRoot of protectedRoots) {
      const verdict = separationVerdict(target, protectedRoot, request.mode, evidence, nameModel);
      if (verdict.separation !== "separate") {
        findings.push({ separation: verdict.separation, target: target.requested, protectedRoot: protectedRoot.requested, reason: verdict.reason });
      }
    }
  }
  return preferred(findings);
}

/** Protected-root evidence opened once for a sequence of existing-node checks
 * (context observation). Each node check re-reads the mount population. */
export interface PhysicalProtectedSession {
  readonly protectedRoots: readonly PhysicalLocation[];
  readonly before: PhysicalPopulation | null;
  readonly evidence: PhysicalEvidence;
}

export function* openPhysicalProtectedSession(protectedRootPaths: readonly string[]): PhysicalProgram<PhysicalProtectedSession> {
  const native = physicalPathNative();
  const before = typeof native === "string" ? null : observeMountPopulation(native);
  const protectedRoots: PhysicalLocation[] = [];
  for (const path of protectedRootPaths) protectedRoots.push(yield* observePlannedLocation(path));
  let failure: string | null = typeof native === "string" ? native : null;
  let attachments: ReadonlyMap<string, AttachmentLocation> = new Map();
  if (failure === null && before !== null && before.complete && protectedRoots.every((root) => root.physical !== null)) {
    attachments = yield* acquireAttachments(before, protectedRoots, protectedRoots.map(coordinates));
  }
  for (const root of protectedRoots) failure ??= yield* recheckPlannedLocation(root);
  const after = typeof native === "string" ? null : observeMountPopulation(native);
  failure ??= populationFailure(before, after);
  return { protectedRoots, before, evidence: { failure, population: before?.mounts ?? [], attachments } };
}

/** An existing node (exact scope, contained mode) against the session's
 * protected roots, before any of its content is read. */
export function physicalNodeFinding(session: PhysicalProtectedSession, node: PhysicalLocation): PhysicalFinding | null {
  const native = physicalPathNative();
  const now = typeof native === "string" ? null : observeMountPopulation(native);
  const evidence: PhysicalEvidence = {
    ...session.evidence,
    failure: session.evidence.failure ?? populationFailure(session.before, now),
  };
  const findings: PhysicalFinding[] = [];
  for (const protectedRoot of session.protectedRoots) {
    const verdict = separationVerdict(node, protectedRoot, "contained", evidence, false);
    if (verdict.separation !== "separate") {
      findings.push({ separation: verdict.separation, target: node.requested, protectedRoot: protectedRoot.requested, reason: verdict.reason });
    }
  }
  return preferred(findings);
}
