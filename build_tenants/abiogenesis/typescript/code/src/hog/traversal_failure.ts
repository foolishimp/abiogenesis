import {
  admitRuntimeFailure,
  type AbgEventStore,
  type ExecutionBasis,
  type OpenedTraversalScope,
  type RuntimeFailureAdmissionReceipt,
} from "../abg/index.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import type {
  GraphTraversalEntryRefusal,
  GraphTraversalFailureResult,
} from "./traversal_contract.js";

export function isGraphTraversalEntryRefusal(
  value: unknown,
): value is GraphTraversalEntryRefusal {
  return typeof value === "object" && value !== null &&
    (value as { readonly kind?: unknown }).kind ===
      "graph_traversal_entry_refusal";
}

export function refuseTraversalEntry(input: Readonly<{
  code: GraphTraversalEntryRefusal["code"];
  message: string;
  diagnosticRef: string;
  candidate: JsonValue;
  priorAdmission?: GraphTraversalEntryRefusal["priorAdmission"];
}>): GraphTraversalEntryRefusal {
  return deepFreeze({
    kind: "graph_traversal_entry_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code: input.code,
    message: input.message,
    diagnosticRef: input.diagnosticRef,
    candidate: input.candidate,
    priorAdmission: input.priorAdmission ?? null,
  });
}

export function projectGraphTraversalFailure(
  failure: GraphTraversalFailure,
): GraphTraversalFailureResult {
  return deepFreeze({
    kind: "graph_traversal_failure_result" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "failed" as const,
    code: "owner_refusal" as const,
    message: failure.message,
    diagnosticRef: failure.diagnosticRef,
    successorPrefix: failure.receipt.successorPrefix,
    receipt: failure.receipt,
  });
}

export class GraphTraversalFailure extends TypeError {
  readonly kind = "graph_traversal_failure" as const;
  readonly schemaVersion = "5.0.0" as const;

  constructor(
    readonly diagnosticRef: string,
    readonly receipt: RuntimeFailureAdmissionReceipt,
  ) {
    super(diagnosticRef);
  }
}

export function failTraversal(input: Readonly<{
  store: AbgEventStore;
  predecessorPrefix: DurablePrefixCoordinate;
  executionBasis: ExecutionBasis;
  openedTraversalScope: OpenedTraversalScope;
  eventTime: string;
  correlationId: string;
  stage: string;
  diagnosticRef: string;
  candidate: JsonValue;
}>): never {
  const receipt = admitRuntimeFailure({
    store: input.store,
    predecessorPrefix: input.predecessorPrefix,
    executionBasis: input.executionBasis,
    scope: input.openedTraversalScope,
    stage: "hog_traversal",
    subject: { stage: input.stage, candidate: input.candidate },
    diagnosticRef: input.diagnosticRef,
    basis: {
      eventTime: input.eventTime,
      correlationId: `${input.correlationId}/${input.stage}`,
      causationEventRefs: [],
    },
  });
  throw new GraphTraversalFailure(input.diagnosticRef, receipt);
}
