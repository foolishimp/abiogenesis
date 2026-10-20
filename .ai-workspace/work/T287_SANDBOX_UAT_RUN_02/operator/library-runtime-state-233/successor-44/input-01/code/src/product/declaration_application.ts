import { readFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as v from "valibot";
import { Ajv2020 } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { canonicalJson, compareUnicodeCodeUnits, type JsonValue } from "../shared/canonical_json.js";
import { sha256Bytes, sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isRecord, sameJson } from "../shared/definition_binding_mechanics.js";
import { jsonValueSchema, nonblankSchema } from "../shared/public_function_contracts.js";
import type { ReferenceDigest } from "../shared/public_invocation.js";
import { rawAdmitValue } from "../validator/raw_admission.js";
import {
  readRuntimeEventsAtDurablePrefix, validateDurablePrefixCoordinate,
  type DurablePrefixCoordinate,
} from "../abg/event_store.js";
import { projectAdmittedProductInstall, projectExactPrefixWorkspaceEnvironment } from "../abg/environment_admission.js";
import {
  admitGraphFunctionCatalog, applyCatalogDeclaration, narrowGraphFunctionCatalog,
  type DeclarationApplication, type DeclarationCatalogEntry,
  type GraphFunctionCatalogView, type ReadyGraphFunctionCatalog,
} from "./catalog.js";
import { CATALOG_OPERATION_CONTRACTS } from "./catalog_operation_contracts.js";
import { productInstallCoordinate } from "./environment.js";
import { modulePublicationSemanticDigest } from "./publication.js";

export const CATALOG_APPLICATION_CONSTRUCTION_SCHEMA = v.strictObject({
  prefix: v.custom<DurablePrefixCoordinate>(validateDurablePrefixCoordinate, "durable prefix"),
  programRef: nonblankSchema,
  targetRef: nonblankSchema,
  value: jsonValueSchema,
  schemaAssets: v.array(v.strictObject({
    productId: nonblankSchema,
    contractId: nonblankSchema,
    bytesBase64: nonblankSchema,
  })),
});
export interface CatalogApplicationConstruction {
  prefix: DurablePrefixCoordinate;
  programRef: string;
  targetRef: string;
  value: JsonValue;
  schemaAssets: { productId: string; contractId: string; bytesBase64: string }[];
}
// The native declaration is library-independent; both directions must retain
// exactly the same shape as the one owning runtime schema.
type AssertConstructionAgreement<T extends true> = T;
type SameConstructionShape<L, R> =
  (<T>() => T extends L ? 1 : 2) extends (<T>() => T extends R ? 1 : 2)
    ? (<T>() => T extends R ? 1 : 2) extends (<T>() => T extends L ? 1 : 2)
      ? true : false
    : false;
type CatalogConstructionSchemaAgreement = AssertConstructionAgreement<
  SameConstructionShape<CatalogApplicationConstruction, v.InferOutput<typeof CATALOG_APPLICATION_CONSTRUCTION_SCHEMA>>
>;
export interface CatalogApplicationConstructionInput {
  readonly catalog: ReadyGraphFunctionCatalog;
  readonly catalogView: GraphFunctionCatalogView;
  readonly catalogRow: DeclarationCatalogEntry;
  readonly construction: CatalogApplicationConstruction;
}
export interface CatalogApplicationResources extends CatalogApplicationConstructionInput {
  readonly kind: "catalog_application_resource_assertion";
  readonly schemaVersion: "5.0.0";
  readonly applicationBasis: ReferenceDigest<"CatalogApplicationBasis">;
  readonly validationReceipt: ReferenceDigest<"ProductValidationReceipt">;
  readonly contributor: ReferenceDigest<"ProductContributorProvenance">;
}
export type CatalogApplicationRefusalCode =
  | "kind_mismatch" | "view_mismatch" | "unready" | "target_mismatch"
  | "application_mismatch" | "callability_mismatch"
  | "invalid_validation_receipt" | "invalid_contributor";
export class CatalogApplicationConstructionError extends TypeError {
  constructor(readonly code: CatalogApplicationRefusalCode, message: string) {
    super(message);
  }
}
function fail(code: CatalogApplicationRefusalCode, message: string): never {
  throw new CatalogApplicationConstructionError(code, message);
}
function digest(value: unknown) { return sha256Canonical(value as JsonValue); }
function one<T>(rows: readonly T[], code: CatalogApplicationRefusalCode, message: string): T {
  if (rows.length !== 1) fail(code, message);
  return rows[0]!;
}

/** Pure reconstruction over immutable installed assets and an explicit durable prefix. */
export function constructCatalogApplicationResources(input: CatalogApplicationConstructionInput): Readonly<{
  resources: CatalogApplicationResources;
  application: DeclarationApplication;
}> {
  let construction: CatalogApplicationConstruction;
  try { construction = v.parse(CATALOG_APPLICATION_CONSTRUCTION_SCHEMA, input.construction); }
  catch { return fail("application_mismatch", "application construction is not exact I-JSON data"); }
  const catalog = admitGraphFunctionCatalog(input.catalog.readinessBasis);
  if (catalog.kind !== "graph_function_catalog" || !sameJson(catalog, input.catalog)) {
    return fail("unready", "application requires an exact reconstructed ready catalog");
  }
  const view = narrowGraphFunctionCatalog(catalog, input.catalogView.allowlist);
  if (view.kind !== "graph_function_catalog_view" || !sameJson(view, input.catalogView)) {
    return fail("view_mismatch", "application view differs from exact catalog narrowing");
  }
  const row = view.declarationsByHandle[input.catalogRow.handle];
  if (row === undefined || !sameJson(row, input.catalogRow)) {
    return fail("view_mismatch", "application declaration is outside its exact view");
  }
  const env = projectExactPrefixWorkspaceEnvironment(construction.prefix, {
    ref: catalog.workspaceBindingId, digest: catalog.workspaceBindingDigest,
  });
  if (env.kind !== "exact_prefix_workspace_environment" ||
      !sameJson(env.workspaceBindingCandidate, catalog.readinessBasis.workspaceBinding) ||
      !sameJson(env.resolvedProductLock, catalog.readinessBasis.resolvedLock) ||
      env.productInstalls.length !== catalog.readinessBasis.installedProducts.length ||
      catalog.readinessBasis.installedProducts.some((candidate) => {
        const installed = projectAdmittedProductInstall(env.artifactTruth, candidate);
        return installed === null || !env.productInstalls.some((row) => sameJson(row, installed));
      })) {
    return fail("unready", "application catalog has no exact admitted install and workspace prefix");
  }
  const publication = one(catalog.boundPublications.filter((p) =>
    p.moduleRef === row.moduleRef && modulePublicationSemanticDigest(p) === row.publicationDigest),
  "unready", "application publication owner is missing or ambiguous");
  const verified = one(catalog.readinessBasis.verifiedProducts.filter((p) => p.productId === row.owningProductId),
    "invalid_contributor", "application contributor has no unique verified owner");
  const ownerInstall = one(env.productInstalls.filter((p) => p.productId === row.owningProductId),
    "invalid_contributor", "application contributor has no unique admitted owner");
  const contribution = one(verified.contributionManifest.rows.filter((r) =>
    r.moduleRef === row.moduleRef && r.handle === row.handle && r.kind === row.declarationKind &&
    r.declarationOrContractRef === row.declarationOrContractRef && r.owningProductId === row.owningProductId),
  "invalid_contributor", "application contribution differs from its verified owner");
  const declaration = one(publication.contracts.filter((d) => d.contractRef === row.declarationOrContractRef),
    "unready", "application value contract is missing or ambiguous in the selected publication");
  const program = one(catalog.boundPublications.flatMap((p) => p.programs).filter((p) => p.programRef === construction.programRef),
    "target_mismatch", "application Program is missing or ambiguous");
  if (row.declarationKind === "overlay" &&
      (!row.programMembershipRefs.includes(program.programRef) || !contribution.programMembershipRefs.includes(program.programRef))) {
    return fail("target_mismatch", "application target is not a declared Program member");
  }
  const target = row.declarationKind === "overlay"
    ? program
    : one(view.entries.filter((entry) => entry.programMembershipRefs.includes(program.programRef) &&
      program.callableMembership.includes(entry.definition.name)).flatMap((entry) => entry.definition.template.nodes)
      .filter((node) => node.nodeRef === construction.targetRef),
    "target_mismatch", "application node is absent or ambiguous in the admitted Program membership");
  const targetRef = row.declarationKind === "overlay" ? program.programRef : construction.targetRef;
  if (construction.targetRef !== targetRef) return fail("target_mismatch", "application target coordinate is crossed");
  const raw = rawAdmitValue(construction.value, "invocation_input", declaration.contractRef);
  if (raw.kind === "raw_admission_refusal" || !isRecord(construction.value) || construction.value.kind !== declaration.valueKind) {
    return fail("application_mismatch", "application value differs from its declared value kind");
  }
  const ajv = new Ajv2020({ strict: true, allErrors: true, validateSchema: true, validateFormats: true,
    coerceTypes: false, useDefaults: false, removeAdditional: false, $data: false });
  addFormats.default(ajv, { mode: "full", keywords: false });
  const schemaRows: JsonValue[] = [];
  const seen = new Set<string>();
  try {
    for (const asset of construction.schemaAssets) {
      const install = one(env.productInstalls.filter((p) => p.productId === asset.productId),
        "unready", "schema asset has no unique admitted owner");
      const schemaRow = one(install.publicContracts.filter((r) => r.contractKind === "schema_asset" && r.contractId === asset.contractId && r.owningProduct === asset.productId),
        "unready", "schema asset owner is absent, ambiguous or crossed");
      if (seen.has(asset.contractId)) fail("unready", "schema asset identity is duplicated");
      seen.add(asset.contractId);
      const locator = schemaRow.assetLocator;
      if (locator === undefined || locator.mediaType !== "application/schema+json" || schemaRow.contractVersion !== declaration.contractVersion) {
        fail("unready", "schema asset has no compatible installed locator");
      }
      const path = resolve(install.installedRoot, locator.path);
      const within = relative(install.installedRoot, path);
      if (isAbsolute(within) || within === ".." || within.startsWith("../")) fail("unready", "schema locator escapes its installed owner");
      const bytes = Buffer.from(asset.bytesBase64, "base64");
      if (bytes.toString("base64") !== asset.bytesBase64 || sha256Bytes(bytes) !== locator.contentDigest ||
          sha256Bytes(bytes) !== schemaRow.contractDigest || !bytes.equals(readFileSync(path))) {
        fail("unready", "schema asset bytes differ from the exact installed owner");
      }
      const schema: unknown = JSON.parse(bytes.toString("utf8"));
      if (!isRecord(schema) || schema.$schema !== "https://json-schema.org/draft/2020-12/schema" ||
          schema.$id !== asset.contractId || schema.$async !== undefined) fail("unready", "unsupported or crossed schema dialect/identity");
      if (asset.contractId === declaration.contractRef && install.productId !== ownerInstall.productId) fail("unready", "value schema belongs to a different declaration owner");
      ajv.addSchema(schema);
      schemaRows.push({ productId: install.productId, contractId: asset.contractId, digest: locator.contentDigest });
    }
    const validate = ajv.getSchema(declaration.contractRef);
    if (validate === undefined) fail("unready", "selected schema is missing");
    if (!validate(construction.value)) fail("application_mismatch", "application value does not satisfy its exact installed schema");
  } catch (cause) {
    if (cause instanceof CatalogApplicationConstructionError) throw cause;
    return fail("unready", `schema closure cannot be validated: ${String(cause)}`);
  }
  schemaRows.sort((a, b) => compareUnicodeCodeUnits(canonicalJson(a), canonicalJson(b)));
  const valueDigest = digest(construction.value);
  const applicationBasis = { ref: `application-value://abiogenesis/${valueDigest}`, digest: valueDigest };
  const contributorBody = {
    productId: verified.productId, descriptorRef: verified.descriptorRef,
    productContentDigest: verified.productContentDigest,
    contributionManifestRef: verified.contributionManifestRef,
    contributionManifestDigest: verified.contributionManifestDigest,
    publicationDigest: row.publicationDigest, row: contribution,
  };
  const contributor = { ref: contribution.provenanceRef, digest: digest(contributorBody) };
  const packet = CATALOG_OPERATION_CONTRACTS.apply[row.declarationKind];
  const validationBody = {
    authority: { ref: packet.owner.authorityRef, digest: packet.owner.authorityDigest },
    ownerManifestDigest: digest(JSON.parse(readFileSync(fileURLToPath(new URL("../../../../product-toolchain-manifest.json", import.meta.url)), "utf8"))),
    schemaRows, declaration: { ref: declaration.contractRef, digest: digest(declaration) },
    target: { ref: targetRef, digest: digest(target) }, value: applicationBasis,
    catalogBasisDigest: catalog.basisDigest, viewDigest: view.viewDigest,
    authorityBasisDigest: env.workspaceAuthorityBasis.authorityBasisDigest,
    workspaceBindingDigest: env.workspaceBinding.bindingDigest,
    installDigests: env.productInstalls.map((install) => productInstallCoordinate(install).digest),
    lockDigest: env.resolvedProductLock.lockDigest,
    artifactTruth: { ref: env.artifactTruth.projectionRef, digest: env.artifactTruth.projectionDigest },
    disposition: "valid",
  };
  const validationDigest = digest(validationBody);
  const validationReceipt = { ref: `validation://abiogenesis/${validationDigest}`, digest: validationDigest };
  const application = applyCatalogDeclaration(view, { applicationKind: row.declarationKind,
    handle: row.handle, targetRef, targetDigest: digest(target),
    appliedValueRef: applicationBasis.ref, appliedValueDigest: applicationBasis.digest });
  if (application.kind !== "declaration_application") return fail("application_mismatch", "declaration application refused its validated inputs");
  return deepFreeze({ application, resources: { kind: "catalog_application_resource_assertion", schemaVersion: "5.0.0",
    catalog, catalogView: view, catalogRow: row, construction,
    applicationBasis, validationReceipt, contributor } });
}

export function reconstructCatalogApplication(
  resources: CatalogApplicationResources,
  currentPrefix?: DurablePrefixCoordinate,
): DeclarationApplication {
  const reconstructed = constructCatalogApplicationResources(resources);
  if (!sameJson(resources.applicationBasis, reconstructed.resources.applicationBasis)) fail("application_mismatch", "application value coordinate is crossed");
  if (!sameJson(resources.validationReceipt, reconstructed.resources.validationReceipt)) fail("invalid_validation_receipt", "validation receipt is crossed");
  if (!sameJson(resources.contributor, reconstructed.resources.contributor)) fail("invalid_contributor", "contributor provenance is crossed");
  if (currentPrefix !== undefined) {
    const earlier = readRuntimeEventsAtDurablePrefix(resources.construction.prefix);
    const current = readRuntimeEventsAtDurablePrefix(currentPrefix);
    if (resources.construction.prefix.eventLogRef !== currentPrefix.eventLogRef ||
        earlier.length > current.length || !sameJson(earlier, current.slice(0, earlier.length))) {
      return fail("unready", "application prefix is not an exact predecessor of this invocation");
    }
  }
  return reconstructed.application;
}
