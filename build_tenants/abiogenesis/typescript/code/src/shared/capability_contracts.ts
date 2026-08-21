import * as v from "valibot";

import {
  canonicalJson,
  compareUnicodeCodeUnits,
  type JsonValue,
} from "./canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "./digests.js";
import { deepFreeze } from "./immutable.js";
import { publicContractCoordinateSchema } from "./public_function_contracts.js";
import type {
  PublicContractCoordinate,
  PublicDefinitionKeyLike,
} from "./public_invocation.js";

export const CAPABILITY_DEFINITION_GRAPH_ID =
  "capability-definition-graph://abiogenesis/abg-5" as const;
export const CAPABILITY_DEFINITION_GRAPH_VERSION = "5.0.0" as const;
export const CAPABILITY_DEFINITION_GRAPH_ASSET_PATH =
  "contracts/capabilities/capability-definition-graph.json" as const;

export const MANDATORY_ABI5_CAPABILITY_IDS = Object.freeze([
  "abg.capability.gtl.declare@5",
  "abg.capability.gtl.admit@5",
  "abg.capability.gtl.serialize@5",
  "abg.capability.gtl.typecheck@5",
  "abg.capability.module.publish@5",
  "abg.capability.catalog.contribute@5",
  "abg.capability.catalog.invoke-graph-function@5",
  "abg.capability.catalog.apply-node-type@5",
  "abg.capability.catalog.apply-overlay@5",
  "abg.capability.runtime.execute-seven-term-c@5",
  "abg.capability.runtime.admit-fp-result@5",
  "abg.capability.runtime.replay-continuation@5",
  "abg.capability.operator.public-contract@5",
  "abg.capability.install.bind-products@5",
  "abg.capability.qualification.self-conformance@5",
  "abg.capability.graph-function.consensus@5",
] as const);

export interface CapabilityContractRegisterRow {
  readonly capabilityId: string;
  readonly capabilityVersion: "5.0.0";
  readonly owningPublicContractIds: readonly [string, ...string[]];
  readonly projectedPublicContractIds: readonly [string, ...string[]];
  readonly owningPublicDefinitionKeys: readonly PublicDefinitionKeyLike[];
  readonly projectedPublicDefinitionKeys: readonly PublicDefinitionKeyLike[];
  readonly dependentCapabilityIds: readonly string[];
  readonly effectRefs: readonly string[];
  readonly boundedProofRefs: readonly [string, ...string[]];
}

const ST2A_GRAPH_PROOF = "proof://t287/st2a-g/capability-definition-graph";

function registerRow(input: Omit<CapabilityContractRegisterRow,
  | "capabilityVersion"
  | "owningPublicDefinitionKeys"
  | "effectRefs"
  | "boundedProofRefs"
>): CapabilityContractRegisterRow {
  return deepFreeze({
    ...input,
    capabilityVersion: "5.0.0" as const,
    owningPublicDefinitionKeys: input.projectedPublicDefinitionKeys,
    effectRefs: [],
    boundedProofRefs: [ST2A_GRAPH_PROOF] as [string],
  });
}

/**
 * The one Product-owned capability authoring surface. It is immutable
 * module data, never a runtime registry or dispatch table.
 */
