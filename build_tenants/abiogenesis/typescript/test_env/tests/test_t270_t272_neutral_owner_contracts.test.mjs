import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  INTERACTION_RESPOND_NATIVE_CONTRACT_SOURCES,
  ONE_SURFACE_NATIVE_CONTRACT_SOURCES,
  RUN_CONTINUE_NATIVE_CONTRACT_SOURCES,
  RUN_INVOKE_NATIVE_CONTRACT_SOURCES
} from "../../build/semantic/code/src/abg/m03/contracts/one_surface_operation_contracts.js";
import {
  admitNative,
  projectNativeJsonSchema
} from "../../build/semantic/code/src/app/m04/public_contracts/native_contract_phase_a.js";
import {
  resolveSemanticBuildNativeSchemaSource
} from "../../build/semantic/code/src/shared/validation/canonical_native_schema_projector.js";

const DIGEST = `sha256:${"a".repeat(64)}`;
const OWNER_AUTHORITY_BY_OPERATION = Object.freeze({
  "abg.operation.run.invoke": Object.freeze({
    owner: Object.freeze({
      product: "abiogenesis",
      module: "abg.m03",
      family: "run_invoke"
    }),
    semanticOwnerBasis: Object.freeze({
      ref: "design://abg/m03/public-catalog-invocation-authority",
      digest:
        "sha256:71076f364d06a9725b5482ee0cdc84e64d29a4c18447a5ab4c41e1b62ba7f430"
    })
  }),
  "abg.operation.run.continue": Object.freeze({
    owner: Object.freeze({
      product: "abiogenesis",
      module: "abg.m03",
      family: "fh_runtime_continuation"
    }),
    semanticOwnerBasis: Object.freeze({
      ref: "design://abg/m03/fh-runtime-continuation",
      digest:
        "sha256:1b879535201080f5ed7da4bc781bd447fa46c72ad5f500c71e73e0b0ed62b0b2"
    })
  }),
  "abg.operation.interaction.respond": Object.freeze({
    owner: Object.freeze({
      product: "abiogenesis",
      module: "abg.m03",
      family: "fh_runtime_continuation"
    }),
    semanticOwnerBasis: Object.freeze({
      ref: "design://abg/m03/fh-runtime-continuation",
      digest:
        "sha256:1b879535201080f5ed7da4bc781bd447fa46c72ad5f500c71e73e0b0ed62b0b2"
    })
  })
});

function requestFixture(operationId, variant) {
  if (operationId === "abg.operation.run.invoke" && variant === "invoke") {
    return {
      kind: "run_invoke_request",
      variant,
      programRef: "program:consensus",
      programDigest: DIGEST,
      graphFunctionRef: "graph-function:consensus",
      graphFunctionDigest: DIGEST,
      inputContractRef: "contract:consensus-input",
      inputContractDigest: DIGEST,
      input: { ticketRef: "ticket:T-270" },
      catalogViewRef: "catalog-view:session",
      catalogViewDigest: DIGEST,
      allowlist: ["graph-function:consensus", "profile:reviewer"]
    };
  }
  if (operationId === "abg.operation.run.invoke" && variant === "start") {
    return {
      kind: "run_invoke_request",
      variant,
      programRef: "program:one-surface",
      programDigest: DIGEST,
      scope: {
        kind: "workspace",
        scopeRef: "workspace:current",
        scopeDigest: DIGEST
      },
      target: { kind: "graph_function", handle: "graph-function:consensus" },
      until: "blocked",
      catalogViewRef: "catalog-view:session",
      catalogViewDigest: DIGEST,
      allowlist: ["graph-function:consensus"],
      fhMode: "direct",
      rootMode: "supervised"
    };
  }
  if (
    operationId === "abg.operation.run.continue" &&
    variant === "current_intent"
  ) {
    return {
      kind: "run_continue_request",
      variant,
      runRef: "run:one",
      continuationRef: "continuation:one",
      continuationDigest: DIGEST,
      currentIntentRef: "intent:one",
      currentIntentDigest: DIGEST,
      continuationInputRef: "response:one",
      continuationInputDigest: DIGEST,
      expectedExecutionBasisRef: "execution-basis:one",
      expectedExecutionBasisDigest: DIGEST
    };
  }
  if (
    operationId === "abg.operation.run.continue" &&
    variant === "selected_action"
  ) {
    return {
      kind: "run_continue_request",
      variant,
      runRef: "run:one",
      continuationRef: "continuation:one",
      continuationDigest: DIGEST,
      nextActionProjectionRef: "next-action-projection:one",
      nextActionProjectionDigest: DIGEST,
      basisRelation: { kind: "same_basis" }
    };
  }
  return {
    kind: "interaction_respond_request",
    responseKind: variant,
    interactionRef: "interaction:one",
    interactionBasisDigest: DIGEST,
    responseContractRef: "contract:interaction-response",
    responseContractDigest: DIGEST,
    choiceRef: variant === "select" ? "choice:approve" : null,
    value: variant === "select" ? null : { accepted: variant === "approve" },
    evidenceRefs: ["evidence:operator-response"],
    capabilityProvenanceRefs: ["capability-provenance:operator"]
  };
}

