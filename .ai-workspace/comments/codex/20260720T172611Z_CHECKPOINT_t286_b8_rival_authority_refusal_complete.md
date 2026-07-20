# T-286 B8 Rival-Authority Refusal Checkpoint

## Claim

The installed `ABI5-ROOT-001` public path refuses all six named rival-authority
carriers before runtime admission. This closes B8 only. Exact-candidate review
and T-286 closure remain open under B9.

## Exact Basis

- implementation commit: `16bca623008b76f0e0e7d619e15ff6991db3ed7e`
- implementation tree: `3771c08f608d42ed57082ea8fea36f63f538ad6c`
- branch/upstream: `codex/t286-abi5-root`
- accepted design SHA-256:
  `9faeb41ddac839edc9cd2ccb83ae11b05bb54d32168fc35e74a1a9cfb97e92f0`
- root binding: `ABI5-ROOT-001`

## Installed Negative Proof

The source-blind packed CLI was invoked six times with one prohibited carrier
added to the exact `run.invoke` payload:

| Mutation | Injected carrier | Observed result |
|---|---|---|
| compiled plan | `compiledPlan` | typed `invalid_request`; no runtime identity or event log |
| hidden/default target | `defaultProgramRef` with the explicit Program removed | typed `invalid_request`; no runtime identity or event log |
| renamed controller | `controller` carrying the expected output | typed `invalid_request`; no runtime identity or event log |
| private execution basis | `executionBasis` | typed `invalid_request`; no runtime identity or event log |
| event bypass | `events` containing a fixture-authored close | typed `invalid_request`; no runtime identity or event log |
| fixture result/closure | `result` plus `closed` | typed `invalid_request`; no runtime identity or event log |

Every mutation exited `2`. The five prerequisite public operations remained
green, while `run.invoke` refused before a canonical runtime invocation, Run,
CCall, replay digest, or durable event log existed.

The installed generated JavaScript was also scanned for the retired carriers
`CompiledCProgramPlan`, `CompiledExecutionDeclaration`, `publicControlLoop`,
and `runtime-program-catalog`; all were absent.

## Verification

From `build_tenants/abiogenesis/typescript`:

```text
npm run test:m4
12 tests, 12 pass, 0 fail

npm audit --omit=dev --audit-level=high
0 vulnerabilities
```

Repository `git diff --check` passed and the worktree remained clean. The
generated mutation evidence SHA-256 was:

```text
7e1eb80b30cfe76b47fbdd35a4f24eabe0f061593bad2e8486f7b836d36ce6e5
  test_env/evidence/abi5-root-rival-authority-mutations.json
```

## Frontier

`B8` is complete. The current typed frontier is `B9`: independent ownership
and package/proof review over the exact candidate, bounded repair if needed,
then an immutable closure receipt.
