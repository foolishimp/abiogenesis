# ABG Method Trace Closure Guard Derivation

**Status**: Active
**Date**: 2026-05-07
**Ticket**: T-123

## Boundary

This is a local ABG proof guard over repo artifacts. It does not replace
SPEC_METHOD, TICKET_METHOD, or DESIGN_MODULE_METHOD.

## Guard Inputs

- code, test, and design file text
- ticket file text
- ticket frontmatter and checklist state

## Failure Classes

- `broad_requirement_trace`: a method-governed file cites a requirement family
  such as `REQ-R-ABG3-EVENTS` while no specific requirement id such as
  `REQ-R-ABG3-EVENTS-018` is present.
- `completed_ticket_with_open_checklist`: a ticket claims `status: completed`
  while still containing unchecked checklist items.
- `missing_design_module_review`: a design-governed ticket lacks a recorded
  `## Design Module Review` outcome.

## Global Consolidation

This pattern is a candidate for `specification_methodology` tooling after ABG
uses it locally. It should be promoted only as generic method tooling, not as an
ABG-specific rule.
