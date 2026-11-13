Product Frame: unchanged ABIogenesis5.0 fifteen-family scope, GOAL035/T287, selected installed/read STDO3.0.4 with empty composition. Product preparation, ABG admission, source currentness and authority guards remain unchanged.

**Confirmed S2 test-oracle defect.** The existing helper assumes every negative must return `invalid_intent` at `/invocation_admission`. Two cases belong to earlier refusal owners.

Exact H04 subject SHA256 `b5715335929d4cb2ba1b81879471970a5f78106a1aaa65571de55a7a5c506793`, source digest `4cc3964124aa8424db8d67d2f992c4a9f8624fd0a88913f09dba478199551956`. Actual lane:66805ms,6 passed/1 failed/0 skipped. TAP3914B SHA256 `f979543dac4f7ba6391b029594817c4fafdf4aaefd470509bffbd18debfb2522`.

| Existing negative | Exact expected code | Exact issuePaths | Deciding relation |
|---|---|---|---|
| Testing over current retained Testing state | `invalid_intent` | `['/invocation_admission']` | Retained-state entry is not another Testing invocation. |
| Construction over that same current state | `invalid_intent` | `['/invocation_admission']` | Construction is not the exact direct UAT entry. |
| UAT with fresh original input but retained Testing source | `invalid_input` | `['/input']` | Product semantics requires input equal to the retained source state. |
| UAT reusing the old source after successful UAT | `invalid_input` | `['/observation']` | Current-prefix source rehydration rejects consumed/advanced Testing work before Product preparation. |

The crossed-input refusal is observed. Product `builtin_semantics.ts:1034–1045` supplies its equality law; `run_invocation_operation.ts:675–691` projects `/input`. The stale-source mismatch is statically established and unexecuted: `owner_bindings/run_invocation.ts:1276–1301` rehydrates the source first; `invocation_admission.ts:498–555,612–618,668–696` rejects obsolete retained work; Product mapping at1044–1065 yields `/observation`. The two wrong-wrapper assertions already passed and retain their ABG admission classification.

For all four, expect semantic refusal/exit1, no new admitted event, no actor and no workspace effect. The first three preserve roles `['c2']`; stale-after-UAT preserves `['c2','assess']`. Both refusal paths finish at the entry prefix before graph dispatch. The diagnostic's `events:[]` is filtered and does not itself prove zero total append: use the existing complete prefix/event delta and actor-role owners for those assertions.

Minimum repair is test-only: give the existing helper one explicit expected code/path tuple per call and assert exact values plus the no-effect relations. Do not broaden enums or accept either refusal indiscriminately. No Product/HOW/guard change is needed.

Keep the three current-source negative invocations before UAT; moving them afterward changes them into stale-source cases. If Root wants the positive discriminator observed before unrelated oracle assertions, retain those negative receipts, require refusal/no-effects immediately, and defer only their code/path assertions until after valid UAT and held/fresh agreement. Keep stale-source invocation after UAT and before final close. Deferred mismatches must still fail the test. This needs no extra workflow, invocation, reacquisition or close.

The bounded positive UAT/fold assertions match the unchanged owners: one actual Testing producer, an independent assessment observation, null synthesis references, UAT wrapper identity and `terminal:false`. Held/fresh assertions compare complete owner output and original terminal invariant fields separately from read projectionBasis. No new static mismatch was established there; UAT and readbacks were not reached and remain unproved.

The original H04 coordinate/body correction review and all actual failures remain unchanged. No repair or execution was performed during this triage. Root owns the follow-up. This is not installed-route acceptance, formal F11 J qualification, release evidence or measured speedup.
