# REQ-P-POLICY — Product and Runtime Policy

**Status**: Active
**Category**: Governance
**Date**: 2026-04-19
**Derives from**: INT-005
**Wave**: 3

---

## Purpose

Product-level policy (feature closing, human proxy, merge gates, CLI behavior) lives above the GTL/ABG constitutional stack.

## Acceptance Criteria

**REQ-P-POLICY-001**: Product policy (feature closing, visibility rules, human proxy mode, CLI loop behavior) shall be expressed as product-layer requirements, not GTL language law or ABG interpreter law.

**REQ-P-POLICY-002**: Policy may consume GTL tags, evaluator results, and convergence state — but policy logic shall not be embedded in the language or interpreter kernel.

**REQ-P-POLICY-003**: CLI and control-plane summaries shall be product-layer projections over canonical ABG run truth. They shall not define independent boolean lifecycle truth that can contradict the canonical run/event model.

**REQ-P-POLICY-004**: Product-layer `gen-start` control modes shall treat yielded ABG handoff truth as a lawful control seam. They shall not flatten yielded handoff into terminal success and shall not blindly redispatch the same constructive lane without first honoring the yielded observer or routing handoff.

**REQ-P-POLICY-005**: Repeated proof failure on one current work identity shall project to product-layer control-plane hold truth. That hold truth shall be replay-derived from canonical `proof_failed`, `proof_passed`, and scoped `reset` events rather than hidden controller memory or a rival mutable run-state store.

**REQ-P-POLICY-006**: Product-layer proof-hold behavior shall resolve through one consumed hold-policy surface. That resolved surface shall govern whether hold is enabled and the failure threshold. Any runtime specialization shall resolve into that one product-consumed policy surface rather than becoming CLI-local truth.

**REQ-P-POLICY-007**: The proof-hold identity shall be keyed by `edge`, `work_key`, `spec_hash`, and `workflow_version`. Hold projection shall survive process restart and shall clear only by lawful replay-visible causes: proof success on the same identity, identity supersession by new `spec_hash` or `workflow_version`, or an explicit scoped `reset` over the held boundary.

**REQ-P-POLICY-008**: Product-layer advancement and observation surfaces shall consume the same proof-hold projection. `gen-start`, `gen-gaps`, and live run status may report hold, but they shall not redefine ABG run lifecycle truth in order to do so.

**REQ-P-POLICY-009**: `gen-start` traversal request truth shall be expressed as `scope + target + until`. Supervision, F_H proxying, and similar recovery behavior shall be modeled as orthogonal product-policy control modes outside that traversal request grammar.

**REQ-P-POLICY-010**: When product policy publishes `asset:<published_handle>` as a `gen-start` target family, that family shall resolve only through one published operator asset registry and ownership surface. Each published asset handle shall resolve to one governing traversal boundary, and unresolved, unowned, unsupported, or ambiguously owned asset handles shall fail closed.

**REQ-P-POLICY-011**: The current public `gen-start` control-mode families shall be:
- `fh_mode`
- `root_mode`
Those mode families are product-policy truth above the adapter. Literal flags or service parameters are bindings of those same mode families, not the source of truth for them.

**REQ-P-POLICY-012**: The current public `fh_mode` values shall be:
- `direct`
- `human-proxy`
`direct` is the default. `human-proxy` is a public operator option that may proxy F_H review under product policy. `fh_mode` shall remain outside `scope + target + until` and shall be lawful only when `until = converged`.

**REQ-P-POLICY-013**: The current public `root_mode` values shall be:
- `direct`
- `supervised`
`supervised` is the default. It is root-level convergence control around repeated `gen-start` advancement. `direct` is the public operator option to opt out of root supervision. `root_mode` shall remain outside `scope + target + until` and shall be lawful only when `until = converged`.

**REQ-P-POLICY-014**: The primary operator workflow shall be an interactive
start or observe loop over the public named compositions. An operator shall be
able to define or refine current assets, run `gen-start`, receive one truthful
stop, hold, or gap signal, remove one ambiguity or roadblock through the
interactive agentic coder surface, run `gen-gaps` or inspect the current
projection, and run `gen-start` again without inventing a second runtime or
controller model.

**REQ-P-POLICY-015**: Website, service, or installer shells may bind the
public operator contract, but they shall remain delivery bindings. The primary
flexible operator surface shall remain interactive work with an agentic coder
interface over substrate truth. Concrete transports such as `claude`, `codex`,
or `gemini` are bindings of that same product law, not rival control models.

**REQ-P-POLICY-016**: Product-layer stop, hold, and gap reporting for the
interactive operator workflow shall be explicit enough that an operator can
decide the next lawful action: continue by restarting `gen-start`, inspect
with `gen-gaps`, remove an ambiguity, satisfy a missing capability, or supply
human decision. Downstream wrappers shall not need to reconstruct that next
step from hidden controller-local state.

**REQ-P-POLICY-017**: Public command-line grammar shall be tenant-invariant
for supported GTL/ABG operator commands. Python, TypeScript, or any other
tenant may use different executable prefixes, installation mechanics, or
package bindings, but the command suffix after the binary shall preserve the
same subcommands, public flags, target grammar, control-mode grammar, output
contract, and stop classification. A tenant-specific binary shall bind the
shared product command grammar; it shall not define a rival operator command
language.

**REQ-P-POLICY-018**: Gap triage shall be downstream product policy expressed
through published graph-function-addressable work. ABG may expose replay-derived
gap, hold, stop, continuation, and unresolved-observation truth, but it shall
not own ticket priority, ticket closure, backlog state, or process mechanics.
When a downstream product creates or changes a ticket from gap truth, that
behavior shall be governed by the downstream product and `TICKET_METHOD.md`.
