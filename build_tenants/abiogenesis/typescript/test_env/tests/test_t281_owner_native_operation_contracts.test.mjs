import assert from "node:assert/strict";
import test from "node:test";

import * as v from "valibot";

import {
  CATALOG_OPERATION_NATIVE_CHECK_REGISTRY,
  CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES
} from "../../build/semantic/code/src/abg/m03/contracts/catalog_operation_contracts.js";
import { GTL_CONFORMANCE_OPERATION_NATIVE_CONTRACT_SOURCES } from "../../build/semantic/code/src/abg/m03/contracts/gtl_conformance_operation_contracts.js";
import { RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES } from "../../build/semantic/code/src/abg/m03/contracts/runtime_authoring_operation_contracts.js";
import {
  EXACT_CANDIDATE_QUALIFICATION_CONTRACT_FAMILY,
  EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA,
  EXACT_CANDIDATE_QUALIFICATION_NATIVE_CHECK_REGISTRY,
  EXACT_CANDIDATE_QUALIFICATION_VERDICT_SCHEMA,
  FINAL_TAP_DELTA_SCHEMA,
  QUALIFICATION_GATE_RESULT_VECTOR_SCHEMA,
  QUALIFICATION_LAW_BASIS_SCHEMA,
  RELEASE_OPERATION_NATIVE_CONTRACT_SOURCES
} from "../../build/semantic/code/src/qualification/m05/exact_candidate_release_operation_contracts.js";
import {
  projectCanonicalNativeJsonSchema,
  resolveSemanticBuildNativeSchemaSource
} from "../../build/semantic/code/src/shared/validation/canonical_native_schema_projector.js";

const DIGEST = `sha256:${"1".repeat(64)}`;
const DIGEST_2 = `sha256:${"2".repeat(64)}`;

const OWNER_SOURCE_FAMILIES = [
  CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES,
  RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES,
  GTL_CONFORMANCE_OPERATION_NATIVE_CONTRACT_SOURCES,
  RELEASE_OPERATION_NATIVE_CONTRACT_SOURCES
];

const SEMANTIC_OWNER_BASIS_BY_OPERATION = new Map([
  [
    "abg.operation.catalog.admit",
    [
      "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-051A",
      "sha256:89cf57e14f74cd4ea433c277f88d89a5972e49b421801878d44b7481801c022f"
    ]
  ],
  [
    "abg.operation.catalog.view",
    [
      "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-053",
      "sha256:89cf57e14f74cd4ea433c277f88d89a5972e49b421801878d44b7481801c022f"
    ]
  ],
  [
    "abg.operation.catalog.apply",
    [
      "specification/requirements/product/REQ-P-CATALOG.md#REQ-P-CATALOG-030",
      "sha256:af273d059574c4e8e19a9599005956683372db88ba0d8e57d5c5b14a58ff3c84"
    ]
  ],
  [
    "abg.operation.witness.admit",
    [
      "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-035",
      "sha256:89cf57e14f74cd4ea433c277f88d89a5972e49b421801878d44b7481801c022f"
    ]
  ],
  [
    "abg.operation.tuning.transition",
    [
      "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-037",
      "sha256:89cf57e14f74cd4ea433c277f88d89a5972e49b421801878d44b7481801c022f"
    ]
  ],
  [
    "abg.operation.conformance.evaluate",
    [
      "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-038",
      "sha256:89cf57e14f74cd4ea433c277f88d89a5972e49b421801878d44b7481801c022f"
    ]
  ],
  [
    "abg.operation.release.snapshot",
    [
      "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-059",
      "sha256:89cf57e14f74cd4ea433c277f88d89a5972e49b421801878d44b7481801c022f"
    ]
  ]
]);

function collectSources(value, output = []) {
  if (value?.kind === "owner_native_operation_contract_source") {
    output.push(value);
    return output;
  }
  if (typeof value !== "object" || value === null) {
    return output;
  }
  for (const member of Object.values(value)) {
    collectSources(member, output);
  }
  return output;
}

