// Implements: REQ-L-GTL3-TEMPORAL-PROPERTIES-007..-011 (T-192 Phase 4).
// Runtime half of the property layer: fail-closed startup admission of a
// declared property set, the online dispatch gate (blocks BEFORE the
// dispatch event enters truth), and terminal verdict derivation emitted
// through the canonical event path.
import type { Rule } from "../../../gtl/m01/contracts/carriers.js";
import type {
  ExecutionBasis,
  RuntimeEvent,
  TemporalPropertyVerdictProjectedEvent
} from "./carriers.js";
import {
  admitTemporalPropertyRule,
  evaluateSafetyGateAtStep,
  evaluateTemporalProperty,
  type TemporalProperty,
  type TemporalPropertyAdmissionIssue
} from "./temporal_properties.js";
import { constructTemporalPropertyVerdictProjectedEvent } from "./event_factories.js";

export interface TemporalPropertyStartupInput {
  readonly rules: readonly Rule[];
}

export interface TemporalPropertyStartupAdmission {
  readonly kind: "temporal_property_startup_admission";
  readonly accepted: boolean;
  readonly properties: readonly TemporalProperty[];
  readonly issues: readonly TemporalPropertyAdmissionIssue[];
}

export function admitTemporalPropertyStartup(
  input: TemporalPropertyStartupInput
): TemporalPropertyStartupAdmission {
  const properties: TemporalProperty[] = [];
  const issues: TemporalPropertyAdmissionIssue[] = [];
  for (const rule of input.rules) {
    const admission = admitTemporalPropertyRule(rule);
    if (admission.accepted && admission.property !== null) {
      properties.push(admission.property);
    } else {
      issues.push(...admission.issues);
    }
  }
  return Object.freeze({
    kind: "temporal_property_startup_admission",
    accepted: issues.length === 0,
    properties: Object.freeze(properties),
    issues: Object.freeze(issues)
  });
}

export interface TemporalDispatchGateBlock {
  readonly propertyRef: string;
  readonly reason: string;
  readonly verdictEvent: TemporalPropertyVerdictProjectedEvent;
}

// Evaluates safety/dispatch properties against the trace WITH the candidate
// event appended (the step under judgment). A violation blocks the dispatch
// before the candidate enters truth; the block is replay-visible via the
// violated verdict event (REQ -007).
export function temporalDispatchGateBlock(input: {
  readonly properties: readonly TemporalProperty[];
  readonly events: readonly RuntimeEvent[];
  readonly candidate: RuntimeEvent;
  readonly basis: ExecutionBasis;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly vectorIndex: number;
}): TemporalDispatchGateBlock | null {
  const trace = Object.freeze({
    basis: input.basis,
    events: Object.freeze([...input.events, input.candidate]),
    completed: false
  });
  for (const property of input.properties) {
    if (property.consequenceClass !== "safety_gate" || property.gatePoint !== "dispatch") {
      continue;
    }
    const status = evaluateSafetyGateAtStep({
      property,
      trace,
      step: trace.events.length - 1
    });
    if (status === "violated") {
      return Object.freeze({
        propertyRef: property.propertyRef,
        reason: `temporal property violated at dispatch: ${property.propertyRef}`,
        verdictEvent: constructTemporalPropertyVerdictProjectedEvent({
          basisId: input.basis.id,
          runId: input.runId,
          workKey: input.workKey,
          propertyRef: property.propertyRef,
          formulaDigest: property.formulaDigest,
          consequenceClass: property.consequenceClass,
          gatePoint: property.gatePoint,
          evaluationPoint: `dispatch:v${input.vectorIndex}`,
          status: "violated",
          vacuous: false,
          witnessCount: null,
          implicatedEventRefs: []
        })
      });
    }
  }
  return null;
}

// Full-set verdicts at a terminal: completed terminals decide future
// obligations (LTLf); non-completed terminals leave them undetermined and
// liveness routes to residual interpretation, never blocks (REQ -006).
export function deriveTemporalVerdictEvents(input: {
  readonly properties: readonly TemporalProperty[];
  readonly events: readonly RuntimeEvent[];
  readonly completed: boolean;
  readonly basis: ExecutionBasis;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly evaluationPoint: string;
}): readonly TemporalPropertyVerdictProjectedEvent[] {
  const out: TemporalPropertyVerdictProjectedEvent[] = [];
  for (const property of input.properties) {
    const verdict = evaluateTemporalProperty({
      property,
      trace: { basis: input.basis, events: input.events, completed: input.completed }
    });
    out.push(
      constructTemporalPropertyVerdictProjectedEvent({
        basisId: input.basis.id,
        runId: input.runId,
        workKey: input.workKey,
        propertyRef: verdict.propertyRef,
        formulaDigest: verdict.formulaDigest,
        consequenceClass: verdict.consequenceClass,
        gatePoint: verdict.gatePoint,
        evaluationPoint: input.evaluationPoint,
        status: verdict.status,
        vacuous: verdict.vacuous,
        witnessCount: verdict.witnessCount,
        implicatedEventRefs: verdict.implicatedEventRefs
      })
    );
  }
  return Object.freeze(out);
}
