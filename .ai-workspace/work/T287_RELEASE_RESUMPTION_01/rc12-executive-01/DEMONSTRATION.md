# RC12 demonstration record

Executive record, commentary. Written by Claude Fable 5.2, 2026-11-11. One live Run and one comparison run. Both are single observations.

## Candidate

| Item | Value |
|---|---|
| Version | `5.0.0-rc.12`: local, unqualified, unpublished |
| Cut commit | `95da94e725c709b8307b125f20f350861fc1e8a3` on `claude/rc12-integration` |
| Archive | `~/Library/Application Support/ABIogenesis/releases/5.0.0-rc.12/abiogenesis-typescript-tenant-5.0.0-rc.12.tgz` |
| Archive digest | `sha256:db80a5dac52fac5a859daf45a646e21209e538c7093b443ffca6532e6be9e3ca`, 11,062,933 bytes, 5,327 members |
| Install | `~/Library/Application Support/ABIogenesis/installs/5.0.0-rc.12` |

## The task

The amendment witness (`build_tenants/abiogenesis/typescript/test_env/fixtures/amendment-witness/`): a small working order desk with an accepted specification. The amendment changes one business rule: orders above 10,000, not 5,000, require manager approval. An unrelated rule (a quantity discount) must stay as it is. The process definition is written once: intake triage, impact assessment, construction, testing, acceptance, two required reviews (impact and preservation), and the prerequisites "construction requires the impact review" and "acceptance requires the preservation review". The amendment is the only per-task input.

## Live Run

One public start, frozen to the cut archive, 2026-11-11 20:23:49 to 20:33:17 AEDT. Provider: Claude Code 2.1.322 running `claude-opus-5-5` at high effort for every role. Declared inactivity 300 s, absolute ceiling 1,800 s per call. Evidence: `qualification-scratch/rc12-executive-01/demo/live-01/` in the integration worktree (untracked).

| Step | Selected by the Executive | Elapsed |
|---|---|---|
| 1 | Intake triage | 54 s |
| 2 | Impact assessment | 60 s |
| 3 | Review: impact | 21 s |
| 4 | Construction | 37 s |
| 5 | Testing | 22 s |
| 6 | Review: preservation | 28 s |
| 7 | Acceptance | 33 s |

- **Outcome:** completed. Both required reviews satisfied and current. Acceptance satisfied.
- **Order:** the Executive followed the declared prerequisites. No out-of-order choice was attempted.
- **Agents:** 14 calls (7 selections, 3 work calls, 1 test run, 3 assessments). Every assessment ran in a different invocation from the work it assessed. Every call reported `claude-opus-5-5`.
- **Human interventions:** none. This candidate has no human-response path.
- **Elapsed:** 566 s. **Cost reported by the provider:** 9.21 USD. **Tokens:** 2,193,119.

Checked by the Executive on the result, independently of the Run:

- `src/approval.mjs` differs from the seed in one line: the threshold constant, 5000 to 10000.
- `test/approval.test.mjs` has boundary cases at 9,999.99, 10,000 and 10,000.01. All ten tests pass.
- `src/discount.mjs`, `test/discount.test.mjs`, `REQ-ORDER-DISCOUNT.md` and `src/order.mjs` are byte-identical to the seed.
- The Run wrote `work/intake-triage.md` and `design/impact-assessment.md`. The impact assessment names the change class, the affected surfaces and the preserved surfaces.

## What the live Run did not exercise

Nothing failed and nothing was refused, so the live Run shows the sunny path only. These behaviours are proved by scripted Runs on the same installed topology, with a stand-in model, in `test_env/tests/t287-amendment-witness.test.mjs` (12 of 13 cases pass; the thirteenth is the live case) and the files named:

| Behaviour | Proof |
|---|---|
| An out-of-order choice is refused before any effect, and the Executive selects again | Witness case W1; `t287-default-library-prerequisites` |
| An adverse required review keeps the Run open; a correction follows; only the affected review runs again | Witness sequence; `t287-default-library-reviews` |
| A worker failure returns to the Executive, which selects again and closes | Witness cases W2, W3; `t287-default-library-recoverable-failure` |
| A write outside the grant stops the Run | Witness case W4 |
| Repeated failure ends at the step limit, not in a loop and not as completion | Witness case W5 |
| A stopped Run reads back its reason, origin and unresolved obligations | `t287-readable-stops`, `t287-readable-stops-foldback` |
| A Run killed at a durable cursor continues once through the public continue | Three cases in `t287-default-library` and `t287-recursive-registered-selection`, at the one interruption boundary they cover |

## Comparison: the bare model CLI on the same amendment

One invocation of the same CLI and model on a copy of the same amended seed, with the amendment as its prompt. It was restricted to file edits and the test command inside the scratch copy. Evidence: `qualification-scratch/rc12-executive-01/demo/bare-cli-01/`.

| Measure | Governed Run | Bare CLI |
|---|---|---|
| Elapsed | 566 s | 49 s |
| Reported cost | 9.21 USD | 0.34 USD |
| Tokens | 2,193,119 | 308,232 |
| Agent calls | 14 | 1 |
| Implementation change | one line, threshold constant | the same line |
| Boundary tests added | yes | yes |
| Tests pass | 10 of 10 | 11 of 11 |
| Unrelated rule byte-identical | yes | yes |
| Intake triage and impact assessment written | yes | no (not asked) |
| Independent reviews of the result | two, plus acceptance | none |
| Evidence bound to the candidate and its inputs | yes | no |
| Out-of-scope writes prevented by the framework | within the read roots | not applicable; none occurred |

On this amendment the bare CLI produced an equivalent change in about one eleventh of the time and one twenty-seventh of the cost. The governed Run added the triage, the impact assessment, two framed reviews, an acceptance verdict and the record. The comparison script's deterministic acceptance check marks the bare result unmet on "no declared source changed" because it binds source digests before the change, where the governed Run binds them when the assessment is prepared. That is an artifact of the script, not a defect in the bare result.

One observation of a one-line change says nothing about work that spans corrections, failures or sessions. It does show the fixed cost of governance on a small task: seven selection calls cost 2.87 USD, and six work and assessment calls cost about 1 USD each.

## Coverage of the method

`demo/live-01/stdo-coverage.md` lists the method relations this configuration exercises and those it does not. The claim is a tested amendment workflow, not an implementation of the whole method. Every role ran on one model family, which the method's evaluation standard does not count as independent assessment.
