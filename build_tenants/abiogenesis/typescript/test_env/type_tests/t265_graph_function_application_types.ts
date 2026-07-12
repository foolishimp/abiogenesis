// Native type-law proof for canonical GraphFunction applications.

import {
  fan_in,
  gate,
  recurse
} from "../../code/src/gtl/m01/algebra/core.js";
import {
  constructGraphFunctionApplicationDeclaration,
  type GraphFunctionApplicationDeclarationInput
} from "../../code/src/gtl/m01/contracts/graph_function_application.js";
import type {
  Evaluator,
  GraphFunction,
  Node,
  Rule
} from "../../code/src/gtl/m01/contracts/carriers.js";

declare const operand: GraphFunction;
declare const vectorNode: Node;
declare const evaluator: Evaluator;
declare const rule: Rule;

export const recursive = recurse(operand, evaluator, {
  mode: "rebind",
  binding: "binding://scenario-09/foldback",
  requiresParentEvaluation: true
});

recurse(operand, evaluator, {
  mode: "rebind",
  binding: "binding://scenario-09/foldback",
  // @ts-expect-error foldback requires literal true.
  requiresParentEvaluation: false
});

export const reduced = fan_in(operand, vectorNode);
export const gated = gate(operand, rule, [evaluator]);

// @ts-expect-error gate requires a statically non-empty evaluator tuple.
gate(operand, rule, []);

export const recurseDeclaration = constructGraphFunctionApplicationDeclaration({
  operatorKind: "recurse",
  operandGraphFunction: operand,
  terminationEvaluator: evaluator,
  foldback: {
    mode: "rebind",
    binding: "binding://scenario-09/foldback",
    requiresParentEvaluation: true
  }
});

export const fanInDeclaration = constructGraphFunctionApplicationDeclaration({
  operatorKind: "fan_in",
  operandGraphFunction: operand,
  overVectorNode: vectorNode
});

export const gateDeclaration = constructGraphFunctionApplicationDeclaration({
  operatorKind: "gate",
  operandGraphFunction: operand,
  rule,
  evaluators: [evaluator]
});

const directOperandRef: GraphFunctionApplicationDeclarationInput = {
  operatorKind: "fan_in",
  // @ts-expect-error callers cannot author an operand ref instead of supplying the operand value.
  operandGraphFunctionRef: "graph-function://forged",
  overVectorNode: vectorNode
};
void directOperandRef;

const mixedVariant: GraphFunctionApplicationDeclarationInput = {
  operatorKind: "gate",
  operandGraphFunction: operand,
  rule,
  evaluators: [evaluator],
  // @ts-expect-error mixed variant fields are not part of the closed gate variant.
  overVectorNode: vectorNode
};
void mixedVariant;

// @ts-expect-error the recurse variant requires a foldback declaration.
const missingFoldback: GraphFunctionApplicationDeclarationInput = {
  operatorKind: "recurse",
  operandGraphFunction: operand,
  terminationEvaluator: evaluator
};
void missingFoldback;

const authoredLineage: GraphFunctionApplicationDeclarationInput = {
  operatorKind: "fan_in",
  operandGraphFunction: operand,
  overVectorNode: vectorNode,
  // @ts-expect-error no authored lineage field exists on an application declaration.
  operandGraphFunctionRefs: [operand.id]
};
void authoredLineage;
