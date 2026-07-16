// Validates: T-280 exact One Surface replay/result binding.

import assert from "node:assert/strict";
import test from "node:test";

import {
  admitOneSurfaceResultForClose,
  compileOneSurfaceGtlProgramApplication,
  constructOneSurfaceAuthorityInputBasis,
  constructOneSurfaceTypedRefusal,
  deriveOneSurfaceAuthorityReplayProjection,
  deriveRuntimeEventCalculusProjection,
  loadGtlTargetCarrierDefaultsBundle,
  projectOneSurfaceAuthorityResult,
  resolveTargetCarrierContractBinding
} from "../../build/semantic/code/src/index.js";
import {
  scenario09OneSurfaceProgramFixture
} from "../fixtures/t280_scenario09_one_surface_fixture.mjs";
import {
  buildOneSurfacePayloadLedger as payloadLedger,
  buildOneSurfaceReplayAttempt as attempt,
  deriveOneSurfaceTestEffectRows as eventEffectRows,
  deriveOneSurfaceTestEventCalculus as eventCalculus
} from "./support/t280-one-surface-replay-fixtures.mjs";

function stageAuthorities(fixture) {
  return Object.freeze(fixture.compiled.map((row) => Object.freeze({
    functionKind: row.member.stageRole,
    stage: row.bundle.computeStageBindings[0],
    plan: row.source.completeProgramPlan,
    resultAuthority: row.authorities[0],
    traversalContracts: row.bundle
  })));
}

let compiledReplayFixtureCache = null;

function compiledReplayFixture() {
  compiledReplayFixtureCache ??= (async () => {
    const source = scenario09OneSurfaceProgramFixture();
    const compilation = await compileOneSurfaceGtlProgramApplication({
      gtlProgram: source.gtlProgram,
      stageAuthorities: stageAuthorities(source),
      recursePlan: source.recursePlan
    });
    assert.notEqual(compilation.authorityProgram, null);
    const application = compilation.authorityProgram;
    return Object.freeze({ application, source });
  })();
  return compiledReplayFixtureCache;
}

function stageFixture(compiled, index) {
  const { application, source } = compiled;
  const stage = application.stages[index];
  const contract = resolveTargetCarrierContractBinding({
    vector: source.members[index].finalVector,
    defaults: loadGtlTargetCarrierDefaultsBundle()
  });
  assert.equal(
    contract.contractRef,
    stage.resultAuthority.selectedResultContractRef
  );
  assert.equal(
    contract.configDigest,
    stage.targetCarrierContract.targetCarrierContractDigest
  );
  return Object.freeze({ application, contract, stage });
}

async function replayFixture(index = 0) {
  return stageFixture(await compiledReplayFixture(), index);
}

function successfulValue(stage) {
  switch (stage.functionKind) {
    case "synthesize_model":
      return Object.freeze({
        desiredAssetRefs: Object.freeze(["asset://t280/desired"]),
        knownAssetRefs: Object.freeze(["asset://t280/known"])
      });
    case "eval_gap":
      return Object.freeze({
        kind: "construction_observation_snapshot",
        episodeId: "episode://t280/one-surface",
        observationId: "observation://t280/one-surface",
        basisRef: "basis://t280/one-surface",
        currentProjectionRef: "projection://t280/one-surface",
        iterationOrdinal: 0,
        basisProjectionRef: "projection://t280/one-surface/basis",
        priorIntentId: null,
        causationRef: "causation://t280/one-surface",
        correlationId: "correlation://t280/one-surface",
        observedStateRefs: Object.freeze(["state://t280/observed"]),
        runtimeAggregateRefs: Object.freeze([]),
        linkedAssetRefs: Object.freeze([]),
        passedInputRefs: Object.freeze([]),
        gapProjectionRefs: Object.freeze([]),
        foldbackRefs: Object.freeze([]),
        retryFrontierRefs: Object.freeze([]),
        reentryFrontierRefs: Object.freeze([]),
        assuranceRefs: Object.freeze([]),
        fhInputRefs: Object.freeze([]),
        priorIntentRefs: Object.freeze([]),
        priorProgressRefs: Object.freeze([]),
        pressureRows: Object.freeze([]),
        repairSurfaceTriageRows: Object.freeze([])
      });
    case "evaluate_next":
      return Object.freeze({ selectedActionRef: null, intentCandidate: null });
    case "evaluate_action":
      return Object.freeze({
        closureContractRef: stage.closureContract.ref,
        evidenceRefs: Object.freeze(["evidence://t280/action"]),
        disposition: "close",
        reasonRefs: Object.freeze(["reason://t280/action-complete"])
      });
  }
}

