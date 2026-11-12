# TD-36S Return: the bind string rule is stated and each refusal names its cause

Writer: Claude Opus 5.5. Branch `claude/td36s-bind-string-rule` from local
`main` at `46397ec36`, worktree `/private/tmp/abg-td36s` (sparse). Change
classes: requirement_reprice (REQ-R-ABG3-BINDING-016 states the rule the code
already enforces), realization_refactor (the authority refusal's code). No
push, no tag. T = `build_tenants/abiogenesis/typescript`.

**Status: done.** REQ-R-ABG3-BINDING-016 states the string rule. At the bind
door a refused authority string returns `invalid_workspace_authority` (Public
`workspace_mismatch`); a refused declared root keeps `invalid_declared_root`
(Public `root_mismatch`); a padded ProductSet string keeps its refusal, for
the reason in section 3. No stop condition fired. Three points need the
Executive's ruling (section 8).

| Commit | Content |
| --- | --- |
| `3949f4346` | the requirement sentence |
| `28bc58b21` | the bind constructor, the new lane `t292-td36s-bind-string-rule`, and the two actor rows of `t292-td36r-bind-door-strings` |
| this commit | this Return |

## 1. The requirement

File `specification/requirements/abg/REQ-R-ABG3-BINDING.md`, identifier
REQ-R-ABG3-BINDING-016 (extended; no identifier changes). The sentence added
after "`WorkspaceBinding` shall immutably join that basis to the exact installed
product set, resolved lock, and declared roots.":

> The workspace identity, authority basis identity, and authorized actor
> reference that the binding takes from that basis, the identities of its
> product set and resolved lock, and each of its declared roots are non-blank
> strings with no leading or trailing whitespace and no NUL character; a bind
> request that carries any other value is refused.

The sentence names exactly the strings the constructor checks with
`isTrimmedNonblankNulFreeString` (`product/environment.ts`,
`constructWorkspaceBindingWithSetCheck`). It does not name the canonical root
locator or the authority manifest reference: neither is a binding field, and
no owner applies the rule to them (TD-36R residual). Stating it for them would
put the specification ahead of the code (section 8, item 2).

Other statements of the bind inputs, read for consistency:

| Surface | What it states | Relation |
| --- | --- | --- |
| REQ-P-INSTALL-008 | the authority basis binds workspace identity, canonical root locator, authority mode, manifest and configuration refs and digests; the binding joins it to the installed set, lock and declared roots | composition only; no string rule; consistent |
| REQ-P-INSTALL-049 | the binding is admitted by `abg.operation.workspace.bind` over one authority basis | consistent |
| REQ-P-POLICY-051 | bind accepts one admitted workspace, product set and lock; returns a binding or a typed refusal | consistent; the refusal is typed |
| REQ-P-PUBLIC-CONTRACTS operation table | `abg.operation.workspace.bind`: "exact product set, dependency lock, and roots" | consistent |
| `specification/PRODUCT.md` | no statement of the bind inputs (`:1304`, `:1317` concern the catalog) | none |
| `T/design/ABI5_REALIZATION_CONSTITUTION.md:1676` (R25) | bind refusals: workspace authority -> `workspace_mismatch`; installed ProductSet -> `product_mismatch`; lock -> `lock_mismatch`; declared roots -> `root_mismatch` | design authority for the routing in section 2 |

No requirement or ratified design sentence states a different rule for these
strings.

## 2. The routing

`constructWorkspaceBindingWithSetCheck` has two refusals where it had one:

1. The combined refusal, unchanged in code and message (`invalid_declared_root`,
   "workspace authority, ProductSet, and every declared root must be exact"):
   an authority basis that fails `isWorkspaceAuthorityBasis`, a ProductSet that
   fails its set check, a ProductSet or lock identity that fails the string
   rule, a roots record without its six keys, or a root that fails the string
   rule or `isAbsolute`.
2. After it, the authority strings: when `workspaceId`, `authorityBasisId` or
   `authorizedActorRef` fails the string rule, the existing
   `invalid_workspace_authority` refusal with its existing message, "workspace
   authority fields must be explicit" (the message `constructWorkspaceAuthorityBasis`
   already returns).

Because the authority branch comes second, a caller observes a different code
only for a value whose sole failure is an authority string. A value that also
fails the combined check (for example a padded actor and a padded root) keeps
`invalid_declared_root`. An `isWorkspaceAuthorityBasis` failure is not
rerouted: it is not a string-rule value.

