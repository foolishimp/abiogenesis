# Checkpoint - T-285 Fourth Direct-GTL Design Candidate

## Exact Subject Identity

| Field | Value |
|---|---|
| candidate commit | `10667b234696ff2bd10d12065279e310a3445156` |
| candidate tree | `3310050031309cf2a8e345a4ffe38661ab6e599e` |
| subject blob | `595caef2a1c5ff19277d02d52f41f8d5e11b881e` |
| subject SHA-256 | `9faeb41ddac839edc9cd2ccb83ae11b05bb54d32168fc35e74a1a9cfb97e92f0` |
| subject lines | `1400` |
| subject path | `build_tenants/abiogenesis/typescript/design/M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md` |
| supporting gate commit | `794bcac469a6fa70832390c74da5ed51ef53a652` |

`git diff-tree --no-commit-id --name-status -r 10667b23` reports exactly the
design subject. No Product, requirement, runtime, package, generated,
qualification, or release file enters that candidate commit.

The parent gate commit changes only:

- `build_tenants/abiogenesis/typescript/test_env/gates/prime_contraction_gate.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_t277_prime_contraction_gate.test.mjs`

It corrects the immutable-candidate acceptance lifecycle and does not implement
M4 Product behavior.

## Verification

| Gate | Result |
|---|---|
| exact candidate Mermaid | passed, Mermaid `11.3.0`, `1` file, `3` diagrams, source digest `sha256:2b3b9ef1160404f7883e1f749335a9495d97e40f9721d5b628cda8242209590d` |
| full registered design gate | passed, `32` files, `96` diagrams, source-set digest `sha256:3b3c01c5b59ea1713b86baf0e8b5fac10c7ae2ae488f139eafbf9c6f780b8e41` |
| Prime governance | passed, `10` tickets, `7` accepted designs, `3` pending designs, `14` checked refs, `13` census candidates |
| Prime focused tests | `10/10` passed, including immutable external-receipt lifecycle |
| whitespace | `git diff --check` passed before freeze |

The registered-design digest is supporting repository evidence. The exact-file
Mermaid result and subject identities above govern this candidate because the
pending design is not promoted into the accepted design register.

## Gate State

- independent exact-design review: pending
- direct or lawfully proxied F_H acceptance: pending
- implementation hold: active
- M4: blocked

Any design-byte amendment creates a new subject identity and requires another
exact review. Ticket, review, manifest, and later F_H receipt remain external
workflow/evidence carriers and may not revise the subject.
