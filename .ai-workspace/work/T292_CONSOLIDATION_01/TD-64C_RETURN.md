# TD-64C Return: constitution history move

**Status:** cut, by the second Writer under the Executive's ruling (option 1). Sections 5.6.2, 5.6.2A, 5.6.2B, 5.6.4 and 15 (1,265 lines) are verbatim in `T/design/history/ABI5_REALIZATION_CONSTITUTION__RETIRED_SECTIONS.md`. Each keeps its heading in the constitution with one pointer paragraph. Section 5.6.3 stays whole, and record 16.16 is added. The constitution goes from 4,456 to 3,251 lines. All checks pass, and nothing needs a ruling.

**First Writer's status:** stopped before cutting. A hand-back condition holds: section 5.6.3 is cited from outside the constitution as authority. 0 lines moved. The constitution and `T/design` are unchanged, and this Return is the only file on the branch. The branch is `claude/td64c-constitution-history` in `/private/tmp/abg-td64c`, from `675b5e90f`. Nothing was cut.

`T` is `build_tenants/abiogenesis/typescript`. Change class: `design_reframe` with no realization change, as planned.

## Completion after the Executive's ruling

### Ruling

The Executive chose option 1. Section 5.6.3 stays whole and unedited. Its Table 5.6.3-B rows `N01` to `N13` are catalog law: the common-library design uses them, and record 16.14 amends them. The other five sections move. Splitting 5.6.3, or moving its rows into Section 10, is not part of this package.

### Rule 3 re-verification

`refs.py` and `idents.py` were re-run with 5.6.3 counted as kept text (`refs5.py`, `idents5.py`), and `terms5.py` was added. Every reference from kept text into a moved section is evidence, provenance or supersession. No moved section is a dependency. Line numbers are at `675b5e90f`.

| Moved section | Kept references | Role |
|---|---|---|
| 5.6.2 | 681; 1852; 3026; 4237; 4292 | 681 is the stale pointer noted below the first table; 3026 is evidence on evidence; the rest are supersession |
| 5.6.2A | 1852; 2248; 3150 (term); 4292 | supersession |
| 5.6.2B | 1852; 2424; 2909-2914; 2958-2962; 4258, 4261, 4276; 4292-4293 | supersession, evidence and provenance; see the two additions below |
| 5.6.4 | 2432; 2498; 2980; 3022-3026; 3148; T-287 4704, 4718 | evidence; T-287 is provenance under its retained-history preface at line 4694 |
| 15 | 4311; 4401 | provenance |

The first Writer's fallback table did not list two passages in kept 5.6.3. Both are evidence on evidence:

- **2909-2914.** Table 5.6.3-D maps its slot classes onto 5.6.2B's `T0`-`T9` forms ("`V = T0`, `C[S] = T1`, …"). The 5.6.3 banner (2432), 5.6.2C line 2424 ("the former `T0-T9` forms remain classification, conservation, trace, and proof maps only") and 16.7 (4293) make those forms evidence.
- **2958-2962.** These lines use 5.6.2B's intrinsic arm digest and family digest: "D6 must fail construction if a loaded binding omits or adds a slot …". Line 3149-3150 says "No C1F, C2, D6, `PublicExecutionCandidate`, topology-arm, or generic provider stage retains implementation or advancement authority."

Three further checks found no dependency:

- **Table 5.6.3-B (2561-2685).** It shares no backticked term with the moved text except `3.22.1` and the leaf identifiers `X02` and `X04`, which the table defines itself. `N13`'s "installed definition family" is Section 9's term (line 3481).
- **3022-3026.** These lines define `bindingKind` `static_composition` as calling the leaves "in the fixed expression order in Section 5.6.4". `static_composition` does not occur in `T/code`, `T/contracts`, `T/scripts` or `T/test_env`. The test files that match `bindingKind` name an unrelated destructured `kind` field. Kept Tables 5.6.3-A and 5.6.3-C state the expressions and their ordered traces.
- **Section 15.** Section 5.6.5 restates the W2-05 partition itself (3183-3200, "`11 + 2 + 5 + 1 = 19`"), so the moved Section 15 is a duplicate record.

