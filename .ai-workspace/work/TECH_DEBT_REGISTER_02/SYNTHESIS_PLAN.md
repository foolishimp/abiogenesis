# Synthesis plan for the register's second edition

Executive ruling document (Claude Fable 5.2, 2026-11-12). It tells the Writer how the candidate entries in `findings/` become entries TD-25 onward of `.ai-workspace/TECHNICAL_DEBT_REGISTER.md`. Sources are named as `area: local label or title`. `findings/INDEX.md` lists every candidate.

## Rules of consolidation

1. One register entry names one owner or one decision, and everything it absorbs. The same residue reported by four areas is one entry.
2. Evidence keeps the reviewers' file and line references and says how each fact was established (census, read, measured, or a command). Where two reviewers disagree, read the code and state the result.
3. Apply `findings/REFUTATION.md` when it exists: drop what it refutes, narrow what it narrows, and say in the entry that the claim survived or was narrowed.
4. Size is S, M or L as in the first edition, with approximate lines removed or moved. Count each line once across the register; give a total at the end, split into "removable now", "removable after an owner decision" and "moved, not removed".
5. Every entry states its risk class: none; replay digests of recorded Runs; Public contract; manifest or digest pins; qualification mirrors.
6. Status vocabulary: the first edition's six (Open, In flight, Conditional, Investigate, Revalidate, Closed) plus **Decision**: an owner decision selects between named outcomes and nothing is retired until it is made. A Decision entry states the outcomes, the Executive's recommendation and the precedent it rests on.
7. Present tense, plain sentences, no counts as findings. The register is an index over debt, not an execution plan.

## A boundary that applies to almost every entry

Editing any exported declaration changes emitted `.d.ts` text, and the generated manifest digests declaration files (`scripts/generate-product-manifest.mjs:610`; product-install surprises; hog-shared-bindings "48 contract rows"). So nearly every removal moves manifest and digest pins, and tests pin those digests. State this once in the register's method section. Entries then say "manifest or digest pins" without repeating the mechanism. The wave refreshes pins per package and cuts once at the end.

## Entries

### A. Failed, unfinished or superseded features

**TD-25. Human response and resume ship in 5.0 source without a producer.** Status Decision.
Sources: abg-calls E1, E10; abg-traversal AT-01; hog-shared-bindings "Retire the F_H interaction-resume route residue"; product-run 1; product-install E3; design-spec-repo E5; implementation-public "Nine declared Public members have no binding" (the five `interaction.respond` members and the missing `INTERACTION_DEFINITION_BINDINGS` export).
Ruling to record: the Product reserves native response and resume to 5.1 ("In 5.0, a required human response yields a truthful blocked handoff"). The hold and the blocked handoff stay. The readers of a resume that nothing produces, the response admission that nothing calls, and the required provider member that nothing invokes are residue and are retired by realization_refactor. Keep the declared event kinds and their generated schema until 5.1 is authored (abg-traversal AT-01 gives the reason). Decision for the owner, because it is Public contract: withdraw the five `interaction.respond` members from the 5.0 surface, or keep them as declared members that always refuse. Recommendation: withdraw. Precedent: the Product's own reservation; "always remove tech debt".

**TD-26. Standalone Consensus and the One Surface loop.** Status Decision.
Sources: gtl-validator GV-02; design-spec-repo E1; abg-traversal AT-04, AT-03; product-install E2; implementation-public "Consensus surface in this area waits on the owner's A5-F07 decision"; product-run 14; `rc12-executive-01/O1_TRACE.md`; ledger rows C, CB, O1.
Facts to state: the owner has ruled Consensus superseded by the Executive. The shipped standard system program is the Consensus One Surface program; no test starts it at runtime; outside test output no recorded Run admits `construction_intent_selected` or `construction_delta_observed`. The prepared retirement (`claude/rc12-consensus`) changes no file under `code/src/abg`, so it would leave about 2,100 lines of One Surface carriers in the route code, plus the validator's eight-locus law and about 1,150 lines of One Surface GTL.
Decision for the owner, two outcomes:
(a) Keep One Surface and wrap the Executive in it (O1 option b): about 0.6 to 0.9k new lines, no Product sentence changed, two selection mechanisms remain (registered selection inside, construction intent outside), and the ABG carriers stay.
(b) Make the Executive the standard system program, reprice `A5-F07`, and retire One Surface with Consensus: removes the GTL One Surface, the ABG carriers and the validator law as well, and leaves one selection mechanism.
Recommendation: (b). The Executive's first recommendation, on the trace alone, was (a); the area reviews changed it. Precedent: the owner's direction to consolidate and remove failed and redundant features; "consensus has been replaced by executive". Independent review 4 established that repricing a selected feature is the owner's own decision.

