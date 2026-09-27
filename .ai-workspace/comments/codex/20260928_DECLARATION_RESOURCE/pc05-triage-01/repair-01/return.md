# PC05 composite failure declaration — closed source return

Implemented the Executive-selected GLC `realization_refactor`. `program-construction.mjs` now declares the existing `contract://odd-glc/program-construction/failure@5` under `abg.failure_contract` on construction, evaluation and assessment composites. The consumer HOW composition paragraph links the accepted ABI pure-child rule and preserves the distinction from closure rejection. These are the only two canonical files changed; no ABI or test source changed.

| Frozen source | SHA-256 |
| --- | --- |
| `build_tenants/odd_glc/typescript/src/program-construction.mjs` | `8e74fb765276c38cc3b173704c7bf8d579f60b620a3f7620609a6f3d5e7095a9` |
| `build_tenants/common/design/ODD_GLC_PROGRAM_CONSTRUCTION.md` | `8b4fdb908cc8e30f565e7746e316fe439fe2cc664fcbdd4cbe2b3de48136cbed` |

`freeze.json` records preimages, exact selected core47 artifact, unchanged existing test source, diagnostic and result hashes. `git diff --check` passes.

The one selected existing test, **PC04 actual PC03 state joins complete original rubric/oracle and ordinary native assessment with no C2**, passed against the actual installed core47 public exports: 1 test, 0 failures, 5.783 s test / 6.271 s process. It exercises ordinary construction/evaluation/assessment Program and publication validation plus existing input/output joins with component fixture observations. Its package construction is pure in-memory construction, not archive/package/install execution. This is bounded component proof, not real native or assessment success. No broad suite ran.

The exact declaration projection passed in 2.280 ms / 257.514 ms process. Each current composite has zero local executable rows, resolves its explicit reference to exactly one existing published `failure` contract, and is byte-structure identical to its installed predecessor except for the one added declaration. Its closure row and inner GraphFunction call sequence remain exactly equal. Current child digests: construction `0bc50ab4dae2c53f0293ef4681c200409046de33d6620ed291ff90dfb8da0bf1`, evaluation `606a152e983e2a7e180eeb6f707884c08c2fb0f2de41bd351dc7d954a97cf706`, assessment `9d16df840545af0eab0b705d3956c74d173f236bc8538bd454678a31ccace335`.

Diagnostic correction is retained: the first supplemental projection attempted whole-publication validation on the standalone library, which lacks Program membership. That final assertion refused; the preceding exact child/contract assertions passed. Removed only that inapplicable assertion because the selected component already validates the actual composed Program/publication. Reran only the small projection, not the component test. `checks.json` and both outputs preserve this sequence.

No new events, journal reads, Run, provider invocation, worksite writes, install or archive/package operation occurred. Existing fixtures and installed declaration were read; no history copied. No repair/check phase exceeded 10 s. The prior installed execution/readback cost remains as recorded in the closed triage; this source repair makes no performance claim.

Existing core failure selection, native/evaluator failure ownership, blocked-candidate conservation and causal foldback remain unchanged. The generic early-validation completeness gap is an Executive residual, not silently repaired here. Fresh admitted workflow opening and installed construction/evaluation/assessment remain pending Root's reviewed package and original preserved live thread; no successful Run or original-task completion is claimed.
