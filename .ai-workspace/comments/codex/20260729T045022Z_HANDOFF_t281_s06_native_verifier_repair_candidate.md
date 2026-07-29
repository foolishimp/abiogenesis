# T-281 S06 Native Verifier Repair Candidate Handoff

## Purpose

Review one exact replacement `ABG5-S06` realization candidate against accepted
native-contract design `4f80f84a`. Independent review returned candidate
`51664393` for four defects in native Product verification and linking. The
worker applied one bounded repair, ran mechanical gates, froze once, and
stopped. This handoff records evidence; it does not issue a semantic verdict.

S03 and S05 remain accepted. S04 remains planned 5.1 work. Unified M5 freeze,
M6 qualification, and M7 release remain held.

## Exact Subject

| Property | Exact value |
|---|---|
| Candidate commit | `4c3bb239cbdcfeb2587ff06ca736c77ce84af18f` |
| Candidate tree | `fa2adf47e2bf047af3778603562b0ee71890dcb6` |
| Candidate parent | `2a267d4f4340045369ab98edb9e11fb1602bbc8c` |
| Returned candidate | `516643930d0f909afa2d35f4243fc0231f9b4cdd` |
| Accepted design | `4f80f84a826de86b4cfb4d9fec3baff428dcb44a` |
| Accepted design tree | `7070dca7d0f2ca90374b525faa60d5b810488763` |
| Design SHA-256 | `ab44417157853490f4a3d8f9055b5eca8c295fd16f9615020b70e327f57c09fe` |
| Accepted S05 base | `1ddc802d3003a3d0782398f7ec7c74cfa81ab127` |

The evidence commit is a direct child of the candidate and changes only active
status carriers and this handoff. Review implementation, focused mutations,
retained proof, and package at the candidate commit.

## Bounded Repair

The candidate changes only three authorized Product modules, focused S06
tests, and regenerated root-proof fixtures.

`product.verify` now requires private verifier evidence for every verified
artifact. Genuine Products without native contracts carry authenticated empty
evidence; a structurally tagged caller value cannot mint installation
authority.

The F01 native declaration closure now:

- retains syntax, configuration, and compiler-option diagnostics even when
  their source line contains an external relation;
- follows self-package triple-slash references into the exact declaration
  inventory without inventing a dependency on the Product itself;
- derives pending external occurrences from each exact exported symbol's
  checker declaration and alias closure; and
- rejects duplicate `(packageExportPath, namedSymbol)` ownership.

The F02 linked closure now derives star, namespace, alias, shadowing, and
type-only visibility from checker symbols rather than a root-wide export
approximation. It also recognizes `export as namespace` as global meaning and
applies the accepted cross-Product global-isolation refusal.

No public analyzer, Prime carrier, Product operation, catalog, resolver
service, runtime, event family, GTL compiler, lowering carrier, Codex-shell
behavior, S04 implementation, M6 work, or M7 work was added.

## Mechanical Evidence

| Gate | Result |
|---|---:|
| Build and generated manifest | pass |
| S06 native closure / Prime | `9/9` |
| S06 installed portability | `14/14` |
| Focused S06 total | `23/23` |
| Complete M5 | `180/180` |
| Retained M4 | `26/26` |
| S05 module in isolation | `18/18` |
| Installed R10 proof regeneration | `1/1` |
| `git diff --check` | pass |

Every reported lane had zero failures, skips, and todos. Complete M5 ran after
the final package basis and retained R10 proof were regenerated.

Focused mutations cover:

- structurally forged non-native verifier evidence;
- malformed syntax on an external declaration relation;
- self-package triple-slash inventory and digest closure;
- duplicate native contract coordinates;
- per-symbol local versus external occurrence ownership;
- ordinary and type-only star coverage with local shadowing;
- namespace and triple-slash dependency coverage; and
- cross-Product globals, `declare global`, and `export as namespace`.

## Reproducible Package

Two independent `git archive` extractions of candidate `4c3bb239` each ran
`npm ci --ignore-scripts --offline` and ordinary `npm pack --json`. The
archives and C-sorted payload inventories are byte-identical.

| Property | Exact value |
|---|---|
| Archive | `abiogenesis-typescript-tenant-5.0.0-dev.286.tgz` |
| SHA-256 | `ce1fa42b10d41dbb797f72932abe16b53f4916205b8377c862fefc520ead4785` |
| SHA-1 | `8b8820138f6d4059799333b5d9784e4196ff7bb9` |
| npm integrity | `sha512-UR2YOW/gHEiRD8bjngPp3Xn1VxMpRrHTjAgz3Juj1S3ikdO1hlEP744cTTBgDxuG+CJbXkFsHcpsIGkfDWilCw==` |
| Packed size | `2887413` bytes |
| Unpacked size | `17426687` bytes |
| Entries | `410` |
| Sorted payload inventory | `a9298643c3445f094c09e161a4e5f99a221b91b23f54a1d8b3efda5ebb8e5c9b` |
| Product content | `30c06610197529138a142c5259ace0e6c392de15363fe91368eb6949b24a725e` |
| Manifest file | `39b376c3b74b6c18d7069805f18e0e6ed55b69342094da66c9b6d70d9e91469b` |
| Canonical manifest | `aff529911a6f933a348f56814ac9e96459bcf4ede57d2a778fa46f99ec5f6aa5` |

The inventory digest is SHA-256 over C-sorted lines
`<file-sha256><two spaces><package-relative-path><newline>` from an empty
archive extraction.

## Retained Root Proof

| Proof | SHA-256 |
|---|---|
| Governor | `019d55433bece527747a36a44316caf07128030ea2eaba1c7eca74cd8e2c2e33` |
| Event log | `7c8a9774c8ce03417ae9eb26ff3234671b0fb7df4a1d296fce7ec301f8176a34` |
| R10 result | `6e29e0f4f754f0cce277cc2b32ddd66b5478bfb8cb608bcc0f2f7cb5470f84fc` |
| Outcomes | `e42a5728db2f787c5a811196df4ce25edbcd77b5ba600d6b5f5bfc05a9ce90bd` |
| Transcript | `583b37ad93aeedfffd7e28bc326ba71b628aa85e2d6fad4e426e54807c4f8e00` |
| Candidate basis | `bbbc75fe8c52f76d2ac8fe7088eb8fdc741a3e23c26fc1c981970bd45ad2bf05` |

## Changed Boundary

The candidate changes 11 tracked files:

- `declaration_exports.ts`, `verify_product.ts`, and `environment.ts`;
- focused native-closure and installed-portability tests; and
- the candidate basis and retained R10 proof projections.

It changes no specification, accepted design, GTL, validator, HoG, ABG,
catalog implementation, public operation, Codex shell, independent Product
fixture, S04 realization, M6, or M7 file.

## Review Questions

1. Does every verified Product, including a non-native Product, require exact
   private evidence minted by `product.verify`?
2. Does F01 preserve exact compiler admission while following self-package
   triple-slash closure without inventing self-dependency?
3. Does each native contract own exactly one export coordinate and only the
   external occurrences reachable from that named symbol?
4. Does F02 derive star, namespace, shadowing, type-only, and UMD-global
   meaning from the linked checker without ambient or transitive authority?
5. Do the focused mutations falsify each returned defect without adding a new
   Product surface or Prime carrier?
6. Do the exact package and retained proof identities reproduce from the
   candidate?

The worker has stopped authoring. Independent review may recommend acceptance
or return findings. Direct F_H decides S06 closure and any transition to the
unified M5 freeze.
