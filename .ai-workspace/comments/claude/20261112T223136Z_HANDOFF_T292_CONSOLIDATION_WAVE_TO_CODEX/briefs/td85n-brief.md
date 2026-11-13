You are the Writer for bug B-05 of ticket T-293 (register entry TD-85, narrow part) of the ABIogenesis consolidation wave: a worksite subject spelled in another letter case creates a protected directory that does not exist yet, or links a file into it before the refusal. The Executive (who wrote this brief) merges your branch when you hand back; a QA review may follow the merge.

## Read first

1. Register entry "TD-85" in `.ai-workspace/TECHNICAL_DEBT_REGISTER.md` (the "Retire" bullet, second part as narrowed), and row B-05 of `.ai-workspace/tickets/active/T-293-qa-findings-of-the-consolidation-wave.md`.
2. `.ai-workspace/work/T292_CONSOLIDATION_01/TD-85_TRACE.md`: question 3 (each effect site with each spelling; the rows marked for an absent root) and question 4. Its probes are in `/private/tmp/abg-td85-work/` (read-only input: copy what you use).
3. `T/code/src/product/worksite_operations.ts` (file parents, file replace, the physical-spelling checks) and the native work write-root check the trace cites.

Worktree: `/private/tmp/abg-td85n` (sparse checkout; branch `claude/td85n-absent-protected-root`, from local `main` at `891a39c44`). T = `/private/tmp/abg-td85n/build_tenants/abiogenesis/typescript`. Scratch `/private/tmp/abg-td85n-work/`; `TMPDIR` for tests `/private/tmp/abg-td85n-tmp/`. Your Return is `.ai-workspace/work/T292_CONSOLIDATION_01/TD-85N_RETURN.md`. Every file a probe or lane creates lies under your scratch or `TMPDIR`. Never push; no model call; no credential reading. Do not end your turn while your own background commands are still running.

## The defect

A protected root is a directory of the binding that a worksite effect may not touch (for example the event-log directory). Where the protected root exists, a subject in another spelling is refused before any write. Where it does not exist yet, on a volume that ignores letter case or normalization form: file parents creates the directory the root then resolves to; file replace links the file and refuses only afterwards, and the file stays; the native work write-root check admits the root.

## Rulings (the Executive's)

1. **The invariant.** A worksite effect never leaves on disk a directory or file that a protected root of its binding resolves to or contains, whether or not the root existed before the effect. It refuses such a subject with the refusal the owner already gives for a subject that is, or aliases, a protected root. No new refusal code.
2. **Where.** At the effect owners only: file parents, file replace (and construction and branch construction through it), and the native work write-root check. `workspace.bind` does not change, and an effect is not refused merely because a protected root is absent.
3. **How.** The volume, not a string comparison, decides whether two spellings name one entry, and it can only say so for entries that exist. Preferred form: the owner notes which protected roots are absent before its effect; after the step that creates directories or links the file, and before it reports success, it checks whether a protected root that was absent now exists; if one does, it removes exactly what it created (directories innermost first, the linked file) and refuses. For the native work write-root check, which creates nothing itself: refuse a write root that does not exist when it would be created inside the directory that will hold an absent protected root and its first missing component equals the root's under lower-casing and Unicode normalization; say what that comparison does not catch. If another form meets ruling 1 with less code, use it and say why. No case folding anywhere else.
4. **Nothing left behind.** After a refusal the directory tree is byte for byte what it was before the call. Show it with a tree listing before and after in each lane case.
5. **Not yours:** the synchronous canonical-path checks (bug B-06 has a built branch), the path-confinement owner, the protected-root rule's string comparison, and any rule at `workspace.bind` (bug B-09 is the owner's decision).

## Proof (light)

A new lane `t292-td85n-absent-protected-root.test.mjs` that tests the volume for each kind of variant (letter case; normalization form) and runs the cases the volume aliases, skipping the others with the reason: for file parents, file replace and the native write-root check, with an absent protected root: a subject in stored spelling inside the worksite is admitted (control); a subject that is the absent root in another spelling, or lies beneath it, is refused and nothing is left on disk; red on your base. On your final build only, one file at a time: the new lane, `t287-post-binding-worksite-write`, `t287-worksite-construction`, `t287-worksite-branch-construction`, `t287-native-workspace-work`, `t292-td37a-worksite-subject`, `t292-td37d-leaf-authority-gate`, `t287-default-library`, `r2-clean-install`, `r3-workspace-binding`. Command, from T: `TMPDIR=/private/tmp/abg-td85n-tmp ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace node --experimental-vm-modules --test --test-concurrency=1 --test-reporter=tap test_env/tests/<file>.test.mjs`; run `npm run build` before lanes whenever generated files were restored. The trace's absent-root probes on base and final. `npm run build` and the three lints pass; every `.d.ts` file byte-identical unless you say which changed and why.

## Stop and hand back if

- a kept lane or a recorded subject is refused by the new check in stored spelling;
- the undo cannot restore the tree exactly at a site;
- the refusal needs a new code.

## The Return

Tables, counts and rulings only: status line; the check at each site (file and line); the table of the trace's absent-root rows on base and final; lanes; what the write-root comparison does not catch; lines changed; residuals. Commit code with its lane, the Return last, and say in your final message which commit is the branch head. Generated files (`contracts/`, `product-toolchain-manifest.json`, `test_env/fixtures/abi5-root-candidate-basis.json`) are restored before each commit. End every commit message with: `Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01LduNEwa1BsAk3vSUmjMCAm`.
