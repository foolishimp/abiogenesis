You are the Writer for package TD-26 P6 of the ABIogenesis consolidation wave (ticket T-292): the sixth code package of the retirement of standalone Consensus and the One Surface loop. P6 removes the loop from the language: the action catalog and the construction composition leave the Program schema, its contract types, canonicalization and validator law, and the fixtures that exist only to carry them go. The Executive (who wrote this brief) reviews and merges your branch.

## Authority

The owner decided on 2026-11-12 that the Executive is the standard system program and that One Surface retires with standalone Consensus. The specification and the design notes already state the Product that way. The code follows in the packages of the retirement plan, in sequence. You carry out one package and you do not reopen the decision, the plan's order or the Executive's rulings.

## Read first, in full

1. `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/5e4c25c3-fca5-4dd6-89e7-20d55d008bdf/scratchpad/retirement-rules.md`: the rules every retirement package follows. The specification and design steps of this retirement are done by other packages: you edit no specification file and no design note; list any kept design sentence that still describes what you remove.
2. The retirement plan, `.ai-workspace/work/T292_CONSOLIDATION_01/TD-26_RETIREMENT_PLAN.md`: section 0; section 2 (2.1 GTL, 2.8 validator, shared and scripts, 2.9 contracts and qualification mirrors, 2.10 tests and fixtures); section 3 (3.4 lists the constants that stay); section 4; section 5; section 6 "Common to every package" and "P6". The plan's line numbers are at `c1f655735`; many packages have merged since, so find each site again.
3. The register entry "TD-26" in `.ai-workspace/TECHNICAL_DEBT_REGISTER.md` (the bullet "Plan and rulings").
4. The Returns of the packages before yours, under `.ai-workspace/work/T292_CONSOLIDATION_01/`: `TD-26_P0_RETURN.md` to `TD-26_P5_RETURN.md`; and `TD-27_RETURN.md`, the precedent for a relation removed from the language and for a recorded basis that is refused when it is admitted anew.

## Where you work

- Worktree: `/private/tmp/abg-td26p6` (sparse checkout; branch `claude/td26-p6-language`, from local `main` at `__BASE__`). Use `abg-td26p6` wherever the rules say `<name>`. Your Return is `.ai-workspace/work/T292_CONSOLIDATION_01/TD-26_P6_RETURN.md`.
- Run test files in the foreground, one at a time. Do not end your turn while your own background commands are still running. No lane that needs a live provider is run.

## Scope

The plan's section "P6": the action-catalog and construction-composition schemas and the two optional keys of the Program schema; their contract types, canonicalization and `gtl/index.ts` types; the validator law for them; the execution-basis field types, which become constant types; the `actionCatalog` input of the semantics provider; the fixtures, support and tests that exist only to carry a One Surface Program, with their evidence-gate rows and qualification recipe rows.

## Rulings specific to this package

1. **No register row changes.** `shared/capability_contracts.ts`, the corpus ids and the Consensus schema contracts are untouched. After your final build the capability graph's rows are identical to the base apart from digests. If the build or a lane requires a register change, stop.
2. **The door is the language.** A Program that carries `actionCatalog` or `constructionComposition` is refused by the Program schema, a strict object, at every door that validates a Program. Give the door table before and after with the refusal code: module admission, publication validation, `catalog.admit`, conformance, Product resolution, the Run door for a start and for a continuation. No new refusal code. A lane shows the refusal at each door, red on your base where the base admitted.
3. **The basis guard of the route owner's package goes only when it is unreachable.** Show that no path reaches `admitExecutionBasis` with a Program that carries either key once the schema refuses them: a new start, a continuation of a held Run, a Program taken from a recorded Catalog. If one path can, the guard stays and you say which.
4. **Kept publications do not carry the keys.** Every shipped Program, every Program in a recorded publication of the kept feature set and every Program in a retained readiness basis that a kept lane admits is shown not to carry either key, in any spelling the strict schema would refuse (present with `null` or an empty value included). If one does, stop: that is a recorded shape, and the ruling is the Executive's.
5. **Recorded history is read, not admitted anew.** Reads of recorded history do not change: the artifact-truth section of the rules and the plan's replay census, identical on base and final for every subject that read on your base. A recorded readiness basis that carries a One Surface Program is refused when it is admitted anew, as for the `gate` relation; if a kept lane on kept behaviour admits such a basis and fails, stop and report the case.
6. **The digest-carried constants stay.** The six One Surface fields of every execution basis keep their keys and their constant values in every recorded and new body; only their types narrow to the constants, and the writer writes the constants. The basis digest of a kept Run is unchanged: show it for a default-library start on base and final.
7. **The provider's retired input is refused by name.** If the semantics provider's `actionCatalog` input is a key a provider module declares, the loader refuses a provider that carries it, with its existing message, as the module package ruled for the two public-result keys; say which providers carried it at your base and that none does at your head.
8. **Fixtures and their rows.** Delete the fixtures the plan lists (the developer-mini One Surface Program, the S03 fixture with its support and test) only after the rules' check that no assertion in them states kept behaviour that no other lane states; move such an assertion to the kept lane that owns it and say where it went. The evidence-gate rows `s03-phase-b-release` and `s03-evidence-directory` leave the catalogue with them; say what the catalogue lane's counts become. If the qualification recipe rows the plan names sit in a mirrored specification file, that edit comes first in its own commit and the Executive restages the mirrors at merge; say which files.
9. **Exports and pins.** Say which exported type names leave `./gtl`, `./gtl/m01` and `./gtl/m02`, which published schema and contract digests move, and which manifest pins move with them.

## Verification

On your final build only, one file at a time (the baseline is local `main`'s own results; run a file on a base build only to attribute a failure): the test files you edit or add; the new refusal lane, red on your base where the base admitted; `t287-gtl-serialization-publication`, `m5-c-algebra-validation`, `t287-framework-handoff-types`, `t287-default-library`, `t287-registered-graph-selection`, `t287-recursive-registered-selection`, `t292-td60b-evidence-gate-catalogue`, `r1-packed-artifact`, `r2-clean-install`, `r4-catalog-admission`; the replay census over the logs that read on your base and the artifact-truth probe over the live rc.12 store copy, identical on base and final. `npm run build` and the three lints pass. The Return is tables, counts and rulings, with no narrative.

## Stop and hand back instead of proceeding if

- a register row, a corpus id or a Consensus schema contract would have to change;
- a kept publication, a recorded publication of the kept feature set or a retained basis that a kept lane admits carries either key (ruling 4);
- a basis digest of a kept Run changes (ruling 6);
- a subject of the replay census that read on your base no longer reads;
- kept code needs behaviour of what you remove, not just a helper;
- any stop condition of the rules holds.

Your final message to the Executive repeats the status line, the lines removed by layer (source and fixtures separately), the commit list, the door table, whether the basis guard went, the gate-catalogue counts, the exported names that left, the digests that moved, and anything that needs a ruling.