Who reads the code:
- The Public bind (`environment_definition_bindings.ts:689-694`) maps it with
  `bindRefusalCode` (`:585-604`): `invalid_workspace_authority` ->
  `workspace_mismatch`, `invalid_declared_root` -> `root_mismatch`. This is the
  only reader.
- Admission's reconstruction (`abg/environment_admission.ts:1305-1320`) and the
  artifact-truth fold (`abg/artifact_truth.ts:570-577`) read only `.kind`.
  Their outcomes do not change.
- `resolveRefusalCode` (`:264-283`) lists both codes as impossible for
  resolution; resolution does not call the bind constructor.

On the Public bind, an authority value that is not a string-rule failure
cannot reach the constructor: `validateBindResources` refuses an authority
basis that fails `isWorkspaceAuthorityBasis` as `invalid_resource_assertion`
first, and `workspaceId` must equal the workspace manifest's reference
(`:558-559`). So on that path every authority refusal at the door is now
`workspace_mismatch`.

No refusal code, message kind or enforcement site is added. The request
schema (`absolutePathSchema`) and the Public contracts are unchanged. The
function is module-private: no `declarationInventory` digest moves (section 6).

## 3. The door table

Internal code from the bind port (`ProductEnvironmentPort.bindWorkspace`),
Public code from the installed Public bind operation
(`PRODUCT_ENVIRONMENT_DEFINITION_BINDINGS.bind`, refusal value `{code,
issuePaths: ["/request"], evidenceRefs: []}`). Every cell is observed by the
lane `t292-td36s-bind-string-rule`, on the base build and on this build,
except where marked.

| Value | Base: internal | Base: Public | After: internal | After: Public |
| --- | --- | --- | --- | --- |
| padded actor reference `" actor://abiogenesis/t292/td36s "` | `invalid_declared_root` | `root_mismatch` | `invalid_workspace_authority` | `workspace_mismatch` |
| actor reference with a NUL `"actor://abiogenesis/t292/\0td36s"` | `invalid_declared_root` | `root_mismatch` | `invalid_workspace_authority` | `workspace_mismatch` |
| declared root whose last segment ends in whitespace (`…/.ai-workspace/events `) | `invalid_declared_root` | `root_mismatch` | `invalid_declared_root` | `root_mismatch` |
| declared root with a NUL (`…/.ai-workspace/ev\0ents`) | `invalid_declared_root` | `root_mismatch` | `invalid_declared_root` | `root_mismatch` |
| padded ProductSet string (`productSetId` padded, or the set's `lockId` padded), through `constructWorkspaceBinding` | `invalid_declared_root` | not expressible (below) | `invalid_declared_root` | not expressible |

The padded ProductSet string. The Public request carries the installed set
and the lock only as coordinates; the bind mints the ProductSet with
`constructProductSet` from the admitted installs, and `validateBindResources`
checks the lock with `isResolvedProductLock`. So the Public bind cannot carry
a padded ProductSet string; `bindRefusalCode` would map its internal code to
`root_mismatch`. Through the exported constructor, `isProductSet` refuses it
first: it requires `productSetId` to be the identity minted from the set's
digest and `lockId` to equal the verified lock's minted identity (the lane
asserts `isProductSet` false for both values). The string rule on these two
identities never decides a refusal on a path that reads the code.

Which code names its cause: R25 maps an installed ProductSet failure to
`product_mismatch` and a lock failure to `lock_mismatch`. The internal codes
that map to `product_mismatch` (`empty_product_set`, `duplicate_install`) each
name a different cause. `lock_mismatch` names the lock, but using it would
mean either moving the string check ahead of the set check (one ProductSet
failure coded apart from all the others) or rerouting the whole set check,
which changes the code for values that are not refused strings. None of the
existing codes fits, so the ProductSet row is left as it is.

The workspace identity has no padded row on the Public path: it must equal
the workspace manifest's reference. The authority basis identity is minted.

## 4. The four other doors

The diff touches none of them. Each reaches the candidate owner
(`workspaceBindingCandidateMatches`, `product/environment.ts:1212-1286`), which
this package does not change, before anything else reads the value. Read at
this build:

