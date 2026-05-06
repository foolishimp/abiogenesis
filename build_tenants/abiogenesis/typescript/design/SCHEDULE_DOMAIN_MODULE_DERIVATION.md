# Schedule Domain Module Derivation

**Status**: Active
**Date**: 2026-05-06
**Tickets**: T-119, T-122

## Boundary

The schedule domain owns calendar, recurrence, blackout, misfire, catch-up,
deadline consequence, and SLA interpretation policy.

ABG owns admission, event replay, temporal projection, scheduled continuation,
and traversal authority.

## First Slice

The TypeScript proof uses a stub provider ref and admitted timer outcome
events. No cloud timer, wall-clock read, cron loop, or provider state becomes
semantic law.

## Deadline Consequence Slice

T-122 selects deadline breach as the next temporal family. The schedule domain
owns the meaning of the `deadline_breach_action` value. ABG admits
`deadline_breach_admitted`, projects deadline pressure by replay, and feeds the
policy-selected action into homeostatic observation. The breach does not close,
fail, retry, or advance a graph vector by itself.
