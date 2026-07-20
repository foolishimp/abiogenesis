import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveT270LiveCapabilityJoin
} from "../../build/semantic/code/src/app/m04/public_sdk/sdk.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";

const STEERING_REF = "steering://t270/m04-live";
const STEERING_DIGEST = stableSha256Digest({ steering: "t270-m04-live" });
const CAPABILITY_DIGEST = stableSha256Digest({
  capability: "t270-m04-live"
});
const LIVE_REFS = Object.freeze([
  "plugin://abg/fp-dispatch-live",
  "plugin://abg/fp-evaluator-live"
]);
const GRANTS = Object.freeze([
  Object.freeze({
    capabilityId: "abg.capability.catalog.invoke-graph-function@5"
  }),
  Object.freeze({
    capabilityId: "abg.capability.runtime.execute-seven-term-c@5"
  })
]);

function ingress(patch = {}) {
  return Object.freeze({
    invocationAuthority: Object.freeze({
      capabilityGrants: patch.capabilityGrants ?? GRANTS,
      transportSteering: Object.freeze({
        steeringRef: patch.steeringRef ?? STEERING_REF,
        steeringDigest: patch.steeringDigest ?? STEERING_DIGEST,
        provenanceRefs: patch.provenanceRefs ?? Object.freeze([
          STEERING_REF,
          STEERING_DIGEST
        ])
      })
    }),
    runtimeProfile: Object.freeze({
      standardPluginRefs: patch.standardPluginRefs ?? LIVE_REFS
    })
  });
}

function binding(patch = {}) {
  return Object.freeze({
    kind: "live_capability_binding",
    projection: Object.freeze({
      kind: "live_capability_projection",
      capabilityRef: patch.capabilityRef ?? "capability:live:t270-m04-live",
      capabilityDigest: patch.capabilityDigest ?? CAPABILITY_DIGEST,
      executionContractDigest: stableSha256Digest({
        execution: "t270-m04-live"
      }),
      availableLivePluginRefs: patch.availableLivePluginRefs ?? LIVE_REFS
    }),
    pluginCapabilities: Object.freeze({
      liveFpDispatch: Object.freeze({ marker: "dispatch" }),
      liveFpEvaluator: Object.freeze({ marker: "evaluator" })
    })
  });
}

function context(factory, steeringRef = STEERING_REF) {
  return Object.freeze({
    workspaceManifest: Object.freeze({ root: "/tmp/t270-m04-live" }),
    binding: Object.freeze({
      mutableStateRoots: Object.freeze({
        archiveRoot: "/tmp/t270-m04-live/archive"
      })
    }),
    effects: Object.freeze({
      operatorCapabilityFactories: new Proxy({}, {
        get() {
          throw new Error("legacy capability factory was consulted");
        }
      }),
      operatorCapabilityFactoriesBySteeringRef: Object.freeze({
        [steeringRef]: factory
      })
    })
  });
}

test("T-270 M04 joins one process-local body only through admitted steering", () => {
  const calls = [];
  const resolved = resolveT270LiveCapabilityJoin({
    context: context((input) => {
      calls.push(input);
      return binding();
    }),
    ingress: ingress()
  });

  assert.deepEqual(calls, [Object.freeze({
    workspaceRoot: "/tmp/t270-m04-live",
    archiveRoot: "/tmp/t270-m04-live/archive",
    steeringRef: STEERING_REF,
    steeringDigest: STEERING_DIGEST
  })]);
  assert.equal(resolved.kind, "t270_live_capability_join");
  assert.equal(resolved.steeringRef, STEERING_REF);
  assert.equal(resolved.steeringDigest, STEERING_DIGEST);
  assert.deepEqual(resolved.availableLivePluginRefs, LIVE_REFS);
});

test("T-270 M04 never falls back to the legacy capability-id factory", () => {
  assert.equal(
    resolveT270LiveCapabilityJoin({
      context: context(() => binding(), "steering://unrelated"),
      ingress: ingress()
    }),
    undefined
  );
});

test("T-270 M04 keeps steering and capability identities in separate categories", () => {
  const resolved = resolveT270LiveCapabilityJoin({
    context: context(() => binding({
      capabilityRef: "capability:live:separate-from-steering",
      capabilityDigest: CAPABILITY_DIGEST
    })),
    ingress: ingress()
  });
  assert.equal(resolved.steeringRef, STEERING_REF);
  assert.equal(resolved.steeringDigest, STEERING_DIGEST);
});

test("T-270 M04 rejects grant and runtime-profile divergence", () => {
  const cases = [
    {
      capability: binding(),
      authority: ingress({ capabilityGrants: [GRANTS[0]] })
    },
    {
      capability: binding(),
      authority: ingress({ standardPluginRefs: [LIVE_REFS[0]] })
    },
    {
      capability: binding({ availableLivePluginRefs: [LIVE_REFS[0]] }),
      authority: ingress()
    }
  ];

  for (const row of cases) {
    assert.throws(
      () => resolveT270LiveCapabilityJoin({
        context: context(() => row.capability),
        ingress: row.authority
      }),
      /differs from admitted steering authority/u
    );
  }
});
