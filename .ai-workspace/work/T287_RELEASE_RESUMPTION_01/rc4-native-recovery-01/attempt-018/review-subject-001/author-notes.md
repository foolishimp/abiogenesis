# Native HC2 acquisition notes (attempt 018)

Scope: acquire existing candidate 1100bd8f2b84e03ad12479f9841b9bb53408f0db /
tree d5d1a46f4dc8fb10c0178e5b77e30d689c9476d6 without code change. Not accept.

## Basis and skill actually used

- `stdo status --definition stdo_abiogenesis.json --verify`: installed, valid,
  no failures; basis `stdo://releases/v3.0.2/`, manifest `f7f3f824…4477`
  matches the definition and the installed manifest.json bytes.
- Hash-verified members: bootstrap.md `9fb337b2…`, ACTIVATION.md `56109ffa…`,
  EXECUTIVE_BASELINE.md `064eb55e…` (equals supplied role-context digest).
  bootstrap.md and ACTIVATION.md were not read in full.
- PRODUCT_BASIS.md and stdo-work SKILL.md applied. Direct Writer entry under
  the ABI5 frame basis. Work basis: supplied admitted selection plus
  NATIVE_GRANT.DRAFT.json. No ticket drafted or created.
- HOW: T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION, read in full. PRODUCT.md,
  REQ-P-POLICY, INSTRUCTION-ASSEMBLY, M05_S06 and NATIVE_WORKSPACE_WORK were read
  partially (headings and the relevant sections).

## Adoption

- HEAD = 1100bd8; tracked tree clean.
- 35/35 grant paths match the 017 PARTIAL_CHECKPOINT blob/sha256/bytes.
- HC2 factories exported (`code/src/public/index.ts:55-58`); admission-data
  owner at `code/src/product/admission_authority.ts:232`.
- The seven 017 MJS callers reference the canonical factories. The legacy
  STDO post-call patch is absent.
- All four requiredHarnessCases titles are at `test_env/uat/harness.test.mjs:547,652,716,728`.
  None was executed.
- The seven prior-evidence files match their listed bytes and hashes. Four
  compact files were read; the large subject was checked by hash only.

## Readiness

`readiness.py readiness-inputs.json` returned FILE_ONLY_READY, with 12/12
source hashes matched and no issues. Record: readiness.json.

## Not done / residual

- No build, tsc, tests, audit or census. C2 (twelve commands) and UAT remain
  pending.
- Carried 017 residuals: the child GraphCall assumption, the wrong-run-digest
  addition, startCall cache non-use, and the deferred legacy pilot
  (T287-HC2-LEGACY-STDO-PILOT-01).
- Excluded: fresh005, S7, empirical comparison, qualification, release.
- Read-only access outside the listed read scope: the 017/016 prior-evidence
  files and the installed STDO release. See return.json `disclosures`.