### What moved

| Section | Range at `675b5e90f` | Lines | Heading now at | Lines in the retired file |
|---|---|---:|---:|---|
| 5.6.2 Installed definition-binding ABI | 707-1018 | 312 | 707 | 3-314 |
| 5.6.2A Canonical resource-transition algebra | 1019-1612 | 594 | 716 | 315-908 |
| 5.6.2B Intrinsic topology and installed-binding identity | 1613-1849 | 237 | 726 | 909-1145 |
| 5.6.4 Exact 56-key functional factorization map | 3077-3145 | 69 | 1963 | 1146-1214 |
| 15. Pre-Baseline ABIogenesis Application (Historical Selection) | 4086-4138 | 53 | 2913 | 1215-1267 |
| total | | 1,265 | | |

- **Subsection headings.** None of the five ranges has one, so only the five section headings stay.
- **Retired file.** It has 1,267 lines. Line 1 is its first paragraph: "Cut from `build_tenants/abiogenesis/typescript/design/ABI5_REALIZATION_CONSTITUTION.md` at commit `675b5e90f`, lines 707-1018 (Section 5.6.2), 1019-1612 (Section 5.6.2A), 1613-1849 (Section 5.6.2B), 3077-3145 (Section 5.6.4), 4086-4138 (Section 15), verbatim. Relative links inside the moved text resolve against the pre-move layout and are not repaired." Line 2 is blank, and lines 3 onward are the ranges in order with nothing between them.
- **Links in the moved text.** It contains none.
- **Constitution length.** It goes from 4,456 lines to 3,240 after the move: 1,265 lines leave and 49 come in, which are the five heading, pointer and blank-line blocks. It reaches 3,251 with record 16.16, which adds 11 lines: one blank line and the ten record lines starting at line 3242.

### Pointer paragraphs as written

```markdown
#### 5.6.2 Installed definition-binding ABI

This subsection specified the `PublicExecutionCandidate` execution carrier,
resource-topology arms, generic providers and installed-binding construction.
Section 16.7 supersedes it in full as implementation authority; Section 5.6.2C
is the sole operative installed definition-binding law. Its text is historical
classification and constructability evidence. Section 16.16 moves it to
[design history](history/ABI5_REALIZATION_CONSTITUTION__RETIRED_SECTIONS.md#562-installed-definition-binding-abi).

#### 5.6.2A Canonical resource-transition algebra

This subsection specified the closed canonical resource-topology arm family of
each definition in the 18-operation/56-key family, with its resource forms,
provider relations and transition carriers. Section 16.7 supersedes it in full
as implementation authority; Section 5.6.2C replaces its implementation
interpretation. Its text is evidence about owner effects and durability
boundaries only. Section 16.16 moves it to
[design history](history/ABI5_REALIZATION_CONSTITUTION__RETIRED_SECTIONS.md#562a-canonical-resource-transition-algebra).

#### 5.6.2B Intrinsic topology and installed-binding identity

This subsection defined the reusable topology forms `T0-T9` and the
family/arm/load identities over the fixed 18/56 census. Section 16.7 supersedes
it in full as implementation authority; Section 5.6.2C replaces it for
implementation. The `T0-T9` forms remain a historical proof partition, which
Table 5.6.3-D and Sections 5.6.2C and 16.7 cite as evidence. Section 16.16
moves its text to
[design history](history/ABI5_REALIZATION_CONSTITUTION__RETIRED_SECTIONS.md#562b-intrinsic-topology-and-installed-binding-identity).

#### 5.6.4 Exact 56-key functional factorization map

This subsection mapped each of the 56 exact definition keys to its entity and
class, canonical operator expression, semantic owners and static composition,
and the callable loci and effect gaps of that time. Sections 5.6.3 and 5.6.5
name it classification and proof evidence; its map cannot select runtime
carrier types, combinators, wrapper bodies or construction budgets. Section
16.16 moves its text to
[design history](history/ABI5_REALIZATION_CONSTITUTION__RETIRED_SECTIONS.md#564-exact-56-key-functional-factorization-map).

## 15. Pre-Baseline ABIogenesis Application (Historical Selection)

This section recorded the earlier W2-05 selection: the Wave 1 frozen artifact
and interface receipt, the Wave 2 binding disposition of the 56 definitions and
a construction order under Section 5.6.2C. Its selection and advancement
language is non-operative and grants no implementation, repair, acceptance or
release effect; Section 16.13 classifies it as non-operative history. Section
16.16 moves its text to
[design history](history/ABI5_REALIZATION_CONSTITUTION__RETIRED_SECTIONS.md#15-pre-baseline-abiogenesis-application-historical-selection).
```

