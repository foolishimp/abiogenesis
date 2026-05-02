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
  StartRequestedOutput
} from "../contracts/carriers.js";
import { COMPUTE_BASIS_FAILURE_CLASS_VALUES } from "../contracts/carriers.js";
import {
  parseNonEmptyString,
  parseOptionalField,
  parsePlainObject,
  parseString,
  parseUnknownArray
} from "../../../shared/validation/primitives.js";

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
        )
      });
    })
  );
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

  const until = parseString(intentObject["until"], `${label}.until`);
  if (
    until !== "first_traversal" &&
    until !== "blocked" &&
    until !== "converged"
  ) {
    throw new TypeError(
      `${label}.until: expected "first_traversal", "blocked", or "converged", got ${JSON.stringify(until)}`
    );
  }
  const inputBindings = parseStartInputBindings(
    readOptionalAlias(intentObject, "inputBindings", "input_bindings"),
    `${label}.inputBindings`
  );
  const requestedOutputs = parseStartRequestedOutputs(
    readOptionalAlias(intentObject, "requestedOutputs", "requested_outputs"),
    `${label}.requestedOutputs`
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
    ...(requestedOutputs === undefined ? {} : { requestedOutputs })
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

export interface ExecutionBasisAdmissionInput
  extends Omit<
    ExecutionBasisInit,
    | "basisId"
    | "lookupAuthority"
    | "runId"
    | "workKey"
    | "frameId"
    | "frameLineageId"
  > {
  readonly lookupAuthority?: ModuleLookupAuthority;
  readonly runId?: string | null;
  readonly workKey?: string | null;
  readonly frameId?: string | null;
  readonly frameLineageId?: string | null;
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
  return constructExecutionBasis({
    basisId: deriveIdentity("execution_basis", {
      moduleName: input.module.name,
      startIntent: input.startIntent,
      runtimeIdentity: input.runtimeIdentity,
      resolvedPolicy: input.resolvedPolicy,
      runId: input.runId ?? null,
      workKey: input.workKey ?? null,
      frameId: input.frameId ?? null,
      frameLineageId: input.frameLineageId ?? null
    }),
    startIntent: input.startIntent,
    module,
    lookupAuthority,
    runtimeIdentity: input.runtimeIdentity,
    resolvedPolicy: input.resolvedPolicy,
    runId: normalizeOptionalString(input.runId, "ExecutionBasis.runId"),
    workKey: normalizeOptionalString(input.workKey, "ExecutionBasis.workKey"),
    frameId: normalizeOptionalString(input.frameId, "ExecutionBasis.frameId"),
    frameLineageId: normalizeOptionalString(
      input.frameLineageId,
      "ExecutionBasis.frameLineageId"
    )
  });
}
