import { createHash } from "node:crypto";
import { isAbsolute, join, resolve } from "node:path";

import * as v from "valibot";

import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import type {
  WorkspacePathContext,
  WorkspaceCreateRequest as OwnerWorkspaceCreateRequest
} from "../public_sdk/carriers.js";
import {
  admitToolchainWorkspaceBindingV3
} from "../public_sdk/carrier_admission.js";
import { admitIJsonText } from "../public_sdk/canonical.js";
import type {
  PrivateOwnerHandlerOutcome
} from "../public_contracts/private_public_operation_handler_bindings.js";
import {
  admitP1OwnerValue,
  assertExactPrivateOperationFamily,
  assertPrivateOwnerEventAdmission,
  emitPrivateOwnerArtifactBoundary,
  privateOwnerRefusal,
  privateOwnerResult,
  type PrivateOwnerArtifactBoundaryContext
} from "../public_contracts/private_public_operation_handler_bindings.js";
import {
  assertAdmittedPrivateP1PublicOperationPacket,
  type AdmittedPrivateP1PublicOperationPacket
} from "../public_contracts/private_public_operation_ingress.js";
import type {
  PrivatePublicOperationDefinitionFamily
} from "../public_contracts/public_operation_definition_family.js";
import {
  workspaceCreate,
  workspaceOpen,
  WORKSPACE_MANIFEST_RELATIVE_PATH,
  type WorkspaceCreateAttribution
} from "./operations.js";
import { WORKSPACE_NATIVE_CONTRACT_SOURCES } from "./operation_contracts.js";

type SourceOutput<S extends { readonly schema: v.GenericSchema }> =
  v.InferOutput<S["schema"]>;
type CleanCreateDefinition =
  PrivatePublicOperationDefinitionFamily["abg.operation.workspace.create"]["clean"];
type ImportedCreateDefinition =
  PrivatePublicOperationDefinitionFamily["abg.operation.workspace.create"]["imported"];
type CleanCreateSources =
  typeof WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.clean;
type ImportedCreateSources =
  typeof WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.imported;
type CleanCreateResult = SourceOutput<CleanCreateSources["result"]>;
type CleanCreateRefusal = SourceOutput<CleanCreateSources["refusal"]>;
type ImportedCreateResult = SourceOutput<ImportedCreateSources["result"]>;
type ImportedCreateRefusal = SourceOutput<ImportedCreateSources["refusal"]>;
type WorkspaceOpenDefinition =
  PrivatePublicOperationDefinitionFamily["abg.operation.workspace.open"]["open"];
type WorkspaceOpenSources =
  typeof WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_open.open;
type WorkspaceOpenResult = SourceOutput<WorkspaceOpenSources["result"]>;
type WorkspaceOpenRefusal = SourceOutput<WorkspaceOpenSources["refusal"]>;

function sha256Bytes(bytes: Uint8Array): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function cleanCreateRefusal(
  definition: CleanCreateDefinition,
  code: CleanCreateRefusal["code"],
  message: string,
  residualRefs: readonly string[] = Object.freeze([])
): CleanCreateRefusal {
  return admitP1OwnerValue(
    definition.refusalContract.contract.schema,
    WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.clean.refusal.schema,
    { code, message, residualRefs }
  );
}

function importedCreateRefusal(
  definition: ImportedCreateDefinition,
  code: ImportedCreateRefusal["code"],
  message: string,
  residualRefs: readonly string[] = Object.freeze([])
): ImportedCreateRefusal {
  return admitP1OwnerValue(
    definition.refusalContract.contract.schema,
    WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.imported.refusal.schema,
    { code, message, residualRefs }
  );
}

function ownerCreateRefusalCode(
  code: "invalid_target" | "workspace_exists" |
    "workspace_identity_conflict" | "filesystem_failure"
): "invalid_target" | "workspace_exists" |
  "workspace_identity_conflict" | "filesystem_failure" {
  return code;
}

function assertCreateActor(
  boundary: PrivateOwnerArtifactBoundaryContext,
  attribution: WorkspaceCreateAttribution
): void {
  if (boundary.admission.event.actorRef !== attribution.actorRef) {
    throw new TypeError(
      "workspace.create actor differs from its admitted invocation"
    );
  }
}

