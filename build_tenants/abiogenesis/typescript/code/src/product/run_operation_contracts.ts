import * as v from "valibot";

import {
  contractBoundValueSchema,
  type ExactOwnerOperationPort,
  jsonValueSchema,
  nonblankSchema,
  nonemptyRefDigestSetSchema,
  ownerAuthorityDigest,
  ownerContractPacket,
  ownerMetadata,
  refDigestSchema,
  refSetSchema,
  refusalSchema,
  requestDependentAuthoritySlot,
  RUNTIME_NONTERMINAL_ADAPTER_EXIT_MAP,
  sourceBasisSchema,
} from "../shared/public_function_contracts.js";

const RUN_AUTHORITY = "authority://abiogenesis/product/run-invocation@5";
const CONTINUE_AUTHORITY =
  "authority://abiogenesis/product/run-continuation@5";

const publicTargetSchema = v.union([
  v.strictObject({ kind: v.literal("next") }),
  v.strictObject({ kind: v.literal("graph_function"), handle: nonblankSchema }),
  v.strictObject({ kind: v.literal("asset"), handle: nonblankSchema }),
  v.strictObject({ kind: v.literal("declared_start"), start: refDigestSchema }),
]);

const runInvokeRefusalSchema = refusalSchema([
  "invalid_program",
  "invalid_graph_function",
  "invalid_input",
  "invalid_view",
  "invalid_intent",
  "invalid_capability",
  "invalid_target",
  "invalid_mode",
  "invalid_until",
]);

function runResultSchema(invocationKind: "invoke" | "start") {
  return v.strictObject({
    invocationKind: v.literal(invocationKind),
    run: refDigestSchema,
    graphCall: invocationKind === "invoke"
      ? refDigestSchema
      : v.nullable(refDigestSchema),
    disposition: v.picklist(["completed", "blocked", "runtime_failed"]),
    result: v.nullable(refDigestSchema),
    stop: v.nullable(refDigestSchema),
    gap: v.nullable(refDigestSchema),
    interaction: v.nullable(refDigestSchema),
    evidence: nonemptyRefDigestSetSchema,
    replay: refDigestSchema,
  });
}

function runNonTerminalSchema(invocationKind: "invoke" | "start") {
  return v.strictObject({
    invocationKind: v.literal(invocationKind),
    disposition: v.picklist(["held", "gap_stop"]),
    run: refDigestSchema,
    graphCall: v.nullable(refDigestSchema),
    interaction: v.nullable(refDigestSchema),
    gap: v.nullable(refDigestSchema),
    evidence: nonemptyRefDigestSetSchema,
    replay: refDigestSchema,
  });
}

function runMetadata(member: "invoke" | "start") {
  return ownerMetadata({
    authorityClass: "write",
    effectClass: "abg_traversal",
    eventAdmission: "owning_semantic_authority",
    actorRequirement: "required",
    workspaceBindingRequirement: "exactly_one",
    authoritySlotRequirements: [
      "capability_grants",
      "workspace_binding",
      "product_set",
      "dependency_lock",
      "catalog_scope",
      "execution_program",
      ...(member === "invoke"
        ? ["graph_function" as const]
        : [requestDependentAuthoritySlot(
          "graph_function",
          ["target", "kind"],
          ["graph_function"],
        )]),
      "input_contract",
      "session_policy",
      "actor",
      "transport_steering",
    ],
    capabilityRefs: [
      "abg.capability.catalog.invoke-graph-function@5",
      "abg.capability.runtime.execute-seven-term-c@5",
    ],
    defaults: member === "start"
      ? { fhMode: "direct", rootMode: "supervised" }
      : {},
    closedDomains: member === "start"
      ? {
        scope: ["program"],
        targetKind: ["next", "graph_function", "asset", "declared_start"],
        until: ["converged"],
        fhMode: ["direct", "human-proxy"],
        rootMode: ["direct", "supervised"],
      }
      : {},
    sdkCoordinate: "sdk.run.invoke",
    cliCoordinate: `run ${member}`,
    adapterExitMap: RUNTIME_NONTERMINAL_ADAPTER_EXIT_MAP,
  });
}

const invoke = ownerContractPacket(
  { operationId: "abg.operation.run.invoke", memberKey: "invoke" },
  v.strictObject({
    program: refDigestSchema,
    catalogHandle: nonblankSchema,
    inputContract: refDigestSchema,
    input: jsonValueSchema,
    catalogView: refDigestSchema,
    allowlist: refSetSchema,
    sourceBasis: sourceBasisSchema,
  }),
  runResultSchema("invoke"),
  runInvokeRefusalSchema,
  runNonTerminalSchema("invoke"),
  {
    abstractModule: "Product.RunInvocation",
    exportName: "RUN_OPERATION_CONTRACTS",
    memberPath: ["invoke", "invoke"],
    port: "RunInvocationPort.invoke",
    authorityRef: RUN_AUTHORITY,
    authorityDigest: ownerAuthorityDigest(RUN_AUTHORITY),
  },
  runMetadata("invoke"),
);

