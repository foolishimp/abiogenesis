# Remaining 17
Same subject/frame as RESULT. Read-only, no tests/native calls. Paths: code/src/. D: dead, realization_refactor eligible; shared owners stay. L: dynamic/live. U: HOW unresolved.

| Path:line | Symbol | Result |
|---|---|---|
| validator/validation.ts:556 | isPublicationValidation | D |
| shared/operation_definition_coordinate.ts:44 | matchesExactOperationDefinitionCoordinate | D |
| product/semantic_job.ts:595 | semanticJobAssessmentDomain | D |
| abg/invocation_admission.ts:806 | hasAdmittedInvocation | D; AtPrefix owner stays |
| abg/c_call.ts:3521 | admitPlannedCCallRuntimeFailureClose | D |
| abg/c_call.ts:5136 | rehydratePendingInteraction | D; readers use projectPendingInteractionCarrier |
| abg/c_call.ts:7560 | admitPlannedPendingInteraction | D; owned admission stays |
| abg/qualification_proof.ts:690 | projectQualificationConstructionAuthors | D; constructionAuthorSet stays |
| public/gap_authority.ts:154 | updatePublicGapAuthority | D |
| public/gap_authority.ts:170 | parsePublicGapAuthority | D; barrel exports types only |
| public/run_projection_authority.ts:117 | updatePublicRunProjectionAuthority | U |
| hog/traversal_failure.ts:16 | isGraphTraversalEntryRefusal | D |
| hog/traversal_completion.ts:168 | projectBlockedRetryTraversalCompletion | D; retry semantics stay |
| implementation/leaf_invocation_port.ts:861 | isAdmittedLeafInvocationResolution | D; port method stays |
| implementation/semantic_revision.ts:121 | realizeSemanticRevisionNativeConstruction | L |
| implementation/semantic_revision.ts:126 | realizeSemanticRevisionNativeExecution | L |
| gtl/stdo_run_environment.ts:80 | constructHistoricalStdoRunEnvironmentDeclaration | D; current constructor stays |

L route: gtl/semantic_revision_publication.ts:24-31 enumerates both roles and computes namedSymbol from capitalized role; :105-106 builds both leaf nodes. implementation/semantic_revision.ts:31-38 publishes descriptors. product/implementation_resolution.ts:436/504 checks/transports namedSymbol. implementation/leaf_invocation_port.ts:1690-1692 loads module[admittedResolution.namedSymbol].

U: design/M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:2485 selects update after read; no caller. Root must reconcile HOW before deleting this function.

D: bodies inspected; current source/test/support/script, barrels, contracts and manifest have no consumers. RESULT supplies package/declaration analysis. No computed registration found. Delete functions and newly-unused imports only; ancillary stores/helpers need separate census. Compile/declaration/package and affected owner proof remain required; static evidence is not executed equivalence.

Hash delta: only excluded readable wording changed from “type appears in declaration closure” to “exported owner type needs an exact declaration-closure check”: withdrew unverified claim, +26 bytes, fe6d240e→6856fd5a. Eight candidates unchanged; 17,253-byte lifetime report is separate. RESULT stays frozen.
