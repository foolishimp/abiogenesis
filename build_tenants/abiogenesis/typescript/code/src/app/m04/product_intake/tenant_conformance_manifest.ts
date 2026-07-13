// Implements: T-255; REQ-M-GTL3-CAPABILITY-001..015;
// REQ-P-PUBLIC-CONTRACTS.

import {
  TENANT_CAPABILITY_SUPPORT_DISPOSITIONS,
  TENANT_CONFORMANCE_CARRIER_CLASSIFICATIONS,
  TENANT_CONFORMANCE_MANIFEST_SCHEMA_ID,
  TENANT_CONFORMANCE_MANIFEST_SCHEMA_VERSION,
  type AdmittedTenantConformanceManifest,
  type ResolvedTenantCapabilityClaim,
  type ResolvedTenantPublicContractClaim,
  type TenantCapabilityClaim,
  type TenantConformanceEnforcementClaim,
  type TenantConformanceManifest,
  type TenantEffectCapabilityBinding,
  type TenantPublicContractCatalogBasis,
  type TenantPublicContractClaim
} from "../../../shared/abg_library/tenant_conformance_manifest.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import {
  arrayOf,
  closedObject,
  digest,
  exactSemVer,
  literal,
  nonEmptyString,
  oneOf,
  requiredField,
  uniqueStrings
} from "../public_sdk/admission_primitives.js";
import { admitPublicContractCatalog } from "../public_sdk/carrier_admission.js";
import type {
  PublicContractCatalog,
  PublicContractRow
} from "../public_sdk/carriers.js";

function catalogDigestBasis(
  catalog: PublicContractCatalog
): Omit<PublicContractCatalog, "catalogDigest"> {
  const { catalogDigest, ...basis } = catalog;
  void catalogDigest;
  return basis;
}

function manifestDigestBasis(
  manifest: TenantConformanceManifest
): Omit<TenantConformanceManifest, "manifestDigest"> {
  const { manifestDigest, ...basis } = manifest;
  void manifestDigest;
  return basis;
}

function catalogBasis(
  input: unknown,
  label: string
): TenantPublicContractCatalogBasis {
  const value = closedObject(
    input,
    ["catalogId", "catalogVersion", "catalogDigest"],
    label
  );
  return Object.freeze({
    catalogId: nonEmptyString(
      requiredField(value, "catalogId", label),
      `${label}.catalogId`
    ),
    catalogVersion: exactSemVer(
      requiredField(value, "catalogVersion", label),
      `${label}.catalogVersion`
    ),
    catalogDigest: digest(
      requiredField(value, "catalogDigest", label),
      `${label}.catalogDigest`
    )
  });
}

function publicContractClaim(
  input: unknown,
  label: string
): TenantPublicContractClaim {
  const value = closedObject(
    input,
    ["claimRef", "contractId", "contractVersion", "contractDigest"],
    label
  );
  return Object.freeze({
    claimRef: nonEmptyString(
      requiredField(value, "claimRef", label),
      `${label}.claimRef`
    ),
    contractId: nonEmptyString(
      requiredField(value, "contractId", label),
      `${label}.contractId`
    ),
    contractVersion: exactSemVer(
      requiredField(value, "contractVersion", label),
      `${label}.contractVersion`
    ),
    contractDigest: digest(
      requiredField(value, "contractDigest", label),
      `${label}.contractDigest`
    )
  });
}

function capabilityClaim(
  input: unknown,
  label: string
): TenantCapabilityClaim {
  const value = closedObject(
    input,
    [
      "capabilityId",
      "owningContractClaimRef",
      "supportedDisposition",
      "dependentCapabilityIds"
    ],
    label
  );
  return Object.freeze({
    capabilityId: nonEmptyString(
      requiredField(value, "capabilityId", label),
      `${label}.capabilityId`
    ),
    owningContractClaimRef: nonEmptyString(
      requiredField(value, "owningContractClaimRef", label),
      `${label}.owningContractClaimRef`
    ),
    supportedDisposition: oneOf(
      requiredField(value, "supportedDisposition", label),
      TENANT_CAPABILITY_SUPPORT_DISPOSITIONS,
      `${label}.supportedDisposition`
    ),
    dependentCapabilityIds: uniqueStrings(
      requiredField(value, "dependentCapabilityIds", label),
      `${label}.dependentCapabilityIds`
    )
  });
}

