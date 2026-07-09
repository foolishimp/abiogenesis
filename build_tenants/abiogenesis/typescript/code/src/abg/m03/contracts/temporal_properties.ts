// Implements: REQ-L-GTL3-TEMPORAL-PROPERTIES-001..-012 (T-192).
// The property carrier is the GTL Rule (kind "temporal_property"); atoms
// quantify over the replay trace only (event-occurrence atoms + fluent-hold
// atoms from the ONE event-calculus vocabulary); the checker is a total
// deterministic function over the finite trace with three-valued verdicts,
// first-class vacuity, and a safety/liveness consequence split.
import type { SerializedJsonValue } from "../../../gtl/m01/contracts/carriers.js";
import type { Rule } from "../../../gtl/m01/contracts/carriers.js";
import type { ExecutionBasis, RuntimeEvent } from "./carriers.js";
import { serializedJsonValueToPlain } from "../../../gtl/m01/contracts/constructors.js";
import {
  RUNTIME_FLUENT_NAME_VALUES,
  deriveRuntimeEventCalculusProjection,
  type RuntimeFluentName
} from "./event_calculus.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";

export const TEMPORAL_PROPERTY_RULE_KIND = "temporal_property";

export const TEMPORAL_CONSEQUENCE_CLASS_VALUES = Object.freeze([
  "safety_gate",
  "liveness_residual"
] as const);
export type TemporalConsequenceClass =
  (typeof TEMPORAL_CONSEQUENCE_CLASS_VALUES)[number];

export const TEMPORAL_GATE_POINT_VALUES = Object.freeze([
  "dispatch",
  "closure"
] as const);
export type TemporalGatePoint = (typeof TEMPORAL_GATE_POINT_VALUES)[number];

export const TEMPORAL_VERDICT_STATUS_VALUES = Object.freeze([
  "satisfied",
  "violated",
  "undetermined"
] as const);
export type TemporalVerdictStatus =
  (typeof TEMPORAL_VERDICT_STATUS_VALUES)[number];

export type TemporalAtom =
  | {
      readonly kind: "event";
      readonly eventKind: string;
      readonly where?: readonly {
        readonly field: string;
        readonly equals: string;
      }[];
    }
  | {
      readonly kind: "fluent";
      readonly fluent: RuntimeFluentName;
    };

export type TemporalFormula =
  | { readonly op: "atom"; readonly atom: TemporalAtom }
  | { readonly op: "not"; readonly child: TemporalFormula }
  | {
      readonly op: "and" | "or" | "implies";
      readonly left: TemporalFormula;
      readonly right: TemporalFormula;
    }
  | {
      readonly op: "yesterday" | "once" | "historically";
      readonly child: TemporalFormula;
    }
  | {
      readonly op: "next" | "eventually" | "globally";
      readonly child: TemporalFormula;
    }
  | {
      readonly op: "since" | "until";
      readonly left: TemporalFormula;
      readonly right: TemporalFormula;
    };

const PAST_OPS = new Set(["yesterday", "once", "historically", "since"]);
const FUTURE_OPS = new Set(["next", "eventually", "globally", "until"]);
const BOOL_OPS = new Set(["not", "and", "or", "implies"]);

export interface TemporalProperty {
  readonly kind: "temporal_property";
  readonly propertyRef: string;
  readonly formula: TemporalFormula;
  readonly formulaDigest: string;
  readonly consequenceClass: TemporalConsequenceClass;
  readonly gatePoint: TemporalGatePoint;
  readonly witnessFormula: TemporalFormula | null;
}

export interface TemporalPropertyAdmissionIssue {
  readonly kind: "temporal_property_admission_issue";
  readonly issueKind:
    | "unknown_rule_kind"
    | "missing_config_entry"
    | "unknown_operator"
    | "unknown_fluent"
    | "unknown_consequence_class"
    | "unknown_gate_point"
    | "safety_requires_past_time"
    | "malformed_formula";
  readonly message: string;
  readonly propertyRef: string | null;
}

