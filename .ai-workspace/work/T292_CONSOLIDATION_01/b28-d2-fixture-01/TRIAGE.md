# B28 D2 binding fixture integration failure

Product Frame: F01 exact installed/lock/binding authority, F05/F06 one Public
authority and thin invocation, F07 Executive/default-direct, and F10 ABG-owned
admitted truth. TD77 separates recorded reading from strict new-work admission.
No Product or production repair is selected by this failure.

Root conjoins its Product/typed-owner/Proof trace with separate read-only
`T292-B28-D2-TRIAGE-01`. Exact source is C_final e36e4b316; original raw output
SHA f70b549623cdadff24d0cc5151359d824a1bbbfdd023521011ffcf6c76c6873a.
Classification: S4/P1 proof-premise integration failure. The command exited 1
normally in 3.2 seconds, with 1/10 passes and nine failures; no timeout,
unresolved cleanup or supported-production defect is established.

`d2-binding-harness.mjs:29-34` makes lookup binding rows without required
`causationEventRefs`. Its ArtifactTruth override at line 171 replaces only
`projectArtifactTruth`; the VM merge at 201 retains other actual exports.
TD77's `worksite_revision.ts:114` now calls the real strict-install accessor,
which reads the missing array at `artifact_truth.ts:930`. Production rows
always supply it at line 657 after causal Product reconstruction. The fixture
explicitly has no admitted prefix, so adding an empty array would only change
the failure and invoking the real fold over these rows is not lawful proof.

Cases 2/4/6/8 expose the exception. Cases 3/5/10 lose their projection through
the catch-to-null in `projectionFacts`; 7/9 become `basis_fork_detected` through
the entry gate's catch. Reproof must confirm no second cause remains. Case 1
takes native-acquisition provenance before this binding-cover path.

The affected cone is two test files and their one shared harness. Two manual
binding-row builders in `t287-native-semantic-revision.test.mjs:302,368` share
the incomplete premise. Other D2 helpers do not substitute this boundary.
Earlier full component passes were on 802e50b9f, before the final TD77 slice;
the closing TD77 proof selected real history discrimination and omitted these
component files. The TD77 Return keeps those earlier passes on their subjects.

Smallest re-entry is test-only realization repair: complete the harness's
explicit causal-install/strict-answer lookup premise and exact prefix/ref
association; route both manual builders through that premise owner. Preserve
all assertions, production guards, truth-question routing and mechanical-only
standing. Add focused absent/empty/foreign/non-strict premise negatives.
Do not return unconditional true, force recorded mode, or fabricate admitted
history. Reprove both affected files, then refresh inventory and campaign
source/population bindings before any Root-directed continuation.

The original failure remains immutable, including whitespace in raw TAP.
The recording checkpoint excludes that raw evidence from whitespace lint;
its exact bytes are independently pinned in INPUTS.json. The shared six-hour
clock is not reset. No automatic retry is selected by this triage record.