function effectBinding(
  input: unknown,
  label: string
): TenantEffectCapabilityBinding {
  const value = closedObject(input, ["effectRef", "capabilityId"], label);
  return Object.freeze({
    effectRef: nonEmptyString(
      requiredField(value, "effectRef", label),
      `${label}.effectRef`
    ),
    capabilityId: nonEmptyString(
      requiredField(value, "capabilityId", label),
      `${label}.capabilityId`
    )
  });
}

function enforcementClaim(
  input: unknown,
  label: string
): TenantConformanceEnforcementClaim {
  const value = closedObject(
    input,
    [
      "contractClaimRef",
      "carrierClassification",
      "applicableRuleIds",
      "causalPredecessorClaimRefs",
      "boundedProofRefs"
    ],
    label
  );
  return Object.freeze({
    contractClaimRef: nonEmptyString(
      requiredField(value, "contractClaimRef", label),
      `${label}.contractClaimRef`
    ),
    carrierClassification: oneOf(
      requiredField(value, "carrierClassification", label),
      TENANT_CONFORMANCE_CARRIER_CLASSIFICATIONS,
      `${label}.carrierClassification`
    ),
    applicableRuleIds: uniqueStrings(
      requiredField(value, "applicableRuleIds", label),
      `${label}.applicableRuleIds`,
      false
    ),
    causalPredecessorClaimRefs: uniqueStrings(
      requiredField(value, "causalPredecessorClaimRefs", label),
      `${label}.causalPredecessorClaimRefs`
    ),
    boundedProofRefs: uniqueStrings(
      requiredField(value, "boundedProofRefs", label),
      `${label}.boundedProofRefs`,
      false
    )
  });
}

function admitManifest(input: unknown): TenantConformanceManifest {
  const label = "TenantConformanceManifest";
  const value = closedObject(
    input,
    [
      "kind",
      "schemaId",
      "schemaVersion",
      "manifestId",
      "manifestVersion",
      "manifestDigest",
      "engineId",
      "engineVersion",
      "publicContractCatalog",
      "publicContractClaims",
      "capabilityClaims",
      "effectBindings",
      "enforcementClaims"
    ],
    label
  );
  return Object.freeze({
    kind: literal(
      requiredField(value, "kind", label),
      "abg_tenant_conformance_manifest",
      `${label}.kind`
    ),
    schemaId: literal(
      requiredField(value, "schemaId", label),
      TENANT_CONFORMANCE_MANIFEST_SCHEMA_ID,
      `${label}.schemaId`
    ),
    schemaVersion: literal(
      requiredField(value, "schemaVersion", label),
      TENANT_CONFORMANCE_MANIFEST_SCHEMA_VERSION,
      `${label}.schemaVersion`
    ),
    manifestId: nonEmptyString(
      requiredField(value, "manifestId", label),
      `${label}.manifestId`
    ),
    manifestVersion: exactSemVer(
      requiredField(value, "manifestVersion", label),
      `${label}.manifestVersion`
    ),
    manifestDigest: digest(
      requiredField(value, "manifestDigest", label),
      `${label}.manifestDigest`
    ),
    engineId: nonEmptyString(
      requiredField(value, "engineId", label),
      `${label}.engineId`
    ),
    engineVersion: exactSemVer(
      requiredField(value, "engineVersion", label),
      `${label}.engineVersion`
    ),
    publicContractCatalog: catalogBasis(
      requiredField(value, "publicContractCatalog", label),
      `${label}.publicContractCatalog`
    ),
    publicContractClaims: arrayOf(
      requiredField(value, "publicContractClaims", label),
      `${label}.publicContractClaims`,
      publicContractClaim
    ),
    capabilityClaims: arrayOf(
      requiredField(value, "capabilityClaims", label),
      `${label}.capabilityClaims`,
      capabilityClaim
    ),
    effectBindings: arrayOf(
      requiredField(value, "effectBindings", label),
      `${label}.effectBindings`,
      effectBinding
    ),
    enforcementClaims: arrayOf(
      requiredField(value, "enforcementClaims", label),
      `${label}.enforcementClaims`,
      enforcementClaim
    )
  });
}

function uniqueBy<T>(
  rows: readonly T[],
  identity: (row: T) => string,
  label: string
): void {
  const seen = new Set<string>();
  for (const row of rows) {
    const key = identity(row);
    if (seen.has(key)) {
      throw new TypeError(`${label}: duplicate identity ${JSON.stringify(key)}`);
    }
    seen.add(key);
  }
}

