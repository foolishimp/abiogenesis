# T-287 canonical-root Stage 1 to Stage 2 account handoff

- status: Open
- author: Codex
- date: 2026-09-04T01:45:53Z
- ticket: T-287
- subject: canonical-root Stage 1 to Stage 2 account transfer
- authority: commentary only

This handoff is commentary, not specification, accepted design, ticket authority,
review disposition, Executive selection, or release law. It records the current
account boundary and routes the next account back to the live authority surfaces.

## Executive summary

The work is between Stage 1 production and Stage 2 evidence. Campaign progress is
`0/7`. There is no root-correct artifact and no active campaign process.

The durable surfaces remain conservative. `specification/GOALS.md`, T-287, and the
TypeScript design `README.md` still state that the C0 atomic-window design candidate
is pending independent review, the nine-path Stage 1 source subject is on `HOLD`
pending owner-unity repair and independent review, and Stage 2 is blocked. A later
in-session technical `GO` exists for the current source bytes, but no durable
Reviewer return or Executive projection records it. That distinction is the first
boundary for the next account: do not infer Stage 2 authority from an in-session
result and do not skip projection into the governed durable flow.

The present source candidate corrects the root relation that invalidated the prior
basic run. It addresses mutable work under the full admitted
`WorkspaceAuthorityBasis.canonicalRoot`. It preserves
`WorkspaceBinding.roots.productRoot` as the immutable Program-owner Product install
and keeps the installed C2 helper under `WorkspaceBinding.roots.toolchainRoot`. The
candidate has only source-level and TypeScript-check evidence at this boundary. It
has not produced or qualified a root-correct package.

No package, model/live use, downstream scenario credit, version, RC, tap, release,
Git effect, or Product-goal closure follows from this handoff.

## Exact authority and design identities

Reacquire these files and verify these exact current SHA-256 identities before
using this handoff as a route:

| Surface | SHA-256 |
|---|---|
| `specification/GOALS.md` | `c7d24e16297e54bb60ebb3d554d4e3013033acc7d721c4b0777ec1721321fb9c` |
| `.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md` | `5eeecd413979141569ae050b0b4547b290d8d3a790d801f836de1b367076bc23` |
| `build_tenants/abiogenesis/typescript/design/README.md` | `a58f09b1bb6f4315c92b3638855541533f536c853617c94e7e4e892ecd5e9e64` |
| `build_tenants/abiogenesis/typescript/design/T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN.md` | `7cd8a5a905cdb02c8431b06224df5aa46cfc8f759a7dc5c1fd4712e66c652240` |
| `build_tenants/abiogenesis/typescript/design/T287_W2_R3_C1_LIVE_LLM_WORKSITE_CONSTRUCTION_DESIGN.md` | `61589c4428c6d26f7e8063d40c9d6e653897df8a5bbfaf8d0fb048ce8cce3c61` |
| `build_tenants/abiogenesis/typescript/design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md` | `8dbe22c8bcc2bcedc0e77a5f03a2fde1805d408e555e83bde342b9bb1d2a2301` |

C0 is the frozen atomic-window candidate named by the durable surfaces. C1 and C2
retain their accepted identities. The current Stage 1 implementation must still be
joined to a durable independent review and Executive disposition before the next
selected effect.

## Root defect and corrected relation

The old C0 realization treated `WorkspaceBinding.roots.productRoot` as the mutable
workspace root. That coordinate is the installed ABI Product root. In the
`js-tenant-test` scenario, an authored `package.json` resolved there and would have
overwritten the installed package's own `package.json`. The prior basic pass did in
fact write authored work into the install. Its acceptance was therefore suspended.

The correct mutable address is not a looser path string and is not a replacement
for `WorkspaceBinding`. It is the full already-admitted
`WorkspaceAuthorityBasis A`, including `A.canonicalRoot`, carried alongside the
full `WorkspaceBinding W`. Their roles remain distinct:

```text
A.canonicalRoot
  = mutable authored worksite root

W.roots.productRoot
  = immutable unique Program/GraphFunction/implementation-owner Product install

W.roots.toolchainRoot
  = installed helper/toolchain locus, including the retained C2 helper
```

Every authored subject, target, territory, observation, command working directory,
and snapshot source resolves beneath `A.canonicalRoot`. Every admission and effect
owner authenticates the full A/W pair against the exact-prefix environment. A
canonical-root string by itself grants nothing. Product, toolchain, event-log,
runtime-state, projection, and archive roots remain protected; the installed
Product must have zero delta.

## Current Stage 1 candidate

The exact current production bytes are:

