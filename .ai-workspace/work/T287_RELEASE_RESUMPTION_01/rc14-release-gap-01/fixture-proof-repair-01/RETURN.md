# Fixture author pass stopped before dispatch

The exact authorized source was `484f4b721d8efafdcf6aa5ddabc69b06bed58756`. Setup completed and closed its actual resource, but installed RC13 rejected task construction. No native author, Run, source change or proof campaign occurred. No retry or repair was made.

The concrete cause is an Operator-authored carrier error: `TASK.json.instructions` is a scalar string, while the installed owner requires `v.array(ref)` (`native_workspace_work.js:18–25`). `HOST.mjs:107` passes it through; the constructor throws at line40. The maintained predecessor task used an array. JSON and JavaScript/Python syntax checks did not validate that owner field type. The file-level write-scope preflight had returned null. This failure supplies no evidence of a Product/worksite-scope regression, and does not prove the other construction joins would pass after correction.

The smallest proposed re-entry is an explicit Root-selected control correction to the existing array carrier, preserving the instruction text, plus checking the supplied task field shapes against their owner before another setup. This Return does not select or execute it.

HOST exited1 after43,290ms with no timeout, actual resource close and its process group absent. Its original clock remains `2026-11-14T19:39:42.776494+00:00` to `2026-11-14T21:09:42.776494+00:00`. Native and proof clocks never started. All1,437 preimage files remain byte-identical. The only added source-worktree file is the authenticated setup-owned `.abiogenesis/workspace-manifest.json`, retained locally and excluded from Git. Both topology observations completed with positive separation; the final immediately-before-dispatch stage was never reached.

Exact hashes, source contract locations, capture paths and conservation are in `RETURN.json`. Only these compact Return records are committed. Raw evidence remains external; main and remote are untouched. Earlier evidence, including126 owner passes and6 identity cases, remains separately subject-bound. No release, qualification or acceptance claim follows.
