# Impact review rubric

Review: impact

The candidate is the impact assessment written for one amended requirement.
Each criterion is one line: an identifier, the criterion, and a check that a
deterministic reader can apply to the candidate and the declared sources.
"The trace" is the Traceability table of specification/PRODUCT.md.

- I1: The assessment records exactly one STDO change class. Check: line "Change class" names one of goal_reprice, intent_reprice, product_reprice, requirement_reprice, design_reframe, realization_refactor.
- I2: A change to a requirement's rule re-enters at Requirements. Check: line "Change class" names one of requirement_reprice.
- I3: The assessment names the amended requirement. Check: line "Amended requirement" names the requirement among the sources.
- I4: Every file traced to the amended requirement is listed as affected. Check: line "Affected surfaces" lists every file the trace gives that requirement.
- I5: Every other requirement, and every file traced only to it, is listed as preserved. Check: line "Preserved surfaces" lists every requirement and file the trace gives only other requirements.
