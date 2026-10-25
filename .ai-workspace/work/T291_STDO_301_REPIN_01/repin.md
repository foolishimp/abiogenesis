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

## M-1 disposition (Executive, 2026-10-25)

Accepted at `72384fe07`, closed. Executive check: the commit's seventeen paths all in the grant, parent `b80da6d0c`, the Opus trailer, `repin.md` append-only, `code/`, `contracts/` and `test_env/` untouched; the definition read (`$schema`, selector `stdo://channels/3.0.1`, basis `v3.0.1-rc.1` with manifest `60356364…`, source unchanged); `stdo status --verify` installed, valid, no failures, manifest `60356364…`, 64 standards, release commit `fe4941f5…`, tag object `6e96ce1d…`, tree `3aa889d2…`; `v3.0.0-rc.1` remaining in `specification/` and the design directory at `GOALS.md:151` and `:156` only (the snapshot clause and the 2026-10-21 history); `AGENTS.md` and `CLAUDE.md` unchanged; the fifteen distinct routes of the territory resolved by the Executive's own heading resolver against the installed cut, none missing; the record directory's nine files, digests and blob ids only; `git diff --check` clean; `lint:evidence` 691 roots, no new copy; `t287-default-library` 20/17/0/3 and `t287-stdo3-run-environment` 5/5 unchanged (`exec_check_M1.log`). The record README read: the owner instruction, the activation as a direct Writer under the installed cut's Worker frame, the exact selection, the result per JSON, the limits, in the 3.0.0 record's shape.

Deviations accepted: 1 (the library design's `:7` manifest moved with its basis; the activation named the manifest for the binding only, and a 3.0.1 basis beside the 3.0.0 manifest would misstate the cut); 2 (the counts: seven occurrences on the binding's six lines, four on the library design's `:7`, fourteen pre-checked headings not twelve, five more anchors cited and verified present, five listed headings with no site); 3 (the GOALS clause split: only the runtime default-library snapshot has an end date, D0; retained Runs, qualification evidence and derivation links keep their original bases without one, as the Product states); 4 (the manager's channel resolution reads the public repository's tags and fetches the one tag ref into its own temporary store, inherent to `adopt`; no workspace repository was fetched, pulled or pushed); 5 (the Return carried by the Worker commit, as T-290's packages do; the activation's step order was the Executive's imprecision); 6 (the record shapes).

Findings: (1) `specification/PRODUCT.md:14-15`, the header's method adoption authority, and (2) `specification/GOALS.md:18`, GOAL-035's status, cited the 3.0.0 record and line as current: record-level citations, restated by the Executive in this acceptance with the 3.0.0 record kept as history; (3) the binding's `:154` sentence states 3.0.0's F_D kind: M-2 item 1.

Not verified, accepted as stated: semantic conformance of the citing text to 3.0.1 (M-2); the public tag object through the manager's resolution only; the publisher's earlier prerelease flag (the Executive observed the publication correction record before the activation); the release body (the Executive read the release note in the installed cut).

Records: T-291, T-290 and T-287 `current_method_basis` and manifest to the 3.0.1 cut, the runtime snapshot's basis noted; T-287's four route cites in its design and proof controls rebound, their anchors verified present in the installed cut (ACTIVATION `6. Cost and proportionality`, `Transition evidence`; EXECUTIVE_BASELINE `Steel-thread delivery`, `Technical triage, severity, priority and boundary effect`); the T-291 ledger; M-2 activated below.

## M-2 activation (Executive, 2026-10-25; the deterministic kind under STDO 3.0.1: the binding imports common F_D by exact edition and disposes each operation class that claims F_D under the migration relation, the admission and closure owners named, the frame basis restated; the Product and requirements checked and not changed)

Base: the head carrying this activation (M-1 accepted at `72384fe07`). Worker: Opus 5.5 at xhigh, fresh. Scratch: `scratchpad/m2/`. Record: this file, append only, your section `## M-2 return`. Read `## M-1 return` above for the routes M-1 resolved; read the ticket by line (`sed -n '1,100p'`); never list, walk, `git ls-files` or `git grep` under `.ai-workspace/`.

**The change and its class.** STDO 3.0.1 (the selected cut, `stdo://releases/v3.0.1-rc.1/`) makes F_D the common total deterministic kind of [AXIOMATIC_CALCULUS §5](stdo://releases/v3.0.1-rc.1/standards/AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds): an application declares its function, closed logical domain, exact basis, all material computational state and dependencies, and its termination argument, and terminates on every domain input with exactly one declared outcome; classifying an operation F_D grants no semantic, evaluation, operation or decision authority; evaluation operations keep the unchanged-subject profile (subject, admissible reads, witness or log outputs, permitted writes, stops and results, authority, invalidation). [ODD §5](stdo://releases/v3.0.1-rc.1/standards/ODD.md#probabilistic-compute) imports that kind by exact edition (`urn:stdo:concept:axiomatic-calculus:f-d`; the former `urn:stdo:concept:graph-native-odd:f-d` is historical on its legacy edition and no alias); its A5 ("Bounded construction and declared authority", [ODD §11](stdo://releases/v3.0.1-rc.1/standards/ODD.md#11-core-law)) supersedes the kind-level authority shorthand with explicit owners: Product admission owns admission of Product facts, ABG's declared admission mechanisms own admission of typed evidence and evaluator outputs, closure is ABG's admitted fold over admitted evidence, and a gate claiming common F_D additionally establishes §5's eligibility. Every existing operation that claims F_D enters the edition only through the three-way relation of [RELEASE §9, Deterministic-kind migration](stdo://releases/v3.0.1-rc.1/standards/RELEASE.md#deterministic-kind-migration): eligible (totality, closed dependencies and outcome contract established: map to common F_D with the unchanged operation profile, evidence and grants preserved), pending with identified remediation or bounded successor, or unresolved (legacy meaning retained on the exact old basis, no successor F_D standing, no automatic F_P label). Unknown eligibility stays pending; the relation gives no decision procedure for totality and evidence alone does not choose the remediation ([CONFORMANCE D301-08](stdo://releases/v3.0.1-rc.1/standards/CONFORMANCE.md#deterministic-kind-and-continuation-discriminators)). This package is a bounded `design_reframe`: the binding and the frame basis restate what the Product already means by F_D ("explicitly declared total deterministic functions over a closed domain", `PRODUCT.md:534`; "not a quality label", `:538`) under the selected edition and dispose each operation class. No code, contract, test, Product, requirement or GOALS edit.

**Item 1: the binding's deterministic-kind section.** `build_tenants/abiogenesis/typescript/design/ABI5_STDO3_COMPUTATIONAL_BINDING.md`: a new subsection at the end of §5 (before `## 6. State, effects and partial completion`), heading `### The deterministic kind under the selected edition`, and the restatement of the `:154` paragraph ("Its F_D evaluation/proof classification does not automatically identify all deterministic ABG construction/effect leaves" names 3.0.0's kind; the sentence now says: §5 classifies total deterministic processing, the classification identifies no ABG leaf by itself, and an optional a_c representation binds operation kind, domain, authority and result meaning explicitly). The subsection states, in this order:

(a) The import: this tenant uses common F_D as ODD imports it, by exact edition in `stdo://releases/v3.0.1-rc.1/` (manifest `60356364…`), under the Product's regime table (`PRODUCT.md:530-538`); the Product's F_D meaning is the common kind's; the classification grants no authority; the regime field a boundary declares (`contracts/`, the programs) is a claim this section disposes, not a standing.

(b) The owners, named from the code (module and function; read them): Product admission (the admission authority and install owners under `code/src/`), ABG's admission of typed evidence and evaluator outputs (event admission; route and judgment admission), and closure as the admitted fold over admitted evidence (the realization of A5's `evaluate_action` fold and `EdgeClosureDecision` is already named in the code: the `evaluateAction` construction authority (`abg/c_call.ts:5703`, `abg/execution_basis.ts:1152`), the `actionEvaluationAdmission` and `edgeClosureDecision` members of the admitted route (`abg/replay.ts:282-284`, `:1027-1090`); name the admitting function). One sentence states that "F_D authority" in this tenant's design (the M03 F_D authority placement derivation and its first-slice record, the construction-pressure derivation, ADR-042) names the placement of an admitted deterministic outcome under its admission owner and never a kind-level authority, which is A5 as 3.0.1 states it; those records are not edited. One sentence states that the conformance gate over method artifacts is the declared admission gate of [ODD §11.7A](stdo://releases/v3.0.1-rc.1/standards/ODD.md#117a-conforming-agentic-development), whose F_D claim is this section's disposition.

