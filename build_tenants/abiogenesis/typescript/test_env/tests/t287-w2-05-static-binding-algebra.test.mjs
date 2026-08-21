import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import * as Effect from "effect/Effect";
import * as v from "valibot";

import {
  abgEventLocatorDigest,
  acquireAbgEventResource,
  closeAbgEventResource,
  validateAbgEventResourceAssertion,
  validateAbgEventResourceReceipt,
} from "../../build/code/src/abg/definition_event_resource.js";
import { validatePublicOperationBasis } from
  "../../build/code/src/abg/environment_admission.js";

import { RUN_OPERATION_CONTRACTS } from
  "../../build/code/src/product/run_operation_contracts.js";
import { sha256Canonical } from
  "../../build/code/src/shared/digests.js";
import {
  postAppendDefinitionFault,
  postOwnerValidationDefinitionFault,
  preDefinitionFault,
  runExactDefinition,
} from "../../build/code/src/shared/effect_definition.js";
import {
  constructExactOperationInvocationCoordinate,
  isExactOperationInvocationCoordinate,
} from "../../build/code/src/shared/operation_definition_coordinate.js";
import {
  PUBLIC_FUNCTION_DEFINITION_FAMILY,
  PUBLIC_OPERATION_CONTRACT_PROJECTIONS,
} from "../../build/code/src/shared/public_function_family.js";
import { PUBLIC_PROJECTION_PAYLOADS } from
  "../../build/code/src/shared/public_function_projections.js";
import * as bindings from
  "../../build/code/src/shared/static_definition_bindings.js";

const schemaVersion = "5.0.0";
const catalog = Object.freeze({
  productId: "product://abiogenesis/typescript-tenant@5",
  productContentDigest: sha256Canonical({ product: "binding-algebra" }),
  catalogId: "catalog://abiogenesis/public-contracts@5",
  catalogVersion: schemaVersion,
  catalogDigest: sha256Canonical({ catalog: "binding-algebra" }),
});

function coordinate(ref, value = { ref }) {
  return Object.freeze({ ref, digest: sha256Canonical(value) });
}

function contractCoordinate(definition, slot, definitionRef) {
  const asset = PUBLIC_PROJECTION_PAYLOADS.operationContractAssets.find(
    (candidate) =>
      candidate.operationId === definition.definitionKey.operationId,
  );
  assert.ok(asset);
  return Object.freeze({
    contractCatalog: catalog,
    flatRow: Object.freeze({
      contractId: definition.definitionKey.operationId,
      contractVersion: schemaVersion,
      contractDigest: asset.contentDigest,
    }),
    nestedSelector: Object.freeze({
      selectorKind: "operation_definition_slot",
      definitionKey: definition.definitionKey,
      slot,
      definitionRef,
    }),
  });
}

