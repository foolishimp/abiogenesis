import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { TextDecoder } from "node:util";

import { Ajv2020 } from "ajv/dist/2020.js";
import * as v from "valibot";

import {
  absolutePosixPathSchema,
  admitCapabilityGrant,
  admitInvocationAuthority,
  admitNative,
  admitPublicInvocation,
  admitPublicOutcome,
  admitStrictRequestWithDefaults,
  canonicalIJsonSchema,
  canonicalNativeSchemaBytes,
  constructCapabilityGrant,
  constructInvocationAuthority,
  constructPublicContractCatalog,
  constructPublicInvocation,
  constructPublicOutcome,
  defineNativeContract,
  PHASE_A_NATIVE_CONTRACT_FIXTURE_SOURCES,
  projectNativeJsonSchema,
  publicContractCatalogCoordinate,
  refSchema,
  resolvePublicContractCoordinate,
  safePositiveIntegerSchema,
  semanticVersionSchema,
  uniqueByIdentityArray
} from "../../build/semantic/code/src/app/m04/public_contracts/native_contract_phase_a.js";
import {
  stableJson,
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";

const OPERATION_KEY = "abg.operation.workspace.create(clean)";

const {
  request: requestSchema,
  result: resultSchema,
  refusal: refusalSchema
} = PHASE_A_NATIVE_CONTRACT_FIXTURE_SOURCES.workspace_create_clean;

function contractIdentity(kind) {
  return {
    contractId: `abg.contract.phase-a.workspace-create-clean.${kind}`,
    contractVersion: "5.0.0",
    schemaId: `abg.schema.phase-a.workspace-create-clean.${kind}`,
    schemaVersion: "5.0.0",
    nativeLocator: {
      kind: "private_source_module",
      sourceRoot: "semantic_build",
      modulePath:
        "code/src/app/m04/public_contracts/native_contract_phase_a.js",
      exportName: "PHASE_A_NATIVE_CONTRACT_FIXTURE_SOURCES",
      memberPath: ["workspace_create_clean", kind]
    }
  };
}

async function resolveFixtureLocator(definition) {
  const locator = definition.schemaCoordinate.nativeLocator;
  assert.equal(locator.kind, "private_source_module");
  assert.equal(locator.sourceRoot, "semantic_build");
  assert.equal(
    locator.modulePath,
    "code/src/app/m04/public_contracts/native_contract_phase_a.js"
  );
  assert.equal(
    locator.exportName,
    "PHASE_A_NATIVE_CONTRACT_FIXTURE_SOURCES"
  );
  const sourceRoot = new URL("../../build/semantic/", import.meta.url);
  const sourceModule = await import(new URL(locator.modulePath, sourceRoot).href);
  return locator.memberPath.reduce(
    (value, member) => Reflect.get(value, member),
    Reflect.get(sourceModule, locator.exportName)
  );
}

function fixture() {
  const requestDefinition = defineNativeContract({
    identity: contractIdentity("request"),
    schema: requestSchema
  });
  const resultDefinition = defineNativeContract({
    identity: contractIdentity("result"),
    schema: resultSchema
  });
  const refusalDefinition = defineNativeContract({
    identity: contractIdentity("refusal"),
    schema: refusalSchema
  });
  const rows = [
    requestDefinition.schemaCoordinate,
    resultDefinition.schemaCoordinate,
    refusalDefinition.schemaCoordinate
  ];
  const contractCatalogPacket = constructPublicContractCatalog({
    catalogId: "abg.catalog.phase-a",
    catalogVersion: "5.0.0",
    rows
  });
  const contractCatalog = publicContractCatalogCoordinate(contractCatalogPacket);
  const definitionDigest = stableSha256Digest({
    operationKey: OPERATION_KEY,
    rows
  });
  const authorityBasisRef = "authority-basis:phase-a-workspace-create";
  const authorityBasisDigest = stableSha256Digest({
    authorityBasisRef,
    operationKey: OPERATION_KEY
  });
  const actorRef = "actor:phase-a-builder";
  const capabilityGrant = constructCapabilityGrant({
    capabilityId: "abg.capability.operator.public-contract@5",
    capabilityDefinitionRef:
      "capability-definition:operator-public-contract-v5",
    capabilityDefinitionDigest: stableSha256Digest({ capability: "operator" }),
    actorRef,
    approvalRef: "approval:phase-a",
    policyRef: "policy:phase-a-private-schema-only",
    scopeRef: "scope:workspace-create-clean-fixture",
    scopeDigest: stableSha256Digest({ scope: "workspace-create-clean" }),
    authorityBasisRef,
    authorityBasisDigest
  });
  const authorityExpectation = {
    operationKey: OPERATION_KEY,
    definitionDigest,
    contractCatalog,
    requiredGrantCapabilityIds: [
      "abg.capability.operator.public-contract@5"
    ],
    slotStates: {
      actor: "admitted_actor",
      workspace: "forbidden",
      productSet: "forbidden",
      dependencyLock: "forbidden",
      catalogScope: "forbidden",
      executionProgram: "forbidden",
      invocationPolicy: "forbidden",
      transportSteering: "forbidden"
    }
  };
  const authority = constructInvocationAuthority({
    operationKey: OPERATION_KEY,
    expected: authorityExpectation,
    basis: {
      operationKey: OPERATION_KEY,
      authorityBasisRef,
      authorityBasisDigest,
      definitionKey: OPERATION_KEY,
      definitionDigest,
      contractCatalog,
      capabilityGrants: [capabilityGrant],
      actor: {
        state: "admitted_actor",
        actorRef,
        attributionRef: "attribution:phase-a-builder",
        attributionDigest: stableSha256Digest({ actorRef })
      },
      workspace: { state: "forbidden" },
      productSet: { state: "forbidden" },
      dependencyLock: { state: "forbidden" },
      catalogScope: { state: "forbidden" },
      executionProgram: { state: "forbidden" },
      invocationPolicy: { state: "forbidden" },
      transportSteering: { state: "forbidden" }
    }
  });
  const invocationExpectation = {
    operationKey: OPERATION_KEY,
    definitionDigest,
    contractCatalog,
    requestContract: requestDefinition.schemaCoordinate,
    resultContract: resultDefinition.schemaCoordinate,
    refusalContract: refusalDefinition.schemaCoordinate,
    nonTerminalContract: null,
    authority: authorityExpectation
  };
  const request = { targetRoot: "/tmp/abg-phase-a", createPolicy: "clean" };
  const invocation = constructPublicInvocation({
    operationKey: OPERATION_KEY,
    requestSchema,
    expected: invocationExpectation,
    basis: {
      kind: "public_invocation",
      invocationRef: "public-invocation:phase-a-workspace-create",
      definitionKey: OPERATION_KEY,
      definitionDigest,
      contractCatalog,
      authority,
      requestContract: requestDefinition.schemaCoordinate,
      requestRef: "request:phase-a-workspace-create",
      requestDigest: stableSha256Digest(request),
      request,
      expectedResultContract: resultDefinition.schemaCoordinate,
      expectedRefusalContract: refusalDefinition.schemaCoordinate,
      expectedNonTerminalContract: null,
      correlationRef: "correlation:phase-a-workspace-create",
      provenanceRefs: ["provenance:phase-a-fixture"]
    }
  });
  return {
    authority,
    authorityExpectation,
    capabilityGrant,
    contractCatalog,
    contractCatalogPacket,
    definitionDigest,
    invocation,
    invocationExpectation,
    refusalDefinition,
    requestDefinition,
    resultDefinition,
    rows
  };
}

test("T-281 Phase A maps exactly the seven admitted native actions", () => {
  const refProjection = projectNativeJsonSchema(refSchema);
  assert.equal(refProjection["x-abg-native-brand"], "Ref");
  assert.equal(refProjection["x-abg-native-regex-flags"], "u");

  assert.equal(
    projectNativeJsonSchema(absolutePosixPathSchema)["x-abg-native-check"],
    "absolute_posix_path"
  );
  assert.equal(
    projectNativeJsonSchema(semanticVersionSchema)["x-abg-native-check"],
    "semantic_version"
  );
  const integerProjection = projectNativeJsonSchema(safePositiveIntegerSchema);
  assert.equal(integerProjection.type, "integer");
  assert.equal(integerProjection.minimum, 1);
  assert.equal(
    integerProjection["x-abg-native-check"],
    "safe_positive_integer"
  );
  assert.equal(
    projectNativeJsonSchema(canonicalIJsonSchema)["x-abg-native-check"],
    "canonical_ijson"
  );
  const nestedIJsonProjection = projectNativeJsonSchema(v.strictObject({
    value: canonicalIJsonSchema
  }));
  assert.equal(
    nestedIJsonProjection.properties.value.$defs,
    undefined
  );
  assert.deepEqual(
    nestedIJsonProjection.properties.value,
    {
      $ref: "#/$defs/IJsonValue",
      "x-abg-native-check": "canonical_ijson"
    }
  );
  new Ajv2020({ strict: false }).compile(nestedIJsonProjection);
  const uniqueProjection = projectNativeJsonSchema(uniqueByIdentityArray(
    v.strictObject({ ref: refSchema, value: v.string() })
  ));
  assert.equal(uniqueProjection["x-abg-native-check"], "unique_by_identity");
  assert.equal(uniqueProjection.uniqueItems, undefined);
  assert.throws(
    () => admitNative(
      uniqueByIdentityArray(v.strictObject({ ref: refSchema, value: v.string() })),
      [
        { ref: "ref:duplicate", value: "first" },
        { ref: "ref:duplicate", value: "second" }
      ]
    ),
    /duplicate or missing stable identity/u
  );

  assert.throws(
    () => projectNativeJsonSchema(v.pipe(v.string(), v.email())),
    /unsupported action email/u
  );
  assert.throws(
    () => projectNativeJsonSchema(v.pipe(v.string(), v.regex(/^x$/gu))),
    /sole flag u/u
  );
  assert.throws(
    () => projectNativeJsonSchema(v.object({ value: v.string() })),
    /unsupported schema object/u
  );
  assert.throws(
    () => projectNativeJsonSchema(v.pipe(v.string(), v.transform(String))),
    /unsupported action transform/u
  );
  assert.throws(
    () => projectNativeJsonSchema(v.pipe(
      v.array(refSchema),
      v.check(() => true, "duplicate or missing stable identity")
    )),
    /unsupported action check/u
  );
});

test("T-281 Phase A derives admission, canonical schema bytes, and digest from one schema", async () => {
  const definition = defineNativeContract({
    identity: contractIdentity("request"),
    schema: requestSchema
  });
  assert.equal(await resolveFixtureLocator(definition), definition.schema);
  assert.equal(
    definition.nativeSymbol,
    "PHASE_A_NATIVE_CONTRACT_FIXTURE_SOURCES"
  );
  assert.throws(
    () => defineNativeContract({
      identity: {
        ...contractIdentity("request"),
        nativeLocator: {
          ...contractIdentity("request").nativeLocator,
          packageName: "@abiogenesis/typescript-tenant"
        }
      },
      schema: requestSchema
    }),
    /Invalid key/u
  );
  for (const modulePath of [
    "../native_contract_phase_a.js",
    "/tmp/native_contract_phase_a.js"
  ]) {
    assert.throws(
      () => defineNativeContract({
        identity: {
          ...contractIdentity("request"),
          nativeLocator: {
            ...contractIdentity("request").nativeLocator,
            modulePath
          }
        },
        schema: requestSchema
      }),
      /format/u
    );
  }
  const admitted = admitNative(requestSchema, {
    targetRoot: "/tmp/abg-native",
    createPolicy: "clean"
  });
  assert.deepEqual(admitted, {
    targetRoot: "/tmp/abg-native",
    createPolicy: "clean"
  });
  assert.equal(Object.isFrozen(admitted), true);
  assert.throws(
    () => admitNative(requestSchema, {
      targetRoot: "relative/path",
      createPolicy: "clean"
    }),
    /absolute normalized POSIX/u
  );
  assert.throws(
    () => admitNative(requestSchema, {
      targetRoot: "/tmp/abg-native",
      createPolicy: "clean",
      extra: true
    }),
    /Invalid key/u
  );
  assert.equal(
    new TextDecoder().decode(canonicalNativeSchemaBytes(definition.projectedSchema)),
    stableJson(definition.projectedSchema)
  );
  assert.equal(
    definition.schemaCoordinate.schemaDigest,
    stableSha256Digest(definition.projectedSchema)
  );
  assert.equal(
    definition.schemaCoordinate.contractDigest,
    definition.schemaCoordinate.schemaDigest
  );
  assert.equal(
    definition.projectedSchema.$id,
    definition.schemaCoordinate.schemaId
  );
  assert.equal(
    definition.projectedSchema.$schema,
    "https://json-schema.org/draft/2020-12/schema"
  );
});

test("T-281 Phase A rejects host state that canonical I-JSON would normalize or strip", () => {
  const hidden = { visible: true };
  Object.defineProperty(hidden, "secret", {
    configurable: true,
    enumerable: false,
    value: "not-digested"
  });
  const symbolBearing = { visible: true };
  symbolBearing[Symbol("secret")] = "not-digested";
  const arrayWithProperty = ["visible"];
  arrayWithProperty.extra = "not-digested";
  let getterCalls = 0;
  const accessorBearing = { visible: true };
  Object.defineProperty(accessorBearing, "secret", {
    configurable: true,
    enumerable: false,
    get() {
      getterCalls += 1;
      return "not-digested";
    }
  });
  const throwingProxy = new Proxy(
    {},
    {
      getPrototypeOf() {
        throw new Error("host introspection must fail closed");
      }
    }
  );

  for (const candidate of [
    -0,
    { value: -0 },
    hidden,
    symbolBearing,
    arrayWithProperty,
    accessorBearing,
    throwingProxy
  ]) {
    assert.throws(
      () => admitNative(canonicalIJsonSchema, candidate),
      /canonical I-JSON/u
    );
  }
  assert.equal(getterCalls, 0);

  const nested = { mutable: true };
  const shallowFrozen = Object.freeze({ nested });
  const admitted = admitNative(canonicalIJsonSchema, shallowFrozen);
  assert.equal(Object.isFrozen(admitted), true);
  assert.equal(Object.isFrozen(admitted.nested), true);
  assert.throws(() => {
    admitted.nested.mutable = false;
  }, /read only/u);
});

test("T-281 Phase A defaults are only none or literal and preserve omission", () => {
  const defaultedSchema = v.strictObject({
    targetRoot: absolutePosixPathSchema,
    mode: v.picklist(["safe", "strict"])
  });
  const admitted = admitStrictRequestWithDefaults({
    schema: defaultedSchema,
    raw: { targetRoot: "/tmp/defaulted" },
    defaults: [{ field: "mode", policy: { kind: "literal", value: "safe" } }]
  });
  assert.equal(admitted.mode, "safe");
  assert.throws(
    () => admitStrictRequestWithDefaults({
      schema: defaultedSchema,
      raw: { targetRoot: "/tmp/defaulted" },
      defaults: [{ field: "mode", policy: { kind: "none" } }]
    }),
    /received undefined/u
  );
  assert.throws(
    () => admitStrictRequestWithDefaults({
      schema: defaultedSchema,
      raw: { targetRoot: "/tmp/defaulted", mode: undefined },
      defaults: [{ field: "mode", policy: { kind: "literal", value: "safe" } }]
    }),
    /received undefined/u
  );
  assert.throws(
    () => admitStrictRequestWithDefaults({
      schema: defaultedSchema,
      raw: { targetRoot: "/tmp/defaulted" },
      defaults: [{ field: "mode", policy: { kind: "derived", ref: "clock" } }]
    }),
    /Invalid type/u
  );
});

test("T-281 Phase A admits the schema-only workspace.create clean packets", () => {
  const current = fixture();
  assert.equal(current.authority.actor.state, "admitted_actor");
  assert.equal(current.authority.workspace.state, "forbidden");
  assert.equal(current.invocation.request.createPolicy, "clean");
  assert.equal(Object.isFrozen(current.invocation), true);

  assert.deepEqual(
    resolvePublicContractCoordinate({
      admittedCatalog: current.contractCatalogPacket,
      requestedCatalog: current.contractCatalog,
      requested: current.requestDefinition.schemaCoordinate
    }),
    current.requestDefinition.schemaCoordinate
  );

  assert.throws(
    () => resolvePublicContractCoordinate({
      admittedCatalog: {
        ...current.contractCatalogPacket,
        rows: current.contractCatalogPacket.rows.map((row, index) =>
          index === 0
            ? {
              ...row,
                nativeLocator: {
                  ...row.nativeLocator,
                  memberPath: [...row.nativeLocator.memberPath, "forged"]
                }
              }
            : row
        )
      },
      requestedCatalog: current.contractCatalog,
      requested: current.requestDefinition.schemaCoordinate
    }),
    /catalog: digest mismatch/u
  );
  assert.throws(
    () => constructPublicContractCatalog({
      catalogId: "abg.catalog.phase-a",
      catalogVersion: "5.0.0",
      rows: [current.rows[0], current.rows[0]]
    }),
    /duplicate contract identity/u
  );
  assert.throws(
    () => constructPublicContractCatalog({
      catalogId: "abg.catalog.phase-a",
      catalogVersion: "5.0.0",
      rows: [{
        ...current.rows[0],
        contractDigest: stableSha256Digest({ divergent: true })
      }]
    }),
    /asset digest mismatch/u
  );
  assert.throws(
    () => resolvePublicContractCoordinate({
      admittedCatalog: current.contractCatalogPacket,
      requestedCatalog: current.contractCatalog,
      requested: {
        ...current.requestDefinition.schemaCoordinate,
        contractId: "abg.contract.phase-a.unknown"
      }
    }),
    /unknown contract coordinate/u
  );
  assert.throws(
    () => resolvePublicContractCoordinate({
      admittedCatalog: current.contractCatalogPacket,
      requestedCatalog: current.contractCatalog,
      requested: {
        ...current.requestDefinition.schemaCoordinate,
        nativeLocator: {
          ...current.requestDefinition.schemaCoordinate.nativeLocator,
          memberPath: ["workspace_create_clean", "result"]
        }
      }
    }),
    /contract coordinate: exact value mismatch/u
  );
  const codePointOrdered = constructPublicContractCatalog({
    catalogId: "abg.catalog.phase-a-order",
    catalogVersion: "5.0.0",
    rows: [
      {
        ...current.requestDefinition.schemaCoordinate,
        contractId: "abg.contract.phase-a.case",
        contractVersion: "5.0.0-a"
      },
      {
        ...current.requestDefinition.schemaCoordinate,
        contractId: "abg.contract.phase-a.case",
        contractVersion: "5.0.0-A"
      }
    ]
  });
  assert.deepEqual(
    codePointOrdered.rows.map((row) => row.contractVersion),
    ["5.0.0-A", "5.0.0-a"]
  );

  const result = {
    workspaceRef: "workspace:phase-a-created",
    creationManifestRef: "manifest:phase-a-created",
    provenanceRefs: ["provenance:phase-a-created"]
  };
  const candidate = constructPublicOutcome({
    outcomeKind: "result",
    outcomeRef: "outcome:phase-a-created",
    invocationRef: current.invocation.invocationRef,
    invocationDigest: current.invocation.invocationDigest,
    definitionKey: OPERATION_KEY,
    definitionDigest: current.definitionDigest,
    payloadRef: "payload:phase-a-created",
    payloadContract: current.resultDefinition.schemaCoordinate,
    value: result,
    evidenceRefs: ["evidence:phase-a-created"],
    correlationRef: current.invocation.correlationRef,
    provenanceRefs: ["provenance:phase-a-created"]
  });
  const admitted = admitPublicOutcome({
    operationKey: OPERATION_KEY,
    resultSchema,
    refusalSchema,
    nonTerminalSchema: null,
    invocation: current.invocation,
    contracts: {
      result: current.resultDefinition.schemaCoordinate,
      refusal: current.refusalDefinition.schemaCoordinate,
      nonTerminal: null
    },
    raw: candidate
  });
  assert.equal(admitted.kind, "public_outcome");
  assert.equal(admitted.outcomeKind, "result");
  assert.equal(Object.isFrozen(admitted), true);
});

test("T-281 Phase A keeps grant ownership distinct from forbidden invocation attribution", () => {
  const current = fixture();
  const operationKey = "abg.operation.workspace.open(open)";
  const definitionDigest = stableSha256Digest({ operationKey });
  const authorityBasisRef = "authority-basis:phase-a-actor-forbidden";
  const authorityBasisDigest = stableSha256Digest({ authorityBasisRef });
  const grant = constructCapabilityGrant({
    capabilityId: "abg.capability.operator.public-contract@5",
    capabilityDefinitionRef:
      "capability-definition:operator-public-contract-v5",
    capabilityDefinitionDigest: stableSha256Digest({ capability: "operator" }),
    actorRef: "actor:grant-owning-principal",
    approvalRef: "approval:phase-a-actor-forbidden",
    policyRef: "policy:phase-a-actor-forbidden",
    scopeRef: "scope:phase-a-actor-forbidden",
    scopeDigest: stableSha256Digest({ scope: "actor-forbidden" }),
    authorityBasisRef,
    authorityBasisDigest
  });
  const expected = {
    operationKey,
    definitionDigest,
    contractCatalog: current.contractCatalog,
    requiredGrantCapabilityIds: [
      "abg.capability.operator.public-contract@5"
    ],
    slotStates: {
      actor: "forbidden",
      workspace: "forbidden",
      productSet: "forbidden",
      dependencyLock: "forbidden",
      catalogScope: "forbidden",
      executionProgram: "forbidden",
      invocationPolicy: "forbidden",
      transportSteering: "forbidden"
    }
  };
  const authority = constructInvocationAuthority({
    operationKey,
    expected,
    basis: {
      operationKey,
      authorityBasisRef,
      authorityBasisDigest,
      definitionKey: operationKey,
      definitionDigest,
      contractCatalog: current.contractCatalog,
      capabilityGrants: [grant],
      actor: { state: "forbidden" },
      workspace: { state: "forbidden" },
      productSet: { state: "forbidden" },
      dependencyLock: { state: "forbidden" },
      catalogScope: { state: "forbidden" },
      executionProgram: { state: "forbidden" },
      invocationPolicy: { state: "forbidden" },
      transportSteering: { state: "forbidden" }
    }
  });
  assert.equal(authority.actor.state, "forbidden");
  assert.equal(authority.capabilityGrants[0].actorRef, "actor:grant-owning-principal");
});

test("T-281 Phase A fails closed on grant, authority, invocation, and outcome drift", () => {
  const current = fixture();
  assert.throws(
    () => admitCapabilityGrant({
      ...current.capabilityGrant,
      approvalRef: "approval:forged"
    }),
    /digest-derived identity mismatch/u
  );
  assert.throws(
    () => admitInvocationAuthority({
      operationKey: OPERATION_KEY,
      expected: current.authorityExpectation,
      raw: {
        ...current.authority,
        capabilityGrants: [current.capabilityGrant, current.capabilityGrant]
      }
    }),
    /duplicate or missing stable identity/u
  );
  assert.throws(
    () => admitInvocationAuthority({
      operationKey: OPERATION_KEY,
      expected: current.authorityExpectation,
      raw: { ...current.authority, workspace: { state: "admitted_workspace" } }
    }),
    /Invalid type|Invalid key/u
  );
  assert.throws(
    () => admitPublicInvocation({
      operationKey: OPERATION_KEY,
      requestSchema,
      expected: current.invocationExpectation,
      raw: {
        ...current.invocation,
        requestDigest: stableSha256Digest({ forged: true })
      }
    }),
    /request digest mismatch/u
  );

  const result = {
    workspaceRef: "workspace:phase-a-created",
    creationManifestRef: "manifest:phase-a-created",
    provenanceRefs: ["provenance:phase-a-created"]
  };
  const validCandidate = constructPublicOutcome({
    outcomeKind: "result",
    outcomeRef: "outcome:phase-a-created",
    invocationRef: current.invocation.invocationRef,
    invocationDigest: current.invocation.invocationDigest,
    definitionKey: OPERATION_KEY,
    definitionDigest: current.definitionDigest,
    payloadRef: "payload:phase-a-created",
    payloadContract: current.resultDefinition.schemaCoordinate,
    value: result,
    evidenceRefs: ["evidence:phase-a-created"],
    correlationRef: current.invocation.correlationRef,
    provenanceRefs: ["provenance:phase-a-created"]
  });
  const admit = (raw) =>
    admitPublicOutcome({
      operationKey: OPERATION_KEY,
      resultSchema,
      refusalSchema,
      nonTerminalSchema: null,
      invocation: current.invocation,
      contracts: {
        result: current.resultDefinition.schemaCoordinate,
        refusal: current.refusalDefinition.schemaCoordinate,
        nonTerminal: null
      },
      raw
    });
  assert.equal(admit({ ...validCandidate, extra: true }).failureClass, "malformed");
  assert.equal(
    admit({ ...validCandidate, definitionKey: "abg.operation.workspace.open(open)" })
      .failureClass,
    "cross_operation"
  );
  assert.equal(
    admit({ ...validCandidate, payloadContract: current.refusalDefinition.schemaCoordinate })
      .failureClass,
    "wrong_contract"
  );
  assert.deepEqual(
    admit({
      ...validCandidate,
      payloadContract: {
        ...current.resultDefinition.schemaCoordinate,
        contractDigest: stableSha256Digest({ forged: true })
      }
    }),
    {
      kind: "outcome_admission_failure",
      failureClass: "digest_mismatch",
      issuePaths: [
        "payloadContract.contractDigest",
        "payloadContract.schemaDigest"
      ],
      invocationRef: current.invocation.invocationRef,
      definitionKey: OPERATION_KEY,
      candidateDigest: stableSha256Digest({
        ...validCandidate,
        payloadContract: {
          ...current.resultDefinition.schemaCoordinate,
          contractDigest: stableSha256Digest({ forged: true })
        }
      })
    }
  );
  assert.equal(
    admit({ ...validCandidate, payloadDigest: stableSha256Digest({ forged: true }) })
      .failureClass,
    "digest_mismatch"
  );
  assert.equal(
    admit({ ...validCandidate, outcomeKind: "nonterminal" }).failureClass,
    "unexpected_nonterminal"
  );
});

test("T-281 Phase A remains private and effect-free", async () => {
  const [
    appIndex,
    contractIndex,
    packageText,
    source,
    declaration,
    legacySchemaGenerator
  ] = await Promise.all([
    readFile("code/src/app/m04/index.ts", "utf8"),
    readFile("code/src/app/m04/public_contracts/index.ts", "utf8"),
    readFile("package.json", "utf8"),
    readFile(
      "code/src/app/m04/public_contracts/native_contract_phase_a.ts",
      "utf8"
    ),
    readFile(
      "build/semantic/code/src/app/m04/public_contracts/native_contract_phase_a.d.ts",
      "utf8"
    ),
    readFile("test_env/tools/generate_public_contract_schemas.mjs", "utf8")
  ]);
  const packageExports = JSON.stringify(JSON.parse(packageText).exports ?? {});
  for (const publicSurface of [appIndex, contractIndex, packageExports]) {
    assert.doesNotMatch(publicSurface, /native_contract_phase_a/u);
  }
  assert.doesNotMatch(source, /node:fs|workspaceCreate\(|DS1_PUBLIC_OPERATION/u);
  assert.doesNotMatch(source, /Consensus|consensus/u);
  assert.doesNotMatch(source, /\bas any\b|as unknown as/u);
  assert.equal(declaration.trim(), "export {};");
  assert.match(legacySchemaGenerator, /type: "\*"/u);
  assert.doesNotMatch(legacySchemaGenerator, /native_contract_phase_a/u);
});