**TD-27. The `gate` relation is constructed, serialized and validated, and nothing executes it.** Status Decision.
Sources: gtl-validator GV-01; hog-shared-bindings "Settle whether the gate relation has runtime meaning"; abg-traversal lead 2.
Outcomes: implement it (ABG evaluates the gate rule before continuation past its target) or retire it and reprice `REQ-L-GTL3-HOF-003`. Recommendation: retire in this wave. Note for the next feature wave: RC12's process prerequisites are an opaque policy string that the validator never reads (RC12 review 3, finding F2-4); a first-class relation is where that law belongs, and it should be authored then from its own requirement.

**TD-28. Capabilities that no shipped composition uses.** Status Decision.
Sources: product-run 12, 5, 11; abg-workers "Choose the carrier for A5-F17", "Decide GC03 governed context", "Close the witness gap"; implementation-public "Nine declared Public members have no binding" (the four witness acts), "Published adapter metadata that nothing executes", "`abg.codex` is a pass-through second CLI"; product-install "Release snapshot: required, never run for a 5.x cut".
One table in the entry: each capability (worksite construction, branch construction, command execution, command forward, revision, construction recovery, preparation; semantic job, stage, revision; native registered-selection task; result assessment; governed context with its Python adapter; the four unbound witness acts; release snapshot; the second CLI), what invokes it at runtime, what it costs to keep (modules, contracts, tests), and the reviewer's verdict. Decision: for each, supported building block of 5.0 or residue. Recommendation: keep what the default library and the bound Public surface use; for each of the rest the owner either names the consumer or it is retired from 5.0. No recommendation is made per capability where the reviewers marked "investigate".

**TD-29. Qualification and self-conformance have never completed a run.** Status Decision.
Sources: design-spec-repo E2, E3; gtl-validator GV-13; abg-workers "Agent profiles the actor runtime cannot dispatch".
Facts: `A5-F11` and `A5-F15` have produced no judgment; the rule catalog requires 2,116 paid judgments, 1,643 of them from requirement files whose text is lineage, not present-tense law; the qualification rules declare a peer assessor of another model family that the actor runtime cannot dispatch (only the Claude transport is built). Precedent: on 2026-10-29 the owner chose repair over deferral for this gate. So the recommendation is to keep the gate and discharge what makes it unrunnable: requirement text in present tense (TD in section G), assessor dispatch from the worker binding, rule granularity. The decision left to the owner is the budget and the granularity.

**TD-30. The legacy run request family and the unfinished gap re-entry start.** Status Open.
Sources: abg-traversal AT-06; product-run 3.

**TD-31. The STDO-only environment evidence and the old run-environment shape.** Status Open.
Sources: abg-traversal AT-07; product-install E1; gtl-validator GV-04.

**TD-32. Event profile residue.** Status Open, one part Decision.
Sources: abg-events E2; abg-workers "Retire the L-profile writer branches once L stores must reprice before appending"; abg-workers "Remove the never-produced runtime failure stage `c_call_open`".

**TD-33. Milestone-named Public export subpaths, npm scripts and a ticket-named key.** Status Decision (naming is Public contract).
Sources: abg-events E8; design-spec-repo E9; implementation-public "Milestone-named contract barrels `app/m04` and `qualification/m05`"; gtl-validator check 5 (m01, m02 and requirements are manifest locators, so they are live and only their names are debt).
Recommendation: rename by owner with aliases kept for one cut.

### B. One owner per rule

**TD-34. The run invocation owner restates the GTL schema family, and the copy has drifted.** Status Open. Carries defects (missing minimum-length rules).
Sources: gtl-validator GV-03; hog-shared-bindings "Consolidate run_invocation's restated GTL schemas…", "Split run_invocation and the two longest HoG functions…"; product-run 9; implementation-public "One schema source for the invocation contract and one authority-slot list"; hog-shared-bindings "Consolidate the shared Public contract vocabulary and drop its residue".

**TD-35. Start law has two owners, and a `graph_function` start bypasses root mode.** Status Open; likely defect; one sentence of the fix needs the owner (refuse, or record `direct`).
Sources: abg-traversal AT-05; product-run 2.

**TD-36. Workspace-binding identity and the admitted-row check are copied and have diverged.** Status Open. Carries a correctness risk (the weaker copy still guards native work and semantic revision).
Sources: product-run 4; product-install SO-A.

