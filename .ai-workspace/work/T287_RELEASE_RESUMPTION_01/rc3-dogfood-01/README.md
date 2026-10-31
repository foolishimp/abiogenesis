# RC2-to-RC3 prepared operator entry

Status: RC2 runtime preparation only; GC-03 was subsequently released and
installed locally under the [decision record](GC03_LOCAL_RELEASE.md). Root
selects RC2 installation and runtime activation. See [OPERATOR.md](OPERATOR.md) for the exact owner instruction and
[PREPARATION.md](PREPARATION.md) for the bounded authority, identities, planned
GC-03 local release, prior native failure and protected evidence. No provider
or ABI runtime has been invoked by this preparation.

The frozen RC2 tarball was rehashed and all 5,315 members read: they are unique,
regular, within `package/`, and total 71,560,529 uncompressed bytes. The exact
inventory hash and read-only limitations are in [archive-census.json](archive-census.json).
The sparse worksite is initially clean at `d1e4527dbbc0b9ca1a929122c62ca225184f3341`;
preimages, exact tool identities, source tree, helper hashes and absent output
paths are retained in [preparation-observation.json](preparation-observation.json).
The first full checkout was interrupted on identifying the prior no-space
failure; Git removed its partial checkout. The new sparse worktree is 46 MB.

After Root selects the exact RC2 candidate and activation, the local operator
installation entry is:

```sh
/opt/homebrew/bin/node /Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/install-rc2.mjs
```

The script pins RC2 source, artifact, Product, manifest and content identities;
refuses existing install and receipt paths; imports the Product installer from
the exact RC2 archive bootstrap; uses `verifyProduct`, a resolved lock and
`installProduct`; then compares every archive member to the installed payload.
It creates and preserves fresh evidence. A failure may leave a partial new
activation or install directory; inspect and preserve it, return for triage,
and do not automatically retry or erase it. It does not run native work or
call a provider. The code has been syntax-checked, not executed.

After the selected installation has succeeded and Root separately selects
fresh Public workspace setup, the prepared entry is:

```sh
/opt/homebrew/bin/node /Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/operator-client/prepare-worksite.mjs
```

It checks the actual installation and manifest, re-verifies the exact RC2
archive, and creates fresh Public workspace, consumer, lock, catalog, install
and event resources. It records only inherited environment **names** in its
setup records. It does not invoke an LLM provider. This entry is also only
syntax-checked. It relies on byte-identical copies of the four existing RC1-era
generic Public helpers; the new entry explicitly supplies the RC2 root and
fresh coordinates. Preserve ABI schema-version `5.0.0`, `@5` contracts and
consumer test Product identity; they are not RC1 selectors. Do not call the
copied generic runner's ambient fixture/archive defaults from this carrier.
Select explicit paths and regenerate the consumer for RC2.

Before any actual task, bind its original owner outcome, original criteria,
protected source/basis, exact mutable territory, and the complete dynamic test
and source closure in its actual snapshot. The sparse checkout and tarball do
not by themselves prove that closure. No RC3 repair contract, adapter, model
budget, or provider call is selected by these preparation commands.

Read-only source inspection found RC1 package-version literals in the existing
`t287-default-library` and `t287-default-library-fulfillment` owner fixtures,
as well as other historical qualification fixtures. These are affected fixture
identity questions if selected, not established RC2 runtime regressions. Do
not globally rewrite history. The existing `refresh-candidate-basis.mjs`
derives candidate package identity from the actual generated manifest.

The [GC-03 release proposal](gc03-local-release-proposal.json) is the preserved
pre-decision record. Its null decision/install fields describe that earlier
state. The later local release receipt and exact-byte installation are recorded
in [GC03_LOCAL_RELEASE.md](GC03_LOCAL_RELEASE.md). A separate ABG runtime
binding remains future work; do not treat the local release as an admission.