function resultFixture(operationId, variant) {
  if (operationId === "abg.operation.run.invoke") {
    return {
      kind: "run_invoke_result",
      variant,
      disposition: "completed",
      phase: "post_effect",
      runRef: "run:one",
      graphCallRef: "graph-call:one",
      resultRef: "result:one",
      stopRef: null,
      failureRef: null,
      evidenceRefs: ["evidence:run"],
      replayRef: "replay:one"
    };
  }
  if (operationId === "abg.operation.run.continue") {
    const common = {
      kind: "run_continue_result",
      variant,
      disposition: "completed",
      phase: "post_effect",
      runRef: "run:one",
      stopRef: null,
      failureRef: null,
      evidenceRefs: ["evidence:continuation"],
      replayRef: "replay:one"
    };
    return variant === "current_intent"
      ? {
          ...common,
          currentIntentRef: "intent:one",
          successorReceiptRef: "receipt:one"
        }
      : {
          ...common,
          constructionIntentRef: "intent:construction",
          graphCallRef: "graph-call:one"
        };
  }
  return {
    kind: "interaction_respond_result",
    responseKind: variant,
    interactionRef: "interaction:one",
    responseRef: "response:one",
    respondedEventRef: "event:interaction-responded",
    interactionProjectionRef: "interaction-projection:one",
    interactionProjectionDigest: DIGEST,
    evidenceRefs: ["evidence:response"],
    replayRef: "replay:one"
  };
}

function refusalFixture(operationId, variant) {
  if (operationId === "abg.operation.run.invoke") {
    return {
      kind: "run_invoke_refusal",
      variant,
      phase: "pre_effect",
      code: "program_invalid",
      message: "The admitted program is invalid.",
      residualRefs: ["residual:program"]
    };
  }
  if (operationId === "abg.operation.run.continue") {
    return {
      kind: "run_continue_refusal",
      variant,
      phase: "pre_effect",
      code:
        variant === "current_intent"
          ? "continuation_missing"
          : "next_action_stale",
      message: "The admitted continuation basis is unavailable.",
      residualRefs: ["residual:continuation"]
    };
  }
  return {
    kind: "interaction_respond_refusal",
    responseKind: variant,
    code: "response_contract_mismatch",
    message: "The response does not match the declared contract.",
    residualRefs: ["residual:response"]
  };
}

function nonterminalFixture(operationId, variant) {
  if (operationId === "abg.operation.run.invoke") {
    return {
      kind: "run_invoke_nonterminal",
      variant,
      disposition: "held",
      phase: "post_effect",
      runRef: "run:one",
      graphCallRef: "graph-call:one",
      interactionRef: "interaction:one",
      gapProjectionRef: null,
      evidenceRefs: ["evidence:hold"],
      replayRef: "replay:one"
    };
  }
  if (operationId === "abg.operation.run.continue") {
    const common = {
      kind: "run_continue_nonterminal",
      variant,
      disposition: "gap_stop",
      phase: "post_effect",
      runRef: "run:one",
      continuationRef: "continuation:one",
      interactionRef: null,
      gapProjectionRef: "gap-projection:one",
      evidenceRefs: ["evidence:gap"],
      replayRef: "replay:one"
    };
    return variant === "current_intent"
      ? { ...common, successorReceiptRef: "receipt:one" }
      : {
          ...common,
          constructionIntentRef: "intent:construction",
          graphCallRef: "graph-call:one"
        };
  }
  return {
    kind: "interaction_respond_nonterminal",
    responseKind: variant,
    disposition: "responded",
    interactionRef: "interaction:one",
    responseRef: "response:one",
    continuationRef: "continuation:one",
    interactionProjectionRef: "interaction-projection:one",
    interactionProjectionDigest: DIGEST,
    evidenceRefs: ["evidence:response"],
    replayRef: "replay:one"
  };
}

