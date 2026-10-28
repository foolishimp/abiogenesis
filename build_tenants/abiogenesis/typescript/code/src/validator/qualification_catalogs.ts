import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { JsonValue } from "../shared/canonical_json.js";
import { isRecord } from "../shared/admission_predicates.js";
import { admitJson } from "../shared/admit/index.js";
import { payloadInventoryDigest, sha256Bytes, sha256Canonical, type PayloadInventoryRow } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { parseQualificationRuleCatalog, QUALIFICATION_COVERAGE_CATALOG_ASSET_PATH,
  type AdmittedQualificationCatalogs } from "./qualification.js";
import { readExecutingToolchainIdentity } from "../product/declaration_exports.js";

export const SELF_CONFORMANCE_CATALOG_ASSET_PATH = "contracts/qualification/rule-catalog.json";
export const SELF_CONFORMANCE_CATALOG_CONTRACT_ID = "abg.asset.qualification.rule-catalog";
const MANIFEST_PATH = "product-toolchain-manifest.json";

/** The verified install record an admission reads against: its root and the
 * digests it records for the rule catalog asset, the manifest and the payload. */
export type QualificationCatalogInstall = Readonly<{
  installId: string;
  installedRoot: string;
  manifestDigest: string;
  productContentDigest: string;
  publicContracts: readonly Readonly<{ contractId: string; assetLocator?: Readonly<{ path: string; contentDigest: string }> }>[];
}>;
/** A refusal names the catalog (`at`) and, where bytes were read, both digests. */
export type QualificationCatalogAdmission<T> =
  | Readonly<{ kind: "admitted"; value: T }>
  | Readonly<{ kind: "refused"; at: string; reason: string }>;

const refused = (at: string, reason: string) => deepFreeze({ kind: "refused" as const, at, reason });
function read(install: QualificationCatalogInstall, path: string): Uint8Array | string {
  try { return readFileSync(join(install.installedRoot, path)); }
  catch (error) {
    const code = isRecord(error) && typeof error.code === "string" ? error.code : "unreadable";
    return `qualification catalog ${path} cannot be read from install ${install.installId} (${code})`;
  }
}

/** The rule catalog's bytes from the install root, against its one recorded
 * public-contract asset digest. */
export function readInstalledQualificationRuleCatalog(install: QualificationCatalogInstall): QualificationCatalogAdmission<Uint8Array> {
  const rows = install.publicContracts.filter(row => row.contractId === SELF_CONFORMANCE_CATALOG_CONTRACT_ID);
  const asset = rows.length === 1 ? rows[0]!.assetLocator : undefined;
  if (asset === undefined || asset.path !== SELF_CONFORMANCE_CATALOG_ASSET_PATH)
    return refused(SELF_CONFORMANCE_CATALOG_ASSET_PATH,
      `qualification catalog ${SELF_CONFORMANCE_CATALOG_ASSET_PATH} has no single recorded asset row in install ${install.installId}`);
  const bytes = read(install, asset.path);
  if (typeof bytes === "string") return refused(asset.path, bytes);
  const digest = sha256Bytes(bytes);
  if (digest !== asset.contentDigest)
    return refused(asset.path, `qualification catalog ${asset.path} is ${digest}; the verified install records ${asset.contentDigest}`);
  // The bytes are the caller's own fresh read; a typed array cannot be frozen.
  return Object.freeze({ kind: "admitted" as const, value: bytes });
}

/** One read of both qualification catalogs from the install root. The rule
 * catalog binds through its asset digest. The coverage catalog has no row of
 * its own: it binds through the digest-bound manifest's payload inventory,
 * recomputed with the bytes in hand against the recorded product content. */