export interface TemporalPropertyAdmission {
  readonly kind: "temporal_property_admission";
  readonly accepted: boolean;
  readonly property: TemporalProperty | null;
  readonly issues: readonly TemporalPropertyAdmissionIssue[];
}

function issue(
  issueKind: TemporalPropertyAdmissionIssue["issueKind"],
  message: string,
  propertyRef: string | null
): TemporalPropertyAdmissionIssue {
  return Object.freeze({
    kind: "temporal_property_admission_issue",
    issueKind,
    message,
    propertyRef
  });
}

function parseFormula(
  input: unknown,
  issues: TemporalPropertyAdmissionIssue[],
  propertyRef: string | null
): TemporalFormula | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    issues.push(issue("malformed_formula", "formula node must be an object", propertyRef));
    return null;
  }
  const node = input as Record<string, unknown>;
  const op = String(node["op"] ?? "");
  if (op === "atom") {
    const atom = node["atom"] as Record<string, unknown> | undefined;
    if (atom === undefined || typeof atom !== "object" || atom === null) {
      issues.push(issue("malformed_formula", "atom node requires an atom object", propertyRef));
      return null;
    }
    const atomKind = String(atom["kind"] ?? "");
    if (atomKind === "event") {
      const eventKind = String(atom["eventKind"] ?? "");
      if (eventKind.length === 0) {
        issues.push(issue("malformed_formula", "event atom requires eventKind", propertyRef));
        return null;
      }
      const whereInput = atom["where"];
      const where: { field: string; equals: string }[] = [];
      if (whereInput !== undefined) {
        if (!Array.isArray(whereInput)) {
          issues.push(issue("malformed_formula", "event atom where must be an array", propertyRef));
          return null;
        }
        for (const rowInput of whereInput) {
          const row = rowInput as Record<string, unknown>;
          const field = String(row["field"] ?? "");
          const equals = String(row["equals"] ?? "");
          if (field.length === 0) {
            issues.push(issue("malformed_formula", "where row requires field", propertyRef));
            return null;
          }
          where.push(Object.freeze({ field, equals }));
        }
      }
      return Object.freeze({
        op: "atom",
        atom: Object.freeze({
          kind: "event",
          eventKind,
          ...(where.length === 0 ? {} : { where: Object.freeze(where) })
        })
      }) as TemporalFormula;
    }
    if (atomKind === "fluent") {
      const fluent = String(atom["fluent"] ?? "");
      if (!(RUNTIME_FLUENT_NAME_VALUES as readonly string[]).includes(fluent)) {
        issues.push(
          issue(
            "unknown_fluent",
            `fluent atom names an unknown fluent: ${fluent} — extend the one vocabulary, never a second`,
            propertyRef
          )
        );
        return null;
      }
      return Object.freeze({
        op: "atom",
        atom: Object.freeze({ kind: "fluent", fluent: fluent as RuntimeFluentName })
      }) as TemporalFormula;
    }
    issues.push(issue("malformed_formula", `unknown atom kind: ${atomKind}`, propertyRef));
    return null;
  }
  if (op === "not" || PAST_OPS.has(op) || FUTURE_OPS.has(op)) {
    if (op === "since" || op === "until") {
      const left = parseFormula(node["left"], issues, propertyRef);
      const right = parseFormula(node["right"], issues, propertyRef);
      if (left === null || right === null) {
        return null;
      }
      return Object.freeze({ op, left, right }) as TemporalFormula;
    }
    const child = parseFormula(node["child"], issues, propertyRef);
    if (child === null) {
      return null;
    }
    return Object.freeze({ op, child }) as TemporalFormula;
  }
  if (BOOL_OPS.has(op) && op !== "not") {
    const left = parseFormula(node["left"], issues, propertyRef);
    const right = parseFormula(node["right"], issues, propertyRef);
    if (left === null || right === null) {
      return null;
    }
    return Object.freeze({ op, left, right }) as TemporalFormula;
  }
  issues.push(issue("unknown_operator", `unknown operator: ${op}`, propertyRef));
  return null;
}

