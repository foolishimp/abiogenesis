# Raw Problem

Build a transformer that takes input records {first_name, last_name, email, birth_year} and produces {display_name, email_domain, age} where display_name = "First Last", email_domain is everything after the @ in email, and age = 2026 - birth_year. Edge cases: trim leading/trailing whitespace from names; treat email without an @ as a missing email_domain; treat a future birth_year as a missing age.