function assertDeepFrozen(value, seen = new Set(), path = "root") {
  if (typeof value !== "object" || value === null || seen.has(value)) {
    return;
  }
  seen.add(value);
  assert.equal(Object.isFrozen(value), true, `${path} is frozen`);
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor !== undefined && "value" in descriptor) {
      assertDeepFrozen(descriptor.value, seen, `${path}.${String(key)}`);
    }
  }
}

function sourceFor(operationId, variant, slot = "request") {
  const source = collectSources(OWNER_SOURCE_FAMILIES).find(
    (candidate) =>
      candidate.authority.subject.operationId === operationId &&
      candidate.authority.subject.variant === variant &&
      candidate.authority.subject.slot === slot
  );
  assert.ok(source, `${operationId}(${variant}).${slot} source exists`);
  return source;
}

function parseRequest(operationId, variant, input) {
  const source = sourceFor(operationId, variant);
  assert.doesNotThrow(() => v.parse(source.schema, input));
  assert.throws(() => v.parse(source.schema, { ...input, undeclared: true }));
}

function parseResult(operationId, variant, input) {
  const source = sourceFor(operationId, variant, "result");
  assert.doesNotThrow(() => v.parse(source.schema, input));
  assert.throws(() => v.parse(source.schema, { ...input, undeclared: true }));
}

const context = {
  basisRef: "basis:1",
  basisDigest: DIGEST,
  workspaceRef: "workspace:1",
  runRef: "run:1",
  segmentRef: "segment:1"
};

const witnessCommon = {
  actorRef: "actor:1",
  subjectRef: "subject:1",
  subjectDigest: DIGEST,
  context,
  evidenceRefs: ["evidence:1"],
  provenanceRefs: ["provenance:1"]
};

const lawBasis = {
  kind: "qualification_law_basis",
  ref: "qualification-law:1",
  digest: DIGEST,
  methodVersion: "5.0.0",
  ruleCatalogVersion: "5.0.0",
  sources: [{ ref: "source:method", digest: DIGEST }]
};

const candidateCommon = {
  kind: "exact_candidate_qualification_basis",
  basisRef: "qualification-basis:1",
  basisDigest: DIGEST,
  sourceRef: "source:abg",
  sourceCommit: "0123456789abcdef",
  artifactRef: "artifact:abg",
  artifactContentDigest: DIGEST,
  installArtifactDigest: DIGEST_2,
  productToolchainManifest: { ref: "manifest:toolchain", digest: DIGEST },
  installedProduct: { ref: "installed-product:abg", digest: DIGEST },
  installManifest: { ref: "manifest:install", digest: DIGEST },
  workspaceBinding: { ref: "workspace-binding:1", digest: DIGEST },
  tenantConformanceManifest: { ref: "manifest:tenant", digest: DIGEST },
  frozenInventoryDigest: DIGEST,
  qualificationLawBasis: lawBasis
};

const finalTapDelta = {
  kind: "final_tap_delta",
  ref: "final-tap-delta:1",
  digest: DIGEST,
  acceptedRcRef: "release-cut:5.0.0-rc.1",
  acceptedRcDigest: DIGEST,
  assignedFinalVersion: "5.0.0",
  releaseAssets: [
    { ref: "artifact:package", digest: DIGEST, kind: "package_tarball" }
  ]
};

const qualificationGateResultVector = {
  kind: "qualification_gate_result_vector",
  vectorRef: "qualification-vector:1",
  vectorDigest: DIGEST,
  qualificationBasisRef: "qualification-basis:1",
  qualificationBasisDigest: DIGEST,
  qualificationLawBasisRef: "qualification-law:1",
  qualificationLawBasisDigest: DIGEST,
  frozenInventoryDigest: DIGEST,
  mandatoryGateRefs: ["qualification-gate:semantic", "qualification-gate:installed"],
  results: [
    {
      ordinal: 0,
      gateRef: "qualification-gate:semantic",
      qualificationBasisRef: "qualification-basis:1",
      qualificationBasisDigest: DIGEST,
      qualificationLawBasisRef: "qualification-law:1",
      qualificationLawBasisDigest: DIGEST,
      assessmentRef: "assessment:semantic",
      assessmentDigest: DIGEST,
      disposition: "green",
      evidence: [{ ref: "evidence:semantic", digest: DIGEST }],
      bypassRefs: []
    },
    {
      ordinal: 1,
      gateRef: "qualification-gate:installed",
      qualificationBasisRef: "qualification-basis:1",
      qualificationBasisDigest: DIGEST,
      qualificationLawBasisRef: "qualification-law:1",
      qualificationLawBasisDigest: DIGEST,
      assessmentRef: "assessment:installed",
      assessmentDigest: DIGEST,
      disposition: "green",
      evidence: [{ ref: "evidence:installed", digest: DIGEST }],
      bypassRefs: []
    }
  ]
};

