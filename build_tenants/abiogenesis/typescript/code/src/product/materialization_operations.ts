import {
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import { dirname, isAbsolute, join } from "node:path";

import {
  canonicalJson,
  compareUnicodeCodeUnits,
  type JsonValue,
} from "../shared/canonical_json.js";
import {
  isSha256Digest,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { ProductPublicContract } from "./contracts.js";
import type { WorkspaceBinding } from "./environment.js";
import { parseProductPublicContract } from "./verify_product.js";

export type ProductMaterializationMember =
  | "context_bootstrap"
  | "configuration";

export interface MaterializationWorkspaceCoordinate {
  readonly workspaceRef: string;
  readonly workspaceDigest: Sha256Digest;
  readonly authorityRef: string;
  readonly authorityDigest: Sha256Digest;
}

export interface DeclaredContextInput {
  readonly kind: "declared_context_input";
  readonly inputRef: string;
  readonly inputDigest: Sha256Digest;
  readonly content: JsonValue;
}

interface ProductMaterializePacketBase<M extends ProductMaterializationMember> {
  readonly kind: "product_materialize_packet";
  readonly schemaVersion: "5.0.0";
  readonly memberKey: M;
  readonly workspace: MaterializationWorkspaceCoordinate;
  readonly binding: WorkspaceBinding;
}

export interface ContextBootstrapMaterializePacket
  extends ProductMaterializePacketBase<"context_bootstrap"> {
  readonly contextInputs: readonly DeclaredContextInput[];
}

export interface ConfigurationMaterializePacket
  extends ProductMaterializePacketBase<"configuration"> {
  readonly configurationContract: ProductPublicContract;
  readonly inputs: JsonValue;
}

export interface ProductMaterializePacketByMember {
  readonly context_bootstrap: ContextBootstrapMaterializePacket;
  readonly configuration: ConfigurationMaterializePacket;
}

export type ProductMaterializePacket<
  M extends ProductMaterializationMember = ProductMaterializationMember,
> = ProductMaterializePacketByMember[M];

export type ProductMaterializationRefusalCode =
  | "workspace_not_ready"
  | "binding_mismatch"
  | "input_invalid"
  | "authority_overwrite_forbidden"
  | "contract_invalid"
  | "mutable_default_forbidden"
  | "filesystem_failure";

export interface ProductMaterializationRefusal {
  readonly kind: "product_materialization_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly memberKey: ProductMaterializationMember;
  readonly code: ProductMaterializationRefusalCode;
  readonly message: string;
  readonly workspaceRef: string | null;
  readonly bindingRef: string | null;
}

export interface MaterializationRow {
  readonly inputRef: string;
  readonly inputDigest: Sha256Digest;
  readonly assetRef: string;
  readonly assetDigest: Sha256Digest;
  readonly assetPath: string;
  readonly disposition: "created" | "preserved";
}

export interface MaterializationManifestCoordinate {
  readonly manifestRef: string;
  readonly manifestDigest: Sha256Digest;
  readonly manifestPath: string;
}

export interface MaterializationContentCoordinate {
  readonly contentRef: string;
  readonly contentDigest: Sha256Digest;
  readonly contentPath: string;
}

export interface ProductMaterializationResult<
  M extends ProductMaterializationMember = ProductMaterializationMember,
> {
  readonly kind: "product_materialization_result";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "materialized";
  readonly materializationKind: M;
  readonly subject: Readonly<{
    workspaceRef: string;
    workspaceDigest: Sha256Digest;
    bindingRef: string;
    bindingDigest: Sha256Digest;
  }>;
  readonly content: MaterializationContentCoordinate;
  readonly manifest: MaterializationManifestCoordinate;
  readonly rows: readonly MaterializationRow[];
  readonly validationDisposition: "admitted";
  readonly residuals: readonly [];
  readonly provenance: readonly Readonly<{
    provenanceRef: string;
    provenanceDigest: Sha256Digest;
  }>[];
}

export type ProductMaterializationOperationResult<
  M extends ProductMaterializationMember = ProductMaterializationMember,
> = ProductMaterializationResult<M> | ProductMaterializationRefusal;

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: object, keys: readonly string[]): boolean {
  return Object.keys(value).sort(compareUnicodeCodeUnits).join("\0") ===
    [...keys].sort(compareUnicodeCodeUnits).join("\0");
}

function digestJson(value: unknown): Sha256Digest | null {
  try {
    return sha256Canonical(value as JsonValue);
  } catch {
    return null;
  }
}

function refusal(
  memberKey: ProductMaterializationMember,
  code: ProductMaterializationRefusalCode,
  message: string,
  packet: unknown,
): ProductMaterializationRefusal {
  const workspaceRef = isRecord(packet) &&
      isRecord(packet.workspace) &&
      typeof packet.workspace.workspaceRef === "string"
    ? packet.workspace.workspaceRef
    : null;
  const bindingRef = isRecord(packet) &&
      isRecord(packet.binding) &&
      typeof packet.binding.bindingId === "string"
    ? packet.binding.bindingId
    : null;
  return deepFreeze({
    kind: "product_materialization_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    memberKey,
    code,
    message,
    workspaceRef,
    bindingRef,
  });
}

function bindingBodyDigest(binding: WorkspaceBinding): Sha256Digest | null {
  if (
    !isRecord(binding) ||
    binding.kind !== "workspace_binding" ||
    binding.schemaVersion !== "5.0.0" ||
    typeof binding.bindingId !== "string" ||
    !isSha256Digest(binding.bindingDigest) ||
    typeof binding.admissionEventRef !== "string" ||
    binding.admissionEventRef.length === 0 ||
    !isRecord(binding.roots) ||
    Object.values(binding.roots).some((root) =>
      typeof root !== "string" || !isAbsolute(root)
    )
  ) return null;
  return sha256Canonical({
    workspaceId: binding.workspaceId,
    authorityBasisId: binding.authorityBasisId,
    authorityBasisDigest: binding.authorityBasisDigest,
    authorizedActorRef: binding.authorizedActorRef,
    productSetId: binding.productSetId,
    productSetDigest: binding.productSetDigest,
    lockId: binding.lockId,
    lockDigest: binding.lockDigest,
    roots: binding.roots,
  } as unknown as JsonValue);
}

function validWorkspaceAndBinding(
  workspace: unknown,
  binding: unknown,
): workspace is MaterializationWorkspaceCoordinate {
  if (
    !isRecord(workspace) ||
    !hasExactKeys(workspace, [
      "authorityDigest",
      "authorityRef",
      "workspaceDigest",
      "workspaceRef",
    ]) ||
    typeof workspace.workspaceRef !== "string" ||
    workspace.workspaceRef.length === 0 ||
    typeof workspace.authorityRef !== "string" ||
    workspace.authorityRef.length === 0 ||
    !isSha256Digest(workspace.workspaceDigest) ||
    !isSha256Digest(workspace.authorityDigest) ||
    !isRecord(binding) ||
    binding.kind !== "workspace_binding" ||
    binding.workspaceId !== workspace.workspaceRef ||
    binding.authorityBasisId !== workspace.authorityRef ||
    binding.authorityBasisDigest !== workspace.authorityDigest
  ) return false;
  const typedBinding = binding as unknown as WorkspaceBinding;
  const digest = bindingBodyDigest(typedBinding);
  if (
    digest === null ||
    digest !== typedBinding.bindingDigest ||
    typedBinding.bindingId !==
      `workspace-binding://abiogenesis/${digest.slice("sha256:".length)}`
  ) return false;
  return true;
}

function validEnvelope(
  packet: unknown,
  memberKey: ProductMaterializationMember,
  extraKeys: readonly string[],
): packet is ProductMaterializePacket {
  return isRecord(packet) &&
    hasExactKeys(packet, [
      "binding",
      "kind",
      "memberKey",
      "schemaVersion",
      "workspace",
      ...extraKeys,
    ]) &&
    packet.kind === "product_materialize_packet" &&
    packet.schemaVersion === "5.0.0" &&
    packet.memberKey === memberKey;
}

async function persistExactFile(
  path: string,
  bytes: string,
): Promise<"created" | "preserved" | "collision"> {
  await mkdir(dirname(path), { recursive: true });
  try {
    await writeFile(path, bytes, { encoding: "utf8", flag: "wx" });
    return "created";
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    return await readFile(path, "utf8") === bytes ? "preserved" : "collision";
  }
}

function assetRoot(binding: WorkspaceBinding, memberKey: ProductMaterializationMember): string {
  return join(
    binding.roots.projectionRoot,
    "product-materializations",
    memberKey,
  );
}

function sortedProvenance(
  rows: readonly Readonly<{
    provenanceRef: string;
    provenanceDigest: Sha256Digest;
  }>[],
): readonly Readonly<{
  provenanceRef: string;
  provenanceDigest: Sha256Digest;
}>[] {
  return [...rows].sort((left, right) =>
    compareUnicodeCodeUnits(left.provenanceRef, right.provenanceRef)
  );
}

async function persistManifest<M extends ProductMaterializationMember>(
  memberKey: M,
  packet: ProductMaterializePacket<M>,
  rows: readonly MaterializationRow[],
  content: MaterializationContentCoordinate,
  provenance: readonly Readonly<{
    provenanceRef: string;
    provenanceDigest: Sha256Digest;
  }>[],
): Promise<
  ProductMaterializationResult<M> | ProductMaterializationRefusal
> {
  const manifestBody = {
    kind: "product_materialization_manifest" as const,
    schemaVersion: "5.0.0" as const,
    materializationKind: memberKey,
    workspaceRef: packet.workspace.workspaceRef,
    workspaceDigest: packet.workspace.workspaceDigest,
    bindingRef: packet.binding.bindingId,
    bindingDigest: packet.binding.bindingDigest,
    contentRef: content.contentRef,
    contentDigest: content.contentDigest,
    rows,
    validationDisposition: "admitted" as const,
    residuals: [] as const,
    provenance,
  };
  const manifestDigest = sha256Canonical(manifestBody as unknown as JsonValue);
  const manifestRef =
    `product-materialization-manifest://abiogenesis/${manifestDigest.slice("sha256:".length)}`;
  const manifestPath = join(
    assetRoot(packet.binding, memberKey),
    "manifests",
    `${manifestDigest.slice("sha256:".length)}.json`,
  );
  const manifestBytes = `${canonicalJson({
    ...manifestBody,
    manifestRef,
    manifestDigest,
  } as unknown as JsonValue)}\n`;
  try {
    const disposition = await persistExactFile(manifestPath, manifestBytes);
    if (disposition === "collision") {
      return refusal(
        memberKey,
        "authority_overwrite_forbidden",
        "materialization manifest path contains unequal existing authority",
        packet,
      );
    }
  } catch (error) {
    return refusal(
      memberKey,
      "filesystem_failure",
      `materialization manifest write failed: ${String(error)}`,
      packet,
    );
  }
  return deepFreeze({
    kind: "product_materialization_result" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "materialized" as const,
    materializationKind: memberKey,
    subject: {
      workspaceRef: packet.workspace.workspaceRef,
      workspaceDigest: packet.workspace.workspaceDigest,
      bindingRef: packet.binding.bindingId,
      bindingDigest: packet.binding.bindingDigest,
    },
    content,
    manifest: {
      manifestRef,
      manifestDigest,
      manifestPath,
    },
    rows,
    validationDisposition: "admitted" as const,
    residuals: [] as const,
    provenance,
  });
}

export async function materializeContextBootstrap(
  packet: ContextBootstrapMaterializePacket,
): Promise<ProductMaterializationOperationResult<"context_bootstrap">> {
  if (!validEnvelope(packet, "context_bootstrap", ["contextInputs"])) {
    return refusal(
      "context_bootstrap",
      "input_invalid",
      "context bootstrap requires one closed materialization packet",
      packet,
    );
  }
  if (!validWorkspaceAndBinding(packet.workspace, packet.binding)) {
    return refusal(
      "context_bootstrap",
      "binding_mismatch",
      "context bootstrap workspace and selected binding differ",
      packet,
    );
  }
  if (
    !Array.isArray(packet.contextInputs) ||
    packet.contextInputs.length === 0 ||
    packet.contextInputs.some((input) =>
      !isRecord(input) ||
      !hasExactKeys(input, ["content", "inputDigest", "inputRef", "kind"]) ||
      input.kind !== "declared_context_input" ||
      typeof input.inputRef !== "string" ||
      input.inputRef.length === 0 ||
      !isSha256Digest(input.inputDigest) ||
      digestJson(input.content) !== input.inputDigest
    ) ||
    new Set(packet.contextInputs.map((input) => input.inputRef)).size !==
      packet.contextInputs.length ||
    new Set(packet.contextInputs.map((input) => input.inputDigest)).size !==
      packet.contextInputs.length
  ) {
    return refusal(
      "context_bootstrap",
      "input_invalid",
      "context bootstrap inputs must be non-empty, unique, and content-addressed",
      packet,
    );
  }
  const rows: MaterializationRow[] = [];
  const orderedInputs = [...packet.contextInputs].sort((left, right) =>
    compareUnicodeCodeUnits(left.inputRef, right.inputRef)
  );
  try {
    for (const input of orderedInputs) {
      const assetBody = {
        kind: "generated_product_asset" as const,
        schemaVersion: "5.0.0" as const,
        materializationKind: "context_bootstrap" as const,
        workspaceRef: packet.workspace.workspaceRef,
        workspaceDigest: packet.workspace.workspaceDigest,
        bindingRef: packet.binding.bindingId,
        bindingDigest: packet.binding.bindingDigest,
        inputRef: input.inputRef,
        inputDigest: input.inputDigest,
        content: input.content,
      };
      const assetDigest = sha256Canonical(assetBody as unknown as JsonValue);
      const assetRef =
        `generated-product-asset://abiogenesis/${assetDigest.slice("sha256:".length)}`;
      const assetPath = join(
        assetRoot(packet.binding, "context_bootstrap"),
        "content",
        `${assetDigest.slice("sha256:".length)}.json`,
      );
      const bytes = `${canonicalJson({
        ...assetBody,
        assetRef,
        assetDigest,
      } as unknown as JsonValue)}\n`;
      const disposition = await persistExactFile(assetPath, bytes);
      if (disposition === "collision") {
        return refusal(
          "context_bootstrap",
          "authority_overwrite_forbidden",
          "context asset path contains unequal existing authority",
          packet,
        );
      }
      rows.push({
        inputRef: input.inputRef,
        inputDigest: input.inputDigest,
        assetRef,
        assetDigest,
        assetPath,
        disposition,
      });
    }
  } catch (error) {
    return refusal(
      "context_bootstrap",
      "filesystem_failure",
      `context asset write failed: ${String(error)}`,
      packet,
    );
  }
  const contentDigest = sha256Canonical(
    rows.map((row) => row.assetDigest) as unknown as JsonValue,
  );
  const content: MaterializationContentCoordinate = {
    contentRef:
      `context-bootstrap-content://abiogenesis/${contentDigest.slice("sha256:".length)}`,
    contentDigest,
    contentPath: assetRoot(packet.binding, "context_bootstrap"),
  };
  const provenance = sortedProvenance([
    {
      provenanceRef: packet.workspace.workspaceRef,
      provenanceDigest: packet.workspace.workspaceDigest,
    },
    {
      provenanceRef: packet.binding.bindingId,
      provenanceDigest: packet.binding.bindingDigest,
    },
    ...orderedInputs.map((input) => ({
      provenanceRef: input.inputRef,
      provenanceDigest: input.inputDigest,
    })),
  ]);
  return persistManifest(
    "context_bootstrap",
    packet,
    rows,
    content,
    provenance,
  );
}

export async function materializeConfiguration(
  packet: ConfigurationMaterializePacket,
): Promise<ProductMaterializationOperationResult<"configuration">> {
  if (
    !validEnvelope(packet, "configuration", [
      "configurationContract",
      "inputs",
    ])
  ) {
    return refusal(
      "configuration",
      "input_invalid",
      "configuration requires one closed materialization packet",
      packet,
    );
  }
  if (!validWorkspaceAndBinding(packet.workspace, packet.binding)) {
    return refusal(
      "configuration",
      "binding_mismatch",
      "configuration workspace and selected binding differ",
      packet,
    );
  }
  if (
    !isRecord(packet.configurationContract) ||
    typeof packet.configurationContract.owningProduct !== "string" ||
    parseProductPublicContract(
      packet.configurationContract,
      packet.configurationContract.owningProduct,
    ) === null
  ) {
    return refusal(
      "configuration",
      "contract_invalid",
      "configuration contract is not one exact admitted Product contract",
      packet,
    );
  }
  const inputsDigest = digestJson(packet.inputs);
  if (inputsDigest === null) {
    return refusal(
      "configuration",
      "input_invalid",
      "configuration inputs must be canonical JSON",
      packet,
    );
  }
  const contentBody = {
    kind: "generated_product_asset" as const,
    schemaVersion: "5.0.0" as const,
    materializationKind: "configuration" as const,
    workspaceRef: packet.workspace.workspaceRef,
    workspaceDigest: packet.workspace.workspaceDigest,
    bindingRef: packet.binding.bindingId,
    bindingDigest: packet.binding.bindingDigest,
    configurationContract: packet.configurationContract,
    inputsDigest,
    inputs: packet.inputs,
  };
  const contentDigest = sha256Canonical(contentBody as unknown as JsonValue);
  const contentRef =
    `configuration-content://abiogenesis/${contentDigest.slice("sha256:".length)}`;
  const contentPath = join(
    assetRoot(packet.binding, "configuration"),
    "content",
    `${contentDigest.slice("sha256:".length)}.json`,
  );
  const bytes = `${canonicalJson({
    ...contentBody,
    contentRef,
    contentDigest,
  } as unknown as JsonValue)}\n`;
  let rowDisposition: "created" | "preserved";
  try {
    const disposition = await persistExactFile(contentPath, bytes);
    if (disposition === "collision") {
      return refusal(
        "configuration",
        "authority_overwrite_forbidden",
        "configuration path contains unequal existing authority",
        packet,
      );
    }
    rowDisposition = disposition;
  } catch (error) {
    return refusal(
      "configuration",
      "filesystem_failure",
      `configuration write failed: ${String(error)}`,
      packet,
    );
  }
  const row: MaterializationRow = {
    inputRef: packet.configurationContract.contractId,
    inputDigest: inputsDigest,
    assetRef: contentRef,
    assetDigest: contentDigest,
    assetPath: contentPath,
    disposition: rowDisposition,
  };
  const provenance = sortedProvenance([
    {
      provenanceRef: packet.workspace.workspaceRef,
      provenanceDigest: packet.workspace.workspaceDigest,
    },
    {
      provenanceRef: packet.binding.bindingId,
      provenanceDigest: packet.binding.bindingDigest,
    },
    {
      provenanceRef: packet.configurationContract.contractId,
      provenanceDigest: packet.configurationContract.contractDigest,
    },
  ]);
  return persistManifest(
    "configuration",
    packet,
    [row],
    { contentRef, contentDigest, contentPath },
    provenance,
  );
}

export const ProductMaterializationPort = Object.freeze({
  context_bootstrap: materializeContextBootstrap,
  configuration: materializeConfiguration,
});

export const MATERIALIZATION_OPERATION_CONTRACTS = Object.freeze({
  context_bootstrap: ProductMaterializationPort.context_bootstrap,
  configuration: ProductMaterializationPort.configuration,
});
