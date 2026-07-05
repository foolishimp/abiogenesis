# DMM Self-Review: T-188 Fold-Gating + T-194 Sandbox-Gate Wave

Commentary. Post-ticket design review per DESIGN_MODULE_METHOD §11D,
evaluated against §3 (smallest sufficient module set), §3B (Authority Seam
Closure / Essential Carrier Consolidation / Enforcement After Proof),
Ingress Collapse, and §5 Prime/IACS. Counts verified against the tree at
the matrix-complete commit.

## Verdict

The LAWS this wave realized are Prime: one carrier per truth, admission
before emission, status decodable from refs, fail-closed at every gate,
enforcement landing only after differential proof. The SEAMS and PROOF
SURFACES the wave built are not yet Prime: one field family is
hand-re-declared at four layers, one 121-line producer lives inline in the
runner, and the canonical sandbox binding source now exists as two
diverging copies. Nothing found is closure-threatening; three findings are
design debt that will compound if not consolidated before the next wave
extends these surfaces.

## Findings (ranked)

### F1 — MAJOR. Startup-family seam is four hand-maintained allowlists
§3B-1 Authority Seam Closure. The engine-start passthrough family
(runtimeRegistryStartup, instructionAssemblyStartup,
requirementProofCarryThroughStartup, requirementRouteDeclarationBundle)
is independently re-declared and re-forwarded in: engine_runner.ts
(interfaces + start delegations, 5 mentions), app/m04/start_context.ts
(interface), app/m04/start.ts (2 spread sites), cli/command.ts (2
interfaces + hasOwnField parse + spread, 9 mentions). 19 mentions, 4
files, no single authority. This factory MANUFACTURED three of the wave's
seven defects (m04 drop, CLI drop, and the original T-188 P1-b) — the
seam class is empirically the top defect producer in the codebase.
SMALLEST LAWFUL FIX: one exported EngineStartPassthrough type + one
forwardEngineStartPassthrough(source) helper consumed at every seam;
plus a T-193 conformance row asserting key parity between
EngineStartRequest and each public seam (drift becomes a typed
diagnostic, not a live-run discovery).

### F2 — MAJOR. Canonical binding source duplicated across lanes
Essential Carrier Consolidation, applied to proof surfaces. The generated
runtimeBindingSource is 923 lines in the t180 lane and a diverged 1122
lines in the t194 lane. The wave already paid the two-truth cost: three
canonical repairs (proof-depth truth, evaluate-stage plans, manifests=4)
each had to be applied twice by hand. Next repair that lands in one copy
only reintroduces a silent canonical-lane regression — the exact class
this wave just spent three runs flushing out.
SMALLEST LAWFUL FIX: extract ONE binding-source builder into
test_env/sandbox/support/ parameterized by the variant object; both lanes
consume it. t194's five variant flags become the builder's typed options.

### F3 — MEDIUM. M5 producer is a 121-line inline block in the runner
§3 core rule. The carry-through producer (ledger scan + envelope
construction + coverage projection + event assembly) lives inline inside
engine_runner's accepted-payload branch. The runner is the module whose
job is sequencing and emission; derivation belongs in contracts.
Compounding: the inline ledger scan remains a second derivation of
admitted-ref truth next to derivePayloadLedgerProjection (recorded T-188
successor). SMALLEST LAWFUL FIX: extract
deriveRequirementProofCarryThroughEvents(input) into the carry-through
contracts module (pure, testable at unit level), runner emits its output;
fold the ledger-projection swap into the same extraction.

### F4 — MEDIUM. Binding variant surface is an untyped template DSL
Ingress Collapse. Five ad hoc options (stubDispatch, stubArtifactVariant,
omitInstructionAssembly, carryDepthClassRefs, registryDecoy) interpolate
into one template string via ${} conditionals. Each new negative row
grows an informal, unvalidated config language inside a string literal —
the same silent-ignore failure mode as finding F6 below, one level up.
FIX: fold into F2's extraction — a typed variant object with named
scenario constructors; unknown keys throw.

### F5 — MEDIUM (law question, handed to review). Unconstrained
same-interface duplicates select silently. Without candidate refs, the
selector picked the decoy and proceeded; with the constraint, selection
correctly failed closed (selected_candidate_not_eligible). GOAL-005 reads
"ambiguity fails closed." Either a lawful deterministic tie-break exists
(cite it) or this is a fail-open gap needing a ticket. Recorded in T-194;
not adjudicated here.

### F6 — MEDIUM (already recorded). Declarations ingress fails open.
Plain record keys spread into `declarations` are silently ignored (typed
SerializedAttrs entries only). Admission law gap: malformed authoring
input should produce a typed diagnostic, not vanish. Belongs to T-191's
undeclared-hole remainder; cost me one full live-run cycle.

### F7 — MINOR. Lane-internal inconsistencies. Row b predates
runNegativeRow and duplicates its pattern inline; one stringly probe
(JSON.stringify(event).includes("decoy-boundary-test")) where a field
assertion exists one line later; test_runs sub-instances (6 per run) have
no named retention policy (§6C: name the gap — acceptable for a proof
lane, but name it).

