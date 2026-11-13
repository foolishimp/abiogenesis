# Installed-01 ordering failure assurance

The established Product/Design/Proof frame remains unchanged. Source and artifact correspondence are already satisfied within their exact scopes; an installed test result is still required. The reviewer remains a resumed-context nonauthor and executed no Product code, test, bootstrap, repair, pack, build or Git mutation.

**Verdict: the pinned failure is a control-only path-order defect. Reusing the completed bootstrap and retained stage/work is suitable for a separately admitted immutable continuation of only the unstarted whole W2-05 test.** This is causal localization and continuation suitability, not final installed Proof acceptance.

The original records remain failed: installed-01/FAILURE_RETURN.json is2275 bytes, SHA256 `502541af5c556f7a72e8039dd7b02d1d7643b169174836210d92a15faaa1c888`; BOOTSTRAP_ORDER_TRIAGE.json is1874 bytes, SHA256 `21b498e30c82f6bce2b4d9129f1219345b9008f0df82334c99af1300cd5a525b`. The actual bootstrap receipt is1400 bytes, SHA256 `a82a410efb83b5590be6977cae9d87030e5f51a5a34371d38a626407a4e425c6`. Its command exited0 in2.528 s, stderr was empty, output stayed within bounds, group absence was observed and no external cleanup was needed. Its later guard failed, so FAILED_OR_INCOMPLETE and HALT remain accurate.

## Cause and counterexample

The pinned driver `31e9c90720932e894a28ed13612b2f1750d9d480702dba781dd490c28072e15c`, lines94–104, collects actual rows from `sorted(root.rglob('*'))`. That orders pathlib.Path objects by components. It compares the resulting list directly with archive rows ordered by complete POSIX path strings. The two order relations differ even for the same contents: at index76 actual has `build/code/src/abg/m03/transport.d.ts`, whereas expected has `build/code/src/abg/m03.d.ts`.

I independently enumerated and hashed the installed package. There are exactly5,327 regular files and71,840,473 bytes, no duplicate path, missing or extra member, symlink, length mismatch or digest mismatch. The raw lists differ; sorting actual rows by their path string makes them exactly equal to every expected row. Canonical rowset SHA256 is `b5a5d7eaf0114f3b54a0c30a218c8aed48ea03c51f8931dd493b9b3caf79f781`. The installed manifest independently has the expected Product content identity `sha256:778f5667e380f52fdf35398c48b24ff875598a6c3588cc030faa440283c11587`. The exact fresh archive remains `fdbf93de131905f79e96c8716dbb833ae8b308b3e791e1ac63a79b59a1c74d46`.

The guard's list-order comparison is therefore sufficient to explain this failure without a Product/package/source defect. Canonicalizing the comparison preserves the full identity condition; ignoring content rows or accepting a subset would not be an equivalent repair.

## Retained custody

All1,344 source rows are independently exact in the live successor, immutable native04 freeze, proof/source and proof/work roots. Both the accepted Q1 compiled donor and retained proof work tree match all996 compiled/contracts/manifest rows. The proof dependency copy matches all4,576 inventoried file/link rows; the npm owner matches all2,326 rows. All eight preservation pins match. Frozen stage metadata reports no applied absent seeds. Archive, member inventory, command logs, failure, triage, driver and binding pins were reacquired.

There is no w2-05 command directory and no final campaign receipt. The driver writes the bootstrap failure then raises before the next command; the retained filesystem state agrees that the whole test never launched. The completed bootstrap is a usable retained input, not a successful whole Proof sequence. No reinstall, repack or rebuild is needed to repair this ordering relation.

## Finite continuation conditions

The successor must be new immutable controls that preserve the original failure and bootstrap receipts. Its only execution is the previously selected unfiltered W2-05 file: three exact named cases, no skips, original finite bounds and retained diagnostic/physical-close requirements. It must reacquire the exact archive, installed package, native04 source, stage/work, compiled donor, dependency/npm and preservation pins before effects, and repeat applicable guards after the test. Installed equality must normalize full path-string ordering while retaining all path/size/digest and link checks. No subject substitution, source repair, completed bootstrap repetition or rebuilt/repacked artifact is implied.

The actual full-test receipt must still bind the corrected frozen test to this exact archive and maintained installed harness, retain its W2_05_PROOF identity/census/event facts, and distinguish observed callable counts from fixed asserted definition/addition counts. Review of the exact successor controls and eventual actual Proof is pending. Phase1 acceptance and historical failed evidence remain separate. No reproducibility, qualification, release or publication claim follows.
