// The exact candidate identity of one qualification preparation (D4/D5 "RC14 exact candidate preparation";
// D6 section 2). One canonical positive `5.0.0-rc.<n>` identity is derived from the exact installed package, its
// Product manifest, the verified artifact and content, the admitted install and the frozen release-claim bytes;
// the assigned namespace, profile, subtree and version line are fixed. The existing subject kind
// (`pre_rc_candidate | installed_rc`) is an explicit preparation selection, retained when an archive reopens.
//
// This module is a preparation tool: pure joins and constructions over supplied values, with no I/O, installed
// import, verdict or qualification law. The installed validator (isQualificationBasisReady) and the AF22/AF25
// owners keep their authority; a refusal here only stops preparation before resources are generated or used.
import { createHash } from 'node:crypto';

export const PACKAGE_NAME = '@abiogenesis/typescript-tenant';
export const RELEASE_FIELDS = Object.freeze({ namespace: 'abiogenesis', profile: 'one_project_unqualified', projectSubtree: '.', versionLine: '5.0.0' });
export const SUBJECT_KINDS = Object.freeze(['pre_rc_candidate', 'installed_rc']);
export const RELEASE_CLAIM_PATH = 'release-claim.md';
const RC_VERSION = /^5\.0\.0-rc\.([1-9][0-9]*)$/u;
const DIGEST = /^sha256:[0-9a-f]{64}$/u;
const bytesDigest = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
const nonblank = value => typeof value === 'string' && value.trim() !== '' && value.trim() === value;

/** A preparation refusal with a stable reason; it carries no qualification meaning. */
export class CandidateIdentityRefusal extends TypeError {
  constructor(reason, detail = '') {
    super('exact candidate identity refused: ' + reason + (detail === '' ? '' : ' (' + detail + ')'));
    this.name = 'CandidateIdentityRefusal';
    this.reason = reason;
  }
}
const refuse = (reason, detail) => { throw new CandidateIdentityRefusal(reason, detail); };
const shown = value => typeof value === 'string' ? JSON.stringify(value) : String(value);

function deepFreeze(value) {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const item of Object.values(value)) deepFreeze(item);
    Object.freeze(value);
  }
  return value;
}

/** The canonical positive RC version on the fixed 5.0.0 line: no zero, sign, leading zero, suffix or unsafe ordinal. */
export function parseCanonicalRcVersion(version) {
  const match = typeof version === 'string' ? RC_VERSION.exec(version) : null;
  const ordinal = match === null ? NaN : Number(match[1]);
  if (match === null || !Number.isSafeInteger(ordinal) || ordinal < 1 || `${RELEASE_FIELDS.versionLine}-rc.${ordinal}` !== version)
    refuse('noncanonical_version', shown(version));
  return Object.freeze({ versionLine: RELEASE_FIELDS.versionLine, ordinal, version });
}

export const productIdOf = version => 'product://abiogenesis/typescript-tenant@' + parseCanonicalRcVersion(version).version;
export const claimRefPrefix = identity => 'claim://abiogenesis/typescript-tenant@' + identity.version + '/';
export const archiveNameOf = identity => 'abiogenesis-typescript-tenant-' + identity.version + '.tgz';

/** The export guard of an installed package: the declared package name at a canonical positive RC version. */
export function installedPackageIdentity(packageJson) {
  if (packageJson?.name !== PACKAGE_NAME) refuse('package_mismatch', 'name ' + shown(packageJson?.name));
  return Object.freeze({ name: PACKAGE_NAME, ...parseCanonicalRcVersion(packageJson.version) });
}

