import {
  admitTenantConformanceManifest,
  tenantConformanceManifestDigest
} from "../../build/semantic/code/src/app/m04/product_intake/tenant_conformance_manifest.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";

function publicContractRow(input) {
  const digest = stableSha256Digest({
    contractId: input.contractId,
    contractKind: input.contractKind,
    capabilityRefs: input.capabilityRefs
  });
  return Object.freeze({
    contractId: input.contractId,
    contractKind: input.contractKind,
    owningProductId: "abiogenesis",
    version: "1.0.0",
    digest,
    authorityRefs: Object.freeze(["REQ-P-PUBLIC-CONTRACTS"]),
    capabilityRefs: Object.freeze([...input.capabilityRefs]),
    nativeLocator: null,
    assetLocator: Object.freeze({
      kind: "asset",
      relativePath: `contracts/${input.fixtureId}/${input.contractId}.json`,
      schemaId: input.contractId,
      schemaVersion: "1.0.0",
      mediaType: "application/json",
      digest
    }),
    operationContract: null
  });
}

export function admittedTenantManifestFixture(input) {
  const effectRefs = input.effectRefs ?? [input.effectRef];
  const rows = Object.freeze([
    publicContractRow({
      fixtureId: input.fixtureId,
      contractId: "abg.schema.tenant-conformance-manifest",
      contractKind: "schema_asset",
      capabilityRefs: []
    }),
    publicContractRow({
      fixtureId: input.fixtureId,
      contractId: input.capabilityContractId,
      contractKind: "capability",
      capabilityRefs: [input.capabilityId]
    })
  ]);
  const catalogBasis = Object.freeze({
    kind: "abg_public_contract_catalog",
    schemaVersion: 1,
    catalogId: `abg.public-contract-catalog.${input.fixtureId}`,
    catalogVersion: "1.0.0",
    catalogSchemaPath: "contracts/public-contract-catalog.schema.json",
    catalogSchemaDigest: stableSha256Digest(
      `${input.fixtureId}-catalog-schema`
    ),
    profile: "abg-5-ds1",
    rows
  });
  const catalog = Object.freeze({
    ...catalogBasis,
    catalogDigest: stableSha256Digest(catalogBasis)
  });
  const schemaClaim = Object.freeze({
    claimRef: `claim://${input.fixtureId}/tenant-manifest-schema`,
    contractId: rows[0].contractId,
    contractVersion: rows[0].version,
    contractDigest: rows[0].digest
  });
  const capabilityClaim = Object.freeze({
    claimRef: `claim://${input.fixtureId}/capability-contract`,
    contractId: rows[1].contractId,
    contractVersion: rows[1].version,
    contractDigest: rows[1].digest
  });
  const capabilityDefinitionGraphBasis = Object.freeze({
    kind: "abg_capability_definition_graph",
    graphId: `capability-definition-graph://${input.fixtureId}`,
    graphVersion: "1.0.0",
    definitions: Object.freeze([Object.freeze({
      capabilityId: input.capabilityId,
      requiredContractIds: Object.freeze([input.capabilityContractId]),
      dependentCapabilityIds: Object.freeze([]),
      effectRefs: Object.freeze([...effectRefs])
    })])
  });
  const basis = Object.freeze({
    kind: "abg_tenant_conformance_manifest",
    schemaId: "abg.schema.tenant-conformance-manifest",
    schemaVersion: "1.0.0",
    manifestId: `abg.tenant-conformance.${input.fixtureId}`,
    manifestVersion: "1.0.0",
    engineId: `abg.engine.${input.fixtureId}`,
    engineVersion: input.engineVersion ?? "5.0.0",
    capabilityDefinitionGraph: Object.freeze({
      graphId: capabilityDefinitionGraphBasis.graphId,
      graphVersion: capabilityDefinitionGraphBasis.graphVersion,
      graphDigest: stableSha256Digest(capabilityDefinitionGraphBasis)
    }),
    publicContractCatalog: Object.freeze({
      catalogId: catalog.catalogId,
      catalogVersion: catalog.catalogVersion,
      catalogDigest: catalog.catalogDigest
    }),
    publicContractClaims: Object.freeze([schemaClaim, capabilityClaim]),
    capabilityClaims: Object.freeze([
      Object.freeze({
        capabilityId: input.capabilityId,
        owningContractClaimRef: capabilityClaim.claimRef,
        supportedDisposition: "supported",
        dependentCapabilityIds: Object.freeze([])
      })
    ]),
    effectBindings: Object.freeze(
      effectRefs.map((effectRef) => Object.freeze({
        effectRef,
        capabilityId: input.capabilityId
      }))
    ),
    enforcementClaims: Object.freeze([
      Object.freeze({
        contractClaimRef: schemaClaim.claimRef,
        carrierClassification: "declaration",
        applicableRuleIds: Object.freeze([
          "REQ-M-GTL3-CAPABILITY-001"
        ]),
        causalPredecessorClaimRefs: Object.freeze([]),
        boundedProofRefs: Object.freeze([
          `proof://${input.fixtureId}/manifest-schema`
        ])
      }),
      Object.freeze({
        contractClaimRef: capabilityClaim.claimRef,
        carrierClassification: "declaration",
        applicableRuleIds: Object.freeze([
          "REQ-M-GTL3-CAPABILITY-015"
        ]),
        causalPredecessorClaimRefs: Object.freeze([]),
        boundedProofRefs: Object.freeze([
          `proof://${input.fixtureId}/capability-contract`
        ])
      })
    ])
  });
  const manifest = Object.freeze({
    ...basis,
    manifestDigest: tenantConformanceManifestDigest({
      ...basis,
      manifestDigest: stableSha256Digest("placeholder")
    })
  });
  return admitTenantConformanceManifest(manifest, catalog);
}