const fixtureBySlot = {
  request: requestFixture,
  result: resultFixture,
  refusal: refusalFixture,
  nonterminal: nonterminalFixture
};

function allSources() {
  return Object.values(ONE_SURFACE_NATIVE_CONTRACT_SOURCES).flatMap((family) =>
    Object.values(family).flatMap((variant) => Object.values(variant))
  );
}

function sourceSubject(source) {
  return source.authority.subject;
}

async function resolveSourceLocator(source) {
  assert.equal(
    source.sourceLocator.kind,
    "private_source_module"
  );
  assert.equal(
    source.sourceLocator.sourceRoot,
    "semantic_build"
  );
  assert.equal(
    source.sourceLocator.modulePath,
    "code/src/abg/m03/contracts/one_surface_operation_contracts.js"
  );
  assert.equal(
    source.sourceLocator.exportName,
    "ONE_SURFACE_NATIVE_CONTRACT_SOURCES"
  );
  const sourceRoot = new URL("../../build/semantic/", import.meta.url);
  const sourceModule = await import(
    new URL(source.sourceLocator.modulePath, sourceRoot).href
  );
  return source.sourceLocator.memberPath.reduce(
    (value, member) => Reflect.get(value, member),
    Reflect.get(sourceModule, source.sourceLocator.exportName)
  );
}

function assertAdmissionRefused(source, candidate) {
  assert.throws(
    () => admitNative(source.schema, candidate),
    /Invalid (?:key|type)|Expected Object|received null|received undefined/u
  );
}

test("T-270/T-272 own one strict 36-source contract family", async () => {
  assert.deepEqual(Object.keys(RUN_INVOKE_NATIVE_CONTRACT_SOURCES), [
    "invoke",
    "start"
  ]);
  assert.deepEqual(Object.keys(RUN_CONTINUE_NATIVE_CONTRACT_SOURCES), [
    "current_intent",
    "selected_action"
  ]);
  assert.deepEqual(Object.keys(INTERACTION_RESPOND_NATIVE_CONTRACT_SOURCES), [
    "select",
    "approve",
    "reject",
    "assess",
    "answer_escalation"
  ]);

  const sources = allSources();
  assert.equal(sources.length, 36);
  assert.equal(new Set(sources.map((source) => source.identity.contractId)).size, 36);
  assert.equal(new Set(sources.map((source) => source.identity.schemaId)).size, 36);
  assert.equal(new Set(sources.map(
    (source) => `${source.authority.owner.module}\u0000${source.authority.owner.family}`
  )).size, 2);
  assert.equal(new Set(sources.map((source) => {
    const subject = sourceSubject(source);
    return `${subject.operationId}\u0000${subject.variant}\u0000${subject.slot}`;
  })).size, 36);

  for (const source of sources) {
    const subject = sourceSubject(source);
    const suffix = `${subject.operationId.slice("abg.operation.".length)}.${subject.variant}.${subject.slot}`;
    assert.equal(source.identity.contractId, `abg.contract.operation.${suffix}`);
    assert.equal(source.identity.schemaId, `abg.schema.operation.${suffix}`);
    assert.equal(source.kind, "owner_native_operation_contract_source");
    assert.equal(source.authority.kind, "owner_native_operation_contract_authority");
    assert.equal(source.authority.carrierRevision, "5.0.0");
    assert.equal(Object.hasOwn(source.authority, "lawBasis"), false);
    assert.deepEqual(
      {
        owner: source.authority.owner,
        semanticOwnerBasis: source.authority.semanticOwnerBasis
      },
      OWNER_AUTHORITY_BY_OPERATION[subject.operationId]
    );
    assert.equal(Object.isFrozen(source.authority), true);
    assert.equal(Object.isFrozen(source.authority.owner), true);
    assert.equal(Object.isFrozen(source.authority.semanticOwnerBasis), true);
    assert.equal(Object.isFrozen(subject), true);
    assert.equal(Object.isFrozen(source.sourceLocator), true);
    assert.equal(Object.isFrozen(source.sourceLocator.memberPath), true);
    assert.equal(source.sourceLocator.memberPath.at(-1), "schema");
    assert.equal(Object.isFrozen(source.schema), true);
    assert.equal(Object.hasOwn(source.identity, "nativeLocator"), false);
    assert.equal(Object.hasOwn(source.sourceLocator, "packageName"), false);
    assert.equal(Object.hasOwn(source.sourceLocator, "packageExport"), false);
    assert.equal(await resolveSourceLocator(source), source.schema);
    await resolveSemanticBuildNativeSchemaSource(source);
    const fixture = fixtureBySlot[subject.slot](subject.operationId, subject.variant);
    assert.deepEqual(admitNative(source.schema, fixture), fixture);

    const projectedSchema = projectNativeJsonSchema(source.schema);
    assert.equal(
      projectedSchema.$schema,
      "https://json-schema.org/draft/2020-12/schema"
    );
  }
});