function exactCatalogRow(input: {
  readonly catalog: PublicContractCatalog;
  readonly claim: TenantPublicContractClaim;
}): PublicContractRow {
  const matches = input.catalog.rows.filter(
    (row) =>
      row.contractId === input.claim.contractId &&
      row.version === input.claim.contractVersion &&
      row.digest === input.claim.contractDigest
  );
  if (matches.length !== 1) {
    throw new TypeError(
      `TenantConformanceManifest public contract claim ${input.claim.claimRef} does not resolve exactly through ${input.catalog.catalogId}`
    );
  }
  return matches[0]!;
}

function assertCatalogBasis(input: {
  readonly manifest: TenantConformanceManifest;
  readonly catalog: PublicContractCatalog;
}): void {
  const actualCatalogDigest = stableSha256Digest(
    catalogDigestBasis(input.catalog)
  );
  if (input.catalog.catalogDigest !== actualCatalogDigest) {
    throw new TypeError(
      "PublicContractCatalog.catalogDigest does not match canonical catalog content"
    );
  }
  const basis = input.manifest.publicContractCatalog;
  if (
    basis.catalogId !== input.catalog.catalogId ||
    basis.catalogVersion !== input.catalog.catalogVersion ||
    basis.catalogDigest !== input.catalog.catalogDigest
  ) {
    throw new TypeError(
      "TenantConformanceManifest.publicContractCatalog does not match the admitted catalog basis"
    );
  }
}

function resolvePublicContractClaims(input: {
  readonly manifest: TenantConformanceManifest;
  readonly catalog: PublicContractCatalog;
}): readonly ResolvedTenantPublicContractClaim[] {
  if (input.manifest.publicContractClaims.length === 0) {
    throw new TypeError(
      "TenantConformanceManifest.publicContractClaims must not be empty"
    );
  }
  uniqueBy(
    input.manifest.publicContractClaims,
    (claim) => claim.claimRef,
    "TenantConformanceManifest.publicContractClaims"
  );
  uniqueBy(
    input.manifest.publicContractClaims,
    (claim) => `${claim.contractId}@${claim.contractVersion}`,
    "TenantConformanceManifest.publicContractClaims"
  );
  const resolved = input.manifest.publicContractClaims.map((claim) => {
    const row = exactCatalogRow({ catalog: input.catalog, claim });
    if (
      claim.contractId === TENANT_CONFORMANCE_MANIFEST_SCHEMA_ID &&
      row.contractKind !== "schema_asset"
    ) {
      throw new TypeError(
        `${TENANT_CONFORMANCE_MANIFEST_SCHEMA_ID} must resolve to a schema_asset catalog row`
      );
    }
    return Object.freeze({
      ...claim,
      catalogCapabilityRefs: Object.freeze([...row.capabilityRefs])
    });
  });
  const schemaClaims = resolved.filter(
    (claim) => claim.contractId === TENANT_CONFORMANCE_MANIFEST_SCHEMA_ID
  );
  if (schemaClaims.length !== 1) {
    throw new TypeError(
      `TenantConformanceManifest must claim exactly one ${TENANT_CONFORMANCE_MANIFEST_SCHEMA_ID} contract`
    );
  }
  return Object.freeze(resolved);
}

function resolveCapabilities(input: {
  readonly manifest: TenantConformanceManifest;
  readonly contractClaims: readonly ResolvedTenantPublicContractClaim[];
}): readonly ResolvedTenantCapabilityClaim[] {
  uniqueBy(
    input.manifest.capabilityClaims,
    (claim) => claim.capabilityId,
    "TenantConformanceManifest.capabilityClaims"
  );
  const contractsByRef = new Map(
    input.contractClaims.map((claim) => [claim.claimRef, claim] as const)
  );
  const capabilitiesById = new Map(
    input.manifest.capabilityClaims.map((claim) => [claim.capabilityId, claim] as const)
  );
  const resolved = input.manifest.capabilityClaims.map((claim) => {
    const owningContract = contractsByRef.get(claim.owningContractClaimRef);
    if (owningContract === undefined) {
      throw new TypeError(
        `Tenant capability ${claim.capabilityId} has no resolved owning contract claim`
      );
    }
    if (!owningContract.catalogCapabilityRefs.includes(claim.capabilityId)) {
      throw new TypeError(
        `Tenant capability ${claim.capabilityId} is absent from owning catalog contract ${owningContract.contractId}`
      );
    }
    for (const dependencyId of claim.dependentCapabilityIds) {
      if (!capabilitiesById.has(dependencyId)) {
        throw new TypeError(
          `Tenant capability ${claim.capabilityId} has unresolved dependency ${dependencyId}`
        );
      }
    }
    return Object.freeze({
      ...claim,
      owningContract
    });
  });
  return Object.freeze(resolved);
}

