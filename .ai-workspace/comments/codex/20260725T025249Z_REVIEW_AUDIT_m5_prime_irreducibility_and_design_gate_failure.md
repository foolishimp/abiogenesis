# REVIEW AND AUDIT: M5 Prime Irreducibility And Design-Gate Failure

**Author**: Codex
**Date**: 2026-07-25T02:52:49Z
**Status**: Changes requested
**Review type**: Design Module Method, Prime/IACS, and realization audit
**Change class recommended**: `design_reframe`
**Authority**: Commentary; this post does not itself amend specification,
design, ticket, or acceptance state
**Exact committed subject**:
`bcd8769a8163a222e2e59400c904994b3de161fd`
**Subject tree**:
`bd3df7804b32dcdcfa5c9f0fe726a7a64117c440`
**Accepted comparison basis**:
M05 base `d6da426947e1b7e18e7ed5bd1c0f945dcde9c73f`

## Executive Ruling

Do not accept S03 or S05 as closed under the Design Module Method. Do not
accept the S06 design or portability promotion as sufficient authority for
continued implementation. The later uncommitted observer/tuner work is outside
the exact subject and receives no ruling here.

The accepted M03 direct-GTL architecture and the original M05 traversal
expansion perform real Ontology derivation, atomic-function derivation,
whole-family Prime contraction, IACS definition, module mapping, three-view
design, and axiom evaluation. Those assets remain sound.

The later S03 and S05 boundaries, followed by the S06 portability boundary,
were appended after that design gate without repeating or extending the
affected Ontology and Prime derivation. Their implementation may contain
valuable behavior, but it has not been shown to consist of irreducible,
algebraically constrained building blocks. The current closure, acceptance,
and promotion claims therefore outrun the design evidence.

This is not a reason to restart ABIogenesis, restore the compiler trajectory,
rewrite Product, discard the working direct-GTL runtime, or split every helper
into another file. It is a bounded design and realization correction:

> Preserve the accepted direct-GTL architecture and the working behavior.
> Re-enter at `design_reframe`, derive the affected atomic function and carrier
> families, perform whole-family Prime contraction, update the IACS and three
> views, and reconcile the existing code to that accepted cut before promoting
> S03 or S05 again, or continuing S06 promotion.

## Review Question

The governing question is:

> Does the current ABIogenesis 5.0 realization preserve the required design
> method in which modules are built from atomic, irreducible Primes and composed
> through explicit algebra?

The answer is:

> Yes through M03 and the original M05 traversal boundary. Not proven, and in
> several places contradicted by the realization, for the later S03 and S05
> additions and the S06 portability design.

Prime does not mean one function per verb, one type per payload, one file per
operation, or the smallest possible line count. A Prime is one irreducible
semantic or topological boundary that cannot honestly be represented as a
composition of existing functions. The review must contract the whole
candidate function and carrier family, not merely decide that each individual
function looks plausible.

For an LLM-first TypeScript product, this is also an operative functional
constraint. Closed discriminated carriers, total transforms, and explicit
composition restrict the state space that both TypeScript and an LLM must
reason over. Open records, repeated wrappers, ambient registries, and
multi-authority modules weaken that constraint even when runtime validators
and integration tests are strong.

## Exact Authority

ABIogenesis has selected immutable STDO `v2.0.0`:

- release commit:
  `94ccf4faa1c0a10b002273b1e9a9e7bf4a34753a`;
- standards member-set digest:
  `284efbb31affd6772fe8e523bdd157f7f2ebe4d4d8dee7b5c9ddfd0482da93a0`;
- operative consumer projection:
  `.genesis/docs/standards/`; and
- installed `DESIGN_MODULE_METHOD.md` SHA-256:
  `982bc4255ef319f9b424f2150d8d2abf93a142de5f7cf2062ea2625c5c770623`.

The relevant law is explicit:

1. `.genesis/docs/standards/DESIGN_MODULE_METHOD.md:526-560` requires the
   smallest parameterized atomic function families, their higher-order
   composition, and reconciliation into accepted design before promotion.
2. `DESIGN_MODULE_METHOD.md:562-594` requires whole-family and recursive Prime
   contraction, including the parameterized-template test.
3. `DESIGN_MODULE_METHOD.md:627-694` applies Prime to functions, classes,
   carriers, schema records, and modules. It defines Prime as an irreducible
   semantic or topological boundary and explicitly says that line count is not
   the objective.
4. `DESIGN_MODULE_METHOD.md:708-759` requires an Ontology-derived Irreducible
   Architectural Carrier Set and reconciliation of typed implementation before
   closure.
5. `DESIGN_MODULE_METHOD.md:875-1067` requires one accepted Ontology and
   complete Mermaid domain, sequence, and state views for every materially
   changed semantic or typed module boundary. Lines 1031-1067 explicitly make
   unreconciled co-evolution provisional and prohibit promotion or closure.
6. `DESIGN_MODULE_METHOD.md:1108-1144` separates carrier, semantic-kernel,
   effect-shell, projection, adapter, and materialization roles so semantic law
   does not smear across mixed modules.
7. `DESIGN_MODULE_METHOD.md:1146-1208` requires the complete route from
   constitutional WHAT through Ontology, IACS, target design, implementation,
   and unit tests.
