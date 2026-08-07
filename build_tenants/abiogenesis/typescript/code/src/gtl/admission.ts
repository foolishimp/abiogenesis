import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  admitIJsonText,
  admitIJsonValue,
} from "./canonical_ingest.js";
import {
  COMPUTE_REGIME_VALUES,
  witnessAdmittedCProgramTerm,
  type CLeafRequirement,
  type COfNode,
  type CProgramNode,
} from "./c_algebra.js";
import type {
  CatalogContribution,
  ClosureContract,
  ContractDeclaration,
  EvaluatorDeclaration,
  GraphFunction,
  GraphFunctionApplication,
  GraphTemplate,
  GtlActionCatalog,
  GtlActionCatalogRow,
  GtlConstructionAuthorityBinding,
  GtlConstructionComposition,
  GtlConstructionPolicy,
  GtlProgram,
  ImplementationBinding,
  ModulePublication,
  ProductSemanticsBinding,
  ProgramPublicAssetTarget,
  ProgramStart,
  RuleDeclaration,
} from "./contracts.js";
import { hasCanonicalGraphFunctionId } from "./graph_function.js";
import {
  serializeCProgramNode,
  serializeGraphFunction,
  serializeModule,
  serializeProgram,
  type Module,
} from "./serialization.js";

type UnknownRecord = Readonly<Record<string, unknown>>;

function parseInput(input: unknown): unknown {
  return typeof input === "string" ? admitIJsonText(input) : input;
}

function record(
  value: unknown,
  path: string,
  required: readonly string[],
  optional: readonly string[] = [],
  allowAdditional = false,
): UnknownRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`${path} must be an object`);
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError(`${path} must be a plain object`);
  }
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const keys: string[] = [];
  for (const key of Reflect.ownKeys(descriptors)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
    if (typeof key !== "string") {
      if (descriptor.enumerable) {
        throw new TypeError(`${path} contains an enumerable symbol property`);
      }
      continue;
    }
    if (!("value" in descriptor) || descriptor.enumerable !== true) {
      throw new TypeError(`${path}.${key} must be one enumerable data property`);
    }
    keys.push(key);
  }
  const admitted = new Set([...required, ...optional]);
  for (const key of keys) {
    if (!allowAdditional && !admitted.has(key)) {
      throw new TypeError(`${path}.${key} is not declared`);
    }
  }
  for (const key of required) {
    if (!keys.includes(key)) throw new TypeError(`${path}.${key} is required`);
  }
  return value as UnknownRecord;
}

function array(value: unknown, path: string): readonly unknown[] {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) {
    throw new TypeError(`${path} must be an array`);
  }
  const descriptors = Object.getOwnPropertyDescriptors(value);
  for (let index = 0; index < value.length; index += 1) {
    const descriptor = descriptors[String(index)];
    if (
      descriptor === undefined ||
      !("value" in descriptor) ||
      descriptor.enumerable !== true
    ) {
      throw new TypeError(`${path}[${index}] is sparse or accessor-backed`);
    }
  }
  for (const key of Reflect.ownKeys(descriptors)) {
    if (typeof key !== "string" || (key !== "length" && !/^\d+$/u.test(key))) {
      throw new TypeError(`${path} contains a non-JSON array property`);
    }
  }
  return value;
}

function string(value: unknown, path: string): string {
  const admitted = admitIJsonValue(value);
  if (typeof admitted !== "string" || admitted.trim().length === 0) {
    throw new TypeError(`${path} must be a non-empty string`);
  }
  return admitted;
}

function exactString<T extends string>(
  value: unknown,
  expected: T,
  path: string,
): T {
  if (value !== expected) throw new TypeError(`${path} must equal ${expected}`);
  return expected;
}

function oneOf<const Values extends readonly string[]>(
  value: unknown,
  values: Values,
  path: string,
): Values[number] {
  if (typeof value !== "string" || !values.includes(value)) {
    throw new TypeError(`${path} must be one of ${values.join(", ")}`);
  }
  return value as Values[number];
}

function bool(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") throw new TypeError(`${path} must be boolean`);
  return value;
}

function safeInteger(value: unknown, path: string, minimum = 0): number {
  if (!Number.isSafeInteger(value) || (value as number) < minimum) {
    throw new TypeError(`${path} must be a safe integer >= ${minimum}`);
  }
  return Object.is(value, -0) ? 0 : value as number;
}

function stringArray(value: unknown, path: string): readonly string[] {
  return array(value, path).map((entry, index) => string(entry, `${path}[${index}]`));
}

function stringRecord(value: unknown, path: string): Readonly<Record<string, string>> {
  const row = record(value, path, [], [], true);
  const result: Record<string, string> = Object.create(null) as Record<string, string>;
  for (const key of Object.keys(row)) result[key] = string(row[key], `${path}.${key}`);
  return result;
}

function jsonRecord(value: unknown, path: string): Readonly<Record<string, JsonValue>> {
  const admitted = admitIJsonValue(value);
  if (typeof admitted !== "object" || admitted === null || Array.isArray(admitted)) {
    throw new TypeError(`${path} must be an I-JSON object`);
  }
  return admitted as Readonly<Record<string, JsonValue>>;
}

