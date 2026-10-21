import * as v from "valibot";
import type { ModulePublication, RootModuleArtifactBasis, ContractDeclaration } from "./contracts.js";
import { C, cCarrier } from "./c_algebra.js";
import { modulePublication } from "./declarations.js";
import { sha256Canonical } from "../shared/digests.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";

const ref = v.pipe(v.string(), v.minLength(1));
const digest = v.pipe(v.string(), v.regex(/^sha256:[0-9a-f]{64}$/));
const ordinal = v.pipe(v.number(), v.integer(), v.minValue(0));
export const CONTEXT_DECLARATION_SCHEMA = v.strictObject({
  contextRef: ref, sourceLocator: ref, inventoryDigest: digest,
  members: v.pipe(v.array(v.strictObject({ memberRef: ref, path: ref,
    byteCount: ordinal, digest })), v.minLength(1)),
});
export const REQUIREMENT_TERM_SCHEMA = v.strictObject({
  requirementRef: ref,
  sourceBindings: v.pipe(v.array(v.strictObject({ contextRef: ref, memberRef: ref,
    memberDigest: digest, startByte: ordinal, endByte: ordinal, spanDigest: digest })), v.minLength(1)),
});
export const GTL_CONTRACT_FULFILLMENT_BINDING_SCHEMA = v.strictObject({
  obligationRef: ref, requirementRef: ref,
  realizationContractRef: v.nullable(ref), proofContractRef: v.nullable(ref),
  proofPolicyRef: v.nullable(ref), proofShapeRef: v.nullable(ref),
});
export const REQUIREMENT_HANDOFF_DECLARATION_SCHEMA = v.strictObject({
  declarationRef: ref, graphFunctionRef: ref, sourceRoleRef: ref,
  context: CONTEXT_DECLARATION_SCHEMA,
  terms: v.pipe(v.array(REQUIREMENT_TERM_SCHEMA), v.minLength(1)),
  fulfillmentBindings: v.pipe(v.array(GTL_CONTRACT_FULFILLMENT_BINDING_SCHEMA), v.minLength(1)),
});
export interface ContextDeclaration {
  readonly contextRef: string; readonly sourceLocator: string; readonly inventoryDigest: `sha256:${string}`;
  readonly members: readonly { readonly memberRef: string; readonly path: string; readonly byteCount: number; readonly digest: `sha256:${string}` }[];
}
export interface RequirementTerm {
  readonly requirementRef: string;
  readonly sourceBindings: readonly { readonly contextRef: string; readonly memberRef: string; readonly memberDigest: `sha256:${string}`;
    readonly startByte: number; readonly endByte: number; readonly spanDigest: `sha256:${string}` }[];
}
export interface GtlContractFulfillmentBinding {
  readonly obligationRef: string; readonly requirementRef: string;
  readonly realizationContractRef: string | null; readonly proofContractRef: string | null;
  readonly proofPolicyRef: string | null; readonly proofShapeRef: string | null;
}
export interface GtlRequirementHandoffDeclaration {
  readonly declarationRef: string; readonly graphFunctionRef: string; readonly sourceRoleRef: string;
  readonly context: ContextDeclaration; readonly terms: readonly RequirementTerm[];
  readonly fulfillmentBindings: readonly GtlContractFulfillmentBinding[];
}
const unique = (xs: readonly string[]) => new Set(xs).size === xs.length;
export function isRequirementHandoffDeclaration(value: unknown): value is GtlRequirementHandoffDeclaration {
  if (!v.is(REQUIREMENT_HANDOFF_DECLARATION_SCHEMA, value)) return false;
  const { context, terms, fulfillmentBindings: bindings } = value;
  return unique(context.members.map(x => x.memberRef)) && unique(context.members.map(x => x.path)) &&
    context.inventoryDigest === sha256Canonical(context.members as unknown as JsonValue) &&
    unique(terms.map(x => x.requirementRef)) && unique(bindings.map(x => x.obligationRef)) &&
    bindings.length === terms.length && unique(bindings.map(x => x.requirementRef)) &&
    bindings.every((x, i) => x.requirementRef === terms[i]!.requirementRef) &&
    terms.every(term => term.sourceBindings.every(source => {
      const member = context.members.find(x => x.memberRef === source.memberRef);
      return source.contextRef === context.contextRef && member !== undefined &&
        member.digest === source.memberDigest && source.startByte < source.endByte &&
        source.endByte <= member.byteCount;
    }));
}
export function constructRequirementHandoffDeclaration(value: GtlRequirementHandoffDeclaration): Readonly<GtlRequirementHandoffDeclaration> {
  if (!isRequirementHandoffDeclaration(value)) throw new TypeError("invalid requirement handoff declaration");
  return deepFreeze(value);
}
export function validRequirementHandoffPublication(publication: Readonly<ModulePublication>): boolean {
  const rows = publication.requirementHandoffs;
  if (rows === undefined) return !publication.graphFunctions.some(g => g.declarations["abg.requirement_handoff"] !== undefined);
  return Array.isArray(rows) && unique(rows.map(x => x.declarationRef)) &&
    unique(rows.map(x => x.graphFunctionRef)) && rows.every(row =>
      isRequirementHandoffDeclaration(row) && publication.graphFunctions.filter(g =>
        g.name === row.graphFunctionRef && g.declarations["abg.requirement_handoff"] === row.declarationRef &&
        g.inputs.length === 1 && g.inputs[0] === REQUIREMENT_HANDOFF_IDS.inputContractRef &&
        g.outputs.length === 1 && g.outputs[0] === REQUIREMENT_HANDOFF_IDS.outputContractRef && g.effects.length === 0).length === 1 &&
      row.fulfillmentBindings.every(binding => [binding.realizationContractRef, binding.proofContractRef].every(ref =>
        ref === null || publication.contracts.filter(c => c.contractRef === ref && c.contractKind === "output").length === 1))) &&
    publication.graphFunctions.every(g => g.declarations["abg.requirement_handoff"] === undefined ||
      rows.filter(row => row.declarationRef === g.declarations["abg.requirement_handoff"] && row.graphFunctionRef === g.name).length === 1);
}

