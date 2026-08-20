import * as Effect from "effect/Effect";

import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import {
  preDefinitionFault,
  type DefinitionCall,
  type DefinitionExecutionFault,
  type DefinitionReturn,
  type ExactDefinitionCallable,
} from "../shared/effect_definition.js";
import {
  admitRuntimeContract,
  type OwnerContractSourceDeclaration,
  type OwnerSemanticOutput,
} from "../shared/public_function_contracts.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { WORKSPACE_OPERATION_CONTRACTS } from "./workspace_operation_contracts.js";
import {
  WorkspaceOperationPort,
  type WorkspaceCreateOperationResult,
  type WorkspaceCreatePacket,
  type WorkspaceOpenOperationResult,
  type WorkspaceOpenPacket,
} from "./workspace_operations.js";

type CleanPacket = typeof WORKSPACE_OPERATION_CONTRACTS.create.clean;
type ImportedPacket = typeof WORKSPACE_OPERATION_CONTRACTS.create.imported;
type OpenPacket = typeof WORKSPACE_OPERATION_CONTRACTS.open.open;

export interface WorkspaceResourceAssertion {
  readonly kind: "workspace_resource_assertion";
  readonly schemaVersion: "5.0.0";
  readonly targetRoot: string;
  readonly targetRootDigest: Sha256Digest;
}

export interface WorkspaceResourceReceipt {
  readonly kind: "workspace_resource_receipt";
  readonly schemaVersion: "5.0.0";
  readonly targetRoot: string;
  readonly targetRootDigest: Sha256Digest;
  readonly manifest: Readonly<{
    readonly locator: string;
    readonly valueDigest: Sha256Digest;
  }> | null;
}

function targetRootDigest(targetRoot: string): Sha256Digest {
  return sha256Canonical({ kind: "workspace_target", targetRoot });
}

function fault<K extends CleanPacket["definitionKey"] | ImportedPacket["definitionKey"] | OpenPacket["definitionKey"]>(
  definitionKey: K,
  code: string,
  message: string,
): DefinitionExecutionFault<K, WorkspaceResourceReceipt> {
  return preDefinitionFault(
    definitionKey,
    "resource_admission",
    code,
    message,
  );
}

function validateResources<TPacket extends CleanPacket | ImportedPacket | OpenPacket>(
  call: DefinitionCall<TPacket, WorkspaceResourceAssertion>,
): DefinitionExecutionFault<
  TPacket["definitionKey"],
  WorkspaceResourceReceipt
> | null {
  let encoded: string;
  try {
    encoded = canonicalJson(call.resources as unknown as JsonValue);
  } catch {
    return fault(
      call.invocation.definitionKey,
      "invalid_resource_assertion",
      "workspace resources must be one exact I-JSON assertion",
    );
  }
  const expected = {
    kind: "workspace_resource_assertion" as const,
    schemaVersion: "5.0.0" as const,
    targetRoot: call.invocation.request.targetRoot,
    targetRootDigest: targetRootDigest(call.invocation.request.targetRoot),
  };
  return encoded === canonicalJson(expected as unknown as JsonValue)
    ? null
    : fault(
      call.invocation.definitionKey,
      "resource_relation_mismatch",
      "workspace resource assertion differs from the admitted semantic target",
    );
}

function createRefusalCode(
  result: WorkspaceCreateOperationResult,
): "invalid_target" | "workspace_exists" | "filesystem_failure" {
  if (result.kind !== "workspace_operation_refusal") {
    throw new TypeError("workspace refusal projection requires an owner refusal");
  }
  switch (result.code) {
    case "invalid_packet":
      return "invalid_target";
    case "target_missing":
      return "invalid_target";
    case "target_not_clean":
      return "workspace_exists";
    case "target_not_directory":
      return "invalid_target";
    case "workspace_already_exists":
      return "workspace_exists";
    case "workspace_manifest_missing":
      return "invalid_target";
    case "workspace_io_refusal":
      return "filesystem_failure";
  }
}