### Record 16.16 as written

```markdown
### 16.16 T-292 Design-History Retirement Record

| Field | Record |
|---|---|
| **reason** | Historical and superseded text leaves the operative surface (T-292, register entry TD-64). Sections 5.6.2, 5.6.2A and 5.6.2B are superseded by their own banners and Section 16.7; Section 5.6.4 is classification and proof evidence by Sections 5.6.3 and 5.6.5; Section 15 is non-operative history by its own banner and Section 16.13. |
| **upstream basis** | The workspace method: active surfaces stay present tense, and historical material belongs in design history. |
| **superseded clause** | None. No clause changes. |
| **affected catalog/entity rows** | None. |
| **migration consequence** | The five sections' headings remain in place, each with a pointer; their text (1,265 lines) is in `history/ABI5_REALIZATION_CONSTITUTION__RETIRED_SECTIONS.md`. References by number and anchor resolve as before. |
| **change class** | `design_reframe` of this surface's text only. Product, requirements, entities, catalog, stack and method selection are unchanged. |
```

Two changes from the proposal keep it exact:

- **reason.** The proposal said all five sections are superseded or evidence-only "by their own banners and Sections 16.7 and 16.13". 5.6.4 has no banner; its status comes from the 5.6.3 banner (2432) and from 5.6.5 (3148). The reason now names the source of each section's status.
- **migration consequence.** It gains the line count.

Section 16's body is unchanged. Its sentence on Sections 16.1 through 16.12 stays true.

### Other files

- **`T/design/history/README.md`.** The "Retired sections" list goes from 5 entries to 26: every `__RETIRED_SECTIONS.md` file in `history/`, including the new one. The five existing entries are unchanged and the list stays in alphabetical order. Each source note is a live note in `T/design`. Nothing else in the file changes.
- **`T/design/README.md`.** Unchanged. Its line 8 ("local realization authority: module and owner tables, technology stack, common-library catalog, amendment rule") is still true.
- **Mirrors.** No mirror was edited.
  - `T/test_env/qualification/inventory.json` member 505 pins the constitution at `sha256:68577ff6…`, 391,566 bytes. The base bytes already differed from that pin: `sha256:43ce5cca…`, 396,214 bytes. The constitution's bytes change again in this package, to `sha256:6df35a30…`, 321,797 bytes.
  - `recipe/verification-recipe.json` names the constitution by path at line 1698.
  - Neither mirror lists the history README or any `__RETIRED_SECTIONS.md` file.

### Checks after the cut

**Script check** (`verify.py --with-record`, 36 of 36 pass). It reads the original from `git show 675b5e90f:…` and checks:

- the retired file's line 1;
- the retired file's body against the original lines of the five ranges;
- the constitution as the original with each range replaced by heading, blank line, one paragraph and blank line, and record 16.16 appended. The `difflib` opcodes are the five replacements plus one insert at the end;
- that the heading list is the original 82 headings plus 16.16;
- that each pointer link names the retired file and a heading slug in it;
- that each moved section's number has exactly one heading.

`cut.py` builds the files, and `verify.py` checks them independently.

**Anchors** (`anchors.py HEAD`).

- Totals: 932 anchor links into the constitution, 0 unresolved.
- The two above the base 930 are this Return's quotations of the library design's `#table-563-b---selected-leaf-instance-catalog` links. The set of anchor links from every other file is unchanged.
- The constitution has 0 in-file anchor links.
- The five pointer links resolve to the retired file's heading slugs.
- Every "Section N", "§N" or "N.N.N" reference to a moved section names a heading that is still present.