function exactInputBasis(stage, suffix = "same") {
  return constructOneSurfaceAuthorityInputBasis({
    functionKind: stage.functionKind,
    inputRefs: [
      `input://t280/${stage.functionKind}/a`,
      `input://t280/${stage.functionKind}/b`
    ],
    inputValue: Object.freeze({ stage: stage.functionKind, suffix })
  });
}

test("T-280 binds exact success and typed-refusal attempts for all four authorities", async () => {
  const compiled = await compiledReplayFixture();
  for (let index = 0; index < compiled.application.stages.length; index += 1) {
    const fixture = stageFixture(compiled, index);
    const inputBasis = exactInputBasis(fixture.stage);
    const retryValue = constructOneSurfaceTypedRefusal({
      functionKind: fixture.stage.functionKind,
      judgment: "retry",
      reasonRefs: [`reason://t280/${fixture.stage.functionKind}/retry`]
    });
    const successValue = successfulValue(fixture.stage);
    const retry = attempt({
      ...fixture,
      inputBasis,
      ordinal: 1,
      artifactValue: retryValue
    });
    const success = attempt({
      ...fixture,
      inputBasis,
      ordinal: 2,
      artifactValue: successValue
    });
    const events = Object.freeze([...retry.events, ...success.events]);
    const calculus = eventCalculus(fixture.application, events);
    const replay = deriveOneSurfaceAuthorityReplayProjection({
      application: fixture.application,
      effectRows: calculus.effectRows
    });
    assert.equal(
      replay.bindings.length,
      2,
      `${fixture.stage.functionKind}: ${JSON.stringify(replay.diagnostics, null, 2)}`
    );
    assert.deepEqual(
      replay.bindings.map((binding) => binding.outcome),
      ["refusal", "success"]
    );

    for (const row of [retry, success]) {
      const projected = projectOneSurfaceAuthorityResult({
        application: fixture.application,
        stageAuthority: fixture.stage,
        eventCalculus: calculus,
        payloadLedger: payloadLedger(fixture.contract, fixture.stage, [retry, success]),
        artifactPayloadDigestBasis: row.artifactPayload,
        expectedCCallRef: row.cCallRef,
        expectedFunctionInputBasis: inputBasis
      });
      assert.equal(
        projected.status,
        "admitted",
        `${fixture.stage.functionKind}: ${projected.diagnostic?.reason}`
      );
      assert.deepEqual(projected.result.decodedValue, row.closeAdmission.value);
    }
  }
});

