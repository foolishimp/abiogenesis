# WRITING_GUIDE

Guide. Owns the practical writing discipline for this method's surfaces:
the core rule, style rules, habits to remove, the marks of good and bad
prose, alignment of tone with the authority layer, practice for
specification artifacts, the layer checks and present-tense writing of the
current surface. Consumes [SPEC_METHOD §2](SPEC_METHOD.md#2-the-chain)
(the chain, its layers and the specification surface rule) and
[§6](SPEC_METHOD.md#6-lineage-and-release) (the release version boundary),
and [POSTING_GUIDE](POSTING_GUIDE.md) (the commentary layer); defines none
of them. Every clause names the principle that requires it (P0 to P6,
FOUNDATIONS §3).

## 1. Core rule

Write for a reader who is technically fluent and short on time (P0).

State the claim. State the reason. Remove the performance around them
(P2).

## 2. Style rules

1. Prefer direct positive statements over contrast framing (P1).
2. Remove setup paragraphs that announce what a section will say (P2).
3. Use concrete nouns and verbs, not motivational or promotional
   language (P1).
4. Keep one claim per sentence when possible (P1, P6).
5. Prefer precise technical vocabulary over vague intensifiers (P1).
6. Use an example only when it reduces ambiguity (P2, P1).
7. Do not write filler transitions whose only purpose is tone (P2).

## 3. Habits to remove

Remove these habits (P2):

- "not X, but Y"
- "simply"
- "just"
- "clearly"
- "obviously"
- "powerful"
- "robust"
- "seamless"
- "game-changing"
- generic reassurance
- dramatic phrasing

They usually add tone and no information (P2).

## 4. Good prose

Good prose on these surfaces is factual, bounded, explicit about
authority, explicit about uncertainty and easy to challenge (P6, P4b).

A sentence that sounds polished and carries no new constraint or
observation is cut (P2).

## 5. Bad prose

Bad prose on these surfaces (P6, P1):

- implies conclusions instead of grounding them;
- repeats one claim in different words;
- mixes current reality with target intent without labelling the
  difference;
- explains basic concepts to an expert audience; or
- turns straightforward instructions into brand language.

## 6. Tone and authority layer

Method documents should sound constitutional. Requirements should sound
normative. Design should sound structural. Commentary should sound
analytical (P6).

Where the tone does not match the authority layer, rewrite it (P6).

## 7. Specification artifact practice

[SPEC_METHOD §2](SPEC_METHOD.md#2-the-chain) is the constitutional
authority for the roles and closure of the specification layers; this
guide supplies the practical writing discipline for those artifacts (P6).

When writing a specification artifact (P3, P6):

- state the current live truth, not a narrated transition;
- keep each sentence in its right layer;
- remove stale law, as §9 states; and
- keep design detail out of constitutional layers unless the detail is
  itself constitutional.

A sentence that sounds informative and changes no authority, constraint
or derivability is cut (P2, P6).

## 8. Layer checks

When writing or revising a specification artifact, ask (P2, P6):

1. Can the next downstream layer derive from this?
2. Does this artifact state current truth rather than work in progress?
3. Does any sentence belong in a lower layer instead?

If any answer is wrong, rewrite or delete (P2).

## 9. Current-surface writing

The rule for current-surface writing, with its force, is the
[SPEC_METHOD §2 Specification surface rule](SPEC_METHOD.md#specification-surface-rule):
constitutional specification is written in the present tense, material
that is no longer live is deleted, superseded or moved to commentary, and
an explicit version label is reserved for an immutable release fact, a
selector binding, or clearly historical or superseded material (P3). This guide adds the writing practice:
during a change wave prefer terms such as active, current, base, live,
shared and tenant-local (P3).