| Door | Site | Outcome for a binding with a padded or NUL actor or root | As the review describes |
| --- | --- | --- | --- |
| catalog admission | `product/catalog.ts:468-476`: `isWorkspaceBindingCandidateInResolvedLock` false | refusal `binding_lock_mismatch` | yes |
| workspace status | `product/project_read_ports.ts:658-670`: `isWorkspaceBindingCandidate(admittedBindingCandidate(binding), …)` false | refusal `not_ready` | yes |
| rehydration of a recorded binding row | `abg/environment_admission.ts:393-405`: `checkCandidate` defaults to `isWorkspaceBindingCandidate` | `null` | yes |
| artifact-truth fold | `abg/artifact_truth.ts:552-566`: candidate owner false | throws "workspace binding artifact truth requires its exact causal Product set" before the constructor at `:570` | yes |

The candidate owner's refusal of these values is exercised by
`t292-td36r-bind-door-strings` (candidate predicate false for a padded actor,
a NUL actor and a padded root) and by `t292-binding-row-owner-differential`
(its 18 padding and NUL candidate cases); both pass before and after
(section 5).

Recorded data. The rule is unchanged, so the set of values it refuses is
unchanged; TD-36R's walk of the whole evidence root (3,366 admitted bindings,
3,370 candidates, 0 failing) and the review's scan of the other roots (F4, 0)
stand. I scanned the evidence-root files modified since 2026-11-11 (532 files,
5 of them carrying `authorizedActorRef`) with the review's regex
(`/private/tmp/abg-review1-work/bind-regex.txt`, `rg -z -P`): 0 values. No
recorded binding carries a value the rule refuses.

## 5. Lanes

Command, from T, one file at a time:
`TMPDIR=/private/tmp/abg-td36s-tmp ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace node --experimental-vm-modules --test --test-concurrency=1 --test-reporter=tap test_env/tests/<file>.test.mjs`.
Base is the build of `46397ec36`; after is the build of `28bc58b21`. The new
lane and `t292-td36r-bind-door-strings` ran after on the first build of these
sources, before the commit; the rebuild at `28bc58b21` gives the same digests. The tool host
moves a foreground command to the background after 180 seconds, so each group
ran in one sequential loop and I waited for it to finish; no two files ran at
once.

The selection: the files that name `invalid_declared_root`,
`invalid_workspace_authority`, `root_mismatch` or `workspace_mismatch`
(`t292-td36r-bind-door-strings`, `t287-tv5-rooted-topology-partition`, whose
`root_mismatch` is a topology code), `r3-workspace-binding`,
`t287-default-library`, both rerun tables of the TD-36R Return (items 1 to 4
and item 5), and `r1-packed-artifact` and `r2-clean-install` (`test:r2`). Two
files in TD-36R's item 5 table no longer exist: TD-60B deleted
`t287-installed-dependency-lock` (`72d866e40`) and
`t287-d1-requirement-handoff` (`91ce5181e`), every case retired.

