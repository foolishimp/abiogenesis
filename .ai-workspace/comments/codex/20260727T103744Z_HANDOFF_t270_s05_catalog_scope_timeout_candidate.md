# T-270 S05 Catalog Scope And Timeout Handoff

## Purpose

This handoff binds one exact replacement S05 realization candidate for
independent review. It addresses the findings against candidate `c33ba46c`:

- a genuine Product catalog-application candidate could cross event stores or
  survive closure of its originating context;
- Consensus could salvage semantic output emitted only after timeout
  signaling; and
- Product contributor provenance needed an exact authority disposition.

The existing Product publication catalog remains the only catalog. This cut
adds no controller, runtime, event family, ticket, or S06 realization.

This is a worker handoff, not a semantic review verdict or S05 acceptance.
S06 remains held.

## Exact Subject

- accepted S03 base:
  `8865ccff844d06f4f97765f014ae2b59c1e7d84b`
- accepted S05 design:
  `283325aa082844ad4691ca07bb39882fda7152dc`
- superseded candidate:
  `c33ba46c4b9fdc49aca179fd3f111eb4357b1ce5`
- replacement candidate:
  `17c6444a39a4542f4bf7015d222ec0c383f4e2a8`
- candidate tree:
  `b060bdee43f6882c7e4c832d1fbd4c727808accf`

Commit `625cffed` immediately precedes the S05 candidate and changes only the
future T-247 qualification ticket. It records the retained 4.6 capability to
create and run an installed sandbox through existing public Product
operations. It changes no S05 runtime, Product, requirement, Goal, or design
surface.

The candidate-to-evidence delta is limited to `GOALS.md`, T-270, and this
handoff. Those surfaces project review state; they do not alter the candidate.

## Realized Boundary

### Origin-Scoped Catalog Candidates

ABG owns one opaque catalog-candidate scope per active event-store context.
Product authenticates a candidate against that exact scope; ABG admits it only
while the originating context remains active and only on its first
consumption. The admitted application remains scoped to the same store.

The focused proof covers a genuine candidate, not a structural lookalike. It
mirrors the admitted CatalogView history into another store and then proves
that the origin candidate cannot be admitted there. It also proves same-store
duplicate refusal, post-close refusal, and inability to mint a new scope from
the closed store.

### Contributor Authority

The public `contributorRef` is a proposal, not authority. Product derives one
of two exact dispositions:

- `trusted_developer_attribution`, bound to the workspace-authorized actor; or
- `installed_product_attestation`, returned by the exact loaded Product
  semantics provider for its own installed Product identity.

The flavored Product proof binds its catalog values to its exact Product-owned
attestation rather than to a caller-selected locked Product label.

### Timeout Output

Worker transport snapshots result-bearing stdout immediately before timeout
signaling. Only that snapshot may be parsed into semantic output after a
timeout. Full later stdout remains available as diagnostic process evidence.

The focused worker emits valid stream JSON only from its `SIGTERM` handler.
The transport records the bytes diagnostically but exposes no semantic final
output or output artifact, and Consensus remains a transport failure.
The retained valid-before-timeout salvage case remains green.

## Design Amendment

| File | SHA-256 |
|---|---|
| `M04_PUBLIC_OPERATION_DEFINITION_FAMILY_BEHAVIOR_DESIGN.md` | `9c689f8033dc5fe1fb2767d4b20f97445efb93eafd0c38807477dd53d0d845c2` |
| `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md` | `2f67fd2a29e59a22a33693096ce296aed885dce0752bcb95a76ec533c2071aeb` |
| `M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md` | `ee57d2b20bf9cbd382a8a804f1e84b553d8744da28fb6173d47f6d4e779f9387` |
| `ADR-046-catalog-application-binds-concrete-values-without-runtime-events.md` | `b5ed970eee8deb1e60673c1c338cb88d9a2d3d117f553dcd35eff705e2c0ca15` |

The SHA-256 over C-sorted standard `shasum -a 256` member lines is:

`015a158a8a636502e76b88fe87866633757deca597832e1010099ba371e13c2d`

## Mechanical Evidence

| Gate | Result |
|---|---:|
| Complete M5 | `159/159` |
| S05 module | `18/18` |
| Installed Consensus | `26/26` |
| Worker transport | `9/9` |
| Installed portability | `3/3` |
| Retained M4 | `26/26` |
| Installed external Product | `36/36` |
| S03 authority unit | `4/4` |
| Conservation projection | `62/62` |
| Affected GFM parses | `4/4` |
| Affected Mermaid renders | `16/16` |
| `git diff --check` | pass |

Every test aggregate reported zero failures, skips, and todos. The complete M5
run gained exactly the cross-store/post-close authority proof and
post-timeout-output proof required by the review.

## Reproducible Package

Two independent `git archive` extractions of exact candidate `17c6444a` each
ran `npm ci` and `npm pack --json`. The resulting archives are byte-identical.

| Property | Exact value |
|---|---|
| Archive | `abiogenesis-typescript-tenant-5.0.0-dev.286.tgz` |
| SHA-256 | `9da45164e48c9c3f6117adfc59c58897c1718f7e9e9e75fc41df20093bf97586` |
| SHA-1 | `fd76017737dfed1bda5954b3f630d81be3c7c03d` |
| npm integrity | `sha512-34+9Amvc0q/xLNOjMqQy3J8Wh4op+STz4D8WuRAFiEt7k9Y556/g3sImMOdyQ5v9ALegIiFug8E6OZHfyKT5Sw==` |
| Packed size | `308503` bytes |
| Unpacked size | `2281009` bytes |
| Entries | `186` |
| Sorted payload inventory | `f52aa10489ca0b3cf8f29babb3dc60bd3953439657df0f525e77b3a0dcd781a1` |
| Product content | `99bf66422bd2eeda45f7582bfb18c33a39445d04ae00ddd869bcc4d5e6b8c407` |
| Canonical manifest | `5d88bcc57f4d01af2435ab4406abcfeab47fdd6fa6c172a0d95d5672142cf063` |

The inventory is SHA-256 over C-sorted lines
`<file-sha256><two spaces><package-relative-path><newline>` from an empty
archive extraction. Both archives produced the recorded digest.

## Retained Root Proof

| Proof | SHA-256 |
|---|---|
| Governor | `831c03883f55761732868c73c9f32d9bcb039b6ac5c5eef92b64918528b6f6d9` |
| Event log | `a5255e7e998a29701ce806c1e3c1f40f2c14e7869cd6ef7e42f504111be819e3` |
| R10 result | `b1bc0968e3b8c389047055aa5fcd44fe2580068fddddebf274231437ac17a43c` |
| Outcomes | `5d2e46c417d204198e8bca9c561a748e92aaa99b6975de9d2ebeceedf531fe02` |
| Transcript | `a90d08fc0913f8e19b25d9a22fbaae9362562e47bfaa617c5acadd723f14bd75` |

## Review Boundary

Independent review should answer:

1. Can a genuine Product-authenticated catalog candidate cross stores, be
   consumed twice, or survive closure of its originating context?
2. Does contributor authority derive from the exact workspace actor or exact
   loaded Product attestation rather than a caller-selected label?
3. Can output emitted only after timeout signaling become a semantic worker
   or Consensus result?
4. Does pre-timeout valid-result salvage remain available with the failed
   process evidence preserved?
5. Do the design, implementation, focused mutations, and package project these
   relations without another catalog, controller, runtime, or event family?
6. Do S05, S03, external Product, M4, and conservation regression guarantees
   remain intact?

Direct human acceptance remains required after independent review. No further
worker edits or self-review are authorized against this frozen subject.
