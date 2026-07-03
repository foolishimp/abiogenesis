# abiogenesis 4.2.0-rc.4 Release Candidate Note

This checkpoint is the fourth TypeScript ABG `4.2.0` release candidate. It
follows `4.2.0-rc.3` and publishes requirement-proof carry-through as a
release-facing substrate capability.

It is an RC candidate, not the final tapped `4.2.0` release.

## Release Claim

RC4 preserves the earned `4.2.0-rc.3` reusable node-type, composition,
registry, startup, invocation-guard, instruction-assembly, installed-context,
and canonical live Hello World proof substrate. It adds T-188 requirement-proof
carry-through so closure cannot be earned by generated files, passing tests,
worker self-report, or caller-asserted coverage flags when admitted
requirement obligations have not carried into proof.

The release includes:

- `REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH` as live ABG requirement law;
- a T-188 design pack covering derivation, first-slice IACS, and structural
  carrier relationships;
- `RequirementProofCarryThroughOutputEnvelope` for admitted plugin output
  candidate material carrying source requirement obligation refs, evidence
  roles, proof obligation refs, proof policy refs, proof-shape refs, proof
  strength refs, depth class refs, replay identity, and replay digest;
- `RequirementProofCandidateClassificationTable`, selected by table ref and
  digest, so ABG derives candidate kind from stage role, admission target, and
  evidence role antecedents instead of trusting plugin assertion;
- binding-derived requirement/proof pairing through
  `GtlContractFulfillmentBinding`, with no contract-owned flat pairing list as
  authority;
- derived dependency-sufficiency instruction truth for target work and
  dependency-disambiguation work;
- derived proof-depth instruction truth for depth completeness and proof
  strength admission;
- semantic compiler rejection for target work when dependency sufficiency,
  proof-policy depth, proof strength, or typed prerequisite closure is missing;
- proof coverage projection truth that gates requirement fold closure;
- assurance fold behavior that preserves residual pressure when proof coverage
  is residual or blocked, even if ordinary assurance closure says `close`;
- a focused live F_P proof where the same generated source/verifier evidence
  closes only under full depth and remains residual under depth-incomplete
  coverage.

## Boundary

The release keeps this authority split:

```text
GTL declares:
  requirement, proof, type, graph, overlay, plugin, fulfillment, and policy
  refs as language/configuration truth

ABG derives and admits:
  dependency sufficiency, proof-depth completeness, proof strength admission,
  plugin output classification, requirement/proof pairing, proof coverage,
  requirement fold state, residual pressure, and replay-visible truth

F_P workers provide:
  candidate material and semantic evidence only

Downstream products own:
  domain meaning, product plugin behavior, prompt/policy content, lifecycle
  interpretation, and product-specific readiness claims
```

The release specifically rejects these drift paths:

- caller-supplied `dependencyClosed`, `depthComplete`, or
  `proofStrengthAdmitted` as closure authority;
- plugin-owned output category truth;
- contract-owned flat requirement/proof pairing lists;
- evidence-role inference from paths or response shape;
- passing tests as proof of all requirement obligations;
- worker self-graded proof strength;
- product-local proof coverage ledgers or closure registers.

## Versioned Artifacts

- RC branch: `main`
- RC identity: `4.2.0-rc.4`
- Candidate package version: `4.2.0-rc.4`
- Candidate tag: `v4.2.0-rc.4`

## Verification

Required evidence for accepting this RC:

```text
ABG semantic gate:
  npm run test:semantic

Focused requirement-proof gate:
  npm run test:t188

Instruction assembly regression gate:
  npm run test:t183

Live F_P requirement-proof gate:
  CODEX_LIVE_FP=1 npm run test:t188:live

Boundary and packaging gates:
  git diff --check
  npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run
```

The live proof must call a real F_P worker for candidate material, execute the
generated subject and verifier through the governed traced-process boundary,
admit the output through the T-188 carry-through envelope, project full and
shallow proof coverage, and prove the differential:

- full depth + admitted strength -> proof coverage `eligible` -> fold
  `satisfied`;
- missing required depth class -> proof coverage `residual` -> fold
  `no_close_preserved` despite the same assurance-close truth.

## RC Decision

RC4 is the ABI/GTL publication candidate for requirement-proof carry-through.
Downstream products may consume RC4 to make requirement pressure carry through
into implementation and proof artifacts without minting local coverage ledgers,
local proof registries, local closure registers, or product-local prompt/test
truth. RC4 does not make ABG own product acceptability, software policy,
release readiness, or downstream lifecycle interpretation.
