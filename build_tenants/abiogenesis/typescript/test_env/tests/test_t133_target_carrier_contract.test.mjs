// Validates: T-133
// Validates: REQ-L-GTL3-GRAPHVECTOR
// Validates: REQ-L-GTL3-HOOKS
// Validates: REQ-R-ABG3-PAYLOAD
// Validates: REQ-R-ABG3-ASSURANCE

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  TARGET_CARRIER_CONTRACT_DECLARATION_KEY,
  TargetCarrierClosureRejectedError,
  admitGtlTargetCarrierDefaultsBundle,
  assertTargetCarrierAdmittedForClosure,
  constructAuthoritySnapshotAdmittedEvent,
  constructPayloadRejectedEvent,
  constructPayloadValidatedEvent,
  derivePayloadLedgerProjection,
  deriveRuntimeAggregateProjection,
  deriveTargetCarrierAdmissionProjection,
  evaluateAssuranceGate,
  loadGtlTargetCarrierDefaultsBundle,
  resolveTargetCarrierContractBinding,
  targetCarrierContractDeclarationForTarget,
  validateTargetCarrierCandidate
} from "../../build/semantic/code/src/index.js";
import { loadAbgConfigSectionsFromFile } from "../../build/semantic/code/src/shared/abg_config/load.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

function attrs(entries = []) {
  return Object.freeze({ entries: Object.freeze(entries) });
}

function scalarEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "scalar",
      value
    })
  });
}

function stringListEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "string_list",
      value: Object.freeze(value)
    })
  });
}

function hookEntry(key, hookRef, config) {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "hook_ref",
      value: Object.freeze({
        ref: hookRef,
        config
      })
    })
  });
}

function basisParts() {
  const basis = buildThreeStageBasis();
  const vector = basis.graph.vectors[0];
  assert.ok(vector);
  return {
    basis,
    vector,
    runtimeProjection: deriveRuntimeAggregateProjection(basis, [])
  };
}

function customTargetCarrierAttrs(label, target, options = {}) {
  const requiredFieldRefs = options.requiredFieldRefs ?? ["kind", "payload"];
  const fixedProtocolFieldRefs = options.fixedProtocolFieldRefs ?? ["kind"];
  const literalDomainRefs = options.literalDomainRefs ?? [`kind:carrier_${label}`];
  return attrs([
    scalarEntry("contract_ref", `contract://t133/${label}`),
    scalarEntry("template_ref", `template://t133/${label}`),
    scalarEntry("target_node_ref", target.id),
    scalarEntry("output_surface_ref", `surface://t133/${label}`),
    scalarEntry("output_carrier_family_ref", `family://t133/${label}`),
    scalarEntry("output_carrier_kind", `carrier_${label}`),
    scalarEntry("envelope_contract_ref", `envelope://t133/${label}`),
    scalarEntry("nested_payload_path", "payload"),
    stringListEntry("required_field_refs", requiredFieldRefs),
    stringListEntry("optional_field_refs", []),
    stringListEntry("fixed_protocol_field_refs", fixedProtocolFieldRefs),
    stringListEntry("worker_fillable_field_refs", ["payload"]),
    stringListEntry("literal_domain_refs", literalDomainRefs),
    stringListEntry("enum_domain_refs", []),
    scalarEntry("schema_ref", target.schema.ref),
    scalarEntry("admission_ref", `admission://t133/${label}`),
    scalarEntry("payload_ledger_binding_ref", `payload-ledger://t133/${label}`),
    scalarEntry("edge_assurance_binding_ref", `edge-assurance://t133/${label}`),
    scalarEntry("handoff_projection_ref", `handoff://t133/${label}`),
    scalarEntry("construction_template_ref", `template://t133/${label}`),
    scalarEntry("replay_digest_policy_ref", `replay://t133/${label}`),
    scalarEntry("materialization_policy_ref", `materialization://t133/${label}`),
    scalarEntry("closure_precondition_ref", `closure://t133/${label}`),
    scalarEntry("test_case_generation_ref", `testcase://t133/${label}`)
  ]);
}

