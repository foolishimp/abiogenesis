# Prepared recovery witness — Root execution only

This folder is operator/test-harness input. No Product source was changed. Preparation here performed filesystem reads, copies, hashing and syntax inspection only; no ABG owner, setup, test, provider or native invocation has run.

The runtime subject is the B06 C2 RC3 archive SHA-256 `9b6440795b600ce822b54ec35c468d35af6fdd07a251f5c0bdb6c1d3ccfc253d`. The bootstrap import host is the same exact installed RC3 payload used by sunny-day-001. All 5,321 archive payload files matched that installed host during input preparation; verify-inputs.mjs rechecks them and the archive before each phase. This is local development proof, not release qualification.

## Reviewable reuse and adaptations

Original sources and oracle are frozen under original/. frozen/ contains the same finite support closure and an adapted initial test. The exact-intent fixture remains byte-identical: the producer returns its admitted value; consumer preparation reads its declared readyPath before constructing an F_P worker request; evaluate/finish inspect actual consumed output. No planner or Result is supplied by this harness.

The existing root-installed-environment support accepts frozenArtifact directly, avoiding npm pack or Product-source build. It creates an ordinary owned ABG append sink through the installed owner, genuine artifact/install/binding/catalog/execution admissions, and executes the existing declared fixture through HoG. Initial preparation uses that existing direct installed-owner test path, not a claimed Public run.start. Continuation itself uses actual fresh-process installed Public run.continue#current_intent.

Adaptations: split the original test at its authentic pending-preparation frontier; keep the original fixture immutable; replace fixed echo transport with the configured genuine provider only in continuation; remove unrelated falsifier calls; retain the consumed-frontier negative case; direct the support's legacy read-request provenance to this witness; resolve its unused fixture's Product import to the exact installed host. See ADAPTATION.patch. Product semantics are not edited or copied into this carrier.

## Root commands after sunny-day checkpoint and review

Run from this folder, using the pinned Node executable:

```sh
/opt/homebrew/bin/node prepare.mjs
```

This may pack/install the independent test consumer with npm, but must not dispatch any provider. It writes runtime/proof/prepared-checkpoint.json, continue-call.json, the exact original close handoff and PREPARED_CUSTODY.json. It leaves the declared ready input absent and exits. Root should inspect the admitted producer, pending intent and `actor_invocation_started` absence before selecting phase two.

```sh
/opt/homebrew/bin/node continue.mjs
```

This phase can incur provider cost. It verifies frozen inputs and the unchanged physical original log, exclusively creates CONTINUATION_DISPATCH_STARTED.json, supplies exactly the fixture's expected `ready\n` input and sends the retained exact request through installed cli.js --jsonl in a fresh process. Provider model/effort/limits and inherited credential *names* come from config.json; credential values are never saved. No fixed/mock transport is used. The provider's closed_prompt_proof lane permits zero tools.

The two readbacks are actual fresh Public run_result/run_replay calls against the continued original Run. The result checks require the producer once, actor once, intent once, original Run closed once, actual child foldback/delta, resolved original intent, replay with no foreign Run atoms and unchanged bytes across reads. A second distinct continuation request must refuse. All provider/transport/event artifacts remain in runtime/.

## Stops, idempotency and cleanup

Neither phase deletes anything. Each phase creates an exclusive start marker; repeating a phase refuses. Do not remove markers, ready input, event locks or output files to retry. A partial phase is evidence and returns to Root for review. Use a separately named carrier only after an explicit new selection. Do not rerun valid producer work to recreate its boundary.

This test continues its own original fixture Run and log; it never reopens the completed sunny-day Run for work. No crash, stale-lock recovery, arbitrary interruption, software correction, semantic application qualification or human response/resume is claimed. The initial stop is a controlled, undispatched consumer-preparation failure. The first same-Run continuation phase is prospective until Root runs it; fresh serialized read-authority acceptance and the real provider exchange are not preclaimed. Artifact verification inside the existing helper selects the archive subject, while this carrier's filesystem inventory also checks its bootstrap host bytes.