function exactRunCall(memberKey, resources, options = {}) {
  const packet = RUN_OPERATION_CONTRACTS.invoke[memberKey];
  const definition = PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(
    (candidate) =>
      candidate.definitionKey.operationId === packet.definitionKey.operationId &&
      candidate.definitionKey.memberKey === packet.definitionKey.memberKey,
  );
  assert.ok(definition);
  const operation = PUBLIC_OPERATION_CONTRACT_PROJECTIONS.find(
    (candidate) => candidate.operationId === definition.definitionKey.operationId,
  );
  const member = operation?.definitions.find((candidate) =>
    candidate.definitionKey.memberKey === definition.definitionKey.memberKey
  );
  assert.ok(member);
  const inputValue = Object.freeze({ value: "admitted" });
  const inputContract = coordinate("contract://binding-algebra/input");
  const inputAuthority = Object.freeze({
    contract: inputContract,
    valueRef: "value://binding-algebra/input",
    valueDigest: sha256Canonical(inputValue),
    value: inputValue,
  });
  const defaultRequest = memberKey === "invoke"
    ? Object.freeze({
        program: coordinate("program://binding-algebra"),
        catalogHandle: "graph-function://binding-algebra",
        inputContract,
        input: inputValue,
        catalogView: coordinate("catalog-view://binding-algebra"),
        allowlist: Object.freeze([]),
        sourceBasis: Object.freeze({ kind: "none" }),
      })
    : Object.freeze({
        program: coordinate("program://binding-algebra"),
        scope: "program",
        target: Object.freeze({ kind: "next" }),
        until: "converged",
        catalogView: coordinate("catalog-view://binding-algebra"),
        allowlist: Object.freeze([]),
        input: inputAuthority,
        fhMode: "direct",
        rootMode: "supervised",
        sourceBasis: Object.freeze({ kind: "none" }),
      });
  const request = options.rawRequest ?? defaultRequest;
  const identityRequest = options.identityRequest ?? request;
  const slots = Object.freeze({
    workspace_binding: coordinate("workspace-binding://binding-algebra"),
    product_set: Object.freeze([coordinate("product-set://binding-algebra")]),
    dependency_lock: coordinate("product-lock://binding-algebra"),
    catalog_scope: Object.freeze({
      catalog: coordinate("catalog://binding-algebra"),
      view: request.catalogView,
      allowlist: Object.freeze([]),
    }),
    execution_program: identityRequest.program,
    graph_function: memberKey === "invoke" ||
        identityRequest.target?.kind === "graph_function"
      ? Object.freeze({
          graphFunction: coordinate("graph-function://binding-algebra"),
          membership: coordinate("program-membership://binding-algebra"),
        })
      : null,
    input_contract: inputAuthority,
    session_policy: coordinate("session-policy://binding-algebra"),
    capability_grants: Object.freeze({
      requiredCapabilityRefs: Object.freeze([...definition.capabilityRefs]),
      grants: Object.freeze([coordinate("capability-grant://binding-algebra")]),
    }),
    actor: Object.freeze({
      actor: coordinate("actor://binding-algebra"),
      attribution: coordinate("attribution://binding-algebra"),
    }),
    transport_steering: coordinate("transport-steering://binding-algebra"),
    verification_references: null,
    execution_basis: null,
  });
  const authorityBody = Object.freeze({
    kind: "invocation_authority",
    definitionKey: definition.definitionKey,
    slots,
  });
  const invocationAuthority = Object.freeze({
    ...authorityBody,
    authorityDigest: sha256Canonical(authorityBody),
  });
  const requestDigest = sha256Canonical(identityRequest);
  const invocationIdentityBody = Object.freeze({
    kind: "public_invocation",
    schemaVersion,
    invocationContract: Object.freeze({
      contractCatalog: catalog,
      flatRow: Object.freeze({
        contractId: "abg.schema.public-operation-invocation",
        contractVersion: schemaVersion,
        contractDigest:
          PUBLIC_PROJECTION_PAYLOADS.commonSchemaAsset.contentDigest,
      }),
      nestedSelector: Object.freeze({
        selectorKind: "schema_definition",
        definitionKey: null,
        slot: null,
        definitionRef: "#/$defs/PublicInvocation",
      }),
    }),
    definitionRef: definition.definitionRef,
    definitionVersion: schemaVersion,
    definitionDigest: definition.definitionDigest,
    definitionKey: definition.definitionKey,
    contractCatalog: catalog,
    invocationAuthority,
    requestContract: contractCoordinate(
      definition,
      "request",
      member.requestContract.definitionRef,
    ),
    requestRef:
      `public-request://abiogenesis/${requestDigest.slice("sha256:".length)}`,
    requestDigest,
    request: identityRequest,
    expectedResultContract: contractCoordinate(
      definition,
      "result",
      member.resultContract.definitionRef,
    ),
    expectedRefusalContract: contractCoordinate(
      definition,
      "refusal",
      member.refusalContract.definitionRef,
    ),
    expectedNonTerminalContract: contractCoordinate(
      definition,
      "non_terminal",
      member.nonTerminalContract.definitionRef,
    ),
    correlationRef: "correlation://abiogenesis/t287/w2-05/binding-algebra",
    eventTime: "2026-08-20T00:00:00.000Z",
    provenanceRefs: Object.freeze([
      "provenance://abiogenesis/t287/w2-05-worker",
    ]),
  });
  const invocationDigest = sha256Canonical(invocationIdentityBody);
  const invocation = Object.freeze({
    ...invocationIdentityBody,
    request,
    invocationRef:
      `invocation://abiogenesis/${invocationDigest.slice("sha256:".length)}`,
    invocationDigest,
  });
  return Object.freeze({ invocation, resources });
}

function exactInvokeCall(resources) {
  return exactRunCall("invoke", resources);
}

const assertionSchema = v.strictObject({
  eventResource: v.strictObject({ kind: v.literal("synthetic_assertion") }),
  token: v.literal("admitted"),
});
const receiptSchema = v.strictObject({
  eventResource: v.strictObject({ kind: v.literal("synthetic_receipt") }),
  token: v.literal("closed"),
});
const resources = Object.freeze({
  eventResource: Object.freeze({ kind: "synthetic_assertion" }),
  token: "admitted",
});
const receipt = Object.freeze({
  eventResource: Object.freeze({ kind: "synthetic_receipt" }),
  token: "closed",
});
const refusal = Object.freeze({
  outcomeKind: "refusal",
  value: Object.freeze({
    code: "invalid_program",
    issuePaths: Object.freeze([]),
    evidenceRefs: Object.freeze([]),
  }),
});

async function faultOf(program) {
  return Effect.runPromise(Effect.flip(program));
}