export const DS1_CAPABILITY_CONTRACT_REGISTER = deepFreeze([
  registerRow({ capabilityId: "abg.capability.gtl.declare@5", owningPublicContractIds: ["abg.operation.conformance.evaluate"], projectedPublicContractIds: ["abg.operation.conformance.evaluate", "abg.contract.gtl.root-declaration"], projectedPublicDefinitionKeys: [], dependentCapabilityIds: [] }),
  registerRow({ capabilityId: "abg.capability.gtl.admit@5", owningPublicContractIds: ["abg.operation.conformance.evaluate"], projectedPublicContractIds: ["abg.operation.conformance.evaluate", "abg.contract.gtl.materialization-root"], projectedPublicDefinitionKeys: [], dependentCapabilityIds: ["abg.capability.gtl.declare@5"] }),
  registerRow({ capabilityId: "abg.capability.gtl.serialize@5", owningPublicContractIds: ["abg.operation.conformance.evaluate"], projectedPublicContractIds: ["abg.operation.conformance.evaluate"], projectedPublicDefinitionKeys: [], dependentCapabilityIds: ["abg.capability.gtl.declare@5", "abg.capability.gtl.admit@5"] }),
  registerRow({ capabilityId: "abg.capability.gtl.typecheck@5", owningPublicContractIds: ["abg.operation.conformance.evaluate"], projectedPublicContractIds: ["abg.operation.conformance.evaluate", "abg.contract.gtl.validation-root"], projectedPublicDefinitionKeys: [{ operationId: "abg.operation.conformance.evaluate", memberKey: "gtl_program" }], dependentCapabilityIds: ["abg.capability.gtl.admit@5"] }),
  registerRow({ capabilityId: "abg.capability.module.publish@5", owningPublicContractIds: ["abg.operation.catalog.admit"], projectedPublicContractIds: ["abg.operation.catalog.admit"], projectedPublicDefinitionKeys: [], dependentCapabilityIds: ["abg.capability.gtl.admit@5", "abg.capability.gtl.serialize@5"] }),
  registerRow({ capabilityId: "abg.capability.catalog.contribute@5", owningPublicContractIds: ["abg.operation.catalog.admit"], projectedPublicContractIds: ["abg.operation.catalog.admit", "abg.contract.hog.graph-function-catalog"], projectedPublicDefinitionKeys: [{ operationId: "abg.operation.catalog.admit", memberKey: "admit" }], dependentCapabilityIds: [] }),
  registerRow({ capabilityId: "abg.capability.catalog.invoke-graph-function@5", owningPublicContractIds: ["abg.operation.run.invoke"], projectedPublicContractIds: ["abg.operation.run.invoke", "abg.contract.product.invocation-root", "abg.contract.product.implementation-resolution-root", "abg.contract.hog.traversal-root", "abg.schema.consensus-subject", "abg.schema.consensus-panel", "abg.schema.consensus-reviewer-profile", "abg.schema.review-findings", "abg.schema.review-rulings", "abg.schema.consensus-round-policy", "abg.schema.consensus-round-outcome", "abg.schema.consensus-result", "abg.schema.ticket-consensus-projection", "abg.vocabulary.review-ruling-kind", "abg.vocabulary.consensus-round-outcome", "abg.vocabulary.consensus-fh-decision"], projectedPublicDefinitionKeys: [{ operationId: "abg.operation.run.invoke", memberKey: "invoke" }, { operationId: "abg.operation.run.invoke", memberKey: "start" }], dependentCapabilityIds: ["abg.capability.gtl.admit@5", "abg.capability.module.publish@5"] }),
  registerRow({ capabilityId: "abg.capability.catalog.apply-node-type@5", owningPublicContractIds: ["abg.operation.catalog.apply"], projectedPublicContractIds: ["abg.operation.catalog.apply"], projectedPublicDefinitionKeys: [{ operationId: "abg.operation.catalog.apply", memberKey: "node_type" }], dependentCapabilityIds: ["abg.capability.catalog.contribute@5"] }),
  registerRow({ capabilityId: "abg.capability.catalog.apply-overlay@5", owningPublicContractIds: ["abg.operation.catalog.apply"], projectedPublicContractIds: ["abg.operation.catalog.apply"], projectedPublicDefinitionKeys: [{ operationId: "abg.operation.catalog.apply", memberKey: "overlay" }], dependentCapabilityIds: ["abg.capability.catalog.contribute@5"] }),
  registerRow({ capabilityId: "abg.capability.runtime.execute-seven-term-c@5", owningPublicContractIds: ["abg.operation.run.invoke"], projectedPublicContractIds: ["abg.operation.run.invoke", "abg.contract.abg.c-call-root", "abg.contract.abg.execution-basis-root", "abg.contract.abg.invocation-root-admission", "abg.contract.abg.open-call-root", "abg.contract.hog.judgment-transition-root"], projectedPublicDefinitionKeys: [{ operationId: "abg.operation.run.invoke", memberKey: "invoke" }, { operationId: "abg.operation.run.invoke", memberKey: "start" }], dependentCapabilityIds: ["abg.capability.gtl.admit@5", "abg.capability.catalog.invoke-graph-function@5"] }),
  registerRow({ capabilityId: "abg.capability.runtime.admit-fp-result@5", owningPublicContractIds: ["abg.operation.result.assess"], projectedPublicContractIds: ["abg.operation.result.assess"], projectedPublicDefinitionKeys: [{ operationId: "abg.operation.result.assess", memberKey: "assess" }, { operationId: "abg.operation.project.read", memberKey: "assessment_evidence" }], dependentCapabilityIds: ["abg.capability.runtime.execute-seven-term-c@5"] }),
  registerRow({ capabilityId: "abg.capability.runtime.replay-continuation@5", owningPublicContractIds: ["abg.operation.project.read", "abg.operation.run.continue", "abg.operation.interaction.respond"], projectedPublicContractIds: ["abg.operation.project.read", "abg.operation.run.continue", "abg.operation.interaction.respond", "abg.contract.abg.replay-root"], projectedPublicDefinitionKeys: ["run_status", "graph_call_status", "run_result", "graph_call_result", "run_evidence", "graph_call_evidence", "result_evidence", "workspace_replay", "run_replay", "graph_call_replay", "interaction_replay", "continuation_replay", "c_call_replay", "run_gaps", "run_lawful_actions"].map((memberKey) => ({ operationId: "abg.operation.project.read", memberKey })).concat(["current_intent", "selected_action"].map((memberKey) => ({ operationId: "abg.operation.run.continue", memberKey })), ["answer_escalation", "approve", "assess", "reject", "select"].map((memberKey) => ({ operationId: "abg.operation.interaction.respond", memberKey }))), dependentCapabilityIds: ["abg.capability.runtime.execute-seven-term-c@5"] }),
  registerRow({ capabilityId: "abg.capability.operator.public-contract@5", owningPublicContractIds: ["abg.operation.workspace.create", "abg.operation.workspace.open", "abg.operation.catalog.view", "abg.operation.project.read", "abg.operation.interaction.respond", "abg.operation.witness.admit", "abg.operation.release.snapshot"], projectedPublicContractIds: ["abg.operation.workspace.create", "abg.operation.workspace.open", "abg.operation.catalog.view", "abg.operation.project.read", "abg.operation.interaction.respond", "abg.operation.witness.admit", "abg.operation.release.snapshot", "abg.schema.public-operation-contract", "abg.schema.public-operation-invocation", "abg.schema.public-operation-outcome"], projectedPublicDefinitionKeys: ["catalog_list", "catalog_describe", "workspace_status", "release_evidence", "ticket_consensus", "witness_evidence", "workspace_gaps"].map((memberKey) => ({ operationId: "abg.operation.project.read", memberKey })).concat(["clean", "imported"].map((memberKey) => ({ operationId: "abg.operation.workspace.create", memberKey })), [{ operationId: "abg.operation.workspace.open", memberKey: "open" }, { operationId: "abg.operation.catalog.view", memberKey: "allowlist" }], ["answer_escalation", "approve", "assess", "reject", "select"].map((memberKey) => ({ operationId: "abg.operation.interaction.respond", memberKey })), ["attest", "hygiene-stamp", "intake", "reprice", "run-resumed", "run-stopped"].map((memberKey) => ({ operationId: "abg.operation.witness.admit", memberKey })), ["published_rc", "tapped_release"].map((memberKey) => ({ operationId: "abg.operation.release.snapshot", memberKey }))), dependentCapabilityIds: [] }),
  registerRow({ capabilityId: "abg.capability.install.bind-products@5", owningPublicContractIds: ["abg.operation.product.verify", "abg.operation.product.resolve", "abg.operation.product.install", "abg.operation.workspace.bind", "abg.operation.product.materialize"], projectedPublicContractIds: ["abg.operation.product.verify", "abg.operation.product.resolve", "abg.operation.product.install", "abg.operation.workspace.bind", "abg.operation.product.materialize", "abg.contract.abg.environment-admission", "abg.contract.product.verification", "abg.schema.product-toolchain-manifest", "abg.schema.public-contract-catalog"], projectedPublicDefinitionKeys: [{ operationId: "abg.operation.product.verify", memberKey: "verify" }, { operationId: "abg.operation.product.resolve", memberKey: "resolve" }, { operationId: "abg.operation.product.install", memberKey: "install" }, { operationId: "abg.operation.workspace.bind", memberKey: "bind" }, { operationId: "abg.operation.product.materialize", memberKey: "configuration" }, { operationId: "abg.operation.product.materialize", memberKey: "context_bootstrap" }, { operationId: "abg.operation.project.read", memberKey: "install_evidence" }], dependentCapabilityIds: [] }),
  registerRow({ capabilityId: "abg.capability.qualification.self-conformance@5", owningPublicContractIds: ["abg.operation.conformance.evaluate", "abg.operation.release.snapshot"], projectedPublicContractIds: ["abg.operation.conformance.evaluate", "abg.operation.release.snapshot"], projectedPublicDefinitionKeys: [{ operationId: "abg.operation.release.snapshot", memberKey: "published_rc" }, { operationId: "abg.operation.release.snapshot", memberKey: "tapped_release" }], dependentCapabilityIds: ["abg.capability.gtl.typecheck@5", "abg.capability.operator.public-contract@5"] }),
  registerRow({ capabilityId: "abg.capability.graph-function.consensus@5", owningPublicContractIds: ["abg.operation.run.invoke"], projectedPublicContractIds: ["abg.schema.consensus-subject", "abg.schema.consensus-panel", "abg.schema.consensus-reviewer-profile", "abg.schema.consensus-submitter-profile", "abg.schema.consensus-submitter-response", "abg.schema.review-findings", "abg.schema.review-rulings", "abg.schema.consensus-ruling-overlay", "abg.schema.consensus-escalation-decision", "abg.schema.consensus-round-policy", "abg.schema.consensus-round-outcome", "abg.schema.consensus-result", "abg.schema.ticket-consensus-projection"], projectedPublicDefinitionKeys: [], dependentCapabilityIds: ["abg.capability.catalog.invoke-graph-function@5", "abg.capability.runtime.replay-continuation@5"] }),
] as const satisfies readonly CapabilityContractRegisterRow[]);

