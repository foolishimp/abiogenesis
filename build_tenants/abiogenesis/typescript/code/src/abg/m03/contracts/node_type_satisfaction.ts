// Implements: REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL
// Implements: REQ-L-GTL3-NODE
// Implements: REQ-R-ABG3-INTERPRET

import type {
  GraphFunction,
  Node
} from "../../../gtl/m01/contracts/carriers.js";
import {
  satisfiesNodeType
} from "../../../gtl/m01/algebra/core.js";
import type {
  NodeTypeSatisfactionProjectedRuntimeEvent
} from "./carriers.js";
import {
  stableSha256Digest
} from "../../../shared/runtime_identity.js";

export interface ProjectNodeTypeSatisfactionInput {
  readonly node: Node;
  readonly targetTypeRef: string;
  readonly nodeTypeGraphFunctions: readonly GraphFunction[];
  readonly sourceEventRefs?: readonly string[] | undefined;
  readonly sourceProjectionRefs?: readonly string[] | undefined;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}

function freezeStringArray(values: readonly string[] | undefined): readonly string[] {
  return Object.freeze([...(values ?? [])]);
}

export function projectNodeTypeSatisfaction(
  input: ProjectNodeTypeSatisfactionInput
): NodeTypeSatisfactionProjectedRuntimeEvent {
  const result = satisfiesNodeType({
    node: input.node,
    typeRef: input.targetTypeRef,
    graphFunctions: input.nodeTypeGraphFunctions
  });
  const payload = Object.freeze({
    kind: "node_type_satisfaction",
    nodeRef: input.node.id,
    targetTypeRef: input.targetTypeRef,
    sourceNodeTypeRef: input.node.typeRef,
    satisfied: result.satisfied,
    rejectionReason: result.rejectionReason,
    typeNodeRef: result.typeNode?.id ?? null
  });
  const satisfactionDigest = stableSha256Digest(payload);
  const satisfactionRef = `node-type-satisfaction:${satisfactionDigest}`;
  return Object.freeze({
    kind: "node_type_satisfaction_projected",
    satisfactionRef,
    nodeRef: input.node.id,
    targetTypeRef: input.targetTypeRef,
    sourceNodeTypeRef: input.node.typeRef,
    satisfied: result.satisfied,
    rejectionReason: result.rejectionReason,
    typeNodeRef: result.typeNode?.id ?? null,
    nodeTypeGraphFunctionRefs: Object.freeze(
      input.nodeTypeGraphFunctions.map((graphFunction) => graphFunction.id)
    ),
    satisfactionDigest,
    satisfactionPayload: payload,
    sourceEventRefs: freezeStringArray(input.sourceEventRefs),
    sourceProjectionRefs: freezeStringArray(input.sourceProjectionRefs),
    causationEventRefs: freezeStringArray(input.causationEventRefs),
    correlationId: input.correlationId ?? satisfactionRef
  });
}

export function assertTraversalCloseNodeTypeSatisfied(
  input: ProjectNodeTypeSatisfactionInput
): NodeTypeSatisfactionProjectedRuntimeEvent {
  const projection = projectNodeTypeSatisfaction(input);
  if (!projection.satisfied) {
    throw new TypeError(
      `Traversal close output ${JSON.stringify(projection.nodeRef)} does not satisfy ${JSON.stringify(projection.targetTypeRef)}: ${projection.rejectionReason ?? "unknown_type_rejection"}`
    );
  }
  return projection;
}
