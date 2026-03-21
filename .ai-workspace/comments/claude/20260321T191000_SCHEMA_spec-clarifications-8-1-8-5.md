# SCHEMA: Spec Clarifications — Tasks 8.1–8.5

**Author**: Claude Code
**Date**: 2026-03-21T19:10:00Z
**Purpose**: ABG 1.0 spec clarifications — documenting existing kernel behavior
**For**: all

---

## 8.1 — Liveness is command-layer, not kernel-layer

The kernel provides **single-hop termination**: `schedule.delta()` converges when all evaluators pass (returns 0.0). The iterate function processes exactly one `BoundJob` and returns a `WorkingSurface` — it always terminates. There is no unbounded loop in the kernel.

**Loop termination** is a command-layer concern. `gen_start()` provides it via `MAX_AUTO = 50` (commands.py line 401):

```python
MAX_AUTO = 50
for _ in range(MAX_AUTO):
    result = gen_iterate(scope, stream, on_fp_dispatch=on_fp_dispatch)
    ...
```

The auto-loop also terminates early on any condition requiring external input:
- `fp_dispatched` — F_P actor needed (commands.py line 418)
- `fh_gate_pending` — human gate (line 421)
- `found` — F_D gap detected (line 424)
- `converged` / `nothing_to_do` / `pending` — no work remains (line 409)

**Summary**: The kernel guarantees single-hop termination (delta converges). The orchestrator guarantees loop termination (MAX_AUTO bound + early exit on external dependency). These are distinct responsibilities at distinct layers.

---

## 8.2 — Frame axiom is intentionally asymmetric between F_H and F_P

F_H approvals and F_P certifications have deliberately different carry-forward semantics across workflow versions.

### F_H: operative fluent carries forward

`bind_fh()` (bind.py lines 74–160) implements Event Calculus semantics:
- `approved{kind: fh_review|fh_intent}` **initiates** `operative(edge, wv)`
- `revoked{kind: fh_approval}` **terminates** `operative(edge, wv)`

When `current_workflow_version != "unknown"`, F_H approvals carry forward via two conditions (bind.py lines 125–136):
- **Condition A**: `event.data.workflow_version == current_workflow_version` (exact match)
- **Condition B**: edge appears in `carry_forward` list with `event.data.workflow_version == from_version` (explicit carry-forward from a prior version)

The carry-forward list is read from the variant manifest at `.genesis/workflows/{pkg}/{variant}/{version}/manifest.json` under `approved_carry_forward` (commands.py `_read_carry_forward()`, lines 61–87).

**Rationale**: Human judgment is about intent and business fit — these survive across workflow versions unless explicitly revoked.

### F_P: certified fluent does NOT carry forward

F_P convergence is checked via `spec_hash` matching (bind.py lines 263–276, schedule.py lines 83–94):

```python
and (
    spec_hash is None
    or e.get("data", {}).get("spec_hash") == spec_hash
)
```

The `spec_hash` is computed by `job_evaluator_hash(job)` (bind.py lines 48–71), which hashes all evaluator definitions AND all bound context digests. A new workflow version means new evaluators and/or new context content, which means a new `spec_hash`, which means prior `assessed{kind: fp, result: pass}` events no longer match.

**Rationale**: Agent certifications are about technical correctness against a specific constraint surface. New evaluators = new spec = old certifications are stale. There is no carry-forward mechanism for F_P — this is by design, not an omission.

### The asymmetry

| Fluent | Carries forward? | Mechanism | Why |
|--------|-----------------|-----------|-----|
| `operative(edge, wv)` (F_H) | Yes, via carry_forward list | `bind_fh()` Condition B | Human intent survives version changes |
| `certified(edge, ev, spec_hash, wv)` (F_P) | No | `spec_hash` mismatch invalidates | Technical certification is spec-bound |

---

## 8.3 — Fairness is per-feature, not cross-feature

`_scoped_jobs()` (commands.py lines 523–546) provides feature isolation:

```python
def _scoped_jobs(scope: Scope, worker: Worker) -> list[Job]:
    jobs = list(worker.can_execute)

    if scope.feature:
        known = _known_feature_ids(scope.workspace_root)
        if scope.feature not in known:
            return []  # fail closed — unknown feature

    if scope.edge:
        jobs = [j for j in jobs if j.edge.name == scope.edge]

    return jobs
```

