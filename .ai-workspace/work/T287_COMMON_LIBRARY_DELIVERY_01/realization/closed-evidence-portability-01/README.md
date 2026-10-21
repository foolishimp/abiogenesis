# Closed evidence portability 01

Product Frame: ABIogenesis 5.0 / T-287 common computational library. This handoff transports selected **closed prior** evidence for checkpoint and another-machine review. It performs no ABIogenesis execution and grants no independent acceptance, current-candidate proof or release authority.

Executive activation `CLOSED-EVIDENCE-PORTABILITY-01`, followed by `PORTABILITY-INVENTORY-READER-02`; owning frame [F-END-TO-END-INTERFACE-INTEGRATION](../../../../../build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration). Exact method/design/L2 remain bound in [HOW](HOW.md) and the [successor HOW](HOW-successor-02.md).

## What travels

The [fixed whitelist](whitelist-02.json) binds 66,691 original source addresses. Each has an exact digest/length, old frozen source route and one transport relation: an existing repository file (8,196 addresses, 5,786 distinct files), an original package member (58,128 addresses), or a new archive object (367 addresses, 221 distinct byte objects). The two original baseline/candidate package archives and all 10,538 members were verified against their old exact member inventories. No full installed/node_modules/cache tree was duplicated.

The selected cuts include the stopped C0 predecessor and CX-1 falsifier, successful C0 fixture successor02, E03 lifetime stream repair and three actual no-PID launch failures, E04 retained-owner cases including original failed index/receipts and physical snapshot/temp residues, original baseline package preparation, P1 baseline/candidate01, failed P3 and successful P3 successor, and attributed E03/K11/U1 public review summaries. The exact cuts and source-format mappings are in [source pins](source-pins-02.json) and [native mappings](native-source-mappings-02.json). Original failures remain failures with their original scopes.

The E04 repository case copies are reused after exact comparison. Symlink target strings and original hardlink/device/inode coordinates are retained as [original observation metadata](original-metadata-02.json); no symlinks or hardlinks are installed by these archives. Changed C0 targets, journals, event-prefix bytes and retained E04 snapshots/temp files remain distinguishable.

## Archive set

| Archive | Compressed bytes | Full uncompressed tar bytes | SHA-256 |
|---|---:|---:|---|
| `component-bytes.tar.gz` | 21600360 | 24750080 | `6e950e6f6063a7aa4c8bc2609524fe6c57130eb15ca4bcee7e579fa0ad2b6b74` |
| `p1-baseline-bytes.tar.gz` | 49913142 | 348252160 | `f324add8773aa7e13a4e519df8ba718c49afad8910561d275e70e9100a002c64` |
| `p1-candidate-bytes.tar.gz` | 49893711 | 348231680 | `aca1f8d9fc418ad42fb1a1370f42d8ff8e71a8d71588767c15bc4dfa085c3cb6` |
| `p3-bytes.tar.gz` | 15080744 | 106158080 | `399b7452e316cf733bb7e5a476e328ab8f4973e92d10f05df599e05e87f54b2f` |

Total archive transfer: 136487957 bytes. Each archive is below the 1 GiB uncompressed limit. Archives use inert regular-file members named `objects/sha256/<digest>`, with normalized transport metadata. Full package bytes appear as objects in `component-bytes.tar.gz`; [package member inventory](package-member-inventory-02.json) maps them to their original exact members. [Archive records](archives-02.json) also pin uncompressed tar hashes and counts.

## Review on another machine

1. Acquire the checkpoint containing this directory **and all 5,786 required repository files** named by `transport.kind = repository_file` in the whitelist. This is a repository-plus-archives handoff, not a standalone four-file bundle. The `.tar.gz` transport files and authored record files are not ignored by current Git rules; the checkpoint Writer owns staging. No Git index was changed here.
2. Compare `freeze.json` SHA-256 with the Executive handoff. Its `manifest_sha256` pins `manifest.json`, which pins every file in this carrier.
3. From the checkout root, run only the filesystem verifier:

```sh
python3 .ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/closed-evidence-portability-01/verify-transport.py --repo-root .
```

The verifier reads archive members without extracting them, verifies all source-address mappings and repository copies, and never opens the original `/private/tmp` paths or executes Product/test/native/model code. It checks the final freeze when present. The retained construction receipt ran before the final freeze and explicitly reports `final_freeze_present: false`; final manifest closure is separately checked and is not retroactively attributed to that receipt.

4. Start with the original closed report/receipt routes in `source-pins-02.json`. Find an original absolute path in `whitelist-02.json`: `repository_file` routes to checkpoint bytes; `archive_object` routes to the named tar/member; `package_member` routes through the exact original package archive/member inventory. `tar -xOf <archive> objects/sha256/<digest>` can render a selected object to stdout for inspection. Do not extract any object over an original runtime path or treat it as an event store to append.

**Transport identity is never original runtime authority.** A copied journal's path/device/inode cannot satisfy the original `eventLogRef`/store identity. Digests preserve bytes and historical evidence meaning; they do not re-admit events, rerun physical effects, prove currentness on the receiving machine or authorize continuation. Original live owner acquisition would need separate Executive activation.

## Preserved stop, exclusions and remaining work

The first archival discovery stopped on `KeyError: rootFootprints`: [STOP](STOP.json), [failed command](failed-discovery-command.py), [traceback](failed-discovery-traceback.txt), [stopped freeze](stopped-freeze.json). Its records are unchanged. Root triaged the new reader's mistaken universal format assumption; the authorized successor distinguishes P1 `rootFootprints + files` from P3 `summaries + files`. Summary fields never select bytes.

[Explicit exclusions](explicit-exclusions-02.json) retain all 2,360 V8 cache entries and the original system Node executable reference without copying those bytes. Stage dependency inventories remain old provenance; this handoff makes no complete executable-environment reconstruction claim. Ordinary E03 test scratch roots governed by original cleanup hooks are represented by their retained observations/receipts, without invented reconstruction. No selected byte was missing, substituted, redacted or refreshed.

Active `combined-final-02` and `l4-final-candidate-02/realization` were excluded; continuation17 was not opened. Later archival work still owns the final combined source/package cut; FINAL P1/P2/P3/P5, HoG/U1/P4 and passive diagnostic/native execution outputs; final independent L5 reports and Executive acceptance/checkpoint records. This handoff does not anticipate their outcomes. The review summaries are Root-attributed public summaries; original full raw reports remain in Root's public transcript and were not acquired. No hidden reasoning is included.
