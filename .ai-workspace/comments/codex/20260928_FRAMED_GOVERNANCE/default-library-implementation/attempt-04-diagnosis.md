# S5 attempt 04: closed pre-actor diagnosis

The failure is a consumer fixture input error, not another root/child owner join. `test_env/support/default-library.mjs:70` selects `readRoots: ["."]`, while its own `libraryEnvironment.resources` at lines 52–55 creates the selected STDO temporary directory beneath `WorkspaceBinding.roots.archiveRoot`. The existing worksite observer correctly refuses traversal into that protected runtime root. Default-library preparation collapses that refused context to its declared `missing-owned-prepare-selection` failure. No provider ran.

## Actual owner trace

`diagnose-attempt-04.mjs` imports the exact installed attempt-04 owners and reacquires the retained durable prefix before each call's first Evidence. It reconstructs the declared graph, admitted cursor/call/execution and authenticates the existing NativeInstructionAssemblyBasis; it neither appends events nor mocks any owner. `diagnose-attempt-04.json` records:

- Initial parent: real assembly basis authenticates; `projectGovernanceParent` returns the conserved open state; `governanceResultMatches` accepts it. The actual Run already admitted that result at ordinal 20.
- Selection preparation: real child assembly basis also authenticates. Root invocation/implementation identity and original state are conserved. The public worksite observer receives the actual bound authority, grant, install roots and input read scope. It returns `worksite_effect_refusal / subject_outside_territory`, message `worksite path escapes A or enters a protected install/runtime root`.
- The bound archive root is `<worksite>/.ai-workspace/archive`; selected environment acquisition created `default-library-context` there before the first parent call. Thus `.` necessarily traverses protected runtime data even though the ten application files total only 10,222 bytes. This is not a context-volume limit.
- Selection projection returns null; no valid preparation result exists for result admission. Runtime truthfully admits the declared failure at ordinal 40 and terminates at ordinal 50. There are no actor transport bindings or actor starts.

The earlier pre-Run basis error affected the common `owner` join and is now disproved on both actual parent and child calls. This new error is shared **fixture scope**, reaching every preparation that calls `currentContext` and, later, the native task's before/after observation through its conserved read roots. Changing one guard or skipping protected directories would hide the mismatch and weaken the existing complete-or-refused observation contract.

## Smallest coherent correction and discriminator

Change only `witnessInput` to declare the ten selected application/source paths as its explicit `readRoots`, derived from the already selected seed paths. They include all protected original sources and the writable candidate; they exclude runtime/archive trees and need no authority broadening. Keep the seed/oracle/selection unchanged, literal context validation unchanged, and all original obligations/effect limits conserved. Subsequent C2 results enter context through their admitted observation, not by crawling private runtime files.

An actual read-only observation against the same installed bound worksite and proposed ten paths succeeds: ten entries, 10,222 bytes, every original source digest present. This is prospective fixture feasibility, **not** a corrected invocation or native outcome. No source edit, build, install or provider successor has occurred.

Before a successor, add one affected real-owner readiness discriminator to the existing test: acquire the declared worksite context with the actual installed binding/grant after run-environment resource preparation, require all original sources plus read-first/candidate paths, and conserve this exact read-root list in task preparation/result checks. Retain a focused refusal for the overbroad `.` selection entering the protected archive. This checks the common selector/native/testing context premise once instead of separately patching each null guard. Do not add a new harness/controller or bypass runtime owners. Reuse the current core archive if the independent review requires no production change; only consumer fixture input needs correction.

## Frozen identities and limits

- `prelaunch-subject-04.json`: `049507ee44719b9dd2ca013f07996891accf25de00fc433dfc93520c0f9eafa1`; all listed files still match.
- `attempt-04-identities.json`: `d9dd7a8d585a7194a75f80876ac20d4af457c98fbde6a2a35a4501b51df5fe95`; every retained attempt file rechecked unchanged.
- Diagnostic source: `c0a2d1433c1ebef929e83c10ed560853095a1826618ca837a93980b90681fd96`.
- Actual diagnostic result: `0b7db6241420f19460cfdbe78890a52dc3c89ac9215f6280ed41acd3e9815799`.
- `diagnose-attempt-04.log` and `-02.log` preserve two diagnostic-script acquisition mistakes (cursor position, then Evidence-cut selection); `-03.log` is the successful real-owner read. These did not alter runtime/source or call a provider.
- Attempt execution: 2,995.845 ms, all framework, 47 new events. Setup artifact verification: 11,670.663 ms for 5,250 members / 67,429,301 unpacked bytes. Public request: 17,369,140 bytes. No outcome/readback success is claimed.

Source remains frozen for the independent pre-actor checkpoint. This closes the incident diagnosis; implementation awaits the Executive's conjunction with that review.
