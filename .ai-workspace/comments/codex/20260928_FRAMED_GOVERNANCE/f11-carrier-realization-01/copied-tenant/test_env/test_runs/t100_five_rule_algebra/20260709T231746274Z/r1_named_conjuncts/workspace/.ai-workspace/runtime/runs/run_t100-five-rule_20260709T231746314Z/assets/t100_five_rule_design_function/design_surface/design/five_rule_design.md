# Five Rule Algebra Design

## REQ-FIVE-001: Data fields

The mapper exposes the following named fields:

- id: stable row identifier
- name: normalized display name
- amount: numeric value (currency)
- created_at: ISO-8601 timestamp

## REQ-FIVE-002: Normalization rules

The following normalization rules apply at row admission:

- trim leading/trailing whitespace from string columns
- coerce empty strings to nulls
- coerce numeric strings to numbers when locale-safe

## REQ-FIVE-003: Acceptance scenarios

The following acceptance scenarios are pinned:

- given a row with a trimmed name, the output normalizedName equals the trimmed value