**TD-37. Worksite filesystem and authority rules are written two or three times.** Status Open. Carries a correctness risk (the path confinement copies disagree).
Sources: implementation-public "Worksite path confinement…", "The command helper restates the launch identity rules…", "Installed-tree inventory: one walker…", "Worksite leaf authority: one currentness gate…".

**TD-38. Product law inside ABG and HoG.** Status Open, design_reframe.
Sources: abg-traversal AT-14; abg-calls E8; hog-shared-bindings "Move product-specific leaf dispatch out of hog/ccall_lifecycle"; implementation-public "Leaf invocation port: features are branches inside one closure"; gtl-validator GV-08.

**TD-39. Route targets and other relations are derived again by HoG, ABG admission, cursor ancestry and replay.** Status Open.
Sources: abg-traversal AT-02, AT-13, AT-15; hog-shared-bindings "Stop HoG re-deriving values ABG already established…", "Give ABG the projections HoG builds from raw event envelopes", "Read the no-action disposition set and the graph-span projection from ABG".

**TD-40. The Public operation layer: outcome schemas, call admission and the read ports.** Status Open, one part Decision.
Sources: implementation-public "Make the published outcome schemas describe what the transport returns", "One owner for DefinitionCall admission", "Public members that nothing executes"; abg-events E4 (the routing part), E11; product-run 6, 7; product-install ST-A, ST-B; abg-events E7.
The decision part: the published outcome schemas do not describe what the transport returns. Either the schema follows the transport or the transport produces the published envelope.

**TD-41. Worker outcome classification and the three timeouts behind one setting.** Status Open, design_reframe for the profile boundary.
Sources: abg-workers "Give the worker failure classifier one set of inputs and one closed label set", "Separate the F_P actor's timeouts from the C2 command limits…"; RC12 ledger rows L, L2, H (the 60 s default).

**TD-42. Program law stated in several places.** Status Open.
Sources: gtl-validator GV-05, GV-06, GV-09; implementation-public "Implementation descriptors and leaf candidates are hand-built in every module".

**TD-43. Small second owners.** Status Open; one sweep.
Sources: abg-calls E7; abg-events E9, E12; abg-workers "Small schema and helper duplicates"; hog-shared-bindings "Keep one nonblank-string predicate", "Merge the duplicate prefix helpers in hog/operator_support", "Adopt or drop the unadopted shared Outcome atoms"; product-install SO-B, SO-C, SO-D.

### C. Dead code

**TD-44. Declarations that nothing reaches, unused locals and never-produced kinds.** Status Open; one sweep, grouped by the feature each belonged to.
Sources: abg-calls E6; abg-events E10; abg-traversal AT-10; abg-workers "Compiler-unused locals and parameters in this area", "Remove package-only wrappers whose only consumers are tests" (the two with no consumer); gtl-validator GV-11, GV-12 (the unused local only: the type error it reports is an artifact of the census program; `npm run build` on main exits 0); hog-shared-bindings "Delete HoG's dead public twins…", "Delete the orphan shared barrel", "Compiler-unused in this area"; implementation-public "Dead residue, grouped by feature", "Compiler-unused names in this area"; product-install K-A, K-B, K-C, the unused type parameter; product-run 6, 10.

**TD-45. Package exports that serve only tests.** Status Open.
Sources: abg-calls E5; abg-traversal AT-12; abg-workers "Remove package-only wrappers…" (the three with test consumers); hog-shared-bindings "Decide the public twins inside the packed declaration closure"; product-run 13 (observation-only probes inside production modules).
Ruling to record: the first edition already rules that a package barrel is not the Product contract; the manifest's declared locators are. So these move to test support or go. Observation-only counters that a proof test reads stay until one owner module holds them.

**TD-46. Functions and branches that no test executes.** Status Investigate until the coverage run reports.
Source: the whole-suite coverage run (census `coverage-*.json`). The Writer leaves a short entry stating the method and that results follow; the Executive fills it.

### D. Structure

**TD-47. `construction_continuation.ts` is more than half pasted return types.** Status Open.
Source: abg-calls E2.

**TD-48. Overload triples, repeated parameter bundles and hand-written event envelopes.** Status Open.
Sources: abg-calls E4; product-install ST-C; the structure notes of abg-traversal check 6.

**TD-49. Build-time and release code in runtime modules.** Status Open.
Sources: product-install ST-B (if not absorbed by TD-40); implementation-public "`release_publication.ts`: version-line literals and a misplaced owner".

### E. Performance

Map the entries of `findings/performance.md` here first: they are measured. Then attach the structural entries below to the measured cost each explains, and list separately those with no measurement.

