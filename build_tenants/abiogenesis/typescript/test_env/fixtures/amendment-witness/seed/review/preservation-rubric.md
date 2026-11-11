# Preservation review rubric

Review: preservation

The candidate is the realization file that the amended requirement shares with
other requirements. The declared sources are the requirements the amendment
does not change, the files traced only to them, and the trace.

- P1: Every example of every unchanged requirement still holds for whole orders. Check: every example of each requirement among the sources holds through priceOrder in src/order.mjs.
- P2: The candidate still uses each module traced only to an unchanged requirement. Check: the candidate imports every module among the sources.
- P3: No declared source changed. Check: every source matches its declared digest.