8. `DESIGN_MODULE_METHOD.md:1210-1255` says a module with no module-derived unit
   test lane is not closure-ready.

This audit applies the installed release selected by ABIogenesis. Mutable
methodology source and invalidated predecessor designs are not substituted for
that exact basis.

## Subject Boundary And Worktree Condition

The committed review subject is exactly `bcd8769a`. Local and remote branch
heads matched that commit when the review began.

Another builder session has concurrent, uncommitted observer/tuner work in the
shared worktree. That work is not part of this subject. It was not edited,
staged, reverted, or treated as evidence by this audit.

The exact committed cut previously passed from an isolated worktree:

- M4: `26/26`;
- M5: `123/123`; and
- the separate conservation suite: `62/62`.

Those results establish that the committed behavior is executable. They do not
discharge the missing Ontology, Prime, IACS, module, or proof-lane gates.
Finding 10 also shows that the conservation suite's `40/40` status is not a
valid 4.6 conservation result: every `witness46` field still says immutable
RC5 witness reconciliation is pending.

## Audit Status

| Boundary | Claimed state | Prime/design-method state | Ruling |
|---|---|---|---|
| M03 direct-GTL core | accepted | complete Ontology, atomic functions, higher-order traversal, whole-family contraction, IACS, module map, and three views | retain |
| M05 traversal base through Section 11 | accepted | complete affected Ontology, atomic traversal functions, direct-fold algebra, Prime contraction, IACS delta, three views, and axiom matrix | retain |
| S03 One Surface, M05 Section 12 | closed | materially changed domain and lifecycle appended without an integrated Ontology delta, whole-family contraction, IACS delta, three-view update, or axiom reconciliation | reopen as provisional |
| S05 Consensus, M05 Section 13 | closed | prose boundary exists, but no candidate-function derivation, carrier contraction, real IACS, Mermaid three views, or module-derived unit proof | reopen |
| S06 portability, M05 Section 14 | design accepted and portability promoted; S06 was not closed at this cut | same design-gate omissions; portability fixture also recreates construction primitives rather than proving composition from installed public Primes | reject design/promotion; retain portability as provisional evidence |
| observer/tuner work after `bcd8769a` | concurrent uncommitted WIP, outside subject | not audited as implementation; cannot inherit authority from the deficient Section 14 design | keep excluded from this ruling and unpromoted |

## Finding 1 — P1: S03, S05, And S06 Bypassed The Mandatory Design Gate

The accepted M03 design is a valid example of the required method:

- atomic function families:
  `M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md:279-315`;
- higher-order traversal:
  `M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md:321-398`;
- whole-family Prime contraction:
  `M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md:400-533`;
- eight-family IACS:
  `M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md:535-550`;
- module ownership:
  `M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md:552-585`; and
- Mermaid domain, sequence, and state views:
  `M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md:593-1128`.

The original M05 traversal design follows the same route:

- affected Ontology:
  `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:98-252`;
- atomic function family and direct-fold algebra:
  `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:253-292`;
- whole-family Prime contraction:
  `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:294-307`;
- IACS delta:
  `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:309-337`;
- Mermaid domain, sequence, and lifecycle views:
  `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:552-1008`; and
- cross-view axiom evaluation:
  `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:1010-1031`.

The original M05 scope also explicitly defers the domain programs for One
Surface, Consensus, public breadth, and observer/tuner to their existing
owners at
`M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:71-82`.

That same canonical M05 domain model still marks these families as deferred:

- `OneSurface`;
- `Consensus`;
- `ObserverTuner`; and
- `PublicBreadth`.

The evidence is
`M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:729-735`.

Section 12 begins at line 1167, Section 13 at line 1685, and Section 14 at line
1918. No Mermaid `classDiagram`, `sequenceDiagram`, or `stateDiagram-v2`
appears after Section 12 begins. No later atomic-function matrix replaces or
extends the table at lines 253-280. No later cross-view axiom matrix integrates
the newly activated boundaries.

The Git history confirms append-only design growth:

- the accepted M05 base at `d6da4269` was 1,162 lines and the reviewed version
  is 2,172 lines;
- the exact zero-context design diff changes only three header coordinates and
  appends 1,008 lines at the old end of file; it does not reconcile Sections 3
  through 8;
- `771e82e5` first appended the S03 One Surface material;
- later S03 implementation commits continued to extend Section 12;
- `1dfe87bf` appended 233 lines for S05 Consensus at end of file; and
- `6aaedf8d` appended 256 lines for S06 at end of file.

The canonical Ontology and views were not updated when the formerly deferred
families became active.

This is a blocking design-method defect. Co-evolution permits implementation
and design to develop together. It does not permit a materially changed
boundary to close before the implementation has been reconciled into the
Ontology, Prime, IACS, module, and three-view evidence.

## Finding 2 — P1: The S05 “Prime” And “IACS” Sections Are Not Prime Or IACS Evidence

Section 13 contains useful semantic prose, but its design evidence is at the
wrong altitude.

Its three “views” at
`M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:1830-1868` are plain text
pipelines. They are not the required Mermaid class, sequence, and state models.
They do not show carrier ownership, visibility, cardinality, subordinate
payloads, effect edges, participant-to-domain mapping, or complete refusal and
continuation lifecycle.

