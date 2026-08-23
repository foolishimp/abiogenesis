# T-287 Preterminal Process Confirmation Overlay

**Type**: STRATEGY  
**Status**: Frozen final bounded correction candidate; not operative authority  
**Incorporated base design**: SHA-256 `c295a065fb95eba780692310e99de7b9aa967d1f93c8fb23b9815326adabead9`  
**Incorporated first repair**: SHA-256 `b0582ef7e0789ac4cb2a52f4a61d7e146b22fbbaeae1df3be3368ef77b8428a0`  
**Incorporated second repair**: SHA-256 `d3dabca896de207185ff9e3641df3d52f76afc126b140deb93a59957f648a7da`  
**Correction scope**: preterminal confirmed Process terminality only  
**Base HEAD**: `a1fa19f68213aa0773b88b3b6ef9ba2e41f5ee99`  
**Product, requirements, GOALS, T-287, accepted design, production, and tests changed**: none

## Composition law

The exact candidate is the ordered composition:

```text
c295a065fb95eba780692310e99de7b9aa967d1f93c8fb23b9815326adabead9
then b0582ef7e0789ac4cb2a52f4a61d7e146b22fbbaeae1df3be3368ef77b8428a0
then d3dabca896de207185ff9e3641df3d52f76afc126b140deb93a59957f648a7da
then this overlay blob
```

All passed relations remain unchanged. This overlay corrects only the case in
which confirmed Process terminality was already admitted before Run
terminality.

## Preterminal confirmation law

An already-admitted preterminal `actor_process_exited` or
`actor_process_spawn_failed` is the one confirmed Process terminal variant for
that ActorInvocation/Process lifecycle. Replay carries that fact across Run
terminality. It does not initiate `actor_process_live` or `actor_cleanup_live`.

If Run terminality creates the single `actor_cleanup_pending` token while that
confirmed Process terminal fact already exists:

1. no `actor_process_exited.cleanup` or
   `actor_process_spawn_failed.cleanup` event may append;
2. the preterminal Process terminal event satisfies the confirmation
   prerequisite from the second repair;
3. only the remaining qualified `actor_invocation_failed.run_cleanup` or
   `actor_invocation_closed.cleanup` may append when the ActorInvocation lacks
   its terminal row; and
4. that ActorInvocation terminal row consumes the single cleanup token exactly
   once.

If the ActorInvocation terminal row was also already admitted preterminal,
replay consumes or omits any mechanically derived cleanup token without
appending another domain terminal event. No cleanup token may remain solely to
force duplicate terminal history.

The exact-one Process terminal cardinality spans preterminal and cleanup
variants together:

```text
count(
  actor_process_exited
  | actor_process_spawn_failed
  | actor_process_exited.cleanup
  | actor_process_spawn_failed.cleanup
) = 1
```

Any second Process terminal variant is invalid and refused with zero append.
This correction does not change cleanup output observation, live-process
preservation, `termination_unconfirmed`, successor barriers, immutable-link
observation, causation, ownership, or any other passed relation.

## Proof delta

Add only these two mutations:

1. admit a preterminal Process terminal fact, terminalize the Run, then attempt
   its `.cleanup` duplicate: zero append; and
2. admit a preterminal Process terminal fact without an ActorInvocation
   terminal row, terminalize the Run, append only the qualified ActorInvocation
   cleanup terminal, and prove single-token consumption.

F_H may accept or reject this exact additive overlay blob. Acceptance does not
authorize implementation or reopen any other relation.