function noNullFields(object) {
  for (const [key, value] of Object.entries(object)) {
    assert.notEqual(value, null, key);
  }
}

test("T-133 resolves absent vector target carrier through visible config defaults", () => {
  const defaults = loadGtlTargetCarrierDefaultsBundle();
  const { vector } = basisParts();
  const binding = resolveTargetCarrierContractBinding({ vector, defaults });

  assert.equal(binding.kind, "target_carrier_contract_binding");
  assert.equal(binding.source, "gtl_defaults_config");
  assert.equal(binding.sourceRef, `${defaults.bundleRef}#${defaults.bundleDigest}`);
  assert.equal(binding.templateRef, defaults.genericOutputTemplate.templateRef);
  assert.match(binding.contractRef, /^gtl:\/\/target-carrier-contract\/generic-output:/);
  assert.equal(binding.targetNodeRef, vector.target.id);
  assert.equal(binding.outputCarrierKind, vector.target.assetSurface.kind);
  assert.equal(binding.schemaRef, vector.target.schema.ref);
  noNullFields(binding);
});

test("T-133 product-specific graph-vector declaration wins over config default", () => {
  const defaults = loadGtlTargetCarrierDefaultsBundle();
  const { vector } = basisParts();
  const declaredVector = Object.freeze({
    ...vector,
    declarations: attrs([
      hookEntry(
        TARGET_CARRIER_CONTRACT_DECLARATION_KEY,
        "hook://t133/specific",
        customTargetCarrierAttrs("specific", vector.target)
      )
    ])
  });
  const binding = resolveTargetCarrierContractBinding({
    vector: declaredVector,
    defaults
  });

  assert.equal(binding.source, "graph_vector_declarations");
  assert.equal(binding.sourceRef, vector.id);
  assert.equal(binding.hookRef, "hook://t133/specific");
  assert.equal(binding.contractRef, "contract://t133/specific");
  assert.equal(binding.templateRef, "template://t133/specific");
  noNullFields(binding);
});

test("T-133 vector-local target carrier declarations are identity-bound to their vector", () => {
  const defaults = loadGtlTargetCarrierDefaultsBundle();
  const { vector } = basisParts();

  assert.throws(
    () =>
      resolveTargetCarrierContractBinding({
        vector: Object.freeze({
          ...vector,
          declarations: attrs([
            hookEntry(
              TARGET_CARRIER_CONTRACT_DECLARATION_KEY,
              "hook://t133/wrong-target",
              attrs([
                ...customTargetCarrierAttrs("wrong-target", vector.target).entries.filter(
                  (entry) => entry.key !== "target_node_ref"
                ),
                scalarEntry("target_node_ref", "node://t133/not-the-vector-target")
              ])
            )
          ])
        }),
        defaults
      }),
    /target_node_ref/i
  );

  assert.throws(
    () =>
      resolveTargetCarrierContractBinding({
        vector: Object.freeze({
          ...vector,
          declarations: attrs([
            hookEntry(
              TARGET_CARRIER_CONTRACT_DECLARATION_KEY,
              "hook://t133/wrong-schema",
              attrs([
                ...customTargetCarrierAttrs("wrong-schema", vector.target).entries.filter(
                  (entry) => entry.key !== "schema_ref"
                ),
                scalarEntry("schema_ref", "schema://t133/not-the-vector-target")
              ])
            )
          ])
        }),
        defaults
      }),
    /schema_ref/i
  );
});