(c) The disposition table, one row per operation class this tenant realizes as F_D. Columns: class | realization owner (module, function family) | profile (for an evaluation operation: subject, admissible reads, witness or log outputs, permitted writes, stops and results, authority, invalidation; for an admission or construction operation: its evidence contract and grant) | totality (the termination argument: structural recursion over a finite admitted prefix, a bounded loop over a declared finite set, or none found) | material dependencies (the admitted prefix, the installed catalog, the declared filesystem tree, the clock, dynamic import, globals: declared where, or undeclared) | outcomes (the typed result or stop with its cause; one per input, or not shown) | RELEASE §9 row (eligible; pending, identified remediation or bounded successor; unresolved) | evidence (a lane, a trace in your Return, or the gap). Classes to trace, each by reading its realization (add a class you find and say so; drop none without saying why): (i) typed admission of values and envelopes (`shared/admit/`); (ii) selection and derivation over `JsonValue` (`shared/select/`, `shared/value/`: canonical JSON, digests); (iii) the event calculus fold and point query (`abg/calculus/`, `abg/event_calculus.ts`); (iv) replay derivation and the witness digest (`abg/replay.ts`); (v) route and judgment admission and the closure fold (`abg/traversal_route.ts`, `abg/c_call_outcome.ts`, the admission owners of (b)); (vi) graph materialization and Program validation (`hog/`); (vii) install and artifact verification and the environment lock (`verifyProduct`, tree hashing, `environment.ts`); (viii) Product admission (`admission_authority.ts`, `install_product.ts`); (ix) the default governance library's declared F_D leaves (`T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:49`, `:72`, `:80`, `:101`, `:344`, `:488`: the choice projection, the schema and identity checks, `prepareObservedTestingTask`); (x) F_D boundaries declared by the CCall owner (`abg/c_call.ts` `regime: "F_D"` at `:2792`, `:2830`, `:4445`, `:4502`, `:5147`, `:5825`) and F_D GraphFunctions declared in programs and contracts (`contracts/`, the regime field; two contract files). Actor and process execution, worksite mutation and native work are effects under their own operation contracts and are not rows; say so once.

The row is what the evidence shows. A class whose totality you can state (finite admitted input, structural recursion, every loop over a declared finite set) with its dependencies declared in the code or the contract and one typed outcome per input is eligible, with the lane or trace that shows it (the cold-equals-warm lanes stand for (iii) and (iv): `t287-calculus-fold`, `m5-event-store-reopen`, `t287-route-reconstruction`). A class with an undeclared material dependency (a clock read, a filesystem or environment read not in its contract, a dynamic import, a global), a loop without a bound you can name, or an outcome that depends on anything but the declared inputs is pending with the gap named and the remediation identified (declare the dependency in the contract; bound the loop; split the effect from the evaluation), or unresolved when you cannot identify one. An evaluation operation that reads a clock or a global is also a defect under the Product's own regime table: name it as a stop below. Do not write eligible by assertion; "No invocation is admitted as qualifying F_D by an unestablished claim" (AC-015).

(d) Migration record: the old release (`stdo://releases/v3.0.0-rc.1/`, manifest `069285ad…`, its AXIOMATIC_CALCULUS §5 and ODD §5 F_D clauses), the new (`v3.0.1-rc.1`, manifest `60356364…`), the applicable row per class (the table), and the sentence that the runtime default-library snapshot keeps the old basis until T-287 D0 and the retained Runs and qualification evidence keep their original exact bases.

**Item 2: the frame basis and the library design.** `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md:14` ("an explicitly declared closed rule may be evaluated by F_D"): restate to name common F_D under the exact-edition import, eligible by item 1's table. `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:579` and `:698` ("the F_D boundary", "F_D" in the path table): check against the table's rows for (v) and the run owner; restate only if the sentence claims a standing the table does not give; say which.

**Item 3: the census.** Over `git grep -n 'F_D' -- specification build_tenants/abiogenesis/typescript/design` (119 files at the base; open a file only where its lines are ambiguous), classify every file in your Return, not in a design file: (A) regime vocabulary consistent with §5 and the Product's table, no change; (B) an operation claim, covered by a row of item 1(c) (name the row); (C) a dated derivation, ADR, IACS or design record whose F_D wording is read through item 1(b), no change; (D) a sentence that contradicts 3.0.1 §5 or A5 (claims F_D standing without totality, or kind-level authority). Every (D) in `specification/` (PRODUCT.md's twelve lines, INTENT.md's four, the twenty requirement files' lines, GOALS) is a stop: quote it, propose the restatement, edit nothing. Every (D) in design outside the three files of items 1 and 2 is named with its proposed restatement for the Executive; edit nothing there.

**Item 4: gates.** `git diff --check`; every `stdo://releases/v3.0.1-rc.1/...#anchor` you write resolved against the installed cut's headings (`/Users/jim/Library/Application Support/STDO/releases/v3.0.1-rc.1/standards/`); in the tenant `npm run lint:evidence` (no new copy); `node --experimental-vm-modules --test --test-concurrency=1 test_env/tests/t287-calculus-fold.test.mjs` 13/13 (unchanged; proves no code moved); `git status --short` showing the three design files and this file only.

Grant: `ABI5_STDO3_COMPUTATIONAL_BINDING.md` (the new subsection and the `:154` paragraph), `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md:14`, `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:579` and `:698` if item 2 finds cause, this file (append only, your section). No other edit; no code, contract, test, Product, requirement, GOALS, ticket, register or other design edit; scratch under `scratchpad/m2/` only; never list, walk, `git ls-files` or `git grep` under `.ai-workspace/`.

Stop (write it in the Return, keep the rest moving): a (D) sentence in `specification/`; an evaluation operation with an undeclared material dependency or no termination argument (a defect, and a pending row); any class you cannot place in a row (unresolved row, with what is missing); any edit the grant does not name.

Return contract: one commit on `main`, first line `M-2: the deterministic kind under STDO 3.0.1: the binding imports common F_D by exact edition and disposes N operation classes under the migration relation (E eligible, P pending, U unresolved), the admission and closure owners named, the frame basis restated; the Product and requirements checked, none changed` (fill N, E, P, U; if a clause does not hold, keep the structure and state the gap in its place), last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Stage by path; no `git add -A`; never push; never amend. Append `## M-2 return` at the end of this file: the first sentence says closed, or names the gap; the table as committed; the census by class with counts and the (D) list; the restated sentences old and new; the gates; deviations; findings outside the grant; stops; what could not be verified. Nothing above your section is edited.

The owner's Codex pass reviews M-2 after acceptance; T-290 resumes at C-12 when M-2 is accepted.

## M-2 return

Not closed: the binding imports common F_D by exact edition and disposes twelve operation classes (5 eligible, 7 pending, 0 unresolved), with the Product admission, ABG admission and closure owners named and the frame basis restated, but four `specification/` sentences contradict 3.0.1 and are stops (`INTENT.md:54`, `PRODUCT.md:697`, `REQ-R-ABG3-FN-COMP-004`, `REQ-L-GTL3-COMPUTE-NOTATION-010`), and two evaluation classes (rows 7 and 10b) are defects with undeclared material dependencies; the Product and requirements were checked and none changed.

**What changed.** Three design files, all inside the grant:

- `ABI5_STDO3_COMPUTATIONAL_BINDING.md` gains the new subsection `### The deterministic kind under the selected edition` at the end of §5, and its `:154` paragraph is restated.
- `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md:12-16` is restated.
- `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:698` has its last cell restated; `:579` is unchanged.

No code, contract, test, Product, requirement, GOALS, ticket or register was edited.

