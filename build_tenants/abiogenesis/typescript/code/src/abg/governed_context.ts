import { spawn } from "node:child_process";
import { readFileSync, realpathSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer, type Server, type Socket } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { inspect } from "node:util";

import { sha256Bytes, sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { runEnvironmentForProgram } from "../gtl/stdo_run_environment.js";
import type { GtlProgram, ModulePublication } from "../gtl/contracts.js";

/**
 * Private native Construction governed lookup (RC3 Increment B).
 *
 * The native actor-process owner constructs one OwnedContextLookup per actor
 * occurrence from authenticated owner state. Its finite keys are the
 * intersection of the role selectors, Context readRoots, declared sources and
 * the GC03 principal grant. Every request and the later publication point
 * reacquire the held prefix, occurrence, grant and source. The released GC03
 * HostLookupBinding must independently permit the same page; it can only
 * narrow. No Public operation, event schema, store, registry or OS confinement
 * is introduced.
 */
export const GOVERNED_CONTEXT_ROLE_SELECTORS = Object.freeze(["current_worksite", "admitted_execution_evidence"] as const);
/** Native fixed-client page bound; the live bound is its intersection with the GC03 policy. */
export const GOVERNED_CONTEXT_MAX_PAGE_BYTES = 65536;
export const GOVERNED_CONTEXT_MAX_REQUEST_BYTES = 4096;
export const GOVERNED_CONTEXT_ENDPOINT_ENV = "ABG_GOVERNED_CONTEXT_ENDPOINT";
export const GOVERNED_CONTEXT_CLIENT_ENV = "ABG_GOVERNED_CONTEXT_CLIENT";
export const GOVERNED_CONTEXT_EXECUTABLE_ENV = "ABG_GOVERNED_CONTEXT_EXECUTABLE";
export const GOVERNED_CONTEXT_CLIENT_MARKER = "governed_context_client.js";
export const GC03_SELECTED_RELEASE = Object.freeze({
  identity: "urn:a-c:development-supplement:governed-context:gc03-adb3d8ee:1",
  inventorySha256: "fc6befa45d62acd902665d545fc20f65dc3d435fa242a72aaa4e8986c080c003",
  sourceCommit: "adb3d8ee18ecd307162cad098a8ff5f03cbcc77f",
  hostLookup: "ac_support_core.HostLookupBinding.read",
});

export type GovernedContextRequest = {
  readonly requestId: string; readonly key: string; readonly offset: number; readonly maxBytes: number;
};
export type GovernedContextRefusalCode =
  | "request_invalid" | "request_duplicate" | "key_denied" | "page_invalid" | "binding_stale"
  | "source_changed" | "grant_changed" | "occurrence_inactive" | "gc03_refused" | "gc03_disagreement"
  | "endpoint_closed" | "endpoint_inactive" | "unsupported_composition";
export type GovernedSourceRole = "original_task" | "original_rubric" | "testing_result_field" | "worksite_source";
type PathAsset = { readonly path: string; readonly digest: Sha256Digest };

/** Owner-held live state. Every member is an owner callback; none is actor JSON. */
export interface GovernedContextHeldPrefix {
  readonly runId: string;
  readonly prefixDigest: Sha256Digest;
  readonly admittedResult: (resultRef: string) => {
    readonly resultDigest: Sha256Digest; readonly cCallRef: string; readonly actorInvocationRef: string;
    readonly field: (fieldPath: readonly (string | number)[]) => Uint8Array | null;
  } | null;
}
export interface GovernedContextOwnerAuthority {
  readonly occurrence: { readonly runId: string; readonly cCallRef: string; readonly actorInvocationRef: string; readonly actorRef: string; readonly attempt: number };
  readonly role: { readonly constructorRole: "construction"; readonly policyRef: string; readonly policyDigest: Sha256Digest;
    readonly contextPolicyRef: string; readonly selectors: readonly string[] };
  readonly context: { readonly observationRef: string; readonly readRoots: readonly string[];
    readonly entries: readonly { readonly relativePath: string; readonly state: string }[] };
  readonly original: { readonly task: PathAsset; readonly rubric: PathAsset };
  readonly worksiteSources: readonly PathAsset[];
  readonly testing: { readonly resultRef: string; readonly resultDigest: Sha256Digest; readonly fieldPath: readonly (string | number)[];
    readonly producer: { readonly cCallRef: string; readonly actorInvocationRef: string }; readonly provenance: readonly string[] };
  readonly grant: { readonly principalId: string; readonly grantId: string; readonly grantDigest: Sha256Digest; readonly sourceKeys: readonly string[] };
  /** Intersection of the GC03 policy `limits.max_bytes` and the native client bound. */
  readonly pageBound: number;
  readonly release: { readonly identity: string; readonly inventorySha256: string; readonly pythonDigest: Sha256Digest;
    readonly pythonVersion: string; readonly adapterDigest: Sha256Digest; readonly policyDigest: Sha256Digest };
  readonly reacquire: {
    readonly prefix: () => GovernedContextHeldPrefix | null;
    readonly occurrenceActive: () => boolean;
    readonly grantDigest: () => Sha256Digest | null;
    readonly worksiteSource: (path: string) => Uint8Array | null;
  };
  readonly host: GovernedContextHostReader;
}
export type GovernedContextHostPage = {
  readonly offset: number; readonly length: number; readonly totalBytes: number;
  readonly pageDigest: Sha256Digest; readonly selectedDigest: Sha256Digest; readonly publication: "not_performed";
  /** GC03 identities of the complete released Context and Recheck that HostLookupBinding consumed. */
  readonly contextSha256: string; readonly recheckSha256: string;
};
export type GovernedContextHostReader = (input: {
  readonly key: string; readonly offset: number; readonly maxBytes: number;
  readonly source: { readonly role: GovernedSourceRole; readonly sourceKey: string; readonly digest: Sha256Digest };
  readonly bindingDigest: Sha256Digest;
}) => Promise<GovernedContextHostPage>;

type Source = { readonly role: GovernedSourceRole; readonly sourceKey: string; readonly digest: Sha256Digest;
  readonly read: () => Uint8Array | null };

export class GovernedContextRefusal extends Error {
  constructor(readonly code: GovernedContextRefusalCode, message: string) { super(message); }
}
const refuse = (code: GovernedContextRefusalCode, message: string): never => { throw new GovernedContextRefusal(code, message); };

const digestPattern = /^sha256:[0-9a-f]{64}$/u;
const nonempty = (value: unknown): value is string => typeof value === "string" && value.length > 0;
function relativePath(path: unknown): path is string {
  return nonempty(path) && !path.startsWith("/") && !path.includes("\\") && path.split("/").every(part => part !== "" && part !== "." && part !== "..");
}
function within(path: string, roots: readonly string[]): boolean {
  return roots.some(root => root === "." || root === "" || path === root || path.startsWith(root.endsWith("/") ? root : root + "/"));
}
const testingKey = (resultRef: string, fieldPath: readonly (string | number)[]) => `${resultRef}#${JSON.stringify(fieldPath)}`;

/** Exact request shape: the actor chooses only a finite key and a page. An excessive maxBytes refuses; it is never clamped. */
export function admitGovernedContextRequest(value: unknown, pageBound: number = GOVERNED_CONTEXT_MAX_PAGE_BYTES): GovernedContextRequest {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return refuse("request_invalid", "request must be one object");
  const keys = Object.keys(value).sort();
  if (keys.join(",") !== "key,maxBytes,offset,requestId") return refuse("request_invalid", "request accepts only requestId, key, offset and maxBytes");
  const r = value as Record<string, unknown>;
  if (typeof r.requestId !== "string" || !/^[A-Za-z0-9._:-]{1,128}$/u.test(r.requestId)) return refuse("request_invalid", "requestId is invalid");
  if (typeof r.key !== "string" || !/^late\/(?:0|[1-9][0-9]{0,8})$/u.test(r.key)) return refuse("key_denied", "key is not a finite governed key");
  if (!Number.isSafeInteger(r.offset) || (r.offset as number) < 0) return refuse("page_invalid", "offset must be a nonnegative integer");
  if (!Number.isSafeInteger(r.maxBytes) || (r.maxBytes as number) < 1 || (r.maxBytes as number) > Math.min(pageBound, GOVERNED_CONTEXT_MAX_PAGE_BYTES))
    return refuse("page_invalid", "maxBytes is outside the page bound");
  return Object.freeze({ requestId: r.requestId, key: r.key, offset: r.offset as number, maxBytes: r.maxBytes as number });
}

const owned = new WeakSet<object>();

/** Module-owned, nonserializable lookup. Its class is not exported. */
class OwnedContextLookup {
  readonly #authority: GovernedContextOwnerAuthority;
  readonly #sources: readonly Source[];
  readonly #bindingDigest: Sha256Digest;
  readonly #prefixDigest: Sha256Digest;
  readonly #requests = new Set<string>();
  #closed: string | null = null;

  constructor(authority: GovernedContextOwnerAuthority, sources: readonly Source[], bindingDigest: Sha256Digest, prefixDigest: Sha256Digest) {
    this.#authority = authority; this.#sources = sources; this.#bindingDigest = bindingDigest; this.#prefixDigest = prefixDigest;
    owned.add(this); Object.freeze(this);
  }
  get bindingDigest(): Sha256Digest { return this.#bindingDigest; }
  get keys(): readonly { readonly key: string; readonly role: GovernedSourceRole; readonly sourceKey: string; readonly digest: Sha256Digest }[] {
    return Object.freeze(this.#sources.map((s, i) => Object.freeze({ key: `late/${i}`, role: s.role, sourceKey: s.sourceKey, digest: s.digest })));
  }
  get closed(): string | null { return this.#closed; }
  get occurrence(): GovernedContextOccurrence {
    const o = this.#authority.occurrence;
    return Object.freeze({ runId: o.runId, cCallRef: o.cCallRef, actorInvocationRef: o.actorInvocationRef });
  }
  close(reason: "completed" | "failed" | "interrupted"): void { if (this.#closed === null) this.#closed = reason; }
  toJSON(): never { throw new TypeError("OwnedContextLookup is owner state and cannot be serialized"); }
  [inspect.custom](): string { return "[OwnedContextLookup]"; }

  /** Current owner authority, rechecked on every request and before publication. */
  #reacquire(requireActive: boolean): void {
    const a = this.#authority;
    if (requireActive && !a.reacquire.occurrenceActive()) refuse("occurrence_inactive", "actor occurrence is no longer active");
    const prefix = a.reacquire.prefix();
    if (prefix === null || prefix.runId !== a.occurrence.runId) refuse("binding_stale", "held Run prefix is unavailable or foreign");
    const result = prefix!.admittedResult(a.testing.resultRef);
    if (result === null || result.resultDigest !== a.testing.resultDigest || result.cCallRef !== a.testing.producer.cCallRef ||
      result.actorInvocationRef !== a.testing.producer.actorInvocationRef) refuse("binding_stale", "selected Testing Result or producer is not current");
    if (a.reacquire.grantDigest() !== a.grant.grantDigest) refuse("grant_changed", "GC03 grant changed or is unavailable");
    for (const source of this.#sources) {
      const bytes = source.read();
      if (bytes === null || sha256Bytes(bytes) !== source.digest) refuse("source_changed", `selected source changed: ${source.sourceKey}`);
    }
  }

  /** Cold rejoin of a retained response against current held truth. */
  coldJoin(responseBytes: Uint8Array): void {
    let value: Record<string, unknown>;
    try { value = JSON.parse(Buffer.from(responseBytes).toString("utf8")) as Record<string, unknown>; }
    catch { return refuse("binding_stale", "retained response is not JSON"); }
    const occ = value.occurrence as Record<string, unknown> | undefined, a = this.#authority;
    if (value.kind !== "governed_context_page" || value.bindingDigest !== this.#bindingDigest || occ?.runId !== a.occurrence.runId ||
      occ?.cCallRef !== a.occurrence.cCallRef || occ?.actorInvocationRef !== a.occurrence.actorInvocationRef)
      refuse("binding_stale", "retained response belongs to another binding or occurrence");
    const source = this.#sources[Number(String(value.key).slice(5))];
    if (source === undefined || (value.source as Record<string, unknown> | undefined)?.digest !== source.digest)
      refuse("binding_stale", "retained response source differs from the binding");
    const content = Buffer.from(String(value.content), "base64");
    if (sha256Bytes(content) !== value.pageDigest) refuse("binding_stale", "retained page bytes differ from their digest");
    this.#reacquire(false);
  }

  async read(raw: unknown): Promise<Buffer> {
    if (this.#closed !== null) refuse("endpoint_closed", `governed lookup closed: ${this.#closed}`);
    const request = admitGovernedContextRequest(raw, this.#authority.pageBound);
    if (this.#requests.has(request.requestId)) refuse("request_duplicate", "requestId was already used in this occurrence");
    this.#requests.add(request.requestId);
    this.#reacquire(true);
    const index = Number(request.key.slice(5)), source = this.#sources[index];
    if (source === undefined) return refuse("key_denied", "key is absent from this governed Context");
    const bytes = Buffer.from(source.read()!);
    if (request.offset > bytes.length) refuse("page_invalid", "page starts beyond the selected source");
    const page = bytes.subarray(request.offset, request.offset + request.maxBytes), end = request.offset + page.length;
    let host: GovernedContextHostPage;
    try {
      host = await this.#authority.host({ key: request.key, offset: request.offset, maxBytes: request.maxBytes,
        source: { role: source.role, sourceKey: source.sourceKey, digest: source.digest }, bindingDigest: this.#bindingDigest });
    } catch (error) {
      if (error instanceof GovernedContextRefusal) throw error;
      return refuse("gc03_refused", error instanceof Error ? error.message : "GC03 host lookup refused");
    }
    if (host.publication !== "not_performed" || host.offset !== request.offset || host.length !== page.length ||
      host.totalBytes !== bytes.length || host.pageDigest !== sha256Bytes(page) || host.selectedDigest !== source.digest)
      refuse("gc03_disagreement", "GC03 did not permit the same exact page");
    // Publication point: reacquire everything again before any byte leaves the owner.
    if (this.#closed !== null) refuse("endpoint_closed", `governed lookup closed: ${this.#closed}`);
    this.#reacquire(true);
    const a = this.#authority;
    return Buffer.from(JSON.stringify({
      kind: "governed_context_page", schemaVersion: "5.0.0", requestId: request.requestId, key: request.key, maxBytes: request.maxBytes,
      occurrence: { runId: a.occurrence.runId, cCallRef: a.occurrence.cCallRef, actorInvocationRef: a.occurrence.actorInvocationRef },
      bindingDigest: this.#bindingDigest, prefixDigest: this.#prefixDigest,
      source: { role: source.role, sourceKey: source.sourceKey, digest: source.digest,
        ...(source.role === "testing_result_field" ? { producer: a.testing.producer, provenance: a.testing.provenance } : {}) },
      offset: request.offset, length: page.length, totalBytes: bytes.length, pageDigest: sha256Bytes(page),
      complete: request.offset === 0 && end === bytes.length, nextOffset: end === bytes.length ? null : end,
      encoding: "base64", content: page.toString("base64"),
      gc03: { identity: a.release.identity, publication: "not_performed", contextSha256: host.contextSha256, recheckSha256: host.recheckSha256 },
    }), "utf8");
  }
}
export type { OwnedContextLookup };
export function isOwnedContextLookup(value: unknown): value is OwnedContextLookup {
  return value !== null && typeof value === "object" && owned.has(value);
}

/**
 * Native owner construction. Fails closed on any missing, unsupported or
 * stale join; derives the finite key list without widening any permission.
 */
export function constructOwnedContextLookup(authority: GovernedContextOwnerAuthority): OwnedContextLookup {
  return constructLookup(authority, "live");
}
/**
 * Cold owner reacquisition: the same construction from freshly reacquired
 * owner authority without requiring a still-active occurrence. The result is
 * closed, so it can only rejoin retained responses and never serve a request.
 */
export function reacquireOwnedContextLookupCold(authority: GovernedContextOwnerAuthority): OwnedContextLookup {
  const lookup = constructLookup(authority, "cold");
  lookup.close("completed");
  return lookup;
}
function constructLookup(authority: GovernedContextOwnerAuthority, mode: "live" | "cold"): OwnedContextLookup {
  const a = authority;
  if (a === null || typeof a !== "object" || typeof a.host !== "function" || a.reacquire === null || typeof a.reacquire !== "object" ||
    ["prefix", "occurrenceActive", "grantDigest", "worksiteSource"].some(k => typeof (a.reacquire as unknown as Record<string, unknown>)[k] !== "function"))
    return refuse("unsupported_composition", "governed lookup requires live owner callbacks and a GC03 host reader");
  const o = a.occurrence;
  if (![o.runId, o.cCallRef, o.actorInvocationRef, o.actorRef].every(nonempty) || !Number.isSafeInteger(o.attempt))
    refuse("binding_stale", "occurrence identity is incomplete");
  if (a.role.constructorRole !== "construction" || !nonempty(a.role.policyRef) || !digestPattern.test(a.role.policyDigest) ||
    !nonempty(a.role.contextPolicyRef) || [...a.role.selectors].sort().join(",") !== [...GOVERNED_CONTEXT_ROLE_SELECTORS].sort().join(","))
    refuse("unsupported_composition", "governed lookup is selected only for the Construction role with its two Context selectors");
  if (a.release.identity !== GC03_SELECTED_RELEASE.identity || a.release.inventorySha256 !== GC03_SELECTED_RELEASE.inventorySha256 ||
    ![a.release.pythonDigest, a.release.adapterDigest, a.release.policyDigest].every(d => digestPattern.test(d)) || !/^3\.\d+\.\d+$/u.test(a.release.pythonVersion))
    refuse("unsupported_composition", "GC03, Python, adapter or policy identity is not the selected release");
  if (!nonempty(a.grant.principalId) || !nonempty(a.grant.grantId) || !digestPattern.test(a.grant.grantDigest) || !Array.isArray(a.grant.sourceKeys))
    refuse("unsupported_composition", "GC03 principal grant is incomplete");
  if (!Number.isSafeInteger(a.pageBound) || a.pageBound < 1 || a.pageBound > GOVERNED_CONTEXT_MAX_PAGE_BYTES)
    refuse("unsupported_composition", "page bound is not the GC03 and native intersection");
  const roots = a.context.readRoots, files = new Set(a.context.entries.filter(e => e.state === "file").map(e => e.relativePath));
  const grant = new Set(a.grant.sourceKeys);
  if (!nonempty(a.context.observationRef) || !roots.every(r => r === "." || relativePath(r))) refuse("binding_stale", "Context readRoots are invalid");
  if (mode === "live" && !a.reacquire.occurrenceActive()) refuse("occurrence_inactive", "actor occurrence is not active");
  const prefix = a.reacquire.prefix();
  if (prefix === null || prefix.runId !== o.runId || !digestPattern.test(prefix.prefixDigest)) return refuse("binding_stale", "held prefix is unavailable or not this Run");
  if (a.reacquire.grantDigest() !== a.grant.grantDigest) refuse("grant_changed", "GC03 grant is not current");
  const worksite = (role: GovernedSourceRole, asset: PathAsset, mandatory: boolean): Source | null => {
    const permitted = relativePath(asset.path) && digestPattern.test(asset.digest) && within(asset.path, roots) && files.has(asset.path) && grant.has(asset.path);
    if (!permitted) return mandatory ? refuse("key_denied", `${role} is outside the Context readRoots, files or GC03 grant`) : null;
    const read = () => a.reacquire.worksiteSource(asset.path), bytes = read();
    if (bytes === null || sha256Bytes(bytes) !== asset.digest) return refuse("source_changed", `${role} bytes differ from the bound digest`);
    return { role, sourceKey: asset.path, digest: asset.digest, read };
  };
  const task = worksite("original_task", a.original.task, true)!, rubric = worksite("original_rubric", a.original.rubric, true)!;
  // The Testing source must be the admitted same-Run producer and its exact field.
  const t = a.testing;
  if (!nonempty(t.resultRef) || !digestPattern.test(t.resultDigest) || !Array.isArray(t.fieldPath) || t.fieldPath.length === 0 ||
    !t.fieldPath.every(p => nonempty(p) || (Number.isSafeInteger(p) && (p as number) >= 0)) || !Array.isArray(t.provenance) || t.provenance.length === 0)
    refuse("binding_stale", "Testing Result selection is incomplete");
  const result = prefix.admittedResult(t.resultRef);
  if (result === null || result.resultDigest !== t.resultDigest || result.cCallRef !== t.producer.cCallRef || result.actorInvocationRef !== t.producer.actorInvocationRef)
    refuse("binding_stale", "Testing Result has no current admitted same-Run producer");
  const sourceKey = testingKey(t.resultRef, t.fieldPath);
  if (!grant.has(sourceKey)) refuse("key_denied", "selected Testing field is outside the GC03 grant");
  const readField = () => a.reacquire.prefix()?.admittedResult(t.resultRef)?.field(t.fieldPath) ?? null, field = readField();
  if (field === null) refuse("binding_stale", "selected Testing field is absent from the admitted Result");
  const testing: Source = { role: "testing_result_field", sourceKey, digest: sha256Bytes(field!), read: readField };
  const seen = new Set([task.sourceKey, rubric.sourceKey]);
  const extra = [...a.worksiteSources].sort((x, y) => x.path < y.path ? -1 : x.path > y.path ? 1 : 0)
    .filter(s => !seen.has(s.path) && (seen.add(s.path), true)).map(s => worksite("worksite_source", s, false)).filter((s): s is Source => s !== null);
  const sources = Object.freeze([task, rubric, testing, ...extra]);
  const bindingDigest = sha256Canonical({
    kind: "governed_context_binding", occurrence: { ...o }, role: { ...a.role, selectors: [...a.role.selectors].sort() },
    contextObservationRef: a.context.observationRef, readRoots: [...roots],
    testing: { resultRef: t.resultRef, resultDigest: t.resultDigest, fieldPath: [...t.fieldPath], producer: { ...t.producer }, provenance: [...t.provenance] },
    grant: { principalId: a.grant.principalId, grantId: a.grant.grantId, grantDigest: a.grant.grantDigest },
    release: { ...a.release }, pageBound: a.pageBound, sources: sources.map(s => ({ role: s.role, sourceKey: s.sourceKey, digest: s.digest })),
  });
  return new OwnedContextLookup(authority, sources, bindingDigest, prefix.prefixDigest);
}

export type GovernedContextEndpointStage = "reserved" | "bound" | "active" | "closed";
export type GovernedContextOccurrence = { readonly runId: string; readonly cCallRef: string; readonly actorInvocationRef: string };
/** The fixed-client invocation the owner names: exact executable and client path. */
export type GovernedContextInvocation = { readonly executable: string; readonly client: string; readonly endpoint: string };
export type GovernedContextExchange = {
  readonly ordinal: number; readonly stage: GovernedContextEndpointStage;
  readonly request: GovernedContextRequest | null; readonly requestBytes: Buffer; readonly requestDigest: Sha256Digest;
  readonly disposition: "page" | "refusal"; readonly responseBytes: Buffer; readonly responseDigest: Sha256Digest;
};
export interface GovernedContextEndpoint {
  readonly path: string;
  readonly invocation: GovernedContextInvocation;
  readonly environment: Readonly<Record<string, string>>;
  readonly stage: () => GovernedContextEndpointStage;
  /** Binds the owner-constructed lookup of the actual admitted actor occurrence. */
  readonly bind: (lookup: OwnedContextLookup, occurrence: GovernedContextOccurrence) => void;
  /** Starts serving only after the native process-start event is admitted. */
  readonly activate: (processStartedEventRef: string) => void;
  readonly transcript: () => readonly GovernedContextExchange[];
  readonly close: (reason: "completed" | "failed" | "interrupted") => Promise<void>;
}

/** Exact shell command of one fixed-client call: executable, client and the four request members. */
export function governedContextCommand(invocation: GovernedContextInvocation, request: GovernedContextRequest): string {
  const quote = (text: string) => "'" + text.replaceAll("'", "'\\''") + "'";
  return [invocation.executable, invocation.client, governedContextWire(request)].map(quote).join(" ");
}
/** The fixed client's exact wire bytes, without the newline terminator. */
export const governedContextWire = (request: GovernedContextRequest): string =>
  JSON.stringify({ requestId: request.requestId, key: request.key, offset: request.offset, maxBytes: request.maxBytes });

/**
 * Per-occurrence finite request/reply endpoint owned by the actor lifecycle.
 * It is reserved inert before transport identity exists, so its coordinates
 * can enter the transport environment; every request then refuses. Only the
 * owner binds the lookup of the admitted actor occurrence, and only the native
 * process-start event activates it. Every exchange, refused or served, is
 * retained with its complete request and response bytes.
 */
export async function reserveGovernedContextEndpoint(): Promise<GovernedContextEndpoint> {
  const directory = await mkdtemp(join(tmpdir(), "abg-gc-")), path = join(directory, "s");
  const exchanges: GovernedContextExchange[] = [], sockets = new Set<Socket>();
  let stage: GovernedContextEndpointStage = "reserved", lookup: OwnedContextLookup | null = null;
  let occurrence: GovernedContextOccurrence | null = null, closedReason: string | null = null;
  let queue: Promise<unknown> = Promise.resolve(), closing: Promise<void> | null = null;
  const serve = async (requestBytes: Buffer, line: string | null): Promise<Buffer> => {
    const at = stage;
    let request: GovernedContextRequest | null = null, response: Buffer, disposition: "page" | "refusal" = "refusal";
    try {
      if (line === null) refuse("request_invalid", "request exceeds its byte bound");
      let parsed: unknown;
      try { parsed = JSON.parse(line!); } catch { return refuse("request_invalid", "request is not JSON"); }
      request = admitGovernedContextRequest(parsed);
      if (at === "closed") refuse("endpoint_closed", `governed lookup closed: ${closedReason ?? "closed"}`);
      if (at !== "active" || lookup === null) refuse("endpoint_inactive", "endpoint is reserved and not activated by the native process start");
      response = await lookup!.read(request);
      disposition = "page";
    } catch (error) {
      const code = error instanceof GovernedContextRefusal ? error.code : "request_invalid";
      response = Buffer.from(JSON.stringify({ kind: "governed_context_refusal", schemaVersion: "5.0.0", stage: at, code,
        request, occurrence, message: error instanceof Error ? error.message : "refused" }), "utf8");
    }
    exchanges.push(Object.freeze({ ordinal: exchanges.length + 1, stage: at, request, requestBytes, requestDigest: sha256Bytes(requestBytes),
      disposition, responseBytes: response, responseDigest: sha256Bytes(response) }));
    return response;
  };
  const server: Server = createServer(socket => {
    sockets.add(socket); socket.on("close", () => sockets.delete(socket));
    let buffered = Buffer.alloc(0), answered = false;
    socket.on("error", () => socket.destroy());
    socket.on("data", chunk => {
      if (answered) return;
      buffered = Buffer.concat([buffered, chunk]);
      const newline = buffered.indexOf(0x0a);
      if (newline < 0 && buffered.length <= GOVERNED_CONTEXT_MAX_REQUEST_BYTES) return;
      answered = true;
      const requestBytes = Buffer.from(newline < 0 ? buffered : buffered.subarray(0, newline + 1));
      const line = newline < 0 ? null : buffered.subarray(0, newline).toString("utf8");
      queue = queue.then(async () => { socket.end(await serve(requestBytes, line)); });
    });
  });
  await new Promise<void>((resolveListen, rejectListen) => { server.once("error", rejectListen); server.listen(path, () => resolveListen()); });
  const close = (reason: "completed" | "failed" | "interrupted"): Promise<void> => {
    lookup?.close(reason);
    if (stage !== "closed") { stage = "closed"; closedReason = reason; }
    closing ??= (async () => {
      await queue.catch(() => undefined);
      await new Promise<void>(done => { server.close(() => done()); for (const s of sockets) s.destroy(); });
      await rm(directory, { recursive: true, force: true });
    })();
    return closing;
  };
  // The fixed installed client is the compiled sibling of this owner module.
  const invocation = Object.freeze({ executable: process.execPath,
    client: fileURLToPath(new URL(`./${GOVERNED_CONTEXT_CLIENT_MARKER}`, import.meta.url)), endpoint: path });
  return Object.freeze({
    path, invocation,
    environment: Object.freeze({ [GOVERNED_CONTEXT_ENDPOINT_ENV]: path, [GOVERNED_CONTEXT_CLIENT_ENV]: invocation.client,
      [GOVERNED_CONTEXT_EXECUTABLE_ENV]: invocation.executable }),
    stage: () => stage,
    bind: (candidate: OwnedContextLookup, actual: GovernedContextOccurrence) => {
      if (stage !== "reserved" || !isOwnedContextLookup(candidate) || candidate.closed !== null)
        throw new GovernedContextRefusal("binding_stale", "endpoint binds one open owner-constructed lookup while reserved");
      const own = candidate.occurrence;
      if (own.runId !== actual.runId || own.cCallRef !== actual.cCallRef || own.actorInvocationRef !== actual.actorInvocationRef)
        throw new GovernedContextRefusal("binding_stale", "lookup belongs to another actor occurrence");
      lookup = candidate; occurrence = Object.freeze({ ...own }); stage = "bound";
    },
    activate: (processStartedEventRef: string) => {
      if (stage !== "bound" || !nonempty(processStartedEventRef))
        throw new GovernedContextRefusal("occurrence_inactive", "endpoint activates only a bound lookup after the native process start");
      stage = "active";
    },
    transcript: () => Object.freeze([...exchanges]),
    close,
  });
}

/**
 * Pinned GC03 bridge: verifies the exact Python executable and adapter bytes,
 * starts the adapter short-lived and answers its callbacks from live owner
 * state. The adapter result must still agree with the native owner page.
 */
export function pinnedGc03HostReader(input: {
  readonly permit: GovernedContextExecutionPermit; readonly current: () => boolean;
  readonly installedRoot: string; readonly policyPath: string; readonly policyDigest: Sha256Digest; readonly principalId: string;
  /** Current owner derivation of the full released context.assemble request and binding, or null when not current. */
  readonly derivation: () => Gc03HostLookup | null;
  readonly callbacks: { readonly resolveArtifact: (ref: unknown) => string | null;
    readonly queryArtifacts: (kind: unknown, query: unknown) => unknown };
}): GovernedContextHostReader {
  if (!permits.has(input.permit)) return refuse("unsupported_composition", "GC03 adapter execution requires an owner execution permit");
  const permit = input.permit;
  return async request => {
    // Every start re-verifies the exact executable and adapter bytes, the fixed
    // invocation and live currentness; nothing else can start Python here.
    if (!input.current()) refuse("occurrence_inactive", "GC03 execution permission is no longer current");
    verifyPinnedFile(permit.executable, permit.pythonDigest); verifyPinnedFile(permit.argv[3]!, permit.adapterDigest);
    // One owner derivation per request; later reacquisition must reproduce it
    // from current facts, apart from the advancing current-prefix coordinate.
    const snapshot = input.derivation();
    if (snapshot === null || snapshot.kind !== "gc03_host_lookup_derived")
      return refuse("binding_stale", snapshot?.reason ?? "GC03 owner derivation is not current");
    const stable = (d: Gc03Derivation) => gc03Canonical({ ...d, binding: { ...d.binding,
      owner_coordinates: { ...(d.binding.owner_coordinates as Record<string, unknown>), currentPrefix: null } } });
    const reacquire = () => {
      if (!input.current()) return null;
      const again = input.derivation();
      return again?.kind === "gc03_host_lookup_derived" && stable(again.derivation) === stable(snapshot.derivation) ? snapshot.derivation : null;
    };
    const child = spawn(permit.executable, [...permit.argv], { stdio: ["pipe", "pipe", "ignore"], env: {} });
    const timer = setTimeout(() => child.kill("SIGKILL"), permit.timeoutMs);
    const send = (value: unknown) => child.stdin.write(JSON.stringify(value) + "\n");
    try {
      return await new Promise<GovernedContextHostPage>((settle, fail) => {
        let buffered = "", settled = false;
        const finish = (fn: () => void) => { if (!settled) { settled = true; fn(); } };
        child.on("error", () => finish(() => fail(new GovernedContextRefusal("gc03_refused", "adapter could not start"))));
        child.on("close", () => finish(() => fail(new GovernedContextRefusal("gc03_refused", "adapter ended without a result"))));
        child.stdin.on("error", () => undefined);
        child.stdout.setEncoding("utf8");
        child.stdout.on("data", (chunk: string) => {
          buffered += chunk;
          for (let at = buffered.indexOf("\n"); at >= 0; at = buffered.indexOf("\n")) {
            const line = buffered.slice(0, at); buffered = buffered.slice(at + 1);
            let message: Record<string, unknown>;
            try { message = JSON.parse(line) as Record<string, unknown>; }
            catch { finish(() => fail(new GovernedContextRefusal("gc03_refused", "adapter protocol is malformed"))); return; }
            if (typeof message.callback === "string") {
              const args = Array.isArray(message.args) ? message.args : [];
              let reply: unknown = null;
              try {
                reply = message.callback === "reacquire" ? reacquire()
                  : message.callback === "resolve_artifact" ? input.callbacks.resolveArtifact(args[0])
                    : message.callback === "query_artifacts" ? input.callbacks.queryArtifacts(args[0], args[1]) : null;
              } catch { reply = null; }
              send({ reply: reply ?? null });
            } else if (message.refusal !== undefined) {
              const r = message.refusal as Record<string, unknown>;
              finish(() => fail(new GovernedContextRefusal("gc03_refused", `${String(r.code)}: ${String(r.reason)}`)));
            } else if (message.result !== undefined) {
              const v = (message.result as Record<string, Record<string, unknown>>).value ?? {};
              const publication = (message.result as Record<string, unknown>).publication;
              const agreed = gc03ResolutionAgrees(snapshot, message.selection, message.context, message.recheck, input.policyDigest);
              if (agreed === null) { finish(() => fail(new GovernedContextRefusal("gc03_disagreement", "GC03 Context, Recheck or selection differs from the owner derivation"))); return; }
              finish(() => settle({ contextSha256: agreed.contextSha256, recheckSha256: agreed.recheckSha256, offset: v.offset as number, length: v.length as number, totalBytes: v.total_bytes as number,
                pageDigest: `sha256:${String(v.page_sha256)}` as Sha256Digest, selectedDigest: `sha256:${String(v.selected_sha256)}` as Sha256Digest,
                publication: publication as "not_performed" }));
            }
          }
        });
        send({ op: "read", identity: GC03_SELECTED_RELEASE.identity, inventorySha256: GC03_SELECTED_RELEASE.inventorySha256,
          installedRoot: input.installedRoot, pythonVersion: permit.pythonVersion, policyPath: input.policyPath,
          policySha256: input.policyDigest.slice(7), principalId: input.principalId, derivation: snapshot.derivation,
          key: request.key, offset: request.offset, maxBytes: request.maxBytes });
      });
    } finally {
      clearTimeout(timer); child.stdin.end(); if (child.exitCode === null) child.kill("SIGKILL");
    }
  };
}

export type GovernedContextCorrespondence =
  | { readonly kind: "governed_context_correspondence"; readonly exchanges: readonly { readonly ordinal: number; readonly requestId: string; readonly toolUseId: string;
      readonly disposition: "page" | "refusal"; readonly responseDigest: Sha256Digest }[] }
  | { readonly kind: "governed_context_correspondence_refusal";
      readonly code: "missing" | "altered" | "truncated" | "unjoinable" | "substituted" | "tool_error" | "stale"; readonly requestId: string | null; readonly message: string };
type CorrespondenceRefusalCode = Extract<GovernedContextCorrespondence, { kind: "governed_context_correspondence_refusal" }>["code"];
const correspondenceRefusal = (code: CorrespondenceRefusalCode, requestId: string | null, message: string) =>
  Object.freeze({ kind: "governed_context_correspondence_refusal" as const, code, requestId, message });

/**
 * Claude stream-json correspondence gate. Each retained exchange, served or
 * refused, must have exactly one Bash tool_use whose command is exactly the
 * owner-named fixed-client executable, client path and the four request
 * members, whose wire bytes equal that request, and whose single tool_result
 * content equals the complete response bytes. Invocation candidates are
 * command-bearing invocations only: tool_uses, of any tool name, whose string
 * input.command names the client, its environment or the endpoint. Narrative
 * input such as a StructuredOutput summary or a Bash description is not an
 * invocation. Any other command-bearing invocation is a substitution. Pure
 * over raw stdout and the owner transcript, so cold verification reruns it
 * unchanged.
 */
export function verifyGovernedContextCorrespondence(stdout: string, transcript: readonly GovernedContextExchange[],
  invocation: GovernedContextInvocation): GovernedContextCorrespondence {
  const markers = [GOVERNED_CONTEXT_CLIENT_MARKER, GOVERNED_CONTEXT_ENDPOINT_ENV, GOVERNED_CONTEXT_CLIENT_ENV, GOVERNED_CONTEXT_EXECUTABLE_ENV,
    invocation.client, invocation.endpoint];
  const uses: { id: string; name: unknown; command: unknown }[] = [], results = new Map<string, { text: string | null; isError: boolean; count: number }>();
  for (const line of stdout.split("\n")) {
    if (line.trim() === "") continue;
    let row: Record<string, unknown>;
    try { row = JSON.parse(line) as Record<string, unknown>; } catch { continue; }
    const content = (row.message as Record<string, unknown> | undefined)?.content;
    if (!Array.isArray(content)) continue;
    for (const block of content as Record<string, unknown>[]) {
      if (row.type === "assistant" && block?.type === "tool_use" && typeof block.id === "string") {
        const command = (block.input as Record<string, unknown> | null | undefined)?.command;
        if (typeof command === "string" && markers.some(marker => command.includes(marker)))
          uses.push({ id: block.id, name: block.name, command });
      } else if (row.type === "user" && block?.type === "tool_result" && typeof block.tool_use_id === "string") {
        const c = block.content;
        const text = typeof c === "string" ? c : Array.isArray(c) && c.every(p => (p as Record<string, unknown>)?.type === "text" && typeof (p as Record<string, unknown>).text === "string")
          ? (c as { text: string }[]).map(p => p.text).join("") : null;
        const prior = results.get(block.tool_use_id);
        results.set(block.tool_use_id, { text, isError: block.is_error === true, count: (prior?.count ?? 0) + 1 });
      }
    }
  }
  const joined: { ordinal: number; requestId: string; toolUseId: string; disposition: "page" | "refusal"; responseDigest: Sha256Digest }[] = [];
  const claimed = new Set<string>(), ids = new Set<string>();
  for (const [index, exchange] of transcript.entries()) {
    const requestId = exchange.request?.requestId ?? null;
    if (exchange.ordinal !== index + 1 || sha256Bytes(exchange.responseBytes) !== exchange.responseDigest || sha256Bytes(exchange.requestBytes) !== exchange.requestDigest)
      return correspondenceRefusal("stale", requestId, "retained exchange is out of order or differs from its digest");
    if (exchange.request === null || ids.has(exchange.request.requestId))
      return correspondenceRefusal("unjoinable", requestId, "retained request is not one distinct fixed-client request");
    const request = exchange.request;
    ids.add(request.requestId);
    if (!exchange.requestBytes.equals(Buffer.from(governedContextWire(request) + "\n", "utf8")))
      return correspondenceRefusal("substituted", request.requestId, "endpoint request bytes are not the fixed-client wire form");
    const command = governedContextCommand(invocation, request);
    const matches = uses.filter(u => !claimed.has(u.id) && u.name === "Bash" && u.command === command);
    if (matches.length !== 1)
      return uses.some(u => !claimed.has(u.id) && JSON.stringify(u.command ?? null).includes(request.requestId))
        ? correspondenceRefusal("substituted", request.requestId, "the tool_use is not the exact fixed-client invocation of this request")
        : correspondenceRefusal("unjoinable", request.requestId, "no single exact fixed-client tool_use carries this request");
    const use = matches[0]!, result = results.get(use.id);
    if (result === undefined) return correspondenceRefusal("missing", request.requestId, "fixed-client tool_result is absent from raw stdout");
    if (result.count !== 1 || result.text === null) return correspondenceRefusal("unjoinable", request.requestId, "fixed-client tool_result is duplicated or not plain text");
    if (result.isError) return correspondenceRefusal("tool_error", request.requestId, "fixed-client tool_result is an error");
    const observed = Buffer.from(result.text, "utf8");
    if (!observed.equals(exchange.responseBytes))
      return observed.length < exchange.responseBytes.length && exchange.responseBytes.subarray(0, observed.length).equals(observed)
        ? correspondenceRefusal("truncated", request.requestId, "tool_result carries a truncated response")
        : correspondenceRefusal("altered", request.requestId, "tool_result bytes differ from the owner response");
    const disposition = governedContextDisposition(exchange.responseBytes);
    if (disposition === null || disposition !== exchange.disposition)
      return correspondenceRefusal("altered", request.requestId, "retained disposition differs from the exact response bytes");
    claimed.add(use.id);
    joined.push({ ordinal: exchange.ordinal, requestId: request.requestId, toolUseId: use.id, disposition, responseDigest: exchange.responseDigest });
  }
  const stray = uses.find(u => !claimed.has(u.id));
  if (stray !== undefined) return correspondenceRefusal("substituted", null, "a command-bearing invocation names the fixed client or endpoint without an owner-retained exchange");
  return Object.freeze({ kind: "governed_context_correspondence" as const, exchanges: Object.freeze(joined.map(j => Object.freeze(j))) });
}

/** Durable transcript bytes, retained beside the admitted raw stdout artifact. */
export function encodeGovernedContextTranscript(input: { readonly occurrence: GovernedContextOccurrence; readonly bindingDigest: Sha256Digest;
  readonly invocation: GovernedContextInvocation; readonly exchanges: readonly GovernedContextExchange[] }): Buffer {
  return Buffer.from(JSON.stringify({ kind: "governed_context_transcript", schemaVersion: "5.0.0",
    occurrence: { runId: input.occurrence.runId, cCallRef: input.occurrence.cCallRef, actorInvocationRef: input.occurrence.actorInvocationRef },
    bindingDigest: input.bindingDigest, invocation: { executable: input.invocation.executable, client: input.invocation.client, endpoint: input.invocation.endpoint },
    exchanges: input.exchanges.map(e => ({ ordinal: e.ordinal, stage: e.stage, request: e.request, requestBytes: e.requestBytes.toString("base64"),
      requestDigest: e.requestDigest, disposition: e.disposition, responseBytes: e.responseBytes.toString("base64"), responseDigest: e.responseDigest })) }), "utf8");
}
type DecodedTranscript = { readonly occurrence: GovernedContextOccurrence; readonly bindingDigest: Sha256Digest;
  readonly invocation: GovernedContextInvocation; readonly exchanges: readonly GovernedContextExchange[] };
function decodeGovernedContextTranscript(bytes: Uint8Array): DecodedTranscript | null {
  try {
    const t = JSON.parse(Buffer.from(bytes).toString("utf8")) as Record<string, any>;
    const strict = (b: unknown) => { if (typeof b !== "string") throw new TypeError("bytes"); const out = Buffer.from(b, "base64");
      if (out.toString("base64") !== b) throw new TypeError("base64"); return out; };
    if (t.kind !== "governed_context_transcript" || t.schemaVersion !== "5.0.0" || !digestPattern.test(t.bindingDigest) || !Array.isArray(t.exchanges) ||
      ![t.occurrence?.runId, t.occurrence?.cCallRef, t.occurrence?.actorInvocationRef, t.invocation?.executable, t.invocation?.client, t.invocation?.endpoint].every(nonempty)) return null;
    return { occurrence: t.occurrence, bindingDigest: t.bindingDigest, invocation: t.invocation, exchanges: t.exchanges.map((e: Record<string, any>) => ({
      ordinal: e.ordinal, stage: e.stage, request: e.request === null ? null : admitGovernedContextRequest(e.request), requestBytes: strict(e.requestBytes),
      requestDigest: e.requestDigest, disposition: e.disposition, responseBytes: strict(e.responseBytes), responseDigest: e.responseDigest })) };
  } catch { return null; }
}

/** Page versus refusal is a property of the exact response bytes, never of a retained label. */
export function governedContextDisposition(bytes: Uint8Array): "page" | "refusal" | null {
  try {
    const kind = (JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as Record<string, unknown>).kind;
    return kind === "governed_context_page" ? "page" : kind === "governed_context_refusal" ? "refusal" : null;
  } catch { return null; }
}

/**
 * Cold owner join. The owner first reacquires and authenticates its facts
 * (`owner.lookup` from `reacquireOwnedContextLookupCold`) and reconstructs the
 * expected fixed-client invocation from admitted transport, package and source
 * evidence (`owner.invocation`). The unadmitted transcript is only an index:
 * its occurrence, binding and invocation must equal the owner's, and each
 * disposition is derived from the exact response bytes. Every exchange must
 * rejoin its exact tool_use/tool_result in the admitted raw stdout, and every
 * page must pass the owner cold join; every refusal must name this occurrence.
 */
export function coldVerifyGovernedContext(input: { readonly stdout: Uint8Array; readonly stdoutDigest: Sha256Digest; readonly transcript: Uint8Array;
  readonly owner: { readonly occurrence: GovernedContextOccurrence; readonly invocation: GovernedContextInvocation; readonly lookup: OwnedContextLookup } }): GovernedContextCorrespondence {
  const owner = input.owner;
  if (owner === undefined || !isOwnedContextLookup(owner.lookup)) return correspondenceRefusal("unjoinable", null, "cold verification requires reacquired owner authority");
  if (sha256Bytes(input.stdout) !== input.stdoutDigest) return correspondenceRefusal("altered", null, "raw stdout differs from its admitted artifact digest");
  const own = owner.lookup.occurrence, occ = owner.occurrence;
  if (own.runId !== occ.runId || own.cCallRef !== occ.cCallRef || own.actorInvocationRef !== occ.actorInvocationRef)
    return correspondenceRefusal("stale", null, "reacquired owner authority belongs to another occurrence");
  const t = decodeGovernedContextTranscript(input.transcript);
  if (t === null) return correspondenceRefusal("missing", null, "durable governed-context transcript is absent or malformed");
  if (t.bindingDigest !== owner.lookup.bindingDigest || t.occurrence.runId !== occ.runId || t.occurrence.cCallRef !== occ.cCallRef ||
    t.occurrence.actorInvocationRef !== occ.actorInvocationRef) return correspondenceRefusal("stale", null, "transcript belongs to another binding or occurrence");
  if (t.invocation.executable !== owner.invocation.executable || t.invocation.client !== owner.invocation.client || t.invocation.endpoint !== owner.invocation.endpoint)
    return correspondenceRefusal("substituted", null, "transcript invocation differs from the owner-reconstructed fixed-client invocation");
  let stdout: string;
  try { stdout = new TextDecoder("utf-8", { fatal: true }).decode(input.stdout); } catch { return correspondenceRefusal("altered", null, "raw stdout is not strict UTF-8"); }
  const joined = verifyGovernedContextCorrespondence(stdout, t.exchanges, owner.invocation);
  if (joined.kind !== "governed_context_correspondence") return joined;
  for (const exchange of t.exchanges) {
    const requestId = exchange.request?.requestId ?? null;
    let value: Record<string, any>;
    try { value = JSON.parse(exchange.responseBytes.toString("utf8")) as Record<string, any>; } catch { return correspondenceRefusal("altered", requestId, "response is not JSON"); }
    if (governedContextDisposition(exchange.responseBytes) === "refusal") {
      const named = value.occurrence;
      if (named !== null && (named?.runId !== occ.runId || named?.cCallRef !== occ.cCallRef || named?.actorInvocationRef !== occ.actorInvocationRef))
        return correspondenceRefusal("stale", requestId, "refusal names another occurrence");
      if (exchange.request !== null && value.request !== null && JSON.stringify(value.request) !== JSON.stringify(exchange.request))
        return correspondenceRefusal("stale", requestId, "refusal names another request");
      continue;
    }
    const content = typeof value.content === "string" ? Buffer.from(value.content, "base64") : null;
    if (value.kind !== "governed_context_page" || value.bindingDigest !== t.bindingDigest || value.requestId !== exchange.request?.requestId ||
      value.key !== exchange.request?.key || value.offset !== exchange.request?.offset || value.maxBytes !== exchange.request?.maxBytes ||
      value.occurrence?.runId !== occ.runId || value.occurrence?.cCallRef !== occ.cCallRef ||
      value.occurrence?.actorInvocationRef !== occ.actorInvocationRef || content === null || sha256Bytes(content) !== value.pageDigest || content.length !== value.length)
      return correspondenceRefusal("stale", requestId, "served page differs from its binding, request or occurrence");
    try { owner.lookup.coldJoin(exchange.responseBytes); }
    catch (error) { return correspondenceRefusal("stale", requestId, error instanceof Error ? error.message : "cold join refused"); }
  }
  return joined;
}

/**
 * Owner selection of the governed lookup for one native Construction
 * occurrence. One explicit private `Program.policies` key names one
 * RunEnvironment Context member. The owner authenticates the admitted Program,
 * its RunEnvironment declaration, the dependency inventory backing the Context
 * member, the constructor role evidence and its source binding, and requires
 * the bound span to be the complete member bytes. Without the key the Product
 * keeps its unconfigured behavior; with it, every missing, ambiguous, stale or
 * unsupported fact refuses. The policy only restricts the native capability; it
 * is not a registry, mode selector, grant minting surface or Public operation.
 */
// Released GC03 host-contract shapes (ac_support_core `_host_selection`,
// `read_source` retained-evidence, `digest`). They are shapes only; every value
// comes from the native owner's authenticated facts or from a GC03-assembled
// Context. The owner never forms an abbreviated selection.
const hex = (digest: Sha256Digest) => digest.slice("sha256:".length);
function gc03Canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(gc03Canonical).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${gc03Canonical((value as Record<string, unknown>)[k])}`).join(",")}}`;
  if (typeof value === "number" && !Number.isFinite(value)) return refuse("unsupported_composition", "GC03 canonical JSON has no non-finite numbers");
  return JSON.stringify(value);
}
/** GC03 `digest`: SHA-256 hex of sorted-key compact UTF-8 JSON. */
export const gc03Digest = (value: unknown): string => hex(sha256Bytes(Buffer.from(gc03Canonical(value), "utf8")));
export type Gc03SourceRef = { readonly engine: "retained-evidence"; readonly root: "evidence"; readonly path: string;
  readonly object: null; readonly sha256: string; readonly selector: null };
/** One owner-held source as a GC03 retained-evidence late-acquisition SourceRef. */
export const gc03RetainedSourceRef = (id: string, digest: Sha256Digest): Gc03SourceRef =>
  Object.freeze({ engine: "retained-evidence", root: "evidence", path: id, object: null, sha256: hex(digest), selector: null });
/**
 * GC03 `resolve_artifact` callback. Accepts only the exact `{id,sha256}` the
 * released `read_source` sends and returns base64 bytes only when the owner
 * currently holds that id with that digest; anything else resolves nothing.
 */
export function resolveGc03RetainedArtifact(ref: unknown, held: (id: string) => Uint8Array | null): string | null {
  if (!exactKeys(ref, ["id", "sha256"]) || !nonempty(ref.id) || typeof ref.sha256 !== "string" || !/^[0-9a-f]{64}$/u.test(ref.sha256)) return null;
  const bytes = held(ref.id);
  return bytes === null || hex(sha256Bytes(bytes)) !== ref.sha256 ? null : Buffer.from(bytes).toString("base64");
}
type OwnerIdentity = { readonly id: string; readonly digest: Sha256Digest };
/** Full released `context.assemble` request and the owner members of the closed HostLookupSelection. */
export type Gc03Derivation = { readonly request: Readonly<Record<string, unknown>>; readonly binding: Readonly<Record<string, unknown>> };
export type Gc03HostLookup =
  | { readonly kind: "gc03_host_lookup_derived"; readonly derivation: Gc03Derivation; readonly lateAcquisition: readonly Gc03SourceRef[] }
  | { readonly kind: "gc03_host_lookup_unavailable"; readonly code: "authority_missing" | "basis_stale"; readonly reason: string;
      readonly missing: readonly string[]; readonly lateAcquisition: readonly Gc03SourceRef[] };
export const GC03_ACTIVATION_TEMPLATE_KIND = "abiogenesis_gc03_host_activation_request_template";
/**
 * Derive the full released `context.assemble` request from the selected
 * activation template and current native owner facts, and the owner members of
 * the released HostLookupSelection. The template's null positions are filled
 * only from owner facts: request, activation and frame identities, the exact
 * subject (also the Worker mutation subject), supported a_c Observation
 * ArtifactRefs (none are selected, so an explicit empty list) and the ordered
 * late SourceRefs. Native Run, occurrence, CCall, Result/producer and prefix
 * provenance stays in owner_coordinates. Context, subject, basis and Recheck
 * identity are supplied only by the released computation over this request.
 */
export function deriveGc03HostLookup(facts: {
  readonly owner: OwnerIdentity; readonly admission: OwnerIdentity; readonly epoch: OwnerIdentity;
  readonly ownerCoordinates: Readonly<Record<string, unknown>>; readonly principalId: string; readonly actorId: string; readonly grantId: string;
  readonly executorId: string; readonly policyDigest: Sha256Digest;
  readonly sources: readonly { readonly key: string; readonly sourceKey: string; readonly digest: Sha256Digest }[];
  readonly template: unknown;
  readonly activation: { readonly requestId: string; readonly activationId: string; readonly frameId: string; readonly subject: OwnerIdentity };
}): Gc03HostLookup {
  const lateAcquisition = Object.freeze(facts.sources.map((s, i) => {
    if (s.key !== `late/${i}`) refuse("unsupported_composition", "GC03 late keys must index the ordered owner sources");
    return gc03RetainedSourceRef(s.sourceKey, s.digest);
  }));
  const unavailable = (code: "authority_missing" | "basis_stale", reason: string, missing: readonly string[] = []): Gc03HostLookup =>
    Object.freeze({ kind: "gc03_host_lookup_unavailable", code, reason, missing: Object.freeze([...missing]), lateAcquisition });
  const t = facts.template as Record<string, any> | null;
  if (t === null || typeof t !== "object" || t.kind !== GC03_ACTIVATION_TEMPLATE_KIND || t.policySha256 !== hex(facts.policyDigest))
    return unavailable("authority_missing", "no selected GC03 activation template for this policy", ["activation_template"]);
  const request = JSON.parse(JSON.stringify(t.request ?? null)) as Record<string, any> | null;
  const args = request?.arguments, packet = args?.packet;
  if (request === null || request.schema !== "a_c.fd-support.request/1" || request.operation !== "context.assemble" || request.id !== null ||
    packet?.activation?.id !== null || packet?.frame?.id !== null || packet?.subject_basis?.subject !== null ||
    packet?.subject_basis?.observations !== null || packet?.profile_additions?.worker?.mutation_subject !== null || !Array.isArray(args?.late_acquisition))
    return unavailable("basis_stale", "activation template is not the declared released context.assemble shape", ["activation_template"]);
  if (packet.actor_authority?.actor_id !== facts.actorId || packet.profile_additions.worker.operation_grant_id !== facts.grantId)
    return unavailable("basis_stale", "activation template names another actor or grant");
  const late = args.late_acquisition as unknown[];
  if (late.length !== lateAcquisition.length || late.some((ref, i) => ref !== null && gc03Canonical(ref) !== gc03Canonical(lateAcquisition[i])))
    return unavailable("basis_stale", "activation template late acquisition differs from the owner-derived sources");
  const a = facts.activation;
  if (![a.requestId, a.activationId, a.frameId, a.subject.id, facts.executorId, facts.principalId].every(nonempty) || !digestPattern.test(a.subject.digest))
    return unavailable("authority_missing", "owner activation, subject or executor identity is incomplete", ["activation"]);
  const identity = (value: OwnerIdentity) => ({ id: value.id, sha256: hex(value.digest) });
  request.id = a.requestId; packet.activation.id = a.activationId; packet.frame.id = a.frameId;
  packet.subject_basis.subject = identity(a.subject); packet.profile_additions.worker.mutation_subject = identity(a.subject);
  packet.subject_basis.observations = [];
  args.late_acquisition = lateAcquisition.map(ref => ({ ...ref }));
  return Object.freeze({ kind: "gc03_host_lookup_derived", lateAcquisition, derivation: deepFrozen({ request, binding: JSON.parse(JSON.stringify({
    owner: identity(facts.owner), admission: identity(facts.admission), owner_coordinates: facts.ownerCoordinates, epoch: identity(facts.epoch),
    principal_id: facts.principalId, actor_id: facts.actorId, grant_id: facts.grantId, executor_id: facts.executorId, operation: "context.read",
    policy_sha256: hex(facts.policyDigest), context_id: `${a.requestId}#context` })) }) });
}
/**
 * Owner check of the adapter-returned released resolution: the selection must
 * carry exactly the owner binding, the complete Context and Recheck must match
 * their selected GC03 identities, the Context must carry the derived packet and
 * late SourceRefs, and the Recheck must name this policy.
 */
function gc03ResolutionAgrees(derived: Extract<Gc03HostLookup, { kind: "gc03_host_lookup_derived" }>, selection: unknown, context: unknown,
  recheck: unknown, policyDigest: Sha256Digest): { readonly contextSha256: string; readonly recheckSha256: string } | null {
  const sel = selection as Record<string, any> | null, ctx = context as Record<string, any> | null, re = recheck as Record<string, any> | null;
  if (sel === null || ctx === null || re === null || typeof sel !== "object" || typeof ctx !== "object" || typeof re !== "object") return null;
  const { context_id: contextId, ...binding } = derived.derivation.binding;
  const packet = (derived.derivation.request.arguments as Record<string, any>).packet;
  for (const [key, value] of Object.entries(binding)) if (gc03Canonical(sel[key]) !== gc03Canonical(value)) return null;
  const contextSha256 = gc03Digest(ctx), recheckSha256 = gc03Digest(re);
  if (sel.context?.id !== contextId || sel.context?.sha256 !== contextSha256 || sel.recheck_sha256 !== recheckSha256 ||
    gc03Canonical(ctx.packet) !== gc03Canonical(packet) || gc03Canonical(ctx.late_acquisition) !== gc03Canonical(derived.lateAcquisition) ||
    gc03Canonical(sel.subject) !== gc03Canonical(packet.subject_basis.subject) || gc03Canonical(sel.basis) !== gc03Canonical(packet.subject_basis.method_profile) ||
    re.schema !== "a_c.fd-support.recheck/1" || re.policy_sha256 !== hex(policyDigest)) return null;
  return { contextSha256, recheckSha256 };
}
/** Exact GC03 policy bytes pinned by the verified member; its `limits.max_bytes` intersected with the native bound. */
export function gc03PolicyPageBound(policyPath: string, policyDigest: Sha256Digest): number {
  let bytes: Buffer;
  try { if (realpathSync(policyPath) !== policyPath) throw new Error("not canonical"); bytes = readFileSync(policyPath); }
  catch { return refuse("unsupported_composition", "pinned GC03 policy is unavailable"); }
  if (sha256Bytes(bytes) !== policyDigest) refuse("unsupported_composition", "pinned GC03 policy digest differs");
  let limit: unknown;
  try { limit = (JSON.parse(bytes.toString("utf8")) as { limits?: { max_bytes?: unknown } }).limits?.max_bytes; } catch { limit = undefined; }
  if (!Number.isSafeInteger(limit) || (limit as number) < 1) refuse("unsupported_composition", "GC03 policy has no page byte limit");
  return Math.min(limit as number, GOVERNED_CONTEXT_MAX_PAGE_BYTES);
}

export const GOVERNED_CONTEXT_POLICY_KEY = "abg.governed_context";
/** Private `Program.policies` key naming the GC03 activation-request template member of the same verified Context. */
export const GOVERNED_CONTEXT_ACTIVATION_KEY = "abg.governed_context.activation";
export const GOVERNED_CONTEXT_POLICY_KIND = "abg_governed_context_policy";
export const GOVERNED_CONTEXT_EXECUTION = "gc03_host_adapter";
export type GovernedContextPolicy = {
  readonly kind: typeof GOVERNED_CONTEXT_POLICY_KIND; readonly schemaVersion: "5.0.0";
  readonly release: { readonly identity: string; readonly inventorySha256: string; readonly installedRoot: string;
    readonly policyPath: string; readonly policyDigest: Sha256Digest };
  readonly python: { readonly path: string; readonly digest: Sha256Digest; readonly version: string };
  readonly adapter: { readonly path: string; readonly digest: Sha256Digest };
  readonly invocation: { readonly argv: readonly string[]; readonly environment: Readonly<Record<string, string>>; readonly timeoutMs: number };
  readonly principal: { readonly principalId: string; readonly grantId: string };
  readonly permission: { readonly role: "constructor"; readonly graphFunctionRef: string; readonly implementationRef: string;
    readonly execution: typeof GOVERNED_CONTEXT_EXECUTION };
  readonly sources: { readonly task: string; readonly rubric: string; readonly worksite: readonly string[];
    readonly testing: { readonly purpose: "testing"; readonly fieldPath: readonly (string | number)[] } };
};
const exactKeys = (value: unknown, keys: readonly string[]): value is Record<string, any> =>
  value !== null && typeof value === "object" && !Array.isArray(value) && Object.keys(value).sort().join(",") === [...keys].sort().join(",");
const canonicalAbsolute = (path: unknown): path is string => nonempty(path) && path.startsWith("/") && !path.includes("\\") &&
  path.split("/").slice(1).every(part => part !== "" && part !== "." && part !== "..");
/** Strict decoding of the complete selected policy bytes; any other shape refuses. */
export function parseGovernedContextPolicy(bytes: Uint8Array): GovernedContextPolicy | null {
  let p: unknown;
  try { p = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); } catch { return null; }
  if (!exactKeys(p, ["kind", "schemaVersion", "release", "python", "adapter", "invocation", "principal", "permission", "sources"]) ||
    p.kind !== GOVERNED_CONTEXT_POLICY_KIND || p.schemaVersion !== "5.0.0") return null;
  const { release: r, python: py, adapter: ad, invocation: inv, principal: pr, permission: pe, sources: so } = p;
  if (!exactKeys(r, ["identity", "inventorySha256", "installedRoot", "policyPath", "policyDigest"]) || r.identity !== GC03_SELECTED_RELEASE.identity ||
    r.inventorySha256 !== GC03_SELECTED_RELEASE.inventorySha256 || !canonicalAbsolute(r.installedRoot) || !canonicalAbsolute(r.policyPath) ||
    !digestPattern.test(r.policyDigest)) return null;
  if (!exactKeys(py, ["path", "digest", "version"]) || !canonicalAbsolute(py.path) || !digestPattern.test(py.digest) || !/^3\.\d+\.\d+$/u.test(py.version)) return null;
  if (!exactKeys(ad, ["path", "digest"]) || !canonicalAbsolute(ad.path) || !digestPattern.test(ad.digest)) return null;
  // The one fixed invocation: isolated, no site, no bytecode, the pinned adapter, empty environment.
  if (!exactKeys(inv, ["argv", "environment", "timeoutMs"]) || !Array.isArray(inv.argv) || inv.argv.join("\u0000") !== ["-I", "-S", "-B", ad.path].join("\u0000") ||
    !exactKeys(inv.environment, []) || !Number.isSafeInteger(inv.timeoutMs) || inv.timeoutMs < 1 || inv.timeoutMs > 60_000) return null;
  if (!exactKeys(pr, ["principalId", "grantId"]) || !nonempty(pr.principalId) || !nonempty(pr.grantId)) return null;
  if (!exactKeys(pe, ["role", "graphFunctionRef", "implementationRef", "execution"]) || pe.role !== "constructor" || !nonempty(pe.graphFunctionRef) ||
    !nonempty(pe.implementationRef) || pe.execution !== GOVERNED_CONTEXT_EXECUTION) return null;
  if (!exactKeys(so, ["task", "rubric", "worksite", "testing"]) || !relativePath(so.task) || !relativePath(so.rubric) || !Array.isArray(so.worksite) ||
    !so.worksite.every(relativePath) || new Set([so.task, so.rubric, ...so.worksite]).size !== so.worksite.length + 2 ||
    !exactKeys(so.testing, ["purpose", "fieldPath"]) || so.testing.purpose !== "testing" || !Array.isArray(so.testing.fieldPath) || so.testing.fieldPath.length === 0 ||
    !so.testing.fieldPath.every((x: unknown) => nonempty(x) || (Number.isSafeInteger(x) && (x as number) >= 0))) return null;
  return deepFrozen(p as GovernedContextPolicy);
}
function deepFrozen<T>(value: T): T {
  if (value !== null && typeof value === "object") { for (const v of Object.values(value)) deepFrozen(v); Object.freeze(value); }
  return value;
}
type RoleEvidenceFacts = {
  readonly role: string; readonly environmentRef: string;
  readonly policy: { readonly policyRef: string; readonly digest: string };
  readonly contextPolicy: { readonly policyRef: string; readonly selectors: readonly string[] };
  readonly sourceContent: readonly { readonly contextRef: string; readonly memberRef: string; readonly memberDigest: string;
    readonly startByte: number; readonly endByte: number; readonly spanDigest: string; readonly path: string; readonly text: string }[];
};
export type GovernedContextSelection =
  | { readonly kind: "governed_context_not_selected"; readonly reason: string }
  | { readonly kind: "governed_context_refused"; readonly code: GovernedContextRefusalCode; readonly reason: string }
  | { readonly kind: "governed_context_selected"; readonly policyRef: string; readonly policyDigest: Sha256Digest; readonly policy: GovernedContextPolicy;
      readonly environmentRef: string; readonly role: GovernedContextOwnerAuthority["role"];
      /** Parsed complete bytes of the authenticated activation-template member, or null when the Program names none. */
      readonly activationTemplate: unknown };
export function selectOwnedGovernedContext(facts: {
  readonly constructionTask: boolean;
  readonly publication: Readonly<ModulePublication>;
  readonly program: Readonly<GtlProgram> | undefined;
  readonly roleEvidence: RoleEvidenceFacts | null | false;
}): GovernedContextSelection {
  const policyRef = facts.program?.policies[GOVERNED_CONTEXT_POLICY_KEY];
  if (!facts.constructionTask || facts.program === undefined || policyRef === undefined)
    return Object.freeze({ kind: "governed_context_not_selected" as const, reason: "no private governed-context policy reference" });
  const no = (code: GovernedContextRefusalCode, reason: string) => Object.freeze({ kind: "governed_context_refused" as const, code, reason });
  const e = facts.roleEvidence;
  if (e === null || e === false || e.role !== "constructor" || !GOVERNED_CONTEXT_ROLE_SELECTORS.every(s => e.contextPolicy.selectors.includes(s)))
    return no("unsupported_composition", "governed context requires authenticated constructor role evidence with current_worksite and admitted_execution_evidence");
  const d = runEnvironmentForProgram(facts.publication, facts.program);
  if (d === null || d === false || d.declarationRef !== e.environmentRef) return no("unsupported_composition", "admitted Program has no single verified RunEnvironment");
  // One member of the single verified Context, backed by one dependency
  // inventory row, bound as its complete authenticated bytes.
  const member = (ref: string): Buffer | GovernedContextSelection => {
    const rows = e.sourceContent.filter(b => b.memberRef === ref);
    if (rows.length !== 1) return no("unsupported_composition", "constructor role binds no single governed-context member");
    const b = rows[0]!, contexts = d.contexts.filter(c => c.contextRef === b.contextRef);
    const members = contexts.length === 1 ? contexts[0]!.members.filter(m => m.memberRef === ref) : [];
    const dependencies = contexts.length === 1 ? d.dependencies.filter(x => x.basisRef === contexts[0]!.sourceLocator) : [];
    const m = members[0], inventory = dependencies.length === 1 && m !== undefined ? dependencies[0]!.members.filter(x => x.path === m.path && x.type === "file") : [];
    if (members.length !== 1 || inventory.length !== 1) return no("binding_stale", "governed-context member is not backed by one verified dependency inventory row");
    const bytes = Buffer.from(b.text, "utf8");
    if (b.startByte !== 0 || b.endByte !== m!.byteCount || bytes.length !== m!.byteCount || sha256Bytes(bytes) !== m!.digest ||
      b.memberDigest !== m!.digest || b.spanDigest !== m!.digest || inventory[0]!.digest !== m!.digest)
      return no("source_changed", "bound governed-context span is not the complete authenticated member bytes");
    return bytes;
  };
  const bytes = member(policyRef);
  if (!Buffer.isBuffer(bytes)) return bytes;
  const templateRef = facts.program.policies[GOVERNED_CONTEXT_ACTIVATION_KEY];
  let activationTemplate: unknown = null;
  if (templateRef !== undefined) {
    const raw = member(templateRef);
    if (!Buffer.isBuffer(raw)) return raw;
    try { activationTemplate = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(raw)); }
    catch { return no("unsupported_composition", "activation template member is not strict UTF-8 JSON"); }
  }
  const policy = parseGovernedContextPolicy(bytes);
  if (policy === null) return no("unsupported_composition", "governed-context policy bytes are not the supported private policy");
  return Object.freeze({ kind: "governed_context_selected" as const, policyRef, policyDigest: sha256Bytes(bytes), policy, environmentRef: d.declarationRef,
    activationTemplate: deepFrozen(activationTemplate),
    role: Object.freeze({ constructorRole: "construction" as const, policyRef: e.policy.policyRef, policyDigest: e.policy.digest as Sha256Digest,
      contextPolicyRef: e.contextPolicy.policyRef, selectors: Object.freeze([...e.contextPolicy.selectors]) }) });
}

/**
 * Owner execution gate. The verified policy names the permitted Python
 * executable, the adapter and one fixed invocation; the gate verifies their
 * exact bytes and that invocation, then intersects the live actor role, graph
 * function, native capability, capability grant actor, the declared source
 * grant and occurrence currentness. A `read_context` operation, dependency
 * membership or environment value grants nothing here. The resulting permit is
 * module-owned and is the only way the pinned host reader starts Python.
 */
const permits = new WeakSet<object>();
export type GovernedContextExecutionPermit = {
  readonly executable: string; readonly argv: readonly string[]; readonly pythonDigest: Sha256Digest; readonly adapterDigest: Sha256Digest;
  readonly pythonVersion: string; readonly timeoutMs: number; readonly policyDigest: Sha256Digest;
  /** Intersection of the pinned GC03 policy page limit and the native client bound. */
  readonly pageBound: number;
};
export function gateGovernedContextExecution(selection: Extract<GovernedContextSelection, { kind: "governed_context_selected" }>, live: {
  readonly role: string; readonly graphFunctionRef: string; readonly implementationRef: string;
  readonly actorRef: string; readonly capabilityGrantActorRef: string; readonly occurrenceCurrent: boolean;
  readonly readableFiles: ReadonlySet<string>;
}): GovernedContextExecutionPermit {
  const p = selection.policy;
  if (live.role !== p.permission.role || live.graphFunctionRef !== p.permission.graphFunctionRef || live.implementationRef !== p.permission.implementationRef)
    refuse("unsupported_composition", "live actor role, graph function or native capability differs from the policy permission");
  if (!nonempty(live.actorRef) || live.actorRef !== live.capabilityGrantActorRef) refuse("grant_changed", "native capability grant does not name the live actor");
  if (!live.occurrenceCurrent) refuse("occurrence_inactive", "native occurrence is not current");
  if (![p.sources.task, p.sources.rubric, ...p.sources.worksite].every(path => live.readableFiles.has(path)))
    refuse("key_denied", "policy source is outside the native task's admitted Context");
  verifyPinnedFile(p.python.path, p.python.digest); verifyPinnedFile(p.adapter.path, p.adapter.digest);
  const pageBound = gc03PolicyPageBound(p.release.policyPath, p.release.policyDigest);
  const permit = Object.freeze({ pageBound, executable: p.python.path, argv: Object.freeze([...p.invocation.argv]), pythonDigest: p.python.digest,
    adapterDigest: p.adapter.digest, pythonVersion: p.python.version, timeoutMs: p.invocation.timeoutMs, policyDigest: selection.policyDigest });
  permits.add(permit);
  return permit;
}
function verifyPinnedFile(path: string, expected: Sha256Digest): void {
  let bytes: Buffer;
  try { if (realpathSync(path) !== path) throw new Error("not canonical"); bytes = readFileSync(path); }
  catch { return refuse("unsupported_composition", "pinned Python or adapter is unavailable"); }
  if (sha256Bytes(bytes) !== expected) refuse("unsupported_composition", "pinned Python or adapter digest differs");
}

/**
 * Owner-derived prompt lines: the exact fixed-client command form, the
 * endpoint identity and the finite permitted keys. The owner passes the
 * actual reserved invocation, so the endpoint line is its exact JSON-escaped
 * nonsecret socket path and one admitted prompt names one endpoint. The path
 * grants nothing and is no confinement claim.
 */
export function governedContextPrompt(invocation: GovernedContextInvocation,
  keys: readonly { readonly key: string; readonly role: GovernedSourceRole; readonly sourceKey: string; readonly digest: Sha256Digest }[],
  pageBound: number = GOVERNED_CONTEXT_MAX_PAGE_BYTES): string {
  const bound = Math.min(pageBound, GOVERNED_CONTEXT_MAX_PAGE_BYTES);
  const example = governedContextCommand(invocation, { requestId: "r1", key: "late/0", offset: 0, maxBytes: bound });
  return [
    "Governed context lookup (owner-selected, read-only, no write or grant authority).",
    `Use one Bash call per request with exactly this command form; change only requestId (unique, [A-Za-z0-9._:-]{1,128}), key, offset (>=0) and maxBytes (1..${bound}; a larger value is refused, never clamped). Do not wrap, pipe or redirect it:`,
    example,
    `Endpoint identity (nonsecret, owner-reserved, supplied to the client through its environment; grants nothing): ${JSON.stringify(invocation.endpoint)}`,
    `Permitted keys: ${JSON.stringify(keys.map(k => ({ key: k.key, role: k.role, sourceKey: k.sourceKey, digest: k.digest })))}`,
    "Denied keys: every other key; the owner refuses it with a governed_context_refusal response. A page response carries base64 content, offset, length, totalBytes and nextOffset.",
  ].join("\n");
}
