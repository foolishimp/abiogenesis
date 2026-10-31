# Bounded cold environment reconstruction gap

Status: operator proof gap; no Product counterexample/fix selected, observer edit or retry. Root stopped further exploration pending one independent source-boundary review. Preserve actual003 native Return, admitted Construction, all logs/sidecar/receipts and current failed observer. No proof.json was produced by the failed observer.

Root's actual observer invocation reached observe.mjs115 and refused its strict environment equality:

- Reconstructed digest: sha256:3ece86184eb72dedf141f1df2760e0f8bf46592133927c724e04cf41c5138593
- Admitted Construction transport digest: sha256:d22eb5285f8c162bcd8a138d62b3d5af4029fdb62acc0b07bb996c97e69da23c
- Diagnostic writer's initial current-host reconstruction: sha256:81169263e994b5b98c1f86e4fa29938b42bb6aa30b1297e51564dda383b5bd01
- Diagnostic reconstruction using the actual same-Run admitted Testing command's five ambient entries reproduced Root's3ece8618… digest exactly, still differing from admitted d22eb528… . The writer-host differences were LANG and PATH only within those five ambient keys. This does not establish the remaining native effective-environment preimage.

The actual retained Public CLI execution records16 supplied environment key names:
ABG_TS_CLAUDE_APPEND_ARGS, ABG_TS_CLAUDE_COMMAND, ABG_TS_FP_ABSOLUTE_TIMEOUT_MS, ABG_TS_FP_TERMINATION_GRACE_MS, ABG_TS_FP_TIMEOUT_MS, ABG_TS_WORKER_SANDBOX, BASH_DEFAULT_TIMEOUT_MS, BASH_MAX_TIMEOUT_MS, CLAUDE_CODE_DISABLE_BACKGROUND_TASKS, CLAUDE_CODE_OAUTH_TOKEN, HOME, LANG, LC_ALL, NODE_OPTIONS, PATH, TMPDIR.

The five authenticated Testing ambient names are HOME, LANG, LC_ALL, PATH, TMPDIR. The actor endpoint augmentation has exactly three names: ABG_GOVERNED_CONTEXT_ENDPOINT, ABG_GOVERNED_CONTEXT_CLIENT, ABG_GOVERNED_CONTEXT_EXECUTABLE. The current reconstructed sanitized map has20 keys after the existing Claude sanitizer adds CLAUDE_CODE_DISABLE_ADVISOR_TOOL. Actual actor snapshot key count is not retained as a preimage and is not inferred from that reconstructed count. No environment or credential values, individual secret digests or secret material are stored here.

Inspected deciding sources (all below build_tenants/abiogenesis/typescript/code/src unless operator path stated):

- abg/actor_process.ts882: freezes the actual Public-CLI process.env at native preparation;1023–1046 constructs the known transport and overlays the three endpoint fields.
- abg/worker_transport.ts749–797: takes the exact supplied environment, sanitizes it and computes the admitted environmentDigest. Later spawn consumes that same prepared source through the same sanitizer.
- abg/transport_contracts.ts242–280,367–383: existing Claude transport selection/prefix sanitization. No missing endpoint augmentation was found.
- product/worksite_command_execution.ts902–945: projects the five ambient entries into a command environment when the declared environment omits them. The actual same-Run admitted Testing task retains those entries; diagnostic calculations did not promote them into a grant.
- operator-client/runner.mjs45–60: commandRecorder records supplied key names and passes the override to subprocess spawn. Its workerEnvironment/setupEnvironment/inherited helpers (about111–129) derive the configured map from named inherited values and the selected profile.
- witness-001-prep/run-b07.mjs14–20: merges the saved configuration and selected profile, constructs workerEnvironment and invokes the existing lifecycle with it.
- witness-001-prep/public-setup-b07.mjs113–125: publicCaller invokes the selected Node CLI with the supplied environment and retains its returned owner receipt.
- witness-001-prep/observation-b09/observe.mjs109–116: reconstructs current named inheritance plus the selected profile/endpoint fields, then requires the full admitted environment digest before cold correspondence verification.

The run and observer configured-map construction agrees structurally. Retained transport candidate JSON has no full effective-environment preimage; the admitted binding carries its digest. Remaining uncertainty is a launch-time credential/inherited value or an actual CLI subprocess/environment transformation not yet established. There is no safe corrective edit identified by this bounded inspection. Do not remove the strict digest check, trust a sidecar endpoint/grant on its own, fabricate an environment preimage, or rerun native work to conceal this gap.

Only read-only source/retained-data inspection and pure hash/environment comparisons were performed. No observer, Public, provider, adapter, endpoint or test was executed; no source, event log, native receipt or runtime input was changed. Root independently reports native W1/W3/W4/admitted Construction evidence sound; cold environment reconstruction remains the explicit open proof condition. This is not whole qualification or a confinement claim.
