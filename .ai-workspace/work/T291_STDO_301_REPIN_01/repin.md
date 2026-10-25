# T-291 STDO 3.0.1 repin: package records

Ticket: [T-291](../../tickets/active/T-291-repin-abiogenesis-to-stdo-3-0-1-and-migrate.md). Precedent: the [3.0.0 adoption record](../../comments/codex/20261021_STDO_300_RC1_ADOPTION/README.md). Each package: one activation (Executive), one Return (Worker, appended), one disposition (Executive).

## M-1 activation (Executive, 2026-10-25; the pin: ABIogenesis source development selects the immutable STDO 3.0.1 cut, the digest-bound adoption applied and verified, every method route rebound and resolved in the installed cut, the record written)

Base: the head carrying this activation. Worker: Opus 5.5 at xhigh, fresh. Scratch: `scratchpad/m1/`. Record: this file, append only, your section `## M-1 return`. Read the 3.0.0 adoption record's `README.md` whole and its JSON files by `head` for the shapes this package repeats; read the ticket by line (`sed -n`); never list, walk, `git ls-files` or `git grep` under `.ai-workspace/`.

**The instruction and the class.** The owner (2026-10-25): "stdo 3.0.1 has been released and i want to repin to 3.0.1 and migrate to it for abiogenesis"; rulings: the runtime default-library snapshot moves in Phase D (D0), the carrier is T-291. This package is the source-development pin, a bounded `product_reprice` as the 3.0.0 adoption was classed; the F_D migration is M-2 and the runtime snapshot is D0, both outside this package.