const greenQualificationVerdict = {
  kind: "exact_candidate_qualification_verdict",
  verdictRef: "qualification-verdict:1",
  verdictDigest: DIGEST,
  basisRef: "qualification-basis:1",
  basisDigest: DIGEST,
  qualificationLawBasisRef: "qualification-law:1",
  qualificationLawBasisDigest: DIGEST,
  qualificationGateResultVector,
  disposition: "green",
  bypassRefs: []
};

test("T-281 owner sources resolve 16 exact definition keys and 48 native slots", async () => {
  const sources = collectSources(OWNER_SOURCE_FAMILIES);
  assert.equal(sources.length, 48);
  assert.equal(
    new Set(
      sources.map(
        (source) =>
          `${source.authority.subject.operationId}(${source.authority.subject.variant})`
      )
    ).size,
    16
  );

  for (const family of OWNER_SOURCE_FAMILIES) {
    assertDeepFrozen(family);
  }
  for (const source of sources) {
    assert.equal(source.sourceLocator.memberPath.at(-1), "schema");
    assert.equal("lawBasis" in source.authority, false);
    assert.equal("contractShapeBasis" in source.authority, false);
    const expectedSemanticBasis = SEMANTIC_OWNER_BASIS_BY_OPERATION.get(
      source.authority.subject.operationId
    );
    assert.ok(expectedSemanticBasis);
    assert.deepEqual(source.authority.semanticOwnerBasis, {
      ref: expectedSemanticBasis[0],
      digest: expectedSemanticBasis[1]
    });
    const module = await import(
      new URL(`../../build/semantic/${source.sourceLocator.modulePath}`, import.meta.url)
        .href
    );
    const resolved = source.sourceLocator.memberPath.reduce(
      (value, member) => Reflect.get(value, member),
      Reflect.get(module, source.sourceLocator.exportName)
    );
    assert.equal(resolved, source.schema);
    const namedCheckRegistry =
      source.authority.subject.operationId === "abg.operation.catalog.admit"
        ? CATALOG_OPERATION_NATIVE_CHECK_REGISTRY
        : source.authority.subject.operationId ===
            "abg.operation.release.snapshot"
          ? EXACT_CANDIDATE_QUALIFICATION_NATIVE_CHECK_REGISTRY
          : undefined;
    assert.doesNotThrow(() =>
      projectCanonicalNativeJsonSchema(source.schema, {
        namedCheckRegistry
      })
    );
  }
});

test("witness public variants resolve through identifier-safe private member paths", async () => {
  const witnessSources =
    RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES.witness_admit;
  const repairedVariants = [
    ["hygiene-stamp", "hygiene_stamp"],
    ["run-resumed", "run_resumed"],
    ["run-stopped", "run_stopped"]
  ];

  for (const [publicVariant, memberKey] of repairedVariants) {
    assert.equal(Object.hasOwn(witnessSources, publicVariant), false);
    assert.equal(Object.hasOwn(witnessSources, memberKey), true);
    const contractSet = witnessSources[memberKey];
    for (const [slot, source] of Object.entries(contractSet)) {
      assert.equal(source.authority.subject.variant, publicVariant);
      assert.deepEqual(source.sourceLocator.memberPath, [
        "witness_admit",
        memberKey,
        slot,
        "schema"
      ]);
      await assert.doesNotReject(() =>
        resolveSemanticBuildNativeSchemaSource(source)
      );
    }
  }
});

