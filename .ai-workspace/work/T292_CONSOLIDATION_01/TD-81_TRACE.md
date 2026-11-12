# TD-81 trace: the tree walk's name order and its root rule

This is an analyst's trace for T-292, written for the Executive's ruling. It is
commentary, not a ruling. Source lines are given at `main` `c02abccb8`.

Every statement is marked **run** or **read**:

- **run**: I executed it and saw the result.
- **read**: I read the code or the text.

## Lead

The order and the root rule can both differ in practice, under narrow
conditions: a process started with `sv_SE` or `tr_TR` in `LC_ALL`,
`LC_MESSAGES` or `LANG` orders the same tree differently from one started under
`en_US`, `en_AU`, `C` or no locale variable (run), and the sites disagree only
on a Product root spelled in another letter case or Unicode normalization form
than the one stored on disk, which no recorded task carries and which reaches
them only if a caller spells both the install target and the binding's Product
root that way (run for the sites, read for the doors).

No verdict depends on either, because every comparison is between two walks
made by one process (read); what the order decides is the order of the rows the
command helper records and the digests over them (its artifact, the observation
and the result event), and 123 of the 163 recorded helper artifacts hold such
rows, all in en-US order, which readers recompute in recorded order without
re-sorting (run).

I recommend code-unit order at all three `localeCompare` sites
(`product/tree_inventory.ts:58`, `implementation/worksite_command_helper.ts:411`
and `:885`) and the stored-spelling root rule (`realpathSync.native` at
`tree_inventory.ts:88`) as a realization_refactor, under which no stored value
changes or stops validating, new Runs order mixed-case rows differently from old
Runs over the same tree, and two order pins in the TD-37c lane change (run, on
changed copies of the build).

Detail:

- The default locale is fixed when Node starts, from `LC_ALL`, then
  `LC_MESSAGES`, then `LANG`; `LC_COLLATE` is never read (run).
- The helper re-sorts its worksite delta itself with `localeCompare` at `:411`,
  and walks its report sets itself at `:885`. Changing the walk at `:58` alone
  therefore moves nothing recorded (read, and run on a changed copy).

## 0. Basis and terms

- **Commit.** `main` is at `c02abccb8` (2026-11-12 23:49 +1100).
  - My copy and every probe used a build of `9258d7949`, which was `main` when
    the trace began.
  - `git diff --stat 9258d7949 c02abccb8` touches one cited file (run):
    `implementation/index.ts`, which lost the Consensus exports. I read it at
    `c02abccb8`.
  - No other cited source, design, lane or test-support file changed (run).
  - In the requirements, only two files changed, and neither is quoted below:
    `specification/requirements/product/README.md` and
    `specification/requirements/product/REQ-P-CONSENSUS.md`.
  - `localeCompare` occurs at the same lines on both commits (run).
- **Copy.** `/private/tmp/abg-td81-work/build_tenants/abiogenesis/typescript`, made
  as the brief says:
  - `git archive main`;
  - `node_modules` copied from T;
  - `npm run build`.
- **Environment.** Every process ran with `TMPDIR=/private/tmp/abg-td81-tmp`
  (run).
- **Probes.** The probes call each site's own built function. The two private
  functions are reached through copies of the built modules with one export line
  added, the way the TD-37c lane reaches them (run):
  - `build/code/src/implementation/td81_helper_probe.js`, the helper with
    `await main();` replaced by the export;
  - `td81_file_replace_probe.js`.
- **Scripts.** The probe scripts are in `/private/tmp/abg-td81-work/probe/`.
- **Changed builds.** To test the options, I copied `build/code/src` four times
  in the scratch tenant and edited the built JavaScript there (run):
  - `build-variant`: options (a), (c) and (d) together;
  - `build-variant-a`, `build-variant-c` and `build-variant-d`: one option each.

  Each code-unit comparator is the body of `compareUnicodeCodeUnits`, inlined.
  The scripts that made them are `probe/make-variant.mjs` and
  `probe/make-variant-one.mjs`. Lanes ran against a copy by setting
  `ABG_WORKSITE_BUILD_ROOT`.

Terms:

- **walk**: `walk` and `visit`, `product/tree_inventory.ts:43-80`. It lists a
  directory, sorts the entries by name, and records one row per entry, each
  directory before its children (read).
- **row**: one `TreeEntry` (`tree_inventory.ts:18-25`). It holds the path
  relative to the root, the node kind, the symlink target, the byte length, a
  digest, and `device:inode:links` (read).
- **locale**: the language and region a process runs under, such as Swedish in
  Sweden (`sv_SE`).
- **collation**: a locale's rule for ordering text. Swedish puts `å`, `ä`, `ö`
  after `z`.
- **default locale**: the locale Node uses when a call names none, as
  `localeCompare` with no argument does.
- **code-unit order**: comparing two strings by their UTF-16 code units, one by
  one. This is JavaScript's `<` on strings. The tenant's function for it is
  `compareUnicodeCodeUnits` (`shared/canonical_json.ts:9-11`); `git grep` counts
  138 uses in 35 source files (read).
- **stored spelling**: the letters of each name as the directory holds them.
  - This volume is APFS, case-insensitive and normalization-insensitive.
  - `/private/tmp/X` and `/private/tmp/x` reach the same directory, but only one
    of the two spellings is stored (run, section 4).
- **root rule**: the check a site makes on its root path before it walks.
- **parent**: the C2 Worker. It is the Product process that runs
  `implementation/worksite_command_execution.ts`, starts the Worker CLI, and
  checks the installed Product before and after a command.
- **helper**: `implementation/worksite_command_helper.ts`, the child process that
  runs the declared commands in a sandbox copy of the worksite.
- **file replace**: `implementation/worksite_file_replace.ts`, the C0 leaf that
  writes one worksite file.

## 1. Does the order change with the locale?

### Setup (run)

The tree is `/private/tmp/abg-td81-work/trees/locale`, with 35 entries. Its
names differ in:

- letter case: `a.txt`, `B.txt`, `Z.txt`, `a/x.txt`, `a/Y.txt`;
- accents: `å`, `ä`, `ö`, and `é` in composed (NFC) and decomposed (NFD) form;
- the Turkish i: `i`, `İ`, `ı`;
- punctuation: `_`, `-`, `.`, `#`, `~`, and a soft hyphen;
- digits: `1`, `2`, `9`, `10`.

It has two subdirectories, `a/` and `sv/`.

Each process was started as
`env -i PATH=/usr/bin:/bin TMPDIR=… <one setting> node probe/walk-locale.mjs`, so
no other locale variable reached it. In each process, the probe ran:

- the parent's `installedProductInventoryDigest`;
- the file replace's `installedProductInventory`;
- the helper's `filesystemInventory`;
- the helper's `worksiteDelta`, against a base tree;
- the helper's report-set walk `walkFiles`.