**Link check** (`linkcheck.py --all`). No new dangling link.

| Scope and form | Before | After |
|---|---|---|
| design-live rel | 491, 39 dangling | 496, 39 dangling (the five pointer links) |
| design-live repo | 37, 1 dangling | 37, 1 dangling |
| design-hist rel | 876, 186 dangling | 918, 186 dangling (21 new README entries, two links each) |
| design-hist bare | 133, 103 dangling | 134, 103 dangling (the retired file's line 1) |
| all other scopes | unchanged | unchanged |

**Realization diff.** `git diff --stat 675b5e90f -- T/code T/contracts T/scripts T/test_env T/package.json T/product-toolchain-manifest.json specification` is empty. `git diff --stat 675b5e90f` lists four files: the constitution, the retired file, the history README and this Return.

### Commits

| Commit | Content |
|---|---|
| `c1eb397e4` | move: constitution pointers and the retired file |
| `f88a5a9a0` | record 16.16 |
| `8afe96fff` | history README list |
| this Return | last |

The pointers at `c1eb397e4` cite Section 16.16, which `f88a5a9a0` adds.

### Residuals

- **Line 681** (unchanged, still 681). 5.6.1A law 3 names "5.6.2" where its operative referent is 5.6.2C. It now resolves to the 5.6.2 pointer, which names 5.6.2C.
- **The 5.6.3 banner** (now line 1318). It still calls 5.6.5 "non-executable classification and proof evidence".
- **History README line 5.** It still says the `__RETIRED_SECTIONS.md` files come from "five kept notes in commit `4e405ff08`". Rule 6 limits the edit to the list, so the line was not changed.
- **Inventory digest.** The constitution's pin was stale before this package and is stale after it. Refreshing it belongs to qualification. No retired-section file is an inventory member.
- **Carried from the first Writer:** the TD-64R map errors and the `E22` label.

## Why the package stopped

The second stop condition of the brief holds for 5.6.3: "a moved section turns out to be cited from outside the constitution as authority". Its Table 5.6.3-B holds the neutral-mechanic rows `N01` to `N13`. Those rows are live catalog relations: a kept note and kept record 16.14 state their rules against them, and the owner keeps the rows current.

The TD-64R map records "external none" for 5.6.3. It missed this for three reasons:

- it searched only heading levels 2 to 4, so the level-5 anchor `#table-563-b---selected-leaf-instance-catalog` was not searched;
- it did not search for the `N` codes;
- it counted a bare number only when "§" or "Section" came before it.

### The citing passages

`T/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md` is a kept, active note.

- Line 681 (§10.7 Catalog disposition): "Each function this design adds or moves declares one disposition under [constitution §10.2](…), against the relations of the [§10 catalog](…) and the neutral mechanics of [Table 5.6.3-B](ABI5_REALIZATION_CONSTITUTION.md#table-563-b---selected-leaf-instance-catalog)."
- Line 688: "| `admitJson`, `admitContract`, `admitRef`, `isRecord`, `hasExactKeys` | `catalog_extension` | strict schema and I-JSON admission (`N05`) |"
- Line 695: "| `hasConfirmedOwnedProcessBoundary`, `classifyOwnedProcessTerminal`, `encodeOwnedProcessFacts` | `catalog_addition_proposal` | none: subprocess mechanics (`N11`) stay with their owners |"
- Line 63: "The location `product/exact_match.ts` that [constitution §10](…) and [Table 5.6.3-B](ABI5_REALIZATION_CONSTITUTION.md#table-563-b---selected-leaf-instance-catalog) row `N06` give for exact-match cardinality is a realization coordinate, …"
- Lines 685 to 690 and 699 also key dispositions to `N01`, `N02`, `N04` and `N06`.

The constitution's kept record 16.14 says:

- Line 4417, **superseded clause**: "(a) The location `product/exact_match.ts` in Table 5.6.3-B row `N06` and in the Section 10 exact-match cardinality row; both now read `shared/select/exact_match.ts`."
- Line 4418, **affected catalog/entity rows**: "(a) Table 5.6.3-B `N06`; Section 10 exact-match cardinality. (b) … `admitJson`, `admitContract`, `admitRef`, `isRecord`, `hasExactKeys`: `catalog_extension` of `N05`, row 2; … `catalog_addition_proposal`, no relation (`N11` stays with its owners), row 6 …"

### The cited content

The cited rows are in Table 5.6.3-B (constitution lines 2588 to 2604):

- 2588: "The neutral mechanic identifiers used in the ordered traces are exact:"
- 2596: "| `N05` | strict schema and I-JSON admission | owner Valibot schemas, `shared/i_json.ts::admitIJsonValue` and the admission atoms of `shared/admit/` (`admitJson`, `admitContract`, `admitRef`, `isRecord`, `hasExactKeys`; the library design's §10.7 catalog extension) |"
- 2597: "| `N06` | multiplicity-preserving exact-match cardinality | `shared/select/exact_match.ts` |"
- 2602: "| `N11` | subprocess and installed-module loading | current installed Product loader/transport mechanics |"

The rows are not restated anywhere else. Section 10's catalog table (lines 3527 to 3539) has rows for canonical serialization, digest, immutable carrier and exact-match cardinality. It has no row for strict schema and I-JSON admission (`N05`), and none for subprocess and installed-module loading (`N11`). The `catalog_extension` of `N05` therefore extends a relation that exists only in Table 5.6.3-B.

The owner maintains these rows as current catalog law. Blame dates:

- `N06`: 2026-10-22 (`69132360f`, the 16.14 move);
- `N05`: 2026-10-28 (`0e06b3e4f`, "the library design's §10.7 catalog extension");
- `N13`: 2026-11-10 (`db9cf974a`, the 16.15 correction).

The library design is the only file outside the constitution that cites a moved section's anchor. Its two links resolve today (0 of 930 anchor links are unresolved). Ruling 3 would keep them resolving to a kept heading. The content they cite, however, is authority and would leave the operative surface.

## Per section

Line ranges were checked at `675b5e90f`. The file is byte-equal to `39d6cb975` (`git diff` is empty), and the headings start at the map's lines.

| Section | Range | Lines | Disposition | Reason |
|---|---|---|---|---|
| 5.6.2 Installed definition-binding ABI | 707-1018 | 312 | not moved; clean | only supersession citations; line 681 is a stale pointer (below) |
| 5.6.2A Canonical resource-transition algebra | 1019-1612 | 594 | not moved; clean | only supersession citations |
| 5.6.2B Intrinsic topology and installed-binding identity | 1613-1849 | 237 | not moved; clean | supersession and evidence citations (`T0-T9`) |
| 5.6.3 Orthogonal factorization evidence | 2430-3076 | 647 | not moved; dependency | Table 5.6.3-B `N01`-`N13` is live catalog law cited by the library design §10.7 and by 16.14 |
| 5.6.4 Exact 56-key functional factorization map | 3077-3145 | 69 | not moved; clean | evidence citations only; T-287 cites it under a retained-history preface |
| 15 Pre-Baseline ABIogenesis Application (Historical Selection) | 4086-4138 | 53 | not moved; clean | provenance citations only (16.8, 16.13) |

The six sections total 1,912 lines; the five clean ones total 1,265.

## References checked under ruling 5

Roles: **evidence** (cites the section as evidence or as a classification label), **provenance** (a record of what was done to or with it), **supersession** (names it as the superseded or earlier form), **dependency** (needs its content to state a kept rule).

### Inside the constitution: kept text into a moved section

| Line | Kept section | Cites | Citing text | Role |
|---|---|---|---|---|
| 681 | 5.6.1A law 3 | 5.6.2 | "the exact explicit admitted call inputs, verified preimages/resource bindings, owner receipts, and successor handoffs required by 5.6.2 derive next work, currentness, continuation, and terminal truth" | supersession: a stale pointer, see the note after this table |
| 1852 | 5.6.2C | 5.6.2, 5.6.2A, 5.6.2B | "This subsection supersedes 5.6.2, 5.6.2A, and 5.6.2B as implementation authority while conserving their fixed external census, owner classification, …" | supersession |
| 2248 | 5.6.2C | 5.6.2A | "the operative 5.6.2C refinement of the earlier 5.6.2A/16.6 `CapabilityGrantCoordinate` … The earlier text is historical shape evidence, not another admissible ABI." | supersession |
| 2380-2394 | 5.6.2C | Tables 5.6.3-A/B/B2 labels `E33`, `L53`-`L56`, `R33` | "existing ABG L53 exact-current-basis projection … -> Product L54 decision over { basis, responseKind, choice, value, evidence } -> existing ABG L55 … -> existing ABG L56 … -> Product R33 indexed interaction outcome" | evidence: each label is glossed in place; the `R33` refusal union is owned by `T/contracts/schemas/operations/interaction/respond/refusal.schema.json` and `product/interaction_operation_contracts.ts`; line 2424 declares the tables maps only |
| 2424 | 5.6.2C | 5.6.3 tables, 5.6.2B `T0-T9` | "The `E01-E40`, `L`, `J`, `R`, and `X` tables and the former `T0-T9` forms remain classification, conservation, trace, and proof maps only." | evidence |
| 3148 | 5.6.5 | 5.6.3, 5.6.4 | "Sections 5.6.3-5.6.4 remain classification and proof evidence." | evidence |
| 3150 | 5.6.5 | 5.6.2A term | "No C1F, C2, D6, `PublicExecutionCandidate`, topology-arm, or generic provider stage retains implementation or advancement authority." | supersession |
| 3191, 3231, 3314 | 5.6.5, 5.6.5A | label `E33` | "non-callable E33 definitions"; "E33 carriers are incomplete"; "one E33 kernel plus five frozen packets" | evidence (5.6.2C states the family) |
| 4188, 4190 | 16.2 (historical) | Tables 5.6.3-A to D, `R01-R40` | "Table 5.6.3-A supplies the exact 40-class membership relation; Tables 5.6.3-B/B2/C/D supply …" | provenance |
| 4211, 4219 | 16.3 (historical) | `E01-E40`, `L01-L65`, `J01-J08`, `R01-R40`, `X01-X04` | "External membership remains exactly 18 operations and 56 keys; …" | provenance |
| 4237 | 16.4 (rejected) | 5.6.2 | "Supersedes Section 5.6.2's unary `ExactDefinitionCallable<K>(PublicInvocation<K>)` execution carrier; …" | supersession |
| 4258, 4261, 4276 | 16.5, 16.6 (rejected) | Tables 5.6.3-A/D, `T0-T9` | "Table 5.6.3-D joins the exact Table 5.6.3-A membership to shared `T0-T9` forms." | provenance |
| 4292 | 16.7 | 5.6.2, 5.6.2A, 5.6.2B | "Sections 5.6.2, 5.6.2A, and 5.6.2B are superseded in full as implementation authority." | supersession |
| 4293 | 16.7 | `E01-E40`, `T0-T9` | "… E01-E40/L/J/R/X classifications, T0-T9 proof partition, and legacy exclusion target remain evidence." | evidence |
| 4311 | 16.8 | 15 | "Section 15 corrects the stale `HEAD e7e252ed` wording and records the rejected `bf193b3d` subject." | provenance |
| 4401 | 16.13 | 15 | "Sections 15 and 16.1 through 16.12 preserve earlier selections, judgments and exact evidence as non-operative history." | provenance |
| 4417-4418 | 16.14 | Table 5.6.3-B `N01`-`N11` | quoted above | **dependency** |
| 4437 | 16.15 | 5.6.3 | "including derivative readings of Sections 5.6.2C, 5.6.3 and 16.2-16.7. Their original historical decision records remain evidence" | supersession and evidence |

**Line 681.** It was written on 2026-08-15, before 5.6.2C (2026-08-20). The things it names are now stated by 5.6.2C:

- call resources: `DefinitionCall.resources`;
- receipts: `DefinitionReturn.resources` and the strict receipt contracts;
- successor handoffs: `bindExactPrefixTransition` and the recursive child successors at lines 2373 to 2378.

5.6.2's own banner says "Section 5.6.2C is the sole operative installed definition-binding law", and 16.7 supersedes 5.6.2 in full. The sentence states its own items and does not need 5.6.2's text. Its number is stale; see the residuals.

**Search method.** I searched the kept text for section numbers (5.6.2 but not 5.6.2C, 5.6.2A, 5.6.2B, 5.6.3, 5.6.4, Section 15), table names, the `E`, `L`, `J`, `R`, `X`, `N`, `T` and `NF-` codes, `O_K` and `PFC-F0x`. I also searched for every backticked term of the moved text that appears in operative ranges. That surfaced `PublicInvocation<K>` at line 360, which is a code type, and line 3150, listed above. The constitution has no in-file `(#…)` links.

### Outside the constitution

| Source | Cites | Role |
|---|---|---|
| `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`:63, 681 (anchor links); 685-690, 695, 699 (`N` codes) | Table 5.6.3-B | **dependency** (authority) |
| `T-287-deliver-abiogenesis-5-feature-waves.md`:4704, 4718 | "constitution 5.6.2C/5.6.4"; "The bounded design reference is `ABI5_REALIZATION_CONSTITUTION.md` 5.6.2C/5.6.4" | provenance: the block sits under "The following original baseline scopes and earlier pending/unactivated statements are retained history. They grant no new work and do not override the current accepted disposition above." |
| `T/code/src/product/verification_definition_bindings.ts`:111, 118, 162 | label `E22` in fault messages | evidence label; the code does not read the file |
| `T/test_env/tests/t287-st2a-g-capability-definition-graph.test.mjs`:257 | 16.11 (kept) | a comment; the test does not read the file |
| `specification/`, `T/scripts`, `T/test_env` (other), active tickets (other) | none into a moved section | - |

### Under the fallback: kept 5.6.3 into 5.6.4 and 5.6.2

If 5.6.3 stays whole, these lines become kept text that cites a moved section. Each is evidence citing evidence, and each would resolve to a kept heading with its pointer.

| Line | Citing text | Role |
|---|---|---|
| 2432 | "this section and Sections 5.6.4-5.6.5 are non-executable classification and proof evidence" | evidence |
| 2498 | "`operation/member` abbreviates the exact `abg.operation.<operation>#<member>` key used in Section 5.6.4" | evidence; the key form is stated in place |
| 2980 | "only rows marked `C2-pending` or incomplete in Section 5.6.4 require a realization join or missing leaf" | evidence on evidence |
| 3025-3026 | "calls the closed leaves in the fixed expression order in Section 5.6.4. Every installed coordinate ultimately exposes the closed Effect ABI in Section 5.6.2." | evidence on evidence; the ABI is 5.6.2C's |

## Options for the Executive

1. **Keep 5.6.3 whole and move the other five** (1,265 lines). Apply rulings 3 to 6 unchanged with five pointer paragraphs. No kept rule depends on the five. The proposed record 16.16 is below.
2. **Split 5.6.3.** Keep its heading and the Table 5.6.3-B heading in place with the `N01`-`N13` table. That is lines 2588 to 2604, 17 lines, whose lead sentence names "the ordered traces" of Table 5.6.3-C. The rest (about 628 lines) moves. This changes a section's structure beyond rulings 3 and 4.
3. **Move the `N` rows into Section 10's catalog, then move all of 5.6.3.** This rewords catalog law, which ruling 7 excludes. It needs its own `design_reframe` amendment, and the library design's links would be re-pointed (outside the constitution).

### Proposed record 16.16 for option 1 (not added)

```markdown
### 16.16 T-292 Design-History Retirement Record

| Field | Record |
|---|---|
| **reason** | Historical and superseded text leaves the operative surface (T-292, register entry TD-64). Sections 5.6.2, 5.6.2A, 5.6.2B, 5.6.4 and 15 are superseded or evidence-only by their own banners and Sections 16.7 and 16.13. |
| **upstream basis** | The workspace method: active surfaces stay present tense, and historical material belongs in design history. |
| **superseded clause** | None. No clause changes. |
| **affected catalog/entity rows** | None. |
| **migration consequence** | The five sections' headings remain in place, each with a pointer; their text is in `history/ABI5_REALIZATION_CONSTITUTION__RETIRED_SECTIONS.md`. References by number and anchor resolve as before. |
| **change class** | `design_reframe` of this surface's text only. Product, requirements, entities, catalog, stack and method selection are unchanged. |
```

Section 16's sentence "Sections 16.1 through 16.12 retain the earlier method identities …" stays true with 16.16 added, so section 16's body would not change.

## Checks (baseline; no cut was made)

**Constitution.** 4,456 lines. It is byte-equal to `39d6cb975` and unchanged at the branch head.

**Realization diff.** `git diff --stat 675b5e90f -- T/code T/contracts T/scripts T/test_env T/package.json T/product-toolchain-manifest.json specification T/design` is empty.

**Anchors** (`anchors.py 675b5e90f`). 930 anchor links into the constitution in the tracked tree, 0 unresolved.

| Scope | Anchor links | Into a moved section |
|---|---|---|
| kept `T/design` | 27 | 2 (library design :63 and :681, `#table-563-b---selected-leaf-instance-catalog`) |
| `T/design/history` | 1 | 0 |
| active tickets | 3 | 0 |
| `specification/`, `T/code`, `T/scripts`, `T/test_env` | 0 | 0 |
| constitution in-file `(#…)` | 0 | 0 |
| other `.ai-workspace` (snapshots and comments, outside the brief's scope) | 899 | 0 |

**Link check** (`linkcheck.py --all`, design-live; the figures match TD-64R's after-state):

| Form | Links | Dangling |
|---|---|---|
| rel | 491 | 39 |
| repo | 37 | 1 |
| bare | 3 | 0 |
| tdesign | 1 | 0 |

**Readers.** Nothing in `T/scripts`, `T/test_env` or `T/code` reads the constitution's content or path at run time. `T/test_env/qualification/inventory.json` and `recipe/verification-recipe.json` (line 1698) pin it by digest. No test enforces those digests, so nothing was run. The constitution's bytes are unchanged.

**Scripts.** The scripts are in `/private/tmp/abg-td64c-work/`:

- `refs.py`: kept lines that cite a moved section by number;
- `idents.py`: kept lines that name codes defined in the moved text;
- `terms.py`: moved-text terms used in operative ranges;
- `anchors.py`: anchor resolution at a revision;
- `linkcheck.py`: TD-64R's link check, with the worktree path changed.

`orig.md` is the snapshot of the constitution at `675b5e90f`.

## Deviations

- No cut was made and no record 16.16 was added; the stop condition took precedence.
- The commit list is this Return only.

## Residuals

- **Line 681.** 5.6.1A law 3 names "5.6.2" where its operative referent is 5.6.2C. Under ruling 7 it is not reworded.
- **The 5.6.3 banner.** Line 2432 calls Section 5.6.5 "non-executable classification and proof evidence", while 5.6.5's heading and its line 3149 call it the "Operative" and "active W2-05 construction and hold register".
- **Two errors in the TD-64R map.** It records "external none" for 5.6.3 and 5.6.4. 5.6.3 is cited by the library design (two anchors and the `N` codes). 5.6.4 is cited by bare number in T-287 at lines 4704 and 4718, as provenance.
- **History README.** The "Retired sections" list in `T/design/history/README.md` (lines 288 to 294) names 5 of the 25 `__RETIRED_SECTIONS.md` files. Its line 5 still says the files come from "five kept notes in commit `4e405ff08`". It has been stale since TD-64R.
- **The `E22` label.** `product/verification_definition_bindings.ts` uses the Table 5.6.3-A label `E22` in three fault messages. It is a label only, and it stays meaningful under any option because the heading of 5.6.3 stays.
