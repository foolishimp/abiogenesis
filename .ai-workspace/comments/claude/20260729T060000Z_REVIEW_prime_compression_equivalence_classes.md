# Prime Compression Review: Equivalence Classes With Multiple Definitions

- reviewer: claude (independent)
- date: 2026-07-29T06:00Z
- subject: S06 candidate `51664393` / tree `deec0643` (`code/src` only)
- basis: Prime law — computationally equivalent code has exactly one
  definition; code is an atomic algebra
- note: `code/src` has uncommitted edits in flight from a concurrent review.
  Line counts below are from the frozen candidate and may have moved.

## Why This Review Exists And Why Gates Cannot Produce It

Every item below is behaviour-preserving. All 180 M5 tests pass with 195
inline digest slices exactly as they would with one function, and with six
sequence-equality definitions exactly as they would with one.

The test suite validates the **extension** of the program. The Prime law is a
claim about its **intension**. Two computationally equivalent programs are
indistinguishable to every test that can be written, and exactly one of them
satisfies the law. This class of defect is therefore invisible to running and
only ever surfaces in review — and it compounds silently, because each new
call site is individually harmless and collectively makes contraction more
expensive.

Each item states the equivalence class, its current multiplicity, and the
defect class that contraction removes. Ordered by defect class removed, not by
count.

## P1 — Sequence Equality Has Six Definitions

One relation, "are these two ordered sequences the same," is defined six times,
all module-private, plus a seventh inline spelling.

| Definition | Location |
|---|---|
| `sameValue(left: unknown, right: unknown)` | `validator/validation.ts:397` |
| `sameValues(...)` | `abg/traversal_route.ts:2419` |
| `sameStrings(...)` | `abg/retry.ts:152` |
| `sameNumbers(...)` | `abg/retry.ts:159` |
| `sameOrderedValues(left: readonly string[], right: readonly string[])` | `abg/execution_basis.ts:1081` |
| `sameDurableIdentity(...)` | `abg/event_store.ts:1073` |
| `a.join("\0") === b.join("\0")` inline | **103 occurrences** |

**Defect class removed: silent divergence of an admission predicate.** These
are comparison functions used on admission paths. Nothing forces them to agree
on empty-array handling, ordering sensitivity, `undefined` members, or
canonical form. Two of them can differ today and both look correct, and no
test distinguishes them because each is only ever exercised through its own
module.

`retry.ts` alone carries two (`sameStrings`, `sameNumbers`) that differ only in
element type — that is a type parameter, not two relations.

**Action:** one `shared/` module exporting the sequence-equality algebra:
`sameSequence<T>(a, b, eq?)` with `sameStrings`/`sameNumbers` as typed
applications, not peers. Replace all six definitions and the 103 inline
`join("\0")` comparisons. Note that `join("\0")` is only sound when members
cannot contain `\0`; a shared definition can state that precondition once
instead of assuming it 103 times.

## P1 — Coordinate Identity Is Uncontracted While Arity Is Contracted

`resolveExactMatch` correctly contracted the **arity** algebra (`absent |
one | many`) across 30 sites, and no caller defeats it — I verified none index
into `many`. But the **coordinate** algebra was left distributed:

| Coordinate | Spellings |
|---|---|
| program identity | `value.programRef === programRef`, `candidate.programRef === input.programRef`, `validation.programRef === program.programRef` |
| graph-function identity | `value.name === graphFunctionRef`, `value.name === graph.graphFunctionRef`, `value.name === declaration.graphFunctionRef`, `row.graphFunctionRef === graphFunctionRef` |

One graph-function coordinate is keyed on `name` at three sites and on
`graphFunctionRef` at a fourth.

**Defect class removed: latent semantic divergence.** This is the only item in
this review where two spellings can be *semantically different* while both
look correct. The others are duplication; this is a live fork.

The Prime table row claims retained meaning `"exact zero/one/many Product
coordinate resolution"` — naming both algebras while only contracting one, so
the row overstates what was done.

**Action:** name the coordinates, then derive the predicate.

