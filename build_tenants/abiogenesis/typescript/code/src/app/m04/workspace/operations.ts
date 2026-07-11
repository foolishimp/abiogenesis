// Implements: REQ-P-INSTALL-059
// Implements: REQ-P-INSTALL-060

import { randomUUID } from "node:crypto";
import { isAbsolute, join, resolve } from "node:path";
import {
  admitIJsonText,
  canonicalizeIJson,
  digestCanonicalIJson
} from "../public_sdk/canonical.js";
import type {
  AdmittedWorkspaceState,
  PublicOperationAccepted,
  PublicOperationRefused,
  WorkspaceCreateRequest,
  WorkspaceCreateResult,
  WorkspaceManifest,
  WorkspaceOpenRequest,
  WorkspaceOpenResult,
  WorkspacePathContext
} from "../public_sdk/carriers.js";
import {
  admitToolchainWorkspaceBindingV3,
  admitPublicSdkWorkspaceManifest
} from "../public_sdk/index.js";
import {
  assertToolchainWorkspaceBindingV3Coherence,
  TOOLCHAIN_BINDING_RELATIVE_PATH
} from "../toolchain_binding/index.js";

export const WORKSPACE_MANIFEST_RELATIVE_PATH = join(
  ".abiogenesis",
  "workspace-manifest.json"
);

export interface WorkspaceCreateAttribution {
  readonly actorRef: string;
  readonly provenanceRefs?: readonly string[];
}

export type WorkspaceCreateOutcome =
  | WorkspaceCreateResult
  | PublicOperationRefused<
      "abg.operation.workspace.create",
      | "invalid_target"
      | "workspace_exists"
      | "workspace_identity_conflict"
      | "filesystem_failure"
    >;

export type WorkspaceOpenOutcome =
  | WorkspaceOpenResult
  | PublicOperationRefused<
      "abg.operation.workspace.open",
      "missing" | "malformed" | "stale" | "incompatible"
    >;

function utf8Bytes(value: unknown): Uint8Array {
  return new TextEncoder().encode(canonicalizeIJson(value));
}

function parseJsonBytes(bytes: Uint8Array, label: string): unknown {
  return admitIJsonText(
    new TextDecoder("utf-8", { fatal: true }).decode(bytes),
    label
  );
}

function accepted<K extends string, D extends string, V>(input: {
  readonly operationId: K;
  readonly disposition: D;
  readonly value: V;
  readonly provenanceRefs?: readonly string[];
}): PublicOperationAccepted<K, D, V> {
  return Object.freeze({
    kind: "accepted",
    operationId: input.operationId,
    disposition: input.disposition,
    value: input.value,
    provenanceRefs: Object.freeze([...(input.provenanceRefs ?? [])]),
    exitClassification: "accepted_terminal"
  });
}

function refused<K extends string, C extends string>(input: {
  readonly operationId: K;
  readonly code: C;
  readonly message: string;
  readonly residualRefs?: readonly string[];
  readonly provenanceRefs?: readonly string[];
}): PublicOperationRefused<K, C> {
  return Object.freeze({
    kind: "refused",
    operationId: input.operationId,
    code: input.code,
    message: input.message,
    residualRefs: Object.freeze([...(input.residualRefs ?? [])]),
    provenanceRefs: Object.freeze([...(input.provenanceRefs ?? [])]),
    exitClassification: "refused"
  });
}

function admittedTargetRoot(
  requestRoot: string,
  contextRoot: string
): string | null {
  if (!isAbsolute(requestRoot) || !isAbsolute(contextRoot)) {
    return null;
  }
  const admitted = resolve(requestRoot);
  return admitted === resolve(contextRoot) ? admitted : null;
}

function manifestPath(targetRoot: string): string {
  return join(targetRoot, WORKSPACE_MANIFEST_RELATIVE_PATH);
}

function bindingPath(targetRoot: string, bindingRef: string | null): string {
  if (bindingRef === null) {
    return join(targetRoot, TOOLCHAIN_BINDING_RELATIVE_PATH);
  }
  return isAbsolute(bindingRef) ? bindingRef : join(targetRoot, bindingRef);
}

