import assert from "node:assert/strict";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { SourceTextModule, SyntheticModule } from "node:vm";
import ts from "typescript";

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
import * as resourceOwner from "../../build/code/src/abg/definition_event_resource.js";
import * as eventOwner from "../../build/code/src/abg/event_store.js";
import * as callAdmission from "../../build/code/src/shared/definition_binding_mechanics.js";

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
    assert.equal(calls, 0, `${label} rejects a shared synthetic regime pre-owner`);
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

  const malformedReadReceipt = bindings.bindExactPrefixRead(
    RUN_OPERATION_CONTRACTS.invoke.invoke,
    () => Effect.succeed(Object.freeze({
      ownerOutput: refusal,
      resources: null,
    })),
    eventAssertionSchema,
    eventReceiptSchema,
  );
  const malformedReadReceiptFault = await faultOf(
    malformedReadReceipt(exactInvokeCall(readResources)),
  );
  assert.equal(malformedReadReceiptFault.code, "invalid_resource_receipt");
});

// Evaluate the changed source without mutating generated output. Overrides are
// passive delegating counters and the same source owner composed through them.
async function observedSource(relative, overrides = {}, emitted = false) {
  const root = resolve(import.meta.dirname, '../..');
  const built = join(root, 'build/code/src', relative + '.js');
  const preimage = emitted && relative === 'public/installed_definition_call_transport'
    ? process.env.ABI5_OWNED_ADMISSION_PREIMAGE : undefined;
  const text = await readFile(preimage ?? (emitted ? built : join(root, 'code/src', relative + '.ts')), 'utf8');
  const module = new SourceTextModule(emitted && preimage === undefined ? text : ts.transpileModule(text, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText, { identifier: built, initializeImportMeta(meta) { meta.url = pathToFileURL(built).href; },
    importModuleDynamically: specifier => import(specifier) });
  await module.link(async specifier => {
    const url = specifier.startsWith('.') ? pathToFileURL(resolve(dirname(built), specifier)).href : specifier;
    const values = { ...await import(url), ...overrides[specifier] };
    return new SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    });
  });
  await module.evaluate();
  return module.namespace;
}

function absentSetupCatalog(root) {
  // Structurally valid unadmitted setup: the actual Run owner must refuse it.
  const digest = sha256Canonical('unadmitted setup');
  const workspaceBinding = {kind:'workspace_binding_candidate',schemaVersion,
    bindingId:'binding://absent',bindingDigest:digest,workspaceId:'workspace://absent',
    authorityBasisId:'authority://absent',authorityBasisDigest:digest,authorizedActorRef:'actor://absent',
    productSetId:'products://absent',productSetDigest:digest,lockId:'lock://absent',lockDigest:digest,
    roots:Object.fromEntries(['toolchainRoot','productRoot','eventLogRoot','runtimeStateRoot','projectionRoot','archiveRoot'].map(key=>[key,root]))};
  const resolvedLock = {kind:'resolved_product_lock',schemaVersion,lockId:workspaceBinding.lockId,
    lockDigest:digest,nativeContractClosureDigest:digest,rows:[],dependencyEdges:[]};
  return {kind:'graph_function_catalog',schemaVersion,basisDigest:digest,publicationDigests:[],entries:[],byHandle:{},
    declarationEntries:[],declarationsByHandle:{},readinessBasisDigest:digest,workspaceBindingId:workspaceBinding.bindingId,
    workspaceBindingDigest:digest,lockId:resolvedLock.lockId,lockDigest:digest,productSetId:workspaceBinding.productSetId,
    productSetDigest:digest,readinessBasis:{workspaceBinding,resolvedLock,verifiedProducts:[],installedProducts:[],publications:[]},
    boundPublications:[],rowDispositions:[]};
}