test("T-133 config-backed generic declaration can be materialized explicitly", () => {
  const defaults = loadGtlTargetCarrierDefaultsBundle();
  const { vector } = basisParts();
  const declaration = targetCarrierContractDeclarationForTarget({
    target: vector.target,
    defaults
  });
  const declaredVector = Object.freeze({
    ...vector,
    declarations: attrs([declaration])
  });
  const binding = resolveTargetCarrierContractBinding({
    vector: declaredVector,
    defaults
  });

  assert.equal(binding.source, "graph_vector_declarations");
  assert.equal(binding.templateRef, defaults.genericOutputTemplate.templateRef);
  assert.equal(binding.targetNodeRef, vector.target.id);
});

test("T-133 defaults bundle identity is normalized across load and admission paths", () => {
  const loaded = loadGtlTargetCarrierDefaultsBundle();
  // The consolidated abg.config.json holds the bundle under its targetCarriers
  // section; re-admit that section the same way the loader does.
  const section = loadAbgConfigSectionsFromFile(loaded.bundlePath).targetCarriers;
  const admitted = admitGtlTargetCarrierDefaultsBundle(section.value, {
    bundlePath: section.bundlePath,
    bundleDigest: section.bundleDigest
  });

  assert.equal(loaded.bundleDigest, admitted.bundleDigest);
  assert.equal(loaded.bundleRef, admitted.bundleRef);
});

test("T-133 defaults loader is package-relative when caller cwd has no config", () => {
  const originalCwd = process.cwd();
  const tempRoot = mkdtempSync(join(tmpdir(), "abg-t133-no-config-"));
  try {
    process.chdir(tempRoot);
    const loaded = loadGtlTargetCarrierDefaultsBundle();
    assert.equal(loaded.kind, "gtl_target_carrier_defaults_bundle");
    assert.match(loaded.bundlePath, /config[/\\]abg\.config\.json$/u);
  } finally {
    process.chdir(originalCwd);
    rmSync(tempRoot, { force: true, recursive: true });
  }
});

test("T-133 malformed target carrier declarations fail closed", () => {
  const defaults = loadGtlTargetCarrierDefaultsBundle();
  const { vector } = basisParts();

  assert.throws(
    () =>
      resolveTargetCarrierContractBinding({
        vector: Object.freeze({
          ...vector,
          declarations: attrs([
            scalarEntry(TARGET_CARRIER_CONTRACT_DECLARATION_KEY, "not-a-hook")
          ])
        }),
        defaults
      }),
    /hook_ref/i
  );

  assert.throws(
    () =>
      resolveTargetCarrierContractBinding({
        vector: Object.freeze({
          ...vector,
          declarations: attrs([
            hookEntry(
              TARGET_CARRIER_CONTRACT_DECLARATION_KEY,
              "hook://t133/missing",
              attrs([scalarEntry("contract_ref", "contract://t133/missing")])
            )
          ])
        }),
        defaults
      }),
    /required/i
  );
});

