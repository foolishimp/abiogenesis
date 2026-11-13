# Exact local RC3 cut/install handoff

Root-selected preparation is frozen at INPUT_MANIFEST.json SHA256 `846ace6898aa2719db493bcf557f9b858b1b1fca1ae47abeb5de1487a416be6f` (25 file pins, four executable pins). Candidate source is `bcb1faf63cfb39bd7ccf7e14b48b133d1163216b`; exact archive is `70de04c36e5716fd37d23e00daa37ab9f5bc079f51aec2544f8f0eb1c40649cd` / 10,942,981 bytes. Product source is tracked-clean and untouched. Node syntax check and static pin/JSON/absence checks passed; no Product import, runtime/install/provider/test execution occurred.

After independent exact-packet review, Root alone runs:

```sh
NODE_OPTIONS=--max-old-space-size=8192 /opt/homebrew/Cellar/node/24.7.0/bin/node '/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/single-machine-p1-03/local-cut-01/install-local-rc3.mjs' 846ace6898aa2719db493bcf557f9b858b1b1fca1ae47abeb5de1487a416be6f
```

The installer authenticates packet/archive/source/tool pins and rechecks both destinations absent before effects. It allocates `/Users/jim/Library/Application Support/ABIogenesis/releases/5.0.0-rc.3` and uses the existing Product owners to verify, lock and install into the fresh `/Users/jim/Library/Application Support/ABIogenesis/installs/5.0.0-rc.3`. Archive bytes are copied unchanged, external current claim/map/authority/F4 records retained, and all 5,321 payload files compared. Product install uses pinned npm with its existing offline/ignore-scripts/bin-links-false/no-audit/no-fund behavior; normal local npm cache effects are part of that existing owner call.

Success requires actual `verification.json`, `resolved-lock.json`, `installation.json`, `payload-correspondence.json`, `LOCAL_CUT_RECORD.json`, `SHA256SUMS`, installer exit0 and same archive hash. The final record supplies the installed Public CLI path. Existing accepted actual-artifact proof is retained rather than rerun; physical installation alone adds no new native acceptance.

Any collision/refusal/error stops; preserve any allocated directory and actual receipts. Do not retry, remove or overwrite it automatically. Root resolves uncertain effects from actual state. No rebuild/repack, tag/push/external publication, selector/default CLI change, new native Run/provider call or qualification suite is included. The historical source claim is unchanged; the current bounded external claim and F4 capsule retain failed Runs, old-history/native-context boundary and full-qualification exclusions.