test('native transport delegates one complete admission to the real fixed Run owner and conserves refusal ordering', async t => {
  const root = await mkdtemp(join(tmpdir(), 'abi5-owned-admission-'));
  t.after(() => rm(root, {recursive:true,force:true}));
  let ownerAdmissions = 0, transportAdmissions = 0;
  const observedBindings = await observedSource('shared/static_definition_bindings', {
    './definition_binding_mechanics.js': {admitExactDefinitionCall(...args) {
      ownerAdmissions++; return callAdmission.admitExactDefinitionCall(...args);
    }},
  });
  const run = await observedSource('owner_bindings/run_invocation', {'../shared/static_definition_bindings.js':observedBindings}, true);
  const overrides = {
    '../product/index.js':{RUN_DEFINITION_BINDINGS:run.RUN_DEFINITION_BINDINGS},
    '../shared/definition_binding_mechanics.js':{admitExactDefinitionCall(...args) {
      transportAdmissions++; return callAdmission.admitExactDefinitionCall(...args);
    }},
  };
  const before = await observedSource('public/installed_definition_call_transport', overrides, true);
  const after = await observedSource('public/installed_definition_call_transport', overrides);
  function acquire(name) {
    const eventLogPath = join(root, name + '.jsonl');
    const opened = acquireAbgEventResource({kind:'new_abg_event_resource',schemaVersion,eventLogPath,
      locatorDigest:abgEventLocatorDigest(eventLogPath)});
    assert.equal(opened.kind,'acquired_abg_event_resource');
    t.after(()=>resourceOwner.abandonAbgEventResource(opened.resource));
    return opened.resource;
  }
  const held = acquire('held'), foreign = acquire('foreign');
  let selection = resourceOwner.selectAcquiredAbgEventResource(held,held.entryPrefix);
  const catalog = absentSetupCatalog(root);
  const catalogView = {kind:'graph_function_catalog_view',catalogBasisDigest:catalog.basisDigest,allowlist:[],
    entries:[],byHandle:{},declarationEntries:[],declarationsByHandle:{},viewDigest:catalog.basisDigest};
  const call = member => exactRunCall(member,{kind:'run_invocation_resource_assertion',schemaVersion,eventResource:selection,
    catalog,catalogView,applications:[],source:{kind:'none'}});
  const invoke = async (transport, value, selected = selection) => {
    ownerAdmissions = 0; transportAdmissions = 0;
    const outcome = await transport.runInstalledDefinitionCallWithResource(selected,value);
    return {outcome,ownerAdmissions,transportAdmissions};
  };
  const observations = [];
  for (const member of ['invoke','start']) {
    const old = await invoke(before,call(member)), current = await invoke(after,call(member));
    assert.deepEqual(current.outcome,old.outcome);
    assert.equal(current.outcome.receipt.ownerOutput.value.code,'invalid_program');
    assert.equal(current.outcome.receipt.failure,null);
    assert.equal(current.outcome.receipt.resources.eventResource.kind,'abg_event_resource_completion');
    assert.equal(old.ownerAdmissions,1);
    if(process.env.ABI5_OWNED_ADMISSION_PREIMAGE)assert.equal(old.transportAdmissions,1);
    assert.deepEqual([current.transportAdmissions,current.ownerAdmissions],[0,1]);
    observations.push({member,before:[old.transportAdmissions,old.ownerAdmissions],after:[current.transportAdmissions,current.ownerAdmissions]});
    resourceOwner.assertAcquiredAbgEventResourceSelectionCurrent(selection);
  }
  const valid = call('invoke');
  const copied = {...valid,invocation:structuredClone(valid.invocation)};
  assert.deepEqual((await invoke(after,copied)).outcome,(await invoke(before,copied)).outcome);
  for (const change of [
    value=>{value.request.catalogHandle += '/changed';},
    value=>{delete value.requestRef;},
    value=>{value.invocationAuthority.slots.actor.actor.ref += '/foreign';},
    value=>{value.definitionKey.memberKey='start';},
  ]) {
    const invocation=structuredClone(valid.invocation);change(invocation);
    const malformed={...valid,invocation};
    const old=await invoke(before,malformed),current=await invoke(after,malformed);
    assert.deepEqual(current.outcome,old.outcome);
    assert.equal(current.outcome.code,'invalid_definition_call');
    assert.deepEqual([current.transportAdmissions,current.ownerAdmissions],[0,1]);
  }
  const badResources={...valid,resources:{...valid.resources,unexpected:true}};
  const badBoth={...badResources,invocation:{...valid.invocation,requestDigest:sha256Canonical('changed')}};
  for(const value of [badResources,badBoth]) {
    assert.deepEqual((await invoke(after,value)).outcome,(await invoke(before,value)).outcome);
  }
  // These existing direct owners have different admission-fault ordering.
  // A live physical prefix cannot authorize this malformed semantic call.
  for(const definitionKey of [
    {operationId:'abg.operation.product.verify',memberKey:'verify'},
    {operationId:'abg.operation.project.read',memberKey:'catalog_list'},
  ]) {
    const value={invocation:{...valid.invocation,definitionKey},resources:{
      admissionAuthority:{basis:{boundEnvironment:{prefix:selection.prefix}}}}};
    const old=await invoke(before,value),current=await invoke(after,value);
    assert.deepEqual(current.outcome,old.outcome);
    assert.equal(current.outcome.code,'invalid_definition_call');
    assert.equal(current.transportAdmissions,1,'only the ambiguous admission failure uses compatibility re-admission');
  }
  assert.equal(held.store.readAll().length,0,'refused setup and malformed calls append nothing');
  for(const value of [{...valid,resources:{...valid.resources,eventResource:structuredClone(selection)}},
    {...valid,resources:{...valid.resources,eventResource:resourceOwner.selectAcquiredAbgEventResource(foreign,foreign.entryPrefix)}}]) {
    const refused=await invoke(after,value);
    assert.equal(refused.outcome.code,'acquisition_mismatch');
    assert.equal(refused.ownerAdmissions,0);
  }
  const coldHandoff=closeAbgEventResource(foreign,foreign.entryPrefix).closeHandoff;
  const coldCall={invocation:{...valid.invocation,definitionKey:{operationId:'abg.operation.project.read',memberKey:'workspace_replay'}},
    resources:{kind:'abg_project_read_resource_assertion',schemaVersion,eventResource:{kind:'reopen_abg_event_resource',schemaVersion,
      closeHandoff:coldHandoff,handoffDigest:resourceOwner.abgEventHandoffDigest(coldHandoff)}}};
  for(const transport of [before,after]) {
    ownerAdmissions=0;transportAdmissions=0;
    const result=await transport.runInstalledDefinitionCallTransport({kind:'reopen',closeHandoff:coldHandoff},coldCall);
    assert.equal(result.code,'invalid_definition_call');
    assert.deepEqual([transportAdmissions,ownerAdmissions],[1,0],'cold ingress retains its admission before legacy dispatch');
  }
  // A real unrelated append makes the previous physical entry selection stale.
  eventOwner.admitRuntimeEvent(held.store,{kind:'public_operation_admitted',eventTime:'2026-09-24T00:00:00.000Z',
    aggregateType:'workspace',aggregateId:'workspace://owned-admission',parentAggregateId:null,causationEventRefs:[],
    correlationId:'correlation://owned-admission',workflowVersion:schemaVersion,scopeClass:'workspace',basisId:'basis://owned-admission',
    payload:{operationId:'abg.operation.project.read',variant:'status',invocationRef:'invocation://owned-admission',invocationDigest:sha256Canonical('owned-admission')}});
  assert.equal((await invoke(after,valid)).outcome.code,'acquisition_mismatch');
  selection=resourceOwner.selectAcquiredAbgEventResource(held,eventOwner.selectHeldEventStoreDurablePrefix(held.store));
  const final=closeAbgEventResource(held,selection.prefix);
  assert.equal(final.kind,'abg_event_resource_receipt');
  assert.equal((await invoke(after,call('invoke'))).outcome.code,'acquisition_mismatch');
  t.diagnostic(JSON.stringify({kind:'native_call_admission_conservation',observations,rawCopyReAdmitted:true,
    malformedBeforeEffects:true,ambiguousAdmissionOrderingPreserved:true,coldAdmissionPreserved:true,
    resourceFaultPreserved:true,copiedForeignStaleReleasedRefused:true,realOuterClose:true,
    limits:'Actual fixed Run owners consume a structurally valid unadmitted Catalog and return setup refusal; no Run or installed successor is claimed.'}));
});

