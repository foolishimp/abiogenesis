# T-245 - Author The SCN-ABG-SOFTWARE-BUILD Campaign Scaffold

- id: T-245
- title: Author the SCN-ABG-SOFTWARE-BUILD campaign scaffold (F25 scenario pack + F26 supervisor seat)
- type: feature
- ticket_category: ordinary
- status: backlog
- goal: abg-5-0-full-product-delivery (campaign model, per T-242)
- owner: abiogenesis
- priority: high
- governance_scope: ODD_METHOD, three-layer ownership law
- change_class: design_reframe
- re_entry_point: campaign scenario surface (placement decided at design time; declarations only)
- created_at: 2026-07-12
- source_ticket: T-242
- admission_condition: blocked on T-242 ratification and T-244 seed admission
- dependencies:
  - T-242 course-correction ratification
  - T-244 GTL-5 subject specification seed
  - installed predecessor line (per T-243 ruling) + odd_glc 0.1

## Intake Triage

1. Substantive: yes — the second real delivery gap (post rev 3 §2 row 7): the
   engine exists, the subject-side authoring does not.
2. Boundary: scenario declarations and supervisor-seat configuration only —
   domain declarations in the data-mapper pattern. No ABG systems
   functionality, no local prompt shells, registries, ledgers, or traversal
   loops (three-layer ownership law).
3. Upward walk: with the seed (T-244) admitted, the missing layer is the
   scenario/binding surface that lets the campaign run against it ⇒
   `design_reframe` ⇒ affected span: scenario pack + seat config ⇒ release
   scope: none.

## Deliverable

The campaign scaffold that points the proven engine at the GTL-5 subject:

- **F25 — SCN-ABG-SOFTWARE-BUILD scenario pack**: scenario declarations in the
  data-mapper pattern (scenario declarations + worker turns + earned depth),
  binding the T-244 seed as subject over the installed predecessor line +
  GLC 0.1. Original feature text is the authority for shape: "declared in the
  data-mapper pattern... committed evidence ledger (rc.2 pattern)."
- **F26 — observer/tuner supervisor seat** configured over this subject using
  the shipped 4.6 observer/tuner (no new supervisor machinery).
- **Substrate/subject rule encoded as scenario law (post §8.1)**: during a
  campaign run the installed substrate is immutable; all authoring lands in
  the subject source tree; substrate defects found mid-run are admitted as
  evidence and become tickets on the predecessor service line (T-243's
  outcome), never live patches; capability gaps surface as typed gap events
  and route through the demand register.
- **Gap-admissibility bridge (added per codex review finding 4)**: today the
  typed `semantic_not_realized` diagnostics stop at compile/conformance level
  (`GtlProgramConformanceIssue`); no producer admits them as ledger events.
  The scaffold must make unrealized-construct attempts land as ADMITTED typed
  evidence — preferred path: the scenario declares the conformance run inside
  worker turns so diagnostics ride the admitted typed result (EXECUTION
  DEFAULT law); a code-level event producer is in scope only if declaration
  cannot carry it. Without this bridge the demand loop is supervisor-mediated
  reading of diagnostics, not admitted evidence — the earned-depth law then
  cannot count gap closure.
- Placement (odd_glc catalog vs abiogenesis scenario surface) is a design-time
  decision under the three-layer ownership law; whichever home is chosen ships
  declarations only.

## Closure Condition

The scaffold binds and starts over the installed stack against the T-244 seed
through admitted GTL program and workspace startup, and wave one reaches a
truthful terminal state (converged, or typed gap/hold) with a committed
evidence ledger in the rc.2 pattern. **Wave one is also the exact-substrate
engine pilot** (per codex review finding 7: the full data-mapper campaign is
rc.2-era `predecessor_evidence_only`; no full campaign has run on the exact
current predecessor line) — its evidence upgrades or refutes the engine-
readiness claim on the exact installed substrate. Full GTL-5 delivery is out
of scope — that is T-246's job, wave by wave.