## IACS check on the wave's carriers (passes)

- requirement_proof_carry_through_admitted: identity deterministic
  (envelopeRef from resultRef), admission entry present, factory
  cross-validates parallel fields against digest-checked refs, one event
  kind, no rival carrier. Status is path-carried not digest-bound —
  already a named successor, not re-raised.
- Coverage truth refs: parseable, integrity-checked, status decodable by
  the fold — one truth surface consumed by two lawful readers.
- Enforcement After Proof: every gate that now blocks (depth, evaluate
  plans, ordering, boundary) landed with a differential first; the two
  canonical-lane regressions were gates correctly firing on un-migrated
  proof surfaces, not law defects.

## Sequencing recommendation

F1 and F2 before any next wave touches these surfaces (both are
one-sitting consolidations; both remove empirically-proven defect
factories). F3/F4 fold into the T-188 successor work. F5 to the external
review. F6 to T-191's remainder. F7 opportunistic.

## Fix-Wave Addendum (2026-07-05, same day)

All seven findings closed in five commits, each test-gated:
F1 one-authority passthrough (19 mentions -> 1); F3 producer extracted to
contracts; F6 declarations admission fails closed (differential);
F5 adjudicated FAIL-OPEN at the runner and FIXED — no pre-pick on
duplicate basis matches, pick law decides, with the matrix repriced to the
better law (c2a: a declared constraint lawfully RESOLVES ambiguity and
converges; c2b: unauthorized ambiguity fails closed replay-visibly);
F2/F4 one shared typed-variant binding builder (2071 duplicated lines
removed; its unknown-key validator caught its own first caller bug);
F7 minors incl. §6C retention named. Final gates: t194 matrix 1/1 (14
rows), canonical hello-world live 1/1 on the shared builder, semantic
1062/1062. The review's sequencing recommendation (F1/F2 before the next
wave) was executed same-day; the seams are now Prime alongside the laws.

## Round 2 (2026-07-06): T-190 realization + T-191 acceptance wave

Scope: everything since round 1 — armId census, latitude + calibration
carriers/rendering, gate assembly. Same lenses: duplicate surfaces, debt.

### R2-F1 — MAJOR. One law, three homes (latitude/calibration)
Essential Carrier Consolidation. The T-191 families now exist TWICE as
types and THRICE as validation:
- GtlProgramGoldenInstanceBindingRow (conformance, LAWS-023) is
  field-for-field identical to GoldenInstanceCalibrationRow
  (instruction_assembly); GtlProgramUnderdeterminedDeclarationRow ≡
  DeclaredLatitudeRow.
- The owner-route law (F_P/F_H only) lives as
  GTL_PROGRAM_UNDETERMINED_OWNER_ROUTE_VALUES in conformance, as a
  hardcoded pair in my compile validation, AND as the TS union on
  DeclaredLatitudeRow — three copies of one rule.
- The digest-required law lives as the conformance diagnostic
  (golden-instance-digest-required) and again as my compile check
  (golden_instance_calibration_invalid).
Divergence risk is live: reprice LAWS-023/-024 and the compile half
drifts silently. SMALLEST LAWFUL FIX: one shared carrier module (the
conformance rows are the ratified home — instruction_assembly imports the
row types + a shared owner-route predicate; compile validation delegates
to shared predicates; keep the two issue vocabularies but derive both
checks from one rule source). Cross-reference comments both ways.

### R2-F2 — MAJOR (pre-existing, grown by this wave). Sixteen copies of
the input-derived attached-artifact fixture. 16 test/lane files define
their own attachedArtifact/fulfilledArtifact; 44 files touch
fulfillment_assessments shapes. Every payload-admission field addition
(the selectedComposition* whack-a-mole this wave hit FOUR times) is a
16-site hunt. FIX: one exported fulfilledAttachedArtifactFor(input,
overrides) in m03-iteration-fixtures; migrate opportunistically —
new/touched files first, no mass rename.

### R2-F3 — MEDIUM. The shared fixture's option surface is fail-open.
m03-iteration-fixtures reads 88 options.* keys with zero unknown-key
validation — the exact silent-ignore class F4/F6 constitutionalized
against, in the fixture every suite trusts. A typo'd option
(consequenceFpBindng) silently no-ops and a proof goes vacuous. FIX:
KNOWN_OPTIONS set + throw, mirroring the binding builder.

### R2-F4 — MINOR. Local duplications in the t189 lane: t190PluginContract
beside stageContract (two contract helpers, one file); t194/t180 lanes
still duplicate the inherited a1/a2 assertion bodies (builders
consolidated, assertions not).

### Residuals carried (named, unchanged): armId runtime assert is dead
under TS callers; async executor twin differential; calibration
instanceSetDigest is a declared constant pending content provenance;
test_runs retention manual.

### Verdict
Round 1's laws remain Prime; this wave's additions are individually
lawful but R2-F1 reintroduces the two-truth pattern at the TYPE level in
constitutional-adjacent code — it should be consolidated before T-192
builds the temporal-property carriers next to these families. R2-F2/F3
are test-tier and schedulable; neither blocks Phase A (the live run) nor
rc.7.