test("T-270/T-272 request admission is strict and keeps AF-13 selection derived", () => {
  for (const source of allSources().filter(
    (candidate) => sourceSubject(candidate).slot === "request"
  )) {
    const subject = sourceSubject(source);
    const fixture = fixtureBySlot.request(subject.operationId, subject.variant);
    assertAdmissionRefused(source, { ...fixture, unexpected: true });
  }

  const selectedAction = RUN_CONTINUE_NATIVE_CONTRACT_SOURCES.selected_action.request;
  const selectedActionSubject = sourceSubject(selectedAction);
  const fixture = requestFixture(
    selectedActionSubject.operationId,
    selectedActionSubject.variant
  );
  assert.doesNotThrow(() => admitNative(selectedAction.schema, fixture));
  assertAdmissionRefused(selectedAction, {
    ...fixture,
    selectedActionRef: "action:caller-authored"
  });
});

test("T-270 start modes exclude non-default control before converged admission", () => {
  const source = RUN_INVOKE_NATIVE_CONTRACT_SOURCES.start.request;
  const subject = sourceSubject(source);
  const admitted = requestFixture(subject.operationId, subject.variant);
  assert.doesNotThrow(() => admitNative(source.schema, admitted));

  for (const until of ["first_traversal", "blocked"]) {
    assertAdmissionRefused(source, {
      ...admitted,
      until,
      fhMode: "human-proxy"
    });
    assertAdmissionRefused(source, {
      ...admitted,
      until,
      rootMode: "direct"
    });
  }
  assert.doesNotThrow(() => admitNative(source.schema, {
    ...admitted,
    until: "converged",
    fhMode: "human-proxy",
    rootMode: "direct"
  }));
  const { fhMode: _fhMode, rootMode: _rootMode, ...withoutDefinitionDefaults } = admitted;
  assertAdmissionRefused(source, withoutDefinitionDefaults);
});

test("T-270/T-272 preserve the declared F_H choice and value relation", () => {
  const select = INTERACTION_RESPOND_NATIVE_CONTRACT_SOURCES.select.request;
  const selectSubject = sourceSubject(select);
  const selectFixture = requestFixture(
    selectSubject.operationId,
    selectSubject.variant
  );
  assert.throws(
    () => admitNative(select.schema, { ...selectFixture, choiceRef: null }),
    /received null/u
  );
  assert.doesNotThrow(() => admitNative(select.schema, {
    ...selectFixture,
    value: { selected: "choice:approve" }
  }));
  const { value: _selectValue, ...selectWithoutValue } = selectFixture;
  assertAdmissionRefused(select, selectWithoutValue);

  const approve = INTERACTION_RESPOND_NATIVE_CONTRACT_SOURCES.approve.request;
  const approveSubject = sourceSubject(approve);
  const approveFixture = requestFixture(
    approveSubject.operationId,
    approveSubject.variant
  );
  assert.doesNotThrow(() => admitNative(approve.schema, approveFixture));
  assert.doesNotThrow(() => admitNative(approve.schema, {
    ...approveFixture,
    choiceRef: "choice:caller-supplied"
  }));
  const { value: _approveValue, ...approveWithoutValue } = approveFixture;
  assertAdmissionRefused(approve, approveWithoutValue);
  assert.throws(
    () => admitNative(approve.schema, { ...approveFixture, value: -0 }),
    /canonical I-JSON/u
  );
  assert.throws(
    () => admitNative(approve.schema, {
      ...approveFixture,
      evidenceRefs: ["evidence:duplicate", "evidence:duplicate"]
    }),
    /duplicate or missing stable identity/u
  );

  const invokeResult = RUN_INVOKE_NATIVE_CONTRACT_SOURCES.invoke.result;
  const invokeResultSubject = sourceSubject(invokeResult);
  assert.throws(
    () => admitNative(invokeResult.schema, {
      ...resultFixture(
        invokeResultSubject.operationId,
        invokeResultSubject.variant
      ),
      disposition: "accepted"
    }),
    /Invalid type/u
  );

  const refusal = RUN_CONTINUE_NATIVE_CONTRACT_SOURCES.selected_action.refusal;
  const refusalSubject = sourceSubject(refusal);
  assert.throws(
    () => admitNative(refusal.schema, {
      ...refusalFixture(refusalSubject.operationId, refusalSubject.variant),
      code: "caller_selected_action"
    }),
    /Invalid type/u
  );
});

