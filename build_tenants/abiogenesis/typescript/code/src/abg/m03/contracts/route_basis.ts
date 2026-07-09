// Implements: T-217 Phase 2 S2.1 (census C-5) — the route-grade basis
// identity, reconstructable from replay. Operator routes act on an
// EXISTING run's spine; they never traverse, so they need exactly the
// identity fields basis_admitted already carries — not the full
// ExecutionBasis (graph, module, intent). This kills the test-side
// { ...fixture, id: basisAdmitted.basisId } reconstruction hack and is
// what the operator grammar's verbs stand on: the CLI reconstructs the
// spine from the persisted log, never from a rebuilt traversal basis.
// The decisive admission is chosen by the D-ordinal law.

import type { RuntimeEvent } from "./carriers.js";
import { decisiveByAdmissionOrdinal } from "./admission_hygiene.js";

export interface RouteBasisIdentity {
  readonly id: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly graphFunction: { readonly id: string };
  readonly job: { readonly id: string };
  readonly runtimeIdentity: { readonly resolvedRuntimeRef: string };
  readonly resolvedPolicy: { readonly resolvedPolicyBundleRef: string };
}

export function reconstructRouteBasisFromReplay(
  events: readonly RuntimeEvent[],
  basisId?: string
): RouteBasisIdentity {
  const admissions = events.filter(
    (event) =>
      event.kind === "basis_admitted" &&
      (basisId === undefined || event.basisId === basisId)
  );
  const decisive = decisiveByAdmissionOrdinal(
    admissions,
    "Route basis reconstruction"
  );
  if (decisive === null || decisive.kind !== "basis_admitted") {
    throw new TypeError(
      "Route basis reconstruction requires an admitted basis in replay"
    );
  }
  return Object.freeze({
    id: decisive.basisId,
    runId: decisive.runId,
    workKey: decisive.workKey,
    graphFunction: Object.freeze({ id: decisive.graphFunctionId }),
    job: Object.freeze({ id: decisive.jobId }),
    runtimeIdentity: Object.freeze({
      resolvedRuntimeRef: decisive.resolvedRuntimeRef
    }),
    resolvedPolicy: Object.freeze({
      resolvedPolicyBundleRef: decisive.resolvedPolicyBundleRef
    })
  });
}