test("catalog requests are strict and variant-indexed", () => {
  parseRequest("abg.operation.catalog.admit", "admit", {
    workspaceBindingRef: "workspace-binding:1",
    workspaceBindingDigest: DIGEST,
    descriptorRefs: ["descriptor:1"],
    contributionManifestRefs: ["contribution:1"],
    resolvedLockRef: "lock:1",
    resolvedLockDigest: DIGEST
  });
  assert.throws(() =>
    v.parse(sourceFor("abg.operation.catalog.admit", "admit").schema, {
      descriptorRefs: ["descriptor:1"],
      contributionManifestRefs: ["contribution:1"],
      resolvedLockRef: "lock:1",
      resolvedLockDigest: DIGEST
    })
  );
  parseRequest("abg.operation.catalog.view", "allowlist", {
    allowlist: ["graph-function:1"]
  });
  for (const variant of ["node_type", "overlay"]) {
    parseRequest("abg.operation.catalog.apply", variant, {
      declarationRef: `declaration:${variant}`,
      declarationDigest: DIGEST,
      targetRef: "target:1",
      applicationBasisRef: "application-basis:1",
      applicationBasisDigest: DIGEST
    });
  }
});

test("catalog admission rows are a contradiction-free typed disposition sum", () => {
  const common = {
    kind: "catalog_row_disposition",
    entryRef: "catalog-entry:1",
    declarationRef: "declaration:1",
    entryKind: "graph_function"
  };
  parseResult("abg.operation.catalog.admit", "admit", {
    catalogRef: "catalog:1",
    catalogDigest: DIGEST,
    dispositions: [{ ...common, disposition: "admitted" }],
    evidenceRefs: ["evidence:1"]
  });
  for (const disposition of [
    "rejected",
    "incompatible",
    "conflicting",
    "unready",
    "unresolved"
  ]) {
    parseResult("abg.operation.catalog.admit", "admit", {
      catalogRef: "catalog:1",
      catalogDigest: DIGEST,
      dispositions: [
        {
          ...common,
          disposition,
          reason: `${disposition} row`,
          residualRefs: ["residual:1"]
        }
      ],
      evidenceRefs: ["evidence:1"]
    });
  }
  const schema = sourceFor(
    "abg.operation.catalog.admit",
    "admit",
    "result"
  ).schema;
  assert.throws(() =>
    v.parse(schema, {
      catalogRef: "catalog:1",
      catalogDigest: DIGEST,
      dispositions: [
        {
          ...common,
          disposition: "admitted",
          reason: "contradictory rejection reason",
          residualRefs: []
        }
      ],
      evidenceRefs: []
    })
  );
  assert.throws(() =>
    v.parse(schema, {
      catalogRef: "catalog:1",
      catalogDigest: DIGEST,
      dispositions: [{ ...common, disposition: "rejected" }],
      evidenceRefs: []
    })
  );
  assert.throws(() =>
    v.parse(schema, {
      catalogRef: "catalog:1",
      catalogDigest: DIGEST,
      dispositions: [
        { ...common, disposition: "admitted" },
        {
          ...common,
          disposition: "rejected",
          reason: "same entry cannot be rejected too",
          residualRefs: ["residual:1"]
        }
      ],
      evidenceRefs: []
    })
  );
});

test("witness packets share one envelope and enforce variant payload relations", () => {
  const rows = {
    reprice: {
      declarationRef: "declaration:1",
      beforeDigest: DIGEST,
      afterDigest: DIGEST_2,
      changeClass: "requirement_reprice",
      owningTicketRef: "ticket:T-1",
      reason: "authority changed"
    },
    attest: { scope: "replay_chain" },
    "hygiene-stamp": {
      observations: [
        { artifactRef: "artifact:1", observedDigest: DIGEST, copyOutRef: null }
      ]
    },
    intake: {
      haltDiagnosisRef: "halt-diagnosis:1",
      owner: "abg.m03",
      changeClass: "realization_refactor",
      reEntryPoint: "realization",
      summary: "typed gap"
    },
    "run-resumed": {
      reasonKind: "operator_resume",
      reasonDetail: "resume admitted work"
    },
    "run-stopped": {
      reasonKind: "operator_stop",
      reasonDetail: "stop at boundary"
    }
  };
  for (const [variant, payload] of Object.entries(rows)) {
    parseRequest("abg.operation.witness.admit", variant, {
      ...witnessCommon,
      payload
    });
  }
  assert.throws(() =>
    v.parse(sourceFor("abg.operation.witness.admit", "reprice").schema, {
      ...witnessCommon,
      payload: rows["run-resumed"]
    })
  );
});