| File | Base: tests / pass / fail / skip | Wall s | After: tests / pass / fail / skip | Wall s |
| --- | --- | --- | --- | --- |
| `t292-td36s-bind-string-rule` | 7 / 4 / 3 / 0 | 58 | 7 / 7 / 0 / 0 | 41 |
| `t292-td36r-bind-door-strings` | 6 / 6 / 0 / 0 | 38 | 6 / 6 / 0 / 0 | 35 |
| `t287-tv5-rooted-topology-partition` | 3 / 3 / 0 / 0 | 0 | 3 / 3 / 0 / 0 | 1 |
| `r3-workspace-binding` | 1 / 1 / 0 / 0 | 42 | 1 / 1 / 0 / 0 | 37 |
| `t292-td36r-remaining-owners` | 6 / 6 / 0 / 0 | 0 | 6 / 6 / 0 / 0 | 0 |
| `t292-td36r-admitted-binding-owner` | 1 / 1 / 0 / 0 | 39 | 1 / 1 / 0 / 0 | 35 |
| `t292-workspace-binding-extra-key` | 3 / 3 / 0 / 0 | 0 | 3 / 3 / 0 / 0 | 0 |
| `t292-binding-row-owner-differential` | 5 / 5 / 0 / 0 | 1 | 5 / 5 / 0 / 0 | 0 |
| `t287-st2a-e-exact-prefix-workspace-environment` | 2 / 2 / 0 / 0 | 89 | 2 / 2 / 0 / 0 | 88 |
| `t289-install-event-bodies` | 4 / 4 / 0 / 0 | 70 | 4 / 4 / 0 / 0 | 62 |
| `t287-w2-05-static-binding-algebra` | 4 / 3 / 0 / 1 | 1 | 4 / 3 / 0 / 1 | 1 |
| `t287-conformance-owner-reuse` | 1 / 0 / 0 / 1 | 0 | 1 / 0 / 0 / 1 | 0 |
| `t287-held-owner-fold-reuse` | 1 / 1 / 0 / 0 | 52 | 1 / 1 / 0 / 0 | 43 |
| `t287-post-binding-worksite-write` | 2 / 2 / 0 / 0 | 91 | 2 / 2 / 0 / 0 | 58 |
| `t287-native-work-currentness-consumers` | 6 / 6 / 0 / 0 | 50 | 6 / 6 / 0 / 0 | 44 |
| `t287-w2-05-install-catalog-owner-chain` | 3 / 3 / 0 / 0 | 92 | 3 / 3 / 0 / 0 | 85 |
| `t287-st1-installed-cross-owner-hello` | 3 / 3 / 0 / 0 | 146 | 3 / 3 / 0 / 0 | 130 |
| `t287-selected-action` | 1 / 0 / 0 / 1 | 0 | 1 / 0 / 0 / 1 | 0 |
| `m5-event-store-reopen` | 27 / 27 / 0 / 0 | 66 | 27 / 27 / 0 / 0 | 67 |
| `steel-basic-cli-public` | 1 / 1 / 0 / 0 | 306 | 1 / 1 / 0 / 0 | 304 |
| `steel-consumer-declaration` | 1 / 0 / 0 / 1 | 0 | 1 / 0 / 0 / 1 | 0 |
| `w2-steel-single-start-installed` | 1 / 0 / 0 / 1 | 0 | 1 / 0 / 0 / 1 | 0 |
| `w2-steel-serial-branch-installed` | 2 / 0 / 0 / 2 | 0 | 2 / 0 / 0 / 2 | 0 |
| `t287-native-workspace-work` | 43 / 43 / 0 / 0 | 2 | 43 / 43 / 0 / 0 | 2 |
| `t287-native-semantic-revision` | 7 / 7 / 0 / 0 | 2 | 7 / 7 / 0 / 0 | 2 |
| `d2-binding-transition` | 10 / 10 / 0 / 0 | 37 | 10 / 10 / 0 / 0 | 42 |
| `t287-generic-job-worksite` | 9 / 9 / 0 / 0 | 1 | 9 / 9 / 0 / 0 | 1 |
| `t287-native-worksite-execution` | 6 / 4 / 0 / 2 | 0 | 6 / 4 / 0 / 2 | 1 |
| `t287-management-supervision` | 5 / 5 / 0 / 0 | 155 | 5 / 5 / 0 / 0 | 162 |
| `t287-continuation-causation` | 1 / 1 / 0 / 0 | 1 | 1 / 1 / 0 / 0 | 0 |
| `t287-qualification-scopes` | 24 / 24 / 0 / 0 | 3 | 24 / 24 / 0 / 0 | 4 |
| `t288-instruction-assembly-owner` | 4 / 4 / 0 / 0 | 1 | 4 / 4 / 0 / 0 | 1 |
| `t287-lifecycle-failure-carrier` | 7 / 7 / 0 / 0 | 0 | 7 / 7 / 0 / 0 | 0 |
| `t287-management-context` | 13 / 12 / 0 / 1 | 1 | 13 / 12 / 0 / 1 | 0 |
| `t287-native-work-reacquisition` | 8 / 7 / 0 / 1 | 1 | 8 / 7 / 0 / 1 | 1 |
| `t287-native-c2-instruction-assembly` | 1 / 1 / 0 / 0 | 0 | 1 / 1 / 0 / 0 | 0 |
| `t287-native-assembly-retained-input` | 1 / 1 / 0 / 0 | 0 | 1 / 1 / 0 / 0 | 1 |
| `t287-event-body-encoding` | 25 / 25 / 0 / 0 | 16 | 25 / 25 / 0 / 0 | 20 |
| `t287-observed-worksite-command` | 8 / 8 / 0 / 0 | 2 | 8 / 8 / 0 / 0 | 4 |
| `t287-owned-native-proof` | 1 / 0 / 0 / 1 | 0 | 1 / 0 / 0 / 1 | 0 |
| `t287-generic-job-read-dependency` | 1 / 1 / 0 / 0 | 1 | 1 / 1 / 0 / 0 | 1 |
| `t287-retained-installed-consumer` | 1 / 0 / 0 / 1 | 0 | 1 / 0 / 0 / 1 | 0 |
| `t287-st2a-g-capability-definition-graph` | 4 / 4 / 0 / 0 | 34 | 4 / 4 / 0 / 0 | 43 |
| `t287-selected-action-authority` | 3 / 2 / 0 / 1 | 0 | 3 / 2 / 0 / 1 | 1 |
| `t287-native-assessment-evidence` | 4 / 4 / 0 / 0 | 1 | 4 / 4 / 0 / 0 | 1 |
| `t287-default-library` | 35 / 34 / 0 / 1 | 268 | 35 / 34 / 0 / 1 | 281 |
| `t287-governed-context` | 15 / 14 / 0 / 1 | 2 | 15 / 14 / 0 / 1 | 2 |
| `t287-single-address-space-consolidation` | 17 / 17 / 0 / 0 | 516 | 17 / 17 / 0 / 0 | 540 |
| `r1-packed-artifact` | 1 / 1 / 0 / 0 | 29 | 1 / 1 / 0 / 0 | 30 |
| `r2-clean-install` | 1 / 1 / 0 / 0 | 52 | 1 / 1 / 0 / 0 | 53 |

