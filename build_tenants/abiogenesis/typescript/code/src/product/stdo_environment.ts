import * as v from "valibot";
import { readFile, readdir, lstat, readlink, realpath, mkdtemp, writeFile, unlink, rmdir } from "node:fs/promises";
import { resolve, relative, isAbsolute, join, dirname } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { performance } from "node:perf_hooks";
import { runEnvironmentForProgram, validRunEnvironmentProgram, type RunEnvironmentDeclaration,
  stdoEnvironmentForProgram, validStdoEnvironmentProgram, type StdoRunEnvironmentDeclaration } from "../gtl/stdo_run_environment.js";
import type { ModulePublication, GtlProgram, GraphFunction } from "../gtl/contracts.js";
import { isRunEnvironmentEvidence, type RunEnvironmentEvidence,
  isStdoEnvironmentEvidence, stdoSourceInventory, stdoRecordInventory, type StdoEnvironmentEvidence } from "../abg/stdo_environment.js";
import { sha256Bytes, sha256Canonical } from "../shared/digests.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";

const ref = v.pipe(v.string(), v.minLength(1));
const path = v.pipe(ref, v.check(isAbsolute));
const digest = v.pipe(v.string(), v.regex(/^sha256:[a-f0-9]{64}$/u));
const roots = v.strictObject({ sourceRoot: path, representationRoot: path, axiomRoot: path,
  representationRecordPath: path, axiomRecordPath: path, pythonPath: path, temporaryRoot: path });
export const STDO_ENVIRONMENT_RESOURCES_SCHEMA = v.strictObject({
  kind: v.literal("stdo_environment_resources"), schemaVersion: v.literal("5.0.0"),
  roots,
  permission: v.strictObject({ authorityRef: ref, authorityDigest: digest, actorRef: ref,
    programRef: ref, environmentRef: ref, environmentDigest: digest,
    operation: v.literal("project"), roots }),
});
export type StdoEnvironmentResources = v.InferOutput<typeof STDO_ENVIRONMENT_RESOURCES_SCHEMA>;
export type StdoEnvironmentRefusalCause = "missing_binding" | "identity_mismatch" | "access_not_permitted" |
  "access_unavailable" | "tool_failure" | "invalid_projection" | "declared_bound_overflow" | "unsupported_declaration";
export type StdoEnvironmentObservation = Readonly<{kind:"stdo_environment_observed"; evidence: StdoEnvironmentEvidence | null}> |
  Readonly<{kind:"stdo_environment_refusal"; cause:StdoEnvironmentRefusalCause; issuePath:string}>;
