// Implements: REQ-L-GTL3-TEMPORAL-PROPERTIES-010 (T-192 Phase 3).
// The standing audit gates as the FIRST declared temporal property set —
// GTL Rules (data), consumed by runtime ingress like any product-declared
// property. v1 formulas are kind-level (per-vector parameterization is the
// named successor); each gates only because Phase 3 proved its mutation,
// vacuity, and routing differentials (enforcement after proof).
import type { Rule } from "../../../gtl/m01/contracts/carriers.js";

function gateRule(input: {
  readonly name: string;
  readonly propertyRef: string;
  readonly consequenceClass: "safety_gate" | "liveness_residual";
  readonly gatePoint: "dispatch" | "closure";
  readonly formula: unknown;
}): Rule {
  return Object.freeze({
    name: input.name,
    kind: "temporal_property",
    config: Object.freeze({
      entries: Object.freeze([
        Object.freeze({
          key: "property_ref",
          value: Object.freeze({ kind: "scalar" as const, value: input.propertyRef })
        }),
        Object.freeze({
          key: "consequence_class",
          value: Object.freeze({ kind: "scalar" as const, value: input.consequenceClass })
        }),
        Object.freeze({
          key: "gate_point",
          value: Object.freeze({ kind: "scalar" as const, value: input.gatePoint })
        }),
        Object.freeze({
          key: "formula",
          value: Object.freeze({ kind: "json_blob" as const, value: input.formula })
        })
      ])
    }),
    tags: Object.freeze(["abg", "standing-gate", "t192"])
  }) as unknown as Rule;
}

function requiresOnce(triggerKind: string, requiredKind: string): unknown {
  return {
    op: "historically",
    child: {
      op: "implies",
      left: { op: "atom", atom: { kind: "event", eventKind: triggerKind } },
      right: {
        op: "once",
        child: { op: "atom", atom: { kind: "event", eventKind: requiredKind } }
      }
    }
  };
}

export const STANDING_GATE_TEMPORAL_PROPERTY_RULES: readonly Rule[] =
  Object.freeze([
    // G1 — the monad-fix law: no F_P dispatch without an admitted manifest.
    gateRule({
      name: "gate_dispatch_requires_manifest",
      propertyRef: "temporal-property://abg/standing/dispatch-requires-manifest",
      consequenceClass: "safety_gate",
      gatePoint: "dispatch",
      formula: requiresOnce("fp_dispatch_requested", "instruction_prompt_manifest_projected")
    }),
    // G2 — the T-188 ordering law: coverage truth only after payload admission.
    gateRule({
      name: "gate_coverage_requires_payload_admission",
      propertyRef: "temporal-property://abg/standing/coverage-requires-payload-admission",
      consequenceClass: "safety_gate",
      gatePoint: "closure",
      formula: requiresOnce("requirement_proof_carry_through_admitted", "payload_validated")
    }),
    // G3 — no worker invocation without a requested dispatch.
    gateRule({
      name: "gate_invocation_requires_dispatch",
      propertyRef: "temporal-property://abg/standing/invocation-requires-dispatch",
      consequenceClass: "safety_gate",
      gatePoint: "dispatch",
      formula: requiresOnce("actor_invocation_started", "fp_dispatch_requested")
    }),
    // G4 — selection requires admitted registry authority.
    gateRule({
      name: "gate_selection_requires_registry_admission",
      propertyRef: "temporal-property://abg/standing/selection-requires-registry-admission",
      consequenceClass: "safety_gate",
      gatePoint: "dispatch",
      formula: requiresOnce("graph_function_selected", "registry_entry_admitted")
    }),
    // G5 — liveness: a requested dispatch is eventually closed; undetermined
    // on open prefixes routes to residual pressure, never blocks.
    gateRule({
      name: "gate_dispatch_eventually_closes",
      propertyRef: "temporal-property://abg/standing/dispatch-eventually-closes",
      consequenceClass: "liveness_residual",
      gatePoint: "closure",
      formula: {
        op: "globally",
        child: {
          op: "implies",
          left: { op: "atom", atom: { kind: "event", eventKind: "fp_dispatch_requested" } },
          right: {
            op: "eventually",
            child: { op: "atom", atom: { kind: "event", eventKind: "actor_invocation_closed" } }
          }
        }
      }
    })
  ]);
