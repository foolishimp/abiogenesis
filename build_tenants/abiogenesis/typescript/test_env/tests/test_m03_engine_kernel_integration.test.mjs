// Validates: REQ-R-ABG3-INTERPRET
// Validates: REQ-R-ABG3-EVENTS
// Validates: REQ-R-ABG3-RUN
// Validates: REQ-R-ABG3-CONVERGENCE

import test from "node:test";
import assert from "node:assert/strict";

import { edge, graphFunctionForVector } from "../../build/semantic/code/src/gtl/m01/algebra/core.js";
import { admitNode } from "../../build/semantic/code/src/gtl/m01/admission/carriers.js";
import { admitModule } from "../../build/semantic/code/src/gtl/m02/admission/carriers.js";
import {
  admitExecutionBasis,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent,
  assertCanonicalRuntimeEvent,
  deriveAdvancementTransition,
  dispatch,
  dispatchRequestsForTransition,
  emit,
  runtimeEventsForTransition
} from "../../build/semantic/code/src/abg/m03/index.js";

function designNode(overrides = {}) {
  return {
    id: "node-m03-design",
    name: "Design",
    schema: { kind: "symbolic", ref: "Vector[design]" },
    markov: ["derived"],
    assetSurface: {
      kind: "design",
      requiredContexts: ["workspace"],
      standardsRefs: ["design-standard"],
      outputContractRefs: ["design-contract"]
    },
    tags: ["input"],
    ...overrides
  };
}

function codeNode(overrides = {}) {
  return {
    id: "node-m03-code",
    name: "Code",
    schema: { kind: "symbolic", ref: "Vector[code]" },
    markov: ["implemented"],
    assetSurface: {
      kind: "code",
      requiredContexts: ["workspace"],
      standardsRefs: ["code-standard"],
      outputContractRefs: ["code-contract"]
    },
    tags: ["output"],
    ...overrides
  };
}

