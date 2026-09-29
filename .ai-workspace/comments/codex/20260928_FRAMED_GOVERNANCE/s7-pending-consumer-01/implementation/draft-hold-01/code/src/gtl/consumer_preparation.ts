import type { GraphFunction } from "./contracts.js";
import type { COfNode, CWorkflowNode } from "./c_algebra.js";

export const CONSUMER_PREPARATION_DECLARATION = "abg.consumer_preparation_locus";
export const PREPARED_CONSUMER_DECLARATION = "abg.prepared_consumer_locus";
export interface DeclaredConsumerPreparation {
  readonly preparation: COfNode;
  readonly consumer: CWorkflowNode;
  readonly preparationNodeRef: string;
  readonly consumerNodeRef: string;
}
/** Structural projection of an already acquired definition. No profile/name or
 * failure-message inference, hashing, mutable observation, or semantic choice. */
export function declaredConsumerPreparation(graph: Readonly<GraphFunction>): DeclaredConsumerPreparation | null {
  const preparationRef = graph.declarations[CONSUMER_PREPARATION_DECLARATION];
  const consumerRef = graph.declarations[PREPARED_CONSUMER_DECLARATION];
  if (!preparationRef || !consumerRef || preparationRef === consumerRef) return null;
  const preparers = graph.template.nodes.filter(n => n.nodeRef === preparationRef);
  const consumers = graph.template.nodes.filter(n => n.nodeRef === consumerRef);
  if (preparers.length !== 1 || consumers.length !== 1) return null;
  const preparation = preparers[0]!.term, consumer = consumers[0]!.term;
  const edges = graph.template.edges.filter(e => e.fromNodeRef === preparationRef);
  if (preparation.kind !== "c_of" || preparation.fibre !== "F_D" ||
      preparation.requirement.kind !== "executable_leaf_requirement" ||
      preparation.programLocusRef !== preparationRef || preparation.compositionRef !== null ||
      preparation.requirement.inputContractRef !== preparation.inputCarrierRef ||
      preparation.requirement.outputContractRef !== preparation.outputCarrierRef ||
      consumer.kind !== "c_workflow" || preparation.outputCarrierRef !== consumer.inputCarrierRef ||
      edges.length !== 1 || edges[0]!.toNodeRef !== consumerRef || edges[0]!.inputBinding !== undefined ||
      graph.template.applications.some(a => "sourceProgramLocusRef" in a && a.sourceProgramLocusRef === preparationRef)) return null;
  return Object.freeze({ preparation, consumer, preparationNodeRef: preparationRef, consumerNodeRef: consumerRef });
}