class ObservationFailure extends Error {
  constructor(override readonly cause: StdoEnvironmentRefusalCause, readonly issuePath: string) { super(cause); }
}
const hash = (x: unknown) => sha256Canonical(x as JsonValue);
const encoded = (b: Buffer) => ({ base64: b.toString("base64"), digest: sha256Bytes(b) });
const inside = (root: string, value: string) => {
  const r = relative(root, value); return r !== "" && !r.startsWith(".." + "/") && r !== ".." && !isAbsolute(r);
};
async function fileAt(root: string, path: string) {
  const absolute = resolve(root, path);
  if (!inside(root, absolute) || (await lstat(absolute)).isSymbolicLink() || await realpath(absolute) !== absolute)
    throw new ObservationFailure("identity_mismatch", "/stdoEnvironmentResources/member/" + path);
  return readFile(absolute);
}
async function inventoryPaths(root: string, prefix = ""): Promise<string[]> {
  const entries = await readdir(join(root, prefix), {withFileTypes:true});
  const result: string[] = [];
  for (const entry of entries) {
    const p = prefix === "" ? entry.name : prefix + "/" + entry.name;
    if (entry.isDirectory()) result.push(...await inventoryPaths(root,p));
    else result.push(p);
  }
  return result.sort();
}
async function verifyCompanion(root: string, d: StdoRunEnvironmentDeclaration["axiom"] | StdoRunEnvironmentDeclaration["representation"],
  role: "axiom" | "representation", recordPath: string): Promise<{record: StdoEnvironmentEvidence["records"][number]; members: StdoEnvironmentEvidence["observedMembers"]}> {
  const recordBytes = await readFile(recordPath);
  if (sha256Bytes(recordBytes) !== d.recordDigest || hash(stdoRecordInventory(recordBytes.toString("utf8"))) !== hash(d.members) ||
    hash(await inventoryPaths(root)) !== hash(d.members.map(m=>m.path).sort()))
    throw new ObservationFailure("identity_mismatch", "/stdoEnvironmentResources/" + role + "/inventory");
  const members: StdoEnvironmentEvidence["observedMembers"] = [];
  for (const m of d.members) {
    const p = resolve(root,m.path), stat = await lstat(p);
    if (!inside(root,p)) throw new ObservationFailure("identity_mismatch", "/stdoEnvironmentResources/" + role + "/path");
    const bytes = m.type === "symlink" && stat.isSymbolicLink() ? Buffer.from(await readlink(p), "utf8")
      : m.type === "file" && stat.isFile() && !stat.isSymbolicLink() ? await fileAt(root,m.path) : null;
    if (bytes === null || sha256Bytes(bytes) !== m.digest || m.type === "symlink" &&
      (bytes.toString("utf8") !== m.target || !inside(root,await realpath(p))))
      throw new ObservationFailure("identity_mismatch", "/stdoEnvironmentResources/" + role + "/" + m.path);
    members.push({rootRole:role,...m});
  }
  return {record:{role,...encoded(recordBytes)},members};
}
/** Existing Product preparation observes exact declared dependencies. No traversal or semantic judgment. */
export async function observeStdoEnvironment(input: {
  publication: Readonly<ModulePublication>; program: Readonly<GtlProgram>; graphFunctions: readonly Readonly<GraphFunction>[];
  authority: {authorityRef:string;authorityDigest:string;actorRef:string};
  archiveRoot:string; resources?: StdoEnvironmentResources;
}): Promise<StdoEnvironmentObservation> {
  let temporaryDirectory: string | null = null;
  let bindingsPath: string | null = null;
  let outcome: StdoEnvironmentObservation;
  try {
    const d = stdoEnvironmentForProgram(input.publication,input.program);
    if (d === null) {
      if (input.resources !== undefined) throw new ObservationFailure("access_not_permitted","/stdoEnvironmentResources");
      return deepFreeze({kind:"stdo_environment_observed",evidence:null});
    }
    if (d === false || !validStdoEnvironmentProgram(input.publication,input.program,input.graphFunctions))
      throw new ObservationFailure("unsupported_declaration","/program/stdoRunEnvironment");
    if (input.resources === undefined) throw new ObservationFailure("missing_binding","/stdoEnvironmentResources");
    if (!v.is(STDO_ENVIRONMENT_RESOURCES_SCHEMA,input.resources))
      throw new ObservationFailure("access_not_permitted","/stdoEnvironmentResources/permission");
    const r = input.resources, p = r.permission;
    if (p.authorityRef !== input.authority.authorityRef || p.authorityDigest !== input.authority.authorityDigest ||
      p.actorRef !== input.authority.actorRef || p.programRef !== input.program.programRef ||
      p.environmentRef !== d.declarationRef || p.environmentDigest !== hash(d) || hash(p.roots) !== hash(r.roots) ||
      !inside(resolve(input.archiveRoot),resolve(r.roots.temporaryRoot)))
      throw new ObservationFailure("access_not_permitted","/stdoEnvironmentResources/permission");
    // Permission is checked before filesystem access. Canonical roots prevent hidden aliases.
    const physical = Object.fromEntries(await Promise.all(Object.entries(r.roots).map(async ([k,p])=>[k,await realpath(p)]))) as typeof r.roots;
    if (Object.keys(physical).some(k=>physical[k as keyof typeof physical] !== r.roots[k as keyof typeof r.roots]) ||
      !inside(await realpath(input.archiveRoot),physical.temporaryRoot) ||
      [physical.sourceRoot,physical.representationRoot,physical.axiomRoot].some(root=>inside(root,physical.temporaryRoot) || root===physical.temporaryRoot))
      throw new ObservationFailure("access_not_permitted","/stdoEnvironmentResources/roots");
    const sourceManifest = await fileAt(physical.sourceRoot,"manifest.json");
    if (sha256Bytes(sourceManifest) !== d.source.manifestDigest) throw new ObservationFailure("identity_mismatch","/stdoEnvironmentResources/source/manifest");
    const sourceRows = stdoSourceInventory(JSON.parse(sourceManifest.toString("utf8")));
    if (hash(await inventoryPaths(physical.sourceRoot)) !== hash([...sourceRows.map(m=>m.path),"manifest.json"].sort()))
      throw new ObservationFailure("identity_mismatch","/stdoEnvironmentResources/source/inventory");
    const sourceBytes = new Map<string,Buffer>();
    const observedMembers: StdoEnvironmentEvidence["observedMembers"] = [];
    for (const m of sourceRows) {
      const b = await fileAt(physical.sourceRoot,m.path);
      if (sha256Bytes(b) !== m.digest) throw new ObservationFailure("identity_mismatch","/stdoEnvironmentResources/source/" + m.path);
      sourceBytes.set(m.path,b);
      observedMembers.push({rootRole:"source",path:m.path,type:"file",digest:sha256Bytes(b),target:null});
    }
    const representation = await verifyCompanion(physical.representationRoot,d.representation,"representation",physical.representationRecordPath);
    const axiom = await verifyCompanion(physical.axiomRoot,d.axiom,"axiom",physical.axiomRecordPath);
    observedMembers.push(...representation.members,...axiom.members);
    const pythonBytes = await readFile(physical.pythonPath);
    if (sha256Bytes(pythonBytes) !== d.axiom.pythonExecutableDigest)
      throw new ObservationFailure("identity_mismatch","/stdoEnvironmentResources/python");
    const programPath=join(physical.representationRoot,d.representation.program.path), mapPath=join(physical.representationRoot,d.representation.map.path);
    const program=JSON.parse((await readFile(programPath)).toString("utf8")), map=JSON.parse((await readFile(mapPath)).toString("utf8"));
    const {map_sha256,...mapBody}=map;
    if (hash(program)!==d.representation.program.canonicalDigest || hash(mapBody)!==d.representation.map.canonicalDigest ||
      map_sha256!==d.representation.map.canonicalDigest || map.program_uri!==d.representation.program.uri ||
      map.program_sha256!==d.representation.program.canonicalDigest ||
      d.accesses.some(a=>a.frameIndexRefs.some(ref=>!Object.hasOwn(map.frame_indexes??{},ref))) ||
      d.roles.some(r=>r.frameRefs.some(ref=>!program.frame_refs.includes(ref))))
      throw new ObservationFailure("identity_mismatch","/stdoEnvironmentResources/program-map-selection");
    const contexts: StdoEnvironmentEvidence["contexts"] = d.contexts.map(c=>({contextRef:c.contextRef,members:c.members.map(m=>{
      const b=sourceBytes.get(m.path);
      if (!b || b.length!==m.byteCount || sha256Bytes(b)!==m.digest)
        throw new ObservationFailure("identity_mismatch","/stdoEnvironmentResources/context/"+m.memberRef);
      return {memberRef:m.memberRef,path:m.path,...encoded(b)};
    })}));
    for (const r of d.roles) for (const b of r.sourceBindings) {
      const member=d.contexts.find(c=>c.contextRef===b.contextRef)!.members.find(m=>m.memberRef===b.memberRef)!;
      if (sha256Bytes(sourceBytes.get(member.path)!.subarray(b.startByte,b.endByte))!==b.spanDigest)
        throw new ObservationFailure("identity_mismatch","/stdoEnvironmentResources/source-span");
    }
    const bindings={kind:"axiom-indexer.binding-set",schema_version:1,bindings:[{uri_prefix:d.source.releaseUri,path:physical.sourceRoot}]};
    temporaryDirectory=await mkdtemp(join(physical.temporaryRoot,"stdo-bindings-"));
    bindingsPath=join(temporaryDirectory,"bindings.json");
    await writeFile(bindingsPath,JSON.stringify(bindings),"utf8");
    const accesses: StdoEnvironmentEvidence["accesses"] = [];
    for (const a of d.accesses) {
      const args=[join(physical.axiomRoot,d.axiom.executablePath),"project","--program",programPath,"--map",mapPath,"--bindings",bindingsPath,
        ...a.frameIndexRefs.flatMap(ref=>["--frame-index",ref]),"--mode",a.mode];
      const startedAt=new Date().toISOString(), started=performance.now();
      let stdout: Buffer;
      try {
        const result=await promisify(execFile)(physical.pythonPath,args,{cwd:physical.axiomRoot,timeout:a.timeoutMs,maxBuffer:a.maxOutputBytes,
          encoding:"buffer",killSignal:"SIGKILL",env:{LANG:"C.UTF-8",PYTHONNOUSERSITE:"1",PYTHONDONTWRITEBYTECODE:"1"}});
        stdout=result.stdout;
      } catch (error) {
        const e=error as {code?:unknown};
        throw new ObservationFailure(e.code==="ERR_CHILD_PROCESS_STDIO_MAXBUFFER"?"declared_bound_overflow":"tool_failure",
          "/stdoEnvironmentResources/access/"+a.accessRef);
      }
      const durationMs=performance.now()-started, completedAt=new Date().toISOString();
      let projection: JsonValue;
      try { projection=JSON.parse(stdout.toString("utf8")); }
      catch { throw new ObservationFailure("invalid_projection","/stdoEnvironmentResources/access/"+a.accessRef); }
      const projectionDigest=(projection as Record<string,JsonValue>).projection_sha256 as string;
      accesses.push({accessRef:a.accessRef,command:{executablePath:physical.pythonPath,executableDigest:sha256Bytes(pythonBytes),arguments:args,cwd:physical.axiomRoot},
        bindings,exitCode:0,stdout:encoded(stdout),projection,projectionDigest,startedAt,completedAt,durationMs});
    }
    const body={kind:"stdo_environment_evidence" as const,schemaVersion:"5.0.0" as const,declaration:d,environmentDigest:hash(d),
      programRef:input.program.programRef,programDigest:hash(input.program),authority:input.authority,resources:r as unknown as JsonValue,
      sourceManifest:encoded(sourceManifest),records:[representation.record,axiom.record],observedMembers,contexts,accesses};
    const evidence={...body,evidenceDigest:hash(body)};
    if (!isStdoEnvironmentEvidence(evidence)) throw new ObservationFailure("invalid_projection","/stdoEnvironmentResources/evidence");
    outcome=deepFreeze({kind:"stdo_environment_observed",evidence});
  } catch (error) {
    outcome=deepFreeze({kind:"stdo_environment_refusal",cause:error instanceof ObservationFailure?error.cause:"access_unavailable",
      issuePath:error instanceof ObservationFailure?error.issuePath:"/stdoEnvironmentResources"});
  }
  try {
    if(bindingsPath!==null) await unlink(bindingsPath);
    if(temporaryDirectory!==null) await rmdir(temporaryDirectory);
  } catch { return deepFreeze({kind:"stdo_environment_refusal" as const,cause:"access_unavailable" as const,issuePath:"/stdoEnvironmentResources/temporary-cleanup"}); }
  return outcome;
}