function parseRequirement(value: unknown, path: string): CLeafRequirement {
  const kind = record(value, path, ["kind"], [], true).kind;
  if (kind === "executable_leaf_requirement") {
    const row = record(value, path, [
      "kind", "implementationBindingRef", "inputContractRef", "outputContractRef",
      "evidenceContractRef", "failureContractRef", "refusalContractRef",
      "judgmentContractRef",
    ]);
    return {
      kind: "executable_leaf_requirement",
      implementationBindingRef: string(row.implementationBindingRef, `${path}.implementationBindingRef`),
      inputContractRef: string(row.inputContractRef, `${path}.inputContractRef`),
      outputContractRef: string(row.outputContractRef, `${path}.outputContractRef`),
      evidenceContractRef: string(row.evidenceContractRef, `${path}.evidenceContractRef`),
      failureContractRef: string(row.failureContractRef, `${path}.failureContractRef`),
      refusalContractRef: string(row.refusalContractRef, `${path}.refusalContractRef`),
      judgmentContractRef: string(row.judgmentContractRef, `${path}.judgmentContractRef`),
    };
  }
  if (kind === "interaction_leaf_requirement") {
    const row = record(value, path, [
      "kind", "interactionKind", "actorCapabilityRef", "requestContractRef",
      "responseContractRef", "continuationContractRef",
    ]);
    return {
      kind: "interaction_leaf_requirement",
      interactionKind: string(row.interactionKind, `${path}.interactionKind`),
      actorCapabilityRef: string(row.actorCapabilityRef, `${path}.actorCapabilityRef`),
      requestContractRef: string(row.requestContractRef, `${path}.requestContractRef`),
      responseContractRef: string(row.responseContractRef, `${path}.responseContractRef`),
      continuationContractRef: string(row.continuationContractRef, `${path}.continuationContractRef`),
    };
  }
  throw new TypeError(`${path}.kind is not a C leaf requirement`);
}

function parseCProgramNode(value: unknown, path: string): CProgramNode {
  const kind = record(value, path, ["kind"], [], true).kind;
  const interfaceKeys = ["kind", "inputCarrierRef", "outputCarrierRef"];
  if (kind === "c_of") {
    const row = record(value, path, [
      ...interfaceKeys, "programLocusRef", "stageRole", "fibre", "armId",
      "compositionRef", "vectorIndex", "judgmentPredicateRef", "resultBearing",
      "requirement",
    ]);
    const requirement = parseRequirement(row.requirement, `${path}.requirement`);
    const fibre = oneOf(row.fibre, COMPUTE_REGIME_VALUES, `${path}.fibre`);
    if (
      (fibre === "F_H" && requirement.kind !== "interaction_leaf_requirement") ||
      (fibre !== "F_H" && requirement.kind !== "executable_leaf_requirement")
    ) {
      throw new TypeError(`${path}.requirement does not match fibre ${fibre}`);
    }
    const compositionRef = row.compositionRef === null
      ? null
      : string(row.compositionRef, `${path}.compositionRef`);
    return {
      kind: "c_of",
      inputCarrierRef: string(row.inputCarrierRef, `${path}.inputCarrierRef`),
      outputCarrierRef: string(row.outputCarrierRef, `${path}.outputCarrierRef`),
      programLocusRef: string(row.programLocusRef, `${path}.programLocusRef`),
      stageRole: string(row.stageRole, `${path}.stageRole`),
      fibre,
      armId: string(row.armId, `${path}.armId`),
      compositionRef,
      vectorIndex: safeInteger(row.vectorIndex, `${path}.vectorIndex`),
      judgmentPredicateRef: string(row.judgmentPredicateRef, `${path}.judgmentPredicateRef`),
      resultBearing: bool(row.resultBearing, `${path}.resultBearing`),
      requirement,
    };
  }
  if (kind === "c_identity") {
    const row = record(value, path, interfaceKeys);
    return { kind: "c_identity", inputCarrierRef: string(row.inputCarrierRef, `${path}.inputCarrierRef`), outputCarrierRef: string(row.outputCarrierRef, `${path}.outputCarrierRef`) };
  }
  if (kind === "c_compose") {
    const row = record(value, path, [...interfaceKeys, "terms"]);
    const terms = array(row.terms, `${path}.terms`).map((entry, index) => parseCProgramNode(entry, `${path}.terms[${index}]`));
    if (terms.length < 2) throw new TypeError(`${path}.terms must contain at least two terms`);
    return { kind: "c_compose", inputCarrierRef: string(row.inputCarrierRef, `${path}.inputCarrierRef`), outputCarrierRef: string(row.outputCarrierRef, `${path}.outputCarrierRef`), terms };
  }
  if (kind === "c_edge") {
    const row = record(value, path, [...interfaceKeys, "transform", "evaluate", "consequence"]);
    const transform = parseCProgramNode(row.transform, `${path}.transform`);
    const evaluate = parseCProgramNode(row.evaluate, `${path}.evaluate`);
    const consequence = parseCProgramNode(row.consequence, `${path}.consequence`);
    if (transform.kind !== "c_of" || evaluate.kind !== "c_of" || consequence.kind !== "c_of") {
      throw new TypeError(`${path} C edge stages must be c_of terms`);
    }
    return { kind: "c_edge", inputCarrierRef: string(row.inputCarrierRef, `${path}.inputCarrierRef`), outputCarrierRef: string(row.outputCarrierRef, `${path}.outputCarrierRef`), transform, evaluate, consequence };
  }
  if (kind === "c_workflow") {
    const row = record(value, path, [...interfaceKeys, "graphFunctionRef"]);
    return { kind: "c_workflow", inputCarrierRef: string(row.inputCarrierRef, `${path}.inputCarrierRef`), outputCarrierRef: string(row.outputCarrierRef, `${path}.outputCarrierRef`), graphFunctionRef: string(row.graphFunctionRef, `${path}.graphFunctionRef`) };
  }
  if (kind === "c_batch") {
    const row = record(value, path, [...interfaceKeys, "taskInputCarrierRef", "taskOutputCarrierRef", "batchRef", "tasks"]);
    const tasks = array(row.tasks, `${path}.tasks`).map((entry, index) => parseCProgramNode(entry, `${path}.tasks[${index}]`));
    if (tasks.length === 0) throw new TypeError(`${path}.tasks must be non-empty`);
    return { kind: "c_batch", inputCarrierRef: string(row.inputCarrierRef, `${path}.inputCarrierRef`), outputCarrierRef: string(row.outputCarrierRef, `${path}.outputCarrierRef`), taskInputCarrierRef: string(row.taskInputCarrierRef, `${path}.taskInputCarrierRef`), taskOutputCarrierRef: string(row.taskOutputCarrierRef, `${path}.taskOutputCarrierRef`), batchRef: string(row.batchRef, `${path}.batchRef`), tasks };
  }
  if (kind === "c_retry") {
    const row = record(value, path, [...interfaceKeys, "budget", "term"]);
    return { kind: "c_retry", inputCarrierRef: string(row.inputCarrierRef, `${path}.inputCarrierRef`), outputCarrierRef: string(row.outputCarrierRef, `${path}.outputCarrierRef`), budget: safeInteger(row.budget, `${path}.budget`, 1), term: parseCProgramNode(row.term, `${path}.term`) };
  }
  throw new TypeError(`${path}.kind is not a complete C term`);
}