export async function workspaceCreate(
  request: WorkspaceCreateRequest,
  context: WorkspacePathContext,
  attribution: WorkspaceCreateAttribution
): Promise<WorkspaceCreateOutcome> {
  const targetRoot = admittedTargetRoot(request.targetRoot, context.targetRoot);
  if (targetRoot === null) {
    return refused({
      operationId: "abg.operation.workspace.create",
      code: "invalid_target",
      message: "workspace target must be an absolute path matching its effect context"
    });
  }
  if (
    request.authorityMode !== "clean_no_project_authority" &&
    request.authorityMode !== "imported"
  ) {
    return refused({
      operationId: "abg.operation.workspace.create",
      code: "invalid_target",
      message: "workspace authority mode is invalid"
    });
  }
  if (attribution.actorRef.trim().length === 0) {
    return refused({
      operationId: "abg.operation.workspace.create",
      code: "invalid_target",
      message: "workspace creation requires actor attribution"
    });
  }

  const targetManifestPath = manifestPath(targetRoot);
  try {
    const existing = await context.effects.readBytes(targetManifestPath);
    if (existing !== null) {
      try {
        const admitted = admitPublicSdkWorkspaceManifest(
          parseJsonBytes(existing, "existing workspace manifest")
        );
        return refused({
          operationId: "abg.operation.workspace.create",
          code:
            resolve(admitted.root) === targetRoot
              ? "workspace_exists"
              : "workspace_identity_conflict",
          message:
            resolve(admitted.root) === targetRoot
              ? "workspace manifest already exists"
              : "workspace manifest root conflicts with the requested target"
        });
      } catch {
        return refused({
          operationId: "abg.operation.workspace.create",
          code: "workspace_identity_conflict",
          message: "workspace boundary is occupied by a malformed manifest"
        });
      }
    }

    const manifest: WorkspaceManifest = Object.freeze({
      kind: "abg_workspace_manifest",
      schemaVersion: 1,
      workspaceId: `workspace:${randomUUID()}`,
      root: targetRoot,
      authorityMode: request.authorityMode,
      scaffoldState: "none",
      bindingRef: null,
      configurationRefs: Object.freeze([]),
      createdAt: new Date().toISOString(),
      actorRef: attribution.actorRef,
      provenanceRefs: Object.freeze([...(attribution.provenanceRefs ?? [])])
    });
    await context.effects.makeDirectory(join(targetRoot, ".abiogenesis"));
    await context.effects.writeBytes(targetManifestPath, utf8Bytes(manifest));
    return accepted({
      operationId: "abg.operation.workspace.create",
      disposition: "created",
      value: manifest,
      provenanceRefs: manifest.provenanceRefs
    });
  } catch (error: unknown) {
    return refused({
      operationId: "abg.operation.workspace.create",
      code: "filesystem_failure",
      message: error instanceof Error ? error.message : "workspace creation failed"
    });
  }
}

