# T-281 S06 Native Contract Realization Candidate Handoff

## Purpose

Review one exact `ABG5-S06` realization candidate against accepted native
contract design `4f80f84a`. The worker completed one bounded Section 8
projection, ran mechanical gates, froze once, and stopped. This handoff records
evidence; it does not issue a semantic verdict.

S03 and S05 remain accepted. S04 remains planned 5.1 work. Unified M5 freeze,
M6 qualification, and M7 release remain held.

## Exact Subject

| Property | Exact value |
|---|---|
| Candidate commit | `516643930d0f909afa2d35f4243fc0231f9b4cdd` |
| Candidate tree | `deec0643fd8fe33ce5e4244a8437adf99bc146d6` |
| Candidate parent | `f1dd3c6bd7feb17012532b1c822f78e960bfc714` |
| Accepted design | `4f80f84a826de86b4cfb4d9fec3baff428dcb44a` |
| Accepted design tree | `7070dca7d0f2ca90374b525faa60d5b810488763` |
| Design SHA-256 | `ab44417157853490f4a3d8f9055b5eca8c295fd16f9615020b70e327f57c09fe` |
| Accepted S05 base | `1ddc802d3003a3d0782398f7ec7c74cfa81ab127` |

The evidence commit is a direct child of the candidate and changes only active
status carriers and this handoff. Review code, generated schemas, tests, root
proof, and package at the candidate commit.

## Realized Projection

The public native locator carries only the publisher's exact package/export
coordinate, declaration root, declaration inventory, and sole `namedSymbol`.
It carries no analyzer receipt, complete export roster, external-occurrence
roster, or linked authority.

`product.verify` privately and independently:

- derives roots from exact packed `package.json.exports[*].types`;
- follows relative, self-package, triple-slash, import-type, import-equals,
  and re-export declaration edges with the bundled TypeScript compiler;
- recomputes complete declaration inventories and digests;
- admits locally decidable symbols; and
- records unresolved external occurrences as immutable context-owned pending
  evidence.

`product.resolve` alone:

- selects exact owner-relative direct dependency edges;
- requires one exact target contract for each crossing named symbol;
- expands namespace, star, and type-directive relations per symbol;
- rejects missing, duplicate, transitive, ambient, or side-effect-only
  authority;
- permits only same-Product inventoried augmentation;
- rejects cross-Product/module augmentation and multi-Product globals; and
- computes one linked native-closure digest inside the existing resolved lock.

Exact installation consumes that context-owned lock. The SDK and CLI project
the refined lock through the existing operation family. No operation, catalog,
service, registry, runtime, event family, Prime carrier, public analyzer, or
Codex-shell behavior was added.

The independently packed flavored Product publishes its own two native
contracts, consumes the installed GTL declaration constructors, resolves its
direct ABIogenesis dependency, and executes through the existing catalog,
HoG, ABG, SDK, CLI, and bounded Codex delegate.

## Mechanical Evidence

| Gate | Result |
|---|---:|
| Build and generated manifest | pass |
| Complete M5 | `180/180` |
| Retained M4 | `26/26` |
| Independent external Product | `36/36` |
| S03 authority module | `4/4` |
| S05 module | `18/18` |
| Installed Consensus | `26/26` |
| S06 native closure / Prime | `9/9` |
| S06 installed portability | `14/14` |
| Conservation coverage | `62/62` |
| Installed R10 proof regeneration | `1/1` |
| Accepted design Mermaid gate | unchanged `3/3` |
| `git diff --cached --check` | pass |

Every reported test lane had zero failures, skips, and todos. Complete M5 ran
after the final package basis and retained R10 proof were regenerated.

The required external side-effect-only declaration import negative is present
and passes. Triple-slash type-reference closure is also directly proved under
the same direct dependency and per-symbol coverage law.

## Reproducible Package

