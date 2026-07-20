# SELF REVIEW: T-285 Direct GTL Design Candidate

## Verdict

Ready for independent exact-design review. This is not design acceptance.

## Exact Subject

| Field | Value |
|---|---|
| candidate commit | c832515cadbd41c6089cc248dc65f38f15cb748f |
| candidate tree | 5876805a25009768acb28bd416e81c71a3c69a3b |
| design path | build_tenants/abiogenesis/typescript/design/M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md |
| Git blob | 7a3679d7f29c474635c57c318934803044db4a5c |
| SHA-256 | d845c58952ba15d564467680f4e01649b8439a2dc2b1bacd7f5500328717b9e4 |
| lines | 826 |

The design file is the complete immutable review subject. Ticket, index, and
review records are mutable workflow evidence outside that subject.

## Review Results

1. Product and install, workspace binding, admitted catalog, and narrowed
   catalog view remain distinct identities.
2. GTL owns declarations and topology; the validator owns static judgment;
   HoG owns direct traversal; implementation bindings own leaf effects only;
   ABG owns admission, events, replay, transitions, and closure; public shells
   transport and project.
3. GraphFunction materialization remains GTL construction. The materialized
   graph is validated before GraphCall and Frame opening and before HoG applies
   the first transition.
4. TransitionProposal and F_D results remain candidates until ABG admission.
   PublicOutcome comes from replay rather than HoG, CLI, or fixture state.
5. Event Calculus is a deterministic ABG projection law over admitted events.
   It does not select topology or schedule work.
6. Whole-family Prime contracts the boundary to seven carrier families and six
   implementation ownership modules without equating modules with authorities.
7. The exact ABI5-ROOT-001 R1-R10 path is represented, including Product
   installation, catalog admission and narrowing, materialization, direct HoG
   entry, causal ABG truth, and two replay-derived terminal projections.
8. Positive supported-path proof and real-path mutation negatives are both
   required. Identifier scans and event co-presence cannot substitute.
9. The root-slice donor table names exact RCI and XC rows, destinations,
   retirement points, and owning proofs. No final-integration Y row enters the
   all-F_D root.
10. The existing design directory index was compressed to one active candidate
    and one historical-evidence rule; old designs retain no ambient authority.

## Mechanical Verification

- git diff --check: pass
- three Mermaid view extraction: pass
- Mermaid 11.3.0 render for class, sequence, and state views: pass
- npm run check:design: pass
- required-section and unfinished-marker probe: pass
- no runtime, test, package, generated, qualification, or release path changed

## Falsification Focus

Independent review should focus on the fixed run.invoke composition at the HoG
entry. It is lawful only if it sequences Product, validator, ABG, and leaf
owners without acquiring selection, admission, event, continuation, or closure
authority. The sequence, module dependencies, and mutation contract are
intended to make that boundary decidable.

The second focus is donor admission: exact row eligibility is not permission to
copy a file. Every admitted interior still needs a destination owner and proof
at implementation time.

