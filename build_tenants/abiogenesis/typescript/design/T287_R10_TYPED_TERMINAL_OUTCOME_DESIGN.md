# T-287 R10 Typed Terminal Outcome

**Status**: Accepted HOW07 under Executive Review08 and HOW10 under Executive /root Review11. Separate isolated Implementation12 is granted; no runtime grant or R10 acceptance follows.
**Work**: GOAL-035 / T-287 / D4 / S01, root obligation R10.
**Re-entry**: design_reframe; Product, requirements, Public membership and runtime authority are conserved.

## 1. Product frame and scope

The fixed sixteen-family ABIogenesis 5.0 Product is unchanged. F05/F09/F13 and
S01 require the source-blind installed path from published Program and
GraphFunction through HoG, admitted ABG result and closure to fresh replay and
the actual CLI typed output. F12/S04 remains 5.1.

[Product ABI5-ROOT-001](../../../../specification/PRODUCT.md#root-product-outcome)
and [REQ-P-QUAL-058](../../../../specification/requirements/product/REQ-P-QUAL.md)
own R1–R10 on one exact installed subject. The constitutive Public laws are
[REQ-P-PUBLIC-CONTRACTS-005 and 008–013](../../../../specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md);
004 governs exact contract identity. The projection laws are
[REQ-R-ABG3-PROJECTION-001–006 and 023](../../../../specification/requirements/abg/REQ-R-ABG3-PROJECTION.md).
[Realization Constitution](ABI5_REALIZATION_CONSTITUTION.md) rows
L11–L15/L17 and R08/R09/R14/R15/R29/R30 retain their owners. Those row numbers
are not the root obligation number R10.

The selected frame is RC6
`stdo://releases/v2.5.0-rc.6/standards/STDO_REFERENCE_FRAME_BASELINE.md#derived-worker-frame`,
refined by the [ABI project frame basis](ABI5_PROJECT_REFERENCE_FRAME_BASIS.md)
and its Public, Projection/ABG and Proof owners. Installed Representation and
released a_c route attention only. This candidate does not amend their law.

| Subject | Class and owner |
|---|---|
| Product, Program, GraphFunction, contracts, Catalog/View, lock, WorkspaceBinding | Immutable definitions and admitted coordinates; their existing Product/GTL owners |
| Invocation, ExecutionBasis, CCall result/judgment, route and closure events | ABG-admitted runtime evidence; Event Calculus/replay is the sole truth source |
| Typed terminal result below | Immutable, pure ABG projection; neither a new result admission nor a continuation input grant |
| Product invocation outcome | Existing Product.RunInvocation interpretation of ABG truth |
| DefinitionCall receipt, SDK and CLI serialization | Derived transport/projection; no event reader, producer selection or closure authority |
| Installed fixture assertions and this HOW's proof plan | Evidence/observers; no runtime authority or semantic UAT |

The existing installed R1–R9 witness remains evidence for its original cut.
Its native typed Hello result is not retroactive R10 CLI evidence. This design
changes neither Hello, its Program, the one callable membership, its contracts,
nor the CCall/event/HoG lifecycle. No new Public family or member is introduced:
eighteen families and fifty-six concrete members remain exact.

## 2. Observed boundary

The source observation is the frozen S01
[candidate](../../../../.ai-workspace/comments/codex/20260911_D4_S01_PROGRAM_OWNER/implementation-01/candidate-01/manifest.json),
SHA256 `8f3a7c3e02b41cd073d46d76ea5e488b6aa5130650d52983861ee461deb1ef78`.
[Execution06](../../../../.ai-workspace/comments/codex/20260911_D4_S01_PROGRAM_OWNER/fixture-program-selection-01/execution-01/return.md)
contains sixteen Public calls, twenty native events and one admitted terminal
Hello value. The [earlier payload-gap record](../../../../.ai-workspace/comments/codex/20260911_D4_S01_PROGRAM_OWNER/installed-preparation-01/r10-payload-gap.md)
separates the native helper observation from supported Public output.

In that exact source, relative to `code/src`:

- `abg/replay.ts:61–78, 480–545` retains the admitted CCall's result ref/digest,
  contract ref, value kind and value.
- `abg/project_read_ports.ts:352–365, 390–481, 570–606` selects the terminal
  route and result but exposes only a coordinate in canonical Run truth.
- `abg/project_read_definition_bindings.ts:308–335, 365–383` reduces result
  to coordinates and replay to subject/replay/page metadata.
- `product/run_invocation_operation.ts:648–701` and
  `product/run_operation_contracts.ts:45–59` carry the coordinate-only result.
- `owner_bindings/run_invocation.ts:1606–1620` already obtains final native
  Run truth before constructing the Product outcome.
- `public/cli.ts:94–145` already serializes the installed DefinitionCall
  result. It is not the missing semantic owner.

The correction extends the owner projection, not the CLI. Existing raw native
replay, CCall admission and exact-prefix mechanisms are reused. The
success-only invocation-source-result carrier is not repurposed as a general
Public outcome: its continuation authority and closed-source requirements
have a different domain.

## 3. One contracted owner relation

There is one scoped relation:

```text
validated durable prefix + admitted Run or GraphCall subject
  -> existing exact execution/CCall/result/judgment/terminal/closure joins
  -> ABG typed terminal-result projection or truthful absence/refusal
  -> existing Product invocation / ABG result / ABG replay owner output
  -> installed DefinitionCall -> unchanged SDK/CLI serialization
```

Run scope uses its root GraphCall's actual terminal producer. GraphCall scope
uses that exact GraphCall, even when nested; it does not substitute its
parent, a descendant leaf, the root result or an equal-valued foldback.
The GraphCall result/replay companions are included because R08/R09 and
R14/R15 are already the same owner law at two explicit scopes, and
PROJECTION-006 forbids hiding callable truth inside Run projection alone.
Other project.read members are not redesigned.

The admitted domain is a validated prefix and an exactly bound subject with
existing owner evidence. A complete terminal projection requires the existing
successful terminal route, admitted result and judgment, and applicable
closure. It does not create completion from schema validity, result presence,
process exit zero, or a closing event found without its causal relations.

### 3.1 Shared carrier

One ABG-owned closed schema and derived native type,
`AbgTypedTerminalResult`, supplies these fields:

```text
{
  kind: "abg_typed_terminal_result",
  schemaVersion: "5.0.0",
  result: {ref, digest},
  contract: {ref, digest},
  valueKind,
  valueDigest,
  value: IJsonValue,
  producer: {
    runRef, graphCallRef, invocationAdmissionRef,
    program: {ref, digest},
    graphFunction: {ref, digest},
    executionBasis: {ref, digest},
    cCallRef, resultAdmissionEventRef, judgmentRef,
    judgmentAdmissionEventRef, terminalRoute: {ref, digest}
  },
  projectionBasis: {ref: eventLogRef, digest: durablePrefixCoordinateDigest}
}
```

This is a projection of the admitted successful terminal result, not a second
runtime result. `result.digest` is the admitted result-body digest;
`valueDigest` is the canonical I-JSON value digest. They are never conflated.
Contract identity is the exact declared contract and its admitted owner-bound
digest, not a digest guessed from its URI or from the value. Producer fields
are copied from the causally joined owners, not synthesized from Public
labels. Existing output `result: {ref,digest}` fields remain coordinate aliases
of this carrier's `result`, constructed from that same carrier without another
selector. No independently asserted duplicate is accepted.

`value` is the exact admitted I-JSON value under the identified contract; it
is not an open trusted transport payload. The closed owner carrier binds
contract and value, while the original ABG admission/contract owner supplies
domain validity. No recursive walk interprets strings inside Product JSON as
ABG references. A lawful JSON null value is distinct from absence of the
terminal carrier; field presence and its admitted digest, not truthiness,
decide this distinction.

The schema/type lives at the ABG owner and is referenced by both existing
owner contract declarations. Published native exports and addressable JSON
schema projections derive from it. A second Product, Public, CLI or test
schema is not authored.

### 3.2 Required causal joins

The one projector preserves all of these relations before exposing a carrier:

1. The read resource pins the exact durable store/prefix. The supplied source,
   source digest, WorkspaceBinding, ProductSet, dependency lock, capability
   basis and projection basis match the existing admitted environment.
2. The subject opening joins its actual admitted invocation and execution
   basis. Program, GraphFunction, declaration/contract owner and basis digests
   are the exact historical selection. A GraphCall joins its owning Run and
   its own root/child basis; child output is not checked against an unrelated
   root invocation's output contract.
3. The actual terminal route selects one CCall within the requested scope.
   The opened CCall, selected implementation or workflow carrier, result
   admission and judgment rehydrate through existing native owner relations.
   Result body/ref/digest, value kind/value/digest and declared output contract
   agree. The selected resultClass is success and its judgment is advance.
   Judgment identifies that result and causally follows its admission; route
   identifies that CCall and judgment.
4. Applicable graph closure and, for Run scope, Run closure follow the admitted
   terminal path. Runtime failure or later non-completion is not overwritten
   by an earlier successful CCall. A closed nested GraphCall can retain its
   terminal result while the containing Run remains active or held; that does
   not complete the Run.
5. No zero/many case chooses first/last or deduplicates by value. Missing,
   crossed or ambiguous owner relations refuse. Equal-valued CCalls are
   distinct producers; ordinary workflow foldbacks are not extra executions
   of the selected producer.

Existing prefix, CCall and basis projectors remain the authority. Reading a
typed row from ReplayState alone does not replace its missing source joins.
The projector consumes exact already-admitted contract-owner coordinates,
using the existing native execution/contract reconstruction path. It does not
load today's app files, accept a caller's schema or search an ambient Catalog
for a substitute. If the required historical contract owner cannot be
reconstructed, return the existing source/basis refusal: do not invent a
digest, broaden the scope or change admission law.

## 4. Existing output members

| Existing owner/member | Candidate output delta |
|---|---|
| Product.RunInvocation `invoke` and `start` (R29/R30) | Add `terminalResult: AbgTypedTerminalResult | null` to the result arm. Existing result coordinate, disposition, stop/gap/interaction/evidence/replay fields remain. Completed output requires the exact Run-scoped carrier; blocked/runtime_failed output has no successful terminal carrier. Existing nonterminal/refusal shapes remain. |
| ABG Run/GraphCall result (R08/R09) | Add non-null `terminalResult` to the existing result projection. Keep subject, result coordinate, terminalRoute and replay, deriving aliases from the same selected owner. |
| ABG Run/GraphCall replay (R14/R15) | Add scope-owned `status` and `terminalResult: AbgTypedTerminalResult | null` to the existing replay projection. Their source is the whole exact selected prefix, not a requested page fragment. Keep subject, replay, fromOrdinal and limit. |

Run and GraphCall companion bindings use the existing exact-prefix authority
checks at the appropriate subject, rather than copying unchecked caller
source digests. Factoring the common check is allowed only with the existing
scope distinction intact. Other member identities, requests, authority slots,
capabilities and event-admission behavior are unchanged. The candidate child
proof resource extension in section 7 is the sole resource-boundary exception;
the existing event-resource acquisition and close mechanism are unchanged.

The Product outcome maps only native truth as before: `closed` to completed,
`blocked` to blocked, failure/stopped/refused to their existing runtime-failed
outcome, and held/gap_stopped to nonterminal. A closed subject lacking the
required joined terminal result is not a coordinate-only completion; the
existing owner observation/refusal or execution-fault boundary reports the
missing relation. No exception is translated into fabricated success.

For result reads, active/held/gap-stopped subject truth gives `not_ready`;
a known terminally stopped/failed subject without a successful terminal result
gives `not_found`. Missing/invalid source or prefix uses the existing
`F_READ` relation. Replay can truthfully return active, held, failed or closed
status with a null terminal carrier; it does not relabel such a read as runtime
completion. Admitted failure/refusal/pending values remain evidence through
their existing evidence/replay owners, never promoted to terminal success.
An admitted successful command-observation value can still contain a nonzero
command exit; its contents are not rewritten by this projection.

### Paging and determinism

`terminalResult` and `status` are explicitly whole-prefix subject summaries.
They remain identical for all valid pages of that exact subject and prefix.
A page excluding the terminal event does not mean no result; an empty page
does not complete or un-complete anything.

Page selection remains a deterministic window over the selected native
scope's ordered event population: zero-based `fromOrdinal`, positive
`limit`, no resorting or value deduplication. The owner validates safe range
arithmetic; an offset at the population length denotes an empty page, and an
   offset beyond it refuses `cursor_invalid`; invalid arithmetic/range refuses
`range_invalid`. Raw invalid selector shapes are invocation rejection.
No R10 claim is made that existing metadata-only page fields deliver every
native event payload. General replay-page content expansion is outside this
delta; the new typed terminal summary is not presented as a page's event row.

All reads reopen through the supported resource assertion, pin its existing
prefix and return the normal close receipt without events, effects or a new
state ledger. Fresh reads depend on retained admitted evidence and exact
installed contracts, not a warm process, previous fixture value or current
app contents.

## 5. Definition and publication conservation

The existing `PublicFunctionDefinition<K>`/owner-contract source remains the
sole definition. The affected six member result schemas, definition digests,
schema/catalog projections and packed manifest derive from that source.
Request, refusal and nonterminal contracts are conserved unless an exact
existing owner inconsistency makes them unconstructable, in which case the
Worker returns that boundary rather than widening this design.

This candidate explicitly proposes supersession of the coordinate-only result
schema projections for R08/R09/R14/R15/R29/R30 in the next exact candidate cut,
subject to review and acceptance. It does not reinterpret the old installed
cut. Exact changed schema/definition/catalog digests and the predecessor
identities are recorded at implementation freeze under
PUBLIC-CONTRACTS-004. An old-digest request cannot select changed meaning;
there is no same-identity fallback or dual transport. This is not a new Public
operation family or member, nor authorization to edit an immutable Product.

SDK and CLI receive the same current installed DefinitionCall receipt and
serialize its owner output. `public/cli.ts`, generic installed transport,
generic verifier, Public dispatcher, event store, HoG, CCall admission and
execution owners gain no new semantics. The retired
`abg_cli_transport_result/public_outcome` test expectation is not restored.

## 6. Bounded realization and proof

The proposed later production cone, relative to the selected source
`code/src`, is:

- `abg/project_read_ports.ts`: one scoped terminal projector and its reuse
  in canonical Run truth and Run/GraphCall result/replay.
- `abg/terminal_result_contracts.ts` (new): one owner schema and derived type,
  importing existing I-JSON/ref/digest primitives.
- `abg/project_read_operation_contracts.ts`: reference that schema in four
  existing result/replay member outputs.
- `abg/project_read_definition_bindings.ts`: preserve the owner carrier,
  exact scoped source/authority checks and page validation; no Public reader.
- `product/run_operation_contracts.ts` and
  `product/run_invocation_operation.ts`: reuse the same schema/carrier for
  the two invocation result arms and preserve truthful disposition.
- `abg/index.ts`: only necessary native export projection of the owner type
  and schema. Existing catalog/schema generators publish the changed
  definitions; generated outputs are not independently authored.

`abg/replay.ts`, `abg/c_call.ts`, `abg/invocation_execution_truth.ts`,
`abg/invocation_admission.ts`, `abg/execution_basis.ts` and
`owner_bindings/run_invocation.ts` are reused owning dependencies, not grants
to rewrite their laws. Existing native graph-result consumers, including
`product/project_read_definition_bindings.ts`, conserve their lower fields.
An unavailable exact owner relation is a bounded re-entry, not permission to
add a CLI read path or broaden this cone.

The proof obligations are:

1. On one fresh source-blind installed candidate, the unchanged exact Hello
   Program runs through the existing Public start. Its actual CLI result
   exposes the admitted typed Hello value, its output-contract identity,
   canonical value digest and actual terminal result/producer coordinates.
   Native admission and Program/CCall/basis/closure evidence join that same
   output. A fixture must not supply the asserted result.
2. Two fresh processes each call supported result and replay on the same
   close handoff/prefix. Both public payloads equal the start's terminal
   carrier and exact Hello value; replay status is closed. SDK/CLI serialize
   the same owner DefinitionCall result. No native helper is credited as the
   missing Public payload.
3. Wrong contract/digest/value/valueKind, result/body digest, producer, Program,
   graph-call scope, basis or prefix refuses before a typed terminal claim.
   Equal-valued distinct producers are not deduplicated; a lawful parent
   foldback and nested terminal result stay scoped correctly.
4. Held/pending, blocked/failed, missing terminal and a result without its
   judgment/route/closure never become completed. A closed child inside a
   nonterminal Run does not complete the parent. Lawful null-valued output
   remains distinct from no terminal carrier.
5. Repeated reads and valid pages retain the same whole-prefix terminal
   summary. End/empty pages, out-of-range selectors, stale/crossed source
   digests and cross-WorkspaceBinding requests exercise exact refusal.
   Every read leaves event count, byte prefix, store identity and close
   handoff unchanged; no app/actor/helper effects occur.
6. Published contracts/schema locators, exports, definition/catalog digests
   and installed selection agree. Existing eighteen/fifty-six membership,
   refusal/nonterminal contracts, D1/D2/F11 and bounded S01 R1–R9 mechanisms
   remain conserved; a source test or count alone proves none of these
   runtime outcomes.

The first installed R10 discriminator takes precedence over exhaustive local
assurance once the exact path is source-ready. Synthetic/pure checks remain
limited to their exercised relation. Existing Execution06, old failed
attempts, D2 source04's historical 46/48 checks and all prior evidence remain
unchanged. This candidate claims no implementation, native R10/full S01,
semantic UAT, D1/D2/D4/fixed16 closure, integration or release qualification.

## 7. Candidate amendment: historical child declaration proof

**Delta status.** Accepted HOW10 under Executive /root Review11. This section
supplies the child-contract input missing from the accepted projection design;
it neither admits a new runtime fact nor changes Product or requirements.
[Implementation09](../../../../.ai-workspace/comments/codex/20260911_D4_S01_PROGRAM_OWNER/r10-implementation-01/return.md)
returned `re_entry_requested` before production edits. Its retained Hello
history has no child and is not a failed native child-result witness.

### 7.1 Closed resource boundary

Root Run result/replay and invoke/start derive the contract ref, digest and
owner from their exact admitted root invocation, joined to the root basis and
terminal producer. Root GraphCall projection uses that same admitted root
contract when its exact root relation holds. These paths require no Catalog,
declaration proof or additional caller input.

The two existing GraphCall result/replay bindings accept one additional,
optional resource field, `declarationProof`, with this closed shape:

```text
{
  kind: "abg_historical_declaration_proof",
  schemaVersion: "5.0.0",
  catalog: ReadyGraphFunctionCatalog,
  catalogView: GraphFunctionCatalogView
}
```

The Catalog's existing readiness basis carries the exact immutable
publications, verified artifacts, install candidates, WorkspaceBinding
candidate and lock. The resource supplies those bytes, not a trusted contract
schema, digest, owner, resolved closure, acceptance flag or new call right.
Program, root/child basis and the selected output contract are derived from
the admitted subject, never selected by this resource. No separate publication
list or caller-authored closure duplicates the Catalog's evidence.

The ordinary `AbgProjectReadResourceAssertion` arm remains unchanged.
Only `graph_call_result` and `graph_call_replay` admit the additional field;
other members refuse it. Their native packet can carry the same proof
candidate to the one ABG projector, which verifies it itself rather than
trusting a binding's flag or a structurally typed caller object. A nested
terminal carrier requires the proof. Missing or invalid proof refuses that
claim through the existing source/basis refusal relation; it does not return
a coordinate-only result or silently convert a closed child's result to null.
An actually nonterminal/unsuccessful child retains section 4's status,
absence and refusal semantics; proof absence cannot fabricate completion.
A supplied proof never substitutes for the root's admitted contract.

The owner resource schema has a strict wrapper and derives its types and
schema projections at the existing ABG binding. Its Catalog/View values use
the existing Product shapes and exact semantic reconstruction; shape alone
confers no admission. Record the changed resource/binding schema identities
in the next candidate. Public requests, authority slots, refusal/nonterminal
contracts, resource close receipts and eighteen/fifty-six membership stay
unchanged. The existing DefinitionCall `resources` carrier transports the
proof without an SDK/CLI/dispatcher change or a new Public member.

### 7.2 Continuous historical authentication

The existing ABG prefix and subject owners first establish the selected
GraphCall, Run, invocation and root/child execution bases. The one terminal
projector then requires this continuous relation:

1. Reconstruct the exact WorkspaceBinding environment using
   `projectExactPrefixWorkspaceEnvironment` and its causal
   `projectAdmittedProductInstallByAdmissionEventRef` owners. Binding,
   install and lock facts belong to the selected durable history and precede
   the admitted root invocation; a later install or today's filesystem cannot
   supply a missing historical owner.
2. Reuse Product Catalog admission and View narrowing. Reconstructed values
   must equal the supplied Catalog/View in full; the readiness binding, lock
   and install candidates must equal the native environment with exact
   membership and unique owners. Catalog basis and View identities/digests
   must equal the root invocation and every joined execution basis.
   Catalog publication ownership and digest checks remain Product-owned.
3. Call the existing `resolveExecutionDeclarationClosure` for the admitted
   root Program and selected root GraphFunction, using that historical View.
   Match Program and root GraphFunction definition digests to the invocation
   and root basis. The child GraphFunction must have one exact owner in this
   root execution closure, not merely appear somewhere in the Catalog or
   Program. Preserve reciprocal Program membership, declared dependencies,
   publication digests, install coordinates and ambiguity refusal. Do not
   widen the View or resolve the child as a new caller-selected root.
4. Join the requested child's admitted basis and actual parent CCall/scope
   chain to that root. Program, invocation, Catalog/View, WorkspaceBinding,
   implementation-set and GraphFunction identities agree at each inherited
   boundary. Use existing basis/open-call/CCall owners and their historical
   prefix semantics. A parent that is closed now is checked at its actual
   child-admission frontier where required, not falsely required to remain
   active today. This reconstruction authorizes no new child or continuation.
5. Select the child's sole declared output contract through the existing
   exact contract-owner selection over the reconstructed closure. Its ref
   agrees with the child GraphFunction, admitted child basis's result
   contract, exact child closure contract and selected terminal result.
   Its declaration digest is `sha256Canonical` of that exact declaration,
   under its unique historical publication/install owner—not the root output
   digest, a URI hash, today's declaration or a hash of the result value.
   Preserve section 3's independent result/value/judgment/route/closure joins.

The resource is immutable declaration evidence throughout. Catalog admission
here is the existing pure reconstruction, not a Catalog runtime event.
No new event, store, resolver authority, controller, historical importer or
filesystem discovery path is introduced. Fresh processes need the retained
event resource and explicitly supplied immutable proof bytes; they do not
need today's source/app/declaration files. An unavailable or unauthenticated
required input refuses; no ambient fallback fills it.

### 7.3 Reuse and exact later source cone

Section 6's seven production paths remain the base. The proof field, its native
packet carry and verification call belong to its existing
`abg/project_read_definition_bindings.ts` and `abg/project_read_ports.ts`;
the new `abg/terminal_result_contracts.ts` may also own the closed proof
wrapper/type. There are exactly three additional owning paths:

- `product/declaration_closure.ts`: host the shared pure Catalog/View versus
  already-projected native environment/candidate verification extracted from
  `validator/conformance_definition_bindings.ts:258–304`, delegating to
  existing Product admission/narrowing/closure owners. Also expose the exact
  contract-from-resolved-closure selector extracted from
  `product/execution_resolution.ts:634–661`. It returns one declaration and
  its owner or refusal; it does not search a wider Catalog or load a module.
- `validator/conformance_definition_bindings.ts`: delegate that common
  verification; keep its exact supplied artifact-truth equality, complete
  declared-inventory equality, Program closure and publication checks.
  Conformance's Program scope is not replaced by execution scope.
- `product/execution_resolution.ts`: delegate its existing exact contract
  selection to the same Product helper without changing execution resolution,
  install verification, Program validation or implementation loading.

This is extraction and reuse, not a second reconstruction beside the old
functions. ABG obtains native facts; Product checks declaration meaning and
ownership; the projector joins them. The Product helper cannot authenticate
arbitrary caller environment objects: only the existing native projection
path supplies those facts at each consuming boundary. No new ABG admission
law or effectful execution-resolution call is needed for a read. Necessary
native exports/schema generation remain within section 6; any further owning
path requires explicit re-entry before editing.

### 7.4 Additional discriminators and limits

Retain every section 6 proof obligation. Add these exact discriminators:

- Root Hello start plus two fresh supported Run result/replay reads succeed
  without a declaration proof and expose the admitted root contract digest.
- An actually admitted nested GraphCall with an output contract different
  from its root returns its own typed result/contract through both supported
  GraphCall reads using the retained exact proof. Root and child remain
  distinct; child closure does not complete a held parent. A root-equal
  contract fixture alone cannot prove this relation.
- Missing proof, foreign binding/install, wrong or missing publication,
  crossed Program/child/parent basis, equal contract URI with different
  declaration digest, a future-not-historical owner, and two admissible
  owners—including equal-valued declarations—refuse. Do not deduplicate,
  select first/last, broaden membership or replace a missing owner.
- The same prefix/proof succeeds in a fresh process without today's source,
  app or declaration workspace. Reads leave the exact event prefix/store and
  close handoff unchanged. Changed proof bytes are checked again; earlier
  successful validation or a fixture cache grants no authority.
- Shared-helper tests preserve existing conformance inventory/Program and
  Product execution contract selection, including borrowed declarations,
  absent dependencies and crossed owners. Resource-arm tests preserve every
  unrelated read and the old root resource shape.

These are prospective proof obligations, not performed tests or native
qualification. The retained twenty-event Hello remains bounded R1–R9 evidence;
R10/full S01, other fixed16 outcomes, D1/D2/F11 integration, semantic UAT and
release acceptance remain unclaimed. This amendment returns for independent
review and Executive disposition before any implementation.


## 2026-09-24 selected Run historical-source resource

Under T-287 GOAL-035 and GLC T-043, Executive selected consumer carrier
`design-01` subject `3820023c04f37d3ce5bf572591f8a9e1f4982d19ec7fce79cfa7a74ef3f14bdd`
as `design_reframe`. The current fifteen-family Product and Public membership
are unchanged. This selection uses STDO 2.5.1 RC1 and the project End-to-End
Interface Integration frame with Owner, Conservation, Reuse and Code Construction.
Source readiness does not establish installed proof or authorize a new Run.

Existing Product.Run resources may carry one optional `historicalSource`:
`{kind, schemaVersion, terminal, input:{graphFunctionRef,contractRef}, declarationProof}`.
`terminal` is the stable typed terminal selection without `value` or
`projectionBasis`. The complete resource remains under raw DefinitionCall and
exact Run resource admission before effects. It is separate from semantic input,
current Catalog/View, and the closed-Run `admitted_source_result` relation.
A closed historical child under an incomplete Run is a lawful R10 source; no
new lifecycle authority or forced close of the old Run follows.

The Run binding passes the exact resource through its existing leaf port. The
nonserialized native judgment proof operation `historicalGraphCallSource()` uses
HoG's current durable prefix and the same R10 terminal/ancestry/declaration joins.
R10 returns the terminal, one exact selected ancestor raw input, and that
ancestor's historical publication by reference. Its ancestor selector must occur
exactly once in the authenticated basis chain; its one declared input contract
must match the requested contract in the admitted root declaration closure.
There is no consumer-name switch, Public member, event, catalog registry or
alternative history reader. The consumer retains its own meaning comparisons.

R10 retains this immutable projection through `runtimePrefixComputation`, keyed
by the actual resource object. The entry is usable only at or after the complete
prefix used for authentication; an earlier cut cannot borrow later evidence.
The resource and borrowed values are immutable data. Caller IDs, equal copies,
or frozen lookalikes never acquire a source proof from equality. Raw/cold copies
and closed owners reconstruct through the existing durable prefix and historical
declaration owners. No historical input or publication is serialized into the
successor basis merely to transfer an already owned result. No journal records
are removed or rewritten. Current native effect/capability/independence checks
remain outside this historical read relation with their existing owners.
