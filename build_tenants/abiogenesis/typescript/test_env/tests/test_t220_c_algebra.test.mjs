/* global structuredClone */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  C,
  admitCProgramSyntax,
  cCarrier,
  cInterfaceCarrier,
  cInterfaceContractRef,
  cGraphFunctionRef,
  declareCProgram,
  isAdmittedCProgramDeclaration,
  serializeCProgramCanonical,
  workflow
} from "../../build/semantic/code/src/gtl/m01/algebra/c_algebra.js";
import {
  typedInterface,
  typedNode
} from "../../build/semantic/code/src/gtl/m01/algebra/native_node_witness.js";
import {
  constructNode
} from "../../build/semantic/code/src/gtl/m01/contracts/constructors.js";
import {
  interfaceContract
} from "../../build/semantic/code/src/gtl/m01/contracts/carriers.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";
import {
  buildThreeStageBasis
} from "./support/m03-iteration-fixtures.mjs";
import {
  compileCAlgebraToHog
} from "../../build/semantic/code/src/abg/m03/contracts/c_algebra_hog_compiler.js";
import {
  compileHogProgramSyntax
} from "../../build/semantic/code/src/abg/m03/contracts/hog_program_syntax.js";

const request = cCarrier("carrier://t220/request");
const candidate = cCarrier("carrier://t220/candidate");
const assessment = cCarrier("carrier://t220/assessment");
const consequence = cCarrier("carrier://t220/consequence");
const childGraphFunction = buildThreeStageBasis({
  defaultRegime: "F_D",
  dispatchRef: null
}).graphFunction;

function childWorkflowRef() {
  const input = typedInterface(
    ...childGraphFunction.inputs.map((node) =>
      typedNode({ node, decode: (raw) => raw })
    )
  );
  const output = typedInterface(
    ...childGraphFunction.outputs.map((node) =>
      typedNode({ node, decode: (raw) => raw })
    )
  );
  return cGraphFunctionRef({ graphFunction: childGraphFunction, input, output });
}

function leaves() {
  return Object.freeze({
    transform: C.of({
      input: request,
      output: candidate,
      stageRole: "transform",
      fibre: "F_P",
      armId: "arm://t220/transform",
      resultBearing: true,
      instructionCategoryRefs: ["instruction://t220/construct"]
    }),
    evaluate: C.of({
      input: candidate,
      output: assessment,
      stageRole: "evaluate",
      fibre: "F_D",
      armId: "arm://t220/evaluate",
      resultBearing: false
    }),
    consequence: C.of({
      input: assessment,
      output: consequence,
      stageRole: "consequence",
      fibre: "F_D",
      armId: "arm://t220/consequence",
      resultBearing: false
    })
  });
}

function declaration(term, programRef = "gtl://t220/c-algebra") {
  return declareCProgram({
    programRef,
    term,
    proportionalityClass: "P1"
  });
}

function mutableClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function interfaceNode(name) {
  return constructNode({
    name,
    schema: { kind: "symbolic", ref: `schema://scenario-09/${name}` },
    markov: ["admitted"],
    assetSurface: { kind: `scenario_09_${name}` },
    tags: ["scenario-09"]
  });
}

test("T-254: ordered Node interfaces derive invariant C carrier identities", () => {
  const observation = interfaceNode("LabObservation");
  const normalized = interfaceNode("NormalizedObservation");
  const forward = cInterfaceContractRef([observation, normalized]);
  const repeated = cInterfaceContractRef([observation, normalized]);
  const reversed = cInterfaceContractRef([normalized, observation]);
  const independentlyDerived =
    `gtl.c.interface-contract:${stableSha256Digest({
      orderedNodeContractKeys: interfaceContract([observation, normalized])
    })}`;

  assert.equal(forward, repeated);
  assert.equal(forward, independentlyDerived);
  assert.equal(
    forward,
    cInterfaceContractRef([
      structuredClone(observation),
      structuredClone(normalized)
    ])
  );
  assert.match(forward, /^gtl\.c\.interface-contract:sha256:[0-9a-f]{64}$/u);
  assert.notEqual(forward, reversed);
  const boundary = typedInterface(
    typedNode({ node: observation, decode: (raw) => raw }),
    typedNode({ node: normalized, decode: (raw) => raw })
  );
  assert.equal(cInterfaceCarrier(boundary).ref, forward);
  assert.throws(() => cInterfaceContractRef([]), /at least one Node/u);
  assert.throws(() => cInterfaceCarrier([]), /constructor-owned TypedInterface/u);
});

