import type { JsonValue } from "../shared/canonical_json.js";
import type { ExecutableTraversalCompletion } from "./execute.js";

export interface TraversalLocusEvaluation {
  readonly completion: ExecutableTraversalCompletion;
  readonly outputValueKind: string | null;
  readonly outputContractRef: string | null;
}

export type TraversalLocusFailure = (
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
) => never;

export function terminalLocusEvaluation(
  completion: ExecutableTraversalCompletion,
): TraversalLocusEvaluation {
  return {
    completion,
    outputValueKind: null,
    outputContractRef: null,
  };
}