const scope = "abiogenesis/requirement-handoff";
export const REQUIREMENT_HANDOFF_IDS = Object.freeze({
  moduleRef: `module://${scope}@5`, programRef: `program://${scope}@5`,
  graphFunctionRef: `graph-function://${scope}@5`, graphRef: `graph://${scope}@5`,
  nodeRef: `node://${scope}@5`, startRef: `start://${scope}@5`, armId: `arm://${scope}@5`,
  implementationRef: `implementation://${scope}-fd@5`, implementationBindingRef: `implementation-binding://${scope}-fd@5`,
  inputContractRef: `contract://${scope}/input@5`, outputContractRef: `contract://${scope}/output@5`,
  failureContractRef: `contract://${scope}/failure@5`, refusalContractRef: `contract://${scope}/refusal@5`,
  evidenceContractRef: `contract://${scope}/evidence@5`, judgmentContractRef: `contract://${scope}/judgment@5`,
  transitionContractRef: `contract://${scope}/transition@5`, closureContractRef: `contract://${scope}/closure@5`,
  judgmentPredicateRef: `predicate://${scope}/transfer@5`,
});
export function constructRequirementHandoffModulePublication(
  artifact: RootModuleArtifactBasis,
): Readonly<ModulePublication> {
  const ids = REQUIREMENT_HANDOFF_IDS;
  const contract = (contractRef: string, kind: ContractDeclaration["contractKind"], valueKind: string): ContractDeclaration =>
    ({ contractRef, contractVersion: "5.0.0", contractKind: kind, valueKind });
  const binding = { kind: "implementation_binding" as const, bindingRef: ids.implementationBindingRef,
    implementationRef: ids.implementationRef, packageName: artifact.packageName, packageVersion: artifact.packageVersion,
    modulePath: "build/code/src/implementation/requirement_handoff.js", namedSymbol: "realizeRequirementHandoff",
    computeRegime: "F_D" as const, inputContractRef: ids.inputContractRef, outputContractRef: ids.outputContractRef,
    failureContractRef: ids.failureContractRef, refusalContractRef: ids.refusalContractRef };
  const closure = { kind: "closure_contract" as const, closureContractRef: ids.closureContractRef,
    predicateRef: ids.judgmentPredicateRef, evidenceContractRef: ids.evidenceContractRef, resultContractRef: ids.outputContractRef,
    refusalContractRef: ids.refusalContractRef, refusalValueKind: "requirement_handoff_refusal",
    judgmentContractRef: ids.judgmentContractRef, rejectionContractRef: ids.failureContractRef,
    transitionContractRef: ids.transitionContractRef, replayProjectionRef: `projection://${scope}@5`,
    terminalKind: "completed" as const, closureScope: "run" as const,
    eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"] as const };
  const contracts = [contract(ids.inputContractRef, "input", "requirement_handoff_input"),
    contract(ids.outputContractRef, "output", "requirement_handoff_output"),
    ...(["failure", "refusal", "evidence", "judgment", "transition", "closure"] as const).map(kind =>
      contract(ids[`${kind}ContractRef`], kind, `requirement_handoff_${kind}`)),
];
  return modulePublication({ kind: "module_publication", moduleRef: ids.moduleRef, moduleVersion: "5.0.0",
    owningProductId: artifact.productId, artifactDigest: artifact.artifactDigest, productContentDigest: artifact.productContentDigest,
    productManifestDigest: artifact.productManifestDigest,
    descriptorRef: `descriptor://abiogenesis/typescript-tenant/${artifact.productContentDigest.slice(7)}`,
    contributionManifestRef: `contribution-manifest://abiogenesis/conformance/${artifact.productContentDigest.slice(7)}`,
    productSemanticsBinding: { kind: "product_semantics_binding", bindingRef: `product-semantics://${scope}@5`,
      packageName: artifact.packageName, packageVersion: artifact.packageVersion,
      modulePath: "build/code/src/product/builtin_semantics.js", namedSymbol: "ABI5_REQUIREMENT_HANDOFF_PRODUCT_SEMANTICS" },
    contracts, evaluators: [], rules: [], implementationBindings: [binding], closureContracts: [closure],
    programs: [{ kind: "gtl_program", programRef: ids.programRef, version: "5.0.0", moduleRef: ids.moduleRef,
      starts: [{ startRef: ids.startRef, graphFunctionRef: ids.graphFunctionRef }], callableMembership: [ids.graphFunctionRef],
      closureContractRef: ids.closureContractRef, policies: { "abg.root_mode": "direct", "abg.compute_regime": "F_D", "abg.default_start_ref": ids.startRef } }],
    graphFunctions: [{ kind: "graph_function", name: ids.graphFunctionRef, version: "5.0.0",
      environment: { requires: [ids.inputContractRef], provides: [ids.outputContractRef], carries: [] },
      inputs: [ids.inputContractRef], outputs: [ids.outputContractRef], effects: [], tags: ["requirement-handoff", "non-closing"],
      declarations: { "abg.compute_regime": "F_D", "abg.closure_contract": ids.closureContractRef,
        "abg.evidence_contract": ids.evidenceContractRef, "abg.judgment_contract": ids.judgmentContractRef,
        "abg.judgment_predicate": ids.judgmentPredicateRef, "abg.transition_contract": ids.transitionContractRef },
      template: { kind: "inline_graph", graphRef: ids.graphRef, startNodeRef: ids.nodeRef, terminalNodeRefs: [ids.nodeRef],
        edges: [], applications: [], nodes: [{ nodeRef: ids.nodeRef, nodeKind: "c_locus", term: C.of({
          input: cCarrier(ids.inputContractRef), output: cCarrier(ids.outputContractRef), programLocusRef: ids.nodeRef,
          stageRole: "requirement-handoff", fibre: "F_D", armId: ids.armId, compositionRef: null, vectorIndex: 0,
          judgmentPredicateRef: ids.judgmentPredicateRef, resultBearing: true,
          requirement: { kind: "executable_leaf_requirement", implementationBindingRef: binding.bindingRef,
            inputContractRef: ids.inputContractRef, outputContractRef: ids.outputContractRef,
            evidenceContractRef: ids.evidenceContractRef, failureContractRef: ids.failureContractRef,
            refusalContractRef: ids.refusalContractRef, judgmentContractRef: ids.judgmentContractRef } }) }] } }],
    contributions: [{ handle: ids.graphFunctionRef, kind: "graph_function", declarationOrContractRef: ids.graphFunctionRef,
      owningProductId: artifact.productId, programMembershipRefs: [ids.programRef], readinessPrerequisiteRefs: [ids.programRef],
      compatibilityRefs: ["compatibility://abiogenesis/major/5"], provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest] }],
  });
}

