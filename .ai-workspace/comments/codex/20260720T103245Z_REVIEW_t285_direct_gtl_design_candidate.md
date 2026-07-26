# REVIEW: T-285 Direct GTL Design Candidate

## Reviewer

- reviewer: decorrelated read-only Codex explorer `019f7f06-e4ce-71a0-b0e9-0cda73a3f429`
- subject commit: `c832515cadbd41c6089cc248dc65f38f15cb748f`
- subject blob: `7a3679d7f29c474635c57c318934803044db4a5c`
- subject SHA-256: `d845c58952ba15d564467680f4e01649b8439a2dc2b1bacd7f5500328717b9e4`
- subject lines: `826`
- independence: read-only review with no file edits

The reviewer independently reproduced every subject identity above.

## Verdict

`REQUEST CHANGES`. M4 may not open on this subject.

## Findings

1. **P1 - Uniform C-call spine under-specified.** The design jumped from a
   generic transition proposal to a generic admission and did not model
   `c_call_opened -> c_call_fibre_selected -> c_call_evidenced(0..n) ->
   c_call_result_admitted -> c_call_judged` across ontology, functions, and
   sequence. R9 therefore lacked its mandatory causal protocol.
2. **P1 - Leaf realization had no module owner.** The design assigned the
   effect to a host implementation but omitted that owner from Prime, IACS,
   and the six-module implementation map.
3. **P1 - Declared dependencies contradicted the sequence.** Product called
   ABG despite not depending on it, and HoG called the validator despite being
   passed a validated view. The design required an undeclared adapter or cycle.
4. **P1 - ProductSet had the wrong lifecycle.** It was created from packed
   bytes and treated as one pre-install artifact. Accepted Product defines it
   as an ordered set of exact installed product identities used by workspace
   binding.
5. **P1 - Rival-path mutations were not discriminating.** A runtime could
   validate changed GTL and still execute a stale hidden plan while passing the
   stated mutations.
6. **P2 - IACS and domain projections were incomplete.** ProductSet and Run
   were omitted from relevant rows, TraversalStopRef lacked ontology and
   lifecycle entries, and ExecutionBasis did not relate to ProductSet in the
   domain view.

## Disposition

All findings are bounded M3 design repairs. They do not require Intent,
Product, or requirement re-entry. Any repair changes the immutable design
subject and requires a new blob identity, mechanical gates, independent exact
review, and direct F_H acceptance.