function assertEffectBindings(input: {
  readonly manifest: TenantConformanceManifest;
  readonly capabilityClaims: readonly ResolvedTenantCapabilityClaim[];
}): void {
  uniqueBy(
    input.manifest.effectBindings,
    (binding) => binding.effectRef,
    "TenantConformanceManifest.effectBindings"
  );
  const capabilities = new Set(
    input.capabilityClaims.map((claim) => claim.capabilityId)
  );
  for (const binding of input.manifest.effectBindings) {
    if (!capabilities.has(binding.capabilityId)) {
      throw new TypeError(
        `Tenant effect ${binding.effectRef} binds unresolved capability ${binding.capabilityId}`
      );
    }
  }
}

function assertEnforcementClaims(input: {
  readonly manifest: TenantConformanceManifest;
  readonly contractClaims: readonly ResolvedTenantPublicContractClaim[];
}): void {
  uniqueBy(
    input.manifest.enforcementClaims,
    (claim) => claim.contractClaimRef,
    "TenantConformanceManifest.enforcementClaims"
  );
  const contractRefs = new Set(input.contractClaims.map((claim) => claim.claimRef));
  if (input.manifest.enforcementClaims.length !== contractRefs.size) {
    throw new TypeError(
      "TenantConformanceManifest.enforcementClaims must cover every public contract claim exactly once"
    );
  }
  for (const claim of input.manifest.enforcementClaims) {
    if (!contractRefs.has(claim.contractClaimRef)) {
      throw new TypeError(
        `Tenant enforcement claim has unresolved contract ${claim.contractClaimRef}`
      );
    }
    const requiresPredecessor = ![
      "root",
      "declaration"
    ].includes(claim.carrierClassification);
    if (requiresPredecessor && claim.causalPredecessorClaimRefs.length === 0) {
      throw new TypeError(
        `Tenant enforcement claim ${claim.contractClaimRef} requires a causal predecessor`
      );
    }
    for (const predecessorRef of claim.causalPredecessorClaimRefs) {
      if (!contractRefs.has(predecessorRef) || predecessorRef === claim.contractClaimRef) {
        throw new TypeError(
          `Tenant enforcement claim ${claim.contractClaimRef} has invalid predecessor ${predecessorRef}`
        );
      }
    }
  }
}

export function tenantConformanceManifestDigest(
  manifest: TenantConformanceManifest
): `sha256:${string}` {
  return stableSha256Digest(manifestDigestBasis(manifest));
}

export function admitTenantConformanceManifest(
  rawManifest: unknown,
  publicContractCatalog: PublicContractCatalog
): AdmittedTenantConformanceManifest {
  const catalog = admitPublicContractCatalog(
    publicContractCatalog,
    "TenantConformanceManifest.publicContractCatalogAuthority"
  );
  const manifest = admitManifest(rawManifest);
  const actualManifestDigest = tenantConformanceManifestDigest(manifest);
  if (manifest.manifestDigest !== actualManifestDigest) {
    throw new TypeError(
      "TenantConformanceManifest.manifestDigest does not match canonical manifest content"
    );
  }
  assertCatalogBasis({ manifest, catalog });
  const resolvedPublicContractClaims = resolvePublicContractClaims({
    manifest,
    catalog
  });
  const resolvedCapabilityClaims = resolveCapabilities({
    manifest,
    contractClaims: resolvedPublicContractClaims
  });
  assertEffectBindings({ manifest, capabilityClaims: resolvedCapabilityClaims });
  assertEnforcementClaims({ manifest, contractClaims: resolvedPublicContractClaims });

  const admissionBasis = Object.freeze({
    manifestDigest: manifest.manifestDigest,
    catalogBasis: manifest.publicContractCatalog,
    resolvedPublicContractClaims,
    resolvedCapabilityClaims
  });
  const admissionDigest = stableSha256Digest(admissionBasis);
  return Object.freeze({
    kind: "admitted_tenant_conformance_manifest" as const,
    admissionRef:
      `admission://abg/tenant-conformance-manifest/${admissionDigest.slice("sha256:".length)}`,
    admissionDigest,
    manifest,
    catalogBasis: manifest.publicContractCatalog,
    resolvedPublicContractClaims,
    resolvedCapabilityClaims
  });
}