/** Consumer data owns its Program/source basis; implementation and semantics retain their installed ABI owner. */
export function constructRequirementHandoffConsumerPublication(
  consumer: RootModuleArtifactBasis, nativePublication: Readonly<ModulePublication>,
  declaration: GtlRequirementHandoffDeclaration,
  identity: Readonly<{ moduleRef: string; programRef: string; startRef: string; graphRef: string; closureContractRef: string;
    descriptorRef: string; contributionManifestRef: string }>,
  roleContracts: readonly ContractDeclaration[] = [],
): Readonly<ModulePublication> {
  const d = constructRequirementHandoffDeclaration(declaration);
  if (nativePublication.moduleRef !== REQUIREMENT_HANDOFF_IDS.moduleRef ||
    nativePublication.implementationBindings.length !== 1 ||
    nativePublication.implementationBindings[0]?.implementationRef !== REQUIREMENT_HANDOFF_IDS.implementationRef ||
    nativePublication.graphFunctions.length !== 1 || nativePublication.closureContracts.length !== 1 ||
    d.graphFunctionRef === REQUIREMENT_HANDOFF_IDS.graphFunctionRef || consumer.productId === nativePublication.owningProductId) {
    throw new TypeError("handoff requires distinct consumer declaration and native implementation publications");
  }
  const native = nativePublication.graphFunctions[0]!;
  if (native.template.kind !== "inline_graph") throw new TypeError("native handoff requires inline C.of");
  const closure = { ...nativePublication.closureContracts[0]!, closureContractRef: identity.closureContractRef };
  return modulePublication({ kind: "module_publication", moduleVersion: "5.0.0", moduleRef: identity.moduleRef,
    owningProductId: consumer.productId, artifactDigest: consumer.artifactDigest, productContentDigest: consumer.productContentDigest,
    productManifestDigest: consumer.productManifestDigest, descriptorRef: identity.descriptorRef,
    contributionManifestRef: identity.contributionManifestRef, productSemanticsBinding: nativePublication.productSemanticsBinding,
    contracts: [{ contractRef: identity.closureContractRef, contractVersion: "5.0.0", contractKind: "closure", valueKind: "requirement_handoff_closure" }, ...roleContracts],
    evaluators: [], rules: [], implementationBindings: [], closureContracts: [closure], requirementHandoffs: [d],
    graphFunctions: [{ ...native, name: d.graphFunctionRef, template: { ...native.template, graphRef: identity.graphRef },
      declarations: { ...native.declarations, "abg.closure_contract": identity.closureContractRef, "abg.requirement_handoff": d.declarationRef } }],
    programs: [{ kind: "gtl_program", programRef: identity.programRef, version: "5.0.0", moduleRef: identity.moduleRef,
      starts: [{ startRef: identity.startRef, graphFunctionRef: d.graphFunctionRef }], callableMembership: [d.graphFunctionRef],
      closureContractRef: identity.closureContractRef, policies: { "abg.root_mode": "direct", "abg.compute_regime": "F_D", "abg.default_start_ref": identity.startRef } }],
    contributions: [{ handle: d.graphFunctionRef, kind: "graph_function", declarationOrContractRef: d.graphFunctionRef,
      owningProductId: consumer.productId, programMembershipRefs: [identity.programRef], readinessPrerequisiteRefs: [identity.programRef],
      compatibilityRefs: ["compatibility://abiogenesis/major/5"], provenanceRefs: [consumer.artifactDigest, consumer.productManifestDigest] }],
  });
}
