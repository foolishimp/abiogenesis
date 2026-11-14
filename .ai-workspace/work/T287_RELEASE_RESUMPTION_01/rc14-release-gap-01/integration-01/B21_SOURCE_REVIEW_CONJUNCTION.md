# B21 source QA and bounded repair triage

Product Frame: fixed ABIogenesis 5.0; RC14 B21 under exact STDO3.0.4 and
F-WORKSITE-CAUSALITY. Immutable binding/install coordinates remain distinct
from mutable worksite observations. Metadata supplies physical evidence;
existing owners decide effects and ABG alone admits runtime truth. No atomic
mount lock, hostile-host guarantee, new Public family or runtime is selected.

Subject: source `ad6c195f56ebeea0f8cd1a620a0346a26a5c0667`, 19 source rows,
digest `9a720e408f20acd8e7331e8fd5861b0c1a299414ea0607220be0b1fcfb948c54`.
Independent read-only Physical/Owner Reviewer `/root/rc14_release_proof`
verified every row at entry and return. Root separately checked the actual
source paths and governing HOW before disposition. Mechanical proof is 178
passes plus six declared historical skips; it does not override these findings.

## Originating relations and supported counterexamples

1. C2 HOW section5 requires host and helper independently to establish physical
   exclusion before affected protected reads. `inspectCommitLocus` in
   `product/worksite_operations.ts:459` calls `inspectTargetPath`, which reads
   target bytes at344, before `checkPlannedProtectedRoots` at462. The real
   helper uses this at `worksite_command_helper.ts:1322`. A single-linked file
   under the worksite, with its protected root using the self-canonical Data
   alias and a lawful sibling archive, is read before eventual refusal.
   The host counterpart guards before reading. This is ordering of an existing
   effect boundary, not a new confinement policy or a concurrent-mount race.
2. The same HOW preserves the directional Product-root rule. Host
   `worksite_command_execution.ts:350-360` tests event-log, runtime-state,
   projection and toolchain roots against Product root in contained mode.
   Helper `worksite_command_helper.ts:254-288` checks only archive versus roots.
   Data-spelled Product root plus ordinary-spelled runtime-state beneath it and
   a separate sibling archive passes the helper boundary but refuses at host.
   The helper's independent admission must carry the existing complete rule.
3. `abg/default_library.ts:109` protects context with authenticated installs,
   but120 independently observes selected paths without them. Direct Testing
   law in `product/default_library.ts:147-154` permits no synthesis and no prior
   observations; selected paths need not be beneath readRoots. An admitted
   installed Product under the worksite outside R can therefore be observed as
   an ordinary selected file. The authenticated environment is already held by
   this owner. Carrying its roots is an existing protected-subject input repair.

## Root-cause conjunction and repair selection

Product/requirements retain protected effects and exact owner authority.
The accepted C0/C2 HOW supplies physical evidence and directional policy.
Implementation has the sufficient relation but fails to apply it at two
actual owner boundaries, and one owner drops available protection inputs.
Integration/identity: host and helper own independent checks, not a trusted
host flag; admitted environment supplies install identity, not a caller list.
Effect/lifecycle: protected byte reads count as effects even if later refusal
or unchanged final trees conceal them. Preserve resource/descriptor close,
O0/O1 currentness, snapshot identity and existing partial-effect accounting.
Proof: the new C2-labelled test invokes shared sync/async relation drivers,
not host realization/completion or helper admission. Generic C2 positives and
shared-classifier negatives cannot prove these omitted owner integrations.

Root selects one bounded realization repair through pinned RC13: establish
physical exclusion before C0 subject content acquisition, preserve/reacquire
currentness; apply the complete existing directional rule in the helper;
propagate authenticated install roots in direct Testing. Use existing owners
and the common relation, with no new task field, controller or semantic owner.
Mechanical helper placement/sharing remains the capable Writer's choice.
Required regressions call the actual helper/Testing owners with controlled
material inputs: alias negatives and lawful sibling positives, counted target
reads and forbidden effects, plus retained C2 completion/currentness and B04/B05.
A copy of the classifier test or final-tree-only assertion does not suffice.

The two semantic-job omissions at326/341 remain under a short parent/context
trace before disposition; an author observation alone is not a proven defect.
Darwin-arm64 and cross-mount uncertainty match selected HOW. The APFS/HFS
attachment synthetic test establishes classifier behavior, not arbitrary-mount
safety. No concrete escaping topology was found under the stated trusted-kernel
local-volume assumptions. Keep that claim bounded. Native build input closure,
missing/incompatible actual addon execution, Node20 execution, performance and
qualification resources belong to their distinct selected or residual proof.

No B21 technical closure or release claim is made. Initial source and proof
remain an immutable checkpoint; successor repair produces a new subject.

## Closed semantic-input follow-up and final repair cone

Reviewer reacquired immutable object ad6c195f5 after the Operator added only
Return records. `originalForParents` and `deriveSemanticJobReadDependencies`
authenticate exact historical parents, original design/plan/context and A/W;
they do not establish current physical separation before the later read.
`authenticateOwnedSemanticJobBasis` returns native.environment, and
`operating(owner)` already derives protectedInstallRoots at199-200. Both subject
calls326/341 drop that field. Root includes passing those existing roots in the
same bounded observation-input repair, with no reproduced semantic-job escape
claim and no new Product rule. Preserve all predecessor, envelope, identity and
digest comparisons, without refreshing history or resolving installs anew.

Default Testing has a fast actual-owner route in the existing rc7FixedRoute
harness and a real installed Public direct-Testing-to-UAT route in the same
maintained file. The former substitutes admission premises and must be labelled
component evidence; the latter must derive its environment through real owners.
Root selects the successor in `../b21-native-01/repair-01/ACTIVATION.json`.