function bindPrivateCleanWorkspaceCreateHandler(
  family: PrivatePublicOperationDefinitionFamily
) {
  const definition = family["abg.operation.workspace.create"].clean;
  const sources = WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.clean;
  return Object.freeze({
    kind: "private_public_operation_handler_binding" as const,
    definitionKey: definition.definitionKey,
    definitionDigest: definition.definitionDigest,
    async execute(input: {
      readonly packet: AdmittedPrivateP1PublicOperationPacket<
        CleanCreateDefinition
      >;
      readonly context: WorkspacePathContext;
      readonly attribution: WorkspaceCreateAttribution;
      readonly artifactBoundary: PrivateOwnerArtifactBoundaryContext;
      readonly importAuthorityBytes?: Uint8Array;
    }): Promise<PrivateOwnerHandlerOutcome<
      CleanCreateResult,
      CleanCreateRefusal
    >> {
      assertPrivateOwnerEventAdmission({
        definition,
        packet: input.packet,
        admission: input.artifactBoundary.admission
      });
      const request = admitP1OwnerValue(
        definition.requestContract.contract.schema,
        sources.request.schema,
        input.packet.invocation.request
      );
      assertCreateActor(input.artifactBoundary, input.attribution);
      if (input.importAuthorityBytes !== undefined) {
        return privateOwnerRefusal(
          cleanCreateRefusal(
            definition,
            "scaffold_policy_invalid",
            "workspace.create clean does not admit import authority bytes"
          )
        );
      }
      const ownerRequest: OwnerWorkspaceCreateRequest = Object.freeze({
        targetRoot: request.targetRoot,
        authorityMode: "clean_no_project_authority"
      });
      const ownerOutcome = await workspaceCreate(
        ownerRequest,
        input.context,
        input.attribution
      );
      if (ownerOutcome.kind === "refused") {
        return privateOwnerRefusal(
          cleanCreateRefusal(
            definition,
            ownerCreateRefusalCode(ownerOutcome.code),
            ownerOutcome.message,
            ownerOutcome.residualRefs
          )
        );
      }
      const manifest = ownerOutcome.value;
      const manifestRef = join(
        request.targetRoot,
        WORKSPACE_MANIFEST_RELATIVE_PATH
      );
      const manifestDigest = stableSha256Digest(manifest);
      const result = admitP1OwnerValue(
        definition.resultContract.contract.schema,
        sources.result.schema,
        {
          workspaceRef: manifest.workspaceId,
          authorityMode: "clean_no_project_authority",
          scaffoldState: "none",
          creationManifestRef: manifestRef,
          provenanceRefs: ownerOutcome.provenanceRefs
        }
      );
      const events = emitPrivateOwnerArtifactBoundary({
        definition,
        packet: input.packet,
        boundary: input.artifactBoundary,
        scopeRef: manifest.workspaceId,
        scopeDigest: manifestDigest,
        disposition: ownerOutcome.disposition,
        artifactRef: manifestRef,
        artifactDigest: manifestDigest
      });
      return privateOwnerResult(result, events);
    }
  });
}

