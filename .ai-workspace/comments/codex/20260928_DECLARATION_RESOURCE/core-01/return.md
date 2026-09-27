# T287_DECLARATION_RESOURCE_01 — closed core Worker return

Implemented the core portion selected by T-287's current framework-cost correction and the 2026-09-28 R10/C2 HOW amendment. Base: `d85c59c66f76d7218f014e856acf6d71f93adb0c`. Exact STDO 2.5.1 RC1 manifest `5d306da13994e69aa9f215d4c1cd2d0be96283c1e33a652b58e6e9262d036b64` verified valid. Selected frame is End-to-End Interface Integration with Computational Whole-Path, Owner and Reuse; fixed fifteen-family Product and trusted developer-host scope remain unchanged. Root owns GLC, caller resources, HOW/tickets, review and installed proof. No reviewer was launched by this Worker.

## Interface and ownership

New native requests use:

```text
source: {
  prefix, graphCallRef,
  declarationReference: {
    kind: "abg_historical_declaration_reference", schemaVersion: "5.0.0",
    catalogBasisDigest, readinessBasisDigest, viewDigest
  }
}
```

`/abg` exports `constructAbgHistoricalDeclarationReference(proof)`, its schema, predicate and type. This constructs a selector, not admitted proof. The existing `historicalSource` resource accepts optional `declarationDependencies: AbgHistoricalDeclarationProof[]`. Primary and additional candidates must have unique exact Catalog/readiness/View selectors; a crossed Catalog/View or duplicate candidate refuses. Primary terminal and constructor dependencies remain distinct. Full proof bodies stay in resources without stripping or repacking.

Establishment APIs append an optional `historicalSource` argument:

- `projectNativeWorkReacquisitionTask(current, request, nativeBasis, historicalSource?)`
- `authenticateNativeWorkReacquisition(basis, input, requireCurrent = false, historicalSource?)`
- `nativeWorkReacquisitionResultMatches(input, value, currentOwnerPrefix?, historicalSource?)`

The existing leaf proof operations carry that dependency from Run resources to preparation and its pre-admission judgment. Direct implementation fallback accepts it as argument six; builtin judgment fallback accepts it as argument five, after the optional native proof operations. Missing/mismatched resources are resolved before any retained establishment lookup. Reuse is tied to the exact resolved immutable proof object; a copied or altered proof re-enters R10, and mutable proof candidates are not retained as reusable facts.

Historical inline `{prefix, graphCallRef, declarationProof}` requests remain supported with their original canonical body and identities. There is no normalization into the new form. Independent R10 source/terminal queries retain their original declaration requirement; their exact optional-field gate now accepts and checks the additional dependency list.

## Admitted preparation consumption

`projectReacquiredNativeWorkCommandSourceAtPrefix` no longer calls the declaration-dependent candidate matcher. It reconstructs from the supplied validated history:

1. The exact recorded preparation and original-source cuts using existing physical-prefix metadata, plus their event-resource relationship. This performs no journal read.
2. The actual preparation raw input, normalized GraphFunction/materialization, opened F_D CCall, selected implementation/binding, root implementation set and invocation grant. The recorded preparation cut must be before evidence.
3. The complete canonical task relation, its unique successful Result, deterministic evidence with the exact implementation/input/output digests, and the declared advance judgment causally joined to that Result. Existing CCall phase and Result/J identity owners validate the admitted outcome.
4. The original native producer and closed child through the existing native-source owner, historical binding cover, and the consuming parent's same Run/invocation/root set/grant, C2 selection and ordering after judgment. Current source invalidators and binding cover are checked again at the consuming cut.

C2 admission, pre-effect source gating and replay keep their existing resource-free signatures. Physical effect checks remain at their existing owner. A task body, generic success, missing Result/J, wrong producer/evidence, changed source or uncovered binding cannot replace these joins. No new event, proof receipt, registry, process-local authority or declaration cache was added; the existing private preparation reuse entry now records its exact proof dependency.

## Self-checks and scope

Compiler and exact-path `git diff --check` passed. Across the selected existing test files, **20 distinct tests passed; 7 external-history controls were intentionally unexecuted**. `check-summary.json` records the commands and final disposition. The first aggregate runner accidentally included an external-history normalization test because its negative-lookahead selection did not exclude it; the test refused immediately for missing environment before reading history. The corrected `--test-skip-pattern` normalization run passed its constructor control. The complete historical fixture was not repeated.

New controls cover exact/missing/duplicate/crossed proof resolution, changed proof bytes with equal selectors, missing resources after warm success, leaf and builtin proof operations and direct fallbacks, stale occurrence/current physical context, cold consumption before Result or J, wrong evidence/producer/C2 selection, source invalidation/binding refusal, and inline request/task compatibility. Cold consumption records zero declaration resolutions and zero history reads. The former environment-dependent synthetic current-owner test was replaced by these always-running bounded owner controls; the separate retained real-source tests remain available but unexecuted.

The new owner fixture uses real Product values, physical cut calculations and CCall phase/Result/J reconstruction. Declaration, native producer, environment and opened-occurrence lookup premises are explicitly supplied; this is module-owned proof, not installed C2/replay qualification. Existing C2 tests also retain physical-source refusal before dispatch. Existing R10 tests preserve scoped liveness and the prior accepted runtime contractions.

Root explicitly authorized the existing **13,540,472-byte disposable historical-source recovery fixture once**. It passed in **10.865 seconds aggregate**, with 11 catalog reconstructions across live reuse, cold copies, crossed candidates, additional dependencies, closed owner and tampered temporary history. Its source history remained unchanged and the scratch copy was removed. This exceeds the investigation trigger as an aggregate: source inspection attributes repeated reconstruction to the deliberately distinct cold/copy/refusal controls. Setup/copy and individual operation times were not separately instrumented, so this number is not a pure single-read timing or cost-closure claim. No preserved native worksite/history was copied or mutated, no gigabyte profile was rerun, and no paid/native Run, package or installation was performed.

## Frozen subject and residuals

Nine source files and two existing test files changed; `subject.json` enumerates their exact base/current hashes and corresponding compiler emissions. `changes.patch` contains only those files. Source territories are:

- `code/src/abg/{index,native_work_reacquisition,project_read_ports,terminal_result_contracts}.ts`
- `code/src/implementation/{contracts,leaf_invocation_port,native_work_reacquisition}.ts`
- `code/src/product/{builtin_semantics,worksite_command_execution}.ts`
- `test_env/tests/{t287-native-work-reacquisition,t287-historical-source-resource}.test.mjs`

The previous four accepted contractions remain intact. No Product/HOW/ticket/GLC edits belong to this Worker subject.

Actual caller byte reduction, installed preparation, C2 child/pre-effect integration and fresh full readback remain for Root's conjoined review and installed discriminator. The new physical-cut search uses binary search over the existing physical-prefix relation: physically decoded histories reuse physical receipts without body serialization or I/O, but worst-case reference checking is O(N log N). The existing all-inline in-memory fallback serializes its logical fixture. That residual has not been measured on the installed material history and is not hidden behind a new cache or broader index redesign. No end-to-end runtime improvement, PC05 readiness, native qualification or Product completion is claimed by this source return.
