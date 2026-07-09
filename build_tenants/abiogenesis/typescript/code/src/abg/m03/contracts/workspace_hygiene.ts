// Implements: REQ-R-ABG3-WITNESS-007 (workspace hygiene: kernel-joined
// digests, typed foreign-write classification, the copy-out diagnosis
// rule, taint resolved only by clean re-measurement) and
// REQ-R-ABG3-WITNESS-008 (citability = converged AND zero reprices AND
// hygiene clean, with the failing conjunct exposed).
//
// INPUT CONTRACT (self-review SR-5): every derivation here assumes
// basis-scoped replay (one run's record, e.g. via runtimeEventsForBasis);
// over a multi-basis store the predicates blend spines.
//
// Measurement discipline (A1-A3): the OBSERVATION (artifactRef,
// observedDigest) arrives from an attributed external instrument; the
// kernel owns the JOIN against replay-admitted digests and the minted
// classification. Rows are internally consistent by admission law, so
// any consumer can re-derive the classification from the carried pair.
// WITNESS-014 disposition: hygiene and citability states are derived
// predicate truth, never primary event authority.

import type {
  OutputMaterializationObservedEvent,
  RuntimeEvent,
  WorkspaceHygieneClassification,
  WorkspaceHygieneRow,
  WorkspaceHygieneStampedEvent
} from "./carriers.js";
import type { AssuranceClosureDecision } from "./assurance.js";
import {
  deriveFrozenLawPredicate,
  type FrozenLawWindow
} from "./declaration_reprice.js";
import {
  codepointCompare,
  decisiveValueByAdmissionOrdinal,
  sortByAdmissionOrdinalStrict
} from "./admission_hygiene.js";

export interface WorkspaceHygieneObservation {
  readonly artifactRef: string;
  readonly observedDigest: string | null;
  readonly copyOutRef?: string | null | undefined;
}

export interface WorkspaceHygienePredicate {
  readonly kind: "workspace_hygiene_predicate";
  readonly hygieneClean: boolean;
  readonly stampCount: number;
  readonly taintedArtifactRefs: readonly string[];
}

export type CitabilityConjunct = "converged" | "frozen_law" | "hygiene_clean";

export interface CitabilityPredicate {
  readonly kind: "citability_predicate";
  readonly citable: boolean;
  readonly converged: boolean;
  readonly frozenLaw: boolean;
  readonly hygieneClean: boolean;
  readonly failingConjuncts: readonly CitabilityConjunct[];
  readonly repriceRefs: readonly string[];
  readonly taintedArtifactRefs: readonly string[];
  readonly hygieneStampCount: number;
}

// The latest admitted content digest per evidence surface. Baseline keys
// (self-review SR-1: materialized outputs were tamper-invisible before —
// their observations classified untracked, and untracked never taints):
// - actor_result_artifact_observed: artifactRef (null digests register
//   nothing — there is nothing to re-measure against)
// - output_materialization_observed: BOTH materializedRef and assetRef
//   carry the materialization digest, so an instrument may measure the
//   surface under either handle; latest per key wins (re-materialization
//   moves the baseline).
export function latestAdmittedArtifactDigests(
  events: readonly RuntimeEvent[]
): ReadonlyMap<string, string> {
  // S3 codex P1: the baseline obeys the D-ordinal law — agreeing
  // duplicates need no order; disagreeing candidates are decided by
  // admission ordinal, and unorderable disagreement fails closed.
  type BaselineCandidate = { readonly event: RuntimeEvent; readonly digest: string };
  const candidatesByKey = new Map<string, BaselineCandidate[]>();
  const push = (key: string, event: RuntimeEvent, digest: string): void => {
    const rows = candidatesByKey.get(key) ?? [];
    rows.push({ event, digest });
    candidatesByKey.set(key, rows);
  };
  for (const event of events) {
    if (
      event.kind === "actor_result_artifact_observed" &&
      event.artifactContentDigest !== null
    ) {
      push(event.artifactRef, event, event.artifactContentDigest);
    }
    if (event.kind === "output_materialization_observed") {
      push(event.materializedRef, event, event.digest);
      push(event.assetRef, event, event.digest);
    }
  }
  const digests = new Map<string, string>();
  for (const [key, rows] of candidatesByKey) {
    const digest = decisiveValueByAdmissionOrdinal(
      rows.map((row) => Object.freeze({ ...row.event, __digest: row.digest })),
      (candidate) => (candidate as { __digest: string }).__digest,
      `Hygiene baseline (${key})`
    );
    if (digest !== null) {
      digests.set(key, digest);
    }
  }
  return digests;
}