The table introduced as “IACS remains singular” at lines 1873-1883 is an
authority ownership table. It does not:

- identify the smallest carrier family;
- classify authoritative, subordinate, effect-edge, and downstream carriers;
- bind carriers to Ontology functions and lifecycle;
- apply Promotion Tests; or
- reconcile the typed implementation to those carriers.

The stated Prime contraction at lines 1885-1891 is:

```text
one domain authoring family
  + one GTL publication
  + one ABG runtime authority
```

That counts macro authority categories. It does not enumerate the candidate
Consensus functions and carriers, test whether phase or payload differences
can be parameters, show the contraction relation, record retained meaning and
accepted loss, or state falsification conditions.

The only actual M05 atomic-function table remains at lines 253-280 and contains
no Consensus-domain function.

The same defect occurs in Section 14:

- plain text views:
  `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:2081-2122`;
- an authority table called IACS:
  `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:2124-2137`; and
- an authority slogan called Prime contraction:
  `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:2139-2146`.

The earlier detailed Consensus designs cannot fill this gap. Their opening
authority dispositions explicitly classify them as invalidated for current
5.0 implementation and say that they do not authorize design, code, proof,
Product scope, or closure. See:

- `M02_M04_CONSENSUS_PUBLICATION_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md:3-11`;
- `M03_CONSENSUS_DOMAIN_FAMILY_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md:3-11`;
  and
- `M04_M05_INSTALLED_CONSENSUS_SCENARIO_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md:3-11`.

They may be donor evidence. They are not the accepted successor design.

## Finding 3 — P1: Consensus Realization Mixes Several Unclassified Module-Taxonomy Roles

`code/src/gtl/consensus.ts` is 3,411 lines. Its size is not itself a defect.
The defect is that one module contains several independently reviewable
authority and module-taxonomy roles:

| Range | Realized role |
|---|---|
| `250-474` | public domain carrier declarations |
| `557-1174` | One Surface observation, model, gap, next-action, action-evaluation, and refresh semantics |
| `1187-1818` | constructors and native admission predicates |
| `1883-2165` | initialization, reduction, result, escalation, and ticket projections |
| `2167-2348` | judgment-relation dispatch |
| `2351-3411` | contracts, implementation requirements, GraphFunctions, Programs, bindings, and complete ModulePublication construction |

This combines at least:

- domain carrier ownership;
- pure semantic-kernel transforms;
- construction semantics;
- native admission;
- replay/public projection;
- judgment binding; and
- GTL publication construction.

The correct repair is not helper-per-file decomposition. The missing method
pass must determine which of those roles, if any, is an irreducible boundary
and which remains a subordinate payload or function inside another Prime.

The current design did not answer that question before the implementation was
accepted.

## Finding 4 — P1: Important Construction Semantics Are Runtime-Closed But Type-Open

There is strong counterevidence: the implementation uses exact-key checks,
digests, frozen values, and native predicates. The values are not arbitrary at
runtime.

They remain open at the TypeScript semantic boundary:

- `ConsensusObservationSnapshot.actionCatalog` and `constructionState` are
  `Record<string, JsonValue>` at
  `code/src/gtl/consensus.ts:457-474`;
- action-catalog admission returns an open record despite checking one exact
  shape at `code/src/gtl/consensus.ts:491-555`;
- gap, next-action, and action-evaluation families consume and return open
  records at `code/src/gtl/consensus.ts:712-1173`; and
- the published observation, model, basis, action, and evaluation carriers use
  `C` carriers parameterized by `Record<string, JsonValue>` around
  `code/src/gtl/consensus.ts:2481-2509`.

This matters for the intended LLM-first functional architecture. Runtime
guards can refuse a bad value after construction, but TypeScript and the LLM
cannot reason over a closed algebraic variant before that point. The design has
not declared whether these shapes are:

- Prime public carriers;
- closed variants of one carrier family;
- subordinate payloads; or
- ingress-only erased values.

The bounded correction is to name the already stable semantic variants as
closed carriers where they cross a semantic boundary. It is not a request for
more JSON schemas or a top-level type for every field group.

## Finding 5 — P1: Initial And Refresh Functions Escaped Whole-Family Contraction

The implementation publishes initial and refresh peers:

- initial model, gap, and next-action functions:
  `code/src/gtl/consensus.ts:682-889`;
- refresh model, gap, and next-action functions:
  `code/src/gtl/consensus.ts:1060-1173`;
- separate implementation descriptors:
  `code/src/implementation/consensus.ts:133-190`; and
- separate realization wrappers:
  `code/src/implementation/consensus.ts:491-598`.

`refreshConsensusGap` at `code/src/gtl/consensus.ts:1113-1122` validates a
post-evidence observation and then directly calls `evaluateConsensusGap`.
Nevertheless, it receives a separate implementation identity and wrapper.

The design itself says the four semantic authorities retain stable identity
across initial and refresh loci
(`M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:1214-1223`).

This is exactly the whole-family question the method requires:

> Is phase a typed parameter or closed variant of one atomic function family,
> or does refresh introduce genuinely independent identity, authority, effect,
> lifecycle, reuse, or public pattern-match semantics?

No accepted contraction answers that question. The current peer identities
therefore cannot be treated as Prime by default.

