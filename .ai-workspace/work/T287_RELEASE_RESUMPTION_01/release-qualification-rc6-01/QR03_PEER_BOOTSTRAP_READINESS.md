# QR03 peer bootstrap readiness — closed

Product Frame: ABIogenesis 5.0, GOAL-035/T-287 and its fifteen families. This is early Product/Design/Proof readiness for the existing qualification route, not independent acceptance, another acceptance gate or activation authority. STDO 3.0.4 strict same-family default remains selected.

**The existing disjoint 5.0 driver does not require peer bootstrap.** Its `assessment-plan.mjs:247–285` assigns `author_distinct` to every task and `sharedCoverage: disjoint` to the plan. The five actual roles are:

| Role | Existing driver requirement |
| --- | --- |
| catalog | author_distinct |
| inventory | author_distinct |
| rule | author_distinct |
| tenant | author_distinct |
| coverage | author_distinct |

The published role policy names these roles and primary/peer actor refs; it does not assign peer-distinct policy by role name (`qualification_contracts.ts:117–134`). Admission forbids `not_required` for these assessment tasks (`qualification.ts:580–583`). A plan selecting `declared_independent_peers` must instead have at least two distinct actors for every shared criterion, each with `author_and_peer_distinct` (`qualification.ts:627–634`). That is a selected plan obligation, not an automatic prerequisite for the existing disjoint driver.

## Peer-required plan residual

After the selected Q4 correction conserves every missing required slot, no lawful first-peer bootstrap is established by these owners. `qualification_proof.ts:733–760` collects only other actual ASSESS occurrences with the same plan, Program and invocation admission, an actor start, and admitted transport evidence. `actor_process.ts:1047–1084` checks eligibility before admitting the current binding/start. The earliest peer consequently lacks a required prior peer fact. Reordering or opening concurrent CCalls supplies no authenticated prior transport selection.

A genuine already-started and transport-evidenced peer in that exact plan/invocation can supply a fact; this does not establish how a fresh plan obtains its first such occurrence under the corrected gate. Another invocation's history, primary/peer labels, declared profile rows, a future J or a caller's asserted identity do not meet the current join. The HOW's general currentness/reuse rule does not override these exact invocation checks.

The smallest absent relation is **required peer slot → authenticated prior actual configured selection usable before the first assessment starts**. The current owner obtains it only after another matching occurrence has started and acquired transport evidence. This records the precise residual; it proposes no registry, profile addition, provider migration or bypass. Keep it scoped to a peer-required plan. The existing Q5 `author_distinct` positive does not prove this relation.

## Separate real eligibility limits

The policy declares exactly Claude Opus 5.5 / `claude-opus-5-5` / Anthropic Claude and Codex Astra / `gpt-6-astra` / OpenAI GPT (`qualification_contracts.ts:127–133`). The specialized native owner constructs only the Claude transport (`actor_process.ts:1043`). Merely declaring the Codex profile does not establish an available native Codex assessor path.

- An actual Claude assessor is not independent of a Claude author, even for `author_distinct`.
- For a scope with established surviving authors from both declared families, neither declared profile is distinct from all authors. This depends on exact surviving scope attribution, not an indiscriminate history union.
- External construction remains `unknown(external_attribution_requires_future_judgment)` at current dispatch (`qualification.ts:551`). HOW lines 87–96 explicitly record that prior owner acknowledgment is not joined there; it does not currently resolve this pre-paid gap.
- Even with peer bootstrap facts, one author family plus two mutually independent peer assessors requires more than the present two declared families under this policy. This is a consequence of the existing relation, not permission to introduce a family or exception.

These are genuine attribution and eligible-route prerequisites distinct from optional peer bootstrap. No production eligibility or native history is invented here.

## Source and disposition

Frozen owner subject: `q23-author-05/review-subject-001/SUBJECT.json`, SHA-256 `60da1eb6b26bd478014ec01d4a49364ec962f74ca3c97c4b91bbee960ba0e638`. The named HOW, policy, Validator, proof, leaf and native assembly owners were read from those snapshots. The Q1/Q4 six-path correction selected by `q23-author-06/ROOT_SELECTION.json` remains separate; this report assumes its stated fail-closed postcondition and does not claim repaired code has been frozen or tested.

The tracked driver was read with exact Git `1f62c0095e6196b089071bb72e88217792edf6ff`. `test_env/qualification/assessment-plan.mjs` SHA-256 is `66ad636a1f87fb5b2b774e8b0453f87750b00b766542db18c903ce07ade2d629`; role material selection SHA-256 is `20ab56b4c20fc122d5d662abcbc09a0bcacccb8fce244a136440dfd5e693d87f`. These helpers retain historical RC1 assumptions; the supported finding is their role/topology selection, not completed successor readiness. Exact source paths, hashes and line routes are in the JSON report.

Root may retain the existing disjoint topology for QR03 planning and keep Q1/Q4 bounded. Do not promote peer bootstrap into a new driver blocker. Genuine attribution, current-subject resources and an eligible actual assessor remain the existing separate dependencies. No execution, provider call, source change, runtime-event write or new capability search is required by this return. Only the two readiness reports were written.
