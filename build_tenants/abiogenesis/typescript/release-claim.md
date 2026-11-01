# ABIogenesis 5.0.0-rc.3 Development Preview Candidate Claim

This source identifies `5.0.0-rc.3` as a **local, unqualified
development-preview candidate** authored through ABG on the installed RC2
runtime. It is not cut, tagged, published or deployed. It is not stable
ABIogenesis 5.0, an accepted release, whole-product or fifteen-family
qualification, human acceptance, an AF22 green verdict or an AF25 qualified
release snapshot. Whether this candidate becomes an immutable RC3 is a separate
owner/operator decision.

| Coordinate | Value |
|---|---|
| Product | `product://abiogenesis/typescript-tenant@5.0.0-rc.3` |
| Package | `@abiogenesis/typescript-tenant` `5.0.0-rc.3`; `private: true` |
| Namespace/profile/subtree | `abiogenesis` / `one_project_unqualified` / `.` |
| Immutable ref | none; `v5.0.0-rc.3` is prospective and not created |
| Discovery selector | `v5.0.0`; not moved by this candidate; not an artifact or qualification identity |
| Builder substrate | installed `5.0.0-rc.2` acting as Development Product |
| Source root | Increment A `927b8c0b8`; Increment B is uncommitted worksite source on it |
| Method | `stdo://releases/v3.0.2/` |
| Distribution | none; no tag, push, registry or external publication |

## Delta from 5.0.0-rc.2 (Increment A)

1. **Original UAT outcome conserved.** Native UAT task construction keeps the
   exact original declared `workOrders.uat.outcome` as the task outcome. A
   selected UAT planner contribution is carried only as separately labelled
   advisory context; it cannot add, narrow, replace or reword an original
   outcome, criterion, rubric or subject. Authoring purposes keep the selected
   contribution as their bounded outcome, unchanged. The owning design
   (`T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md`, selected native-work handoff)
   was amended before realization.
2. **Short diagnostics complete.** The planning/parent-context stream view
   delivers a strict UTF-8 stream of at most 8,192 bytes whole, as one exact
   byte range marked `complete`, when its body matches its declared byte length
   and digest. Longer streams keep the cue display with `complete: false` and
   an explicit `omittedByteCount`; non-UTF-8 streams show no excerpt and omit
   their whole length. Every form keeps the stream digest, byte length and the
   cited Result, Result digest and field path. The owning design section
   (Selector planning facts and retained measurement proof, Run02 repair31) was
   amended before realization.
3. **Owner tests.** `t287-default-library.test.mjs` adds the stream
   discriminator (retained 4,616-byte RC2 witness with its ENOENT, BOM, CRLF,
   Unicode, 8,192/8,193 boundary, long, invalid UTF-8 and unverified-body
   cases), replaces the two assertions that encoded the superseded behaviour
   (selected UAT contribution as task outcome; middle lines of a short stream
   withheld) with their stronger successors, and strengthens the shared
   planning correspondence check. The two default-library owner fixtures derive
   `packageVersion` from the built candidate instead of the literal
   `5.0.0-rc.1`.
4. **Identity.** Package, lock root and Product constants move from
   `5.0.0-rc.2` to `5.0.0-rc.3`. Dependency versions and integrity entries are
   unchanged.

No effect, public schema, Event Calculus, event body or Product authority
changed. Result identity, producer/subject and failure/refusal classes are
unchanged.

## Delta from Increment A (Increment B)

Native A02 ended blocked at its recursion bound and native UAT remains
indeterminate for A3, A4 and A5. Increment B does not change that verdict,
does not qualify Run009 and requires no cross-version replay.

1. **A repairs.** The default-library test embeds the authentic 4,616-byte
   retained RC2 stdout (SHA-256
   `bee000fc220e14f318f5b37558dc96d113ef3428ad7d9d0a0043b7aa4a9787b6`) and its
   historical producer citation instead of reading an untracked operator path.
   The short-stream projection says `complete: true` only when a valid declared
   byte length and a valid `sha256:` digest are both present and both match;
   missing, malformed and mismatched metadata have counterexamples.
