# Census tools

Commentary. These scripts produced the mechanical census behind the second edition of the technical debt register. They read source and git history only.

| Script | Output in `out/` | Run from the repository root |
|---|---|---|
| `ts-census.mjs` | `summary.json`, `modules.json`, `compiler-unused.json`, `declarations.json` | `node <this dir>/ts-census.mjs build_tenants/abiogenesis/typescript <this dir>/out` |
| `kind-census.mjs` | `kinds*.json` | `node <this dir>/kind-census.mjs build_tenants/abiogenesis/typescript <this dir>/out` |
| `text_census.py` | tests, design, markers, environment, scripts and clone files | `python3 <this dir>/text_census.py . <this dir>/out [suite.tap]` |
| `coverage-aggregate.mjs`, `coverage-report.mjs` | `coverage-*.json` | see the header of each script; they fold a whole-suite run made with `NODE_V8_COVERAGE` |
| `findings_index.py` | `../findings/INDEX.md` | `python3 <this dir>/findings_index.py <findings dir>` |

`declarations.json` and the two per-line coverage files are over 1 MB and are not tracked; the scripts regenerate them in seconds from the same commit. The register's "Method and limits" section lists what the census cannot see.
