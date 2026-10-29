# Review of RP-2 (Codex Worker return `f8396e6b`, record `31917f66a`)

Reviewer: Claude Fable 5.1, at the owner's request after the pen moved to Codex. Commentary, not disposition; the root Codex Executive owns acceptance. Read: the RP-2 activation and Return in `phase_d.md`, the readiness README and `projection.json`, the Q23 proposal, and the full diff of `f8396e6b` under `build_tenants/` and `specification/`.

## Verdict

Items 0, 1 and 4 are sound and closable. Item 2 is sound as ABG evidence but one carrier asserts a Product defect as expected behavior. Item 3 is realized mechanically but does not do what Q20 was approved for, and the projection shows why the cost did not move. Do not buy a native run on this plan. Two bounded repairs and two owner decisions stand between this cut and a run worth paying for.

## Item 0, the record-set memo: sound

The memo returns the record-set hash for a key of (ref, path, digest, byteCount) per record, in order. It is sound because every acquisition first verifies each material's bytes against its digest and length (the `material_bytes` refusal in the new lane proves it), so the key determines the bytes. The view is still built from this invocation's bytes; the class sentence "never inferred from another invocation" is not crossed. Process-global and bounded at 256: acceptable. Warm start 4.6 to 4.7 s meets the RP-1 target; cold 14 to 15 s is the one-time hashing and is fine inside the driver's single process.

## Item 1, the yield reservation: consistent, one tone defect

Product, Release Boundaries row, release claim, roster and regenerated coverage agree; exactly one behavior removed; no requirement bound yield to 5.0. Keeping the dormant branches matches the Executive's later ruling. Defect: the Product sentence names "dormant derivation branches", which is realization (HOW) inside the Product (WHAT). Replace with "Its conserved disposition type remains" and leave the branches to the design.

## Item 2, the seven carriers: real evidence, one wrong assertion

The four lanes run installed CLI processes, admit real events and replay cold; the fixtures supply declarations and inputs, not events. `ticket_traversal` and `targeting_a_published_asset` match the Product's definitions (invoke declared ticket work through an owning GraphFunction; start against a published asset, with the undeclared-asset refusal). The fibre substitution compares topology, C-call spine and result across F_D and a locally transported F_P, with an output-boundary falsifier. Good.

Defect: `t287-rp2-correction-carriers` asserts `disposition === 'runtime_failed'` for a run stopped on a typed `inspect_runtime_archive` or `escalate`. The Public run operation maps every runtime status other than closed or blocked to `runtime_failed` (`product/run_invocation_operation.ts:785`; the contract picklist `run_operation_contracts.ts:53` has only completed, blocked, runtime_failed). PRODUCT.md's Runtime Disposition says no outcome may be erased into a generic success or failure flag. This is a Product defect, and a 5.0 promise, not a residual to carry: the test now enshrines it. Repair: the run operation contract gains `stopped` with the typed disposition carried, the projection maps `run_stopped` to it, the carrier asserts the typed value. The picklist change is a contract change, so it is the owner's decision; it belongs in the repair cut before O2, because D2 and D3 rerun on the cut anyway.

## Item 3, Q20: the selection is positional, so the money buys `unknown`

The declared representative is "the first and the last member under 131,072 bytes in inventory order", with the first member as fallback when none fits. That is a mechanical pick, not a declared argument that these members carry the rule for the group. Q20 was approved so that J judges a stated grouping argument and may return `unknown`; with no argument stated, `unknown` is the predictable answer for most of the 5,614 rule criteria, which is `blocked_incomplete` and a non-green verdict. Spending about 600 USD to learn that is not a measurement, it is the known result.

What Q20 needs before a run: per rule family, a declared relation from the rule to the member evidence that carries it (which files, which spans, which generated outputs), written into the scope declaration as the group's `sourceRefs`, with the argument text the slot renders for J. For families whose law is mechanical (the four lints, `tsc`, the generators' byte-identical reproduction), the recipe already carries the proof; those rule applications should be ruled on by the owner (REQ-P-SELF-CONFORMANCE-003 applicability, the existing ruling selections) rather than put to J.

