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

    <div class="mira-query" aria-hidden="true">
      <span>QUERY / 01</span>
      <p>Which of the candidate binders have the most favourable interactions?</p>
    </div>

    <div class="mira-plan" aria-hidden="true">
      <span>VALIDATED PLAN</span>
      <ol>
        <li style="--step: 0"><i>01</i> load_structure</li>
        <li style="--step: 1"><i>02</i> compute_interface</li>
        <li style="--step: 2"><i>03</i> compute_sasa</li>
        <li style="--step: 3"><i>04</i> rank + synthesize</li>
      </ol>
    </div>

    <div class="mira-tool-cloud" aria-hidden="true">
      <span class="mira-tool mira-tool--one">contacts</span>
      <span class="mira-tool mira-tool--two">SASA</span>
      <span class="mira-tool mira-tool--three">interface</span>
      <span class="mira-tool mira-tool--four">dynamics</span>
      <span class="mira-tool mira-tool--five">conservation</span>
    </div>

    <div class="mira-structure-label" aria-hidden="true">
      <span>STRUCTURE / candidate_03</span>
      <strong>evidence confidence&nbsp; 0.91</strong>
    </div>

    <div class="mira-agent-loop" aria-hidden="true">
      <div><span>01</span><strong>plan</strong></div>
      <i></i>
      <div><span>02</span><strong>validate</strong></div>
      <i></i>
      <div><span>03</span><strong>execute</strong></div>
      <i></i>
      <div><span>04</span><strong>synthesize</strong></div>
    </div>
  </div>

  <div class="mira-hero-note" data-reveal>
    <span>Project thesis</span>
    <p>Protein design is still bottlenecked by filtering. MIRA turns inspection into a reproducible reasoning workflow.</p>
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
      <div class="mira-flow__glyph mira-flow__glyph--query" aria-hidden="true"><i></i><i></i><i></i></div>
      <h3>Plan</h3>
      <p>Translate a biological question into an explicit, inspectable analysis plan.</p>
      <code>intent → tool graph</code>
    </article>

    <article data-reveal>
      <span class="mira-flow__number">02</span>
      <div class="mira-flow__glyph mira-flow__glyph--validate" aria-hidden="true"><i></i><i></i></div>
      <h3>Validate</h3>
      <p>Check tool schemas and actual chain composition before execution.</p>
      <code>plan × structure</code>
    </article>

    <article data-reveal>
      <span class="mira-flow__number">03</span>
      <div class="mira-flow__glyph mira-flow__glyph--execute" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <h3>Execute</h3>
      <p>Run deterministic structure analysis across interfaces, surfaces and dynamics.</p>
      <code>20+ registered tools</code>
    </article>

    <article data-reveal>
      <span class="mira-flow__number">04</span>
      <div class="mira-flow__glyph mira-flow__glyph--rank" aria-hidden="true"><i></i><i></i><i></i></div>
      <h3>Synthesize</h3>
      <p>Rank candidates and explain the structural evidence behind the decision.</p>
      <code>evidence → report</code>
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
      <code>mira "Analyze 1UBQ"</code>
    </article>
    <article data-reveal>
      <span>BATCH TRIAGE</span>
      <strong>Compare design sets.</strong>
      <p>Parallel analysis and joint ranking across PDB, CIF and mmCIF files.</p>
      <code>mira batch --folder ./pdbs</code>
    </article>
    <article data-reveal>
      <span>RESEARCH WORKSPACE</span>
      <strong>See the evidence.</strong>
      <p>FastAPI and React workspace with jobs, tables, 3D inspection and reports.</p>
      <code>structure → residue → report</code>
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
      <i style="--metric: 91.7%"></i>
    </div>
    <div data-reveal>
      <strong>84.2<sup>%</sup></strong>
      <span>mean tool recall</span>
      <i style="--metric: 84.2%"></i>
    </div>
    <div data-reveal>
      <strong>82.1<sup>%</sup></strong>
      <span>mean tool precision</span>
      <i style="--metric: 82.1%"></i>
    </div>
    <div data-reveal>
      <strong>97.2<sup>%</sup></strong>
      <span>schema-valid plans</span>
      <i style="--metric: 97.2%"></i>
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
