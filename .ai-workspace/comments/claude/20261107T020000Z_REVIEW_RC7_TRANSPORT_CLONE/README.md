# Review: the in-process clone at the native transport (rc.7)

Commentary, not ratified design. Reviewer: Claude Fable 5.1. Pen stays with
Codex. Nothing is pushed. Subject: Codex's finding that rc.7 preserves the
event-resource reference but clones the rest of the call in-process, and the
owner's rule that established objects "should be just references".

## 1. Verdict

The finding is correct and verified in source. The clone predates RC7: the
transport file is unchanged since the rc.6 cut and `structuredClone` entered
it with the installed CLI steel thread. RC7 did not introduce it and did not
remove it, and my operational review did not name it either: that review
counted copies in the log and in the operator's stores, not in-process copies
at the transport. The owner's rule is the right rule, and it is the same
rule the held-session design applied to the event resource, generalized:
inside one process an established owner object is passed by identity;
copying is lawful only at a process boundary, where the receiver re-admits
from bytes.

Codex's correction is right in direction. Two things need to be said
precisely so the fix lands at the cause: what the detach is for, and why an
identity-preserving path must not re-walk the objects it preserves.

## 2. What happens, in source

- `public/installed_definition_call_transport.ts:302` `detachDefinitionCall`
  copies `resources`, nulls out the product-owned verification results it can
  recognize (`selectOwnedProductVerification`, a WeakMap lookup), runs
  `structuredClone({ invocation, resources })` at `:340`, then restores those
  results by path. The held path at `:426–446` removes the event resource
  before the clone and restores it after. Everything else, including
  `resources.catalog`, the catalog's publications and views, the admission
  authority's bound environment and the task input, reaches execution as a
  new graph.
- `product/catalog.ts:400–403` keys `readyCatalogs`, `canonicalPublications`
  and `catalogViews` by object identity, and `ownedCatalogs` is a WeakSet of
  the owner's catalogs. `product/execution_resolution.ts:426` calls
  `admitGraphFunctionCatalog(input.catalog.readinessBasis)`. With a cloned
  basis the WeakMap misses, so every publication is canonicalized again
  (`canonicalPublication` caches only deeply frozen inputs, and a clone is not
  frozen), the lock and binding digests are recomputed, and at `:695–697`
  the rebuilt catalog is cached only if frozen, which the clone is not. Then
  `reconstructedCatalog !== input.catalog` is true, so `canonicalEquals`
  (`shared/value/equality.ts:16`) canonicalizes both catalogs in full to
  compare them. On the measured workload that is a 20.8 MB catalog, twice,
  per call, after a full re-admission, after a clone of a 23.6 or 32.0 MB
  call.
- `shared/immutable.ts:11` `isDeeplyFrozen` is an unmemoized walk of the
  whole graph. The caches above depend on it.
- `public/installed_public_definition_call.ts:347–356` freezes the
  invocation and states that "request, slots and resources keep their
  supplied identity". The constructor attaches the owner's catalog by
  reference (`:548`, `:602`, `:612`). The raw request is not frozen there.
  That is the one reason the transport detaches at all: it cannot tell a
  caller-mutable request from an owner-established object except through the
  owners' registries, and it consults only one of them.

The measured `sdk_call` phases are 4.12 s and 4.29 s with RSS rising from
2.68 GB to 3.33 GB across the session. The clone and re-admission are inside
those numbers and have not been isolated, as Codex says. The scripted actor's
own work is small, so most of that time is the carrier.

## 3. Where the fix belongs

1. **Freeze at construction, not detach at transport.** The constructor
   already computes `requestDigest` over the raw request. Deep-freeze the
   request there, record the constructed call in a WeakSet, and the
   transport passes a constructed call through untouched. The clone remains
   only for raw candidates that arrive as bytes (the CLI route), which are
   already detached by parsing.
2. **Identity, not a re-walk.** A fix that keeps references but then checks
   `isDeeplyFrozen(catalog)` per call reintroduces an O(size) walk of
   20 MB. The owners already hold identity registries (`ownedCatalogs`,
   `readyCatalogs`, `ownedProductVerifications`, the acquired event
   resource). Ownership by identity is the test; frozenness was established
   once when the owner built the object.
3. **Let equality short-circuit.** With identity preserved,
   `reconstructedCatalog === input.catalog` is true and `canonicalEquals`
   never runs. Do not replace it with a cheaper comparison; make it
   unreachable on the held path and count it.
4. **Rewrite the design sentence.** HOW §10.9 and the transport comment say
   "semantic data is detached, while the exact owner-issued physical
   selection survives". The replacement is: owner-established objects pass
   by identity and the transport verifies ownership; it never copies.
5. **Same habit, smaller cost:** `abg/worker_transport.ts:975` does
   `deepFreeze(structuredClone(input.contract))` per worker launch. Small
   objects, same pattern; worth folding into the same rule.

## 4. Acceptance

- At `resolveProductExecution`: `input.catalog === caller.state.catalog`
  and `readyCatalogs` hits, so catalog admissions per held session equal
  one, not one per call.
- `canonicalEquals` invocations on the held path equal zero (test-mode
  counter beside the history counters).
- `invocation.request` at the run owner is the constructed object.
- `sdk_call` wall and per-call RSS delta on the 1 MiB / 4 MiB fixture,
  before and after, with one CPU profile of a single `sdk_call` phase to
  attribute the remainder.
- Existing history counters unchanged: zero warm decodes and reopens.

Scope class: `realization_refactor`. The transport's refusals and the
public contracts do not change. The harness's 23.6 and 32.0 MB serialized
calls (190 and 268 ms of custody per call) are the operator's cost and are
separate from this.

## 5. Limits

No code was run. Lines cited are at `27c08ce597`. The share of the 4.1 s
call attributable to the clone and re-admission is inferred from the code
path, not measured.