Totals over the 50 files: base 346 tests, 327 pass, 3 fail, 16 skip; after
346 tests, 330 pass, 0 fail, 16 skip. The 3 base failures are the new lane's
actor rows and its enclosing test. No case timed out, so none was rerun.
`t287-governed-context` and `t287-single-address-space-consolidation`, red in
TD-36R's record for inputs outside that package, pass on both builds here.

The new lane on the base build: 7 tests, 4 pass, 3 fail. The two actor rows
fail, each showing internal `invalid_declared_root` and Public `root_mismatch`
against the expected `invalid_workspace_authority` and `workspace_mismatch`;
the third failure is the enclosing test. The two root rows, the ProductSet row
and the control pass. On this build: 7 of 7. The base run predates a wording
change in four subtest titles; the assertions are the same.

`t292-td36r-bind-door-strings` is edited: its two actor rows expect
`invalid_workspace_authority` at the constructor and the port. The unedited
file on this build: 6 tests, 3 pass, 3 fail (the two actor rows and the
enclosing test), as expected.

Skips are the environment gates TD-36R lists, unset here, with the same
counts on both builds.

Lints: `npm run build`, `lint:imports`, `lint:lifecycle` and `lint:calculus`
pass on `28bc58b21`. The build of `3949f4346` (the requirement only) passes and
leaves no tracked change.

## 6. Identity digests

After each build I refreshed the candidate basis fixture with
`node scripts/refresh-candidate-basis.mjs` so that the lanes verify against
the build, and restored the generated files (`contracts`,
`product-toolchain-manifest.json`, the candidate basis fixture) before each
commit. Values after the final build (`28bc58b21`):

| Value | Base `46397ec36` | After `3949f4346` | After `28bc58b21` |
| --- | --- | --- | --- |
| `productContentDigest` (manifest, candidate basis) | `sha256:b3b89acc1adcbbef1e5b04e3f0669382cc257d1450fd432c588ed0797d4b54f4` | unchanged | `sha256:51069216fc1dfcabaf93582d5588aa0665e00346b0892d54bb418a49b2f8fc7a` |
| `contributionManifestDigest` | `sha256:b3e65b46088b250900e1ffea76ad58a984ef8a525ab106ed95b6dd2297c5f5bc` | unchanged | `sha256:bc37f94bd7e55589b316a6674ab9854a919970c894a8d8753677562fd91d82e0` |
| capability graph `graphDigest` | `sha256:8a7486def91432c08f3763e4c10d08fdc30e7276de50ed3a96ee28671e51277e` | unchanged | `sha256:3d5f3bbd81755565302c6babc6d0f6ac826acae643323d44f6221b510363a009` |
| capability graph asset `contentDigest` | `sha256:e01d04571a2180c046e94782b0787b96a92d593deb7097bda4e540636ce91788` | unchanged | `sha256:f0a01b09d4e227205c2f0e2d00f877666bd487daa7fa6a9ad1a0a6d957101b07` |
| `publicContractCatalog.catalogDigest` (also `publicContractCatalogDigest`) | `sha256:8c5f262f2e7b9fcdef40a80d18b262aa90e4ea3cee854b1f01d52b67773c1733` | unchanged | unchanged |
| candidate basis `artifactDigest` | `sha256:80c625562a3495b1c47658a7e7857ba50899ec800f15e6f3a256932484152566` | unchanged | `sha256:6e4713f5719c8d65d24f45d5fd01aab216a98732f551c6cf06c43e2f282666d5` |
| candidate basis `manifestDigest` | `sha256:80d0b306266c1fb60c732ca4379baf8c220ef3bc53f4241c29e8928ca512c766` | unchanged | `sha256:d0578421efff922af2d4a673fd6775fd97886736b1bd41e58b92c82e22892442` |

