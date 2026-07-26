# T-286 Exact-Candidate Manifest

## Subject

- ticket: `T-286`
- milestone: `GOAL-035 M4`
- root binding: `ABI5-ROOT-001`
- root governor: `abg5.root.s01.hello_world@5`
- branch: `codex/t286-abi5-root`
- implementation commit: `0e39d11c421bc40c4d94bef136181129bbbcff8d`
- implementation tree: `af564330b704215d164f75c22659a139b0f403e2`
- parent: `30686130360e5ecd0b5f8a532c098c827a005af5`
- accepted design SHA-256: `9faeb41ddac839edc9cd2ccb83ae11b05bb54d32168fc35e74a1a9cfb97e92f0`
- remote state: pushed to `origin/codex/t286-abi5-root`

This commit is the exact M4 implementation-review subject. This manifest is
evidence only and does not alter that subject.

The earlier subjects `03f65e6b7b1c14028a64cc21e8a7c6266fccd10d` and
`0481b51123392cc7bf72e1f0ac95ec3bae2464f5` are superseded. Their review and
closure claims do not carry into this candidate.

## Candidate Basis

| Field | Exact value |
|---|---|
| product | `product://abiogenesis/typescript-tenant@5.0.0-dev.286` |
| package | `@abiogenesis/typescript-tenant@5.0.0-dev.286` |
| packed artifact SHA-256 | `80c35c9a9cfff6938dc4aa59ad13b15eef8b625d8be08245bb826fae155ba04b` |
| Product content digest | `sha256:ae68ebb778084641cc4fcbac0ed4fcf823fdeced011358f6ced074545b610c25` |
| Product manifest digest | `sha256:57aea42fb10cef9304663eddfe761d6778d4dfc51767a77f68db238b835860c4` |

## Bounded Repairs

The candidate adds no new Product feature. It closes review findings at the
existing M4 authority boundaries:

1. setup-operation admission binds the exact invocation payload digest;
2. HoG refuses any leaf input that differs from the admitted raw-input basis
   before opening a C-call;
3. unexpected post-invocation exceptions become ABG invocation-refusal or
   runtime-failure truth instead of escaping the public shell;
4. the retained transcript preserves every public request and its correlation
   identity;
5. the governor binds exact setup event/outcome identities, exact run
   correlation, exact catalog cardinality, every durable event, and each
   canonical per-run byte prefix; and
6. installed mutations prove payload substitution, forged prefixes, extra
   events, duplicate run identities, post-admission exceptions, malformed
   leaves, copied execution bases, and rival controllers cannot satisfy the
   root.

## Verification

The exact subject passed `npm run test:m4` twice. Each run passed `23/23` with
zero failures, and all six retained proof files were byte-identical across the
two runs.

| Gate | Result |
|---|---|
| strict TypeScript build | pass |
| complete installed M4 suite | `23/23` pass twice |
| proof determinism | six of six files byte-identical |
| `git diff --check` before freeze | pass |
| `npm audit --audit-level=high` | zero vulnerabilities |
| retired compiled-plan/controller source scan | zero matches |

## Retained Proof Identity

| Proof | SHA-256 |
|---|---|
| `abi5-root-governor.json` | `63018f778f2c8f33cd494fb0e9856c27a57f85458a424f5026c1f356d9fd876d` |
| `abi5-root-r10.events.jsonl` | `963eaec715f78257688516aeb4f37034136ec3e9a53166b5342993847726f0fe` |
| `abi5-root-r10.json` | `7bc1cfc338b92164eed18872ca8a8a46f910bb923af16f1f7e1ae632447c7329` |
| `abi5-root-r10.outcomes.json` | `26ac0c392477ca62f0520724a66cfc82894e91e4e244cb2b98e253d06cd53cbd` |
| `abi5-root-r10.transcript.json` | `8e911342004bf6c7aeb40b737f9ea7442542c918bb915dc5be249b057a36f28f` |
| `abi5-root-rival-authority-mutations.json` | `dbc86e36d8d5b5007c306ef921ae5aab9fbf4ef05fb14684a7ae7f2d6c54d070` |

The retained governor reports `root_satisfied`, all `R1..R10` true, no first
frontier, no failures, 39 exact events, two distinct runs, and governor digest
`sha256:e9d6a57da89ebcc9a337efd4db7d0da5758c7692bf9732c82c1942ec6c316421`.

## Claim Boundary

This candidate proves only exact installed `ABI5-ROOT-001` on the trusted
developer desktop. It does not claim M5 behavior, complete ABIogenesis 5.0,
STDO 2.0 adoption, qualification, RC fitness, or release.

## Independent Review Contract

Review exact commit `0e39d11c421bc40c4d94bef136181129bbbcff8d` and attempt to
falsify:

1. the external artifact basis and source-independent install;
2. direct non-lowering GTL validation and HoG traversal;
3. Product-owned implementation resolution without concrete inventory
   authority;
4. ABG-only runtime event, result, judgment, transition, closure, and replay
   truth;
5. exact request, setup, run, event, and outcome identity coupling;
6. complete durable-prefix and all-event accounting;
7. input-basis, malformed-leaf, post-admission-exception, and post-open failure
   completion; and
8. the real-path rival-authority mutation proofs.

T-286 remains active until exact-subject reviews are reconciled and closure is
recorded separately. M5 remains held.
