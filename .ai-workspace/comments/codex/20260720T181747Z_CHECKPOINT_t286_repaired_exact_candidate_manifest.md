# T-286 Repaired Exact Candidate Manifest

## Status

`ABI5-ROOT-001` has one repaired implementation candidate at
`b59936897c921402f0ac82fa0b80880be779bf9d`. The candidate is frozen and
pushed for independent review. This manifest records identity and evidence; it
does not accept M4 or close T-286.

## Exact Subject

- branch: `codex/t286-abi5-root`
- candidate commit: `b59936897c921402f0ac82fa0b80880be779bf9d`
- candidate tree: `a986c3981905e3b07dd1c1a9d2e09860028b6f62`
- parent commit: `f4215dd0b987880265814b0a45b87ca7cd99f676`
- accepted design:
  `build_tenants/abiogenesis/typescript/design/M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md`
- accepted design SHA-256:
  `9faeb41ddac839edc9cd2ccb83ae11b05bb54d32168fc35e74a1a9cfb97e92f0`
- changed files: `30`

The subject changes runtime, public-boundary, installed-path test, and retained
proof files only. Ticket status, GOALS, Product, requirements, accepted design,
package metadata, and release state are outside the candidate commit.

## External Candidate Basis

The qualification fixture is outside the packed product and pins:

- artifact digest:
  `sha256:79049e20b41207b05c3fa664406dcefb1b740f6bb19ad9646d852e49255cee88`
- Product content digest:
  `sha256:d92b388eb0cb0f2ed861a4f59706637fd362037b6851f8568111ef96c1cfde54`
- manifest digest:
  `sha256:04d2e0f619cc592eaa87dd9854cd04b0f65a2898dcd5532829f53ae248f513c2`

R1 mutates the packed payload, regenerates the artifact's internal manifest and
content identities, and still requires refusal against this external basis.

## Repaired Review Findings

The candidate addresses every finding in
`20260720T174114Z_REVIEW_t286_exact_candidate_changes_requested.md`:

1. Product verification consumes external artifact, content, and manifest
   identities.
2. ABG appends and fsyncs each admitted event before publishing in-memory
   truth or permitting the next effect.
3. replay and projection select one invocation/run episode while retaining one
   durable multi-run event log.
4. post-admission traversal, implementation-load, contract, and transition
   failures become ABG runtime-failure truth.
5. leaf exceptions and malformed returns complete the evidence, result, and
   judgment failure spine.
6. B8 mutates distinct installed owner boundaries and the real public path.
7. R10 retains deterministic proof and its referenced durable event log.

## Verification

- strict TypeScript build: pass
- focused M4 suite: `18/18` pass
- npm audit: `0` vulnerabilities
- `git diff --check`: pass
- packed source-blind installed path: pass
- two valid runs in one CLI transcript: pass
- replay fold one equals replay fold two for both runs: pass
- independent review: pending against the exact candidate commit

Retained proof identities:

- `abi5-root-r10.events.jsonl`:
  `75be104645a762c5a5ffaf0d6757a70df4b2f8119955e253df771898fa78112e`
- `abi5-root-r10.json`:
  `20c6cdfc8c9581750bf929dbdedd9231594fd1294dbf1d55758846f90230275e`
- `abi5-root-rival-authority-mutations.json`:
  `f88ad387de56ae3477e8c18d50e62f727dce94e1d0170e610272956705e23768`

Two complete consecutive M4 runs produced the same three proof identities.

## Review Contract

The reviewers must falsify, rather than restate, these claims:

1. packed bytes cannot mint or select their own expected identity;
2. no admitted event becomes runtime truth before durable append succeeds;
3. a second run cannot contaminate the first run's replay or projection;
4. every post-admission terminal path has replay-constructible ABG truth;
5. implementation exceptions and malformed returns preserve the uniform C-call
   spine;
6. each B8 mutation crosses the intended installed authority boundary; and
7. retained proof is source-independent, reproducible, and refers to retained
   bytes.

Any load-bearing finding keeps T-286 active and requires a new exact candidate.
