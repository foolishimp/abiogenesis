# Operator-only GC03 scratch regeneration

The Root-selected B05 task explicitly allowed test-local materialization in a fresh disposable scratch tree, distinct from the 23-path Product write grant. This recipe demonstrates that bounded operation with the **current unqualified B05 source adapter**, not an installed RC3 artifact or native authorization.

```sh
/bin/sh '/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/attempt-007/regenerate-gc03-scratch.sh'
```

It checks source adapter SHA-256 `1eb6de41473ee6158c2a830d5188e98449c1ef2ea455644017b66217651eb6f3` before and after copying, creates an exclusive scratch directory, copies only the previously selected B05 declaration and pinned source files, verifies those source pins and installed GC03 inventory through the existing generator, regenerates policy and activation template inside scratch, and runs the existing controlled local validator. It does not edit Product files, invoke a provider or assert native facts. If the source adapter changes, the recipe refuses rather than silently rebinding.

The actual operator run passed policy startup, controlled context assembly, grant/executor/currentness and 11 dependency checks. Output and stderr are retained in `regenerate-gc03-scratch.stdout` and `.stderr`; the scratch path is included there. Controlled inputs are not a native admission, admitted Testing Result, provider preflight, receipt, accepted feature or installed-RC3 witness. The script's existence does not prove that a native worker's actual tool policy will permit the scratch operation; that owner boundary must be observed if exercised. For a real installed witness, independently select the exact installed candidate artifact and regenerate against its verified adapter bytes and native owner binding.