Two independent `git archive` extractions of candidate `51664393` each ran
`npm ci --ignore-scripts --offline` and ordinary `npm pack --json`. The
archives and C-sorted payload inventories are byte-identical.

| Property | Exact value |
|---|---|
| Archive | `abiogenesis-typescript-tenant-5.0.0-dev.286.tgz` |
| SHA-256 | `1eecdeac4aecf4be7a30fadf4642a74fe119df5a8c1009be1d1ca54df0a6204b` |
| SHA-1 | `69f24e0246448ba19e9756b8680af0a56e727267` |
| npm integrity | `sha512-XQHolmnxO8/ZkFz/rAMa0bClDn/NFe/Im4Q4HAp6qHtOuFtvs6RfJRUTr1cO+v15k+39ZZhsMHnePwhRplvlKQ==` |
| Packed size | `2885564` bytes |
| Unpacked size | `17414298` bytes |
| Entries | `410` |
| Sorted payload inventory | `f9dd4d7652acbc723cb3ff701f7a155f507343705b97751d6d99a932e79a08b7` |
| Product content | `c6debad579272b8355e66357b5fdf9269b73f724e084470f9ebf0784be94cbe7` |
| Manifest file | `88994c4135bcd9763694120f1f139a2b86cab15850aa654524e7c286a14fa533` |
| Canonical manifest | `79dee46174d662331ff9244fd9f170b374a0052feff0d1b95792c245f63e9a6b` |

The inventory digest is SHA-256 over C-sorted lines
`<file-sha256><two spaces><package-relative-path><newline>` from an empty
archive extraction.

## Retained Root Proof

| Proof | SHA-256 |
|---|---|
| Governor | `f6d3e44f12a9bdfac1b79308d89d7aef8655f5eb1c033fa7d130b047bfb02b09` |
| Event log | `e65fe8131f744336c51dcdac29435b49065284a055ba875b13f68ab03d1f3a8f` |
| R10 result | `ea9a46d73e0ae2a84252b4ff84608a90e9480d242c17dbc0207d3dab4a77b12f` |
| Outcomes | `5501fb348fcd2943c92e53f4ab4477bddb04b434fc8c06cae61ea18ddfb7a700` |
| Transcript | `28cedf1c11caef275b58899e791c5d7ba19a4d76229c85aa00cd883018831230` |
| Candidate basis | `8a38871dc7d76a2fcef8022f6b8d219c291dbfd150e0a586f0fe30a8ab839931` |

## Changed Boundary

The candidate changes 24 tracked files:

- Product native locator, private declaration analysis, verification,
  dependency resolution, lock identity, and installation;
- Public lock projection and generated catalog/operation schemas;
- Product manifest generation and bundled compiler declaration basis;
- the independent flavored Product fixture;
- focused S06 module and installed portability proof; and
- retained S05/R10 compatibility proof.

It changes no specification, accepted design, GTL, validator, HoG, ABG,
catalog implementation, Codex shell, S04 realization, M6, or M7 file.

## Review Questions

1. Is candidate `51664393` an exact projection of accepted design `4f80f84a`
   without added Product meaning or a new Prime carrier?
2. Are publisher proposal, private local verification, linked resolution,
   lock admission, and installation singular and acyclic?
3. Does every crossing symbol derive from one owner-relative direct dependency
   and one exact required contract, without transitive or ambient authority?
4. Do namespace/star/type-reference coverage and augmentation refusal preserve
   exact Product ownership?
5. Do SDK, CLI, installed flavored Product, and package schemas carry one
   digest-bound lock meaning?
6. Is declaration analysis private and subordinate to `EnvironmentBasis`,
   with no alternate catalog, resolver service, compiler runtime, controller,
   or public analyzer?
7. Do the exact package and retained proof identities reproduce from the
   candidate?

The worker has stopped authoring. Independent review may recommend acceptance
or return bounded findings. Direct F_H decides S06 closure and any transition
to unified M5 freeze.
