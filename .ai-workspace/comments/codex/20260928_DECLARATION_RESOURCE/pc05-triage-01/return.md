# PC05 workflow-contract triage — closed

The actual installed failure is a GLC declaration omission. The core implements the accepted generic rule; no HoG/ABG selection redesign is warranted.

Subject: core47 and PC05 construction publication, ABI HEAD `d85c59c66f76d7218f014e856acf6d71f93adb0c`. Exact source/artifact hashes and static rows are in `diagnosis.json`. The current `pc05-01/execution/result.json` records Run `56c91358…`, cut 1,046,610,874 B, `runtime_failed`, null result, four GraphCalls, six CCalls, zero actors, and `workflow-failure-contract-ambiguous@5`. No history was reopened for this triage.

## First failed relation

At root workflow index 3, `construction-child` contains three `c_workflow` nodes, zero local executable leaves, and no `abg.failure_contract`. The resolver therefore has zero local failure rows and no declaration. This is absence, not disagreement among heterogeneous descendant failures. `cLeafTerms` expressly returns no local leaves for `c_workflow` (`gtl/c_algebra.ts:284`); validation associates executable rows with the containing GraphFunction (`validator/validation.ts:949–992`). The installed and canonical `abg/c_call` resolver selects only rows matching the exact child name (`c_call.ts:431–480`). HoG checks that resolution before opening the workflow CCall (`hog/workflow_lifecycle.ts:301–345`). It cannot reach the first constructor actor.

`evaluation-child` and `assessment-child` have the same omission and zero local rows. The preceding authenticate/prepare children have one own executable leaf with the existing GLC failure contract, so the legacy-row branch resolves them. Root itself is directly entered and is not this nested-call failure; no root change is selected.

## Governing relation and role distinction

Accepted `T287_W2_R3_C1_LIVE_LLM_WORKSITE_CONSTRUCTION_DESIGN.md:511–549` states the exact four-way rule: explicit published failure plus zero local rows; absent declaration plus one distinct local-row failure; explicit declaration agreeing with every local row; otherwise refuse before opening. C3 HOW `T287_W2_R3_C3_BRANCH_CONSTRUCTION_AGGREGATE_DESIGN.md:455–460` applies the same rule to its zero-binding child. Existing C1/C3 GTL declarations instantiate it.

The closure's `rejectionContractRef` is not the missing callable failure declaration. It enters the execution basis and governs a blocked rejection judgment (`abg/c_call.ts:6894`). The callable `failureContractRef` selects failure Result admission (`abg/c_call_outcome.ts:953–964`). Equal current contract URIs do not merge those roles.

A child native leaf retains its own failure contract. Ordinary failed child traversal is folded back with the exact child result/digest, judgment, reason, terminal event and causal child identity (`abg/c_call.ts:3946–4000`), then HoG creates the parent's declared `child_traversal_failed` carrier with the child reason (`hog/workflow_lifecycle.ts:654–697`). A runtime-failed child is propagated directly (`:558`). Blocked child candidates are conserved. Thus declaring the composite's existing GLC failure contract does not replace or conceal a native leaf's original failure.

## Correction and discriminator

Smallest repair: the GLC constructor publishes `abg.failure_contract: ids.failureContractRef` on construction, evaluation and assessment composite children. Keep existing contracts, closure rejection, inner native/evaluator failure contracts, runtime resolver, and all carrier identities outside those necessarily changed declarations.

The same resolver governs HoG proposal, ABG workflow opening (`c_call.ts:5474`), exact opened-call projection (`:2634`), and rehydration (`:4179`). A HoG-only fallback would disagree with adjacent owners. No change to these branches is justified.

A focused consumer component case should construct the three-child publication with the existing evaluator and assessment, preserve ordinary Program/publication conformance, and project each explicit failure reference to the one existing published failure declaration with zero local executable rows. Removing the declaration must remain a runtime refusal; declaring a different/nonfailure contract or conflicting own leaf must not be rescued by closure/descendant selection. Existing C1 resolver controls cover declared/legacy/agreement branches (`test_env/tests/t287-worksite-construction.test.mjs:484–509`); they were inspected, not rerun. Its removal control also mutates a previously validated child digest, so it is not alone a freshly validated missing-declaration discriminator.

The current validator checks a failure declaration only when present (`validation.ts:1727–1750`) and checks child closure independently. It does not establish that every named child has a complete failure interface. This is a preventive validation gap under `REQ-L-GTL3-C-ALGEBRA-014/-016`, distinct from the lawful runtime refusal; any generic early validation correction belongs to the GTL validator over the same own-row relation, not HoG inference. No core repair is selected here.

## Evidence limits and residuals

Observed installed outcome and source/declaration facts are distinguished from the causal deduction above. No new Run, actor, event, journal read, test, install, package, or worksite action occurred. The conjunction diagnostic also covers other closure prerequisites; the missing failure interface is independently sufficient to produce it, and no claim is made that all later native/evaluation/assessment paths now succeed.

Retained timings: execution 109.516 s; two isolated Public reads 145.924 s (Result 72.699 s, replay 72.225 s); setup 52.746 s including install 47.025 s. All exceed the investigation trigger. This failure triage does not attribute that remaining cost or justify repeated cold acquisition; it reuses Root's retained timing evidence and performs no profile. Source reads/writes in this triage were subsecond tool operations. No setup timing is counted as graph execution.

Frame: fixed fifteen-family Product, current native steel thread, end-to-end interface integration with Runtime/Owner/Reuse/Proof. Immutable GraphFunction/contract declarations are the defective input; runtime events and their projections correctly retain the failed attempt. Executive owns repair selection and subsequent installed proof.
