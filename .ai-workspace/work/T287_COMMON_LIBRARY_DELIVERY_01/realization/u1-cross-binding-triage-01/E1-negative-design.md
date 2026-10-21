# E1 — ready design for one fully re-signed grant mismatch

Status: source-audited construction recipe for later Executive-selected proof, **not executed**. Existing wrong-grant/task/binding cases at `t287-native-work-unknown-effect.test.mjs:359–361` do not recompute their canonical identity chains, so they do not isolate those semantic guards.

Use the unchanged `createU1Fixture` extension point `taskFactory`. Keep the environment's valid G1 grant in the actual admitted invocation. Construct G2 from the same grant body by changing only `policyRef` to a distinct nonempty fixture URI and `policyDigest` to `sha256Canonical` of that selected policy marker. Recompute **both** `grantDigest = sha256Canonical(body)` and canonical `grantRef`. Preserve actor, binding scope, authority, operation, definition and contract coordinates. Product's `isCapabilityGrantValue` (`product/invocation.ts:613–704`) and `constructNativeWorkspaceWorkTask` (`product/native_workspace_work.ts:36–54`) must accept G2 and the task; this is a typed identity mismatch, not a corrupted digest or scope.

The taskFactory observes the actual disposable context with the existing declared bounds and passes the exact owner operating fields, using G2 only in the task. It leaves `env.capabilityGrant` as G1. The unchanged fixture then constructs and actually admits, in order:

- invocation/Public payload with G1 and its valid canonical admission identity;
- task T2 with G2, `rawInputDigest = sha256Canonical(T2)`, and a newly hashed execution-basis body/ref;
- all call/fibre/transport/actor/process envelopes under that new basis;
- transport body and canonical binding ref/digest using T2's input digest;
- actor payload referencing that exact transport binding and T2's digest;
- process and cause using actual newly admitted causal event references.

EventStore must calculate event payload/event identities and ordinals. Do not clone an admitted event and change its nested payload; do not merely update payloadDigest. The source-owned fixture computes every dependent task/basis/transport coordinate afresh and admits the chain, preserving the declared invocation mismatch as the only intended failing relation. The positive fixture with task G1 remains the paired control.

Preconditions before claiming a grant guard proof: `isCapabilityGrantValue(G1/G2)`, `isNativeWorkspaceWorkTask(T2)`, exact basis and invocation projectors, selected implementation set, ordered unique call/fibre/binding/actor/process prerequisites, and all envelope/payload/digest joins must succeed. `projectExactExecutionBasisAtPrefix` (`invocation_execution_truth.ts:614–673`) authenticates rawInput/basis without inspecting task grant membership, so it does not substitute for the target guard. Then `native_work_effect.ts:114–125` must return null specifically because no admitted invocation grant is canonically equal to G2. Compare actual currentness and invalidator output to the lawful G1 control and retain all exact candidates/prefixes.

This isolates invocation-grant membership. It does **not** establish independently re-signed wrong-binding or wrong-call isolation; those remain separate finite proof obligations unless the Executive selects corresponding coherent chains. No Production change, installed invocation, actor launch, new event contract or new helper framework is required for this case.
