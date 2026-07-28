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
  var lanes = [];
  var frameId = 0;
  var lastFrame = 0;
  var running = false;
  var pointer = { x: 0, y: 0, active: false };
  var sequenceTokens = ["A", "C", "G", "T", "V", "L"];

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

  function tokenFor(index, count, laneIndex) {
    var progress = index / Math.max(1, count - 1);

    if (progress < 0.38) {
      return index % 2 === 0
        ? sequenceTokens[(index + laneIndex * 2) % sequenceTokens.length]
        : "";
    }

    if (progress < 0.78) {
      return index % 3 === 1 ? "z" + ((index + laneIndex) % 8) : "";
    }

    return index === count - 2 ? "f↑" : "";
  }

  function buildField() {
    var random = seededRandom(1701);
    var laneCount = width < 700 ? 2 : 3;
    var pointCount = width < 700 ? 8 : 13;

    lanes = [];

    for (var laneIndex = 0; laneIndex < laneCount; laneIndex += 1) {
      var lane = [];
      var baseY =
        laneCount === 1 ? 0.5 : 0.18 + (laneIndex / (laneCount - 1)) * 0.64;

      for (var pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
        lane.push({
          u: (pointIndex + 0.45) / pointCount,
          v:
            baseY +
            Math.sin(pointIndex * 0.82 + laneIndex * 1.4) * 0.022 +
            (random() - 0.5) * 0.024,
          phase: random() * Math.PI * 2,
          speed: 0.08 + random() * 0.08,
          drift: 2 + random() * 4,
          token: tokenFor(pointIndex, pointCount, laneIndex),
          stage:
            pointIndex / (pointCount - 1) < 0.38
              ? 0
              : pointIndex / (pointCount - 1) < 0.78
                ? 1
                : 2,
        });
      }

      lanes.push(lane);
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

  function positionFor(point, time) {
    var x =
      point.u * width +
      Math.sin(time * point.speed + point.phase) * point.drift;
    var y =
      point.v * height +
      Math.cos(time * point.speed * 0.72 + point.phase) * point.drift;

    if (pointer.active) {
      var deltaX = pointer.x - x;
      var deltaY = pointer.y - y;
      var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      var radius = 150;

      if (distance < radius && distance > 0) {
        var influence = Math.pow(1 - distance / radius, 2) * 0.025;
        y += deltaY * influence;
      }
    }

    return { x: x, y: y };
  }

  function drawPoint(point, position) {
    context.fillStyle =
      point.stage === 1
        ? "rgba(0, 115, 230, 0.16)"
        : "rgba(12, 32, 67, 0.12)";

    if (point.stage === 0) {
      context.fillRect(position.x - 1, position.y - 1, 2, 2);
    } else if (point.stage === 1) {
      context.beginPath();
      context.arc(position.x, position.y, 1.25, 0, Math.PI * 2);
      context.fill();
    } else {
      context.save();
      context.translate(position.x, position.y);
      context.rotate(Math.PI / 4);
      context.fillRect(-1.2, -1.2, 2.4, 2.4);
      context.restore();
    }

    if (point.token) {
      context.font = "500 7px 'IBM Plex Mono', monospace";
      context.fillStyle = "rgba(12, 32, 67, 0.11)";
      context.fillText(point.token, position.x + 6, position.y - 6);
    }
  }

  function draw(time) {
    context.clearRect(0, 0, width, height);

    var positionsByLane = [];

    for (var laneIndex = 0; laneIndex < lanes.length; laneIndex += 1) {
      var lanePositions = [];

      for (var pointIndex = 0; pointIndex < lanes[laneIndex].length; pointIndex += 1) {
        lanePositions.push(positionFor(lanes[laneIndex][pointIndex], time));
      }

      positionsByLane.push(lanePositions);
    }

    context.lineWidth = 0.6;
    context.setLineDash([1, 6]);

    for (var drawLaneIndex = 0; drawLaneIndex < lanes.length; drawLaneIndex += 1) {
      var positions = positionsByLane[drawLaneIndex];

      context.beginPath();
      context.moveTo(positions[0].x, positions[0].y);

      for (var lineIndex = 1; lineIndex < positions.length; lineIndex += 1) {
        context.lineTo(positions[lineIndex].x, positions[lineIndex].y);
      }

      context.strokeStyle = "rgba(0, 115, 230, 0.075)";
      context.stroke();

      for (var nodeIndex = 0; nodeIndex < lanes[drawLaneIndex].length; nodeIndex += 1) {
        drawPoint(lanes[drawLaneIndex][nodeIndex], positions[nodeIndex]);
      }
    }

    context.setLineDash([]);

    if (lanes.length > 1) {
      context.lineWidth = 0.45;

      for (var crossLane = 0; crossLane < lanes.length - 1; crossLane += 1) {
        for (
          var crossIndex = 2;
          crossIndex < positionsByLane[crossLane].length;
          crossIndex += 4
        ) {
          context.beginPath();
          context.moveTo(
            positionsByLane[crossLane][crossIndex].x,
            positionsByLane[crossLane][crossIndex].y
          );
          context.lineTo(
            positionsByLane[crossLane + 1][crossIndex].x,
            positionsByLane[crossLane + 1][crossIndex].y
          );
          context.strokeStyle = "rgba(12, 32, 67, 0.035)";
          context.stroke();
        }
      }
    }

    for (var pulseLane = 0; pulseLane < lanes.length; pulseLane += 1) {
      var laneProgress = (time * 0.028 + pulseLane * 0.29) % 1;
      var segmentFloat =
        laneProgress * (positionsByLane[pulseLane].length - 1);
      var segmentIndex = Math.floor(segmentFloat);
      var segmentMix = segmentFloat - segmentIndex;
      var start = positionsByLane[pulseLane][segmentIndex];
      var end =
        positionsByLane[pulseLane][
          Math.min(segmentIndex + 1, positionsByLane[pulseLane].length - 1)
        ];
      var pulseX = start.x + (end.x - start.x) * segmentMix;
      var pulseY = start.y + (end.y - start.y) * segmentMix;

      context.beginPath();
      context.arc(pulseX, pulseY, 1.6, 0, Math.PI * 2);
      context.fillStyle = "rgba(0, 115, 230, 0.24)";
      context.fill();
    }
  }

  function animate(timestamp) {
    if (!running) return;

    if (timestamp - lastFrame > 40) {
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
      revealItems[index].style.setProperty("--reveal-index", String(index % 6));
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
      { rootMargin: "0px 0px -5% 0px", threshold: 0.06 }
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
