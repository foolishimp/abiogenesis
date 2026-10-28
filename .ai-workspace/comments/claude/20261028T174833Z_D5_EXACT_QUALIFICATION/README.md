# D5 exact qualification of the candidate `fd38e8227`

Worker record for T-287 Phase D, package D5 (Opus 5.5). This is commentary.
The Return in `phase_d.md` (`## D5 return`) is the account. These files carry
only digests and paths (TD-19). Evidence stays in the run archive under
`build_tenants/abiogenesis/typescript/test_env/test_runs/qualification/`.

**Disposition.** Stopped before F11. No AF22 verdict was produced.

- **Stop A (measured).** The observed C2 runs inside one provider Bash call,
  and that call's default timeout is 120,000 ms. The recipe's bare commands
  take 230,017 ms.
- **Stop B (projected).** F11 J cannot be carried as the candidate is cut. Four
  contract and pack members each exceed the 1,048,576-byte prompt bound as raw
  text. The material floor is 45.08 USD, over the 40 USD cap. No construction
  provenance exists.

## Files

| File | Content |
|---|---|
| `roster.json` | 73 rows (families A5-F01..F17, 4.6 rows, S01/S02/S03/S06, claims), each with claims, carriers and disposition (54 covered, 2 intentionally removed, 17 gap). All 16 claims and 66 behaviors are placed. `coveragePublished` holds. |
| `intake.json` | Rules (i)-(iv) applied to each skipped case of the 39 vector lanes, including the three retired uat-harness cases. Also the lanes outside the vector and the dry runs. |
| `resources.json` | Coordinates of the committed qualification resources (commit `ddc1b091c`) and of the run-specific basis and scope. |
| `run.json` | The one prepare run: no provider calls, Public setup, program conformance, resource checks, C2 configuration, budget, recipe execution measurement, and record digests. |
| `verdict.json` | No AF22 verdict, and why. |
| `findings.json` | F-1 to F-9: the two stops, the cost floor, the provenance gap, the recipe preconditions, the design basis, the 263 s correction, the non-exported functions, and the snapshot sandbox. |
| `cold-reads.json` | The fresh-process re-derivation after commit 1. All seven rows are equal and the event log is unchanged. |
| `cost.json` | 0 provider calls, 0 USD. |
