// Implements: T-082-TS
// Implements: T-104-TS
// Implements: REQ-R-ABG3-BINDING
// Implements: REQ-R-ABG3-BINDING-015
// Implements: REQ-R-ABG3-PROVENANCE
// Implements: REQ-R-ABG3-EVENTS

import type {
  ExecutionBasis,
  OutputBindingAdmittedEvent,
  OutputInstanceAllocatedEvent,
  OutputMaterializationObservedEvent,
  RuntimeEvent
} from "./carriers.js";
import {
  assertBasisEvent,
  assertNonEmptyString,
  assertVectorIndexInRange,
  frameIdForBasis,
  freezeStringArray,
  graphCallIdForBasis,
  vectorEdge
} from "./runtime_support.js";

export type WorkspaceAssetBindingRole = "input" | "output";
export type WorkspaceAssetBindingSource =
  | "caller"
  | "abg_allocation"
  | "runtime_observation";
export type OutputWorkspaceBindingSource = "caller" | "runtime_observation";

export interface WorkspaceAssetBinding {
  readonly kind: "workspace_asset_binding";
  readonly assetRef: string;
  readonly assetType: string;
  readonly uri: string;
  readonly workspaceRoot: string;
  readonly bindingRole: WorkspaceAssetBindingRole;
  readonly source: WorkspaceAssetBindingSource;
  readonly materializationRoot: string | null;
  readonly allowedWriteRoots: readonly string[];
}

export interface OutputWorkspaceBinding {
  readonly kind: "output_workspace_binding";
  readonly workspaceRef: string;
  readonly workspaceRoot: string;
  readonly authorityRef: string | null;
  readonly source: OutputWorkspaceBindingSource;
}

export type WorkspaceAssetBindingFailureReason =
  | "empty_asset_ref"
  | "empty_asset_type"
  | "empty_uri"
  | "empty_workspace_root"
  | "empty_allowed_write_root";

export type OutputWorkspaceBindingFailureReason =
  | "empty_workspace_ref"
  | "empty_workspace_root";

export type WorkspaceAssetBindingResult =
  | { readonly ok: true; readonly binding: WorkspaceAssetBinding }
  | {
      readonly ok: false;
      readonly reason: WorkspaceAssetBindingFailureReason;
      readonly detail: string;
    };

export type OutputWorkspaceBindingResult =
  | { readonly ok: true; readonly binding: OutputWorkspaceBinding }
  | {
      readonly ok: false;
      readonly reason: OutputWorkspaceBindingFailureReason;
      readonly detail: string;
    };

export interface WorkspaceAssetBindingInput {
  readonly assetRef: string;
  readonly assetType: string;
  readonly uri: string;
  readonly workspaceRoot: string;
  readonly bindingRole: WorkspaceAssetBindingRole;
  readonly source: WorkspaceAssetBindingSource;
  readonly materializationRoot?: string | null;
  readonly allowedWriteRoots?: readonly string[];
}

export interface OutputWorkspaceBindingInput {
  readonly workspaceRef: string;
  readonly workspaceRoot: string;
  readonly authorityRef?: string | null;
  readonly source: OutputWorkspaceBindingSource;
}

export interface OutputInstanceAllocation {
  readonly kind: "output_instance_allocation";
  readonly allocationId: string;
  readonly assetRef: string;
  readonly assetType: string;
  readonly outputName: string;
  readonly materializationRoot: string;
  readonly materializationUri: string;
  readonly allowedWriteRoots: readonly string[];
  readonly inputWorkspaceRoot: string;
  readonly outputWorkspaceRef: string;
  readonly outputWorkspaceRoot: string;
  readonly outputWorkspaceAuthorityRef: string | null;
  readonly graphFunctionId: string;
  readonly graphFunctionName: string;
  readonly basisId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
}

export type OutputAllocationFailureReason =
  | "empty_output_name"
  | "empty_output_asset_type"
  | "empty_relative_path"
  | "unsafe_relative_path"
  | "collision";

export type OutputAllocationResult =
  | { readonly ok: true; readonly allocation: OutputInstanceAllocation }
  | {
      readonly ok: false;
      readonly reason: OutputAllocationFailureReason;
      readonly detail: string;
    };

