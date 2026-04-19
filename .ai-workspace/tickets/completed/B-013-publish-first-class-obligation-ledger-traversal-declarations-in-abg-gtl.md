# B-013 Publish First-Class Obligation-Ledger Traversal Declarations In ABG/GTL

- id: B-013
- title: Publish first-class obligation-ledger traversal declarations in ABG/GTL without collapsing domain semantics into runtime
- type: bug
- status: completed
- goal: obligation-ledger-traversal
- change_intent: Add a first-class declaration surface in ABG/GTL for obligation-ledger traversal signals so domains can configure per-edge obligation source, carry, fulfillment, and evidence policy declaratively, while ABG remains mechanism-only and does not take ownership of domain fulfillment semantics.
- change_class: realization_refactor
- re_entry_point: realized_surface
- priority: high
- intake_source: odd_sdlc B-019 obligation-ledger refactor 2026-04-18; operator direction 2026-04-18
- affected_boundary: GTL graph-function declarations, GraphVector traversal metadata, binding/runtime prompt inputs, traversal gap publication hooks
- triaged_at: 2026-04-18
- created_at: 2026-04-18
- updated_at: 2026-04-18
- reopened_at: 2026-04-18
- completed_at: 2026-04-18
- governing_protocol: T-007

## Round 2 Reopen Authority

`B-013` round 1 delivered a first-class `obligation_ledger` declaration
surface, but the interface family is not lawfully complete.

The current `odd_sdlc` installed-runtime blocker exposed the remaining defect:

- ABG coercion currently treats `obligation_ledger` as one declaration family
  that must always include a static `obligations` list
- non-converted edges can use that generic evaluator-aligned static family
- converted domain edges can lawfully publish adapter-driven obligation-ledger
  declarations that describe dynamic obligation sets without a static
  per-obligation list at GTL publication time
- source runtime, installed runtime, manifest publication, prompt assembly, and
  result ingest are not yet carrying both declaration families lawfully

The active defect is therefore not “missing declaration support” in general.
It is:

1. **Declaration-family overconstraint**
   - `coerce_obligation_ledger_declaration(...)` rejects any declaration that
     does not publish `obligations` as a static list.
   - This is currently too narrow for domains that publish adapter-driven
     dynamic obligation ledgers.

2. **Producer/consumer migration incomplete**
   - GTL publication, runtime policy read, manifest publication, prompt
     assembly, and result ingest still assume the static declaration family.
   - Installed runtime consumes the same narrowed contract, so downstream
     installed `start()` fails even when the domain is lawfully publishing a
     dynamic declaration.

3. **No lawful bridge workaround**
   - Downstream domains must not be forced back to evaluator-level fulfillment
     truth just to satisfy the current ABG coercion shape.
   - The fix must preserve the substrate/domain boundary rather than collapse
     dynamic domain obligation sets into static evaluator-owned declarations.

## Close Condition

`B-013` may close again only when ABIogenesis can carry both lawful
`obligation_ledger` declaration families through the whole interface family:

- GTL publication
- source runtime binding
- installed runtime binding
- manifest publication
- prompt/output contract publication
- result ingest / ledger publication

without forcing dynamic domain obligation sets back into evaluator-level
static declarations.

## Round 2 Resolution

Round 2 is now delivered.

ABIogenesis now carries two lawful `obligation_ledger` declaration families:

1. `static_obligations`
   - publishes a concrete `obligations` list at GTL publication time
   - keeps evaluator-aligned native/self-hosting declarations lawful

2. `adapter_driven`
   - publishes `signal_key`, `adapter_ref`, source/admission metadata, and
     policy without forcing a static per-obligation list into GTL
   - materializes the concrete obligation set once at dispatch against the
     current workspace via the domain-owned adapter

The migration wave now covers the whole ABG interface family:

- GTL coercion accepts both declaration families
- source runtime binding materializes adapter-driven obligations once for the
  dispatch prompt/result contract
- manifest publication publishes stable `fulfillment_obligations` for the
  concrete dispatch while preserving the original declared policy
- result ingest and published fulfillment ledger carry the richer declaration
  metadata, including declaration family and certification scope
- runtime certification now respects declaration-family certification scope:
  adapter-driven edge-ledger declarations certify at edge scope instead of
  forcing a one-evaluator/one-obligation row law where the domain did not
  declare one
- installed-runtime parity was validated by syncing the odd_sdlc vendored
  `.genesis` runtime to the same ABG contract

No bridge fallback was introduced that collapses adapter-driven domain
obligation sets back into evaluator-authored static declarations.

## Closure Assessment

This closes the ABG-side migration wave.

Downstream `odd_sdlc` follow-on work still exists, but it is outside `B-013`:

- expectation drift in downstream query/prompt tests caused by richer declared
  policy metadata on the static family
- domain decisions around adapter-driven edges that currently materialize zero
  obligations in specific bootstrap/self-test states

Those are downstream domain/application concerns, not remaining ABG declaration
carrier defects.

## Round 1 Delivered

Round 1 remains genuinely delivered:

- GTL now has a first-class obligation-ledger declaration surface
- ABIogenesis reads that declaration from GTL/runtime publication instead of
  inventing obligation-ledger policy inside runtime
- manifest publication, prompt assembly, and ledger publication now carry the
  declared policy through the runtime
- native ABIogenesis packages and the relevant proof lanes were migrated to
  author the declaration explicitly

## Delivered

1. `GraphVector.declarations["obligation_ledger"]` is now the first-class
   declaration surface.
2. GTL helpers publish declared obligation-ledger policy explicitly.
3. ABIogenesis runtime reads that declaration and fails closed if an `F_P` edge
   is missing declared obligation-ledger policy.
4. Manifest publication, binding prompt assembly, and ledger publication now
   carry the declared policy instead of synthesizing it from runtime evaluator
   failure state.
5. Native ABIogenesis GTL packages and fulfillment-path tests were migrated to
   author the declaration explicitly.

## Code Anchors

- [obligation_ledger.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/gtl/obligation_ledger.py:1)
- [binding.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/binding.py:137)
- [interpret.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py:1902)
- [result_ingest.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/result_ingest.py:45)
- [gen-install.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/gen-install.py:58)
- [abiogenesis.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/gtl_spec/packages/abiogenesis.py:1)
- [project_package.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/gtl_spec/packages/project_package.py:1)

## Acceptance Reading

The declaration surface is now domain-owned config carried through GTL and ABG
mechanism, with both lawful declaration families accepted by the substrate.

Native ABIogenesis self-hosting packages may still choose evaluator-aligned
obligation ids through the static family, but that is now only one lawful
family among multiple accepted substrate contracts.

## Proof

Green after round 2:

- `test_m01_gtl_core_integration.py` + `test_abg3_runtime_envelope.py`: `57 passed`
- `test_m02_work_publication_integration.py` + `test_m03_engine_kernel_integration.py` + `test_provenance_integration.py` + `test_sandbox_usecases_fake.py`: `161 passed`

Focused downstream confirmation:

- `odd_sdlc test_odd_sdlc_first_slice.py` now crosses the widened ABG
  declaration family path in installed runtime; remaining failures are
  downstream expectation/domain follow-ons, not ABG static-family coercion
  failures.