/** The release claim names exactly this package version and Product, once each. */
export function releaseClaimDeclares(bytes, { version, productId }) {
  if (!Buffer.isBuffer(bytes) || bytes.length === 0) refuse('release_claim_mismatch', 'no claim bytes');
  let text;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { refuse('release_claim_mismatch', 'claim bytes are not UTF-8'); }
  const packages = [...text.matchAll(/^Package: `([^`\n]*)` `([^`\n]*)`/gmu)], products = [...text.matchAll(/^Product: `([^`\n]*)`/gmu)];
  if (packages.length !== 1 || products.length !== 1)
    refuse('release_claim_mismatch', `${packages.length} package and ${products.length} product declarations`);
  if (packages[0][1] !== PACKAGE_NAME || packages[0][2] !== version || products[0][1] !== productId)
    refuse('release_claim_mismatch', `claim names ${packages[0][1]} ${packages[0][2]} / ${products[0][1]}, candidate is ${version}`);
}

/**
 * Derives the identity from exact joins:
 *   packageJson        installed package.json (export guard)
 *   sourcePackageJson  the frozen source package.json whose inventory carries the release claim
 *   manifest           installed product-toolchain-manifest.json; manifestDigest its canonical digest
 *   verified           the Product owner's verified artifact of the candidate archive, or null where the caller has
 *                      no verification (resource regeneration joins the archive through the install record)
 *   install            the admitted install record of that archive
 *   releaseClaim       { ref, bytes } of the frozen release-claim member
 */
export function deriveCandidateIdentity({ packageJson, sourcePackageJson, manifest, manifestDigest, verified, install, releaseClaim }) {
  const { version, ordinal } = installedPackageIdentity(packageJson);
  const productId = productIdOf(version);
  if (sourcePackageJson?.name !== PACKAGE_NAME || sourcePackageJson.version !== version)
    refuse('package_mismatch', `source ${shown(sourcePackageJson?.name)} ${shown(sourcePackageJson?.version)}, installed ${version}`);
  if (manifest?.kind !== 'abg_product_toolchain_manifest' || manifest.packageName !== PACKAGE_NAME || manifest.packageVersion !== version ||
    manifest.productId !== productId || !DIGEST.test(manifest.productContentDigest ?? '') || !DIGEST.test(manifestDigest ?? ''))
    refuse('manifest_mismatch', `${shown(manifest?.productId)} ${shown(manifest?.packageVersion)}`);
  const contentDigest = manifest.productContentDigest;
  if (verified === undefined) refuse('artifact_mismatch', 'verification is neither supplied nor explicitly absent');
  if (verified !== null && (verified.productId !== productId || verified.packageName !== PACKAGE_NAME || verified.packageVersion !== version ||
    verified.manifestDigest !== manifestDigest || verified.productContentDigest !== contentDigest ||
    !DIGEST.test(verified.artifactDigest ?? '') || !nonblank(verified.artifactRef)))
    refuse('artifact_mismatch', `${shown(verified.productId)} ${shown(verified.packageVersion)} ${shown(verified.manifestDigest)}`);
  if (install === null || typeof install !== 'object') refuse('install_mismatch', 'no admitted install record');
  if (install.productId !== productId || install.packageVersion !== version || (install.packageName !== undefined && install.packageName !== PACKAGE_NAME) ||
    install.manifestDigest !== manifestDigest || install.productContentDigest !== contentDigest || !DIGEST.test(install.artifactDigest ?? '') ||
    (verified !== null && install.artifactDigest !== verified.artifactDigest) || !nonblank(install.installId))
    refuse('install_mismatch', `${shown(install.productId)} ${shown(install.packageVersion)} ${shown(install.artifactDigest)}`);
  if (!nonblank(releaseClaim?.ref) || !releaseClaim.ref.endsWith('/' + RELEASE_CLAIM_PATH)) refuse('release_claim_mismatch', 'ref ' + shown(releaseClaim?.ref));
  releaseClaimDeclares(releaseClaim.bytes, { version, productId });
  return deepFreeze({ packageName: PACKAGE_NAME, productId, ...RELEASE_FIELDS, ordinal, version, manifestDigest, productContentDigest: contentDigest,
    artifactDigest: install.artifactDigest, installId: install.installId,
    releaseClaim: { ref: releaseClaim.ref, digest: bytesDigest(releaseClaim.bytes), byteCount: releaseClaim.bytes.length } });
}

/** The basis's prospectiveRelease coordinate, exactly the existing schema's fields. */
export function prospectiveRelease(identity) {
  return { productId: identity.productId, namespace: identity.namespace, profile: identity.profile, projectSubtree: identity.projectSubtree,
    versionLine: identity.versionLine, ordinal: identity.ordinal, version: identity.version,
    releaseClaim: { ref: identity.releaseClaim.ref, digest: identity.releaseClaim.digest } };
}

/** The explicit existing subject kind; anything else, including absence, refuses. */
export function selectSubjectKind(kind) {
  if (!SUBJECT_KINDS.includes(kind)) refuse('subject_kind_unselected', shown(kind));
  return kind;
}

/** Reopening keeps the prepared selection. A record without one refuses (no default); another requested kind is a relabel. */
export function retainedSubjectKind(preparedRecord, requested) {
  const kind = preparedRecord?.subjectKind;
  if (!SUBJECT_KINDS.includes(kind)) refuse('subject_kind_not_retained', shown(kind));
  if (requested !== undefined && requested !== kind) refuse('subject_kind_relabel', `${kind} -> ${shown(requested)}`);
  return kind;
}

/**
 * The body of the existing exact-candidate basis (validator EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA); its
 * identity fields are constructed by the installed constructQualificationIdentity. The identity must be the one
 * derived from this install and verification, and its claim must be the inventory's release-claim member.
 */
export function qualificationBasisBody({ subjectKind, identity, install, verified, inventory, binding, tenant, law, installedProductDigest }) {
  selectSubjectKind(subjectKind);
  if (identity.installId !== install.installId || identity.productId !== install.productId || identity.version !== install.packageVersion ||
    identity.artifactDigest !== verified?.artifactDigest || identity.manifestDigest !== install.manifestDigest)
    refuse('install_mismatch', 'identity is not derived from this install and verified artifact');
  const claims = inventory.members.filter(member => member.ref === identity.releaseClaim.ref);
  if (claims.length !== 1 || claims[0].digest !== identity.releaseClaim.digest || claims[0].byteCount !== identity.releaseClaim.byteCount)
    refuse('release_claim_stale', 'the inventory release-claim member differs from the claim bytes');
  return { kind: 'exact_candidate_qualification', projection: 'basis', schemaVersion: '5.0.0', subjectKind,
    productId: identity.productId, productVersion: identity.version,
    sourceInventory: { ref: inventory.inventoryRef, digest: inventory.inventoryDigest },
    artifact: { ref: verified.artifactRef, digest: verified.artifactDigest },
    productManifest: { ref: 'product-manifest://abiogenesis/' + identity.manifestDigest.slice(7), digest: identity.manifestDigest },
    productContentDigest: identity.productContentDigest,
    toolchain: { ref: 'toolchain://abiogenesis/' + identity.manifestDigest.slice(7), digest: identity.manifestDigest },
    installedProduct: { ref: install.installId, digest: installedProductDigest }, workspaceBinding: binding,
    prospectiveRelease: prospectiveRelease(identity),
    tenantManifest: { ref: tenant.manifestRef, digest: tenant.manifestDigest }, coverageCatalog: law.coverageCatalog, lawBasis: law.lawBasis };
}

/** The identity-bearing fields of the generated resource index (test_env/qualification/resources.json). */
export function resourceIndexIdentity(identity, { candidateCommit, archive, claimPath }) {
  return { subject: { productId: identity.productId, packageVersion: identity.version, candidateCommit, archive: { name: archive.name, digest: archive.digest } },
    prospectiveRelease: { ...prospectiveRelease(identity), releaseClaim: { ref: identity.releaseClaim.ref, path: claimPath,
      digest: identity.releaseClaim.digest, byteCount: identity.releaseClaim.byteCount } },
    generatorPackage: { name: PACKAGE_NAME, version: identity.version } };
}

/**
 * Every way the committed generated resources fail to belong to this identity: the resource index, the tenant
 * conformance manifest's Product and claim refs, and the expected output inventory's candidate archive.
 */
export function generatedResourceFailures(identity, { resources, tenantManifest, expectedOutputs }) {
  const failures = [], expect = (label, actual, wanted) => { if (actual !== wanted) failures.push(`${label} ${shown(actual)} != ${shown(wanted)}`); };
  const archiveName = archiveNameOf(identity), source = expectedOutputs?.source;
  expect('expected outputs archive', source?.archive, archiveName);
  expect('expected outputs archive digest', source?.archiveDigest, identity.artifactDigest);
  expect('resource index kind', resources?.kind, 'qualification_resource_index');
  const wanted = resourceIndexIdentity(identity, { candidateCommit: source?.sourceCommit, archive: { name: archiveName, digest: identity.artifactDigest },
    claimPath: resources?.prospectiveRelease?.releaseClaim?.path });
  for (const key of ['productId', 'packageVersion', 'candidateCommit']) expect('resource subject ' + key, resources?.subject?.[key], wanted.subject[key]);
  for (const key of ['name', 'digest']) expect('resource subject archive ' + key, resources?.subject?.archive?.[key], wanted.subject.archive[key]);
  for (const key of ['productId', 'namespace', 'profile', 'projectSubtree', 'versionLine', 'ordinal', 'version'])
    expect('resource prospective ' + key, resources?.prospectiveRelease?.[key], wanted.prospectiveRelease[key]);
  for (const key of ['ref', 'digest', 'byteCount'])
    expect('resource release claim ' + key, resources?.prospectiveRelease?.releaseClaim?.[key], wanted.prospectiveRelease.releaseClaim[key]);
  for (const key of ['name', 'version']) expect('resource generator package ' + key, resources?.generator?.package?.[key], wanted.generatorPackage[key]);
  expect('tenant manifest product', tenantManifest?.productId, identity.productId);
  if (typeof tenantManifest?.publicContractCatalog?.ref !== 'string' || !tenantManifest.publicContractCatalog.ref.endsWith('@' + identity.version))
    failures.push(`tenant manifest catalog ${shown(tenantManifest?.publicContractCatalog?.ref)} is not of ${identity.version}`);
  const claims = Array.isArray(tenantManifest?.claims) ? tenantManifest.claims : [];
  const foreign = claims.filter(claim => typeof claim?.claimRef !== 'string' || !claim.claimRef.startsWith(claimRefPrefix(identity)));
  if (!Array.isArray(tenantManifest?.claims) || foreign.length > 0)
    failures.push(`tenant manifest claim refs outside ${claimRefPrefix(identity)}: ${foreign.slice(0, 3).map(claim => shown(claim?.claimRef)).join(', ')}`);
  return failures;
}

/**
 * The identity preparation uses: derived from the exact joins, then refused when any committed generated resource
 * is stale for it, before inventory, scope, basis or C2 configuration is constructed.
 */
export function prepareCandidateIdentity({ committed, ...joins }) {
  const identity = deriveCandidateIdentity(joins);
  const stale = generatedResourceFailures(identity, committed);
  if (stale.length > 0) refuse('stale_resources', stale.join('; '));
  return identity;
}
