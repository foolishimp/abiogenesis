# Run 02 — Executive external-network dependency disposition

Root selects `INCOMPLETE_external_network_dependency_auth_inheritance_repaired_live_UAT_unexecuted`. The full authorized seven-UAT bug-finding campaign
remains selected: basic CLI first, the remaining five Hello tests, full Data
Mapper last. All seven live outcomes are **0/7 UNEXECUTED**; version preflight
is READY. No framework semantic pass/failure, qualification or release credit.

The UAT caller's environment allowlist dropped the current
`CLAUDE_CODE_OAUTH_TOKEN`. With identical command/HOME/cwd, ordinary auth is
true, filtered auth false, and adding that inheritance name restores true.
The sole sample-config change is SHA-256
`bcd65d86f9f2fece3695342c977ad1fe72f0381f54e238811e53883d17355a4d`.
Source/native transport already supports the supplied environment. Original
operator config remains preserved; immutable [successor config](operator/config-auth-02.json)
is SHA-256 `413824692abe66b374973af16446fa28a1b0d8626f79aaf5ce2b34a3ee31588b`.
Root accepts the bounded config-only repair and incomplete external-network campaign on the closed GO [independent config-repair review](repair-review/return.md), SHA-256 `cbdb0459af99fac0f36b80402b2431b6bec3c4d323d57d54b02d5eb83ed49e34`.

The successor probe timed out after 120.023 s, exit 143, zero stdout/stderr, with
no result or observed cost report. Model dispatch and cost are unknown. Ordinary
lookup of `api.anthropic.com` and `github.com` each returned
`ENOTFOUND/getaddrinfo`; active session records networkDisabled=true/seatbelt.
Root selects the incomplete external-network execution dependency, with no
remote-provider outage claim. [Original network return](operator/network-triage/return.json)
SHA-256 `ad47f14b64b8be3107e2212b8bdfda96ece05b312e2a230cd35ee44a24b716c0`
and [freeze](operator/network-triage/freeze.json) SHA-256
`5c4dbb5a9ac5a3e2e3ac58d9a3ca08f309db5313d1837d0917a4956d194a6440`
own observations and retained failures; this disposition duplicates no logs.

Resume from the TypeScript tenant in a network-enabled execution context with
the same declared config:

```sh
node scripts/sandbox-uat.mjs run --config /Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/config-auth-02.json --all
```

Candidate `89e2038de69b384dbef84fe6620d5269e57382971cc8e845f554fc6101084b52`,
content `sha256:1c6e4baf3b2d67ebdef6041d851c10fb5dc2d9c405d89fca0e21cdb595b909ec`,
and source `0b1187c40cca619b26b56b24b72cf8beb4841310` remain selected unchanged.
One exact package governs each batch. Actual framework failures return to
Executive STDO 2.5.1 RC2 multi-frame triage, admitted bounded repair, successor
immutable package, clean redeployment and affected retest. Runtime/refusal
archives, original workloads/oracles and prior bounded acceptances stay intact.

Documentary Writer preimages: ticket SHA-256 `fffdf7c6abf0b36e01c55f2ddb6e6fb17e6c2e4fc0b9683a3c3149c4034c10a4` (501417 bytes),
plan SHA-256 `4120485b156ab02df5f141d4b2983bee7d791829b678f98e5b4b7f403f246b15` (6102 bytes). Only the five declared current
routing/live-result fields change; every unrelated ticket line and historical
body remains byte-identical. Plan receives one concise relation. This Writer
performs no runtime, credential, source, test, GOALS, Git/tag or release effects.
