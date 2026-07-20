// Implements: REQ-R-ABG3-INTERPRET
// Implements: REQ-R-ABG3-RUN

import type { Module } from "../../../gtl/m02/contracts/carriers.js";
import {
  constructModuleLookupAuthority,
  type ModuleLookupAuthority
} from "../../../gtl/m02/contracts/lookup.js";
import {
  constructExecutionBasis,
  type ExecutionBasisInit
} from "../contracts/constructors.js";
import type {
  ExecutionBasis,
  RuntimeRegime,
  StartInputAssetBinding,
  StartIntent,
  StartOutputWorkspaceBinding,
  StartRequestedOutput,
  StartRuntimeTraversalStrategySelection
} from "../contracts/carriers.js";
import { COMPUTE_BASIS_FAILURE_CLASS_VALUES } from "../contracts/carriers.js";
import {
  parseNonEmptyString,
  parseOptionalField,
  parsePlainObject,
  parseString,
  parseUnknownArray
} from "../../../shared/validation/primitives.js";
import { parseUntil } from "../../../shared/validation/governed_enums.js";

function parseNullableNonEmptyString(input: unknown, label: string): string | null {
  if (input === undefined || input === null) {
    return null;
  }
  return parseNonEmptyString(input, label);
}

function parseRuntimeRegime(input: unknown, label: string): RuntimeRegime {
  if (input === undefined || input === null) {
    throw new TypeError(
      `${label}: ${COMPUTE_BASIS_FAILURE_CLASS_VALUES[0]}; explicit defaultRegime is required to choose F_D, F_P, or F_H`
    );
  }
  const regime = parseString(input, label);
  if (regime === "F_D" || regime === "F_P" || regime === "F_H") {
    return regime;
  }
  throw new TypeError(
    `${label}: expected one of "F_D", "F_P", "F_H", got ${JSON.stringify(regime)}`
  );
}

function deriveIdentity(prefix: string, payload: unknown): string {
  return `${prefix}:${JSON.stringify(payload)}`;
}

function readOptionalAlias(
  input: Record<string, unknown>,
  firstField: string,
  secondField: string
): unknown {
  if (Object.hasOwn(input, firstField)) {
    return input[firstField];
  }
  if (Object.hasOwn(input, secondField)) {
    return input[secondField];
  }
  return undefined;
}

function readRequiredStringAlias(
  input: Record<string, unknown>,
  firstField: string,
  secondField: string,
  label: string
): string {
  const value = readOptionalAlias(input, firstField, secondField);
  return parseNonEmptyString(value, label);
}

function parseStartInputBindings(
  input: unknown,
  label: string
): readonly StartInputAssetBinding[] | undefined {
  if (input === undefined) {
    return undefined;
  }
  return Object.freeze(
    parseUnknownArray(input, label).map((item, index) => {
      const itemObject = parsePlainObject(item, `${label}[${index}]`);
      return Object.freeze({
        assetRef: readRequiredStringAlias(
          itemObject,
          "assetRef",
          "asset_ref",
          `${label}[${index}].assetRef`
        ),
        assetType: readRequiredStringAlias(
          itemObject,
          "assetType",
          "asset_type",
          `${label}[${index}].assetType`
        ),
        uri: parseNonEmptyString(itemObject["uri"], `${label}[${index}].uri`)
      });
    })
  );
}

function parseStartRequestedOutputs(
  input: unknown,
  label: string
): readonly StartRequestedOutput[] | undefined {
  if (input === undefined) {
    return undefined;
  }
  return Object.freeze(
    parseUnknownArray(input, label).map((item, index) => {
      const itemObject = parsePlainObject(item, `${label}[${index}]`);
      const outputWorkspace = parseStartOutputWorkspaceBinding(
        readOptionalAlias(itemObject, "outputWorkspace", "output_workspace"),
        `${label}[${index}].outputWorkspace`
      );
      return Object.freeze({
        outputName: readRequiredStringAlias(
          itemObject,
          "outputName",
          "output_name",
          `${label}[${index}].outputName`
        ),
        outputAssetType: readRequiredStringAlias(
          itemObject,
          "outputAssetType",
          "output_asset_type",
          `${label}[${index}].outputAssetType`
        ),
        relativePath: readRequiredStringAlias(
          itemObject,
          "relativePath",
          "relative_path",
          `${label}[${index}].relativePath`
        ),
        ...(outputWorkspace === undefined ? {} : { outputWorkspace })
      });
    })
  );
}