function applicationBase(row: UnknownRecord, path: string): {
  kind: "graph_function_application";
  applicationRef: string;
  inputContractRef: string;
  outputContractRef: string;
} {
  return {
    kind: exactString(row.kind, "graph_function_application", `${path}.kind`),
    applicationRef: string(row.applicationRef, `${path}.applicationRef`),
    inputContractRef: string(row.inputContractRef, `${path}.inputContractRef`),
    outputContractRef: string(row.outputContractRef, `${path}.outputContractRef`),
  };
}

function parseApplication(value: unknown, path: string): GraphFunctionApplication {
  const seed = record(value, path, ["kind", "relationKind"], [], true);
  const baseKeys = ["kind", "applicationRef", "inputContractRef", "outputContractRef", "relationKind"];
  const relationKind = string(seed.relationKind, `${path}.relationKind`);
  switch (relationKind) {
    case "compose": {
      const row = record(value, path, [...baseKeys, "leftGraphFunctionRef", "rightGraphFunctionRef"]);
      return { ...applicationBase(row, path), relationKind, leftGraphFunctionRef: string(row.leftGraphFunctionRef, `${path}.leftGraphFunctionRef`), rightGraphFunctionRef: string(row.rightGraphFunctionRef, `${path}.rightGraphFunctionRef`) };
    }
    case "substitute": {
      const row = record(value, path, [...baseKeys, "outerGraphFunctionRef", "targetVectorRef", "innerGraphFunctionRef"]);
      return { ...applicationBase(row, path), relationKind, outerGraphFunctionRef: string(row.outerGraphFunctionRef, `${path}.outerGraphFunctionRef`), targetVectorRef: string(row.targetVectorRef, `${path}.targetVectorRef`), innerGraphFunctionRef: string(row.innerGraphFunctionRef, `${path}.innerGraphFunctionRef`) };
    }
    case "recurse": {
      const row = record(value, path, [...baseKeys, "graphFunctionRef", "terminationRuleRef", "terminationEvaluatorRefs", "terminationFieldRef", "foldbackRef", "foldback", "bound"]);
      const foldback = record(row.foldback, `${path}.foldback`, ["mode", "binding", "requiresParentEvaluation"]);
      return { ...applicationBase(row, path), relationKind, graphFunctionRef: string(row.graphFunctionRef, `${path}.graphFunctionRef`), terminationRuleRef: string(row.terminationRuleRef, `${path}.terminationRuleRef`), terminationEvaluatorRefs: stringArray(row.terminationEvaluatorRefs, `${path}.terminationEvaluatorRefs`), terminationFieldRef: string(row.terminationFieldRef, `${path}.terminationFieldRef`), foldbackRef: string(row.foldbackRef, `${path}.foldbackRef`), foldback: { mode: exactString(foldback.mode, "rebind", `${path}.foldback.mode`), binding: string(foldback.binding, `${path}.foldback.binding`), requiresParentEvaluation: foldback.requiresParentEvaluation === true ? true : (() => { throw new TypeError(`${path}.foldback.requiresParentEvaluation must be true`); })() }, bound: safeInteger(row.bound, `${path}.bound`, 1) };
    }
    case "fan_out": {
      const row = record(value, path, [...baseKeys, "batchRef", "elementGraphFunctionRef", "inputVectorRef", "outputVectorRef", "inputMemberContractRef", "outputMemberContractRef"]);
      return { ...applicationBase(row, path), relationKind, batchRef: string(row.batchRef, `${path}.batchRef`), elementGraphFunctionRef: string(row.elementGraphFunctionRef, `${path}.elementGraphFunctionRef`), inputVectorRef: string(row.inputVectorRef, `${path}.inputVectorRef`), outputVectorRef: string(row.outputVectorRef, `${path}.outputVectorRef`), inputMemberContractRef: string(row.inputMemberContractRef, `${path}.inputMemberContractRef`), outputMemberContractRef: string(row.outputMemberContractRef, `${path}.outputMemberContractRef`) };
    }
    case "fan_in": {
      const row = record(value, path, [...baseKeys, "reducerGraphFunctionRef", "inputVectorRef"]);
      return { ...applicationBase(row, path), relationKind, reducerGraphFunctionRef: string(row.reducerGraphFunctionRef, `${path}.reducerGraphFunctionRef`), inputVectorRef: string(row.inputVectorRef, `${path}.inputVectorRef`) };
    }
    case "gate": {
      const row = record(value, path, [...baseKeys, "targetRef", "ruleRef", "evaluatorRefs"]);
      return { ...applicationBase(row, path), relationKind, targetRef: string(row.targetRef, `${path}.targetRef`), ruleRef: string(row.ruleRef, `${path}.ruleRef`), evaluatorRefs: stringArray(row.evaluatorRefs, `${path}.evaluatorRefs`) };
    }
    case "re_enter": {
      const row = record(value, path, [...baseKeys, "graphFunctionRef", "sourceProgramLocusRef", "targetProgramLocusRef", "maxApplications"]);
      return { ...applicationBase(row, path), relationKind, graphFunctionRef: string(row.graphFunctionRef, `${path}.graphFunctionRef`), sourceProgramLocusRef: string(row.sourceProgramLocusRef, `${path}.sourceProgramLocusRef`), targetProgramLocusRef: string(row.targetProgramLocusRef, `${path}.targetProgramLocusRef`), maxApplications: safeInteger(row.maxApplications, `${path}.maxApplications`, 1) };
    }
    case "promote": {
      const row = record(value, path, [...baseKeys, "sourceRef", "targetRef"]);
      return { ...applicationBase(row, path), relationKind, sourceRef: string(row.sourceRef, `${path}.sourceRef`), targetRef: string(row.targetRef, `${path}.targetRef`) };
    }
    case "identity": {
      const row = record(value, path, [...baseKeys, "targetRef"]);
      return { ...applicationBase(row, path), relationKind, targetRef: string(row.targetRef, `${path}.targetRef`) };
    }
    case "same_object": {
      const row = record(value, path, [...baseKeys, "leftRef", "rightRef", "witnessRef"]);
      return { ...applicationBase(row, path), relationKind, leftRef: string(row.leftRef, `${path}.leftRef`), rightRef: string(row.rightRef, `${path}.rightRef`), witnessRef: string(row.witnessRef, `${path}.witnessRef`) };
    }
    default:
      throw new TypeError(`${path}.relationKind is unsupported`);
  }
}