test("T-280 refuses malformed or competing replay enclosure relations", async () => {
  const fixture = await replayFixture();
  const inputBasis = exactInputBasis(fixture.stage, "malformed-enclosure");
  const value = Object.freeze({
    desiredAssetRefs: Object.freeze(["asset://t280/desired"]),
    knownAssetRefs: Object.freeze(["asset://t280/known"])
  });
  const row = attempt({ ...fixture, inputBasis, ordinal: 1, artifactValue: value });

  const bindingCount = (events) => deriveOneSurfaceAuthorityReplayProjection({
    application: fixture.application,
    effectRows: eventEffectRows(events)
  }).bindings.length;
  const replaceEvent = (kind, mutate) => row.events.map((event) =>
    event.kind === kind ? Object.freeze(mutate(event)) : event
  );
  const swapEvents = (leftKind, rightKind) => {
    const result = [...row.events];
    const left = result.findIndex((event) => event.kind === leftKind);
    const right = result.findIndex((event) => event.kind === rightKind);
    assert.notEqual(left, -1);
    assert.notEqual(right, -1);
    [result[left], result[right]] = [result[right], result[left]];
    return Object.freeze(result);
  };

  assert.equal(bindingCount(row.events), 1);
  const mutationMatrix = Object.freeze([
    Object.freeze({
      label: "C-call identity",
      events: replaceEvent("c_call_fibre_selected", (event) => ({
        ...event,
        cCallRef: `${event.cCallRef}/other`
      }))
    }),
    Object.freeze({
      label: "basis identity",
      events: replaceEvent("c_call_fibre_selected", (event) => ({
        ...event,
        basisId: `${event.basisId}/other`
      }))
    }),
    Object.freeze({
      label: "scope identity",
      events: replaceEvent("payload_observed", (event) => ({
        ...event,
        graphCallId: `${event.graphCallId}/other`
      }))
    }),
    Object.freeze({
      label: "program locus",
      events: replaceEvent("c_call_opened", (event) => ({
        ...event,
        programLocusRef: `${event.programLocusRef}/other`
      }))
    }),
    Object.freeze({
      label: "stage role",
      events: replaceEvent("c_call_opened", (event) => ({
        ...event,
        stageRole: "eval_gap"
      }))
    }),
    Object.freeze({
      label: "program identity",
      events: replaceEvent("c_call_fibre_selected", (event) => ({
        ...event,
        programRef: `${event.programRef}/other`
      }))
    }),
    Object.freeze({
      label: "composition identity",
      events: replaceEvent("c_call_fibre_selected", (event) => ({
        ...event,
        compositionRef: `${event.compositionRef}/other`
      }))
    }),
    Object.freeze({
      label: "regime identity",
      events: replaceEvent("c_call_fibre_selected", (event) => ({
        ...event,
        regime: `${event.regime}/other`
      }))
    }),
    Object.freeze({
      label: "arm identity",
      events: replaceEvent("c_call_fibre_selected", (event) => ({
        ...event,
        armId: `${event.armId}/other`
      }))
    }),
    Object.freeze({
      label: "payload ref",
      events: replaceEvent("payload_validated", (event) => ({
        ...event,
        payloadRef: `${event.payloadRef}/other`
      }))
    }),
    Object.freeze({
      label: "payload digest",
      events: replaceEvent("payload_validated", (event) => ({
        ...event,
        digest: `${event.digest}/other`
      }))
    }),
    Object.freeze({
      label: "contract ref",
      events: replaceEvent("payload_observed", (event) => ({
        ...event,
        contractRef: `${event.contractRef}/other`
      }))
    }),
    Object.freeze({
      label: "contract digest",
      events: replaceEvent("payload_validated", (event) => ({
        ...event,
        contractDigest: `${event.contractDigest}/other`
      }))
    }),
    Object.freeze({
      label: "evidence completeness",
      events: replaceEvent("evidence_admitted", (event) => ({
        ...event,
        complete: false
      }))
    }),
    Object.freeze({
      label: "evidence shallow status",
      events: replaceEvent("evidence_admitted", (event) => ({
        ...event,
        shallow: true
      }))
    }),
    Object.freeze({
      label: "evidence contradiction status",
      events: replaceEvent("evidence_admitted", (event) => ({
        ...event,
        contradictsAuthority: true
      }))
    }),
    Object.freeze({
      label: "evidence deferred status",
      events: replaceEvent("evidence_admitted", (event) => ({
        ...event,
        deferred: true
      }))
    }),
    Object.freeze({
      label: "evidence class",
      events: replaceEvent("c_call_evidenced", (event) => ({
        ...event,
        evidenceClass: "other_result"
      }))
    }),
    Object.freeze({
      label: "result status",
      events: replaceEvent("c_call_result_admitted", (event) => ({
        ...event,
        outcomeStatus: "retry"
      }))
    }),
    Object.freeze({
      label: "judgment",
      events: replaceEvent("c_call_judged", (event) => ({
        ...event,
        judgment: "retry"
      }))
    }),
    Object.freeze({
      label: "judgment reason",
      events: replaceEvent("c_call_judged", (event) => ({
        ...event,
        reasonRef: "reason://t280/unadmitted"
      }))
    }),
    Object.freeze({
      label: "authority order",
      events: replaceEvent("authority_snapshot_admitted", (event) => ({
        ...event,
        authorityRefs: Object.freeze([...event.authorityRefs].reverse())
      }))
    }),
    Object.freeze({
      label: "middle event order",
      events: swapEvents("payload_observed", "payload_validated")
    }),
    Object.freeze({
      label: "close event order",
      events: swapEvents("c_call_result_admitted", "c_call_judged")
    })
  ]);
  for (const mutation of mutationMatrix) {
    assert.equal(bindingCount(mutation.events), 0, mutation.label);
  }

  const evidenceOrdinal = row.events.findIndex(
    (event) => event.kind === "c_call_evidenced"
  );
  const duplicateEvidence = Object.freeze([
    ...row.events.slice(0, evidenceOrdinal),
    row.evidence[0],
    ...row.events.slice(evidenceOrdinal)
  ]);
  assert.equal(bindingCount(duplicateEvidence), 0);

  const duplicateEnclosure = Object.freeze([
    ...row.events.slice(0, evidenceOrdinal + 1),
    row.events[evidenceOrdinal],
    ...row.events.slice(evidenceOrdinal + 1)
  ]);
  assert.equal(bindingCount(duplicateEnclosure), 0);

  const duplicateOpen = Object.freeze([row.events[0], ...row.events]);
  const duplicateOpenCalculus = eventCalculus(
    fixture.application,
    duplicateOpen
  );
  assert.equal(deriveOneSurfaceAuthorityReplayProjection({
    application: fixture.application,
    effectRows: duplicateOpenCalculus.effectRows
  }).bindings.length, 0);
  assert.equal(duplicateOpenCalculus.holds.filter(
    (fluent) => fluent.name === "one_surface_authority_outcome"
  ).length, 0);

  const noRuleCalculus = deriveRuntimeEventCalculusProjection({
    events: row.events
  });
  assert.equal(deriveOneSurfaceAuthorityReplayProjection({
    application: fixture.application,
    effectRows: noRuleCalculus.effectRows
  }).bindings.length, 1);
  assert.equal(noRuleCalculus.holds.filter(
    (fluent) => fluent.name === "one_surface_authority_outcome"
  ).length, 0);
  const noRuleProjection = projectOneSurfaceAuthorityResult({
    application: fixture.application,
    stageAuthority: fixture.stage,
    eventCalculus: noRuleCalculus,
    payloadLedger: payloadLedger(fixture.contract, fixture.stage, [row]),
    artifactPayloadDigestBasis: row.artifactPayload,
    expectedCCallRef: row.cCallRef,
    expectedFunctionInputBasis: inputBasis
  });
  assert.equal(noRuleProjection.status, "semantic_not_realized");
  assert.match(noRuleProjection.diagnostic.reason, /derived fluent is absent/u);
});

