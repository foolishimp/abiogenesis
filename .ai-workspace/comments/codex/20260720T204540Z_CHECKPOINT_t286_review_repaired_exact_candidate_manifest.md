# T-286 Review-Repaired Exact-Candidate Manifest

## Subject

- ticket: `T-286`
- milestone: `GOAL-035 M4`
- root binding: `ABI5-ROOT-001`
- root governor: `abg5.root.s01.hello_world@5`
- branch: `codex/t286-abi5-root`
- implementation commit: `ffba4e71456cf19168fa2bbf2981b463e018a0cf`
- implementation tree: `5c0b9ea7e4e93dbdaf79a7cf9527c4aafcda7aa3`
- parent: `a4c680198ca44c4cdb0ee874f3f0fb0ed62feee4`
- accepted design SHA-256: `9faeb41ddac839edc9cd2ccb83ae11b05bb54d32168fc35e74a1a9cfb97e92f0`
- remote state: pushed to `origin/codex/t286-abi5-root`

This commit is the exact review-repaired M4 subject. This manifest is evidence
only and does not alter that subject.

The prior implementation subjects `03f65e6b7b1c14028a64cc21e8a7c6266fccd10d`,
`0481b51123392cc7bf72e1f0ac95ec3bae2464f5`, and
`0e39d11c421bc40c4d94bef136181129bbbcff8d` are superseded. Their review or
closure claims do not substitute for review of this exact subject.

## Candidate Basis

| Field | Exact value |
|---|---|
| product | `product://abiogenesis/typescript-tenant@5.0.0-dev.286` |
| package | `@abiogenesis/typescript-tenant@5.0.0-dev.286` |
| packed artifact SHA-256 | `ec3b3fd74370763358a17623544a2d2c177163da19595ea1437f65f0c76bbe55` |
| Product content digest | `sha256:7e18de05fe191aec3a1eda68632c3d5bde0aa77fded2bb25402e8bc515db03db` |
| Product manifest digest | `sha256:9eaaa298940ed656b0711c672c81515b76754c217c0de1b4029385239cccdbd8` |

## Review Reconciliation

Three decorrelated reviews examined superseded subject `0e39d11c`:

- proof integrity: no findings;
- installed public surface: no findings; and
- architecture and authority: one P1 post-open CCall-totalization finding and
  one P2 setup-payload-schema finding.

This exact subject repairs both findings without expanding Product scope:

1. every setup operation and nested workspace-roots object rejects undeclared
   payload fields;
2. a throwing GTL judgment relation is totalized by HoG into an admitted
   blocked judgment on the already opened CCall;
3. the same CCall retains its exact opened, fibre-selected, evidenced,
   result-admitted, and judged spine; and
4. no direct `runtime_failure_observed` shortcut is emitted for that post-open
   case.

Real installed mutations cover five undeclared setup-payload variants and a
throwing post-open judgment relation. The latter produces a replay-derived
blocked public outcome and leaves the M4 root red rather than fabricating
success.

## Verification

The exact subject passed `npm run test:m4` twice. Each run passed `25/25` with
zero failures. All six retained proof files were byte-identical across runs.

| Gate | Result |
|---|---|
| strict TypeScript build | pass |
| complete installed M4 suite | `25/25` pass twice |
| proof determinism | six of six files byte-identical |
| `git diff --check` before freeze | pass |
| `npm audit --audit-level=high` | zero vulnerabilities |
| retired compiled-plan/controller source scan | zero matches |

## Retained Proof Identity

| Proof | SHA-256 |
|---|---|
| `abi5-root-governor.json` | `3993de9e3608bd1d32cde380282fd96739495f94a9d26d43491e13f4ddc15d9d` |
| `abi5-root-r10.events.jsonl` | `f705692daeb9124b4f3b90fa543a18ef6a31dfe229a9e4de64003cccca8ec860` |
| `abi5-root-r10.json` | `565cf80ab280a0365a03f58d458d2eb50632f97d04052a9c8ff2961a593968bb` |
| `abi5-root-r10.outcomes.json` | `193f638a97a3eda2fadff1036008763bc6e732aa06f249eb5cb6c5722a1a3a21` |
| `abi5-root-r10.transcript.json` | `24a4f10e7e7ef5b8eb10e7b52abdc4477baaf2c30cedfbcbc77d2f6ac240bb4f` |
| `abi5-root-rival-authority-mutations.json` | `2e1fa6641482f62abbae0ef07d2fa0aa6907e72466c1d3296d477e84e8e6e3e1` |

The governor reports `root_satisfied`, all `R1..R10` true, no first frontier,
no failures, 39 exact sunny-path events, two distinct runs, and governor digest
`sha256:758568bcb7580b558bd0cf129f4f381b03bfe5060d33290d0800c4c9d0b6deb8`.

## Claim Boundary

This candidate proves only exact installed `ABI5-ROOT-001` on the trusted
developer desktop. It does not claim M5 behavior, complete ABIogenesis 5.0,
STDO 2.0 adoption, qualification, RC fitness, or release.

## Independent Re-Review Contract

Review exact commit `ffba4e71456cf19168fa2bbf2981b463e018a0cf` without changing
the shared worktree branch or HEAD. Attempt to falsify:

1. exact setup schema refusal and payload/event coupling;
2. same-spine completion for post-open implementation, validation, admission,
   and judgment failures;
3. direct GTL-to-HoG traversal and ABG-only runtime truth;
4. source-independent package identity and clean install;
5. exact durable-prefix and all-event accounting; and
6. real installed rival-authority mutation evidence.

T-286 remains active until this exact subject is accepted and closure is
recorded separately. M5 remains held.
