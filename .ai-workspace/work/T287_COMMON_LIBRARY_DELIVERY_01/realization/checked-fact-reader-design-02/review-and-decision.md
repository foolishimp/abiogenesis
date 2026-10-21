# C3 review finding and Root's bounded correction

This is an attributed record of a closed collaboration return and Root's
subsequent decision. It is not another independent review or a source-code
repair. The predecessor [freeze](../checked-fact-reader-design-01/freeze.json),
SHA-256 `74b4562d7d4fb4f51310cdffb525996cfba7cb6377f4f879c3337db73a8bd348`,
remains unchanged.

Root reports that `/root/stdo3_checked_fact_design_review` independently
verified the five predecessor proposal files and 58 source-input pins twice.
The Reviewer returned one P2 design-preservation finding and no further
material counterexample in bounded C3. That return was a collaboration message;
there is no standalone review file or invented message hash.

The finding concerns the claim that the execution-basis reader's raw-input
record/digest behavior would be preserved. At the frozen source,
`invocation_execution_truth.ts::canonicalRecordDigest` returns `null` for a
non-record or encoding failure. `projectExactExecutionBasisAtPrefix` compares
that result directly with the claimed `rawInputDigest`. Consequently:

- A raw immutable singleton carrying `rawInputValue: null` and
  `rawInputDigest: null` can reach a purported typed-basis return when its
  remaining body/ref coordinates match.
- An unencodable raw record with claimed digest `null` can pass the sentinel
  comparison and reach a later basis-body encoding throw.

The genuine `ExecutionBasis` type requires a record input. Its constructor's
`detachJsonRecord` refusal is checked before basis construction. Therefore the
shared check's invalid-singleton outcome does not preserve both malformed
reader behaviors. Frozen 01's unconditional preservation language was wrong.

Root explicitly selects a correction: **both malformed partitions are invalid
singletons and return the existing reader's `null`/owner-refusal outcome**.
This includes changing the unencodable-record/null-digest partition's former
later throw. A compatibility branch preserving the sentinel collision is not
selected. Neither a broader I-JSON policy nor general error normalization is
selected.

The common checked-record function retains its exception channel. Only the
exact execution-basis raw-input adapter handles the selected raw-input failure.
Its bounded check must not catch selection, index, predicate, profile, unrelated
owner-read, construction or later whole-basis errors. Valid input, wrong/non-null
digest refusal, later body errors outside the correction, multiplicity,
predicate/order, identities, registry effects, raw duplicate controls and
owned/prospective authority boundaries remain the preservation contract.

The successor [HOW](HOW-proposal.md) and [map](retirement-consumer-proof-map.md)
replace that claim and add finite B01–B06 owner proof rows: valid input,
non-record/null digest, unencodable-record/null digest, wrong/non-null digest,
later body error outside this correction, and raw/owned/prospective routes.
All thirteen cardinality retirements and the remaining C3 dispositions remain.
No proof is executed in this design activation.

Writer reacquired the two relevant source regions and verified the predecessor
files and all 58 input pins unchanged. [Source correspondence](source-correspondence.json)
and [the exact successor diff](correction.patch) bind that mechanical record.
Root will verify the literal correction against the closed review. This return
does not start a new general review loop or activate a Reviewer.
