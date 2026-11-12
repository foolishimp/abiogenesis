import { governanceRef, governanceContract } from "../product/default_library_identity.js";
import { SEMANTIC_REVISION_IDS as revision } from "./semantic_revision_identity.js";
import * as v from "valibot";
import { digestSchema } from "../shared/public_function_contracts.js";
import { NATIVE_WORKSPACE_WORK_IDS as nativeIds } from "../product/native_workspace_work_identity.js";
import type { ModulePublication, GtlProgram, GraphFunction } from "./contracts.js";
import { CONTEXT_DECLARATION_SCHEMA, REQUIREMENT_TERM_SCHEMA } from "./requirement_handoff.js";
import { cLeafTerms } from "./c_algebra.js";
import { sha256Bytes, sha256Canonical } from "../shared/digests.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { WORKSITE_CONSTRUCTION_IDS } from "../product/worksite_construction_identity.js";
import { WORKSITE_COMMAND_EXECUTION_IDS } from "../product/worksite_command_execution_identity.js";
import { SEMANTIC_STAGE_IDS } from "./semantic_stage_identity.js";
import { registeredSelectionAtSource } from "./registered_selection.js";
import { rootCSourcePath } from "./source_path.js";

const ref = v.pipe(v.string(), v.minLength(1));
// Reuse the canonical predicate while preserving this owner's string carrier.
const digest = digestSchema as v.GenericSchema<string, string>;
const bound = v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(16_777_216));
// Nonempty slash-separated segments other than exactly '.' or '..'. Negated
// slash classes retain line breaks; the absolute end check avoids '$' accepting
// an earlier boundary before a final line break.
const relativePath = v.pipe(ref, v.regex(/^(?!\.{1,2}(?:\/|(?![\s\S])))[^/]+(?:\/(?!\.{1,2}(?:\/|(?![\s\S])))[^/]+)*(?![\s\S])/));
const member = v.strictObject({ path: relativePath, type: v.picklist(["file", "symlink"]),
  digest, target: v.nullable(ref) });
