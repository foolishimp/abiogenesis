# Compactness observation 01 — closed attempt002 row

This observation-only record preserves Root’s read-only analysis of the closed attempt002 prefix. The bookkeeping Writer did not rerun a census, inspect additional runtime state or select a repair. This is planning evidence, not Product acceptance, qualified performance proof or a new operation grant.

## Exact source

- Event log: [runtime-001/resources/events/runtime.events.jsonl](runtime-001/resources/events/runtime.events.jsonl)
- Byte offset: `76077460`
- Ordinal: `6808`
- Event ID: `event://abiogenesis/95908e471e91842d8db1b7b41eb1c1de4ec692534fa5b69f04ecda7e06d5c18c`
- Event kind: `c_call_result_admitted`
- Physical row size: `40175391` bytes
- Physical row SHA-256: `4a7a7e31fb80353fd41c1949733e34ff0109911b6c891c63a2b3a8b45658af20`

The source is this exact retained row within the closed attempt002 prefix; no claim covers the current whole event-log size or later appended events. `payload.value.context` is a `worksite_context_observation`: 978 entries, comprising 975 files and 3 directories; 975 base64 bodies; raw file `byteLength` total 29677282 bytes; 954 unique file digests.

## Root’s normalized JSON size estimates

These field-size estimates describe normalized JSON representations, not additional physical rows or independent additive storage categories. Nested totals overlap.

| Field or material | Estimated bytes |
|---|---:|
| context | 39938010 |
| entries | 39852095 |
| bytes-value fields | 39572954 |
| state | 235299 |
| Encoded string-body total | 39571004 |
| Unique encoded strings | 38217876 |

Largest entries reported by Root:

| Supplied entry label | Reported bytes |
|---|---:|
| contract-seeds/public-operation.schema.json | 3823875 |
| rule-catalog | 2356518 |
| self-conformance | 1400331 |
| expected-output-inventory | 1173633 |

These labels are retained as supplied; they are not asserted to be complete paths. Exact full paths remain available in the source row.

## Limits and next question

These are size and within-row duplication observations. They do not establish unnecessary work, avoidable storage, latency, cost or a percentage improvement. Base64 expands the representation. Cross-event reuse, required material, actual consumers and timing still require attribution before any bounded repair is selected at the existing owner. No compression fix, new mechanism or scope expansion is selected here.

The 611210 prompt-byte measurement belongs separately to attempt003’s controlled renderer. It is neither this row’s size nor a token count; it cannot be substituted for the row’s storage measurements or used to infer provider token usage. The [existing Executive next steps](EXECUTIVE_NEXT_STEPS.md) retain the measured-attribution and matched-trial sequence.
