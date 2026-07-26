# Self-Review: T-256 Bounded Design Repair

## Verdict

`repaired_candidate_awaiting_independent_review`.

The six findings in the 2026-07-13 rejection are repaired in the design. This
is design evidence only. It does not accept T-256, authorize implementation,
or admit the preserved prototype.

## Finding Dispositions

1. **False F_H acceptance**: the prior decision record remains invalidated by
   the corrective governance commit. The design status and T-256 metadata both
   require a new independent review and explicit F_H acceptance. No acceptance
   is inferred from continuation.
2. **Profile duplicated source and regime truth**: the execution-context wire
   profile now carries only `version`, `source_node_ref`, `field_rows`, and
   `policy_refs`. Source schema and type derive from the selected GraphFunction
   input Node; active regime derives from the selected C term and composition.
   Authored source/type/regime fields are unknown-field rejections.
3. **Canonical T-183 path was not joined**: the F_P branch now maps every
   compiler-input family into the existing `constructInstructionAssemblyRule`,
   `compileInstructionAssemblyPlan`, `admitCompiledPromptPlanAtStartup`, and
   `bindInstructionEnvelope` boundaries. `DeclaredFpExecutionRequest` is a
   read-only identity projection over those carriers and contains no duplicate
   prompt, section, result-contract, renderer, or runtime-binding truth.
4. **Program/stage order conflicted**: the sequence and lifecycle both resolve
   and verify the catalog-bound work Module and C program before stage
   validation. `blocked_capability` therefore does not need to carry a second
   program body.
5. **Wire/native vocabularies conflicted**: top-level and nested serialized
   keys are now exact snake-case wire vocabularies with one explicit decode to
   camel-case native properties. Camel-case wire aliases and retained dual
   properties reject.
6. **Transition owners and lookup authority were wrong**: every lifecycle
   transition names its owner. M02 `ModuleLookupAuthority` remains unchanged
   and limited to GraphFunctions and Jobs. A stateless
   `BoundModuleDeclarationResolver` directly scans each exact catalog-bound
   Module for unique Rule and Node refs, retains no index, and grants no
   selection or invocation authority.

## Proportionality Review

- No new GTL term, registry, runtime controller, renderer, dispatcher, or
  traversal mechanism was introduced.
- A proposed retained declaration index was removed during self-review in
  favor of direct stateless Module resolution.
- The existing T-183 instruction carriers remain the one F_P truth path.
- T-255 capability truth, T-267 traversal blocking, and T-268 manifest
  ownership remain unchanged.
- The preserved implementation prototype was not edited or executed as proof.

## Design Evidence

- Profile wire/native and derivation law:
  `M03_INSTRUCTION_PROTOCOL_BEHAVIOR_DESIGN.md` lines 155-354.
- Canonical T-183 bridge: lines 356-414.
- Program-before-stage sequence: lines 1029-1050.
- Owner-complete lifecycle: lines 1112-1167.
- Axiom and proof matrices: lines 1198-1255.

## Gates

- `npm run check:design-mermaid`: passed; 27 diagrams across 9 files.
- `npm run test:design-mermaid`: 5/5 passed.
- `git diff --check`: passed.

## Remaining Gate

Independent review must challenge the repaired Rule profiles, wire/native
decode, direct declaration resolver, canonical T-183 mapping, lifecycle
ownership, and proof matrix. Only a new explicit F_H acceptance may unpause
implementation.
