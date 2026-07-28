# T-281 S06 Public Product-Authority Candidate Handoff

## Purpose

Review one exact replacement `ABG5-S06` candidate. Independent review returned
candidate `d9794275` because:

- the SDK, CLI, and Codex delegate did not project one serialized public
  operation contract;
- `product.install` privately resolved dependencies instead of consuming a
  distinct public `product.resolve` result;
- stored verified Product and lock truth remained mutable;
- the flavored Product named an incomplete GTL contract and a noncanonical
  capability;
- publication ownership and readiness-prerequisite authority were
  underconstrained; and
- the reported M5 count was false because an S05 basis regression produced
  `169/170`.

This cut repairs only those relations and their focused proof. S03 and S05
remain accepted. S04 remains parked for 5.1. The worker has stopped authoring.
This post records mechanical evidence and does not issue a semantic verdict.

## Exact Subject

| Property | Exact value |
|---|---|
| Candidate commit | `281220331a9684247d8f7f00eb7ec4e7422131c9` |
| Candidate tree | `93e692d60713c5bae0aa2b5da84b7411caf59221` |
| Candidate parent | `3aada44ea7eebe1c091118b47b0f783f9985ab6a` |
| Accepted S05 base | `1ddc802d3003a3d0782398f7ec7c74cfa81ab127` |
| M05 design digest | `248071c6b79d733425d16dfc5f0a4269514ddd94f1df09a2dc40451169165278` |

The evidence commit is a direct child of the candidate and changes only active
status surfaces and this handoff. Review design, runtime, tests, generated root
proof, and package at the candidate commit.

## Repaired Public Contract

```text
unknown host value
  -> common SDK parser and closed operation roster
  -> product.verify(exact packed Product bytes)
  -> product.resolve(exact verified Product set)
  -> product.install(exact immutable resolution)
  -> workspace.bind
  -> catalog and invocation operations
  -> PublicOutcome | PublicInvocationRefusal
```

`abg.operation.product.resolve` is now a public operation. Installation cannot
construct or alter its lock. The native SDK parses unknown host values before
dispatch; the CLI delegates to the same parser and operation roster. The Codex
delegate remains a process shell over the resolved installed sibling CLI.

Canonical JSON schemas publish `RootPublicInvocation`, `PublicOutcome`, and
`PublicInvocationRefusal` with the same closed operation roster. The Product
manifest publishes those assets together with strengthened Product-toolchain
and public-contract catalog schemas.

Root-operation state is private. Verified Product artifacts, resolutions,
locks, installations, workspace bindings, catalog views, and applications are
deeply immutable after admission. Callers cannot mutate remembered authority
through a context property or returned lookup.

## Repaired Publication Authority

The Product author owns the complete `ModulePublication` semantic body. A
caller transports it but does not author it. Packed Product verification binds
the complete normalized publication digest, contribution rows, public
contracts, native symbol roster, provenance, compatibility, Program
membership, and independent readiness prerequisites.

Catalog admission requires exact publication and manifest equality. A changed
effect, contract, implementation, Program, GraphFunction, contribution,
ordering, semantics binding, or readiness prerequisite refuses.

The independently packed flavored Product consumes the published GTL
constructor group and canonical `abg.capability.gtl.declare@5`. Native contract
verification requires the named symbol to occur in its exact exported-symbol
roster. The fixture's independently authored publication is loaded from its
installed Product rather than synthesized by ABIogenesis.

The S05 admitted invocation basis now uses the exact verified manifest
provenance again. The previously failing durable Run-binding proof is green in
isolation and in complete M5.

## Focused Mutations

The S06 lanes now prove:

- unknown SDK and CLI operations return the same typed refusal;
- `product.install` refuses without the exact prior resolution;
- callers cannot mutate or directly inspect Product operation state;
- verified artifacts, locks, and installations remain immutable;
- incomplete or false native symbol contracts refuse;
- changed publication bodies and readiness prerequisites refuse catalog
  admission;
- caller-authored dependency edges and unresolved dependencies refuse;
- substituted or missing Codex CLI paths refuse deterministically; and
- the flavored Product consumes only installed public exports and shared GTL
  declaration constructors.

No second catalog, Product-specific runtime branch, controller, event family,
deep import, copied runtime, or S04 realization entered the cut.

## Mechanical Evidence

