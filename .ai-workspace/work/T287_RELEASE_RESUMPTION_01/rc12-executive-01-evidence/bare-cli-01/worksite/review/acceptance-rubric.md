# Acceptance rubric

Review: acceptance

The candidate is the realization file of the amended requirement that no
other requirement shares. The declared sources include the amended
requirement and its tests. Acceptance covers the whole amended requirement;
each declared review covers only its own frame.

- A1: Every example of the amended requirement holds for whole orders. Check: every example of each requirement among the sources holds through priceOrder in src/order.mjs.
- A2: Every declared test command passed on the current files. Check: every command of the current Testing result exited zero.
- A3: No declared source changed. Check: every source matches its declared digest.