function parseGraphTemplate(value: unknown, path: string): GraphTemplate {
  const row = record(value, path, ["kind", "graphRef", "startNodeRef", "terminalNodeRefs", "nodes", "edges", "applications"]);
  const nodes = array(row.nodes, `${path}.nodes`).map((entry, index) => {
    const node = record(entry, `${path}.nodes[${index}]`, ["nodeRef", "nodeKind", "term"]);
    return { nodeRef: string(node.nodeRef, `${path}.nodes[${index}].nodeRef`), nodeKind: exactString(node.nodeKind, "c_locus", `${path}.nodes[${index}].nodeKind`), term: parseCProgramNode(node.term, `${path}.nodes[${index}].term`) };
  });
  const edges = array(row.edges, `${path}.edges`).map((entry, index) => {
    const edge = record(entry, `${path}.edges[${index}]`, ["edgeRef", "fromNodeRef", "toNodeRef"]);
    return { edgeRef: string(edge.edgeRef, `${path}.edges[${index}].edgeRef`), fromNodeRef: string(edge.fromNodeRef, `${path}.edges[${index}].fromNodeRef`), toNodeRef: string(edge.toNodeRef, `${path}.edges[${index}].toNodeRef`) };
  });
  return {
    kind: exactString(row.kind, "inline_graph", `${path}.kind`),
    graphRef: string(row.graphRef, `${path}.graphRef`),
    startNodeRef: string(row.startNodeRef, `${path}.startNodeRef`),
    terminalNodeRefs: stringArray(row.terminalNodeRefs, `${path}.terminalNodeRefs`),
    nodes,
    edges,
    applications: array(row.applications, `${path}.applications`).map((entry, index) => parseApplication(entry, `${path}.applications[${index}]`)),
  };
}

