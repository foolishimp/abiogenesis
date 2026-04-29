// Implements: REQ-R-ABG3-ASSURANCE
// Implements: REQ-R-ABG3-LINEAGE
// Implements: REQ-R-ABG3-PROJECTION
// Implements: REQ-R-ABG3-CONVERGENCE

import type {
  AssuranceAmbiguityStatus,
  AssuranceClosureDecision,
  AssuranceProjection,
  AssuranceScopeRef
} from "./assurance.js";
import {
  assertNonEmptyString,
  freezeStringArray
} from "./runtime_support.js";

export const ASSURANCE_REGISTER_DECISION_KIND_VALUES = Object.freeze([
  "close",
  "deepen",
  "block",
  "qualified_defer"
] as const);

export type AssuranceRegisterDecisionKind =
  (typeof ASSURANCE_REGISTER_DECISION_KIND_VALUES)[number];

export interface AssuranceRegisterHop {
  readonly kind: "assurance_register_hop";
  readonly hopId: string;
  readonly ordinal: number;
  readonly sourceRefs: readonly string[];
  readonly targetRefs: readonly string[];
  readonly upstreamHopIds: readonly string[];
  readonly downstreamHopIds: readonly string[];
  readonly projectionRef: string;
  readonly closureDecision: AssuranceClosureDecision["decision"];
  readonly rowStatuses: readonly AssuranceAmbiguityStatus[];
  readonly rowIds: readonly string[];
}

export interface AssuranceLifecycleRegister {
  readonly kind: "assurance_lifecycle_register";
  readonly registerId: string;
  readonly scope: AssuranceScopeRef;
  readonly hops: readonly AssuranceRegisterHop[];
  readonly decision: AssuranceRegisterDecisionKind;
  readonly mayConverge: boolean;
  readonly deepeningRequired: boolean;
  readonly blockingHopIds: readonly string[];
  readonly blockingRowIds: readonly string[];
  readonly reason: string;
}

function freezeNonEmptyStrings(
  values: readonly string[],
  label: string
): readonly string[] {
  for (const [index, value] of values.entries()) {
    assertNonEmptyString(value, `${label}[${index}]`);
  }
  return freezeStringArray(values);
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)].sort());
}

function uniqueStatuses(
  values: readonly AssuranceAmbiguityStatus[]
): readonly AssuranceAmbiguityStatus[] {
  return Object.freeze([...new Set(values)].sort());
}

function sameScope(left: AssuranceScopeRef, right: AssuranceScopeRef): boolean {
  return (
    left.basisId === right.basisId &&
    left.graphFunctionId === right.graphFunctionId &&
    left.graphCallId === right.graphCallId &&
    left.frameId === right.frameId &&
    left.vectorIndex === right.vectorIndex &&
    left.edge === right.edge &&
    left.continuationId === right.continuationId
  );
}

export function constructAssuranceRegisterHop(input: {
  readonly hopId: string;
  readonly ordinal: number;
  readonly sourceRefs: readonly string[];
  readonly targetRefs: readonly string[];
  readonly projection: AssuranceProjection;
  readonly decision: AssuranceClosureDecision;
  readonly upstreamHopIds?: readonly string[];
  readonly downstreamHopIds?: readonly string[];
}): AssuranceRegisterHop {
  assertNonEmptyString(input.hopId, "AssuranceRegisterHop.hopId");
  if (!Number.isInteger(input.ordinal) || input.ordinal < 0) {
    throw new TypeError("AssuranceRegisterHop.ordinal must be a non-negative integer");
  }
  if (input.decision.projectionRef !== input.projection.projectionRef) {
    throw new TypeError("AssuranceRegisterHop requires decision for projection");
  }
  return Object.freeze({
    kind: "assurance_register_hop",
    hopId: input.hopId,
    ordinal: input.ordinal,
    sourceRefs: freezeNonEmptyStrings(
      input.sourceRefs,
      "AssuranceRegisterHop.sourceRefs"
    ),
    targetRefs: freezeNonEmptyStrings(
      input.targetRefs,
      "AssuranceRegisterHop.targetRefs"
    ),
    upstreamHopIds: freezeNonEmptyStrings(
      input.upstreamHopIds ?? Object.freeze([]),
      "AssuranceRegisterHop.upstreamHopIds"
    ),
    downstreamHopIds: freezeNonEmptyStrings(
      input.downstreamHopIds ?? Object.freeze([]),
      "AssuranceRegisterHop.downstreamHopIds"
    ),
    projectionRef: input.projection.projectionRef,
    closureDecision: input.decision.decision,
    rowStatuses: uniqueStatuses(
      input.projection.ambiguityRows.map((row) => row.status)
    ),
    rowIds: freezeNonEmptyStrings(
      input.projection.ambiguityRows.map((row) => row.rowId),
      "AssuranceRegisterHop.rowIds"
    )
  });
}