| Concern and path | SHA-256 |
|---|---|
| C0 carrier: `build_tenants/abiogenesis/typescript/code/src/product/worksite_effect.ts` | `de90c3dfd6beb4560a50b46386d0e982d482b8859d2db6c1e3ff2d556ffec9a6` |
| C0 operations: `build_tenants/abiogenesis/typescript/code/src/product/worksite_operations.ts` | `ef7382baba828f2559a7917a71c49a10c139e0621c10aa851ac47cb80780f99c` |
| C1 construction: `build_tenants/abiogenesis/typescript/code/src/product/worksite_construction.ts` | `a830bd045eed037cc75bdbfe152aa99df03a3e8fe44190c0929c8150e524a07d` |
| C2 task: `build_tenants/abiogenesis/typescript/code/src/product/worksite_command_execution.ts` | `015f29f1d60769583d81b00c85ebef874a4ec23c49522dcc08ff93c755be9ae9` |
| C3 aggregate: `build_tenants/abiogenesis/typescript/code/src/product/worksite_branch_construction.ts` | `e6e8cc6afc722e6d29338ba732221746435359fb5d5b48f0c1e2605dd60799e6` |
| ABG admission: `build_tenants/abiogenesis/typescript/code/src/abg/execution_basis.ts` | `f85bd07a1941300118dba1fcbf29e97eccb56455d7ea80facc67344a20c0b01d` |
| C0 owner: `build_tenants/abiogenesis/typescript/code/src/implementation/worksite_file_replace.ts` | `befdd462219c037bc52a1861dab88985a75d2b685f76b5946f0450a652034f33` |
| C2 host: `build_tenants/abiogenesis/typescript/code/src/implementation/worksite_command_execution.ts` | `9ce2486b7357018fbb5e5e9a673ea6313ef76b0129d7f692960ad5142ae9e002` |
| C2 helper: `build_tenants/abiogenesis/typescript/code/src/implementation/worksite_command_helper.ts` | `e1448737766c1f10f3ba08e2bcff822360e50afdecd9ffb7b02d27945ea53db0` |

All nine hashes are exact current identities. A no-output TypeScript check was green
on this candidate.

The implemented semantic changes are bounded:

- C0 carries the full `WorkspaceAuthorityBasis` plus the exact WorkspaceBinding
  identity and digest from request through basis and leaf authority. Admission and
  the file-replace owner reconstruct and compare the exact environment, resolve
  target and territory beneath `A.canonicalRoot`, enforce protected-root and
  no-alias conditions, revalidate target and parent immediately before effect, and
  publish or replace through one same-directory atomic namespace operation.
- C1 carries full A and W in its task, admits that pair, and derives every C0 request
  from those exact task coordinates. The live LLM worker boundary remains the
  accepted closed-prompt construction boundary; it does not acquire direct mutation
  authority.
- C2 carries full A and W, re-observes replay-proven authored subjects beneath
  `A.canonicalRoot`, snapshots them into the governed attempt sandbox, executes only
  through the installed helper under `W.roots.toolchainRoot`, and re-observes the
  original mutable worksite after Worker return. The public `task.json`, private
  `launch.json`, helper/package/locus joins, result carrier, mechanical observations,
  ABG admission, and replay path remain distinct.
- C3 retains its existing branch topology. Each branch remains an exact C1 task, and
  aggregate admission refuses a mixed A/W branch vector before dispatch.
- ABG exact-prefix admission now carries and checks the full A/W pair and requires
  one unique installed owner for the selected Program, GraphFunction publication,
  and implementation binding at `W.roots.productRoot`. GraphFunction-publication and
  implementation-publication digests remain separate coordinates; owner unity does
  not require those digests to be equal.

The P3 boundaries remain explicit. C0 does not claim to prevent an ungoverned
external or same-user target or parent namespace mutation after the owner's final
pre-effect validation and before the publication syscall. C2 does not claim to
pre-effect authenticate a fully recomputed, coherent same-user substitution of
`task.json`, `launch.json`, and every derived sibling. These are separate nonclaims:
C0 concerns the final namespace window; C2 concerns coherent task/launch occurrence
substitution.

Product, requirements, Public-family contracts, event kinds, GTL meaning, and C3
topology are unchanged. No Product reprice is implied by the implementation.

## Selected 19-path boundary and Stage 2 preimages

The selected existing-path boundary is exactly the nine production paths above plus
these ten paths:

