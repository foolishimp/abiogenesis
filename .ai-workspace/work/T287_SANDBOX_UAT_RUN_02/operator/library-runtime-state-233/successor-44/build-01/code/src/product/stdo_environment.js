import * as v from "valibot";
import { readFile, readdir, lstat, readlink, realpath, mkdtemp, writeFile, unlink, rmdir } from "node:fs/promises";
import { resolve, relative, isAbsolute, join, dirname } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { performance } from "node:perf_hooks";
import { runEnvironmentForProgram, validRunEnvironmentProgram, stdoEnvironmentForProgram, validStdoEnvironmentProgram } from "../gtl/stdo_run_environment.js";
import { isRunEnvironmentEvidence, isStdoEnvironmentEvidence, stdoSourceInventory, stdoRecordInventory } from "../abg/stdo_environment.js";
import { sha256Bytes, sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { isRunEnvironmentDeclaration } from "../gtl/stdo_run_environment.js";
import { WORKSITE_COMMAND_EXECUTION_CONTEXT_INVENTORY } from "../gtl/worksite_command_execution.js";
import { WORKSITE_COMMAND_EXECUTION_IDS } from "./worksite_command_execution_identity.js";
import { parseProductManifest } from "./verify_product.js";
import { modulePublicationSemanticDigest } from "./publication.js";
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
class ObservationFailure extends Error {
    cause;
    issuePath;
    constructor(cause, issuePath) {
        super(cause);
        this.cause = cause;
        this.issuePath = issuePath;
    }
}
const hash = (x) => sha256Canonical(x);
const encoded = (b) => ({ base64: b.toString("base64"), digest: sha256Bytes(b) });
const inside = (root, value) => {
    const r = relative(root, value);
    return r !== "" && !r.startsWith(".." + "/") && r !== ".." && !isAbsolute(r);
};
async function fileAt(root, path) {
    const absolute = resolve(root, path);
    if (!inside(root, absolute) || (await lstat(absolute)).isSymbolicLink() || await realpath(absolute) !== absolute)
        throw new ObservationFailure("identity_mismatch", "/stdoEnvironmentResources/member/" + path);
    return readFile(absolute);
}
async function inventoryPaths(root, prefix = "") {
    const entries = await readdir(join(root, prefix), { withFileTypes: true });
    const result = [];
    for (const entry of entries) {
        const p = prefix === "" ? entry.name : prefix + "/" + entry.name;
        if (entry.isDirectory())
            result.push(...await inventoryPaths(root, p));
        else
            result.push(p);
    }
    return result.sort();
}
async function verifyCompanion(root, d, role, recordPath) {
    const recordBytes = await readFile(recordPath);
    if (sha256Bytes(recordBytes) !== d.recordDigest || hash(stdoRecordInventory(recordBytes.toString("utf8"))) !== hash(d.members) ||
        hash(await inventoryPaths(root)) !== hash(d.members.map(m => m.path).sort()))
        throw new ObservationFailure("identity_mismatch", "/stdoEnvironmentResources/" + role + "/inventory");
    const members = [];
    for (const m of d.members) {
        const p = resolve(root, m.path), stat = await lstat(p);
        if (!inside(root, p))
            throw new ObservationFailure("identity_mismatch", "/stdoEnvironmentResources/" + role + "/path");
        const bytes = m.type === "symlink" && stat.isSymbolicLink() ? Buffer.from(await readlink(p), "utf8")
            : m.type === "file" && stat.isFile() && !stat.isSymbolicLink() ? await fileAt(root, m.path) : null;
        if (bytes === null || sha256Bytes(bytes) !== m.digest || m.type === "symlink" &&
            (bytes.toString("utf8") !== m.target || !inside(root, await realpath(p))))
            throw new ObservationFailure("identity_mismatch", "/stdoEnvironmentResources/" + role + "/" + m.path);
        members.push({ rootRole: role, ...m });
    }
    return { record: { role, ...encoded(recordBytes) }, members };
}
/** Existing Product preparation observes exact declared dependencies. No traversal or semantic judgment. */
export async function observeStdoEnvironment(input) {
    let temporaryDirectory = null;
    let bindingsPath = null;
    let outcome;
    try {
        const d = stdoEnvironmentForProgram(input.publication, input.program);
        if (d === null) {
            if (input.resources !== undefined)
                throw new ObservationFailure("access_not_permitted", "/stdoEnvironmentResources");
            return deepFreeze({ kind: "stdo_environment_observed", evidence: null });
        }
        if (d === false || !validStdoEnvironmentProgram(input.publication, input.program, input.graphFunctions))
            throw new ObservationFailure("unsupported_declaration", "/program/stdoRunEnvironment");
        if (input.resources === undefined)
            throw new ObservationFailure("missing_binding", "/stdoEnvironmentResources");
        if (!v.is(STDO_ENVIRONMENT_RESOURCES_SCHEMA, input.resources))
            throw new ObservationFailure("access_not_permitted", "/stdoEnvironmentResources/permission");
        const r = input.resources, p = r.permission;
        if (p.authorityRef !== input.authority.authorityRef || p.authorityDigest !== input.authority.authorityDigest ||
            p.actorRef !== input.authority.actorRef || p.programRef !== input.program.programRef ||
            p.environmentRef !== d.declarationRef || p.environmentDigest !== hash(d) || hash(p.roots) !== hash(r.roots) ||
            !inside(resolve(input.archiveRoot), resolve(r.roots.temporaryRoot)))
            throw new ObservationFailure("access_not_permitted", "/stdoEnvironmentResources/permission");
        // Permission is checked before filesystem access. Canonical roots prevent hidden aliases.
        const physical = Object.fromEntries(await Promise.all(Object.entries(r.roots).map(async ([k, p]) => [k, await realpath(p)])));
        if (Object.keys(physical).some(k => physical[k] !== r.roots[k]) ||
            !inside(await realpath(input.archiveRoot), physical.temporaryRoot) ||
            [physical.sourceRoot, physical.representationRoot, physical.axiomRoot].some(root => inside(root, physical.temporaryRoot) || root === physical.temporaryRoot))
            throw new ObservationFailure("access_not_permitted", "/stdoEnvironmentResources/roots");
        const sourceManifest = await fileAt(physical.sourceRoot, "manifest.json");
        if (sha256Bytes(sourceManifest) !== d.source.manifestDigest)
            throw new ObservationFailure("identity_mismatch", "/stdoEnvironmentResources/source/manifest");
        const sourceRows = stdoSourceInventory(JSON.parse(sourceManifest.toString("utf8")));
        if (hash(await inventoryPaths(physical.sourceRoot)) !== hash([...sourceRows.map(m => m.path), "manifest.json"].sort()))
            throw new ObservationFailure("identity_mismatch", "/stdoEnvironmentResources/source/inventory");
        const sourceBytes = new Map();
        const observedMembers = [];
        for (const m of sourceRows) {
            const b = await fileAt(physical.sourceRoot, m.path);
            if (sha256Bytes(b) !== m.digest)
                throw new ObservationFailure("identity_mismatch", "/stdoEnvironmentResources/source/" + m.path);
            sourceBytes.set(m.path, b);
            observedMembers.push({ rootRole: "source", path: m.path, type: "file", digest: sha256Bytes(b), target: null });
        }
        const representation = await verifyCompanion(physical.representationRoot, d.representation, "representation", physical.representationRecordPath);
        const axiom = await verifyCompanion(physical.axiomRoot, d.axiom, "axiom", physical.axiomRecordPath);
        observedMembers.push(...representation.members, ...axiom.members);
        const pythonBytes = await readFile(physical.pythonPath);
        if (sha256Bytes(pythonBytes) !== d.axiom.pythonExecutableDigest)
            throw new ObservationFailure("identity_mismatch", "/stdoEnvironmentResources/python");
        const programPath = join(physical.representationRoot, d.representation.program.path), mapPath = join(physical.representationRoot, d.representation.map.path);
        const program = JSON.parse((await readFile(programPath)).toString("utf8")), map = JSON.parse((await readFile(mapPath)).toString("utf8"));
        const { map_sha256, ...mapBody } = map;
        if (hash(program) !== d.representation.program.canonicalDigest || hash(mapBody) !== d.representation.map.canonicalDigest ||
            map_sha256 !== d.representation.map.canonicalDigest || map.program_uri !== d.representation.program.uri ||
            map.program_sha256 !== d.representation.program.canonicalDigest ||
            d.accesses.some(a => a.frameIndexRefs.some(ref => !Object.hasOwn(map.frame_indexes ?? {}, ref))) ||
            d.roles.some(r => r.frameRefs.some(ref => !program.frame_refs.includes(ref))))
            throw new ObservationFailure("identity_mismatch", "/stdoEnvironmentResources/program-map-selection");
        const contexts = d.contexts.map(c => ({ contextRef: c.contextRef, members: c.members.map(m => {
                const b = sourceBytes.get(m.path);
                if (!b || b.length !== m.byteCount || sha256Bytes(b) !== m.digest)
                    throw new ObservationFailure("identity_mismatch", "/stdoEnvironmentResources/context/" + m.memberRef);
                return { memberRef: m.memberRef, path: m.path, ...encoded(b) };
            }) }));
        for (const r of d.roles)
            for (const b of r.sourceBindings) {
                const member = d.contexts.find(c => c.contextRef === b.contextRef).members.find(m => m.memberRef === b.memberRef);
                if (sha256Bytes(sourceBytes.get(member.path).subarray(b.startByte, b.endByte)) !== b.spanDigest)
                    throw new ObservationFailure("identity_mismatch", "/stdoEnvironmentResources/source-span");
            }
        const bindings = { kind: "axiom-indexer.binding-set", schema_version: 1, bindings: [{ uri_prefix: d.source.releaseUri, path: physical.sourceRoot }] };
        temporaryDirectory = await mkdtemp(join(physical.temporaryRoot, "stdo-bindings-"));
        bindingsPath = join(temporaryDirectory, "bindings.json");
        await writeFile(bindingsPath, JSON.stringify(bindings), "utf8");
        const accesses = [];
        for (const a of d.accesses) {
            const args = [join(physical.axiomRoot, d.axiom.executablePath), "project", "--program", programPath, "--map", mapPath, "--bindings", bindingsPath,
                ...a.frameIndexRefs.flatMap(ref => ["--frame-index", ref]), "--mode", a.mode];
            const startedAt = new Date().toISOString(), started = performance.now();
            let stdout;
            try {
                const result = await promisify(execFile)(physical.pythonPath, args, { cwd: physical.axiomRoot, timeout: a.timeoutMs, maxBuffer: a.maxOutputBytes,
                    encoding: "buffer", killSignal: "SIGKILL", env: { LANG: "C.UTF-8", PYTHONNOUSERSITE: "1", PYTHONDONTWRITEBYTECODE: "1" } });
                stdout = result.stdout;
            }
            catch (error) {
                const e = error;
                throw new ObservationFailure(e.code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER" ? "declared_bound_overflow" : "tool_failure", "/stdoEnvironmentResources/access/" + a.accessRef);
            }
            const durationMs = performance.now() - started, completedAt = new Date().toISOString();
            let projection;
            try {
                projection = JSON.parse(stdout.toString("utf8"));
            }
            catch {
                throw new ObservationFailure("invalid_projection", "/stdoEnvironmentResources/access/" + a.accessRef);
            }
            const projectionDigest = projection.projection_sha256;
            accesses.push({ accessRef: a.accessRef, command: { executablePath: physical.pythonPath, executableDigest: sha256Bytes(pythonBytes), arguments: args, cwd: physical.axiomRoot },
                bindings, exitCode: 0, stdout: encoded(stdout), projection, projectionDigest, startedAt, completedAt, durationMs });
        }
        const body = { kind: "stdo_environment_evidence", schemaVersion: "5.0.0", declaration: d, environmentDigest: hash(d),
            programRef: input.program.programRef, programDigest: hash(input.program), authority: input.authority, resources: r,
            sourceManifest: encoded(sourceManifest), records: [representation.record, axiom.record], observedMembers, contexts, accesses };
        const evidence = { ...body, evidenceDigest: hash(body) };
        if (!isStdoEnvironmentEvidence(evidence))
            throw new ObservationFailure("invalid_projection", "/stdoEnvironmentResources/evidence");
        outcome = deepFreeze({ kind: "stdo_environment_observed", evidence });
    }
    catch (error) {
        outcome = deepFreeze({ kind: "stdo_environment_refusal", cause: error instanceof ObservationFailure ? error.cause : "access_unavailable",
            issuePath: error instanceof ObservationFailure ? error.issuePath : "/stdoEnvironmentResources" });
    }
    try {
        if (bindingsPath !== null)
            await unlink(bindingsPath);
        if (temporaryDirectory !== null)
            await rmdir(temporaryDirectory);
    }
    catch {
        return deepFreeze({ kind: "stdo_environment_refusal", cause: "access_unavailable", issuePath: "/stdoEnvironmentResources/temporary-cleanup" });
    }
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
export function constructRunEnvironmentResources(value) {
    if (!v.is(RUN_ENVIRONMENT_RESOURCES_SCHEMA, value))
        throw new TypeError("invalid run environment resource assertion");
    return deepFreeze(value);
}
/** Exact record syntax adaptation only; no frame selection or constitutional interpretation. */
export function runEnvironmentRecordMembers(format, bytes) {
    const text = Buffer.from(bytes).toString("utf8");
    if (format === "release_record@1")
        return stdoRecordInventory(text);
    if (format === "stdo_source_manifest@1")
        return stdoSourceInventory(JSON.parse(text)).map(m => ({
            ...m, type: "file", target: null
        })).sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
    const record = JSON.parse(text);
    if (record.kind !== "run_environment_member_inventory" || record.schemaVersion !== "5.0.0" || !Array.isArray(record.members))
        throw new TypeError("invalid generic member inventory");
    return record.members;
}
function checkRunEnvironmentRecord(dependency, bytes) {
    if (sha256Bytes(bytes) !== dependency.recordDigest ||
        hash(runEnvironmentRecordMembers(dependency.recordFormat, bytes)) !== hash(dependency.members))
        throw new ObservationFailure("identity_mismatch", "/runEnvironmentResources/dependencies/" + dependency.dependencyRef + "/record");
}
function checkRunEnvironmentMember(member, bytes) {
    if (bytes.length !== member.byteCount || sha256Bytes(bytes) !== member.digest)
        throw new ObservationFailure("identity_mismatch", "/runEnvironmentResources/context/" + member.memberRef);
}
function checkedRunEnvironmentSpan(binding, bytes) {
    if (binding.startByte < 0 || binding.startByte >= binding.endByte || binding.endByte > bytes.length ||
        sha256Bytes(bytes.subarray(binding.startByte, binding.endByte)) !== binding.spanDigest)
        throw new ObservationFailure("identity_mismatch", "/runEnvironmentResources/sourceBinding/" + binding.memberRef);
    return bytes.subarray(binding.startByte, binding.endByte);
}
/** @internal Existing C2 material relation, consumed only by the private
 * declaration comparison. Actual admitted installs are supplied by ABG; this
 * function independently reads both installed materials and returns only a
 * transient consumed meaning. It grants no install, source or receipt authority. */
export function compareInstalledC2ContextMaterial(historical, current, historicalInstall, currentInstall) {
    try {
        const acquire = (publication, install) => {
            if (publication.moduleRef !== "module://abiogenesis/worksite/command-execution@5" ||
                install.kind !== "product_install" || install.disposition !== "admitted" || !install.admissionEventRef ||
                install.productId !== publication.owningProductId || install.artifactDigest !== publication.artifactDigest ||
                install.productContentDigest !== publication.productContentDigest || install.manifestDigest !== publication.productManifestDigest ||
                !isAbsolute(install.installedRoot) || realpathSync(install.installedRoot) !== install.installedRoot)
                throw new TypeError("C2 Context lacks its exact actual installed owner");
            const file = (memberPath) => {
                const absolute = resolve(install.installedRoot, memberPath), stat = lstatSync(absolute);
                if (!inside(install.installedRoot, absolute) || !stat.isFile() || stat.isSymbolicLink() || realpathSync(absolute) !== absolute)
                    throw new TypeError("C2 Context material is not its canonical installed file");
                return readFileSync(absolute);
            };
            const manifestBytes = file("product-toolchain-manifest.json");
            const manifest = parseProductManifest(JSON.parse(new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(manifestBytes)));
            if (manifest === null || hash(manifest) !== install.manifestDigest || manifest.productId !== install.productId ||
                manifest.packageName !== install.packageName || manifest.packageVersion !== install.packageVersion ||
                manifest.productContentDigest !== install.productContentDigest || manifest.descriptorRef !== install.descriptorRef ||
                manifest.contributionManifestRef !== install.contributionManifestRef ||
                manifest.contributionManifestDigest !== install.contributionManifestDigest)
                throw new TypeError("C2 Context installed manifest differs from its admitted identity");
            const bindings = manifest.contributionManifest.publicationBindings.filter(row => row.moduleRef === publication.moduleRef);
            if (bindings.length !== 1 || bindings[0].publicationDigest !== modulePublicationSemanticDigest(publication))
                throw new TypeError("C2 Context declaration differs from its installed publication");
            const environments = publication.runEnvironments ?? [];
            if (environments.length !== 1 || !isRunEnvironmentDeclaration(environments[0]))
                throw new TypeError("C2 Context has no unique complete declaration");
            const environment = environments[0];
            if (environment.corpusAccess !== null || environment.accesses.length !== 0 || environment.dependencies.length !== 1 ||
                environment.contexts.length !== 1 || environment.roles.length !== 1)
                throw new TypeError("C2 Context has unproved consumption");
            const dependency = environment.dependencies[0], context = environment.contexts[0], role = environment.roles[0];
            if (dependency.recordFormat !== "member_inventory@1" || dependency.members.length !== 1 || context.members.length !== 1 ||
                role.graphFunctionRef !== WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef || role.programLocusRef !== WORKSITE_COMMAND_EXECUTION_IDS.nodeRef ||
                role.role !== "command_executor" || role.accessRefs.length !== 0 || role.sourceBindings.length !== 1 ||
                role.contextPolicy.selectors.includes("full_source"))
                throw new TypeError("C2 Context is not the declared renderer-only consumption");
            const member = context.members[0], binding = role.sourceBindings[0], recordPath = WORKSITE_COMMAND_EXECUTION_CONTEXT_INVENTORY.path;
            if (manifest.productRelativeLocators.filter(path => path === recordPath).length !== 1 ||
                manifest.productRelativeLocators.filter(path => path === member.path).length !== 1)
                throw new TypeError("C2 Context material is outside its installed inventory");
            checkRunEnvironmentRecord(dependency, file(recordPath));
            const memberBytes = file(member.path);
            checkRunEnvironmentMember(member, memberBytes);
            const span = checkedRunEnvironmentSpan(binding, memberBytes);
            if (span.length === memberBytes.length || !span.equals(Buffer.from(role.policy.text, "utf8")))
                throw new TypeError("C2 Context consumption is not its complete identified renderer span");
            // The value is private comparison meaning, never a rewritten declaration.
            const { recordDigest: _recordDigest, inventoryDigest: _dependencyInventory, members, ...dependencyMeaning } = dependency;
            const { inventoryDigest: _contextInventory, members: contextMembers, ...contextMeaning } = context;
            const { memberDigest: _memberDigest, startByte: _startByte, endByte: _endByte, ...bindingMeaning } = binding;
            const meaning = { ...environment,
                dependencies: [{ ...dependencyMeaning, members: members.map(({ digest: _digest, ...member }) => member) }],
                contexts: [{ ...contextMeaning, members: contextMembers.map(({ digest: _digest, byteCount: _byteCount, ...member }) => member) }],
                roles: [{ ...role, sourceBindings: [{ ...bindingMeaning, consumedByteCount: span.length, consumedSource: span.toString("base64") }] }],
            };
            return { span, meaning };
        };
        const old = acquire(historical, historicalInstall), next = acquire(current, currentInstall);
        return old.span.equals(next.span) && hash(old.meaning) === hash(next.meaning) ? old.meaning : null;
    }
    catch {
        return null;
    }
}
export async function observeRunEnvironment(input) {
    let temporaryDirectory = null;
    const temporaryFiles = [];
    let outcome;
    try {
        const d = runEnvironmentForProgram(input.publication, input.program);
        if (d === null) {
            if (input.resources !== undefined)
                throw new ObservationFailure("access_not_permitted", "/runEnvironmentResources");
            return deepFreeze({ kind: "run_environment_observed", evidence: null });
        }
        if (d === false || !validRunEnvironmentProgram(input.publication, input.program, input.graphFunctions))
            throw new ObservationFailure("unsupported_declaration", "/program/runEnvironment");
        if (input.resources === undefined)
            throw new ObservationFailure("missing_binding", "/runEnvironmentResources");
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
            if (await realpath(x) !== x)
                throw new ObservationFailure("access_not_permitted", "/runEnvironmentResources/canonical-path");
        if (!inside(await realpath(input.archiveRoot), r.temporaryRoot) || r.dependencies.some(x => x.root === r.temporaryRoot || inside(x.root, r.temporaryRoot)))
            throw new ObservationFailure("access_not_permitted", "/runEnvironmentResources/temporaryRoot");
        const dependencies = [];
        const observedBytes = new Map();
        for (const dep of d.dependencies) {
            const physical = r.dependencies.find(x => x.dependencyRef === dep.dependencyRef);
            const recordBytes = await readFile(physical.recordPath);
            checkRunEnvironmentRecord(dep, recordBytes);
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
            const dep = d.dependencies.find(x => x.basisRef === c.sourceLocator);
            return { contextRef: c.contextRef, members: c.members.map(m => {
                    const b = observedBytes.get(dep.dependencyRef + "\0" + m.path);
                    checkRunEnvironmentMember(m, b);
                    return { memberRef: m.memberRef, path: m.path, ...encoded(b) };
                }) };
        });
        for (const role of d.roles)
            for (const binding of role.sourceBindings) {
                const row = contexts.find(c => c.contextRef === binding.contextRef).members.find(m => m.memberRef === binding.memberRef);
                checkedRunEnvironmentSpan(binding, Buffer.from(row.base64, "base64"));
            }
        let corpusDocuments = null;
        const accesses = [], corpus = d.corpusAccess;
        if (corpus === null) {
            if (r.pythonPath !== null)
                throw new ObservationFailure("access_not_permitted", "/runEnvironmentResources/pythonPath");
        }
        else {
            if (r.pythonPath === null)
                throw new ObservationFailure("missing_binding", "/runEnvironmentResources/pythonPath");
            const pythonBytes = await readFile(r.pythonPath);
            if (sha256Bytes(pythonBytes) !== corpus.pythonExecutableDigest)
                throw new ObservationFailure("identity_mismatch", "/runEnvironmentResources/pythonPath");
            const version = await promisify(execFile)(r.pythonPath, ["--version"], { timeout: 5000, maxBuffer: 4096, env: { LANG: "C.UTF-8", PYTHONNOUSERSITE: "1" } });
            if (version.stdout.trim() !== corpus.pythonVersion)
                throw new ObservationFailure("identity_mismatch", "/runEnvironmentResources/pythonVersion");
            const rep = r.dependencies.find(x => x.dependencyRef === corpus.representationDependencyRef);
            const tool = r.dependencies.find(x => x.dependencyRef === corpus.axiomDependencyRef);
            const programBytes = observedBytes.get(corpus.representationDependencyRef + "\0" + corpus.program.path);
            const mapBytes = observedBytes.get(corpus.representationDependencyRef + "\0" + corpus.map.path);
            corpusDocuments = { program: encoded(programBytes), map: encoded(mapBytes), pythonRuntime: {
                    executablePath: r.pythonPath, executableDigest: sha256Bytes(pythonBytes), reportedVersion: version.stdout.trim()
                } };
            const bindings = { kind: "axiom-indexer.binding-set", schema_version: 1,
                bindings: d.dependencies.map(dep => ({ uri_prefix: dep.basisRef, path: r.dependencies.find(x => x.dependencyRef === dep.dependencyRef).root })) };
            temporaryDirectory = await mkdtemp(join(r.temporaryRoot, "run-environment-"));
            const bindingsPath = join(temporaryDirectory, "bindings.json");
            await writeFile(bindingsPath, JSON.stringify(bindings), "utf8");
            temporaryFiles.push(bindingsPath);
            for (const [ordinal, a] of d.accesses.entries()) {
                const outputPath = join(temporaryDirectory, `map-${ordinal}.json`);
                if (a.operation === "validate")
                    temporaryFiles.push(outputPath);
                const args = [join(tool.root, corpus.executablePath), a.operation, "--program", join(rep.root, corpus.program.path),
                    ...(a.operation === "validate" ? ["--bindings", bindingsPath, "--emit-map", outputPath]
                        : ["--map", join(rep.root, corpus.map.path), "--bindings", bindingsPath, ...a.frameIndexRefs.flatMap(ref => ["--frame-index", ref]), "--mode", a.mode])];
                const startedAt = new Date().toISOString(), started = performance.now();
                let stdout;
                try {
                    const result = await promisify(execFile)(r.pythonPath, args, { cwd: tool.root, timeout: a.timeoutMs, maxBuffer: a.maxOutputBytes,
                        encoding: "buffer", killSignal: "SIGKILL", env: { LANG: "C.UTF-8", PYTHONNOUSERSITE: "1", PYTHONDONTWRITEBYTECODE: "1" } });
                    stdout = result.stdout;
                }
                catch {
                    throw new ObservationFailure("tool_failure", "/runEnvironmentResources/access/" + a.accessRef);
                }
                const durationMs = performance.now() - started, completedAt = new Date().toISOString();
                let output = null;
                if (a.operation === "validate")
                    output = encoded(await readFile(outputPath));
                const projection = JSON.parse(stdout.toString("utf8"));
                accesses.push({ accessRef: a.accessRef, command: { executablePath: r.pythonPath, executableDigest: sha256Bytes(pythonBytes), arguments: args, cwd: tool.root },
                    bindings, exitCode: 0, stdout: encoded(stdout), output, projection,
                    projectionDigest: a.operation === "validate" ? hash(projection) : projection.projection_sha256,
                    startedAt, completedAt, durationMs });
            }
        }
        const body = { kind: "run_environment_evidence", schemaVersion: "5.0.0", declaration: d, environmentDigest: hash(d),
            programRef: input.program.programRef, programDigest: hash(input.program), authority: input.authority, resources: r,
            dependencies, contexts, corpusDocuments, accesses };
        const evidence = { ...body, evidenceDigest: hash(body) };
        if (!isRunEnvironmentEvidence(evidence))
            throw new ObservationFailure("invalid_projection", "/runEnvironmentResources/evidence");
        outcome = deepFreeze({ kind: "run_environment_observed", evidence });
    }
    catch (error) {
        outcome = deepFreeze({ kind: "run_environment_refusal", cause: error instanceof ObservationFailure ? error.cause : "access_unavailable",
            issuePath: error instanceof ObservationFailure ? error.issuePath : "/runEnvironmentResources" });
    }
    try {
        for (const path of temporaryFiles)
            try {
                await unlink(path);
            }
            catch (error) {
                if (error.code !== "ENOENT")
                    throw error;
            }
        if (temporaryDirectory !== null)
            await rmdir(temporaryDirectory);
    }
    catch {
        return deepFreeze({ kind: "run_environment_refusal", cause: "access_unavailable", issuePath: "/runEnvironmentResources/temporary-cleanup" });
    }
    return outcome;
}
