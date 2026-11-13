You are the Writer for bug B-04 of ticket T-293 (register entry TD-82) of the ABIogenesis consolidation wave: the event store's single-writer lock is found through `TMPDIR`, so two processes with different `TMPDIR` values both hold one log. The Executive (who wrote this brief) merges your branch when you hand back; a QA review may follow the merge.

## Read first

1. Register entry "TD-82" in `.ai-workspace/TECHNICAL_DEBT_REGISTER.md`, and row B-04 of `.ai-workspace/tickets/active/T-293-qa-findings-of-the-consolidation-wave.md`.
2. `.ai-workspace/work/T292_CONSOLIDATION_01/TD-80_TRACE.md`, section 1.12 and change 8 of section 2; `TD-80_RETURN.md`, the answers for TD-82 (which processes run under another `TMPDIR`, the readers of the lock namespace, what a lock file beside a log would meet).
3. `T/code/src/abg/event_store.ts`: `durableLockPath`, `acquireDurableAppendLock`, `releaseDurableAppendLock`, the recovery path that reads the lock.

Worktree: `/private/tmp/abg-td82` (sparse checkout; branch `claude/td82-lock-namespace`, from local `main` at `891a39c44`). T = `/private/tmp/abg-td82/build_tenants/abiogenesis/typescript`. Scratch `/private/tmp/abg-td82-work/`; `TMPDIR` for tests `/private/tmp/abg-td82-tmp/`. Your Return is `.ai-workspace/work/T292_CONSOLIDATION_01/TD-82_RETURN.md`. Never push; touch nothing outside the worktree and your scratch; no model call; no credential reading. Do not end your turn while your own background commands are still running.

## Rulings (the Executive's)

1. **The lock namespace does not follow an environment variable.** Every process of one user that opens the same log file contends for the same lock, whatever its `TMPDIR`. The lock stays keyed by the log's device and inode. On POSIX the namespace is one directory per user under the system temporary root, named with the user id, created with mode 0700, and refused if it is a symbolic link or is not owned by the user. On other platforms the present rule stays; say so. If the census shows a reason this cannot hold in the lanes' environment or in the Product's own child processes, say so and take the other form (a lock file beside the log), listing every directory check it meets; stop only if neither works.
2. **One owner function** gives the lock path; the store's acquisition, its release and the recovery path use it. Tests that build the lock path themselves call it through test support instead of rebuilding it.
3. **A holder under the old namespace is still seen.** While acquiring, the store also refuses when a lock for the same log exists in the previous namespace under this process's `TMPDIR`, so that a process of an earlier build and a process of this build do not both hold a log. Say when that check can be removed.
4. **Refusal.** A second holder is refused at reopen with the refusal the store gives today for a held log (`sink_unavailable`, "already has an exclusive append lock"). No new code.
5. **Design text.** Restate the sentences that state the `TMPDIR` scope or name the lock namespace (`T287_INTERRUPTED_EVENT_RESOURCE_RECOVERY_DESIGN.md`, `T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION.md`) in the present tense, to what the code does.
6. **Lane.** The two-process case of `t288-logical-prefix-digest` already branches on what the second process gets at reopen: after your change its refused branch runs. Add one case where both processes use the same `TMPDIR` (refused, as before) and one where an abandoned lock is recovered by the existing operator procedure in the new namespace.

## Proof (light)

On your final build only, one file at a time: `t288-logical-prefix-digest` (red on your base for the different-`TMPDIR` case), `m5-event-store-reopen`, every test file that builds or names the lock path, the interrupted-store recovery lanes, `t287-default-library`, `t287-registered-graph-selection`, `steel-basic-cli-public`, `r1-packed-artifact`, `r2-clean-install`. Command, from T: `TMPDIR=/private/tmp/abg-td82-tmp ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace node --experimental-vm-modules --test --test-concurrency=1 --test-reporter=tap test_env/tests/<file>.test.mjs`; run `npm run build` before lanes whenever generated files were restored. Also: the evaluator's reproducer shape (two ordinary processes with different `TMPDIR` values appending to one log) run on base and final, with the ordinals on disk. `npm run build` and the three lints pass; every `.d.ts` file byte-identical unless you say which changed and why.

## Stop and hand back if

- a kept flow of the Product needs two processes to hold one log at once;
- the namespace directory cannot be created or used where the lanes run;
- the refusal needs a new code.

## The Return

Tables, counts and rulings only: status line; the owner function and its callers; the namespace and its checks; the two-process table (base, final); lanes; design sentences old and new; lines changed; residuals. Commit design, code, lanes, the Return last, and say in your final message which commit is the branch head. Generated files (`contracts/`, `product-toolchain-manifest.json`, `test_env/fixtures/abi5-root-candidate-basis.json`) are restored before each commit. End every commit message with: `Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01LduNEwa1BsAk3vSUmjMCAm`.
