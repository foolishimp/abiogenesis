# T-280 One Surface Authority Design Review

- review seat: independent Codex subagent `/root/t280_design_independent_review`
- reviewed semantic candidate digest: `e507773cc41a86f25df0f2625620258a07701b0ea6575154616cdd1f39f69214`
- accepted gate-complete design digest: `411ab4e3bbd978a45b7c136b5f0c17e55508a9c8cad5a7b1e5fdf45fe6733758`
- verdict: recommend F_H acceptance for bounded implementation

## Findings

No blocking finding remains.

The design uses existing `c_call_opened` and `c_call_result_admitted` events
for the immutable invocation and admitted-result bindings. One existing
`RuntimeDerivedFluentRule` form joins exact call, basis, definition,
application, program/member, composition, contract, domain-admission, output,
and causal identity. Replay-aid registrations have no direct effects.

`construction_evaluator_invoked` remains invocation and awaiting truth only.
The design introduces no phase overload, runtime event kind, controller, C
constructor, public operation, selector, or Consensus-specific path. The four
One Surface authorities remain distinct and the admitted GTL program owns
their composition.

The previous repairs also remain intact: program-level application ownership,
Prime pressure and obligation carriers, closed host/composition authority, and
the existing closed AF-13/AF-14 action union.

The accepted projection replaces four non-vocabulary promotion verdicts with
passing Promotion Tests for the same existing Prime carriers, adds the four
missing retained-carrier tests, and registers this DS-2 design. These are gate
evidence repairs only; they do not change the independently reviewed semantic
candidate.

## Verification

- all 17 authority-source digests: reproduced
- Mermaid: 3/3
- Prime gate: pass
- governance gate: pass
- Pandoc: pass
- target `git diff --check`: pass

Runtime tests were not run because this review accepts design only. The
pre-existing provisional runtime wave was not edited.