There were 20 settings on each of two Node binaries. A 21st setting,
`LANG=en_AU.UTF-8` (this machine's own), ran on the first binary only.

| Binary | Node | V8 | ICU | Unicode | CLDR | ICU data |
|---|---|---|---|---|---|---|
| `/opt/homebrew/bin/node` | v24.7.0 | 13.6.233.10-node.26 | 77.1, the system ICU that Homebrew links | 16.0 | 47.0 | full, linked in |
| the official build, copied to `/private/tmp/abg-td81-work/othernode/node` | v24.22.1 | 13.6.233.17-node.58 | 78.3, bundled | 17.0 | 48.0 | full, linked in (`icu_small` false) |

About the two binaries (run, from `process.versions` and `process.config`):

- No Node built with small ICU was at hand.
- The second binary is a read-only copy of the Node that Codex's runtime ships.
  Nothing was written under `~/Library/Application Support/`.
- Both binaries offer one ICU option, `--icu-data-dir` (or the variable
  `NODE_ICU_DATA`), and print "linked-in ICU data is present".

### The order each setting produced (run)

For every setting, the two binaries gave identical rows, orders and digests.
W-en, W-sv and W-tr name the three orders that occurred; the next table lists
them in full. The digest columns hold:

- the parent's `installedProductInventoryDigest` of the tree;
- the digest of the helper's `worksiteDelta` rows against the base tree;
- the digest of the list `walkFiles` returns.

| Setting (the only locale variable set) | Default locale | Walk order | Parent digest | Delta digest | Report-walk digest |
|---|---|---|---|---|---|
| none | en-US | W-en | `5ea5070732d3…` | `234491c0b5c5…` | `a126216b0857…` |
| `LC_ALL=C` | en-US | W-en | as above | as above | as above |
| `LANG=C` | en-US | W-en | as above | as above | as above |
| `LANG=C.UTF-8` | en-US | W-en | as above | as above | as above |
| `LC_COLLATE=C` | en-US | W-en | as above | as above | as above |
| `LC_ALL=en_US.UTF-8` | en-US | W-en | as above | as above | as above |
| `LANG=en_US.UTF-8` | en-US | W-en | as above | as above | as above |
| `LC_COLLATE=en_US.UTF-8` | en-US | W-en | as above | as above | as above |
| `LANG=en_AU.UTF-8` (this machine's setting; first binary only) | en-AU | W-en | as above | as above | as above |
| `LC_ALL=sv_SE.UTF-8` | sv-SE | W-sv | `fd916516f6e1…` | `bc89958aaed3…` | `414c82b722e1…` |
| `LANG=sv_SE.UTF-8` | sv-SE | W-sv | as above | as above | as above |
| `LC_MESSAGES=sv_SE.UTF-8` | sv-SE | W-sv | as above | as above | as above |
| `LC_COLLATE=sv_SE.UTF-8` | en-US | W-en | W-en's | W-en's | W-en's |
| `LC_CTYPE=sv_SE.UTF-8` | en-US | W-en | W-en's | W-en's | W-en's |
| `LC_ALL=tr_TR.UTF-8` | tr-TR | W-tr | `5874c5c8af6f…` | `23f860cdf953…` | `7f8d3321c9d4…` |
| `LANG=tr_TR.UTF-8` | tr-TR | W-tr | as above | as above | as above |
| `LC_COLLATE=tr_TR.UTF-8` | en-US | W-en | W-en's | W-en's | W-en's |
| `LC_ALL=C` and `LANG=sv_SE.UTF-8` | en-US | W-en | W-en's | W-en's | W-en's |
| `LC_ALL=''` (set, empty) and `LANG=sv_SE.UTF-8` | `und` (root) | W-en | W-en's | W-en's | W-en's |
| `LANG=sv_SE.UTF-8` with `--icu-data-dir=<empty directory>` | sv-SE | W-sv | W-sv's | W-sv's | W-sv's |
| `LANG=sv_SE.UTF-8` with `NODE_ICU_DATA=<empty directory>` | sv-SE | W-sv | W-sv's | W-sv's | W-sv's |

The full parent digests (run):

| Order | Parent digest |
|---|---|
| W-en | `sha256:5ea5070732d35833bbdd69cd7478384e58c2c34a6efd0f2d75711929804f94e4` |
| W-sv | `sha256:fd916516f6e1d3f6ba2c1079a97ababa474eb2b4a459101342a18215ed8bbfae` |
| W-tr | `sha256:5874c5c8af6fc8cf8450345cab53747ca8e2cc8e8dd29dd362cbe8fd3c1cf370` |
| code-unit order, computed from the same rows | `sha256:d469075e87c74bc6232062cb966764a4c6e672eac80079ce56a008e33a302a3b` |

In every one of the 41 processes (run):

- the synchronous and asynchronous walks gave the same rows;
- the file replace's rows came out in walk order;
- the helper's map kept walk order.

### The orders in full (run)

In the table, `<SHY>` is the soft hyphen U+00AD, and `é2.txt` is decomposed
(`e` followed by U+0301). The code-unit column is the walk with each directory's
names sorted by `compareUnicodeCodeUnits`. The probe built it from the same rows;
the walker was not changed.

| # | W-en (en, C, unset) | W-sv | W-tr | code units |
|---|---|---|---|---|
| 1 | `_u.txt` | `_u.txt` | `_u.txt` | `#x.txt` |
| 2 | `-h.txt` | `-h.txt` | `-h.txt` | `-h.txt` |
| 3 | `.dot` | `.dot` | `.dot` | `.dot` |
| 4 | `#x.txt` | `#x.txt` | `#x.txt` | `1.txt` |
| 5 | `~t.txt` | `~t.txt` | `~t.txt` | `10.txt` |
| 6 | `1.txt` | `1.txt` | `1.txt` | `2.txt` |
| 7 | `10.txt` | `10.txt` | `10.txt` | `9.txt` |
| 8 | `2.txt` | `2.txt` | `2.txt` | `B.txt` |
| 9 | `9.txt` | `9.txt` | `9.txt` | `Z.txt` |
| 10 | `a` | `a` | `a` | `_u.txt` |
| 11 | `a/x.txt` | `a/x.txt` | `a/x.txt` | `a` |
| 12 | `a/Y.txt` | `a/Y.txt` | `a/Y.txt` | `a/Y.txt` |
| 13 | `a_b.txt` | `a_b.txt` | `a_b.txt` | `a/x.txt` |
| 14 | `a-b.txt` | `a-b.txt` | `a-b.txt` | `a-b.txt` |
| 15 | `a.txt` | `a.txt` | `a.txt` | `a.txt` |
| 16 | `å.txt` | `ab.txt` | `å.txt` | `a_b.txt` |
| 17 | `ä.txt` | `a<SHY>b.txt` | `ä.txt` | `ab.txt` |
| 18 | `ab.txt` | `B.txt` | `ab.txt` | `a<SHY>b.txt` |
| 19 | `a<SHY>b.txt` | `c.txt` | `a<SHY>b.txt` | `c.txt` |
| 20 | `B.txt` | `e.txt` | `B.txt` | `e.txt` |
| 21 | `c.txt` | `é1.txt` | `c.txt` | `é2.txt` (NFD) |
| 22 | `e.txt` | `é2.txt` (NFD) | `e.txt` | `h.txt` |
| 23 | `é1.txt` | `h.txt` | `é1.txt` | `i.txt` |
| 24 | `é2.txt` (NFD) | `i.txt` | `é2.txt` (NFD) | `j.txt` |
| 25 | `h.txt` | `İ.txt` | `h.txt` | `o.txt` |
| 26 | `i.txt` | `ı.txt` | `ı.txt` | `sv` |
| 27 | `İ.txt` | `j.txt` | `i.txt` | `sv/zz.txt` |
| 28 | `ı.txt` | `o.txt` | `İ.txt` | `sv/å.txt` |
| 29 | `j.txt` | `sv` | `j.txt` | `~t.txt` |
| 30 | `o.txt` | `sv/zz.txt` | `o.txt` | `ä.txt` |
| 31 | `ö.txt` | `sv/å.txt` | `ö.txt` | `å.txt` |
| 32 | `sv` | `Z.txt` | `sv` | `é1.txt` |
| 33 | `sv/å.txt` | `å.txt` | `sv/å.txt` | `ö.txt` |
| 34 | `sv/zz.txt` | `ä.txt` | `sv/zz.txt` | `İ.txt` |
| 35 | `Z.txt` | `ö.txt` | `Z.txt` | `ı.txt` |

How the orders differ (run):

- **en-US and the root locale.**
  - Punctuation sorts before digits, and digits before letters.
  - Letter case and accents count only when the names are otherwise equal. So
    `a.txt` sorts before `B.txt`, because a comes before b once case is
    ignored, and `å.txt` and `ä.txt` sort beside `a.txt`.
  - Digits compare as characters, so `10.txt` sorts before `2.txt`.
- **sv-SE.**
  - `å`, `ä` and `ö` sort after `z` (rows 33 to 35).
  - `sv/zz.txt` precedes `sv/å.txt`.
- **tr-TR.**
  - The dotless `ı` sorts before `i` (rows 26 to 28).
  - The ASCII capital `I` sorts as the capital of `ı`, not of `i`. So tr also
    reorders ASCII-only names: 48 of the 123 recorded deltas have only ASCII
    paths and would have been recorded in another order by a helper started
    under `tr_TR` (section 3).
- **Code units.**
  - Every capital letter sorts before every small letter: `B.txt` and `Z.txt`
    come before `_u.txt` and `a`.
  - Non-ASCII names come last.
  - The composed `é1.txt` lands far from the decomposed `é2.txt`.
- **Ties.**
  - Under every locale tried, `ab.txt` and `a<SHY>b.txt` compare equal.
  - The composed and decomposed spellings of `é.txt` also compare equal under
    `en-US`, `sv-SE`, `tr-TR` and the default (run, a direct
    `localeCompare`).
  - JavaScript's sort is stable, so names that tie keep the order `readdir`
    returned.
  - Code-unit order has no ties between distinct names.

### What `localeCompare` with no argument depends on

1. **The collation it uses.** `a.localeCompare(b)` uses ICU's collation for the
   process's default locale. In every run, the default locale equals
   `new Intl.Collator().resolvedOptions().locale`, and the recorded pairs
   (`a.txt`/`B.txt`, `Z.txt`/`ä.txt`, `i.txt`/`ı.txt` and seven more) match that
   collator (run).
2. **Where the default locale comes from.** It is fixed when the process starts,
   from the environment the process was started with (run):
   - `LC_ALL` is used if it is set, even to the empty string; empty gives `und`,
     the root locale;
   - otherwise `LC_MESSAGES`;
   - otherwise `LANG`;
   - `LC_COLLATE` and `LC_CTYPE` are not read;
   - `C` and `C.UTF-8` give en-US;
   - a name ICU does not know (`xx_YY.UTF-8`) gives that tag with the root order.

   Further single runs on the first binary (run):

   | Setting | Result |
   |---|---|
   | `LC_MESSAGES=sv_SE.UTF-8 LANG=tr_TR.UTF-8` | sv-SE |
   | `LC_ALL=tr_TR.UTF-8 LC_MESSAGES=sv_SE.UTF-8` | tr-TR |
   | `LC_ALL=tr_TR.UTF-8 LANG=sv_SE.UTF-8` | tr-TR |
   | `LC_MESSAGES=C LANG=sv_SE.UTF-8` | `und-SE`, with the root order |
   | `LANG=sv_SE` | sv-SE |
   | `LANG=sv_SE.ISO8859-1` | sv-SE |
3. **Changes after start.** Setting `process.env.LC_ALL` or `process.env.LANG`
   inside a running process does not change its default locale, whether before
   or after the first comparison (run).
4. **The operating system's setting.** The macOS language setting is not read
   (run):
   - this machine's `AppleLocale` is `en_AU`, yet with every locale variable
     unset the default is en-US;
   - this session's shell has `LANG=en_AU.UTF-8`, which gives en-AU and the W-en
     order.
5. **The ICU data and version.**
   - Both binaries carry full ICU data. Pointing `--icu-data-dir` or
     `NODE_ICU_DATA` at an empty directory changed nothing (run). That shows
     only that the linked-in data is used when the given directory holds none.
     I loaded no other data set.
   - ICU 77.1 with CLDR 47 and ICU 78.3 with CLDR 48 gave the same orders for
     this tree (run). That is a statement about this tree only. Collation tables
     can change between CLDR versions (not run).

**Answer.** Yes, the order changes with the locale on this runtime.

- Every English, C or unset setting gives the same order, W-en (run).
- So the order differs in practice only when a process starts with a tailored
  locale, such as Swedish or Turkish, in `LC_ALL`, `LC_MESSAGES` or `LANG`.
- On this machine the processes run under `en_AU` (run).

## 2. Values in walk order, where they go, who compares them

Each value below is built from rows in walk order (all read):

| Site | Value | Where it goes | Compared with | Processes | Recorded |
|---|---|---|---|---|---|
| Parent | `installedProductInventoryDigest(productRoot)`: `sha256Canonical` of the rows (`implementation/worksite_command_execution.ts:301-306`). Taken before the Worker is dispatched (`:529-531`) and after it returns (`:566-573`) | a local variable | `productInventoryAfter !== productInventoryBefore` gives `failure("product_inventory_mismatch")` (`:574-576`); a throw in the after-walk gives the same failure (`:570-572`) | both walks in the parent | no: neither digest enters the observation, an event or a file |
| File replace | `installedProductInventory(root)`: the rows (`worksite_file_replace.ts:177-182`), for each conservation root. Taken before (`:271-276`) and after (`:319-329`) the effect | local variables | `canonicalEquals(before, after)` (`:330-339`). Array order counts, and both sides come from one process | both walks in one process | no; on an after-walk failure only a message is recorded (below) |
| Helper, inventories | `filesystemInventory(root)`: a `Map` from path to observation, in walk order (`worksite_command_helper.ts:395-403`). For the Product root before (`:1414-1416`) and after (`:1470-1472`) the commands, and for the sandbox before (`:1435`) and after (`:1468`) | `worksiteDelta` (`:405-431`) | `canonicalEquals(prior, next)` per path (`:415`) | the helper only | no: the maps are not written |
| Helper, delta | `worksiteDelta` takes the union of both maps' keys and **re-sorts it with `localeCompare`** (`:411`). Each row's `ordinal` is its position (`:420`) | the artifact's `worksiteDelta` (sandbox) and `productDelta` (Product) (`:1469`, `:1473`, `:1493-1494`). From there into `result.json`, then the parent's observation (`product/worksite_command_execution.ts:2156-2157`), then the C-call result event | not compared with another delta. `productDelta.length > 0` decides `product_mismatch` (`:1486`); a row without a territory decides `territory_mismatch` | the helper | **yes**. The rows are in `:411` order. Walk order decides only between names that tie under `:411` |
| Helper, report sets | `walkFiles` (`:877-892`) is a second recursive walk, not the shared walker. It **sorts with `localeCompare`** (`:885`) | the predicate observation's `observedValue` (a list of paths) and its `evidence` rows (`:1306-1322`), in the artifact | the judge compares sets: it sorts both the observed list and the declared `equals` with `[...new Set(…)].sort()` (`validator/qualification.ts:203-205`) | written by the helper, read by the judge later | **yes**; the order never changes the verdict |

Readers of the recorded rows (read):

- `constructWorksiteExecutionHelperArtifact`
  (`product/worksite_command_execution.ts:1888-1971`) digests the rows in the
  order given (`:1963`).
- `isWorksiteExecutionHelperArtifact` (`:1973-2004`) rebuilds the artifact from
  its recorded fields and recomputes the digest. It does not re-sort.
- `isWorksiteExecutionObservation` (`:2172-2263`) requires
  `productDelta.length === 0` (`:2215`) and recomputes the observation digest in
  recorded order (`:2242-2259`).
- `isPathDelta` (`:1796-1808`) checks that each row's `ordinal` equals its
  index. It does not check that the rows are sorted.
- `validator/qualification.ts:170` reads only `productDelta.length`.
  `abg/qualification_proof.ts:893` copies `productDelta`, which an admitted
  observation always has empty.
- No reader rebuilds a delta from a tree or re-runs a command to compare with a
  recorded artifact. `helperArtifactDigest` is compared only with the digest of
  the same run's artifact (`:2124`).

Can the two sides of a comparison come from processes with different locales?
No (read):

- The parent's two digests come from one process.
- The file replace's two inventories come from one process.
- The helper's before and after maps come from one process.
- The delta and the report-set lists are not compared with anything another
  process produced.
- One value crosses a process boundary: the helper's artifact. The parent reads
  it, checks its digest and copies its rows into the observation without
  re-sorting.

The helper's environment (read):

- The parent starts the Worker CLI with its own environment, minus a few
  variables:
  - `abg/worker_transport.ts:758` and `:780` pass
    `sanitizeWorkerTransportEnvironment(contract, process.env)`;
  - for the claude contract (`abg/transport_contracts.ts:435-459`, `:553-570`)
    this removes only `CLAUDE_CODE_ENABLE_EXPERIMENTAL_ADVISOR_TOOL`,
    `CLAUDE_CODE_SSE_*`, `CLAUDE_CODE_ENTRYPOINT` and `CLAUDE_CODE_EXECPATH`;
  - `LANG` and `LC_*` pass through.
- The Worker runs the helper through its own shell tool.
  - The command is `'<node>' '<helper>' --task '<launch.json>'`, with no
    environment prefix (`product/worksite_command_execution.ts:782-785`).
  - So the helper gets whatever environment the Worker's shell tool gives it.
  - The Product neither sets that environment nor checks it.
- The Product's source sets no locale variable: `LANG`, `LC_ALL` and
  `LC_MESSAGES` occur nowhere in `code/src`. The UAT runner passes `LANG` and
  `LC_ALL` through (`test_env/uat/runner.mjs:116`,
  `test_env/uat/harness.test.mjs:856`).
- Three test routes start the helper themselves:

  | Route | Environment |
  |---|---|
  | `t287-worksite-command-execution.test.mjs:318` | its own |
  | `t287-worksite-command-execution.test.mjs:607` | inherited from the lane |
  | qualification measurement, `test_env/support/exact-candidate-qualification.mjs:490` | `env -i` with the setup environment |
- Normally the helper runs under the parent's locale. The Product cannot
  guarantee that, and nothing compares across the two processes.

One recorded value can follow walk order on a failure path (read):

- If the file replace's after-walk throws, the failure records
  `post-publication installed Product conservation unverified: ${String(error)}`
  and the error code (`worksite_file_replace.ts:319-327`).
- The error names the first failing entry in walk order, for example the first
  special node or unreadable file. With two or more failing entries, the
  recorded message depends on the order.
- Across roots, `Promise.all` reports whichever root fails first in time.
- I did not search recorded results for this message.

## 3. Does any recorded value pin the present order?

Method (run):

1. I listed every directory named `worksite-command-execution`:
   - 32 under the evidence root, `/Users/jim/src/apps/abiogenesis/.ai-workspace`;
   - 49 under `T/test_env/test_runs`.
2. `probe/scan-artifacts.mjs` read every `<task>/<attempt>/result.json` beneath
   them.
3. For each artifact, it recomputed the digest with the tenant's
   `sha256Canonical` in recorded order.
4. It tested every list against en-US, sv-SE, tr-TR and code-unit order.

| Measure | Value (run) |
|---|---|
| Helper artifacts read | 163: 56 under the evidence root and 107 under `test_runs`. Kinds `worksite_command_helper_artifact` and `worksite_command_forward_helper_artifact`; none unreadable |
| Dispositions | 161 `success`, 2 `territory_mismatch` |
| Digest recomputes in recorded order | 163 of 163 |
| Every delta row's ordinal equals its index | 163 of 163 |
| Artifacts with `worksiteDelta` rows | 123, each with two or more rows. 585,718 rows in all; the largest has 32,275 (`.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/runtime-003/…/result.json`) |
| Deltas in en-US order | 123 of 123 |
| Deltas with a non-ASCII path | 0 |
| Deltas with a capital letter in some path | 123 |
| Deltas with two names that tie under en-US | 0 |
| Deltas that code-unit order would reorder | 113 |
| Deltas that sv-SE would reorder | 0 |
| Deltas that tr-TR would reorder | 48 |
| Artifacts with `productDelta` rows | 0 |
| Artifacts with report-set predicates | 65, listing 520 paths, all in en-US order. Code-unit order would reorder none of them, nor their evidence rows |
| Delta rows in event logs | I searched one log, `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc5-performance-01/runtime-001/resources/events/runtime.events.jsonl` (586 MB). It holds `worksite_path_delta` rows on 8 lines, including 4 `c_call_result_admitted` events. The observation's rows are copied into events |

Does any reader recompute their order or their digest (read)?

- Readers recompute digests, but from the recorded rows in recorded order
  (section 2).
- No reader rebuilds rows from a tree, re-sorts them or checks that they are
  sorted.
- The recorded rows are therefore data that is only read back. Each recorded
  digest covers its recorded order, and that stays true whatever the walk does
  later.

The Product's own reader, `isWorksiteExecutionHelperArtifact`, ran over every
recorded artifact that has a readable `task.json` beside it: 161 of the 163
(run, `probe/validate-recorded.mjs` and `probe/validate-reorder.mjs`).

| Result | Count (run) |
|---|---|
| Accepted by the present build | 74 |
| Refused by the present build | 87. Of these, 25 hold fewer than two delta rows, so order cannot be their cause. I did not trace the cause |
| Changed copy of the build with (a), (c) and (d) | the same counts. The change touches no reader (read) |
| Accepted artifacts whose deltas code-unit order would reorder | 61 of the 74 |
| Those 61, with delta rows re-sorted by code units, ordinals renumbered and digest recomputed | all 61 accepted |

The reader therefore accepts both the recorded en-US order and the code-unit
order of the same rows.

Pins in the repository (run). I ran `git grep` at `main` over the tenant,
outside `code/src` and `test_env/test_runs`, for `worksiteDelta`, `productDelta`
and `worksite_path_delta`.

| What is pinned | Where |
|---|---|
| Empty deltas | `test_env/support/c2-observation-carrier.mjs:41`, `test_env/support/d2-workflow-step-harness.mjs:74`, `test_env/tests/d2-frame-installed.mjs:676`, `t287-default-library.test.mjs`, `t287-default-library-fulfillment.test.mjs`, `t287-qual056-material.test.mjs:90`, `w2-steel-serial-branch-installed.test.mjs:679`, `t287-worksite-command-execution.test.mjs:1314` |
| A one-row delta (`undeclared.txt`); one row has only one order | `t287-observed-worksite-command.test.mjs:195-196` |
| An order of several names | `test_env/tests/t292-td37c-tree-walker.test.mjs` only (below) |
| A helper artifact digest or a delta | nothing in `contracts/qualification` or `test_env/fixtures`. The one `artifactDigest` in `test_env/fixtures/abi5-root-candidate-basis.json:4` is the Product artifact's |

The TD-37c lane pins two orders:

- its first test (`:102-118`) pins the walk order of `TREE` (`:58-69`, `a.txt`
  before `B.txt`);
- its second test (`:120-144`) pins the delta order `a.txt`, `B.txt`,
  `dir/created.txt`, `link-file`;
- its third test (`:146-175`) has no order.

What would change under code-unit order:

| Change | Recorded Runs | New Runs over the same tree | Lanes with pinned values |
|---|---|---|---|
| The walk only (`tree_inventory.ts:58`) | nothing; no value in walk order is recorded (read) | The parent's digest and the file replace's rows reorder, but neither is recorded. The helper's maps reorder too, but `:411` re-sorts the delta, so no recorded value moves (read) | TD-37c test 1 fails; tests 2 and 3 pass (run, `build-variant-a`) |
| The delta sort (`worksite_command_helper.ts:411`) and the report-set walk (`:885`) | nothing. The stored bytes stay, and the reader accepts them as before (run, above) | Delta rows and ordinals reorder whenever the changed paths mix capitals and small letters, punctuation or non-ASCII. The artifact, observation and result-event digests change with them. On the recorded trees, 113 of 123 deltas would come out in another order. Report-set lists reorder the same way, but none of the 65 recorded ones would (run) | TD-37c test 2 fails; tests 1 and 3 pass (run, `build-variant-c`) |

Like every source change, either change regenerates the Product's identity, as
each T-292 package does (read: `c02abccb8` "Regenerate the product identity and
restage the qualification mirrors after TD-26 P2"). That is not a pin of the
order.

## 4. The root rule

The three rules (read):

| Site | Rule | `realpath` it calls | Refusal text |
|---|---|---|---|
| Parent | `tree_inventory.ts:44-51`, with `rootRefusal`: `resolve(root)` must equal the root; `lstat` must show a directory, not a symlink; then `realpath(root)` must equal the root | `realpathSync`, through the synchronous driver (`:88`). It is Node's JavaScript implementation: it resolves symlinks one component at a time and keeps the letters it was given | "installed Product root must remain canonical" (`implementation/worksite_command_execution.ts:301-306`) |
| File replace | the same code, `:44-51` | `fs/promises` `realpath`, through the asynchronous driver (`:98`). It is the operating system's `realpath`, which returns the stored spelling | "installed Product root must be one canonical concrete directory" (`worksite_file_replace.ts:177-182`) |
| Helper | its own `canonicalDirectoryRoot` (`worksite_command_helper.ts:142-153`), then the walk with no `rootRefusal` (`:398`) | `fs/promises` `realpath` | "declared root must be one concrete directory" or "declared root must be lexical- and physical-canonical" |

Next, the three sites ran on one directory spelled 13 ways (run,
`probe/root-rule.mjs`). Each site ran its own built function on
`trees/small`, or on `trees/café`, which is stored composed (NFC).

| Spelling | Parent | File replace | Helper | JS `realpathSync` keeps it | `realpathSync.native` and system `realpath` keep it |
|---|---|---|---|---|---|
| stored spelling | admitted | admitted | admitted | yes | yes |
| last component in another case (`trees/SMALL`) | admitted, same digest | refused | refused | yes | no |
| an ancestor in another case (`/private/tmp/ABG-TD81-WORK/…`) | admitted, same digest | refused | refused | yes | no |
| first component in another case (`/PRIVATE/…`) | admitted, same digest | refused | refused | yes | no |
| composed name, given composed | admitted | admitted | admitted | yes | yes |
| composed name, given decomposed | admitted, same digest | refused | refused | yes | no (returns the composed name) |
| through a symlinked ancestor (`/tmp/…`) | refused | refused | refused | no | no |
| the root is a symlink | refused | refused | refused (not a directory) | no | no |
| trailing separator | refused | refused | refused | no | no |
| a `..` segment | refused | refused | refused | no | no |
| a repeated separator | refused | refused | refused | no | no |
| a relative path | refused | refused | refused | no | no |
| firmlink spelling `/System/Volumes/Data/private/tmp/…` | admitted | admitted | admitted | yes | yes |

What the table shows (run):

- The sites differ exactly on a root in another letter case or normalization
  form than the stored one.
- For such a root, the parent's digest equals the stored spelling's, because the
  rows carry relative paths.
- The firmlink spelling reaches the same directory by another path. All three
  sites admit it, so they agree on it.

Where each site's root comes from (read):

- **Product root, parent and helper.** Both read
  `workspaceBinding.roots.productRoot`:
  - the parent at `implementation/worksite_command_execution.ts:529-531` and
    `:566-573`;
  - the helper at `:1414-1416` and `:1470-1472`, receiving the same string in
    `task.json`.
- **File replace.** Its roots are the `conservationRoots`: the set of
  `installedRoot` values of the Program owner, the graph owners and the
  implementation owners, sorted by code units
  (`implementation/leaf_execution_authority.ts:394-400`). They come from the
  execution basis's `productInstalls` (`:346-348`, `:373`).
- **Helper, sandbox root.** The sandbox root is
  `join(archiveRoot, "worksite-command-execution", <task>, <attempt>, "sandbox")`
  (`product/worksite_command_execution.ts:771-780`), where `archiveRoot` is the
  binding's archive root.

Which function produced those strings (read):

- **The install root.** `installedRoot` is
  `join(targetRoot, "node_modules", …packageName)`
  (`product/install_product.ts:89-94`, `:390-393`).
  - `targetRoot` is the caller's string at `product.install`
    (`product/install_definition_bindings.ts:279`; contract
    `product/install_operation_contracts.ts:26`).
  - `join` removes `..` and repeated or trailing separators, but not differences
    of case or normalization form.
  - No `realpath` is called on this path. There is none in `install_product.ts`,
    `environment.ts`, `environment_admission.ts` or `execution_basis.ts`.
- **The binding's roots.** They are the caller's strings at `workspace.bind`
  (`product/environment_definition_bindings.ts:516-583`, `:680-690`; contract
  `product/environment_operation_contracts.ts:427-437`).
  - They are checked only as trimmed, non-blank, NUL-free and absolute
    (`product/environment.ts:1110-1191`;
    `shared/public_function_contracts.ts:123-126`).
  - Admission does not canonicalize them (`abg/environment_admission.ts:1238-1384`).
- **The join between them.** The execution basis requires
  `install.installedRoot === workspaceBinding.roots.productRoot` as strings
  (`abg/execution_basis.ts:646`, `:719`).
- **The worksite root.** By contrast, `A.canonicalRoot` comes from the system
  `realpath` when a workspace is created or opened
  (`product/workspace_operations.ts:525`, `:589`), so it is always in stored
  spelling.

Recorded roots (run, `probe/scan-roots.mjs`): the 161 readable `task.json` files
beside the scanned artifacts carry 513 distinct pairs of root name and path.
Every one that still exists is in its stored spelling.

Can another spelling reach the sites through a Public door (read)?

- **Letter case or normalization form: yes.** It takes two steps by the caller,
  and nothing refuses it before the sites:
  - give `product.install` a target root in that spelling;
  - give `workspace.bind` the resulting install root in the same spelling.
- **What then happens:**
  1. The C2 parent admits it at its before-walk (`:529-531`).
  2. The parent writes the manifests and dispatches the Worker, which is a model
     call.
  3. The helper refuses the root at its first Product inventory
     (`:1414-1416`). That step runs after the launch manifest and the protected
     observations, and before the snapshot and any declared command. The throw
     happens before the artifact is built, so no `result.json` is written.
  4. The parent's completion fails with `helper_artifact_absent`
     (`implementation/worksite_command_execution.ts:601`).
  5. Every file replace on such a binding refuses at its before-walk
     (`worksite_file_replace.ts:271-276`) through `productConservationFailure`,
     before its effect.
- **What a caller sees:** a refusal in every case. With the parent's present
  rule, the C2 call fails later, after a Worker call, and with another code
  (`helper_artifact_absent` instead of the root refusal). No declared command
  runs, and no byte of the Product or the worksite changes.
- **An archive root in another case** behaves the same way. The parent's archive
  check (`implementation/worksite_command_execution.ts:243-249`) uses
  `realpathSync` and admits it; the helper's root rule refuses the sandbox root
  under it. I did not run this.
- **The other spellings:** a symlinked ancestor, a symlink root, a trailing
  separator, a `..` segment, a repeated separator and a relative path are
  refused by all three sites (run). `join` at install also removes a trailing
  separator, `..` and a repeated separator (read).
- **Direct calls.** The sites' functions are not package exports.
  `installedProductInventoryDigest` is exported from its module but not from
  `implementation/index.ts` (read), and `package.json` `exports` has no
  `./implementation` entry (run, listing its keys). A caller who goes through a
  door sees the difference only as which refusal comes, at which step (read).
  Otherwise it is visible only by importing a built module by path, as the
  TD-37c lane and my probes do (run).
- **Not run through a door.** I did not install and bind a Product under a
  case-variant target root and then run a C2 command.

The same blind spot elsewhere (read). The check `realpathSync(x) !== x` keeps
the given letters, so it cannot see a case or normalization alias. It occurs at
27 places in 10 files:

| File | Lines |
|---|---|
| `abg/worksite_revision.ts` | `:724`, `:731`, `:736`, `:752`, `:759`, `:762` |
| `abg/semantic_stage.ts` | `:292`, `:300`, `:305`, `:379`, `:382` |
| `abg/semantic_job.ts` | `:219`, `:401`, `:404` |
| `abg/semantic_revision.ts` | `:963`, `:966` |
| `abg/worksite_construction_recovery.ts` | `:151`, `:157` |
| `abg/transport_contracts.ts` | `:578` |
| `abg/runtime_liveness.ts` | `:342` |
| `product/stdo_environment.ts` | `:98`, `:102`; `:98` checks the C2 owner install's `installedRoot` |
| `implementation/worksite_command_execution.ts` | `:246`, `:259`, `:275`, `:369` |
| `product/tree_inventory.ts` | `:48`, through `:88` |

These sites use the system `realpath` and so require the stored spelling:

- `product/worksite_operations.ts:366`, `:480`, `:1145` and `:1183`. At `:1145`
  the refusal is `aliased_subject`, "worksite context requires canonical path
  spelling".
- `product/stdo_environment.ts:38` and `:185`.
- the helper.

TD-81 names only the three walk sites.

## 5. What the design and the requirements say

I searched these sources (read):

- `T/design`, without `history/`;
- all 83 files of `specification/requirements`.

The search terms were: locale, collation, code unit, sorted, lexicographic,
order, inventory, delta, canonical root, realpath, spelling, alias, case and
normalization.

**The negative result first.** No live design sentence and no requirement fixes
the order of the walk's rows, of the delta's rows or of the report-set lists.
None defines the spelling of a Product root. The order is stated only in code
and tests:

- the comment at `tree_inventory.ts:40-42`, "Entries are visited in
  `localeCompare` order of their names; a directory precedes its children.";
- the TD-37c lane's comments (`t292-td37c-tree-walker.test.mjs:11`, `:57-58`).

The tables below quote, by topic, every passage the search found that bears on
row order, canonical roots or root spelling (all read). The remaining hits only
place paths beneath a root, or concern other inventories; they are listed after
the tables.

### Order

| File and lines | Status of the document | Text | What it governs |
|---|---|---|---|
| `T/design/M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md:2081-2086` | "proposed Gate 1 bounded-repair subject; not operative realization authority until direct F_H accepts the exact reviewed commit and tree" (`:3-4`) | "Identity-bearing semantic sets use one explicit Unicode code-unit comparator. Canonicalization sorts by canonical semantic identity and canonical member bytes, preserves duplicates until duplicate rejection, and never uses `localeCompare`, caller order, filesystem order, or object iteration order. Permuting equal semantic membership preserves ProgramValidation, GraphValidation, ExecutionBasis, invocation, and replay identities." | identity-bearing semantic sets in program and graph validation; it does not name file inventories |
| the same file, `:119` | as above | "`REQ-L-GTL3-LAWS-021..022` \| one code-unit canonical data identity independent of caller order" | its mapping of LAWS-021 and LAWS-022 |
| `T/design/ABI5_REALIZATION_CONSTITUTION.md:1602-1603` | "Operative local realization authority" (`:3`) | "Set-like arrays use the owning contract's canonical order; ordered topology and lineage are never resorted." | the owner-output closure catalog for `Rnn` public results (Table 5.6.3-B2, heading at `:1572`); not the helper artifact |
| `T/design/M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN.md:40` and `:679-680` | "Bounded replacement design candidate; realization held" (`:5`) | "`contractDigest` hashes the canonical sorted inventory required by `REQ-P-PUBLIC-CONTRACTS-002A`." and "canonical inventories and bindings sort in `O(n log n)`. Traversal order cannot change identity." | native contract declaration inventories |
| `T/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:285`, `:288` | "active tenant design of the common computational library" (`:3`) | `canonicalEquals`: "keys sorted by code unit"; `hasExactKeys`: "sets equal under code-unit order" | object keys, not the order of array rows |
| `T/design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md:1031` | "accepted C2 helper-acknowledgment design … its source/proof completion remains open" (`:7`) | "Ordinals/order, source joins and identities are deterministically derived." | the D2 `snapshotSources` rows, not inventories |
| `specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md:44-48` (REQ-P-PUBLIC-CONTRACTS-002A) | requirement | "`productContentDigest` shall hash the lexicographically sorted `(product-relative path, file sha256)` inventory of immutable product payload files, excluding `product-toolchain-manifest.json` itself and mutable install/runtime state." | the Product's payload identity. `payloadInventoryDigest` (`shared/digests.ts:31-38`) realizes it with `compareUnicodeCodeUnits`. This is the one requirement that orders an inventory of files |
| the same file, `:53-55` | requirement | "A native typed group row's `contractDigest` shall hash a published canonical inventory of `(package export path, declaration-file relative path, declaration-file sha256)` tuples; it shall not depend on loader order or source paths." | native contract groups |
| `specification/requirements/gtl/REQ-L-GTL3-LAWS.md:64` (LAWS-021) | requirement | "Canonical authored form — an authored GTL program has one canonical data serialization with stable ordering and content-addressable digest identity. Identity canonicalization for digests and the canonical authored form are the same serialization law; alternate orderings or spellings are not rival authored truth." | authored GTL programs |
| the same file, `:66-76` (LAWS-022) | requirement | "… Declaration content derived from ambient process state, runtime events, filesystem discovery, randomness, clock time, unstable iteration, or hidden defaults is drift; …" | authored GTL declarations |

### Canonical roots and the spelling of a root

| File and lines | Status of the document | Text | What it governs |
|---|---|---|---|
| `T/design/T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN.md:207-214` | "`W2-BL-C0/B04/correction-01` accepted and closed" (`:130`) | "`WorkspaceAuthorityBasis A.canonicalRoot` is the mutable source worksite admitted for the stable workspace identity; and `WorkspaceBinding W.roots.productRoot` is the immutable installed Program-owner Product root; … They are not aliases." | the two roots |
| the same file, `:248-258` and `:260-271` | as above | `R_protected` lists `W.roots.productRoot` and "every admitted ProductInstall.installedRoot". "After lexical normalization and no-symlink physical resolution through the nearest existing ancestor, a subject must be a strict descendant of `A.canonicalRoot` and must neither equal nor descend beneath any member of `R_protected`. … Alternate spelling, `.`/`..`, repeated separator, case/volume alias where applicable, hard-link alias of an existing file, symlink traversal, crossed root, or target/parent substitution visible to the owner's final pre-effect validation refuses before write." | worksite subjects and territories, not the Product root's own spelling. `product/worksite_operations.ts` realizes it with the system `realpath` (section 4) |
| the same file, `:724` | as above | "Installed payload conservation \| Inventory the complete owner Product before and after the successful worksite effect. \| Installed payload bytes, paths, node kinds, aliases, and digest remain exactly equal; Product delta is zero." | the file replace's conservation walks |
| the same file, `:726` | as above | "Alias confinement \| Try parent escape, alternate spelling, symlinked ancestor/target, hard-link alias, physical target outside `A.canonicalRoot`, and target/parent substitution visible at the final pre-effect validation. … \| Every substituted or confined locus visible at the final validation refuses before write; path-text containment is not sufficient. …" | worksite targets |
| `T/design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md:299-306` | accepted; completion open (`:7`) | "Original worksite subjects, source paths, declared cwd/report/module/selector/port-file paths, and authored write territories are canonical-root-relative. … Lexical alias, physical alias, hard link, symlink, crossed root, or nearest-existing-parent escape refuses." | worksite paths |
| the same file, `:312-315` | as above | "The complete installed owner Product is separately inventoried before and after execution and must have zero byte/path/node-kind/symlink-target delta. This retains `productRoot == installedRoot` as Program-owner identity while ending its use as the authored worksite root." | the parent's and the helper's Product walks |
| the same file, `:612-616` | as above | "All declared command cwd, report reads, module imports, report walks, and HTTP probes resolve their canonical-root-relative coordinates inside that snapshot mirror through canonical, no-symlink confinement. The helper inventories snapshot path/content/node-kind/symlink-target state before and after execution." | the sandbox walks and the report walk |
| the same file, `:629-632` | as above | "The helper separately inventories the admitted Program-owner install at `W.roots.productRoot == I_P.installedRoot` before and after and requires zero path/content/node-kind/symlink-target delta. Product delta rows can never cite snapshot write authority." | the helper's Product walk |
| the same file, `:899` and `:902` | as above | "Alias and protected roots \| Use lexical aliases, symlink ancestors, hard-link aliases, crossed roots, a target beneath a protected root, or a territory itself inside one. \| Host/helper refuses at the owning pre-effect seam; no snapshot command begins and no protected byte changes." and "Product conservation \| Inventory `W.roots.productRoot == I_P.installedRoot` around success and every refusal. \| Installed payload is byte/path/topology exact with zero Product delta." | the proof matrix |
| `specification/requirements/product/REQ-P-INSTALL.md:63-70` (REQ-P-INSTALL-008) | requirement | "A `WorkspaceAuthorityBasis` shall bind the stable workspace identity, canonical root locator, authority mode, and authority-bearing manifest and configuration refs and digests. One immutable `WorkspaceBinding` shall bind that authority basis to one exact verified installed-product set, resolved lock, selected toolchain root, product and package roots, and declared … root locations." | the worksite's "canonical root locator"; the Product root is just "declared" |
| `specification/requirements/abg/REQ-R-ABG3-BINDING.md:49` (REQ-R-ABG3-BINDING-016) | requirement | "… each of its declared roots are non-blank strings with no leading or trailing whitespace and no NUL character; a bind request that carries any other value is refused." | the only stated constraint on a declared root's spelling |
| `specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md:38-41` (REQ-P-PUBLIC-CONTRACTS-002) | requirement | "Paths shall be relative to the product root containing `product-toolchain-manifest.json` and shall not contain an absolute path, `..`, or symlink-dependent source locator." | paths inside the public contract catalog |

### The remaining hits

None of these defines a spelling or an order (all read).

**Paths placed beneath `A.canonicalRoot`, or roots compared.** Each places paths
beneath `A.canonicalRoot`, keeps them out of `W.roots.productRoot`, or compares
whole roots.

| File and lines | Text |
|---|---|
| `T287_W2_R3_C1_LIVE_LLM_WORKSITE_CONSTRUCTION_DESIGN.md:111-114` | "Their root-relative paths resolve under `A.canonicalRoot`; no target derives from `W.roots.productRoot`. The protected root and canonical no-alias/no-symlink law is exactly C0's `R_protected` relation …" |
| the same file, `:145-148` | "The installed Product remains the Program owner and must have zero byte/path/topology delta across C1. Within this selected C1 protocol, only C0 may alter worksite bytes beneath `A.canonicalRoot` …" |
| the same file, `:302-303` | "… targets beneath `A.canonicalRoot` and outside every protected root …" |
| the same file, `:600` | "crossed authority basis, workspace binding, canonical root, grant, subject, territory, or O0" |
| the same file, `:644`, `:647` | "With `A.canonicalRoot != W.roots.productRoot`, a task targeting `package.json` changes only `A.canonicalRoot/package.json` …"; "… any branch with a different full `A`, `W`, canonical root, or authority/body join makes aggregate admission refuse before the first branch." |
| the same file, `:705-707` | "… only C0 writes a declared target beneath `A.canonicalRoot`, and no actor changes any Product/toolchain/event/runtime-state/projection/archive root." |
| `T287_NATIVE_WORKSPACE_WORK_DESIGN.md:86-88` | "ABG's existing native host/transport runs at the exact `A.canonicalRoot` … Installed Product/runtime resources remain outside the granted worksite." |
| the same file, `:123`, `:316` | "… retires the affected earlier C0 current-observation facts at the same canonical root."; "… retire prior C0 current observations only inside W at the same canonical root …" |
| `T287_PENDING_CONSUMER_CONTINUATION_DESIGN.md:226` | "For an unchanged actual A, canonical root, actor and declared worksite meaning, …" |
| `T287_D2_REQUIREMENT_LIFECYCLE_DESIGN.md:476`, `:873` | "map their targets to current observations by exact canonical root/path, role and permitted territory"; "It preserves A/canonical root, subject URI and relative path, …" |
| `T287_D1_REQUIREMENT_LIFECYCLE_DESIGN.md:110-114` | "The context reader is a bounded extension of worksite observation, not a scanner service or new runtime entity. The owner checks canonical roots, protected install/runtime roots, symlinks and explicit limits; includes existing file bodies needed by declared roles; and records directory membership needed to interpret absence." It names the check but not the rule; the realization is `product/worksite_operations.ts:1145`, which uses the system `realpath` (section 4) |
| `T287_W2_R3_SINGLE_START_CONSTRUCTION_EXECUTION_DESIGN.md:253-257` | "Protect the six W roots and every installed Product root in that exact ProductSet; … Every mutable target stays beneath A.canonicalRoot. Inventory the Program and all exercised declaration/implementation installs before and after the run." |
| `T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN.md:55-57`, `:325-326`, `:399-401`, `:565`, `:670`, `:730`, `:780-782` | ancestors, subjects and territories "strict descendant of A.canonicalRoot"; "resolve the subject and territory canonically under `A.canonicalRoot`"; the refusal list item "a worksite subject, territory, observation, or source snapshot resolves from `W.roots.productRoot` instead of `A.canonicalRoot`" and "the Program-owner Product root differs from its admitted installed root" |
| `T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md:273-277`, `:481`, `:633`, `:897` | "All original protected subjects and observations resolve under `A.canonicalRoot`, never `W.roots.productRoot`." and the matching table row |

**The helper's environment.** `T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md:470-476`
says: "Declared child executable, argv, and environment values must not expose
`A.canonicalRoot` or any original WorkspaceBinding root or contain a parent path
segment. … The task records every inherited allowlisted environment value; no
undeclared process environment crosses the helper boundary."

- This governs the declared commands the helper starts.
- The design does not state the environment of the helper itself, which is what
  decides the helper's locale (section 2).

**File content, not path spelling.** Two passages concern the bytes of files:

- `T287_W2_R3_C1_LIVE_LLM_WORKSITE_CONSTRUCTION_DESIGN.md:372`: "it performs no
  Unicode normalization, trimming or newline …";
- `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:1422`: "no BOM, line-ending or
  Unicode normalization occurs".

**Requirement hits for "inventory" that concern other inventories.** None
concerns the order of file rows.

| File and lines | What it governs |
|---|---|
| `product/REQ-P-QUAL.md:260`, `:303`, `:394`, `:405` | fixed "Product inventory and release-claim bytes" of a candidate or release |
| `product/REQ-P-SELF-CONFORMANCE.md:42-44` (and `:65`, `:109-110`) | the frozen subject inventory of self-conformance |
| `abg/REQ-R-ABG3-INTERPRET.md:106-108`, `:133-134` | the GTL program inventory of whole-program validation and its report |
| `gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md:113-116`, `:218-220` (and `:24`, `:36`, `:94`, `:110`, `:288`, `:322`) | publication inventories |
| `gtl/REQ-L-GTL3-C-ALGEBRA.md:224-227` | coverage-contract inventories |
| `product/REQ-P-INSTALL.md:184` (REQ-P-INSTALL-022) | "copied file inventory or checksums" in the installer manifest, with no order stated |
| `mapping/REQ-M-GTL3-CAPABILITY.md:42` | "not inferred from filenames or test inventories" |
| `README.md:99` | "the forty-row conservation inventory", a qualification list |

Reading the tables together (read):

- The operative or accepted texts say three things:
  - the Product is inventoried before and after, with zero delta;
  - worksite paths refuse lexical, physical and, "where applicable", case
    aliases;
  - the one file inventory in the requirements is "lexicographically sorted",
    which the code realizes as code-unit order.
- Only a document that is proposed and not operative excludes `localeCompare`
  in words.
- The stored-spelling rule for a Product root is not stated anywhere. It
  follows from the C0 alias rule only for subjects beneath the worksite.

## 6. The options

### Order

**(a) Code-unit order at the walk.**

- **Source:**
  - `product/tree_inventory.ts:58` becomes
    `listed.sort((left, right) => compareUnicodeCodeUnits(left.name, right.name));`;
  - add `import { compareUnicodeCodeUnits } from "../shared/canonical_json.js";`;
  - reword the comment at `:40-42`.
- **Start-up cost:** none. The module already imports `../shared/digests.js`,
  which imports `canonical_json.js` (`tree_inventory.ts:5`; `shared/digests.ts:4-8`),
  and the helper imports `canonical_json.js` directly (`:34`). The helper's
  start-up graph gains no module (read).
- **What moves:**
  - the parent's digests and the file replace's rows, for any tree with mixed
    case, mixed punctuation or non-ASCII names; neither is recorded;
  - the helper's maps, which are not recorded.
- **Recorded values:** none move (read).
- **The catch:** the recorded delta and report-set lists stay as dependent on the
  locale as before. The helper re-sorts the delta at `:411` and walks report
  sets itself at `:885`.
- **Lanes:** TD-37c test 1 changes: `TREE` must list `B.txt` before `a.txt`, and
  the parent's digest, the file replace's rows and the helper's map follow.
  Tests 2 and 3 pass unchanged (run, `build-variant-a`).
- **What it protects:** the walk's rows become the same in every process, and
  ties between distinct names disappear. It protects nothing recorded.

**(b) The present order with an explicit fixed locale.**

- **Source:** `:58`, `:411` and `:885` pass a locale, for example
  `localeCompare(right, "en-US")`, or share one `new Intl.Collator("en-US")`.
- **What moves:** nothing, for any process whose default locale collates like
  en-US. Every recorded list is in that order (run, section 3). New Runs under
  sv or tr would then match old Runs.
- **Lanes:** none. The present lane passes under every locale I tried (run,
  section 6, the Writer notes).
- **What it protects:** continuity of row order with recorded Runs.
- **What it leaves:**
  - The order still depends on the ICU data and CLDR version of the Node that
    runs it. The two versions I ran agreed on this tree only (run); whether
    later CLDR versions change these rules is not checked.
  - Names that collate equal still fall back to `readdir` order: the soft
    hyphen, and the composed and decomposed `é`. Both tie under every locale I
    tried (run).
  - It keeps `localeCompare`. The proposed M05_S06 design excludes it, and the
    Product's one inventory requirement is realized without it (read,
    section 5).

**(c) The walk order kept; every value that leaves a process sorted by code
units.**

- **Source:**
  - `worksite_command_helper.ts:411` becomes `.sort(compareUnicodeCodeUnits)`;
  - `:885` becomes
    `entries.sort((left, right) => compareUnicodeCodeUnits(left.name, right.name))`;
  - add `compareUnicodeCodeUnits` to the existing `canonical_json.js` import
    (`:34`).

  Nothing else leaves a process: the parent's digest and the file replace's rows
  are compared in their own process (section 2).
- **Recorded values:** none change or stop validating (run, section 3).
- **What moves for new Runs:** delta rows and ordinals, report-set lists, and
  with them the artifact, observation and event digests, whenever the paths mix
  case, punctuation or non-ASCII. 113 of the 123 recorded deltas, and none of the
  65 report-set lists, would have come out in another order (run).
- **Lanes:** TD-37c test 2 changes. Its delta comes out as `B.txt`, `a.txt`,
  `dir/created.txt`, `link-file`, with ordinals 0 to 3. Tests 1 and 3 pass
  unchanged (run, `build-variant-c`).
- **What it protects:** every recorded order becomes independent of the locale,
  the ICU version and the filesystem's `readdir` order.
- **What it leaves:** the walk itself still depends on the locale. That is
  harmless today, because its comparisons stay within one process. But its rows
  differ between processes, and any later consumer that records them inherits
  the dependence.

**The trap.** Changing `:58` alone, which is what "code-unit order at the walk"
says, moves no recorded value and makes no recorded value independent of the
locale (read). The values that are recorded come from `:411` and `:885`.

**(a) and (c) together, run.** `build-variant` makes all three comparators
code-unit order. I ran the locale tree under no locale variable, `LANG` and
`LC_ALL` set to `en_US.UTF-8`, `sv_SE.UTF-8` and `tr_TR.UTF-8`, on both binaries
(run). Every process gave:

| Value | Result |
|---|---|
| Parent digest | `d469075e87c7…`, the code-unit digest of section 1 |
| Delta digest | `6d85ae5bc4d9…` |
| Report-walk digest | `95c94c72be87…` |
| Walk order | the code-unit column of section 1 |
| Synchronous and asynchronous walks | equal |
| File replace rows and helper map | in walk order |

### Root rule

**(d) One rule: the stored spelling.**

- **Source:** `tree_inventory.ts:88` becomes
  `case "realpath": return realpathSync.native(step.path);`.
  - `realpathSync.native` calls the operating system's `realpath` and returns the
    stored spelling, as `fs/promises` `realpath` does (run, the root-rule table).
  - The comment at `:27-30` stays true.
- **Reach:**
  - The only synchronous caller of the walk is the parent
    (`implementation/worksite_command_execution.ts:44`, `:302`); the file replace
    and the helper call `walkTree` (run, `git grep`).
  - The parent's other `realpathSync` checks (`:219`, `:246`, `:259`, `:275`,
    `:369`) are not the walk's root rule, and TD-81 does not name them.
  - Those checks keep admitting case variants of the archive root, of protected
    subjects and of declared paths. The worksite root is always in stored
    spelling anyway (section 4).
- **What moves:**
  - No recorded value: the walk records no root, and every recorded root is in
    stored spelling (run, section 4).
  - Behaviour: a Product root in another case or normalization form is refused
    by the parent's before-walk with "installed Product root must remain
    canonical". The walk runs while the call is prepared (`:529-531`), before the
    manifests are written (`:533`) and before the Worker request is returned
    (`:534-549`) (read).
- **Lanes:** none of the present lanes change. TD-37c test 3 uses only spellings
  that all three sites already refuse, and all three TD-37c tests pass on
  `build-variant-d` (run).
- **The 13 spellings again:** on `build-variant`, all three sites give the same
  verdict for every one of them (run, `probe/root-rule-variant.mjs`):
  - admitted: the stored spelling, the composed name given composed, and the
    firmlink spelling;
  - refused: the other ten. The parent's refusal is "installed Product root must
    remain canonical".
- **What it protects:**
  - the three sites agree on every root;
  - a non-canonical Product root is refused before a Worker call is spent,
    instead of after it as `helper_artifact_absent`.

**(e) The parent's rule stated as it is.**

- **Source:** text only, in the comment at `tree_inventory.ts:27-30`, in the
  TD-37c lane, and in the C2 design if the Executive wants it there. The text
  would say: the parent admits a root in another case or normalization form;
  the file replace and the helper refuse it.
- **What moves:** nothing.
- **Lanes:** none, or one lane that pins the difference.
- **What it protects:** nothing. A case-variant root keeps failing late, after
  the Worker call.

### Recommendation

**Order: (a) and (c) together.** The comparator at `tree_inventory.ts:58`,
`worksite_command_helper.ts:411` and `:885` becomes `compareUnicodeCodeUnits`,
and the comment at `tree_inventory.ts:40-42` changes with it.

The reason is that the register's condition holds: no recorded value pins the
present order.

- Recorded rows are read back and validated in recorded order (read). The
  Product's reader accepts the recorded en-US order and the code-unit order of
  the same rows alike (run, section 3).
- `isPathDelta` checks only that each ordinal equals its index (read).
- The only pins are the TD-37c lane's two order pins, which state the present
  realization (run: `git grep`; and the lane on the changed copies).
- The change matches the tenant's comparator, with 138 uses (run: `git grep`),
  and the realization of the one requirement that orders a file inventory,
  `payloadInventoryDigest` (read).

Change class: realization_refactor.

- No stored value changes or stops validating (run, section 3).
- New Runs order mixed-case rows differently from old Runs over the same tree
  (run, section 3).

**Root: (d), `realpathSync.native` at `tree_inventory.ts:88`.** The reasons:

- The stored spelling is already the rule of the file replace and the helper
  (run, section 4), of the worksite operations' `aliased_subject` refusal, and
  of workspace create and open (read).
- It moves no recorded value (run, section 4).
- It moves the refusal ahead of the Worker call (read). It does not add a new
  kind of outcome. The parent's before-walk at `:529-531` already refuses, in
  the same function and at the same point, a Product root reached through a
  symlinked ancestor (run, section 4). Option (d) widens that existing refusal
  to roots in another letter case or normalization form.

For the Writer:

- **Do not add a sortedness check** to `isPathDelta` or to the observation
  reader. It would refuse the 113 recorded artifacts whose deltas are in en-US
  order, and that would make this a design decision.
- **The closure lane needs child processes.** It must start child processes with
  `LC_ALL` set to `sv_SE.UTF-8` and to `tr_TR.UTF-8`, and compare their rows and
  digests with a child that has no locale variable.
  - The default locale is fixed when a process starts, so setting `process.env`
    inside the lane's own process proves nothing (run, section 1).
  - Its tree needs names that the locales order differently: `å`, `ä`, `ö`,
    `ı`, capital and small `I`/`i`, capitals beside small letters, and
    punctuation.
  - The present `TREE` has none of `å`, `ä`, `ö`, `ı` or a capital `I`, so it
    orders the same under en, sv and tr. The present lane cannot see the locale:
    it passes 3 of 3 on the present build under no locale variable, under
    `LANG=sv_SE.UTF-8` and under `LC_ALL=tr_TR.UTF-8` (run).
- **The same lane should give all three sites one root in another letter case**
  and expect a refusal from each.

### What I am unsure of

- **Other platforms.** I ran only macOS on APFS, with two Node 24 builds that
  carry full ICU (run). I did not run:
  - Linux;
  - a case-sensitive volume;
  - a small-ICU build;
  - another CLDR version.

  On a case-sensitive volume, the two `realpath` functions should agree; not
  run.
- **The Worker's shell tool.** I did not check whether the Worker CLIs pass
  `LANG` and `LC_*` to their shell tool unchanged, or whether a shell profile
  sets them (not checked).
- **Whether a new Run's order counts as a recorded value moving.** My reading is
  that it does not.
  - Nothing stored changes (run, section 3).
  - Nothing compares a new Run's rows with an old Run's (read, section 2).
- **The 27 other `realpathSync(x) !== x` checks.** Whether any of them can see a
  root in a non-stored spelling is not traced. That would be a separate entry.

## 7. What I did not check

- **A door-level run** with a case-variant or decomposed-form target root. The
  sequence would be: `product.install`, `workspace.bind`, a C2 call and a file
  replace. Section 4's door claims are read.
- **The archive root in another case** at the parent's archive check and at the
  helper. This is read only.
- **Protected-root containment** under a non-stored spelling of a protected
  root:
  - the C0 check of `R_protected` in `product/worksite_operations.ts`;
  - the parent's containment check at
    `implementation/worksite_command_execution.ts:326`.

  In the paths I traced, the helper's or the file replace's root refusal stops
  such a call before an effect (read).
- **Event logs.** I searched one recorded log for delta rows. I did not search
  every log, and I did not search recorded results for the post-effect message
  "post-publication installed Product conservation unverified".
- **Filesystems that store both forms.** I did not try composed and decomposed
  forms of one name as two entries of a directory. APFS does not allow it.
- **Adjacent `localeCompare` sites outside TD-81:**
  - `scripts/generate-product-manifest.mjs:1000`, which sorts module refs that
    feed the Product's identity;
  - `validator/qualification.ts:156`, `:159`;
  - `validator/qualification_resources.ts:267`;
  - `abg/worker_transport.ts:962`;
  - `implementation/release_publication.ts:44`, `:85`;
  - the `declared_inventory` sorts in several lanes.
- **The full test suite.** I ran only the TD-37c lane against the changed
  builds. Every other lane that reaches the helper needs an install, and I did
  not run it.
- **The 87 refusals.** I did not trace why the present reader refuses 87 of the
  161 recorded artifacts that have a task file. Of the 87, 13 are under the
  evidence root and the rest under `test_runs`, and 25 hold fewer than two
  delta rows. The changed builds alter neither this count nor the reader.

## Scratch

Neither scratch directory was deleted (run, `du -sh`):

| Directory | Size |
|---|---|
| `/private/tmp/abg-td81-work` | 308 MB, including the four changed copies of the build |
| `/private/tmp/abg-td81-tmp` | 1.8 MB |
