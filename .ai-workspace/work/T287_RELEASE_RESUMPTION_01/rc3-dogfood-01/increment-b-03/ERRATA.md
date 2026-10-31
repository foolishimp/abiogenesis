# B02 historical prefix-label erratum

The frozen B03 task source `B02_DISPOSITION.md` incorrectly calls `sha256:b74c810afbab02264a3febcd4334c5a461105a65f4e42f23d665f60c6f21bf90` the “coordinate digest”. It is the **prefixDigest and full event-log SHA-256**. The actual **coordinateDigest** is `sha256:6762b31e0d7c5f13d259167c21db6bda95311b9ab5d556a1d85222873c9d65b3`.

Root classified the label as non-operative historical documentation and selected preservation of the already-preflighted source bytes. The original note was **not corrected**; this erratum supersedes its label. The actual preflight, activation and dispatcher independently bind/check the distinct machine values. B03 must derive runtime coordinates from actual native owner facts, as its task already requires, not from the historical note's literals. This erratum is operator bookkeeping outside the 936 selected task inputs.