| Gate | Result |
|---|---:|
| Complete M5 | `171/171` |
| Retained M4 | `26/26` |
| Independent external Product | `36/36` |
| S05 module | `18/18` |
| S06 Prime module | `4/4` |
| S06 installed portability | `10/10` |
| Focused S06 aggregate | `14/14` |
| Conservation | `62/62` |
| Affected Mermaid renders | `13/13` |
| Pandoc parses | `2/2` |
| `git diff --check` before freeze | pass |

Every reported test lane had zero failures, skips, and todos. Complete M5 was
run after retained M4 regenerated the root proof and includes the retained S03,
S05, external Product, S06 Prime, and installed portability paths.

## Reproducible Package

Two independent `git archive` extractions of candidate `28122033` each ran
`npm ci --ignore-scripts` and ordinary `npm pack --json`. The archives and
C-sorted payload inventories are byte-identical.

| Property | Exact value |
|---|---|
| Archive | `abiogenesis-typescript-tenant-5.0.0-dev.286.tgz` |
| SHA-256 | `acd47629a6b57ba0fa51106c54b5d1748f3dbb7ee1159c3c64c17dc29ef1996d` |
| SHA-1 | `58df53615412e910cb151193a7c2f934e47524da` |
| npm integrity | `sha512-G+dujngPZ29+c7WgJxGOASzhx5/dfO8CXPBgG8Hp6XQ/FCIxiuNHzxjwbhGIX2P1p79inuUq72RZW5n/PvGCsw==` |
| Packed size | `325648` bytes |
| Unpacked size | `2431741` bytes |
| Entries | `195` |
| Sorted payload inventory | `ceecadbbadfeca42cd495efb00fbe27c02c0d1c3a5012897dd3f8d444405692e` |
| Product content | `e831d1c6a2f7cba4fc7d08eed6f201be32d3120ee7fd7abf449ef8aff1953c8a` |
| Canonical manifest | `a0aaaef3bd75752e2468a2176ecb333b5d2250139b05c3bf586ad18e3fc9f3e5` |

The inventory digest is SHA-256 over C-sorted lines
`<file-sha256><two spaces><package-relative-path><newline>` from an empty
archive extraction.

## Retained Root Proof

| Proof | SHA-256 |
|---|---|
| Governor | `2584c6b8b1cac57665299625f2ceda2546eeb2323721b50833788ad5b2c0e103` |
| Event log | `2871dd014b2e82a7ec2611eca5ef36b24f370aa2cce197f3d17849d9461effd3` |
| R10 result | `0de80421edd351e0c702130eda630e4d99bd0c9dd90ee169772b01ae4a21eed3` |
| Outcomes | `5a23a3ae8fb4d65c671f1e5f4ac8386b9f9cceca6955cc349b7aca6e13ed2f96` |
| Transcript | `b75c16109edb93dd8ca54b7dd4fb0d7751a7e1489c1a61bc34bc86d57539fcaf` |
| Rival-authority mutations | `8a567fc43bceaabf31ce572e25025959238b24f9d9ad5b47f4100abad65c92ab` |
| Candidate basis | `b516006e7077dadcdc394b7c7644459ac5c76e975a2b26b8ae743497ed2e70d0` |

## Review Questions

1. Do SDK, CLI, and Codex project one serialized operation and outcome
   contract, including typed refusal for unknown input?
2. Is `product.resolve` a distinct authority operation, and can installation
   consume only its exact immutable result?
3. Can any caller inspect, mutate, substitute, or replay remembered Product,
   lock, installation, or catalog authority?
4. Does packed publisher truth bind the complete publication, exact
   contribution and public-contract rows, native symbols, provenance,
   compatibility, Program membership, and readiness prerequisites?
5. Does the flavored Product use the actual published GTL constructor contract
   and canonical capability without deep imports or copied mechanics?
6. Is the prior S05 Run-binding regression closed without changing S05
   semantics?
7. Are S03 and S05 preserved, S04 absent, and the catalog plus HoG/ABG runtime
   still singular?
8. Does the package reproduce from the exact candidate with the recorded
   archive and inventory identities?

## Non-Closure

This handoff does not accept S06, freeze unified M5, select qualification, or
authorize release. Independent reviewers evaluate this exact cut. Direct F_H
authority then accepts it or returns one consolidated bounded repair set.
