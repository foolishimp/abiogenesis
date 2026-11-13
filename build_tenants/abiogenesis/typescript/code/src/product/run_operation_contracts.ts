import * as v from "valibot";
import { ABG_TYPED_TERMINAL_RESULT_SCHEMA } from "../abg/terminal_result_contracts.js";

import { capabilityRefsForDefinition } from "../shared/capability_contracts.js";

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
  sourceBasisSchema,
} from "../shared/public_function_contracts.js";

const RUN_AUTHORITY = "authority://abiogenesis/product/run-invocation@5";
const CONTINUE_AUTHORITY =
  "authority://abiogenesis/product/run-continuation@5";

// REQ-P-POLICY-068: a Run that stops states the plain-words statement of its
// `project.read run_status` stop reading, from the same fold; absent otherwise.
const stopStatementSchema = v.optional(nonblankSchema);

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
    terminalResult: v.nullable(ABG_TYPED_TERMINAL_RESULT_SCHEMA),
    stop: v.nullable(refDigestSchema),
    gap: v.nullable(refDigestSchema),
    interaction: v.nullable(refDigestSchema),
    evidence: nonemptyRefDigestSetSchema,
    replay: refDigestSchema,
    stopStatement: stopStatementSchema,
  });
}

function runNonTerminalSchema(invocationKind: "invoke" | "start") {
  return v.strictObject({
    invocationKind: v.literal(invocationKind),
    disposition: v.literal("held"),
    run: refDigestSchema,
    graphCall: v.nullable(refDigestSchema),
    interaction: v.nullable(refDigestSchema),
    gap: v.nullable(refDigestSchema),
    evidence: nonemptyRefDigestSetSchema,
    replay: refDigestSchema,
    stopStatement: stopStatementSchema,
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
    capabilityRefs: capabilityRefsForDefinition({ operationId: "abg.operation.run.invoke", memberKey: member }),
    defaults: member === "start"
      ? { fhMode: "direct", rootMode: "direct" }
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
    rootMode: v.optional(v.picklist(["direct", "supervised"]), "direct"),
    sourceBasis: sourceBasisSchema,
  }),
  runResultSchema("start"),
  runInvokeRefusalSchema,
  runNonTerminalSchema("start"),
  {
    abstractModule: "Product.RunInvocation",
    exportName: "RUN_OPERATION_CONTRACTS",
    memberPath: ["invoke", "start"],
    authorityRef: RUN_AUTHORITY,
    authorityDigest: ownerAuthorityDigest(RUN_AUTHORITY),
  },
  runMetadata("start"),
);

// The current-execution member continues one replay-derived pending execution
// (registered selection/recursion); its request carries no intent or action
// field and its refusals are the five codes its owner produces.
const currentExecutionRefusalSchema = refusalSchema([
  "missing_continuation",
  "resolved_continuation",
  "response_mismatch",
  "replay_mismatch",
  "basis_mismatch",
]);

const selectedActionRefusalSchema = refusalSchema([
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

const CURRENT_EXECUTION_KINDS = ["pending_execution"] as const;

// Each continuation member constructs only its own variant, so the packet type
// of each member is exactly its runtime schema.
const continueVariantFactories = {
  current_intent: () => ({
    kinds: CURRENT_EXECUTION_KINDS,
    kindSchema: v.picklist(CURRENT_EXECUTION_KINDS),
    request: v.strictObject({
      run: refDigestSchema,
      continuation: refDigestSchema,
      pendingCursor: refDigestSchema,
      continuationInput: refDigestSchema,
      expectedBasis: refDigestSchema,
    }),
    admittedIntent: v.null(),
    refusal: currentExecutionRefusalSchema,
  }),
  // The unchanged selected_action member keeps its exact single-literal serialization.
  selected_action: () => ({
    kinds: ["selected_action"] as const,
    kindSchema: v.literal("selected_action"),
    request: v.strictObject({
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
    }),
    admittedIntent: refDigestSchema,
    refusal: selectedActionRefusalSchema,
  }),
};
type ContinueVariant = {
  readonly [M in keyof typeof continueVariantFactories]: ReturnType<
    (typeof continueVariantFactories)[M]
  >;
};
const CONTINUE_VARIANTS: {
  readonly [M in keyof ContinueVariant]: () => ContinueVariant[M];
} = continueVariantFactories;

function continueContract<const TMember extends
  "current_intent" | "selected_action">(member: TMember) {
  const variant = CONTINUE_VARIANTS[member]();
  // Indexed annotations keep each member's own variant instead of the union.
  const kinds: ContinueVariant[TMember]["kinds"] = variant.kinds;
  const kindSchema: ContinueVariant[TMember]["kindSchema"] = variant.kindSchema;
  const request: ContinueVariant[TMember]["request"] = variant.request;
  const admittedIntent: ContinueVariant[TMember]["admittedIntent"] =
    variant.admittedIntent;
  const refusal: ContinueVariant[TMember]["refusal"] = variant.refusal;
  const result = v.strictObject({
    continuationKind: kindSchema,
    run: refDigestSchema,
    graphCall: v.nullable(refDigestSchema),
    admittedIntent,
    successor: refDigestSchema,
    disposition: v.picklist(["completed", "blocked", "runtime_failed"]),
    evidence: nonemptyRefDigestSetSchema,
    replay: refDigestSchema,
    stopStatement: stopStatementSchema,
  });
  const nonTerminal = v.strictObject({
    continuationKind: kindSchema,
    disposition: v.literal("held"),
    run: refDigestSchema,
    continuation: refDigestSchema,
    evidence: nonemptyRefDigestSetSchema,
    replay: refDigestSchema,
    stopStatement: stopStatementSchema,
  });
  return ownerContractPacket(
    { operationId: "abg.operation.run.continue", memberKey: member } as const,
    request,
    result,
    refusal,
    nonTerminal,
    {
      abstractModule: "Product.RunContinuation",
      exportName: "RUN_OPERATION_CONTRACTS",
      memberPath: ["continue", member],
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
      capabilityRefs: capabilityRefsForDefinition({ operationId: "abg.operation.run.continue", memberKey: member }),
      defaults: {},
      closedDomains: { continuationKind: [...kinds] },
      sdkCoordinate: "sdk.run.continue",
      cliCoordinate: `run continue --mode ${member}`,
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
}
