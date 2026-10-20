# Schedule Run Projection And SLA Analytics

**Status**: Active
**Date**: 2026-05-06
**Ticket**: T-119

`TemporalProjection` exposes eligible vector indexes, pending timer intents,
fired timer outcomes, and scheduled continuations. It is a read model.

SLA analytics consume temporal projection plus aggregate projection. If a
vector is temporally eligible but not closed, the analytics surface may emit a
drift observation. That observation does not close or fail the traversal by
itself.