function parseOptionalStringArray(
  input: unknown,
  label: string
): readonly string[] | undefined {
  if (input === undefined) {
    return undefined;
  }
  return Object.freeze(
    parseUnknownArray(input, label).map((item, index) =>
      parseNonEmptyString(item, `${label}[${index}]`)
    )
  );
}

function parseRequiredStringArray(input: unknown, label: string): readonly string[] {
  const values = parseOptionalStringArray(input, label);
  if (values === undefined || values.length === 0) {
    throw new TypeError(`${label}: expected at least one ref`);
  }
  return values;
}

function parseOptionalNonNegativeIntegerArray(
  input: unknown,
  label: string
): readonly number[] | undefined {
  if (input === undefined) {
    return undefined;
  }
  return Object.freeze(
    parseUnknownArray(input, label).map((item, index) => {
      if (typeof item !== "number" || !Number.isInteger(item) || item < 0) {
        throw new TypeError(`${label}[${index}]: expected non-negative integer`);
      }
      return item;
    })
  );
}

function parseOptionalPositiveInteger(input: unknown, label: string): number | undefined {
  if (input === undefined || input === null) {
    return undefined;
  }
  if (typeof input !== "number" || !Number.isInteger(input) || input <= 0) {
    throw new TypeError(`${label}: expected positive integer`);
  }
  return input;
}

function parseStartRuntimeTraversalSelectionBatch(
  input: unknown,
  label: string
): StartRuntimeTraversalStrategySelection["batch"] | undefined {
  if (input === undefined) {
    return undefined;
  }
  const batchObject = parsePlainObject(input, label);
  const targetItemCount = parseOptionalPositiveInteger(
    readOptionalAlias(batchObject, "targetItemCount", "target_item_count"),
    `${label}.targetItemCount`
  );
  const maxItemCount = parseOptionalPositiveInteger(
    readOptionalAlias(batchObject, "maxItemCount", "max_item_count"),
    `${label}.maxItemCount`
  );
  const maxTokenPressure = parseOptionalPositiveInteger(
    readOptionalAlias(batchObject, "maxTokenPressure", "max_token_pressure"),
    `${label}.maxTokenPressure`
  );
  return Object.freeze({
    ...(targetItemCount === undefined ? {} : { targetItemCount }),
    ...(maxItemCount === undefined ? {} : { maxItemCount }),
    ...(maxTokenPressure === undefined ? {} : { maxTokenPressure })
  });
}

function parseStartRuntimeTraversalSelectionContinuation(
  input: unknown,
  label: string
): StartRuntimeTraversalStrategySelection["continuation"] | undefined {
  if (input === undefined) {
    return undefined;
  }
  const continuationObject = parsePlainObject(input, label);
  const sameEdgeUntilInput = readOptionalAlias(
    continuationObject,
    "sameEdgeUntil",
    "same_edge_until"
  );
  const sameEdgeUntil =
    sameEdgeUntilInput === undefined
      ? undefined
      : parseString(sameEdgeUntilInput, `${label}.sameEdgeUntil`);
  if (
    sameEdgeUntil !== undefined &&
    sameEdgeUntil !== "foldback_closed" &&
    sameEdgeUntil !== "retry_budget_exhausted"
  ) {
    throw new TypeError(
      `${label}.sameEdgeUntil: expected foldback_closed or retry_budget_exhausted`
    );
  }
  const maxAttemptsWithoutNewSignal = parseOptionalPositiveInteger(
    readOptionalAlias(
      continuationObject,
      "maxAttemptsWithoutNewSignal",
      "max_attempts_without_new_signal"
    ),
    `${label}.maxAttemptsWithoutNewSignal`
  );
  const maxTotalAttempts = parseOptionalPositiveInteger(
    readOptionalAlias(
      continuationObject,
      "maxTotalAttempts",
      "max_total_attempts"
    ),
    `${label}.maxTotalAttempts`
  );
  return Object.freeze({
    ...(sameEdgeUntil === undefined ? {} : { sameEdgeUntil }),
    ...(maxAttemptsWithoutNewSignal === undefined
      ? {}
      : { maxAttemptsWithoutNewSignal }),
    ...(maxTotalAttempts === undefined ? {} : { maxTotalAttempts })
  });
}