## Finding 6 — P1: Public Continuation Has An Ambient Authority Fallback

The public operation layer stores continuation authorities in a process-local
`WeakMap`:

- registry declaration and lifecycle:
  `code/src/public/operations.ts:42-80`;
- registration after a held traversal:
  `code/src/public/operations.ts:1535-1567`; and
- update after a read or transition:
  `code/src/public/operations.ts:1747-1756`.

`requireContinuationLocator` accepts an explicit durable authority when
present, but falls back to the registry when it is omitted:
`code/src/public/operations.ts:1671-1698`.

The payload-key helper at `code/src/public/operations.ts:135-148` rejects
undeclared keys but does not require every listed key. The fallback is therefore
operative, not dead code.

This directly contradicts the accepted M05 design:

- lines `168-169` require the HoG cursor to be reproducible from admitted GTL,
  opened scope, and replay and prohibit ambient process memory as a
  continuation dependency; and
- lines `476-537` require durable reopening from the event log and immutable
  declaration basis rather than shared process state.

The durable carrier and ABG rehydration path are otherwise strong. The defect
is that process-local history can change whether the same public request is
admissible. That means the explicit durable continuation carrier is not the
sole irreducible transition authority.

Remove the ambient fallback. A read, response, or continue operation should
consume an explicit durable public authority and let ABG rehydrate the source
truth. A cache may remain only if removing it cannot change admissibility or
meaning.

## Finding 7 — P1: The Route Family Was Not Contracted To Its Declared Atom

The M05 atomic-function table declares one route family:

```text
admitRoute:
  route candidate + current replay -> admitted route | refusal
```

See `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:275-280`.

The HoG realization exports many peer route-proposal functions that repeatedly
construct the same candidate envelope:

- structural;
- retry;
- terminal;
- judged;
- graph-span re-entry;
- gap stop;
- blocked;
- hold;
- interaction resume;
- workflow blocked;
- fan-out; and
- recursion.

The exports are visible in
`code/src/hog/traversal_route.ts:52-831`.

Variant-specific validation is lawful. Repeated public candidate-envelope
authorship is a whole-family contraction question. One closed
`RouteProposal<Variant>` family may be the Prime while variant laws remain
subordinate.

The ABG side also exposes both `admitRoute` and `admitRecursionRoute`:

- `code/src/abg/traversal_route.ts:3125-3785`; and
- `code/src/abg/traversal_route.ts:3788-3845`.

Inside `admitRoute`, ordinary route admission also derives and admits
construction intent and construction delta behavior at lines 3571-3707.
Atomic batch admission may be required, but route truth, construction-intent
truth, and construction-delta truth are distinct semantic relations. Their
composition needs an explicit Prime and authority derivation rather than
incidental residence in one large admission function.

The bounded repair is a contraction ruling, not a prescribed decomposition.
The design must decide whether route proposal, recursion, construction intent,
and construction delta are:

- variants or subordinate relations inside one Prime;
- distinct Primes composed by an explicit ABG transaction; or
- another smaller lawful family.

It must state the retained meaning, authority, effect law, accepted loss, and
falsification condition for that decision. The current incidental grouping
cannot supply the answer.

## Finding 8 — P1: S06 Proves Runtime Decoupling, Not Public Prime Composition

The flavored Product is valuable negative evidence: ABIogenesis core does not
contain a fixture-specific execution branch.

It is not yet evidence that a downstream developer can build from installed
public ABIogenesis Primes:

- the fixture defines its own `JsonValue`, canonical JSON, SHA-256, freezing,
  and record-admission helpers at
  `test_env/fixtures/flavored-catalog-product/src/index.ts:1-90`;
- it hand-constructs the complete open-record ModulePublication at
  `test_env/fixtures/flavored-catalog-product/src/index.ts:233-420`;
- its `package.json` declares no ABIogenesis dependency at
  `test_env/fixtures/flavored-catalog-product/package.json:1-17`;
- the fixture preparation helper uses the ABIogenesis source package's
  compiler and imports a private product build path at
  `test_env/support/flavored-catalog-product.mjs:15-38`; and
- the SDK proof imports the installed private path
  `build/code/src/public/index.js`, not the declared package export, at
  `test_env/tests/m5-installed-portability.test.mjs:270-287` and
  `323-334`.

The correct conclusion is:

> S06 currently demonstrates that an independently packed data product can be
> admitted and traversed without a fixture-specific runtime branch. It does not
> yet demonstrate source-independent authoring by composition from the
> installed public irreducible building blocks.

The Codex CLI adapter itself is sound counterevidence. It is a thin process
transport and does not copy GTL, HoG, ABG, Product, or Consensus semantics.
Preserve it.

## Finding 9 — P2: Public Exports And Tests Do Not Enforce The Prime Boundary

`code/src/gtl/index.ts:181-243` exports nearly every Consensus constructor,
predicate, semantic transform, refresh transform, projector, and judgment
resolver. The package then exports both the root wildcard and `./gtl` at
`package.json:14-30`.

Some of those exports may be lawful public Primes. Others may be subordinate
implementation detail. The design contains no Promotion Test that distinguishes
them.

The only test file named for Consensus is
`test_env/tests/m5-installed-consensus.test.mjs`. It is a substantial installed
scenario test. It is not a module-owned proof lane derived from an accepted
Consensus Ontology, IACS, module boundary, and three views.

