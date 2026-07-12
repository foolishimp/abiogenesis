# HANDOFF: T-266 Realization Complete, Closure Review Pending

- ticket: T-266
- branch: `codex/t266-stage`
- implementation_commit: `1fe1142`
- base_commit: `9340725` (`origin/main` at handoff)
- state: realization complete; ticket remains active
- next authority: user/independent closure review

## Boundary

T-266 realizes the accepted native Node/interface type-witness design over the
existing M01/M02/M03 line. It adds no GTL runtime, eighth C constructor,
serialized witness carrier, schema catalog, Consensus domain path, event, or
replay behavior.

The work was performed in the isolated clean worktree
`/Users/jim/src/apps/abiogenesis-t266-stage`. The dirty main worktree at
`/Users/jim/src/apps/abiogenesis` was not changed or used for proof.

## Realized Relation

- `TypedNode<T>` derives `T` from one trusted decoder and binds it to the exact
  admitted ordinary Node ref and full contract key.
- `TypedVectorNode<T>` binds the exact scalar member witness and canonical
  `Vector[T]` relation.
- `TypedInterface<Value, Nodes>` preserves one exact non-empty readonly witness
  tuple, order, cardinality, opaque refs, and full contract keys.
- The existing seven C constructors preserve a private Node-backed boundary.
- GraphFunction, GraphVector, HOF, and M03 joins recompute ordinary canonical
  identity; native brands and decoders do not serialize.
- Symbolic fan-in boundary contradictions are `invalid_program` before the
  separately owned runtime gap.

## Proof History

The first commit-relative diff execution witness failed with 47 changed
executable lines not exercised, despite the then-green broad suite. The missing
families were defensive authority, identity, cardinality, admission, and HOF
branches. Public-entry adversarial cases were added for each family.

Final admitted evidence:

- focused T-266: 125/125
- standing GTL law: 82/82
- full semantic approving suite: 1559/1559
- commit-relative diff witness: 698 executable changed lines witnessed, 691
  changed lines classified non-executable, 0 violations
- T-223: 70/70
- T-250: 13/13
- strict TypeScript, semantic lint, GTL authority guard: pass
- generated publication and public catalog checks: pass
- Mermaid design gate: 5/5
- packed dry run and source-blind packed consumer: pass
- zero-Consensus scan and `git diff --check`: pass

The self-review is recorded at
`.ai-workspace/comments/codex/20260712T191224Z_SELF_REVIEW_t266_native_node_interface_witness.md`.

## Review Focus

1. Confirm that the trusted decoder is correctly bounded as native assertion,
   not public schema or runtime payload authority.
2. Confirm that private brands cannot downgrade through ordinary C overloads
   and that all seven existing constructors preserve exact interfaces.
3. Inspect same-contract/different-id and same-id/different-contract negatives;
   display or schema similarity must not replace opaque identity plus full key.
4. Confirm that GraphVector binding remains native proof only and does not mint
   a selector, declaration, or program id.
5. Confirm raw M02/M03 parity is limited to ordinary canonical identities and
   does not claim reconstruction of TypeScript structural types.
6. Confirm no Consensus vocabulary or domain fixture entered generic product
   code or proof identities.

## Stop Condition

Do not move T-266 to `completed/` or merge the review branch solely from this
self-review. Closure requires the pending user/independent verdict. Any defect
found there re-enters at the smallest affected realization or accepted-design
surface.
