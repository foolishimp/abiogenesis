import { isRecord } from "../shared/admission_predicates.js";
import { Ajv2020, type ValidateFunction } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import * as v from "valibot";
import type { ContractDeclaration, ModulePublication } from "../gtl/contracts.js";
import { type JsonValue } from "../shared/canonical_json.js";
import { admitIJsonText } from "../shared/i_json.js";
import type { Sha256Digest } from "../shared/digests.js";
import type { ProductInstall, ResolvedProductLock } from "./environment.js";
import { modulePublicationSemanticDigest } from "./publication.js";
import { normalizeWorksiteRelativePath, type WorksiteContextObservation } from "./worksite_effect.js";
import { canonicalEquals } from "../shared/value/index.js";
import { admitInstalledSchemaAsset } from "./declaration_application.js";

/** Consumer contract and exact observed subject, not a core semantic rubric. */
export type NativeWorkspaceAssessmentSelection = {
  readonly resultContract: ContractDeclaration;
  readonly schemaAsset: { readonly productId: string; readonly contractId: string; readonly bytesBase64: string };
  readonly sources: readonly { readonly path: string; readonly digest: Sha256Digest }[];
  readonly candidate: { readonly path: string; readonly digest: Sha256Digest };
  readonly rubric: { readonly path: string; readonly digest: Sha256Digest };
  readonly producer: { readonly resultRef: string; readonly resultDigest: Sha256Digest;
    readonly cCallRef: string; readonly actorInvocationRef: string };
};
const ref = v.pipe(v.string(), v.minLength(1));
const digest = v.pipe(v.string(), v.regex(/^sha256:[a-f0-9]{64}$/u));
const asset = v.strictObject({ path: v.pipe(ref, v.check(p => normalizeWorksiteRelativePath(p, false) === p)), digest });
const selectionSchema = v.strictObject({
  resultContract: v.strictObject({ contractRef: ref, contractVersion: v.literal("5.0.0"), contractKind: v.literal("output"), valueKind: ref }),
  schemaAsset: v.strictObject({ productId: ref, contractId: ref, bytesBase64: ref }),
  sources: v.pipe(v.array(asset), v.minLength(1)), candidate: asset, rubric: asset,
  producer: v.strictObject({ resultRef: ref, resultDigest: digest, cCallRef: ref, actorInvocationRef: ref }),
});
// Only this owner's admitted immutable schemas retain a prepared validator.
// Weak associations follow the exact asset/schema object lifetime; copied or
// arbitrary caller schemas remain cold. No digest grants schema authority.
const assetSchemas = new WeakMap<NativeWorkspaceAssessmentSelection["schemaAsset"], {
  bytesBase64: string; schema: Readonly<Record<string, JsonValue>>;
}>();
const preparedSchemas = new WeakMap<Readonly<Record<string, JsonValue>>, { validate?: ValidateFunction }>();
export function nativeWorkspaceAssessmentSchema(selection: NativeWorkspaceAssessmentSelection): Readonly<Record<string, JsonValue>> | null {
  try {
    const asset = selection.schemaAsset, bytesBase64 = asset.bytesBase64;
    const known = Object.isFrozen(asset) ? assetSchemas.get(asset) : undefined;
    const schema = known?.bytesBase64 === bytesBase64 ? known.schema : (() => {
      const bytes = Buffer.from(bytesBase64, "base64");
      if (bytes.toString("base64") !== bytesBase64) return null;
      return admitIJsonText(bytes.toString("utf8"), "native assessment response schema");
    })();
    if (!isRecord(schema) ||
      schema.$id !== selection.resultContract.contractRef || schema.$id !== selection.schemaAsset.contractId ||
      (Object.hasOwn(schema, "$schema") && schema.$schema !== "https://json-schema.org/draft/2020-12/schema") || schema.$async !== undefined ||
      schema.type !== "object" || schema.additionalProperties !== false) return null;
    const properties = schema.properties;
    if (properties === undefined || !isRecord(properties)) return null;
    const kind = properties.kind;
    if (kind === undefined || !isRecord(kind) || kind.const !== selection.resultContract.valueKind ||
      !Array.isArray(schema.required) || !schema.required.includes("kind")) return null;
    if (!preparedSchemas.has(schema)) preparedSchemas.set(schema, {});
    if (Object.isFrozen(asset) && known?.schema !== schema) assetSchemas.set(asset, { bytesBase64, schema });
    return schema;
  } catch { return null; }
}
export function nativeWorkspaceAssessmentSubjectMatches(selection: NativeWorkspaceAssessmentSelection, context: WorksiteContextObservation): boolean {
  const assets = [...selection.sources, selection.candidate, selection.rubric];
  return assets.every(asset => context.entries.some(entry => entry.relativePath === asset.path && entry.state === "file" && entry.digest === asset.digest));
}
export function isNativeWorkspaceAssessmentSelection(value: unknown): value is NativeWorkspaceAssessmentSelection {
  return v.is(selectionSchema, value) && new Set(value.sources.map(s => s.path)).size === value.sources.length &&
    !value.sources.some(s => s.path === value.candidate.path || s.path === value.rubric.path) &&
    value.candidate.path !== value.rubric.path && nativeWorkspaceAssessmentSchema(value as NativeWorkspaceAssessmentSelection) !== null;
}
function validator(schema: Readonly<Record<string, JsonValue>>) {
  const prepared = preparedSchemas.get(schema);
  if (prepared?.validate !== undefined) return prepared.validate;
  const ajv = new Ajv2020({ strict: true, allErrors: true, validateSchema: true, validateFormats: true,
    coerceTypes: false, useDefaults: false, removeAdditional: false, $data: false });
  addFormats.default(ajv, { mode: "full", keywords: false });
  const validate = ajv.compile(schema);
  if (prepared !== undefined) prepared.validate = validate;
  return validate;
}
/** Schema identity is resolved through the same installed schema_asset convention as catalog application. */
export function resolveNativeWorkspaceAssessmentSchema(selection: NativeWorkspaceAssessmentSelection,
  publications: readonly Readonly<ModulePublication>[], installs: readonly Readonly<ProductInstall>[]): Readonly<Record<string, JsonValue>> | null {
  try {
    const declarations = publications.flatMap(publication => publication.contracts.filter(contract =>
      contract.contractRef === selection.resultContract.contractRef).map(contract => ({ publication, contract })));
    if (declarations.length !== 1) return null;
    const declaration = declarations[0]!;
    if (declaration.publication.owningProductId !== selection.schemaAsset.productId ||
      !canonicalEquals(declaration.contract, selection.resultContract)) return null;
    const owners = installs.filter(install => install.productId === selection.schemaAsset.productId);
    if (owners.length !== 1) return null;
    const install = owners[0]!;
    const rows = install.publicContracts.filter(row => row.contractKind === "schema_asset" && row.contractId === selection.schemaAsset.contractId && row.owningProduct === install.productId);
    if (rows.length !== 1) return null;
    if (admitInstalledSchemaAsset(install, rows[0]!, { contractVersion: selection.resultContract.contractVersion,
      suppliedBytes: Buffer.from(selection.schemaAsset.bytesBase64, "base64") }).kind !== "admitted") return null;
    const schema = nativeWorkspaceAssessmentSchema(selection);
    if (schema === null) return null;
    validator(schema); // Refuse invalid/unresolved schemas before any native dispatch.
    return schema;
  } catch { return null; }
}
/** Admitted-environment evidence for the canonical assessment's inner response
 * dependency: candidate publications, admitted installs, the resolved lock and
 * the assessment callable's owner. */
