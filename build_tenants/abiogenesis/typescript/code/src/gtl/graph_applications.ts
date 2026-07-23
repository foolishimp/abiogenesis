import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type {
  ComposeApplication,
  FanInApplication,
  FanOutApplication,
  FoldbackDeclaration,
  GateApplication,
  GtlEdge,
  GraphFunctionApplication,
  IdentityApplication,
  PromoteApplication,
  RecurseApplication,
  SameObjectApplication,
  SubstituteApplication,
} from "./contracts.js";

type ApplicationInput<T extends GraphFunctionApplication> = Omit<
  T,
  "applicationRef" | "kind" | "relationKind"
>;

export type RecurseApplicationInput = Omit<
  ApplicationInput<RecurseApplication>,
  "foldbackRef"
>;

function requireRef(value: string, label: string): string {
  if (value.trim().length === 0) throw new TypeError(`${label} must be non-empty`);
  return value;
}

function requireRefs(values: readonly string[], label: string): readonly string[] {
  if (values.length === 0 || values.some((value) => value.trim().length === 0)) {
    throw new TypeError(`${label} must contain at least one non-empty reference`);
  }
  return values;
}

function validateBase(input: {
  readonly inputContractRef: string;
  readonly outputContractRef: string;
}): void {
  requireRef(input.inputContractRef, "inputContractRef");
  requireRef(input.outputContractRef, "outputContractRef");
}

export function graphEdge(input: {
  readonly fromNodeRef: string;
  readonly toNodeRef: string;
}): GtlEdge {
  requireRef(input.fromNodeRef, "fromNodeRef");
  requireRef(input.toNodeRef, "toNodeRef");
  return deepFreeze({
    edgeRef: graphEdgeRef(input),
    ...input,
  });
}

export function graphEdgeRef(input: {
  readonly fromNodeRef: string;
  readonly toNodeRef: string;
}): string {
  const digest = sha256Canonical({
    fromNodeRef: input.fromNodeRef,
    toNodeRef: input.toNodeRef,
  });
  return `graph-vector://abiogenesis/${digest.slice("sha256:".length)}`;
}

function constructApplication<T extends GraphFunctionApplication>(
  relationKind: T["relationKind"],
  input: Omit<T, "applicationRef" | "kind" | "relationKind">,
): T {
  validateBase(input);
  const body = {
    kind: "graph_function_application" as const,
    relationKind,
    ...input,
  };
  const digest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    ...body,
    applicationRef:
      `graph-function-application://abiogenesis/${digest.slice("sha256:".length)}`,
  }) as T;
}

export function graphFunctionApplicationRef(
  application: Readonly<GraphFunctionApplication>,
): string {
  const { applicationRef: _applicationRef, ...body } = application;
  const digest = sha256Canonical(body as unknown as JsonValue);
  return `graph-function-application://abiogenesis/${digest.slice("sha256:".length)}`;
}

export function foldbackRef(foldback: Readonly<FoldbackDeclaration>): string {
  const digest = sha256Canonical(foldback as unknown as JsonValue);
  return `foldback://abiogenesis/${digest.slice("sha256:".length)}`;
}

export function composeApplication(
  input: ApplicationInput<ComposeApplication>,
): ComposeApplication {
  requireRef(input.leftGraphFunctionRef, "leftGraphFunctionRef");
  requireRef(input.rightGraphFunctionRef, "rightGraphFunctionRef");
  return constructApplication("compose", input);
}

export function substituteApplication(
  input: ApplicationInput<SubstituteApplication>,
): SubstituteApplication {
  requireRef(input.outerGraphFunctionRef, "outerGraphFunctionRef");
  requireRef(input.targetVectorRef, "targetVectorRef");
  requireRef(input.innerGraphFunctionRef, "innerGraphFunctionRef");
  return constructApplication("substitute", input);
}

export function recurseApplication(
  input: RecurseApplicationInput,
): RecurseApplication {
  requireRef(input.graphFunctionRef, "graphFunctionRef");
  requireRef(input.terminationRuleRef, "terminationRuleRef");
  requireRefs(input.terminationEvaluatorRefs, "terminationEvaluatorRefs");
  if (!Number.isSafeInteger(input.bound) || input.bound < 1) {
    throw new TypeError("bound must be one positive safe integer");
  }
  if (
    input.foldback.mode !== "rebind" ||
    input.foldback.binding.trim().length === 0 ||
    input.foldback.requiresParentEvaluation !== true
  ) {
    throw new TypeError(
      "foldback must declare rebind mode, one binding, and parent re-evaluation",
    );
  }
  const canonicalFoldback = deepFreeze({ ...input.foldback });
  return constructApplication("recurse", {
    ...input,
    terminationEvaluatorRefs: [...input.terminationEvaluatorRefs],
    foldbackRef: foldbackRef(canonicalFoldback),
    foldback: canonicalFoldback,
  });
}

export function fanOutApplication(
  input: ApplicationInput<FanOutApplication>,
): FanOutApplication {
  requireRef(input.elementGraphFunctionRef, "elementGraphFunctionRef");
  requireRef(input.inputVectorRef, "inputVectorRef");
  requireRef(input.outputVectorRef, "outputVectorRef");
  requireRef(input.inputMemberContractRef, "inputMemberContractRef");
  requireRef(input.outputMemberContractRef, "outputMemberContractRef");
  return constructApplication("fan_out", input);
}

export function fanInApplication(
  input: ApplicationInput<FanInApplication>,
): FanInApplication {
  requireRef(input.reducerGraphFunctionRef, "reducerGraphFunctionRef");
  requireRef(input.inputVectorRef, "inputVectorRef");
  return constructApplication("fan_in", input);
}

export function gateApplication(
  input: ApplicationInput<GateApplication>,
): GateApplication {
  requireRef(input.targetRef, "targetRef");
  requireRef(input.ruleRef, "ruleRef");
  requireRefs(input.evaluatorRefs, "evaluatorRefs");
  return constructApplication("gate", {
    ...input,
    evaluatorRefs: [...input.evaluatorRefs],
  });
}

export function promoteApplication(
  input: ApplicationInput<PromoteApplication>,
): PromoteApplication {
  requireRef(input.sourceRef, "sourceRef");
  requireRef(input.targetRef, "targetRef");
  if (
    input.sourceRef !== input.inputContractRef ||
    input.targetRef !== input.outputContractRef
  ) {
    throw new TypeError("promote source and target must bind the declared outer contracts");
  }
  return constructApplication("promote", input);
}

export function identityApplication(
  input: ApplicationInput<IdentityApplication>,
): IdentityApplication {
  requireRef(input.targetRef, "targetRef");
  if (input.inputContractRef !== input.outputContractRef) {
    throw new TypeError("identity must preserve one exact interface");
  }
  return constructApplication("identity", input);
}

export function sameObjectApplication(
  input: ApplicationInput<SameObjectApplication>,
): SameObjectApplication {
  requireRef(input.leftRef, "leftRef");
  requireRef(input.rightRef, "rightRef");
  requireRef(input.witnessRef, "witnessRef");
  return constructApplication("same_object", input);
}
