# T-270 Reconciled run.invoke Design Self-Review

## Subject

- ticket: `T-270`
- initial semantic candidate digest independently reviewed: `8cc950590ab90e3c284f371434d2accbc472db3162a2fb46761dc7e581f76525`
- final accepted design digest: `71076f364d06a9725b5482ee0cdc84e64d29a4c18447a5ab4c41e1b62ba7f430`
- ontology digest: `f817a7e730bec935f053138e85cb09aa6e0f693e558eaf287be502803da20ee8`

## Result

The design now makes the admitted GTL program the constructive carrier and ABG
its interpreter. Public ingress admits and transports only. AF-11 model
synthesis, AF-12 gap evaluation, AF-13 action selection, AF-14 intent admission,
T-270/AF-15 invocation admission, and AF-16 action evaluation remain distinct.

T-270 begins with an admitted `ConstructionIntent`. It verifies the exact
program, GraphFunction membership, catalog view, workspace binding, invocation
authority, compiler chain, and capability facts; derives a subordinate
non-effect start-admission witness without mutating T-267; admits the sole
effect-authorizing `ExecutionBasis`; and enters the T-271 interpreter. Vector,
locus, declared request, result authority, static admission, basis event, and
four result variants remain visible across all three views.

Independent review rejected three intermediate candidates. Repairs added ABG as
the interpreter, restored locus/result/basis-event structure, separated all
runtime outcomes, removed the T-272 dependency cycle, separated AF-11/AF-12,
routed the final projection back through ingress, and contracted the proposed
duplicate effect authority into a non-effect witness. Final independent review
accepted the exact semantic candidate.

## Gates

- exact design Mermaid: 3/3 rendered with the pinned renderer
- Pandoc: pass
- Prime contraction: pass
- DS governance: pass
- `git diff --check`: pass

The preserved dirty runtime remains provisional until reconciled to this
accepted design and independently reviewed.