const dependencyResourceSchema = v.strictObject({ dependencyRef: ref, root: path, recordPath: path });
const resourceCoordinates = { dependencies: v.pipe(v.array(dependencyResourceSchema), v.minLength(1)),
  pythonPath: v.nullable(path), temporaryRoot: path };
export const RUN_ENVIRONMENT_RESOURCES_SCHEMA = v.strictObject({
  kind: v.literal("run_environment_resources"), schemaVersion: v.literal("5.0.0"), ...resourceCoordinates,
  permission: v.strictObject({ authorityRef: ref, authorityDigest: digest, actorRef: ref, programRef: ref,
    environmentRef: ref, environmentDigest: digest, operations: v.array(v.picklist(["read_context", "validate", "project"])), ...resourceCoordinates }),
});
export type RunEnvironmentResources = v.InferOutput<typeof RUN_ENVIRONMENT_RESOURCES_SCHEMA>;
export function constructRunEnvironmentResources(value: RunEnvironmentResources): Readonly<RunEnvironmentResources> {
  if (!v.is(RUN_ENVIRONMENT_RESOURCES_SCHEMA, value)) throw new TypeError("invalid run environment resource assertion");
  return deepFreeze(value);
}
/** Exact record syntax adaptation only; no frame selection or constitutional interpretation. */
export function runEnvironmentRecordMembers(format: RunEnvironmentDeclaration["dependencies"][number]["recordFormat"], bytes: Uint8Array):
  RunEnvironmentDeclaration["dependencies"][number]["members"] {
  const text = Buffer.from(bytes).toString("utf8");
  if (format === "release_record@1") return stdoRecordInventory(text);
  if (format === "stdo_source_manifest@1") return stdoSourceInventory(JSON.parse(text)).map(m => ({
    ...m, type: "file" as const, target: null })).sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  const record = JSON.parse(text);
  if (record.kind !== "run_environment_member_inventory" || record.schemaVersion !== "5.0.0" || !Array.isArray(record.members))
    throw new TypeError("invalid generic member inventory");
  return record.members;
}
export type RunEnvironmentObservation = Readonly<{ kind: "run_environment_observed"; evidence: RunEnvironmentEvidence | null }> |
  Readonly<{ kind: "run_environment_refusal"; cause: StdoEnvironmentRefusalCause; issuePath: string }>;
