# Five Prime Axes and the GTL / ABG Semantic Split

## Purpose

Capture the current architectural clarification before it is lost in the V1 -> V2 rewrite discussion.

The key realization is that the system is not just "graph + runtime + security + scheduling".
It is better understood as five prime semantic axes.

These axes are not features. They are closer to irreducible dimensions of the system.

## The Five Prime Axes

### 1. Topology

Question:

- What can exist?

Meaning:

- structure
- lawful adjacency
- contracts
- interfaces
- refinement surface

This is the terrain.

### 2. Traversal

Question:

- What is being done?

Meaning:

- interpretation
- selection
- substitution
- computation over the topology

This is movement through the terrain.

### 3. Causality

Question:

- What became true?

Meaning:

- event history
- projection
- convergence
- correction
- lineage
- provenance

This is truth over time.

### 4. Orchestration

Question:

- What should happen when, and in what dependency order?

Meaning:

- jobs
- dependencies
- triggers
- schedules
- windows
- KPIs / SLAs
- runs

This is governed execution through time.

### 5. Agency

Question:

- Who may do it?

Meaning:

- role
- worker identity
- authority hooks
- approval eligibility

This is computational agency.

## GTL / ABG Split

The clean architectural split is:

- GTL = semantic declaration layer
- ABG = semantic realization / execution layer

ABG is the engine, but it is not the sole owner of semantics.
GTL is the source representation of semantics.

ABG realizes those semantics operationally through:

- traversal
- event sourcing
- projection
- convergence
- correction
- runs
- worker binding

Other engines or configurations may realize subsets of the same GTL semantics through mapping and capability profiles.

## Important Clarification

GTL should not be read as "only topology forever".

V2 may surface only enough semantics to make the engine lawful and stable.
That does not mean GTL is constitutionally limited to topology.

The better reading is:

- V2: surface only the minimum semantic set needed now
- V2.1+: widen GTL to expose more orchestration and agency semantics directly

So GTL can eventually be the semantic source for all five axes, even if V2 only exposes part of that surface directly.

## Near-Term Ownership

### GTL

Directly owns today:

- topology
- structural contracts
- graph functions
- refinement semantics

Should eventually surface more explicitly:

- semantic jobs
- roles
- dependency declarations
- trigger / schedule declarations
- KPI / policy declarations
- required authority classes or policy hooks

### ABG

Owns execution truth:

- traversal
- event sourcing
- projection
- convergence
- correction
- lineage
- provenance
- worker binding
- runs
- operational orchestration

ABG is semantic execution, not just plumbing.
But not all semantic definition should be forced into ABG.

## Agency Boundary

Authentication is outside responsibility.

The system should not recreate IAM or login flows.

The correct boundary is:

- GTL may declare role / authority requirements semantically
- ABG binds worker identity and authority references to runs
- external systems perform authentication and identity -> authority resolution

So the hooks belong in the model, but auth itself does not.

## Orchestration Clarification

Orchestration is not just scheduling.

It is:

- dependency
- trigger
- schedule
- execution window
- run history
- KPI evaluation

This means a semantic job can accumulate runs over time, and those runs can be evaluated against lateness, breach, retry, or SLA history.

Example:

- Job: `end_of_day_liquidity_calc`
- Schedule: `4pm daily`
- Observation: last 5 runs were late
- Result: KPI not met

That is orchestration as a semantic axis, not merely a cron setting.

## Architectural Consequence

The rewrite should stop assuming:

- GTL = structure only
- ABG = all other meaning

The better model is:

- GTL declares semantics
- ABG realizes semantics
- capability mappings allow alternate realizations

This is the clean basis for V2 now and V2.1 later.
