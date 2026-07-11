// Native type-law proof for the C algebra generator set.

import {
  C,
  C_PROGRAM_TYPE,
  C_TERM_TYPE,
  cCarrier,
  cGraphFunctionRef,
  declareCProgram,
  workflow
} from "../../code/src/gtl/m01/algebra/c_algebra.js";
import type {
  GraphFunction,
  GraphVector
} from "../../code/src/gtl/m01/contracts/carriers.js";

void C_PROGRAM_TYPE;
void C_TERM_TYPE;


interface Request {
  readonly request: string;
}

interface Candidate {
  readonly candidate: string;
}

interface Assessment {
  readonly accepted: boolean;
}

interface Consequence {
  readonly disposition: string;
}

interface Unrelated {
  readonly unrelated: true;
}

const request = cCarrier<Request>("carrier://request");
const candidate = cCarrier<Candidate>("carrier://candidate");
const assessment = cCarrier<Assessment>("carrier://assessment");
const consequence = cCarrier<Consequence>("carrier://consequence");
const unrelated = cCarrier<Unrelated>("carrier://unrelated");

export const transform = C.of({
  input: request,
  output: candidate,
  stageRole: "transform",
  fibre: "F_P",
  armId: "arm://typed/transform",
  resultBearing: true
});

export const evaluate = C.of({
  input: candidate,
  output: assessment,
  stageRole: "evaluate",
  fibre: "F_D",
  armId: "arm://typed/evaluate",
  resultBearing: false
});

export const project = C.of({
  input: assessment,
  output: consequence,
  stageRole: "consequence",
  fibre: "F_D",
  armId: "arm://typed/consequence",
  resultBearing: false
});

export const lawfulCompose = C.compose(C.compose(transform, evaluate), project);

export const lawfulEdge = C.edge({
  transform,
  evaluate,
  consequence: project
});

export const lawfulProgram = declareCProgram({
  programRef: "gtl://typed/edge",
  term: lawfulEdge
});

// @ts-expect-error C terms are constructor-owned; structural lookalikes lack the private brand.
export const forgedTransform: typeof transform = {
  kind: "c_of",
  inputCarrierRef: "carrier://request",
  outputCarrierRef: "carrier://candidate",
  stageRole: "transform",
  fibre: "F_P",
  armId: "arm://typed/forged",
  resultBearing: true
};

declare const publishedGraphFunction: GraphFunction;
declare const internalGraphVector: GraphVector;

export const lawfulGraphFunctionRef = cGraphFunctionRef({
  graphFunction: publishedGraphFunction,
  input: request,
  output: consequence
});
export const lawfulLift = workflow.C(lawfulGraphFunctionRef);

export const vectorIsNotGraphFunctionRef = cGraphFunctionRef({
  // @ts-expect-error GraphVector cannot construct a GraphFunctionRef.
  graphFunction: internalGraphVector,
  input: request,
  output: consequence
});

// @ts-expect-error workflow.C requires an opaque constructor-owned GraphFunctionRef.
export const structuralWorkflowRef = workflow.C({
  kind: "c_graph_function_ref",
  ref: "graph-function://typed/child",
  inputCarrierRef: request.ref,
  outputCarrierRef: consequence.ref
});

export const lawfulBatch = C.batch(
  [transform, C.retry(transform, 2)] as const,
  "batch://typed/transform"
);

const wrongSuccessor = C.of({
  input: unrelated,
  output: consequence,
  stageRole: "consequence",
  fibre: "F_D",
  armId: "arm://typed/wrong-successor",
  resultBearing: false
});

// @ts-expect-error C.compose requires the left output to equal the right input.
export const illegalCompose = C.compose(transform, wrongSuccessor);

export const illegalEdgeRole = C.edge({
  // @ts-expect-error C.edge requires the canonical transform role here.
  transform: evaluate,
  // @ts-expect-error The mismatched predecessor also makes this chain unlawful.
  evaluate,
  consequence: project
});

export const illegalFibre = C.of({
  input: request,
  output: candidate,
  stageRole: "transform",
  // @ts-expect-error The fibre vocabulary is closed.
  fibre: "F_X",
  armId: "arm://typed/illegal-fibre",
  resultBearing: true
});

const secondResult = C.of({
  input: candidate,
  output: assessment,
  stageRole: "evaluate",
  fibre: "F_P",
  armId: "arm://typed/second-result",
  resultBearing: true
});

const twoResults = C.compose(transform, secondResult);

export const illegalMultiResultProgram = declareCProgram({
  programRef: "gtl://typed/two-results",
  // @ts-expect-error A statically known multi-result term cannot become a program.
  term: twoResults
});

export const illegalIdentityProgram = declareCProgram({
  programRef: "gtl://typed/identity-only",
  // @ts-expect-error C.id carries zero result stages and is not executable alone.
  term: C.id(request)
});

export const illegalBatch = C.batch(
  // @ts-expect-error C.batch tasks must share one input/output carrier type pair.
  [transform, wrongSuccessor] as const,
  "batch://typed/mismatch"
);

export const illegalRetriedEdge = C.edge({
  // @ts-expect-error C.edge fields are atomic C.of leaves; retry wraps a complete term.
  transform: C.retry(transform, 2),
  // @ts-expect-error The rejected transform cannot establish the evaluate predecessor relation.
  evaluate,
  consequence: project
});

export const illegalIdentityBatchProgram = declareCProgram({
  programRef: "gtl://typed/identity-batch",
  // @ts-expect-error A batch preserves per-task result cardinality; identity tasks carry zero.
  term: C.batch([C.id(request)] as const, "batch://typed/identity")
});