1. `build_tenants/abiogenesis/typescript/test_env/support/root-installed-environment.mjs`
2. `build_tenants/abiogenesis/typescript/test_env/support/root-cli-environment.mjs`
3. `build_tenants/abiogenesis/typescript/test_env/tests/t287-worksite-file-replace-owner.test.mjs`
4. `build_tenants/abiogenesis/typescript/test_env/tests/t287-post-binding-worksite-write.test.mjs`
5. `build_tenants/abiogenesis/typescript/test_env/tests/t287-worksite-construction.test.mjs`
6. `build_tenants/abiogenesis/typescript/test_env/tests/t287-live-worksite-construction.test.mjs`
7. `build_tenants/abiogenesis/typescript/test_env/tests/t287-worksite-command-execution.test.mjs`
8. `build_tenants/abiogenesis/typescript/test_env/tests/t287-worksite-branch-construction.test.mjs`
9. `build_tenants/abiogenesis/typescript/product-toolchain-manifest.json`
10. `build_tenants/abiogenesis/typescript/contracts/capabilities/capability-definition-graph.json`

The first eight are the Stage 2 support/evidence paths. Every one is already dirty
against `HEAD`: the two support files are modified and all six test files are
untracked. There is no Stage 2 preimage freeze. The next account must freeze the
exact current bytes and statuses of all eight before authorizing any Stage 2 edit.
Do not reconstruct their preimages from `HEAD`, copy from another worktree, or
silently absorb them into a new evidence subject.

The two generated files currently present in the repository are also not qualified
evidence. An accidental repo-local `npm build` regenerated ignored build/manifest
state. No cleanup is authorized. Regeneration and clean-build comparison must occur
from a disposable copy after the source/evidence subject is accepted; repo-local
generated bytes cannot be promoted merely because generation completed.

## Artifact and historical basic evidence

There is one retained predecessor package at:

`/private/tmp/abi-c2-qualification.aiKS27/packages/pack-one/abiogenesis-typescript-tenant-5.0.0-dev.286.tgz`

Its SHA-256 is
`dc4642fce8c6e57393b081dd473f6432a7bbd486214c8b69a09f77f86fe8b0a1`.
It qualified the prior C2 one-argument helper and C3 subject. It does not contain or
qualify the canonical-root correction and must not be used as the artifact for new
Stage 2, odd no-live, or campaign evidence.

The historical successful basic run root is
`odd_glc/.../basic-cli/20260903T095831605Z_pid10878`. Its candidate SHA-256 is
`0a3c7ea3177a4bdafc1a2b0c765e7d6bbf5193b81d46d6a557db89db4c53dd74`.
It used two FPs at `low` and recorded total cost `$0.3907934`. Its C1, C2, and replay
behavior passed. Acceptance was suspended by
`.ai-workspace/comments/codex/20260903T111124Z_HANDOFF_t043-basic-cli-acceptance-suspension.md`,
whose SHA-256 is
`f90dc18c7df938175d0d97246bc1cd3e8a2a73256da419c370e5bc20d24f72ad`.
The run is useful historical behavior evidence only. Because it wrote into the
installed Product under the old root relation, it earns no `1/7` campaign credit.

## Campaign order

Campaign progress remains `0/7`. The required scenario order is:

1. `basic-cli`
2. `js-tenant-test`
3. JS SDLC bootstrap
4. Parallel JS
5. Data Mapper Scala/SBT
6. Rust CLI
7. Rust service

The unchanged basic subject is the first discriminator. Only a complete admitted
result, fresh replay, independent review, and durable acceptance for that exact run
can make progress `1/7`. `js-tenant-test` must not start until basic is durably
accepted. The remaining scenarios follow in the listed order under separately
selected live authority.

## Worktree and operational snapshot

At transfer time:

- ABIogenesis reports `main...origin/main`, 110 tracked-change entries plus 33
  untracked entries, and zero staged entries.
- odd_glc reports `main...origin/main`, 12 tracked-change entries plus 12 untracked
  entries, and zero staged entries.
- No fresh fetch was performed, so these branch labels do not establish current
  remote parity.
- Unrelated dirty work must be preserved. No broad add, reset, checkout, clean,
  restore, or other normalization is authorized.
- The accidental ABIogenesis repo-local build regenerated ignored build/manifest
  material. It remains in place because cleanup was not selected.
- Several attempted Stage 2 agent dispatches returned backend `404` before doing
  work. Those failures are operational dispatch failures, not Product failures and
  not evidence against the candidate.

No campaign process is active. Do not assume a worker, reviewer, pack, or live run
is continuing in another terminal.

## Exact next sequence

1. Reacquire the exact authority and Stage 1 bytes. Convert the later in-session
   technical `GO` into a durable independent Reviewer return, then obtain a durable
   Executive projection. If that result cannot be independently reconstructed,
   stop; do not infer it from this commentary.
