# T-270 S05 Clean-Checkout Repaired Exact Candidate

## Exact Subject

- candidate commit:
  `425993da5894b78b6c88b939736dead3fd2e7f98`
- candidate tree:
  `e997884f14a05fe71f06e2c4a73bd924125fd7db`
- parent:
  `4127b451e2db6cf161821aea5d9ef7076d76075d`
- bounded delta:
  `4 files, 18 insertions, 12 deletions`
- inherited semantic repair candidate:
  `61c7676ec38dcf91d6ab14396c5f1b87eb1f4ff3`
- M05 digest:
  `e95ca635a0f1fbd721d93aeb6b5e807c597c6ed163e403aa38bc6b7c94e73a18`
- design index digest:
  `ae8dc736d925886e78e2730f4dda86560cb4ae9f536a9ba78e40e10ff5620974`
- clean script digest:
  `b8b3537ca8abbd8a28e74007d60649079224bd1a3f1f191fc39447e9500e0ad0`
- manifest generator digest:
  `74359816fd3e3fd8ab18554ba751f032ed9986b060d5871d53ad3d3984fc5c80`

The candidate was pushed before this evidence carrier.

## Review Repair

The independent review of `61c7676e` accepted the semantic/runtime boundary
but found one clean-checkout P1 and one design-metadata P2.

This candidate:

1. makes the manifest generator create both generated-asset parent
   directories before writing;
2. makes the existing clean step remove the generated Consensus schema and
   vocabulary directory before every build, so ordinary builds exercise the
   fresh-checkout absence condition;
3. aligns the live design index to selected S05, accepted M05 Sections 1
   through 12, and candidate Section 13; and
4. corrects the M05 header so Section 13 activates A5-F08 rather than
   describing it as later work.

No Product meaning, requirement, runtime code, test behavior, event family,
public operation, or later Product outcome changed in this cut.

## Fresh-Archive Verification

The exact candidate was exported with:

```sh
git archive 425993da | tar -x -C <empty-directory>
```

Before dependency installation, the archive had no
`contracts/vocabularies/` path. No directory was created manually. `npm ci`
then installed the declared dependencies, and each build removed and
regenerated the derived Consensus assets.

From that exact archive:

- complete M5:
  `147/147`
- module-owned Consensus proof:
  `12/12` within M5
- installed Consensus:
  `21/21` within M5
- installed external Product:
  `36/36` within M5
- retained M4:
  `26/26`
- M05 Mermaid rendering:
  `10/10`
- fresh build from absent vocabulary directory:
  pass
- `git diff --check`:
  pass

Two serial `npm pack` runs from the same fresh archive produced:

- entries:
  `183`
- byte comparison:
  exact
- archive SHA-256:
  `85ca145e7d6755285f9c18f999f840888f8637c3e9788e35dd702a476f16d733`
- archive SHA-1:
  `c0533f8c47a2af9032f5e71043646dde641babd5`
- npm integrity:
  `sha512-+3XMXPUAiHsSMj0/LvYo0dNJbuJ80hYXaUUEYsJrOVpXyc4pmdEMXabyztAwgikbG7DSfvQ6qtWMoAJqpqb9nw==`
- size:
  `281446`
- unpacked size:
  `2019224`
- sorted payload inventory SHA-256:
  `112d8cb84308315cf58c9e1e3f596423f219f4564247d9b326cbdbc6f8dd4ec3`
- Product content digest:
  `sha256:465931bf6be4570ef793399d89d407d765a2aac9d2e7b25c7c66998ce23ff38a`
- canonical manifest digest:
  `sha256:9d2f8fe49618a7e210c684f5a5c6f1bd73d40b44ca9b70511801875608c194e0`

The package identity is unchanged from `61c7676e`; the repair changes only
source checkout constructability and live design metadata.

## Exact Review Boundary

Independent review must bind candidate
`425993da5894b78b6c88b939736dead3fd2e7f98`, not this evidence commit. It must
verify:

1. a fresh archive with no generated vocabulary directory builds and packs
   without preparatory filesystem state;
2. repeated clean builds still generate all three Consensus contract assets
   from the Product-owned source;
3. the design index, M05 header, GOALS, and T-270 agree on S05 scope and
   accepted/candidate sections;
4. the seven semantic/runtime falsifications accepted in the prior independent
   review remain unchanged; and
5. no S06 or later work entered the cut.

## Disposition

This is a promoted exact replacement candidate, not S05 acceptance.

S05 remains open for independent exact-cut review and direct human acceptance.
S06, observer/tuner, complete conservation, qualification, and release remain
held.
