# REVIEW: Python reference vs TypeScript projection — comparative code review

**Author**: claude
**Date**: 2026-04-24
**Scope**: `build_tenants/abiogenesis/python/` (released reference) vs `build_tenants/abiogenesis/typescript/` (T-009 → T-028 projection)
**Prior related post**: `comments/codex/20260424T100335Z_POST_typescript-tenant-generation-status-through-current-point.md`
**Status**: Diagnostic review — tabular evaluation across quality, design, architecture, comprehension, maintainability, and imperative-vs-functional drift against `DESIGN_MODULE_METHOD.md`

## Headline

The TypeScript projection is **structurally stronger than the Python reference on every axis `DESIGN_MODULE_METHOD` §4 (Functional Bias Without Language Mandate) names as preferred**. The Python tenant is the released, load-bearing line and it is clean code under any conventional bar — zero TODOs, zero `cast()` to `Any`, 81% frozen dataclasses, strong admission discipline. But the TS projection is the line written *with the method explicit on the table*, and the quantitative gap is visible: TS has zero classes, 1,565 `readonly` uses, 509 `Object.freeze` calls, 98% `const`/`let` ratio, and a 1:1.4 functional-to-imperative iteration ratio against Python's ~1:8.

This is a rare directional finding. The projection surpasses the reference on method compliance. The reference is not wrong; it predates the method being formalized. The forward question is not "is the projection sound?" — it is — but "do we want the reference to drift toward the projection's realization posture on the next refactor wave?"

The remaining open risk (per T-029 backlog, not examined in detail here) is feature-level sandbox/live parity proof between the two lines. Everything below concerns realization shape, not semantic equivalence.

## 1. Structural Metrics

| Dimension | Python reference | TypeScript projection | Delta |
|---|---:|---:|---|
| Source files (`*.py` / `*.ts`, excluding pycache/node_modules/dist) | 47 | 100 | 2.1× more files in TS |
| Source LOC | 23,618 | 12,577 | 0.53× (TS is ~half the size) |
| Mean LOC/file | 502 | 125 | TS files ~4× smaller |
| Median LOC/file | 275 | 97 | TS files ~2.8× smaller median |
| Largest single file | `genesis/interpret.py` @ 3,144 LOC | `gtl/m01/algebra/core.ts` @ 769 LOC | Python's biggest is 4× larger than TS's biggest |
| Top-5 files share of LOC | ~45% | ~21% | Python is top-heavy; TS is flat |
| Design documents (`*.md`) | 24 | 72 | 3× more design docs on TS |
| ADRs (own) | 10 | 0 (re-cites 3–4 Python ADRs) | TS defers decision law to reference |
| Test files (real `test_*.py` / `*.test.mjs`) | 14 | 47 | 3.4× more test files on TS |
| Runtime dependencies | 0 observable | 1 (`valibot 1.3.1`) | TS uses an explicit runtime validation library |

**Reading**: Python's density sits in 4–5 very large modules (interpret.py 3.1k, binding.py 3.0k, frames.py 1.8k, transport.py 1.5k, result_ingest.py 1.5k — together ~45% of all LOC). TS spreads its semantic weight across many small files. The absolute 12,577 vs 23,618 LOC does *not* mean TS is half the feature; it means TS does not carry Python's dynamic-typing scaffolding (fewer `isinstance` chains, fewer local guard blocks, no dataclass boilerplate after the interface is declared).

## 2. Module Topology Mapping

Both tenants realize the same semantic modules, but under different filesystem shapes:

