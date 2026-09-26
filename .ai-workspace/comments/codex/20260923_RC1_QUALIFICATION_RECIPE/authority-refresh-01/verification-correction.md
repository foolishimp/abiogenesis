The first mechanical checker returned exit 1 because it imported parseProductManifest
from product/index.js, where that pure parser is not exported. The original checker,
stdout/stderr and first-failure.json are preserved. The corrected checker imports
that existing function from its owning product/verify_product.js module. No Product
code, predicate or generated output changed; neither generation command was repeated.
This is a Worker check harness correction, not an implementation finding.
