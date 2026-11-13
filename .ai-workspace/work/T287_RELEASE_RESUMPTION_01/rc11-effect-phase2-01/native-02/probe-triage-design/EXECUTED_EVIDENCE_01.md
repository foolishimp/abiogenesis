# Executed probe evidence addendum

This adds the two closed actual-owner observations to Design triage `46155a87…`; it corrects the earlier incomplete baseline hand-trace. The selected repair contract remains **entry accounting plus current-origin result/continuation eligibility**. No Product or Feature change follows.

I read and hash-checked the candidate/baseline observations, both receipts, stderr assertions and the campaign return; I also checked the relevant exact baseline compiled source. The campaign took 0.675052s. Both subprocesses exited1 at the first count oracle, with no timeout, no driver signal and group absence recorded. The receipts report passed source/module/protection guards. These are real imported owners with controlled child/clock/probe/signal seams, not OS child/process-group proof. No execution was performed by this Design contributor.

| Observed fact | Candidate A | Baseline |
|---|---:|---:|
| Actual host probe entries | 2 | 3 |
| Stream destroy calls | 3 | 6 |
| Controlled signal calls | none | SIGTERM |
| Frozen completion absence / count / signalAttempts | absent / 1 / 0 | absent / 2 / 0 |
| Immediate and later snapshot absence / count / signalAttempts | present / 2 / 0 | absent / 3 / 1 |
| Timer residue | none | none |

Both completion objects were frozen and settled within the fixture bound; snapshots remained fresh, with elapsed cleanup time increasing from0 to25ms after the controlled clock advance. The fixture retained all observations before the first failing assertion. Later assertions were therefore not executed; table entries are retained observations, not additional passes.

**Candidate causal conjunction.** The actual trace matches the predicted two-probe path: the outer probe emits exit; nested probe returns absent; close seals; the outer returns present. Frozen source lifetime:227 unconditionally dispatches its stale `probed`; state:153 increments on return and writes absence before phase checks. Hence the completion undercounts the two already-entered attempts and current snapshot state subsequently accepts stale present. Completion itself is not mutated.

**Baseline correction.** The earlier simplified trace omitted further stale continuation. The executed baseline makes a third probe, signals TERM and destroys streams twice. Its exact compiled lifetime source increments probeCount at entry (:137–154). Nested completion therefore correctly includes the two probes begun by that first seal. After the old outer probe returns present, `requestTermination:254–280` has no renewed phase check before assigning `phase = "term"`. It can reopen the completed phase, send TERM and run `check:220`, whose third probe returns absent; `complete:166` then disposes again because phase is no longer complete. The original Promise retains the first frozen result. This source path explains the actual trace. Baseline's `2 !== 3` oracle reflects prohibited post-seal work, not the candidate's return-time undercount mechanism. Do not preserve these baseline effects as required compatibility.

**Disposition guidance.** Both red runs support the existing narrow repair: count when a probe assessment actually enters, before host re-entry; retain that count when its returned result becomes stale; reject the stale observation and all associated continuation before state writes or host actions. For this fixture the repaired expectation is two probes, count2 in completion and snapshots, absent throughout after nested confirmation, zero signals, one disposal of each of the three streams, one sealed completion and no timer residue. Preserve fresh snapshot identity/elapsed behavior separately. The previously proposed before-seal and still-active discriminators remain necessary to reject a sealed-only guard; they have not been executed by this addendum.

Retain both original red samples, exact freeze `b5a8316d…`/sourceDigest `cddcc3bc…` and this correction to the hand-trace. No source repair, repeated run, broader qualification claim or historical production-cause attribution is made. Root selects the bounded successor; independent source review remains separate.