function parseStartRuntimeTraversalSelections(
  input: unknown,
  label: string
): readonly StartRuntimeTraversalStrategySelection[] | undefined {
  if (input === undefined) {
    return undefined;
  }
  return Object.freeze(
    parseUnknownArray(input, label).map((item, index) => {
      const itemObject = parsePlainObject(item, `${label}[${index}]`);
      const kind = parseString(itemObject["kind"], `${label}[${index}].kind`);
      if (kind !== "start_runtime_traversal_strategy_selection") {
        throw new TypeError(
          `${label}[${index}].kind: expected start_runtime_traversal_strategy_selection`
        );
      }
      const requiredProgressArtifactRefs = parseOptionalStringArray(
        readOptionalAlias(
          itemObject,
          "requiredProgressArtifactRefs",
          "required_progress_artifact_refs"
        ),
        `${label}[${index}].requiredProgressArtifactRefs`
      );
      const orderingConstraintRefs = parseOptionalStringArray(
        readOptionalAlias(
          itemObject,
          "orderingConstraintRefs",
          "ordering_constraint_refs"
        ),
        `${label}[${index}].orderingConstraintRefs`
      );
      const phaseGateRefs = parseOptionalStringArray(
        readOptionalAlias(itemObject, "phaseGateRefs", "phase_gate_refs"),
        `${label}[${index}].phaseGateRefs`
      );
      const basisRefs = parseOptionalStringArray(
        readOptionalAlias(itemObject, "basisRefs", "basis_refs"),
        `${label}[${index}].basisRefs`
      );
      const vectorIndexes = parseOptionalNonNegativeIntegerArray(
        readOptionalAlias(itemObject, "vectorIndexes", "vector_indexes"),
        `${label}[${index}].vectorIndexes`
      );
      const edgeRefs = parseOptionalStringArray(
        readOptionalAlias(itemObject, "edgeRefs", "edge_refs"),
        `${label}[${index}].edgeRefs`
      );
      const batch = parseStartRuntimeTraversalSelectionBatch(
        readOptionalAlias(itemObject, "batch", "batch"),
        `${label}[${index}].batch`
      );
      const continuation = parseStartRuntimeTraversalSelectionContinuation(
        readOptionalAlias(itemObject, "continuation", "continuation"),
        `${label}[${index}].continuation`
      );
      return Object.freeze({
        kind: "start_runtime_traversal_strategy_selection" as const,
        selectionRef: readRequiredStringAlias(
          itemObject,
          "selectionRef",
          "selection_ref",
          `${label}[${index}].selectionRef`
        ),
        strategyOwnerRef: readRequiredStringAlias(
          itemObject,
          "strategyOwnerRef",
          "strategy_owner_ref",
          `${label}[${index}].strategyOwnerRef`
        ),
        strategyLabel: readRequiredStringAlias(
          itemObject,
          "strategyLabel",
          "strategy_label",
          `${label}[${index}].strategyLabel`
        ),
        enforcementPrimitives: parseRequiredStringArray(
          readOptionalAlias(
            itemObject,
            "enforcementPrimitives",
            "enforcement_primitives"
          ),
          `${label}[${index}].enforcementPrimitives`
        ),
        selectedScheduleItemRefs: parseRequiredStringArray(
          readOptionalAlias(
            itemObject,
            "selectedScheduleItemRefs",
            "selected_schedule_item_refs"
          ),
          `${label}[${index}].selectedScheduleItemRefs`
        ),
        ...(requiredProgressArtifactRefs === undefined
          ? {}
          : { requiredProgressArtifactRefs }),
        ...(orderingConstraintRefs === undefined ? {} : { orderingConstraintRefs }),
        ...(phaseGateRefs === undefined ? {} : { phaseGateRefs }),
        ...(basisRefs === undefined ? {} : { basisRefs }),
        ...(vectorIndexes === undefined ? {} : { vectorIndexes }),
        ...(edgeRefs === undefined ? {} : { edgeRefs }),
        ...(batch === undefined ? {} : { batch }),
        ...(continuation === undefined ? {} : { continuation })
      } satisfies StartRuntimeTraversalStrategySelection);
    })
  );
}