function reviewerRolePayload(overrides = {}) {
  return {
    id: "role-reviewer-m03",
    name: "reviewer",
    tags: ["approval"],
    policyHooks: {
      entries: [
        {
          key: "authority",
          value: {
            kind: "hook_ref",
            value: {
              ref: "hook://authority/reviewer",
              config: {
                entries: [
                  {
                    key: "scope",
                    value: {
                      kind: "scalar",
                      value: "runtime_review"
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    },
    ...overrides
  };
}

function publishedProfile({
  id,
  name,
  declarations = { entries: [] },
  graphId,
  graphName,
  design = admitNode(designNode()),
  code = admitNode(codeNode())
}) {
  return graphFunctionForVector(
    edge([design], code, {
      id: graphId,
      name: graphName,
      declarations
    }).vectors[0],
    {
      id,
      name,
      declarations
    }
  );
}

function emptyProfile() {
  return {
    id: "graph-function-empty-profile",
    name: "empty_profile",
    environment: {
      requires: [],
      provides: [],
      carries: []
    },
    inputs: [],
    outputs: [],
    template: {
      kind: "inline_graph",
      ref: "graph://empty-profile",
      graph: {
        id: "graph-empty-profile",
        name: "empty_profile",
        inputs: [],
        outputs: [],
        nodes: [],
        vectors: [],
        contexts: [],
        rules: [],
        effects: [],
        tags: []
      },
      version: null
    },
    effects: [],
    declarations: { entries: [] },
    tags: []
  };
}

function modulePayload({
  moduleName,
  graphFunctions,
  jobs,
  roles = [reviewerRolePayload()]
}) {
  const graphs = graphFunctions.map((graphFunction) => graphFunction.template.graph);
  return {
    name: moduleName,
    graphs,
    graphFunctions,
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs,
    roles,
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    metadata: { entries: [] }
  };
}

function jobPayload({ id, name, graphFunctionId, roles = [reviewerRolePayload()] }) {
  return {
    id,
    name,
    contracts: [
      {
        kind: "graph_function",
        targetId: graphFunctionId
      }
    ],
    roles,
    tags: ["semantic_work"]
  };
}

function startIntent(handle) {
  return admitStartIntent({
    scope: {
      kind: "workspace",
      workspaceRoot: "/workspace/demo",
      moduleName: "abiogenesis.runtime_library"
    },
    target: {
      kind: "graph_function",
      handle
    },
    until: "converged"
  });
}

function runtimeIdentity() {
  return admitResolvedRuntimeIdentity({
    workerId: "worker://typescript-steel-thread",
    backendId: "backend://node",
    buildId: "build://typescript-dev",
    resolvedRuntimeRef: "runtime://typescript/node"
  });
}

test("M03 integration: public ingress admits one request into one F_D execution basis and replay-visible events", async () => {
  const profile = publishedProfile({
    id: "graph-function-fd-profile",
    name: "fd_profile",
    graphId: "graph-m03-fd",
    graphName: "design→code:fd"
  });
  const module = admitModule(
    modulePayload({
      moduleName: "abiogenesis.runtime_library",
      graphFunctions: [profile],
      jobs: [
        jobPayload({
          id: "job-fd-profile",
          name: "fd_profile_job",
          graphFunctionId: profile.id
        })
      ]
    })
  );
  const basis = admitExecutionBasis({
    startIntent: startIntent(profile.name),
    module,
    runtimeIdentity: runtimeIdentity(),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://fd-default",
      defaultRegime: "F_D"
    }),
    runId: "run://fd",
    workKey: "wk://fd"
  });
  const transition = deriveAdvancementTransition(basis);
  const events = runtimeEventsForTransition(basis, transition);
  const emitted = [];

  const written = emit(events, (event) => {
    emitted.push(event);
  });

  assert.equal(transition.kind, "fd_advance");
  assert.equal(transition.status, "ready");
  assert.equal(basis.graphFunction.id, profile.id);
  assert.equal(basis.job.id, "job-fd-profile");
  assert.equal(events.length, 2);
  assert.notDeepStrictEqual(written, events);
  assert.equal("eventTime" in events[0], false);
  for (const event of written) {
    assertCanonicalRuntimeEvent(event);
    assert.match(
      event.eventTime,
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u
    );
    assert.equal(Date.parse(event.eventTime), event.eventTimeUnixMs);
    assert.equal(typeof event.eventId, "string");
    assert.equal(event.eventId.length > 0, true);
  }
  assert.equal(new Set(written.map((event) => event.eventId)).size, written.length);
  assert.equal(
    new Set(written.map((event) => event.eventAdmissionOrdinal)).size,
    written.length
  );
  assert.equal(emitted[0].kind, "basis_admitted");
  assert.equal(emitted[1].kind, "fd_advance_ready");
  assert.equal(emitted[0].eventId, written[0].eventId);
  assert.equal(emitted[1].eventId, written[1].eventId);
  assert.equal(emitted[0].eventTime, written[0].eventTime);
  assert.equal(emitted[1].eventTime, written[1].eventTime);

  assert.throws(() => emit([written[0], written[0]], () => {}), /eventId.*unique/);

  const root = await import("@abiogenesis/typescript-tenant");
  const m03 = await import("@abiogenesis/typescript-tenant/abg/m03");

  assert.equal(root.admitStartIntent, m03.admitStartIntent);
  assert.equal(root.emit, m03.emit);
});

test("M03 integration: F_P runtime derives one closed dispatch transition and typed dispatch request", () => {
  const profile = publishedProfile({
    id: "graph-function-fp-profile",
    name: "fp_profile",
    graphId: "graph-m03-fp",
    graphName: "design→code:fp"
  });
  const module = admitModule(
    modulePayload({
      moduleName: "abiogenesis.runtime_library",
      graphFunctions: [profile],
      jobs: [
        jobPayload({
          id: "job-fp-profile",
          name: "fp_profile_job",
          graphFunctionId: profile.id
        })
      ]
    })
  );
  const basis = admitExecutionBasis({
    startIntent: startIntent(profile.name),
    module,
    runtimeIdentity: runtimeIdentity(),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://fp-default",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://codex"
    }),
    runId: "run://fp"
  });
  const transition = deriveAdvancementTransition(basis);
  const requests = dispatchRequestsForTransition(transition);
  const dispatched = [];

  const writtenRequests = dispatch(requests, (request) => {
    dispatched.push(request);
  });

  assert.equal(transition.kind, "fp_dispatch");
  assert.equal(transition.dispatchRef, "dispatch://codex");
  assert.equal(requests.length, 1);
  assert.deepStrictEqual(writtenRequests, requests);
  assert.deepStrictEqual(dispatched, requests);
  assert.equal(requests[0].graphFunctionId, profile.id);
  assert.equal(requests[0].jobId, "job-fp-profile");
});

test("M03 integration: F_H and terminal transitions remain closed runtime variants over one basis family", () => {
  const gatedProfile = publishedProfile({
    id: "graph-function-fh-profile",
    name: "fh_profile",
    graphId: "graph-m03-fh",
    graphName: "design→code:fh"
  });
  const emptyModule = admitModule(
    modulePayload({
      moduleName: "abiogenesis.runtime_library",
      graphFunctions: [emptyProfile()],
      jobs: [
        jobPayload({
          id: "job-empty-profile",
          name: "empty_profile_job",
          graphFunctionId: "graph-function-empty-profile"
        })
      ]
    })
  );
  const fhModule = admitModule(
    modulePayload({
      moduleName: "abiogenesis.runtime_library",
      graphFunctions: [gatedProfile],
      jobs: [
        jobPayload({
          id: "job-fh-profile",
          name: "fh_profile_job",
          graphFunctionId: gatedProfile.id
        })
      ]
    })
  );

  const fhBasis = admitExecutionBasis({
    startIntent: startIntent(gatedProfile.name),
    module: fhModule,
    runtimeIdentity: runtimeIdentity(),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://fh-default",
      defaultRegime: "F_H",
      approvalSubjectRef: "approval://reviewer"
    })
  });
  const terminalBasis = admitExecutionBasis({
    startIntent: startIntent("empty_profile"),
    module: emptyModule,
    runtimeIdentity: runtimeIdentity(),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://fd-empty",
      defaultRegime: "F_D"
    })
  });

  const fhTransition = deriveAdvancementTransition(fhBasis);
  const terminalTransition = deriveAdvancementTransition(terminalBasis);

  assert.equal(fhTransition.kind, "fh_escalation");
  assert.equal(fhTransition.approvalSubjectRef, "approval://reviewer");
  assert.equal(terminalTransition.kind, "terminal");
  assert.equal(terminalTransition.terminalKind, "nothing_to_do");
});