**The table as committed** (binding §5, the deterministic kind under the selected edition; links rebased to this file's location):

| Class | Realization owner | Profile | Totality | Material dependencies | Outcomes | RELEASE §9 row | Evidence |
|---|---|---|---|---|---|---|---|
| 1. Typed value admission | [admit/json.ts](../../../build_tenants/abiogenesis/typescript/code/src/shared/admit/json.ts) `admitJson`; [admit/contract.ts](../../../build_tenants/abiogenesis/typescript/code/src/shared/admit/contract.ts) `admitContract`, `admitRef`; [admit/record.ts](../../../build_tenants/abiogenesis/typescript/code/src/shared/admit/record.ts) `isRecord`, `hasExactKeys` | Admission. Evidence contract: the caller's I-JSON shape or Valibot schema. Grant: none of its own; the caller's admission owner decides what the admitted value may be used for. | `admitRef`, `isRecord` and `hasExactKeys` decide from one primitive or own-key read. `admitJson` bounds its recursion by the path set `open` (a cycle is refused) and `NESTING_BOUND` 512 over finite own keys and runs no getter. Its domain is `unknown`, though, and `Array.isArray`, `Object.getPrototypeOf`, `Reflect.ownKeys` and `Object.getOwnPropertyDescriptor` run Proxy traps before any refusal. `admitContract` runs the owner's Valibot schema; `safeParse` reads properties, so accessors and traps run. The termination argument covers only inputs whose reads return. | The input, module constants, Valibot and the owner's schema. Trap and accessor code is computation inside the domain that no contract declares. | A detached, deeply frozen `JsonValue` or the schema's output, else one typed refusal (`non_ijson_value`, `contract_mismatch`, `blank_ref`). `admitJson` turns a trap throw into `non_ijson_value`; `admitContract` has no catch, so an accessor or schema throw escapes it. | Pending. Remediation: refuse a Proxy (`types.isProxy`) and an accessor member before any trap or getter runs, and return schema throws as typed refusals; or declare the bounded successor whose domain excludes both. | `t287-json-value-definition`; code reading |
| 2. Canonical value, digest, equality and exact selection | [canonical_json.ts](../../../build_tenants/abiogenesis/typescript/code/src/shared/canonical_json.ts) `canonicalJson`, `writeCanonicalJson`; [digests.ts](../../../build_tenants/abiogenesis/typescript/code/src/shared/digests.ts) `sha256Canonical`, `sha256Bytes`; [value/equality.ts](../../../build_tenants/abiogenesis/typescript/code/src/shared/value/equality.ts) `canonicalEquals`; [value/record.ts](../../../build_tenants/abiogenesis/typescript/code/src/shared/value/record.ts) `writeCanonicalRecord`, `canonicalRecordDigest`; [select/exact_match.ts](../../../build_tenants/abiogenesis/typescript/code/src/shared/select/exact_match.ts) `resolveExactMatch`, `exactMatchCardinality`, `onlyExactMatch`, `exactMatchOutcome`; [select/exact_record.ts](../../../build_tenants/abiogenesis/typescript/code/src/shared/select/exact_record.ts) `checkExactRecord`; [immutable.ts](../../../build_tenants/abiogenesis/typescript/code/src/shared/immutable.ts) `deepFreeze`, `isDeeplyFrozen` | Evaluation. Subject: the admitted value or finite source. Reads: that argument only. Outputs: the derived bytes, digest or verdict; no witness. Writes: none, except that `deepFreeze` freezes its own argument. Stops and results: the outcome column. Authority: none. Invalidation: a change to the canonical-JSON or digest law. | The domain is the admitted `JsonValue` that row 1 returns (detached, frozen, acyclic, at most 512 deep) and a finite source. Recursion is structural over that finite value. `resolveExactMatch` passes once over the finite source with a total predicate fixed by its module ([library §6](../../../build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md#6-prime-atoms-admitted-domains-falsifiers)). | The value or source argument, module constants and the `node:crypto` SHA-256 import. No clock, filesystem or shared mutable state. | One canonical byte string, digest, boolean, record check or exact-match cardinality (none, one or many) per input. A non-finite number is outside the admitted domain; the `TypeError` guard marks that boundary. | Eligible, on the admitted domain. | `t287-value-equality`, `t287-select-family` |
| 3. Event Calculus fold and point query | [calculus/fold.ts](../../../build_tenants/abiogenesis/typescript/code/src/abg/calculus/fold.ts) `effectOf`, `applyStep`, `foldStep`, `applyClip`, `holdsAt`, `workingFoldState`; [calculus/axioms.ts](../../../build_tenants/abiogenesis/typescript/code/src/abg/calculus/axioms.ts); [calculus/rules.ts](../../../build_tenants/abiogenesis/typescript/code/src/abg/calculus/rules.ts) `deriveLiveness`; [event_calculus.ts](../../../build_tenants/abiogenesis/typescript/code/src/abg/event_calculus.ts) `eventCalculusDependencies`, `runtimeFluentHoldsAtPrefix`, `deriveRuntimeEventCalculusProjection` | Evaluation. Subject: the admitted prefix. Reads: the prefix and the module tables. Outputs: a fold state, truth value or projection; no witness. Writes: identity-keyed memos only. Stops and results: the outcome column. Authority: none; consumers act under their own contracts. Invalidation: a change to the root event contract or the axiom and rule tables. | One step per event over a finite admitted prefix. Each step applies a finite effect list from module-constant axiom and rule tables. `applyClip` only deletes from a finite map. `deriveLiveness` uses the liveness validator, which reads the recorded `elapsedMs`, not a clock. `WeakMap` memos keyed by identity cache derived values without changing outcomes. | The admitted prefix under its root event contract and the module-constant tables. These modules read no clock, filesystem or dynamic import. The `performance.now` reads in `runtime_liveness.ts` belong to the observers `captureNativeFrameBoundary` and `observeNativeCCallLiveness`, which are effects outside this row. | One fold state, fluent truth value or projection per admitted prefix. A `TypeError` guard fires only for an event outside the root contract, which admission keeps out of the domain. | Eligible. | `t287-calculus-fold`, `m5-event-store-reopen` |
| 4. Replay derivation and guard witness | [replay.ts](../../../build_tenants/abiogenesis/typescript/code/src/abg/replay.ts) `replayValidatedRuntimeEventPrefix`, `projectRuntimeReplayGuard`, `writeRuntimeReplayGuardValue` | Evaluation. Subject: the admitted prefix. Reads: the prefix only. Outputs: the replay projection and the guard witness value that `writeRuntimeReplayGuardValue` serializes. Writes: none; persisting the witness is the caller's separately authorized effect. Stops and results: the outcome column. Authority: none. Invalidation: a change to the prefix, the root contract or the replay rules. | One structural pass over a finite admitted prefix. Closure members are re-validated against their recorded route. Each check returns a typed value or throws its `TypeError` guard for an event outside the root contract. | The prefix argument and module constants. `replay(store, scope)` reads a held store; that read is the store's, and `replay` is not in this row. | One replay projection or guard witness per admitted prefix. | Eligible, for the prefix-taking functions. | `t287-route-reconstruction`, `m5-event-store-reopen` |
| 5. Route, evidence, result and judgment admission, and the closure fold | [traversal_route.ts](../../../build_tenants/abiogenesis/typescript/code/src/abg/traversal_route.ts) `admitTraversalTransition`, `admitTraversalTransitionInActiveTransaction`, `admitRoute`, `constructionDeltaForAdvance`, `actionEvaluationProjection`, `edgeClosureDecision`; [c_call.ts](../../../build_tenants/abiogenesis/typescript/code/src/abg/c_call.ts) `admitEvidence`, `admitResult`, `admitJudgment`; [c_call_outcome.ts](../../../build_tenants/abiogenesis/typescript/code/src/abg/c_call_outcome.ts) `admitCCallResult`, `admitCCallJudgment` | Admission under ABG's grant. Evidence contract: the root event contract and the staged route, evidence, result and judgment candidates. Closure admits the `evaluateAction` result as the route's `actionEvaluationAdmission` member, the admitted `evaluate_action` fold. | The checks are finite over the staged prefix, candidate and route. | Undeclared clock. Route candidates take `eventTime: sampleNativeEventTime()`, which is `new Date().toISOString()`, inside admission (`traversal_route.ts:4988`, `:5030`, `:5077`, `:5107`), as do `admitResult` and `admitJudgment` (`c_call.ts:6941`, `:7071`). The event store hashes the candidate, `eventTime` included, into `eventId`. The append is the store's effect. | Admitted events or one typed refusal. The same inputs at two times yield different admitted events. | Pending. Remediation: pass the time sample in as a declared input, as the `basis.eventTime` sites in `c_call.ts` already do, and separate the admission check from event construction and append. | Code reading (`event_store.ts` `eventId` construction); `t287-route-reconstruction` |
| 6. Graph materialization and Program validation | [materialize.ts](../../../build_tenants/abiogenesis/typescript/code/src/gtl/materialize.ts) `deriveMaterializedGraphShape`, `materializeGraph`; [validator/validation.ts](../../../build_tenants/abiogenesis/typescript/code/src/validator/validation.ts) `validateProgram`, `validatePublication`; [validator/graph.ts](../../../build_tenants/abiogenesis/typescript/code/src/validator/graph.ts) `validateGraph`; [graph_construction.ts](../../../build_tenants/abiogenesis/typescript/code/src/gtl/graph_construction.ts) `graphTemplateDiagnostics` | Evaluation (validation) and derivation (materialization). Subject: the declaration and its materialization basis. Reads: those only. Outputs: a validation result or graph value. Writes: the brand and the shape cache. Stops and results: the outcome column. Authority: none; Program admission is ABG's. Invalidation: a change to the declaration, the basis or the validator law. | Structural recursion over finite declarations. The source-path loops are bounded by path length. `validateProgram` maps every throw to an invalid result. | The declaration, its materialization basis and module constants. `materializeGraph` writes the process-local brand `materializedGraphs` and the shape cache `materializedShapes`, its declared writes. On a cache miss, `retainedMaterializedGraphShape` returns `null` and the caller reconstructs the shape in full. `isMaterializedGtlGraph`, which reads the brand, is not in this row. No filesystem, clock or dynamic import. | One validation result or materialized graph per declaration. A materialization `TypeError` fires only for a declaration outside the validated domain. | Eligible. | `m5-c-algebra-validation`, `r7-graph-validation-basis`, `t287-gtl-graph-law` |
| 7. Artifact verification, dependency lock and install-tree match | [verify_product.ts](../../../build_tenants/abiogenesis/typescript/code/src/product/verify_product.ts) `verifyProduct`; [environment.ts](../../../build_tenants/abiogenesis/typescript/code/src/product/environment.ts) `resolveProductArtifacts`; [declaration_exports.ts](../../../build_tenants/abiogenesis/typescript/code/src/product/declaration_exports.ts) `linkNativeContractSet`, `installedToolchainProductContentDigest`; [install_product.ts](../../../build_tenants/abiogenesis/typescript/code/src/product/install_product.ts) `installedProductContentMatches`, `listInstalledPayloadFiles` | Evaluation. Subject: the artifact file or install root, unchanged. Reads: the file, its members through `tar`, the compiler module, the toolchain manifest and the install tree. Outputs: a verification receipt or lock. Writes: the memo `resolvedProductEnvironments`. Stops and results: typed refusals. Authority: none; Product admission (row 8) consumes the result. Invalidation: a change to the artifact bytes, the toolchain manifest or the compiler. | Not established. `verifyProduct` reads the artifact file, then lists and reads its members through `execFile("tar", …)`. The executable is resolved on PATH, its output is bounded by `TAR_MAX_BUFFER`, it has no deadline, and the file is read again for each member. `linkNativeContractSet` loads the TypeScript compiler through `createRequire(import.meta.url)` and runs it. `installedToolchainProductContentDigest` reads `product-toolchain-manifest.json` with `readFileSync` relative to its module. `listInstalledPayloadFiles` walks a mutable install root. | Undeclared: the `tar` on PATH, the artifact file between reads, the compiler module and its run, the module-relative manifest, and the install root's current tree. Digest comparisons bind some bytes after the read. No termination argument covers the compiler run. | A typed verification or lock outcome or refusal, when the external reads return. | Pending. Remediation: read the artifact bytes once and decide in process over them, with the module's ustar reader `bufferValidatedArchiveEntries`; declare the compiler and toolchain manifest in the lock contract by exact digest, with a termination bound; declare the install-root read as an observation effect outside the check. | Code reading; `t287-wave2-installed-product-verification`, `t287-installed-dependency-lock` |
| 8. Product capability admission | [admission_authority.ts](../../../build_tenants/abiogenesis/typescript/code/src/product/admission_authority.ts) `validateAdmissionCapabilityBasis`, `admitCapabilityEnvironment`, `withAdmissionAuthority` | Admission under the Product's grant. Evidence contract: the verified artifact, the executing toolchain manifest and the current durable prefix. | Not established. `validateAdmissionCapabilityBasis` calls `verifyProduct` (row 7) and reads the executing `product-toolchain-manifest.json` with `readFile` to compare it with the verified manifest digest. `admitCapabilityEnvironment` asserts that the durable runtime prefix is current, a live read of the store's extent. | Undeclared: row 7's dependencies, the executing manifest file and the store's current extent. The `executingOwnerArtifacts` `WeakSet` is process-local state. | An admitted capability environment, or a refusal thrown as `TypeError`, which is a throw and not a typed outcome. | Pending. Remediation: split physical verification and current-extent observation, effects under their own contracts, from a deterministic admission check over their admitted results, and return typed refusals. | Code reading; `r4-catalog-admission`, `r5-invocation-admission` |
| 9a. Governance choice, fold and parent projection | [implementation/default_library.ts](../../../build_tenants/abiogenesis/typescript/code/src/implementation/default_library.ts) `projectGovernanceChoice`, `foldGovernanceWork`, `evaluateGovernanceParent` over [abg/default_library.ts](../../../build_tenants/abiogenesis/typescript/code/src/abg/default_library.ts) `projectGovernanceChoice`, `projectGovernanceFold`, `projectGovernanceParent`; declared F_D by [gtl/default_library.ts](../../../build_tenants/abiogenesis/typescript/code/src/gtl/default_library.ts) | Evaluation. Subject: the admitted prefix and leaf input. Reads: those and the basis's GraphFunction declarations. Outputs: a choice, fold state or parent state. Writes: none. Stops and results: the outcome column, `null` included. Authority: none; ABG admits the leaf result. Invalidation: a change to the prefix, the library declarations or the registered selection. | One finite pass over the admitted prefix and the declared input. The three functions contain no `throw`. They return `null`, the declared no-outcome value, for an input outside the accepted shape, and `projectGovernanceChoice` also returns `null` for a throw from registered-selection resolution. A throw from a helper reaches the leaf port, which types it as `implementation_exception`. | The admitted prefix and the leaf input. | One choice or `null`, one fold, or one parent evaluation per input. | Eligible. | `t287-default-library`, `t287-default-library-fulfillment` |
| 9b. Governance preparation leaves | [implementation/default_library.ts](../../../build_tenants/abiogenesis/typescript/code/src/implementation/default_library.ts) `prepareGovernanceSelection`, `prepareGovernanceNativeTask`, `prepareObservedTestingTask`; declared F_D by [gtl/default_library.ts](../../../build_tenants/abiogenesis/typescript/code/src/gtl/default_library.ts) | Construction under the leaf descriptor's grant, declared F_D. Evidence contract: the governance state, plus a worksite observation the contract does not declare. | Reads are bounded by `maxFiles` and `maxBytes` in `observeWorksiteContext` and `observeWorksiteSubject`, but the outcome depends on what the mutable worksite holds when it is read. | Undeclared as inputs: the worksite's current files, read through [abg/default_library.ts](../../../build_tenants/abiogenesis/typescript/code/src/abg/default_library.ts) `currentContext`, `observeWorksiteContext` and `observeWorksiteSubject`. | One task or refusal per pair of input and worksite state; the worksite state is not in the declared domain. | Pending. Remediation: split the worksite observation, an effect under its own contract admitted as evidence, from task construction over the admitted observation; the construction part can then be assessed for eligibility. | Code reading; `t287-default-library` |
| 10a. `workflow.C` arm openings | [c_call.ts](../../../build_tenants/abiogenesis/typescript/code/src/abg/c_call.ts) openings with `regime: "F_D"` and `armId: "arm://abiogenesis/workflow.C@5"`, and foldback `admitWorkflowChildFoldback` | Construction: the opening and foldback of a child traversal under the CCall owner's grant; the `F_D` label sits on an arm whose outcome is the child traversal's. | The arm declares no `f_B`. Its outcome depends on the child traversal, actor and process work included, so the label has no closed domain or termination argument. The arm's own opening and foldback checks are finite. | The child traversal and every dependency it has. | The child's admitted result folded back, or a refusal. | Pending. Remediation: scope the F_D claim to the arm's opening and foldback checks and compose the child traversal under [AC-016](stdo://releases/v3.0.1-rc.1/standards/AXIOMATIC_CALCULUS.md#ac-016-typed-composition), which keeps both traversal identities. A change to the recorded `regime` value would be a payload change and is not proposed here. | Code reading; `d2-workflow-step`, `t288-workflow-scope-conservation` |
| 10b. Program-declared F_D leaf implementations | [leaf_invocation_port.ts](../../../build_tenants/abiogenesis/typescript/code/src/implementation/leaf_invocation_port.ts) (stages `authority_verification`, `implementation_load`, `implementation_invocation`); the leaves that `gtl/*.ts` Programs declare F_D (requirement handoff, self-conformance, semantic revision publication, worksite, Consensus, default library); the qualification assessment leaves in [implementation/qualification.ts](../../../build_tenants/abiogenesis/typescript/code/src/implementation/qualification.ts) | Per leaf. An assessment leaf (self-conformance, qualification) is an evaluation: subject its assessed input, reads its declared input and the catalog files named in the next columns, output the typed assessment, no writes, no authority (ABG admits the result), invalidated by a change to its input or catalogs. A construction leaf has its descriptor's contract and grant. | The port types every outcome (`malformedOrAdmitted`) and loads the implementation by dynamic `import()` of a path inside the admitted install root. It sets no deadline or fuel, and no leaf records a termination argument. | Declared: the admitted implementation set and install root. Undeclared: `qualificationCoverageIsPublished` ([validator/qualification.ts](../../../build_tenants/abiogenesis/typescript/code/src/validator/qualification.ts)) reads `contracts/qualification/coverage.json` by a module-relative `readFileSync` with no digest binding; `isQualificationVerdictInput`, `isMalformedGtlAssessmentInput` and `isNativeRuntimeAssessmentInput` reach it. `readQualificationCatalog` reads `rule-catalog.json` and computes its digest without binding it. | One typed leaf outcome per invocation that returns. | Pending. Remediation: assess each leaf with a termination argument, or declare a fuel-bounded successor distinct from the leaf it bounds; bind the qualification catalogs as digest-declared inputs. | Code reading; `t287-qualification-law`, `t287-qualification-scopes` |

The table has twelve rows: five eligible (2, 3, 4, 6, 9a), seven pending (1, 5, 7, 8, 9b, 10a, 10b) and none unresolved. The subsection says once that actor and process execution, worksite mutation and native work are effects under their own operation contracts, and are not rows. HoG traversal composes rows and is not a row either. The two contract files carrying a regime field are not rows: `contracts/conformance/gtl-language-conformance-corpus.json` is a non-executable corpus, and `contracts/schemas/gtl-serialization.schema.json` holds a regime enum. Both are schematic contracts under RELEASE §9.

**Owners named** (subsection, Owners):

- Product admission: `validateAdmissionCapabilityBasis`, `admitCapabilityEnvironment` and `withAdmissionAuthority` (`product/admission_authority.ts:215`, `:187`, `:297`), and `admitGraphFunctionCatalog` (`product/catalog.ts:417`). The install effect `installProductInResolvedLock` (`product/install_product.ts:306`) enters truth through ABG's `admitProductInstallInResolvedLock` and `admitArtifact` (`abg/environment_admission.ts:1098`, `:803`).
- ABG admission: `admitRuntimeEventTransactionAtExpectedPrefix` and `admitRuntimeEventTransactionAtDurablePrefix` (`abg/event_store.ts:4278`, `:4296`); `admitEvidence`, `admitResult` and `admitJudgment` (`abg/c_call.ts:6362`, `:6823`, `:6969`); `admitCCallResult` and `admitCCallJudgment` (`abg/c_call_outcome.ts:1918`, `:1921`); and the route path `admitTraversalTransition` (`:5464`) → `admitTraversalTransitionInActiveTransaction` (`:5317`) → `admitRoute` (`:4328`) in `abg/traversal_route.ts`.
- Closure: the admitting function is `constructionDeltaForAdvance` (`abg/traversal_route.ts:2346`). It works under `selectAdmittedConstructionAuthority(…, "evaluateAction")` (`abg/execution_basis.ts:1146`). It builds the route's `actionEvaluationAdmission` member, kind `admitted_action_evaluation` (`:2704-2737`), which carries the `EdgeFulfillmentLedger` and `EdgeClosureDecision` refs and digests. Replay re-validates that member (`abg/replay.ts:1041-1090`).

**Census** (item 3). `git grep -n 'F_D' -- specification build_tenants/abiogenesis/typescript/design` at the base returns 577 lines in 119 files: 73 lines in 23 specification files and 504 lines in 96 design files.

Classification method:

- Every line was classified, and each file is listed below with its per-class line counts.
- Every specification line was read.
- Every design line that names closure, admission, ownership, authority, decision or gating next to `F_D` was read.
- In current designs (ABI5, T287, README, the module designs, and the accepted M03 and M05 direct-traversal, S05 and constitutional-basis designs), the split between (A) and (B) is lexical. A line naming an operation (leaf, seam, check, projection, preparation, reducer, join and similar) is (B) under its row; any other line is (A).
- Lines in dated records are (C). That covers derivations, IACS, structural carrier diagrams, reviews, audits, ADRs, records that are closed, retrospective, proposed, ratified for a past ticket or held, and the five records whose headers invalidate or supersede them. Lines in those records that the authority scan flagged are the exception and are listed under (D).

Totals:

- (A) regime vocabulary consistent with §5 and the regime table: 90 lines in 38 files (66 specification, 24 design).
- (B) an operation claim covered by a row: 187 lines in 31 files (3 specification, 184 design). By row: 10b 167, 5 8, 9a 7, 9b 3, 10a 2.
- (C) dated records read through item 1(b): 280 lines in 64 design files.
  - 20 lines in the 5 records the subsection names: the F_D authority placement derivation, IACS and carrier diagram, the construction-pressure derivation, and ADR-042.
  - 73 lines in the 5 invalidated or superseded records: the public control-plane ontology, the M03 Consensus domain-family design, M03/M04 One Surface, M03/M04 public catalog invocation, and M02/M04 Consensus publication.
  - 187 lines in 54 other dated records.
- (D) contradicts 3.0.1 §5 or A5: 20 lines in 14 files.
  - 4 lines in specification files: stops.
  - 3 lines in the granted files, restated below.
  - 13 lines in other design: named below, not edited.

Reasons for the borderline specification calls, using one test: does the sentence give the kind itself a permission, admission, closure or decision?

- (D):
  - `PRODUCT.md:697` and `INTENT.md:54` attribute authority to each kind.
  - `FN-COMP-004` (`:40`) and `COMPUTE-NOTATION-010` (`:110`) place closure authority on F_D.
- (A):
  - `INTENT.md:149` ("`F_D` owns total mechanical functions over declared closed inputs") states the kind's extent with totality.
  - `INSTRUCTION-ASSEMBLY-004` ("shall be F_D-owned for …") classifies listed predicates under -004A's total-function condition and leaves semantic judgment and admission with their owners.
  - `CCALL:114` ("F_D admission … are trust boundaries") names stages.
  - `PRODUCT.md:535` (the regime row) is the import site; the binding reads it through the common contract.
  - `PRODUCT.md:1649` ("obey their declared type and authority boundaries") bounds each kind by its declared contract.
- (B), row 5:
  - `FN-COMP-008` (`:48`) requires the closure function to be F_D, which is an eligibility claim.
  - `REQUIREMENTS-ALGEBRA-040` (`:124`) names route code, which is ABG's admission mechanism, classified F_D; the doer is an admission owner, not the kind.
  - `FPC-011E` (`:81`) is `evaluateAction`.
- (D) test for design: a line is (D) when the kind is the holder of a closure or admission authority, or when a leaf that is not an admission owner is said to admit.

The (D) list. Specification stops: quoted, with a proposed restatement, none edited.

1. `specification/INTENT.md:54`: "7. preserve `F_D`, `F_P`, and `F_H` as distinct compute and authority regimes inside one traversal model;"
   - Proposed: "7. preserve `F_D`, `F_P`, and `F_H` as distinct compute regimes inside one traversal model, each operation's authority carried by its own contract and admitted grant;"
2. `specification/PRODUCT.md:697`: "`F_D`, `F_P` and `F_H` retain their distinct authorities."
   - Proposed: "`F_D`, `F_P` and `F_H` remain distinct regimes; each operation's contract and admitted grant carry its authority, and classifying an operation `F_D` grants it none."
3. `specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md:40` (FN-COMP-004): "`F_D` may own closure authority. … Non-`F_D` regimes shall not claim closure authority."
   - Proposed: "No regime binding holds closure authority by its kind. Closure truth is ABG's admitted closure fold over admitted evidence, recorded as the closure decision, and a closure function that claims `F_D` establishes its total-domain eligibility. `F_P` may construct, diagnose, repair, rank, or supply evidence. `F_H` may be present, deferred, or absentia. `F_P` and `F_H` bindings shall not decide closure."
   - The first sentence of FN-COMP-004, which lists the declared fields, is unchanged.
4. `specification/requirements/gtl/REQ-L-GTL3-COMPUTE-NOTATION.md:110` (COMPUTE-NOTATION-010): "Regime-binding notation shall make non-`F_D` closure authority unrepresentable."
   - Proposed: "Regime-binding notation shall make closure authority unrepresentable on every regime binding; closure is represented only through the selected closure contract and ABG's admitted closure decision."
   - The second sentence, about `F_P` and `F_H`, stays.

In the granted files, restated in this commit:

5. Binding `:154`.
6. Frame basis `:14`.
7. Library `:698`.

The old and new text of each is below.

Other design: named for the Executive, not edited.

8. `M03_ABG_FN_COMPOSITION_DERIVATION.md:45`: "`F_D` owns deterministic closure."
   - Proposed: "The closure contract's deterministic closure predicate decides closure under ABG's closure fold; its `F_D` claim requires total-domain eligibility."
9. Same file, `:188-189`: "`F_D` may validate, gate, project, and close when the closure contract names an `F_D` predicate and required evidence is admitted."
   - Proposed: "An `F_D` operation may validate, gate and project under its own contract; ABG closes when the closure contract's named predicate accepts over admitted evidence."
10. Same file, `:262`: "| regime authority | `REQ-R-ABG3-FN-COMPOSITION` | only F_D can close |"
    - Proposed: "| regime authority | `REQ-R-ABG3-FN-COMPOSITION` | only ABG's closure fold under the named closure predicate closes; no regime closes by its kind |"
11. `M03_ABG_FN_COMPOSITION_FIRST_SLICE_IACS.md:134`: "only F_D closure can close."
    - Proposed: "only ABG's closure fold under the named closure predicate can close."
12. Same file, `:145`: "A non-F_D regime claiming closure authority fails closed."
    - Proposed: "A regime binding claiming closure authority fails closed."
13. Same file, `:160`: "| regime authority | this IACS | only F_D closure authority is accepted |"
    - Proposed: "| regime authority | this IACS | no regime binding carries closure authority; the named predicate under ABG's fold closes |"
14. `M03_ABG_FN_COMPOSITION_STRUCTURAL_CARRIER_DIAGRAM.md:184`: "only an F_D closure predicate under the selected composition identity may close."
    - Proposed: "only ABG's closure fold, under the closure predicate the selected composition identity names, may close."
15. `M03_INSTRUCTION_ASSEMBLY_DERIVATION.md:159`: "F_D-admits review result shape, source package digest, …"
    - Proposed: "Admits, under its declared admission contract, review result shape, source package digest, … (an `F_D` claim requires total-domain eligibility)."
16. `M03_REQUIREMENTS_ALGEBRA_DOWNSTREAM_READINESS_DERIVATION.md:99`: "F_D owns:", followed by a list that includes "event envelope admission and typed rejection".
    - Proposed: "Deterministic operations, each under its owner's contract (ABG admission for envelopes, replay projection and guards) and its total-domain claim, perform:"
17. `M03_REQUIREMENTS_ALGEBRA_ROUTE_INTERFACE_DESIGN.md:70`: "`export type AuthorityRegime = "F_D" | "F_P" | "F_H";`"
    - Proposed: "`export type ComputeRegime = "F_D" | "F_P" | "F_H";`"
18. Same file, `:111`: "`readonly authority: "F_D";`"
    - Proposed: "`readonly regime: "F_D";`", with the projection's authority carried by its owner contract.
19. `T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md:846`: "F_D judgment admits a well-formed execution observation without interpreting …"
    - Proposed: "The F_D judgment accepts a well-formed execution observation without interpreting …; ABG admits that judgment (§8)."

Items 8 to 14 derive from FN-COMP-004 and follow its stop.

Per-file classification. Paths under `design/` are under `build_tenants/abiogenesis/typescript/design/`. B rows are named; C carries its reason.

Specification (23 files, 73 lines):

- `specification/GOALS.md`: A 4
- `specification/INTENT.md`: A 3; D 1 (:54)
- `specification/PRODUCT.md`: A 11; D 1 (:697)
- `specification/requirements/abg/REQ-R-ABG3-CCALL.md`: A 4
- `specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md`: A 1; B 1 (row 5); D 1 (:40)
- `specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md`: A 5; B 1 (row 5)
- `specification/requirements/abg/REQ-R-ABG3-HANDLERS.md`: A 3
- `specification/requirements/abg/REQ-R-ABG3-INSTRUCTION-ASSEMBLY.md`: A 5
- `specification/requirements/abg/REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH.md`: A 4
- `specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md`: A 4; B 1 (row 5)
- `specification/requirements/abg/REQ-R-ABG3-SELECTION-APPLICATION.md`: A 1
- `specification/requirements/abg/REQ-R-ABG3-TUNER.md`: A 2
- `specification/requirements/gtl/README.md`: A 1
- `specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md`: A 3
- `specification/requirements/gtl/REQ-L-GTL3-COMPUTE-NOTATION.md`: A 2; D 1 (:110)
- `specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md`: A 3
- `specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md`: A 1
- `specification/requirements/gtl/REQ-L-GTL3-OPERATOR.md`: A 1
- `specification/requirements/gtl/REQ-L-GTL3-SELECTION-BOUNDARY.md`: A 1
- `specification/requirements/mapping/REQ-M-GTL3-CAPABILITY.md`: A 4
- `specification/requirements/product/REQ-P-CONSENSUS.md`: A 1
- `specification/requirements/product/REQ-P-QUAL.md`: A 1
- `specification/requirements/product/REQ-P-SCENARIOS.md`: A 1

Design (96 files, 504 lines):

- `design/ABG_3_MODULE_DESIGN.md`: A 1
- `design/ABG_EVENT_CALCULUS_RUNTIME_LAW_DERIVATION.md`: C 8 (dated record)
- `design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`: B 1 (row 10b); D 1 (:698)
- `design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md`: D 1 (:14)
- `design/ABI5_STDO3_COMPUTATIONAL_BINDING.md`: A 1; D 1 (:154)
- `design/ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md`: C 4 (invalidated or superseded)
- `design/GTL_3_INTERFACE_CONTRACTS.md`: A 1
- `design/GTL_ASSET_SURFACE_PROMPT_INTERFACE_DERIVATION.md`: C 1 (dated record)
- `design/HOMEOSTATIC_LOOP_AFTER_EVAL_EVENT_DERIVATION.md`: C 1 (dated record)
- `design/M01_TYPED_C_ALGEBRA_AUTHORING_IACS.md`: C 1 (dated record)
- `design/M01_TYPED_C_ALGEBRA_STRUCTURAL_CARRIER_DIAGRAM.md`: C 2 (dated record)
- `design/M02_M04_CONSENSUS_PUBLICATION_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md`: C 5 (invalidated or superseded)
- `design/M02_M04_INSTALLED_CATALOG_FOUNDATION_BEHAVIOR_DESIGN.md`: C 1 (dated record)
- `design/M03_ABG_FN_COMPOSITION_DERIVATION.md`: B 2 (row 5); C 4 (dated record); D 4 (:45, :188, :189, :262)
- `design/M03_ABG_FN_COMPOSITION_FIRST_SLICE_IACS.md`: D 3 (:134, :145, :160)
- `design/M03_ABG_FN_COMPOSITION_STRUCTURAL_CARRIER_DIAGRAM.md`: B 1 (row 5); C 1 (dated record); D 1 (:184)
- `design/M03_ABG_PROBABILISTIC_MONAD_PLUGIN_BOUNDARY_DERIVATION.md`: C 2 (dated record)
- `design/M03_ATTACHED_FP_WORKER_LOOP_DERIVATION.md`: C 1 (dated record)
- `design/M03_COMPOSED_C_STAGE_SET_DERIVATION.md`: C 2 (dated record)
- `design/M03_CONSCIOUSNESS_TIER_STACK_AND_EXECUTION_MODEL.md`: C 5 (dated record)
- `design/M03_CONSENSUS_DOMAIN_FAMILY_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md`: C 19 (invalidated or superseded)
- `design/M03_CONSTITUTIONAL_VERSION_BASIS_BEHAVIOR_DESIGN.md`: B 1 (row 10b)
- `design/M03_CONSTRUCTION_INTENT_RUNNER_FIRST_SLICE_IACS.md`: C 1 (dated record)
- `design/M03_CONSTRUCTION_PRESSURE_PACKAGE_DERIVATION.md`: C 1 (named in 1(b))
- `design/M03_CONSTRUCTION_PRESSURE_PACKAGE_FIRST_SLICE_IACS.md`: C 2 (dated record)
- `design/M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md`: A 3; B 15 (row 10b 13, row 5 2)
- `design/M03_EDGE_ASSURANCE_CONTRACT_DERIVATION.md`: C 4 (dated record)
- `design/M03_EDGE_ASSURANCE_CONTRACT_FIRST_SLICE_IACS.md`: C 2 (dated record)
- `design/M03_EXECUTION_AUTHORITY_PROVENANCE_DESIGN.md`: C 2 (dated record)
- `design/M03_FD_AUTHORITY_PLACEMENT_DERIVATION.md`: C 10 (named in 1(b))
- `design/M03_FD_AUTHORITY_PLACEMENT_FIRST_SLICE_IACS.md`: C 5 (named in 1(b))
- `design/M03_FD_AUTHORITY_PLACEMENT_STRUCTURAL_CARRIER_DIAGRAM.md`: C 2 (named in 1(b))
- `design/M03_FP_CONSCIOUSNESS_LOOP_DERIVATION.md`: C 13 (dated record)
- `design/M03_FP_CONSCIOUSNESS_LOOP_FIRST_SLICE_IACS.md`: C 3 (dated record)
- `design/M03_FP_CONSCIOUSNESS_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md`: C 1 (dated record)
- `design/M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md`: C 1 (dated record)
- `design/M03_GRAPH_SPAN_FOLDBACK_REENTRY_DERIVATION.md`: C 6 (dated record)
- `design/M03_INSTRUCTION_ASSEMBLY_DERIVATION.md`: C 10 (dated record); D 1 (:159)
- `design/M03_INSTRUCTION_ASSEMBLY_FIRST_SLICE_IACS.md`: C 7 (dated record)
- `design/M03_INSTRUCTION_ASSEMBLY_STRUCTURAL_CARRIER_DIAGRAM.md`: C 2 (dated record)
- `design/M03_INSTRUCTION_PROTOCOL_BEHAVIOR_DESIGN.md`: C 3 (dated record)
- `design/M03_M04_ONE_SURFACE_AUTHORITY_BEHAVIOR_DESIGN.md`: C 2 (invalidated or superseded)
- `design/M03_M04_PLUGIN_CONTRACT_MODEL_IACS.md`: C 3 (dated record)
- `design/M03_M04_PUBLIC_CATALOG_INVOCATION_AUTHORITY_BEHAVIOR_DESIGN.md`: C 43 (invalidated or superseded)
- `design/M03_OUTPUT_ALLOCATION_AND_WORKSPACE_ZOOM_FOLDBACK_DERIVATION.md`: C 4 (dated record)
- `design/M03_RECURSIVE_EXECUTIVE_OBSERVER_DERIVATION.md`: C 1 (dated record)
- `design/M03_REQUIREMENTS_ALGEBRA_DERIVATION.md`: C 7 (dated record)
- `design/M03_REQUIREMENTS_ALGEBRA_DESIGN_MODULE_REVIEW.md`: C 2 (dated record)
- `design/M03_REQUIREMENTS_ALGEBRA_DOWNSTREAM_READINESS_DERIVATION.md`: C 3 (dated record); D 1 (:99)
- `design/M03_REQUIREMENTS_ALGEBRA_REFINEMENT_FIRST_SLICE_IACS.md`: C 1 (dated record)
- `design/M03_REQUIREMENTS_ALGEBRA_ROUTE_INTERFACE_DESIGN.md`: C 10 (dated record); D 2 (:70, :111)
- `design/M03_REQUIREMENTS_ALGEBRA_ROUTE_REQUIREMENTS_AUDIT.md`: C 2 (dated record)
- `design/M03_REQUIREMENTS_ALGEBRA_STRUCTURAL_CARRIER_DIAGRAM.md`: C 1 (dated record)
- `design/M03_REQUIREMENT_PROOF_CARRY_THROUGH_DERIVATION.md`: C 3 (dated record)
- `design/M03_REQUIREMENT_PROOF_CARRY_THROUGH_FIRST_SLICE_IACS.md`: C 2 (dated record)
- `design/M03_REQUIREMENT_PROOF_CARRY_THROUGH_STRUCTURAL_CARRIER_DIAGRAM.md`: C 1 (dated record)
- `design/M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_API_EVENT_PROJECTION_PROOF_PLAN.md`: C 3 (dated record)
- `design/M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_DERIVATION.md`: C 3 (dated record)
- `design/M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_FIRST_SLICE_IACS.md`: C 3 (dated record)
- `design/M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_FIRST_SLICE_IACS.md`: C 1 (dated record)
- `design/M03_VECTOR_RUNTIME_REGIME_RESOLUTION_DERIVATION.md`: C 6 (dated record)
- `design/M03_VECTOR_RUNTIME_REGIME_RESOLUTION_FIRST_SLICE_IACS.md`: C 4 (dated record)
- `design/M04_PUBLIC_CONTRACT_PUBLICATION_BEHAVIOR_DESIGN.md`: C 4 (dated record)
- `design/M04_PUBLIC_OPERATION_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md`: C 1 (dated record)
- `design/M04_SHARED_PRODUCT_TOOLCHAIN_DESIGN_MODULE_REVIEW.md`: C 1 (dated record)
- `design/M04_TYPESCRIPT_INSTALLER_DERIVATION.md`: C 1 (dated record)
- `design/M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md`: B 48 (row 10b)
- `design/M05_RESEARCH_PRODUCT_LAB_SCENARIO_CATALOG_DERIVATION.md`: C 1 (dated record)
- `design/M05_S04_OBSERVER_TUNER_GLOBAL_TO_LOCAL_DESIGN.md`: C 26 (dated record)
- `design/M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md`: A 2; B 17 (row 10b)
- `design/M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN.md`: C 5 (dated record)
- `design/README.md`: B 1 (row 10a)
- `design/T176_GTL_LANGUAGE_CAPABILITY_TS_HOW_AND_GAP_ANALYSIS.md`: B 2 (row 10b)
- `design/T287_C1_PRESERVED_RESULT_ARTIFACT_DESIGN.md`: B 6 (row 10b)
- `design/T287_C2_FORWARD_REENTRY_DESIGN.md`: A 2; B 5 (row 10b)
- `design/T287_D1_REQUIREMENT_LIFECYCLE_DESIGN.md`: A 3; B 12 (row 10b)
- `design/T287_D2_REQUIREMENT_LIFECYCLE_DESIGN.md`: A 1; B 6 (row 10b)
- `design/T287_D4_D5_NATIVE_QUALIFICATION_DESIGN.md`: B 2 (row 10b)
- `design/T287_D4_SELF_CONFORMANCE_DESIGN.md`: B 1 (row 10b)
- `design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md`: A 1; B 10 (row 9a 7, row 9b 3)
- `design/T287_F11_REUSABLE_QUALIFICATION_LIBRARY_TARGET_DESIGN.md`: B 4 (row 10b)
- `design/T287_NATIVE_WORKSPACE_WORK_DESIGN.md`: B 2 (row 10b)
- `design/T287_PENDING_CONSUMER_CONTINUATION_DESIGN.md`: A 2; B 1 (row 10b)
- `design/T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION.md`: B 1 (row 10b)
- `design/T287_R10_TYPED_TERMINAL_OUTCOME_DESIGN.md`: B 1 (row 10b)
- `design/T287_REGISTERED_GRAPH_SELECTION_DESIGN.md`: A 1; B 5 (row 10b)
- `design/T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN.md`: B 4 (row 10b)
- `design/T287_W2_ODD_GLC_TYPED_WORKSPACE_ADMISSION_DESIGN.md`: A 1
- `design/T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN.md`: A 2; B 2 (row 10b)
- `design/T287_W2_R3_C1_LIVE_LLM_WORKSITE_CONSTRUCTION_DESIGN.md`: A 2; B 14 (row 10a 1, row 10b 13)
- `design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md`: A 1; B 3 (row 10b); D 1 (:846)
- `design/T287_W2_R3_C3_BRANCH_CONSTRUCTION_AGGREGATE_DESIGN.md`: B 10 (row 10b)
- `design/T287_W2_R3_SINGLE_START_CONSTRUCTION_EXECUTION_DESIGN.md`: B 7 (row 10b)
- `design/adrs/ADR-041-runtime-execution-law-is-carrier-and-event-owned.md`: C 1 (dated record)
- `design/adrs/ADR-042-deterministic-handling-must-not-structurally-block-governed-fp.md`: C 2 (named in 1(b))
- `design/adrs/ADR-043-runtime-advancement-uses-execution-basis-and-advancement-transition.md`: C 1 (dated record)

**Restated sentences, old and new.**

1. Binding `:154`.
   - Old: "Its F_D evaluation/proof classification does not automatically identify all deterministic ABG construction/effect leaves. An optional a_c representation must bind operation kind, domain, authority and result meaning explicitly; equal spelling is no import."
   - New: "Its F_D kind classifies total deterministic processing. That classification identifies no ABG construction, admission or effect leaf by itself; an operation's F_D standing is its row in [the deterministic kind under the selected edition](../../../build_tenants/abiogenesis/typescript/design/ABI5_STDO3_COMPUTATIONAL_BINDING.md#the-deterministic-kind-under-the-selected-edition). An optional a_c representation binds operation kind, domain, authority and result meaning explicitly; equal spelling is no import."
   - The paragraph's first sentence is unchanged.
2. Frame basis `:12-16`.
   - Old: "Under the Product governance calculus, an explicitly declared closed rule may be evaluated by F_D inside ordinary graph work."
   - New: "Under the Product governance calculus, an explicitly declared rule over a closed domain runs inside ordinary graph work as common F_D, imported by exact edition under [the computational binding](../../../build_tenants/abiogenesis/typescript/design/ABI5_STDO3_COMPUTATIONAL_BINDING.md#the-deterministic-kind-under-the-selected-edition), only when that binding's disposition table lists its operation class as eligible: total over the domain, its dependencies declared, one typed outcome per input."
   - The sentences before and after are unchanged.
3. Library `:698`, last cell.
   - Old: "GTL topology, F_D/F_P/F_H authority, actual observed work and independent assessment remain distinct."
   - New: "GTL topology, each leaf's declared regime (F_D, F_P or F_H) with the operation contract and admitted grant that carry its authority, actual observed work and independent assessment remain distinct."
   - Cause: "F_D/F_P/F_H authority" gave authority to the kinds.
4. Library `:579`: unchanged. "The F_D boundary (stages `authority_verification`, `implementation_load` and `implementation_invocation`)" names the leaf port's dispatch branch for a declared F_D leaf and its failure stages. It claims no standing, and row 10b disposes that branch.

**Gates.**

- `git diff --check`: clean.
- Anchors: every `stdo://releases/v3.0.1-rc.1/...` link in the three design files resolves against the installed cut's headings with a GitHub-slug resolver (17 links, 0 bad). The resolver reports deliberately wrong stdo, local and same-file anchors as bad.
  - The 8 distinct stdo anchors written: `AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds`, `#ac-015-functor-classification`, `#ac-016-typed-composition`; `ODD.md#probabilistic-compute`, `#115d-constructive-evaluation-and-yield-loop`, `#117a-conforming-agentic-development`; `RELEASE.md#deterministic-kind-migration`; `examples/DETERMINISTIC_CONTRACTS.md`.
  - The local anchors written also resolve: `#the-deterministic-kind-under-the-selected-edition`, `PRODUCT.md#compute-and-authority`, library `#6-prime-atoms-admitted-domains-falsifiers`.
- `npm run lint:evidence`: "check-evidence-mirrors: 691 tracked mirror roots under .ai-workspace, all inventoried; no new copy; 1739 listed path(s) over 6000000 bytes, no other". This is the same as at the base.
- `t287-calculus-fold`: 13 tests, 13 pass, 0 fail.
- `git status --short`:
  - the three design files and this file, modified;
  - the two untracked Codex posts that were present at the start: `.ai-workspace/comments/codex/20261023T211957Z_…` and `20261024T045334Z_…`, not opened.
- Evidence lanes for the eligible rows, run at this head:
  - `t287-json-value-definition`: 1/1.
  - `t287-value-equality`: 5/5.
  - `t287-select-family`: 7/7.
  - `m5-event-store-reopen`: 21/21.
  - `t287-route-reconstruction`: 9 pass, 2 skipped.
  - `m5-c-algebra-validation`: 19 pass, 3 skipped.
  - `r7-graph-validation-basis`: 1/1.
  - `t287-gtl-graph-law`: 9/9.
  - `t287-default-library`: 17 pass, 3 skipped.
  - `t287-default-library-fulfillment`: 7/7.
  - `t287-registered-graph-selection` fails, as described under findings, and is not cited.

**Deviations.**

1. The activation's ten classes are twelve rows. (ix) splits into 9a, the projections (eligible), and 9b, the preparation leaves (pending), because their evidence differs. (x) splits into 10a, the `workflow.C` arm label, and 10b, the program-declared leaves through the leaf port. The two contract files are named once as schematic, not rows. No class was dropped.
2. The activation cites the regime table as `PRODUCT.md:530-538`, with the F_D row at `:534` and "not a quality label" at `:538`. At the base those are `:530-539`, `:535` and `:539`. The binding cites `:530-539`.
3. The activation points class (vi) at `hog/`. Materialization and Program validation are realized in `gtl/materialize.ts`, `gtl/graph_construction.ts` and `validator/`. `hog/` holds traversal, which composes rows and is not a row.
4. Item 1(b)'s named records include the F_D authority placement structural carrier diagram, a sibling of the named derivation and IACS.
5. The census is classified per line and listed per file with counts. The (A)/(B) split in current designs is lexical, as stated above.
6. The owners are a three-item list, not single sentences.
7. Profile cells give the evaluation profile (subject, reads, outputs, writes, stops and results, authority, invalidation) for evaluation rows, and the evidence contract and grant for admission and construction rows.

**Findings outside the grant.**

1. `test_env/tests/t287-registered-graph-selection.test.mjs` fails at this head. No code changed in M-2, so it fails at the base too.
   - Publication validation returns `static_validation_refusal` with `duplicate_identity` for carried environment ref `contract://registered-selection/child-input@5` on `graph-function://registered-selection/A@5` and `B@5`; the test expects `publication_validation`.
   - The lane is not cited as evidence.
2. `contracts/qualification/sources/ODD_METHOD.md` keeps pre-3.0.1 wording: `:1054` "**A5. F_P Freedom, F_D Authority**" and `:1372` "an F_D gate that admits the produced artifacts". The `PRODUCT.md` and `INTENT.md` copies in the same directory mirror the two specification stops.
3. `gtl/materialize.ts` `isMaterializedGtlGraph` reads a process-local brand, so a consumer's outcome depends on process history. Row 6 excludes it. The C1 design already records that a process-local brand cannot satisfy its joins.
4. The proposed COMPUTE-NOTATION-010 restatement makes closure authority unrepresentable on every regime binding. The realized type exclusion covers F_P and F_H (T176 `:44`). Whether F_D regime bindings carry a closure-authority field in code was not assessed.
5. Row 10b's gap is class-wide: no program-declared F_D leaf records a termination argument, and the port sets no deadline or fuel.

**Stops** (written here; the rest kept moving):

1. Four `(D)` sentences in `specification/`, each quoted above with a proposed restatement, none edited:
   - `INTENT.md:54`;
   - `PRODUCT.md:697`;
   - `REQ-R-ABG3-FN-COMPOSITION.md:40` (FN-COMP-004);
   - `REQ-L-GTL3-COMPUTE-NOTATION.md:110` (COMPUTE-NOTATION-010).
2. Row 7 is a defect: evaluation operations with undeclared material dependencies and no termination argument. They depend on `tar` resolved on PATH with no deadline, the artifact re-read for each member, the TypeScript compiler loaded and run inside the lock, the module-relative toolchain manifest, and the mutable install tree. The row is pending.
3. Row 10b is a defect: the qualification assessment leaves read `contracts/qualification/coverage.json` through `qualificationCoverageIsPublished`, by a module-relative `readFileSync` with no digest binding. `readQualificationCatalog`'s digest is computed and not bound. No F_D leaf records a termination argument. The row is pending.
4. Row 5's clock read and row 8's executing-manifest and current-extent reads are in admission and construction operations, not evaluation operations, so they are pending gaps rather than evaluation stops. Row 8 calls row 7's evaluation, which stop 2 covers.
5. No class was unplaceable (no unresolved row), and no edit outside the grant was made.

**Not verified.**

- The totality arguments for the eligible rows are structural, from reading the code. The lanes show agreement on their fixtures, not totality.
- Row 1's divergence through a Proxy trap is argued from code, not demonstrated by a test. That Valibot `safeParse` has no catch was read in the installed `node_modules/valibot` copy.
- The lanes cited for pending rows were not run: `t287-wave2-installed-product-verification`, `t287-installed-dependency-lock`, `r4-catalog-admission`, `r5-invocation-admission`, `d2-workflow-step`, `t288-workflow-scope-conservation`, `t287-qualification-law`, `t287-qualification-scopes`.
- Lines in dated records were not read one by one beyond the authority scan, and the (A)/(B) split in current designs is lexical.
- No census was taken over `code/src/` or `contracts/`. The activation's census covers `specification/` and the design directory only. The `computeRegime` declarations in code were read only where a row needed them.
- Code line numbers in the table and here are at base `d0b1b196b`.
- Only the two named `.ai-workspace/` paths were opened.
