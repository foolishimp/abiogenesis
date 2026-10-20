# Release Method

## Position

Release process is distinct from live project specification.

Live specification defines the current constitutional truth of the project.

Release process defines how one accepted point-in-time cut is:

- evaluated
- bounded
- named
- recorded
- published

The only operative version identifier is the tapped release version.

That version is a release-process fact. It is not part of the live project
specification.

Release handling is downstream of intake triage.

A bug, feature, issue, regression, or release blocker does not enter the method
through release first. It enters through intake triage first, where the project
determines:

- the change class
- the lawful re-entry point
- the affected scope
- the downstream build, test, and evidence obligations
- whether the change remains inside the current release scope

Only after that triage may the change be treated as RC work, a new RC cycle, a
patch release, or a hotfix.

---

## Phases

The release process has three phases:

1. `release_candidate` window
2. published RC cut inside that window
3. tapped release cut

## Release Candidate Window

The release-candidate window is mutable.

Its purpose is to prove the candidate against the release criteria before the
final release number is tapped.

During the RC window:

- fixes are allowed
- qualification and operator review continue
- release notes may remain draft or RC-scoped
- the candidate branch remains mutable

Those fixes are still intake-triaged changes. The RC window does not authorize
direct code mutation without explicit scope classification.

What must remain stable during the RC window:

- the intended release scope boundary
- the release criteria being evaluated
- the candidate identity being qualified

If the intended scope changes materially, the RC should be repriced or restarted
rather than silently expanded.

## Published RC Cut

A published RC cut is an immutable point-in-time candidate cut inside the
mutable RC window.

Its purpose is to let the project:

- name the exact candidate being qualified
- publish one stable RC artifact set
- give operators and downstream consumers one concrete branch and tag to use
- continue the RC window later with a new RC cut if bounded fixes are needed

During the RC window, the project may publish multiple RC cuts:

- `rc.1`
- `rc.2`
- `rc.3`

Each published RC cut is immutable once tagged.

If more RC work is needed after one RC cut is published, the next point-in-time
candidate must receive a new RC tag rather than mutating the old RC identity in
place.

## Tapped Release Cut

The tapped release cut is the point-in-time decision that:

- the candidate passed the required evaluation
- the accepted feature set is now bounded
- one concrete release number is assigned

After the tap:

- release-scoped assets are updated with the tapped version
- the release note is finalized for that cut
- the release commit becomes the canonical release cut
- the release branch and release tag identify that cut
- that cut is no longer mutated in place

Any further change becomes a new RC cycle, patch release, or hotfix process.

If a project has not ratified a separate patch-release or hotfix method, the
default post-tap path is a new RC cycle.

---

## Candidate Flow

1. Intake-triage the candidate change set and confirm the lawful release scope.
2. Create or update the draft release note for the candidate.
3. Open or continue an RC branch for the candidate.
4. Run release-candidate qualification and operator review against that RC branch.
5. Apply bounded fixes during the RC window while preserving the declared release scope.
6. Re-run the required build, test, and evidence steps for the affected scope.
7. When the project decides the candidate is ready for RC publication, trigger the RC publish flow for one immutable RC cut.
8. If additional bounded fixes are needed after RC publication, continue the RC window and publish a new RC cut with a new RC tag.
9. When the candidate is accepted for final release, tap the release number.
10. Update release-scoped assets with the tapped release number.
11. Finalize the release note for that exact cut.
12. Commit the release cut.
13. Push the release commit.
14. Create and push the release branch with the final name.
15. Create and push the release tag.

## RC Trigger

The RC trigger is the point where the project has already decided:

- the current candidate scope is the one being qualified
- the project is ready to publish one stable RC identity for broader review or
  downstream use

The RC trigger does not mean the final release is tapped.

It means the project is ready to publish one immutable RC cut inside the still
mutable RC window.

The RC trigger should occur only when:

