# T-287 test evidence-directory hygiene — closed return

The registered-selection test now creates a unique directory with `mkdtemp` under
`tmpdir()` when `ABI5_SELECTION_EVIDENCE_ROOT` is absent. Ordinary future runs
therefore neither overwrite the frozen proof nor discover its frozen artifact.
An explicit environment value retains its previous behavior. No new framework.

Only `build_tenants/abiogenesis/typescript/test_env/tests/t287-registered-graph-selection.test.mjs` changed.
Preimage SHA-256: `de4f9676aec664ab4fb4e953f74a3143aaedef6b3bf22c285488ad9e03c82fce`.
Current SHA-256: `13ea567a5e3c0bdbb36b413671c0ee72794fe8306737e0019c47edada2eb5c6c`.

Checks: `node --check` and scoped `git diff --check` passed. Inspection confirms
the nullish-coalescing expression leaves explicit-path handling unchanged and
allocates a fresh directory only for the default. No test execution, core build,
pack, installed-proof rerun, provider or Git mutation occurred. The frozen repair
subject, return, proof manifest and satisfied review hashes remain exact; no
frozen evidence file was written. The retained test subject continues to identify
the earlier proof's bytes; this separate return records the path-only successor.

Exact diff:

```diff
--- frozen/build_tenants/abiogenesis/typescript/test_env/tests/t287-registered-graph-selection.test.mjs
+++ build_tenants/abiogenesis/typescript/test_env/tests/t287-registered-graph-selection.test.mjs
@@ -1,13 +1,14 @@
 import assert from 'node:assert/strict';
 import test from 'node:test';
-import {mkdir,readFile,writeFile,symlink} from 'node:fs/promises';
-import {join,resolve} from 'node:path';
+import {mkdir,mkdtemp,readFile,writeFile,symlink} from 'node:fs/promises';
+import {join} from 'node:path';
+import {tmpdir} from 'node:os';
 import {pathToFileURL} from 'node:url';
 import {setupInstalledRootCatalog,rawProgramInput} from '../support/root-installed-environment.mjs';
 import {prepareRegisteredSelectionProduct,constructInstalledStartCall,constructInstalledRunReadCall,runInstalledCliRequest} from '../support/registered-graph-selection.mjs';
 import {ref,contract,select} from '../fixtures/registered-selection-product/index.mjs';
 const packageRoot=new URL('../..',import.meta.url).pathname;
-const evidence=process.env.ABI5_SELECTION_EVIDENCE_ROOT ?? resolve(packageRoot,'../../../.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/registered-selection-repeat-repair/current');
+const evidence=process.env.ABI5_SELECTION_EVIDENCE_ROOT ?? await mkdtemp(join(tmpdir(),'abi5-registered-selection-evidence-'));
 const repeatOnly=process.env.ABI5_SELECTION_REPEAT_ONLY === '1';
 const save=async(name,value)=>writeFile(join(evidence,name),JSON.stringify(value,null,2)+'\n');
 
```

S3 remains held pending activation.
