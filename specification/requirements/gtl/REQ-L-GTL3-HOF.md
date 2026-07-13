# REQ-L-GTL3-HOF — Higher-Order Graph Operations

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define higher-order graph-function combinators in GTL 3.

## Acceptance Criteria

**REQ-L-GTL3-HOF-001**: `fan_out(f, *, over, into)` shall accept an element
graph-function relation `f:A->B`, an explicit input-vector relation
`over:Vector<A>`, and an explicit output-vector relation `into:Vector<B>`, and
shall produce a graph-function relation `Vector<A>->Vector<B>`. The admitted
relation shall join each structured `Vector[T]` schema to an explicit member
contract; schema spelling alone is not type admission. On a wholly successful
vector application, the relation shall preserve input cardinality and stable
input ordinal, pairing output member `i` only with input member `i`. Native
authoring, canonical serialization, raw admission, and semantic compilation
shall preserve the same first-class relation and shall not infer it from a
function name, label, tag, shared node identity, or hidden cardinality.
Blocked-member lineage and partial-failure behavior are runtime semantics and
require their own requirement and design before implementation.

**REQ-L-GTL3-HOF-002**: `fan_in(reducer, *, over=node)` shall reduce an explicit vector boundary into one synthesized result.

**REQ-L-GTL3-HOF-003**: `gate(target, *, rule, evaluators)` shall block or allow continuation over an explicit boundary without choosing a candidate or inventing domain pass/fail semantics.

**REQ-L-GTL3-HOF-004**: `promote(source=..., to=...)` shall lift one declared representation boundary into another without changing semantic truth.

**REQ-L-GTL3-HOF-005**: Higher-order operations shall preserve interface and type truth.

**REQ-L-GTL3-HOF-006**: Higher-order operations shall be lawful graph-function combinators, not hidden planner or interpreter heuristics.

**REQ-L-GTL3-HOF-007**: Higher-order vector operations may expose evaluator-result vectors, candidate-result vectors, or other harvested result vectors over a contract boundary while leaving merge semantics external to GTL.

**REQ-L-GTL3-HOF-008**: Zoom-in, zoom-out, and fold terminology shall resolve
to existing lawful GTL higher-order operations or be repriced into new
requirements before implementation. Informal zoom or fold vocabulary shall not
authorize hidden interpreter heuristics, unowned registers, or duplicate graph
algebra.

**REQ-L-GTL3-HOF-009**: **Pointwise batch projection.** Runtime realization of an
admitted `fan_out` relation shall project one admitted non-empty ordered input
vector into one `C.batch` task per input member. Each task shall preserve the
declared child GraphFunction, exact member input/output contracts, original
zero-based ordinal, member lineage, and the enclosing declared C-call program,
stage, fibre, arm, and composition authority. The batch ref groups tasks but is
not a call, scheduler, or closure authority. Serial execution is a lawful
realization of the same projection; concurrency shall not be inferred from
`fan_out` or `C.batch`.

**REQ-L-GTL3-HOF-010**: **Fan-out result and failure law.** A fan-out output vector
shall be admitted only when every projected task completes exactly once with
the declared output-member contract and the output rows preserve input
cardinality and ordinal. Completion order shall not change output order or
attribution. If a member is blocked, held, malformed, or runtime-failed, ABG
shall preserve completed-member evidence, identify the stopping ordinal and
unstarted tasks, admit no output vector, and permit no downstream fan-in or
graph-success projection from that invocation.

**REQ-L-GTL3-HOF-011**: **Typed fan-in runtime.** Runtime realization of an
admitted `fan_in` relation shall consume one complete admitted vector matching
the declared vector node and contract, preserve its basis, cardinality,
ordinals, member attribution, and application lineage, and invoke the exact
declared reducer GraphFunction once. An incomplete, mismatched, duplicated, or
reordered vector shall stop before reducer traversal. Only an admitted reducer
completion may become the synthesized result; blocked, held, malformed, or
runtime-failed reducer truth shall remain non-success.

**REQ-L-GTL3-HOF-012**: **Runtime authority.** HOF runtime bindings shall derive
from the exact selected catalog entry, admitted Module, structural HOF or
GraphFunction-application declaration, and opaque GraphFunction and Node
identities. Names, tags, fixed vector cardinality, promise completion order,
and caller-authored semantic defaults are not authority. ABG owns task C-call
spines, traversal evidence, result admission, and failure truth. Product
effects remain subject to the separately admitted traversal and capability
gates.