function openRefusalCode(
  result: WorkspaceOpenOperationResult,
): "invalid_target" | "missing_workspace" {
  if (result.kind !== "workspace_operation_refusal") {
    throw new TypeError("workspace refusal projection requires an owner refusal");
  }
  return result.code === "workspace_manifest_missing"
    ? "missing_workspace"
    : "invalid_target";
}

function validatedOutput<TPacket extends OwnerContractSourceDeclaration>(
  packet: TPacket,
  output: OwnerSemanticOutput<TPacket>,
): OwnerSemanticOutput<TPacket> {
  const schema = output.outcomeKind === "result"
    ? packet.resultSchema
    : output.outcomeKind === "refusal"
    ? packet.refusalSchema
    : packet.nonTerminalSchema;
  if (schema === null || admitRuntimeContract(schema, output.value).disposition !== "admitted") {
    throw new TypeError("workspace owner output differs from its exact contract");
  }
  return output;
}

function receipt(
  resources: WorkspaceResourceAssertion,
  result: WorkspaceCreateOperationResult | WorkspaceOpenOperationResult,
): WorkspaceResourceReceipt {
  const manifest = result.kind === "workspace_create_result"
    ? {
        locator: result.manifestPath,
        valueDigest: sha256Canonical(result.manifest as unknown as JsonValue),
      }
    : result.kind === "workspace_open_projection" && result.manifest !== null
    ? {
        locator: result.manifestPath,
        valueDigest: sha256Canonical(result.manifest as unknown as JsonValue),
      }
    : null;
  return deepFreeze({
    kind: "workspace_resource_receipt" as const,
    schemaVersion: "5.0.0" as const,
    targetRoot: resources.targetRoot,
    targetRootDigest: resources.targetRootDigest,
    manifest,
  });
}

function reference(ref: string, digest: Sha256Digest) {
  return { ref, digest } as const;
}

function createBinding<TPacket extends CleanPacket | ImportedPacket>(
  packet: TPacket,
): ExactDefinitionCallable<TPacket, WorkspaceResourceAssertion, WorkspaceResourceReceipt> {
  return (call) => {
    const resourceFault = validateResources(call);
    if (resourceFault !== null) return Effect.fail(resourceFault);
    const request = call.invocation.request;
    if (
      request.createPolicy === "clean" && request.scaffoldPolicy === "root_layout"
    ) {
      const ownerOutput = validatedOutput(packet, {
        outcomeKind: "refusal",
        value: {
          code: "invalid_scaffold",
          issuePaths: ["/scaffoldPolicy"],
          evidenceRefs: [],
        },
      } as OwnerSemanticOutput<TPacket>);
      return Effect.succeed(deepFreeze({
        ownerOutput,
        resources: receipt(call.resources, {
          kind: "workspace_operation_refusal",
          schemaVersion: "5.0.0",
          disposition: "refused",
          code: "invalid_packet",
          message: "root-layout scaffolding is not available in this owner",
        }),
      }));
    }
    const nativePacket: WorkspaceCreatePacket = request.createPolicy === "clean"
      ? {
          kind: "workspace_create_packet",
          schemaVersion: "5.0.0",
          memberKey: "clean",
          targetRoot: request.targetRoot,
          scaffoldPolicy: "none",
        }
      : {
          kind: "workspace_create_packet",
          schemaVersion: "5.0.0",
          memberKey: "imported",
          targetRoot: request.targetRoot,
          importAuthority: {
            authorityRef: request.importAuthority.ref,
            authorityDigest: request.importAuthority.digest,
          },
          preservationPolicy: "preserve_existing_project_truth",
        };
    return Effect.tryPromise({
      try: () => WorkspaceOperationPort.create(nativePacket),
      catch: (cause) => fault(
        call.invocation.definitionKey,
        "workspace_execution_failure",
        String(cause),
      ),
    }).pipe(Effect.map((nativeResult): DefinitionReturn<TPacket, WorkspaceResourceReceipt> => {
      const ownerOutput = nativeResult.kind === "workspace_create_result"
        ? validatedOutput(packet, {
            outcomeKind: "result",
            value: {
              createPolicy: request.createPolicy,
              workspace: reference(nativeResult.workspaceRef, nativeResult.workspaceDigest),
              authorityMode: request.createPolicy,
              scaffoldState: request.createPolicy === "clean" ? "none" : "preserved",
              creationManifest: reference(
                nativeResult.creationManifestRef,
                nativeResult.creationManifestDigest,
              ),
              provenance: nativeResult.provenance.map((row) =>
                reference(row.provenanceRef, row.provenanceDigest)
              ),
            },
          } as OwnerSemanticOutput<TPacket>)
        : validatedOutput(packet, {
            outcomeKind: "refusal",
            value: {
              code: createRefusalCode(nativeResult),
              issuePaths: [],
              evidenceRefs: [],
            },
          } as OwnerSemanticOutput<TPacket>);
      return deepFreeze({
        ownerOutput,
        resources: receipt(call.resources, nativeResult),
      });
    }));
  };
}