function bindPrivateImportedWorkspaceCreateHandler(
  family: PrivatePublicOperationDefinitionFamily
) {
  const definition = family["abg.operation.workspace.create"].imported;
  const sources = WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.imported;
  return Object.freeze({
    kind: "private_public_operation_handler_binding" as const,
    definitionKey: definition.definitionKey,
    definitionDigest: definition.definitionDigest,
    async execute(input: {
      readonly packet: AdmittedPrivateP1PublicOperationPacket<
        ImportedCreateDefinition
      >;
      readonly context: WorkspacePathContext;
      readonly attribution: WorkspaceCreateAttribution;
      readonly artifactBoundary: PrivateOwnerArtifactBoundaryContext;
      readonly importAuthorityBytes?: Uint8Array;
    }): Promise<PrivateOwnerHandlerOutcome<
      ImportedCreateResult,
      ImportedCreateRefusal
    >> {
      assertPrivateOwnerEventAdmission({
        definition,
        packet: input.packet,
        admission: input.artifactBoundary.admission
      });
      const request = admitP1OwnerValue(
        definition.requestContract.contract.schema,
        sources.request.schema,
        input.packet.invocation.request
      );
      assertCreateActor(input.artifactBoundary, input.attribution);
      if (
        input.importAuthorityBytes === undefined ||
        sha256Bytes(input.importAuthorityBytes) !== request.importAuthorityDigest
      ) {
        return privateOwnerRefusal(
          importedCreateRefusal(
            definition,
            "import_authority_invalid",
            "workspace.create import authority bytes do not match the admitted digest",
            [request.importAuthorityRef]
          )
        );
      }
      const ownerOutcome = await workspaceCreate(
        Object.freeze({
          targetRoot: request.targetRoot,
          authorityMode: "imported"
        }),
        input.context,
        Object.freeze({
          actorRef: input.attribution.actorRef,
          provenanceRefs: Object.freeze([
            ...(input.attribution.provenanceRefs ?? []),
            request.importAuthorityRef,
            request.importAuthorityDigest
          ])
        })
      );
      if (ownerOutcome.kind === "refused") {
        return privateOwnerRefusal(
          importedCreateRefusal(
            definition,
            ownerCreateRefusalCode(ownerOutcome.code),
            ownerOutcome.message,
            ownerOutcome.residualRefs
          )
        );
      }
      const manifest = ownerOutcome.value;
      const manifestRef = join(
        request.targetRoot,
        WORKSPACE_MANIFEST_RELATIVE_PATH
      );
      const manifestDigest = stableSha256Digest(manifest);
      const result = admitP1OwnerValue(
        definition.resultContract.contract.schema,
        sources.result.schema,
        {
          workspaceRef: manifest.workspaceId,
          authorityMode: "imported",
          preservationState: {
            projectOwnedRoots: "preserved",
            scaffoldState: "preserved"
          },
          creationManifestRef: manifestRef,
          importAuthorityRef: request.importAuthorityRef,
          importAuthorityDigest: request.importAuthorityDigest,
          provenanceRefs: ownerOutcome.provenanceRefs
        }
      );
      const events = emitPrivateOwnerArtifactBoundary({
        definition,
        packet: input.packet,
        boundary: input.artifactBoundary,
        scopeRef: manifest.workspaceId,
        scopeDigest: manifestDigest,
        disposition: ownerOutcome.disposition,
        artifactRef: manifestRef,
        artifactDigest: manifestDigest
      });
      return privateOwnerResult(result, events);
    }
  });
}

/** @internal */
export function bindPrivateWorkspaceCreateHandler(
  family: PrivatePublicOperationDefinitionFamily,
  variant: "clean"
): ReturnType<typeof bindPrivateCleanWorkspaceCreateHandler>;
/** @internal */
export function bindPrivateWorkspaceCreateHandler(
  family: PrivatePublicOperationDefinitionFamily,
  variant: "imported"
): ReturnType<typeof bindPrivateImportedWorkspaceCreateHandler>;
/** @internal */
export function bindPrivateWorkspaceCreateHandler(
  family: PrivatePublicOperationDefinitionFamily,
  variant: "clean" | "imported"
) {
  assertExactPrivateOperationFamily(family);
  return variant === "clean"
    ? bindPrivateCleanWorkspaceCreateHandler(family)
    : bindPrivateImportedWorkspaceCreateHandler(family);
}

function openRefusal(
  definition: WorkspaceOpenDefinition,
  code: WorkspaceOpenRefusal["code"],
  message: string,
  residualRefs: readonly string[] = Object.freeze([])
): WorkspaceOpenRefusal {
  return admitP1OwnerValue(
    definition.refusalContract.contract.schema,
    WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_open.open.refusal.schema,
    { code, message, residualRefs }
  );
}

async function configurationDigests(
  context: WorkspacePathContext,
  refs: readonly string[]
): Promise<readonly string[] | null> {
  const digests: string[] = [];
  for (const ref of refs) {
    const absolutePath = isAbsolute(ref) ? ref : join(context.targetRoot, ref);
    const bytes = await context.effects.readBytes(absolutePath);
    if (bytes === null) {
      return null;
    }
    digests.push(sha256Bytes(bytes));
  }
  return Object.freeze(digests);
}