The manifest after `28bc58b21`: 70 leaf values change, the TD-36 shape (49 row
`provenanceRef`s, 10 `publicationDigest`s, the identity refs and digests
above); 0 `declarationInventory` digests and 0 Public contract digests change.
The capability graph: 310 leaves (34 definition refs and digests each, 241
`contractCatalog.productContentDigest`s, the graph digest).

The requirement commit moves no identity. The ordinary build does not restage
the qualification source mirror: `contracts/qualification/sources/REQ-R-ABG3-BINDING.md`
still holds the base text, and `authority-inputs.json`, the rule catalog, the
law basis and coverage follow it. Restaging is the separate explicit step
`scripts/generate-qualification-rule-catalog.mjs --stage-authorities`, committed
on its own as at `ead445d32` and `60c76259d` (section 8, item 1).

## 7. Lines changed

`git diff --numstat 46397ec36 28bc58b21` over `T/code/src`, `specification`
and `T/test_env`:

| File | Added | Removed |
| --- | --- | --- |
| `T/code/src/product/environment.ts` | 12 | 8 |
| `specification/requirements/abg/REQ-R-ABG3-BINDING.md` | 1 | 1 |
| `T/test_env/tests/t292-td36r-bind-door-strings.test.mjs` | 12 | 8 |
| `T/test_env/tests/t292-td36s-bind-string-rule.test.mjs` (new) | 330 | 0 |

## 8. For the Executive's ruling

1. **The qualification mirror.** The brief expects the requirement edit to move
   the product identity. It does not: the build reads the frozen mirror, and
   the mirror is a generated file, which ruling 5 keeps out of my commits.
   Restage it in its own commit, from T, as at `ead445d32`:
   `node scripts/generate-qualification-rule-catalog.mjs --stage-authorities ../../.. "/Users/jim/Library/Application Support/STDO/releases/v3.0.4"`,
   or leave it to the cut. No ordinary lane or lint compares the live
   specification with the mirror: `t287-qualification-law` checks the mirror
   against `authority-inputs.json` and the rule catalog (10 tests, 7 pass, 0
   fail, 3 skip on this build; its staging cases skip because
   `ABG_QUALIFICATION_STAGE_FIXTURES` is unset), and `lint:evidence` concerns
   `.ai-workspace` tree copies. So no lane is red while the mirror is stale.
2. **The canonical root locator.** Ruling 2 points to REQ-R-ABG3-BINDING-016's
   "canonical root locator" as the place where the authority basis is stated.
   I read it as the location, not as a subject of the rule: the sentence names
   only the strings the constructor checks, and the canonical root locator is
   not one. If the rule is meant to cover it, the code needs a further
   tightening that ruling 1 does not grant.
3. **The ProductSet row** is left as `invalid_declared_root` (section 3).

## 9. Deviations

- The lane file `t292-td36r-bind-door-strings` is edited (two actor rows).
- Two files of TD-36R's lane list no longer exist (section 5).
- The candidate basis fixture was refreshed for the lanes after each build and
  restored before each commit; the brief names it among the generated files.
- Lanes ran in sequential loops that the tool host held in the background
  (section 5).

## 10. Residuals

- The qualification mirror restage (section 8, item 1).
- The exported constructor still reports `invalid_declared_root` for an
  authority basis that fails `isWorkspaceAuthorityBasis` and for a ProductSet
  that fails its set check. Neither reaches the constructor on the Public bind
  (resource validation refuses the first; the bind mints the second). R25 maps
  ProductSet and lock failures to `product_mismatch` and `lock_mismatch`.
- The canonical root locator and the authority manifest reference are outside
  the rule (section 1).
- The request schema (`absolutePathSchema`) still admits a padded or NUL root;
  by ruling 1 it stays, and the constructor refuses the value.
