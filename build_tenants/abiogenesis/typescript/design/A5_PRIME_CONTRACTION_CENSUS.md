# ABIogenesis 5.0 Prime Contraction Census

**Status**: F_H-authorized implementation baseline; independent closure review pending

**Owner**: T-277

**Baseline commit**: `d018272f8fb729057aad170aca52b0ad8ac30662`

**Governing design**:
[ADR-044](./adrs/ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md)

**Product scope**: current TypeScript ABIogenesis 5.0 retained product,
`A5-F01..A5-F17`

## Census Law

This census counts semantic identity, authority, authorship, and generated
projection separately. It does not use file count or type count as a proxy for
architectural quality.

A row is confirmed only when the live source shows either duplicate authority,
duplicate authorship, an unjustified promoted payload, or a repeated
authority-neutral pattern. Suspected similarities that preserve distinct
admission, lifecycle, effect, or replay meaning are retained.

Historical Python, retired work, 4.6 support-line work, and 5.0.1 dogfood are
outside the baseline unless current 5.0 imports them.

## Method Baseline

The completed-code design register links 23 design or guardrail documents:

| Evidence in linked documents | Current count |
|---|---:|
| Mentions IACS or Irreducible Architectural Carrier Set | 14 |
| Mentions Promotion Test | 2 |
| Records recurrence/commonization review | 0 |
| Contains a textual before/after authority-count pattern | 5 |

The standing Mermaid gate validates registration, exactly three ordered view
types, and rendering. It does not currently validate Prime substance,
Promotion Tests, recurrence, authority counts, or commonization ownership.

This explains the observed failure mode: local carrier discipline existed,
but no cross-ticket contraction pass joined the designs.

## Retained-Feature Coverage

| Feature | Prime assessment | Candidate rows |
|---|---|---|
| `A5-F01` product/install/workspace/catalog foundation | Product, install, workspace, lock, and admitted catalog identities remain distinct Prime boundaries. Generated manifests are projections, not duplicate authority. | None |
| `A5-F02` GTL declaration/admission/compiler | Language declarations, raw admission, serialization, publication, and compilation remain distinct boundaries. Do not collapse them into one parser/controller. | None |
| `A5-F03` seven-term C/runtime spine | The seven C constructors and retained runtime atoms are semantically distinct and must remain composable. Reuse existing execution and retry authorities. | `PC-007` |
| `A5-F04` instruction and F_P admission | Existing declared execution, instruction, result-admission, and attribution carriers remain separate by authority. No concrete duplicate source is added by this census. | `PC-007` |
| `A5-F05` public contracts and capabilities | Public identities remain exact; realization registries, capability declarations, and publication projectors need contraction. | `PC-004`, `PC-005`, `PC-006`, `PC-012` |
| `A5-F06` SDK and CLI | SDK behavior remains authoritative and CLI remains a projection. Identity, command, workspace, invocation, and dispatch rosters are fragmented. | `PC-004`, `PC-005` |
| `A5-F07` interactive operator loop | Start, held interaction, response, resume, and continuation are distinct states over one admitted execution basis. Consume existing carriers; do not invent a session controller. | `PC-007` |
| `A5-F08` Consensus | Public identity multiplicity is lawful. Contract authorship, legacy catalog declaration, internal open carriers, and scenario shape require contraction. | `PC-001`, `PC-002`, `PC-003`, `PC-008` |
| `A5-F09` graph/node/overlay public semantics | Callable and applicable kinds remain distinct. Their operation publication consumes the common operation definition source. | `PC-004` |
| `A5-F10` event/replay/runtime truth | Event, result, replay, correction, continuation, and failure carriers have independent lifecycle meaning. Retain them. | None |
| `A5-F11` self-conformance | Claims remain distinct; capability declarations and qualification journeys should derive from common sources. | `PC-006`, `PC-009` |
| `A5-F12` observer/tuner | Draft, report, proposal, and F_H disposition remain separate operations over one operation register and proof topology. | `PC-004`, `PC-009` |
| `A5-F13` host compatibility | Native contract remains authoritative. The one Codex projection consumes the operation registry and must not add a controller. | `PC-004` |
| `A5-F14` packed candidate/live proof | Product scenarios may share one parameterized installed driver while preserving distinct evidence records. | `PC-008`, `PC-009` |
| `A5-F15` qualification | One read model may aggregate owning proofs; it may not fabricate or replace them. Prime design enforcement is missing. | `PC-009`, `PC-011` |
| `A5-F16` release | Git ref, artifact, manifest, checksum, and install identities remain distinct evidence over one release cut. Shared proof traversal is a candidate, not merged truth. | `PC-009` |
| `A5-F17` downstream compatibility | One parameterized source-blind fixture may exercise several workspaces/products without changing their identities. | `PC-008`, `PC-009` |

