# Conformance Audit: Retain One Traversal Spine and Close the F_P Result Boundary

- recorded_at: 2026-07-19 07:03:52 AEST
- recorded_at_utc: 2026-07-18T21:03:52Z
- status: open_conformance_audit
- scope: T-270, T-271, T-276, T-281 public invocation and result steel thread
- change_class: design_reframe evidence only
- implementation_disposition: paused pending bounded course correction
- authority:
  - `specification/requirements/abg/REQ-R-ABG3-CCALL.md`
  - `specification/requirements/abg/REQ-R-ABG3-EVENTS.md`, especially EVENTS-032
  - `specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md`
  - `specification/requirements/product/REQ-P-POLICY.md`
  - `build_tenants/abiogenesis/typescript/design/M03_COMPLETE_C_PROGRAM_INTERPRETER_BEHAVIOR_DESIGN.md`
  - `build_tenants/abiogenesis/typescript/design/M04_PUBLIC_OPERATION_DEFINITION_FAMILY_BEHAVIOR_DESIGN.md`

## Verdict

The retained traversal spine is lawful and remains the only execution spine to
extend. The reverted direct F_P shortcut must not return in another form.

The next implementation is bounded to four missing joins:

1. keep `ResultArtifact` evidence separate from the GraphFunction target value
   `B`;
2. let the existing T-271 atom boundary admit one closed family of F_P interior
   events between its existing C-call open and close rows;
3. join process-local live steering after admitted public authority and before
   the selected F_P interior; and
4. make public result evidence and `result.assess` constructable from replay,
   not from transport-private caller input.

No new controller, traversal loop, C-call, public operation, or runtime-event
kind is required.

## Verified Lawful Baseline

The retained F_D path has the correct shape:

```text
PublicInvocation
  -> exact P1 admission
  -> admitted One Surface AF-13 / AF-14 selection and intent
  -> finalizePrivateRunInvokeExecutionIngress
  -> executeSelectedCatalogDirectProgram
  -> compileTraversalExecutionFamilyForRuntime
  -> interpretCompleteCProgram
  -> T-271 invokeAdmittedAtom
  -> exact target-schema admission
  -> T-271-owned C-call result admission and receipt
  -> AF-16
  -> replay-derived project.read
```

The compiler-derived traversal family preserves Module, GraphFunction, vector,
program, locus, role, fibre, arm, carrier, schema, and catalog authority before
effects. `interpretCompleteCProgram` owns the one structural fold. T-271 owns
the exact leaf C-call identity, buffered open rows, evidence enclosure, close
rows, and sealed replay receipt. Batch and retry reuse that leaf boundary and
do not open synthetic parent calls.

This baseline is not F_D-specific architecture. F_D is simply the currently
realized interior. F_P must substitute one compiled fibre interior without
changing the public ingress, One Surface control, plan selection, T-271 fold,
C-call shape, AF-16 evaluation, or projection path.

The rejected shortcut failed this rule by reading raw declarations, selecting
an alternate route in M04, calling an engine-start path outside T-271, and
hard-coding a blocked public result. It has been removed. This audit preserves
none of those mechanics.

## Findings

### P0 - `ResultArtifact` and target `B` are different categories

The existing `attached_result_artifact` wire profile is an F_P evidence and
attribution envelope. Its fixed body contains result-contract identity, edge,
actor, and fulfillment assessments. The normalized `ResultArtifact` adds
dispatch/result identity, execution attribution, identity issues, and runtime
failure truth.

That object is not the GraphFunction target value `B`. A GraphFunction such as
Hello World declares its own target Node schema. The F_P result must therefore
preserve two separately admitted coordinates:

```text
ResultArtifact
  = result identity + selected F_P result contract + attribution + assessments

targetValue: B
  = worker-proposed domain value admitted under the exact compiled target Node
    RuntimeSchemaAdmissionCapability
```

The wire/result carrier needs one explicit candidate target-value field. Wire
admission validates the F_P result envelope. Target admission separately
validates that field as `B`. The whole `ResultArtifact` must never be passed to
the target schema unless the GraphFunction explicitly declares
`ResultArtifact` as its target type.

The inherited `attached_fp_worker` path currently mints target-carrier identity
from the assessment-shaped `artifactPayload` without invoking
`validateTargetCarrierCandidate`. That is pre-wave category debt exposed by
the public steel thread. It must be replaced at the admission origin, not
normalized by a public projection.

### P0 - T-271 has no lawful carrier for F_P interior events

T-271 is correctly the sole owner of the leaf C-call spine. It creates the open
rows before invoking the atom, then places admitted evidence rows before its
close rows and seals all rows into the atom receipt.