**The exact selection.** Basis `stdo://releases/v3.0.1-rc.1/`; selector `stdo://channels/3.0.1`; annotated tag `specification_methodology/v3.0.1-rc.1`, tag object `6e96ce1d2422508e5620bd12afceda890c556fd6`, commit `fe4941f56a52ed3697a2b516d8d68948b0ea65d9`; canonical manifest SHA-256 `60356364a412dbde8cffe68fe0eda4e2749b0162acce93495534eee13b223df8`; 83 payload files; the GitHub release `specification_methodology/v3.0.1-rc.1` of 2026-10-24 (draft false, prerelease false after the publisher's correction) with the assets `stdo-v3.0.1-rc.1-manifest.json` and its `.sha256` sidecar. The cut is installed in the shared store (`stdo list`: `/Users/jim/Library/Application Support/STDO/releases/v3.0.1-rc.1`, present, that manifest). The manager is `stdo` 0.1.5 at `/Users/jim/.local/bin/stdo`, default store. Any disagreement between the dry-run plan, the installed manifest, the public release's tag, commit or manifest asset and these values stops the package.

**Item 1: the manager steps**, all in `/Users/jim/src/apps/abiogenesis`, each output saved into the record directory `.ai-workspace/comments/claude/<UTC stamp>_STDO_301_ADOPTION/` (create it; stamp `YYYYMMDDTHHMMSSZ` of the start):

(a) Before any edit: `preimages.json` with, for each territory file (item 2 and `stdo_abiogenesis.json`, `AGENTS.md`, `CLAUDE.md`), its sha256 and `git hash-object` blob id at the base head; no copies (TD-19; `lint:evidence` inventories `.ai-workspace/`). `unrelated-preimages.json`: `git status --short` at the start (the two untracked codex posts expected, nothing else).
(b) `stdo_abiogenesis.json`: `constitution.stdo.selector` → `stdo://channels/3.0.1`. Nothing else by hand in this file; the manager rewrites the rest.
(c) `stdo adopt --definition ./stdo_abiogenesis.json --dry-run` → `adoption-plan.json`. Check: `from` is `stdo://releases/v3.0.0-rc.1/` with manifest `069285ad…`; `to` equals the exact selection (cut, commit, tag object, manifest; record the tree); `install_status` installed and verified; record `plan_sha256`.
(d) `stdo adopt --definition ./stdo_abiogenesis.json --accept-plan-sha256 <plan_sha256>` → `adoption-result.json`. Read the definition after: `$schema` and `constitution.stdo.basis` at `v3.0.1-rc.1` with the manifest; the seven entrypoints' paths unchanged; `composition` empty; `reference_frame_bases`, `what`, `how` and `ticketing` unchanged. If the manager changed anything else, stop and name it.
(e) `stdo status --definition ./stdo_abiogenesis.json --verify` → `stdo-status.json`: installed true, valid true, failures empty, the manifest, the standards and plugin member counts.
(f) `stdo bootstrap --definition ./stdo_abiogenesis.json --dry-run` → `bootstrap-plan.json`; apply without `--dry-run` only if a target is not `unchanged`; `AGENTS.md` and `CLAUDE.md` change only between their `STDO_BOOTSTRAP_START` and `STDO_BOOTSTRAP_END` markers (`git diff` proves it).
(g) `publication.json`: `gh release view specification_methodology/v3.0.1-rc.1 -R foolishimp/specification_methodology --json tagName,name,isDraft,isPrerelease,publishedAt,targetCommitish,url,assets`; download the manifest asset and its sidecar into scratch, verify the sidecar, and record that the asset's canonical SHA-256 equals the installed manifest's and that `targetCommitish` is the commit above. Network reads only; nothing is published.

**Item 2: the routes.** Every `stdo://releases/v3.0.0-rc.1/` in the territory becomes `stdo://releases/v3.0.1-rc.1/`, and each route's anchor is verified present in the installed cut by reading the installed file's headings (the Executive pre-checked these twelve: REFERENCE_FRAME `1. The frame as the engagement unit` and `3. Laws`; EXECUTIVE_BASELINE `1. Canonical compression`, `8. Derived Executive frame`, `9. Derived Worker frame`, `Extension versus replacement`; SPEC_METHOD `11. Build-tenant binding`; FOUNDATIONS `Accounts of a construction`; AXIOMATIC_CALCULUS `5. Traversals and functor kinds`; DESIGN_MODULE `Computational realisation projection (UP-019)`; ODD `4`, `5`, `15`; RELEASE `Deterministic-kind migration`). A heading that moved is rebound to its current spelling and named in the Return; a heading that no longer exists stops the route (M-2 territory) and the rest proceeds. Territory, by line at the base:

- `specification/PRODUCT.md:663`, `:1596`, `:1597`.
- `specification/GOALS.md:144-150`: a new owner-selection paragraph dated 2026-10-25 placed before the 2026-10-21 paragraph, which stays as history (the surface's own rule: "Older routing below preserves history and cannot reactivate a superseded attempt"). Its content: pin ABIogenesis source development to the published STDO 3.0.1 line, exact immutable `v3.0.1-rc.1` and manifest selected by `stdo_abiogenesis.json`; the adoption record (link); the selection preserves the current Product outcomes and the T-290 work; the runtime default-library snapshot and the retained Runs, qualification evidence and derivation links keep their original exact bases until T-287 Phase D's D0; the F_D migration under 3.0.1 is T-291 M-2.
- `specification/requirements/README.md:12-17`: the adoption-record link names the 3.0.1 record, the 3.0.0 record kept as history in the same sentence.
- `build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md`: the eight cites (`:22`, `:25`, `:28`, `:171`, `:181-184`).
- `build_tenants/abiogenesis/typescript/design/ABI5_STDO3_COMPUTATIONAL_BINDING.md`: the six cites (`:7` with its manifest SHA-256 → `60356364…`; `:11`, `:47`, `:123`, `:154`, `:194`).
- `build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:7`.

Not in the territory and not edited: the runtime snapshot set (`code/src/gtl/default_library.ts`, `contracts/default-library/stdo/`, `test_env/support/stdo3-run-environment.mjs`, `test_env/fixtures/registered-selection-product/native.mjs`, `test_env/tests/t287-default-library.test.mjs`, `test_env/tests/t287-stdo3-run-environment.test.mjs`: D0); every historical line in GOALS and the records under `.ai-workspace/`; the tickets and the register (the Executive restates their method-basis fields at acceptance).

`verification.json`: every rebound route as file, line, old, new, anchor heading and present true; the seven entrypoints resolved against the installed cut; each territory file's sha256 after the edit.

**Item 3: the record and the gates.** `README.md` in the record directory in the 3.0.0 record's shape: the owner instruction; the activation (this package, the direct Writer route under the installed 3.0.1 `EXECUTIVE_BASELINE.md#9-derived-worker-frame`); the exact selection; the territory; the result with each JSON named; the limits: no runtime, default-library or qualification snapshot rebuilt (D0), no semantic qualification of the Product under 3.0.1 claimed, the F_D migration pending (M-2), nothing committed by the manager, nothing pushed. Gates: `git diff --check`; in the tenant `npm run lint:evidence` (no new copy); `node --experimental-vm-modules --test --test-concurrency=1 test_env/tests/t287-default-library.test.mjs` green and unchanged, which proves the runtime snapshot was not touched; `git status --short` showing the territory, the record directory and this file only.

Grant: `stdo_abiogenesis.json`; `AGENTS.md` and `CLAUDE.md` inside their bootstrap markers, by the manager only; `specification/PRODUCT.md`, `specification/GOALS.md`, `specification/requirements/README.md` at the named lines and paragraph; the three design files at the named cites; the new record directory; this file (append only, your section). No other edit; no deletion; no edit to `code/`, `contracts/`, `test_env/`, the register, any ticket, any other design file or any other path under `.ai-workspace/`; never list, walk, `git ls-files` or `git grep` under `.ai-workspace/`; scratch under `scratchpad/m1/` only.

Stop (write it in the Return, keep the rest moving): a plan, installed-manifest or publication value disagreeing with the exact selection; a route whose anchor no longer exists in 3.0.1; the manager changing anything in the definition beyond `$schema`, the basis and the selector, or anything outside the markers in the agent files; a `lint:evidence` red.

Return contract: one commit on `main` with the first line `M-1: ABIogenesis source development selects STDO 3.0.1 (v3.0.1-rc.1, manifest 60356364): the digest-bound adoption applied and verified, the bootstrap markers current, every method route rebound and resolved in the installed cut, the record written` (if a clause does not hold, keep the structure and state the gap in its place) and the last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Stage by path; no `git add -A`; never push; never amend. Append `## M-1 return` at the end of this file: the first sentence says closed, or names the gap; the manager's outputs with their digests and statuses; the routes table; the GOALS paragraph as written; the gates; deviations from this wording; findings outside the grant; stops; what could not be verified. Nothing above your section is edited.

M-2 (the F_D migration) is activated by the Executive at M-1's acceptance; its census starts from the routes M-1 resolved.

## M-1 return (Worker, Opus 5.5, 2026-10-25)

Closed: ABIogenesis source development selects STDO 3.0.1 (`v3.0.1-rc.1`, manifest `60356364a412dbde8cffe68fe0eda4e2749b0162acce93495534eee13b223df8`) through the manager's digest-bound adoption, applied and verified; both bootstrap markers are current with no apply; every method route in the territory, 22 occurrences and two manifest digests, is rebound and resolves in the installed cut with its anchor present; the record is written at [`comments/claude/20261025T022614Z_STDO_301_ADOPTION/`](../../comments/claude/20261025T022614Z_STDO_301_ADOPTION/README.md). No stop fired. The change is the commit carrying this Return, on base `b80da6d0c`; nothing is pushed.

**Manager outputs** (record directory, SHA-256 of each file):

| File | Status | SHA-256 |
|---|---|---|
| `preimages.json` | nine territory files at `b80da6d0c`: SHA-256 and blob id, worktree equal to head; no copies | `ff83e09f3506641c090364e3d439a970a3449f8da749ebcfd8e47e961c3f5933` |
| `unrelated-preimages.json` | start status: the two untracked Codex strategy posts, no tracked modification | `98a50117bc65defd1d7df6f9ab2e844c23abf0092475e86f3f0deb6c9b5e9679` |
| `adoption-plan.json` | `from` `stdo://releases/v3.0.0-rc.1/`, manifest `069285ad…`; `to` cut `v3.0.1-rc.1`, commit `fe4941f56a52ed3697a2b516d8d68948b0ea65d9`, tag object `6e96ce1d2422508e5620bd12afceda890c556fd6`, tree `3aa889d2749e05f5c9c1d1375fb27391a8159e99`, manifest `60356364…`; `already_installed_verified`; plan `c929db0aac6032a826b5e93b2e68ee593496f3538e28a384e656847875608d50` | `fae20875118a9a69b9803340c4f9b096662e82eee0318a28dc6a0b757c5732a3` |
| `adoption-result.json` | accepted plan `c929db0a…` applied unchanged; `already_installed`. The Definition changed in `$schema`, the selector (the hand edit) and `constitution.stdo.basis` only (`git diff` and parsed comparison); seven entrypoint paths, empty `composition`, `reference_frame_bases`, `what`, `how`, `ticketing` unchanged | `56f1b3051b6f607c761f3e0464a178cd0ebc512b92fba22b3514118b9b341a2a` |
| `stdo-status.json` | installed true, valid true, failures empty, manifest `60356364…`; 64 standards, member set `8b33f4463da10a52cadb64de6053e2bfee53064677c737f5c99f00403d5194c7`; the installed manifest lists 17 plugin members (64 + 17 + licence + release note = 83) | `6b65d90cfc33c446f08f5b078807ae7e6c626fdaf06baca5552e831a231fba94` |
| `bootstrap-plan.json` | `AGENTS.md` and `CLAUDE.md` both `unchanged`; no apply; both byte-unchanged | `2a148cb03cd82e3d61859820d0993790a4e5c45e062b7e53fc2de2992c544bd7` |
| `publication.json` | tag `specification_methodology/v3.0.1-rc.1`, name "STDO 3.0.1 RC1", draft false, prerelease false, published 2026-10-24T14:11:07Z, `targetCommitish` `fe4941f5…` equal to the commit; asset digest `sha256:60356364…`; sidecar `shasum -a 256 -c` OK; asset bytes equal the installed `manifest.json`; canonical SHA-256 (the manager's own function) equal | `d2977d10d1bf99cf25711c0a7a9a7f0569a3ac21d00c4fc2bda4d0d117d2cec0` |
| `verification.json` | 22 routes and 2 manifest replacements, all present and manifest-bound; 2 heading-text cites present; 7 entrypoints resolved and manifest-bound; the activation's 14 named headings present; post-edit digests of the nine territory files | `aed18049d60a9bc74e27569dc49611651de694861197ce3d80c41e07be48cd9a` |
| `README.md` | the record in the 3.0.0 record's shape | `f349c6d9eaccc40cdcbc2ec75a30f71562f07e5d41cdd4951cbea422ecf11330` |

**Routes.** Every routed heading is spelled identically in the 3.0.0 and 3.0.1 cuts (heading lists of the seven routed documents compared); no anchor moved and none is missing.

| File:line | Old → new | Anchor heading in the installed cut | Present |
|---|---|---|---|
| `specification/PRODUCT.md:663` | `v3.0.0-rc.1` → `v3.0.1-rc.1`, `standards/REFERENCE_FRAME.md#1-the-frame-as-the-engagement-unit` | 1. The frame as the engagement unit | true |
| `specification/PRODUCT.md:1596` | `v3.0.0-rc.1` → `v3.0.1-rc.1`, `standards/DESIGN_MODULE.md` | document, no anchor | true |
| `specification/PRODUCT.md:1597` | `v3.0.0-rc.1` → `v3.0.1-rc.1`, `standards/SPEC_METHOD.md#11-build-tenant-binding` | 11. Build-tenant binding | true |
| `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md:22` | `v3.0.0-rc.1` → `v3.0.1-rc.1`, `standards/REFERENCE_FRAME.md` | document, no anchor | true |
| `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md:25` | `v3.0.0-rc.1` → `v3.0.1-rc.1`, `standards/EXECUTIVE_BASELINE.md` | document, no anchor | true |
| `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md:28` | `v3.0.0-rc.1` → `v3.0.1-rc.1`, `standards/EXECUTIVE_BASELINE.md` | document, no anchor | true |
| `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md:171` | `v3.0.0-rc.1` → `v3.0.1-rc.1`, `standards/EXECUTIVE_BASELINE.md#extension-versus-replacement` | Extension versus replacement | true |
| `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md:181` | `v3.0.0-rc.1` → `v3.0.1-rc.1`, `standards/EXECUTIVE_BASELINE.md#11-derived-generic-specialist-frame-set` | 11. Derived generic specialist frame set | true |
| `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md:182` | `v3.0.0-rc.1` → `v3.0.1-rc.1`, `standards/ASSURANCE.md#integration-frame` | Integration frame | true |
| `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md:183` | `v3.0.0-rc.1` → `v3.0.1-rc.1`, `standards/ASSURANCE.md#end-to-end-frame` | End-to-end frame | true |
| `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md:184` | `v3.0.0-rc.1` → `v3.0.1-rc.1`, `standards/ASSURANCE.md#user-acceptance-frame` | User-acceptance frame | true |
| `ABI5_STDO3_COMPUTATIONAL_BINDING.md:7` | `v3.0.0-rc.1` → `v3.0.1-rc.1`, `(basis)` | install root | true |
| `ABI5_STDO3_COMPUTATIONAL_BINDING.md:7` | manifest `069285ad…` → `60356364…` | equals the installed manifest | true |
| `ABI5_STDO3_COMPUTATIONAL_BINDING.md:11` | `v3.0.0-rc.1` → `v3.0.1-rc.1`, `standards/SPEC_METHOD.md#11-build-tenant-binding` | 11. Build-tenant binding | true |
| `ABI5_STDO3_COMPUTATIONAL_BINDING.md:11` | `v3.0.0-rc.1` → `v3.0.1-rc.1`, `standards/DESIGN_MODULE.md` | document, no anchor | true |
| `ABI5_STDO3_COMPUTATIONAL_BINDING.md:47` | `v3.0.0-rc.1` → `v3.0.1-rc.1`, `standards/FOUNDATIONS.md#accounts-of-a-construction` | Accounts of a construction | true |
| `ABI5_STDO3_COMPUTATIONAL_BINDING.md:123` | `v3.0.0-rc.1` → `v3.0.1-rc.1`, `standards/FOUNDATIONS.md#4-algebra` | 4. Algebra | true |
| `ABI5_STDO3_COMPUTATIONAL_BINDING.md:154` | `v3.0.0-rc.1` → `v3.0.1-rc.1`, `standards/AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds` | 5. Traversals and functor kinds | true |
| `ABI5_STDO3_COMPUTATIONAL_BINDING.md:194` | `v3.0.0-rc.1` → `v3.0.1-rc.1`, `standards/DESIGN_MODULE.md#computational-realisation-projection-up-019` | Computational realisation projection (UP-019) | true |
| `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:7` | `v3.0.0-rc.1` → `v3.0.1-rc.1`, `(basis)` | install root | true |
| `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:7` | `v3.0.0-rc.1` → `v3.0.1-rc.1`, `standards/DESIGN_MODULE.md` | document, no anchor | true |
| `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:7` | `v3.0.0-rc.1` → `v3.0.1-rc.1`, `standards/SPEC_METHOD.md#11-build-tenant-binding` | 11. Build-tenant binding | true |
| `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:7` | `v3.0.0-rc.1` → `v3.0.1-rc.1`, `standards/FOUNDATIONS.md` | document, no anchor | true |
| `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:7` | manifest `069285ad…` → `60356364…` | equals the installed manifest | true |
| `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md:23` | heading-text cite, not edited | 3. Laws (`standards/REFERENCE_FRAME.md`) | true |
| `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md:26` | heading-text cite, not edited | 1. Canonical compression (`standards/EXECUTIVE_BASELINE.md`) | true |

**The GOALS paragraph as written** (`specification/GOALS.md:144-153`, before the 2026-10-21 paragraph, which stays):

> Owner selection, 2026-10-25: pin ABIogenesis source development to the published
> STDO 3.0.1 line, exact immutable `v3.0.1-rc.1` and manifest selected by
> [`stdo_abiogenesis.json`](../stdo_abiogenesis.json). The
> [adoption record](../.ai-workspace/comments/claude/20261025T022614Z_STDO_301_ADOPTION/README.md)
> binds the digest-bound adoption, the verified install and the method routes
> rebound to that cut. This method selection preserves the current Product
> outcomes and the T-290 work. The runtime default-library snapshot keeps its
> exact `v3.0.0-rc.1` basis until T-287 Phase D's D0 moves it; retained Runs,
> qualification evidence and derivation links keep their original exact bases.
> The migration of deterministic-kind (F_D) claims under 3.0.1 is T-291 M-2.

The requirements README sentence now names the 3.0.1 record and keeps the 3.0.0 RC1 record as history in the same sentence.

**Gates.** `git diff --check` clean, and `git diff --cached --check` clean on the staged set. `npm run lint:evidence`: "691 tracked mirror roots under .ai-workspace, all inventoried; no new copy" before the record existed and again with the record staged. `node --experimental-vm-modules --test --test-concurrency=1 test_env/tests/t287-default-library.test.mjs`: 20 tests, 17 pass, 0 fail, 3 skipped, at the base and after the change, with the same test names and outcomes; `code/`, `contracts/` and `test_env/` have no diff. `git status --short` before the commit: the seven changed territory files (`AGENTS.md` and `CLAUDE.md` unchanged), the record directory, this file, and the two pre-existing untracked Codex posts named in `unrelated-preimages.json`. Post-edit `git grep v3.0.0-rc.1` over `specification/` and the design directory: `GOALS.md:151` (the new paragraph's statement of the snapshot basis) and `GOALS.md:156` (the 2026-10-21 history) only.

**Deviations from the activation's wording.**

1. The library design's `:7` also carried manifest `069285ad…`; it is replaced by `60356364…` on the same named line. Rebinding the basis beside the 3.0.0 manifest would misstate the cut.
2. Counting: the binding has seven route occurrences on its six named lines (`:11` carries two); the library design's `:7` has four. The "twelve" pre-checked anchors list fourteen headings. The territory also cites five anchors absent from that list, all verified present: EXECUTIVE_BASELINE `11. Derived generic specialist frame set`; ASSURANCE `Integration frame`, `End-to-end frame`, `User-acceptance frame`; FOUNDATIONS `4. Algebra`. Listed headings with no territory site, verified present: EXECUTIVE_BASELINE `8. Derived Executive frame`; ODD `4. Method library classes`, `5. Graph model`, `15. Release boundary`; RELEASE `Deterministic-kind migration`. EXECUTIVE_BASELINE `9. Derived Worker frame` is used by the record README's activation route.
3. The GOALS paragraph separates two clauses the activation joined: only the runtime default-library snapshot moves at D0; retained Runs, qualification evidence and derivation links keep their original bases without an end date, as the 3.0.0 record and the Product state (a source pin does not retarget an existing Run). "The F_D migration" is written as "the migration of deterministic-kind (F_D) claims".
4. Network: `stdo adopt`, dry-run and accept, resolved the channel by `git ls-remote --tags` against the public repository and fetched the one tag ref into the manager's own temporary bare object store. These reads are inherent to steps (c) and (d). No workspace repository was fetched, pulled or pushed. `stdo status`, `bootstrap` and `resolve` are local. Beyond that: `gh release view` and `gh release download` of the two assets into `scratchpad/m1/assets/`.
5. Order: this Return is written before the commit and carried by it, as C-11's Return was carried by its Worker commit, and as the status gate's "this file" expects. The hash is reported to the Executive.
6. `publication.json` holds the `gh release view` output verbatim under `gh_release_view`, with the download and digest checks beside it. `unrelated-preimages.json` was regenerated once, before any territory edit, to exclude this record's own `preimages.json`.

**Findings outside the grant (not edited).**

1. `specification/PRODUCT.md:14-15`, the header "Method adoption authority", still names the STDO 3.0.0 RC1 adoption record as the method adoption authority.
2. `specification/GOALS.md:18`, GOAL-035's status, reads "Active under STDO 3.0.0 RC1."
3. For M-2's census: `ABI5_STDO3_COMPUTATIONAL_BINDING.md:154` resolves, but its sentence ("Its F_D evaluation/proof classification does not automatically identify all deterministic ABG construction/effect leaves") states the 3.0.0 relation to AXIOMATIC_CALCULUS §5. 3.0.1 changes that relation by making F_D the common total deterministic kind.

**Stops.** None.

**Not verified.** Whether the citing text conforms to 3.0.1's changed meanings: route resolution proves that the member and the heading exist in the exact cut, not semantic conformance. That is M-2's census. The public tag object is verified only through the manager's resolution of the public tag; `gh release view` exposes no tag object. The earlier prerelease state that the publisher corrected was not observed; only the current flag, false, was. The release body and notes were not read.