const preparationCallPath = process.env.ABI5_PREPARATION_RESOLVE_CALL;
const retainedPreparation = preparationCallPath
  ? readFile(preparationCallPath, 'utf8').then(JSON.parse) : null;

test('preparation resolution retains its established native link and raw lock refusals', {
  skip: !retainedPreparation,
}, async t => {
  const call = await retainedPreparation;
  const declarations = await import('../../build/code/src/product/declaration_exports.js');
  let links = 0;
  const environment = await observedSource('product/environment', {
    './declaration_exports.js': { linkNativeContractSet(...args) {
      links++; return declarations.linkNativeContractSet(...args);
    } },
  });
  // Exercise the actual fixed resolver/projection; external grant admission is
  // already covered by the retained call and is not a claim of this component check.
  const definitions = await observedSource('product/environment_definition_bindings', {
    './environment.js': environment,
    './admission_authority.js': { withAdmissionAuthority: (_packet, owner) => owner },
  });
  const { admissionAuthority, ...resources } = call.resources;
  const value = await Effect.runPromise(definitions.PRODUCT_ENVIRONMENT_DEFINITION_BINDINGS.resolve({
    ...call, resources,
  }));
  assert.equal(links, 1, 'one actual link, reused by the output projection');
  const prior = JSON.parse(await readFile(preparationCallPath.replace('/calls/', '/receipts/'), 'utf8'));
  assert.deepEqual(value.ownerOutput, prior.receipt.ownerOutput);
  assert.deepEqual(value.resources, prior.receipt.resources);
  const artifacts = resources.verifiedPreimages.map(x => x.verifiedArtifact);
  const environmentModule = await import('../../build/code/src/product/environment.js');
  const resolved = environment.resolveProductArtifacts(artifacts);
  assert.equal(resolved.kind, 'resolved_product_environment');
  assert.equal(environmentModule.isResolvedProductLock(structuredClone(resolved.lock)), true);
  assert.equal(environmentModule.verifiedArtifactMatchesResolvedLock(artifacts[0], resolved.lock), true);
  const wrongLock = structuredClone(resolved.lock);
  wrongLock.rows[0].productContentDigest = sha256Canonical('foreign Product');
  assert.equal(environmentModule.verifiedArtifactMatchesResolvedLock(artifacts[0], wrongLock), false);
  const forged = structuredClone(artifacts[0]); forged.verificationDigest = sha256Canonical('foreign body');
  assert.equal(environment.resolveProductArtifacts([forged]).code, 'lock_mismatch');
  const install = await import('../../build/code/src/product/install_product.js');
  assert.equal((await install.installProduct({verifiedArtifact:artifacts[0],resolvedLock:wrongLock})).code,
    'dependency_lock_mismatch', 'bad basis refuses before any physical install');
  const crossed = { ...resources, nativeContractClosure: { ...resources.nativeContractClosure,
    occurrences: [] } };
  // Force a genuinely different carrier even if this particular closure has no occurrences.
  crossed.nativeContractClosure.selectorDispositions = [{foreign:true}];
  await assert.rejects(Effect.runPromise(definitions.PRODUCT_ENVIRONMENT_DEFINITION_BINDINGS.resolve({
    ...call, resources:crossed,
  })), /resolved native closure differs/);
  t.diagnostic('Actual native link and owner projection equal retained successful output; external grants/history not reacquired.');
});

