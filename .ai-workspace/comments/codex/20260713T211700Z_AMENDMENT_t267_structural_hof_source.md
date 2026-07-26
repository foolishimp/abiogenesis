# T-267 Design Amendment: Structural HOF Source Correction

Date: 2026-07-13
Disposition: bounded correction under delegated F_H authority

The live post-T-262 T-252 census reports 34 `blocked_capability` selected-
program outcomes and one `structural_only` outcome. The structural outcome is
the `fan_out(consensus.review-one-profile)` wrapper. The applied
`fan_in(consensus.exact-panel-facts)` GraphFunction already has a selected flat
program handoff.

The accepted T-267 design initially named the structural source as fan-in. That
was incorrect. The source variant is corrected to:

```text
T-255 structural_only HOF fan-out wrapper
+ exact T-260 CompiledHofFanOutBinding
+ exact child execution handoff and composition
-> capability-independent traversal contract source basis
```

No architecture changes. The generic static row compiler, admitted result
authority, existing conformance judge, capability separation, and not-closed
runtime admission remain unchanged. The correction prevents implementation
from inventing a local selector and binds the one selector-free vector to its
actual T-260 authority.

The registered Mermaid gate remains required after this correction. Code may
proceed only against the corrected source variant.