Key behaviors:
1. **Feature validation**: Unknown feature IDs return an empty job list (fail-closed, line 541).
2. **Edge filtering**: `--edge` narrows to a single named edge.
3. **Topological ordering**: `worker.can_execute` is a list — ordering is determined at package construction time. `gen_iterate()` selects the first unconverged job in this order (commands.py lines 237–251), providing correct single-feature traversal.

**V1 limitation** (documented in the docstring, lines 529–534): V1 has a single trajectory. `--feature` validates existence but does not narrow which jobs run — all jobs in the worker cover the single trajectory. Per-job feature routing is deferred to V2 when multiple packages coexist.

**Summary**: Fairness within a feature is structural — topological order determines which edge gets work next. Cross-feature fairness (round-robin, priority queues) is not a V1 concern because V1 operates on one feature trajectory at a time.

---

## 8.4 — Edge.context IS the observer model

`Edge.context: list[Context]` (core.py line 178) defines what an evaluator observes when processing that edge. This is the observer model for each hop.

The binding chain makes this explicit:

1. **Package declares contexts on edges** — `Edge(context=[Context(...), ...])` defines the constraint surface for that transition.

2. **bind_fd filters contexts to failing evaluators** — `select_relevant_contexts()` (bind.py lines 425–441) returns all edge contexts when F_P evaluators are failing, and none otherwise. F_D evaluators run their own commands; F_H evaluators wait for approved events. Only F_P actors consume the context surface.

3. **bind_fp assembles the prompt from resolved contexts** — The `_assemble_prompt()` function (bind.py lines 342–420) includes a `[RELEVANT CONTEXT]` section containing the resolved content of each context on the edge.

4. **iterate records what was consumed** — `surface.context_consumed = list(job.edge.context)` (schedule.py line 121) records provenance.

5. **Context is digest-bound** — `Context.digest` (core.py line 112) is a `sha256:` content hash. The digest is the constitutional binding, not the locator URI. `job_evaluator_hash()` includes context digests (bind.py lines 66–70), so changing context content changes the spec_hash and invalidates prior F_P certifications.

**The pattern**: Each edge's `context` field is a declarative observer model — it specifies exactly what information is visible to the evaluator for that hop. Different edges can observe different subsets of the constraint surface. The context is not ambient; it is explicitly bound per-edge.

---

## 8.5 — Overlay compatibility constraints

`Overlay` (core.py lines 358–383) is a lawful package extension or restriction. The type enforces these constraints:

### Structural constraints (enforced at construction)

1. **Governance is mandatory**: `approve` must be set — overlay activation is a governance act (line 378):
   ```python
   if self.approve is None:
       raise ValueError(f"Overlay '{self.name}' must declare approve=consensus(n/m)")
   ```

2. **Restriction and extension are mutually exclusive** (lines 379–383):
   ```python
   if self.restrict_to is not None and any([
       self.add_assets, self.add_edges, self.add_operators,
       self.add_rules, self.add_contexts,
   ]):
       raise ValueError(f"Overlay '{self.name}': restrict_to and add_* are mutually exclusive")
   ```
   An overlay either restricts the graph (profiles) or extends it (new capabilities), never both.

3. **Restriction overlays ARE profiles**: The docstring states "Restriction overlays ARE profiles. No separate profile mechanism." The `restrict_to` field is a list of asset names — the overlay filters the package graph to only those assets and their connecting edges.

### Additive overlay fields

Extension overlays can add:
- `add_assets: list[Asset]` — new asset types
- `add_edges: list[Edge]` — new transitions
- `add_operators: list[Operator]` — new execution capabilities
- `add_rules: list[Rule]` — new governance policies
- `add_contexts: list[Context]` — new constraint documents
- `max_iter: Optional[int]` — iteration bound override

### Implied compatibility constraints (not yet enforced in code)

The following constraints are implied by the Package invariants but not explicitly checked when applying an overlay:

1. **Operator closure**: Any edge added by an overlay must reference only operators declared in the base package or added by the same overlay (Package._validate enforces this at package level).
2. **Asset reachability**: Added assets should be reachable via added edges — otherwise Package.__post_init__ will warn about unreachable assets.
3. **Evaluator non-emptiness**: Any job constructed from an added edge must have at least one evaluator (Job.__post_init__ enforces this).
4. **Context scheme validity**: Added contexts must use known schemes and valid sha256 digests (Context.__post_init__ enforces this).

**Current state**: Overlay application logic (projecting an overlay onto a base package to produce a PackageSnapshot) is not yet implemented in V1 kernel code. The `Overlay` type defines the shape; the runtime that applies overlays is a V2 concern. The constraints above are what any future implementation must preserve to maintain consistency with Package validation.
