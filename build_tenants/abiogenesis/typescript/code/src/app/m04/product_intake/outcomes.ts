import type {
  PublicOperationAccepted,
  PublicOperationRefused
} from "../public_sdk/carriers.js";

export function accepted<K extends string, D extends string, V>(input: {
  readonly operationId: K;
  readonly disposition: D;
  readonly value: V;
  readonly provenanceRefs?: readonly string[];
}): PublicOperationAccepted<K, D, V> {
  return Object.freeze({
    kind: "accepted",
    operationId: input.operationId,
    disposition: input.disposition,
    value: input.value,
    provenanceRefs: Object.freeze([...(input.provenanceRefs ?? [])]),
    exitClassification: "accepted_terminal"
  });
}

export function refused<K extends string, C extends string>(input: {
  readonly operationId: K;
  readonly code: C;
  readonly message: string;
  readonly residualRefs?: readonly string[];
  readonly provenanceRefs?: readonly string[];
}): PublicOperationRefused<K, C> {
  return Object.freeze({
    kind: "refused",
    operationId: input.operationId,
    code: input.code,
    message: input.message,
    residualRefs: Object.freeze([...(input.residualRefs ?? [])]),
    provenanceRefs: Object.freeze([...(input.provenanceRefs ?? [])]),
    exitClassification: "refused"
  });
}
