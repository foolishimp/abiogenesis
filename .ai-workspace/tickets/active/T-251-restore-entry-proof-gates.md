# T-251 - Restore The M05 Entry-Proof Gates

- id: T-251
- title: Restore the M05 entry-proof gates for test-harness lint and registered Mermaid designs
- type: realization
- ticket_category: qualification_gate_restoration
- status: active
- phase_status: design_ready_for_fh_review
- goal: GOAL-035 DS-0 design and entry-gate integrity
- owner: abiogenesis
- priority: critical
- governance_scope: STDO, DESIGN_MODULE_METHOD, TypeScript realization guardrails
- change_class: realization_refactor
- re_entry_point: build_tenants/abiogenesis/typescript/test_env
- created_at: 2026-07-12
- updated_at: 2026-07-12
- source_ticket: T-242
- dependencies:
  - T-242 amendments A1 and A6
  - build_tenants/abiogenesis/typescript/design/A5_COMPLETED_CODE_DESIGN_STAGE_REGISTER.md

## Intake Triage

1. The current test-harness lint gate is red on exactly ten dead bindings in
   three proof files. The bindings do not carry product behavior and must be
   deleted rather than suppressed or renamed to evade lint.
2. T-242 amendment A6 requires a committed, reproducible Mermaid parse/render
   check for the nine designs registered by the A5 retrospective design gate.
   The prior 27/27 observation is evidence, not an executable standing gate.
3. Both defects belong to the same M05 entry-proof boundary: deterministic
   proof tooling must be green before product implementation resumes. The
   smallest change class is one `realization_refactor`; no specification,
   product, GTL, ABG runtime, public contract, or release identity changes.
4. The design authority is
   `M05_ENTRY_PROOF_GATES_BEHAVIOR_DESIGN.md`. Implementation remains closed
   until that design is independently reviewed and accepted.

## Exact Scope

### A1 - Ten Dead Lint Residues

| File | Residue | Disposition |
|---|---|---|
| `test_env/live/test_t188_requirement_proof_carry_through_live.test.mjs` | imported `admitRequirementProofCarryThroughOutput` | delete unused import |
| same | imported `projectRequirementProofCoverage` | delete unused import |
| same | `dependencyTruth` | delete unused helper |
| same | `proofDepthTruth` | delete unused helper |
| same | `foldFixture` | delete unused helper |
| same | `foldWithCoverage` | delete unused helper |
| same | dead `contract` binding and its pure duplicate construction | delete dead binding |
| `test_env/sandbox/test_t180_glc_hello_world_bootstrap_live.test.mjs` | imported `pathToFileURL` | delete unused import |
| same | `stableList` | delete unused helper |
| `test_env/sandbox/test_t194_feature_matrix_sandbox_live.test.mjs` | `stableList` | delete unused helper |

No assertion, live-enable condition, test body, fixture meaning, runtime call,
or evidence claim may change under this sub-slice. No underscore rename,
disable comment, ESLint configuration change, or ignore pattern earns closure.

Deleting the four dead T-188 helpers also deletes these six transitive-only
symbols, each of which has no reference outside that dead chain:

- imports `constructDerivedDependencyInstructionTruth`,
  `constructDerivedProofDepthInstructionTruth`, `foldRequirementEvidence`,
  `requirementAbgTruthRefFromRequirementProofCoverage`, and
  `requirementAbgTruthRefFromAssuranceClosureDecision`; and
- helper `assuranceCloseTruthRef`.

They are part of the same deletion-only scope, not eleven new findings.

### A6 - Registered Three-View Mermaid Proof

The default gate reads the nine design links in the `Registered Stages` table
of `A5_COMPLETED_CODE_DESIGN_STAGE_REGISTER.md`. Each linked design must exist
locally and contain exactly these three Mermaid fences in this order:

1. `classDiagram`
2. `sequenceDiagram`
3. `stateDiagram-v2`

The current closed input set is exactly nine files and 27 blocks:

