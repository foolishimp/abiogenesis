# T-258 Public F_H Design Self-Review

## Scope

Reviewed the T-258 slice in
`build_tenants/abiogenesis/typescript/design/M03_M04_PUBLIC_SDK_CLI_BEHAVIOR_DESIGN.md`
against the active product-operation, F_H assurance, event, witness, and
three-view design authorities.

## Findings And Repairs

1. The first candidate treated `abg.operation.fh.answer-escalation` as an
   instruction to escalate and therefore always non-resumable. That was a
   semantic error. It is a response to an existing escalation. The design now
   derives eligible operation IDs and the resume-eligible subset from the
   selected GTL interaction carrier. No operation receives engine-authored
   resume policy.
2. A proposed convenience operation would have created a non-constitutional
   `fh.submit` identity. The accepted design uses only the five F_H operation
   IDs already fixed by `REQ-P-PUBLIC-CONTRACTS-008` plus `run.resume`.
3. The earlier retrospective design left F_H as `DeferredFhAct`. The replacement
   carries the pending interaction, actor, exact operation, choice or value,
   response contract, capability basis and provenance, continuation, events,
   and replay through all three views.
4. Resume could have been read as post-hold execution. The accepted design
   limits T-258 to actor-attributed resume admission over the same opaque
   continuation. T-267 remains the only owner of traversal-result consumption.

## Cross-View Review

- The domain view distinguishes prime declared request and event truth from
  downstream interaction/result projections and external effect-edge input.
- Every sequence participant exists in the domain model or is the named
  external operator.
- Every sequence message is an admission, projection, or canonical event act.
- Every state transition names M03, M04, the external operator, or T-267.
- No raw human value reaches traversal, projection closure, or graph success.
- The CLI owns no event reader, continuation, retry, scheduler, or private
  runtime state.
- The complete 36-operation catalog and post-resume traversal remain explicitly
  outside this acceptance.

## Mechanical Evidence

- Mermaid source census: 9 registered design files and 27 ordered diagrams.
- Real Mermaid renderer: green.
- Mermaid mutation suite: 5/5 green.
- `git diff --check`: green.

## Verdict

Pass for the bounded T-258 design after repair. Implementation may proceed.