## Candidate Register

### PC-001 - Consensus contract-family authorship

- **Evidence**: `REQ-P-CONSENSUS-004` requires nine independently addressable
  schemas and `REQ-P-CONSENSUS-007..008` require two vocabularies. T-274 has no
  accepted realization yet.
- **Finding**: independent public identity does not require nine authoring
  models, decoders, generators, or enum rosters.
- **Proposed disposition**: `derive_projection`.
- **Target**: one closed `ConsensusContractFamily`; one schema document with
  nine closed addressable projections; two vocabularies derived from the same
  native enum sources; nine catalog identities and projection digests remain.
  The local design must distinguish the shared schema-asset digest from each
  embedded resource/projection digest and prove that the existing locator can
  address the embedded schema identity without path ambiguity.
- **Owner**: T-274 publication; T-275 consumes the same native family.
- **Negative proof**: every cross-projection substitution fails, especially
  findings/rulings, round-outcome/final-result, and result/ticket-projection.
- **Accepted design**:
  `M02_M04_CONSENSUS_PUBLICATION_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md`.
- **Implementation status**: one strict Valibot-authored native family now
  derives native types, admission, nine public projection definitions, and
  both vocabularies. The rejected first pass duplicated field rosters between
  types and decoders; that duplicate model did not enter a checkpoint.
  Feature-complete T-274 asset publication remains separately gated.

### PC-002 - Rival Consensus catalog declaration

- **Evidence**:
  `code/src/abg/m03/contracts/consensus_gtl_body.ts` constructs the canonical
  T-252 Module and GraphFunction, while
  `code/src/abg/m03/contracts/review_consensus_modules.ts` separately authors
  `ABG_CONSENSUS_MODULE_DECLARATIONS` for the same callable identity. The
  legacy declaration names round outcome as its target while the canonical
  outer GraphFunction outputs `ConsensusResult`, demonstrating present drift.
- **Finding**: two maintained declarations can disagree on module version,
  source/target contracts, policy, provenance, and body identity.
- **Proposed disposition**: `retire_duplicate`.
- **Target**: admit the T-252 Module once and derive the SYSTEM catalog row
  from that exact admitted Module and outer GraphFunction. Preserve generic
  Review declarations only where they remain separately required.
- **Owner**: T-274.
- **Measure**: Consensus callable declaration sources `2 -> 1`.
- **Negative proof**: removing the canonical Module makes publication fail;
  the legacy declaration cannot reconstruct it.
- **Accepted design**:
  `M02_M04_CONSENSUS_PUBLICATION_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md`.
- **Implementation status**: realized. The compatibility declaration is now a
  projection of the exact admitted T-252 Module and outer GraphFunction. The
  canonical serialized body digest remains
  `sha256:e1344106d4e90c8883f72c6e1490742b98a839433b89855315fec4b571ca8695`.

### PC-003 - Open internal Consensus carrier aliases

- **Evidence**: `consensus_gtl_body.ts` defines 14 named aliases over
  `ConsensusCarrier<Kind>` whose semantic payload is
  `Readonly<Record<string, unknown>>`.
- **Finding**: the aliases distinguish graph loci but do not close domain
  meaning. They risk becoming 14 peer authoring models or remaining typed
  envelopes over open payload truth.
- **Proposed disposition**: `migrate_authority`.
- **Target**: T-275 declares one closed discriminated internal Consensus
  domain family. Public members project through PC-001; graph-only bindings
  remain private subordinate variants. No extra public schema identity is
  created for an internal locus.
- **Owner**: T-275, with T-274 family dependency.
- **Negative proof**: unknown fields, wrong variant payloads, and public use of
  private locus variants fail admission or compilation.
- **Accepted design**:
  `M03_CONSENSUS_DOMAIN_FAMILY_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md`.