const start = ownerContractPacket(
  { operationId: "abg.operation.run.invoke", memberKey: "start" },
  v.strictObject({
    program: refDigestSchema,
    scope: v.literal("program"),
    target: publicTargetSchema,
    until: v.literal("converged"),
    catalogView: refDigestSchema,
    allowlist: refSetSchema,
    input: contractBoundValueSchema,
    fhMode: v.optional(v.picklist(["direct", "human-proxy"]), "direct"),
    rootMode: v.optional(v.picklist(["direct", "supervised"]), "supervised"),
    sourceBasis: sourceBasisSchema,
  }),
  runResultSchema("start"),
  runInvokeRefusalSchema,
  runNonTerminalSchema("start"),
  {
    abstractModule: "Product.RunInvocation",
    exportName: "RUN_OPERATION_CONTRACTS",
    memberPath: ["invoke", "start"],
    port: "RunInvocationPort.start",
    authorityRef: RUN_AUTHORITY,
    authorityDigest: ownerAuthorityDigest(RUN_AUTHORITY),
  },
  runMetadata("start"),
);

const continueRefusalSchema = refusalSchema([
  "missing_continuation",
  "resolved_continuation",
  "intent_mismatch",
  "response_mismatch",
  "replay_mismatch",
  "basis_mismatch",
  "stale_action",
  "action_mismatch",
  "reprice_mismatch",
]);

function continueContract<const TMember extends
  "current_intent" | "selected_action">(member: TMember) {
  const request = member === "current_intent"
    ? v.strictObject({
      run: refDigestSchema,
      continuation: refDigestSchema,
      currentIntent: refDigestSchema,
      continuationInput: refDigestSchema,
      expectedBasis: refDigestSchema,
    })
    : v.strictObject({
      run: refDigestSchema,
      continuation: refDigestSchema,
      selectedAction: refDigestSchema,
      basisRelation: v.union([
        v.strictObject({ kind: v.literal("same_basis") }),
        v.strictObject({
          kind: v.literal("authority_changed"),
          coveringReprice: refDigestSchema,
        }),
      ]),
    });
  const result = v.strictObject({
    continuationKind: v.literal(member),
    run: refDigestSchema,
    graphCall: v.nullable(refDigestSchema),
    admittedIntent: member === "selected_action"
      ? refDigestSchema
      : v.null(),
    successor: refDigestSchema,
    disposition: v.picklist(["completed", "blocked", "runtime_failed"]),
    evidence: nonemptyRefDigestSetSchema,
    replay: refDigestSchema,
  });
  const nonTerminal = v.strictObject({
    continuationKind: v.literal(member),
    disposition: v.picklist(["held", "gap_stop"]),
    run: refDigestSchema,
    continuation: refDigestSchema,
    evidence: nonemptyRefDigestSetSchema,
    replay: refDigestSchema,
  });
  return ownerContractPacket(
    { operationId: "abg.operation.run.continue", memberKey: member } as const,
    request,
    result,
    continueRefusalSchema,
    nonTerminal,
    {
      abstractModule: "Product.RunContinuation",
      exportName: "RUN_OPERATION_CONTRACTS",
      memberPath: ["continue", member],
      port: `RunContinuationPort.${member}`,
      authorityRef: CONTINUE_AUTHORITY,
      authorityDigest: ownerAuthorityDigest(CONTINUE_AUTHORITY),
    },
    ownerMetadata({
      authorityClass: "write",
      effectClass: "abg_continuation",
      eventAdmission: "owning_semantic_authority",
      actorRequirement: "required",
      workspaceBindingRequirement: "exactly_one",
      authoritySlotRequirements: [
        "capability_grants",
        "workspace_binding",
        "product_set",
        "dependency_lock",
        "catalog_scope",
        "execution_program",
        "graph_function",
        "input_contract",
        "session_policy",
        "actor",
        "transport_steering",
        "execution_basis",
      ],
      capabilityRefs: ["abg.capability.runtime.replay-continuation@5"],
      defaults: {},
      closedDomains: { continuationKind: [member] },
      sdkCoordinate: "sdk.run.continue",
      cliCoordinate: `run continue --mode ${member}`,
      adapterExitMap: RUNTIME_NONTERMINAL_ADAPTER_EXIT_MAP,
    }),
  );
}

const currentIntent = continueContract("current_intent");
const selectedAction = continueContract("selected_action");

export const RUN_OPERATION_CONTRACTS = Object.freeze({
  invoke: Object.freeze({ invoke, start }),
  continue: Object.freeze({
    current_intent: currentIntent,
    selected_action: selectedAction,
  }),
});

export interface RunInvocationPort {
  readonly invoke: ExactOwnerOperationPort<typeof invoke>;
  readonly start: ExactOwnerOperationPort<typeof start>;
}

export interface RunContinuationPort {
  readonly current_intent: ExactOwnerOperationPort<typeof currentIntent>;
  readonly selected_action: ExactOwnerOperationPort<typeof selectedAction>;
}
