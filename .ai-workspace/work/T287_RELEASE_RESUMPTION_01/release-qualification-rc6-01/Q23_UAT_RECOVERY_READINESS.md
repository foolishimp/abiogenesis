# Q23 UAT recovery readiness — closed contributing triage

Product Frame: ABIogenesis 5.0, GOAL-035/T-287 and its fifteen feature families. This slice concerns Q23 Q1–Q7 component evidence and the integration path from selected Product declarations through an admitted native assessor to a schema-owned ABG result. Root owns source and execution disposition. This report is neither independent acceptance nor activation authority.

The retained standalone UAT route is **not currently constructible under the selected declarations**. Native assessment capability exists, and authentic C2 can be reused as evidence, but allowlisting the assessment GraphFunction alone does not satisfy two existing owner gates. Root has since selected repair for separately established Q4/Q1 source issues. Leave `q23-uat-02` undispatched and obtain affected C2/UAT against the repaired frozen source using the known default consumer route. The old six commands/62 tests remain valid on their old subject; they are not repeated solely for the malformed operator packet.

## Exact subject and retained proof

- Frozen subject: `/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/q23-author-05/review-subject-001/SUBJECT.json`, SHA-256 `60da1eb6b26bd478014ec01d4a49364ec962f74ca3c97c4b91bbee960ba0e638`; source base `1f62c0095e6196b089071bb72e88217792edf6ff`. Owner reads used its snapshots.
- Actual C2 summary: SHA-256 `4df8bd84310a5dc2933aa3a33a617cf27d827d07f46e8abb8c1fcde8161d66a7`. Six commands succeeded, 26 transport and 36 qualification tests passed, zero failures/skips; 342 correspondences survived.
- Physical admitted C2 row: `/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/q23-proof-01/actual-c2-001/ADMITTED_C2_RESULT_PHYSICAL.json`, 4948949 bytes, SHA-256 `be3c66f2f6fe93ba468905f0b59a60b20a062e04e9473b82ee78088d3a984896`; event-log offset 421003886, ordinal 76117.
- Actual result `result://abiogenesis/99166fdb5b130122291c83d01df2c8f661c1e4b40837d2b2e727de6d526a8db3`; cCall `c-call:sha256:1ed0db1603637a3036e24d338a8cf96754a014eb8dd1614c99f54b967058dbca`; actor invocation `actor-invocation://abiogenesis/fca11370a89a1814f49faa95f372528f875633ce296c059b59b12ce0c29571e6`. Complete producer coordinates are in the JSON report.
- Latest close prefix: 431855279 bytes, SHA-256 `8603143a3d6c1488140e44c9ce6b432ef3a55c762c2f1982aa52af48d3370d35`. Root verified all 339 frozen members and 346 proof inputs conserved. Final-close SHA-256 `e1b303d564da73f98db873fc06157facb06f1e73b3eb1d96acbd707469203120`.
- The old Run `run://abiogenesis/13153bebad985222e998e336b206fca8111acfbfd6464cdb413bbc6b5a8960ff` remains `runtime_failed`; no assessor started. `run_result` not-found, failed replay and null terminal result remain its truth.

## Established preparation error

`workload.json` selects 32 UAT `readFirst` entries, only 29 unique. The repeated rubric, `METHOD_ACCESS` and `ROOT_POLICY_HOW_SELECTION` entries violate `product/native_workspace_work.ts:46`; task construction throws on invalid input at lines 51–54. `abg/default_library.ts:259–262` copies the original list and only deduplicates subsequently appended assessment assets. Stable first-occurrence deduplication corrects the packet under existing law.

This establishes a necessary input violation. It does not recover a hidden exception message. The decoded runtime diagnostic establishes only `thrown` at `implementation_invocation`; the placeholder diagnostic reference was not decoded.

## Existing one-node route and its exact limits

The retained publication contains:

