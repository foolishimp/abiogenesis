# RC12 package CB Return — Consensus retirement backed out of the RC12 line

Writer Return, commentary. Worktree `/private/tmp/abg-rc12-liveness-20261111`, branch `claude/rc12-consensus-backout`
from `f7b039ffb`; base `62fd17271`; T = `build_tenants/abiogenesis/typescript`. `claude/rc12-consensus` untouched; no push.
Kept: `be05bbfbc`, `9c086294b`, `63c6a7563`.

## Commits

Reverts `d4ffd8923`, `b05952184`, `b0327828e`, `10cb10e89` undo `a61231c6a`, `da1d589a9`, `fb86974e3` (81 files),
`f4aad7d5e` (62 files), newest first. W3 `056ac6a78` (INTENT, F8); W5 `b3bd2b113` (C_RETURN.md standing section).

## W1 Conflicts

None; each revert is a plain `git revert` with a reworded message. Git auto-merged the three files later packages
also changed (`specification/PRODUCT.md`, `T/design/M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN.md`,
`T/design/T287_R10_TYPED_TERMINAL_OUTCOME_DESIGN.md`); W2 proves the result.

## W2 Exactness: the back-out is exact

- **Reference tree** = base merged in memory with the later package tips, no Consensus commit:
  `git merge-tree --write-tree --merge-base 62fd17271 1b2163bac ad287364c` (K, R), `commit-tree`, merge `fff8daacf`
  (B2a), merge `8206e9576` (A2, W, P) = tree `1b7953a9c`.
- **Comparison.** `git diff --stat 1b7953a9c HEAD` after W3 lists only `INTENT.md` (`be05bbfbc` + W3),
  `REQ-L-GTL3-RECURSE.md` (`63c6a7563`), `C_RETURN.md` and `B2B_RETURN.md`.
- **Scan.** In `git diff 62fd17271 HEAD -- . ':!.ai-workspace'`, 0 added or removed lines contain "consensus" or
  "system program".

The 143 retirement paths (`git diff --name-only 62fd17271 9c086294b`, minus INTENT and the Return):

| Directory | Paths | Equal to base |
|---|---|---|
| `specification/` (PRODUCT, GOALS, requirements, scenarios) | 10 | 9 |
| `T/design/`, `T/design/adrs/` | 52 | 50 |
| `T/code/src/` (gtl 3, implementation 2, product 6, public 2, shared 1) | 14 | 14 |
| `T/contracts/` (public-operations 18, public-functions 1, qualification 12, schemas 5, vocabularies 3) | 39 | 39 |
| `T/test_env/` (tests 19, support 3, types 1, uat 1), `T/scripts/` 2, `T/package.json`, root `.gitignore` | 28 | 28 |

| Path that differs from base | Explained by |
|---|---|
| `specification/PRODUCT.md` (+20 −4) | `7b5d2a358` A2 (+6 −4), `d1b579c48` R (+5), `b6f0f7f07` B2a (+2), `5efb5be13` P (+7) |
| `T/design/M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN.md` (+60) | `b6f0f7f07` B2a |
| `T/design/T287_R10_TYPED_TERMINAL_OUTCOME_DESIGN.md` (+42) | `d1b579c48` R |
| `specification/requirements/product/REQ-P-POLICY.md` (+39 −1; `da1d589a9`'s file, not one of the 143) | `d1b579c48` R |

## W4 Generated files

- **Committed: no generated file.** The reverts restored the base bytes.
- **Build output (leave uncommitted).** `npm run build` rewrites the 23 tracked files R_RETURN T2 lists. 21 are
  retirement paths (18 operation contracts, `adapter-projection.json`, `public-operation.schema.json`,
  `operations/project/read/result.schema.json`); a structural diff shows only R's `run_status` `stop` member
  (`1bd2658bf`) and the digests that hash it. 2 (capability graph, toolchain manifest) were stale at base (RV4 F9).
  Every build input that differs from base is a later package's (`bb85923c5`, `7212f3312`, `9ad8d7e83`,
  `1bd2658bf`, `7b5d2a358`, `4f1626ea8`).
