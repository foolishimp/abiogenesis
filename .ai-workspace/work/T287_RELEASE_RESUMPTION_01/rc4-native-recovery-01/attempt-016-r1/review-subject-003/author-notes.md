# HC2 Worker notes (unaccepted)

Commentary only. Source 3c3c6e803 / tree e669e2a9.

## Done
- Owner population: Product start/invoke, run continuation (current_intent,
  pending_execution, selected_action), six run reads, AdmissionCapabilityData.
  Expected-slot population is shared with runOperationAuthorityMatches and
  runReadKernel, and the check order is unchanged.
- Shipped SDK constructors in public/installed_public_definition_call.ts are
  exported from public/index.ts. The CLI transport is unchanged.
- Consumers migrated (see return.json). The ST-1 composition now calls the
  shipped direct invoke and all six reads.
- HC1 residuals: skipLibCheck:false on the proof config; raw refusals for all
  9 unavailable leaves; per-alternative union typing.

## Checks
- tsc 5.9.2 canonical: 0 diagnostics.
- In-memory declaration emit: 290 files, 0 diagnostics.
- HC1 proof compile in memory: 0 positive diagnostics; 19/19 negatives held.
- readiness.py: FILE_ONLY_READY.

## Residuals
- The out-of-grant uat/harness.test.mjs mocks the superseded owners. This
  blocks migration of constructLifecycleCall and freshReadbacks.
- dispatch rootAuthority still supplies the observedC2Task grant.
- declared-testing stdoEnvironmentResources is conserved as an explicit
  resource patch.
- tsconfig.json skipLibCheck:true is outside the grant.
- No runtime, packed, C2 or UAT proof has run.

## Same-Run correction after C2 Result 849a8bbb (unaccepted)
- ST-1: the stale-resource-prefix falsifier populated at the setup prefix,
  where the Run is absent. Now populates at the current handoff and
  substitutes the stale resource explicitly. The GraphCall for the SDK reads
  is bound to the invoke owner output and to the log.
- current-intent: the relative ABI5_EXACT_INTENT_EVIDENCE_ROOT left readyPath
  and the transport command cwd-relative in the CLI and actor processes. The
  root is now resolved. There is no populator divergence from
  prepareConstructionIntentContinuation. The exact failing line is not
  confirmed: its stdout was omitted.
- Checks: tsc 0 diagnostics; in-memory HC1 compile 0 positive, 19/19
  negatives; node --check ok; readiness FILE_ONLY_READY.

## Same-Run correction after UAT 3f537f92 (unaccepted)
- HC2-1 first failure: the call type did not distribute over its selection
  union, and constructEnvelope erased the population with `as unknown as`.
  Constructors now return correlated alternatives through one checked boundary
  (admitExactDefinitionCall plus a variant check). The typed transport accepts
  each output, and operationId narrows.
- Proof: 26 positive type assertions, a positive transport use, and 11 hc2
  negatives. HC1's 19 negatives are unchanged.
- ST-1: the shipped graph_function start executes. The asset start gets the
  existing invalid_target refusal because the fixture publishes no asset
  target.
- Negatives: wrong-Run, stale-prefix and absent-Run population for
  current_intent. Absent-Run for selected_action. Wrong-Run and stale-prefix
  for pending_execution. A missing historical source in retained-source B.
- Owner sharing: (a) actor check; (b) three shared select/resolve/prepare
  sequences; (c) the dispatch C2 grant now comes from population;
  (d) stdo resources are kept explicit, because the strict schema has no key
  for them.
- Checks: tsc 0; declaration emit 290/0; proof 0 positive errors and 30/30
  negatives; node --check ok; readiness FILE_ONLY_READY.
- Not run: tests, build, pack, install, Runs. Residuals: harness.test.mjs and
  tsconfig skipLibCheck (Root); no positive asset execution.
