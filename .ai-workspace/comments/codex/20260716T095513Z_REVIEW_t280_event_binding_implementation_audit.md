# T-280 Event-Binding Implementation Audit

- audited accepted design digest: `411ab4e3bbd978a45b7c136b5f0c17e55508a9c8cad5a7b1e5fdf45fe6733758`
- repaired candidate digest: `9bf1577056bb5dc2a111d6cdc95ca7626864179868f99023ddfb50d6d84efa18`
- disposition: prior acceptance superseded for implementation; runtime remains frozen

## Finding

The accepted design placed One Surface invocation and result bindings on
`c_call_opened` and `c_call_result_admitted`. That is not implementable against
the accepted runtime contract. CCALL-002 makes `c_call_opened` locus-only, and
the clean baseline admits closed C-call event shapes. The dirty T-270/T-272
wave's optional `sourceEventRefs` field is provisional and is not authority for
T-280.

## Repair

The repaired design changes no runtime event kind or field. It binds each
authority function's exact result-bearing C-call through the existing sequence:

```text
c_call_opened
-> c_call_fibre_selected
-> authority_snapshot_admitted
-> payload_observed
-> payload_validated
-> evidence_admitted
-> c_call_evidenced
-> c_call_result_admitted
-> c_call_judged
```

`c_call_evidenced.evidenceRefs` encloses the existing authority-snapshot,
validation, and evidence identities. One total replay projection derives a
closed `success | refusal | invalid` relation in canonical admission-ordinal
order. One rule whose identity includes the admitted application digest maps
success/refusal bindings to replay fluents. The rule adds no hidden selector or
resolver. The GTL program identity remains distinct from the selected
per-member complete-C program identity.

## Gate State

- individual Mermaid gate: 3/3 passed
- Prime candidate gate: passed
- Pandoc: passed
- target diff check: passed
- implementation: not authorized until independent review accepts the exact
  repaired digest
