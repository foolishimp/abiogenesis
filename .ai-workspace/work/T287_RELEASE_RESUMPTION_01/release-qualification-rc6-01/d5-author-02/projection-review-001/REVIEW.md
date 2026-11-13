# Frozen D5 projection review

**Product Frame.** ABIogenesis 5.0 retains F01–F07, F09–F11 and F13–F17. GOAL-035/T-287 selects F10 D5 lifecycle-copy retirement, with F04/F11 provenance and Q23 Q1–Q7 preserved. The outcome is one typed pure durable-observation projection shared by existing owners. Product/requirements own meaning; ABG/store owns event admission and profile schedules; the fold/replay owns derived lifecycle. This helper is a pure projection, not a runtime entity. No new store, controller, authority, event stream, feature family, or weakened physical carrier is authorized.

**Result: falsified — one S2 finding.** Return to Root Executive for disposition. No source, profile, qualification, formal native J, or release acceptance is issued.

The exact subject is `review-subject-001/SUBJECT.json`, SHA256 `1cc4af139db74980cc637b11b229dba8ac2f02c30c8a920a7fea3e533c1dd290`, source HEAD `1f62c0095e6196b089071bb72e88217792edf6ff`. All 404 frozen file hashes/lengths and 349 available preimage hashes verify. The exact diff SHA256 is `b9daae09876487608ee952470fdc9685973e862a1ba2dc1a7d9ac073e3252cf0`. Only frozen source and identified retained evidence were assessed.

The frozen Definition selects STDO 3.0.4, manifest `102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b`, with empty composition. Read-only `stdo status --definition <frozen Definition> --verify` reports installed/valid and no failures. The exact native stdo-review skill and selected Project Reference-Frame Basis govern this report. The Product S0–S4 severity scale applies; severity does not assign Executive priority or disposition.

## D5-PROJ-001 — real L artifacts are treated as current P

**S2: material compatibility/proof defect with bounded containment.** In frozen `code/src/abg/qualification_proof.ts:622`, the cold join calls:

```ts
durableActorObservationOfArtifact(
  artifact.payload,
  artifact.eventContractDigest !== LEGACY_ROOT_EVENT_CONTRACT_DIGEST,
)
```

Real legacy events have **no** event-contract stamp. `event_store.ts:1215–1217` declares that rule; lines 2495–2509 emit no member for L; lines 3483–3487 reject a stamp in an L schedule. Consequently, an authentic L event supplies `undefined`, the comparison is true, and `transport_contracts.ts:79–80` requires zero lifecycle copies. Its correct four-copy L body returns null. The cold join rejects an otherwise eligible historical J before comparing its original digest.

The frozen preimage `qualification_proof.ts:616–617` removed only the three request/call envelope coordinates and hashed the whole observation. It preserved the L preimage. This failure is introduced by the new profile selector; the shared projection itself does not require it. The L contract table declaration is byte-identical to the frozen preimage, and the legacy digest remains `fc3a635040a6e3d763740ae54b6390944c7ea8cedfa060de110cb36e31ca6e3c`.

The new M2 discriminator masks the mismatch. `t287-qualification-scopes.test.mjs:805–806` expressly stamps the synthetic L event with the legacy digest, and lines 839–844 assert its positive result. That is not a lawful L envelope. Its current payload is admitted by a real P store, but L placement and lower native joins are declared premises. Those premises cannot establish the missing authentic L representation.

**Consequence and proportionality.** The trigger is deterministic for any otherwise eligible real unstamped L artifact reaching the branch; the frequency and population of such historical qualification calls were not measured. The consequence is false rejection of historical J readback and any complete F11/qualification consumer that requires it. Current Q23 eligibility may separately refuse a legacy occurrence, so preserving its preimage does not grant modern independence. The current-P production path uses a present current stamp and does not take this defective branch. No production incident, corrupted history, data loss or false-green verdict is claimed. The failure is closed: no J is returned, and immutable original owners/history remain available under CT01.

**Smallest correction.** Correct the existing cold selector and make the existing M2 L fixture omit the stamp: two Product files. An owned prefix already guarantees exactly unstamped L or exact-current stamped P; therefore a presence predicate is sufficient at this call. It selects the authenticated envelope representation, not optional payload fields or the final mixed-history prefix. An exact-current comparison is also lawful if its existing dependency is supplied. No profile port, constructor, registry, new design law, runtime change, or broad refactor is needed. Preserve all current-P and crossed-digest negatives, and retain an unstamped-L full-preimage positive plus the P-digest-over-L negative. Failing-before/passing-after proof belongs to the selected Worker; this review executed no tests.