export interface OutputAllocationRequest {
  readonly basis: ExecutionBasis;
  readonly outputName: string;
  readonly outputAssetType: string;
  readonly relativePath: string;
  readonly outputWorkspaceBinding?: OutputWorkspaceBinding;
  readonly existingAllocations?: readonly OutputInstanceAllocation[];
}

export interface OutputPluginHandoffManifest {
  readonly kind: "output_plugin_handoff_manifest";
  readonly manifestRef: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly admittedInputRefs: readonly string[];
  readonly inputWorkspaceRoots: readonly string[];
  readonly allocatedOutputs: readonly OutputInstanceAllocation[];
  readonly outputWorkspaceRefs: readonly string[];
  readonly outputWorkspaceRoots: readonly string[];
  readonly allowedWriteRoots: readonly string[];
  readonly proofObligationRefs: readonly string[];
}

export interface OutputAllocationProjection {
  readonly kind: "output_allocation_projection";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly allocations: readonly OutputInstanceAllocation[];
  readonly bindings: readonly WorkspaceAssetBinding[];
  readonly materializations: readonly {
    readonly allocationId: string;
    readonly assetRef: string;
    readonly materializedRef: string;
    readonly materializedPath: string;
    readonly digest: string;
    readonly observerRef: string;
    readonly artifactRefs: readonly string[];
  }[];
  readonly allocatedOutputRefs: readonly string[];
  readonly materializedOutputRefs: readonly string[];
}

function failure(
  reason: OutputAllocationFailureReason,
  detail: string
): OutputAllocationResult {
  return Object.freeze({ ok: false, reason, detail } as const);
}

function bindingFailure(
  reason: WorkspaceAssetBindingFailureReason,
  detail: string
): WorkspaceAssetBindingResult {
  return Object.freeze({ ok: false, reason, detail } as const);
}

function outputWorkspaceBindingFailure(
  reason: OutputWorkspaceBindingFailureReason,
  detail: string
): OutputWorkspaceBindingResult {
  return Object.freeze({ ok: false, reason, detail } as const);
}

function safeSegment(value: string): string {
  const trimmed = value.trim();
  const safe = trimmed.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "");
  return safe.length === 0 ? "asset" : safe;
}

function trimTrailingSlashes(value: string): string {
  const trimmed = value.replace(/\/+$/g, "");
  return trimmed.length === 0 && value.startsWith("/") ? "/" : trimmed;
}

function freezeUniqueSortedStrings(values: readonly string[]): readonly string[] {
  return freezeStringArray([...new Set(values)].sort());
}

function canonicalPath(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.includes("\\") || trimmed.includes("\0")) {
    return null;
  }
  const startsWithSlash = trimmed.startsWith("/");
  const segments: string[] = [];
  for (const segment of trimmed.split("/")) {
    if (segment.length === 0 || segment === ".") {
      continue;
    }
    if (segment === "..") {
      if (segments.length === 0) {
        return null;
      }
      segments.pop();
      continue;
    }
    segments.push(segment);
  }
  const normalized = segments.join("/");
  if (startsWithSlash) {
    return normalized.length === 0 ? "/" : `/${normalized}`;
  }
  return normalized;
}

function normalizeRelativePath(value: string): OutputAllocationResult | string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return failure("empty_relative_path", "Output relative path must be present");
  }
  if (trimmed.startsWith("/") || trimmed.includes("\\")) {
    return failure(
      "unsafe_relative_path",
      "Output relative path must be relative and slash-normalized"
    );
  }
  const segments = trimmed.split("/");
  for (const segment of segments) {
    if (segment.length === 0 || segment === "." || segment === "..") {
      return failure(
        "unsafe_relative_path",
        `Output relative path contains unsafe segment ${JSON.stringify(segment)}`
      );
    }
  }
  const normalized = canonicalPath(trimmed);
  if (normalized === null) {
    return failure(
      "unsafe_relative_path",
      "Output relative path must be canonicalizable"
    );
  }
  return normalized;
}