2. **Private governed lookup.** `abg/governed_context.ts` adds a module-owned,
   nonserializable `OwnedContextLookup`, a per-occurrence Unix-socket endpoint
   and the Claude stream-json correspondence gate. `abg/governed_context_client.ts`
   is the fixed client. `support/governed-context/host_adapter.py` is the
   short-lived pinned adapter to the installed released GC03
   `HostLookupBinding.read`, with no checkout fallback. The build packages the
   adapter at `contracts/governed-context/host_adapter.py` and records the
   GC03 identity, inventory digest and Python contract in
   `contracts/governed-context/selection.json`.
   B04 replaces the abbreviated `{grantId,sourceKeys}` selection, `{sourceKeys}`
   Context, string recheck and `{sourceKey,digest}` resolver with
   `deriveGc03HostLookup`. That derivation follows the released
   `_host_selection`/`read_source`/`digest` shapes and takes its values from
   native owner facts. The owner-held `{id,sha256}` retained-evidence resolver
   is `resolveGc03RetainedArtifact`. B05 removes the `gc03: null` refusal.
   The owner derives the full released `context.assemble` request from the
   authenticated activation-template member and current owner facts, and uses
   the published `invocationAdmissionDigest`. The adapter runs the released
   assembly and Recheck and gives the raw Context and Recheck to
   `HostLookupBinding`. Pages are bounded by the 8,192/65,536 intersection,
   and a larger request is refused. The focused file
   `t287-governed-context.test.mjs` (12 tests) passed in disposable scratch.
   No test named `GC03 real owner allowed denied cold tamper` exists yet. No
   allowed GC03 read through the native held-store, HoG, actor and adapter
   chain is demonstrated, and no allowed GC03 read is claimed.
3. **Actor lifecycle.** No caller supplies a lookup: the actor-process input
   has no lookup member. For a native Construction occurrence the owner
   derives the selection from the admitted constructor RunEnvironment role
   evidence. A selected occurrence would reserve inert endpoint coordinates
   before transport identity (every request refuses `endpoint_inactive`), bind
   the owner-constructed lookup of the actual admitted actor occurrence after
   intent admission, activate it only after the native `actor_process_started`
   event, close it on interruption, completion or failure, retain every
   exchange (served or refused) with complete request and response bytes,
   write the durable transcript beside the admitted raw stdout artifact, and
   refuse Result admission with the existing `actor_process_invocation_refused`
   class unless every exchange rejoins its exact fixed-client
   executable/argv/four-field command and complete `tool_result` bytes, with
   each disposition derived from the exact response bytes. Cold proof needs
   reacquired owner facts (closed cold lookup, occurrence, owner-reconstructed
   invocation); the transcript is only an index, and a page relabelled as
   refusal or a substituted invocation refuses.
4. **Conditional selection and execution gate.** A Program without the
   private `Program.policies["abg.governed_context"]` key selects nothing and
   runs unchanged. With it, the owner authenticates the admitted Program, its
   verified RunEnvironment, the dependency inventory row and Context member
   named by the key, the constructor role evidence and its complete-member
   source binding, and the strict private policy bytes; any missing,
   ambiguous, altered, partial or unsupported fact refuses dispatch. The owner
   execution gate verifies the policy's pinned Python and adapter bytes and
   fixed `-I -S -B` invocation and intersects the live role, graph function,
   native implementation, capability-grant actor, currentness and Context
   files; only its module-owned permit starts Python. `read_context` and
   dependency membership grant nothing; `corpusAccess`, axiom accesses and
   `pythonPath` stay null/empty. The Testing field is joined from the
   governance state recovered through the native leaf's execution-basis
   ancestry and parent CCall to the unique same-Run admitted Testing Result,
   producer, field and byte identity. The native Construction transport
   carries the owner-derived fixed-client command and finite permitted keys
   through `--append-system-prompt`. No Public schema was extended and no
   authority was minted.

Public operations, outcomes, event schema, the zero-tool selector and the
refusal algebra are unchanged.

## Evidence standing

When this claim was written, no declared isolated build, owner test, packed
artifact or installed smoke had run on this candidate; this claim reports no
result for them. Artifact, Product content and manifest identities come only
from actual packaging output and are recorded outside this file. RC1 and RC2
evidence and historical results do not transfer to a new package digest. The
retained RC2 blocked UAT result and the 4,616-byte ENOENT stdout remain
historical observations; the ENOENT was a snapshot omission, not demonstrated
Product behaviour failure. Mechanical checks do not establish semantic
completeness or qualification.

