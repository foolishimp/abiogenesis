import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as v from "valibot";
import { Ajv2020 } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { canonicalJson, compareUnicodeCodeUnits, type JsonValue } from "../shared/canonical_json.js";
import { sha256Bytes, sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { pathRelation, pathWithin } from "../shared/path_confinement.js";
import { onlyExactMatch, type ExactMatch } from "../shared/select/index.js";
import { isRecord, sameJson } from "../public/binding/definition_binding_mechanics.js";
import { jsonValueSchema, nonblankSchema } from "../shared/public_function_contracts.js";
import type { ReferenceDigest } from "../shared/public_invocation.js";
import { rawAdmitValue } from "../validator/raw_admission.js";
import {
  validateDurablePrefixCoordinate,
  type DurablePrefixCoordinate,
} from "../abg/event_store.js";
import { readOwnedRuntimeEventPrefixAtDurablePrefix, runtimeEventPrefixDigest, runtimeEventPrefixExtent,
  runtimeEventPrefixLastEnvelope, validatedRuntimeEventPrefixThroughEvent, type RuntimeEventPrefix } from "../abg/event_prefix.js";
import { projectAdmittedProductInstall, projectExactPrefixWorkspaceEnvironment } from "../abg/environment_admission.js";
import {
  admitGraphFunctionCatalog, applyCatalogDeclaration, narrowGraphFunctionCatalog,
  type DeclarationApplication, type DeclarationCatalogEntry,
  type GraphFunctionCatalogView, type ReadyGraphFunctionCatalog,
} from "./catalog.js";
import { CATALOG_OPERATION_CONTRACTS } from "./catalog_operation_contracts.js";
import { productInstallCoordinate, type ProductInstall } from "./environment.js";
import type { ProductAssetLocator, ProductPublicContract } from "./contracts.js";
import { modulePublicationSemanticDigest } from "./publication.js";
import { readExecutingToolchainIdentity } from "./declaration_exports.js";

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
/** @internal Compile-time agreement check. */
export type CatalogConstructionSchemaAgreement = AssertConstructionAgreement<
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
/**
 * The installed `schema_asset` convention, one owner for catalog application,
 * native assessment and materialization admission: the row's
 * `application/schema+json` locator (and its contract version when one is
 * expected), a locator path under the install root, and bytes whose SHA-256
 * equals both the locator's content digest and the row's contract digest.
 * Supplied bytes must also equal the installed file (`null`: the supplied
 * encoding is not canonical); without them the installed file is read. With
 * `document`, the bytes parse as one JSON Schema 2020-12 document. Returns the
 * first check that refuses, in that order; a read or parse failure throws to
 * the caller, whose refusal it is.
 */
export function admitInstalledSchemaAsset(
  install: Readonly<ProductInstall>,
  row: Readonly<ProductPublicContract>,
  expected: Readonly<{ contractVersion?: string; suppliedBytes?: Buffer | null; document?: boolean }>,
): Readonly<{ kind: "admitted"; locator: Readonly<ProductAssetLocator>; bytes: Buffer; document: Readonly<Record<string, unknown>> | null }>
  | Readonly<{ kind: "refused"; check: "locator" | "locus" | "bytes" | "dialect" }> {
  const locator = row.assetLocator;
  if (locator === undefined || locator.mediaType !== "application/schema+json" ||
      (expected.contractVersion !== undefined && row.contractVersion !== expected.contractVersion)) return { kind: "refused", check: "locator" };
  const path = resolve(install.installedRoot, locator.path);
  if (!pathWithin(pathRelation(install.installedRoot, path))) return { kind: "refused", check: "locus" };
  if (expected.suppliedBytes === null) return { kind: "refused", check: "bytes" };
  const bytes = expected.suppliedBytes ?? readFileSync(path);
  if (sha256Bytes(bytes) !== locator.contentDigest || sha256Bytes(bytes) !== row.contractDigest ||
      (expected.suppliedBytes !== undefined && !bytes.equals(readFileSync(path)))) return { kind: "refused", check: "bytes" };
  if (expected.document !== true) return { kind: "admitted", locator, bytes, document: null };
  const document: unknown = JSON.parse(bytes.toString("utf8"));
  if (!isRecord(document) || document.$schema !== "https://json-schema.org/draft/2020-12/schema") return { kind: "refused", check: "dialect" };
  return { kind: "admitted", locator, bytes, document };
}

function fail(code: CatalogApplicationRefusalCode, message: string): never {
  throw new CatalogApplicationConstructionError(code, message);
}
function digest(value: JsonValue) { return sha256Canonical(value); }
/** Owner boundary: `absent` and `many` fail with the catalog refusal code. */
function exactOrFail<T>(match: ExactMatch<T>, code: CatalogApplicationRefusalCode, message: string): T {
  if (match.kind !== "one") fail(code, message);
  return match.value;
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
  const publication = exactOrFail(onlyExactMatch(catalog.boundPublications.filter((p) =>
    p.moduleRef === row.moduleRef && modulePublicationSemanticDigest(p) === row.publicationDigest)),
  "unready", "application publication owner is missing or ambiguous");
  const verified = exactOrFail(onlyExactMatch(catalog.readinessBasis.verifiedProducts.filter((p) => p.productId === row.owningProductId)),
    "invalid_contributor", "application contributor has no unique verified owner");
  const ownerInstall = exactOrFail(onlyExactMatch(env.productInstalls.filter((p) => p.productId === row.owningProductId)),
    "invalid_contributor", "application contributor has no unique admitted owner");
  const contribution = exactOrFail(onlyExactMatch(verified.contributionManifest.rows.filter((r) =>
    r.moduleRef === row.moduleRef && r.handle === row.handle && r.kind === row.declarationKind &&
    r.declarationOrContractRef === row.declarationOrContractRef && r.owningProductId === row.owningProductId)),
  "invalid_contributor", "application contribution differs from its verified owner");
  const declaration = exactOrFail(onlyExactMatch(publication.contracts.filter((d) => d.contractRef === row.declarationOrContractRef)),
    "unready", "application value contract is missing or ambiguous in the selected publication");
  const program = exactOrFail(onlyExactMatch(catalog.boundPublications.flatMap((p) => p.programs).filter((p) => p.programRef === construction.programRef)),
    "target_mismatch", "application Program is missing or ambiguous");
  if (row.declarationKind === "overlay" &&
      (!row.programMembershipRefs.includes(program.programRef) || !contribution.programMembershipRefs.includes(program.programRef))) {
    return fail("target_mismatch", "application target is not a declared Program member");
  }
  const target = row.declarationKind === "overlay"
    ? program
    : exactOrFail(onlyExactMatch(view.entries.filter((entry) => entry.programMembershipRefs.includes(program.programRef) &&
      program.callableMembership.includes(entry.definition.name)).flatMap((entry) => entry.definition.template.nodes)
      .filter((node) => node.nodeRef === construction.targetRef)),
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
      const install = exactOrFail(onlyExactMatch(env.productInstalls.filter((p) => p.productId === asset.productId)),
        "unready", "schema asset has no unique admitted owner");
      const schemaRow = exactOrFail(onlyExactMatch(install.publicContracts.filter((r) => r.contractKind === "schema_asset" && r.contractId === asset.contractId && r.owningProduct === asset.productId)),
        "unready", "schema asset owner is absent, ambiguous or crossed");
      if (seen.has(asset.contractId)) fail("unready", "schema asset identity is duplicated");
      seen.add(asset.contractId);
      const supplied = Buffer.from(asset.bytesBase64, "base64");
      const admitted = admitInstalledSchemaAsset(install, schemaRow, { contractVersion: declaration.contractVersion,
        suppliedBytes: supplied.toString("base64") === asset.bytesBase64 ? supplied : null, document: true });
      if (admitted.kind === "refused") {
        fail("unready", ({ locator: "schema asset has no compatible installed locator", locus: "schema locator escapes its installed owner",
          bytes: "schema asset bytes differ from the exact installed owner", dialect: "unsupported or crossed schema dialect/identity" } as const)[admitted.check]);
      }
      const locator = admitted.locator, schema = admitted.document!;
      if (schema.$id !== asset.contractId || schema.$async !== undefined) fail("unready", "unsupported or crossed schema dialect/identity");
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
    ownerManifestDigest: readExecutingToolchainIdentity().manifestDigest,
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
    // Same-log logical prefix: the earlier cut's canonical digest equals the
    // digest of the current history through the earlier cut's final event at
    // the same extent. No ancestry, device or profile condition is added.
    const earlier = readOwnedRuntimeEventPrefixAtDurablePrefix(resources.construction.prefix);
    const current = readOwnedRuntimeEventPrefixAtDurablePrefix(currentPrefix);
    const earlierCount = runtimeEventPrefixExtent(earlier).count, currentCount = runtimeEventPrefixExtent(current).count;
    const earlierLast = runtimeEventPrefixLastEnvelope(earlier);
    let currentCut: RuntimeEventPrefix | null | undefined = null;
    try { if (earlierLast !== undefined) currentCut = validatedRuntimeEventPrefixThroughEvent(current, earlierLast.eventId); }
    catch { currentCut = undefined; }
    if (resources.construction.prefix.eventLogRef !== currentPrefix.eventLogRef || earlierCount > currentCount ||
        currentCut === undefined ||
        (currentCut !== null && (runtimeEventPrefixExtent(currentCut).count !== earlierCount ||
          runtimeEventPrefixDigest(currentCut) !== runtimeEventPrefixDigest(earlier)))) {
      return fail("unready", "application prefix is not an exact predecessor of this invocation");
    }
  }
  return reconstructed.application;
}