## Why the cost did not move: the composition

Rule role, 423 slots, 408,483,409 rendered bytes:

| Part | Bytes | Share |
|---|---|---|
| Law source bodies | 86,529,739 | 21% |
| Member bodies | 84,310,772 | 21% |
| Everything else (catalog rows, classification, criteria, member metadata, attribution context, JSON and base64 framing, output schema) | 237,642,898 | 58% |

Q20 reduced member bodies and the slot count rose from 408 to 447 because 70 slots that P1 shrank now fit, so the total is flat. More than half of every rule slot is framing, not evidence. Measure one median slot (990,789 bytes) by section before any further material design; the levers that follow are realization, not law:

1. Material rendered as base64 inside JSON costs about a third more bytes and roughly twice the tokens of plain text. If the installed renderer can carry UTF-8 bodies as text, the rule role's tokens fall materially; J reads the same bytes. Measure on one slot with a tokenizer before deciding.
2. The 32 irreducible slots are two populations. Twenty-five carry one oversized generated member because the fallback injects the first member when none fits: `product-toolchain-manifest.json` (3,273,847 bytes, in 9 slots), `contracts/schemas` members (2,867,688 and 1,050,028 bytes, 10 slots), `contracts/qualification/rule-catalog.json` (1,767,172 bytes, 4 slots), two more at 879,999. The fallback should carry metadata only; the fold requires only the declared `sourceRefs` bodies, so an empty selection is lawful. These members are owner-generated and reproduced byte-identically by their generators, which is their conformance proof; their semantic rule applications are an applicability ruling, not a J read of 3 MB of JSON. The other seven are `rule/complement/code/N` at 1,048,971 to 1,171,343 bytes with 147,880 bytes of bodies and 288 subject members of metadata each; the P4 ruling's reason (the assessor's window) applies to them as it did to the proof complement, so the same 1,300,000 bound cures them.
3. The 2.04 bytes per token observed in D3 against the 4 assumed by the price model means the 605.88 USD figure is about half of what a run would cost on this rendering. Say so wherever the figure is quoted.

## Q23 and the contributor union

Codex's proposal (identity declared on the per-invocation transport binding, admitted into the transport body and digest) is better than the worker-binding site I recommended, because the transport binding is what carries the effective model for that call. I withdraw the worker-binding recommendation. Two conditions: the identity is a declared, admitted fact, never derived from the `--model` argument; and work requiring independence fails closed before any paid call.

The contributor-union residual is real and is not Codex's to carry alone: `taskProvenance` attributes a member to its last constructing chain only, so a member Opus edited and Fable later touched reaches the independence check with Fable as its only author. The RP-1 census counted every chain covering a member (the union); the plan must do the same, or the check is wrong in the direction that admits a non-independent assessor. Note the cost: chains are part of the 58% above. A member-to-authors index built once from the union, carried per slot as refs and digests, is the smaller realization; which of the two is the owning HOW is a design decision for the Executive.

## Process notes

The Codex commits carry `Co-Authored-By: Codex gpt-6-astra`, mapped to `actor-identity://openai/gpt-6-astra`; the provenance reader admits mode 100755 for the new launcher. Both truthful. The projection's attribution grounding is under supplied established-attribution hypotheses, as the README says; it is not J.

## What I would do next, in order

1. Owner decisions: the run-operation `stopped` disposition (contract); Q23 on the transport binding; the contributor-union HOW.
2. One bounded package before O2: the metadata-only fallback, the code-complement bound, the Product tone sentence, the `stopped` projection and carrier assertion once decided, the per-family declared selections with their arguments, and the rendering measurement (one slot, base64 against text, tokens counted).
3. Then O2, the inherited reruns, and D5-d-prep's projection on the frozen cut, with the 2.04 bytes-per-token rate beside the model rate.

On the calendar: the owner's two decisions and the package above are about one working day; O2 through D5-d-prep another; the run itself five to eight hours if the selection is argued. A green first verdict puts 5.0.0 at 3 to 4 November; a non-green first verdict with one repair round, 5 to 6 November. Codex's 2 to 4 November holds only if the run is bought on the present selection, which I advise against.
