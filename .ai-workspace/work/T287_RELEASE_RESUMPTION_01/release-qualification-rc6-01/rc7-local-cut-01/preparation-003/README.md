# Local cut preparation003 output-slot correction

Use `node run-local-cut.mjs build|install ROOT_BINDINGS.json SHA256_HEX` with this manifest selected by Root. The unchanged auxiliary files and owner/tool pins remain referenced from preparation002.

The install phase now checks `FINAL_INSTALL_VERIFICATION.json` absent alongside release/install/install-001 roots before any install command. Build and installed-owner root checks were already early. No actual output placeholder is created; prior artifacts remain untouched. Source/acceptance/archive/activation pins remain unbound, including HS01/HS02/HS03 and S4-growth/S6 disposition.