test("T-270 invoke outcomes exclude nullable loci and ambiguous runtime failure phases", () => {
  const result = RUN_INVOKE_NATIVE_CONTRACT_SOURCES.invoke.result;
  const resultSubject = sourceSubject(result);
  const completed = resultFixture(resultSubject.operationId, resultSubject.variant);
  assert.doesNotThrow(() => admitNative(result.schema, completed));
  assertAdmissionRefused(result, { ...completed, graphCallRef: null });

  const blocked = {
    ...completed,
    disposition: "blocked",
    resultRef: null,
    stopRef: "stop:blocked",
    failureRef: null
  };
  assert.doesNotThrow(() => admitNative(result.schema, blocked));
  assertAdmissionRefused(result, { ...blocked, graphCallRef: null });
  assertAdmissionRefused(result, { ...blocked, resultRef: "result:contradictory" });

  const runtimeFailed = {
    ...completed,
    disposition: "runtime_failed",
    resultRef: null,
    stopRef: null,
    failureRef: "failure:runtime"
  };
  assert.doesNotThrow(() => admitNative(result.schema, runtimeFailed));
  assertAdmissionRefused(result, { ...runtimeFailed, phase: "pre_effect" });

  const refusal = RUN_INVOKE_NATIVE_CONTRACT_SOURCES.invoke.refusal;
  const refusalSubject = sourceSubject(refusal);
  const preEffect = {
    ...refusalFixture(refusalSubject.operationId, refusalSubject.variant),
    code: "runtime_failed"
  };
  assert.doesNotThrow(() => admitNative(refusal.schema, preEffect));
  assertAdmissionRefused(refusal, { ...preEffect, phase: "post_effect" });
});

test("T-270 start and nonterminal outcomes admit only typed stop/locus combinations", () => {
  const startResult = RUN_INVOKE_NATIVE_CONTRACT_SOURCES.start.result;
  const startSubject = sourceSubject(startResult);
  const completed = resultFixture(startSubject.operationId, startSubject.variant);
  const preInvocationStop = {
    ...completed,
    disposition: "blocked",
    phase: "pre_invocation_stop",
    graphCallRef: null,
    resultRef: null,
    stopRef: "stop:before-graph-call",
    failureRef: null
  };
  assert.doesNotThrow(() => admitNative(startResult.schema, preInvocationStop));
  assertAdmissionRefused(startResult, {
    ...preInvocationStop,
    phase: "post_effect"
  });
  assertAdmissionRefused(startResult, {
    ...preInvocationStop,
    resultRef: "result:impossible"
  });

  const invokeNonterminal = RUN_INVOKE_NATIVE_CONTRACT_SOURCES.invoke.nonterminal;
  const invokeSubject = sourceSubject(invokeNonterminal);
  const held = nonterminalFixture(invokeSubject.operationId, invokeSubject.variant);
  assert.doesNotThrow(() => admitNative(invokeNonterminal.schema, held));
  assertAdmissionRefused(invokeNonterminal, { ...held, graphCallRef: null });
  assertAdmissionRefused(invokeNonterminal, { ...held, interactionRef: null });

  const gapStop = {
    ...held,
    disposition: "gap_stop",
    phase: "pre_invocation_stop",
    graphCallRef: null,
    interactionRef: null,
    gapProjectionRef: "gap-projection:one"
  };
  assert.doesNotThrow(() => admitNative(invokeNonterminal.schema, gapStop));
  assertAdmissionRefused(invokeNonterminal, {
    ...gapStop,
    graphCallRef: "graph-call:contradictory"
  });
});

