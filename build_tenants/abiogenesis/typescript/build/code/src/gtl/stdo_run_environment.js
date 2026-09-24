import { SEMANTIC_REVISION_IDS as revision } from "./semantic_revision_identity.js";
import * as v from "valibot";
import { NATIVE_WORKSPACE_WORK_IDS as nativeIds } from "../product/native_workspace_work_identity.js";
import { CONTEXT_DECLARATION_SCHEMA, REQUIREMENT_TERM_SCHEMA } from "./requirement_handoff.js";
import { cLeafTerms } from "./c_algebra.js";
import { sha256Bytes, sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { WORKSITE_CONSTRUCTION_IDS } from "../product/worksite_construction_identity.js";
import { WORKSITE_COMMAND_EXECUTION_IDS } from "../product/worksite_command_execution_identity.js";
import { SEMANTIC_STAGE_IDS } from "./semantic_stage_identity.js";
const ref = v.pipe(v.string(), v.minLength(1));
const digest = v.pipe(v.string(), v.regex(/^sha256:[a-f0-9]{64}$/u));
const bound = v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(16_777_216));
const relativePath = v.pipe(ref, v.check(s => !s.startsWith("/") && !s.split("/").some(x => x === ".." || x === "." || x === "")));
const member = v.strictObject({ path: relativePath, type: v.picklist(["file", "symlink"]),
    digest, target: v.nullable(ref) });