function resultIsFailure(
  result: OutputAllocationResult | string
): result is Extract<OutputAllocationResult, { readonly ok: false }> {
  return typeof result !== "string";
}

function assertAllocationBasis(
  basis: ExecutionBasis,
  allocation: OutputInstanceAllocation
): void {
  if (allocation.basisId !== basis.id) {
    throw new TypeError("Output allocation must share the execution basis");
  }
  if (allocation.graphFunctionId !== basis.graphFunction.id) {
    throw new TypeError("Output allocation must share the graph function");
  }
  if (allocation.runId !== basis.runId || allocation.workKey !== basis.workKey) {
    throw new TypeError("Output allocation must share run and work lineage");
  }
}

function defaultOutputWorkspaceRef(basis: ExecutionBasis): string {
  return `workspace://${basis.moduleName}/scope`;
}

export function admitWorkspaceAssetBinding(
  input: WorkspaceAssetBindingInput
): WorkspaceAssetBindingResult {
  if (input.assetRef.length === 0) {
    return bindingFailure("empty_asset_ref", "Workspace asset binding requires assetRef");
  }
  if (input.assetType.length === 0) {
    return bindingFailure("empty_asset_type", "Workspace asset binding requires assetType");
  }
  if (input.uri.length === 0) {
    return bindingFailure("empty_uri", "Workspace asset binding requires uri");
  }
  if (input.workspaceRoot.length === 0) {
    return bindingFailure(
      "empty_workspace_root",
      "Workspace asset binding requires workspaceRoot"
    );
  }
  const allowedWriteRoots = freezeStringArray(input.allowedWriteRoots ?? []);
  for (const root of allowedWriteRoots) {
    if (root.length === 0) {
      return bindingFailure(
        "empty_allowed_write_root",
        "Workspace asset binding allowedWriteRoots must be non-empty"
      );
    }
  }
  return Object.freeze({
    ok: true,
    binding: Object.freeze({
      kind: "workspace_asset_binding",
      assetRef: input.assetRef,
      assetType: input.assetType,
      uri: input.uri,
      workspaceRoot: input.workspaceRoot,
      bindingRole: input.bindingRole,
      source: input.source,
      materializationRoot: input.materializationRoot ?? null,
      allowedWriteRoots
    })
  } as const);
}

export function admitOutputWorkspaceBinding(
  input: OutputWorkspaceBindingInput
): OutputWorkspaceBindingResult {
  if (input.workspaceRef.trim().length === 0) {
    return outputWorkspaceBindingFailure(
      "empty_workspace_ref",
      "Output workspace binding requires workspaceRef"
    );
  }
  const workspaceRoot = canonicalPath(input.workspaceRoot);
  if (workspaceRoot === null || workspaceRoot.length === 0) {
    return outputWorkspaceBindingFailure(
      "empty_workspace_root",
      "Output workspace binding requires a canonical workspaceRoot"
    );
  }
  return Object.freeze({
    ok: true,
    binding: Object.freeze({
      kind: "output_workspace_binding",
      workspaceRef: input.workspaceRef,
      workspaceRoot,
      authorityRef: input.authorityRef ?? null,
      source: input.source
    })
  } as const);
}

