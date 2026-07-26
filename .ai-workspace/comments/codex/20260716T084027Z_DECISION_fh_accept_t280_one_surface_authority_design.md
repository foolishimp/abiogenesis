# F_H Decision - Accept T-280 One Surface Authority Design

Accept the independently reviewed T-280 semantic candidate at digest
`e507773cc41a86f25df0f2625620258a07701b0ea6575154616cdd1f39f69214`.
The gate-complete accepted design has digest
`411ab4e3bbd978a45b7c136b5f0c17e55508a9c8cad5a7b1e5fdf45fe6733758`.

The accepted boundary keeps `synthesizeModel`, `evalGap`, `evaluateNext`, and
`evaluateAction` distinct, uses the admitted GTL program as composition owner,
admits AF-14 without re-selection, and derives authority-result truth only
from exact existing C-call event pairs through the existing derived-rule
mechanism.

This authorizes bounded T-280 implementation only. T-270 retains AF-15 and
public invocation, T-272 retains continuation, and installed end-to-end proof
remains owned by T-276. Independent implementation review is still required.
