# Isolated S4 test artifact: prepared, unadmitted

Use the eventual Root-accepted, frozen successful S5 after-stage. This is a disposable test artifact; it does not require the local RC7 release cut or a version change. Original preparation-002 and its P1/P2 correction remain unchanged.

1. Copy `ARTIFACT_BINDINGS.template.json` to a new Root binding file. Set status `ROOT_SELECTED_ISOLATED_S4_TEST_ARTIFACT`; bind the exact activation, this `ARTIFACT_CONTROL_MANIFEST.json`, final S5 subject, 451-row source inventory, Root acceptance, successful stage report, source digest, stage package root, generated Product manifest, and seven existing fixture helper pins. Select finite `boundsSelectedByRoot` from the proposed pack 120000 ms / verification-install 600000 ms / 536870912 output bytes / 8192 MiB heap limits. No actual source or acceptance is supplied by this preparation.
2. Run once after Root admission:

```sh
NODE_OPTIONS=--max-old-space-size=8192 /opt/homebrew/bin/node /Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/rc7-carriage-measurement-01/prepare-test-artifact.mjs ROOT_ARTIFACT_BINDINGS.json SHA256
```

The existing canonical `commandRecorder` runs only `npm pack --ignore-scripts --json --pack-destination …/artifact-001/archive` in that completed stage, then a thin invocation of immutable RC6 Product `verifyProduct`, `constructResolvedProductLock`, `installProduct`, and `installedProductContentMatches`. `--ignore-scripts` prevents the package prepack build. All 451 source rows and the generated manifest are verified before and after. Existing compile/generation/lifecycle receipts are reused explicitly; none is repeated. Archive identity must equal the selected manifest through Product verification. No source/identity edit, immutable install, selector, release directory or campaign is touched.

3. On success, `artifact-001/SOURCE_ARTIFACT_RELATION.json`, actual archive, verification/lock/install receipts and owner content check are pinned in `artifact-001/MEASUREMENT_BINDINGS.pre-admission.json`. This uses the existing preparation-002 binding shape. Root fills only its actual measurement activation, selected status `ROOT_SELECTED_S4_INSTALLED_CARRIAGE_MEASUREMENT`, and finite `boundsSelectedByRoot`, then invokes the unchanged runner once:

```sh
NODE_OPTIONS=--max-old-space-size=8192 /opt/homebrew/bin/node /Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/rc7-carriage-measurement-01/preparation-002/run-measurement.mjs ROOT_MEASUREMENT_BINDINGS.json SHA256
```

Existing measurement proposed ceilings remain host 900000 ms, each cold read 300000 ms, scripted actor absolute 60000 ms/inactivity 30000 ms, 536870912 output bytes and 8192 MiB heap. Exactly two read-only native-work tasks use 1 MiB and 4 MiB known context bodies over one held resource. Original Result identity is compared separately; complete held/cold typed terminals and owner outputs are compared at the same final P2. Both read projection bases must identify P2.

The original frozen-artifact fixture skips packing and performs its ordinary disposable Product-owner install from this same archive. Thus there is one pack, one isolated bootstrap install, then the existing fixture install measured as setup. This preparation does not replace that owner behavior or count those installs as one. The fixture uses a scripted stand-in actor and provides no general native-coding speedup proof. S6 remains a Root decision informed by actual measurements.

Fresh allocation checks cover `artifact-001`, `/private/tmp/abg-r7p`, `actual-001`, and `/private/tmp/abg-r7m` before work. Outputs use create-only records; failed/partial allocations and command receipts remain preserved. No retry, cleanup or automatic measurement launch. The sanitized environment uses distinct empty npm configs and short scoped temporary roots. Preparation has run only syntax checks and finite pin/shape checks.

Remaining inputs are the actual accepted S5 stage/source/manifest/Root disposition, Root pack-install and measurement activations/bounds, and the archive/install observations produced by the admitted artifact command. Future actual receipt slots remain absent. No additional Product design decision is introduced.
