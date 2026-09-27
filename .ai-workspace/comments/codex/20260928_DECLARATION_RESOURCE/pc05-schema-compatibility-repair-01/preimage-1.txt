import { isJsonRecord } from "../shared/admission_predicates.js";
import { readFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { Ajv2020, type ValidateFunction } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import * as v from "valibot";
import type { ContractDeclaration, ModulePublication } from "../gtl/contracts.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { admitIJsonText } from "../shared/i_json.js";
import { sha256Bytes, type Sha256Digest } from "../shared/digests.js";
import type { ProductInstall } from "./environment.js";
import { normalizeWorksiteRelativePath, type WorksiteContextObservation } from "./worksite_effect.js";

/** Consumer contract and exact observed subject, not a core semantic rubric. */
export interface NativeWorkspaceAssessmentSelection {
  readonly resultContract: ContractDeclaration;
  readonly schemaAsset: { readonly productId: string; readonly contractId: string; readonly bytesBase64: string };
  readonly sources: readonly { readonly path: string; readonly digest: Sha256Digest }[];
  readonly candidate: { readonly path: string; readonly digest: Sha256Digest };
  readonly rubric: { readonly path: string; readonly digest: Sha256Digest };
  readonly producer: { readonly resultRef: string; readonly resultDigest: Sha256Digest;
    readonly cCallRef: string; readonly actorInvocationRef: string };
}
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
    if (!isJsonRecord(schema) ||
      schema.$id !== selection.resultContract.contractRef || schema.$id !== selection.schemaAsset.contractId ||
      schema.$schema !== "https://json-schema.org/draft/2020-12/schema" || schema.$async !== undefined ||
      schema.type !== "object" || schema.additionalProperties !== false) return null;
    const properties = schema.properties;
    if (properties === undefined || !isJsonRecord(properties)) return null;
    const kind = properties.kind;
    if (kind === undefined || !isJsonRecord(kind) || kind.const !== selection.resultContract.valueKind ||
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
      canonicalJson(declaration.contract as unknown as JsonValue) !== canonicalJson(selection.resultContract as unknown as JsonValue)) return null;
    const owners = installs.filter(install => install.productId === selection.schemaAsset.productId);
    if (owners.length !== 1) return null;
    const install = owners[0]!;
    const rows = install.publicContracts.filter(row => row.contractKind === "schema_asset" && row.contractId === selection.schemaAsset.contractId && row.owningProduct === install.productId);
    if (rows.length !== 1) return null;
    const row = rows[0]!, locator = row.assetLocator;
    if (locator === undefined || locator.mediaType !== "application/schema+json" || row.contractVersion !== selection.resultContract.contractVersion) return null;
    const file = resolve(install.installedRoot, locator.path), within = relative(install.installedRoot, file);
    if (isAbsolute(within) || within === ".." || within.startsWith("../")) return null;
    const bytes = Buffer.from(selection.schemaAsset.bytesBase64, "base64");
    if (sha256Bytes(bytes) !== row.contractDigest || sha256Bytes(bytes) !== locator.contentDigest || !bytes.equals(readFileSync(file))) return null;
    const schema = nativeWorkspaceAssessmentSchema(selection);
    if (schema === null) return null;
    validator(schema); // Refuse invalid/unresolved schemas before any native dispatch.
    return schema;
  } catch { return null; }
}
export function parseNativeWorkspaceAssessmentResult(schema: Readonly<Record<string, JsonValue>>, text: string): Readonly<Record<string, JsonValue>> | null {
  try {
    const result = admitIJsonText(text, "native assessment result");
    return isJsonRecord(result) && validator(schema)(result) ? result : null;
  } catch { return null; }
}
