# B02 fresh readback latency

See [ERRATA.md](ERRATA.md) for the correction to the frozen historical prefix-digest label; the original selected task source remains unchanged.

Root verified the actual `attempt-004/commands/run_result.result.json` readback: the Public command returned exit 1 for the expected owner refusal `not_found`, without timeout or truncation, after 511,491.916375 ms (about 8 minutes 31.5 seconds) against the same 2,000,589,327-byte prefix. The separate fresh `run_replay` returned a blocked projection, exit 0 without timeout or truncation, after 463,785.426583 ms (about 7 minutes 43.8 seconds). Both closeHandoffs match the same prefix. This is an observed local inspection-latency limitation, not a runtime failure classification. No performance repair package is selected.

This separate disposition note preserves the already preflighted B03 task input bytes; it does not alter the frozen source binding or claim the pending readback outcome.