export function admitInstalledQualificationCatalogs(install: QualificationCatalogInstall): QualificationCatalogAdmission<Readonly<AdmittedQualificationCatalogs>> {
  const rules = readInstalledQualificationRuleCatalog(install), coveragePath = QUALIFICATION_COVERAGE_CATALOG_ASSET_PATH;
  if (rules.kind === "refused") return rules;
  const manifestBytes = read(install, MANIFEST_PATH);
  if (typeof manifestBytes === "string") return refused(coveragePath, manifestBytes);
  let parsed: unknown;
  try { parsed = JSON.parse(Buffer.from(manifestBytes).toString("utf8")); } catch { parsed = null; }
  let manifest: JsonValue | null = null;
  if (isRecord(parsed)) {
    const admitted = admitJson(parsed);
    if (admitted.kind !== "ok")
      return refused(coveragePath, `qualification catalog ${coveragePath} binds through the manifest of install ${install.installId}, which is not I-JSON (${admitted.code})`);
    manifest = admitted.value;
  }
  const manifestDigest = isRecord(manifest) ? sha256Canonical(manifest) : sha256Bytes(manifestBytes);
  if (manifestDigest !== install.manifestDigest)
    return refused(coveragePath, `qualification catalog ${coveragePath} binds through the manifest of install ${install.installId}, which is ${manifestDigest}; the verified install records ${install.manifestDigest}`);
  const locators = isRecord(manifest) ? manifest.productRelativeLocators : undefined;
  if (!Array.isArray(locators) || !locators.every(path => typeof path === "string") || !locators.includes(coveragePath))
    return refused(coveragePath, `qualification catalog ${coveragePath} is not a payload locator of the manifest ${install.manifestDigest} install ${install.installId} records`);
  const coverage = read(install, coveragePath);
  if (typeof coverage === "string") return refused(coveragePath, coverage);
  const coverageDigest = sha256Bytes(coverage), rulesDigest = sha256Bytes(rules.value);
  const inventory: PayloadInventoryRow[] = [];
  for (const path of locators as string[]) {
    const bytes = path === coveragePath || path === SELF_CONFORMANCE_CATALOG_ASSET_PATH ? null : read(install, path);
    if (typeof bytes === "string") return refused(coveragePath, bytes);
    inventory.push({ path, sha256: path === coveragePath ? coverageDigest : path === SELF_CONFORMANCE_CATALOG_ASSET_PATH ? rulesDigest : sha256Bytes(bytes!) });
  }
  const content = payloadInventoryDigest(inventory);
  if (content !== install.productContentDigest)
    return refused(coveragePath, `qualification catalog ${coveragePath} is ${coverageDigest}; the payload inventory over it is ${content}, and the verified install records product content ${install.productContentDigest}`);
  let parsedCoverage: unknown;
  try { parsedCoverage = JSON.parse(Buffer.from(coverage).toString("utf8")); }
  catch { return refused(coveragePath, `qualification catalog ${coveragePath} (${coverageDigest}) is not JSON`); }
  const coverageValue = admitJson(parsedCoverage);
  if (coverageValue.kind !== "ok")
    return refused(coveragePath, `qualification catalog ${coveragePath} (${coverageDigest}) is not I-JSON (${coverageValue.code})`);
  let parsedRules: AdmittedQualificationCatalogs["rules"];
  try { parsedRules = parseQualificationRuleCatalog(rules.value); }
  catch { return refused(SELF_CONFORMANCE_CATALOG_ASSET_PATH, `qualification catalog ${SELF_CONFORMANCE_CATALOG_ASSET_PATH} (${rulesDigest}) is not a rule catalog`); }
  return deepFreeze({ kind: "admitted" as const, value: deepFreeze({ coverage: coverageValue.value, rules: parsedRules }) });
}

/** One admission per install identity (`installId` and `productContentDigest`)
 * per process, for the leaf invocation port and the verdict projection. A
 * refusal is not retained: the next call admits again. */
const admittedCatalogs = new Map<string, Readonly<AdmittedQualificationCatalogs>>();
export function admitQualificationCatalogsOnce(install: QualificationCatalogInstall): QualificationCatalogAdmission<Readonly<AdmittedQualificationCatalogs>> {
  const key = JSON.stringify([install.installId, install.productContentDigest]);
  const known = admittedCatalogs.get(key);
  if (known !== undefined) return Object.freeze({ kind: "admitted" as const, value: known });
  const admission = admitInstalledQualificationCatalogs(install);
  if (admission.kind === "admitted") admittedCatalogs.set(key, admission.value);
  return admission;
}

const EXECUTING_PACKAGE_INSTALL_ID = "install://abiogenesis/executing-package";
let executingCatalogs: Readonly<AdmittedQualificationCatalogs> | undefined;
/** The executing package's own catalogs. Its install record is its own
 * manifest, located as the executing toolchain identity is located
 * (`readExecutingToolchainIdentity`, beside this package's build), and both
 * catalogs are admitted against that manifest's payload inventory, whose
 * digest the admitted owner artifact carries. Admitted once per process; a
 * refusal throws its cause and is not retained. */
export function executingQualificationCatalogs(): Readonly<AdmittedQualificationCatalogs> {
  if (executingCatalogs !== undefined) return executingCatalogs;
  const identity = readExecutingToolchainIdentity();
  const manifest = identity.manifest;
  const catalog = isRecord(manifest) ? manifest.publicContractCatalog : undefined;
  const rows = isRecord(catalog) && Array.isArray(catalog.rows) ? catalog.rows : null;
  if (identity.productContentDigest === null || rows === null)
    throw new TypeError("the executing package manifest names no ABIogenesis product content or public contract rows");
  const admission = admitInstalledQualificationCatalogs({
    installId: EXECUTING_PACKAGE_INSTALL_ID,
    installedRoot: fileURLToPath(new URL("../../../../", import.meta.url)),
    manifestDigest: identity.manifestDigest,
    productContentDigest: identity.productContentDigest,
    publicContracts: rows as unknown as QualificationCatalogInstall["publicContracts"],
  });
  if (admission.kind === "refused") throw new TypeError(admission.reason);
  return executingCatalogs = admission.value;
}