The current extension point permits only:

```text
authority_snapshot_admitted
payload_observed
payload_validated
evidence_admitted
```

An F_P interior also produces declared dispatch, actor/process, instruction,
response-contract, and result-observation facts. Emitting them directly from
the plugin callback would place them outside or before T-271's buffered open
spine. Calling the older engine-start path would create the rejected second
execution spine.

The bounded repair is a neutral T-271 atom-interior carrier. The admitted atom
callback returns a closed, regime-neutral interior-event sequence plus its
existing payload evidence and close basis. T-271 checks exact basis,
GraphCall, frame, vector, edge, C-call, ordering, and allowed event kinds, then
seals:

```text
C-call open and fibre selection
  -> admitted F_P dispatch / actor / process / instruction / result interior
  -> target payload and evidence admission
  -> C-call result admission and judgment
```

T-271 still constructs the only C-call. The plugin remains an interior effect
provider and cannot emit, order, close, retry, or continue runtime truth.

### P0 - public `result.assess` is not replay-constructable

The accepted M04 operation contract requires the expected runtime-result
coordinate, assessment-contract coordinate, typed assessment, actor and
capability provenance, evidence refs, and current basis. The public operation
must be invocable from the result and evidence returned by the preceding public
path.

The current candidate instead parses the public `assessment` field as the
legacy private `fp_assessed` carrier. That carrier contains a full
`DispatchRequest`, full `ResultArtifact`, manifest provenance, published ledger,
and fulfillment rows. These are transport and owner internals. A caller cannot
lawfully reconstruct them from `project.read`, and accepting a caller-authored
copy would create a second authority.

The focused test currently manufactures the required target/evidence replay
events and then asserts the evidence read remains `projection_unsupported`.
That is an honest red test, not product closure.

Repair `result.assess` so the caller supplies only the published typed request.
The semantic owner rederives dispatch locus, exact result contract,
ResultArtifact, evidence authority, fulfillment rows, attribution, and current
basis from admitted replay and installed authority. A mismatch refuses before
an `assessed` event. The existing `assessed` event and
`result_assessment_admitted` Event Calculus derivation remain the owning truth.

### P1 - the hard break still has live legacy execution surfaces

The retired `abg.operation.catalog.invoke` implementation remains in
`runner/catalog_invocation.ts`. The old M04 `runtime_operations.ts` remains
publicly re-exported. Both remain executable while the replacement 19-operation
family is being assembled.

This residue cannot coexist with closed T-270/T-281. Remove the legacy exports,
handlers, tests, and generated assets in one atomic P2 switch after the new
public path is green. Do not retain a facade, alias, fallback, compatibility
flag, or parallel operation register.

### P1 - the T-223 packed proof reads a diagnostic excerpt as result truth

`test_env/fixtures/t223_packed_consumer/consumer.mjs` reads
`actor_result_artifact_observed.artifactContentExcerpt` and `JSON.parse`s it to
recover the worker response and selected result contract. The excerpt is a
truncated diagnostic field on an observation event. It is not an admitted
payload body or replay-stable result carrier.

This violates the same category boundary as the rejected public-projection
shortcut. The T-223 proof must consume the typed admitted `ResultArtifact`,
target value, declared contract, and evidence through the normal result/replay
surface. The packed fixture and live transport remain reusable; only the proof
oracle is invalid. No public archive resolver or excerpt parser should replace
it.

### P1 - live steering identity exists but its process-local body join is missing

`InvocationAuthority` lawfully carries only steering ref, digest, and
provenance. `BoundWorkspaceContext.effects.operatorCapabilityFactories` owns
process-local capability construction, and the existing live capability
factory requires the actual `TransportSteering` body.

Join these once in M04 after AF-14 and before M03 AF-15 execution:

1. select the exact declared steering ref/digest from admitted invocation
   authority;
2. resolve that identity through the bound workspace's process-local effect
   table;
3. construct one identity-free `LiveCapabilityBinding`;
4. pass only the resulting `EnginePluginCapabilities` to the selected F_P
   interior.

The steering body, callable factory, and plugin capability must not enter the
public invocation, execution-basis identity, replay, GTL declarations, catalog,
or persisted event truth. Missing or mismatched process-local capability is a
typed pre-effect `capability_missing` refusal.

### P2 - T-276 metadata no longer describes the current frontier

T-276 still reports `16 missing`, `16 retired`, and zero target/workspace
invocations at the old pre-P1 frontier. The current working tree publishes all
19 operation files, and the source-blind driver now contains workspace binding,
runtime status, run result, and replay checkpoints. The ticket header is a
stale read model.