const registerIds = DS1_CAPABILITY_CONTRACT_REGISTER.map(({ capabilityId }) =>
  capabilityId
);
if (
  new Set(registerIds).size !== registerIds.length ||
  [...registerIds].sort(compareUnicodeCodeUnits).join("\0") !==
    [...MANDATORY_ABI5_CAPABILITY_IDS].sort(compareUnicodeCodeUnits).join("\0")
) {
  throw new TypeError("capability register identity roster is not exact");
}

export function capabilityRefsForContract(contractId: string): readonly string[] {
  return Object.freeze(DS1_CAPABILITY_CONTRACT_REGISTER
    .filter(({ projectedPublicContractIds }) =>
      projectedPublicContractIds.includes(contractId)
    )
    .map(({ capabilityId }) => capabilityId)
    .sort(compareUnicodeCodeUnits));
}

export function capabilityRefsForDefinition(
  definitionKey: PublicDefinitionKeyLike,
): readonly string[] {
  return Object.freeze(DS1_CAPABILITY_CONTRACT_REGISTER
    .filter(({ projectedPublicDefinitionKeys }) =>
      projectedPublicDefinitionKeys.some((candidate) =>
        candidate.operationId === definitionKey.operationId &&
        candidate.memberKey === definitionKey.memberKey
      )
    )
    .map(({ capabilityId }) => capabilityId)
    .sort(compareUnicodeCodeUnits));
}