test("T-280 rejects cross-pair and input-ref mutations before replay truth", async () => {
  const fixture = await replayFixture();
  const inputBasis = exactInputBasis(fixture.stage, "cross-pair");
  const valueA = Object.freeze({
    desiredAssetRefs: Object.freeze(["asset://t280/a"]),
    knownAssetRefs: Object.freeze(["asset://t280/shared"])
  });
  const valueB = Object.freeze({
    desiredAssetRefs: Object.freeze(["asset://t280/b"]),
    knownAssetRefs: Object.freeze(["asset://t280/shared"])
  });
  assert.throws(() => attempt({
    ...fixture,
    inputBasis,
    ordinal: 1,
    artifactValue: valueB,
    closeValue: valueA
  }), /artifact and admitted result do not form one exact pair/u);

  const lawful = attempt({
    ...fixture,
    inputBasis,
    ordinal: 2,
    artifactValue: valueB
  });
  const admissionA = admitOneSurfaceResultForClose("synthesize_model", valueA);
  const crossedEvents = Object.freeze(lawful.events.map((event) => {
    if (
      event.kind === "evidence_admitted" &&
      event.evidenceRef === lawful.closeAdmission.admissionRef
    ) {
      return Object.freeze({ ...event, evidenceRef: admissionA.admissionRef });
    }
    if (event.kind === "c_call_evidenced") {
      return Object.freeze({
        ...event,
        evidenceRefs: Object.freeze(event.evidenceRefs.map((evidenceRef) =>
          evidenceRef === lawful.closeAdmission.admissionRef
            ? admissionA.admissionRef
            : evidenceRef
        ))
      });
    }
    return event;
  }));
  const crossedCalculus = eventCalculus(fixture.application, crossedEvents);
  assert.equal(deriveOneSurfaceAuthorityReplayProjection({
    application: fixture.application,
    effectRows: crossedCalculus.effectRows
  }).bindings.length, 0);
  assert.equal(crossedCalculus.holds.filter(
    (fluent) => fluent.name === "one_surface_authority_outcome"
  ).length, 0);

  const mutatedInputEvents = Object.freeze(lawful.events.map((event) =>
    event.kind === "authority_snapshot_admitted"
      ? Object.freeze({
          ...event,
          inputRefs: Object.freeze([
            ...event.inputRefs.slice(0, -1),
            "input://t280/synthesize_model/replaced"
          ].sort())
        })
      : event
  ));
  const mutatedInputCalculus = eventCalculus(
    fixture.application,
    mutatedInputEvents
  );
  assert.equal(deriveOneSurfaceAuthorityReplayProjection({
    application: fixture.application,
    effectRows: mutatedInputCalculus.effectRows
  }).bindings.length, 0);
  assert.equal(mutatedInputCalculus.holds.filter(
    (fluent) => fluent.name === "one_surface_authority_outcome"
  ).length, 0);

  const lawfulCalculus = eventCalculus(fixture.application, lawful.events);
  const wrongInputBasis = constructOneSurfaceAuthorityInputBasis({
    functionKind: "synthesize_model",
    inputRefs: [
      "input://t280/synthesize_model/a",
      "input://t280/synthesize_model/replaced"
    ],
    inputValue: Object.freeze({ stage: "synthesize_model", suffix: "cross-pair" })
  });
  const projected = projectOneSurfaceAuthorityResult({
    application: fixture.application,
    stageAuthority: fixture.stage,
    eventCalculus: lawfulCalculus,
    payloadLedger: payloadLedger(fixture.contract, fixture.stage, [lawful]),
    artifactPayloadDigestBasis: lawful.artifactPayload,
    expectedCCallRef: lawful.cCallRef,
    expectedFunctionInputBasis: wrongInputBasis
  });
  assert.equal(projected.status, "semantic_not_realized");
});