function containsFutureOp(formula: TemporalFormula): boolean {
  if (FUTURE_OPS.has(formula.op)) {
    return true;
  }
  if (formula.op === "atom") {
    return false;
  }
  if ("child" in formula) {
    return containsFutureOp(formula.child);
  }
  return containsFutureOp(formula.left) || containsFutureOp(formula.right);
}

// The witness formula is the antecedent of the outermost implication under
// any globally/historically wrapper (REQ -005). Properties without an
// implication have no witness formula; vacuity law does not apply to them.
function deriveWitnessFormula(formula: TemporalFormula): TemporalFormula | null {
  let node = formula;
  while (
    (node.op === "globally" || node.op === "historically") &&
    "child" in node
  ) {
    node = node.child;
  }
  if (node.op === "implies") {
    return node.left;
  }
  return null;
}

function configScalar(rule: Rule, key: string): string | null {
  const entry = rule.config.entries.find((row) => row.key === key);
  if (entry === undefined) {
    return null;
  }
  if (entry.value.kind === "scalar") {
    return String(entry.value.value);
  }
  return null;
}

// GTL-lawful json_blob values are TAGGED; decode via the ONE decoder.
// Legacy plain blobs (pre-T-200 bindings) pass through unchanged.
function plainFromSerializedJson(value: unknown): unknown {
  if (value === null || typeof value !== "object") {
    return value;
  }
  const kind = (value as { readonly kind?: unknown }).kind;
  if (kind === "array" || kind === "object") {
    return serializedJsonValueToPlain(value as SerializedJsonValue);
  }
  return value;
}

function configJson(rule: Rule, key: string): unknown {
  const entry = rule.config.entries.find((row) => row.key === key);
  if (entry === undefined) {
    return undefined;
  }
  if (entry.value.kind === "json_blob") {
    return plainFromSerializedJson(entry.value.value);
  }
  return undefined;
}

export function admitTemporalPropertyRule(rule: Rule): TemporalPropertyAdmission {
  const issues: TemporalPropertyAdmissionIssue[] = [];
  const propertyRef = configScalar(rule, "property_ref");
  if (rule.kind !== TEMPORAL_PROPERTY_RULE_KIND) {
    issues.push(
      issue("unknown_rule_kind", `rule kind must be ${TEMPORAL_PROPERTY_RULE_KIND}`, propertyRef)
    );
  }
  if (propertyRef === null) {
    issues.push(issue("missing_config_entry", "config requires property_ref", null));
  }
  const consequenceClassInput = configScalar(rule, "consequence_class") ?? "";
  const gatePointInput = configScalar(rule, "gate_point") ?? "";
  if (!(TEMPORAL_CONSEQUENCE_CLASS_VALUES as readonly string[]).includes(consequenceClassInput)) {
    issues.push(
      issue("unknown_consequence_class", `unknown consequence class: ${consequenceClassInput}`, propertyRef)
    );
  }
  if (!(TEMPORAL_GATE_POINT_VALUES as readonly string[]).includes(gatePointInput)) {
    issues.push(issue("unknown_gate_point", `unknown gate point: ${gatePointInput}`, propertyRef));
  }
  const formulaInput = configJson(rule, "formula");
  let formula: TemporalFormula | null = null;
  if (formulaInput === undefined) {
    issues.push(issue("missing_config_entry", "config requires formula json_blob", propertyRef));
  } else {
    formula = parseFormula(formulaInput, issues, propertyRef);
  }
  if (
    formula !== null &&
    consequenceClassInput === "safety_gate" &&
    containsFutureOp(formula)
  ) {
    issues.push(
      issue(
        "safety_requires_past_time",
        "safety_gate properties must be past-time decidable (no next/eventually/globally/until)",
        propertyRef
      )
    );
  }
  if (issues.length > 0 || formula === null || propertyRef === null) {
    return Object.freeze({
      kind: "temporal_property_admission",
      accepted: false,
      property: null,
      issues: Object.freeze([...issues])
    });
  }
  return Object.freeze({
    kind: "temporal_property_admission",
    accepted: true,
    property: Object.freeze({
      kind: "temporal_property",
      propertyRef,
      formula,
      formulaDigest: stableSha256Digest(formula),
      consequenceClass: consequenceClassInput as TemporalConsequenceClass,
      gatePoint: gatePointInput as TemporalGatePoint,
      witnessFormula: deriveWitnessFormula(formula)
    }),
    issues: Object.freeze([])
  });
}

