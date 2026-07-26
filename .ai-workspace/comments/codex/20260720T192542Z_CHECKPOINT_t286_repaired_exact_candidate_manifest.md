# T-286 Repaired Exact-Candidate Manifest

## Subject

- ticket: `T-286`
- milestone: `GOAL-035 M4`
- root binding: `ABI5-ROOT-001`
- root governor: `abg5.root.s01.hello_world@5`
- branch: `codex/t286-abi5-root`
- implementation commit: `03f65e6b7b1c14028a64cc21e8a7c6266fccd10d`
- implementation tree: `20467b86f74d5674a390a6c44dd9b49525fe0556`
- parent: `cf8404881e13dd9bdc1b9e10bc6101b8548b4750`
- accepted design SHA-256: `9faeb41ddac839edc9cd2ccb83ae11b05bb54d32168fc35e74a1a9cfb97e92f0`
- remote state: pushed to `origin/codex/t286-abi5-root`

This commit is the exact M4 implementation-review subject. The later commit
that adds this manifest is evidence only and does not alter the subject.

## Candidate Basis

| Field | Exact value |
|---|---|
| product | `product://abiogenesis/typescript-tenant@5.0.0-dev.286` |
| package | `@abiogenesis/typescript-tenant@5.0.0-dev.286` |
| packed artifact SHA-256 | `928d2dd779ff6e6116b5d0fa11bf7f41b87eb3ef381ce353530148cff90fc7c6` |
| Product content digest | `sha256:e640c935b19a3734efd654c8de9f1390542d50d5ff5d4e835dbdda5a77c2068d` |
| Product manifest digest | `sha256:1193a290d437b7b1c8c4cc56e89124e7416e73ec4ae8f2435a7116a85a481970` |

The candidate basis is external to the package. Verification requires all six
artifact, content, manifest, Product, package-name, and package-version fields.

## Repaired Boundaries

The exact candidate repairs the failed review without changing Product or the
accepted design:

1. caller request identity is raw-admitted at the public boundary and checked
   independently by ABG, so a hidden/default target cannot be inserted after
   Product construction;
2. Product no longer imports concrete implementation inventory; graph
   validation precedes deterministic Product resolution over installed package
   descriptors, the validator checks declaration plus package identity, and
   ABG admits both binding and descriptor digests before HoG entry;
3. public transcript carrier state is behind the Product-owned
   `RootOperationState`; public remains fixed operation application and owns no
   target, topology, execution-basis, event, transition, or closure truth;
4. durable events append and fsync before the next effect, scoped replay rejects
   cross-run causation, and each PublicOutcome binds its exact durable log
   prefix by byte length and digest;
5. C-call open and fibre selection are staged and durably appended as one
   application admission batch; implementation exception, malformed return,
   sparse evidence, missing output fields, and admission rejection all complete
   a uniform typed failure spine rather than stranding an opened C-call;
6. runtime failure takes precedence over closure during replay, while duplicate
   or post-terminal closure cannot append a rival terminal fact; and
7. a destination-owned governor independently verifies packed bytes, exact
   public operation order, event identities and payload digests, causal scope,
   exact event spine, admitted result and judgment truth, durable prefixes, and
   all `R1..R10` obligations.

No compiled plan, generated program, default target, public controller, private
ExecutionBasis, rival event writer, qualification surface, release surface, or
M5 feature entered the candidate.

## Verification

The full command was run twice from the package root:

```text
npm run test:m4
```

Both runs passed `21/21` with zero failures. They covered `R1..R10`, six B8
test groups including four malformed-leaf cases, retained root-governor
reevaluation, cross-run causation refusal, and failure-over-close replay.

Additional gates:

| Gate | Result |
|---|---|
| strict TypeScript build | pass |
| `git diff --check` before freeze | pass |
| `npm audit --audit-level=high` | zero vulnerabilities |
| compiled-plan/controller/default-program source scan | zero matches |
| proof determinism across both full runs | all six retained hashes identical |

## Retained Proof Identity

| Proof | SHA-256 |
|---|---|
| `abi5-root-r10.events.jsonl` | `3ba091c28f9312fb9b9bdc74fa56d3cb32a2521fb1c7bbc0556b98d19b6ab0d9` |
| `abi5-root-r10.transcript.json` | `a7a785611815977427a993e9e38057f7739f1da474163abbd0ed39d6634baeed` |
| `abi5-root-r10.outcomes.json` | `e8eb22389db94002322da502cd65212b7b6d56de67cdf78d627ee911c0eb094e` |
| `abi5-root-governor.json` | `86846709dca836c09d728da3f9efd51e25d47bb17c23118e01e244610f43b43c` |
| `abi5-root-r10.json` | `35d9a4429f7da3387cffba7ccd1814b42f3149f13816a25fbd8684f920d98b17` |
| `abi5-root-rival-authority-mutations.json` | `b0567b137dca82178b8d6717a81e239165eb0a47cf801b4116b2251804f3b09f` |

The retained governor reports:

- disposition: `root_satisfied`
- governor digest: `sha256:a12058f5f59b191382137526c4a16ebc4839843f4e82d110f0bf461efa2b1068`
- first frontier: `null`
- obligations: `R1..R10 = true`
- event count: `39`
- run count: `2`
- failures: none

## Claim Boundary

This candidate proves the exact installed all-`F_D` root on the trusted
developer desktop. It does not claim full ABIogenesis 5.0 Product completion,
M5 behavior, STDO 2.0 adoption, qualification, RC fitness, or release.

The C-call opening batch supplies application-level all-or-none admission and
one append-plus-fsync for the opening pair. It does not claim a database-grade
power-loss transaction beyond the accepted trusted-desktop M4 boundary.

## Independent Review Contract

Reviewers shall inspect exact commit `03f65e6b7b1c14028a64cc21e8a7c6266fccd10d`
and attempt to falsify at least:

1. the external candidate basis and source-independent installed path;
2. GTL declaration and validator ownership without lowering;
3. Product package resolution without concrete inventory authority;
4. direct HoG traversal under explicit Run, GraphCall, and Frame scope;
5. ABG-only event, result, judgment, transition, closure, and replay truth;
6. cross-run and durable-prefix isolation;
7. uniform malformed-leaf and rejection completion;
8. real-path rival-authority mutations; and
9. the retained governor's independent derivation of `R1..R10`.

T-286 remains active until exact-candidate review is reconciled and its closure
state is updated separately. M5 remains held.