- Program `program://abiogenesis/worksite/native-work/assessment@5`.
- GraphFunction `graph-function://abiogenesis/worksite/native-work/assessment@5`; task `contract://abiogenesis/worksite/native-work/task@5`, observation `contract://abiogenesis/worksite/native-work/observation@5`.
- Public operation `abg.operation.run.invoke` / `invoke`, whose request carries exact Program, catalog handle/view, input contract/value, allowlist and source basis (`product/run_operation_contracts.ts:122–143`).

However, `abg/instruction_assembly.ts:174–185` requires a selected Program member in the basis publication to declare the chosen `abg.raw_result_contract`. The assessment Program contains only assessmentGF, whose declaration explicitly removes that field (`gtl/native_workspace_work.ts:61–75`). The installed owner has the same guard at `build/code/src/abg/instruction_assembly.js:134–144`, SHA-256 `1c8ce10ae0a54979af2384cc8fa7af9c8c5b1498255d967f5655aaa29136bfde`. It rejects before dispatch.

The consumer lifecycle Program does contain assessmentGF and an executive GraphFunction declaring the consumer assessment result. Yet the retained assessment Catalog entry lists only the native assessment Program in `programMembershipRefs`. `product/execution_resolution.ts:617–624` requires both that catalog membership and the Program's callable membership. Directly targeting assessmentGF under the consumer Program therefore does not supply an existing escape route. Its ordinary declared start remains the executive. No catalog/member/contract declaration change is authorized here.

The minimal missing prerequisite is a lawfully selected root/Program, callable membership and result-declaration combination admitted by these existing owners. Root has chosen the known default consumer route after source repair; this report does not propose repairing standalone assessment or broadening the catalog.

## Schema and authority remain exact

The output contract is `contract://abi5-tests/sandbox-uat/assessment@5`, version 5.0.0, kind `sandbox_uat_assessment`, owned by `product://abi5-tests/sandbox-uat@5.0.0` through `module://abi5-tests/sandbox-uat/consumer@5`. The retained admitted installation publishes `contracts/assessment.schema.json`, schema digest `sha256:f2fe036c7b6b2a1dbe13f2dbe9cdda649011d64315421eaa83c19ad708701aa7`, consumer artifact `sha256:a0fe55fd8a26fc503f70b63d44cde3185bd840fc8501772d632932a9b69e0feb`, manifest `sha256:0d0f51588d996e699ae163116347568597cfafd8306d971835977663bde9440c`. The JSON report pins the installation and full source routes.

`product/native_workspace_assessment.ts:82–103` and `abg/instruction_assembly.ts:176–185` require the exact publication/install/schema ownership and bytes. A retained full catalog supplies useful declarations but does not override the two gates above. A later execution must use the current durable prefix, valid exact binding and admitted installations/catalog; current-worksite context; exact capability/actor and assessor role; empty write roots; source/candidate/rubric digests; context/prompt bounds; and producer/assessor cCall and actor-invocation separation. Existing STDO policy remains unchanged; no model-family inference or exception is introduced.

## Compact evidence custody is sufficient for its stated scope

Root's proposed projection of the genuine C2 row is sufficient evidence for a bounded component assessment, subject to byte verification against the pinned event log. Carry all six complete `commandResults` and all `predicateObservations`, genuine result/event/producer coordinates, and byte-identical source-correspondence/component/TAP reports. Preserve the original candidate HOW and Q1–Q7 rubric. Bind staged files through a fresh task/context with unique `readFirst` and exact source hashes. Repeating the full helper snapshot/raw C2 body is unnecessary for that evidence scope. This is custody of existing evidence, not injection of Governance observations or synthesis.

It does not itself authorize an invocation, prove a changed source, establish whole lifecycle success, production eligibility, F11 or release qualification. No exact retained-source continuation that lawfully skips C2 was established in this bounded pass; a terminal failed Run is not a held continuation.

Root's later Q4/Q1 findings are retained as Root-reported disposition, not independently re-audited here. The next executable proof follows the repaired source and known default consumer route. No provider/native call, test/build, runtime-event write, source change, catalog change or installation occurred in this triage. Only these two report files were written.