function witnessGraphFunctionTerms(
  graphFunction: Readonly<GraphFunction>,
): Readonly<GraphFunction> {
  return deepFreeze({
    ...graphFunction,
    template: {
      ...graphFunction.template,
      nodes: graphFunction.template.nodes.map((node) => ({
        ...node,
        term: witnessAdmittedCProgramTerm(node.term),
      })),
    },
  });
}

export function admitGraphFunction(input: unknown): Readonly<GraphFunction> {
  const row = record(parseInput(input), "GraphFunction", ["kind", "id", "name", "version", "environment", "inputs", "outputs", "template", "effects", "declarations", "tags"]);
  const environment = record(row.environment, "GraphFunction.environment", ["requires", "provides", "carries"]);
  const graphFunction = serializeGraphFunction({
    kind: exactString(row.kind, "graph_function", "GraphFunction.kind"),
    id: string(row.id, "GraphFunction.id"),
    name: string(row.name, "GraphFunction.name"),
    version: exactString(row.version, "5.0.0", "GraphFunction.version"),
    environment: { requires: stringArray(environment.requires, "GraphFunction.environment.requires"), provides: stringArray(environment.provides, "GraphFunction.environment.provides"), carries: stringArray(environment.carries, "GraphFunction.environment.carries") },
    inputs: stringArray(row.inputs, "GraphFunction.inputs"),
    outputs: stringArray(row.outputs, "GraphFunction.outputs"),
    template: parseGraphTemplate(row.template, "GraphFunction.template"),
    effects: stringArray(row.effects, "GraphFunction.effects"),
    declarations: stringRecord(row.declarations, "GraphFunction.declarations"),
    tags: stringArray(row.tags, "GraphFunction.tags"),
  });
  if (graphFunction.id === graphFunction.name) {
    throw new TypeError("GraphFunction.id must be distinct from GraphFunction.name");
  }
  if (!hasCanonicalGraphFunctionId(graphFunction)) {
    throw new TypeError("GraphFunction.id conflicts with its canonical authoring identity");
  }
  return witnessGraphFunctionTerms(graphFunction);
}

function parseProgramStart(value: unknown, path: string): ProgramStart {
  const row = record(value, path, ["startRef", "graphFunctionRef"]);
  return { startRef: string(row.startRef, `${path}.startRef`), graphFunctionRef: string(row.graphFunctionRef, `${path}.graphFunctionRef`) };
}

function parsePublicAssetTarget(value: unknown, path: string): ProgramPublicAssetTarget {
  const row = record(value, path, ["kind", "handle", "assetRef", "startRef"]);
  return { kind: exactString(row.kind, "program_public_asset_target", `${path}.kind`), handle: string(row.handle, `${path}.handle`), assetRef: string(row.assetRef, `${path}.assetRef`), startRef: string(row.startRef, `${path}.startRef`) };
}

function parseActionRow(value: unknown, path: string): GtlActionCatalogRow {
  const row = record(value, path, ["kind", "actionRef", "actionKind", "programRef", "graphFunctionRef", "targetProgramLocusRef", "targetObligationRefs", "inputAssetRefs", "outputAssetRefs", "expectedDeltaRef", "progressConditionRef", "stopConditionRef"]);
  return { kind: exactString(row.kind, "action_catalog_row", `${path}.kind`), actionRef: string(row.actionRef, `${path}.actionRef`), actionKind: string(row.actionKind, `${path}.actionKind`), programRef: string(row.programRef, `${path}.programRef`), graphFunctionRef: string(row.graphFunctionRef, `${path}.graphFunctionRef`), targetProgramLocusRef: string(row.targetProgramLocusRef, `${path}.targetProgramLocusRef`), targetObligationRefs: stringArray(row.targetObligationRefs, `${path}.targetObligationRefs`), inputAssetRefs: stringArray(row.inputAssetRefs, `${path}.inputAssetRefs`), outputAssetRefs: stringArray(row.outputAssetRefs, `${path}.outputAssetRefs`), expectedDeltaRef: string(row.expectedDeltaRef, `${path}.expectedDeltaRef`), progressConditionRef: string(row.progressConditionRef, `${path}.progressConditionRef`), stopConditionRef: string(row.stopConditionRef, `${path}.stopConditionRef`) };
}