Green installed tests remain required. They cannot replace the
module-derived-unit-test rule.

The older derived Prime census is also stale:
`design/A5_PRIME_CONTRACTION_CENSUS.md:372-386` still reports that Consensus
has no implementation. It cannot support a current closure claim.

## Finding 10 — P1: The Forty-Row Conservation Gate Marks Pending Witnesses Proven

The separate conservation suite does not prove what its green count appears to
claim.

Its row constructor unconditionally emits:

```text
status: "proven"
witness46: "PENDING immutable RC5 witness reconciliation for ..."
```

See
`test_env/tests/m5-traversal-conservation.test.mjs:196-205`.

The gate at lines `825-856` then:

- requires all 40 rows to have `status = proven`;
- requires zero provisional or open rows; and
- checks only that each evidence-description field is a nonempty string.

It never rejects the literal pending-witness marker or binds a row to an exact
RC5 artifact, T-284 disposition, or mutation witness. The test title itself
says “without claiming RC5 reconciliation,” while the data model and reported
count still call every row proven.

That conflicts with Product law:

- `specification/PRODUCT.md:418-427` requires each row to record its exact 4.6
  behavior identity and witness, successor GTL/HoG/ABG/public evidence, and
  invalid-substitute mutation; and
- lines `429-432` state that an unresolved row blocks the affected 5.0 feature
  and release claim.

The executable traversal checks may be useful 5.0 implementation coverage.
They are not 4.6 conservation closure. No row is closed *by this ledger as
written*. The accepted conservation count must be derived from exact bound
witnesses, not from the `62/62` test-process result.

Repair the evidence references and status calculation. Do not add another
test engine or manufacture one fixture per clause.

## Finding 11 — P1: The Installed Consensus Proof Bypasses The Required Public Projection

The installed Consensus test obtains its ticket view by calling the GTL helper
directly:

```text
gtl.projectTicketConsensus(result, replayRef)
```

See
`test_env/tests/m5-installed-consensus.test.mjs:186-199`.

The public `project.read` implementation at
`code/src/public/operations.ts:1994-2010` accepts only:

- `gaps`;
- `lawful-actions`;
- `replay`;
- `result`; and
- `status`.

There is no `ticket_consensus` public projection variant. The helper at
`code/src/gtl/consensus.ts:2125-2164` checks a result-shaped candidate and a
syntactically valid replay ref. It does not establish that the result and replay
were admitted together by ABG or entered through the installed public read
operation.

This violates the required path:

- `REQ-P-CONSENSUS-015` requires Consensus result and replay reads through the
  corresponding `abg.operation.project.read` variants; and
- `REQ-P-CONSENSUS-016` requires the installed qualification proof to enter
  through `run.invoke` and read typed result and replay through `project.read`,
  without a shell-owned or private orchestration path.

The current test proves that a pure projector can format a supplied pair. It
does not prove the public Product projection. S05 cannot be closed on that
evidence.

## Finding 12 — P1: The F_H Escalation Input Is Shape-Admitted Rather Than Bound To Canonical Consensus Truth

The accepted design requires the Product-declared escalation function to
consume the *exact canonical unresolved result*:

- `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:1770-1775`; and
- the public driver restriction at lines `1777-1780`.

At the exact subject,
`code/src/implementation/product_semantics.ts:135-139` admits an escalation
request whenever it satisfies `isConsensusResultCandidate`. It does not prove
that the value is:

- the canonical result produced by the current admitted rounds;
- unresolved;
- classified as `escalate_fh`;
- bound to the current replay and run; or
- the result selected by the Product-owned ordinary Consensus path.

A caller able to supply a self-consistent candidate can therefore cross the
escalation input contract without presenting the canonical unresolved result
that is supposed to authorize the F_H boundary.

This is not merely missing validation detail. It makes a semantic truth carrier
look like an ingress shape. Bind escalation admission to the exact
replay-derived canonical result before F_H entry.

## Finding 13 — P1: A Wrong Human Correction Is Recorded As A Successful Response

`interaction.respond` admits a response after:

- checking the Product-owned outer response contract; and
- checking that a correction disposition belongs to the broad four-value
  vocabulary.

See `code/src/public/operations.ts:2264-2359`.

It does not check that the chosen disposition is the one made lawful by the
Product-observed pressure and current construction basis. The negative test
named “refuses a human correction choice that differs from Product-observed
pressure” demonstrates the mismatch:

- it observes `repair_required`;
- submits `correctionDisposition: "escalate"`; and
- asserts `result.responded.disposition === "succeeded"`.

Only later does continuation fail to produce a correction disposition or
closure. See
`test_env/tests/m5-installed-external-product.test.mjs:3181-3230`.

`REQ-P-POLICY-032:228-232` requires an F_H request that does not match the
pending interaction, declared choice or response contract, actor capability,
or current basis to fail as a typed refusal. Recording the mismatched choice as
a successful admitted response and relying on later non-close is not that
boundary.

The actor's attempted response may remain observable refusal evidence. It must
not be represented as the successfully admitted response that satisfies the
pending interaction.

## Finding 14 — P1: Consensus Schemas And Vocabularies Are Named But Not Publicly Addressable

