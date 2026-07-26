# T-286 Superseding Exact-Candidate Manifest

## Subject

- ticket: `T-286`
- milestone: `GOAL-035 M4`
- root binding: `ABI5-ROOT-001`
- root governor: `abg5.root.s01.hello_world@5`
- branch: `codex/t286-abi5-root`
- implementation commit: `0481b51123392cc7bf72e1f0ac95ec3bae2464f5`
- implementation tree: `18b019f4ca560cb85b833827fe6ce1b244911443`
- parent: `b3d73675b3809ec061668fe38901b2357a994c93`
- accepted design SHA-256: `9faeb41ddac839edc9cd2ccb83ae11b05bb54d32168fc35e74a1a9cfb97e92f0`
- remote state: pushed to `origin/codex/t286-abi5-root`

This commit is the exact M4 implementation-review subject. This manifest is
evidence only and does not alter that subject.

The earlier subject `03f65e6b7b1c14028a64cc21e8a7c6266fccd10d` and its manifest
are superseded. A valid extra event could be appended to the retained ledger
without making that governor red. No review or closure claim from the earlier
subject carries into this candidate.

## Candidate Basis

| Field | Exact value |
|---|---|
| product | `product://abiogenesis/typescript-tenant@5.0.0-dev.286` |
| package | `@abiogenesis/typescript-tenant@5.0.0-dev.286` |
| packed artifact SHA-256 | `928d2dd779ff6e6116b5d0fa11bf7f41b87eb3ef381ce353530148cff90fc7c6` |
| Product content digest | `sha256:e640c935b19a3734efd654c8de9f1390542d50d5ff5d4e835dbdda5a77c2068d` |
| Product manifest digest | `sha256:1193a290d437b7b1c8c4cc56e89124e7416e73ec4ae8f2435a7116a85a481970` |

The six-field external candidate basis is unchanged because this repair alters
only the retained proof input and destination-owned governor. Package bytes and
runtime code are unchanged from the repaired implementation candidate.

## Superseding Repair

The governor now:

1. verifies every setup and run `PublicOutcome` identity, not only run
   outcomes;
2. binds the exact Hello World request input to its admitted result;
3. binds setup events to the returned ProductInstall, WorkspaceBinding,
   AdmittedCatalog, CatalogView, invocation, and causation identities;
4. requires unique caller-invocation, runtime-invocation, and Run identities;
5. accounts for every durable event exactly once against the fixed setup rows
   and per-run event spine;
6. verifies each outcome's byte-bounded durable prefix, event count, digest,
   newline boundary, and monotonic growth; and
7. requires the final durable prefix to cover the complete event-log bytes.

The retained transcript now carries the caller-declared Hello World input. It
does not add runtime authority or a fixture-authored result.

Five real mutation negatives prove that the governor turns red for:

- one extra fully valid but unaccounted event;
- an invalid setup `PublicOutcome` digest;
- a valid setup outcome whose admission-event reference disagrees with ABG;
- trailing bytes outside the final durable prefix; and
- duplicated runtime and Run identities hidden behind a recomputed valid
  outcome digest.

## Verification

The exact subject passed the complete command twice:

```text
npm run test:m4
```

Both runs passed `21/21` with zero failures. All six retained proof files were
byte-identical across both runs.

| Gate | Result |
|---|---|
| strict TypeScript build | pass |
| focused R10 plus root-governor tests | `2/2` pass |
| complete installed M4 suite | `21/21` pass twice |
| `git diff --check` before freeze | pass |
| `npm audit --audit-level=high` | zero vulnerabilities |
| retired compiled-plan/controller/default-program source scan | zero matches |

## Retained Proof Identity

| Proof | SHA-256 |
|---|---|
| `abi5-root-r10.events.jsonl` | `3ba091c28f9312fb9b9bdc74fa56d3cb32a2521fb1c7bbc0556b98d19b6ab0d9` |
| `abi5-root-r10.transcript.json` | `87135117f6f667979dc64526e9627bf3cab68de62d252ccf69ce256d387d2a74` |
| `abi5-root-r10.outcomes.json` | `e8eb22389db94002322da502cd65212b7b6d56de67cdf78d627ee911c0eb094e` |
| `abi5-root-governor.json` | `86846709dca836c09d728da3f9efd51e25d47bb17c23118e01e244610f43b43c` |
| `abi5-root-r10.json` | `35d9a4429f7da3387cffba7ccd1814b42f3149f13816a25fbd8684f920d98b17` |
| `abi5-root-rival-authority-mutations.json` | `b0567b137dca82178b8d6717a81e239165eb0a47cf801b4116b2251804f3b09f` |

The retained governor reports `root_satisfied`, all `R1..R10` true, no first
frontier, no failures, 39 events, two distinct runs, and governor digest
`sha256:a12058f5f59b191382137526c4a16ebc4839843f4e82d110f0bf461efa2b1068`.

## Claim Boundary

This candidate proves only exact installed `ABI5-ROOT-001` on the trusted
developer desktop. It does not claim M5 behavior, complete ABIogenesis 5.0,
STDO 2.0 adoption, qualification, RC fitness, or release.

## Independent Review Contract

Review exact commit `0481b51123392cc7bf72e1f0ac95ec3bae2464f5` and attempt to
falsify:

1. the six-field external artifact basis and source-independent install;
2. direct non-lowering GTL validation and HoG traversal;
3. Product-owned implementation resolution without concrete inventory
   authority;
4. ABG-only runtime event, result, judgment, transition, closure, and replay
   truth;
5. complete setup and run event/outcome identity coupling;
6. exact durable-prefix and all-event accounting;
7. malformed-leaf and post-open refusal completion; and
8. the real-path rival-authority mutation proofs.

T-286 remains active until exact-subject reviews are reconciled and closure is
recorded separately. M5 remains held.
