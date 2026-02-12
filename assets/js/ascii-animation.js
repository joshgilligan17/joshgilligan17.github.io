(function () {
  'use strict';

  // --- Config ---
  var GRID    = 55;      // px between grid points
  var RADIUS  = 160;     // px mouse influence radius
  var FONT    = 13;      // base font size px
  var CHARS   = ['\u00B7', '\u2218', '\u25CB']; // · ∘ ○

  // --- State ---
  var W, H, grid;
  var time    = 0;
  var mouse   = { x: -9999, y: -9999 };
  var ripples = [];
  var isDark  = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // --- Canvas setup ---
  var canvas  = document.createElement('canvas');
  canvas.id   = 'ascii-canvas';
  document.body.insertBefore(canvas, document.body.firstChild);
  var ctx     = canvas.getContext('2d');

  // --- Build grid ---
  function buildGrid() {
    grid = [];
    var cols = Math.ceil(W / GRID) + 1;
    var rows = Math.ceil(H / GRID) + 1;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        grid.push({
          x:     c * GRID + GRID / 2,
          y:     r * GRID + GRID / 2,
          phase: Math.random() * Math.PI * 2,
          freq:  0.35 + Math.random() * 0.35
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

  // --- Animation loop ---
  function animate() {
    ctx.clearRect(0, 0, W, H);
    time += 0.016;

    // Age out old ripples
    ripples = ripples.filter(function (r) { return r.radius < RADIUS * 2.5; });
    ripples.forEach(function (r) {
      r.radius += 2.2;
      r.strength *= 0.965;
    });

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    grid.forEach(function (pt) {
      var dx   = pt.x - mouse.x;
      var dy   = pt.y - mouse.y;
      var dist = Math.sqrt(dx * dx + dy * dy);

      // Ambient gentle pulse
      var wave = 0.5 + 0.5 * Math.sin(time * pt.freq + pt.phase);

      // Mouse influence — smooth quadratic falloff
      var mFactor = dist < RADIUS ? Math.pow(1 - dist / RADIUS, 2) : 0;

      // Ripple influence — thin expanding ring
      var rFactor = 0;
      ripples.forEach(function (r) {
        var rdx  = pt.x - r.x;
        var rdy  = pt.y - r.y;
        var rd   = Math.sqrt(rdx * rdx + rdy * rdy);
        var diff = Math.abs(rd - r.radius);
        var ringW = 28;
        if (diff < ringW) {
          rFactor = Math.max(rFactor, r.strength * (1 - diff / ringW));
        }
      });

      // Composite opacity
      var opacity = 0.06 + wave * 0.05 + mFactor * 0.60 + rFactor * 0.45;
      opacity = Math.min(opacity, 0.90);

      // Character tier
      var ch;
      if (mFactor > 0.55 || rFactor > 0.55) {
        ch = CHARS[2]; // ○
      } else if (mFactor > 0.18 || rFactor > 0.18) {
        ch = CHARS[1]; // ∘
      } else {
        ch = CHARS[0]; // ·
      }

      // Scale up near cursor / ripple front
      var scale = 1 + mFactor * 1.4 + rFactor * 0.6;

      // Color adapts to system theme
      var rgb = isDark ? '210,210,210' : '50,50,50';
      ctx.font      = Math.round(FONT * scale) + 'px monospace';
      ctx.fillStyle = 'rgba(' + rgb + ',' + opacity + ')';
      ctx.fillText(ch, pt.x, pt.y);
    });

    requestAnimationFrame(animate);
  }

  // --- Events ---
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
    ripples.push({ x: t.clientX, y: t.clientY, radius: 0, strength: 1 });
  }, { passive: true });

  document.addEventListener('touchend', function () {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('resize', resize);

  // Respond to system color-scheme changes live
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    isDark = e.matches;
  });

  // Start
  resize();
  animate();
})();