`REQ-P-CONSENSUS-004:50-57` requires the public contract catalog to locate
canonical schemas for the Consensus subject, panel, reviewer profile, findings,
rulings, policy, round outcome, result, and ticket projection. Native and
serialized forms must preserve the same field and value-domain meaning.

`REQ-P-CONSENSUS-018:169-175` makes those addressable public schemas and
vocabularies part of release completion.

The Consensus publication at `code/src/gtl/consensus.ts:3139-3172` creates
contract declarations containing:

- `contractRef`;
- `contractVersion`;
- `contractKind`; and
- `valueKind`.

Those rows are type nameplates. They do not carry or locate the canonical
schema and closed vocabulary assets required by the Product. No other current
code reference for `abg.schema.consensus-subject` supplies the missing public
asset.

This is a bounded publication gap, not a request for a conformance engine.
Promote the already required closed semantic contracts through the ordinary
public contract-catalog relation.

## Finding 15 — P1: Direct Public Control Contradicts The Accepted Requirement

`REQ-P-POLICY-013:49-57` states that both current `root_mode` values remain
outside `scope + target + until` and are lawful only when
`until = converged`.

The later M05 design instead defines direct public control as:

```text
target = next | asset:<Product handle>
until = first_traversal
rootMode = direct
```

See
`M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:1572-1600`.

The realization enforces that later design literally:
`code/src/gtl/public_start.ts:73-82` refuses direct public control unless
`until = first_traversal`.

The accepted requirement and realization cannot both be true. This audit does
not establish a Product reprice, but it cannot state that all requirements are
unchanged and satisfied. Resolve the contradiction through the smallest lawful
path:

- correct the code and affected design if `until = converged` remains
  authoritative; or
- perform a bounded `requirement_reprice` if Product meaning intentionally
  changed.

Do not let an appended design section silently supersede constitutional truth.

## Finding 16 — P1: The Review And Acceptance Records Assert Evidence That Does Not Exist

The S05 proxy design decision says:

> The three semantic views and IACS preserve the accepted authority split.

See
`.ai-workspace/comments/codex/20260724T232029Z_DECISION_proxy_accept_s05_ordinary_consensus_design.md:45-49`.

The S06 self-review says:

> Its three semantic views and IACS table remove material ambiguity.

See
`.ai-workspace/comments/codex/20260725T014500Z_SELF_REVIEW_s06_portability_reflection_design.md:58-63`.

Those claims are incorrect under the selected Design Module Method. The
sections contain plain text sketches and authority tables, not the required
Ontology-derived IACS and three-view assets.

The S05 implementation self-review then treats scenario, regression, package,
and prohibited-architecture checks as complete closure evidence:
`.ai-workspace/comments/codex/20260725T013432Z_SELF_REVIEW_s05_installed_consensus_7722806d.md:48-70`.
Those checks are useful, but the module and Prime evidence is absent.

The resulting read-model claims are stale:

- `specification/GOALS.md:42-51` records S03 and S05 accepted and closed and S06
  design accepted;
- `AGENTS.md:19-43` and `90-134` repeat those states; and
- T-270 advances from closed S05 into S06.

This post is commentary and does not itself mutate those authority surfaces.
It finds that their design-method closure claims require correction.

## Why Earlier Reviews Missed This

The failure was not that every local review was technically empty. Many reviews
correctly protected:

- direct traversal rather than lowering;
- GTL topology;
- ABG event and replay truth;
- exact Product and workspace identity;
- durable continuation;
- F_H attribution;
- source-independent packaging; and
- absence of a second runtime or feature controller.

The reviews failed at a different altitude:

1. They treated one broad authority category as one Prime.
2. They checked whether authority remained in Product, GTL, HoG, or ABG, but
   not whether each function and carrier inside those owners was irreducible.
3. They treated appending one section to an existing design file as
   proportional, even though the section activated a materially new domain
   boundary.
4. They interpreted co-evolution as permission to accept implementation before
   final Ontology, IACS, and three-view reconciliation.
5. They let green installed tests substitute for module-owned proof.
6. They accepted a `40/40` conservation label without inspecting the literal
   pending witness content beneath it.
7. They allowed direct GTL helpers and shape predicates to stand in for the
   required public and replay-bound authority path.
8. The pen-holder's self-review and proxy acceptance repeated the same model
   and therefore did not challenge the missing derivation.

The resulting bugs are not random. They are predictable symptoms of missing
Prime boundaries:

- duplicated initial and refresh identities;
- open semantic records;
- broad mixed-role modules;
- ambient continuation fallback;
- repeated route-envelope construction;
- route admission mixed with construction admission; and
- a downstream fixture recreating construction machinery;
- pending predecessor witnesses marked proven;
- a public projection proved through a direct GTL helper;
- shape-valid Consensus values crossing canonical-result boundaries;
- a mismatched F_H choice recorded as successful;
- schema names without addressable public schema assets; and
- an appended design contradicting a live requirement.

The method contains the restoring law. The builder and the reviews, including
prior Codex reviews, failed to apply it after the original M05 design boundary.

## What Remains Sound

The following should be preserved:

1. The accepted Product destination. This audit establishes no Product
   reprice.
2. GTL.TypeScript as the sole program language.
3. Non-lowering validation.
4. Direct HoG traversal of admitted GTL.
5. ABG ownership of runtime admission, events, replay, continuation, and
   closure.
