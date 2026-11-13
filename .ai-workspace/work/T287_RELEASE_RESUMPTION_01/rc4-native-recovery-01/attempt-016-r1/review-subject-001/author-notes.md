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