// ── checker ──────────────────────────────────────────────────────────────

type Tri = "T" | "F" | "U";

function triNot(v: Tri): Tri {
  return v === "T" ? "F" : v === "F" ? "T" : "U";
}
function triAnd(a: Tri, b: Tri): Tri {
  if (a === "F" || b === "F") return "F";
  if (a === "T" && b === "T") return "T";
  return "U";
}
function triOr(a: Tri, b: Tri): Tri {
  if (a === "T" || b === "T") return "T";
  if (a === "F" && b === "F") return "F";
  return "U";
}

export interface TemporalTraceInput {
  readonly events: readonly RuntimeEvent[];
  // Required when fluent atoms are used and the calculus axioms are
  // basis-scoped (vector fluents); event-only formulas may omit it.
  readonly basis?: ExecutionBasis | undefined;
  // A completed trace (terminal reached) resolves future obligations at the
  // end of trace (LTLf); an open prefix leaves them undetermined (REQ -004).
  readonly completed: boolean;
}

interface TraceContext {
  readonly events: readonly RuntimeEvent[];
  readonly completed: boolean;
  // fluentHolds[i] = set of fluent names holding AFTER event i is applied
  readonly fluentHolds: readonly ReadonlySet<string>[];
}

function eventAtomMatches(
  atom: Extract<TemporalAtom, { kind: "event" }>,
  event: RuntimeEvent
): boolean {
  if (event.kind !== atom.eventKind) {
    return false;
  }
  for (const guard of atom.where ?? []) {
    const value = (event as unknown as Record<string, unknown>)[guard.field];
    if (String(value) !== guard.equals) {
      return false;
    }
  }
  return true;
}

function buildTraceContext(input: TemporalTraceInput): TraceContext {
  const projection = deriveRuntimeEventCalculusProjection({
    ...(input.basis === undefined ? {} : { basis: input.basis }),
    events: input.events,
    undeclaredEventBehavior: "ignore"
  });
  const fluentHolds: ReadonlySet<string>[] = [];
  const current = new Set<string>();
  const rowsByEvent = new Map<RuntimeEvent, (typeof projection.effectRows)[number]>();
  for (const row of projection.effectRows) {
    rowsByEvent.set(row.sourceEvent, row);
  }
  for (const event of input.events) {
    const row = rowsByEvent.get(event);
    if (row !== undefined) {
      for (const fluent of row.terminates) {
        current.delete(fluent.name);
      }
      for (const fluent of row.initiates) {
        current.add(fluent.name);
      }
    }
    fluentHolds.push(new Set(current));
  }
  return Object.freeze({
    events: input.events,
    completed: input.completed,
    fluentHolds: Object.freeze(fluentHolds)
  });
}