test("tuning transitions preserve contract-bound content and closed authority", () => {
  parseRequest("abg.operation.tuning.transition", "propose", {
    draftContentContractRef: "contract:tuning-draft",
    draftContentContractDigest: DIGEST,
    draftContent: { proposal: "calibrate" },
    proposalKind: "calibration",
    authority: { kind: "actor", actorRef: "actor:1" },
    subjectBasis: { ref: "basis:1", digest: DIGEST },
    rationale: "observed drift",
    evidenceRefs: ["evidence:1"]
  });
  for (const variant of ["ratify", "reject"]) {
    parseRequest("abg.operation.tuning.transition", variant, {
      draftRef: "tuning-draft:1",
      draftVersion: 1,
      draftDigest: DIGEST,
      authority:
        variant === "ratify"
          ? { kind: "policy", policyRef: "policy:auto-ratify" }
          : { kind: "actor", actorRef: "actor:1" },
      subjectBasis: { ref: "basis:1", digest: DIGEST },
      rationale: `${variant} after review`,
      evidenceRefs: ["evidence:1"]
    });
  }
});

test("GTL conformance inventory is closed and content-addressed", () => {
  parseRequest("abg.operation.conformance.evaluate", "gtl_program", {
    programRef: "gtl-program:1",
    programDigest: DIGEST,
    conformanceLawRef: "law:gtl-program",
    conformanceLawDigest: DIGEST,
    inventoryBasis: {
      kind: "declared_inventory",
      inventory: [{ ref: "inventory:1", digest: DIGEST }]
    }
  });
  assert.throws(() =>
    v.parse(sourceFor("abg.operation.conformance.evaluate", "gtl_program").schema, {
      programRef: "gtl-program:1",
      programDigest: DIGEST,
      conformanceLawRef: "law:gtl-program",
      conformanceLawDigest: DIGEST,
      inventoryBasis: {
        kind: "declared_inventory",
        inventory: [
          { ref: "inventory:1", digest: DIGEST },
          { ref: "inventory:1", digest: DIGEST_2 }
        ]
      }
    })
  );
});

