# STDO Refresh Procedure

Reload one complete registry entry from exactly one selected STDO basis. An
entry is a declared bundle, owning member or task frame of this method. This is a read-only context
projection; it does not create a partial constitution.

## Inputs

Exactly one basis mode is required:

- `--installed`: discover the applicable Product Definition and use its pinned,
  verified installed basis;
- `--release <product-local-cut>`: resolve immutable product-local cut
  `v<version>-rc.<n>` through the STDO manager; or
- `--candidate`: load mutable methodology source and label it non-operative.

Optional `--doc <name>` selects one registry entry. `--list` prints the
registry and stops. With neither, load the `spec` entry.

## Registry

Each bundle loads its listed members in order. Owner and task entries
select narrower acquisition without changing the complete selected basis. A member listed without sections
loads in full. A listed section loads in full with all its subsections, up
to the next heading at its own level or shallower.

| Name | Members |
|---|---|
| `frame` | `REFERENCE_FRAME.md`; `FOUNDATIONS.md` §2 and §4; `ACTIVATION.md` §1 to §4 and §7; `EVALUATION.md` §7 |
| `frame-baseline` | `EXECUTIVE_BASELINE.md`; `ASSURANCE.md` §7 to §13; `EVALUATION.md` §4 |
| `spec` | `SPEC_METHOD.md`; `ACTIVATION.md`; `PRODUCT_DEFINITION.md`; `ASSURANCE.md`; `EVALUATION.md`; `TICKETS.md`; `FOUNDATIONS.md` §2 and §3; `PROFILES.md` §2 and §3 |
| `design` | `DESIGN_MODULE.md`; `ASSURANCE.md` §14 to §16; `ACTIVATION.md` §1, §4 and §6; `SPEC_METHOD.md` §2; `FOUNDATIONS.md` §4 |
| `odd` | `ODD.md` |
| `ux` | `UX.md`; `TICKETS.md` §3; `PROFILES.md` §2 |
| `writing` | `WRITING_GUIDE.md` |
| `posting` | `POSTING_GUIDE.md`; `SPEC_METHOD.md` §6 |
| `ticket` | `TICKETS.md`; `ACTIVATION.md` §1; `SPEC_METHOD.md` §3 and §7 |
| `release` | `RELEASE.md`; `FOUNDATIONS.md` §1 and §2; `PRODUCT_DEFINITION.md` §4; `EVALUATION.md` §5 |
| `identity` | `IDENTITY.md`; `RELEASE.md` §1, §3 and §8; `DESIGN_MODULE.md` §12 |
| `world` | `WORLD_MODEL.md`; `FOUNDATIONS.md` §3 |
| `glossary` | `GLOSSARY.md`; `PROFILES.md` §2 |
| `calculus` | `AXIOMATIC_CALCULUS.md` |
| `traversal` | `TRAVERSAL_OCCURRENCE.md`; `AXIOMATIC_CALCULUS.md` §8 |
| `library` | `README.md`; `PRODUCT_DEFINITION.md` §4 and §12; `RELEASE.md` §3 and §4 |

## Owner And Task Entries

The bundle names above remain available. `owner:<member>` selects one owning
member, using its exact filename without `.md`, such as
`owner:FOUNDATIONS`, `owner:ACTIVATION` or `owner:WORLD_MODEL`. Accept only a
member listed in the verified standards inventory; the local
[method entry](../../../standards/README.md) locates its scope. A full owner
read has its own acquisition cost; select a task entry when it is sufficient.

| Name | Member |
|---|---|
| `task:rf-task-a` | `frames/rf-task-a.md` |
| `task:rf-task-b` | `frames/rf-task-b.md` |
| `task:ac-task-a` | `frames/ac-task-a.md` |
| `task:traversal-task-f` | `frames/traversal-task-f.md` |
| `task:eb-task-d` | `frames/eb-task-d.md` |
| `task:dm-task-d` | `frames/dm-task-d.md` |
| `task:configuration` | `frames/configuration.md` |
| `task:binding` | `frames/binding.md` |
| `task:stale-summary` | `frames/stale-summary.md` |
| `task:bootstrap` | `frames/bootstrap.md` |
| `task:acceptance-release` | `frames/acceptance-release.md` |
| `task:member-build-assess` | `frames/member-build-assess.md` |

Task frames own no determination. Check their current source bindings and
acquire missing deciding owner sections under ACTIVATION §2; do not treat a
route as proof that the frame is sufficient for every task.

## Procedure

1. Resolve exactly one basis. For installed mode, require one Product
   Definition and verify its URI and manifest. For release mode, resolve the
   product-local cut through the manager; its Git transport may be
   project-qualified. Never substitute the moving selector. For candidate
   mode, emit:

   ```text
   [CANDIDATE] Mutable STDO authoring source loaded. This is not released consumer law.
   ```

2. Resolve the selected entry and each of its members and sections using
   [Product Basis Selection](PRODUCT_BASIS.md#read-a-member-from-that-basis),
   checking the manifest, member digest and anchor. Candidate mode uses the
   explicitly selected package and carries no released-consumer standing. Refuse
   unknown names and any fallback to a different install, local copy,
   mutable source, or nearby Product.
3. For each listed member or section, in order, read and surface it in full
   with its name, exact basis, resolved source, full content, and explicit
   end marker.
4. Conclude:

   ```text
   Active context: <name> from <basis>. The complete selected basis remains constitutional authority.
   ```

Multiple explicit calls may build a multi-document context. Daily workflow
skills should normally read only the smallest relevant source surface.