function parseActionCatalog(value: unknown, path: string): GtlActionCatalog {
  const row = record(value, path, ["kind", "schemaVersion", "catalogRef", "catalogDigest", "rows"]);
  return { kind: exactString(row.kind, "action_catalog", `${path}.kind`), schemaVersion: exactString(row.schemaVersion, "5.0.0", `${path}.schemaVersion`), catalogRef: string(row.catalogRef, `${path}.catalogRef`), catalogDigest: string(row.catalogDigest, `${path}.catalogDigest`) as GtlActionCatalog["catalogDigest"], rows: array(row.rows, `${path}.rows`).map((entry, index) => parseActionRow(entry, `${path}.rows[${index}]`)) };
}

function parseConstructionAuthority(value: unknown, path: string): GtlConstructionAuthorityBinding {
  const row = record(value, path, ["kind", "semanticAuthority", "authorityRef", "initialProgramLocusRef", "refreshProgramLocusRef"]);
  return { kind: exactString(row.kind, "construction_authority_binding", `${path}.kind`), semanticAuthority: oneOf(row.semanticAuthority, ["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"] as const, `${path}.semanticAuthority`), authorityRef: string(row.authorityRef, `${path}.authorityRef`), initialProgramLocusRef: string(row.initialProgramLocusRef, `${path}.initialProgramLocusRef`), refreshProgramLocusRef: row.refreshProgramLocusRef === null ? null : string(row.refreshProgramLocusRef, `${path}.refreshProgramLocusRef`) };
}

function parseConstructionPolicy(value: unknown, path: string): GtlConstructionPolicy {
  const row = record(value, path, ["kind", "policyRef", "requireCompleteEvidence", "requirePostEvidenceRefresh"]);
  return { kind: exactString(row.kind, "construction_policy", `${path}.kind`), policyRef: string(row.policyRef, `${path}.policyRef`), requireCompleteEvidence: bool(row.requireCompleteEvidence, `${path}.requireCompleteEvidence`), requirePostEvidenceRefresh: bool(row.requirePostEvidenceRefresh, `${path}.requirePostEvidenceRefresh`) };
}

function parseConstructionComposition(value: unknown, path: string): GtlConstructionComposition {
  const row = record(value, path, ["kind", "schemaVersion", "compositionRef", "compositionDigest", "graphFunctionRef", "authorities", "interactionProgramLocusRef", "closurePolicy"]);
  const authorities = array(row.authorities, `${path}.authorities`).map((entry, index) => parseConstructionAuthority(entry, `${path}.authorities[${index}]`));
  if (authorities.length !== 4) throw new TypeError(`${path}.authorities must contain exactly four rows`);
  return { kind: exactString(row.kind, "construction_composition", `${path}.kind`), schemaVersion: exactString(row.schemaVersion, "5.0.0", `${path}.schemaVersion`), compositionRef: string(row.compositionRef, `${path}.compositionRef`), compositionDigest: string(row.compositionDigest, `${path}.compositionDigest`) as GtlConstructionComposition["compositionDigest"], graphFunctionRef: string(row.graphFunctionRef, `${path}.graphFunctionRef`), authorities: authorities as unknown as GtlConstructionComposition["authorities"], interactionProgramLocusRef: string(row.interactionProgramLocusRef, `${path}.interactionProgramLocusRef`), closurePolicy: parseConstructionPolicy(row.closurePolicy, `${path}.closurePolicy`) };
}

export function admitProgram(input: unknown): Readonly<GtlProgram> {
  const row = record(parseInput(input), "Program", ["kind", "programRef", "version", "moduleRef", "starts", "callableMembership", "closureContractRef", "policies"], ["publicAssetTargets", "actionCatalog", "constructionComposition"]);
  const program: GtlProgram = {
    kind: exactString(row.kind, "gtl_program", "Program.kind"),
    programRef: string(row.programRef, "Program.programRef"),
    version: exactString(row.version, "5.0.0", "Program.version"),
    moduleRef: string(row.moduleRef, "Program.moduleRef"),
    starts: array(row.starts, "Program.starts").map((entry, index) => parseProgramStart(entry, `Program.starts[${index}]`)),
    callableMembership: stringArray(row.callableMembership, "Program.callableMembership"),
    closureContractRef: string(row.closureContractRef, "Program.closureContractRef"),
    policies: stringRecord(row.policies, "Program.policies"),
    ...(row.publicAssetTargets === undefined ? {} : { publicAssetTargets: array(row.publicAssetTargets, "Program.publicAssetTargets").map((entry, index) => parsePublicAssetTarget(entry, `Program.publicAssetTargets[${index}]`)) }),
    ...(row.actionCatalog === undefined ? {} : { actionCatalog: parseActionCatalog(row.actionCatalog, "Program.actionCatalog") }),
    ...(row.constructionComposition === undefined ? {} : { constructionComposition: parseConstructionComposition(row.constructionComposition, "Program.constructionComposition") }),
  };
  return serializeProgram(program);
}

function parseContract(value: unknown, path: string): ContractDeclaration {
  const row = record(value, path, ["contractRef", "contractVersion", "contractKind", "valueKind"]);
  return { contractRef: string(row.contractRef, `${path}.contractRef`), contractVersion: exactString(row.contractVersion, "5.0.0", `${path}.contractVersion`), contractKind: oneOf(row.contractKind, ["closure", "evidence", "failure", "input", "judgment", "output", "refusal", "transition"] as const, `${path}.contractKind`), valueKind: string(row.valueKind, `${path}.valueKind`) };
}

