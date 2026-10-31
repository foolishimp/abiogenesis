# Future installed-RC3 governed-lookup witness scaffold

Status: preparation only while B04 runs. No Product edits, worksite creation, admission, provider call, package selection, release decision, or commit is performed by this scaffold. The consumer task worksite is planned to contain exactly `task.md`, `rubric.json` and `fixture.txt`. The fixture is a byte-verified historical extract used only as a fresh Testing input; the live producer will be a new admitted Testing Result in the witness Run, never the historical Result relabeled as current.

The intended lifecycle selects genuine Testing first, with `subjectEvidenceRef:null`, and its fixed command emits the entire fixture to stdout. Native Construction then uses the actual selected fixed client to request the permitted task, rubric and new same-Run Testing stdout, plus one denied key. The real owner must retain request/response and raw Claude tool-result joins for cold verification. `recursionBound:3` deliberately stops the parent after the two child selections; a blocked parent is honest and is not whole-Run UAT. The witness is the actual native lookup/admission and cold evidence, with actor behavior separately observed. Any differing native outcome is reported as observed, not forced or simulated. Bash/Read remain available: this is not host-wide confinement.

Known local supplement: `urn:a-c:development-supplement:governed-context:gc03-adb3d8ee:1`; archive SHA-256 `cf6b1fcdebda5c6c90a644f17f7d1d01b298f53e6e0b17051b38971b14703a35`; inventory SHA-256 `fc6befa45d62acd902665d545fc20f65dc3d435fa242a72aaa4e8986c080c003`; installed root `/Users/jim/.local/share/a_c/development-supplements/gc03-adb3d8ee-1`. Python executable `/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12`, version 3.12.8, SHA-256 `a7f5b535d61d1c7326824204ac80f045a97a652abb154421e2c74fcc365a3539`. These are references to the already selected local development supplement, not an RC3 release or runtime permission.

The copied `public-setup.mjs` changes only dependency resource mapping: it requires an explicit one-to-one declared dependencyRef → canonical root and record path, and refuses missing/extra mappings. It retains `corpusAccess:null`, `accesses:[]` and `resources.pythonPath:null`; dependency membership itself grants neither context.read nor Python execution. It is operator scaffolding, not a new Product authority or schema. Its copied `consumer.mjs` import points to the existing operator consumer; its actual selected RC3 declaration and permissions remain unresolved.

After B04 returns and the exact RC3 artifact is built, reviewed and actually selected for this witness, fill and verify: artifact path, digest, package/product/manifest identities and installed-root receipts; fresh worksite/event-resource and consumer identities; the actual B-authored private Program policy reference, Context member and source/dependency inventory shape, policy/grant/principal and separately lawful Python execution permission; exact `dependencyRef` → root/record paths; native owner/client executable, permitted opaque keys, denied key, request/response envelope and evidence/cold-rejoin locations; supported original task/snapshot/command construction and first-Testing/second-Construction selection; exact model, credentials ENV NAMES, controls, timeout and budget disposition. Resolve those from the returned RC3 code and real admission; do not infer them from this scaffold, current partial source, stale RC2 interfaces or the existence of local files.

## Prepared local bootstrap (not executed)

`bootstrap.mjs` accepts a future operator-selected JSON file and its exact `sha256:` file digest. It invokes `verify-c2.py` before creating its no-clobber `runtime-001` root or importing RC3 code. The verifier requires the B04 C2 helper Result, all nine successful/terminated command records, complete source-correspondence stdout matching C2 snapshot members, a unique artifact delta and exact artifact bytes. It checks the pinned archive, safe member types/paths and raw manifest identity. The bootstrap checks canonical manifest and Product payload-inventory digests before importing extracted Product code, then uses the existing Product verify/lock/install and the witness Public setup helper. It performs no lifecycle invocation or provider dispatch. It records selection, verification, installation and Public setup receipts under `runtime-001`; a failed attempt leaves that directory for triage and will not overwrite it.

The selected evidence JSON must be sourced from an independently authenticated native B04 Result/owner projection. The verifier checks its pin and the presence of selected producer coordinates, but it **does not authenticate native admission**: Root must establish that join from the native owner before selecting the input. Nor do successful helper commands establish whole-Product acceptance. `public-setup.mjs` now requires a byte-pinned, trusted operator-owned witness consumer module exposing the existing `IDS` and `prepareConsumer`; the generated publication must bind the selected private policy reference. That module, its authenticated policy Context/source/dependencies and actual grants must be completed from the final B04 code. The helper does not infer them from files or enable providers. Trusted consumer code is executable operator input, not an OS sandbox.

Required selected JSON shape (all paths canonical absolute; all hashes prefixed `sha256:`; no values are available until the actual C2 Result):

```json
{
  "kind": "rc3_b04_c2_selected_producer_v1",
  "producer": {
    "runRef": "<native run ref>", "resultRef": "<admitted C2 result ref>", "resultDigest": "<result digest>",
    "admissionEvidencePath": "<owner projection JSON>", "admissionEvidenceSha256": "<digest>",
    "helperResultPath": "<exact C2 helper result.json>", "helperResultSha256": "<digest>",
    "helperArtifactRef": "<helper ref>", "helperArtifactDigest": "<helper digest>",
    "artifactRelativePath": "<C2 sandbox-relative .tgz path>"
  },
  "artifact": {
    "sha256": "<artifact digest>", "bytes": 0,
    "productId": "product://abiogenesis/typescript-tenant@5.0.0-rc.3",
    "packageName": "@abiogenesis/typescript-tenant", "packageVersion": "5.0.0-rc.3",
    "productContentDigest": "<content digest>", "manifestDigest": "<canonical manifest digest>",
    "manifestByteSha256": "<raw manifest digest>"
  },
  "operator": {
    "authorityPath": "<operator authority>", "authoritySha256": "<digest>",
    "consumerModulePath": "<completed witness consumer.mjs>", "consumerModuleSha256": "<digest>",
    "policyRef": "<verified policy member ref>", "nodePath": "<real Node path>", "nodeSha256": "<digest>",
    "npmPath": "<real npm path>", "npmSha256": "<digest>",
    "taskSha256": "<task digest>", "rubricSha256": "<rubric digest>"
  }
}
```

Once Root selects actual inputs and authenticates native Result admission, the prepared command is:

```sh
NODE_OPTIONS=--max-old-space-size=8192 /opt/homebrew/bin/node '/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/witness-001-prep/bootstrap.mjs' '/absolute/path/to/selected-c2.json' 'sha256:<selection-file-digest>'
```

This is a command template, not a currently runnable invocation: the actual C2 identities and completed witness consumer do not exist yet. The setup produces no Testing or Construction Result. Root must separately prepare the task, key/grant bindings, launch and cold proof.