Do not use that header as delivery evidence. Update it only after the corrected
thread is rerun, recording the first real red operation/result coordinate and
the exact packed-candidate digest. The T-276 exit remains unchanged: packed
clean install, public CLI only, no source fallback, typed result and replay,
three workspace applications, and the later F_H continuation extension.

## Event Calculus Disposition

EVENTS-032 already supplies the required boundary law.

- `run.invoke` remains Rule A: its semantic owner emits the existing basis,
  GraphCall, frame, vector, C-call, payload, evidence, hold/block/close, and
  construction events. Existing declared Event Calculus axioms and derived
  rules own state.
- `result.assess` remains Rule A: exact replay plus `assessed` derives the
  existing `result_assessment_admitted` fluent.
- `project.read` remains pure and emits no event.
- immutable workspace/product/release writes remain Rule B through the one
  generic `public_operation_artifact_admitted` boundary event.

No `runtime_result_admitted`, F_P-specific public-operation event, or
result-specific fluent is needed. The missing work is carrier completeness and
exact replay relation, not event vocabulary.

## Bounded Course Correction

Execute in this order, keeping the same installed steel-thread driver as the
delivery governor:

1. **Neutral T-271 interior extension.** Add the closed interior-event carrier,
   ordering/locus checks, receipt sealing, and F_D no-change differential.
2. **Compiled F_P atom.** From the existing compiler-derived F_P locus, join the
   declared execution context and process-local capability, invoke the existing
   guarded async standard plugin, admit the F_P wire result, separately admit
   target `B`, and return one T-271 atom result. Reuse the existing prompt,
   transport, malformed-output, and T-223 Hello World fixtures.
3. **Result/evidence projection.** Preserve the `ResultArtifact` coordinate as
   F_P runtime-result truth, the target `B` coordinate as optional target
   payload truth, exact contract/evidence/provenance, and replay. F_D continues
   to project its admitted target payload directly.
4. **Replay-owned assessment.** Replace the private-carrier public adapter with
   replay derivation, then prove
   `run.invoke -> project.read(result_evidence) -> result.assess -> assessed
   fluent -> project.read` without fixture-authored events.
5. **Atomic hard break and packed proof.** Remove legacy execution exports,
   replace the T-223 excerpt oracle, regenerate publication, and rerun the exact
   packed clean-install T-276 thread. Only then update frontier metadata and
   resume the Consensus/F_H tail.

Each step gets a focused self-review against the same four questions:

1. Did any new selector or execution spine appear?
2. Does T-271 still own exactly one C-call per invoking leaf?
3. Are `ResultArtifact` and target `B` independently typed and admitted?
4. Can the packed public consumer reconstruct every claimed result solely from
   installed authority and replay?

## Non-Negotiable Guardrails

- No new controller, scheduler, traversal loop, engine-start leaf, or
  service-owned orchestration.
- No new public operation, runtime-event kind, result-specific Event Calculus
  fluent, registry, or proof framework.
- No raw GTL declaration reads in a runner; consume compiler projections only.
- No second C-call around T-271 and no plugin-emitted C-call rows.
- No hard-coded public outcome and no fixture-authored success event.
- No parsing actor excerpts, worker prose, stdout, or archives as admitted
  result, target, evidence, assessment, or closure truth.
- No caller-authored `DispatchRequest`, manifest provenance, ledger, runtime
  cursor, or selected contract authority.
- No process-local steering body, factory, or callable in constitutional,
  catalog, basis, or replay truth.
- No optional compatibility field or facade preserving retired 4.6 public
  identities in the 5.0 product.
- No Consensus-specific branch in the generic F_P realization. Hello World is
  the first consumer; Consensus remains a pure GTL construction over the same
  atoms.

## Audit Evidence

Verified from the current reverted working tree:

- GTL/compiler-derived F_D traversal and T-271 C-call ownership remain present;
- the rejected direct F_P engine-start/feature-router slice does not remain;
- public result evidence still fails closed rather than parsing the artifact
  excerpt;
- the T-223 packed consumer still parses that excerpt and therefore needs a
  proof-oracle repair;
- legacy catalog invocation and M04 runtime-operation exports remain live;
- the public result-assessment adapter still requires the legacy private
  carrier;
- steering identity is admitted while the process-local capability join is not
  connected to the retained T-271 path; and
- T-276 header metadata is stale relative to the current 19-operation
  publication and expanded driver.

`git diff --check` passed before this commentary post. No runtime, design,
ticket, generated-contract, or product code was changed by this audit.
