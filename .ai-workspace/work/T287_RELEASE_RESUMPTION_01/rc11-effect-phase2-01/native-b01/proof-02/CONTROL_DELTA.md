# Unit-only control continuation

The old proof-01 driver and every failed/continued receipt remain immutable. This revision has one executable command, the original nine-file unit. Staging, build, pack, install, C2 and lifetime command branches are absent.

The failed typed/raw comparison becomes `validated_digest_join`: validate exactly `sha256:[0-9a-f]{64}` and `[0-9a-f]{64}` independently, then compare the declared prefix join. Actual archive bytes and every bootstrap member are still checked; no hash guard is relaxed.

The empty-string failure branch becomes `run_required_step`: exceptions always create `failurePresent: true` with class, message, repr and traceback, persist the failed record, and raise. Diagnostic text never selects continuation. `require_complete_success` demands exactly one `unit` result with PASSED, failurePresent false and failure null before final success; the outer supervisor independently consumes that gate.

The one control-only discriminator calls these exact functions from unit.py. It checks matching/malformed/mismatching digests, empty-message assertion blocking the next effect, failed/missing/duplicate/wrong result blocking final success, and one nominal success. It executes no Product import, test or child workload. The controller file is unchanged after that run.

The 2,400-second monotonic campaign starts before read-only revalidation; the existing parent watchdog covers the worker, unit and final guards/closure. Unit gets min(1,800 seconds, remaining less 15 seconds). Output is bounded at 100 MiB with final-burst accounting. Any command/guard/closure failure stops; there is no retry. Only new output/evidence/TMPDIR/cache paths differ from the retained unit environment. The test runs against the exact retained normal work/build; no staging or compilation occurs.

Root's new retained-proof adoption is a required pinned input. It accepts bounded existing observations without rewriting original statuses or authorizing their earlier continuation. Unit remains held until its exact execution admission. Expected102 cases/96 passes/six named skips, complete39-name M5/34-evidence-ID subset, both capsules and all original limits are retained.