- the intended RC scope is stable
- the qualification bundle selected for the RC cut has passed
- RC-scoped notes and documentation describe that exact candidate
- the RC branch, RC tag, and RC note identity are internally consistent

## RC Publish Flow

Once the project decides it is ready for RC publication:

1. confirm the RC scope and RC candidate identity
2. reconcile RC-scoped release notes and RC-scoped documentation to that exact
   candidate
3. update any RC-scoped assets that must carry the RC identity
4. commit the RC cut
5. push the RC commit
6. create or update the RC branch carrier for that RC line
7. create and push the immutable RC tag for that exact cut
8. publish the RC note and any required release-scoped documentation for that
   exact RC cut

If additional RC work is required afterward, the next RC publication repeats
this flow with a new RC tag. The previous RC tag remains immutable.

---

## Naming

One lawful naming shape is:

- RC branch: `rc/<version>`
- RC tag: `v<version>-rc.<n>`
- release branch: `release/<version>`
- release tag: `v<version>`

The exact naming convention may vary by project, but the distinction between RC
identity and tapped release identity must remain explicit.

For example:

- RC branch: `rc/1.0.0`
- first RC tag: `v1.0.0-rc.1`
- second RC tag: `v1.0.0-rc.2`
- final release branch: `release/1.0.0`
- final release tag: `v1.0.0`

If a project uses a different naming convention, it must still preserve:

- one mutable RC branch identity
- one immutable RC tag per published RC cut
- one final release branch identity
- one final release tag identity

---

## Release-Scoped Assets

The tapped release version may appear in release-scoped surfaces such as:

- release notes
- release manifests
- dependency declarations
- installed-carrier metadata
- release branches
- release tags

It should not be used to describe the live constitutional project truth.

## Release Notes And Documentation States

Release notes and release-facing documentation move through distinct states:

1. draft candidate state
2. RC-scoped published state
3. final tapped-release state

The draft candidate state may remain incomplete while the RC window is still
being shaped.

The RC-scoped published state must describe the exact published RC cut. It may
still carry RC-only caveats, known limitations, or explicit candidate language.

The final tapped-release state must describe the exact accepted release cut. It
must no longer rely on unstated RC assumptions.

An RC note does not become a final release note by implication. It must be
reconciled to the final tapped cut.

## Documentation Reconciliation

Before a published RC cut, the project must reconcile the RC-facing release
surfaces for that exact RC identity.

Before a tapped release cut, the project must reconcile the final release
surfaces for that exact tapped identity.

At minimum, reconciliation should cover whatever release-scoped assets the
project actually uses, such as:

- release notes
- RC notes or known-limitation notes
- release manifests
- version references in release-facing docs
- install or operator guidance for the release cut
- branch and tag references

The method does not require every project to use every asset above.

It does require each project to know which release-scoped assets exist and to
reconcile them before publishing the relevant cut.

---

## Tap Criteria

The release tap should occur only when:

- RC qualification has passed
- required operator review is complete
- the intended release scope is stable
- the release note accurately describes the accepted cut
- release-scoped assets are internally consistent

In addition:

- the published RC lineage for that release is internally coherent
- the final release branch and final release tag point to the same accepted cut
- final release documentation has been reconciled from any prior RC-scoped wording

## External Qualification Dependencies

Some release claims depend on external backends, transports, or operator-facing
services that are not part of the local product carrier.

When a release claim depends on one of those external dependencies:

- the dependency may be treated as out-of-product for carrier and migration
  classification
- but it is still release-blocking for that claim

This means:

- a clean skip caused by an unhealthy external dependency may preserve correct
  product classification
- but it is not sufficient to tap a release that claims the dependent
  capability has passed

For example:

- if lawful self-modification MVP claims depend on the canonical installed-dev
  live bundle against a selected external backend
- then that bundle must pass against a healthy backend before the release may
  claim the MVP is delivered

---

## Open Questions

- What exact qualification bundle is mandatory before tap?
- How long may an RC remain mutable before it must be repriced or abandoned?
- What is the exact hotfix process after a tapped release?