**TD-50. Cold decode of the event log.** Sources: abg-events E3; measured in the RC6-to-RC7 review.
**TD-51. Reads that decode the whole log twice.** Sources: abg-events E4 (performance part), E13.
**TD-52. Product verification and install repeat their own work.** Sources: product-install PERF-A, PERF-B (Decision: what "installed verified" promises), PERF-C, PERF-D; `M_RETURN.md` (0.93 GB peak, 50 MB retained per loaded graph).
**TD-53. Owner-established values are serialized and hashed again where identity would do.** Sources: abg-traversal AT-09, AT-16; abg-events E5, E6; abg-calls E9; product-run 8; implementation-public "Per-invocation hashing of deep-frozen carriers…", "Transport still copies every serialized call…", "The Public projection payloads… are built on every process start"; hog-shared-bindings "Validate the capability definition graph once per graph…"; gtl-validator GV-07. Record the retention: `canonicalEquals` has no identity shortcut by design; the shortcut belongs at callers that hold an owner-admitted value.
**TD-54. Whole-view scans and state re-derived per route.** Sources: abg-calls E3; abg-traversal AT-08, AT-11.
**TD-55. Worker output is decoded twice and copied into the transport record.** Sources: abg-workers "Decode worker stdout once…", "Per-chunk stderr rows…".

### F. Tests

Map the entries of `findings/tests-scripts.md` here, as few entries as their owners allow. Expected: the suite as an instrument (runner, lanes by feature, the 2.5 hours, per-case installs); the fourteen tests that fail at the release base, each classified; gates that can no longer be satisfied; retired and legacy lanes; trees of unclear purpose; scripts and the cut procedure. Add: gtl-validator GV-10; implementation-public "Public members that nothing executes" (if not in TD-40); product-install "Release snapshot…" (the gating part); executive-notes E5, E6.

### G. Design and specification

**Design directory is mostly history.** Source: design-spec-repo E4. Not a Decision: the repository's method already says historical material does not belong in live design.
**Requirements are not present tense and are not traceable from code.** Source: design-spec-repo E3. Decision (requirement_reprice); it also sets the cost of TD-29.
**Derived liveness is inside the replay digest.** Source: abg-events E1; RC12 ledger rows L2, RR; executive-notes E8. Decision on when a successor profile is cut; recommendation: batch every digest-affecting correction in this register into one successor profile.
**The helper's module-export predicate runs outside its lifetime and budget.** Source: implementation-public last entry.
**A Public refusal code with no producer.** Source: product-install K-C (the `mutable_default` part).

### H. Build, release and repository

**The product's identity depends on npm's private state.** Source: executive-notes E1.
**Generated contracts, the manifest and the specification mirror are tracked, and every specification edit forces a new cut.** Sources: design-spec-repo E6; executive-notes E4.
**Release mechanics live outside the tenant.** Sources: executive-notes E5; implementation-public `release_publication.ts` (if not in TD-49).
**TD-19 (first edition, still open): tracked evidence.** Source: design-spec-repo E7. Update the existing entry in place with the new measurements and the proposed forward-only retention rule; keep its ID.
**Withdrawn tenants and residue directories.** Source: design-spec-repo E8.
**Branches, tags and unpushed history.** Source: design-spec-repo E10 and surprises (the `v5.0.0` tag selects the unqualified rc.1; main is 429 commits ahead of origin; 75 commits survive only through 25 local branch names).
**The main checkout.** Source: executive-notes E7.

## Sequence to recommend in the register

1. **Make the clean-up cheap.** Deterministic product identity; a suite that runs by one command, in lanes by feature, with one install per file where that proves the same; the coverage census kept as a tenant script; the cut procedure in the tenant.
2. **Take the decisions in one sitting.** TD-25 to TD-29, TD-33, the outcome schema part of TD-40, the successor profile, the requirements rewrite, the retention rule.
3. **Remove what the decisions release.** Largest first: Consensus and One Surface, human response and resume, the unused capabilities.
4. **One owner per rule,** starting with the three that carry defects or correctness risk: TD-34, TD-35, TD-36, TD-37.
5. **Performance,** measured costs first.
6. **Design, requirements and repository.**

## Retentions to add to "Closures and intentional retention that must not become new debt"

- The F_H hold and the blocked handoff; the declared resume event kinds until 5.1 is authored.
- `canonicalEquals` without an identity shortcut.
- The current-cursor comparison in `admitRoute` (a currentness gate; only its data source changes).
- Observation-only counters read by the reuse proofs, until one owner module holds them.
- The `stdo_environment` correspondence atom label in replay.
- `m01`, `m02` and `requirements` as manifest locators: live; only the names are debt.
- Complete recorded witnesses and digest-bound prefix projections (first edition), unchanged.
