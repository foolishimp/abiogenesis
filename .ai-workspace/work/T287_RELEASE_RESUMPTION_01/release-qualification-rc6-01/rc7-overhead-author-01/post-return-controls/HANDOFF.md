# Post-return operator controls

Prepared only. The RC7 author is still a separately owned native task; these controls make no Product acceptance claim. Root binds and executes after the actual author host exits. No runtime coordinate, expected terminal, host result or future source observation has been selected here.

The exact grant is `ROOT_CONTROL_ADMISSION.json` SHA-256 `b7d93c37fdf71ded45a35c8f6fb7c1d9220bc3eaffbbff5077c2f251cd20e823`, with the post-return selection `666b46993ae8bb2d4f417989f8e97e937e6ed1f3814b2e541bd89074f791c051`. `ROOT_FINAL_BINDINGS.json` is `5a8f09e8f8ee03c8dfe55f6af8e1531ded9d8f08947326d474975367e1d96fd2` and selects the actual **20** staged controls. The older 19-member `STAGING_MANIFEST.json` is not used for final preservation.

## Finite sequence for Root

1. After actual `HOST_RESULT.json` exists, create a new `ROOT_BINDINGS.json` from `BINDINGS.template.json`. Bind exact byte lengths and SHA-256 hashes for its six future file inputs. Keep original files unchanged. `execution.json` and `after-run-resume.json` must be this author’s actual returned files, with no predecessor fallback. Freeze a sufficient current timing-envelope metadata file that contains the exact native Result event. It is metadata, not event authority.
2. Select zero or more specific reports named in the actual three handoffs. Each `selectedFeedback` row is `{ "handoff": "return.json", "pointer": "/exact/field", "file": { "path": "/absolute/named/report", "bytes": 123, "sha256": "..." } }`. The selected field must be the exact path string or an object whose `path` names that file. A relative path resolves from the worksite. Bind only wanted reports; no directory walk or wildcard discovery is performed. Empty selection claims no author-feedback custody beyond the handoffs.
3. Run the binding/custody pass once with the declared 8 GiB Node heap:

   ```sh
   node --max-old-space-size=8192 bind-and-freeze.mjs ROOT_BINDINGS.json <root-bindings-sha256>
   ```

   Use this directory as the working directory. The script creates the fresh `outputName` directory exclusively. It parses the actual execution receipt and actual resume once each, requires the author host PID to be absent, verifies actual close/run agreement, and derives small read inputs from the actual returned objects. It does not refresh, reopen, replay or admit the event resource. It imports the unchanged installed owner modules for type/digest checks. A reused PID fails closed and returns to Root; it is never killed.
4. Review `actual-001/SUMMARY.json` and the returned `READ_INPUT.json` pin. If a genuine Run exists, launch each pending read once in a separate process through the existing operator execution controls, using the same 8 GiB heap and finite host supervision:

   ```sh
   node launch-read.mjs actual-001/READ_INPUT.json <read-input-sha256> run_result
   node launch-read.mjs actual-001/READ_INPUT.json <read-input-sha256> run_replay
   ```

   Each child CLI is bounded at 600,000 ms and 536,870,912 output bytes by the unchanged `commandRecorder`; its existing termination behavior is retained. The small `launch-read.mjs` uses that same unchanged `commandRecorder` to launch the separate 8 GiB read process under the explicitly selected 900,000 ms outer host bound and 1 MiB summary-output bound. It adds no process supervisor or recorder fork. Root binds these finite values in the future input before execution. Each member directory is create-only, so repetition fails before another read. A failure does not authorize retry, heap growth or a source change; preserve the failure and return for one Root disposition. A missing Run yields no pending reads.
5. Conjoin each read summary with its complete existing `calls/<member>.outcome.json`, the original actual receipt, source custody, independent review and affected proof. A correct absent-terminal observation is not author success. No new acceptance or runtime-close record is manufactured by these scripts.

## Exact carried relations

`bind-and-freeze.mjs` adapts the existing `d5-author-03/freeze-source.mjs` custody algorithm. Its primary value is the actual `execution.receipt.ownerOutput.value.terminalResult`, checked by the installed `isAbgTypedTerminalResult` and canonical value digest. It selects the physical native Result using that terminal producer’s exact `resultAdmissionEventRef` in the timing-envelope metadata. It reads and hashes only that row’s byte interval, checks the returned close’s device/inode/length, and joins row identity/result/contract/value coordinates to the owner receipt. An encoded Result’s body truth comes from that receipt; the script compares hashes and pins the original physical row in place by path/offset/length/hash, without copying its body or reconstructing an event history or minting admission. The existing installed owner remains the source of truth.

