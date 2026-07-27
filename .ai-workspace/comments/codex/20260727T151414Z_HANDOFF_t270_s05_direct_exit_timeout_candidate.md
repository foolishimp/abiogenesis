# T-270 S05 Direct-Exit Timeout Handoff

## Purpose

This handoff binds one exact replacement S05 realization candidate for
independent review. It addresses the single finding against candidate
`3e0a148a`: after the direct worker exited, its main deadline remained armed
while an inherited stdout pipe drained. The timer could therefore append false
timeout and signal-request process truth after `actor_process_exited`.

No Product, GTL, design, requirement, scenario, catalog, controller, runtime,
or event family changed. S06 remains held.

This is a worker handoff, not a semantic review verdict or S05 acceptance.

## Exact Subject

- accepted S03 base:
  `8865ccff844d06f4f97765f014ae2b59c1e7d84b`
- accepted S05 design:
  `283325aa082844ad4691ca07bb39882fda7152dc`
- superseded candidate:
  `3e0a148ae8ea3110d715cc142fb9708010876dcb`
- replacement candidate:
  `1ddc802d3003a3d0782398f7ec7c74cfa81ab127`
- candidate tree:
  `b50684077f95867a079b8f5435db10d61384b881`

The candidate-to-evidence delta is limited to `GOALS.md`, T-270, and this
handoff. Those surfaces project review state; they do not alter the candidate.
The isolated future T-247 qualification amendment remains unchanged at
`625cffed`.

## Realized Boundary

The direct-process `exit` handler now cancels the main timeout before it
records the exit observation or begins bounded pipe drainage. The existing
250 ms maximum diagnostic drain remains unchanged.

If timeout wins first, `timedOut` remains true and the existing termination
path is unchanged. If direct exit wins first, no later pipe-drain delay can
create timeout or signal-request truth.

The strengthened existing mutation establishes this order:

1. the direct worker schedules exit with status `47` at 50 ms;
2. the transport deadline remains set at 150 ms;
3. a descendant retains inherited stdout and emits at 225 ms; and
4. bounded drainage archives those late bytes as diagnostics.

The proof asserts status `47`, `timedOut === false`, one direct exit
observation, zero timeout observations, and zero signal requests. It also
retains the prior assertion that descendant output cannot enter semantic
`finalOutput`.

## Design Basis

No design amendment was required. The unchanged design already makes the
first terminal process boundary authoritative and limits semantic evidence to
bytes observed before timeout or direct-process exit.

The retained four-file design aggregate remains:

`015a158a8a636502e76b88fe87866633757deca597832e1010099ba371e13c2d`

## Mechanical Evidence

| Gate | Result |
|---|---:|
| Focused worker and portability lanes | `14/14` |
| Complete M5 | `161/161` |
| Retained M4 | `26/26` |
| `git diff --check` | pass |

Every aggregate reported zero failures, skips, and todos. The M5 count is
unchanged because this cut strengthens the existing descendant-output
mutation rather than adding another test.

## Reproducible Package

Two independent `git archive` extractions of exact candidate `1ddc802d` each
ran `npm ci` and `npm pack --json`. The resulting archives and sorted payload
inventories are byte-identical.

| Property | Exact value |
|---|---|
| Archive | `abiogenesis-typescript-tenant-5.0.0-dev.286.tgz` |
| SHA-256 | `7f5bbad797b85c5aff678aba225f409bfd168639a7c34a167af8fa08e1162376` |
| SHA-1 | `e38c9b92b534d143f65fe433f0fbdedc1788e116` |
| npm integrity | `sha512-DX2ffmA0JCVtgJyEfZEcxDeWk+QTup6L3NzvslGkuaRi6yu0jZ1PpTM+YFPp4HDRByTExeI6BXvTXkdOU1Xmwg==` |
| Packed size | `308586` bytes |
| Unpacked size | `2281865` bytes |
| Entries | `186` |
| Sorted payload inventory | `f41cc8cd0cada9a456925e7c9ac03b11a01ddd3697b0ff2a24f193215c804e58` |
| Product content | `e40e6fe1e72e7fa6561da31118421831f912d889eff1203227bfb5d3b3301822` |
| Canonical manifest | `00a1f4cc3179bbab0b301f2222b152103ce266cb5212d518ca1f4a892fc9637c` |

The inventory is SHA-256 over C-sorted lines
`<file-sha256><two spaces><package-relative-path><newline>` from an empty
archive extraction.

## Retained Root Proof

| Proof | SHA-256 |
|---|---|
| Governor | `8004c2ebb6e1120dc1a64189099d0c3c0e685a5f873005092deac7bd9b9e9eb6` |
| Event log | `5d70541278ec2b87002827275c179f12c4f5fedb332cc28a0287686b0fa7cbeb` |
| R10 result | `47fa5b8df342bb2102fd5e4d41e77bcc7f32a1e61f4c57e61da2dd84c959c80e` |
| Outcomes | `a9db56e12d5581610a0ca5afb4dc03fbc3dfadf2a44dad6b3e50a9b551d25b59` |
| Transcript | `428cd45b9140e41bd3ca1ef545024439fb750475b291fbe65d236c6ad3334ad3` |

## Review Boundary

Independent review should inspect only these affected relations:

1. When direct-process exit wins, is its pending deadline cancelled before
   inherited-pipe drainage can produce false timeout or signal-request truth?
2. Does the strengthened mutation keep the pipe open across the old deadline
   and prove zero timeout and signal observations?
3. When timeout wins first, does the existing timeout and termination path
   remain unchanged?
4. Do late descendant bytes remain diagnostic while valid pre-exit output
   remains eligible for the retained salvage law?

Direct human acceptance remains required after independent review. No further
worker edits or self-review are authorized against this frozen subject.