test("T-272 continuation outcomes exclude missing conserved loci", () => {
  const current = RUN_CONTINUE_NATIVE_CONTRACT_SOURCES.current_intent.result;
  const currentSubject = sourceSubject(current);
  const currentCompleted = resultFixture(
    currentSubject.operationId,
    currentSubject.variant
  );
  assert.doesNotThrow(() => admitNative(current.schema, currentCompleted));
  assertAdmissionRefused(current, {
    ...currentCompleted,
    successorReceiptRef: null
  });

  const selected = RUN_CONTINUE_NATIVE_CONTRACT_SOURCES.selected_action.result;
  const selectedSubject = sourceSubject(selected);
  const selectedCompleted = resultFixture(
    selectedSubject.operationId,
    selectedSubject.variant
  );
  assert.doesNotThrow(() => admitNative(selected.schema, selectedCompleted));
  assertAdmissionRefused(selected, { ...selectedCompleted, graphCallRef: null });
  assertAdmissionRefused(selected, {
    ...selectedCompleted,
    constructionIntentRef: null
  });
  const runtimeFailed = {
    ...selectedCompleted,
    disposition: "runtime_failed",
    failureRef: "failure:continuation"
  };
  assert.doesNotThrow(() => admitNative(selected.schema, runtimeFailed));
  assertAdmissionRefused(selected, { ...runtimeFailed, phase: "pre_effect" });

  const refusal = RUN_CONTINUE_NATIVE_CONTRACT_SOURCES.selected_action.refusal;
  const refusalSubject = sourceSubject(refusal);
  const preEffectRefusal = {
    ...refusalFixture(refusalSubject.operationId, refusalSubject.variant),
    code: "runtime_failed"
  };
  assert.doesNotThrow(() => admitNative(refusal.schema, preEffectRefusal));
  assertAdmissionRefused(refusal, {
    ...preEffectRefusal,
    phase: "post_effect"
  });

  const currentNonterminal =
    RUN_CONTINUE_NATIVE_CONTRACT_SOURCES.current_intent.nonterminal;
  const currentNonterminalSubject = sourceSubject(currentNonterminal);
  const currentGap = nonterminalFixture(
    currentNonterminalSubject.operationId,
    currentNonterminalSubject.variant
  );
  assert.doesNotThrow(() => admitNative(currentNonterminal.schema, currentGap));
  assertAdmissionRefused(currentNonterminal, {
    ...currentGap,
    successorReceiptRef: null
  });
});

test("T-272 response nonterminal excludes a second held disposition", () => {
  const source = INTERACTION_RESPOND_NATIVE_CONTRACT_SOURCES.approve.nonterminal;
  const subject = sourceSubject(source);
  const responded = nonterminalFixture(subject.operationId, subject.variant);
  assert.doesNotThrow(() => admitNative(source.schema, responded));
  assertAdmissionRefused(source, { ...responded, disposition: "held" });
});

test("T-270/T-272 neutral owner contracts remain unexported and non-executing", async () => {
  const [m03Index, rootIndex, source] = await Promise.all([
    readFile("code/src/abg/m03/index.ts", "utf8"),
    readFile("code/src/index.ts", "utf8"),
    readFile(
      "code/src/abg/m03/contracts/one_surface_operation_contracts.ts",
      "utf8"
    )
  ]);
  for (const publicIndex of [m03Index, rootIndex]) {
    assert.doesNotMatch(publicIndex, /one_surface_operation_contracts/u);
    assert.doesNotMatch(publicIndex, /ONE_SURFACE_NATIVE_CONTRACT_SOURCES/u);
  }
  assert.doesNotMatch(source, /app\/m04|defineNativeContract|PublicInvocation/u);
  assert.doesNotMatch(
    source,
    /one_surface_native_contract_source|\blawBasis\b/u
  );
  assert.doesNotMatch(
    source,
    /(?:function|const)\s+\w*Handler|invokeAdmitted|runEngine|eventSink/u
  );
});
