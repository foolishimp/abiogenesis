# GTL And ABG Scenario Assets

This directory carries requirement-level scenario assets and testcase
decompositions. It does not define the ABIogenesis 5.0 Product scenario set.

The sole live Product scenario identities and boundaries are:

- `PRODUCT.md` section `Required Product Scenarios`; and
- `requirements/product/REQ-P-SCENARIOS.md`.

Those surfaces preserve identities `ABG5-S01` through `ABG5-S07` and the
exact `ABI5-ROOT-001` governor. ABIogenesis 5.0 selects `ABG5-S01`,
`ABG5-S02`, `ABG5-S03`, `ABG5-S05`, `ABG5-S06`, and release scenario
`ABG5-S07`; `ABG5-S04` is reserved for planned 5.1 work. Files in this
directory may supply test cases, negative examples, and requirement-family
coverage only after an explicit mapping to a selected release scenario or an
explicitly selected successor scenario. They may not add a release scenario,
weaken the root outcome, substitute component evidence, or retain an older
Product identity.

## Retained Assets

- `01-language-primitives-and-traversal.md` through
  `08-derived-artifact-governance.md` carry focused language/runtime examples.
- `09-research-product-lab-scenario-catalog.md` is retained as historical and
  downstream research-product input; it is not an ABIogenesis 5.0 release
  scenario.
- `10-total-assurance-projection-uat.md` and
  `11-event-sourced-payload-ledger-uat.md` carry focused ABG UAT inputs.
- `TESTCASE_AUTHORITY.md` maps focused assets to requirement families. Product
  closure still requires the exact installed Product scenarios.

## Use Rule

A focused scenario may prove a subordinate requirement. It projects Product
progress only when the accepted scenario mapping shows that its result reduces
the current typed frontier of `ABI5-ROOT-001` or another required Product
scenario. Preservation, fixture coverage, or a green component lane is not a
Product outcome by itself.
