# B21: physical containment needs a stronger observation

Preparation on main `e981f89264ed2ad509c70cc5a397ce2e0448fa9c`. Root conjoins
the separate Design/Effect result from `/root/b29_vm_triage`, Foundation result
from `/root/b30_catalog_triage`, and the read-only host observations below.
The fixed 5.0 outcome is preservation of protected roots by the existing effect
owners. Metadata is evidence; it does not acquire ABG admission authority.
No Product, requirement, implementation, package, or accepted HOW changed.

## Counterexample to the proposed ancestry-only repair

Both `/Users/jim/src/apps/abiogenesis` and
`/System/Volumes/Data/Users/jim/src/apps/abiogenesis` are self-canonical and have
identity `16777231:146813692`. Endpoint identity detects their equality.
It does not suffice for containment:

- Select `/System/Volumes/Data` as protected root, and the first spelling as
  target. Their lexical ancestor identity lists meet only at `/`.
- The target's list does not contain the protected-root identity.
- Nevertheless, directory enumeration of the protected root contains `Users`;
  that child and `/Users` share identity `16777231:16925`. Following the target
  suffix through that observed child reaches the same target object.

Different branches beneath a common ancestor can therefore rejoin through a
firmlink. Absence from an ancestor list does not prove separation. A discovered
bridge proves overlap; failure of a few bridge probes does not prove separation.
The new observation performed no worksite effect. The earlier actual forbidden
parent creation remains in T293 B21 and `REVIEW_TD85N_CODEX.md`.

## Foundation comparison and direct observation

Ordinary Node realpath and ancestor stats cannot provide the missing relation.
A complete, bounded, fresh metadata traversal could establish a physical
closure, but a cap, permission failure, unexplored branch or unsupported
topology must yield `indeterminate`. Existing tree inventory also reads bodies
and does not establish that bounded-completeness contract.

