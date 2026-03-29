# Genesis SDLC User Guide

Version: 1.0rc1

## Installation

Install the ABG kernel first, then install the genesis_sdlc release into the target workspace.
Use `genesis start` (`gen-start`), `genesis iterate` (`gen-iterate`), and `genesis gaps` (`gen-gaps`)
from the installed workspace.

## First Session

Raise or inspect intent, run `genesis gaps`, and review the current delta before iterating the next
edge. Treat the event stream as the durable record of approvals, assessed results, and convergence
state.

## Operating Loop

`F_D` closes deterministic checks, `F_P` performs bounded construction or assessment, and `F_H`
approves release-critical gates. Delta falls as each blocking edge is satisfied; keep iterating until
the required release edges are closed.

## Recovery

If `fd_gap` appears, repair the deterministic surface and rerun gap analysis. If `fp_dispatch`
appears, complete the bounded construction or assessment and submit the result. If an `fh_gate`
appears, perform the required review and approval. Re-run `genesis gaps` after each recovery step.

## Requirement Tags

- REQ-PROJ-STARTER-001