test("T-133 target carrier candidate admission enforces the generic envelope contract", () => {
  const defaults = loadGtlTargetCarrierDefaultsBundle();
  const { vector } = basisParts();
  const binding = resolveTargetCarrierContractBinding({ vector, defaults });

  const admitted = validateTargetCarrierCandidate({
    binding,
    payloadRef: "payload://t133/admitted-candidate",
    candidate: {
      kind: binding.outputCarrierKind,
      payload: {
        value: "worker-filled"
      }
    }
  });

  assert.equal(admitted.status, "admitted");
  assert.equal(admitted.contractRef, binding.contractRef);
  assert.equal(admitted.contractDigest, binding.configDigest);

  const missingNested = validateTargetCarrierCandidate({
    binding,
    payloadRef: "payload://t133/missing-nested",
    candidate: {
      kind: binding.outputCarrierKind
    }
  });
  assert.equal(missingNested.status, "rejected");
  assert.equal(missingNested.rejectionClass, "missing_nested_carrier");

  const missingRequired = validateTargetCarrierCandidate({
    binding,
    payloadRef: "payload://t133/missing-required",
    candidate: {
      payload: {}
    }
  });
  assert.equal(missingRequired.status, "rejected");
  assert.equal(missingRequired.rejectionClass, "missing_required_field");

  const wrongLiteral = validateTargetCarrierCandidate({
    binding,
    payloadRef: "payload://t133/wrong-literal",
    candidate: {
      kind: "not-the-target-carrier-kind",
      payload: {}
    }
  });
  assert.equal(wrongLiteral.status, "rejected");
  assert.equal(wrongLiteral.rejectionClass, "wrong_literal_domain");

  const declaredVector = Object.freeze({
    ...vector,
    declarations: attrs([
      hookEntry(
        TARGET_CARRIER_CONTRACT_DECLARATION_KEY,
        "hook://t133/fixed-protocol",
        customTargetCarrierAttrs("fixed-protocol", vector.target, {
          requiredFieldRefs: ["kind", "payload", "protocol.version"],
          fixedProtocolFieldRefs: ["protocol.version"]
        })
      )
    ])
  });
  const fixedProtocolBinding = resolveTargetCarrierContractBinding({
    vector: declaredVector,
    defaults
  });
  const fixedMutation = validateTargetCarrierCandidate({
    binding: fixedProtocolBinding,
    payloadRef: "payload://t133/fixed-protocol-mutation",
    expectedFixedFieldValues: {
      "protocol.version": 1
    },
    candidate: {
      kind: fixedProtocolBinding.outputCarrierKind,
      protocol: {
        version: 2
      },
      payload: {}
    }
  });
  assert.equal(fixedMutation.status, "rejected");
  assert.equal(fixedMutation.rejectionClass, "fixed_protocol_field_mutation");
});