export function deriveOutputInstanceAllocation(
  input: OutputAllocationRequest
): OutputAllocationResult {
  if (input.outputName.trim().length === 0) {
    return failure("empty_output_name", "Output allocation requires outputName");
  }
  if (input.outputAssetType.trim().length === 0) {
    return failure(
      "empty_output_asset_type",
      "Output allocation requires outputAssetType"
    );
  }
  const relativePath = normalizeRelativePath(input.relativePath);
  if (resultIsFailure(relativePath)) {
    return relativePath;
  }
  const runSegment = safeSegment(input.basis.runId ?? input.basis.id);
  const graphSegment = safeSegment(input.basis.graphFunction.name);
  const outputSegment = safeSegment(input.outputName);
  const workspaceRoot = trimTrailingSlashes(
    input.outputWorkspaceBinding?.workspaceRoot ?? input.basis.workspaceRoot
  );
  const materializationRoot = [
    workspaceRoot,
    ".ai-workspace",
    "runtime",
    "runs",
    runSegment,
    "assets",
    graphSegment,
    outputSegment
  ].join("/");
  const materializationUri = `${materializationRoot}/${relativePath}`;
  const outputWorkspaceRef =
    input.outputWorkspaceBinding?.workspaceRef ?? defaultOutputWorkspaceRef(input.basis);
  const allocationId = [
    "output-allocation",
    input.basis.id,
    input.basis.graphFunction.id,
    outputWorkspaceRef,
    input.outputName,
    relativePath
  ].join(":");
  const assetRef =
    input.outputWorkspaceBinding === undefined
      ? `workspace://${input.basis.moduleName}/${input.basis.graphFunction.name}` +
        `/${runSegment}/outputs/${input.outputName}`
      : `${trimTrailingSlashes(outputWorkspaceRef)}/${graphSegment}` +
        `/${runSegment}/outputs/${input.outputName}`;
  const existing = input.existingAllocations ?? [];
  if (
    existing.some(
      (allocation) =>
        allocation.allocationId === allocationId ||
        allocation.assetRef === assetRef ||
        allocation.materializationRoot === materializationRoot ||
        allocation.materializationUri === materializationUri
    )
  ) {
    return failure(
      "collision",
      `Output allocation collides with existing allocation ${assetRef}`
    );
  }
  return Object.freeze({
    ok: true,
    allocation: Object.freeze({
      kind: "output_instance_allocation",
      allocationId,
      assetRef,
      assetType: input.outputAssetType,
      outputName: input.outputName,
      materializationRoot,
      materializationUri,
      allowedWriteRoots: freezeStringArray([materializationRoot]),
      inputWorkspaceRoot: trimTrailingSlashes(input.basis.workspaceRoot),
      outputWorkspaceRef,
      outputWorkspaceRoot: workspaceRoot,
      outputWorkspaceAuthorityRef:
        input.outputWorkspaceBinding?.authorityRef ?? null,
      graphFunctionId: input.basis.graphFunction.id,
      graphFunctionName: input.basis.graphFunction.name,
      basisId: input.basis.id,
      runId: input.basis.runId,
      workKey: input.basis.workKey
    })
  } as const);
}

export function isMaterializationPathWithinAllocation(input: {
  readonly allocation: OutputInstanceAllocation;
  readonly materializedPath: string;
}): boolean {
  const materializedPath = canonicalPath(input.materializedPath);
  if (materializedPath === null) {
    return false;
  }
  for (const root of input.allocation.allowedWriteRoots) {
    const normalizedRoot = canonicalPath(root);
    if (normalizedRoot === null) {
      continue;
    }
    if (
      materializedPath === normalizedRoot ||
      (normalizedRoot === "/" && materializedPath.startsWith("/")) ||
      materializedPath.startsWith(`${normalizedRoot}/`)
    ) {
      return true;
    }
  }
  return false;
}

export function constructOutputPluginHandoffManifest(input: {
  readonly basis: ExecutionBasis;
  readonly manifestRef: string;
  readonly admittedInputRefs: readonly string[];
  readonly admittedInputBindings?: readonly WorkspaceAssetBinding[];
  readonly allocatedOutputs: readonly OutputInstanceAllocation[];
  readonly proofObligationRefs: readonly string[];
}): OutputPluginHandoffManifest {
  assertNonEmptyString(input.manifestRef, "OutputPluginHandoffManifest.manifestRef");
  for (const allocation of input.allocatedOutputs) {
    assertAllocationBasis(input.basis, allocation);
  }
  const allowedWriteRoots = freezeStringArray(
    input.allocatedOutputs.flatMap((allocation) => [...allocation.allowedWriteRoots])
  );
  const inputWorkspaceRoots = freezeUniqueSortedStrings(
    [
      ...(input.admittedInputBindings?.map((binding) => binding.workspaceRoot) ?? []),
      input.basis.workspaceRoot
    ]
  );
  const outputWorkspaceRefs = freezeUniqueSortedStrings(
    input.allocatedOutputs
      .map((allocation) => allocation.outputWorkspaceRef)
  );
  const outputWorkspaceRoots = freezeUniqueSortedStrings(
    input.allocatedOutputs
      .map((allocation) => allocation.outputWorkspaceRoot)
  );
  return Object.freeze({
    kind: "output_plugin_handoff_manifest",
    manifestRef: input.manifestRef,
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    admittedInputRefs: freezeStringArray(input.admittedInputRefs),
    inputWorkspaceRoots,
    allocatedOutputs: Object.freeze([...input.allocatedOutputs]),
    outputWorkspaceRefs,
    outputWorkspaceRoots,
    allowedWriteRoots,
    proofObligationRefs: freezeStringArray(input.proofObligationRefs)
  });
}

export function constructOutputInstanceAllocatedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly allocation: OutputInstanceAllocation;
}): OutputInstanceAllocatedEvent {
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  assertAllocationBasis(input.basis, input.allocation);
  return Object.freeze({
    kind: "output_instance_allocated",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    vectorIndex: input.vectorIndex,
    edge: vectorEdge(input.basis, input.vectorIndex),
    allocationId: input.allocation.allocationId,
    assetRef: input.allocation.assetRef,
    assetType: input.allocation.assetType,
    outputName: input.allocation.outputName,
    materializationRoot: input.allocation.materializationRoot,
    materializationUri: input.allocation.materializationUri,
    allowedWriteRoots: freezeStringArray(input.allocation.allowedWriteRoots),
    inputWorkspaceRoot: input.allocation.inputWorkspaceRoot,
    outputWorkspaceRef: input.allocation.outputWorkspaceRef,
    outputWorkspaceRoot: input.allocation.outputWorkspaceRoot,
    outputWorkspaceAuthorityRef: input.allocation.outputWorkspaceAuthorityRef,
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey
  });
}

export function constructOutputBindingAdmittedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly allocation: OutputInstanceAllocation;
  readonly bindingRef: string;
}): OutputBindingAdmittedEvent {
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  assertNonEmptyString(input.bindingRef, "OutputBindingAdmittedEvent.bindingRef");
  assertAllocationBasis(input.basis, input.allocation);
  return Object.freeze({
    kind: "output_binding_admitted",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    vectorIndex: input.vectorIndex,
    edge: vectorEdge(input.basis, input.vectorIndex),
    bindingRef: input.bindingRef,
    allocationId: input.allocation.allocationId,
    assetRef: input.allocation.assetRef,
    assetType: input.allocation.assetType,
    bindingRole: "output",
    source: "abg_allocation",
    allowedWriteRoots: freezeStringArray(input.allocation.allowedWriteRoots),
    outputWorkspaceRef: input.allocation.outputWorkspaceRef,
    outputWorkspaceRoot: input.allocation.outputWorkspaceRoot,
    outputWorkspaceAuthorityRef: input.allocation.outputWorkspaceAuthorityRef
  });
}

export function constructOutputMaterializationObservedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly allocation: OutputInstanceAllocation;
  readonly materializedRef: string;
  readonly materializedPath: string;
  readonly digest: string;
  readonly observerRef: string;
  readonly artifactRefs: readonly string[];
}): OutputMaterializationObservedEvent {
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  assertAllocationBasis(input.basis, input.allocation);
  assertNonEmptyString(
    input.materializedRef,
    "OutputMaterializationObservedEvent.materializedRef"
  );
  assertNonEmptyString(input.digest, "OutputMaterializationObservedEvent.digest");
  assertNonEmptyString(input.observerRef, "OutputMaterializationObservedEvent.observerRef");
  if (
    !isMaterializationPathWithinAllocation({
      allocation: input.allocation,
      materializedPath: input.materializedPath
    })
  ) {
    throw new TypeError(
      "Output materialization observation must stay under the allocated write root"
    );
  }
  return Object.freeze({
    kind: "output_materialization_observed",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    vectorIndex: input.vectorIndex,
    edge: vectorEdge(input.basis, input.vectorIndex),
    allocationId: input.allocation.allocationId,
    assetRef: input.allocation.assetRef,
    materializedRef: input.materializedRef,
    materializedPath: input.materializedPath,
    digest: input.digest,
    observerRef: input.observerRef,
    artifactRefs: freezeStringArray(input.artifactRefs)
  });
}

