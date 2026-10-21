// Dependency-free coordinates. D1 identities are unchanged.
const scope = "abiogenesis/semantic-revision";
export const SEMANTIC_REVISION_IDS = Object.freeze({
  nativeIntakeContractRef: `contract://${scope}/native-intake@5`,
  nativeIntakeImplementationRef: `implementation://${scope}/native-intake@5`, nativeIntakeBindingRef: `implementation-binding://${scope}/native-intake@5`, nativeIntakePredicateRef: `predicate://${scope}/native-intake@5`,
  nativeRequestImplementationRef: `implementation://${scope}/native-request@5`, nativeRequestBindingRef: `implementation-binding://${scope}/native-request@5`, nativeRequestPredicateRef: `predicate://${scope}/native-request@5`,
  nativeConstructionImplementationRef: `implementation://${scope}/native-construction@5`, nativeConstructionBindingRef: `implementation-binding://${scope}/native-construction@5`, nativeConstructionPredicateRef: `predicate://${scope}/native-construction@5`,
  nativeExecutionImplementationRef: `implementation://${scope}/native-execution@5`, nativeExecutionBindingRef: `implementation-binding://${scope}/native-execution@5`, nativeExecutionPredicateRef: `predicate://${scope}/native-execution@5`,
  nativeEvidenceImplementationRef: `implementation://${scope}/native-evidence@5`, nativeEvidenceBindingRef: `implementation-binding://${scope}/native-evidence@5`, nativeEvidencePredicateRef: `predicate://${scope}/native-evidence@5`,
  semanticsBindingRef: `product-semantics://${scope}@5`, moduleRef: `module://${scope}@5`, programRef: `program://${scope}@5`, graphFunctionRef: `graph-function://${scope}@5`,
  selectionInputContractRef: `contract://${scope}/selection-input@5`, selectionImplementationRef: `implementation://${scope}/selection@5`, selectionBindingRef: `implementation-binding://${scope}/selection@5`, selectionPredicateRef: `predicate://${scope}/selection@5`,
  requestContractRef: `contract://${scope}/request@5`, envelopeContractRef: `contract://${scope}/envelope@5`,
  outputContractRef: `contract://${scope}/output@5`, selectionContractRef: `contract://${scope}/selection@5`,
  selectionRawContractRef: `contract://${scope}/selection-worker-result@5`,
  projectionImplementationRef: `implementation://${scope}/projection@5`, projectionBindingRef: `implementation-binding://${scope}/projection@5`,
  authorImplementationRef: `implementation://${scope}/author@5`, authorBindingRef: `implementation-binding://${scope}/author@5`,
  assessorImplementationRef: `implementation://${scope}/assessor@5`, assessorBindingRef: `implementation-binding://${scope}/assessor@5`,
  bridgeImplementationRef: `implementation://${scope}/worksite@5`, bridgeBindingRef: `implementation-binding://${scope}/worksite@5`,
  evidenceInputImplementationRef: `implementation://${scope}/evidence-input@5`, evidenceInputBindingRef: `implementation-binding://${scope}/evidence-input@5`,
  terminalImplementationRef: `implementation://${scope}/output@5`, terminalBindingRef: `implementation-binding://${scope}/output@5`,
  projectionPredicateRef: `predicate://${scope}/projected@5`, authorPredicateRef: `predicate://${scope}/authored@5`,
  assessorPredicateRef: `predicate://${scope}/assessed@5`, bridgePredicateRef: `predicate://${scope}/worksite@5`,
  evidenceInputPredicateRef: `predicate://${scope}/evidence-input@5`, terminalPredicateRef: `predicate://${scope}/output@5`,
  stepPredicateRef: `predicate://${scope}/step@5`,
  historicalOwnerDependencyRef: `declaration://${scope}/historical-owners@5`,
  closureContractRef: `contract://${scope}/closure@5`,
});
export const SEMANTIC_REVISION_IMPLEMENTATION_REFS: readonly string[] = Object.freeze([
  SEMANTIC_REVISION_IDS.nativeIntakeImplementationRef, SEMANTIC_REVISION_IDS.nativeRequestImplementationRef,
  SEMANTIC_REVISION_IDS.nativeConstructionImplementationRef, SEMANTIC_REVISION_IDS.nativeExecutionImplementationRef, SEMANTIC_REVISION_IDS.nativeEvidenceImplementationRef,
  SEMANTIC_REVISION_IDS.selectionImplementationRef, SEMANTIC_REVISION_IDS.projectionImplementationRef, SEMANTIC_REVISION_IDS.authorImplementationRef,
  SEMANTIC_REVISION_IDS.assessorImplementationRef, SEMANTIC_REVISION_IDS.bridgeImplementationRef,
  SEMANTIC_REVISION_IDS.evidenceInputImplementationRef, SEMANTIC_REVISION_IDS.terminalImplementationRef,
]);