export interface CapabilityDefinitionDependencyCoordinate {
  readonly capabilityId: string;
  readonly capabilityDefinitionRef: string;
  readonly capabilityDefinitionDigest: Sha256Digest;
}

export interface CapabilityDefinitionGraphRow {
  readonly capabilityId: string;
  readonly capabilityVersion: "5.0.0";
  readonly capabilityDefinitionRef: string;
  readonly capabilityDefinitionDigest: Sha256Digest;
  readonly owningPublicContracts: readonly [
    PublicContractCoordinate,
    ...PublicContractCoordinate[],
  ];
  readonly dependentCapabilities:
    readonly CapabilityDefinitionDependencyCoordinate[];
  readonly effectRefs: readonly string[];
  readonly boundedProofRefs: readonly [string, ...string[]];
}

export interface CapabilityDefinitionGraph {
  readonly kind: "abg_capability_definition_graph";
  readonly schemaVersion: "5.0.0";
  readonly graphId: typeof CAPABILITY_DEFINITION_GRAPH_ID;
  readonly graphVersion: typeof CAPABILITY_DEFINITION_GRAPH_VERSION;
  readonly graphDigest: Sha256Digest;
  readonly rows: readonly [CapabilityDefinitionGraphRow, ...CapabilityDefinitionGraphRow[]];
}

