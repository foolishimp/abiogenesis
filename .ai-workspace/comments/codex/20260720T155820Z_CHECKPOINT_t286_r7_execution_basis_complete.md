# T-286 R7 Execution Basis Checkpoint

## Claim

`ABI5-ROOT-001` obligation `R7` is satisfied at implementation commit
`9a5b1fbff70df2859568af8ea13ea750bdf2473d`.

The installed Product now materializes the original admitted GraphFunction
template, validates that graph without lowering it, admits the exact validated
implementation resolution, and records one immutable `ExecutionBasis` in ABG
truth. No HoG traversal, Run, GraphCall, Frame, CCall, or leaf effect occurs at
this checkpoint.

## Authority Relation

```text
admitted InvocationAdmission
  -> GTL materializes the original GraphFunction template
  -> validator checks exact topology, input, invocation, and Program basis
  -> Product resolution candidate remains non-authoritative
  -> validator checks exact packaged implementation relation
  -> ABG admits implementation resolution
  -> ABG admits ExecutionBasis
```

The admitted resolution carries the candidate digest, independent validation
identity, package identity, implementation symbol, and all four contracts. The
ExecutionBasis binds the invocation, Program validation, Graph validation,
materialized Graph, admitted implementation resolution, and closure contract.

## Selective Donor Admission

No donor file crossed. The implementation is a fresh realization under the
accepted M3 design. The retained claim is the 4.6 direct-traversal requirement
that one exact function, input, implementation, and closure basis be fixed
before effects. The stripped authorities are compiled plans, generated runtime
programs, installer or CLI basis authorship, hidden implementation selection,
and controller scheduling.

## Proof

The source-blind packed-install suite passed `7/7`:

```text
npx tsc -p tsconfig.json --noEmit
npm run test:r7
npm audit --omit=dev --audit-level=high
git diff --check
```

The R7 evidence records artifact digest
`sha256:1ec342976a1d821532124dd6d02c9cdea2856431ecf012bd42eb2e65ef3b6676`
and the admitted event suffix:

```text
implementation_admitted
basis_admitted
```

Two real-path negatives passed:

- an altered GraphFunction template produced static `topology_mismatch`, then
  a real `invocation_refused` event, with no implementation or basis admission;
- a copied implementation-resolution validation lacked package construction
  identity and produced `invocation_refused`, with no implementation or basis
  admission.

No fixture wrote the expected admission or refusal event. Both were produced
by the installed ABG event authority.

## Frontier

`R1-R7` are satisfied. The next and only Product frontier is
`R8_hog_execution_entered_through_public_invocation`.