test("exact-candidate schemas make release authority and final-only delta structural", () => {
  for (const schema of [
    QUALIFICATION_LAW_BASIS_SCHEMA,
    EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA,
    QUALIFICATION_GATE_RESULT_VECTOR_SCHEMA,
    EXACT_CANDIDATE_QUALIFICATION_VERDICT_SCHEMA,
    FINAL_TAP_DELTA_SCHEMA
  ]) {
    assertDeepFrozen(schema);
    assert.doesNotThrow(() =>
      projectCanonicalNativeJsonSchema(schema, {
        namedCheckRegistry:
          EXACT_CANDIDATE_QUALIFICATION_NATIVE_CHECK_REGISTRY
      })
    );
  }
  assertDeepFrozen(EXACT_CANDIDATE_QUALIFICATION_CONTRACT_FAMILY);
  assert.equal(
    EXACT_CANDIDATE_QUALIFICATION_CONTRACT_FAMILY.qualificationLawBasis,
    QUALIFICATION_LAW_BASIS_SCHEMA
  );
  assert.equal(
    EXACT_CANDIDATE_QUALIFICATION_CONTRACT_FAMILY.qualificationBasis,
    EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA
  );
  assert.equal(
    EXACT_CANDIDATE_QUALIFICATION_CONTRACT_FAMILY.qualificationGateResultVector,
    QUALIFICATION_GATE_RESULT_VECTOR_SCHEMA
  );
  assert.equal(
    EXACT_CANDIDATE_QUALIFICATION_CONTRACT_FAMILY.qualificationVerdict,
    EXACT_CANDIDATE_QUALIFICATION_VERDICT_SCHEMA
  );
  assert.equal(
    EXACT_CANDIDATE_QUALIFICATION_CONTRACT_FAMILY.finalTapDelta,
    FINAL_TAP_DELTA_SCHEMA
  );
  assert.doesNotThrow(() => v.parse(QUALIFICATION_LAW_BASIS_SCHEMA, lawBasis));
  assert.doesNotThrow(() => v.parse(FINAL_TAP_DELTA_SCHEMA, finalTapDelta));
  assert.throws(() =>
    v.parse(FINAL_TAP_DELTA_SCHEMA, {
      ...finalTapDelta,
      productBehaviorDigest: DIGEST
    })
  );
  assert.throws(() =>
    v.parse(FINAL_TAP_DELTA_SCHEMA, {
      ...finalTapDelta,
      releaseAssets: [
        {
          ref: "artifact:snapshot-manifest",
          digest: DIGEST,
          kind: "snapshot_manifest"
        }
      ]
    })
  );

  assert.doesNotThrow(() =>
    v.parse(EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA, {
      ...candidateCommon,
      subjectKind: "pre_rc_candidate",
      prospectivePublishedRcIdentity: "release:5.0.0-rc.1",
      prospectivePublishedRcVersion: "5.0.0-rc.1"
    })
  );
  assert.doesNotThrow(() =>
    v.parse(EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA, {
      ...candidateCommon,
      subjectKind: "final_tap_candidate",
      prospectiveFinalIdentity: "release:5.0.0",
      prospectiveFinalVersion: "5.0.0",
      acceptedRcRef: "release-cut:5.0.0-rc.1",
      acceptedRcDigest: DIGEST,
      installedRcQualificationBasisRef: "qualification-basis:installed-rc",
      installedRcQualificationBasisDigest: DIGEST,
      installedRcGreenVerdictRef: "qualification-verdict:installed-rc",
      installedRcGreenVerdictDigest: DIGEST,
      finalTapDelta
    })
  );
  assert.throws(() =>
    v.parse(EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA, {
      ...candidateCommon,
      subjectKind: "final_tap_candidate",
      prospectiveFinalIdentity: "release:5.0.0",
      prospectiveFinalVersion: "5.0.0",
      acceptedRcRef: "release-cut:5.0.0-rc.2",
      acceptedRcDigest: DIGEST,
      installedRcQualificationBasisRef: "qualification-basis:installed-rc",
      installedRcQualificationBasisDigest: DIGEST,
      installedRcGreenVerdictRef: "qualification-verdict:installed-rc",
      installedRcGreenVerdictDigest: DIGEST,
      finalTapDelta
    })
  );
  assert.throws(() =>
    v.parse(EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA, {
      ...candidateCommon,
      subjectKind: "final_tap_candidate",
      prospectiveFinalIdentity: "release:5.0.0",
      prospectiveFinalVersion: "5.0.0",
      acceptedRcRef: "release-cut:5.0.0-rc.1",
      acceptedRcDigest: DIGEST_2,
      installedRcQualificationBasisRef: "qualification-basis:installed-rc",
      installedRcQualificationBasisDigest: DIGEST,
      installedRcGreenVerdictRef: "qualification-verdict:installed-rc",
      installedRcGreenVerdictDigest: DIGEST,
      finalTapDelta
    })
  );
  assert.throws(() =>
    v.parse(EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA, {
      ...candidateCommon,
      subjectKind: "final_tap_candidate",
      prospectiveFinalIdentity: "release:5.0.1",
      prospectiveFinalVersion: "5.0.1",
      acceptedRcRef: "release-cut:5.0.0-rc.1",
      acceptedRcDigest: DIGEST,
      installedRcQualificationBasisRef: "qualification-basis:installed-rc",
      installedRcQualificationBasisDigest: DIGEST,
      installedRcGreenVerdictRef: "qualification-verdict:installed-rc",
      installedRcGreenVerdictDigest: DIGEST,
      finalTapDelta
    })
  );
  assert.doesNotThrow(() =>
    v.parse(
      QUALIFICATION_GATE_RESULT_VECTOR_SCHEMA,
      qualificationGateResultVector
    )
  );
  assert.throws(() =>
    v.parse(QUALIFICATION_GATE_RESULT_VECTOR_SCHEMA, {
      ...qualificationGateResultVector,
      results: qualificationGateResultVector.results.map((result, index) => ({
        ...result,
        ordinal: index + 1
      }))
    })
  );
  const withFirstResult = (overrides) => ({
    ...qualificationGateResultVector,
    results: qualificationGateResultVector.results.map((result, index) =>
      index === 0 ? { ...result, ...overrides } : result
    )
  });
  assert.doesNotThrow(() =>
    v.parse(
      QUALIFICATION_GATE_RESULT_VECTOR_SCHEMA,
      withFirstResult({
        disposition: "blocked",
        evidence: [],
        bypassRefs: ["bypass:1"]
      })
    )
  );
  assert.throws(() =>
    v.parse(
      QUALIFICATION_GATE_RESULT_VECTOR_SCHEMA,
      withFirstResult({
        disposition: "green",
        evidence: [],
        bypassRefs: ["bypass:1"]
      })
    )
  );
  assert.throws(() =>
    v.parse(
      QUALIFICATION_GATE_RESULT_VECTOR_SCHEMA,
      withFirstResult({
        disposition: "blocked",
        bypassRefs: ["bypass:1"]
      })
    )
  );
  assert.throws(() =>
    v.parse(
      QUALIFICATION_GATE_RESULT_VECTOR_SCHEMA,
      withFirstResult({ evidence: [], bypassRefs: [] })
    )
  );
  assert.doesNotThrow(() =>
    v.parse(
      EXACT_CANDIDATE_QUALIFICATION_VERDICT_SCHEMA,
      greenQualificationVerdict
    )
  );
  assert.throws(() =>
    v.parse(EXACT_CANDIDATE_QUALIFICATION_VERDICT_SCHEMA, {
      ...greenQualificationVerdict,
      qualificationGateResultVector: {
        ...qualificationGateResultVector,
        results: qualificationGateResultVector.results.map((result, index) =>
          index === 0 ? { ...result, disposition: "red" } : result
        )
      }
    })
  );
  assert.throws(() =>
    v.parse(EXACT_CANDIDATE_QUALIFICATION_VERDICT_SCHEMA, {
      ...greenQualificationVerdict,
      qualificationGateResultVector: {
        ...qualificationGateResultVector,
        results: qualificationGateResultVector.results.map((result, index) =>
          index === 0
            ? {
                ...result,
                disposition: "blocked",
                evidence: [],
                bypassRefs: ["bypass:1"]
              }
            : result
        )
      },
      bypassRefs: ["bypass:1"]
    })
  );
});