test('preparation module loading shares one physical basis and reacquires changed content', async t => {
  const {writeFile} = await import('node:fs/promises');
  const root = await mkdtemp(join(tmpdir(), 'abi5-preparation-modules-'));
  t.after(() => rm(root,{recursive:true,force:true}));
  const modulePath='leaf.mjs', path=join(root,modulePath);
  const implementation = { implementationRef:'implementation://preparation/leaf',packageName:'fixture',packageVersion:'1',
    modulePath,namedSymbol:'leaf',computeRegime:'F_D',inputContractRef:'contract://input',outputContractRef:'contract://output',
    failureContractRef:'contract://failure',refusalContractRef:'contract://refusal'};
  const descriptor={kind:'packaged_leaf_implementation_descriptor',schemaVersion,
    ...implementation,descriptorDigest:sha256Canonical(implementation)};
  const code=`export const leaf=${JSON.stringify(descriptor)};\n`;
  await writeFile(path,code);
  const install=Object.freeze({installedRoot:root,packageName:'fixture',packageVersion:'1',productContentDigest:sha256Canonical(code)});
  let physicalChecks=0;
  // Controlled physical boundary over an actual small file; the unchanged full
  // Product inventory verifier is not requalified by this module-scope check.
  const modules=await observedSource('product/installed_module',{'./install_product.js':{
    async installedProductContentMatches(selected) {
      physicalChecks++; return selected===install && await readFile(path,'utf8')===code;
    },
  }});
  const descriptors=await import('../../build/code/src/product/implementation_resolution.js');
  const publication={implementationBindings:[{packageName:'fixture',packageVersion:'1',modulePath}]};
  const prepared=await modules.prepareInstalledProductModules(install);
  for(let n=0;n<2;n++) assert.deepEqual(await descriptors.implementationDescriptorsFromProduct(install,publication,prepared),[descriptor]);
  assert.equal(physicalChecks,1);
  assert.equal((await prepared.load('../escape.mjs')).code,'path_escape');
  assert.equal((await prepared.load('absent.mjs')).code,'load_failed');
  assert.equal((await descriptors.implementationDescriptorsFromProduct({...install},publication,prepared)).code,'implementation_absent');
  assert.equal((await descriptors.implementationDescriptorsFromProduct(install,{implementationBindings:[{packageName:'foreign',packageVersion:'1',modulePath}]},prepared)).code,'implementation_absent');
  await writeFile(path,code+'// changed after the completed resolution\n');
  assert.equal((await modules.prepareInstalledProductModules(install)).code,'content_mismatch');
  assert.equal(physicalChecks,2,'a new resolution must re-establish physical content');
  t.diagnostic('Two descriptor projections share one physical result; new acquisition, path, absent module and crossed install refuse.');
});

