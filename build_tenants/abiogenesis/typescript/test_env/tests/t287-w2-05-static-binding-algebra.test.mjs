import assert from "node:assert/strict";
import test from "node:test";

import * as Effect from "effect/Effect";
import * as v from "valibot";

import { RUN_OPERATION_CONTRACTS } from
  "../../build/code/src/product/run_operation_contracts.js";
import { sha256Canonical } from
  "../../build/code/src/shared/digests.js";
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

function exactInvokeCall(resources) {
  const packet = RUN_OPERATION_CONTRACTS.invoke.invoke;
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
  const request = Object.freeze({
    program: coordinate("program://binding-algebra"),
    catalogHandle: "graph-function://binding-algebra",
    inputContract: coordinate("contract://binding-algebra/input"),
    input: Object.freeze({ value: "admitted" }),
    catalogView: coordinate("catalog-view://binding-algebra"),
    allowlist: Object.freeze([]),
    sourceBasis: Object.freeze({ kind: "none" }),
  });
  const inputAuthority = Object.freeze({
    contract: request.inputContract,
    valueRef: "value://binding-algebra/input",
    valueDigest: sha256Canonical(request.input),
    value: request.input,
  });
  const slots = Object.freeze({
    workspace_binding: coordinate("workspace-binding://binding-algebra"),
    product_set: Object.freeze([coordinate("product-set://binding-algebra")]),
    dependency_lock: coordinate("product-lock://binding-algebra"),
    catalog_scope: Object.freeze({
      catalog: coordinate("catalog://binding-algebra"),
      view: request.catalogView,
      allowlist: Object.freeze([]),
    }),
    execution_program: request.program,
    graph_function: Object.freeze({
      graphFunction: coordinate("graph-function://binding-algebra"),
      membership: coordinate("program-membership://binding-algebra"),
    }),
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
  const invocationAuthority = Object.freeze({
    kind: "invocation_authority",
    definitionKey: definition.definitionKey,
    authorityDigest: sha256Canonical(slots),
    slots,
  });
  const invocationRef = "invocation://abiogenesis/t287/w2-05/binding-algebra";
  const requestDigest = sha256Canonical(request);
  const invocation = Object.freeze({
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
    invocationRef,
    invocationDigest: sha256Canonical({
      definitionKey: definition.definitionKey,
      definitionDigest: definition.definitionDigest,
      invocationRef,
      requestDigest,
      authorityDigest: invocationAuthority.authorityDigest,
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
    requestRef: `${invocationRef}/request`,
    requestDigest,
    request,
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
  return Object.freeze({ invocation, resources });
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

test("W2-05 three-function static binding algebra admits once and fails closed", async () => {
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

  const malformedResourceFault = await faultOf(staticBinding(Object.freeze({
    invocation: call.invocation,
    resources: Object.freeze({ ...resources, unexpected: true }),
  })));
  assert.equal(malformedResourceFault.code, "invalid_resource_assertion");
  assert.equal(staticCalls, 1, "malformed resources do not enter the owner");

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
  const malformedReceiptFault = await faultOf(malformedReceiptBinding(call));
  assert.equal(malformedReceiptFault.code, "invalid_resource_receipt");
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
  assert.equal(malformedOutputCalls, 1);

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
    await Effect.runPromise(bound(call));
    assert.equal(calls, 1, `${label} specialization calls its owner once`);
  }
});
