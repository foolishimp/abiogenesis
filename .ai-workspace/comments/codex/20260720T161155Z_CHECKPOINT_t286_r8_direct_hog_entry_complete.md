# T-286 R8 Direct HoG Entry Checkpoint

## Claim

`ABI5-ROOT-001` obligation `R8` is satisfied at implementation commit
`68aa3b10af3e1662cb3ea3706efce35bfdccd203`.

The installed public invocation now causally opens one ABG-owned Run,
GraphCall, and Frame. `openCall` returns one immutable
`OpenedTraversalScope` containing those exact refs. HoG consumes that explicit
scope and the admitted GTL values, derives an invocation-local cursor, and
stops at the declared all-F_D C locus.

## Authority Relation

```text
public_operation_admitted
  -> invocation_admitted
  -> implementation_admitted
  -> basis_admitted
  -> run_segment_opened
  -> graph_call_opened
  -> frame_opened
  -> HoG traversal cursor at the declared C locus
```

ABG owns the aggregate identities and events. HoG owns only direct traversal
and its subordinate cursor/stop values. The scope carries no selector, event
writer, implementation port, result, judgment, transition, or closure truth.

## Selective Donor Admission

No donor file crossed. The implementation is a fresh realization of T-284 D3
claims `RCI-03`, `RCI-04`, `RCI-06`, `RCI-07`, and `RCI-08`. It preserves the
4.6 causal Run/GraphCall/Frame relation while stripping compiled-plan entry,
engine runners, feature controllers, private basis construction, ambient
lineage lookup, implementation selection, and leaf effects.

## Proof

The source-blind packed-install suite passed `8/8`:

```text
npx tsc -p tsconfig.json --noEmit
npm run test:r8
npm audit --omit=dev --audit-level=high
git diff --check
```

The R8 evidence records artifact digest
`sha256:0e617bd19775a800b058afdfe251352e6f5d4c79f038b981cf12f4cad7bea1a8`
and exact Run, GraphCall, Frame, traversal-scope, cursor, and stop identities.

The installed mutation checks prove:

- a copied scope cannot enter HoG;
- a copied ExecutionBasis cannot open a Run;
- an admitted ExecutionBasis cannot open twice; and
- none of those refusals appends an event or reaches a CCall.

The installed HoG export contains no compiled-plan, scheduler, controller, or
hidden-default entry surface.

## Frontier

`R1-R8` are satisfied. The next and only Product frontier is
`R9_abg_admitted_causal_result_and_closure_events`.
