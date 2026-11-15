import { isRecord } from "../shared/admission_predicates.js";
import { Ajv2020, type ValidateFunction } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import * as v from "valibot";
import type { ContractDeclaration, ModulePublication } from "../gtl/contracts.js";
import { type JsonValue } from "../shared/canonical_json.js";
import { admitIJsonText } from "../shared/i_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
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
/** The exact admitted executing Program coordinate: the loaded execution
 * resolution's Program publication, ref and digest at leaf preparation and raw
 * preimage, or the authenticated assembly `basis.publication` with the
 * execution basis Program ref and digest at assembly and cold reconstruction. */
export type NativeWorkspaceAssessmentProgramUse = {
  readonly publication: Readonly<ModulePublication>;
  readonly programRef: string;
  readonly programDigest: Sha256Digest;
};
/** Admitted-environment evidence for the canonical assessment's inner response
 * dependency: candidate schema-owner publications, admitted installs, the
 * resolved lock, the assessment callable's owner and the executing Program. */
export type NativeWorkspaceAssessmentDependencyBasis = {
  readonly publications: readonly Readonly<ModulePublication>[];
  readonly installs: readonly Readonly<ProductInstall>[];
  readonly resolvedLock: Readonly<ResolvedProductLock>;
  readonly assessorOwnerProductId: string;
  readonly program: Readonly<NativeWorkspaceAssessmentProgramUse>;
};
/** `publication`/`install` remain the unique schema owner; `use` is the exact
 * executing Program's declaration of use. Neither is persisted. */
export type NativeWorkspaceAssessmentDependency = {
  readonly publication: Readonly<ModulePublication>;
  readonly install: Readonly<ProductInstall>;
  readonly schema: Readonly<Record<string, JsonValue>>;
  readonly use: {
    readonly publication: Readonly<ModulePublication>;
    readonly install: Readonly<ProductInstall>;
    readonly programRef: string;
    readonly programDigest: Sha256Digest;
    readonly memberRefs: readonly string[];
  };
};
/** One publication/install/lock join: the owning Product's unique admitted
 * install binds exactly this publication digest under exactly this lock row. */
function exactPublicationInstall(publication: Readonly<ModulePublication>, installs: readonly Readonly<ProductInstall>[],
  lock: Readonly<ResolvedProductLock>): Readonly<ProductInstall> | null {
  const owners = installs.filter(install => install.productId === publication.owningProductId);
  if (owners.length !== 1) return null;
  const install = owners[0]!, publicationDigest = modulePublicationSemanticDigest(publication);
  return install.artifactDigest === publication.artifactDigest && install.productContentDigest === publication.productContentDigest &&
    install.manifestDigest === publication.productManifestDigest &&
    install.contributionManifest.publicationBindings.filter(row => row.moduleRef === publication.moduleRef &&
      row.publicationDigest === publicationDigest).length === 1 &&
    install.resolvedLockId === lock.lockId && install.resolvedLockDigest === lock.lockDigest &&
    lock.rows.filter(row => row.productId === install.productId && row.artifactDigest === install.artifactDigest &&
      row.productContentDigest === install.productContentDigest && row.manifestDigest === install.manifestDigest).length === 1
    ? install : null;
}
/** Forward dependency only: equality, or exactly one `requires` edge from the
 * dependent Product to the Product it uses. A reverse edge grants nothing. */
function requiresForward(lock: Readonly<ResolvedProductLock>, fromProductId: string, toProductId: string): boolean {
  return fromProductId === toProductId || lock.dependencyEdges.filter(edge => edge.kind === "requires" &&
    edge.fromProductId === fromProductId && edge.toProductId === toProductId).length === 1;
}
/** One relation for leaf preparation, assembly, raw preimage and cold
 * reconstruction. The unique schema owner declares the contract and installs
 * its bytes; the exact executing Program's member callables declare its use;
 * the lock carries the executing Program owner's forward dependencies on the
 * assessment owner and the schema owner. Owner and use may coincide. Catalog
 * membership, installation or supplied schema bytes alone grant nothing. */
export function resolveNativeWorkspaceAssessmentDependency(selection: NativeWorkspaceAssessmentSelection,
  basis: NativeWorkspaceAssessmentDependencyBasis): Readonly<NativeWorkspaceAssessmentDependency> | null {
  try {
    if (!isNativeWorkspaceAssessmentSelection(selection)) return null;
    const contractRef = selection.resultContract.contractRef, ownerId = selection.schemaAsset.productId;
    const declarations = basis.publications.flatMap(publication => publication.contracts.filter(contract =>
      contract.contractRef === contractRef).map(contract => ({ publication, contract })));
    if (declarations.length !== 1) return null;
    const { publication, contract } = declarations[0]!;
    if (publication.owningProductId !== ownerId || !canonicalEquals(contract, selection.resultContract)) return null;
    // The executing Program's own declaration of use, never another Program.
    const use = basis.program, programs = use.publication.programs.filter(program => program.programRef === use.programRef);
    if (programs.length !== 1 || sha256Canonical(programs[0]!) !== use.programDigest) return null;
    const program = programs[0]!;
    const memberRefs = use.publication.graphFunctions.filter(graph => program.callableMembership.includes(graph.name) &&
      graph.declarations["abg.raw_result_contract"] === contractRef).map(graph => graph.name);
    if (memberRefs.length === 0) return null;
    const lock = basis.resolvedLock;
    const install = exactPublicationInstall(publication, basis.installs, lock);
    const useInstall = exactPublicationInstall(use.publication, basis.installs, lock);
    if (install === null || useInstall === null || install.productId !== ownerId ||
      lock.rows.filter(row => row.productId === basis.assessorOwnerProductId).length !== 1 ||
      !requiresForward(lock, useInstall.productId, basis.assessorOwnerProductId) ||
      !requiresForward(lock, useInstall.productId, ownerId)) return null;
    if (basis.installs.filter(candidate => candidate.publicContracts.some(row => row.contractKind === "schema_asset" &&
      row.contractId === selection.schemaAsset.contractId)).length !== 1) return null;
    const schema = resolveNativeWorkspaceAssessmentSchema(selection, [publication], [install]);
    return schema === null ? null : Object.freeze({ publication, install, schema,
      use: Object.freeze({ publication: use.publication, install: useInstall, programRef: use.programRef,
        programDigest: use.programDigest, memberRefs: Object.freeze(memberRefs) }) });
  } catch { return null; }
}
export function parseNativeWorkspaceAssessmentResult(schema: Readonly<Record<string, JsonValue>>, text: string): Readonly<Record<string, JsonValue>> | null {
  try {
    const result = admitIJsonText(text, "native assessment result");
    return isRecord(result) && validator(schema)(result) ? result : null;
  } catch { return null; }
}
