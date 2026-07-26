# F_H Decision - Accept T-275 Reconciled Consensus Domain Design

Accept the independently reviewed T-275 design at digest
`16b10ddc1af12b5f51e6e391bc387202df3c0792d593bc7a0033d26aa84c7435`.

The accepted boundary reuses one `ConsensusContractFamily`, binds reviewer
assignments to ordinary T-256, C-call, actor-invocation, T-257, selected-schema,
and replay authority, and derives `ticket_consensus` through the existing
`project.read` family. It adds no Consensus-specific runtime controller,
operation, store, event kind, decoder family, or ticket mutation path.

This accepts design only. Implementation remains prohibited until T-281,
T-270, and T-274 are completed on the same target basis.
