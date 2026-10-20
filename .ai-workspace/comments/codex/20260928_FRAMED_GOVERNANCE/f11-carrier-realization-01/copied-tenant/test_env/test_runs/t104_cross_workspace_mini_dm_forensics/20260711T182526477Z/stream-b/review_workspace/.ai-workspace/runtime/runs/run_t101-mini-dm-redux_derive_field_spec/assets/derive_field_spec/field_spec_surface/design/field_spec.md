# Field Specification

Derived from the raw problem statement. One section per output field obligation.

## REQ-FIELD-DISPLAY-NAME: display_name

Source fields: first_name, last_name.

Transformation rule: trim whitespace from each name part, then concatenate
first_name and last_name with a single space between them ("First Last").

Edge case: leading or trailing whitespace in either name part must be removed
before concatenation; double spaces collapse to one.

## REQ-FIELD-EMAIL-DOMAIN: email_domain

Source fields: email.

Transformation rule: split the email on the @ separator and take the part
after the @. If there is no @ in the email value, output null for email_domain.

Edge case: an email value with no @ character must produce email_domain = null,
not an empty string.

## REQ-FIELD-AGE: age

Source fields: birth_year.

Transformation rule: compute age = 2026 - birth_year.

Edge case: if birth_year is greater than 2026 the record is invalid and age
must be reported as null rather than a negative number.
