// Implements: REQ-L-GTL3-TEMPORAL-PROPERTIES-010 + REQ-R-ABG3-CCALL-010
// (T-192 Phase 3; re-anchored T-200 P3). The standing audit gates as
// declared temporal properties over the C-CALL SPINE: dispatch-point
// antecedents bind to c_call_fibre_selected with single-event
// where-guards (regime=F_P), and the liveness law is fibre-UNIFORM
// (every selected call is eventually judged). Formulas remain
// kind-level (per-vector parameterization is the named successor);
// pre-envelope replay is judged via the CCALL-011 projection adapter.
import type { Rule, SerializedJsonValue } from "../../../gtl/m01/contracts/carriers.js";

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
          value: Object.freeze({ kind: "json_blob" as const, value: taggedJson(input.formula) })
        })
      ])
    }),
    tags: Object.freeze(["abg", "standing-gate", "t192"])
  });
}

// GTL law stores json_blob values as TAGGED SerializedJsonValue (the
// admitted authored form); formulas are authored plain here and encoded.
function taggedJson(value: unknown): SerializedJsonValue {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value satisfies string | number | boolean | null;
  }
  if (Array.isArray(value)) {
    return { kind: "array", items: value.map(taggedJson) };
  }
  const record: Readonly<Record<string, unknown>> = { ...value };
  return {
    kind: "object",
    entries: Object.entries(record).map(([key, entryValue]) => ({
      key,
      value: taggedJson(entryValue)
    }))
  };
}

function requiresOnce(
  trigger: { readonly eventKind: string; readonly where?: readonly { readonly field: string; readonly equals: string }[] },
  requiredKind: string
): unknown {
  return {
    op: "historically",
    child: {
      op: "implies",
      left: {
        op: "atom",
        atom: {
          kind: "event",
          eventKind: trigger.eventKind,
          ...(trigger.where === undefined ? {} : { where: trigger.where })
        }
      },
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
      formula: requiresOnce(
        { eventKind: "c_call_fibre_selected", where: [{ field: "regime", equals: "F_P" }] },
        "instruction_prompt_manifest_projected"
      )
    }),
    // G2 — the T-188 ordering law: coverage truth only after payload admission.
    gateRule({
      name: "gate_coverage_requires_payload_admission",
      propertyRef: "temporal-property://abg/standing/coverage-requires-payload-admission",
      consequenceClass: "safety_gate",
      gatePoint: "closure",
      formula: requiresOnce(
        { eventKind: "requirement_proof_carry_through_admitted" },
        "payload_validated"
      )
    }),
    // G3 — no worker invocation without a requested dispatch.
    gateRule({
      name: "gate_invocation_requires_dispatch",
      propertyRef: "temporal-property://abg/standing/invocation-requires-dispatch",
      consequenceClass: "safety_gate",
      gatePoint: "dispatch",
      formula: requiresOnce(
        { eventKind: "actor_invocation_started" },
        "c_call_fibre_selected"
      )
    }),
    // G4 — selection requires admitted registry authority.
    gateRule({
      name: "gate_selection_requires_registry_admission",
      propertyRef: "temporal-property://abg/standing/selection-requires-registry-admission",
      consequenceClass: "safety_gate",
      gatePoint: "dispatch",
      formula: requiresOnce(
        { eventKind: "graph_function_selected" },
        "registry_entry_admitted"
      )
    }),
    // G5 — liveness, FIBRE-UNIFORM (T-200): every selected C call is
    // eventually judged — covers in-process F_P evaluation and F_D calls
    // identically; undetermined on open prefixes routes to residual.
    gateRule({
      name: "gate_selection_eventually_judged",
      propertyRef: "temporal-property://abg/standing/selection-eventually-judged",
      consequenceClass: "liveness_residual",
      gatePoint: "closure",
      formula: {
        op: "globally",
        child: {
          op: "implies",
          left: { op: "atom", atom: { kind: "event", eventKind: "c_call_fibre_selected" } },
          right: {
            op: "eventually",
            child: { op: "atom", atom: { kind: "event", eventKind: "c_call_judged" } }
          }
        }
      }
    })
  ]);
