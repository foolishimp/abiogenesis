# T-252 Consensus GTL Body Checkpoint Review

**Timestamp**: 2026-07-13T02:34:17Z
**Ticket**: T-252
**Branch**: `codex/t266-stage`
**Disposition**: implementation checkpoint complete; F_H review pending

## Scope Reviewed

This review covers the DS-1 canonical Consensus GTL body, exact M02/M03 probe,
successor-gap ownership projection, focused tests, generated manifest, and the
packed-product publication boundary. It does not review or claim runtime
realization, DS-4 catalog publication, installed Consensus invocation, or live
reviewer execution.

## Fixed Evidence

| Evidence | Value |
|---|---|
| body | `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/consensus_gtl_body.ts` |
| body digest | `sha256:e4555c21cdb4292b64f7f4d5a625c2a520195aa8d6e9c759498eed4bf28d0ea0` |
| probe manifest | `build_tenants/abiogenesis/typescript/test_env/fixtures/t252_consensus_probe_manifest.json` |
| manifest digest | `sha256:01ab36577138acccd5a3d55efae0d11dabfefd3ea02c2c188c80498049f7a470` |
| canonical target | `graph-function://abg/consensus/submitter-reviewer-rounds` |
| module | `abg.consensus.ds1` |
| structure | 7 GraphFunctions; 5 unique graphs; 19 C programs; 34 selected vector paths; 19 unique operators; 0 Jobs; 0 Roles |
| M02 | exact canonical round trip; admitted and serialized digest equal body digest |
| M03 | `semantic_not_realized`; 0 invalid programs; 0 structural blocking issues; 41 normalized diagnostics |
| ownership | 21 active gap families; 0 duplicate owners; 0 unowned families; T-255 through T-266 loaded |

## Independent Review Findings

No checkpoint-blocking defect remains.

1. The body is a pure-data GTL free construction. Its source dependency closure
   reaches no runner, worker, transport, event, app, qualification, or product
   module. There is no Consensus controller, service loop, or private runtime
   branch.
2. T-253/T-254/T-265/T-266 are consumed through their generic public
   constructors. The body does not clone their relations, infer host identity by
   labels, or bypass the constructor-inferred Node/interface witnesses.
3. Reviewer and findings vectors are pure readonly arrays. Round, subject,
   actor, policy, reducer, submitter, and F_H context enters through explicit
   parallel source Nodes.
4. Every authored GraphFunction effect set is mechanically derived from its
   local operators plus child effects. Capabilities, domain operator bindings,
   HOG handlers, and local plugin selections remain separate authorities.
5. The module operator registry deduplicates exact values, rejects
   same-name/different-value collisions, and does not rewrite embedded vectors.
6. The body contains no `owner://abg/substrate`, public M03 barrel export, Job,
   Role, or product-catalog row. DS-4 remains the sole publication owner.
7. The probe checks every selected vector and nested C term at its canonical
   body path. Structural invalidity is zero. Unrealized semantics remain typed
   gap evidence rather than fabricated execution.

## Review Corrections Made Before Checkpoint

The self-review caught and repaired four defects before this handoff:

1. Generic helper construction initially widened T-266 tuple witnesses. It was
   replaced with constructor-created typed C-interface carriers; no cast or
   weakened public API remains.
2. Full conformance exposed missing source derivability for reducer, submitter,
   and F_H bindings. Explicit F_D projection vectors now supply those sources.
3. An early public M03 barrel export widened the DS-4 publication surface and
   failed T-223. The export was removed; the body remains an internal DS-1
   compiled subject and T-223 is green.
4. Manual grouped effect declarations were replaced by exact transitive effect
   derivation from authored operators and child GraphFunctions.

## Retained Boundaries And Debt

These are explicit successor facts, not hidden passes:

- M02 accepts then drops an unknown module field. The manifest records
  `strict_raw_module_admission`, owned by T-263.
- Full conformance reports 734 issues. T-252 does not call that gate green;
  T-264 owns proportional inventory and scope enforcement.
- No-execution evidence is static source-dependency closure plus probe-phase
  inventory. It proves that this body/probe path cannot reach execution code; it
  is not a live runtime invocation proof.
- All 21 gap families remain owned by T-255 through T-264. T-252 realizes none
  of them.
- The generated product-toolchain manifest changes because the internal body and
  package scripts are packed. Public schema and contract inventories do not
  change, and the packed publication gate passes.

## Verification

| Command | Result |
|---|---|
| `npm run lint:host` | pass, 0 warnings |
| `npm run test:t252` | pass: 82 GTL-law tests, 10 T-252 tests, exact 21-family manifest |
| `npm run test:t223` | pass: 70/70 packed publication tests |
| `npm run test:t250` | pass: 13/13 constitutional version/docs tests |
| `node --test test_env/tests/*.test.mjs` | pass: 1569/1569 full semantic tests |
| `npm run check:design-mermaid` | pass: 9 files, 27 diagrams |
| `npm run check:abg-product-publication` | pass: 63 schemas, 33 assets, 1020 payload files |
| `git diff --check` | pass |

Focused replay:

```bash
cd /Users/jim/src/apps/abiogenesis-t266-stage/build_tenants/abiogenesis/typescript
npm run test:t252
npm run test:t223
npm run test:t250
npm run lint:host
```

## Checkpoint Ruling

The canonical body and first gap census satisfy the T-252 implementation
boundary. Keep T-252 active until F_H reviews this checkpoint. Acceptance may
close T-252 without waiting for any of the 21 successor runtime/conformance
families; those are the result of this ticket, not missing work inside it.