6. The accepted M03 design and M4 bootstrap.
7. The original M05 traversal Ontology and direct-fold algebra through Section
   11.
8. Installed F_P transport, recursion, fan-out/fan-in, durable event reopening,
   and other behavior that can be mapped to the retained Primes.
9. Consensus expressed through ordinary GTL workflow, fan-out, reduction,
   recursion, and F_H rather than a bespoke Consensus runtime.
10. The thin Codex CLI transport.
11. Existing scenario and mutation tests as downstream regression evidence.

The requirements remain constitutional authority unless lawfully repriced.
Most reviewed realization defects require correction toward those
requirements. The direct-control contradiction in Finding 15 is the bounded
exception that requires an explicit requirement-versus-realization decision;
an appended design cannot resolve it implicitly.

No compiler, lowering carrier, alternate execution plan, feature-specific HoG
runtime, public controller, or second event authority was found in the exact
committed subject.

## Required Status Correction

| Surface | Current claim | Audit disposition |
|---|---|---|
| M03 direct-GTL design | accepted | keep accepted |
| M05 traversal design through Section 11 | accepted | keep accepted |
| S03 Section 12 and implementation | closed | retain behavior as provisional; reopen design-method closure |
| S05 Section 13 and `7722806d` | accepted and closed | retain implementation stock; reopen design and implementation closure |
| S06 Section 14 | design accepted, not scenario-closed | withdraw design/promotion status pending design reframe |
| S06 portability at `bcd8769a` | promoted Product proof | retain as runtime-decoupling evidence; do not claim public Prime composition |
| concurrent observer/tuner work | uncommitted WIP after exact subject | preserve separately; exclude from this audit and do not promote |
| Product | accepted | retain; no Product reprice established |
| `REQ-P-POLICY-013` versus M05 Section 12.9 | both treated as active | correct design/code to the requirement or explicitly perform one bounded requirement reprice |
| 40-row conservation | reported proven | return to unresolved until exact RC5 witnesses bind each accepted row |
| M5 | active with S05 closed | active with S03/S05 reconciliation, S06 design correction, and Product-proof repairs open |
| qualification/release | later | blocked until the affected design, realization, and exact evidence gates close |

If this review is accepted, the status correction must be applied once across:

- `specification/GOALS.md`;
- `AGENTS.md`;
- active parent T-270;
- completed S03 owner T-272;
- completed S05 owners T-274, T-275, and T-276;
- active S06 owners T-281 and T-268; and
- `CLAUDE.md`, whose bootstrap is stale in the opposite, older direction.

The existing proxy decisions and self-reviews should remain immutable historical
evidence. Correct their downstream status projections; do not rewrite the
receipts.

## Bounded Repair

### 1. Freeze The Evidence

Preserve `bcd8769a` as the exact committed behavioral stock. Preserve concurrent
observer/tuner work separately without promoting it. Do not delete working code
before classification.

### 2. Re-enter Once At `design_reframe`

Use the existing M05 design and current ticket owners. Do not create a Product
rewrite, broad requirement rewrite, replacement architecture, new ticket
hierarchy, or another runtime.

Use one coordinated reframe transaction over the activated S03, S05, and S06
boundaries. It may use one or several design files. Each materially changed
boundary must have an accepted, boundary-bounded Ontology/IACS/three-view/axiom
slice that derives from the same canonical model. Artifact count is not the
governor.

Finding 15 is a separate conditional branch: if direct
`until = first_traversal` behavior is intentional Product meaning, perform the
smallest bounded `requirement_reprice`; otherwise correct design and code under
the existing requirement.

### 3. Derive The Missing Ontology And Algebra

For each affected boundary, add:

- entities, identities, relationships, and cardinalities;
- complete lifecycle and retirement disposition;
- proposer, evaluator, verifier, admitter, executor, projector, and retirement
  authority;
- the discovered-functionality matrix;
- the smallest parameterized atomic function families;
- higher-order composition and effect algebra;
- identity, closure, associativity, cardinality, effect, and authority
  conservation laws as applicable;
- deferred, excluded, and unresolved rows; and
- the whole-family Prime contraction result.

### 4. Declare The Actual IACS

For each carrier:

- identify the Ontology relation it carries;
- classify it as authoritative, subordinate, effect-edge, or downstream;
- state public or module-local visibility;
- apply the Promotion Test;
- identify persistence and lifecycle;
- name accepted loss and falsification conditions; and
- map it to one module role.

### 5. Replace The Stale Canonical Views

Update the canonical M05 design, or accepted boundary-bounded slices derived
from it, so the active families are no longer marked deferred. For each
materially distinct boundary, provide the required Mermaid:

- `classDiagram`;
- `sequenceDiagram`; and
- `stateDiagram-v2`.

Then extend the axiom matrix over the same Ontology. The three views may share
one asset and one acceptance decision, but no single broad diagram may blur
distinct semantic boundaries merely to minimize artifact count.

### 6. Reconcile Existing Code To The Accepted Primes

The following are candidate contraction hypotheses, not pre-ratified answers:

1. One closed construction-semantic family with phase as a typed variant may
   own initial and refresh application of model, gap, next-action, and
   action-evaluation functions.