test("W2-05 touched owners have no hidden binding factory, registry, or kind-only fault cast", async () => {
  const sourceFiles = [
    "../../code/src/product/workspace_definition_bindings.ts",
    "../../code/src/product/install_definition_bindings.ts",
    "../../code/src/product/environment_definition_bindings.ts",
    "../../code/src/abg/project_read_definition_bindings.ts",
    "../../code/src/product/catalog_definition_bindings.ts",
    "../../code/src/product/project_read_definition_bindings.ts",
    "../../code/src/product/release_snapshot_definition_bindings.ts",
    "../../code/src/product/verification_definition_bindings.ts",
    "../../code/src/validator/conformance_definition_bindings.ts",
    "../../code/src/shared/definition_binding_mechanics.ts",
  ];
  const sources = new Map();
  for (const relativePath of sourceFiles) {
    const source = await readFile(new URL(relativePath, import.meta.url), "utf8");
    sources.set(relativePath, source);
    assert.doesNotMatch(
      source,
      /function\s+(?:createBinding|binding|createApplyBinding)\b/u,
      relativePath,
    );
    assert.doesNotMatch(
      source,
      /(?:isDefinitionFault|isExecutionFault|\(cause\s+as\s+\{\s*kind\?:\s*unknown\s*\}\)\.kind)/u,
      relativePath,
    );
    if (relativePath.includes("abg/project_read_definition_bindings")) {
      assert.doesNotMatch(source, /Object\.fromEntries\(/u, relativePath);
    }
  }
  for (const [relativePath, relations] of [
    ["../../code/src/product/workspace_definition_bindings.ts", [
      /candidate\.physicalEffect\.owner === "workspace_create"/u,
      /candidate\.physicalEffect\.targetRoot === resolve\(candidate\.targetRoot\)/u,
    ]],
    ["../../code/src/product/install_definition_bindings.ts", [
      /const install = bindExactPrefixTransition\(/u,
      /candidate\.physicalEffect\.owner === "product_install"/u,
      /candidate\.physicalEffect\.targetRoot === resolve\(candidate\.targetRoot\)/u,
    ]],
    ["../../code/src/product/environment_definition_bindings.ts", [
      /const resolve = bindStaticOwner\(/u,
      /const bind = bindExactPrefixTransition\(/u,
    ]],
    ["../../code/src/product/project_read_definition_bindings.ts", [
      /const catalog_list = bindStaticOwner\(/u,
      /const catalog_describe = bindStaticOwner\(/u,
      /const workspace_status = bindStaticOwner\(/u,
      /const install_evidence = bindStaticOwner\(/u,
      /const ticket_consensus = bindStaticOwner\(/u,
    ]],
    ["../../code/src/product/release_snapshot_definition_bindings.ts", [
      /const published_rc = bindStaticOwner\(/u,
      /const tapped_release = bindStaticOwner\(/u,
    ]],
    ["../../code/src/product/verification_definition_bindings.ts", [
      /const verify = bindStaticOwner\(/u,
    ]],
    ["../../code/src/validator/conformance_definition_bindings.ts", [
      /const gtl_program = bindStaticOwner\(/u,
    ]],
  ]) {
    const source = sources.get(relativePath);
    assert.equal(typeof source, "string", relativePath);
    for (const relation of relations) assert.match(source, relation, relativePath);
  }
});

test("W2-05 three-function static binding algebra admits once and fails closed", async (context) => {
  assert.deepEqual(Object.keys(bindings).sort(), [
    "bindExactPrefixRead",
    "bindExactPrefixTransition",
    "bindStaticOwner",
  ]);

  const call = exactInvokeCall(resources);
  let staticCalls = 0;
  const staticBinding = bindings.bindStaticOwner(
    RUN_OPERATION_CONTRACTS.invoke.invoke,
    () => {
      staticCalls += 1;
      return Effect.succeed(Object.freeze({ ownerOutput: refusal, resources: receipt }));
    },
    assertionSchema,
    receiptSchema,
  );
  assert.equal(Object.isFrozen(staticBinding), true);
  const returned = await Effect.runPromise(staticBinding(call));
  assert.equal(staticCalls, 1);
  assert.deepEqual(returned, { ownerOutput: refusal, resources: receipt });
  assert.equal(Object.isFrozen(returned), true);
  const {
    authorityDigest,
    ...authorityBody
  } = call.invocation.invocationAuthority;
  assert.equal(authorityDigest, sha256Canonical(authorityBody));
  assert.notEqual(
    authorityDigest,
    sha256Canonical(call.invocation.invocationAuthority.slots),
    "the authority identity covers kind and definitionKey as well as every slot",
  );

  const completeStart = exactRunCall("start", resources).invocation.request;
  const { fhMode: _fhMode, ...withoutFhMode } = completeStart;
  const rawDefaultedRequest = Object.freeze(withoutFhMode);
  const defaultedStartCall = exactRunCall("start", resources, {
    rawRequest: rawDefaultedRequest,
    identityRequest: completeStart,
  });
  let defaultedStartCalls = 0;
  let ownerRequest = null;
  const defaultedStartBinding = bindings.bindStaticOwner(
    RUN_OPERATION_CONTRACTS.invoke.start,
    (ownerCall) => {
      defaultedStartCalls += 1;
      ownerRequest = ownerCall.invocation.request;
      return Effect.succeed(Object.freeze({ ownerOutput: refusal, resources: receipt }));
    },
    assertionSchema,
    receiptSchema,
  );
  await Effect.runPromise(defaultedStartBinding(defaultedStartCall));
  assert.equal(defaultedStartCalls, 1);
  assert.equal(ownerRequest.fhMode, "direct");
  assert.equal(
    defaultedStartCall.invocation.requestDigest,
    sha256Canonical(ownerRequest),
    "request identity and owner execution use the same default-applied value",
  );
  const rawIdentityFault = await faultOf(defaultedStartBinding(
    exactRunCall("start", resources, {
      rawRequest: rawDefaultedRequest,
      identityRequest: rawDefaultedRequest,
    }),
  ));
  assert.equal(rawIdentityFault.code, "call_identity_mismatch");
  assert.equal(
    defaultedStartCalls,
    1,
    "a raw/defaulted request identity divergence never reaches the owner",
  );

  const invocationCoordinate = constructExactOperationInvocationCoordinate(
    {
      operationId: call.invocation.definitionKey.operationId,
      memberKey: call.invocation.definitionKey.memberKey,
      definitionDigest: call.invocation.definitionDigest,
    },
    call.invocation.invocationRef,
    call.invocation.requestDigest,
  );
  assert.equal(isExactOperationInvocationCoordinate(invocationCoordinate), true);
  assert.equal(
    invocationCoordinate.invocationRef,
    call.invocation.invocationRef,
    "C links to E by ref without taking E's digest authority",
  );
  assert.equal(
    invocationCoordinate.invocationPayloadDigest,
    call.invocation.requestDigest,
  );
  assert.notEqual(
    invocationCoordinate.invocationDigest,
    call.invocation.invocationDigest,
    "C and E have distinct digest domains",
  );
  const operationBasis = Object.freeze({
    ...invocationCoordinate,
    authorityScopeRef: "workspace-binding://binding-algebra",
    authorityScopeDigest: sha256Canonical({ scope: "binding-algebra" }),
    correlationId: call.invocation.correlationRef,
    eventTime: call.invocation.eventTime,
    causationEventRefs: Object.freeze([]),
  });
  assert.equal(
    validatePublicOperationBasis(
      operationBasis,
      call.invocation.definitionKey.operationId,
      call.invocation.definitionKey.memberKey,
    ),
    null,
    "C is independently valid",
  );
  assert.equal(
    validatePublicOperationBasis(
      Object.freeze({
        ...operationBasis,
        invocationDigest: call.invocation.invocationDigest,
      }),
      call.invocation.definitionKey.operationId,
      call.invocation.definitionKey.memberKey,
    )?.code,
    "operation_mismatch",
    "substituting E for C fails",
  );

  const cForEFault = await faultOf(staticBinding(Object.freeze({
    ...call,
    invocation: Object.freeze({
      ...call.invocation,
      invocationDigest: invocationCoordinate.invocationDigest,
    }),
  })));
  assert.equal(cForEFault.code, "call_identity_mismatch");
  assert.equal(staticCalls, 1, "substituting C for E fails before the owner");

  const incompleteEDigestFault = await faultOf(staticBinding(Object.freeze({
    ...call,
    invocation: Object.freeze({
      ...call.invocation,
      correlationRef: `${call.invocation.correlationRef}/mutated`,
    }),
  })));
  assert.equal(incompleteEDigestFault.code, "call_identity_mismatch");
  assert.equal(
    staticCalls,
    1,
    "every admitted E body field participates in its identity",
  );

  const malformedResourceFault = await faultOf(staticBinding(Object.freeze({
    invocation: call.invocation,
    resources: Object.freeze({ ...resources, unexpected: true }),
  })));
  assert.equal(malformedResourceFault.code, "invalid_resource_assertion");
  assert.equal(staticCalls, 1, "malformed resources do not enter the owner");

  const throwingResourceCall = {
    invocation: call.invocation,
    get resources() {
      throw new Error("injected resource projection defect");
    },
  };
  const throwingResourceHost = await runExactDefinition(
    throwingResourceCall,
    Effect.suspend(() => staticBinding(throwingResourceCall)),
  );
  assert.equal(
    throwingResourceHost.failure.failureKind,
    "defect_or_interruption",
  );
  assert.match(
    throwingResourceHost.failure.cause,
    /injected resource projection defect/u,
  );
  assert.equal(staticCalls, 1, "projection defects do not enter the owner");

  const wrongCoordinateBinding = bindings.bindStaticOwner(
    RUN_OPERATION_CONTRACTS.invoke.start,
    () => {
      staticCalls += 1;
      return Effect.succeed(Object.freeze({ ownerOutput: refusal, resources: receipt }));
    },
    assertionSchema,
    receiptSchema,
  );
  const wrongCoordinateFault = await faultOf(wrongCoordinateBinding(call));
  assert.equal(wrongCoordinateFault.code, "call_identity_mismatch");
  assert.equal(staticCalls, 1, "wrong fixed coordinates do not enter the owner");

  let malformedReceiptCalls = 0;
  const malformedReceiptBinding = bindings.bindStaticOwner(
    RUN_OPERATION_CONTRACTS.invoke.invoke,
    () => {
      malformedReceiptCalls += 1;
      return Effect.succeed(Object.freeze({
        ownerOutput: refusal,
        resources: Object.freeze({ ...receipt, token: "wrong" }),
      }));
    },
    assertionSchema,
    receiptSchema,
  );
  const malformedReceiptHost = await runExactDefinition(
    call,
    malformedReceiptBinding(call),
  );
  assert.equal(malformedReceiptHost.exitCode, 70);
  assert.equal(
    malformedReceiptHost.failure.failureKind,
    "defect_or_interruption",
    "a malformed post-owner receipt is an invariant defect, not a typed pre-fault",
  );
  assert.equal(malformedReceiptHost.failure.fault, null);
  assert.equal(malformedReceiptHost.resources, null);
  assert.match(
    malformedReceiptHost.failure.cause,
    /owner returned a malformed resource receipt/,
  );
  assert.equal(malformedReceiptCalls, 1, "one owner call precedes receipt admission");

  let malformedOutputCalls = 0;
  const malformedOutputBinding = bindings.bindStaticOwner(
    RUN_OPERATION_CONTRACTS.invoke.invoke,
    () => {
      malformedOutputCalls += 1;
      return Effect.succeed(Object.freeze({
        ownerOutput: Object.freeze({
          outcomeKind: "refusal",
          value: Object.freeze({
            code: "not_a_run_refusal",
            issuePaths: Object.freeze([]),
            evidenceRefs: Object.freeze([]),
          }),
        }),
        resources: receipt,
      }));
    },
    assertionSchema,
    receiptSchema,
  );
  const malformedOutputFault = await faultOf(malformedOutputBinding(call));
  assert.equal(malformedOutputFault.code, "invalid_owner_output");
  assert.equal(
    malformedOutputFault.faultBoundary,
    "post_owner_output_or_receipt_validation",
  );
  assert.strictEqual(malformedOutputFault.resourceReceipt, receipt);
  assert.equal(malformedOutputCalls, 1);

  const malformedOutputHostReceipt = await runExactDefinition(
    call,
    malformedOutputBinding(call),
  );
  assert.equal(malformedOutputHostReceipt.exitCode, 70);
  assert.equal(
    malformedOutputHostReceipt.failure.fault.faultBoundary,
    "post_owner_output_or_receipt_validation",
  );
  assert.strictEqual(malformedOutputHostReceipt.resources, receipt);
  assert.strictEqual(
    malformedOutputHostReceipt.resources,
    malformedOutputHostReceipt.failure.fault.resourceReceipt,
  );

  const issuedPostAppendFault = postAppendDefinitionFault(
    call.invocation.definitionKey,
    "synthetic_post_append",
    "synthetic_post_append_failure",
    "synthetic owner failure after one durable append",
    receipt,
  );
  const postAppendBinding = bindings.bindStaticOwner(
    RUN_OPERATION_CONTRACTS.invoke.invoke,
    () => Effect.fail(issuedPostAppendFault),
    assertionSchema,
    receiptSchema,
  );
  const conservedPostAppendFault = await faultOf(postAppendBinding(call));
  assert.notStrictEqual(
    conservedPostAppendFault,
    issuedPostAppendFault,
    "the shared boundary reconstructs an admitted fault envelope",
  );
  assert.deepEqual(conservedPostAppendFault, issuedPostAppendFault);
  assert.equal(conservedPostAppendFault.faultBoundary, "post_append");
  assert.strictEqual(conservedPostAppendFault.resourceReceipt, receipt);
  const postAppendHostReceipt = await runExactDefinition(
    call,
    postAppendBinding(call),
  );
  assert.equal(postAppendHostReceipt.exitCode, 70);
  assert.strictEqual(postAppendHostReceipt.resources, receipt);
  assert.strictEqual(
    postAppendHostReceipt.resources,
    postAppendHostReceipt.failure.fault.resourceReceipt,
  );

  for (const [label, issuedFault] of [
    ["pre", preDefinitionFault(
      call.invocation.definitionKey,
      "synthetic_pre",
      "synthetic_pre_failure",
      "synthetic owner failure before acquisition or append",
    )],
    ["post-owner", postOwnerValidationDefinitionFault(
      call.invocation.definitionKey,
      "synthetic_post_owner",
      "synthetic_post_owner_failure",
      "synthetic failure after owner output",
      receipt,
    )],
  ]) {
    const exactBoundaryBinding = bindings.bindStaticOwner(
      RUN_OPERATION_CONTRACTS.invoke.invoke,
      () => Effect.fail(issuedFault),
      assertionSchema,
      receiptSchema,
    );
    const admittedBoundaryFault = await faultOf(exactBoundaryBinding(call));
    assert.notStrictEqual(admittedBoundaryFault, issuedFault, label);
    assert.deepEqual(admittedBoundaryFault, issuedFault, label);
    assert.strictEqual(
      admittedBoundaryFault.resourceReceipt,
      label === "pre" ? null : receipt,
      label,
    );
  }

  const malformedFaultEnvelopes = [
    ["kind", Object.freeze({
      ...issuedPostAppendFault,
      kind: "not_a_definition_execution_fault",
    })],
    ["schema version", Object.freeze({
      ...issuedPostAppendFault,
      schemaVersion: "4.0.0",
    })],
    ["definition key value", Object.freeze({
      ...issuedPostAppendFault,
      definitionKey: Object.freeze({
        ...issuedPostAppendFault.definitionKey,
        memberKey: "start",
      }),
    })],
    ["definition key shape", Object.freeze({
      ...issuedPostAppendFault,
      definitionKey: Object.freeze({
        ...issuedPostAppendFault.definitionKey,
        unexpected: true,
      }),
    })],
    ["stage", Object.freeze({
      ...issuedPostAppendFault,
      stage: " ",
    })],
    ["code", Object.freeze({
      ...issuedPostAppendFault,
      code: "",
    })],
    ["message", Object.freeze({
      ...issuedPostAppendFault,
      message: "\t",
    })],
    ["evidence", Object.freeze({
      ...issuedPostAppendFault,
      evidence: Object.freeze({ nonFinite: Number.POSITIVE_INFINITY }),
    })],
    ["outer shape", Object.freeze({
      ...issuedPostAppendFault,
      unexpected: true,
    })],
    ["boundary", Object.freeze({
      ...issuedPostAppendFault,
      faultBoundary: "after_something",
    })],
    ["pre-boundary receipt", Object.freeze({
      ...issuedPostAppendFault,
      faultBoundary: "pre_acquisition_or_pre_append",
    })],
    ["post-boundary null receipt", Object.freeze({
      ...issuedPostAppendFault,
      resourceReceipt: null,
    })],
  ];
  for (const [label, malformedFault] of malformedFaultEnvelopes) {
    const malformedEnvelopeBinding = bindings.bindStaticOwner(
      RUN_OPERATION_CONTRACTS.invoke.invoke,
      () => Effect.fail(malformedFault),
      assertionSchema,
      receiptSchema,
    );
    const malformedEnvelopeHost = await runExactDefinition(
      call,
      malformedEnvelopeBinding(call),
    );
    assert.equal(malformedEnvelopeHost.exitCode, 70, label);
    assert.equal(
      malformedEnvelopeHost.failure.failureKind,
      "defect_or_interruption",
      label,
    );
    assert.equal(malformedEnvelopeHost.failure.fault, null, label);
    assert.equal(malformedEnvelopeHost.resources, null, label);
    assert.match(
      malformedEnvelopeHost.failure.cause,
      /owner emitted a malformed definition fault/,
      label,
    );
  }

  for (const [label, definitionKey, stage, code, message, evidence] of [
    [
      "definition key",
      Object.freeze({
        ...call.invocation.definitionKey,
        unexpected: true,
      }),
      "stage",
      "code",
      "message",
      Object.freeze({}),
    ],
    [
      "stage",
      call.invocation.definitionKey,
      " ",
      "code",
      "message",
      Object.freeze({}),
    ],
    [
      "code",
      call.invocation.definitionKey,
      "stage",
      "",
      "message",
      Object.freeze({}),
    ],
    [
      "message",
      call.invocation.definitionKey,
      "stage",
      "code",
      "\t",
      Object.freeze({}),
    ],
    [
      "evidence",
      call.invocation.definitionKey,
      "stage",
      "code",
      "message",
      Object.freeze({ nonFinite: Number.NaN }),
    ],
  ]) {
    assert.throws(
      () => postAppendDefinitionFault(
        definitionKey,
        stage,
        code,
        message,
        receipt,
        evidence,
      ),
      TypeError,
      `the constructor rejects malformed ${label}`,
    );
  }

  const malformedFaultReceipt = Object.freeze({
    ...receipt,
    token: "wrong",
  });
  for (const issuedMalformedFault of [
    postAppendDefinitionFault(
      call.invocation.definitionKey,
      "synthetic_post_append",
      "synthetic_malformed_post_append_failure",
      "synthetic post-append fault with a malformed receipt",
      malformedFaultReceipt,
    ),
    postOwnerValidationDefinitionFault(
      call.invocation.definitionKey,
      "synthetic_post_owner_validation",
      "synthetic_malformed_post_owner_failure",
      "synthetic post-owner fault with a malformed receipt",
      malformedFaultReceipt,
    ),
  ]) {
    const malformedFaultBinding = bindings.bindStaticOwner(
      RUN_OPERATION_CONTRACTS.invoke.invoke,
      () => Effect.fail(issuedMalformedFault),
      assertionSchema,
      receiptSchema,
    );
    const malformedFaultHost = await runExactDefinition(
      call,
      malformedFaultBinding(call),
    );
    assert.equal(malformedFaultHost.exitCode, 70);
    assert.equal(
      malformedFaultHost.failure.failureKind,
      "defect_or_interruption",
      `${issuedMalformedFault.faultBoundary} cannot be downgraded to a typed pre-fault`,
    );
    assert.equal(malformedFaultHost.failure.fault, null);
    assert.equal(malformedFaultHost.resources, null);
    assert.match(
      malformedFaultHost.failure.cause,
      /owner emitted a malformed definition fault/,
    );
  }

  const validNonterminal = Object.freeze({
    invocationKind: "invoke",
    disposition: "held",
    run: coordinate("run://binding-algebra"),
    graphCall: coordinate("graph-call://binding-algebra"),
    interaction: null,
    gap: null,
    evidence: Object.freeze([coordinate("evidence://binding-algebra")]),
    replay: coordinate("replay://binding-algebra"),
  });
  for (const ownerOutput of [
    Object.freeze({ outcomeKind: "wrong", value: validNonterminal }),
    Object.freeze({ ...refusal, unexpected: true }),
  ]) {
    const invalidEnvelope = bindings.bindStaticOwner(
      RUN_OPERATION_CONTRACTS.invoke.invoke,
      () => Effect.succeed(Object.freeze({ ownerOutput, resources: receipt })),
      assertionSchema,
      receiptSchema,
    );
    const invalidEnvelopeFault = await faultOf(invalidEnvelope(call));
    assert.equal(invalidEnvelopeFault.code, "invalid_owner_output");
    assert.equal(
      invalidEnvelopeFault.faultBoundary,
      "post_owner_output_or_receipt_validation",
    );
    assert.strictEqual(invalidEnvelopeFault.resourceReceipt, receipt);
  }

  for (const [label, bind] of [
    ["read", bindings.bindExactPrefixRead],
    ["transition", bindings.bindExactPrefixTransition],
  ]) {
    let calls = 0;
    const bound = bind(
      RUN_OPERATION_CONTRACTS.invoke.invoke,
      () => {
        calls += 1;
        return Effect.succeed(Object.freeze({ ownerOutput: refusal, resources: receipt }));
      },
      assertionSchema,
      receiptSchema,
    );
    const regimeFault = await faultOf(bound(call));
    assert.equal(regimeFault.code, "invalid_resource_assertion", label);
    assert.equal(regimeFault.faultBoundary, "pre_acquisition_or_pre_append");
    assert.equal(regimeFault.resourceReceipt, null);
    assert.equal(calls, 0, `${label} rejects a shared synthetic regime pre-owner`);
  }

  for (const [label, bind] of [
    ["read", bindings.bindExactPrefixRead],
    ["transition", bindings.bindExactPrefixTransition],
  ]) {
    let calls = 0;
    const bound = bind(
      RUN_OPERATION_CONTRACTS.invoke.invoke,
      () => {
        calls += 1;
        return Effect.succeed(Object.freeze({ ownerOutput: refusal, resources: receipt }));
      },
      assertionSchema,
      receiptSchema,
    );
    for (const malformedResources of [
      null,
      undefined,
      false,
      0,
      "",
      Object.freeze([]),
      Object.freeze({ eventResource: null, token: "admitted" }),
    ]) {
      const malformedResourceFault = await faultOf(
        bound(exactInvokeCall(malformedResources)),
      );
      assert.equal(
        malformedResourceFault.code,
        "invalid_resource_assertion",
        `${label} structurally refuses ${String(malformedResources)}`,
      );
      assert.equal(
        malformedResourceFault.faultBoundary,
        "pre_acquisition_or_pre_append",
      );
      assert.equal(malformedResourceFault.resourceReceipt, null);
    }
    assert.equal(calls, 0, `${label} never dereferences or calls through malformed resources`);
  }

  const scratch = await mkdtemp(join(tmpdir(), "abi5-w2-05-binding-"));
  context.after(() => rm(scratch, { recursive: true, force: true }));
  const eventLogPath = join(scratch, "events.jsonl");
  const eventAssertionSchema = v.strictObject({
    eventResource: v.custom(validateAbgEventResourceAssertion),
    token: v.literal("admitted"),
  });
  const eventReceiptSchema = v.strictObject({
    eventResource: v.custom(validateAbgEventResourceReceipt),
    token: v.literal("closed"),
  });
  const transitionResources = Object.freeze({
    eventResource: Object.freeze({
      kind: "new_abg_event_resource",
      schemaVersion,
      eventLogPath,
      locatorDigest: abgEventLocatorDigest(eventLogPath),
    }),
    token: "admitted",
  });
  const exactOwner = (ownerCall) => {
    const acquired = acquireAbgEventResource(ownerCall.resources.eventResource);
    assert.equal(acquired.kind, "acquired_abg_event_resource");
    return Effect.succeed(Object.freeze({
      ownerOutput: refusal,
      resources: Object.freeze({
        eventResource: closeAbgEventResource(
          acquired.resource,
          acquired.resource.entryPrefix,
        ),
        token: "closed",
      }),
    }));
  };
  const transition = bindings.bindExactPrefixTransition(
    RUN_OPERATION_CONTRACTS.invoke.invoke,
    exactOwner,
    eventAssertionSchema,
    eventReceiptSchema,
  );
  const transitioned = await Effect.runPromise(
    transition(exactInvokeCall(transitionResources)),
  );
  assert.equal(transitioned.resources.eventResource.acquisitionKind, "new");
  assert.equal(
    transitioned.resources.eventResource.entryPrefix.coordinateDigest,
    transitioned.resources.eventResource.closeHandoff.prefix.coordinateDigest,
  );

  const readResources = Object.freeze({
    eventResource: Object.freeze({
      kind: "reopen_abg_event_resource",
      schemaVersion,
      closeHandoff: transitioned.resources.eventResource.closeHandoff,
      handoffDigest: sha256Canonical(
        transitioned.resources.eventResource.closeHandoff,
      ),
    }),
    token: "admitted",
  });
  const read = bindings.bindExactPrefixRead(
    RUN_OPERATION_CONTRACTS.invoke.invoke,
    exactOwner,
    eventAssertionSchema,
    eventReceiptSchema,
  );
  const readResult = await Effect.runPromise(read(exactInvokeCall(readResources)));
  assert.equal(readResult.resources.eventResource.acquisitionKind, "reopen");
  assert.equal(
    readResult.resources.eventResource.entryPrefix.coordinateDigest,
    readResult.resources.eventResource.closeHandoff.prefix.coordinateDigest,
  );

  for (const [label, bind, inputResources] of [
    ["read", bindings.bindExactPrefixRead, readResources],
    ["transition", bindings.bindExactPrefixTransition, transitionResources],
  ]) {
    const malformedFaultBinding = bind(
      RUN_OPERATION_CONTRACTS.invoke.invoke,
      () => Effect.fail(Object.freeze({ kind: "definition_execution_fault" })),
      eventAssertionSchema,
      eventReceiptSchema,
    );
    const malformedFaultCall = exactInvokeCall(inputResources);
    const malformedFaultHost = await runExactDefinition(
      malformedFaultCall,
      malformedFaultBinding(malformedFaultCall),
    );
    assert.equal(malformedFaultHost.exitCode, 70, label);
    assert.equal(
      malformedFaultHost.failure.failureKind,
      "defect_or_interruption",
      `${label} leaves a malformed fault-shaped owner cause to the shared shell`,
    );
    assert.equal(malformedFaultHost.failure.fault, null, label);
    assert.equal(malformedFaultHost.resources, null, label);
    assert.match(
      malformedFaultHost.failure.cause,
      /owner emitted a malformed definition fault/,
      label,
    );
  }

  const wrongReadReceipt = Object.freeze({
    eventResource: transitioned.resources.eventResource,
    token: "closed",
  });
  const wrongReadRelation = bindings.bindExactPrefixRead(
    RUN_OPERATION_CONTRACTS.invoke.invoke,
    () => Effect.succeed(Object.freeze({
      ownerOutput: refusal,
      resources: wrongReadReceipt,
    })),
    eventAssertionSchema,
    eventReceiptSchema,
  );
  const wrongReadRelationFault = await faultOf(
    wrongReadRelation(exactInvokeCall(readResources)),
  );
  assert.equal(
    wrongReadRelationFault.faultBoundary,
    "post_owner_output_or_receipt_validation",
  );
  assert.strictEqual(wrongReadRelationFault.resourceReceipt, wrongReadReceipt);

  const wrongTransitionReceipt = readResult.resources;
  const wrongTransitionRelation = bindings.bindExactPrefixTransition(
    RUN_OPERATION_CONTRACTS.invoke.invoke,
    () => Effect.succeed(Object.freeze({
      ownerOutput: refusal,
      resources: wrongTransitionReceipt,
    })),
    eventAssertionSchema,
    eventReceiptSchema,
  );
  const wrongTransitionRelationFault = await faultOf(
    wrongTransitionRelation(exactInvokeCall(transitionResources)),
  );
  assert.equal(
    wrongTransitionRelationFault.faultBoundary,
    "post_owner_output_or_receipt_validation",
  );
  assert.strictEqual(
    wrongTransitionRelationFault.resourceReceipt,
    wrongTransitionReceipt,
  );

  for (const [label, bind, inputResources] of [
    ["read", bindings.bindExactPrefixRead, readResources],
    ["transition", bindings.bindExactPrefixTransition, transitionResources],
  ]) {
    const invalidAbgProjection = bind(
      RUN_OPERATION_CONTRACTS.invoke.invoke,
      () => Effect.succeed(Object.freeze({
        ownerOutput: refusal,
        resources: receipt,
      })),
      eventAssertionSchema,
      receiptSchema,
    );
    const invalidAbgProjectionFault = await faultOf(
      invalidAbgProjection(exactInvokeCall(inputResources)),
    );
    assert.equal(invalidAbgProjectionFault.code, "invalid_resource_receipt");
    assert.equal(
      invalidAbgProjectionFault.faultBoundary,
      "post_owner_output_or_receipt_validation",
      `${label} enclosing validation cannot downgrade an admitted owner receipt`,
    );
    assert.strictEqual(invalidAbgProjectionFault.resourceReceipt, receipt);
  }
});
