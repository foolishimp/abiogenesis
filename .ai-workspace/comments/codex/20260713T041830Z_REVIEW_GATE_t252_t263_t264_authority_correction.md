# T-252/T-263/T-264 Authority Correction

## Verdict

The canonical Consensus body remains lawful pure-data GTL. The prior checkpoint
closure is void because commit `ebe0eea` inferred F_H acceptance from a generic
instruction to continue. Subsequent T-263 and T-264 code is preserved as
provisional review evidence, not unwound and not treated as ratified closure.

## Confirmed Findings

1. The T-252 probe authored expected gap-family rows and then required exact
   equality with active successor ownership. Ticket state could therefore shape
   what was presented as compiler evidence.
2. The probe emitted literal zero runtime call counts without an observing
   runtime seam. Static source dependency closure supports a narrower claim
   only.
3. Capability ownership was blurred. T-264 projects requirements, DS-4 supplies
   the published profile, and T-255 performs exact compatibility admission.
4. T-252, T-263, and T-264 live tickets carried closure and F_H claims that had
   not been explicitly granted.

## Correction

- Reopen T-252, T-263, and T-264 for explicit review.
- Preserve the T-263/T-264 implementations as provisional evidence.
- Derive observations before loading ticket ownership.
- Treat active owned but absent families as closure candidates, not gaps.
- Replace zero call counts with exact fenced-directory import-closure evidence and
  `runtimeCallObservation: not_performed`.
- Record the exact three-owner capability relation.
- Keep the T-252 body bytes unchanged.

## Gate

Fresh focused and standing proof lanes must pass. Closure still requires an
explicit F_H decision; continuation language is not acceptance.