test("T-220: all seven C generators have distinct authored discriminants", () => {
  const { transform, evaluate, consequence: project } = leaves();
  assert.deepEqual(
    [
      transform.kind,
      C.id(request).kind,
      C.compose(transform, evaluate).kind,
      C.edge({ transform, evaluate, consequence: project }).kind,
      workflow.C(childWorkflowRef()).kind,
      C.batch([transform, transform], "batch://t220/discriminants").kind,
      C.retry(transform, 2).kind
    ],
    [
      "c_of",
      "c_identity",
      "c_compose",
      "c_edge",
      "c_workflow",
      "c_batch",
      "c_retry"
    ]
  );
});

test("T-220: C.edge lowers to the current normalized HoG declaration", () => {
  const stages = leaves();
  const source = declaration(C.edge(stages));
  const compiled = compileCAlgebraToHog(source);

  assert.equal(compiled.accepted, true, JSON.stringify(compiled.diagnostics));
  assert.equal(compiled.program.kind, "hog_program_declaration");
  assert.equal(compiled.program.programRef, source.programRef);
  assert.deepEqual(
    compiled.program.stages.map((stage) => [
      stage.stageRole,
      stage.defaultRegime,
      stage.armId,
      stage.resultBearing
    ]),
    [
      ["transform", "F_P", "arm://t220/transform", true],
      ["evaluate", "F_D", "arm://t220/evaluate", false],
      ["consequence", "F_D", "arm://t220/consequence", false]
    ]
  );
});

test("T-220: the public HoG syntax boundary accepts the C algebra version", () => {
  const source = declaration(C.edge(leaves()), "gtl://t220/public-syntax");
  const compiled = compileHogProgramSyntax(mutableClone(source));

  assert.equal(compiled.accepted, true, JSON.stringify(compiled.issues));
  assert.equal(compiled.program.programRef, source.programRef);
  assert.equal(compiled.program.stages.length, 3);
});

test("T-220 property: compose is associative after flat lowering", () => {
  const { transform, evaluate, consequence: project } = leaves();
  const left = declaration(
    C.compose(C.compose(transform, evaluate), project),
    "gtl://t220/associative"
  );
  const right = declaration(
    C.compose(transform, C.compose(evaluate, project)),
    "gtl://t220/associative"
  );

  const leftCompiled = compileCAlgebraToHog(left);
  const rightCompiled = compileCAlgebraToHog(right);
  assert.equal(leftCompiled.accepted, true);
  assert.equal(rightCompiled.accepted, true);
  assert.deepEqual(leftCompiled.program, rightCompiled.program);
});

test("T-220 property: C.id is the flat compose identity", () => {
  const { transform } = leaves();
  const bare = compileCAlgebraToHog(
    declaration(transform, "gtl://t220/identity")
  );
  const leftIdentity = compileCAlgebraToHog(
    declaration(
      C.compose(C.id(request), transform),
      "gtl://t220/identity"
    )
  );
  const rightIdentity = compileCAlgebraToHog(
    declaration(
      C.compose(transform, C.id(candidate)),
      "gtl://t220/identity"
    )
  );

  assert.equal(bare.accepted, true);
  assert.deepEqual(leftIdentity.program, bare.program);
  assert.deepEqual(rightIdentity.program, bare.program);
});

test("T-220: canonical serialization round-trips through raw admission", () => {
  const source = declaration(C.edge(leaves()));
  const canonical = serializeCProgramCanonical(source);
  const admission = admitCProgramSyntax(canonical);

  assert.equal(admission.accepted, true, JSON.stringify(admission.diagnostics));
  assert.equal(isAdmittedCProgramDeclaration(admission.program), true);
  assert.equal(serializeCProgramCanonical(admission.program), canonical);
  assert.equal(Object.isFrozen(admission.program), true);
  assert.equal(Object.isFrozen(admission.program.term), true);
});

test("T-220 negative: raw carrier discontinuity is a stable typed diagnostic", () => {
  const source = mutableClone(declaration(C.edge(leaves())));
  source.term.evaluate.inputCarrierRef = "carrier://t220/wrong";
  const admission = admitCProgramSyntax(source);

  assert.equal(admission.accepted, false);
  assert.equal(admission.program, null);
  assert.ok(
    admission.diagnostics.some(
      (row) => row.diagnosticId === "gtl-c-carrier-mismatch"
    )
  );
});

test("T-220 negative: closed syntax rejects invented siblings", () => {
  const source = {
    ...mutableClone(declaration(C.edge(leaves()))),
    controller: "second-authority"
  };
  const admission = admitCProgramSyntax(source);

  assert.equal(admission.accepted, false);
  assert.equal(admission.diagnostics[0].diagnosticId, "gtl-c-unknown-field");
  assert.deepEqual(admission.diagnostics[0].repairAffordances, [
    "remove_unknown_field"
  ]);
});