function parseStartOutputWorkspaceBinding(
  input: unknown,
  label: string
): StartOutputWorkspaceBinding | undefined {
  if (input === undefined) {
    return undefined;
  }
  const workspaceObject = parsePlainObject(input, label);
  const authorityRefInput = readOptionalAlias(
    workspaceObject,
    "authorityRef",
    "authority_ref"
  );
  return Object.freeze({
    workspaceRef: readRequiredStringAlias(
      workspaceObject,
      "workspaceRef",
      "workspace_ref",
      `${label}.workspaceRef`
    ),
    workspaceRoot: readRequiredStringAlias(
      workspaceObject,
      "workspaceRoot",
      "workspace_root",
      `${label}.workspaceRoot`
    ),
    authorityRef: parseNullableNonEmptyString(
      authorityRefInput,
      `${label}.authorityRef`
    )
  });
}

export function admitStartIntent(
  input: unknown,
  label = "StartIntent"
): StartIntent {
  const intentObject = parsePlainObject(input, label);
  const scopeObject = parsePlainObject(intentObject["scope"], `${label}.scope`);
  const targetObject = parsePlainObject(intentObject["target"], `${label}.target`);

  const scopeKind = parseString(scopeObject["kind"], `${label}.scope.kind`);
  if (scopeKind !== "workspace") {
    throw new TypeError(
      `${label}.scope.kind: expected "workspace", got ${JSON.stringify(scopeKind)}`
    );
  }

  const targetKind = parseString(targetObject["kind"], `${label}.target.kind`);
  if (targetKind !== "graph_function") {
    throw new TypeError(
      `${label}.target.kind: expected "graph_function", got ${JSON.stringify(targetKind)}`
    );
  }

  const until = parseUntil(intentObject["until"], `${label}.until`);
  const inputBindings = parseStartInputBindings(
    readOptionalAlias(intentObject, "inputBindings", "input_bindings"),
    `${label}.inputBindings`
  );
  const requestedOutputs = parseStartRequestedOutputs(
    readOptionalAlias(intentObject, "requestedOutputs", "requested_outputs"),
    `${label}.requestedOutputs`
  );
  const runtimeTraversalSelections = parseStartRuntimeTraversalSelections(
    readOptionalAlias(
      intentObject,
      "runtimeTraversalSelections",
      "runtime_traversal_selections"
    ),
    `${label}.runtimeTraversalSelections`
  );

  return Object.freeze({
    scope: Object.freeze({
      kind: "workspace",
      workspaceRoot: parseNonEmptyString(
        scopeObject["workspaceRoot"],
        `${label}.scope.workspaceRoot`
      ),
      moduleName: parseNonEmptyString(
        scopeObject["moduleName"],
        `${label}.scope.moduleName`
      )
    }),
    target: Object.freeze({
      kind: "graph_function",
      handle: parseNonEmptyString(targetObject["handle"], `${label}.target.handle`)
    }),
    until,
    ...(inputBindings === undefined ? {} : { inputBindings }),
    ...(requestedOutputs === undefined ? {} : { requestedOutputs }),
    ...(runtimeTraversalSelections === undefined
      ? {}
      : { runtimeTraversalSelections })
  });
}

export function admitResolvedRuntimeIdentity(
  input: unknown,
  label = "ResolvedRuntimeIdentity"
): ExecutionBasis["runtimeIdentity"] {
  const runtimeObject = parsePlainObject(input, label);
  return Object.freeze({
    workerId: parseNonEmptyString(runtimeObject["workerId"], `${label}.workerId`),
    backendId: parseNonEmptyString(
      runtimeObject["backendId"],
      `${label}.backendId`
    ),
    buildId: parseNonEmptyString(runtimeObject["buildId"], `${label}.buildId`),
    resolvedRuntimeRef: parseNonEmptyString(
      runtimeObject["resolvedRuntimeRef"],
      `${label}.resolvedRuntimeRef`
    )
  });
}