const artifact = v.strictObject({ path: relativePath, uri: ref, byteDigest: digest, canonicalDigest: digest });
export const STDO_ENVIRONMENT_POLICY = "abg.stdo_run_environment";
// Program policy keys the Product does not admit. A Program that names one has
// no valid run environment, so every door that validates the Program refuses it.
const REFUSED_PROGRAM_POLICIES = [STDO_ENVIRONMENT_POLICY, "abg.governed_context", "abg.governed_context.activation"] as const;
const namesRefusedPolicy = (program: Readonly<GtlProgram>) => REFUSED_PROGRAM_POLICIES.some(key => program.policies[key] !== undefined);
const unique = (xs: readonly string[]) => new Set(xs).size === xs.length;
const sorted = (xs: readonly string[]) => unique(xs) && xs.every((x, i) => i === 0 || xs[i - 1]! < x);
const hash = (x: JsonValue) => sha256Canonical(x);
export function stdoInventoryDigest(members: RunEnvironmentDeclaration["dependencies"][number]["members"]) {
  return sha256Bytes(Buffer.from([...members].sort((a,b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0)
    .map(x => x.digest.slice(7) + "  " + x.type + "  " + x.path + "\n").join(""), "utf8"));
}

/** Closed existing leaf classes, not a role interpreter or tool registry. */
export function stdoRoleForDeclaredLeaf(graph: Readonly<GraphFunction>, leaf: ReturnType<typeof cLeafTerms>[number]):
  Exclude<RunEnvironmentRole["role"], "selector"> | null {
  if (leaf.fibre !== "F_P") return null;
  const requirement = leaf.requirement;
  if (requirement.kind !== "executable_leaf_requirement") return null;
  if (graph.declarations["abg.semantic_stage"] !== undefined &&
    (leaf.stageRole === "semantic-author" || leaf.stageRole === "semantic-assessor") &&
    requirement.implementationBindingRef === (leaf.stageRole === "semantic-author" ? SEMANTIC_STAGE_IDS.authorBindingRef : SEMANTIC_STAGE_IDS.assessorBindingRef) &&
    requirement.inputContractRef === SEMANTIC_STAGE_IDS.envelopeContractRef && requirement.outputContractRef === SEMANTIC_STAGE_IDS.envelopeContractRef)
    return leaf.stageRole === "semantic-author" ? "author" : "assessor";
  if (graph.declarations["abg.semantic_revision_selection"] !== undefined && leaf.stageRole === "semantic-revision-selection" &&
    requirement.implementationBindingRef === revision.selectionBindingRef && requirement.inputContractRef === revision.selectionInputContractRef &&
    requirement.outputContractRef === revision.selectionContractRef) return "assessor";
  if (graph.declarations["abg.semantic_revision_stage"] !== undefined &&
    (leaf.stageRole === "semantic-revision-author" || leaf.stageRole === "semantic-revision-assessor") &&
    requirement.implementationBindingRef === (leaf.stageRole === "semantic-revision-author" ? revision.authorBindingRef : revision.assessorBindingRef) &&
    requirement.inputContractRef === revision.envelopeContractRef && requirement.outputContractRef === revision.envelopeContractRef)
    return leaf.stageRole === "semantic-revision-author" ? "author" : "assessor";
  if (graph.name === nativeIds.assessmentGraphFunctionRef && leaf.stageRole === "native-assessment" &&
    requirement.implementationBindingRef === nativeIds.implementationBindingRef &&
    requirement.inputContractRef === nativeIds.taskContractRef && requirement.outputContractRef === nativeIds.observationContractRef) return "assessor";
  if (graph.name === nativeIds.graphFunctionRef && leaf.stageRole === "native-work" &&
    requirement.implementationBindingRef === nativeIds.implementationBindingRef &&
    requirement.inputContractRef === nativeIds.taskContractRef && requirement.outputContractRef === nativeIds.observationContractRef) return "constructor";
  if (graph.name === WORKSITE_CONSTRUCTION_IDS.graphFunctionRef && leaf.stageRole === "candidate" &&
    requirement.implementationBindingRef === WORKSITE_CONSTRUCTION_IDS.candidateImplementationBindingRef &&
    requirement.inputContractRef === WORKSITE_CONSTRUCTION_IDS.taskContractRef &&
    requirement.outputContractRef === WORKSITE_CONSTRUCTION_IDS.candidateBundleContractRef) return "constructor";
  if (graph.name === WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef && leaf.stageRole === "command-execution" &&
    requirement.implementationBindingRef === WORKSITE_COMMAND_EXECUTION_IDS.implementationBindingRef &&
    requirement.inputContractRef === WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef &&
    requirement.outputContractRef === WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef) return "command_executor";
  return null;
}

/** One declared native family shared by publication validation, HoG and assembly.
 * A framed-synthesis evaluate leaf is a selector; every other leaf takes its
 * closed class from `stdoRoleForDeclaredLeaf`, or null. */
export function nativeContextLeafFamily(graph: Readonly<GraphFunction>, leaf: ReturnType<typeof cLeafTerms>[number]):
  RunEnvironmentRole["role"] | null {
  try {
  const synthesis = framedSynthesisAtLocus(graph, leaf.programLocusRef);
  if (synthesis !== null) return synthesis === false ? null : "selector";
  return stdoRoleForDeclaredLeaf(graph, leaf);
  } catch { return null; }
}
export const RUN_ENVIRONMENT_POLICY = "abg.run_environment";
export const CONTEXT_SELECTORS = ["full_source", "declared_predecessor_semantics", "active_binding_semantics",
  "current_candidate", "current_worksite", "admitted_execution_evidence", "assessor_evaluation_data", "not_required"] as const;
const dependencySchema = v.strictObject({ dependencyRef: ref, basisRef: ref, recordRef: ref, recordDigest: digest,
  recordFormat: v.picklist(["member_inventory@1", "stdo_source_manifest@1", "release_record@1"]),
  inventoryDigest: digest, members: v.pipe(v.array(member), v.minLength(1)) });
const contextPolicySchema = v.strictObject({ policyRef: ref, selectors: v.pipe(v.array(v.picklist(CONTEXT_SELECTORS)), v.minLength(1)) });
// Role entries in their declared order; the schema below overrides `role` and
// `accessRefs` in place with the run environment's own law.
const roleEntries = { graphFunctionRef: ref, programLocusRef: ref, role: v.picklist(["author", "assessor", "constructor", "command_executor"]),
  frameRefs: v.pipe(v.array(ref), v.minLength(1)), policy: v.strictObject({ policyRef: ref, text: ref, digest }),
  accessRefs: v.pipe(v.array(ref), v.minLength(1)),
  sourceBindings: REQUIREMENT_TERM_SCHEMA.entries.sourceBindings };
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
  roles: v.pipe(v.array(v.strictObject({ ...roleEntries,
    role: v.picklist(["author", "assessor", "constructor", "command_executor", "selector"]),
    accessRefs: v.array(ref), contextPolicy: contextPolicySchema })), v.minLength(1)),
});
export type RunEnvironmentDeclaration = v.InferOutput<typeof RUN_ENVIRONMENT_SCHEMA>;
export type RunEnvironmentRole = RunEnvironmentDeclaration["roles"][number];
export function isRunEnvironmentDeclaration(value: unknown): value is RunEnvironmentDeclaration {
  if (!v.is(RUN_ENVIRONMENT_SCHEMA, value)) return false;
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
    (corpus === null) !== (d.accesses.length === 0)) return false;
  if (corpus !== null) {
    const source = d.dependencies.find(x => x.dependencyRef === corpus.sourceDependencyRef);
    const rep = d.dependencies.find(x => x.dependencyRef === corpus.representationDependencyRef);
    const tool = d.dependencies.find(x => x.dependencyRef === corpus.axiomDependencyRef);
    if (!source || !rep || !tool || ![corpus.program, corpus.map].every(a => rep.members.some(m => m.path === a.path && m.type === "file" && m.digest === a.byteDigest)) ||
      ![corpus.executablePath, corpus.outputContractPath].every(p => tool.members.some(m => m.path === p && m.type === "file"))) return false;
  }
  return unique(d.roles.map(r => r.graphFunctionRef + "\0" + r.programLocusRef)) && d.roles.every(r =>
    sorted(r.frameRefs) && unique(r.accessRefs) && unique(r.contextPolicy.selectors) &&
    !(r.contextPolicy.selectors.includes("not_required") && r.contextPolicy.selectors.length !== 1) &&
    (r.role === "assessor" || !r.contextPolicy.selectors.includes("assessor_evaluation_data")) &&
    r.policy.digest === sha256Bytes(Buffer.from(r.policy.text, "utf8")) &&
    r.accessRefs.every(a => d.accesses.some(x => x.accessRef === a)) &&
    r.sourceBindings.length > 0 && r.sourceBindings.every(b => {
      const m = d.contexts.find(c => c.contextRef === b.contextRef)?.members.find(m => m.memberRef === b.memberRef);
      return m !== undefined && m.digest === b.memberDigest && b.startByte < b.endByte && b.endByte <= m.byteCount;
    }));
}
export function constructRunEnvironmentDeclaration(value: RunEnvironmentDeclaration): Readonly<RunEnvironmentDeclaration> {
  if (!isRunEnvironmentDeclaration(value)) throw new TypeError("invalid exact run environment declaration");
  return deepFreeze(value);
}
/** STDO specialization constrains data; generic declarations have no STDO release allowlist. */
export function constructStdoRunEnvironmentDeclaration(value: RunEnvironmentDeclaration): Readonly<RunEnvironmentDeclaration> {
  const d = constructRunEnvironmentDeclaration(value), a = d.corpusAccess;
  const sources = d.dependencies.filter(x =>
    /^stdo:\/\/releases\/[^/]+\/$/u.test(x.basisRef) && x.recordFormat === "stdo_source_manifest@1");
  if (sources.length === 0 || d.roles.some(r => !r.sourceBindings.some(b => {
    const context = d.contexts.find(c => c.contextRef === b.contextRef);
    return sources.some(source => source.basisRef === context?.sourceLocator);
  })) || (a !== null && (
    !sources.some(x => x.dependencyRef === a.sourceDependencyRef) ||
    ![a.representationDependencyRef, a.axiomDependencyRef].every(ref => d.dependencies.some(x => x.dependencyRef === ref && x.recordFormat === "release_record@1")) ||
    d.roles.some(r => r.accessRefs.length === 0)))) throw new TypeError("STDO requires exact source, native source material for every role, and every explicitly selected corpus dependency and access");
  return d;
}
export function runEnvironmentForProgram(publication: Readonly<ModulePublication>, program: Readonly<GtlProgram>) {
  if (namesRefusedPolicy(program)) return false;
  const ref = program.policies[RUN_ENVIRONMENT_POLICY];
  if (ref === undefined) return null;
  const rows = publication.runEnvironments?.filter(d => d.declarationRef === ref);
  return rows?.length === 1 && isRunEnvironmentDeclaration(rows[0]) ? rows[0]! : false;
}
/** Bounded lookup of declarations already authenticated at acquisition. */
function selectorRoleFromBoundDeclarations(publication: Readonly<ModulePublication> | undefined,
  programRef: string, graphFunctionRef: string, programLocusRef: string): Readonly<RunEnvironmentRole> | null | false {
  const programs = publication?.programs.filter(p => p.programRef === programRef);
  if (publication === undefined || programs?.length !== 1) return false;
  const program = programs[0]!;
  if (namesRefusedPolicy(program)) return false;
  const environmentRef = program.policies[RUN_ENVIRONMENT_POLICY];
  if (environmentRef === undefined) return null;
  const environments = publication.runEnvironments?.filter(d => d.declarationRef === environmentRef);
  if (environments?.length !== 1 || !program.callableMembership.includes(graphFunctionRef)) return false;
  const roles = environments[0]!.roles.filter(r => r.graphFunctionRef === graphFunctionRef && r.programLocusRef === programLocusRef);
  return roles.length === 1 && roles[0]!.role === "selector" ? roles[0]! : false;
}
/** Narrow library profile: applicability precedes payload inspection. */
export function framedSynthesisAtLocus(graph: Readonly<GraphFunction>, locus: string) {
  const selected = graph.declarations["abg.framed_synthesis_locus"];
  if (selected === undefined || selected !== locus) return null;
  const nodes = graph.template.nodes.filter(n => n.term.kind === "c_of" && n.term.programLocusRef === locus);
  const projectionLocus = graph.declarations["abg.framed_synthesis_projection"];
  const projections = graph.template.nodes.filter(n => n.term.kind === "c_of" && n.term.programLocusRef === projectionLocus);
  if (nodes.length !== 1 || projections.length !== 1) return false;
  const node = nodes[0]!, projection = projections[0]!, leaf = node.term, target = projection.term;
  if (leaf.kind !== "c_of" || leaf.fibre !== "F_P" || leaf.stageRole !== "evaluate" || leaf.requirement.kind !== "executable_leaf_requirement" ||
    leaf.requirement.implementationBindingRef !== governanceRef("binding", "select") || leaf.inputCarrierRef !== governanceContract("selection-task") ||
    leaf.outputCarrierRef !== governanceContract("synthesis") || target.kind !== "c_of" || target.fibre !== "F_D" || target.requirement.kind !== "executable_leaf_requirement" ||
    target.requirement.implementationBindingRef !== governanceRef("binding", "project-choice") || target.inputCarrierRef !== leaf.outputCarrierRef || target.outputCarrierRef !== governanceContract("choice")) return false;
  const edges = graph.template.edges.filter(e => e.fromNodeRef === node.nodeRef);
  if (edges.length !== 1 || edges[0]!.toNodeRef !== projection.nodeRef || edges[0]!.inputBinding !== undefined) return false;
  try {
    const application = registeredSelectionAtSource(graph.template,
      { currentNodeRef: projection.nodeRef, termPath: rootCSourcePath(projection.nodeRef) }, target.outputCarrierRef);
    return application === null ? false : { node, projection, application };
  } catch { return false; }
}
export function framedSynthesisNativeRole(publication: Readonly<ModulePublication> | undefined,
  programRef: string, graph: Readonly<GraphFunction>, locus: string): Readonly<RunEnvironmentRole> | null | false {
  try {
    const profile = framedSynthesisAtLocus(graph, locus);
    if (profile === null || profile === false) return profile;
    const role = selectorRoleFromBoundDeclarations(publication, programRef, graph.name, locus);
    return role === null ? false : role;
  } catch { return false; }
}
export function validRunEnvironmentPublication(publication: Readonly<ModulePublication>): boolean {
  const rows = publication.runEnvironments ?? [];
  return unique(rows.map(d => d.declarationRef)) &&
    rows.every(isRunEnvironmentDeclaration) && publication.programs.every(p => runEnvironmentForProgram(publication, p) !== false);
}
export function validRunEnvironmentProgram(publication: Readonly<ModulePublication>, program: Readonly<GtlProgram>,
  graphFunctions: readonly Readonly<GraphFunction>[]): boolean {
  const d = runEnvironmentForProgram(publication, program);
  if (d === null) return true;
  if (d === false) return false;
  const functions = graphFunctions.filter(g => program.callableMembership.includes(g.name));
  const leaves = functions.flatMap(g => g.template.nodes.flatMap(n => cLeafTerms(n.term).filter(c => c.fibre === "F_P")
    .map(c => ({ graphFunctionRef: g.name, locus: c.programLocusRef, role: nativeContextLeafFamily(g, c) }))));
  return leaves.length > 0 && leaves.length === d.roles.length && leaves.every(l => l.role !== null &&
    d.roles.filter(r => r.graphFunctionRef === l.graphFunctionRef && r.programLocusRef === l.locus && l.role === r.role).length === 1);
}