```
ProgramCoordinate(ref) | GraphFunctionCoordinate(ref) | ProductCoordinate(id)
resolveExactMatch(values, coordinate)
```

After this, `value.name === ref` and `row.graphFunctionRef === ref` cannot
silently disagree, because there is nowhere left to write them.

## P2 — Digest Identity Has No Eliminator

`slice("sha256:".length)` — the total projection `Sha256Digest -> Identity` —
appears **195 times across 37 files** and is never named.

The digest algebra has constructors (`payloadInventoryDigest`,
`catalogViewContentDigest`, `modulePublicationSemanticDigest`,
`sha256Canonical` at 555 sites) and no eliminator.

**Defect class removed: prefix-format coupling.** Every one of the 195 sites
hard-codes the string `"sha256:"` and its length. A second digest algorithm,
or any change to the prefix convention, is a 195-site edit where 194 correct
edits still leave a defect that no gate detects.

**Action:** `digestIdentity(d: Sha256Digest): string` in `shared/digests.ts`
alongside the existing producers. Mechanical, zero risk.

## P2 — Canonical Ref Construction Has No Constructors

Ref shapes are re-derived at each site rather than constructed:

| Shape | Sites |
|---|---:|
| `` `diagnostic://abiogenesis/hog/{}@5` `` | **68** |
| `` `route-candidate://abiogenesis/{}` `` | 15 |
| `` `next-action-projection://product/{}` `` | 6 |
| `` `result://abiogenesis/{}` ``, `` `observation-snapshot://product/{}` ``, `` `judgment://abiogenesis/{}` `` | 5 each |
| plus a long tail | — |

**Defect class removed: version-migration hazard.** The diagnostic shape
encodes namespace, owner, path, and version `@5`. Moving to `@6` requires 68
coordinated edits; 67 of 68 landing correctly produces a defect that is
invisible to every gate, because each site is independently well-formed.

**Action:** one constructor per namespace, version supplied once. Highest
count in this review, and the only item with a scheduled forcing function.

## P3 — Duplicate Detection Inlined

`new Set(x).size !== x.length` appears **22 times**. A `duplicates(values)`
helper exists at `validator/validation.ts:401` but is not used outside that
module.

**Action:** export the existing helper rather than writing a new one. Note the
two are not equivalent — one returns a boolean, the other the offending
members — so the shared surface should provide both, with the boolean defined
in terms of the list.

## P3 — Guard Composition

33 functions share the signature `is<X>(value: unknown)` and the opening
sequence `!isRecord(value)` (136 sites) plus `hasExactKeys(...)` (96 sites)
plus `schemaVersion !== "5.0.0"` (66 sites); eight files carry all three.

`isRecord`, `hasExactKeys`, and `deepFreeze` (313 sites) are already single
definitions — the primitives are contracted; the composition is not.

**Lower value than the count suggests.** The field lists are the actual
semantic content and genuinely differ per guard. Contracting the preamble
(`isRecordWithExactKeys(value, keys, schemaVersion)`) removes real repetition
without merging distinct meanings, but it removes no defect class. Do it last,
or not at all.

## Not Findings

- `deepFreeze` (313), `sha256Canonical` (555), `isRecord` (136),
  `hasExactKeys` (96) are correctly single definitions with many applications.
  High call counts here are the law working, not violating.
- `resolveExactMatch` itself is genuinely Prime: maximally parameterised, pure,
  frozen returns including the inner array, carries no disposition. Each caller
  retains its own semantics for absent and many. The contraction boundary is
  correct; it simply stops one algebra short.

## Recommended Order

1. **Coordinate constructors** — the only latent-divergence item
2. **Ref constructors** — the only item with a forcing function
3. **`digestIdentity`** — trivial, completes the digest algebra
4. **Sequence equality** — largest, and the six definitions must be reconciled
   before being merged, since they may not currently agree
5. **Duplicate detection** — export what exists
6. **Guard composition** — optional

Items 1–3 are mechanical and independent. Item 4 requires deciding what the
shared relation actually is before replacing anything, since merging six
definitions that disagree would change behaviour rather than preserve it —
this is the one item that is not purely a contraction.