export interface CapabilityDefinitionGraphCoordinate {
  readonly graphId: typeof CAPABILITY_DEFINITION_GRAPH_ID;
  readonly graphVersion: typeof CAPABILITY_DEFINITION_GRAPH_VERSION;
  readonly graphDigest: Sha256Digest;
}

const digestSchema = v.pipe(v.string(), v.regex(/^sha256:[0-9a-f]{64}$/u));
const dependencyCoordinateSchema = v.strictObject({
  capabilityId: v.pipe(v.string(), v.nonEmpty()),
  capabilityDefinitionRef: v.pipe(v.string(), v.nonEmpty()),
  capabilityDefinitionDigest: digestSchema,
});
const graphRowSchema = v.strictObject({
  capabilityId: v.pipe(v.string(), v.nonEmpty()),
  capabilityVersion: v.literal("5.0.0"),
  capabilityDefinitionRef: v.pipe(v.string(), v.nonEmpty()),
  capabilityDefinitionDigest: digestSchema,
  owningPublicContracts: v.pipe(
    v.array(publicContractCoordinateSchema),
    v.minLength(1),
  ),
  dependentCapabilities: v.array(dependencyCoordinateSchema),
  effectRefs: v.array(v.pipe(v.string(), v.nonEmpty())),
  boundedProofRefs: v.pipe(v.array(v.pipe(v.string(), v.nonEmpty())), v.minLength(1)),
});
export const capabilityDefinitionGraphSchema = v.strictObject({
  kind: v.literal("abg_capability_definition_graph"),
  schemaVersion: v.literal("5.0.0"),
  graphId: v.literal(CAPABILITY_DEFINITION_GRAPH_ID),
  graphVersion: v.literal(CAPABILITY_DEFINITION_GRAPH_VERSION),
  graphDigest: digestSchema,
  rows: v.pipe(v.array(graphRowSchema), v.minLength(1)),
});

function rowDefinitionBody(row: CapabilityDefinitionGraphRow): JsonValue {
  const {
    capabilityDefinitionRef: _ref,
    capabilityDefinitionDigest: _digest,
    ...body
  } = row;
  return body as unknown as JsonValue;
}

export function capabilityDefinitionGraphDigest(
  graph: CapabilityDefinitionGraph,
): Sha256Digest {
  const { graphDigest: _graphDigest, ...body } = graph;
  return sha256Canonical(body as unknown as JsonValue);
}