- **Implementation status**: realized. The 14 open aliases and permissive
  `fields` payload are absent. Twenty exact public and graph-private variants
  share one schema map and one recursive freeze/admission mechanism; no
  graph-private variant is added to the package export surface.

### PC-004 - Public operation realization rosters

- **Evidence**: constitutional truth lists 36 operation identities; the
  current realization covers 19. Those 19 are repeated through
  `DS1_PUBLIC_OPERATION_IDS`, `DS1_OPERATIONS`, CLI command resolution,
  workspace classification, invocation construction, the operation-slug
  table, and SDK invocation dispatch.
- **Finding**: the operation contract register already owns most metadata, but
  identity and adapter projections are rebuilt in several places. Adding the
  remaining 17 operations would multiply switch and roster toil.
- **Proposed disposition**: `migrate_authority`.
- **Target**: one typed public-operation definition register owns identity,
  contract symbols, command path, workspace policy, defaults, domains,
  authority/effect/event classes, and dispositions. A typed behavior table
  owns operation-specific SDK/context execution. IDs, CLI grammar,
  workspace classification, invocation admission, schema definitions, and
  publication rows derive from those two lawful sources.
- **Proportionality stop**: do not force a generic dispatch abstraction if it
  requires unchecked casts or transfers operation behavior into a mega-handler.
  In that case, contract/CLI metadata still derives from one register while
  explicit typed domain handlers remain and an exact key-parity gate proves
  coverage.
- **Owner**: T-277 migrates the existing 19 without behavior change; the
  singular DS-5 F05/F06 owner extends the same register to 36.
- **Measure**: realization roster/branch surfaces `7 -> 2`; public
  operation identities remain `36`.
- **Negative proof**: missing, duplicate, or extra definition/handler keys fail
  the exact census; CLI and SDK outcomes remain equal per operation.
- **Implementation status**: realized at `b3cd1003` for the current 19
  operations. Identity, CLI coordinates, workspace policy, and invocation
  construction derive from the definition register. The explicit typed SDK
  effect dispatch remains the second lawful surface; exact branch coverage is
  gated. Independent closure review remains pending.

### PC-005 - Public schema-definition projection recurrence

- **Evidence**:
  `generate_public_contract_schemas.mjs` and
  `publish_abg_product_contracts.mjs` independently derive the same operation
  schema IDs, slugs, and paths from the operation register.
- **Finding**: this is authority-neutral recurrence across two publication
  tools.
- **Proposed disposition**: `commonize_tenant`.
- **Target**: one tenant-local schema-definition projector consumed by both
  generation and publication. It owns no contract meaning beyond deterministic
  projection of PC-004.
- **Owner**: T-277.
- **Measure**: operation schema-definition algorithms `2 -> 1`.
- **Negative proof**: generator and publisher cannot accept different path or
  contract-ID projections for the same operation register.
- **Implementation status**: realized at `b3cd1003`. Generation and publication
  consume `project_public_operation_schemas.mjs`; 57 projection identities and
  paths remain unchanged. Independent closure review remains pending.

### PC-006 - Capability declaration graph

- **Evidence**: requirements name 16 mandatory 5.0 capability identities. The
  current `DS1_CAPABILITY_CONTRACT_REGISTER` already generates eight
  capability assets and catalog rows, and product verification derives its
  capability ID and required-contract projections from the same register.
  Seven current identities overlap the required roster;
  `abg.capability.fh.interact@5` is outside it. The tenant-conformance manifest
  publication is not yet authored.
- **Finding**: the suspected current duplicate authoring graph does not exist.
  The risk is prospective: T-268 could author manifest claims, dependency
  edges, and effect bindings as a second roster instead of extending the
  existing register.
- **Proposed disposition**: `consume_existing`.
- **Target**: extend the closed capability declaration register so its direct
  projectors also supply tenant-manifest claims, dependency edges, effect
  bindings, and exact coverage projections. M04 admission remains a separate
  boundary and T-255 remains the coverage evaluator.
- **Proportionality stop**: the graph is a closed typed data register plus
  direct deterministic projectors, not a new capability engine, DSL, plugin
  framework, or runtime registry.
- **Owner**: T-268 establishes Consensus coverage over the common graph; the
  DS-5 F05 owner completes the 16-row release roster.