test('native detachment retains only actual immutable verifier bodies and detaches raw copies', {
  skip: !retainedPreparation,
}, async t => {
  const original=await retainedPreparation;
  const verification=await import('../../build/code/src/product/verify_product.js');
  const owner=original.resources.admissionAuthority.basis.ownerArtifact;
  const verified=await verification.verifyProduct(owner.request);
  assert.equal(verified.kind,'verified_product_artifact');
  assert.equal(Object.isFrozen(verified),true);
  const raw=structuredClone(verified);
  assert.equal(verification.retainedProductVerification(raw),null);
  assert.equal(verification.isVerifiedProductArtifact(raw),true,'raw value retains its structural admission route');
  const malformed=structuredClone(raw); malformed.verificationDigest=sha256Canonical('malformed');
  assert.equal(verification.isVerifiedProductArtifact(malformed),false);
  let received;
  const transport=await observedSource('public/installed_definition_call_transport',{
    '../product/index.js':{PRODUCT_ENVIRONMENT_DEFINITION_BINDINGS:{resolve(call){received=call;
      return Effect.fail({kind:'definition_execution_fault',schemaVersion,definitionKey:call.invocation.definitionKey,
        stage:'test_capture',code:'captured',message:'detachment check only',evidence:{}});}}},
  });
  const candidate={...original,resources:{...original.resources,verifiedArtifact:verified,verifiedProducts:[verified,raw],
    verifiedPreimages:original.resources.verifiedPreimages.map((row,n)=>n===0?{...row,verifiedArtifact:verified}:row),
    admissionAuthority:{...original.resources.admissionAuthority,basis:{...original.resources.admissionAuthority.basis,
      ownerArtifact:{...owner,verified}}}}};
  const clone=globalThis.structuredClone;
  let copiedOwnedBody=false;
  const contains=(value,target,seen=new Set())=>{
    if(value===target)return true;
    if(value===null||typeof value!=='object'||seen.has(value))return false;
    seen.add(value);return Object.values(value).some(child=>contains(child,target,seen));
  };
  globalThis.structuredClone=(value,...rest)=>{copiedOwnedBody ||= contains(value,verified);return clone(value,...rest);};
  let result;
  try{result=await transport.runInstalledDefinitionCallTransport({kind:'eventless'},candidate);}
  finally{globalThis.structuredClone=clone;}
  assert.equal(result.kind,'installed_definition_call_transport_result');
  assert.equal(result.receipt.failure.fault.code,'captured');
  assert.equal(copiedOwnedBody,false,'the immutable body never entered structuredClone');
  assert.equal(received.resources.verifiedArtifact,verified);
  assert.equal(received.resources.verifiedProducts[0],verified);
  assert.equal(received.resources.verifiedPreimages[0].verifiedArtifact,verified);
  assert.equal(received.resources.admissionAuthority.basis.ownerArtifact.verified,verified);
  assert.notEqual(received.resources.verifiedProducts[1],raw);
  assert.equal(verification.retainedProductVerification(received.resources.verifiedProducts[1]),null);
  assert.deepEqual(received.resources.verifiedProducts[1],raw);
  assert.notEqual(received.invocation,candidate.invocation);
  assert.notEqual(received.resources.verifiedPreimages,candidate.resources.verifiedPreimages);
  t.diagnostic('Real verifier result retained; raw copy stays detached/unowned. Captured receiver is not an admission/effect claim.');
});