export function deriveOutputAllocationProjection(input: {
  readonly basis: ExecutionBasis;
  readonly events: readonly RuntimeEvent[];
}): OutputAllocationProjection {
  const allocations = new Map<string, OutputInstanceAllocation>();
  const bindings = new Map<string, WorkspaceAssetBinding>();
  const materializations: OutputAllocationProjection["materializations"][number][] = [];

  for (const event of input.events) {
    assertBasisEvent(input.basis, event);
    if (event.kind === "output_instance_allocated") {
      assertVectorIndexInRange(input.basis, event.vectorIndex);
      allocations.set(
        event.allocationId,
        Object.freeze({
          kind: "output_instance_allocation",
          allocationId: event.allocationId,
          assetRef: event.assetRef,
          assetType: event.assetType,
          outputName: event.outputName,
          materializationRoot: event.materializationRoot,
          materializationUri: event.materializationUri,
          allowedWriteRoots: freezeStringArray(event.allowedWriteRoots),
          inputWorkspaceRoot: event.inputWorkspaceRoot,
          outputWorkspaceRef: event.outputWorkspaceRef,
          outputWorkspaceRoot: event.outputWorkspaceRoot,
          outputWorkspaceAuthorityRef: event.outputWorkspaceAuthorityRef,
          graphFunctionId: event.graphFunctionId,
          graphFunctionName: input.basis.graphFunction.name,
          basisId: event.basisId,
          runId: event.runId,
          workKey: event.workKey
        })
      );
    }
    if (event.kind === "output_binding_admitted") {
      assertVectorIndexInRange(input.basis, event.vectorIndex);
      const bindingResult = admitWorkspaceAssetBinding({
        assetRef: event.assetRef,
        assetType: event.assetType,
        uri: event.assetRef,
        workspaceRoot: event.outputWorkspaceRoot,
        bindingRole: event.bindingRole,
        source: event.source,
        materializationRoot: event.allowedWriteRoots[0] ?? null,
        allowedWriteRoots: event.allowedWriteRoots
      });
      if (!bindingResult.ok) {
        throw new TypeError(bindingResult.detail);
      }
      bindings.set(event.bindingRef, bindingResult.binding);
    }
    if (event.kind === "output_materialization_observed") {
      assertVectorIndexInRange(input.basis, event.vectorIndex);
      const allocation = allocations.get(event.allocationId);
      if (allocation === undefined) {
        throw new TypeError(
          `Output materialization references unknown allocation ${event.allocationId}`
        );
      }
      if (
        !isMaterializationPathWithinAllocation({
          allocation,
          materializedPath: event.materializedPath
        })
      ) {
        throw new TypeError(
          "Output allocation projection rejects materialization outside allocated root"
        );
      }
      materializations.push(
        Object.freeze({
          allocationId: event.allocationId,
          assetRef: event.assetRef,
          materializedRef: event.materializedRef,
          materializedPath: event.materializedPath,
          digest: event.digest,
          observerRef: event.observerRef,
          artifactRefs: freezeStringArray(event.artifactRefs)
        })
      );
    }
  }

  const frozenAllocations = Object.freeze(
    [...allocations.values()].sort((left, right) =>
      left.allocationId.localeCompare(right.allocationId)
    )
  );
  const frozenBindings = Object.freeze(
    [...bindings.entries()]
      .sort((left, right) => left[0].localeCompare(right[0]))
      .map((entry) => entry[1])
  );
  const frozenMaterializations = Object.freeze(
    [...materializations].sort((left, right) =>
      left.materializedRef.localeCompare(right.materializedRef)
    )
  );
  return Object.freeze({
    kind: "output_allocation_projection",
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    allocations: frozenAllocations,
    bindings: frozenBindings,
    materializations: frozenMaterializations,
    allocatedOutputRefs: freezeStringArray(
      frozenAllocations.map((allocation) => allocation.assetRef).sort()
    ),
    materializedOutputRefs: freezeStringArray(
      frozenMaterializations.map((materialization) => materialization.assetRef).sort()
    )
  });
}
