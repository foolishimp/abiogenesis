# TD-85N technical QA and bounded disposition

Product frame: fixed ABIogenesis 5.0 scope, T-292 consolidation, B-05 missing-name confinement repair. Workspace transformations must avoid protected roots before effects; ABG owns admission and replay preserves actual outcomes.

| Binding | Result |
|---|---|
| Reviewer | `/root/td82_integrity_review`, T292-TD85N-QA-02; read-only, non-author technical QA |
| Subject / predecessor | `fd73e7a0d56c8371ec724b84d29d77dda9a5fe4b` / `891a39c44877fc1edfdc4b9159336992d37dd4c0` |
| Basis | ABI Definition; verified installed STDO 3.0.4 manifest `102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b` |
| General physical-confinement claim | Falsified by the pre-existing firmlink case below; no general alias-completeness claim |
| Targeted missing-name repair | Supported by 73 retained passing checks and independent alias probes; no regression found in this selected change |
| Source binding | Frozen source independently emits the exact tested owner; authored and evidence hashes match |
| Independent probe | Eight actual APFS alias pairs across five owner paths: 40 explicit-uncertainty refusals, zero write syscalls; safely separated sibling creation succeeds |
| Integration | Merged at `d5dbe324f`; rebuilt; 70/70 merged checks (67 confinement/generic, 2 native zero-assembly, 1 installed B04 create with ABG admission and fresh replay), no failures/skips |

## F1: existing B-21 has a protected-root effect

Severity S2. `/private/tmp/<scratch>/worksite` and
`/System/Volumes/Data/private/tmp/<scratch>/worksite` are both self-canonical
and share device/inode. Declare an absent projection root through the latter,
then request `protected/child/file.txt` through the former. Native preflight
accepts; the parent owner creates the protected directory and child and reports
committed. The exact predecessor does the same. This is an existing distinct
physical-alias defect, not introduced by TD-85N. No recorded-data loss,
installed admission or provider execution was demonstrated by this probe.

The shared owner treats different existing path components as separation
without proving distinct physical ancestry. Existing tests use one common
canonical spelling. The observed cone is C0 parent creation and native
preflight; other physical owners need bounded re-entry triage, not an inferred
complete census. Candidate missing-name/ASCII inference remains supported
within this named exclusion. Evidence under
`/private/tmp/abg-td85n-work/codex-qa/`: `firmlink-effect.mjs`,
`firmlink-effect.json`, and `independent-names.json`.

## Executive disposition

B-05's case/normalization missing-name repair is integrated with the B-21
exclusion. B-21 is upgraded from S4/P3 to S2/P2: bounded physical-ancestry repair
after the selected local unqualified cut. The T-292 scope amendment does not
select every other backlog entry for this wave. This disposition waives no
Product law and does not establish complete confinement, reliable operation or
5.0 qualification. Avoiding alternate firmlink coordinates contains the exact
example; it is not a Product fix.

| Deferred obligation | Binding |
|---|---|
| Stable id / owner | T-293 B-21 / ABIogenesis physical confinement owner, Root Executive disposition |
| Frame / re-entry | F-WORKSITE-CAUSALITY plus physical identity and Proof; owning HOW re-entry for ancestry evidence, then bounded realization |
| Evidence / consequence | Exact predecessor and candidate protected-directory creation above; S2 forbidden effect under ordinary Darwin firmlink conditions |
| No-block rationale | Existing distinct backlog condition; selected missing-name cases and ordinary same-spelling host path remain constructable. Only a local unqualified candidate is selected, with the residual named |
| Activation / dependent boundary | Post-cut repair; must close before a reliable-operation or 5.0 qualification claim |
| Closure falsifier | Either canonical spelling or mixed ancestor spellings can reach a protected root before refusal, while tests only compare strings |
| Required closure evidence | Physical-ancestry relation across aliases; zero forbidden effects on both spellings and ancestor/descendant cases; ordinary independent-root positives; affected owner admission/replay proof |
| Status | Open, scheduled P2; no repair selected in this wave |

The candidate is Codex-authored. Separate activation supplies counterexample QA
and repeatable mechanical evidence, not undeclared same-family semantic
independence. Native Windows/Linux, full composed suite and live providers were
not reviewed here. Source, basis or namespace changes invalidate affected
claims. Root retains the returned conflict rather than conjoining it into a
general green result.
