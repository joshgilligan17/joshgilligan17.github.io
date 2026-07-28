(function () {
  "use strict";

  var canvas = document.getElementById("bio-field");
  if (!canvas) return;

  var context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(pointer: fine)");
  var width = 0;
  var height = 0;
  var pixelRatio = 1;
  var nodes = [];
  var frameId = 0;
  var lastFrame = 0;
  var running = false;
  var pointer = { x: 0, y: 0, active: false };
  var tokens = ["A", "C", "G", "T", "0", "1"];

  function seededRandom(seed) {
    var value = seed >>> 0;

    return function () {
      value += 0x6d2b79f5;
      var result = value;
      result = Math.imul(result ^ (result >>> 15), result | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  }

  function buildField() {
    var random = seededRandom(1701);
    var area = width * height;
    var count = Math.max(30, Math.min(76, Math.round(area / 22000)));

    nodes = [];

    for (var index = 0; index < count; index += 1) {
      nodes.push({
        u: random(),
        v: random(),
        phase: random() * Math.PI * 2,
        speed: 0.16 + random() * 0.22,
        drift: 5 + random() * 13,
        depth: 0.45 + random() * 0.7,
        token: index % 9 === 0 ? tokens[index % tokens.length] : "",
      });
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    pointer.x = width * 0.5;
    pointer.y = height * 0.5;
    buildField();

    if (reducedMotion.matches) draw(0);
  }

  function positionFor(node, time) {
    var x = node.u * width + Math.sin(time * node.speed + node.phase) * node.drift;
    var y =
      node.v * height +
      Math.cos(time * node.speed * 0.82 + node.phase) * node.drift;

    if (pointer.active) {
      var deltaX = pointer.x - x;
      var deltaY = pointer.y - y;
      var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      var radius = 180;

      if (distance < radius && distance > 0) {
        var influence = Math.pow(1 - distance / radius, 2) * 0.055;
        x += deltaX * influence;
        y += deltaY * influence;
      }
    }

    return { x: x, y: y };
  }

  function draw(time) {
    context.clearRect(0, 0, width, height);

    var positions = [];
    var connectionDistance = Math.min(158, Math.max(116, width * 0.11));

    for (var index = 0; index < nodes.length; index += 1) {
      positions.push(positionFor(nodes[index], time));
    }

    context.lineWidth = 0.65;

    for (var first = 0; first < nodes.length; first += 1) {
      for (var second = first + 1; second < nodes.length; second += 1) {
        var deltaX = positions[first].x - positions[second].x;
        var deltaY = positions[first].y - positions[second].y;
        var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance < connectionDistance) {
          var opacity =
            (1 - distance / connectionDistance) *
            0.12 *
            Math.min(nodes[first].depth, nodes[second].depth);

          context.beginPath();
          context.moveTo(positions[first].x, positions[first].y);
          context.lineTo(positions[second].x, positions[second].y);
          context.strokeStyle = "rgba(0, 115, 230, " + opacity + ")";
          context.stroke();
        }
      }
    }

    for (var nodeIndex = 0; nodeIndex < nodes.length; nodeIndex += 1) {
      var node = nodes[nodeIndex];
      var position = positions[nodeIndex];
      var radius = 0.8 + node.depth * 0.85;
      var pointerBoost = 0;

      if (pointer.active) {
        var pointerX = pointer.x - position.x;
        var pointerY = pointer.y - position.y;
        var pointerDistance = Math.sqrt(pointerX * pointerX + pointerY * pointerY);
        pointerBoost = Math.max(0, 1 - pointerDistance / 150);
      }

      context.beginPath();
      context.arc(position.x, position.y, radius + pointerBoost * 1.1, 0, Math.PI * 2);
      context.fillStyle =
        "rgba(0, 115, 230, " + (0.11 + node.depth * 0.12 + pointerBoost * 0.2) + ")";
      context.fill();

      if (node.token) {
        context.font = "500 8px 'IBM Plex Mono', monospace";
        context.fillStyle = "rgba(12, 32, 67, " + (0.07 + node.depth * 0.045) + ")";
        context.fillText(node.token, position.x + 7, position.y - 7);
      }
    }
  }

  function animate(timestamp) {
    if (!running) return;

    if (timestamp - lastFrame > 32) {
      draw(timestamp / 1000);
      lastFrame = timestamp;
    }

    frameId = window.requestAnimationFrame(animate);
  }

  function start() {
    if (running || reducedMotion.matches || document.hidden) return;
    running = true;
    frameId = window.requestAnimationFrame(animate);
  }

  function stop() {
    running = false;
    window.cancelAnimationFrame(frameId);
  }

  function handleMotionPreference() {
    stop();
    if (reducedMotion.matches) {
      pointer.active = false;
      draw(0);
    } else {
      start();
    }
  }

  function prepareReveals() {
    if (reducedMotion.matches) return;

    var revealItems = document.querySelectorAll("[data-reveal], .content > *");
    document.documentElement.classList.add("motion-ready");

    for (var index = 0; index < revealItems.length; index += 1) {
      revealItems[index].style.setProperty("--reveal-index", String(index % 7));
    }

    if (!("IntersectionObserver" in window)) {
      for (var fallbackIndex = 0; fallbackIndex < revealItems.length; fallbackIndex += 1) {
        revealItems[fallbackIndex].classList.add("is-visible");
      }
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        for (var entryIndex = 0; entryIndex < entries.length; entryIndex += 1) {
          if (entries[entryIndex].isIntersecting) {
            entries[entryIndex].target.classList.add("is-visible");
            observer.unobserve(entries[entryIndex].target);
          }
        }
      },
      { rootMargin: "0px 0px -7% 0px", threshold: 0.08 }
    );

    for (var observerIndex = 0; observerIndex < revealItems.length; observerIndex += 1) {
      observer.observe(revealItems[observerIndex]);
    }
  }

  if (finePointer.matches) {
    window.addEventListener(
      "pointermove",
      function (event) {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
      },
      { passive: true }
    );

    document.documentElement.addEventListener("mouseleave", function () {
      pointer.active = false;
    });
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  window.addEventListener("resize", resize, { passive: true });
  reducedMotion.addEventListener("change", handleMotionPreference);

  resize();
  prepareReveals();
  start();
})();