## Open limits

- Whole-product and fifteen-family qualification, complete native F11, sole
  AF22, S02/S03/S06 and final 5.0 acceptance.
- Increment B fixed-client delivery by a native installed RC3 occurrence is a
  separate Root-controlled witness and is pending (B4). The live GC03 read
  needs a Root-selected GC03 provider policy and principal for ABG.
  Increment B tests use model-free or captured-protocol data only.
- Increment B (B03) Worker diagnosis ran only in a disposable scratch copy
  under the host temp directory with a copy of the pinned offline
  `node_modules`: `npm run build` exited 0; `t287-governed-context` 11/11,
  `t287-default-library` 23 pass/3 env-gated skips, `t287-native-workspace-work`
  39 pass/1 skip, `t287-stdo3-run-environment` 5/5 and `installed-language-smoke`
  1/1 passed. `m5-worker-transport` passed 23/23 once, then lost 2 and later 6
  timing-sensitive cases (a different set each run) at host load ~11.
  `r1-packed-artifact` refused `artifact_digest_mismatch` because the recorded
  candidate basis predates this source. These are Worker self-checks, not C2
  Testing or acceptance.
- No model-free HoG CCall lifecycle → prepared leaf owner → actor-process
  integration test from a held store and admitted same-Run C2 Result exists.
  The released GC03 bridge boundary blocks an allowed read: the GC03 Context
  packet, granted executor and `a_c.fd-support.recheck/1` projection come
  from GC03 `context.assemble` and the GC03 policy, not from native owner
  facts. No Root-selected GC03 provider policy or principal for ABG exists.
  Closing this needs design re-entry.
- Increment B (B04) Worker self-check, in a fresh disposable scratch copy
  whose `node_modules` matched the pinned `toolchain-census.json`
  (`canonicalInventorySha256 6aba0391…`, 4576 entries): the new focused
  `released GC03 bridge` test failed before the change
  (`gc.gc03RetainedSourceRef is not a function`) and passed after it;
  `npm run build` exited 0. This test exercises the owner derivation and
  resolver only, not the production chain. No broad suite or package check
  ran. The M5 failures and the stale R1 basis above are kept as diagnostics.
  This is not C2 Testing or acceptance.
- Prompt fit: whole short streams count against the unchanged prompt bound.
  The skip-gated captured eighteen/fifty-one observation fit case has not run
  on this candidate; an overflowing history refuses as
  `declared_bound_overflow`.
- Replay of RC2-prepared UAT tasks under RC3 task construction is unobserved;
  RC2 history keeps its RC2 executing artifact.
- Model-identity independence: no assessment by an independent model identity
  is established.
- Owner-suite timing, installed-CLI early-refusal proof and partial C2/intake
  diagnostics are carried from RC2.
- Carried from RC1: Public typed-stop start/result/replay fidelity;
  Q23/assessor identity and contributor-union attribution; whole-plan material
  sufficiency, token/context/cost fit and oversized cases.
- The qualification recipe under `test_env/qualification/` and other owner
  tests still carry literal `5.0.0-rc.1` identities; their behaviour on this
  candidate is unobserved.
- Canonical generated outputs (`contracts/`, `product-toolchain-manifest.json`)
  are reconciled only by traced materialization of accepted ABG-generated
  bytes.

## Release boundary

F08 standalone Consensus and F12 dedicated observer/tuner remain reserved for
5.1, with the other Product release-boundary deferrals unchanged, including
yield production, native human response/resume and required host parity.
Dynamic graph generation/recomposition remains outside 5.0 acceptance.

RC1 release, install, tag, claim and evidence bytes are unchanged; the RC1
claim remains at `v5.0.0-rc.1`. The RC2 candidate claim remains in source root
`d1e4527dbbc0b9ca1a929122c62ca225184f3341`, and RC2 evidence is unchanged. RC3
work occurs in a separate mutable workspace. Only accepted changes actually
executed through ABG count as accepted output. Failures, workarounds, retries
and proxy interventions remain visible; missing usage/cost telemetry stays
unknown.
