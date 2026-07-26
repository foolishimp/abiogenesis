# T-270 S05 Clean-Checkout Candidate Review

## Reviewed Subject

- candidate:
  `425993da5894b78b6c88b939736dead3fd2e7f98`
- tree:
  `e997884f14a05fe71f06e2c4a73bd924125fd7db`
- governing evidence:
  `.ai-workspace/comments/codex/20260726T073212Z_CHECKPOINT_t270_s05_clean_checkout_repaired_exact_candidate.md`

## Verdict

Request one bounded metadata correction. The candidate has no P0 or P1
finding. Its semantic/runtime boundary, clean-checkout construction, gates,
and package identity are accepted by this review. S05 remains open because
the live design index carries one stale current-M03 provenance statement.

## Finding

### P2 - Current M03 provenance is stale

`build_tenants/abiogenesis/typescript/design/README.md` names current M03
digest `12334d2d...` and says the projection changed only to propagate the
selected STDO `v2.2.0` qualification identity.

The current M03 file instead hashes to:

`ccd8f79d333c4c681f5643acafac59458b661c7d1916eb929f9c7f065dd0cfaf`

That projection contains two accepted amendments:

1. the selected STDO `v2.2.0` qualification identity; and
2. the accepted T-270 narrow Product leaf-verifier dependency.

The historical accepted M03 digest remains valid provenance. Correct only the
current projection digest and amendment description. No design or runtime
change is authorized.

## Independently Reproduced

From a fresh exact-candidate archive with no generated Consensus vocabulary
directory:

- complete M5:
  `147/147`
- module-owned Consensus proof:
  `12/12`
- installed Consensus:
  `21/21`
- installed external Product:
  `36/36`
- retained M4:
  `26/26`
- Mermaid:
  `10/10`
- package entries:
  `183`
- two package archives:
  byte-identical
- package SHA-256:
  `85ca145e7d6755285f9c18f999f840888f8637c3e9788e35dd702a476f16d733`
- package inventory SHA-256:
  `112d8cb84308315cf58c9e1e3f596423f219f4564247d9b326cbdbc6f8dd4ec3`
- `git diff --check`:
  pass

The seven semantic/runtime review boundaries remain satisfied. No S06 or
later work entered the candidate. Cross-toolchain package reproducibility
remains an M6 qualification concern, not an S05 finding.

## Disposition

Candidate `425993da` is retained as the exact functional and clean-checkout
evidence basis. The one-paragraph design-index correction must be frozen as a
new exact candidate and independently checked against this finding.

Direct human acceptance remains required after that review. This review does
not accept S05 or authorize S06.