const companion = {
    productRef: ref, releaseRef: ref, tagObject: v.pipe(v.string(), v.regex(/^[a-f0-9]{40}$/u)),
    recordUri: ref, recordDigest: digest, inventoryDigest: digest,
    members: v.pipe(v.array(member), v.minLength(1)),
};
const artifact = v.strictObject({ path: relativePath, uri: ref, byteDigest: digest, canonicalDigest: digest });
export const STDO_RUN_ENVIRONMENT_SCHEMA = v.strictObject({
    kind: v.literal("stdo_run_environment_declaration"), schemaVersion: v.literal("5.0.0"), declarationRef: ref,
    source: v.strictObject({ releaseUri: ref, manifestDigest: digest }),
    representation: v.strictObject({ ...companion, program: artifact, map: artifact }),
    axiom: v.strictObject({ ...companion, executablePath: relativePath, outputContractPath: relativePath,
        outputContractVersion: v.literal("axiom-indexer.frame-projection@1"), pythonExecutableDigest: digest }),
    contexts: v.pipe(v.array(CONTEXT_DECLARATION_SCHEMA), v.minLength(1)),
    accesses: v.pipe(v.array(v.strictObject({ accessRef: ref, operation: v.literal("project"), mode: v.literal("materialized"),
        frameIndexRefs: v.pipe(v.array(ref), v.minLength(1)), maxOutputBytes: bound,
        timeoutMs: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(60_000)) })), v.minLength(1)),
    roles: v.pipe(v.array(v.strictObject({ graphFunctionRef: ref, programLocusRef: ref, role: v.picklist(["author", "assessor", "constructor", "command_executor"]),
        frameRefs: v.pipe(v.array(ref), v.minLength(1)), policy: v.strictObject({ policyRef: ref, text: ref, digest }),
        accessRefs: v.pipe(v.array(ref), v.minLength(1)),
        sourceBindings: REQUIREMENT_TERM_SCHEMA.entries.sourceBindings })), v.minLength(1)),
});
export const STDO_ENVIRONMENT_POLICY = "abg.stdo_run_environment";
const unique = (xs) => new Set(xs).size === xs.length;
const sorted = (xs) => unique(xs) && xs.every((x, i) => i === 0 || xs[i - 1] < x);
const hash = (x) => sha256Canonical(x);
export function stdoInventoryDigest(members) {
    return sha256Bytes(Buffer.from([...members].sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0)
        .map(x => x.digest.slice(7) + "  " + x.type + "  " + x.path + "\n").join(""), "utf8"));
}
export function isStdoRunEnvironmentDeclaration(value) {
    if (!v.is(STDO_RUN_ENVIRONMENT_SCHEMA, value))
        return false;
    const d = value;
    return (d.source.releaseUri === "stdo://releases/v2.5.0-rc.6/" || d.source.releaseUri === "stdo://releases/v2.5.0-rc.7/") &&
        [d.axiom, d.representation].every(c => sorted(c.members.map(m => m.path)) &&
            c.inventoryDigest === stdoInventoryDigest(c.members) &&
            c.members.every(m => m.type === "file" ? m.target === null : m.target !== null)) &&
        [d.representation.program, d.representation.map].every(a => d.representation.members.some(m => m.type === "file" && m.path === a.path && m.digest === a.byteDigest)) &&
        [d.axiom.executablePath, d.axiom.outputContractPath].every(p => d.axiom.members.some(m => m.type === "file" && m.path === p)) &&
        unique(d.contexts.map(c => c.contextRef)) && d.contexts.every(c => c.sourceLocator === d.source.releaseUri &&
        unique(c.members.map(m => m.memberRef)) && unique(c.members.map(m => m.path)) && hash(c.members) === c.inventoryDigest &&
        c.members.every(m => !m.path.startsWith("/") && !m.path.split("/").includes(".."))) &&
        unique(d.accesses.map(a => a.accessRef)) && d.accesses.every(a => sorted(a.frameIndexRefs)) &&
        unique(d.roles.map(r => r.graphFunctionRef + "\0" + r.programLocusRef)) &&
        d.roles.every(r => sorted(r.frameRefs) && unique(r.accessRefs) &&
            r.policy.digest === sha256Bytes(Buffer.from(r.policy.text, "utf8")) &&
            r.accessRefs.every(ref => d.accesses.some(a => a.accessRef === ref)) &&
            r.sourceBindings.every(b => {
                const m = d.contexts.find(c => c.contextRef === b.contextRef)?.members.find(m => m.memberRef === b.memberRef);
                return m !== undefined && m.digest === b.memberDigest && b.startByte < b.endByte && b.endByte <= m.byteCount;
            }));
}
export function constructHistoricalStdoRunEnvironmentDeclaration(value) {
    if (!isStdoRunEnvironmentDeclaration(value))
        throw new TypeError("invalid exact STDO run-environment declaration");
    return deepFreeze(value);
}
export function stdoEnvironmentForProgram(publication, program) {
    const ref = program.policies[STDO_ENVIRONMENT_POLICY];
    if (ref === undefined)
        return null;
    const rows = publication.stdoRunEnvironments?.filter(d => d.declarationRef === ref);
    return rows?.length === 1 && isStdoRunEnvironmentDeclaration(rows[0]) ? rows[0] : false;
}
export function validStdoEnvironmentPublication(publication) {
    const rows = publication.stdoRunEnvironments ?? [];
    return Array.isArray(rows) && unique(rows.map(d => d.declarationRef)) && rows.every(isStdoRunEnvironmentDeclaration) &&
        publication.programs.every(p => stdoEnvironmentForProgram(publication, p) !== false);
}
export function validStdoEnvironmentProgram(publication, program, graphFunctions) {
    const d = stdoEnvironmentForProgram(publication, program);
    if (d === null)
        return true;
    if (d === false)
        return false;
    const functions = graphFunctions.filter(g => program.callableMembership.includes(g.name));
    const leaves = functions.flatMap(g => g.template.nodes.flatMap(n => cLeafTerms(n.term).filter(c => c.fibre === "F_P")
        .map(c => ({ graphFunctionRef: g.name, locus: c.programLocusRef, role: stdoRoleForDeclaredLeaf(g, c) }))));
    return leaves.length > 0 && leaves.length === d.roles.length && leaves.every(l => l.role !== null &&
        d.roles.filter(r => r.graphFunctionRef === l.graphFunctionRef && r.programLocusRef === l.locus &&
            l.role === r.role).length === 1);
}
/** Closed existing leaf classes, not a role interpreter or tool registry. */
export function stdoRoleForDeclaredLeaf(graph, leaf) {
    if (leaf.fibre !== "F_P")
        return null;
    const requirement = leaf.requirement;
    if (requirement.kind !== "executable_leaf_requirement")
        return null;
    if (graph.declarations["abg.semantic_stage"] !== undefined &&
        (leaf.stageRole === "semantic-author" || leaf.stageRole === "semantic-assessor") &&
        requirement.implementationBindingRef === (leaf.stageRole === "semantic-author" ? SEMANTIC_STAGE_IDS.authorBindingRef : SEMANTIC_STAGE_IDS.assessorBindingRef) &&
        requirement.inputContractRef === SEMANTIC_STAGE_IDS.envelopeContractRef && requirement.outputContractRef === SEMANTIC_STAGE_IDS.envelopeContractRef)
        return leaf.stageRole === "semantic-author" ? "author" : "assessor";
    if (graph.declarations["abg.semantic_revision_selection"] !== undefined && leaf.stageRole === "semantic-revision-selection" &&
        requirement.implementationBindingRef === revision.selectionBindingRef && requirement.inputContractRef === revision.selectionInputContractRef &&
        requirement.outputContractRef === revision.selectionContractRef)
        return "assessor";
    if (graph.declarations["abg.semantic_revision_stage"] !== undefined &&
        (leaf.stageRole === "semantic-revision-author" || leaf.stageRole === "semantic-revision-assessor") &&
        requirement.implementationBindingRef === (leaf.stageRole === "semantic-revision-author" ? revision.authorBindingRef : revision.assessorBindingRef) &&
        requirement.inputContractRef === revision.envelopeContractRef && requirement.outputContractRef === revision.envelopeContractRef)
        return leaf.stageRole === "semantic-revision-author" ? "author" : "assessor";
    if (graph.name === nativeIds.assessmentGraphFunctionRef && leaf.stageRole === "native-assessment" &&
        requirement.implementationBindingRef === nativeIds.implementationBindingRef &&
        requirement.inputContractRef === nativeIds.taskContractRef && requirement.outputContractRef === nativeIds.observationContractRef)
        return "assessor";
    if (graph.name === nativeIds.graphFunctionRef && leaf.stageRole === "native-work" &&
        requirement.implementationBindingRef === nativeIds.implementationBindingRef &&
        requirement.inputContractRef === nativeIds.taskContractRef && requirement.outputContractRef === nativeIds.observationContractRef)
        return "constructor";
    if (graph.name === WORKSITE_CONSTRUCTION_IDS.graphFunctionRef && leaf.stageRole === "candidate" &&
        requirement.implementationBindingRef === WORKSITE_CONSTRUCTION_IDS.candidateImplementationBindingRef &&
        requirement.inputContractRef === WORKSITE_CONSTRUCTION_IDS.taskContractRef &&
        requirement.outputContractRef === WORKSITE_CONSTRUCTION_IDS.candidateBundleContractRef)
        return "constructor";
    if (graph.name === WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef && leaf.stageRole === "command-execution" &&
        requirement.implementationBindingRef === WORKSITE_COMMAND_EXECUTION_IDS.implementationBindingRef &&
        requirement.inputContractRef === WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef &&
        requirement.outputContractRef === WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef)
        return "command_executor";
    return null;
}
/** One closed native family shared by publication validation, HoG and assembly. */
export const nativeContextLeafFamily = stdoRoleForDeclaredLeaf;
export const RUN_ENVIRONMENT_POLICY = "abg.run_environment";
export const CONTEXT_SELECTORS = ["full_source", "declared_predecessor_semantics", "active_binding_semantics",
    "current_candidate", "current_worksite", "admitted_execution_evidence", "assessor_evaluation_data", "not_required"];