export function admitResolvedPolicyIdentity(
  input: unknown,
  label = "ResolvedPolicyIdentity"
): ExecutionBasis["resolvedPolicy"] {
  const policyObject = parsePlainObject(input, label);
  const defaultRegime = parseRuntimeRegime(
    policyObject["defaultRegime"],
    `${label}.defaultRegime`
  );
  const dispatchRef = parseNullableNonEmptyString(
    parseOptionalField(policyObject, "dispatchRef"),
    `${label}.dispatchRef`
  );
  const approvalSubjectRef = parseNullableNonEmptyString(
    parseOptionalField(policyObject, "approvalSubjectRef"),
    `${label}.approvalSubjectRef`
  );

  if (defaultRegime === "F_P" && dispatchRef === null) {
    throw new TypeError(`${label}.dispatchRef: required for F_P`);
  }
  if (defaultRegime === "F_H" && approvalSubjectRef === null) {
    throw new TypeError(`${label}.approvalSubjectRef: required for F_H`);
  }

  return Object.freeze({
    resolvedPolicyBundleRef: parseNonEmptyString(
      policyObject["resolvedPolicyBundleRef"],
      `${label}.resolvedPolicyBundleRef`
    ),
    defaultRegime,
    dispatchRef,
    approvalSubjectRef
  });
}

function normalizeOptionalString(
  value: string | null | undefined,
  label: string
): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (value.length === 0) {
    throw new TypeError(`${label} must be non-empty when provided`);
  }
  return value;
}

function normalizeOptionalSha256Digest(
  value: string | null | undefined,
  label: string
): string | null {
  const normalized = normalizeOptionalString(value, label);
  if (normalized !== null && !/^sha256:[0-9a-f]{64}$/u.test(normalized)) {
    throw new TypeError(`${label} must be a sha256:<64-hex> digest`);
  }
  return normalized;
}

export interface ExecutionBasisAdmissionInput
  extends Omit<
    ExecutionBasisInit,
    | "basisId"
    | "lookupAuthority"
    | "runId"
    | "workKey"
    | "frameId"
    | "frameLineageId"
    | "startAdmissionWitnessDigest"
  > {
  readonly lookupAuthority?: ModuleLookupAuthority;
  readonly runId?: string | null;
  readonly workKey?: string | null;
  readonly frameId?: string | null;
  readonly frameLineageId?: string | null;
  readonly startAdmissionWitnessDigest?: string | null;
}

export function admitExecutionBasis(
  input: ExecutionBasisAdmissionInput
): ExecutionBasis {
  const module = input.module satisfies Module;
  const lookupAuthority =
    input.lookupAuthority ?? constructModuleLookupAuthority(module);
  if (lookupAuthority.moduleName !== module.name) {
    throw new TypeError(
      `ExecutionBasis.lookupAuthority.moduleName: expected ${JSON.stringify(module.name)}, got ${JSON.stringify(lookupAuthority.moduleName)}`
    );
  }
  const runId = normalizeOptionalString(input.runId, "ExecutionBasis.runId");
  const workKey = normalizeOptionalString(input.workKey, "ExecutionBasis.workKey");
  const frameId = normalizeOptionalString(input.frameId, "ExecutionBasis.frameId");
  const frameLineageId = normalizeOptionalString(
    input.frameLineageId,
    "ExecutionBasis.frameLineageId"
  );
  const startAdmissionWitnessDigest = normalizeOptionalSha256Digest(
    input.startAdmissionWitnessDigest,
    "ExecutionBasis.startAdmissionWitnessDigest"
  );
  return constructExecutionBasis({
    basisId: deriveIdentity("execution_basis", {
      moduleName: input.module.name,
      startIntent: input.startIntent,
      runtimeIdentity: input.runtimeIdentity,
      resolvedPolicy: input.resolvedPolicy,
      runId,
      workKey,
      frameId,
      frameLineageId,
      startAdmissionWitnessDigest
    }),
    startIntent: input.startIntent,
    module,
    lookupAuthority,
    runtimeIdentity: input.runtimeIdentity,
    resolvedPolicy: input.resolvedPolicy,
    runId,
    workKey,
    frameId,
    frameLineageId,
    startAdmissionWitnessDigest
  });
}
