---
layout: default
title: MIRA — Molecular Intelligence and Reasoning Agent
feature_project: true
---

<section class="mira-hero" aria-labelledby="mira-title">
  <div class="mira-coordinate" data-reveal>
    <span>Featured project / 01</span>
    <span>Structure → evidence → decision</span>
  </div>

  <div class="mira-intro" data-reveal>
    <p class="mira-kicker">Structure-first protein reasoning</p>
    <h1 id="mira-title" class="mira-title">
      <span>MIRA</span>
      <small>Molecular Intelligence<br>and Reasoning Agent</small>
    </h1>
    <p class="mira-tagline">Reasons over structures,<br>not just sequences.</p>
    <p class="mira-lede">MIRA is a planning-first agent that turns questions about biomolecular structures into validated tool calls, structural evidence and interpretable decisions.</p>

    <div class="mira-actions">
      <a class="mira-primary-link" href="https://github.com/joshgilligan17/MIRA_Public" target="_blank" rel="noopener">
        Explore the public repository <span aria-hidden="true">↗</span>
      </a>
      <span class="mira-stack">Python · FastAPI · React</span>
    </div>
  </div>

  <div
    class="mira-visual"
    data-mira-visual
    data-reveal
    role="img"
    aria-label="Animated protein backbone surrounded by a planning-first reasoning loop, structural analysis tools and evidence synthesis"
  >
    <div class="mira-visual__top" aria-hidden="true">
      <span>MIRA / STRUCTURE WORKSPACE</span>
      <span class="mira-live"><i></i> REASONING ACTIVE</span>
    </div>

    <canvas id="mira-structure" aria-hidden="true"></canvas>
  </div>
</section>

<section class="mira-system">
  <header class="mira-section-heading" data-reveal>
    <span>System / 02</span>
    <h2>From question to structural evidence.</h2>
    <p>The model plans and synthesizes. Registered scientific tools collect the evidence.</p>
  </header>

  <div class="mira-flow" aria-label="MIRA reasoning workflow">
    <article data-reveal>
      <span class="mira-flow__number">01</span>
      <h3>Plan</h3>
      <p>Translate a biological question into an explicit, inspectable analysis plan.</p>
    </article>

    <article data-reveal>
      <span class="mira-flow__number">02</span>
      <h3>Validate</h3>
      <p>Check tool schemas and actual chain composition before execution.</p>
    </article>

    <article data-reveal>
      <span class="mira-flow__number">03</span>
      <h3>Execute</h3>
      <p>Run deterministic structure analysis across interfaces, surfaces and dynamics.</p>
    </article>

    <article data-reveal>
      <span class="mira-flow__number">04</span>
      <h3>Synthesize</h3>
      <p>Rank candidates and explain the structural evidence behind the decision.</p>
    </article>
  </div>
</section>

<section class="mira-build">
  <div class="mira-build__copy" data-reveal>
    <span>Built / 03</span>
    <h2>One agent.<br>Three working surfaces.</h2>
    <p>MIRA is not a single chat interface. It connects a Python reasoning agent, batch structure analysis and a local or hostable research workspace.</p>
    <a href="https://github.com/joshgilligan17/MIRA_Public" target="_blank" rel="noopener">View implementation details ↗</a>
  </div>

  <div class="mira-build__grid">
    <article data-reveal>
      <span>CLI AGENT</span>
      <strong>Ask, inspect, execute.</strong>
      <p>Interactive and plan-only modes for single-structure reasoning.</p>
    </article>
    <article data-reveal>
      <span>BATCH TRIAGE</span>
      <strong>Compare design sets.</strong>
      <p>Parallel analysis and joint ranking across PDB, CIF and mmCIF files.</p>
    </article>
    <article data-reveal>
      <span>RESEARCH WORKSPACE</span>
      <strong>See the evidence.</strong>
      <p>FastAPI and React workspace with jobs, tables, 3D inspection and reports.</p>
    </article>
  </div>
</section>

<section class="mira-evidence">
  <header data-reveal>
    <span>Evaluation / 04</span>
    <h2>Reasoning measured,<br>not merely demonstrated.</h2>
  </header>

  <div class="mira-metrics">
    <div data-reveal>
      <strong>91.7<sup>%</sup></strong>
      <span>task pass rate</span>
    </div>
    <div data-reveal>
      <strong>84.2<sup>%</sup></strong>
      <span>mean tool recall</span>
    </div>
    <div data-reveal>
      <strong>82.1<sup>%</sup></strong>
      <span>mean tool precision</span>
    </div>
    <div data-reveal>
      <strong>97.2<sup>%</sup></strong>
      <span>schema-valid plans</span>
    </div>
  </div>

  <p class="mira-evidence__note" data-reveal>Live planning evaluation across 36 structural-biology tasks. MIRA remains a prototype and complements—not replaces—expert review and wet-lab validation.</p>
</section>

<section class="mira-repo" data-reveal>
  <div>
    <span>Open project / 05</span>
    <h2>Inspect the agent,<br>tools and workspace.</h2>
  </div>
  <a href="https://github.com/joshgilligan17/MIRA_Public" target="_blank" rel="noopener">
    <span>github.com/joshgilligan17/MIRA_Public</span>
    <strong aria-hidden="true">↗</strong>
  </a>
</section>