export type NativeWorkspaceAssessmentDependencyBasis = {
  readonly publications: readonly Readonly<ModulePublication>[];
  readonly installs: readonly Readonly<ProductInstall>[];
  readonly resolvedLock: Readonly<ResolvedProductLock>;
  readonly assessorOwnerProductId: string;
};
export type NativeWorkspaceAssessmentDependency = {
  readonly publication: Readonly<ModulePublication>;
  readonly install: Readonly<ProductInstall>;
  readonly schema: Readonly<Record<string, JsonValue>>;
};
/** One relation for assembly, raw preimage and cold reconstruction. The
 * consumer's own Program member declares the contract and the lock carries the
 * consumer's dependency on the assessment owner; installation or supplied
 * schema bytes alone grant nothing. No reverse edge or fallback is consulted. */
export function resolveNativeWorkspaceAssessmentDependency(selection: NativeWorkspaceAssessmentSelection,
  basis: NativeWorkspaceAssessmentDependencyBasis): Readonly<NativeWorkspaceAssessmentDependency> | null {
  try {
    if (!isNativeWorkspaceAssessmentSelection(selection)) return null;
    const contractRef = selection.resultContract.contractRef, ownerId = selection.schemaAsset.productId;
    const declarations = basis.publications.flatMap(publication => publication.contracts.filter(contract =>
      contract.contractRef === contractRef).map(contract => ({ publication, contract })));
    if (declarations.length !== 1) return null;
    const { publication, contract } = declarations[0]!;
    if (publication.owningProductId !== ownerId || !canonicalEquals(contract, selection.resultContract) ||
      !publication.graphFunctions.some(graph => graph.declarations["abg.raw_result_contract"] === contractRef &&
        publication.programs.some(program => program.callableMembership.includes(graph.name)))) return null;
    const publicationDigest = modulePublicationSemanticDigest(publication);
    const owners = basis.installs.filter(install => install.productId === ownerId);
    const install = owners.length === 1 ? owners[0]! : null;
    if (install === null || install.artifactDigest !== publication.artifactDigest ||
      install.productContentDigest !== publication.productContentDigest || install.manifestDigest !== publication.productManifestDigest ||
      install.contributionManifest.publicationBindings.filter(row => row.moduleRef === publication.moduleRef &&
        row.publicationDigest === publicationDigest).length !== 1) return null;
    const lock = basis.resolvedLock;
    if (install.resolvedLockId !== lock.lockId || install.resolvedLockDigest !== lock.lockDigest ||
      lock.rows.filter(row => row.productId === ownerId && row.artifactDigest === install.artifactDigest &&
        row.productContentDigest === install.productContentDigest && row.manifestDigest === install.manifestDigest).length !== 1 ||
      lock.rows.filter(row => row.productId === basis.assessorOwnerProductId).length !== 1 ||
      ownerId !== basis.assessorOwnerProductId && lock.dependencyEdges.filter(edge => edge.kind === "requires" &&
        edge.fromProductId === ownerId && edge.toProductId === basis.assessorOwnerProductId).length !== 1) return null;
    if (basis.installs.filter(candidate => candidate.publicContracts.some(row => row.contractKind === "schema_asset" &&
      row.contractId === selection.schemaAsset.contractId)).length !== 1) return null;
    const schema = resolveNativeWorkspaceAssessmentSchema(selection, [publication], [install]);
    return schema === null ? null : Object.freeze({ publication, install, schema });
  } catch { return null; }
}
export function parseNativeWorkspaceAssessmentResult(schema: Readonly<Record<string, JsonValue>>, text: string): Readonly<Record<string, JsonValue>> | null {
  try {
    const result = admitIJsonText(text, "native assessment result");
    return isRecord(result) && validator(schema)(result) ? result : null;
  } catch { return null; }
}