export function constructCapabilityDefinitionGraph(
  publicContractCoordinates: readonly PublicContractCoordinate[],
): CapabilityDefinitionGraph {
  const contracts = new Map<string, PublicContractCoordinate>();
  const definitionSlots = new Map<string, PublicContractCoordinate[]>();
  const coordinateKeys = new Set<string>();
  for (const coordinate of publicContractCoordinates) {
    const admitted = v.safeParse(publicContractCoordinateSchema, coordinate);
    if (!admitted.success) {
      throw new TypeError("invalid public contract coordinate in graph basis");
    }
    const admittedCoordinate = admitted.output as PublicContractCoordinate;
    const coordinateKey = canonicalJson(
      admittedCoordinate as unknown as JsonValue,
    );
    if (coordinateKeys.has(coordinateKey)) {
      throw new TypeError("duplicate public contract coordinate in graph basis");
    }
    coordinateKeys.add(coordinateKey);
    if (admittedCoordinate.nestedSelector.selectorKind === "flat_contract") {
      const contractId = admittedCoordinate.flatRow.contractId;
      if (contracts.has(contractId)) {
        throw new TypeError(`duplicate graph owner contract ${contractId}`);
      }
      contracts.set(contractId, deepFreeze(admittedCoordinate));
    } else if (
      admittedCoordinate.nestedSelector.selectorKind ===
        "operation_definition_slot"
    ) {
      const { definitionKey } = admittedCoordinate.nestedSelector;
      const key = `${definitionKey.operationId}\0${definitionKey.memberKey}`;
      definitionSlots.set(key, [
        ...(definitionSlots.get(key) ?? []),
        deepFreeze(admittedCoordinate),
      ]);
    }
  }
  for (const [key, coordinates] of definitionSlots) {
    const operationId = key.slice(0, key.indexOf("\0"));
    const flat = contracts.get(operationId);
    if (
      flat === undefined ||
      coordinates.some((coordinate) =>
        canonicalJson(coordinate.contractCatalog as unknown as JsonValue) !==
          canonicalJson(flat.contractCatalog as unknown as JsonValue) ||
        canonicalJson(coordinate.flatRow as unknown as JsonValue) !==
          canonicalJson(flat.flatRow as unknown as JsonValue)
      )
    ) {
      throw new TypeError(`crossed operation definition catalog ${key}`);
    }
    const refs = new Set<string>();
    const slots = new Set<string>();
    for (const coordinate of coordinates) {
      const selector = coordinate.nestedSelector;
      if (selector.selectorKind !== "operation_definition_slot") continue;
      const field = selector.slot === "non_terminal"
        ? "nonTerminalContract"
        : `${selector.slot}Contract`;
      const suffix = `/${field}/identity`;
      if (!selector.definitionRef.endsWith(suffix)) {
        throw new TypeError(`crossed operation definition ref ${key}`);
      }
      refs.add(selector.definitionRef.slice(0, -suffix.length));
      if (slots.has(selector.slot)) {
        throw new TypeError(`duplicate operation definition slot ${key}`);
      }
      slots.add(selector.slot);
    }
    if (
      refs.size !== 1 ||
      !slots.has("request") ||
      !slots.has("result") ||
      !slots.has("refusal")
    ) {
      throw new TypeError(`incomplete operation definition slots ${key}`);
    }
  }
  const definitions = new Map(DS1_CAPABILITY_CONTRACT_REGISTER.map((row) => [
    row.capabilityId,
    row,
  ]));
  const built = new Map<string, CapabilityDefinitionGraphRow>();
  const visiting = new Set<string>();
  const buildRow = (capabilityId: string): CapabilityDefinitionGraphRow => {
    const existing = built.get(capabilityId);
    if (existing !== undefined) return existing;
    const definition = definitions.get(capabilityId);
    if (definition === undefined) {
      throw new TypeError(`unknown capability dependency ${capabilityId}`);
    }
    if (visiting.has(capabilityId)) {
      throw new TypeError(`cyclic capability dependency ${capabilityId}`);
    }
    visiting.add(capabilityId);
    const dependentCapabilities = definition.dependentCapabilityIds
      .map((dependencyId) => {
        const dependency = buildRow(dependencyId);
        return deepFreeze({
          capabilityId: dependency.capabilityId,
          capabilityDefinitionRef: dependency.capabilityDefinitionRef,
          capabilityDefinitionDigest: dependency.capabilityDefinitionDigest,
        });
      })
      .sort((left, right) =>
        compareUnicodeCodeUnits(left.capabilityId, right.capabilityId)
      );
    const flatOwningPublicContracts = definition.owningPublicContractIds
      .map((contractId) => {
        const coordinate = contracts.get(contractId);
        if (coordinate === undefined) {
          throw new TypeError(`missing graph owner contract ${contractId}`);
        }
        return coordinate;
      })
      .sort((left, right) =>
        compareUnicodeCodeUnits(
          left.flatRow.contractId,
          right.flatRow.contractId,
        )
      );
    const nestedOwningPublicContracts = definition.owningPublicDefinitionKeys
      .flatMap((definitionKey) => {
        const key = `${definitionKey.operationId}\0${definitionKey.memberKey}`;
        const coordinates = definitionSlots.get(key);
        if (coordinates === undefined) {
          throw new TypeError(`missing graph owner definition ${key}`);
        }
        return coordinates;
      });
    const owningPublicContracts = [
      ...flatOwningPublicContracts,
      ...nestedOwningPublicContracts,
    ].sort((left, right) => compareUnicodeCodeUnits(
      canonicalJson(left as unknown as JsonValue),
      canonicalJson(right as unknown as JsonValue),
    )) as [PublicContractCoordinate, ...PublicContractCoordinate[]];
    const body = deepFreeze({
      capabilityId: definition.capabilityId,
      capabilityVersion: definition.capabilityVersion,
      owningPublicContracts,
      dependentCapabilities,
      effectRefs: [...definition.effectRefs].sort(compareUnicodeCodeUnits),
      boundedProofRefs: [...definition.boundedProofRefs].sort(compareUnicodeCodeUnits) as [string, ...string[]],
    });
    const capabilityDefinitionDigest = sha256Canonical(body as unknown as JsonValue);
    const row = deepFreeze({
      ...body,
      capabilityDefinitionRef:
        `capability-definition://abiogenesis/${capabilityDefinitionDigest.slice(7)}`,
      capabilityDefinitionDigest,
    });
    visiting.delete(capabilityId);
    built.set(capabilityId, row);
    return row;
  };
  const rows = [...definitions.keys()].sort(compareUnicodeCodeUnits).map(buildRow) as [
    CapabilityDefinitionGraphRow,
    ...CapabilityDefinitionGraphRow[],
  ];
  const body = deepFreeze({
    kind: "abg_capability_definition_graph" as const,
    schemaVersion: "5.0.0" as const,
    graphId: CAPABILITY_DEFINITION_GRAPH_ID,
    graphVersion: CAPABILITY_DEFINITION_GRAPH_VERSION,
    rows,
  });
  const graph = deepFreeze({
    ...body,
    graphDigest: sha256Canonical(body as unknown as JsonValue),
  });
  if (!v.safeParse(capabilityDefinitionGraphSchema, graph).success) {
    throw new TypeError("constructed capability graph violates its strict schema");
  }
  return graph;
}