const dependencySchema = v.strictObject({ dependencyRef: ref, basisRef: ref, recordRef: ref, recordDigest: digest,
    recordFormat: v.picklist(["member_inventory@1", "stdo_source_manifest@1", "release_record@1"]),
    inventoryDigest: digest, members: v.pipe(v.array(member), v.minLength(1)) });
const contextPolicySchema = v.strictObject({ policyRef: ref, selectors: v.pipe(v.array(v.picklist(CONTEXT_SELECTORS)), v.minLength(1)) });
export const RUN_ENVIRONMENT_SCHEMA = v.strictObject({
    kind: v.literal("run_environment_declaration"), schemaVersion: v.literal("5.0.0"), declarationRef: ref,
    dependencies: v.pipe(v.array(dependencySchema), v.minLength(1)),
    contexts: v.pipe(v.array(CONTEXT_DECLARATION_SCHEMA), v.minLength(1)),
    corpusAccess: v.nullable(v.strictObject({ kind: v.literal("axiom_indexer"), sourceDependencyRef: ref,
        representationDependencyRef: ref, axiomDependencyRef: ref, program: artifact, map: artifact,
        executablePath: relativePath, outputContractPath: relativePath, pythonExecutableDigest: digest, pythonVersion: ref })),
    accesses: v.array(v.strictObject({ accessRef: ref, operation: v.picklist(["validate", "project"]),
        mode: v.picklist(["validation", "materialized"]), frameIndexRefs: v.array(ref), maxOutputBytes: bound,
        timeoutMs: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(60_000)) })),
    roles: v.pipe(v.array(v.strictObject({ ...STDO_RUN_ENVIRONMENT_SCHEMA.entries.roles.item.entries,
        accessRefs: v.array(ref), contextPolicy: contextPolicySchema })), v.minLength(1)),
});
export function isRunEnvironmentDeclaration(value) {
    if (!v.is(RUN_ENVIRONMENT_SCHEMA, value))
        return false;
    const d = value, corpus = d.corpusAccess;
    if (!unique(d.dependencies.map(x => x.dependencyRef)) || !unique(d.dependencies.map(x => x.basisRef)) ||
        !d.dependencies.every(x => sorted(x.members.map(m => m.path)) && x.inventoryDigest === stdoInventoryDigest(x.members) &&
            x.members.every(m => m.type === "file" ? m.target === null : m.target !== null)) ||
        !unique(d.contexts.map(c => c.contextRef)) || !d.contexts.every(c => {
        const source = d.dependencies.find(x => x.basisRef === c.sourceLocator);
        return source !== undefined && hash(c.members) === c.inventoryDigest && unique(c.members.map(m => m.memberRef)) &&
            unique(c.members.map(m => m.path)) && c.members.every(m => source.members.some(s => s.path === m.path && s.type === "file" && s.digest === m.digest));
    }) || !unique(d.accesses.map(a => a.accessRef)) ||
        !d.accesses.every(a => a.operation === "validate" ? a.mode === "validation" && a.frameIndexRefs.length === 0
            : a.mode === "materialized" && a.frameIndexRefs.length > 0 && sorted(a.frameIndexRefs)) ||
        (corpus === null) !== (d.accesses.length === 0))
        return false;
    if (corpus !== null) {
        const source = d.dependencies.find(x => x.dependencyRef === corpus.sourceDependencyRef);
        const rep = d.dependencies.find(x => x.dependencyRef === corpus.representationDependencyRef);
        const tool = d.dependencies.find(x => x.dependencyRef === corpus.axiomDependencyRef);
        if (!source || !rep || !tool || ![corpus.program, corpus.map].every(a => rep.members.some(m => m.path === a.path && m.type === "file" && m.digest === a.byteDigest)) ||
            ![corpus.executablePath, corpus.outputContractPath].every(p => tool.members.some(m => m.path === p && m.type === "file")))
            return false;
    }
    return unique(d.roles.map(r => r.graphFunctionRef + "\0" + r.programLocusRef)) && d.roles.every(r => sorted(r.frameRefs) && unique(r.accessRefs) && unique(r.contextPolicy.selectors) &&
        !(r.contextPolicy.selectors.includes("not_required") && r.contextPolicy.selectors.length !== 1) &&
        (r.role === "assessor" || !r.contextPolicy.selectors.includes("assessor_evaluation_data")) &&
        r.policy.digest === sha256Bytes(Buffer.from(r.policy.text, "utf8")) &&
        r.accessRefs.every(a => d.accesses.some(x => x.accessRef === a)) &&
        r.sourceBindings.length > 0 && r.sourceBindings.every(b => {
        const m = d.contexts.find(c => c.contextRef === b.contextRef)?.members.find(m => m.memberRef === b.memberRef);
        return m !== undefined && m.digest === b.memberDigest && b.startByte < b.endByte && b.endByte <= m.byteCount;
    }));
}
export function constructRunEnvironmentDeclaration(value) {
    if (!isRunEnvironmentDeclaration(value))
        throw new TypeError("invalid exact run environment declaration");
    return deepFreeze(value);
}
/** STDO specialization constrains data; generic declarations have no STDO release allowlist. */
export function constructStdoRunEnvironmentDeclaration(value) {
    const d = constructRunEnvironmentDeclaration(value), a = d.corpusAccess;
    if (a === null || !d.dependencies.some(x => x.dependencyRef === a.sourceDependencyRef &&
        /^stdo:\/\/releases\/[^/]+\/$/u.test(x.basisRef) && x.recordFormat === "stdo_source_manifest@1") ||
        ![a.representationDependencyRef, a.axiomDependencyRef].every(ref => d.dependencies.some(x => x.dependencyRef === ref && x.recordFormat === "release_record@1")) ||
        d.roles.some(r => r.accessRefs.length === 0))
        throw new TypeError("STDO requires exact source, companions and actual corpus access");
    return d;
}
export function runEnvironmentForProgram(publication, program) {
    if (program.policies[STDO_ENVIRONMENT_POLICY] !== undefined || publication.stdoRunEnvironments !== undefined)
        return false;
    const ref = program.policies[RUN_ENVIRONMENT_POLICY];
    if (ref === undefined)
        return null;
    const rows = publication.runEnvironments?.filter(d => d.declarationRef === ref);
    return rows?.length === 1 && isRunEnvironmentDeclaration(rows[0]) ? rows[0] : false;
}
export function validRunEnvironmentPublication(publication) {
    const rows = publication.runEnvironments ?? [];
    return publication.stdoRunEnvironments === undefined && unique(rows.map(d => d.declarationRef)) &&
        rows.every(isRunEnvironmentDeclaration) && publication.programs.every(p => runEnvironmentForProgram(publication, p) !== false);
}
export function validRunEnvironmentProgram(publication, program, graphFunctions) {
    const d = runEnvironmentForProgram(publication, program);
    if (d === null)
        return true;
    if (d === false)
        return false;
    const functions = graphFunctions.filter(g => program.callableMembership.includes(g.name));
    const leaves = functions.flatMap(g => g.template.nodes.flatMap(n => cLeafTerms(n.term).filter(c => c.fibre === "F_P")
        .map(c => ({ graphFunctionRef: g.name, locus: c.programLocusRef, role: nativeContextLeafFamily(g, c) }))));
    return leaves.length > 0 && leaves.length === d.roles.length && leaves.every(l => l.role !== null &&
        d.roles.filter(r => r.graphFunctionRef === l.graphFunctionRef && r.programLocusRef === l.locus && l.role === r.role).length === 1);
}
