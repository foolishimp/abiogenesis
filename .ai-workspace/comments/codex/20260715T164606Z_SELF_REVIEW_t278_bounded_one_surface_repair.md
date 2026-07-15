# Superseding Self-Review - T-278 Bounded One Surface Repair

**Date**: 2026-07-15 16:46:06Z

**Verdict**: repaired candidate; independent re-review required before F_H

**Supersedes for current verdict and evidence claims**:
`20260715T141515Z_SELF_REVIEW_t278_one_surface_target_shape_candidate.md`

## Correction

The superseded self-review overstated two facts. Its cited review artifacts did
not establish independent acceptance, and the existing Prime regression gate
does not inspect T-278. The durable independent intake instead rejects the
linked target pending two bounded repairs. This review records those repairs
without converting self-review into independent acceptance.

## Bounded Repair

1. Stable workspace authority, exact installed-product/root binding, mutable
   observation, and ABG execution authority now have distinct nominal
   carriers. `WorkspaceAuthorityBasis` and `WorkspaceBinding` remain stable
   across ordinary worksite, runtime, and replay progress. Each progress step
   creates a new `ObservationSnapshot`. Only a changed ABG `ExecutionBasis` on
   the same causal spine invokes covering-reprice or `basis_fork_detected` law;
   changed workspace authority also requires a separately admitted binding.
2. Public ingress validates, admits, hands off, and transports only. The
   admitted One Surface GTL program declares AF-11 through AF-17 ordering; ABG
   interprets that declaration and owns runtime truth. Ingress, SDK, and CLI do
   not synthesize, evaluate, select, invoke, continue, retry, or close work.

The repair changes no retained feature, atomic-family count, composition count,
public-operation count, or runtime code.

## Evidence

| Check | Result |
|---|---:|
| exact source-basis digests | 30/30 |
| discovered behavior rows | 38 unique |
| atomic families / authority rows | 27/27 unique |
| higher-order compositions | 7 |
| candidate public operations | 19 unique |
| retained feature rows | 17 unique |
| capability identities | 16 |
| Ontology Mermaid diagrams | 7/7 rendered with pinned Mermaid 11.3.0 |
| GOALS and detailed-plan Mermaid diagrams | 2/2 rendered |
| DS governance regression gate | 19 tickets, 73 references, pass |
| existing Prime regression gate | 7 earlier accepted designs and 13 candidates, pass; T-278 not inspected |
| `git diff --check` | pass |

T-278's 27/7 Prime claim is supported by its explicit whole-family contraction
and Promotion-Test matrices plus the reproduced structural census. It remains
provisional pending independent review; the green T-277 regression gate is not
evidence for accepting it.

No runtime tests were rerun. This checkpoint changes design, ticket, goal-plan,
and commentary surfaces only, while the dirty T-270/T-272 realization remains
frozen.

## Next Gate

Independent review must evaluate the repaired basis taxonomy and
orchestration-owner boundary. Only an accepting durable review permits the
explicit F_H ruling on the four linked target claims. Constitutional
propagation and runtime work remain blocked until that ruling.