2. After the durable Stage 1 disposition selects Stage 2, freeze byte hashes and Git
   statuses for the exact eight support/evidence preimages. Activate an evidence
   Worker with only those eight paths as write territory.
3. Freeze the completed Stage 2 subject and obtain independent source/evidence
   review. Progress requires `P0=0`, `P1=0`, and `P2=0`; the explicit C0 and C2 P3
   nonclaims remain recorded rather than silently broadened.
4. Regenerate the two selected outputs, perform a clean disposable build, create two
   byte-identical package artifacts, and qualify the installed package across full
   C0-C3 behavior. Do not qualify the dirty repo build or the old predecessor tgz.
5. Give odd_glc the exact accepted root-correct artifact for its no-live gate. odd
   may consume and interpret admitted evidence; it must not supply an ABI-local shim
   or synthesize mechanical observations.
6. Run the unchanged `basic-cli` live subject first. Require complete admitted C1/C2
   behavior, fresh replay, independent review, and durable acceptance.
7. Run `js-tenant-test` only after basic acceptance.
8. Continue JS SDLC bootstrap, Parallel JS, Data Mapper Scala/SBT, Rust CLI, and Rust
   service in that order, with each result admitted, replayed, reviewed, and durably
   disposed.
9. Version allocation, release metadata, Git staging/commit/push, RC, tap, release,
   and Product-goal closure remain unselected. Return to Executive selection before
   any such effect.

## Copy-pastable next-account Executive activation

```text
Activate as Executive for T-287 canonical-root Stage 1-to-Stage 2 continuation.
You may inspect, run non-mutating checks, decide, and delegate. Executive mutation
lock applies: do not modify candidate, worktree, Product, authority, design, ticket,
commentary, evidence, generated, package, odd_glc, or Git bytes while occupying
Executive. Any Reviewer, Writer, evidence Worker, packager, or live operator must be
separately activated with an exact operation grant and exact territory.

Reacquire current authority from GOALS SHA-256
c7d24e16297e54bb60ebb3d554d4e3013033acc7d721c4b0777ec1721321fb9c,
T-287 SHA-256
5eeecd413979141569ae050b0b4547b290d8d3a790d801f836de1b367076bc23,
design README SHA-256
a58f09b1bb6f4315c92b3638855541533f536c853617c94e7e4e892ecd5e9e64,
C0 SHA-256
7cd8a5a905cdb02c8431b06224df5aa46cfc8f759a7dc5c1fd4712e66c652240,
C1 SHA-256
61589c4428c6d26f7e8063d40c9d6e653897df8a5bbfaf8d0fb048ce8cce3c61,
and C2 SHA-256
8dbe22c8bcc2bcedc0e77a5f03a2fde1805d408e555e83bde342b9bb1d2a2301.
Treat this handoff as commentary only.

Current durable state still says C0 review pending, Stage 1 HOLD pending owner-unity
repair/review, and Stage 2 blocked. A later in-session technical GO exists but has no
durable Reviewer/Executive projection. First independently reacquire and durably
project that review and Executive disposition. Do not start Stage 2 from the session
claim alone.

If and only if durable disposition selects Stage 2: freeze the exact current bytes
and statuses of the two modified support files and six untracked tests before any
edit; activate an evidence Worker only over those eight paths; freeze and
independently review the result with P0/P1/P2 all zero; then regenerate the two
outputs and build/twin-pack/qualify only in clean disposable space. Require two
byte-identical packs and installed full C0-C3 qualification before odd use.

There is no root-correct artifact and campaign progress is 0/7. Do not use the old
dc4642fce8c6e57393b081dd473f6432a7bbd486214c8b69a09f77f86fe8b0a1
artifact for new qualification or odd evidence. Do not begin any live run before
accepted source/evidence, exact artifact, package, installed C0-C3, and odd no-live
gates close. Then run unchanged basic-cli first and require durable acceptance before
js-tenant-test. Preserve all unrelated dirty work. Do not stage, commit, tag, push,
allocate a version, tap, release, or claim Product closure without a new exact
Executive selection.
```

The handoff stops here: open, between Stage 1 production and Stage 2 evidence, with
no root-correct artifact, no active campaign process, and no campaign credit.

## Operational risk: token consumption and agent configuration

- date: 2026-09-04
- authority: commentary only

Role separation does not create token separation. Executive, Worker, and Reviewer
are separate semantic authorities, but every model turn still consumes metered
capacity. An Executive running in Ultra continues to spend tokens on planning,
tool-call context, tool results, reconciliation, and output. Ultra may also delegate
additional agents, and every delegated Worker or Reviewer is separately metered.
Treat an Ultra Executive as an active consumer and multiplier, not as a free control
plane.

