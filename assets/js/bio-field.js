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
  var lanes = [];
  var frameId = 0;
  var lastFrame = 0;
  var running = false;
  var pointer = { x: 0, y: 0, active: false };
  var biologicalLayers = ["DNA", "RNA", "AA", "CELL", "Φ"];

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
    var nodeCount = width < 720 ? 26 : 54;
    var laneCount = width < 720 ? 2 : 4;

    nodes = [];
    lanes = [];

    for (var index = 0; index < nodeCount; index += 1) {
      nodes.push({
        u: 0.025 + random() * 0.95,
        v: 0.08 + random() * 0.84,
        size: 0.8 + random() * 1.8,
        phase: random() * Math.PI * 2,
        drift: 3 + random() * 8,
        token:
          index % 7 === 0
            ? biologicalLayers[index % biologicalLayers.length]
            : "",
        shape: index % 3,
      });
    }

    for (var laneIndex = 0; laneIndex < laneCount; laneIndex += 1) {
      lanes.push({
        y: 0.16 + laneIndex * (0.68 / Math.max(1, laneCount - 1)),
        bend: (random() - 0.5) * 0.22,
        phase: random(),
        speed: 0.018 + random() * 0.012,
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

  function nodePosition(node, time) {
    var x = node.u * width + Math.sin(time * 0.11 + node.phase) * node.drift;
    var y =
      node.v * height +
      Math.cos(time * 0.085 + node.phase * 1.4) * node.drift;

    if (pointer.active) {
      var deltaX = x - pointer.x;
      var deltaY = y - pointer.y;
      var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      var radius = 170;

      if (distance < radius && distance > 0) {
        var force = Math.pow(1 - distance / radius, 2) * 14;
        x += (deltaX / distance) * force;
        y += (deltaY / distance) * force;
      }
    }

    return { x: x, y: y };
  }

  function bezierPoint(progress, start, controlOne, controlTwo, end) {
    var inverse = 1 - progress;
    var inverseSquared = inverse * inverse;
    var progressSquared = progress * progress;

    return {
      x:
        inverseSquared * inverse * start.x +
        3 * inverseSquared * progress * controlOne.x +
        3 * inverse * progressSquared * controlTwo.x +
        progressSquared * progress * end.x,
      y:
        inverseSquared * inverse * start.y +
        3 * inverseSquared * progress * controlOne.y +
        3 * inverse * progressSquared * controlTwo.y +
        progressSquared * progress * end.y,
    };
  }

  function drawNode(node, position) {
    context.save();
    context.translate(position.x, position.y);
    context.fillStyle =
      node.shape === 1
        ? "rgba(8, 118, 232, 0.25)"
        : "rgba(16, 33, 62, 0.16)";

    if (node.shape === 0) {
      context.fillRect(-node.size, -node.size, node.size * 2, node.size * 2);
    } else if (node.shape === 1) {
      context.beginPath();
      context.arc(0, 0, node.size, 0, Math.PI * 2);
      context.fill();
    } else {
      context.rotate(Math.PI / 4);
      context.fillRect(-node.size, -node.size, node.size * 2, node.size * 2);
    }

    context.restore();

    if (node.token) {
      context.font = "500 7px 'IBM Plex Mono', monospace";
      context.fillStyle = "rgba(16, 33, 62, 0.15)";
      context.fillText(node.token, position.x + 7, position.y - 6);
    }
  }

  function drawNetwork(time) {
    var positions = [];

    for (var index = 0; index < nodes.length; index += 1) {
      positions.push(nodePosition(nodes[index], time));
    }

    context.lineWidth = 0.55;

    for (var source = 0; source < positions.length; source += 1) {
      var closestIndex = -1;
      var closestDistance = 190;

      for (var target = source + 1; target < positions.length; target += 1) {
        var deltaX = positions[source].x - positions[target].x;
        var deltaY = positions[source].y - positions[target].y;
        var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = target;
        }
      }

      if (closestIndex !== -1 && source % 2 === 0) {
        context.beginPath();
        context.moveTo(positions[source].x, positions[source].y);
        context.lineTo(
          positions[closestIndex].x,
          positions[closestIndex].y
        );
        context.strokeStyle =
          "rgba(8, 118, 232, " +
          (0.025 + (1 - closestDistance / 190) * 0.055) +
          ")";
        context.stroke();
      }
    }

    for (var nodeIndex = 0; nodeIndex < nodes.length; nodeIndex += 1) {
      drawNode(nodes[nodeIndex], positions[nodeIndex]);
    }
  }

  function drawLanes(time) {
    context.setLineDash([1, 9]);
    context.lineWidth = 0.65;

    for (var index = 0; index < lanes.length; index += 1) {
      var lane = lanes[index];
      var start = { x: -30, y: lane.y * height };
      var controlOne = {
        x: width * 0.32,
        y: (lane.y + lane.bend) * height,
      };
      var controlTwo = {
        x: width * 0.68,
        y: (lane.y - lane.bend) * height,
      };
      var end = { x: width + 30, y: lane.y * height };

      context.beginPath();
      context.moveTo(start.x, start.y);
      context.bezierCurveTo(
        controlOne.x,
        controlOne.y,
        controlTwo.x,
        controlTwo.y,
        end.x,
        end.y
      );
      context.strokeStyle = "rgba(8, 118, 232, 0.07)";
      context.stroke();

      var progress = (time * lane.speed + lane.phase) % 1;
      var pulse = bezierPoint(
        progress,
        start,
        controlOne,
        controlTwo,
        end
      );
      var stage = progress < 0.35 ? 0 : progress < 0.74 ? 1 : 2;
      var label =
        stage === 0
          ? biologicalLayers[
              (index * 2 + Math.floor(time * 0.7)) %
                biologicalLayers.length
            ]
          : stage === 1
            ? "AI"
            : "Φ↑";

      context.beginPath();
      context.arc(pulse.x, pulse.y, stage === 1 ? 2.5 : 2, 0, Math.PI * 2);
      context.fillStyle =
        stage === 1
          ? "rgba(8, 118, 232, 0.52)"
          : "rgba(16, 33, 62, 0.3)";
      context.fill();

      context.font = "500 7px 'IBM Plex Mono', monospace";
      context.fillStyle =
        stage === 1
          ? "rgba(8, 85, 166, 0.38)"
          : "rgba(16, 33, 62, 0.24)";
      context.fillText(label, pulse.x + 8, pulse.y - 7);
    }

    context.setLineDash([]);
  }

  function draw(time) {
    context.clearRect(0, 0, width, height);
    drawLanes(time);
    drawNetwork(time);
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
      revealItems[index].style.setProperty(
        "--reveal-index",
        String(index % 7)
      );
    }

    if (!("IntersectionObserver" in window)) {
      for (
        var fallbackIndex = 0;
        fallbackIndex < revealItems.length;
        fallbackIndex += 1
      ) {
        revealItems[fallbackIndex].classList.add("is-visible");
      }
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        for (
          var entryIndex = 0;
          entryIndex < entries.length;
          entryIndex += 1
        ) {
          if (entries[entryIndex].isIntersecting) {
            entries[entryIndex].target.classList.add("is-visible");
            observer.unobserve(entries[entryIndex].target);
          }
        }
      },
      { rootMargin: "0px 0px -7% 0px", threshold: 0.05 }
    );

    for (
      var observerIndex = 0;
      observerIndex < revealItems.length;
      observerIndex += 1
    ) {
      observer.observe(revealItems[observerIndex]);
    }
  }

  function prepareTilt() {
    if (!finePointer.matches || reducedMotion.matches) return;

    var modelWindow = document.querySelector("[data-model-window]");
    var portrait = document.querySelector("[data-tilt]");

    if (modelWindow) {
      modelWindow.addEventListener("pointermove", function (event) {
        var bounds = modelWindow.getBoundingClientRect();
        var normalizedX = (event.clientX - bounds.left) / bounds.width - 0.5;
        var normalizedY = (event.clientY - bounds.top) / bounds.height - 0.5;

        modelWindow.style.transform =
          "perspective(1100px) rotateX(" +
          normalizedY * -2.4 +
          "deg) rotateY(" +
          normalizedX * 2.8 +
          "deg)";
      });

      modelWindow.addEventListener("pointerleave", function () {
        modelWindow.style.transform =
          "perspective(1100px) rotateX(0deg) rotateY(0deg)";
      });
    }

    if (portrait) {
      portrait.addEventListener("pointermove", function (event) {
        var bounds = portrait.getBoundingClientRect();
        var normalizedX = (event.clientX - bounds.left) / bounds.width - 0.5;
        var normalizedY = (event.clientY - bounds.top) / bounds.height - 0.5;

        portrait.style.transform =
          "translate3d(18px, 0, 0) perspective(700px) rotateX(" +
          normalizedY * -5 +
          "deg) rotateY(" +
          normalizedX * 6 +
          "deg) rotate(-1.5deg)";
      });

      portrait.addEventListener("pointerleave", function () {
        portrait.style.transform =
          "translate3d(18px, 0, 0) rotate(-1.5deg)";
      });
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

  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", handleMotionPreference);
  } else {
    reducedMotion.addListener(handleMotionPreference);
  }

  resize();
  prepareReveals();
  prepareTilt();
  start();
})();