| Semantic layer | Python location | TypeScript location | Shape of correspondence |
|---|---|---|---|
| GTL core (Graph, GraphVector, Node, Context) | `code/gtl/graph.py` + `algebra.py` + related (~2.7k LOC, 7 files) | `code/src/gtl/m01/{algebra,contracts,admission,serialization}/` (8 files, ~1.55k LOC) | Near-surface mapping. `composeGraphFunctions`, `stableUnion`, `identity` preserve Python semantics; TS adds frozen-object enforcement and admission carriers explicitly. |
| GTL publication (Module, Job, Role, CandidateFamily) | `code/gtl_spec/packages/abiogenesis.py` + work/module models (~900 LOC, 3 files) | `code/src/gtl/m02/` (6 files, ~1k LOC) | Publication-layer parity. Python declares package as a module; TS reifies publication as typed contracts. |
| ABG runtime kernel | `code/genesis/{interpret,binding,frames,transport,dispatch_runtime,runtime_carrier,runtime_effects,...}.py` (~16k LOC, 31 files) | `code/src/abg/m03/{admission,contracts,transport,events}/` (13 files, ~1.55k LOC) | **Deliberate narrowing.** Python's 16k-LOC runtime surface becomes a compact kernel of `ExecutionBasis` + `AdvancementTransition` + `RuntimeEvent` carriers + `emit()` protocol. This is the single largest size-delta and is intentional per TS derivation records. |
| App / bootstrap delivery | `code/app_bootstrap.py` (3,161 LOC) + `code/genesis/install.py` + `code/genesis/cli_adapter.py` + `code/genesis/policy.py` + `code/genesis/services.py` + ~7 others | `code/src/app/m04/{admission,control,event_ingress,result_assessment,live_status,install_bootstrap,bootloader,asset_addressing,contracts}/` (48 files, ~3.5k LOC) | **Deliberate scattering.** Python's one-file bootstrap becomes 6 named subsystems plus contracts. Boundaries are explicit. |
| Qualification / proof | `test_env/tests/*.py` (integration-style) | `code/src/qualification/m05/` + `test_env/tests/*.test.mjs` (47 files) | TS adds `qualification/m05/` as a first-class module (method_trace, fake_lane, installed sandbox, live lane, archive). Python's equivalent lives in tests, not in the code tree. |
| Deferred boundary (M06) | none | `design/` only (dormant) | Design-only by intent; per T-023 adjudication. |
| Shared libraries | inlined in genesis modules | `code/src/shared/{abg_library,abg_delivery_library,validation}/` (11 files, ~700 LOC) | TS extracts what Python repeats; Python inlines validation guards per site. |