export function classifyWorkspaceHygienePair(input: {
  readonly observedDigest: string | null;
  readonly admittedDigest: string | null;
}): WorkspaceHygieneClassification {
  if (input.observedDigest === null && input.admittedDigest === null) {
    throw new TypeError(
      "WorkspaceHygieneRow requires an observed or admitted digest: a row with neither witnesses nothing"
    );
  }
  if (input.observedDigest === null) {
    return "missing";
  }
  if (input.admittedDigest === null) {
    return "untracked";
  }
  return input.observedDigest === input.admittedDigest
    ? "clean"
    : "foreign_write";
}

// The kernel join: attributed observations x replay-admitted digests ->
// internally-consistent classified rows, deterministically ordered.
export function deriveWorkspaceHygieneRows(input: {
  readonly observations: readonly WorkspaceHygieneObservation[];
  readonly replayEvents: readonly RuntimeEvent[];
}): readonly WorkspaceHygieneRow[] {
  const admitted = latestAdmittedArtifactDigests(input.replayEvents);
  const rowsByArtifactRef = new Map<string, WorkspaceHygieneRow>();
  for (const observation of input.observations) {
    const admittedDigest = admitted.get(observation.artifactRef) ?? null;
    const classification = classifyWorkspaceHygienePair({
      observedDigest: observation.observedDigest,
      admittedDigest
    });
    rowsByArtifactRef.set(observation.artifactRef, Object.freeze({
      artifactRef: observation.artifactRef,
      observedDigest: observation.observedDigest,
      admittedDigest,
      classification,
      copyOutRef: observation.copyOutRef ?? null
    }));
  }
  return Object.freeze(
    [...rowsByArtifactRef.values()].sort((left, right) =>
      codepointCompare(left.artifactRef, right.artifactRef)
    )
  );
}

export function deriveAdmittedWorkspaceHygieneStamps(
  events: readonly RuntimeEvent[]
): readonly WorkspaceHygieneStampedEvent[] {
  return Object.freeze(
    events.filter(
      (event): event is WorkspaceHygieneStampedEvent =>
        event.kind === "workspace_hygiene_stamped"
    )
  );
}

// Taint law: an artifact's LATEST classification decides. foreign_write
// and missing taint; a LATER stamp re-measuring the artifact clean
// resolves the taint ("inadmissible for closure until re-measured").
// untracked rows never taint — they witness an unregistered surface.
// Zero stamps is vacuous cleanliness: the predicate exposes stampCount
// so campaign law can additionally require measurement coverage.
export function deriveWorkspaceHygienePredicate(
  events: readonly RuntimeEvent[]
): WorkspaceHygienePredicate {
  // S3 codex P1: taint resolution folds stamps in ORDINAL order, never
  // caller array order — a shuffled replay must not flip cleanliness.
  const stamps = sortByAdmissionOrdinalStrict(
    deriveAdmittedWorkspaceHygieneStamps(events),
    "Workspace hygiene stamps"
  );
  const latestClassification = new Map<string, WorkspaceHygieneClassification>();
  for (const stamp of stamps) {
    for (const row of stamp.rows) {
      latestClassification.set(row.artifactRef, row.classification);
    }
  }
  const taintedArtifactRefs = [...latestClassification.entries()]
    .filter(
      ([, classification]) =>
        classification === "foreign_write" || classification === "missing"
    )
    .map(([artifactRef]) => artifactRef)
    .sort(codepointCompare);
  return Object.freeze({
    kind: "workspace_hygiene_predicate",
    hygieneClean: taintedArtifactRefs.length === 0,
    stampCount: stamps.length,
    taintedArtifactRefs: Object.freeze(taintedArtifactRefs)
  });
}

// The WITNESS-007 closure-taint surface: evidence artifacts whose latest
// hygiene classification is foreign_write or missing. Closure-gating
// integration into edge convergence is owned by the Phase 2 kernel
// boundary; this set is the typed input it consumes.
export function deriveForeignTaintedArtifactRefs(
  events: readonly RuntimeEvent[]
): readonly string[] {
  return deriveWorkspaceHygienePredicate(events).taintedArtifactRefs;
}

// T-217 S2.2 — the WITNESS-007 ENFORCEMENT half's blocking set: taint
// intersected with the basis's OWN admitted evidence surfaces. Another
// run's tainted evidence never blocks this basis; this basis's
// foreign-written (or vanished) evidence is inadmissible for closure
// until re-measured clean.
export function deriveClosureBlockingTaintedRefs(input: {
  readonly basisId: string;
  readonly events: readonly RuntimeEvent[];
}): readonly string[] {
  const tainted = deriveForeignTaintedArtifactRefs(input.events);
  if (tainted.length === 0) {
    return Object.freeze([]);
  }
  const basisRefs = new Set(
    latestAdmittedArtifactDigests(
      input.events.filter(
        (event) => "basisId" in event && event.basisId === input.basisId
      )
    ).keys()
  );
  return Object.freeze(tainted.filter((ref) => basisRefs.has(ref)));
}

