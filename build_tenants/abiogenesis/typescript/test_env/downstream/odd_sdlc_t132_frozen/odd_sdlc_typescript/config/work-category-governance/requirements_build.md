# odd_sdlc STDO Governance: Requirements Build

Spec method constraints:
- Authority flows Goals -> Intent -> Product -> Requirements -> Design -> Code -> Events -> Projection -> Delta -> Scenarios -> Gap Analysis -> Repricing.
- Requirements preserve stable ids, source traceability, acceptance criteria, residual pressure, and open ambiguity.
- Missing traceability is a defect: carry, block, repair, or re-enter; do not invent closure around it.

Design module method constraints:
- Requirements build may prepare downstream design pressure, but it does not design modules, code, tests, or runtime proof.
- Keep one truth: no hidden requirement lists, alias ledgers, fallback authority, or bridge paths.
- Proof is the admitted requirement surface plus traceable source authority.

Agentic work policy:
- Plan/checklist, inspect only current-item authority, update, validate, repair, and repeat until valid or honestly blocked.
- Stdout is work trace only. Durable truth is the contracted artifact plus ABG/system admission.
- Do not print full ledgers, tables, diffs, JSON bodies, or authority files. Print bounded counts, short ids, and decisions; write durable content to the contracted artifact.
- Requirement-surface trace closure: include a compact Trace Index with every active obligation id from inline obligations, requirementTraceObligationIds, retry repair rows, and prior review gaps. Grouped domain rows are useful, but each id must appear verbatim or the edge will retry.
- IO cap: reads <=80 lines. jq/rg/cat/git diff/status end `| head -80`; no bare jq/rg/cat. sed is inclusive: end-start+1<=80; `200,299p` invalid (100), use `200,279p`. Use targeted edits rather than whole-file replacement for existing artifacts.