test("T-133 payload ledger closure depends on admitted target carrier contract", () => {
  const defaults = loadGtlTargetCarrierDefaultsBundle();
  const { basis, runtimeProjection } = basisParts();
  const ledgerWithoutPayload = derivePayloadLedgerProjection({
    basis,
    runtimeProjection,
    events: [],
    vectorIndex: 0,
    targetCarrierDefaults: defaults
  });
  const missing = deriveTargetCarrierAdmissionProjection({
    ledger: ledgerWithoutPayload
  });

  assert.equal(missing.status, "missing");
  assert.throws(
    () => assertTargetCarrierAdmittedForClosure(missing),
    TargetCarrierClosureRejectedError
  );

  const payloadRef = "payload://t133/target";
  const acceptedLedger = derivePayloadLedgerProjection({
    basis,
    runtimeProjection,
    events: [
      constructPayloadValidatedEvent({
        basis,
        vectorIndex: 0,
        payloadRef,
        contractRef: ledgerWithoutPayload.targetCarrierContract.contractRef,
        contractDigest: ledgerWithoutPayload.targetCarrierContract.configDigest,
        digest: "digest://t133/target",
        validationRef: "validation://t133/target",
        evidenceRef: "evidence://t133/target"
      })
    ],
    vectorIndex: 0,
    targetCarrierDefaults: defaults
  });
  const admitted = deriveTargetCarrierAdmissionProjection({
    ledger: acceptedLedger
  });

  assert.equal(admitted.status, "admitted");
  assert.doesNotThrow(() => assertTargetCarrierAdmittedForClosure(admitted));

  const retryLedger = derivePayloadLedgerProjection({
    basis,
    runtimeProjection,
    events: [
      Object.freeze({
        ...constructPayloadRejectedEvent({
          basis,
          vectorIndex: 0,
          payloadRef: "payload://t133/old-target",
          rejectionClass: "contract_invalid",
          contractRef: ledgerWithoutPayload.targetCarrierContract.contractRef,
          contractDigest: ledgerWithoutPayload.targetCarrierContract.configDigest,
          digest: "digest://t133/old-target",
          reason: "older attempt rejected"
        }),
        eventAdmissionOrdinal: 1
      }),
      Object.freeze({
        ...constructPayloadValidatedEvent({
          basis,
          vectorIndex: 0,
          payloadRef: "payload://t133/new-target",
          contractRef: ledgerWithoutPayload.targetCarrierContract.contractRef,
          contractDigest: ledgerWithoutPayload.targetCarrierContract.configDigest,
          digest: "digest://t133/new-target",
          validationRef: "validation://t133/new-target",
          evidenceRef: "evidence://t133/new-target"
        }),
        eventAdmissionOrdinal: 2
      })
    ],
    vectorIndex: 0,
    targetCarrierDefaults: defaults
  });
  const retryAdmitted = deriveTargetCarrierAdmissionProjection({
    ledger: retryLedger
  });
  assert.equal(retryAdmitted.status, "admitted");
  assert.equal(retryAdmitted.payloadRef, "payload://t133/new-target");
  assert.deepEqual(retryAdmitted.validationRefs, ["validation://t133/new-target"]);
  assert.deepEqual(retryAdmitted.rejectedPayloadRefs, []);
  const explicitOldAttempt = deriveTargetCarrierAdmissionProjection({
    ledger: retryLedger,
    payloadRef: "payload://t133/old-target"
  });
  assert.equal(explicitOldAttempt.status, "rejected");

  const wrongDigestLedger = derivePayloadLedgerProjection({
    basis,
    runtimeProjection,
    events: [
      constructPayloadValidatedEvent({
        basis,
        vectorIndex: 0,
        payloadRef,
        contractRef: ledgerWithoutPayload.targetCarrierContract.contractRef,
        contractDigest: "sha256:not-the-selected-contract",
        digest: "digest://t133/wrong-contract-digest",
        validationRef: "validation://t133/wrong-contract-digest",
        evidenceRef: "evidence://t133/wrong-contract-digest"
      })
    ],
    vectorIndex: 0,
    targetCarrierDefaults: defaults
  });
  const wrongDigest = deriveTargetCarrierAdmissionProjection({
    ledger: wrongDigestLedger
  });

  assert.equal(wrongDigest.status, "missing");

  const rejectedLedger = derivePayloadLedgerProjection({
    basis,
    runtimeProjection,
    events: [
      constructPayloadRejectedEvent({
        basis,
        vectorIndex: 0,
        payloadRef,
        rejectionClass: "contract_invalid",
        contractRef: ledgerWithoutPayload.targetCarrierContract.contractRef,
        contractDigest: ledgerWithoutPayload.targetCarrierContract.configDigest,
        digest: "digest://t133/rejected",
        reason: "wrong target carrier kind"
      })
    ],
    vectorIndex: 0,
    targetCarrierDefaults: defaults
  });
  const rejected = deriveTargetCarrierAdmissionProjection({
    ledger: rejectedLedger
  });

  assert.equal(rejected.status, "rejected");
  assert.deepEqual(rejected.rejectedPayloadRefs, [payloadRef]);
  assert.throws(
    () => assertTargetCarrierAdmittedForClosure(rejected),
    TargetCarrierClosureRejectedError
  );
});

test("T-133 assurance gate blocks closure when selected target carrier is not admitted", () => {
  const defaults = loadGtlTargetCarrierDefaultsBundle();
  const { basis, runtimeProjection } = basisParts();
  const replayEvents = [
    constructAuthoritySnapshotAdmittedEvent({
      basis,
      vectorIndex: 0,
      authoritySnapshotRef: "authority-snapshot://t133/target-carrier-gate",
      authorityRefs: ["authority://t133/target-carrier-gate"],
      inputRefs: ["input://t133/target-carrier-gate"],
      authorityDigest: "authority-digest://t133/target-carrier-gate",
      inputDigest: "input-digest://t133/target-carrier-gate"
    })
  ];

  const gate = evaluateAssuranceGate({
    basis,
    projection: runtimeProjection,
    replayEvents,
    targetCarrierDefaults: defaults,
    provider: {
      authoritySnapshot: () => null
    }
  });

  assert.equal(gate.kind, "assurance_blocked");
  assert.match(gate.reason, /Target carrier contract/i);
});