The applicable OpenAI explanations are [Codex usage and plan
accounting](https://help.openai.com/en/articles/11481834) and [token counting and
usage](https://help.openai.com/en/articles/4936856-understanding-and-counting-tokens).
Codex/Work usage includes input, cached input, output, and delegated-worker or
code-review activity. Hidden reasoning tokens count as output usage even though the
reasoning text is not visible in the transcript. Cached input is discounted, but it
is not free. Visible prose therefore understates total usage, sometimes materially.

The exact account ledger is not present in this repository. Repository logs,
transcripts, shell history, run receipts, and model-cost fields can explain causes or
record external calls, but they cannot establish the current Codex account balance.
The next account must inspect **Codex Usage** for the authoritative account view.

Transcript-supported sources of consumption in this work include:

- many `xhigh` and `max` Worker and Reviewer turns;
- repeated full-history context forks, which replicated a large accumulated context
  into new metered turns;
- repeated C2 helper, transport, task/launch, owner-root, and canonical-root repair
  loops, each followed by renewed review and reconciliation;
- frequent progress updates during long-running tests, adding model turns even when
  the underlying test was merely continuing;
- repeated emission and re-reading of large hashes, manifests, qualification logs,
  status snapshots, and evidence inventories; and
- Executive reconciliation across distributed returns, including conflict
  resolution, authority reconstruction, and repeated next-step prompting.

Shell waiting itself is not the principal token cost. A quiet process consuming wall
time does not by itself explain model usage; the surrounding polling turns, copied
context, tool output, analysis, and updates do. Backend `404` agent-dispatch failures
are operational failures, not Product failures. They can still induce retry and
reconciliation turns, but an unsuccessful dispatch should not be counted as Product
evidence. Visible transcript length is also not a safe upper bound because hidden
reasoning is metered as output. Cache hits reduce the applicable input charge but do
not make repeated context free.

Two known external live-model receipts illustrate a separate budget boundary:

- The failed `xhigh` Claude C1 run consumed `$0.673411` and reached the configured
  `$0.50` cap after `64,000` thinking tokens.
- The successful `low` basic run used `2 F_P` calls and recorded total cost
  `$0.3907934`.

These are external/live-run evidence. They are not necessarily entries in, or a
reconstruction of, the Codex account ledger. Their value is comparative: effort,
reasoning allowance, and orchestration shape can dominate cost, and a nominal cap
may not align cleanly with the final receipt or provider reporting boundary.

| Risk | Failure mode at this boundary |
|---|---|
| Budget exhaustion before C2 | Stage 2 or package qualification loses model capacity before the first root-correct end-to-end result. |
| Context amplification | Full-history forks repeatedly meter the same large authority, diff, manifest, and log context. |
| Duplicated review | Multiple reviewers inspect moving or overlapping subjects instead of one coherent frozen candidate. |
| Hidden-reasoning overrun | Sparse visible prose masks a large output-token charge from high-effort internal reasoning. |
| External-model budget mismatch | A live-run provider cap, thinking-token ceiling, and final dollar receipt do not line up with the intended campaign budget. |
| Cheap-oversight assumption | Ultra Executive planning and delegation are treated as overhead-free while consuming tokens and spawning separately metered work. |

Apply these controls in the next account:

1. Run the Executive at `low` or `medium` with concise prompts and bounded returns.
   Escalate effort only for a named decision that cannot be closed at the lower
   setting.
2. Use `xhigh` Workers only for hard implementation. Use `max` only for an explicit
   blocker with a narrow subject and a stated stop condition.
3. Use `high` or `xhigh` Reviewers against one exact frozen subject. Treat `max` as
   an exception, not the default assurance setting.
4. Prefer `fork_turns: none` or a small recent-turn fork. Pass exact hashes, paths,
   findings, and authority excerpts instead of replaying the full account history.
5. Emit one milestone update per test phase. Do not spend turns narrating passive
   waits or repeating unchanged status.
6. Request one independent review after a coherent freeze. Do not review every
   intermediate repair or dispatch overlapping reviewers on a moving tree.
7. Bound tool output at the source: select exact paths and line ranges, summarize
   repetitive logs, and retain full raw evidence on disk rather than reinserting it
   into model context.
8. Start no live-model scenario until the source/evidence review, generated-output,
   clean disposable build, byte-identical twin-pack, installed C0-C3, and odd
   no-live artifact gates have closed.

Before the next activation, check the Usage dashboard. In the next handoff, record
the model, reasoning effort, input tokens, cached-input tokens, output tokens, and
delegated-agent counts for Executive, Worker, Reviewer, and code-review activity.
This operational record remains commentary and does not alter T-287 authority or
the Stage 1-to-Stage 2 gates above.

## Postmortem findings from the 24-hour delivery cycle

- date: 2026-09-04
- status: commentary, not law
- scope: evidence, risk, controls, and retained successes from this delivery cycle

This postmortem does not accept a candidate, change Product meaning, select Stage 2,
or authorize package, live, Git, or release effects. It records the observed causal
chain so the next activation can avoid paying for the same discoveries again.

### Evidence, risk, and control record

| # | Finding and evidence | Risk | Control |
|---:|---|---|---|
| 1 | **STDO representation and context.** STDO RC4, the Product Frame, exact project reference frames, and subject hashes correctly governed authority. They were not packaged as a compact per-stage context capsule. Agents often received full-history forks and repeatedly consumed raw logs, manifests, and hash inventories. | Context amplification increased cost and made the operative frame harder to distinguish from historical evidence. | For every stage, create one STDO context capsule containing the basis URI and hash, Product Frame, selected subject, exact paths and hashes, evidence state, exclusions, and stops. Use `fork_turns: none` or a small fork, reacquire governing source by hash, and keep raw evidence on disk. |
| 2 | **Durable-authority lag.** A technical `GO` existed in conversation without a durable Reviewer return or Executive projection; GOALS, T-287, and the design README still said `HOLD` and Stage 2 blocked. Earlier basic acceptance likewise needed a separate durable disposition and then a separate suspension. | A dependent actor can mistake conversational knowledge for current authority or run from a status surface that trails the evaluated bytes. | Permit no dependent activation until the exact Reviewer return and Executive projection are durable and hash-bound. After every gate, perform one status-projection transaction across the owning durable surfaces before selecting downstream work. |
| 3 | **Product taxonomy and root confusion.** Mutable authored worksite state was conflated with the installed ABI Product builder root. Basic behavior passed while authored files were written inside the install; the `js-tenant-test` `package.json` then exposed the destructive collision with the installed package. | Behavior can look correct while violating Product/install identity and threatening immutable Product bytes. | Before model or effect, run a model-free preflight asserting `A.canonicalRoot != W.roots.productRoot == I_owner.installedRoot`, prove that authored `package.json` resolves beneath A, and hash the full installed Product tree before and after for zero delta. |
| 4 | **Evidence sequencing.** Costly live runs occurred before the strongest cross-scenario, model-free root-address discriminator. The successful basic live result then became uncreditable when the root semantics were corrected. | Expensive evidence is discarded because a cheaper structural falsifier was deferred. | Run scenario-address and root-collision checks before any live call. Convert every live failure into a deterministic regression before the next live run. Preserve the campaign order: basic first, then `js-tenant-test`. |
| 5 | **Threat-model drift and over-hardening.** C2 lease, inode, one-use, and hostile-local designs, plus a C0 expected-inode CAS reading, exceeded the trusted-developer-desktop Product boundary. Pure Node/macOS could not provide target CAS with the claimed semantics. | An unselected security claim expands design and I/E, blocks delivery, and still cannot be honestly proved by the available platform. | Freeze the threat model at intake. Treat only failures inside the selected Product claim as blockers. Keep coherent same-user C2 substitution and the final C0 namespace race as explicit P3 nonclaims; do not expand I/E to close P3. |
| 6 | **Review topology and churn.** Public `helperPlan` compatibility, path aliases, hard links, historical source basis, owner unity, and atomicity were discovered serially across candidate/review cycles. | Each new seam reopens overlapping code and evidence, multiplying reviews and context. | Before implementation, run three independent frames: authority/evidence, effects/atomicity, and proof/delivery. Synthesize only their intersection, freeze one coherent candidate, and obtain one primary independent review. Repair only exact returned findings. Parallelize only disjoint paths and retain one aggregate package owner. |
| 7 | **Public-contract conservation.** One candidate leaked the private launch envelope into the public observation `helperPlan`, invalidating predecessor observations even though the host-private change appeared local. | A private transport repair silently changes serialized Public bytes, digest domains, and historical evidence identity. | Freeze serialized public key sets and digest domains. Before host-private changes pass, test predecessor and current construction, admission, and exact-exchange relations against those frozen sets. |
| 8 | **Falsifier coverage lag.** Root aliases, link-count/hard-link carriers, post-helper O1 drift, task/launch drift, crossed source bases, and predecessor-plan refusals entered evidence only after reviews exposed their absence. | Green sunny-day tests conceal missing refusal branches and cause later review loops. | Build a design-to-evidence coverage matrix before implementation. Name every meaningful accept/refuse branch and force each one with a counterexample before the subject is frozen. |
| 9 | **Long-test economics.** Data Mapper 9/22 took about `623-668s`, and the initial timeout was `600s`. Expensive reruns were triggered by test-only selector mistakes: `graphFunctionRef` versus `resultRef`, incorrect fibre/opened-carrier assumptions, and `resultContractRef` versus `observationContractRef`. | A test-harness interpretation error consumes an entire long scenario window and may be misread as a Product failure. | Prove event selectors and lineage against retained logs or the shorter Parallel 5/6 path first. Set timeout from measured duration plus cleanup margin. Run full Data Mapper only once for each coherent frozen candidate. |
| 10 | **Diagnostic masking.** On macOS, a declared `/var` path canonicalized to `/private/var` and was rejected before dispatch. The error was totalized as `implementation_exception`, then surfaced as `result_contract_mismatch`. | The last contract diagnostic hides the first causal refusal, sending repair toward the wrong layer. | Preserve the complete primary-cause chain and label refusal, implementation, and result-contract diagnostics separately. Canonicalize macOS temporary roots when constructing fixtures, before authority bytes and expected paths are frozen. |
| 11 | **CLI/model nondeterminism and retry taxonomy.** Claude added an optional Bash description, later rewrote two output paths, and StructuredOutput initially produced schema-invalid submissions that were corrected in-process. | Model variance is confused with transport, C-call, or Product failure; retries may repeat effects or erase useful correction evidence. | Project semantic Bash inputs rather than incidental phrasing. Show the model one ABI helper argument and derive sibling paths inside ABI. Define API, process, C-call, and protocol-correction retry categories before campaign execution, including which categories may retry and which must stop. |
| 12 | **Build isolation incident.** A missing `cd` caused repo-local `npm build`/test execution and regenerated ignored build/manifest bytes. In a disposable copy, symlinked `node_modules` resolved outside the temporary root. `/tmp` also aliases `/private/tmp` on macOS. | Qualification accidentally consumes or mutates the dirty source tree, and apparent disposable isolation is only lexical. | Use the tool's literal `workdir`, not a shell `cd`. Assert `pwd`, realpaths, package hash, dependency roots, and output roots before build. Physically copy dependencies into disposable space. Treat current repo-generated bytes as unqualified. |
| 13 | **Tooling-capacity false alarm.** Tar extraction returned `ENOBUFS` at the default roughly 1 MiB output buffer while the embedded manifest was about 1.14 MiB. The package bytes were not drifting. | A tool-output limit is misclassified as artifact corruption, causing unnecessary rebuild and repack. | Use a capacity-aware 64 MiB extraction/read limit for package inspection and classify the tool failure before changing the artifact. |
| 14 | **Dirty-tree provenance.** Before this handoff post, ABIogenesis had 110 tracked changes plus 33 untracked paths; odd_glc had 12 plus 12. Stage 2 already had two modified support files plus six untracked tests and no Stage 2 preimage freeze. Git status alone could not attribute authorship. | A new Worker absorbs prior dirty bytes, uses `HEAD` as an invalid donor, or overwrites another actor's work. | Every activation gets a subject manifest with exact preimage path, SHA-256, and status before any edit. Preserve dirty bytes and never infer ownership or correct preimage from `HEAD`. |
| 15 | **Package and qualification conservation.** The retained old artifact qualified C2/C3 but cannot prove the canonical-root source. Conversely, evidence-only edits can leave a tgz hash unchanged, so artifact hash alone does not prove that the evidence set or source claim is current. | A familiar package digest is promoted beyond the source and evidence it actually contains. | Join a source/doc/evidence hash inventory to packed executable-byte equality, generated manifest identity, Product/publication identities, and installed C0-C3 gates. Require all relations, not only a tgz digest. |
| 16 | **Agent-service failures.** Repeated backend `404` dispatch failures delayed Stage 2 attempts without creating work. | Operational retries consume time and orchestration tokens and may be mistaken for Product instability. | Retry one bounded time, record a durable operational incident if it repeats, and continue with the smallest available execution topology. Do not multiply agents or reprice Product for a dispatch-service failure. |
| 17 | **Live economics.** The failed `xhigh` C1 run used 64,000 thinking tokens and reported `$0.673411` against a `$0.50` cap. The successful `low` two-`F_P` basic run cost `$0.3907934`, but was later suspended for root semantics. | High effort and live repetition spend budget before cheap structural gates; apparent behavioral success can still be semantically unusable. | Start representative workers at `low`. Set a hard per-process budget and terminal condition. Do not make a live call until model-free root, source/evidence, package, installed, and odd no-live gates close. |

The token-accounting distinctions and limits are those already linked in the
preceding operational-risk section. This postmortem does not duplicate those
citations. In particular, visible transcript size is not the ledger, role separation
is not metering separation, and external live receipts are not necessarily Codex
account usage.

### What worked

- Fail-closed ABG behavior preserved runtime truth. Refused or failed paths did not
  become admitted success merely because physical or model activity occurred.
- The no-retry result retained clean causal evidence. A failed attempt was not
  blurred with an automatic second effect under the same occurrence.
- Exact hashes, canonical roots, run roots, and retained logs made it possible to
  attribute the root defect and distinguish source, package, live-run, and
  operational failures.
- Independent review found the installed-root defect before a `js-tenant-test`
  model call and before an actual overwrite of the installed package's
  `package.json`.
- Byte-identical twin packs and installed tests proved the predecessor packaging,
  C2 helper, and C3 seams for their exact historical subject. That evidence remains
  useful when its claim is kept bounded.
- Executive suspension corrected the false implication of `1/7` progress. The
  historical successful basic result was retained without being allowed to count
  against the corrected root claim.
- Dirty work, historical run roots, and predecessor artifacts were preserved for
  diagnosis and selective evidence reuse.
- No Git staging, commit, tag, push, RC, tap, release, or Product-goal closure effect
  was taken from incomplete evidence.

### Prioritized lessons

| Priority | Before what | Required correction |
|---:|---|---|
| 1 | Any dependent Stage 2 activation | Durably project the independent Reviewer return and Executive disposition, then freeze the exact eight Stage 2 preimages. |
| 2 | Any next live-model call | Issue one compact STDO context capsule and close the model-free root/address, installed-zero-delta, and cross-scenario collision proof. |
| 3 | Remaining qualification and campaign work | Tier long tests from retained-log/short selectors to one full frozen-candidate run, and keep a token ledger by model, effort, input, cached input, output, and delegated-agent count. |

### Postmortem controls for every next activation

```text
Postmortem controls for every next activation

[ ] Reacquire STDO RC4 and the Product Frame from exact source and hash.
[ ] Supply one compact stage capsule: basis URI/hash, Product Frame, subject,
    paths/hashes, evidence state, exclusions, and stops.
[ ] Use fork_turns:none or a small fork; keep raw logs and manifests on disk.
[ ] Verify the prior Reviewer return and Executive projection are durable and
    hash-bound before selecting dependent work.
[ ] Freeze exact path preimages and statuses; never infer provenance from HEAD.
[ ] Assert A.canonicalRoot != W.roots.productRoot == I_owner.installedRoot.
[ ] Assert authored package.json resolves beneath A.canonicalRoot.
[ ] Hash the full installed Product before and after and require zero delta.
[ ] Freeze public serialized key sets and digest domains before private host edits.
[ ] Complete the design-to-evidence matrix and force every meaningful refusal.
[ ] Run model-free address, alias, hard-link, crossed-basis, and drift falsifiers
    before any live-model call.
[ ] Run authority/evidence, effects/atomicity, and proof/delivery frames separately;
    synthesize once, freeze once, and review one coherent subject.
[ ] Parallelize only disjoint paths and assign one aggregate package owner.
[ ] Preserve the primary diagnostic chain; classify refusal, implementation,
    contract, tool-capacity, and operational-service failures separately.
[ ] Use literal tool workdir; assert pwd, realpaths, dependency roots, package hash,
    and output roots; physically copy dependencies into disposable space.
[ ] Use capacity-aware package inspection before alleging artifact drift.
[ ] Prove long-test selectors on retained logs or a short lane; run full Data Mapper
    once per frozen candidate with measured timeout plus cleanup margin.
[ ] Define API, process, C-call, and protocol-correction retry rules before campaign.
[ ] Retry a backend agent-service failure once; record it, then stop multiplying
    agents or treating it as Product evidence.
[ ] Join source/doc/evidence hashes, packed executable bytes, generated manifests,
    Product/publication identities, and installed C0-C3 results.
[ ] Start live at low with a hard per-process budget and terminal condition.
[ ] Keep basic before js-tenant-test; turn every live failure into a deterministic
    regression before another live call.
[ ] Record model, effort, input, cached input, output, delegated-agent count, wall
    time, and external live receipt in the next handoff.
[ ] Preserve commentary as commentary; obtain new authority before any version,
    Git, RC, tap, release, or Product-goal effect.
```
