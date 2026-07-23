# T-270 Workflow.C And F_P Authority Checkpoint

- Status: implementation checkpoint; exact commit ready for review
- Implementation commit: `898f7bd5aa115bc1a4e653d070ddc9a8b2723bb8`
- Accepted design: `d6da426947e1b7e18e7ed5bd1c0f945dcde9c73f`
- Root binding: `ABI5-ROOT-001`
- Ticket: `T-270`

## Claim

The direct-GTL M5 line now executes one ordinary `workflow.C` child traversal
without a compiled or lowered carrier and closes the bounded F_P authority
findings accepted at the preceding checkpoint.

The installed authority path remains:

```text
GTL.TypeScript declaration
  -> non-lowering validation
  -> HoG direct parent and child traversal
  -> admitted implementation or child-preparation port
  -> ABG events, evidence, result, judgment, route, replay, and closure
  -> thin Public projection
```

## Realized Boundary

- `workflow.C` opens a transparent parent `CCall`, admits a child
  `ExecutionBasis`, opens a child GraphCall and Frame in the same Run, and
  folds the admitted child result and judgment back as sub-traversal evidence.
- Child preparation is Product-bound behind an opaque port. The package cannot
  mint either the child-preparation port or the admitted leaf-execution port.
- Public calls HoG once. HoG owns traversal and recursion; ABG owns runtime
  truth; the implementation owns only its declared leaf effect.
- F_P transport identity includes parser and prompt-delivery semantics. Lane,
  process contract, and dispatch ordinal are admitted inputs rather than
  ambient aliases.
- One F_P `CCall` can dispatch one actor invocation. Unavailable executables
  produce typed process events, observed termination remains truthful, and
  valid output is salvaged only from transport failure rather than contract
  failure.

## Exact Candidate

- Artifact digest:
  `sha256:c55823ad7c3ae6e77d2cba8ab9546760a20bf9646308af0d58e4a45fbe2827d8`
- Product-content digest:
  `sha256:fbee11f6225a6462c5de97420b9d39278f225a5ea79f9ff41fd433307f5985ba`
- Manifest digest:
  `sha256:e65139b6f993f6fc556a884be2bb27abd307220e0c0c448acbf5e66bf76a015b`

## Verification

- `npm run test:m5`: `34/34`
- `npm run test:m4`: `26/26`
- `git diff --check`: pass
- Root governor: `root_satisfied`, `R1-R10` true, no first frontier
- Installed absence: no `CompiledCProgramPlan`, compiled execution
  declaration, public control loop, or runtime program catalog

The workflow positive proves one Run, two GraphCalls, two Frames, two CCalls,
one admitted child foldback, one sub-traversal evidence row, and one terminal
Run closure. The negative refuses a CatalogView that omits the declared child
before runtime truth opens.

## Remaining Frontier

This checkpoint does not close `ABG5-S02` or M5. Remaining T-270 work is:

1. derive the complete forty-row traversal matrix from the ordinary runtime;
2. prove the separate shape-preserving fibre-substitution differential;
3. run a genuinely live probabilistic worker through the same admitted F_P
   path; and
4. reconcile the remaining RC5 semantic dispositions owned by this boundary.

After that frontier, the planned M5 sequence moves to T-272 durable F_H
continuation and One Surface.