- **Measure**: capability authoring graphs remain `1 -> 1`; projected asset,
  catalog, manifest, effect, and coverage rosters grow without becoming
  authoring sources. Public capability identities remain `16` unless
  requirements are repriced.
- **Stop**: the extra F_H identity must map lawfully to a retained required
  capability or enter requirement reprice; it cannot silently enlarge the
  exact roster.
- **Negative proof**: missing dependency, duplicate identity, unsupported
  effect, stale catalog basis, or manifest/asset divergence fails before
  affected execution.
- **Accepted prospective design**:
  `M02_M04_CAPABILITY_DECLARATION_GRAPH_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md`.
- **Implementation status**: no new commonization code is justified. The
  existing register is confirmed as the Prime carrier; T-268 must extend and
  consume it when capability publication begins.

### PC-007 - Runtime execution and continuation basis

- **Evidence**: T-270 and T-272 both need exact selected catalog, execution,
  frame, C-call, and continuation truth. ADR-043 already establishes
  `ExecutionBasis` and `AdvancementTransition`; existing continuation carriers
  own held/resumed runtime identity.
- **Finding**: the recurrence is real, but a new session carrier or merged
  router would duplicate existing Prime authority.
- **Proposed disposition**: `consume_existing`.
- **Target**: T-270 and T-272 consume the admitted execution basis and exact
  continuation carriers through separate local designs. Catalog start and F_H
  response remain separate semantic transitions.
- **Owner**: T-270 and T-272.
- **Accepted implementation designs**:
  `M03_M04_PUBLIC_CATALOG_INVOCATION_AUTHORITY_BEHAVIOR_DESIGN.md` and
  `M03_M04_FH_RUNTIME_CONTINUATION_BEHAVIOR_DESIGN.md`.
- **Measure**: public-route caller-supplied execution authority fields `3 ->
  0`; active F_H opening producers `2 -> 1`; public start/resume routes remain
  `2 -> 2`; execution-basis and continuation authority families do not grow.
- **Negative proof**: neither route accepts caller-authored or reconstructed
  execution, frame, C-call, interaction, or continuation identity.

### PC-008 - Installed scenario factorization

- **Evidence**: Consensus requires three outcome families and three workspace
  applications. `REQ-P-CONSENSUS-013` explicitly states that workspace roots
  are three applications of one contract, not three runtime modes.
- **Finding**: a nine-case Cartesian implementation is not required to prove
  both dimensions. A duplicated implementation would repeat installation,
  invocation, and evidence traversal, but the exact execution count remains a
  qualification-design decision.
- **Proposed disposition**: `commonize_tenant`.
- **Target**: one source-blind parameterized installed scenario driver. The
  proof design may use three paired primary runs only if it independently
  proves workspace-application invariance; otherwise it runs the full nine
  combinations through the same driver. Parameterized malformed-input lanes
  retain typed negative evidence. Each run keeps its own archive and basis.
- **Owner**: T-276.
- **Measure**: potential orchestration implementations `9 -> 1`; evidence
  executions remain `3..9` as required by the accepted qualification design.
- **Negative proof**: no workspace or outcome branch imports source, invokes a
  worker directly, emits events, constructs continuation, or mutates tickets.

### PC-009 - Qualification proof journeys

- **Evidence**: T-244 retains 17 independently closeable feature rows whose
  proof surfaces share product/install/catalog, runtime/operator, Consensus,
  conformance, and release traversal.
- **Finding**: claims must remain distinct, but repeated setup and evidence
  acquisition are a likely commonization candidate.
- **Proposed disposition**: `commonize_tenant`, provisional until T-247 design
  measures current proof producers and consumers.
- **Target hypothesis**: approximately five parameterized proof journeys:
  product/install/catalog; declared runtime/operator; Consensus;
  self-conformance/observer/adapter; release identity. One qualification read
  model cites owning proof; it does not recompute or fabricate verdicts.
- **Owner**: backlog T-247 and T-248 when activated.
- **Stop**: no numeric target is binding until those tickets inventory the
  actual proof graph. Claim identity and row-specific closure gates remain 17.

### PC-010 - Digest and canonicalization helpers

- **Evidence**: runtime identity hashing and public I-JSON/schema
  canonicalization have similar SHA-256 mechanics but different admitted
  bases and callers.
