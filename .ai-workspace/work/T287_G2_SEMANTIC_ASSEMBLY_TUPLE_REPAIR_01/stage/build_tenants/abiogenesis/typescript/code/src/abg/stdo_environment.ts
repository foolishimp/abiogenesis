import * as v from "valibot";
import { RUN_ENVIRONMENT_SCHEMA, isRunEnvironmentDeclaration, runEnvironmentForProgram,
  type RunEnvironmentDeclaration, STDO_RUN_ENVIRONMENT_SCHEMA, isStdoRunEnvironmentDeclaration, stdoEnvironmentForProgram,
  type StdoRunEnvironmentDeclaration } from "../gtl/stdo_run_environment.js";
import type { ModulePublication, GtlProgram } from "../gtl/contracts.js";
import { sha256Bytes, sha256Canonical } from "../shared/digests.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { jsonValueSchema } from "../shared/public_function_contracts.js";
import { deepFreeze } from "../shared/immutable.js";
import { isAbsolute, resolve, relative } from "node:path";

const ref = v.pipe(v.string(), v.minLength(1));
const digest = v.pipe(v.string(), v.regex(/^sha256:[a-f0-9]{64}$/u));
const bytes = v.strictObject({ base64: v.string(), digest });
const recordBytes = v.strictObject({ role: v.picklist(["representation", "axiom"]), ...bytes.entries });
export const STDO_ENVIRONMENT_EVIDENCE_SCHEMA = v.strictObject({
  kind: v.literal("stdo_environment_evidence"), schemaVersion: v.literal("5.0.0"),
  declaration: STDO_RUN_ENVIRONMENT_SCHEMA, environmentDigest: digest,
  programRef: ref, programDigest: digest,
  authority: v.strictObject({ authorityRef: ref, authorityDigest: digest, actorRef: ref }),
  resources: jsonValueSchema,
  sourceManifest: bytes, records: v.array(recordBytes),
  observedMembers: v.array(v.strictObject({ rootRole: v.picklist(["source", "representation", "axiom"]), path: ref,
    type: v.picklist(["file", "symlink"]), digest, target: v.nullable(ref) })),
  contexts: v.array(v.strictObject({ contextRef: ref, members: v.array(v.strictObject({
    memberRef: ref, path: ref, ...bytes.entries })) })),
  accesses: v.array(v.strictObject({ accessRef: ref, command: v.strictObject({ executablePath: ref,
    executableDigest: digest, arguments: v.array(v.string()), cwd: ref }),
    bindings: jsonValueSchema, exitCode: v.literal(0), stdout: bytes,
    projection: jsonValueSchema, projectionDigest: digest,
    startedAt: ref, completedAt: ref, durationMs: v.pipe(v.number(), v.minValue(0)) })),
  evidenceDigest: digest,
});
export type StdoEnvironmentEvidence = v.InferOutput<typeof STDO_ENVIRONMENT_EVIDENCE_SCHEMA>;
const hash = (x: unknown) => sha256Canonical(x as JsonValue);
const record = (x: unknown): x is Record<string, any> => typeof x === "object" && x !== null && !Array.isArray(x);
const unique = (xs: readonly string[]) => new Set(xs).size === xs.length;
const keys = (x: unknown, names: readonly string[]) => record(x) && Object.keys(x).sort().join("\0") === [...names].sort().join("\0");
export function exactStdoBytes(value: { base64: string; digest: string }): Buffer {
  const b = Buffer.from(value.base64, "base64");
  if (b.toString("base64") !== value.base64 || sha256Bytes(b) !== value.digest) throw new TypeError("STDO evidence byte mismatch");
  return b;
}
/** The selected release's published inventory syntax, not a semantic interpreter. */
export function stdoRecordInventory(text: string): StdoRunEnvironmentDeclaration["axiom"]["members"] {
  return text.split("\n").flatMap(line => {
    const match = /^\| (file|symlink) \| \x60([^\x60]+)\x60(?: -> \x60([^\x60]+)\x60)? \| \x60([a-f0-9]{64})\x60 \|$/u.exec(line);
    return match === null ? [] : [{ path: match[2]!, type: match[1] as "file" | "symlink",
      target: match[3] ?? null, digest: ("sha256:" + match[4]) as StdoRunEnvironmentDeclaration["axiom"]["members"][number]["digest"] }];
  }).sort((a,b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
}
export function stdoSourceInventory(manifest: unknown): { path: string; digest: string }[] {
  if (!record(manifest) || manifest.kind !== "stdo.installed-release-manifest" || manifest.schema_version !== 1 ||
    !record(manifest.standards) || !record(manifest.auxiliary)) throw new TypeError("unsupported Source manifest");
  const s = manifest.standards, a = manifest.auxiliary;
  if (!Array.isArray(s.members) || s.member_count !== s.members.length || !record(a.plugin) ||
    !Array.isArray(a.plugin.members) || a.plugin.member_count !== a.plugin.members.length) throw new TypeError("incomplete Source inventory");
  const rows = [...s.members.map((m: any) => ({ path: s.installed_root + "/" + m.path, digest: "sha256:" + m.sha256 })),
    ...a.plugin.members.map((m: any) => ({ path: a.plugin.installed_root + "/" + m.path, digest: "sha256:" + m.sha256 })),
    { path: a.license.path, digest: "sha256:" + a.license.sha256 },
    { path: a.release_note.installed_path, digest: "sha256:" + a.release_note.sha256 }];
  if (!unique(rows.map(m => m.path)) || rows.some(m => !/^[^/].*/u.test(m.path) || m.path.split("/").includes("..") ||
    !/^sha256:[a-f0-9]{64}$/u.test(m.digest))) throw new TypeError("invalid Source inventory");
  return rows;
}
export function isStdoEnvironmentEvidence(value: unknown): value is StdoEnvironmentEvidence {
  try {
    if (!v.is(STDO_ENVIRONMENT_EVIDENCE_SCHEMA, value)) return false;
    const e = value, d = e.declaration;
    const { evidenceDigest, ...body } = e;
    if (!isStdoRunEnvironmentDeclaration(d) || hash(d) !== e.environmentDigest || hash(body) !== evidenceDigest ||
      e.sourceManifest.digest !== d.source.manifestDigest || e.records.length !== 2 ||
      !unique(e.records.map(r => r.role))) return false;
    const resources = e.resources as Record<string, any>;
    if (!keys(resources,["kind","schemaVersion","roots","permission"]) || resources.kind !== "stdo_environment_resources" || resources.schemaVersion !== "5.0.0" ||
      !keys(resources.roots,["sourceRoot","representationRoot","axiomRoot","representationRecordPath","axiomRecordPath","pythonPath","temporaryRoot"]) ||
      !Object.values(resources.roots).every(p => typeof p === "string" && isAbsolute(p)) ||
      !keys(resources.permission,["authorityRef","authorityDigest","actorRef","programRef","environmentRef","environmentDigest","operation","roots"])) return false;
    const permission = resources.permission;
    if (permission.operation !== "project" || hash(permission.roots) !== hash(resources.roots) ||
      permission.authorityRef !== e.authority.authorityRef || permission.authorityDigest !== e.authority.authorityDigest || permission.actorRef !== e.authority.actorRef ||
      permission.programRef !== e.programRef || permission.environmentRef !== d.declarationRef || permission.environmentDigest !== e.environmentDigest) return false;
    const manifest = JSON.parse(exactStdoBytes(e.sourceManifest).toString("utf8"));
    const expected = [...stdoSourceInventory(manifest).map(m => ({ ...m, rootRole: "source", type: "file", target: null })),
      ...d.representation.members.map(m => ({ ...m, rootRole: "representation" })),
      ...d.axiom.members.map(m => ({ ...m, rootRole: "axiom" }))];
    if (e.observedMembers.length !== expected.length || !unique(e.observedMembers.map(m => m.rootRole + "/" + m.path)) ||
      expected.some(m => !e.observedMembers.some(o => hash(o) === hash(m)))) return false;
    for (const role of ["representation", "axiom"] as const) {
      const r = e.records.find(r => r.role === role)!;
      if (r.digest !== d[role].recordDigest || hash(stdoRecordInventory(exactStdoBytes(r).toString("utf8"))) !== hash(d[role].members)) return false;
    }
    if (e.contexts.length !== d.contexts.length || !unique(e.contexts.map(c => c.contextRef))) return false;
    for (const c of d.contexts) {
      const supplied = e.contexts.find(x => x.contextRef === c.contextRef);
      if (!supplied || supplied.members.length !== c.members.length || !unique(supplied.members.map(m => m.memberRef))) return false;
      for (const m of c.members) {
        const actual = supplied.members.find(x => x.memberRef === m.memberRef);
        if (!actual || actual.path !== m.path || actual.digest !== m.digest || exactStdoBytes(actual).length !== m.byteCount ||
          !expected.some(x => x.rootRole === "source" && x.path === m.path && x.digest === m.digest)) return false;
      }
    }
    for (const r of d.roles) for (const b of r.sourceBindings) {
      const m = e.contexts.find(c => c.contextRef === b.contextRef)!.members.find(m => m.memberRef === b.memberRef)!;
      if (sha256Bytes(exactStdoBytes(m).subarray(b.startByte, b.endByte)) !== b.spanDigest) return false;
    }
    if (e.accesses.length !== d.accesses.length || !unique(e.accesses.map(a => a.accessRef))) return false;
    for (const a of d.accesses) {
      const observed = e.accesses.find(x => x.accessRef === a.accessRef);
      if (!observed || observed.command.executableDigest !== d.axiom.pythonExecutableDigest ||
        exactStdoBytes(observed.stdout).length > a.maxOutputBytes || observed.durationMs > a.timeoutMs ||
        observed.startedAt > observed.completedAt) return false;
      const args = observed.command.arguments, bindingsPath = args[7];
      if (typeof bindingsPath !== "string" || !isAbsolute(bindingsPath)) return false;
      const local = relative(resources.roots.temporaryRoot,bindingsPath);
      if (local === "" || local === ".." || local.startsWith("../") || isAbsolute(local) || observed.command.executablePath !== resources.roots.pythonPath ||
        observed.command.cwd !== resources.roots.axiomRoot || hash(args) !== hash([
          resolve(resources.roots.axiomRoot,d.axiom.executablePath),"project","--program",resolve(resources.roots.representationRoot,d.representation.program.path),
          "--map",resolve(resources.roots.representationRoot,d.representation.map.path),"--bindings",bindingsPath,
          ...a.frameIndexRefs.flatMap(ref => ["--frame-index",ref]),"--mode",a.mode])) return false;
      if (hash(observed.bindings) !== hash({kind:"axiom-indexer.binding-set",schema_version:1,bindings:[{uri_prefix:d.source.releaseUri,path:resources.roots.sourceRoot}]})) return false;
      const p = JSON.parse(exactStdoBytes(observed.stdout).toString("utf8"));
      if (!record(p) || hash(p) !== hash(observed.projection) || p.kind !== "axiom-indexer.frame-projection" ||
        p.schema_version !== 1 || p.mode !== a.mode || p.program_uri !== d.representation.program.uri ||
        p.program_sha256 !== d.representation.program.canonicalDigest ||
        p.map_sha256 !== d.representation.map.canonicalDigest ||
        !Array.isArray(p.frame_indexes) || hash(p.frame_indexes.map((r: any) => r.uri)) !== hash(a.frameIndexRefs) ||
        !Array.isArray(p.symbols) || !Array.isArray(p.clauses) || !Array.isArray(p.residuals) ||
        !Array.isArray(p.resolved_sources) || !record(p.source_routes) || !record(p.closure)) return false;
      const { projection_sha256, ...preimage } = p;
      if (hash(preimage) !== projection_sha256 || observed.projectionDigest !== projection_sha256) return false;
      if (p.resolved_sources.some((s: any) => typeof s.uri !== "string" || !s.uri.startsWith(d.source.releaseUri) ||
        !expected.some(m => m.rootRole === "source" && m.path === s.uri.slice(d.source.releaseUri.length).split("#")[0] && m.digest === s.sha256))) return false;
    }
    return true;
  } catch { return false; }
}
export function stdoEvidenceMatchesInvocation(evidence: unknown, publication: Readonly<ModulePublication>, program: Readonly<GtlProgram>,
  authority: { authorityRef: string; authorityDigest: string; actorRef: string }): boolean {
  const d = stdoEnvironmentForProgram(publication, program);
  if (d === null) return evidence === undefined || evidence === null;
  return d !== false && isStdoEnvironmentEvidence(evidence) && evidence.environmentDigest === hash(d) &&
    evidence.programRef === program.programRef && evidence.programDigest === hash(program) && hash(evidence.authority) === hash(authority);
}
export function projectStdoRoleEvidence(events: readonly {kind: string; payload: JsonValue}[], invocationAdmissionRef: string,
  publication: Readonly<ModulePublication>, programRef: string, graphFunctionRef: string, programLocusRef: string, role: string) {
  const program = publication.programs.find(p => p.programRef === programRef);
  if (!program) return false;
  const d = stdoEnvironmentForProgram(publication, program);
  if (d === null) return null;
  const rows = events.filter(e => e.kind === "invocation_admitted" && record(e.payload) && (e.payload as Record<string, JsonValue>).invocationAdmissionRef === invocationAdmissionRef);
  if (d === false || rows.length !== 1 || !record(rows[0]!.payload)) return false;
  const p = rows[0]!.payload as Record<string, any>, e = p.stdoEnvironment;
  if (!stdoEvidenceMatchesInvocation(e, publication, program, { authorityRef: p.authorityRef, authorityDigest: p.authorityDigest, actorRef: p.actorRef }) ||
    !isStdoEnvironmentEvidence(e)) return false;
  const selected = d.roles.filter(r => r.graphFunctionRef === graphFunctionRef && r.programLocusRef === programLocusRef && r.role === role);
  if (selected.length !== 1) return false;
  const r = selected[0]!;
  return deepFreeze({ invocationAdmissionRef, environmentRef: d.declarationRef, environmentDigest: e.environmentDigest,
    evidenceDigest: e.evidenceDigest, role, graphFunctionRef, programLocusRef,
    frameRefs: r.frameRefs, policy: r.policy,
    sourceContent: r.sourceBindings.map(b => {
      const m = e.contexts.find(c => c.contextRef === b.contextRef)!.members.find(m => m.memberRef === b.memberRef)!;
      const bytes = exactStdoBytes(m).subarray(b.startByte, b.endByte);
      const text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
      if (!Buffer.from(text, "utf8").equals(bytes)) throw new TypeError("STDO source text cannot be rendered exactly");
      return { ...b, text };
    }),
    accessContent: r.accessRefs.map(ref => {
      const a = e.accesses.find(a => a.accessRef === ref)!;
      return { accessRef: ref, projectionDigest: a.projectionDigest, projection: a.projection };
    }) });
}

const observedMemberSchema = v.strictObject({ path: ref, type: v.picklist(["file", "symlink"]), digest, target: v.nullable(ref) });
export const RUN_ENVIRONMENT_EVIDENCE_SCHEMA = v.strictObject({
  kind: v.literal("run_environment_evidence"), schemaVersion: v.literal("5.0.0"), declaration: RUN_ENVIRONMENT_SCHEMA,
  environmentDigest: digest, programRef: ref, programDigest: digest,
  authority: v.strictObject({ authorityRef: ref, authorityDigest: digest, actorRef: ref }), resources: jsonValueSchema,
  dependencies: v.array(v.strictObject({ dependencyRef: ref, record: bytes, members: v.array(observedMemberSchema) })),
  contexts: STDO_ENVIRONMENT_EVIDENCE_SCHEMA.entries.contexts,
  corpusDocuments: v.nullable(v.strictObject({ program: bytes, map: bytes,
    pythonRuntime: v.strictObject({ executablePath: ref, executableDigest: digest, reportedVersion: ref }) })),
  accesses: v.array(v.strictObject({ ...STDO_ENVIRONMENT_EVIDENCE_SCHEMA.entries.accesses.item.entries, output: v.nullable(bytes) })),
  evidenceDigest: digest,
});
export type RunEnvironmentEvidence = v.InferOutput<typeof RUN_ENVIRONMENT_EVIDENCE_SCHEMA>;
const confined = (root: string, path: string) => { const p = relative(root, path); return p !== "" && p !== ".." && !p.startsWith("../") && !isAbsolute(p); };
export function isRunEnvironmentEvidence(value: unknown): value is RunEnvironmentEvidence {
  try {
    if (!v.is(RUN_ENVIRONMENT_EVIDENCE_SCHEMA, value)) return false;
    const e = value, d = e.declaration, r = e.resources as Record<string, any>;
    const { evidenceDigest, ...body } = e;
    if (!isRunEnvironmentDeclaration(d) || hash(d) !== e.environmentDigest || hash(body) !== evidenceDigest ||
      !keys(r, ["kind", "schemaVersion", "dependencies", "pythonPath", "temporaryRoot", "permission"]) ||
      r.kind !== "run_environment_resources" || r.schemaVersion !== "5.0.0" || !Array.isArray(r.dependencies) ||
      r.dependencies.length !== d.dependencies.length || !unique(r.dependencies.map((x: any) => x.dependencyRef)) ||
      !r.dependencies.every((x: any) => keys(x, ["dependencyRef", "root", "recordPath"]) && typeof x.root === "string" && isAbsolute(x.root) &&
        typeof x.recordPath === "string" && isAbsolute(x.recordPath) && d.dependencies.some(y => y.dependencyRef === x.dependencyRef)) ||
      typeof r.temporaryRoot !== "string" || !isAbsolute(r.temporaryRoot) ||
      !(r.pythonPath === null || typeof r.pythonPath === "string" && isAbsolute(r.pythonPath)) ||
      !keys(r.permission, ["authorityRef", "authorityDigest", "actorRef", "programRef", "environmentRef", "environmentDigest", "operations", "dependencies", "pythonPath", "temporaryRoot"])) return false;
    const permission = r.permission;
    if (permission.authorityRef !== e.authority.authorityRef || permission.authorityDigest !== e.authority.authorityDigest ||
      permission.actorRef !== e.authority.actorRef || permission.programRef !== e.programRef || permission.environmentRef !== d.declarationRef ||
      permission.environmentDigest !== e.environmentDigest || hash(permission.dependencies) !== hash(r.dependencies) ||
      permission.pythonPath !== r.pythonPath || permission.temporaryRoot !== r.temporaryRoot ||
      hash(permission.operations) !== hash([...new Set(["read_context", ...d.accesses.map(a => a.operation)])].sort())) return false;
    if (e.dependencies.length !== d.dependencies.length || !unique(e.dependencies.map(x => x.dependencyRef))) return false;
    for (const dep of d.dependencies) {
      const observed = e.dependencies.find(x => x.dependencyRef === dep.dependencyRef);
      if (!observed || observed.record.digest !== dep.recordDigest || hash(observed.members) !== hash(dep.members)) return false;
      exactStdoBytes(observed.record);
    }
    if (e.contexts.length !== d.contexts.length || !unique(e.contexts.map(c => c.contextRef))) return false;
    for (const c of d.contexts) {
      const observed = e.contexts.find(x => x.contextRef === c.contextRef);
      if (!observed || observed.members.length !== c.members.length || !unique(observed.members.map(m => m.memberRef))) return false;
      for (const m of c.members) {
        const row = observed.members.find(x => x.memberRef === m.memberRef);
        if (!row || row.path !== m.path || row.digest !== m.digest || exactStdoBytes(row).length !== m.byteCount) return false;
      }
    }
    for (const role of d.roles) for (const b of role.sourceBindings) {
      const row = e.contexts.find(c => c.contextRef === b.contextRef)!.members.find(m => m.memberRef === b.memberRef)!;
      if (sha256Bytes(exactStdoBytes(row).subarray(b.startByte, b.endByte)) !== b.spanDigest) return false;
    }
    if (e.accesses.length !== d.accesses.length || !unique(e.accesses.map(a => a.accessRef))) return false;
    const corpus = d.corpusAccess;
    if (corpus === null) return e.corpusDocuments === null && r.pythonPath === null;
    if (e.corpusDocuments === null || r.pythonPath === null) return false;
    if (e.corpusDocuments.pythonRuntime.executablePath !== r.pythonPath ||
      e.corpusDocuments.pythonRuntime.executableDigest !== corpus.pythonExecutableDigest ||
      e.corpusDocuments.pythonRuntime.reportedVersion !== corpus.pythonVersion) return false;
    const program = JSON.parse(exactStdoBytes(e.corpusDocuments.program).toString("utf8"));
    const map = JSON.parse(exactStdoBytes(e.corpusDocuments.map).toString("utf8"));
    const { map_sha256, ...mapBody } = map;
    if (e.corpusDocuments.program.digest !== corpus.program.byteDigest || hash(program) !== corpus.program.canonicalDigest ||
      e.corpusDocuments.map.digest !== corpus.map.byteDigest || hash(mapBody) !== corpus.map.canonicalDigest ||
      map_sha256 !== corpus.map.canonicalDigest || map.program_uri !== corpus.program.uri || map.program_sha256 !== corpus.program.canonicalDigest) return false;
    const rep = r.dependencies.find((x: any) => x.dependencyRef === corpus.representationDependencyRef)!;
    const tool = r.dependencies.find((x: any) => x.dependencyRef === corpus.axiomDependencyRef)!;
    const expectedBindings = { kind: "axiom-indexer.binding-set", schema_version: 1,
      bindings: d.dependencies.map(dep => ({ uri_prefix: dep.basisRef, path: r.dependencies.find((x: any) => x.dependencyRef === dep.dependencyRef).root })) };
    const sourceMatches = (s: any) => typeof s.uri === "string" && d.dependencies.some(dep => s.uri.startsWith(dep.basisRef) &&
      dep.members.some(m => m.type === "file" && m.path === s.uri.slice(dep.basisRef.length).split("#")[0] && m.digest === s.sha256));
    for (const a of d.accesses) {
      const observed = e.accesses.find(x => x.accessRef === a.accessRef);
      if (!observed || observed.command.executablePath !== r.pythonPath || observed.command.executableDigest !== corpus.pythonExecutableDigest ||
        observed.command.cwd !== tool.root || exactStdoBytes(observed.stdout).length > a.maxOutputBytes ||
        observed.durationMs > a.timeoutMs || observed.startedAt > observed.completedAt || hash(observed.bindings) !== hash(expectedBindings)) return false;
      const args = observed.command.arguments, bindingPath = args[a.operation === "validate" ? 5 : 7];
      if (!bindingPath || !isAbsolute(bindingPath) || !confined(r.temporaryRoot, bindingPath)) return false;
      const p = JSON.parse(exactStdoBytes(observed.stdout).toString("utf8"));
      if (!record(p) || hash(p) !== hash(observed.projection) || p.program_uri !== corpus.program.uri || p.program_sha256 !== corpus.program.canonicalDigest ||
        !Array.isArray(p.resolved_sources) || !p.resolved_sources.every(sourceMatches)) return false;
      const prefix = [resolve(tool.root, corpus.executablePath), a.operation, "--program", resolve(rep.root, corpus.program.path)];
      if (a.operation === "validate") {
        const outputPath = args[7];
        if (!outputPath || !confined(r.temporaryRoot, outputPath) || hash(args) !== hash([...prefix, "--bindings", bindingPath, "--emit-map", outputPath]) ||
          p.kind !== "axiom-indexer.validation-report" || p.schema_version !== 1 || p.status !== "valid" ||
          !Array.isArray(p.diagnostics) || p.diagnostics.length !== 0 || observed.output === null ||
          exactStdoBytes(observed.output).length > a.maxOutputBytes || hash(JSON.parse(exactStdoBytes(observed.output).toString("utf8"))) !== hash(map) ||
          observed.projectionDigest !== hash(p) || hash(p.resolved_sources) !== hash(map.resolved_sources)) return false;
      } else {
        const { projection_sha256, ...projectionBody } = p;
        if (hash(args) !== hash([...prefix, "--map", resolve(rep.root, corpus.map.path), "--bindings", bindingPath,
          ...a.frameIndexRefs.flatMap(ref => ["--frame-index", ref]), "--mode", a.mode]) || observed.output !== null ||
          p.kind !== "axiom-indexer.frame-projection" || p.schema_version !== 1 || p.mode !== a.mode || p.map_sha256 !== corpus.map.canonicalDigest ||
          !Array.isArray(p.frame_indexes) || hash(p.frame_indexes.map((x: any) => x.uri)) !== hash(a.frameIndexRefs) ||
          hash(projectionBody) !== projection_sha256 || observed.projectionDigest !== projection_sha256) return false;
      }
    }
    return true;
  } catch { return false; }
}
export function runEnvironmentEvidenceMatchesInvocation(evidence: unknown, publication: Readonly<ModulePublication>, program: Readonly<GtlProgram>,
  authority: { authorityRef: string; authorityDigest: string; actorRef: string }): boolean {
  const d = runEnvironmentForProgram(publication, program);
  if (d === null) return evidence === undefined || evidence === null;
  return d !== false && isRunEnvironmentEvidence(evidence) && evidence.environmentDigest === hash(d) &&
    evidence.programRef === program.programRef && evidence.programDigest === hash(program) && hash(evidence.authority) === hash(authority);
}
export function projectRunEnvironmentRoleEvidence(events: readonly { kind: string; payload: JsonValue }[], invocationAdmissionRef: string,
  publication: Readonly<ModulePublication>, programRef: string, graphFunctionRef: string, programLocusRef: string, role: string) {
  const program = publication.programs.find(p => p.programRef === programRef);
  if (!program) return false;
  const d = runEnvironmentForProgram(publication, program);
  if (d === null) return null;
  const rows = events.filter(e => e.kind === "invocation_admitted" && record(e.payload) && (e.payload as Record<string, any>).invocationAdmissionRef === invocationAdmissionRef);
  if (d === false || rows.length !== 1 || !record(rows[0]!.payload)) return false;
  const p = rows[0]!.payload as Record<string, any>, e = p.runEnvironment;
  if (!runEnvironmentEvidenceMatchesInvocation(e, publication, program, { authorityRef: p.authorityRef, authorityDigest: p.authorityDigest, actorRef: p.actorRef }) ||
    !isRunEnvironmentEvidence(e)) return false;
  const roles = d.roles.filter(r => r.graphFunctionRef === graphFunctionRef && r.programLocusRef === programLocusRef && r.role === role);
  if (roles.length !== 1) return false;
  const r = roles[0]!;
  return deepFreeze({ invocationAdmissionRef, environmentRef: d.declarationRef, environmentDigest: e.environmentDigest, evidenceDigest: e.evidenceDigest,
    role, graphFunctionRef, programLocusRef, frameRefs: r.frameRefs, policy: r.policy,
    contextPolicy: r.contextPolicy, contextPolicyDigest: hash(r.contextPolicy),
    sourceContent: r.sourceBindings.filter((b, i, rows) => rows.findIndex(row => hash(row) === hash(b)) === i).map(b => {
      const m = e.contexts.find(c => c.contextRef === b.contextRef)!.members.find(m => m.memberRef === b.memberRef)!;
      const bytes = exactStdoBytes(m).subarray(b.startByte, b.endByte);
      const text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
      if (!Buffer.from(text, "utf8").equals(bytes)) throw new TypeError("context UTF8 byte mismatch");
      return { ...b, path: m.path, sourceLocator: d.contexts.find(c => c.contextRef === b.contextRef)!.sourceLocator, text };
    }),
    accessContent: r.accessRefs.map(ref => {
      const a = e.accesses.find(a => a.accessRef === ref)!;
      const access = d.accesses.find(x => x.accessRef === ref)!;
      return { accessRef: ref, projectionDigest: a.projectionDigest, operation: access.operation,
        claim: access.operation === "validate" ? "structural_corpus_access_not_frame_application" : "declared_index_access_not_application",
        disposition: access.operation === "validate" ? "omitted_not_required" : "included_full", projection: access.operation === "validate" ? null : a.projection };
    }) });
}