- **Byte-identical to base after the build**: 4 qualification JSON files, `consensus.schema.json`, `project/read`
  request and refusal schemas, 3 vocabularies.
- **Staging generator**, run last: `node scripts/generate-qualification-rule-catalog.mjs --stage-authorities ../../..
  "~/Library/Application Support/STDO/releases/v3.0.4"` (manifest sha256 matches the basis). 95 sources (base 95,
  retired 94), 2,116 rules (base 2,110, retired 2,074). It rewrote only the INTENT (`be05bbfbc`, W3), PRODUCT (A2,
  R, B2a, P), REQ-P-POLICY (R) and REQ-L-GTL3-RECURSE (B2a, `63c6a7563`) mirrors; REQ-P-CONSENSUS unchanged; 0
  changed lines contain "consensus". Diff at `/private/tmp/abg-cb-tmp/stage-authorities.diff`, then `git restore`d
  (restaging is RV4 F3's step after acceptance).

## Evidence (TMPDIR=/private/tmp/abg-cb-tmp; logs `t-<file>.log` there)

- **E1.** `npm run build` exit 0 (32 s). `npm run -s lint:<name>`: imports "3 forbidden owner pair(s) hold";
  lifecycle "291 modules under code/src; 7 allow-listed site(s), no offender"; calculus "6 modules under
  code/src/abg/calculus/; 0 allow-listed import(s), no offender".
- **Runs.** One file per process, serially (`/private/tmp/abg-cb-tmp/run-tests.sh`):
  `node --experimental-vm-modules --test --test-concurrency=1 test_env/tests/<f>.test.mjs`. Counts: tests/pass/fail/skip.
- **E2.** `m5-consensus-module` 17/17/0/0; `t287-consensus-ref-shape` 2/2/0/0.
- **E3.** All five files byte-equal to base; counts equal C_RETURN T5's base column. `a5-f02-canonical-gtl-identity`
  7/7/0/0; `r4-catalog-admission` 8/8/0/0 (alone); `t287-w2-05-install-catalog-owner-chain` 3/3/0/0 (86 s);
  `steel-basic-cli-public` 1/1/0/0 (295 s); `t287-st2a-g-capability-definition-graph` 4/4/0/0.
- **E4.** Equal to B2B_RETURN's counts. `t287-default-library-reviews` 10/10/0/0; `-prerequisites` 6/6/0/0;
  `t287-recursive-failure-foldback` 8/8/0/0; `t287-readable-stops` 4/4/0/0; `t287-amendment-witness` 8/7/0/1 (live
  case skips: `ABI5_AMENDMENT_WITNESS_LIVE` is not '1').
- **E5.** Fresh build; every count equals RV4's base build. 18 operations, 56 definitions; `project.read` 24 members
  with `ticket_consensus`; `ABI5_SYSTEM_PRODUCT_SEMANTICS` bound as `product-semantics://abiogenesis/system@5`; 75
  catalog rows (22 schema assets, 3 vocabulary assets, 27 serialized native contracts, 23 native typed groups); 16
  capabilities, 10 publication bindings, 49 contribution rows; 5,325 locators, 11 of them Consensus.

## Deviations

W3 reflowed the paragraph's other lines; `git diff --word-diff 10cb10e89 056ac6a78 -- specification/INTENT.md`
shows only the first sentence changed. W4 ran the staging generator and restored its output.

## Residual risks

1. The 23 regenerated files stay uncommitted; a cut must commit them (K's stamp step).
2. The INTENT, PRODUCT, REQ-P-POLICY and REQ-L-GTL3-RECURSE mirrors lag the live specification; RV4 F3 applies
   before any cut and now covers W3.
3. RC12 has the base standing for `A5-F07`: the shipped Consensus program is the only supervised root, and T-287
   records the general One Surface composition as unproved at base.
4. The writer and the reviews are the same model family.