2. One closed Consensus domain family and pure semantic kernel may own subject,
   panel, policy, findings, reduction, outcome, and result meaning.
3. GTL publication construction may be a distinct constructor boundary that
   consumes the domain and standard GTL Primes without owning domain
   evaluation.
4. F_P reviewer transport and other leaf implementations may remain in one
   effect shell addressed only by admitted bindings.
5. Ticket and public result projection may be one downstream projection family
   over admitted result and replay truth.
6. One closed route-proposal family may own the common envelope while typed
   variants own structural validation.
7. Route admission, construction-intent admission, and construction-delta
   admission may remain distinct semantic functions composed by one explicit
   ABG atomic transaction.
8. `PublicContinuationAuthority` should be the explicit transition carrier;
   process-local lookup must not change admissibility.
9. An independent Product should consume installed public GTL/publication
   building blocks rather than duplicate ABIogenesis construction mechanics.

The design pass must prove or reject these hypotheses. It must not accept them
merely because they reduce file or function count.

### 7. Add Module-Owned Proof

Add focused proof lanes derived from the accepted module boundaries:

- closed-carrier construction and admission;
- parameterized initial/refresh law;
- Consensus pure reduction and outcome algebra;
- route-family contraction and variant refusal;
- explicit durable continuation authority with no ambient fallback;
- publication construction without domain-authority bleed;
- replay-only projection;
- effect-shell isolation; and
- public consumer composition from installed Primes.

Retain and rerun the installed M4, M5, Consensus, portability, mutation, and
package-reproduction suites afterward.

### 8. Repair Product-Path Proof And Admission

In the same bounded correction wave:

- bind each accepted conservation row to an exact immutable RC5 witness,
  T-284 disposition, successor path, and nearest invalid mutation;
- calculate conservation status from those bindings rather than hard-coding
  `proven`;
- expose ticket Consensus result/replay through the ordinary installed
  `project.read` path;
- require escalation input to equal the replay-derived canonical unresolved
  result;
- refuse an F_H correction that does not match the current Product-owned
  choice and basis;
- make required Consensus schemas and closed vocabularies addressable through
  the public contract catalog; and
- resolve the `until = converged` versus `first_traversal` contradiction at the
  lawful authority level.

## Acceptance Predicate

The affected M5 boundary becomes design-method acceptable only when all of the
following hold:

1. the canonical Ontology or accepted boundary-bounded slices include the
   active S03, S05, and S06 identities and no longer list those active
   boundaries as deferred;
2. every discovered function is atomic, composed, deferred, excluded, or a
   named gap;
3. initial and refresh peers have an explicit whole-family contraction ruling;
4. the Consensus carrier family is closed at semantic boundaries;
5. the IACS identifies Prime, subordinate, effect-edge, and downstream
   carriers with Promotion Tests;
6. module roles do not mix domain meaning, publication, admission, effects,
   and projection without an explicit irreducibility proof;
7. Mermaid domain, sequence, and state views project the same accepted
   Ontology;
8. the cross-view axiom matrix is green or names owned blocking gaps;
9. public continuation cannot depend on ambient process-local authority;
10. route proposal and admission families have an accepted contraction;
11. public exports are limited to promoted Primes and intentional public
    subordinate contracts;
12. module-derived unit proof exists;
13. ticket Consensus result and replay are read through the ordinary public
    operation rather than a direct GTL helper;
14. escalation accepts only the exact canonical unresolved result;
15. a mismatched F_H response fails at its typed admission boundary;
16. required Consensus schemas and vocabularies are addressable public assets;
17. every claimed conserved row binds an exact immutable RC5 witness and
    mutation;
18. the direct-control `until` law is singular across requirement, design, and
    code;
19. an independent installed consumer composes from public building blocks
    without source/private imports or copied construction law;
20. the existing direct-GTL installed Product scenarios remain green; and
21. no compiler, lowering carrier, controller, second runtime, or rival event
    truth is introduced.

## Non-Requirements

This audit does not require:

- a Product reprice;
- a broad requirement rewrite; Finding 15 may require one bounded requirement
  reprice only if the newer direct-control meaning is intentionally retained;
- a restart from 4.6;
- deletion of all S03-S06 code;
- restoration of X;
- another compiler or execution plan;
- one module per function;
- one type per payload;
- another schema registry;
- a conformance engine;
- new event families;
- more tickets;
- fixed artifact counts beyond complete boundary-bounded three-view evidence;
  or
- repeated review/refreeze loops for every local edit.

## Final Verdict

The direct-GTL architecture remains the correct 5.0 architecture. The current
problem is not that the implementation lacks behavior. It is that material
behavior was promoted after the design stopped deriving atomic, irreducible
building blocks.

The lawful ruling is:

> Reject design-method closure for S03 and S05, and reject S06 design/promotion,
> at committed subject `bcd8769a`. Retain M03, M4, the original M05 traversal
> basis, and all working behavior as evidence. Re-enter once at
> `design_reframe`; derive and accept the affected Ontology, atomic-function
> algebra, whole-family Prime contraction, IACS, module topology, three views,
> and module-owned proof. Repair the exact Product-path evidence and admission
> defects identified here, reconcile the existing realization to that cut, and
> only then resume S06 and the 5.0 delivery path.