export async function observeRunEnvironment(input: {
  publication: Readonly<ModulePublication>; program: Readonly<GtlProgram>; graphFunctions: readonly Readonly<GraphFunction>[];
  authority: { authorityRef: string; authorityDigest: string; actorRef: string }; archiveRoot: string; resources?: RunEnvironmentResources;
}): Promise<RunEnvironmentObservation> {
  let temporaryDirectory: string | null = null;
  const temporaryFiles: string[] = [];
  let outcome: RunEnvironmentObservation;
  try {
    const d = runEnvironmentForProgram(input.publication, input.program);
    if (d === null) {
      if (input.resources !== undefined) throw new ObservationFailure("access_not_permitted", "/runEnvironmentResources");
      return deepFreeze({ kind: "run_environment_observed", evidence: null });
    }
    if (d === false || !validRunEnvironmentProgram(input.publication, input.program, input.graphFunctions))
      throw new ObservationFailure("unsupported_declaration", "/program/runEnvironment");
    if (input.resources === undefined) throw new ObservationFailure("missing_binding", "/runEnvironmentResources");
    const r = input.resources, p = r.permission;
    if (!v.is(RUN_ENVIRONMENT_RESOURCES_SCHEMA, r) || p.authorityRef !== input.authority.authorityRef ||
      p.authorityDigest !== input.authority.authorityDigest || p.actorRef !== input.authority.actorRef ||
      p.programRef !== input.program.programRef || p.environmentRef !== d.declarationRef || p.environmentDigest !== hash(d) ||
      hash(p.dependencies) !== hash(r.dependencies) || p.pythonPath !== r.pythonPath || p.temporaryRoot !== r.temporaryRoot ||
      hash(p.operations) !== hash([...new Set(["read_context", ...d.accesses.map(a => a.operation)])].sort()) ||
      !inside(resolve(input.archiveRoot), r.temporaryRoot) || r.dependencies.length !== d.dependencies.length ||
      new Set(r.dependencies.map(x => x.dependencyRef)).size !== r.dependencies.length ||
      !r.dependencies.every(x => d.dependencies.some(dep => dep.dependencyRef === x.dependencyRef)))
      throw new ObservationFailure("access_not_permitted", "/runEnvironmentResources/permission");
    // No physical reads precede the exact authority and scope comparison.
    for (const x of [r.temporaryRoot, ...r.dependencies.flatMap(dep => [dep.root, dep.recordPath]), ...(r.pythonPath === null ? [] : [r.pythonPath])])
      if (await realpath(x) !== x) throw new ObservationFailure("access_not_permitted", "/runEnvironmentResources/canonical-path");
    if (!inside(await realpath(input.archiveRoot), r.temporaryRoot) || r.dependencies.some(x => x.root === r.temporaryRoot || inside(x.root, r.temporaryRoot)))
      throw new ObservationFailure("access_not_permitted", "/runEnvironmentResources/temporaryRoot");
    const dependencies: RunEnvironmentEvidence["dependencies"] = [];
    const observedBytes = new Map<string, Buffer>();
    for (const dep of d.dependencies) {
      const physical = r.dependencies.find(x => x.dependencyRef === dep.dependencyRef)!;
      const recordBytes = await readFile(physical.recordPath);
      if (sha256Bytes(recordBytes) !== dep.recordDigest || hash(runEnvironmentRecordMembers(dep.recordFormat, recordBytes)) !== hash(dep.members))
        throw new ObservationFailure("identity_mismatch", "/runEnvironmentResources/dependencies/" + dep.dependencyRef + "/record");
      // The published record owns membership. Co-located external Definitions,
      // release evidence or other unselected files are not dependency members.
      for (const m of dep.members) {
        const absolute = resolve(physical.root, m.path), stat = await lstat(absolute);
        const bytes = m.type === "file" && stat.isFile() && !stat.isSymbolicLink() ? await fileAt(physical.root, m.path)
          : m.type === "symlink" && stat.isSymbolicLink() ? Buffer.from(await readlink(absolute), "utf8") : null;
        if (!bytes || !inside(physical.root, absolute) || sha256Bytes(bytes) !== m.digest ||
          m.type === "symlink" && (bytes.toString("utf8") !== m.target || !inside(physical.root, await realpath(absolute))))
          throw new ObservationFailure("identity_mismatch", "/runEnvironmentResources/member/" + dep.dependencyRef + "/" + m.path);
        observedBytes.set(dep.dependencyRef + "\0" + m.path, bytes);
      }
      dependencies.push({ dependencyRef: dep.dependencyRef, record: encoded(recordBytes), members: dep.members });
    }
    const contexts = d.contexts.map(c => {
      const dep = d.dependencies.find(x => x.basisRef === c.sourceLocator)!;
      return { contextRef: c.contextRef, members: c.members.map(m => {
        const b = observedBytes.get(dep.dependencyRef + "\0" + m.path)!;
        if (b.length !== m.byteCount || sha256Bytes(b) !== m.digest) throw new ObservationFailure("identity_mismatch", "/runEnvironmentResources/context/" + m.memberRef);
        return { memberRef: m.memberRef, path: m.path, ...encoded(b) };
      }) };
    });
    for (const role of d.roles) for (const binding of role.sourceBindings) {
      const row = contexts.find(c => c.contextRef === binding.contextRef)!.members.find(m => m.memberRef === binding.memberRef)!;
      if (sha256Bytes(Buffer.from(row.base64, "base64").subarray(binding.startByte, binding.endByte)) !== binding.spanDigest)
        throw new ObservationFailure("identity_mismatch", "/runEnvironmentResources/sourceBinding/" + binding.memberRef);
    }
    let corpusDocuments: RunEnvironmentEvidence["corpusDocuments"] = null;
    const accesses: RunEnvironmentEvidence["accesses"] = [], corpus = d.corpusAccess;
    if (corpus === null) {
      if (r.pythonPath !== null) throw new ObservationFailure("access_not_permitted", "/runEnvironmentResources/pythonPath");
    } else {
      if (r.pythonPath === null) throw new ObservationFailure("missing_binding", "/runEnvironmentResources/pythonPath");
      const pythonBytes = await readFile(r.pythonPath);
      if (sha256Bytes(pythonBytes) !== corpus.pythonExecutableDigest) throw new ObservationFailure("identity_mismatch", "/runEnvironmentResources/pythonPath");
      const version = await promisify(execFile)(r.pythonPath, ["--version"], { timeout: 5000, maxBuffer: 4096, env: { LANG: "C.UTF-8", PYTHONNOUSERSITE: "1" } });
      if (version.stdout.trim() !== corpus.pythonVersion) throw new ObservationFailure("identity_mismatch", "/runEnvironmentResources/pythonVersion");
      const rep = r.dependencies.find(x => x.dependencyRef === corpus.representationDependencyRef)!;
      const tool = r.dependencies.find(x => x.dependencyRef === corpus.axiomDependencyRef)!;
      const programBytes = observedBytes.get(corpus.representationDependencyRef + "\0" + corpus.program.path)!;
      const mapBytes = observedBytes.get(corpus.representationDependencyRef + "\0" + corpus.map.path)!;
      corpusDocuments = { program: encoded(programBytes), map: encoded(mapBytes), pythonRuntime: {
        executablePath: r.pythonPath, executableDigest: sha256Bytes(pythonBytes), reportedVersion: version.stdout.trim() } };
      const bindings = { kind: "axiom-indexer.binding-set", schema_version: 1,
        bindings: d.dependencies.map(dep => ({ uri_prefix: dep.basisRef, path: r.dependencies.find(x => x.dependencyRef === dep.dependencyRef)!.root })) };
      temporaryDirectory = await mkdtemp(join(r.temporaryRoot, "run-environment-"));
      const bindingsPath = join(temporaryDirectory, "bindings.json");
      await writeFile(bindingsPath, JSON.stringify(bindings), "utf8"); temporaryFiles.push(bindingsPath);
      for (const [ordinal, a] of d.accesses.entries()) {
        const outputPath = join(temporaryDirectory, `map-${ordinal}.json`);
        if (a.operation === "validate") temporaryFiles.push(outputPath);
        const args = [join(tool.root, corpus.executablePath), a.operation, "--program", join(rep.root, corpus.program.path),
          ...(a.operation === "validate" ? ["--bindings", bindingsPath, "--emit-map", outputPath]
            : ["--map", join(rep.root, corpus.map.path), "--bindings", bindingsPath, ...a.frameIndexRefs.flatMap(ref => ["--frame-index", ref]), "--mode", a.mode])];
        const startedAt = new Date().toISOString(), started = performance.now();
        let stdout: Buffer;
        try {
          const result = await promisify(execFile)(r.pythonPath, args, { cwd: tool.root, timeout: a.timeoutMs, maxBuffer: a.maxOutputBytes,
            encoding: "buffer", killSignal: "SIGKILL", env: { LANG: "C.UTF-8", PYTHONNOUSERSITE: "1", PYTHONDONTWRITEBYTECODE: "1" } });
          stdout = result.stdout;
        } catch { throw new ObservationFailure("tool_failure", "/runEnvironmentResources/access/" + a.accessRef); }
        const durationMs = performance.now() - started, completedAt = new Date().toISOString();
        let output: RunEnvironmentEvidence["accesses"][number]["output"] = null;
        if (a.operation === "validate") output = encoded(await readFile(outputPath));
        const projection = JSON.parse(stdout.toString("utf8")) as Record<string, JsonValue>;
        accesses.push({ accessRef: a.accessRef, command: { executablePath: r.pythonPath, executableDigest: sha256Bytes(pythonBytes), arguments: args, cwd: tool.root },
          bindings, exitCode: 0, stdout: encoded(stdout), output, projection,
          projectionDigest: a.operation === "validate" ? hash(projection) : projection.projection_sha256 as string,
          startedAt, completedAt, durationMs });
      }
    }
    const body = { kind: "run_environment_evidence" as const, schemaVersion: "5.0.0" as const, declaration: d, environmentDigest: hash(d),
      programRef: input.program.programRef, programDigest: hash(input.program), authority: input.authority, resources: r as unknown as JsonValue,
      dependencies, contexts, corpusDocuments, accesses };
    const evidence = { ...body, evidenceDigest: hash(body) };
    if (!isRunEnvironmentEvidence(evidence)) throw new ObservationFailure("invalid_projection", "/runEnvironmentResources/evidence");
    outcome = deepFreeze({ kind: "run_environment_observed", evidence });
  } catch (error) {
    outcome = deepFreeze({ kind: "run_environment_refusal", cause: error instanceof ObservationFailure ? error.cause : "access_unavailable",
      issuePath: error instanceof ObservationFailure ? error.issuePath : "/runEnvironmentResources" });
  }
  try {
    for (const path of temporaryFiles) try { await unlink(path); } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    if (temporaryDirectory !== null) await rmdir(temporaryDirectory);
  } catch { return deepFreeze({ kind: "run_environment_refusal" as const, cause: "access_unavailable" as const, issuePath: "/runEnvironmentResources/temporary-cleanup" }); }
  return outcome;
}