export function deriveAssuranceLifecycleRegister(input: {
  readonly registerId: string;
  readonly scope: AssuranceScopeRef;
  readonly hops: readonly AssuranceRegisterHop[];
}): AssuranceLifecycleRegister {
  assertNonEmptyString(input.registerId, "AssuranceLifecycleRegister.registerId");
  if (input.hops.length === 0) {
    throw new TypeError("AssuranceLifecycleRegister requires at least one hop");
  }

  const hops = Object.freeze(
    [...input.hops].sort((left, right) => left.ordinal - right.ordinal)
  );
  const hopIds = new Set<string>();
  for (const hop of hops) {
    if (hopIds.has(hop.hopId)) {
      throw new TypeError(`duplicate assurance register hop ${hop.hopId}`);
    }
    hopIds.add(hop.hopId);
  }

  const deepeningHops = hops.filter((hop) =>
    hop.closureDecision === "retry" || hop.closureDecision === "reprice"
  );
  const blockingHops = hops.filter((hop) => hop.closureDecision === "block");

  const blockingHopIds = uniqueSorted(
    [...deepeningHops, ...blockingHops].map((hop) => hop.hopId)
  );
  const blockingRowIds = uniqueSorted(
    [...deepeningHops, ...blockingHops].flatMap((hop) => hop.rowIds)
  );

  if (blockingHops.length > 0) {
    return Object.freeze({
      kind: "assurance_lifecycle_register",
      registerId: input.registerId,
      scope: input.scope,
      hops,
      decision: "block",
      mayConverge: false,
      deepeningRequired: false,
      blockingHopIds,
      blockingRowIds,
      reason: "register_contains_blocking_hop"
    });
  }

  if (deepeningHops.length > 0) {
    return Object.freeze({
      kind: "assurance_lifecycle_register",
      registerId: input.registerId,
      scope: input.scope,
      hops,
      decision: "deepen",
      mayConverge: false,
      deepeningRequired: true,
      blockingHopIds,
      blockingRowIds,
      reason: "register_contains_retry_or_reprice_hop"
    });
  }

  const qualifiedHops = hops.filter(
    (hop) => hop.closureDecision === "qualified_defer"
  );
  return Object.freeze({
    kind: "assurance_lifecycle_register",
    registerId: input.registerId,
    scope: input.scope,
    hops,
    decision: qualifiedHops.length > 0 ? "qualified_defer" : "close",
    mayConverge: true,
    deepeningRequired: false,
    blockingHopIds: Object.freeze([]),
    blockingRowIds: Object.freeze([]),
    reason:
      qualifiedHops.length > 0
        ? "register_allows_qualified_defer"
        : "all_register_hops_close"
  });
}

export function assertRegisterScope(
  register: AssuranceLifecycleRegister,
  projection: AssuranceProjection
): void {
  if (!sameScope(register.scope, projection.scope)) {
    throw new TypeError("AssuranceLifecycleRegister scope does not match projection");
  }
}