- **Finding**: similarity is mechanical, not enough to prove one semantic
  boundary.
- **Proposed disposition**: `not_a_candidate` for this wave.
- **Target**: retain separate semantic helpers. Authority-neutral byte hashing
  may be reconsidered only after an exact basis/encoding audit.
- **Reason**: merging by algorithm name could silently change identity.

### PC-011 - Prime design enforcement

- **Evidence**: 23 registered linked documents, 14 IACS mentions, two
  Promotion Test mentions, zero recurrence reviews; the current gate checks
  Mermaid structure and rendering only.
- **Finding**: the project can repeatedly claim local Prime design without
  proving cross-boundary contraction.
- **Proposed disposition**: `commonize_tenant`.
- **Target**: one prospective tenant gate over T-277 rows and later designs,
  backed by negative fixtures. Update the local pre-code template to require
  IACS, Promotion Test, recurrence, counts, disposition, and owner.
- **Owner**: T-277.
- **Measure**: substantive automated Prime gates `0 -> 1`.
- **Negative proof**: annotation-only Prime, duplicate authoring source,
  missing recurrence disposition, missing count, or unreviewed acceptance is
  rejected.
- **Implementation status**: realized at `be287765`. The standing aggregate
  gate now covers 23 rendered designs and seven T-277-governed tickets; seven
  focused Prime negatives pass. Independent closure review remains pending.

### PC-012 - Generated operation schema multiplicity

- **Evidence**: the current 19 operations generate 57 request/result/refusal
  schema files. The full roster would generate 108 under the same shape.
- **Finding**: these are generated, independently addressable projections, not
  57 authoring models.
- **Proposed disposition**: `retain_prime` as outputs; consume PC-005 for one
  projector.
- **Reason**: reducing files alone would require locator/fragments migration
  without reducing authoring toil. Re-enter only if packaging, lookup, or
  consumer evidence shows material cost.

### PC-013 - Completed-code design register

- **Evidence**: the register is an explicit retrospective read model over
  ticket and design authority. The gate already compares accepted DS designs
  against it.
- **Finding**: it is derived governance evidence, not a rival product truth
  source.
- **Proposed disposition**: `retain_prime` for the 5.0 line.
- **Constraint**: status claims must remain derivable and stale references
  must fail governance checks.

## Before-And-After Measures

| Surface | Baseline | Accepted target |
|---|---:|---:|
| Consensus callable declaration sources | 2 | 1 |
| Consensus public contract authoring families | not yet implemented | 1 for 9 schema and 2 vocabulary projections |
| Public operation identities | 36 | 36 |
| Current operation realization roster/branch surfaces | 7 | 2 |
| Operation schema-definition algorithms | 2 | 1 |
| Mandatory capability identities | 16 | 16 |
| Capability authoring graphs | 1 current register | 1 extended register |
| Consensus primary workspace/outcome executions | potential Cartesian 9 | 3..9, set by accepted proof of workspace invariance |
| Consensus scenario orchestration implementations | potential 9 | 1 |
| Substantive automated Prime gates | 0 | 1 |
| T-244 retained claim identities | 17 | 17 |

Targets describe architecture, not closure claims. Final counts must be
recomputed from the migrated tree.

## Dependency Order

1. Accept ADR-044 and this baseline.
2. Implement PC-011 first so later designs cannot repeat the omission.
3. Implement PC-004 and PC-005 before adding the remaining 17 operations.
4. Apply PC-007 while T-270 and T-272 designs are still open.
5. Apply PC-001 through PC-003 before T-274/T-275 code.
6. Apply PC-006 before T-268 publishes canonical manifest coverage.
7. Apply PC-008 before T-276 scenario code.
8. Re-measure PC-009 when T-247/T-248 activate.
9. Run the final source-removal, mixed-state, parity, and holistic review.

T-267 is not reopened by this census. Its current independent review remains
the runtime gate. Re-entry is allowed only if a concrete row demonstrates a
reachable duplicate authority in that boundary.

## Acceptance

This census is not self-ratifying. Independent review must verify each
evidence path, the distinction between identity and authorship, the
proportionality of each target, and the assignment to existing semantic
owners. The accepted version becomes T-277's migration ledger; rejected or
unproven rows must be repaired or marked `not_a_candidate` before code.