function parseEvaluator(value: unknown, path: string): EvaluatorDeclaration {
  const row = record(value, path, ["name", "regime", "description", "binding", "consumedFieldRefs", "tags"]);
  return { name: string(row.name, `${path}.name`), regime: oneOf(row.regime, COMPUTE_REGIME_VALUES, `${path}.regime`), description: string(row.description, `${path}.description`), binding: string(row.binding, `${path}.binding`), consumedFieldRefs: stringArray(row.consumedFieldRefs, `${path}.consumedFieldRefs`), tags: stringArray(row.tags, `${path}.tags`) };
}

function parseRule(value: unknown, path: string): RuleDeclaration {
  const row = record(value, path, ["name", "kind", "config", "tags"]);
  return { name: string(row.name, `${path}.name`), kind: string(row.kind, `${path}.kind`), config: jsonRecord(row.config, `${path}.config`), tags: stringArray(row.tags, `${path}.tags`) };
}

function parseImplementationBinding(value: unknown, path: string): ImplementationBinding {
  const row = record(value, path, ["kind", "bindingRef", "implementationRef", "packageName", "packageVersion", "modulePath", "namedSymbol", "computeRegime", "inputContractRef", "outputContractRef", "failureContractRef", "refusalContractRef"]);
  return { kind: exactString(row.kind, "implementation_binding", `${path}.kind`), bindingRef: string(row.bindingRef, `${path}.bindingRef`), implementationRef: string(row.implementationRef, `${path}.implementationRef`), packageName: string(row.packageName, `${path}.packageName`), packageVersion: string(row.packageVersion, `${path}.packageVersion`), modulePath: string(row.modulePath, `${path}.modulePath`), namedSymbol: string(row.namedSymbol, `${path}.namedSymbol`), computeRegime: oneOf(row.computeRegime, ["F_D", "F_P"] as const, `${path}.computeRegime`), inputContractRef: string(row.inputContractRef, `${path}.inputContractRef`), outputContractRef: string(row.outputContractRef, `${path}.outputContractRef`), failureContractRef: string(row.failureContractRef, `${path}.failureContractRef`), refusalContractRef: string(row.refusalContractRef, `${path}.refusalContractRef`) };
}

