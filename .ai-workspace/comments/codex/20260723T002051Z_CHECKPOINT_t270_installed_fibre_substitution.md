# T-270 Installed Fibre-Substitution Checkpoint

## Subject

- branch: `codex/t286-abi5-root`
- implementation commit: `3149a9b2b96d9cd08c27ffd02fb87f1434e2d8cc`
- accepted design: `d6da426947e1b7e18e7ed5bd1c0f945dcde9c73f`
- ticket owner: `T-270`
- Product scenario: `ABG5-S02`, still open

## Delivered Slice

The installed Product now exposes two ordinary direct GTL Programs with the
same input contract, output contract, judgment relation, and C-call locus:

- `program://abiogenesis/conformance/fd-fp-hello@5` selects an F_D leaf and
  deterministic evidence;
- `program://abiogenesis/conformance/fp-hello@5` selects the existing F_P leaf
  and probabilistic-transport evidence.

Both execute from packed bytes through clean install, workspace binding,
catalog admission and view, invocation admission, direct HoG traversal, ABG
event admission and replay, and the installed CLI outcome. The proof compares
the admitted runtime facts rather than two local helper calls.

## Proven Invariant

Fibre substitution changes the interior evidence and effect behavior without
changing the C-call spine. Both executions admit, in the same order:

1. `c_call_opened`
2. `c_call_fibre_selected`
3. `c_call_evidenced`
4. `c_call_result_admitted`
5. `c_call_judged`

They preserve the same call class, vector index, stage role, batch reference,
task ordinal, attempt, program locus, retry path, terminal route shape, result
contract, public result, and replayable closure. The admitted fibre and evidence
class differ lawfully. Only the F_P run contains actor-process truth.

A mutation pairs the F_D Program with the F_P GraphFunction. It is refused
before Run creation despite equivalent input and output contracts. This proves
that contract equivalence cannot substitute for declared Program membership.

## Verification

- `npm run test:m5:fibre`: `2/2`
- `npm run test:m5`: `36/36`
- `npm run test:m4`: `26/26`
- `git diff --check`: green before commit
- package artifact SHA-256:
  `5ea187d9c3233502ff8b5cfecd4c652d769e93f9b9c9850f7dd08781901db95b`
- Product content digest:
  `sha256:5a2777d7d8b41cd0d8597c072e5aa023321a3469daea68da07ed6a229647d85a`
- Product manifest digest:
  `sha256:2c4905d5025b882a878d72ae72838542096c69ccb750231db2f5a14c0aec8708`

No GTL parser, lowering stage, compiled carrier, public traversal controller,
or alternative runtime path was introduced.

## Residual Frontier

This checkpoint completes only the separate fibre-substitution differential.
It does not claim the full forty-row traversal inventory or `ABG5-S02` closure.
The next T-270 frontier is:

1. map the currently proven rows and implement the smallest missing executable
   traversal relations needed to complete the forty-row inventory; then
2. replace the subprocess-backed deterministic F_P fixture with one genuinely
   live probabilistic worker proof through the same installed path.