The source freeze checks the 397 baseline descriptors and their retained before snapshots, protects read-only members, verifies the final 20 staged controls, respects the 85 Product write paths, and matches all 417 non-handoff selected files plus three handoffs against the actual after-entry digest and byte length. It retains the current binary diff, Git preimages and both inherited untracked Product files. Exact held preimages remain referenced at their existing pinned snapshots. It does not inspect unrelated untracked territory. The 417-member selection is checked against the exact union of baseline397 and controls20; it is not guessed from a directory inventory.

When the actual return has no valid native after observation, the same finite source selection can be retained as **physical partial custody** with `admittedAfterEntry:null`. Missing handoffs are recorded as absent. It never receives successful/native-after freeze status. A missing genuine close, physical mismatch, missing required selected file, read-only/control drift, invalid terminal or inconsistent row causes `FAILURE.json` and leaves the operation unresolved; no old close or inferred success is substituted. Host exit status and original owner outcome remain explicit even when the source after observation is usable.

`read-one.mjs` adapts P3’s `read-one-r2.mjs`, using the same installed modules, `publicCaller`, `commandRecorder`, `invokeColdInstalledEntry` and physical-resource checks. It captures the actual close coordinate once, passes that exact owner value through existing construction, omits `refresh`, and uses the normal cold CLI. It checks unchanged canonical close and physical prefix after the read. Both reads must return the original complete typed terminal, including full canonical terminal, result and contract coordinates, producer, value kind, value digest and complete value hash. The read source and projection subject must equal the actual original Run. Expected `not_found` is allowed only for `run_result` when the actual original terminal was absent; other refusals are retained as unsatisfied results. An absent `run_replay` terminal requires its actual result projection and source agreement.

The read input carries the five required native-definition fields, actual binding/close/Run, bounded setup configuration, original file pins and terminal hashes. It contains no copied resume, execution body, complete terminal value or source snapshot. It does not reread those large JSON files in each cold read. Full new owner outputs remain at the existing call artifacts; new summaries contain refs/digests only. The unchanged canonical recorder still retains its legacy stdout and command-result copies. Those existing costs are not removed or concealed by this preparation; the active native Worker owns selected canonical runner work.

## Feedback attribution

Root reported preliminary author feedback while the host remains active: first after-stage compile/generate/guard checks passed; carriage85 pass/0 fail/7 skip, prefix3 pass/0 fail/1 skip, and consumers38 pass/29 fail/10 skip. Root localized28 consumer failures to omitted stage resources (22 framed-governance commentary fixtures,4 sandbox-UAT resources,2 runtime-retained-projections-worker resources), while one `assert(assembly)` failure occurs in native-c2-instruction-assembly. This is supplied passive context, not independently inspected final evidence, and the current source is still mutable.

Keep missing operator/stage resources separate from demonstrated Product behavior failures. A count alone does not establish either classification or a Product regression. On actual return, select the final exact reports named by the handoff, preserving any reported stage-resource limitations and unresolved assertion separately. The controls only retain those named bytes and their provenance; they neither rerun the lanes nor parse failure counts into acceptance/regression decisions, and do not embed report bodies in summaries. Preliminary reports do not replace the required final subject/report relation. No active-worker or active-control change is selected by this preparation.

## Readiness and limits

`source-adaptation.diff` shows the complete changes from the two selected prior scripts and the small direct launcher that invokes the existing recorder. Only syntax checks and static input/import/path inspection are performed here. No SDK function, actual source custody, runtime read, build, test, provider, credential, active-control edit or Product edit has been performed. The future bindings remain null and cannot be executed as supplied. Runtime compatibility, full owner-return shape, genuine close, metadata completeness, physical/source correspondence and actual cold equality remain unproved until Root executes the bound sequence. Actual failed/partial evidence remains exact.

This Writer authored the earlier timeout triage only. This is operator readiness, not an independent Product review or acceptance of the active native author’s work. Root retains disposition and any next activation.
