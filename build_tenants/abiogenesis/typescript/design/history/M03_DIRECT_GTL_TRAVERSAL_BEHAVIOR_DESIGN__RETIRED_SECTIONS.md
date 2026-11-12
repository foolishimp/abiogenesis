Cut from `build_tenants/abiogenesis/typescript/design/M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md` at commit `39d6cb975`, lines 1356-1394, 1418-1458, verbatim.


## 14. Donor Admission And Retirement

The correction vector remains the complete donor ledger. This design selects
only the first-slice destinations:

| Donor class | Potentially reusable interior | Successor destination | Admission proof |
|---|---|---|---|
| RC5 GTL contracts and constructors | declaration identities and typed constructors | src/gtl | type law, serialization round-trip, Product trace |
| RC5 package metadata | package-name and source-independent installation claims | new package manifest, rewritten | R1 and R2 |
| X validator diagnostics | deterministic whole-program predicates that do not lower | src/validator | mutation tests against same GTL value |
| X event and replay kernels | canonical envelopes, Event Calculus declarations, pure folds | src/abg | ordinal, append, replay, and authority tests |
| X graph and C interiors | only laws that operate on original GTL values | src/hog, src/gtl, or src/implementation according to accepted owner | direct-path proof; no compiled-plan dependency |
| X public contract shapes | only thin request/outcome schemas | src/public | no-controller dependency test |

### 14.1 Exact Root-Slice Donor Rows

| Admission cut | Exact vector rows dispositioned by this cut | Destination | Transactional retirement | Owning proof |
|---|---|---|---|---|
| D1 package and environment | RCI-04, RCI-06, RCI-07, RCI-08, RCI-11; XC04, XC14, XC30, XC31, XC32, XC34, XC36, XC38, XC45, XC46, XC47, XC48 | src/product and minimal package/test surfaces | XC31 and XC32 never enter; old package and installer exports retire when the new packed candidate satisfies R1-R4 | package identity, source-blind install, binding/catalog tests, private-runtime mutations |
| D2 GTL and validation | RCI-02, RCI-06, RCI-08; XC01, XC02, XC03, XC05, XC06, XC38, XC42, XC46, XC47 | src/gtl and src/validator | compiler-named helpers may contribute total predicates only after compiled output types and imports are absent | type tests, round-trip, valid/invalid corpus, no-plan mutation |
| D3 direct root runtime | RCI-03, RCI-04, RCI-06, RCI-07, RCI-08; XC11, XC13, XC15, XC16, XC29, XC30, XC38, XC41, XC42, XC43, XC45, XC46, XC47 | src/abg, src/hog, src/implementation, src/public, and root proof lane | old engine runner, private CLI binding, and feature-runner entrypoints retire before the installed root is invoked | R8-R10 positive path, uniform C-call spine, causal replay, controller/event/closure absence mutations |

No final-integration Y row enters the all-F_D root. Y01, Y03, and Y04 remain
archived. Y02 remains deferred to D4 and the first F_P transport slice. Every
RCI or XC row not named above retains its T-284 disposition and cannot enter
the root by adjacency.

No donor file crosses wholesale. Admission strips invalid imports, controllers,
plan types, private registries, mutable singleton truth, and feature-specific
execution. A donor interior that cannot be separated from those authorities is
rewritten from requirements.

The successor is assembled in an isolated fresh worktree where donor
implementation and tests are absent. The first promoted implementation
checkpoint transactionally replaces the canonical code, test, and package
surfaces only after the new candidate proves at least the current typed root
frontier. Old package exports retire in that same promotion; no compatibility
facade preserves prohibited identity.


## 16. Implementation Handoff

After design acceptance, one M4 implementation ticket shall:

1. create the fresh successor implementation line with donor implementation
   absent;
2. establish only the seven module boundaries named here;
3. implement R1 through R4 prerequisites with no executable placeholder;
4. implement raw admission, PublicationValidation, ProgramValidation, one
   all-F_D Program and GraphFunction, GraphValidation, and staged ABG basis
   admission;
5. implement Product implementation-resolution proposal, ABG admission,
   explicit OpenedTraversalScope, and the direct HoG and ABG bind through R10;
6. expose only the installed thin abg.cli path;
7. implement the fixed terminal and aggregate-close event payload family;
8. run the root governor after each promoted checkpoint; and
9. stop horizontal expansion until ABI5-ROOT-001 is green.

The implementation ticket may split review cuts for reliability. It may not
create another design authority, module family, program identity, or controller.

## 17. Candidate Decision

The exact M3 review subject is this design file alone at one recorded blob
digest. T-285, the design README, self-review, independent review, and F_H
receipt are mutable workflow or evidence carriers outside the subject. They
must bind the exact design digest and may not silently revise its bytes.

Review must attempt to falsify:

1. Product and requirement trace;
2. Ontology completeness and Prime contraction;
3. GTL, validator, HoG, ABG, host, catalog, and public authority separation;
4. native constructability without a compiler or adapter fiction;
5. positive root-path sufficiency;
6. behavioral absence proof for rival authorities; and
7. the feasibility of a fresh, selective-donor implementation steel thread.

Acceptance authorizes implementation of this boundary. It does not close the
root, traversal matrix, remaining Product scenarios, qualification, or release.

---

Cut from `build_tenants/abiogenesis/typescript/design/M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md` at commit `8477fbc47`, lines 110-111, verbatim.

| One Surface recursive supervision | ABG5-S03 after generic continuation |
| Consensus | ABG5-S05 through ordinary GTL and runtime paths |