**Mapping verdict**: M01 ↔ `gtl.graph`/`algebra` is a near-surface port. M02 ↔ `gtl_spec`/`work_model` is a reification. M03 is a **narrowing** of Python's largest surface. M04 is a **scattering** of Python's monolithic bootstrap. M05 is **net-new** as a first-class code module (Python's qualification lives in tests). This is architectural restructuring, not transliteration.

## 3. Imperative vs Functional — The Drift Axis

`DESIGN_MODULE_METHOD.md` §2 Position and §4 Functional Bias Without Language Mandate are prescriptive:

> "The preferred realization shape is functionally biased. That means:
> - semantic meaning should live in typed carriers and explicit transforms
> - imperative coordination should be subordinate to admitted truth
> - side effects should be isolated to explicit boundary modules
> - mutable shared state should be minimized and justified"
>
> "Projects using this method must prefer:
> - immutable data carriers over mutable shared objects
> - closed typed carriers over open dict or string protocols
> - parsing and admitting foreign data once at ingress
> - explicit return values over hidden mutation
> - composition of small transforms over long controller procedures"
>
> "Projects using this method must avoid:
> - one giant mutable workspace object
> - one orchestration method that owns semantic law
> - dynamic payload mutation at the semantic center
> - proxy interfaces that partially imitate a new design while preserving the old
>   authority path"

Both tenants should be measured against this, not against general functional-programming purism.

### Concrete markers

All counts below are from `grep` passes over the two code trees. TS root is `code/src/`; Python root is `code/{genesis,gtl,gtl_spec}/`.

#### Carrier immutability and mutation discipline

| Marker | Python (23.6k LOC) | TypeScript (12.6k LOC) | Implication |
|---|---:|---:|---|
| Classes declared | 110 | **0** | TS has no class mechanism in scope. |
| `@dataclass` decorators | 101 | (n/a) | Python's dominant carrier shape. |
| `frozen=True` dataclasses | 89 (81% of dataclasses frozen) | (n/a — uses `readonly`) | Carrier immutability *is* strong in Python, but opt-in. |
| `readonly` keyword uses | (n/a) | 1,565 | TS's default posture for every field. |
| `Object.freeze` calls | (n/a) | 509 | ~1 freeze every 25 LOC. Deep freezing of emitted carriers. |
| `as const` | (n/a) | 3 | Sparse; TS relies on `readonly` + `Object.freeze`. |
| `Readonly<>` / `ReadonlyArray<>` | (n/a) | 2 / 0 | Field-level `readonly` preferred over wrapper types. |
| `let` declarations | (n/a) | 9 | Near-zero mutable locals. |
| `const` declarations | (n/a) | 456 | 98% const-to-`let` ratio. |
| `var` declarations | (n/a) | 0 | No legacy-scope bindings. |
| `self.x = ...` in methods (mutation inside class) | 42 | (n/a, no classes) | Most dataclasses are frozen; remaining mutations are in non-frozen state holders. |
| Dict-key assignment `d[k] = v` (carrier mutation) | **605** | (n/a — TS uses spread/Map) | **The single biggest functional-drift signal.** Python builds most structures via in-place dict mutation. |
| List `.append(...)` mutation | **182** | 59 `.push(...)` | TS pushes are ~3× rarer and concentrated in builder sites. |
| Array-index assignment (`arr[i] = v`) | (not measured separately) | 0 | TS never mutates by index. |
| Spread operator `...x` (immutable copy) | (n/a — Python `**d` / `*lst` less idiomatic) | 132 | TS's copy-and-extend idiom is dominant. |

#### Iteration posture

| Marker | Python | TypeScript | Ratio |
|---|---:|---:|---|
| `for`-loops (imperative) | 341 | 72 + 71 `for...of` = 143 | Python's for-heavy density drops ~2.4× in TS per-KLOC. |
| `while`-loops | 10 | 2 | Very low both sides. |
| List comprehensions / generator exprs | 76 + 63 = **139** | (n/a — see `.map` etc.) | Python's functional iteration lives here. |
| `.map` / `.filter` / `.reduce` / `.flatMap` calls | **0** | **148** | Python uses zero functional iteration helpers. Zero imports of `functools.reduce` or `itertools`. |
| Top-level `def`/`function` declarations | 517 | 265 | Python has ~2× the function count, but recall TS has ~half the LOC. Per-KLOC function density: Python 22/KLOC, TS 21/KLOC — essentially the same. |
| Instance methods `    def` | 137 | (n/a, no classes) | Methods concentrated in the 110 classes. |

#### Rough drift index

Treat "imperative" as loops + direct-key mutations + `.append`/`.push`. Treat "functional" as comprehensions + `.map`/`.filter`/`.reduce` + spread copy.

| | Imperative markers | Functional markers | Ratio (imperative : functional) |
|---|---:|---:|---|
| Python | 341 + 10 + 605 + 182 = **1,138** | 139 + 0 = **139** | ~**8 : 1** imperative-leaning |
| TypeScript | 143 + 2 + 59 + 0 = **204** | 148 + 132 = **280** | ~**1 : 1.4** functional-leaning |

The Python imperative-bias is concentrated in **dict-key mutation** (605/1138 ≈ 53% of imperative markers). That matters: §4 bans "dynamic payload mutation at the semantic center." Much of Python's dict mutation is builder-local (compose a dict, freeze and return through an admit_*), which is §7's tolerated "mutation is local, computation-only, does not become shared truth" pattern. But not all of it — some sites write event metadata into nested dicts across function boundaries, which is what the method prohibits.

### Against `DESIGN_MODULE_METHOD` §14A (Functional Realization Review Checklist)

| §14A criterion | Python | TypeScript |
|---|---|---|
| Pure functions in the semantic center | Mostly yes (gtl/algebra.py is pure); genesis/interpret.py is mixed | Yes — M01 algebra is pure, carriers admitted at ingress, transforms explicit |
| Immutable carriers with no shared mutable semantic state | **Partial** — 81% frozen dataclasses, but genesis event/workspace state carries mutable holders | **Strong** — readonly + Object.freeze everywhere, no mutable shared holder found |
| Carriers returned as new values, not mutated in place | Partial — builder patterns mix local mutation + freeze | Strong — spread-copy-extend is dominant |
| Explicit return values over hidden mutation | Mostly yes | Yes |
| Composition of small transforms over long controller procedures | **Weak** — interpret.py (3.1k) / binding.py (3.0k) / app_bootstrap.py (3.1k) are long controllers | **Strong** — largest TS file is 769 LOC; M04 decomposes into 6 subsystems |
| Ingress admission parses once at boundary | Yes via `admit_*` convention | Yes via valibot-gated `admit*`/`parse*` functions |
| Negative proof for imperative bypass / open-payload bypass | Not explicitly tracked | Several per-ticket negative tests (`t011-abg-negative-ingress.test.mjs`, `t030-m05-archive-finalization-negative.test.mjs`, etc.) |
| Functional equivalence to reference realization | (Python *is* the reference) | Claimed through T-024 audit; T-029 (parity) backlog |

**Drift reading**: The Python reference satisfies §4 *at the carrier boundary* (frozen dataclasses, admit_* functions, explicit returns) but **drifts toward imperative at the semantic center** via long controller files and in-place dict mutation. The TS projection satisfies §4 *at the carrier boundary and at the semantic center*, because its long-controller sites do not exist — they were decomposed during projection.

This is the method drift the user flagged. It is not code rot; it is the reference predating the method's explicit functional bias. The projection was written with §4 visible and decomposition guardrails in effect (`design/TYPESCRIPT_REALIZATION_GUARDRAILS.md`).

## 4. Type System & Validation

| Dimension | Python | TypeScript |
|---|---|---|
| Type annotations scope | Opt-in; 26/47 files import `typing` | Strict throughout; 197 interfaces + 66 type aliases |
| Primary carrier construct | `@dataclass(frozen=True)` (89 instances) | `readonly` fields on typed interfaces (1,565 readonly uses) |
| Structural typing | `Protocol` (1 file) | discriminated unions + interfaces pervasive |
| Escape hatches | `Any` in 25 files, `cast()` in 3 call sites, `# type: ignore` 0 | `any` in 1 file, `@ts-ignore`/`@ts-expect-error` 0, `as any` 0 |
| Safe narrowing casts | — | 4 `as T` post-validation (e.g., `as TerminalKind` after assertion) |
| Runtime validation | Hand-rolled guards inside `admit_*` + `__post_init__` | Centralized in `shared/validation/primitives.ts` backed by `valibot` schemas; used at every ingress |
| Failure shape | `raise ValueError(...)` / `TypeError(...)` / `RuntimeError(...)` | `throw new TypeError(..., { cause })` with structured label chains (`parent.child.field`) |

Python's typing posture is **opt-in strict**. Authors annotate what matters. `Any` is used where event payloads are genuinely opaque until admission. Under `DESIGN_MODULE_METHOD` §4A (Python Typing Rule), which requires "every function, method, and callable surface has explicit parameter and return annotations," Python is mostly but not uniformly compliant — 22 files do not import `typing` at all, though many of those are `__init__.py`, CLI shims, or very small modules.

TypeScript's typing posture is **strict by construction**. `tsconfig` governs this (not examined in detail here). The 0 escape hatches is remarkable and is the single strongest quality signal in the entire review.

## 5. Admission / Carrier Pattern (the B-048 invariant)

Both tenants inherit the "admit foreign data once at ingress, trust downstream" law from odd_sdlc B-048. Both implement it. The quality of enforcement differs.

### Python

```python
# genesis/policy.py:145
def admit_resolved_policy(value: Mapping[str, Any] | ResolvedPolicy) -> ResolvedPolicy:
    if isinstance(value, ResolvedPolicy):
        return value
    raw_bundle_refs = value.get("bundle_refs")
    if isinstance(raw_bundle_refs, (list, tuple)):
        bundle_refs = tuple(ref for ref in raw_bundle_refs if isinstance(ref, str) and ref)
    else:
        bundle_refs = ()
    ...
    return ResolvedPolicy(bundle_refs=bundle_refs, ...)
```

Convention-based. Each admit_* site hand-rolls validation. Failures raise `ValueError`/`TypeError`. Downstream trusts that a `ResolvedPolicy` was actually admitted.

### TypeScript

```typescript
// gtl/m01/admission/carriers.ts
export function admitGraph(input: unknown, label = "Graph"): Graph {
  const graphObj = parsePlainObject(input, label);
  const identity = parseNonEmptyString(graphObj["identity"], `${label}.identity`);
  const nodes = parseUnknownArray(graphObj["nodes"], `${label}.nodes`);
  ...
  return constructGraph({ identity, nodes, ... });
}
```

Law-based. `parsePlainObject`, `parseNonEmptyString`, etc. live in `shared/validation/primitives.ts` backed by valibot schemas. Every admit site delegates to the same validation vocabulary. Labels chain: `Graph.nodes[2].identity` is a possible failure path.

**Finding**: Both preserve the invariant. TS's enforcement is structural (library-backed, central); Python's is behavioral (convention-backed, distributed). Under §4 ("composition of small transforms over long controller procedures"), TS scores higher — admit logic composes, not accumulates.

**Connection to the test39 forensic**: The B-005 `bundle_refs` tuple/list crash I filed against odd_sdlc is a specific case where a Python producer (`ResolvedPolicy.to_dict()` emitting a tuple) crossed a Python consumer (`_string_list` requiring list) under odd_sdlc's admit seam. The TS projection here does not have that class of bug because primitives like `parseUnknownArray` accept any iterable-shaped sequence and normalize once. This is a direct data point in favor of library-backed admission over hand-rolled.

## 6. Documentation / Design Density

| Category | Python | TypeScript |
|---|---:|---:|
| Top-level design docs | 9 (GTL/ABG module designs, qualification ladders, etc.) | ~12 (README, derivation, guardrails, strict lane, forward plan, optimization ledger, …) |
| ADRs | 10 (ADR-022 through ADR-036) | 0 native; cites 3–4 Python ADRs by reference |
| Per-module derivation records | — | 15+ `*_DERIVATION.md` files linking each M0X to its Python source |
| Irreducible-carrier inventories | — | 15+ `*_FIRST_SLICE_IACS.md` files |
| Structural carrier diagrams | — | 13 `*_STRUCTURAL_CARRIER_DIAGRAM.md` files |
| FP overlays / intent docs | 2 (`design/fp/INTENT.md`, `design/fp/README.md`) | — |
| Explicit parity / audit records | — | `PYTHON_TO_TYPESCRIPT_DESIGN_DERIVATION.md`, `MIGRATED_TYPESCRIPT_DESIGN_SOURCE_AUDIT.md`, `M05_PYTHON_SANDBOX_PROOF_EQUIVALENCE_AUDIT.md` |

**Reading**: Python's design is narrative + ADRs; TS's is narrative + ADRs + per-module derivation + per-module carrier inventory + per-module diagram. The 3× doc density in TS is not padding — it is **per-module sign-off scaffolding** that the projection process required because the line was forward-generated. The cost is that a reader must chase more documents to reconstruct one module's story; the benefit is every module has an explicit `WHY` anchored to Python source.

**§5A / §6 interpretation**: `DESIGN_MODULE_METHOD` treats derived artifacts as read models that must not outrank live design. TS's 72 docs are read models; the 10 Python ADRs still govern both lines (TS does not fork decision law). This is the right shape.

## 7. Test Organization

### Python (`test_env/tests/`)

14 real `test_*.py` files. Mostly integration-level, module-named (e.g., `test_m01_gtl_core_integration.py`, `test_sandbox_install.py`). Framework appears to be pytest (inferred from naming). No explicit correspondence map between tests, requirements, and design was found.

### TypeScript (`test_env/tests/`)

47 real `*.test.mjs` files, using Node's native `node:test` runner. Files fall into two families:

1. **Canonical module-owned lanes** (e.g., `test_m03_engine_kernel_integration.test.mjs`, `test_m05_method_trace_unit.test.mjs`) — named by module + lane (unit/integration).
2. **Per-ticket proof lanes** (e.g., `t009-m01-roundtrip.test.mjs`, `t011-abg-negative-ingress.test.mjs`, `t030-m05-archive-finalization-negative.test.mjs`) — named by originating ticket + what the proof is for.

Plus a `test_surface_map.md` documenting the correspondence between tests, requirements, design docs, and tickets.

**Reading**: TS's 47 tests are 3.4× more granular. The per-ticket lane is a real governance artifact — each ticket's closure produced a named test file. Python's 14 tests are broader-brush and do not carry that traceability. This is consistent with the process post's T-029 backlog: TS test inventory is rich, but *feature-parity* between TS tests and Python tests has not been explicitly audited yet. Test count ≠ feature coverage.

## 8. Code Quality Sniff Tests

| Signal | Python | TypeScript |
|---|---|---|
| `TODO` / `FIXME` / `XXX` / `HACK` | 0 | 0 |
| `# type: ignore` / `@ts-ignore` / `@ts-expect-error` | 0 | 0 |
| `cast()` (Py) / `as any` / `as unknown` (TS) | 3 uses | 0 |
| Safe narrowing casts | — | 4 (`as TerminalKind`, post-assertion) |
| `Any` (Py) / `any` (TS) | 25 files touch `Any` | 1 file uses `any` |
| `unknown` (TS) | — | 28 files (correct — pre-validation input shape) |
| Global / nonlocal state | 2 total | 0 explicit globals (module-level const only) |

Both codebases are clean by conventional quality metrics. Neither has deferred-work markers. The only residual signal is Python's 25 files that use `Any` — those are legitimate (event payloads pre-admission, external dict imports) but they are the exact sites §4 warns against ("open dict or string protocols"). TS has displaced them to `unknown` (28 files) which *must* be narrowed before use, a stricter posture.

## 9. Diagnostic Scorecard

Ten criteria commonly used to evaluate code quality, scored on a 5-point scale. I have tried to score against observable evidence, not against aspirational language in the design docs.

| Criterion | Python ref | TS projection | Evidence |
|---|:---:|:---:|---|
| Correctness discipline (admission law, fail-closed ingress) | 4 | 5 | Both admit at ingress. TS's admission is library-backed and type-narrowed; Python's is convention-backed with `Any`-typed inputs. |
| Type safety | 3.5 | 5 | Python: opt-in `typing`, 25 files with `Any`, 3 `cast()`. TS: 0 `any`-casts, 0 `@ts-ignore`, 197 interfaces, strict throughout. |
| Immutability of semantic carriers | 4 | 5 | Python: 81% frozen dataclasses. TS: 1,565 `readonly`, 509 `Object.freeze`, 98% `const`, 0 classes. |
| Functional bias (method §2 / §4) | 2.5 | 4.5 | Python: 1:8 functional:imperative marker ratio, zero `.map`/`.filter`/`.reduce`, 605 dict-key mutations. TS: 1:1.4 ratio, 148 functional-iter calls. |
| Module decomposition (small focused units) | 2.5 | 5 | Python: top-5 files carry ~45% of LOC; largest is 3,144 LOC. TS: top-5 is 21%; largest is 769 LOC. M04 split into 6 subsystems. |
| Validation posture (explicit, centralized) | 3 | 5 | Python: 25+ hand-rolled admit_* functions. TS: one valibot-backed primitives file reused everywhere. |
| Error diagnostics (actionable) | 3.5 | 4.5 | Python: `ValueError("message")`. TS: `TypeError` with structured `${parent}.${field}` label chains. |
| Test granularity & traceability | 3 | 4.5 | Python: 14 broad integration tests, no explicit correspondence map. TS: 47 tests with per-ticket lanes + `test_surface_map.md`. |
| Documentation sign-off per module | 3 | 5 | Python: architecture-level design + 10 ADRs. TS: per-module derivation + IACS + diagram, plus shared Python ADRs. |
| Method-compliance negative proofs | 2 | 4 | Python: implicit via absence of `Any` in carriers. TS: explicit negative tests per ticket (`*-negative-ingress.test.mjs`). |
| **Weighted average** | **~3.1** | **~4.75** | Gap is structural and consistent, not noisy. |

### What the scorecard is *not* saying

- Python's 3.1 is not a verdict that it is bad code. Python is the **released, load-bearing reference line**. A 3.1 by this rubric means "competent, clean, but written before §4 was prescriptive."
- TS's 4.75 is not a verdict that it is production-superior. It is an **unreleased projection** still missing the T-029 feature-parity audit. Structural score high, release status incomplete.
- The scorecard deliberately emphasizes method-compliance axes (immutability, functional bias, decomposition). Under a "runtime performance" or "ecosystem maturity" rubric the ordering could reverse.

## 10. Drift Analysis — Directional Findings

1. **The projection surpasses the reference on §4 compliance.** Not by a small margin. On every §4-listed preference (immutable carriers, closed typed carriers, parsing-at-ingress, explicit return values, composition over long procedures), TS's quantitative posture is stronger. The reference was written before §4 was formalized; the projection was written with §4 explicit on the table (see `design/TYPESCRIPT_REALIZATION_GUARDRAILS.md` and `design/TYPESCRIPT_STRICT_LANE.md`).

2. **Python's largest drift vector is controller length, not carrier mutability.** 81% frozen dataclasses mean the carrier surface is mostly clean. The imperative weight sits inside long procedures: `interpret.py` 3.1k LOC, `binding.py` 3.0k LOC, `app_bootstrap.py` 3.1k LOC. Under §4 "composition of small transforms over long controller procedures," those three files are the headline targets for any future refactor.

3. **Python's second drift vector is in-place dict mutation.** 605 `d[k] = v` assignments is a large absolute number for a 23.6k-LOC codebase. Much of it is builder-local (dict built, frozen through an admit_*, returned) which §7 explicitly tolerates. A targeted audit of the non-local cases would be the right scope.

4. **TS's biggest risk is not code drift — it is release status.** The projection lacks the T-029 feature-parity audit. Its clean internal posture does not guarantee semantic-equivalence to Python behavior under the test corpus that actually covers runtime scenarios (frame selection, continuation bind, correction replay, etc.). The structural score does not substitute for the behavioral proof.

5. **The TS tenant is not a candidate to replace Python.** Nothing in this review supports "switch the released line." What it supports is: **TS is a valuable structural reference for what §4-compliant abiogenesis realization looks like in a statically-typed language**, and Python refactor planning can use TS's decomposition as a target shape for modules it chooses to migrate.

6. **One observable regression vector the TS shape would have avoided.** The B-005 tuple/list crash I filed in odd_sdlc backlog (a Python producer emitting `tuple[str, ...]` and a Python consumer requiring `list[str]` across the admit seam) is a class of bug valibot-backed `parseUnknownArray` does not have. That is a real data point, not hypothetical.

## 11. Recommendations

Not prescriptive. Each would require its own triage.

- **Treat the TS projection as a design oracle for §4 compliance**, not as a release candidate. The per-module derivation records already link each TS module to its Python source; the same derivation could run backwards on a Python refactor wave.
- **Close the T-029 feature-parity audit before any claim of "alternate line ready for release."** Structural quality ≠ behavioral equivalence. The process post already names this as the explicit remaining gap.
- **If Python refactor is scoped, target the three long-controller files first** (`interpret.py`, `binding.py`, `app_bootstrap.py`). The pattern is visible in TS: M03 narrows, M04 decomposes into 6 subsystems. Python's equivalents are candidates for the same shape under the same method.
- **Consider whether `functools` / `itertools` / comprehension-biased iteration is stylistically acceptable for future Python additions.** Zero `map`/`filter`/`reduce` imports across 23.6k LOC is not accidental. If §4 is going to be enforced on new Python code, that house style needs to be made explicit.
- **Keep TS ADR count at zero.** Cross-citing Python ADRs instead of forking them is the correct seam discipline. Do not let TS grow an independent decision law surface.

## 12. Summary

Python is the released reference and it is clean code by every conventional bar. TypeScript is the projected alternate line built during a period when `DESIGN_MODULE_METHOD.md` §4 was explicitly guarding the work. The projection scores consistently higher on functional-bias, decomposition, validation, type safety, and sign-off traceability — not because Python is broken, but because the projection was written with the method's functional bias visible and the reference was written before it was. The directional drift between them is one of the clearest natural experiments in this repo for what §4-compliant realization looks like side-by-side with method-adjacent realization. The gap is structural and consistent, not noisy.

What this review does **not** establish: that the TS tenant behaves identically to the Python tenant under any live runtime scenario. That proof is T-029's scope and remains open.
