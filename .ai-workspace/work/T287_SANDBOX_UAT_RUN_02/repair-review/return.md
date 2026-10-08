# Product Frame

Fixed fifteen-family ABIogenesis 5.0, GOAL-035/T-287; external F14/F17/S06 UAT
setup under STDO 2.5.1 RC2. This narrow Environment/Integration/Identity/Proof
review covers the frozen configuration repair and external-capability
observations. Product/runtime owners remain unchanged; configuration selects
inherited environment names, and native logs are evidence. No provider
controller, credential store or runtime authority is introduced.

**GO for the exact config-only realization_refactor.** The sample preimage
`8d9420bf16d6178f5a72b7397140abfdf2b1727a6d459898763efdfb8a6a5e88`
and postimage
`bcd65d86f9f2fece3695342c977ad1fe72f0381f54e238811e53883d17355a4d`
authenticate. Independent JSON comparison confirms the sole change is adding
`CLAUDE_CODE_OAUTH_TOKEN` to `provider.inheritEnvironment`. The new operator
config authenticates as
`413824692abe66b374973af16446fa28a1b0d8626f79aaf5ce2b34a3ee31588b`
and has exactly that same delta from the retained original; model, bounds,
candidate and all other fields remain identical. Only the variable name is
written, not its value. Initial whole-production identity remains accepted;
it was not reopened.

The native auth comparison, SHA-256
`770bed7185a9004e4d229e7ddd0595c1a30945bc9201ef19ec553498268a07a8`,
uses the same executable, argv, HOME and cwd. Ordinary inheritance reports
exit 0/true/oauth_token; the configured filter reports exit 1/false/none;
adding only the existing OAuth variable reports exit 0/true/oauth_token.
The successor status independently reports exit 0/true/oauth_token. This
supports the missing-inheritance cause of local auth recognition.

Runner passes configured inherited names through its existing worker
environment construction. The current native sanitizer's Claude prefix
exclusions preserve this key. Prepared transport exposes an environment digest
and retains actual environment in its private in-memory WeakMap, rather than
putting credential values in the serialized plan. These existing owner paths
require no framework change.

**Current execution is blocked by an external local network-capability
dependency.** The single bounded successor probe timed out at 120.023 seconds,
exit 143, with empty stdout/stderr, no model/result and no measured cost report.
Its result SHA-256 is
`8a904508823424f97fd03a78b398d77509eaa5bef8cb65ae217b99a741467a78`.
Ordinary resolver observations independently report ENOTFOUND/getaddrinfo for
both api.anthropic.com and github.com, SHA-256
`4dd599326f2cab86af9a8a8933325db3e2d9446550df336520fb07949ad321a3`.
The active environment reports network disabled, seatbelt sandbox and a
managed permission profile present. These observations establish that the
current local environment cannot meet the external name-resolution prerequisite.
They do not identify the probe's unique timeout cause or establish a remote
provider outage, semantic framework failure, valid remote credentials or API
reachability. Missing cost output is not proof of zero cost.

Auth repair freeze/return hashes are respectively
`d1f8037d77d872cee91e8f484dbcfa0ed4feaf505825b3080785fc13c1664c05`
and `2ad126cdb6294204b80286ff0d5bc7a7809ab606fe327ad9be63a636a5d94595`.
Network freeze/return hashes are respectively
`5c4dbb5a9ac5a3e2e3ac58d9a3ca08f309db5313d1837d0917a4956d194a6440`
and `ad47f14b64b8be3107e2212b8bdfda96ece05b312e2a230cd35ee44a24b716c0`.
All supplied top-level pins and the 11 auth/3 network frozen member refs
authenticate. Existing requests, outputs and failures are referenced in place;
no duplicate logs or control pack were created.

Live UAT remains 0/7, with no semantic lifecycle installation or Run in these
observations. Remote token validity and provider API reachability remain open
external dependencies for Executive disposition. This reviewer made no
provider/model/API calls, tests, login, credential, source or Git changes.
One report is returned; review stops.
