# F_H Decision - Accept T-281 P1 Central Join

## Decision

Accept exact semantic design digest
`18d9bcc559d973daac355ad768b1cf5eb8ffb7f9dcd3cd6d2c60c95e5bea1801`
for T-281 private P1 realization.

## Accepted Boundary

- one generic neutral `K`/request/projection relation carrier, with M04 alone
  adapting `project.read` keys and admitted requests;
- one exact 19-row metadata basis inherited by all 62 structural keys;
- 35 non-read keys plus 27 read cases, 196 final schemas, and 52 explicit
  non-terminal absences;
- owner projection relations execute against the full admitted invocation
  before project-read result truth; and
- one private all-or-nothing definition family with canonical definition and
  family digests.

## Verification

Two independent exact-digest reviews report no P0, P1, or P2 finding. They
verified the 19 authority/effect/event mappings and their three source digests,
the M03/M04 direction fence, catalog-scope equality, relation witness and
execution, Prime proportionality, and P1/P2 separation. Mermaid is 96/96;
Prime and DS governance pass; `git diff --check` passes.

## Fence

This authorizes private P1 implementation only. A partial family cannot admit.
No public asset, package export, SDK/CLI switch, handler switch, compatibility
surface, or P2 publication is authorized.
