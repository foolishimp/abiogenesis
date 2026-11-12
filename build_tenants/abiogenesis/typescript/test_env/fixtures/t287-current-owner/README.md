# T-287 current-owner evidence fixtures

Readonly component input for `t287-native-assessment-evidence.test.mjs`. The
population directory holds one `fixture.json` manifest and one `events.jsonl.gz`
original RC10 event-log prefix. They are not present store authority, passing tests, Run
semantic closure, qualification or acceptance. Absolute paths inside the
histories (archive roots, `eventLogRef`) are original bytes, not live
references.

## Files

| File | Bytes | SHA-256 |
|---|---:|---|
| `native-assessment/events.jsonl.gz` | 779443 | `66162a9332dcabf7410d630551cdf12b4b272c70aa02d777f879a165a7fa8a2e` |
| `native-assessment/fixture.json` | 8208 | `2c3330b69ca39febeb0e01760a4b6f7bb1af1758b8b33f2dcc54eeb017e1ecb6` |

Decompressed prefix: `3467880` bytes,
`sha256:0a381f83b731b54f64df27945a9906bc790ff628ce38e092d7df22ee73efa01e`.
It uses event contract
`sha256:51299706fecc4485b039a4169e7b50b30dc04c447fb5cbf3f7366c9caef782cf`.

## Producer

The manifest names producer `5.0.0-rc.10`, source commit
`93a0de75a16c9e4cd29ec561d159b12add4bb3fd`, tree
`27489cb8e62e765cb1aee4b0521fc98cc72a04db`, builder pin
`05a9280f375c23b2e21e85f6834488bf6cc9d3dad8ff7ebbd383bb5a2b40f5f0`
(`rc10-operational-pin-01/BUILDER_PIN.json`, 7591 bytes) and runtime archive
`1354b327f4288530223181b5968b43b87a530ec048cddee5a86d984f04ae4fb9`. The source
tree now declares package identity `5.0.0-rc.12`; these data remain RC10
productions.

The native population ran the original RC10 runtime with two explicitly
corrected external source-view inputs. The corrected bytes are not part of the
original RC10 source:

| Target | Preimage SHA-256 | Postimage SHA-256 | Delta record |
|---|---|---|---|
| `test_env/support/root-installed-environment.mjs` | `48b5c453864c41d2b506801869e17b3a21ef5f3232a69c421e69168dbce15511` | `de52e0b3114318420ce56d83dff9de3ac2f8c3ed431b0f0a965dd9acad9b1436` | `HELPER.diff` 511 bytes, `d15f69a28c19434fddf53abb38cea06d8fc4aba616659c8340d6db696bded82c` |
| `test_env/fixtures/language-structural/leaf.mjs` | `63ca4427b4509f643fb58c38dd5e231c485187ae381082f710007872356e6c95` | `dfd366a2711bd4325f48c2249d10b74aafb59af7eb91e77a9a9804668c9ea67f` | `LEAF.diff` 3695 bytes, `11fce4538ce16a784fe5523704e061ea82dc5b6187665833b3ea79fdd986297f` |

The helper postimage restricts the legacy resolution path to one actual
executable C leaf. The leaf postimage recursively freezes the prepared
invocation data locally and keeps normal presentation. A capture-only
`result_text` presentation transform was applied separately before packaging,
which is why the native manifest request records
`responsePresentation: "result_text"`. The checked-in postimages carry no such
transform.

## Receipts

Under `/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/`:

| Receipt | Bytes | SHA-256 |
|---|---:|---|
| `evidence-generation-04/FINAL_RETURN.json` (native generation) | 7638 | `20c4a39693ac445923e5426096af46f17e60ac772bfdd4c979d4ac19ba8fb82d` |
| `evidence-generation-04/ACTUAL_CLOSURE.json` (native closure) | 18524 | `4274b9a472698fbf33bac373e9c4d2ac6165043200de9e10a3ec8e68659faabd` |
| `evidence-generation-04/CONTROLS.json` | 16033 | `ed78c1dcd579120aec2b87cfdfd4896c2be1f829b9d2dc6b6836d8866bfa32a9` |
| `evidence-generation-04/READY4.json` (command record) | 6238 | `8b4129667ddb4ea1e2b52a693e17e873c61a80fc769ff1aab9f2bd002e2d4963` |
| `reviews/current-evidence-004/native-assessment.md` | 8105 | `bc86138d3a3b53e1bb7fd94e2cb7a6ff5b9b25462b351a1302804b682b68b21b` |
| `fixture-staging-01/NATIVE_ASSESSMENT_RETURN.json` | 2026 | `34e15f84c8018153edca8363cfb80a685c820b59b2246bc1e543312f689b1790` |

The manifest's `externalEvidence` pins its raw setup, extraction, script,
environment and recovery inputs. They are provenance, not test inputs.

## Native assessment

79 complete original physical rows of run
`run://abiogenesis/52dc79c4ae2cd3c5f180e0b2a341c3f4f296c7adf34b5d999dd01eb61c7222bb`.
Physical row 72 is an `abg_admitted_body_reference_record`: logical ordinal 72
is the second `c_call_result_admitted`, whose value references row 40's
`c_call_result_value` slot. Only the owner decoder reconstructs it; raw JSON-line
recreation or unwrapping is invalid.

Two scripted actors (`malformed-actor.mjs`,
`11225f275863fd370717968b02104c964bbd222c53f679ab27619854ed5461f0`) each returned
the literal `{not-json`, which native assessment rejected. The first CCall was
judged `retry`, the second `blocked`, and row 79 is `run_stopped`. There is no
third actor, no retry-exhaustion claim, no live model and no qualification
claim.

`expected`, `request`, `observation`, `sourceEvidence` and
`actorTerminalEventRef` come from the independent owner extraction of the first
actor's admitted result, evidence and judgment, not from the projector under
test. `transportPrefixCount` 36 ends at that actor's terminal
`actor_invocation_failed`; `preterminalPrefixCount` 35 ends just before it.

## Loading

`test_env/support/t287-current-owner-evidence.mjs` is the only loader. It reads
the manifest and archive, checks `prefix.compressedBytes`/`compressedSha256`
and the decompressed `prefix.bytes`/`sha256`, then calls the current compiled
`validateHistoricalEvents(bytes, eventContractDigest)` and
`selectValidatedRuntimeEventPrefix(decoded)`. It preserves every original byte,
identity, absolute path, framing and profile. It creates no store and does not
restamp, re-admit, reindex or fall back. Missing or inconsistent data return to
Root: never regenerate or guess.