/** @internal */
export function bindPrivateWorkspaceOpenHandler(
  family: PrivatePublicOperationDefinitionFamily
) {
  assertExactPrivateOperationFamily(family);
  const definition = family["abg.operation.workspace.open"].open;
  const sources = WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_open.open;
  return Object.freeze({
    kind: "private_public_operation_handler_binding" as const,
    definitionKey: definition.definitionKey,
    definitionDigest: definition.definitionDigest,
    async execute(input: {
      readonly packet: AdmittedPrivateP1PublicOperationPacket<
        WorkspaceOpenDefinition
      >;
      readonly context: WorkspacePathContext;
    }): Promise<PrivateOwnerHandlerOutcome<WorkspaceOpenResult, WorkspaceOpenRefusal>> {
      assertAdmittedPrivateP1PublicOperationPacket(input.packet, definition);
      const request = admitP1OwnerValue(
        definition.requestContract.contract.schema,
        sources.request.schema,
        input.packet.invocation.request
      );
      if (resolve(request.targetRoot) !== resolve(input.context.targetRoot)) {
        return privateOwnerRefusal(
          openRefusal(
            definition,
            "invalid_target",
            "workspace.open target differs from its admitted effect context"
          )
        );
      }
      const ownerOutcome = await workspaceOpen(
        {
          targetRoot: request.targetRoot,
          expectedWorkspaceSchemaVersion: 1
        },
        input.context
      );
      if (ownerOutcome.kind === "refused") {
        return privateOwnerRefusal(
          openRefusal(
            definition,
            ownerOutcome.code === "missing"
              ? "workspace_missing"
              : "authority_basis_mismatch",
            ownerOutcome.message,
            ownerOutcome.residualRefs
          )
        );
      }
      const manifest = ownerOutcome.value.manifest;
      const authorityDigest = stableSha256Digest(manifest);
      if (
        request.expectedWorkspaceAuthorityRef !== manifest.workspaceId ||
        request.expectedWorkspaceAuthorityDigest !== authorityDigest
      ) {
        return privateOwnerRefusal(
          openRefusal(
            definition,
            "authority_basis_mismatch",
            "workspace.open authority basis differs from the admitted manifest",
            [manifest.workspaceId]
          )
        );
      }
      const digests = await configurationDigests(
        input.context,
        manifest.configurationRefs
      );
      if (digests === null) {
        return privateOwnerRefusal(
          openRefusal(
            definition,
            "authority_basis_mismatch",
            "workspace.open configuration authority is incomplete",
            manifest.configurationRefs
          )
        );
      }
      let selectedBindingRef: string | null = null;
      let selectedBindingDigest: string | null = null;
      if (ownerOutcome.value.disposition === "ready") {
        selectedBindingRef = ownerOutcome.value.bindingRef;
        if (selectedBindingRef === null) {
          throw new TypeError("workspace.open ready owner result lacks binding ref");
        }
        const bindingPath = isAbsolute(selectedBindingRef)
          ? selectedBindingRef
          : join(input.context.targetRoot, selectedBindingRef);
        const bytes = await input.context.effects.readBytes(bindingPath);
        if (bytes === null) {
          return privateOwnerRefusal(
            openRefusal(
              definition,
              "authority_basis_mismatch",
              "workspace.open selected binding disappeared after owner admission",
              [selectedBindingRef]
            )
          );
        }
        const binding = admitToolchainWorkspaceBindingV3(
          admitIJsonText(new TextDecoder("utf-8", { fatal: true }).decode(bytes))
        );
        selectedBindingDigest = binding.bindingDigest;
      }
      const result = admitP1OwnerValue(
        definition.resultContract.contract.schema,
        sources.result.schema,
        {
          workspaceRef: manifest.workspaceId,
          workspaceAuthorityBasisRef: manifest.workspaceId,
          workspaceAuthorityBasisDigest: authorityDigest,
          authorityMode: manifest.authorityMode,
          configurationRefs: manifest.configurationRefs,
          configurationDigests: digests,
          readiness: ownerOutcome.value.disposition,
          selectedBindingRef,
          selectedBindingDigest,
          residualRefs: []
        }
      );
      return privateOwnerResult(result);
    }
  });
}