const clean = createBinding(WORKSPACE_OPERATION_CONTRACTS.create.clean);
const imported = createBinding(WORKSPACE_OPERATION_CONTRACTS.create.imported);

const open: ExactDefinitionCallable<
  OpenPacket,
  WorkspaceResourceAssertion,
  WorkspaceResourceReceipt
> = (call) => {
  const resourceFault = validateResources(call);
  if (resourceFault !== null) return Effect.fail(resourceFault);
  const request = call.invocation.request;
  const nativePacket: WorkspaceOpenPacket = {
    kind: "workspace_open_packet",
    schemaVersion: "5.0.0",
    memberKey: "open",
    targetRoot: request.targetRoot,
    expectedWorkspaceAuthorityRef: request.expectedAuthority.ref,
    expectedWorkspaceAuthorityDigest: request.expectedAuthority.digest,
  };
  return Effect.tryPromise({
    try: () => WorkspaceOperationPort.open(nativePacket),
    catch: (cause) => fault(
      call.invocation.definitionKey,
      "workspace_execution_failure",
      String(cause),
    ),
  }).pipe(Effect.map((nativeResult): DefinitionReturn<OpenPacket, WorkspaceResourceReceipt> => {
    const ownerOutput = nativeResult.kind === "workspace_open_projection"
      ? validatedOutput(WORKSPACE_OPERATION_CONTRACTS.open.open, {
          outcomeKind: "result",
          value: {
            disposition: nativeResult.disposition,
            workspace: reference(
              nativeResult.workspaceRef ?? request.expectedAuthority.ref,
              nativeResult.workspaceDigest ?? request.expectedAuthority.digest,
            ),
            authority: reference(
              nativeResult.workspaceAuthorityRef ?? request.expectedAuthority.ref,
              nativeResult.workspaceAuthorityDigest ?? request.expectedAuthority.digest,
            ),
            binding: nativeResult.bindingRef === null || nativeResult.bindingDigest === null
              ? null
              : reference(nativeResult.bindingRef, nativeResult.bindingDigest),
            residuals: nativeResult.residuals.map((row) => row.code),
          },
        })
      : validatedOutput(WORKSPACE_OPERATION_CONTRACTS.open.open, {
          outcomeKind: "refusal",
          value: {
            code: openRefusalCode(nativeResult),
            issuePaths: [],
            evidenceRefs: [],
          },
        });
    return deepFreeze({
      ownerOutput,
      resources: receipt(call.resources, nativeResult),
    });
  }));
};

export const WORKSPACE_DEFINITION_BINDINGS = Object.freeze({
  create: Object.freeze({ clean, imported }),
  open: Object.freeze({ open }),
});