## Bounded supporting results

The shared `transport_contracts.ts:43–82` projection removes exactly four lifecycle copies and retains the other observation members. The current artifact producer (`actor_process.ts:1354–1414`) and qualification digest producer (`implementation/qualification.ts:43–74`) use it. The cold reader uses that same owner, with the selector defect above. The current-profile-only authenticated completion premise is retained from exact `PROFILE_APPLICABILITY.json`; no new serialized profile field or port is necessary.

The full live observation and validator remain required. `implementation/contracts.ts` and `abg/probabilistic_result.ts` are byte-identical to the frozen preimages; the distinct candidate digest still consumes the full live observation through CCall revalidation. Request/call envelope joins and raw-result/transport digests remain distinct.

CCall derives timeout and signals from their primary events, direct exit from its process terminal, and confirmed termination from the fold. Recovery consumes that existing owner projection and requires its actor terminal to equal the selected failed terminal. No default lifecycle values or duplicate runtime owner were added. The physical owner requires both a direct exit and absent owned scope for confirmed termination. The lower-owner unconfirmed fixture returns no lifecycle value; the authentic full-chain unconfirmed case remains an explicit residual.

The causation test correction is confined to the existing measured durable-encoding batch. It keeps one batch map with exactly N ordered event keys, `unattributed=0`, the 128/256 growth comparisons, exact cold events and canonical bytes, per-prefix projection, and adjacent rollback/refusal checks. The production store was not redesigned to fit a counter.

All four retained final TAP byte lengths and SHA256 values match the frozen return: 27 transport, 37 qualification, 48 lifecycle/profile and 1 recovery tests, **113 pass; zero fail, skipped, cancelled or todo**. These are authenticated retained mechanical results, not new execution. The M2 pass does not cover the malformed L premise identified above. The fixture expressly assumes lower admission/process joins and native verification authority; it is not a physical provider Run. Root conjoins separate recovery assurance and owns C2/UAT.

## CT02 minimum action before RC7

The frozen current profile still uses `abg.event-contract.root/p5-run-environment-role-context@1`. The retained author computation changes D from `c4799f157883b5bb1439585ff65dbfdeaea4edcac34818817a7815878432fa02` to `3bcc8488bcfb9396cbc53c85b944df6973bf99200ab93728949853df62cecac0`; the legacy digest remains exact. This review did not execute the descriptor constructor to recompute D.

The frozen compatibility HOW §2 explicitly makes **D** the profile identity and reserves descriptor/ref acceptance to the release owner. It does not impose a mandatory successor-name change. Thus CT02 is a retained acceptance obligation, not another demonstrated source defect. Root must expressly decide whether the unchanged ref denotes the exact successor descriptor, bind the chosen ref/descriptor/computed D/generated contract, and record the prospective cut decision before RC7 acceptance. Do not silently read the old label as acceptance or backward compatibility. A rename would itself change D and require affected regeneration/reproof; no rename is needed merely to correct the two-file L defect. Fresh successor stores and authentic original-owner retention remain mandatory; no old-current reopen/restamp is selected.

## Scope, independence and return

This Reviewer did not author or repair the native candidate. It is Codex, the same family as Root, and distinct from the selected Claude Opus 5.5 native author. This is independent source judgment of that native increment, not independent acceptance of Root-authored policy or a formal F11/J claim. Parent hypotheses were checked against governing Product and owner source; author readiness was treated as a claim. The exact M2/profile-applicability and causation dispositions were reused only within their original scopes.

No test, build, ABI runtime, provider, auth, network or Git operation was performed. Raw provider stderr/narrative was not read. No moving source, full historical census, whole-release qualification or authentic full-chain recovery acceptance was assessed. Live Goals/ticket are not in the frozen inventory; selection is bound through the exact granted Root selection and frozen Product/frame/control sources. This review writes only the two granted report files.

Recommend Root select the bounded source/fixture correction under unchanged HOW, preserve valid current-P evidence, then conjoin the affected successor proof with the separate recovery review and Root-owned C2/UAT. Any subject, material supporting evidence, basis or required independence change invalidates affected reliance; a contrary native observation returns its relation to the owner. No source repair or disposition is applied here.

`REVIEW.json` contains exact hashed source, preimage, method, control and retained TAP references, complete triage, evidence limits, and the return contract.