The local public macOS SDK declares `F_GETPATH_NOFIRMLINK = 102` in
`sys/fcntl.h:325`; its `fcntl(2)` manual at lines 154–159 describes obtaining
the non-firmlinked path from an open descriptor. Apple XNU passes
`VN_GETPATH_NO_FIRMLINK` into path construction. Node 24.7 exposes no fcntl API.
Sources: [Apple dispatch](https://github.com/apple-oss-distributions/xnu/blob/main/bsd/kern/kern_descrip.c),
[Apple path construction](https://github.com/apple-oss-distributions/xnu/blob/main/bsd/vfs/vfs_cache.c),
[Node realpath contract](https://nodejs.org/download/release/v24.7.0/docs/api/fs.html#fsrealpathpath-options-callback).

Root used Python's standard-library `fcntl` only as a read-only host observer on
macOS 26.7.1 arm64. Eight directory descriptors were opened read-only with
`O_DIRECTORY | O_NOFOLLOW`, queried once, and closed. Every returned path's
device/inode matched its descriptor; descriptor identity remained unchanged.

| Inputs | Observed backing path |
|---|---|
| Both repository spellings above | `/System/Volumes/Data/Users/jim/src/apps/abiogenesis` |
| `/Users`, `/System/Volumes/Data/Users` | `/System/Volumes/Data/Users` |
| `/System/Volumes/Data` | `/System/Volumes/Data` |
| `/private/tmp`, `/System/Volumes/Data/private/tmp` | `/System/Volumes/Data/private/tmp` |
| `/` | `/` |

This establishes API availability and the witnessed alias relation on this
host. It is not a complete physical-containment implementation or an ABG test.
It selects no Python runtime dependency. A small packaged native observation
seam is the Foundation recommendation; supported topology, positive separation,
freshness, Node/package integration and ordinary constructability must be bound
in the owning HOW before implementation. No hardcoded Data-path rewrite,
arbitrary mount-alias claim, or silent realpath fallback is acceptable.

The closed Install-frame assessment confirms that `build/**` payload selection,
the generated manifest and installed-content verification already cover a
regular `.node` member. Installation is offline with scripts disabled: the
binary must be prebuilt, not compiled or downloaded by the consumer. A minimal
C Node-API v8 addon would avoid new npm dependencies and per-observation process
ownership, while TypeScript retains descriptor custody and policy. It would
require exact native sources, loader, build script/input declaration, explicit
target membership and a native build step before manifest generation. The
qualification recipe currently invokes TypeScript directly, so it also needs
that declared step and updated inputs/outputs. Pin headers, compiler, SDK,
architecture, deployment target and flags; prove clean-location binary equality
and an actual installed load/call. Node ABI stability does not prove another
OS/architecture. A helper executable has those same build costs plus process,
capture and cleanup costs. This is a concrete cost comparison, not an activated
native implementation or a change to release portability claims.

The subsequent closed Design/Effect assessment requires backing coordinates
**and complete mount metadata**, not different returned strings alone. Decide
demonstrated identity/ancestry overlap first, including protected `/` and
protected Data. Positive separation in the smallest supported construction
requires both anchors in one positively identified APFS mount instance, matching
descriptor/backing-path facts, and no unhandled attachment beneath the compared
recursive scopes. Bracket observations with matching complete mount snapshots;
truncation, bounds, inaccessible relevant records, duplicate attachments,
uncertain cross-mount relations or changed membership yield `indeterminate`.
An exact file effect does not need unrelated descendant-mount exclusion.
Rebase missing suffixes only after acquiring their real existing anchors.

Root selects that native backing-path plus mount-metadata construction for the
next bounded HOW amendment. It avoids a subtree-sized negative proof and keeps
confinement policy in its existing owners. The full mount-support acquisition,
explicit native target set, reproducible package and installed execution remain
unimplemented and unproved. The concrete conceptual falsifier for an inadequate
mount predicate is an aliasing filesystem mounted beneath a permitted write
directory exposing a protected sibling. That is not a newly measured host
effect. No cross-platform availability or performance result follows here.

## Complete selected owner cone

The bounded C0, native-work and C2 HOWs must replace their false
different-canonical-branches premise. Retain separate/overlap/indeterminate,
directional policies, existing name-model uncertainty, spelling/link checks,
full-parent preflight and truthful partial effects. Context reads must exclude
protected content before reading it. C2 host and independent helper each need
their own preflight at their existing boundary, plus currentness revalidation.

The same protected-context promise has four input omissions. Carry existing
authenticated `productInstalls[].installedRoot` values through:

1. `implementation/native_workspace_work.ts`: the shared before/after input,
   including an assessment with empty W.
2. `abg/semantic_revision.ts`: current context from `facts.owner.environment`.
3. `abg/native_work_reacquisition.ts`: retain the already authenticated
   environment through its intake into the currentness check.
4. `implementation/native_work_reacquisition.ts`: pass that authenticated
   environment to the physical context owner.

These are existing-owner inputs, not a new lookup, public schema or authority.
Keep historical reconstruction pure. Positive fixtures whose synthetic install
encloses the worksite must use a lawful sibling; retain the enclosing relation
as a meaningful negative. Do not shrink the repair by omitting those callers.

First prospective proof must include the protected-Data bridge, equal/inside/
enclosing aliases, unresolved suffixes and a lawful sibling. It then covers all
binding/install roots, the context callers and separate C2 host/helper paths.
Changed production requires newly built candidate evidence; RC13 stays the
immutable builder. No new implementation or proof pass has started.

## Correction to B31 evidence reuse

The frozen B31 `physical-topology.mjs` also treats unmatched ancestor lists as
separation. That implication is unsupported even for a finite list of roots;
do not reuse the helper as a separation proof. The completed B31 source repair
and 82-case result remain supported by their frozen diff, actual tool audit,
postimages and conserved installed/build inputs. They do not prove confinement.
Preserve the historical helper and its return rather than rewriting what ran.
Before another native author, obtain a sufficient observation for that exact
worksite, write scope and protected roots.
