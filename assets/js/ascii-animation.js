(function () {
  'use strict';

  // ── Configuration ────────────────────────────────────────────
  var CELL   = 15;    // grid pitch in px
  var FONT_S = 9;     // base font size in px

  // Biological character vocabulary by cellular zone
  // 0: cytoplasm – molecular crowding, ambient background
  // 1: membrane  – phospholipid bilayer (horizontal / vertical lines)
  // 2: protein   – secondary structure (helices, sheets)
  // 3: receptor  – surface proteins, antibodies (T / Y shapes)
  // 4: nucleus   – dense organelle core (circles)
  // 5: signal    – active cytokine / second-messenger burst
  var VOCAB = [
    ['·', '.', '·', ',', '·', '.', '·', ','],
    ['─', '│', '─', '│', '╌', '╎', '─', '│'],
    ['~', '=', '≈', '─', '~', '=', '≈', '-'],
    ['Y', 'T', 'Y', 'T', '+', 'Y', 'T', '+'],
    ['O', '○', 'o', '0', 'O', '○', 'O', 'o'],
    ['*', '+', '*', '#', '+', '*', '#', '+'],
  ];

  // Cumulative probability thresholds for zone assignment (static noise → zone)
  // Empty (invisible) | cytoplasm | membrane | protein | receptor | nucleus | signal
  var ZONE_THRESH = [0.18, 0.52, 0.67, 0.79, 0.88, 0.94, 1.00];
  // Zone index = ZONE_THRESH.length means "signal" (index 5 in VOCAB = 5th zone after empty)

  // Base opacity + wave amplitude per visible zone (zones 1-6 map to VOCAB 0-5)
  var BASE_OPC = [0, 0.06, 0.10, 0.09, 0.10, 0.11, 0.13];
  var WAVE_AMP = [0, 0.04, 0.05, 0.05, 0.06, 0.07, 0.08];

  var M_RADIUS = 210;   // px – mouse influence radius
  var RING_W   = 40;    // px – ripple ring thickness

  // ── State ─────────────────────────────────────────────────────
  var W, H, cells;
  var time    = 0;
  var mouse   = { x: -9999, y: -9999 };
  var ripples = [];
  var isDark  = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // ── Canvas ────────────────────────────────────────────────────
  var canvas = document.createElement('canvas');
  canvas.id  = 'ascii-canvas';
  document.body.insertBefore(canvas, document.body.firstChild);
  var ctx = canvas.getContext('2d');

  // ── Structural noise (evaluated once per cell) ─────────────────
  // Layered sines create organic cell-shaped blobs
  function structNoise(x, y) {
    return (
      Math.sin(0.024 * x + 3.10) * Math.sin(0.019 * y + 1.72) * 0.50 +
      Math.sin(0.012 * (x + y) + 2.45) * 0.30 +
      Math.sin(0.038 * x - 0.028 * y + 5.77) * 0.20
    ); // ≈ [-1, 1]
  }

  // ── Activity noise (evaluated per frame) ──────────────────────
  function actNoise(x, y, t) {
    return (
      Math.sin(0.019 * x + 0.72 * t) * Math.sin(0.015 * y + 0.58 * t) * 0.55 +
      Math.sin(0.010 * (x + y) + 0.40 * t + 1.40) * 0.30 +
      Math.sin(0.028 * x - 0.020 * y + 0.62 * t + 2.10) * 0.15
    ); // ≈ [-1, 1]
  }

  // ── Build grid ────────────────────────────────────────────────
  function buildGrid() {
    cells = [];
    var cols = Math.ceil(W / CELL) + 1;
    var rows = Math.ceil(H / CELL) + 1;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var px  = c * CELL + CELL / 2;
        var py  = r * CELL + CELL / 2;
        var sn  = (structNoise(px, py) + 1) / 2; // normalise → [0,1]
        // Map static noise to a stable base zone (0 = empty, 1-6 = visible)
        var zone = 0;
        for (var z = 0; z < ZONE_THRESH.length; z++) {
          if (sn < ZONE_THRESH[z]) { zone = z; break; }
        }
        cells.push({
          x:     px,
          y:     py,
          zone:  zone,         // stable base zone
          phase: Math.random() * Math.PI * 2,
          freq:  0.40 + Math.random() * 0.50,
          ci:    Math.floor(Math.random() * 8),  // char-set index offset
        });
      }
    }
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;
    buildGrid();
  }

  // ── Render loop ───────────────────────────────────────────────
  function animate() {
    ctx.clearRect(0, 0, W, H);
    time += 0.013;

    // Advance ripples
    for (var ri = ripples.length - 1; ri >= 0; ri--) {
      ripples[ri].radius   += 3.0;
      ripples[ri].strength *= 0.960;
      if (ripples[ri].radius > 480) ripples.splice(ri, 1);
    }

    var rgb = isDark ? '185,215,185' : '30,30,30';

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.font         = FONT_S + 'px monospace';

    // Collect cells that need a scaled render (near mouse / ripple front)
    var scaled = [];

    for (var i = 0, n = cells.length; i < n; i++) {
      var cell = cells[i];

      // ── Mouse factor ──
      var dx   = cell.x - mouse.x;
      var dy   = cell.y - mouse.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var mF   = dist < M_RADIUS ? Math.pow(1 - dist / M_RADIUS, 1.8) : 0;

      // ── Ripple factor ──
      var rF = 0;
      for (var j = 0; j < ripples.length; j++) {
        var rp   = ripples[j];
        var rdx  = cell.x - rp.x;
        var rdy  = cell.y - rp.y;
        var rd   = Math.sqrt(rdx * rdx + rdy * rdy);
        var diff = Math.abs(rd - rp.radius);
        if (diff < RING_W) {
          var v = rp.strength * (1 - diff / RING_W);
          if (v > rF) rF = v;
        }
      }

      // ── Ambient activity ──
      var act  = actNoise(cell.x, cell.y, time);
      var wave = 0.5 + 0.5 * Math.sin(time * cell.freq + cell.phase);

      // Slowly drift the structural zone using time-varying noise
      var drift    = (act + 1) / 2 * 0.30;           // 0-0.30 perturbation
      var sn_eff   = Math.max(0, Math.min(1, (structNoise(cell.x, cell.y) + 1) / 2 + drift - 0.15));
      var zone = 0;
      for (var z = 0; z < ZONE_THRESH.length; z++) {
        if (sn_eff < ZONE_THRESH[z]) { zone = z; break; }
      }

      // ── Opacity ──
      var opacity = BASE_OPC[zone] + wave * WAVE_AMP[zone] + mF * 0.72 + rF * 0.55;
      if (opacity > 0.90) opacity = 0.90;
      if (opacity < 0.015) continue; // skip invisible

      // ── Effective zone (promoted near activation) ──
      var eZone = zone;
      if      (mF > 0.62 || rF > 0.62) eZone = 6; // signal
      else if (mF > 0.40 || rF > 0.40) eZone = 5; // nucleus
      else if (mF > 0.18 || rF > 0.18) eZone = 4; // receptor

      // VOCAB indexed 0-5, but eZone is 1-6 → subtract 1
      var vocabIdx = Math.max(0, eZone - 1);
      var set      = VOCAB[vocabIdx];

      // Slowly cycle characters (~2.5 s per step, staggered by phase)
      var cIdx = (cell.ci + Math.floor(time * 0.40 + cell.phase)) % set.length;
      var ch   = set[cIdx];

      // ── Render ──
      if (mF > 0.05 || rF > 0.05) {
        // Queue for scaled pass to avoid per-cell font changes
        scaled.push({ x: cell.x, y: cell.y, ch: ch, op: opacity, mF: mF, rF: rF });
        continue;
      }

      ctx.fillStyle = 'rgba(' + rgb + ',' + opacity + ')';
      ctx.fillText(ch, cell.x, cell.y);
    }

    // Scaled pass – characters near mouse / ripple front
    for (var k = 0; k < scaled.length; k++) {
      var sc    = scaled[k];
      var scale = 1 + sc.mF * 1.80 + sc.rF * 0.90;
      ctx.font      = Math.round(FONT_S * scale) + 'px monospace';
      ctx.fillStyle = 'rgba(' + rgb + ',' + sc.op + ')';
      ctx.fillText(sc.ch, sc.x, sc.y);
    }
    // Restore base font for next frame
    if (scaled.length) ctx.font = FONT_S + 'px monospace';

    requestAnimationFrame(animate);
  }

  // ── Events ────────────────────────────────────────────────────
  document.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  document.addEventListener('mouseleave', function () {
    mouse.x = -9999;
    mouse.y = -9999;
  });
  document.addEventListener('click', function (e) {
    ripples.push({ x: e.clientX, y: e.clientY, radius: 0, strength: 1 });
  });
  document.addEventListener('touchmove', function (e) {
    var t = e.touches[0];
    mouse.x = t.clientX;
    mouse.y = t.clientY;
  }, { passive: true });
  document.addEventListener('touchstart', function (e) {
    var t = e.touches[0];
    mouse.x = t.clientX;
    mouse.y = t.clientY;
    ripples.push({ x: t.clientX, y: t.clientY, radius: 0, strength: 1 });
  }, { passive: true });
  document.addEventListener('touchend', function () {
    mouse.x = -9999;
    mouse.y = -9999;
  });
  window.addEventListener('resize', resize);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    isDark = e.matches;
  });

  // Kick off after DOM is parsed
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { resize(); animate(); });
  } else {
    resize();
    animate();
  }
})();