- `M01_M03_TYPED_C_ALGEBRA_BEHAVIOR_DESIGN.md`
- `M03_COMPILED_EXECUTION_HANDOFF_BEHAVIOR_DESIGN.md`
- `M03_FP_OUTPUT_ADMISSION_BEHAVIOR_DESIGN.md`
- `M02_M04_INSTALLED_CATALOG_FOUNDATION_BEHAVIOR_DESIGN.md`
- `M04_PUBLIC_CONTRACT_PUBLICATION_BEHAVIOR_DESIGN.md`
- `M03_M04_PUBLIC_SDK_CLI_BEHAVIOR_DESIGN.md`
- `M03_INSTRUCTION_PROTOCOL_BEHAVIOR_DESIGN.md`
- `M02_M05_PACKED_INSTALLED_VERTICAL_BEHAVIOR_DESIGN.md`
- `M03_CONSENSUS_REJECTED_AS_BUILT_BEHAVIOR_DESIGN.md`

The checker shall use a locally pinned development dependency, not ambient
global state: `@mermaid-js/mermaid-cli@11.3.0` with
`puppeteer@23.6.1`, plus one committed strict-security, neutral-theme,
deterministic-identifier configuration. It renders each registered Markdown
document into a temporary directory, requires three non-empty SVG outputs, and
deletes the outputs. It does not commit generated diagrams or compare browser
pixels.

One structurally complete negative fixture shall contain an intentionally
malformed `classDiagram` followed by valid sequence and state blocks. The
fixture must pass the three-view shape check and fail the Mermaid parse/render
step with a stable checker-owned error classification.

## Planned Realization

1. Obtain independent design review and F_H `accepted` disposition.
2. Delete only the ten reported lint residues and the six named
   transitive-only symbols exposed by that deletion.
3. Add one deterministic Node gate and Mermaid config under `test_env/gates`,
   plus one malformed fixture and subprocess negative test under `test_env`.
4. Add exact dev-only renderer dependencies and lockfile entries.
5. Add `check:design-mermaid` and `test:design-mermaid` package scripts. Do not
   add the browser-backed gate to ordinary `build:semantic`.
6. Record the executable command in the A5 design-stage register.
7. Run the focused gates, semantic regression gates, package-boundary check,
   and a drift self-review before checkpointing.

## Closure Conditions

- The design has an independent axiom review and explicit F_H `accepted`
  verdict before implementation.
- `npm run lint:test-harness` reports zero errors and warnings without
  suppressions, ignore changes, or product-behavior edits.
- The positive diagram gate discovers exactly the nine registered designs,
  verifies exactly 27 ordered class/sequence/state blocks, and renders 27
  non-empty SVGs with the pinned local CLI.
- Removing a registered file, adding or removing a block, changing block order,
  or breaking Mermaid syntax fails closed.
- The malformed fixture is rejected by the real Mermaid parser/renderer and
  the negative test proves that rejection.
- `npm ci` supplies the renderer; the gate neither depends on nor accepts a
  global `mmdc` installation as proof.
- Generated SVGs and browser output do not remain in the worktree.
- The dev-only proof tooling is absent from the packed product allowlist.
- `npm pack --dry-run` contains no Mermaid gate, config, fixture, renderer, or
  browser dependency payload.
- `npm run build:semantic`, `npm run test:t220`, and `npm run test:t223` remain
  green after the bounded realization.
- The phase self-review confirms no product semantics, public contract,
  runtime path, or test assertion changed.

## Non-Closure Conditions

- The gate scans every historical Mermaid block, comment, ticket, template, or
  unrelated structural diagram.
- The gate claims that parseable diagrams satisfy axioms or agree with code.
- Rendered SVGs, pixel snapshots, font hashes, screenshots, or a browser matrix
  become release artifacts.
- Renderer logic enters ABIogenesis product code or the published package.
- Lint is made green by suppression, underscore-renaming, weakening ESLint, or
  deleting a test assertion.
- Hostile-process, multi-host, tamper-proofing, network, or browser-compatibility
  hardening enters this trusted-desktop proof leaf.
- T-251 changes GTL, ABG runtime behavior, Consensus design, operator behavior,
  or any 5.0 feature definition.

## Current Evidence

- `npm run lint:test-harness`: red with exactly 10 `no-unused-vars` errors in
  the three files and names enumerated above.
- Ambient `mmdc 11.3.0` exploratory run: all nine registered documents render
  three SVGs each. This establishes feasibility only; it does not close A6
  until the local pinned command is committed and rerun.
- Product implementation remains frozen. This ticket and its candidate design
  authorize review only.

## Design Module Review

- outcome: independent_pass_pending_fh
- design:
  `build_tenants/abiogenesis/typescript/design/M05_ENTRY_PROOF_GATES_BEHAVIOR_DESIGN.md`
- implementation_authorized: false