test("release requests distinguish published RC from final tap", () => {
  const common = {
    qualificationBasisRef: "qualification-basis:1",
    qualificationBasisDigest: DIGEST,
    qualificationLawBasisRef: "qualification-law:1",
    qualificationLawBasisDigest: DIGEST,
    qualificationVerdictRef: "qualification-verdict:1",
    qualificationVerdictDigest: DIGEST,
    requestedReleaseIdentity: "release:abiogenesis",
    requestedReleaseVersion: "5.0.0-rc.1"
  };
  parseRequest("abg.operation.release.snapshot", "published_rc", {
    ...common
  });
  parseRequest("abg.operation.release.snapshot", "tapped_release", {
    ...common,
    requestedReleaseVersion: "5.0.0",
    acceptedRcRef: "release-cut:5.0.0-rc.1",
    acceptedRcDigest: DIGEST,
    installedRcQualificationBasisRef: "qualification-basis:installed-rc",
    installedRcQualificationBasisDigest: DIGEST,
    installedRcGreenVerdictRef: "qualification-verdict:installed-rc",
    installedRcGreenVerdictDigest: DIGEST,
    finalTapDeltaRef: "final-tap-delta:1",
    finalTapDeltaDigest: DIGEST
  });
  const releaseSuccess = {
    releaseCutRef: "release-cut:1",
    releaseCutDigest: DIGEST,
    packageIdentity: "package:abiogenesis",
    packageVersion: "5.0.0",
    sourceRef: "source:abiogenesis",
    sourceCommit: "0123456789abcdef",
    buildCommand: "npm run build:host",
    packCommand: "npm pack",
    artifacts: {
      packageTarball: {
        ref: "artifact:package",
        digest: DIGEST,
        kind: "package_tarball"
      },
      checksumFile: {
        ref: "artifact:checksums",
        digest: DIGEST,
        kind: "checksum_file"
      },
      releaseNote: null
    },
    snapshotManifestRef: "manifest:release-snapshot",
    snapshotManifestDigest: DIGEST,
    verificationFacts: [{ ref: "verification:pack", digest: DIGEST }],
    provenanceRefs: ["provenance:1"],
    qualificationDisposition: "green",
    residualRefs: []
  };
  for (const variant of ["published_rc", "tapped_release"]) {
    parseResult("abg.operation.release.snapshot", variant, {
      ...releaseSuccess,
      releaseCutRef: `release-cut:${variant}`
    });
  }
  const releaseResultSchema = sourceFor(
    "abg.operation.release.snapshot",
    "published_rc",
    "result"
  ).schema;
  assert.throws(() =>
    v.parse(releaseResultSchema, {
      ...releaseSuccess,
      artifacts: {
        checksumFile: releaseSuccess.artifacts.checksumFile,
        releaseNote: null
      }
    })
  );
  const releaseSuccessWithNote = {
    ...releaseSuccess,
    artifacts: {
      ...releaseSuccess.artifacts,
      releaseNote: {
        ref: "artifact:release-note",
        digest: DIGEST,
        kind: "release_note"
      }
    }
  };
  assert.doesNotThrow(() =>
    v.parse(releaseResultSchema, releaseSuccessWithNote)
  );
  for (const [label, candidate] of [
    [
      "release note aliases package tarball",
      {
        ...releaseSuccessWithNote,
        artifacts: {
          ...releaseSuccessWithNote.artifacts,
          releaseNote: {
            ...releaseSuccessWithNote.artifacts.releaseNote,
            ref: releaseSuccessWithNote.artifacts.packageTarball.ref
          }
        }
      }
    ],
    [
      "release note aliases checksum file",
      {
        ...releaseSuccessWithNote,
        artifacts: {
          ...releaseSuccessWithNote.artifacts,
          releaseNote: {
            ...releaseSuccessWithNote.artifacts.releaseNote,
            ref: releaseSuccessWithNote.artifacts.checksumFile.ref
          }
        }
      }
    ],
    [
      "snapshot manifest aliases package tarball",
      {
        ...releaseSuccessWithNote,
        snapshotManifestRef:
          releaseSuccessWithNote.artifacts.packageTarball.ref
      }
    ],
    [
      "snapshot manifest aliases checksum file",
      {
        ...releaseSuccessWithNote,
        snapshotManifestRef: releaseSuccessWithNote.artifacts.checksumFile.ref
      }
    ],
    [
      "snapshot manifest aliases release note",
      {
        ...releaseSuccessWithNote,
        snapshotManifestRef: releaseSuccessWithNote.artifacts.releaseNote.ref
      }
    ]
  ]) {
    assert.throws(
      () => v.parse(releaseResultSchema, candidate),
      undefined,
      label
    );
  }
  assert.throws(() =>
    v.parse(releaseResultSchema, {
      ...releaseSuccess,
      artifacts: {
        packageTarball: releaseSuccess.artifacts.packageTarball,
        releaseNote: null
      }
    })
  );
  assert.throws(() =>
    v.parse(releaseResultSchema, {
      ...releaseSuccess,
      artifacts: {
        ...releaseSuccess.artifacts,
        unsupportedArtifact: {
          ref: "artifact:unsupported",
          digest: DIGEST,
          kind: "unsupported"
        }
      }
    })
  );
  assert.throws(() =>
    v.parse(releaseResultSchema, {
      ...releaseSuccess,
      artifacts: {
        ...releaseSuccess.artifacts,
        checksumFile: {
          ...releaseSuccess.artifacts.checksumFile,
          ref: releaseSuccess.artifacts.packageTarball.ref
        }
      }
    })
  );
  assert.throws(() =>
    v.parse(releaseResultSchema, {
      ...releaseSuccess,
      provenanceRefs: []
    })
  );
  assert.throws(() =>
    v.parse(releaseResultSchema, {
      ...releaseSuccess,
      verificationFacts: []
    })
  );
});