function evalFormula(
  formula: TemporalFormula,
  i: number,
  ctx: TraceContext,
  memo: Map<TemporalFormula, Map<number, Tri>>
): Tri {
  const n = ctx.events.length;
  if (i < 0 || i >= n) {
    return "U";
  }
  let byIndex = memo.get(formula);
  if (byIndex === undefined) {
    byIndex = new Map();
    memo.set(formula, byIndex);
  }
  const cached = byIndex.get(i);
  if (cached !== undefined) {
    return cached;
  }
  let result: Tri;
  switch (formula.op) {
    case "atom": {
      if (formula.atom.kind === "event") {
        result = eventAtomMatches(formula.atom, ctx.events[i] as RuntimeEvent)
          ? "T"
          : "F";
      } else {
        result = ctx.fluentHolds[i]?.has(formula.atom.fluent) === true ? "T" : "F";
      }
      break;
    }
    case "not":
      result = triNot(evalFormula(formula.child, i, ctx, memo));
      break;
    case "and":
      result = triAnd(
        evalFormula(formula.left, i, ctx, memo),
        evalFormula(formula.right, i, ctx, memo)
      );
      break;
    case "or":
      result = triOr(
        evalFormula(formula.left, i, ctx, memo),
        evalFormula(formula.right, i, ctx, memo)
      );
      break;
    case "implies":
      result = triOr(
        triNot(evalFormula(formula.left, i, ctx, memo)),
        evalFormula(formula.right, i, ctx, memo)
      );
      break;
    case "yesterday":
      result = i === 0 ? "F" : evalFormula(formula.child, i - 1, ctx, memo);
      break;
    case "once": {
      result = "F";
      for (let j = i; j >= 0; j -= 1) {
        const v = evalFormula(formula.child, j, ctx, memo);
        if (v === "T") {
          result = "T";
          break;
        }
        if (v === "U") {
          result = "U";
        }
      }
      break;
    }
    case "historically": {
      result = "T";
      for (let j = i; j >= 0; j -= 1) {
        const v = evalFormula(formula.child, j, ctx, memo);
        if (v === "F") {
          result = "F";
          break;
        }
        if (v === "U") {
          result = "U";
        }
      }
      break;
    }
    case "since": {
      // right held at some j<=i and left held at all k in (j, i]
      result = "F";
      let leftAllT: Tri = "T";
      for (let j = i; j >= 0; j -= 1) {
        const r = evalFormula(formula.right, j, ctx, memo);
        if (r === "T" && leftAllT === "T") {
          result = "T";
          break;
        }
        if (r === "U" || leftAllT === "U") {
          result = "U";
        }
        const l = evalFormula(formula.left, j, ctx, memo);
        leftAllT = triAnd(leftAllT, l);
        if (leftAllT === "F") {
          break;
        }
      }
      break;
    }
    case "next": {
      if (i + 1 < n) {
        result = evalFormula(formula.child, i + 1, ctx, memo);
      } else {
        result = ctx.completed ? "F" : "U";
      }
      break;
    }
    case "eventually": {
      result = ctx.completed ? "F" : "U";
      for (let j = i; j < n; j += 1) {
        const v = evalFormula(formula.child, j, ctx, memo);
        if (v === "T") {
          result = "T";
          break;
        }
        if (v === "U" && (result as Tri) !== "T") {
          result = "U";
        }
      }
      break;
    }
    case "globally": {
      result = ctx.completed ? "T" : "U";
      for (let j = i; j < n; j += 1) {
        const v = evalFormula(formula.child, j, ctx, memo);
        if (v === "F") {
          result = "F";
          break;
        }
        if (v === "U" && (result as Tri) !== "F") {
          result = "U";
        }
      }
      break;
    }
    case "until": {
      // right eventually holds and left holds until then
      result = ctx.completed ? "F" : "U";
      let leftAllT: Tri = "T";
      for (let j = i; j < n; j += 1) {
        const r = evalFormula(formula.right, j, ctx, memo);
        if (r === "T" && leftAllT === "T") {
          result = "T";
          break;
        }
        if (r === "U" || leftAllT === "U") {
          result = "U";
        }
        const l = evalFormula(formula.left, j, ctx, memo);
        leftAllT = triAnd(leftAllT, l);
        if (leftAllT === "F" && r === "F") {
          result = "F";
          break;
        }
      }
      break;
    }
    default: {
      const exhaustive: never = formula;
      throw new TypeError(`unknown temporal operator: ${String(exhaustive)}`);
    }
  }
  byIndex.set(i, result);
  return result;
}

export interface TemporalPropertyVerdict {
  readonly kind: "temporal_property_verdict";
  readonly propertyRef: string;
  readonly formulaDigest: string;
  readonly consequenceClass: TemporalConsequenceClass;
  readonly gatePoint: TemporalGatePoint;
  readonly status: TemporalVerdictStatus;
  readonly vacuous: boolean;
  readonly witnessCount: number | null;
  readonly implicatedEventRefs: readonly string[];
  readonly traceLength: number;
  readonly traceCompleted: boolean;
}

