**Core41 package accepted for construction and installation. Native qualification
remains separate.** It contains reviewed ranks 7–8 over accepted core40.

- Archive SHA256: `15f9bb0788e6b8844f3bb01950c727b209d5d4a2ba2549c34a60a1d89453b7fd`.
- Product content: `6d743377a274ac59c8b730ba6c1de7a3327a457d15bb2ba6f3fe4ec594806076`.
- Manifest: `355c890067e05a18274027adee1dfaa963a4f5f78e56dd7037cd4e8b53efa909`.
- All 5,233 archive members match canonical files and the offline installation;
  5,229 are unchanged from core40. The two emitted owners, derived capability
  identities and Product manifest are the four changed members.

Shared emission, manifest generation and accepted focused checks are reused.
Packing took 3.731 s, offline installation 2.102 s, installed Product verification
9.651 s (verifier process 9.98 s wall). No live or stochastic improvement follows
from these timings.

The first package caller stopped after exact archive/install correspondence:
its expected-delta list omitted the generated capability identity graph.
`derived-capability-delta.json` shows only Product-content and dependent identity
changes from the unchanged generator. That list is reconciled; the same archive
and install pass verification. No repack, source repair or repeated build.

`selected-core.json` owns exact selection; `package-correspondence.json`,
`conservation.json` and `product-verification-summary.json` preserve the proof.
The native40 suffix remains on its exact existing core40/dev16 binding so its
admitted request can be consumed without repeated selection or authorship.
Its result cannot establish core41 live qualification. No release publication.
