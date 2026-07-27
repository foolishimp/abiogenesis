# T-270 S05 Consolidated Realization Candidate Review Handoff

## Purpose

This post hands one frozen S05 realization subject to independent reviewers.
The worker makes no semantic acceptance claim. S05 remains open, direct human
acceptance remains pending, and S06 remains held.

The subject incorporates one consolidated repair set over the prior
`3a10bd56` candidate. Review the exact candidate requirement-to-design-to-code,
not the sequence of intermediate fixes.

## Exact Subject

- owner: `T-270`
- Product outcome: `ABG5-S05`
- accepted S03 base:
  `8865ccff844d06f4f97765f014ae2b59c1e7d84b`
- accepted S05 design:
  `283325aa082844ad4691ca07bb39882fda7152dc`
- accepted S05 design aggregate:
  `5d01783b843481fc60a3a947a65522bc53620dd01cc87350fe2e0441015567cb`
- realization parent:
  `16b30f39c5bd6ed0fe7f7844b4fa81f2b1af85b4`
- frozen realization candidate:
  `92e8cc744ba802ea2a8ab6cc260d1d3a90513cea`
- candidate tree:
  `d153ed3dce55e7b2b7fcb53dd914a5d6a545841c`

The implementation subject is the candidate commit and tree above. This
handoff and the live authority projection are evidence only and are not part
of that implementation subject.

## Consolidated Repair

The candidate retains the ordinary installed Product path and addresses the
bounded findings against the prior candidate:

- Consensus contributes ordinary rows to the existing catalog using the
  `catalog://abg/consensus/...` URI hierarchy. It adds no Consensus catalog,
  catalog basis, registry, controller, or parallel authority surface.
- the admitted policy selects `decision_row`, `draft_ticket`, `split_ticket`,
  or `rejected_finding`; refusal-bearing findings select `deferment`;
- F_H finalization preserves the immutable `escalate_fh` round outcome while
  deriving the final public classification;
- the generated public contract catalog now includes the escalation-decision
  schema and the closed F_H-decision vocabulary;
- the traversed `ConsensusResultCandidate` is distinct from the replay-bound
  public `ConsensusResult`;
- `ticket.consensus` is projected through the existing generic
  `project.read` Product-semantics seam and appends no runtime truth;
- the unaccepted `ConsensusFinalizationState` is removed. Round decision and
  human finalization are the two variants of one closed
  `ConsensusResolution` sum;
- false terminal closure is refused, and composed Consensus graphs declare
  the existing mixed regime and F_H effect; and
- the committed root proof family is regenerated against the exact candidate
  package.

No Consensus-specific Public, HoG, ABG, validator, event-family, result-store,
scheduler, controller, second runtime, compiler, or lowering path was added.

## Mechanical Evidence

All gates ran serially from the final source state:

| Gate | Result |
|---|---:|
| S05 module | `15/15` |
| Installed Consensus | `23/23` |
| Full M5 | `152/152` |
| M4 | `26/26` |
| S05 design Mermaid | `3/3` |
| M05 Mermaid | `10/10` |
| `git diff --check` | pass |

The full M5 gate includes retained S03 module `4/4`, installed external Product
`36/36`, and portability `3/3` evidence.

## Package Reproduction

Two serial `npm run build` and
`npm pack --ignore-scripts --json` runs produced byte-identical archives.
Each extracted package was independently hashed from sorted relative paths and
file bytes.

| Property | Exact value |
|---|---|
| Archive | `abiogenesis-typescript-tenant-5.0.0-dev.286.tgz` |
| SHA-256 | `96e058633b03721f57f2f76837f296c6ce3f9f07414793c993df60553c9e2647` |
| SHA-1 | `a2d1cd8d46232e4c57b54dee302c64752926b4af` |
| npm integrity | `sha512-hkMP6FKZ6yvMPlF8hu1cjaBdScN8v1tNdFL4L3BQbznqlhqrsOr9HQ8gpxievxVUbwTQsc3lgbSZEXboEQ6t+Q==` |
| Packed size | `299791` bytes |
| Unpacked size | `2228391` bytes |
| Entries | `184` |
| Sorted payload inventory | `eee4d1b15acecc0388c325af7596f0ecd2f07c8d47f54013810066f2cc7a0328` |
| Product content | `a926029a1d103b8adeaa54b1bb505c6692f00150209eb1b6f1eb954f8123aa49` |
| Canonical manifest | `4ea949871d5e89391de9ffdb0b7af1c2c5acd9d813703b71df9f2ae63c40ffb4` |

## Review Boundary

Reviewers should answer:

1. Does the candidate faithfully project the accepted S05 constraint network
   without inventing Product meaning, authority, topology, or lifecycle?
2. Do downstream subject, profile, policy, and overlay choices use ordinary
   hierarchical entries in the existing catalog, with no rival catalog or
   hidden fixed policy?
3. Does F_H finalization preserve admitted historical round truth while
   producing exactly one replay-bound public result?
4. Are native candidates, public results, schemas, vocabularies, and
   `ticket.consensus` projection one digest-bound Product meaning?
5. Do failure, contract-failure, transport-salvage, same-Run continuation, and
   all three workspace applications remain total and mutually exclusive?
6. Are generic GTL, HoG, ABG, Product, and Public boundaries preserved without
   a Consensus-specific runtime path?

Independent reviewers should bind findings to this exact candidate. A finding
may block an applicable retained guarantee, but it does not select S06,
qualification, release, or a new implementation programme.