// T-217 S2.2 — the WITNESS-007 enforcement half's SINGLE consumption
// surface, applied wherever a closure decision is minted (the per-vector
// evaluation fold and the terminal assurance gate). A minted "close"
// over currently-tainted basis evidence demotes to block BEFORE any
// closing truth is emitted (the S1 no-laundering ordering). Every other
// decision passes through: retry/reprice/block are not closure, and
// re-work is how tainted evidence gets lawfully replaced.
export function applyClosureTaintGate(input: {
  readonly decision: AssuranceClosureDecision;
  readonly basisId: string;
  readonly events: readonly RuntimeEvent[];
}): AssuranceClosureDecision {
  if (input.decision.decision !== "close") {
    return input.decision;
  }
  const hygieneBlockedRefs = deriveClosureBlockingTaintedRefs({
    basisId: input.basisId,
    events: input.events
  });
  if (hygieneBlockedRefs.length === 0) {
    return input.decision;
  }
  return Object.freeze({
    kind: "assurance_closure_decision",
    decision: "block",
    scope: input.decision.scope,
    projectionRef: input.decision.projectionRef,
    blockingStatuses: Object.freeze(["contradictory_evidence" as const]),
    rowIds: hygieneBlockedRefs,
    reason: `workspace_hygiene_taint: foreign-written evidence is inadmissible for closure until re-measured: ${hygieneBlockedRefs.join(", ")}`
  });
}

// D1.4 (T-209 escrow, delivered T-217 S2.2): what the kernel can measure
// ITSELF. Admitted materialized outputs carry their workspace paths, so
// the kernel-witnessed instrument derives (surface, path, admitted
// digest) from replay and measures bytes at the path — the hygiene
// baseline joins against kernel-measured truth, not reported claims.
// Latest per surface by the D-ordinal law; the decisive value is the
// (path, digest) PAIR — a re-materialization moves both together.
export interface KernelMeasurableSurface {
  readonly artifactRef: string;
  readonly materializedPath: string;
  readonly admittedDigest: string;
}

export function deriveKernelMeasurableSurfaces(
  events: readonly RuntimeEvent[]
): readonly KernelMeasurableSurface[] {
  const candidatesByRef = new Map<string, OutputMaterializationObservedEvent[]>();
  for (const event of events) {
    if (event.kind !== "output_materialization_observed") {
      continue;
    }
    const rows = candidatesByRef.get(event.materializedRef) ?? [];
    rows.push(event);
    candidatesByRef.set(event.materializedRef, rows);
  }
  const surfaces: KernelMeasurableSurface[] = [];
  for (const [artifactRef, rows] of candidatesByRef) {
    const decisivePair = decisiveValueByAdmissionOrdinal(
      rows,
      (event) =>
        event.kind === "output_materialization_observed"
          ? JSON.stringify([event.materializedPath, event.digest])
          : null,
      `Kernel measurable surface (${artifactRef})`
    );
    if (decisivePair !== null) {
      const [materializedPath, admittedDigest] = JSON.parse(decisivePair) as [
        string,
        string
      ];
      surfaces.push(
        Object.freeze({ artifactRef, materializedPath, admittedDigest })
      );
    }
  }
  return Object.freeze(
    surfaces.sort((left, right) =>
      codepointCompare(left.artifactRef, right.artifactRef)
    )
  );
}

export function deriveCitabilityPredicate(
  events: readonly RuntimeEvent[],
  window?: FrozenLawWindow
): CitabilityPredicate {
  // S3 codex P1: the decisive terminal is ordinal truth (agreeing
  // duplicates need no order; disagreement fails closed unorderable)
  const terminalKinds = events.filter(
    (event) => event.kind === "terminal_reached"
  );
  const lastTerminalKind = decisiveValueByAdmissionOrdinal(
    terminalKinds,
    (event) =>
      event.kind === "terminal_reached" ? event.terminalKind : null,
    "Citability terminal"
  );
  const converged = lastTerminalKind === "converged";
  const frozen =
    window === undefined
      ? deriveFrozenLawPredicate(events)
      : deriveFrozenLawPredicate(events, window);
  const hygiene = deriveWorkspaceHygienePredicate(events);
  const failingConjuncts: CitabilityConjunct[] = [];
  if (!converged) {
    failingConjuncts.push("converged");
  }
  if (!frozen.frozenLaw) {
    failingConjuncts.push("frozen_law");
  }
  if (!hygiene.hygieneClean) {
    failingConjuncts.push("hygiene_clean");
  }
  return Object.freeze({
    kind: "citability_predicate",
    citable: failingConjuncts.length === 0,
    converged,
    frozenLaw: frozen.frozenLaw,
    hygieneClean: hygiene.hygieneClean,
    failingConjuncts: Object.freeze([...failingConjuncts]),
    repriceRefs: frozen.repriceRefs,
    taintedArtifactRefs: hygiene.taintedArtifactRefs,
    hygieneStampCount: hygiene.stampCount
  });
}