function eventRefOf(event: RuntimeEvent): string {
  // T-211 (P1-12 residue): implicated-event refs are replay identities.
  // An unstamped event cannot be lawfully implicated — the old
  // `<kind>:unstamped` synthetic ref polluted verdict read-models with
  // non-refs. Typed rejection, matching this module's evaluation-path
  // convention.
  const withId = event as { readonly eventId?: unknown };
  if (typeof withId.eventId === "string" && withId.eventId.length > 0) {
    return withId.eventId;
  }
  throw new TypeError(
    `temporal evaluation requires canonical stamped events: ${event.kind} carries no eventId`
  );
}

export function evaluateTemporalProperty(input: {
  readonly property: TemporalProperty;
  readonly trace: TemporalTraceInput;
}): TemporalPropertyVerdict {
  const ctx = buildTraceContext(input.trace);
  const memo = new Map<TemporalFormula, Map<number, Tri>>();
  const n = ctx.events.length;
  let status: TemporalVerdictStatus;
  const implicated: string[] = [];
  const rootIsPast = PAST_OPS.has(input.property.formula.op);
  const evalAt = rootIsPast ? n - 1 : 0;
  if (n === 0) {
    status = input.trace.completed ? "satisfied" : "undetermined";
  } else {
    const v = evalFormula(input.property.formula, evalAt, ctx, memo);
    status = v === "T" ? "satisfied" : v === "F" ? "violated" : "undetermined";
    if (v === "F") {
      // implicate the earliest step where the formula's outermost
      // historically/globally child fails, else step 0
      let node = input.property.formula;
      while ((node.op === "globally" || node.op === "historically") && "child" in node) {
        node = node.child;
        for (let j = 0; j < n; j += 1) {
          if (evalFormula(node, j, ctx, memo) === "F") {
            implicated.push(eventRefOf(ctx.events[j] as RuntimeEvent));
            break;
          }
        }
        break;
      }
    }
  }
  let witnessCount: number | null = null;
  let vacuous = false;
  if (input.property.witnessFormula !== null) {
    witnessCount = 0;
    for (let j = 0; j < n; j += 1) {
      if (evalFormula(input.property.witnessFormula, j, ctx, memo) === "T") {
        witnessCount += 1;
      }
    }
    // REQ -005: zero-witness satisfied is vacuous and shall not satisfy gates
    if (witnessCount === 0 && status === "satisfied") {
      vacuous = true;
    }
  }
  return Object.freeze({
    kind: "temporal_property_verdict",
    propertyRef: input.property.propertyRef,
    formulaDigest: input.property.formulaDigest,
    consequenceClass: input.property.consequenceClass,
    gatePoint: input.property.gatePoint,
    status,
    vacuous,
    witnessCount,
    implicatedEventRefs: Object.freeze([...implicated]),
    traceLength: n,
    traceCompleted: input.trace.completed
  });
}

// A safety gate check at a step: the property's formula evaluated at the
// gate step over the prefix 0..step (past-time formulas are decidable).
export function evaluateSafetyGateAtStep(input: {
  readonly property: TemporalProperty;
  readonly trace: TemporalTraceInput;
  readonly step: number;
}): TemporalVerdictStatus {
  if (input.property.consequenceClass !== "safety_gate") {
    throw new TypeError("evaluateSafetyGateAtStep requires a safety_gate property");
  }
  const prefix: TemporalTraceInput = {
    ...(input.trace.basis === undefined ? {} : { basis: input.trace.basis }),
    events: input.trace.events.slice(0, input.step + 1),
    completed: false
  };
  const ctx = buildTraceContext(prefix);
  const memo = new Map<TemporalFormula, Map<number, Tri>>();
  const v = evalFormula(input.property.formula, input.step, ctx, memo);
  return v === "T" ? "satisfied" : v === "F" ? "violated" : "undetermined";
}
