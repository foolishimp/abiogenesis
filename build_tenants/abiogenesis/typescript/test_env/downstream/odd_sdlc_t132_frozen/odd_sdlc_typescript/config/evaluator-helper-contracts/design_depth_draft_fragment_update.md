# Design Depth Draft Fragment Update Helper Contract

`evaluation-helper://odd-sdlc/design-depth/draft-fragment-update`

## Role

This helper is authority-neutral carrier mechanics for the first
`evaluate.C/F_P` design-depth content-register update.

It may:

- read the pre-created `sdlc_evaluate_content_register`
- preserve the selected composition identity fields exactly
- replace draft row refs with non-draft fragment row refs
- wrap F_P-selected section values in
  `sdlc_design_depth_register_fragment` envelopes
- publish the same register path with a temp-file then rename operation
- print compact row counts only

It must not:

- read ADR tables or product authority to decide semantic section values
- derive stack, module, component, file-target, topology, or verdict rows
- write the legacy design-depth projection
- emit runtime events, ledgers, closure decisions, traversal transitions, or
  consequence projections
- use terminal output as evaluation truth

## Inputs

- content register path
- current draft content register
- target asset type
- one F_P-selected value for every design-depth fragment section
- optional source-basis and evidence refs per section

## Output

The same content register path, updated as an atomic replacement. The updated
register remains an `evaluate.C/F_P` semantic-judgment carrier. The helper owns
only envelope mechanics; F_P owns the section values.