function parseClosureContract(value: unknown, path: string): ClosureContract {
  const row = record(value, path, ["kind", "closureContractRef", "predicateRef", "evidenceContractRef", "resultContractRef", "refusalContractRef", "refusalValueKind", "judgmentContractRef", "rejectionContractRef", "transitionContractRef", "replayProjectionRef", "terminalKind", "closureScope", "eventKindRefs"]);
  const basis = { kind: exactString(row.kind, "closure_contract", `${path}.kind`), closureContractRef: string(row.closureContractRef, `${path}.closureContractRef`), predicateRef: string(row.predicateRef, `${path}.predicateRef`), evidenceContractRef: string(row.evidenceContractRef, `${path}.evidenceContractRef`), resultContractRef: string(row.resultContractRef, `${path}.resultContractRef`), refusalContractRef: string(row.refusalContractRef, `${path}.refusalContractRef`), refusalValueKind: string(row.refusalValueKind, `${path}.refusalValueKind`), judgmentContractRef: string(row.judgmentContractRef, `${path}.judgmentContractRef`), rejectionContractRef: string(row.rejectionContractRef, `${path}.rejectionContractRef`), transitionContractRef: string(row.transitionContractRef, `${path}.transitionContractRef`), replayProjectionRef: string(row.replayProjectionRef, `${path}.replayProjectionRef`), terminalKind: exactString(row.terminalKind, "completed", `${path}.terminalKind`) };
  const eventKinds = stringArray(row.eventKindRefs, `${path}.eventKindRefs`);
  if (row.closureScope === "run" && eventKinds.join("\0") === "terminal_reached\0frame_closed\0graph_call_closed\0run_closed") return { ...basis, closureScope: "run", eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"] };
  if (row.closureScope === "graph_call" && eventKinds.join("\0") === "terminal_reached\0frame_closed\0graph_call_closed") return { ...basis, closureScope: "graph_call", eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed"] };
  throw new TypeError(`${path}.eventKindRefs does not match closureScope`);
}

function parseProductSemanticsBinding(value: unknown, path: string): ProductSemanticsBinding {
  const row = record(value, path, ["kind", "bindingRef", "packageName", "packageVersion", "modulePath", "namedSymbol"]);
  return { kind: exactString(row.kind, "product_semantics_binding", `${path}.kind`), bindingRef: string(row.bindingRef, `${path}.bindingRef`), packageName: string(row.packageName, `${path}.packageName`), packageVersion: string(row.packageVersion, `${path}.packageVersion`), modulePath: string(row.modulePath, `${path}.modulePath`), namedSymbol: string(row.namedSymbol, `${path}.namedSymbol`) };
}

function parseContribution(value: unknown, path: string): CatalogContribution {
  const row = record(value, path, ["handle", "kind", "declarationOrContractRef", "owningProductId", "programMembershipRefs", "readinessPrerequisiteRefs", "compatibilityRefs", "provenanceRefs"]);
  return { handle: string(row.handle, `${path}.handle`), kind: oneOf(row.kind, ["graph_function", "node_type", "overlay"] as const, `${path}.kind`), declarationOrContractRef: string(row.declarationOrContractRef, `${path}.declarationOrContractRef`), owningProductId: string(row.owningProductId, `${path}.owningProductId`), programMembershipRefs: stringArray(row.programMembershipRefs, `${path}.programMembershipRefs`), readinessPrerequisiteRefs: stringArray(row.readinessPrerequisiteRefs, `${path}.readinessPrerequisiteRefs`), compatibilityRefs: stringArray(row.compatibilityRefs, `${path}.compatibilityRefs`), provenanceRefs: stringArray(row.provenanceRefs, `${path}.provenanceRefs`) };
}

export function admitModule(input: unknown): Readonly<Module> {
  const row = record(parseInput(input), "Module", ["kind", "moduleRef", "moduleVersion", "owningProductId", "artifactDigest", "productContentDigest", "productManifestDigest", "descriptorRef", "contributionManifestRef", "productSemanticsBinding", "contracts", "evaluators", "rules", "implementationBindings", "closureContracts", "programs", "graphFunctions", "contributions"]);
  const moduleValue: ModulePublication = {
    kind: exactString(row.kind, "module_publication", "Module.kind"),
    moduleRef: string(row.moduleRef, "Module.moduleRef"),
    moduleVersion: exactString(row.moduleVersion, "5.0.0", "Module.moduleVersion"),
    owningProductId: string(row.owningProductId, "Module.owningProductId"),
    artifactDigest: string(row.artifactDigest, "Module.artifactDigest") as ModulePublication["artifactDigest"],
    productContentDigest: string(row.productContentDigest, "Module.productContentDigest") as ModulePublication["productContentDigest"],
    productManifestDigest: string(row.productManifestDigest, "Module.productManifestDigest") as ModulePublication["productManifestDigest"],
    descriptorRef: string(row.descriptorRef, "Module.descriptorRef"),
    contributionManifestRef: string(row.contributionManifestRef, "Module.contributionManifestRef"),
    productSemanticsBinding: parseProductSemanticsBinding(row.productSemanticsBinding, "Module.productSemanticsBinding"),
    contracts: array(row.contracts, "Module.contracts").map((entry, index) => parseContract(entry, `Module.contracts[${index}]`)),
    evaluators: array(row.evaluators, "Module.evaluators").map((entry, index) => parseEvaluator(entry, `Module.evaluators[${index}]`)),
    rules: array(row.rules, "Module.rules").map((entry, index) => parseRule(entry, `Module.rules[${index}]`)),
    implementationBindings: array(row.implementationBindings, "Module.implementationBindings").map((entry, index) => parseImplementationBinding(entry, `Module.implementationBindings[${index}]`)),
    closureContracts: array(row.closureContracts, "Module.closureContracts").map((entry, index) => parseClosureContract(entry, `Module.closureContracts[${index}]`)),
    programs: array(row.programs, "Module.programs").map((entry, index) => admitProgram(entry)),
    graphFunctions: array(row.graphFunctions, "Module.graphFunctions").map((entry) => admitGraphFunction(entry)),
    contributions: array(row.contributions, "Module.contributions").map((entry, index) => parseContribution(entry, `Module.contributions[${index}]`)),
  };
  const canonical = serializeModule(moduleValue);
  return deepFreeze({
    ...canonical,
    graphFunctions: canonical.graphFunctions.map(witnessGraphFunctionTerms),
  });
}

export const GTL_C_ADMISSION_DIAGNOSTIC_ID_VALUES = [
  "gtl-c-invalid-syntax",
] as const;

export interface CProgramAdmissionDiagnostic {
  readonly diagnosticId: (typeof GTL_C_ADMISSION_DIAGNOSTIC_ID_VALUES)[number];
  readonly path: "$";
  readonly message: string;
}

export type CProgramAdmission =
  | {
    readonly accepted: true;
    readonly program: Readonly<CProgramNode>;
    readonly diagnostics: readonly [];
  }
  | {
    readonly accepted: false;
    readonly program: null;
    readonly diagnostics: readonly [CProgramAdmissionDiagnostic];
  };

export function admitCProgramSyntax(input: unknown): CProgramAdmission {
  try {
    const program = witnessAdmittedCProgramTerm(
      serializeCProgramNode(parseCProgramNode(parseInput(input), "$")),
    );
    return deepFreeze({ accepted: true, program, diagnostics: [] });
  } catch (error) {
    return deepFreeze({
      accepted: false,
      program: null,
      diagnostics: [{
        diagnosticId: "gtl-c-invalid-syntax" as const,
        path: "$" as const,
        message: error instanceof Error ? error.message : String(error),
      }],
    });
  }
}