export async function workspaceOpen(
  request: WorkspaceOpenRequest,
  context: WorkspacePathContext
): Promise<WorkspaceOpenOutcome> {
  const targetRoot = admittedTargetRoot(request.targetRoot, context.targetRoot);
  if (targetRoot === null || !Number.isInteger(request.expectedWorkspaceSchemaVersion)) {
    return refused({
      operationId: "abg.operation.workspace.open",
      code: "malformed",
      message: "workspace open request is malformed"
    });
  }
  if (request.expectedWorkspaceSchemaVersion !== 1) {
    return refused({
      operationId: "abg.operation.workspace.open",
      code: "incompatible",
      message: "workspace schema version is incompatible"
    });
  }

  let bytes: Uint8Array | null;
  try {
    bytes = await context.effects.readBytes(manifestPath(targetRoot));
  } catch (error: unknown) {
    return refused({
      operationId: "abg.operation.workspace.open",
      code: "malformed",
      message: error instanceof Error ? error.message : "workspace manifest read failed"
    });
  }
  if (bytes === null) {
    return refused({
      operationId: "abg.operation.workspace.open",
      code: "missing",
      message: "workspace manifest is missing"
    });
  }

  let manifestInput: unknown;
  try {
    manifestInput = parseJsonBytes(bytes, "workspace manifest");
  } catch (error: unknown) {
    return refused({
      operationId: "abg.operation.workspace.open",
      code: "malformed",
      message: error instanceof Error ? error.message : "workspace manifest is malformed"
    });
  }
  if (
    typeof manifestInput === "object" &&
    manifestInput !== null &&
    "schemaVersion" in manifestInput &&
    manifestInput.schemaVersion !== 1
  ) {
    return refused({
      operationId: "abg.operation.workspace.open",
      code: "incompatible",
      message: "workspace manifest schema version is incompatible"
    });
  }
  let manifest: WorkspaceManifest;
  try {
    manifest = admitPublicSdkWorkspaceManifest(manifestInput);
  } catch (error: unknown) {
    return refused({
      operationId: "abg.operation.workspace.open",
      code: "malformed",
      message: error instanceof Error ? error.message : "workspace manifest is malformed"
    });
  }
  if (resolve(manifest.root) !== targetRoot) {
    return refused({
      operationId: "abg.operation.workspace.open",
      code: "stale",
      message: "workspace manifest root no longer matches the opened workspace"
    });
  }

  const selectedBindingPath = bindingPath(targetRoot, manifest.bindingRef);
  let bindingBytes: Uint8Array | null;
  try {
    bindingBytes = await context.effects.readBytes(selectedBindingPath);
  } catch (error: unknown) {
    return refused({
      operationId: "abg.operation.workspace.open",
      code: "malformed",
      message: error instanceof Error ? error.message : "workspace binding read failed"
    });
  }
  if (bindingBytes === null) {
    if (manifest.bindingRef !== null) {
      return refused({
        operationId: "abg.operation.workspace.open",
        code: "stale",
        message: "workspace manifest names a missing binding"
      });
    }
    const state: AdmittedWorkspaceState = Object.freeze({
      manifest,
      disposition: "unbound",
      bindingRef: null,
      configurationRefs: manifest.configurationRefs
    });
    return accepted({
      operationId: "abg.operation.workspace.open",
      disposition: "unbound",
      value: state,
      provenanceRefs: manifest.provenanceRefs
    });
  }

  let bindingInput: unknown;
  try {
    bindingInput = parseJsonBytes(bindingBytes, "workspace binding");
  } catch (error: unknown) {
    return refused({
      operationId: "abg.operation.workspace.open",
      code: "malformed",
      message: error instanceof Error ? error.message : "workspace binding is malformed"
    });
  }
  if (
    typeof bindingInput === "object" &&
    bindingInput !== null &&
    "schemaVersion" in bindingInput &&
    bindingInput.schemaVersion === "2"
  ) {
    return refused({
      operationId: "abg.operation.workspace.open",
      code: "stale",
      message: "schema-v2 workspace binding is stale on the DS-1 path"
    });
  }

  try {
    const binding = assertToolchainWorkspaceBindingV3Coherence(
      admitToolchainWorkspaceBindingV3(bindingInput)
    );
    if (
      binding.workspaceId !== manifest.workspaceId ||
      resolve(binding.targetRoot) !== targetRoot ||
      binding.workspaceManifestDigest !== digestCanonicalIJson(manifest)
    ) {
      return refused({
        operationId: "abg.operation.workspace.open",
        code: "stale",
        message: "workspace binding identity does not match the workspace manifest"
      });
    }
    const state: AdmittedWorkspaceState = Object.freeze({
      manifest,
      disposition: "ready",
      bindingRef: selectedBindingPath,
      configurationRefs: manifest.configurationRefs
    });
    return accepted({
      operationId: "abg.operation.workspace.open",
      disposition: "ready",
      value: state,
      provenanceRefs: manifest.provenanceRefs
    });
  } catch (error: unknown) {
    return refused({
      operationId: "abg.operation.workspace.open",
      code: "malformed",
      message: error instanceof Error ? error.message : "workspace binding is malformed"
    });
  }
}
