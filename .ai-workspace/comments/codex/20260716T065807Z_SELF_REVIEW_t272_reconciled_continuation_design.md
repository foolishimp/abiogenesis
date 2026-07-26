# T-272 Reconciled Continuation Design Self-Review

## Subject

- ticket: `T-272`
- semantic candidate digest independently reviewed: `879e461083b4e139432d4bfd24af45885ad4baa52e0a76f1a9f135e02c29258f`
- final accepted design digest: `1b879535201080f5ed7da4bc781bd447fa46c72ad5f500c71e73e0b0ed62b0b2`
- accepted T-270 dependency digest: `71076f364d06a9725b5482ee0cdc84e64d29a4c18447a5ab4c41e1b62ba7f430`
- ontology digest: `f817a7e730bec935f053138e85cb09aa6e0f693e558eaf287be502803da20ee8`

## Result

The design uses two public invocations over one shared definition/admission
family. `interaction.respond` admits attributed response truth through AF-18.
A later `run.continue` admits and consumes the exact replay continuation for the
current `ConstructionIntent` through AF-17. Neither route selects a new action;
new work crosses AF-13, AF-14, and AF-15.

AF-11 consumes lineage, prior model, and admitted product truth. AF-12 alone
adds mutable worksite/replay observation and emits snapshot/gap truth. AF-13
then evaluates the next action. Successful AF-17 admission emits one
`FhInteractionResumeAdmittedEvent` and resolves the open continuation exactly
once. A repeated F_H hold opens a causally linked continuation before AF-16 and
remains nonterminal.

Independent review rejected two intermediate candidates. Repairs added common
public admission for both operations, corrected One Surface ordering and AF-11
inputs, separated ingress from internal continuation admission, removed a
double continuation resolution, made actor equality policy-conditional, kept
repeat holds nonterminal, and bound the exact accepted T-270 design.

## Gates

- exact design Mermaid: 3/3 rendered with the pinned renderer
- Pandoc: pass
- Prime contraction: pass
- DS governance: pass
- `git diff --check`: pass

The preserved runtime wave remains provisional until reconciled to this design
and independently reviewed.