export function isCapabilityDefinitionGraph(
  value: unknown,
): value is CapabilityDefinitionGraph {
  const parsed = v.safeParse(capabilityDefinitionGraphSchema, value);
  if (!parsed.success) return false;
  const graph = parsed.output as unknown as CapabilityDefinitionGraph;
  try {
    const owners = graph.rows.flatMap((row) => row.owningPublicContracts);
    const uniqueOwners = [...new Map(owners.map((owner) => [
      canonicalJson(owner as unknown as JsonValue),
      owner,
    ])).values()];
    const expected = constructCapabilityDefinitionGraph(uniqueOwners);
    return canonicalJson(expected as unknown as JsonValue) ===
      canonicalJson(graph as unknown as JsonValue) &&
      graph.rows.every((row) =>
        row.capabilityDefinitionDigest === sha256Canonical(rowDefinitionBody(row))
      ) &&
      graph.graphDigest === capabilityDefinitionGraphDigest(graph);
  } catch {
    return false;
  }
}

export function capabilityDefinitionGraphCoordinate(
  graph: CapabilityDefinitionGraph,
): CapabilityDefinitionGraphCoordinate {
  if (!isCapabilityDefinitionGraph(graph)) {
    throw new TypeError("invalid capability definition graph");
  }
  return deepFreeze({
    graphId: graph.graphId,
    graphVersion: graph.graphVersion,
    graphDigest: graph.graphDigest,
  });
}

export function capabilityDefinitionGraphAssetBytes(
  graph: CapabilityDefinitionGraph,
): Uint8Array {
  if (!isCapabilityDefinitionGraph(graph)) {
    throw new TypeError("invalid capability definition graph");
  }
  return new TextEncoder().encode(canonicalJson(graph as unknown as JsonValue));
}
