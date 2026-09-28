# T287_REGISTERED_SELECTION_REPEAT_REPAIR_01 — closed return

RS-I01 is corrected and ready for the same reviewer's bounded recheck. Product
base and S1/S2 authority remain unchanged. This is not Executive acceptance.

## Correction

`abg/traversal_cursor.ts` selects registered input through the existing
cursor-origin relation, which binds run, execution basis, graph call, frame and
target cursor. It then validates the current route's exact input and source
provenance. Registered routes no longer compete in the global content-reference
origin bucket. Malformed applicable provenance returns null rather than falling
back to another use of identical content. Raw identities remain canonical.

The existing registered-selection provenance projector is unchanged. The old
registered branch in the content-origin loop was removed; the historical
worksite/retained-input branch remains its existing active owner. No new entity,
cache, identifier, event, C operator or graph copy was added. Production delta
from the reviewed S2 subject is **17 additions / 9 deletions, net +8 lines**, in
one file. Test delta is +36/−3; HOW wording is +6/−4. Test support and the packaged
external consumer are unchanged. HOW now separates raw-content identity from
admitted route-use provenance.

## Installed discriminator

The old frozen archive was actually exercised first. A completed; B with the
same child contract/value admitted its choice and route, then failed before
child open with `advanced-result-basis-absent`. The first failure is retained.

One corrected build and pack then passed the focused installed test. A and B
have byte-identical boundInput objects and this same raw admission reference:

`raw-admission://abiogenesis/96d7755eba20bccea9287353f8b9ad0a49cfa013fcfcb47b79593e333bdc8a76`

Each run executes only its selected child, preserves the exact input and
definition digest, folds back once and closes its parent. Four fresh Public CLI
processes read A/B result and replay with matching terminal results and unchanged
event prefixes. A controlled copied-prefix check removes the **current** route's
causation references while retaining the earlier valid identical input; current
input recovery refuses. That negative is an installed read-only owner check,
not another Public execution or a mutation of the actual event resource.

| Subject | A | B | Fresh result/replay |
|---|---:|---:|---|
| Predecessor `780f944c…` | completed, 1.363 s | runtime_failed, 1.328 s | A reads completed before expected failure |
| Corrected `99338053…` | completed, 1.390 s | completed, 1.434 s | all four pass, 0.593–0.615 s |

The passing test took 26.50 s overall: one test, zero failures/skips. Setup is
separate: pack 3.131 s, archive verification 11.430 s, installation 2.611 s.
Verification covers 5,237 packed members / 67,060,997 unpacked bytes; no pure
execution or readback exceeds ten seconds. No timeout/heap change or provider
call occurred. Unaffected S2 negative/gap evidence is reused, not claimed as
rerun on this archive. In particular, malformed child input previously failed
after route admission but before child launch.

## Frozen subject and preservation

- ABI archive: `sha256:99338053df3a690ed21616ed2a519443c596b7d144e343256d39a23d0220ac39`
- External consumer archive, unchanged: `sha256:badb0c77571afb37953424b936adaefd71a335bec33058e4d21f0b24748668ec`
- Subject manifest: `sha256:354ca790a7c1ec5ac131ace86b638df489d2ecf6cb56826d63b13361e47edf9e`
- Source `traversal_cursor.ts`: `sha256:a8aa3217320db26085a892cab3d76230b3e0bb7a68179f514e8741fe6718ce80`
- HOW: `sha256:c3bbe783ecb50d08328eec1d861e1586b54332399ac9ddbb93e0b3c7a3cceef8`
- Test: `sha256:de4f9676aec664ab4fb4e953f74a3143aaedef6b3bf22c285488ad9e03c82fce`

`subject.json` identifies all 17 S2 source files, all three fixture files, HOW,
normal generated outputs, archives, installations, delta and timings. All 717
emitted files agree between local build, corrected archive and actual install;
only emitted `abg/traversal_cursor.js` differs from the predecessor inventory.
The capability-definition graph and Product manifest also regenerate normally.
`preimages/`, `subject-files/` and `change.patch` retain the exact affected
before/after bytes. `commands.json` records commands and the explicit evidence
directory used by both runs. The final test default now points here, protecting
the first S2 proof; the executed commands explicitly selected their directories.

`predecessor/` and `current/` retain actual requests, receipts, event slices/full
logs and final handoffs. Corrected ABI and unchanged consumer archives are in
`artifacts/`. Original scratch/install roots remain available. All **69** original
S2 proof/review files in `preserved-s2-hashes.json` remain byte-identical, including
the first failure samples, original archive, closed return and independent review.
`proof-hashes.json` inventories this correction's retained files. Build and scoped
diff-whitespace checks passed. No Git mutation or source outside the grant changed.

S3 stays proposal-only. Native suitability, adaptive recursion, PC05-11 and
whole-Product qualification remain open; existing out-of-scope historical helper
debt remains as recorded in the original S2 return.
