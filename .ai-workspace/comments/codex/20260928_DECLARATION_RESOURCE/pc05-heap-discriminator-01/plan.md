# Proposed single recovery discriminator — not executed

Executive selects and runs the existing **core50** `pc05-09/reconcile.mjs` once, in its already-required exclusive maintenance window, under standard Node CPU/heap sampling and GC tracing. Its existing request binds the conserved 1,388,245,432-byte resource, last close, abandoned PID25062 lock and exact installed owner artifact. Do not substitute core51 in that request. No Run or model is invoked; recovery changes physical ownership/close state, so this is a proposal for Executive execution, not a read already performed.

```sh
phase_dir=/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260928_DECLARATION_RESOURCE/pc05-heap-discriminator-01
/usr/bin/time -l /opt/homebrew/Cellar/node/24.7.0/bin/node \
  --cpu-prof --cpu-prof-interval=1000 \
  --cpu-prof-dir="$phase_dir" --cpu-prof-name=recovery.cpuprofile \
  --heap-prof --heap-prof-interval=524288 \
  --heap-prof-dir="$phase_dir" --heap-prof-name=recovery.heapprofile \
  --trace-gc-nvp \
  /Users/jim/src/apps/odd_glc/.ai-workspace/comments/codex/20260928_DECLARATION_RESOURCE/pc05-09/reconcile.mjs \
  > "$phase_dir/recovery.stdout" 2> "$phase_dir/recovery.stderr"
```

Read the resulting profiles/logs and existing `recovery-result.json` together: owner elapsed time versus process elapsed/peak RSS; CPU samples in decode/stamp/prefix/canonical paths versus GC; allocation-site samples and heap size surviving major GC versus transient growth. This can attribute the necessary cold recovery's sampled CPU and allocation pressure without another history scan. The prior 0.558-second streaming hash measures only streaming hash work, not recovery or selected projection.

Limits: sampling/GC tracing perturb runtime; heap sampling is not a full retaining-path or peak-memory snapshot, and exit-time samples may omit already-released prefix data. Fatal abort may prevent profile flush; retained GC/stderr still records the failure. No heap limit increase. Recovery neither resumes the failed Run nor exercises its selected projection/route-membership correction. Thus this isolates the cold-owner component; selected-projection cost and core51 OOM sufficiency remain **unmeasured**, not inferred from recovery success. A second read is not part of this proposal. Existing recovery receipts and unchanged-content checks remain authoritative; profiler output supplies diagnostics only.
