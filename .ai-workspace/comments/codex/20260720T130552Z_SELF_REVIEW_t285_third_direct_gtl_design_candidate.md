# SELF REVIEW: T-285 Third Direct GTL Design Candidate

## Verdict

Ready for a new independent exact-design review. This is not M3 acceptance and
does not open M4.

## Exact Subject

| Field | Value |
|---|---|
| candidate commit | `c70455d19313c686fc60b5b96d8f740b5d4ec786` |
| candidate tree | `047577772deacd7176768e69a744594fd6e3da9b` |
| design path | `build_tenants/abiogenesis/typescript/design/M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md` |
| Git blob | `a35a79b1ff995b915bafe557c44580bdc60f489c` |
| SHA-256 | `44253c21348e799f85d97f826539efa2ab6e16eee214368be6796e82d2af67eb` |
| lines | `1214` |

The design file alone is the immutable review subject. Workflow, status,
review, manifest, and eventual F_H records remain outside it.

## Finding Disposition

| Finding | Repair |
|---|---|
| Prime closure absent | Added T-285 PC-007/PC-011 metadata, one exact machine-checked Prime block, eight Prime families, ten promotion tests, explicit `19 -> 8` measures, and truthful historical acceptance statuses for the five superseded designs. |
| validation chain circular or incomplete | Added RawAdmittedValue, ProgramValidation, GraphValidation, InvocationAdmission, and final admitExecutionBasis stages. Graph materialization consumes admitted input, and both validation identities enter ExecutionBasis. |
| opened lineage lost | Added subordinate OpenedTraversalScope carrying exact Run, GraphCall, and Frame refs and made it a required HoG traversal argument. |
| implementation resolution owner missing | Product catalog projection now produces the unique candidate or typed refusal, validator checks it, and ABG admits the exact binding and packaged implementation before HoG entry. |
| failure and closure replay incomplete | CCall open plus fibre selection is atomic. Every opened call, including typed implementation failure, completes evidence, result, and judgment. Closure binds one declared contract and the exact `terminal_reached -> frame_closed -> graph_call_closed -> run_closed` payload chain. |
| CatalogView narrowed unlawfully | CatalogView now permits zero Module, Program, GraphFunction, implementation, or callable rows; invocation separately requires exact selected membership. |

No finding changed accepted Product or requirements.

## Cross-View Review

1. Raw, Program, and Graph judgments are distinct across ontology, functions,
   domain view, sequence, lifecycle, root mapping, and proof mutations.
2. Product proposes implementation resolution without selecting under
   ambiguity; ABG admits it; HoG receives only the admitted port.
3. The Run, GraphCall, and Frame refs returned by openCall are explicit HoG
   inputs and cannot be recovered from ambient state.
4. `c_call_opened` remains locus-only even though opening and fibre admission
   commit atomically; implementation identity first appears in
   `c_call_fibre_selected`.
5. No post-open success or failure path bypasses result admission or judgment.
6. Closure event identities, payload fields, order, causal refs, and Event
   Calculus effects are fixed before M4.
7. Empty catalog views remain lawful but cannot invoke an absent callable.

## Mechanical Verification

- direct Prime inspection: pass, eight IACS families and no failures;
- exact-file Mermaid render: pass, Mermaid `11.3.0`, `3/3` views;
- full tenant design gate: pass, `32` files and `96` diagrams;
- full Prime governance: pass, `10` tickets and zero failures;
- Prime gate mutation suite: `9/9` pass;
- Mermaid gate suite: `8/8` pass;
- `git diff --check`: pass;
- candidate commit changes only the design file;
- no runtime, test, package, generated, qualification, or release file changed.

## Remaining Gate

A decorrelated reviewer must reproduce the exact subject and try to falsify
all six repairs. Direct F_H acceptance remains a separate decision after that
review.
