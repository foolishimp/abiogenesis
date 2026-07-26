# T-277 PC-007 Runtime Authority Designs Self-Review

**Status**: design self-review passed; independent closure review pending

**Candidate commit**: `f6f191b1`

**Designs**:

- `build_tenants/abiogenesis/typescript/design/M03_M04_PUBLIC_CATALOG_INVOCATION_AUTHORITY_BEHAVIOR_DESIGN.md`
- `build_tenants/abiogenesis/typescript/design/M03_M04_FH_RUNTIME_CONTINUATION_BEHAVIOR_DESIGN.md`

**Implementation authority**:
`.ai-workspace/comments/codex/20260714T140354Z_DECISION_fh_authorize_t277_implementation.md`

## Review Basis

The review traced the designs against:

- `REQ-P-POLICY-019..033` and `-041..046`;
- `REQ-P-PUBLIC-CONTRACTS-003` and `-008..010`;
- `REQ-M-GTL3-PROGRAM-TRAVERSAL-004..005` and `-011`;
- ABG interpretation, composition, continuation, event, projection, and
  witness requirements;
- ADR-043 and ADR-044;
- the current T-255, T-256, T-267, T-271, catalog invocation, engine runner,
  F_H interaction, public SDK, C-program receipt, and basis-event code; and
- the T-252 compiler probe's complete vector/locus construction path.

## Findings Repaired Before Acceptance

### 1. T-267 cardinality was initially described at the wrong locus

The first candidate wording implied one T-267 admission per invoking locus.
T-267 admits one complete vector authority after all locus result authorities
have been collected. T-256 requests remain locus-local.

The design now requires:

```text
one vector row
  -> one T-255 handoff and T-271 plan
  -> zero or more locus-local T-256 requests
  -> one complete result-authority set
  -> one T-267 admission
```

Runtime selection resolves the vector row first and the exact locus projection
second.

### 2. The first F_H design duplicated basis replay truth

The initial draft placed an execution-basis replay seed inside every
`FhInteractionOpenedEvent`. That would duplicate the same catalog, start,
runtime, policy, and authority-set truth when one basis opens more than one
interaction.

The corrected design extends the existing `BasisAdmittedEvent` with one closed
subordinate replay seed. F_H interactions cite that event. The seed count stays
`1 -> 1` per admitted basis.

### 3. Mixed old/new basis truth needed an explicit migration ruling

Binding the authority-set digest changes profile-aware basis identity. The
design now requires an inside-out hard break: old partial assembly cannot be
resealed under a new basis, and old caller-seeded F_H interactions remain
readable but cannot resume through the current path. Profile-free legacy
entries remain explicitly separate and cannot satisfy declared-program proof.

### 4. T-268 is a closure dependency

T-270 can implement and test its generic derivation against an admitted
manifest fixture, but its packed installed-workspace exit cannot close until
T-268 publishes and admits canonical manifest coverage. The dependency is now
explicit in T-270.

### 5. The focused governance proof hard-coded the prior design count

After both designs were marked accepted, the aggregate Prime gate passed but
the focused T-277 test still required exactly one accepted design and six
pending designs. That count described one checkpoint rather than a law.

The test now proves the stable relations: at least one governed and accepted
design exists, accepted plus pending equals the governed inventory, and both
candidate and reference inventories are non-empty. Negative fixtures continue
to prove the exact failure laws.

## Prime And Proportionality Review

- no public operation identity changes;
- public catalog start and `run.resume` remain two separate transitions;
- no session controller, second start router, second execution basis, second
  continuation family, or second C-program receipt family is introduced;
- M04-supplied runtime authority fields contract `3 -> 0`;
- active F_H opening producers contract `2 -> 1`;
- `BasisAdmittedEvent`, `CProgramAtomReceipt`, and the T-258 interaction events
  are extended in place because each already passes the Promotion Test;
- the multi-vector authority rows and basis replay seed remain subordinate;
  and
- T-271 remains the sole complete C-program interpreter.

## Implementation Tripwires

1. Production code must extract the complete compiler path into M03; importing
   or invoking the T-252 test probe is forbidden.
2. One T-267 admission must cover each complete vector. A per-locus admission
   or aggregate whole-GraphFunction admission is wrong.
3. C-program receipts must be reconstructed from canonical event truth and the
   sealed plan. A receipt side store is forbidden.
4. F_H response contract identity is insufficient by itself. The response
   value must pass the selected native or canonical schema admission before a
   successor receipt is admitted.
5. A successor receipt extends the existing receipt family and preserves the
   immutable held predecessor. Fork, cycle, duplicate successor, or mixed
   basis must fail.
6. `fh_escalated` may remain readable for historical logs but must have no
   active producer after T-272.
7. T-270 may not claim packed closure before T-268 supplies installed manifest
   truth.

## Verification

| Gate | Result |
|---|---|
| `git diff --check` | pass |
| Mermaid gate | 26 files, 78 diagrams, pass |
| T-270 Prime block | pass |
| T-272 Prime block | pass |
| aggregate Prime governance | pass with both designs accepted for implementation |
| focused T-277 governance proof after acceptance | pass without checkpoint counts |

## Verdict

Both PC-007 designs are fit for bounded implementation under the explicit
T-277 F_H authorization. This is design acceptance only. T-270 and T-272
remain active, T-268 remains a packed-closure dependency, and independent
implementation/closure review remains mandatory.

All commits remain local and unpushed. The pre-existing untracked
`build_tenants/abiogenesis/typescript/node_modules` link is excluded.
