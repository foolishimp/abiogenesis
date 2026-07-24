# T-272 Durable Gap Re-entry Candidate

- candidate commit:
  `91f3640fcbb12788c34fcc17e54480390ca4d3b4`
- candidate tree:
  `84d00156f0126e6d1e97c3b55c9b9af8e2c93688`
- design:
  `build_tenants/abiogenesis/typescript/design/M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md`
- design SHA-256:
  `0d1c6281156cbe411240301c04f344c9024b7dd61136b77f332db487c3b5f53e`
- change owner: `T-272`
- change class: bounded S03 realization under the accepted Product and
  requirements
- review state: pending exact-cut review

## Product Outcome

The independently packed developer Product now proves:

```text
Product observation with no admitted action
  -> Product-owned no-action projection
  -> ABG-admitted gap_stop and run_stopped
  -> replay-derived project.read(gaps), without event append
  -> fresh-context public re-entry against exact durable authority
  -> ordinary Product GTL traversal
  -> F_H hold/read/respond/continue
  -> governed convergence
```

The public gap authority binds the exact ProductInstall, WorkspaceBinding,
Catalog, CatalogView, source invocation admission, source Run, admitted gap
route, stop event, and Product no-action projection. Re-entry starts a new
admitted invocation over that exact environment; it does not resume ambient
process state or mutate the stopped Run.

The ProgramValidation carried by the persisted catalog is re-executed through
the non-lowering validator after reopen. The newly branded result must be
byte-equivalent to the admitted validation before the new invocation can
enter.

## Refusals

- Product-valid prior-gap substitution refuses before the new invocation is
  admitted.
- Reusing the old authority after an append refuses.
- A prior-gap observation and public authority cannot be supplied
  independently.
- Setup references must equal the authority's Product install, workspace, and
  catalog view.
- The no-action projection must equal the Product's admitted observation,
  obligations, action catalog, policy, runtime frontier, gap, and missing
  assets.

## Verification

| Gate | Result |
|---|---:|
| `npx tsc -p tsconfig.json --noEmit` | pass |
| developer mini-Product TypeScript | pass |
| `npm run test:m5:external` | `18/18` |
| `npm run test:m5` | `89/89` |
| `npm run test:m4` | `26/26` |
| exact two-pack reproduction | pass |
| `git diff --check` | pass |

Package identity:

- artifact SHA-256:
  `7cb73b4bf73c3622fb477168bbe1ecc5e48e14c900a5c7a0287b3c401a2f3fbe`
- Product content digest:
  `sha256:eb3d22e021400bc47f194aa191591f5b67900fc11d97b744c6c9a161caa9ccee`
- manifest digest:
  `sha256:e59f77987a654043154c21a9e6f7d5e60e5a64935dbb4d7a72e2b6572ed5e690`

The two packed tarballs reproduced the artifact digest exactly.

## Drift Check

- no Product-specific developer fixture identity appears in ABIogenesis core;
- no compiler, lowered plan, executable intermediate carrier, public
  controller, second runtime, or new ticket was introduced;
- no new event kind was introduced; `gap_stop` is one typed disposition over
  the existing traversal-route and run-stop event families;
- `project.read(gaps)` is a replay projection and does not append truth; and
- the forty-row qualification matrix was not used as the implementation queue.

This candidate does not close S03. Further consequence,
runtime-disposition, or public-control expansion remains held until exact-cut
review and acceptance.