test("T-260: direct workflow.C and C.batch lower while retry retains its typed gap", () => {
  const { transform } = leaves();
  const workflowProgram = compileCAlgebraToHog(
    declaration(workflow.C(childWorkflowRef()), "gtl://t220/workflow")
  );
  assert.equal(workflowProgram.accepted, true);
  assert.equal(workflowProgram.diagnostics.length, 0);
  assert.equal(workflowProgram.program.kind, "hog_program_declaration");
  assert.equal(workflowProgram.program.stages.length, 0);
  assert.equal(workflowProgram.program.workflow.kind, "hog_workflow_lift");

  const batchProgram = compileCAlgebraToHog(
    declaration(
      C.batch([transform, transform], "batch://t220/transform"),
      "gtl://t220/batch"
    )
  );
  assert.equal(batchProgram.accepted, true);
  assert.equal(batchProgram.diagnostics.length, 0);
  assert.equal(batchProgram.program.batch.kind, "hog_batch_declaration");
  assert.equal(batchProgram.program.batch.batchRef, "batch://t220/transform");
  assert.deepEqual(
    batchProgram.program.batch.tasks.map((task) => task.ordinal),
    [0, 1]
  );

  const retryProgram = compileCAlgebraToHog(
    declaration(C.retry(transform, 2), "gtl://t220/retry")
  );
  assert.equal(retryProgram.accepted, false);
  assert.equal(retryProgram.program, null);
  assert.equal(retryProgram.diagnostics.length, 1);
  assert.equal(retryProgram.diagnostics[0].diagnosticId, "gtl-c-unrealized-retry");
  assert.equal(retryProgram.diagnostics[0].classification, "semantic_not_realized");
  assert.ok(
    retryProgram.diagnostics[0].repairAffordances.includes(
      "await_runtime_realization"
    )
  );
});

test("T-220 negative: native builders reject invalid runtime inputs", () => {
  assert.throws(
    () =>
      C.of({
        input: request,
        output: candidate,
        stageRole: "transform",
        fibre: "F_X",
        armId: "arm://t220/invalid",
        resultBearing: true
      }),
    /fibre/
  );
  assert.throws(
    () => C.retry(leaves().transform, 0),
    /positive integer/
  );
  assert.throws(
    () => C.batch([], "batch://t220/empty"),
    /non-empty/
  );
  const nonResultTask = C.of({
    input: request,
    output: candidate,
    stageRole: "transform",
    fibre: "F_D",
    armId: "arm://t220/non-result-task",
    resultBearing: false
  });
  assert.throws(
    () =>
      C.batch(
        [leaves().transform, nonResultTask],
        "batch://t220/mixed-cardinality"
      ),
    /result cardinality/
  );
  assert.throws(
    () =>
      declareCProgram({
        programRef: "gtl://t220/identity-batch",
        term: C.batch([C.id(request)], "batch://t220/identity")
      }),
    /result cardinality/
  );
});

test("T-220: raw admission applies the native program-cardinality judgment", () => {
  const identityOnly = mutableClone(
    declaration(C.edge(leaves()), "gtl://t220/raw-identity")
  );
  identityOnly.term = mutableClone(C.id(request));
  const identityAdmission = admitCProgramSyntax(identityOnly);
  assert.equal(identityAdmission.accepted, false);
  assert.equal(
    identityAdmission.diagnostics[0].diagnosticId,
    "gtl-c-empty-executable-program"
  );

  const twoResults = mutableClone(
    declaration(C.edge(leaves()), "gtl://t220/raw-two-results")
  );
  twoResults.term.evaluate.resultBearing = true;
  const twoResultAdmission = admitCProgramSyntax(twoResults);
  assert.equal(twoResultAdmission.accepted, false);
  assert.ok(
    twoResultAdmission.diagnostics.some(
      (row) => row.diagnosticId === "gtl-c-multiple-result-bearing-stages"
    )
  );
});

test("T-220 diagnostics carry the LLM repair relation and authority refs", () => {
  const source = mutableClone(declaration(C.edge(leaves())));
  source.term.evaluate.inputCarrierRef = "carrier://t220/wrong";
  const admission = admitCProgramSyntax(source);
  const diagnostic = admission.diagnostics.find(
    (row) => row.diagnosticId === "gtl-c-carrier-mismatch"
  );
  assert.ok(diagnostic);
  assert.equal(diagnostic.axiomRef, "AX-T220-03");
  assert.match(diagnostic.requirementRef, /REQ-L-GTL3-C-ALGEBRA/u);
  assert.match(diagnostic.expectedRelation, /carrier refs are equal/u);
  assert.ok(diagnostic.actualRelation.length > 0);
  assert.ok(diagnostic.evidenceRefs.length > 0);
});
