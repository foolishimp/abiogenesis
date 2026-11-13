**This is a finite test-dependency omission, not a demonstrated Product/HOW blocker.** The existing owner APIs support qualification migration and retirement of the unconsumed complete-history wrapper. The omitted fixture and harness must migrate with their consumers.

Product Frame remains ABIogenesis5 / GOAL-035 / T-287 / STDO3.0.4 and the complete R1–R7/C1–C5 outcome. I verified `fixture-dependency-triage-001/SUBJECT.json`, SHA256 `09699cc1e66b2e492e0b3f718eddb2f4785a03995afbdf05546bd67d58f44e5f`. All three snapshots match their declared hashes and exact f49 bytes. No moving native04 source was read.

Source routes below are relative to `build_tenants/abiogenesis/typescript/`; owner routes use exact f49 or the previously reviewed frozen native03.

| Dependency | Concrete relation and smallest lawful continuation |
|---|---|
| `test_env/support/malformed-gtl-native-fixture.mjs:141–157` | The fixture supplies old array-reader, prefix and artifact APIs. Migrating qualification imports therefore requires corresponding fixture bindings for the existing owned acquisition/projector and indexed-prefix operations. This remains an explicitly synthetic lower-owner premise, as declared at lines1–3 and77–78; it need not become an installed admission fixture. |
| Same fixture, `178–197` | Routing across `sourceFixtures` and `nativeSourceOwners` must migrate together. Preserve each original resource and actual module owner. Do not concatenate histories, route by equal JSON, or manufacture a current owned receipt for a historical package. |
| `test_env/support/fresh-process-runtime-proof.mjs:23–42`; `test_env/falsifiers/runtime-retained-projections-worker.mjs:30–51` | Both dispatch only through installed `abg/index`/`product/index`. The owned replay function is an existing direct replay-module export, not an index export. Extend this test-only dispatch relation to consume that installed module; no new Public export is needed. |
| Request producers and direct wrapper consumers | Retire their old request/export selection together with the wrapper and index export. The previously identified 11 consumer files remain the finite consumer set; changing only static imports misses the seven files constructing dynamic fresh-process requests. |

The existing canonical route is sufficient:

1. Frozen native03 `code/src/abg/replay.ts:209–212` provides `projectOwnedRuntimeTruthAtDurablePrefix`.
2. Exact f49 `code/src/abg/event_prefix.ts:291–297` provides `writeRuntimeEventPrefixValue`, producing complete plain prefix values from either representation.
3. Frozen native03 `replay.ts:183–190` provides `materializeRuntimeReplayGuard`; alternatively `195–201` writes its canonical complete value.

The proof can therefore use the owned route and normalize its result **at this explicit complete-output proof boundary**. Compare actual authority-prefix values, selected-Run prefix values and complete replay values. Serializing owned handles or comparing their JSON representations does not establish semantic equality. Existing callers that inspect `retainedRows[0].projection.replayState` still require the complete replay value, not a guard substituted under that name.

Preserve the actual fresh-process relation:

- Parent closes through `projectReopenAuthorityAndClose` at support line169.
- It launches two actual children at187–188, checking distinct child PIDs at191–193 and both event-log digests at194–201.
- Each child cold-authenticates with `reopenEventStore` at worker line21.
- Exact f49 `event_store.ts:3908–3925` binds the authenticated history to **`reopened.prefix`**. Consume that returned coordinate for owned projection after checking its correspondence with the transported prefix. Reusing `input.prefix` would unnecessarily reacquire an unbound JSON coordinate.
- Keep process ownership, timeout, completion, cleanup, evidence-retention failures and `finally` close unchanged.

The qualification fixture has one important coupled branch. `t287-qualification-producer-acquisition-reuse.test.mjs:54–60,76–95` composes pinned historical module owners; `142–176` checks actual acquisition, currentness, advance/truncation/replacement, copied-resource cold authentication and historical material preservation. A historical package may lack the newer owned API. A test bridge may invoke its actual admitted reader/projection and provide corresponding test-side access operations, while retaining those module identities and explicit assumptions. Equal JSON cannot confer nominal prefix or materialization ownership. This component also cannot prove current installed owned-route efficiency merely because its semantic join passes.

The smallest affected executable proof is:

- The affected cases in the nine direct qualification-fixture consumer files listed in the subject, concentrating on successful joins, foreign/stale coordinates, substituted or duplicate producers, cross-resource correspondence, and warm/cold equality.
- The producer-acquisition component above **with its required pinned inputs present** if claiming that real-source relation. A skip leaves it unproved.
- The seven dynamic fresh-process request producers, preserving their complete replay assertions and two actual children; `m5-fresh-process-reconstruction.test.mjs:57–103` also checks that the shared harness preserves its other request modes.
- The four remaining direct consumer files: `runtime-f09-worker.mjs`, `t287-deferred-application-restoration.test.mjs`, `t287-held-prefix.test.mjs`, and `t287-st1-installed-cross-owner-hello.test.mjs`. Preserve additional direct calls within the seven dynamic-consumer files.
- A discriminating comparison in which different authentic cuts/selected Runs or values compare unequal despite potentially indistinguishable handle serialization, plus the existing cold/refusal negatives.

All three dependencies are digest-bound members of `test_env/qualification/inventory.json`; the recipe also selects them. Final source custody must follow their changed bytes through the existing generation/staging process. That is evidence maintenance, not whole qualification.

I classify the omitted dependency relation as **S2 proof/completeness work**: it prevents the selected migration and retirement from being demonstrated, but has a bounded correction in existing test owners. Confidence in that relation is high; native04 implementation correctness remains unassessed. No Product requirement, cold-authentication law, Public meaning, new library/store, or owning HOW rule needs changing on the evidence inspected. Any adoption/caller census should record the completed migration accurately. Root owns the continuation and disposition.
