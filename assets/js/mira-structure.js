(() => {
  const canvas = document.querySelector("#mira-structure");
  const visual = document.querySelector("[data-mira-visual]");

  if (!canvas || !visual) return;

  const context = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const points = [];
  const contacts = [
    [5, 22],
    [12, 39],
    [24, 48],
    [31, 58],
    [43, 67],
  ];
  const highlightedResidues = new Map([
    [12, "Y68"],
    [31, "R42"],
    [48, "D104"],
    [67, "W119"],
  ]);

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let frame = 0;
  let isVisible = true;
  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;

  for (let index = 0; index < 76; index += 1) {
    const t = index * 0.39;
    const domainShift = index > 40 ? 46 : -28;

    points.push({
      x: Math.sin(t) * 64 + Math.sin(t * 0.27) * 92 + domainShift,
      y: Math.cos(t * 0.72) * 66 + Math.sin(t * 0.18) * 74,
      z: Math.cos(t) * 58 + Math.sin(t * 0.43) * 62,
    });
  }

  const resize = () => {
    const bounds = visual.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };

  const projectPoint = (point, time) => {
    const rotateY = time * 0.00017 + pointerX * 0.28;
    const rotateX = -0.18 + Math.sin(time * 0.00023) * 0.08 + pointerY * 0.18;
    const cosY = Math.cos(rotateY);
    const sinY = Math.sin(rotateY);
    const cosX = Math.cos(rotateX);
    const sinX = Math.sin(rotateX);
    const x1 = point.x * cosY - point.z * sinY;
    const z1 = point.x * sinY + point.z * cosY;
    const y1 = point.y * cosX - z1 * sinX;
    const z2 = point.y * sinX + z1 * cosX;
    const scale = Math.min(width, height) / 420;
    const perspective = 1 + z2 / 640;

    return {
      x: width * 0.55 + x1 * scale * perspective,
      y: height * 0.52 + y1 * scale * perspective,
      z: z2,
      scale: perspective,
    };
  };

  const drawAnalysisField = (time) => {
    const centerX = width * 0.55;
    const centerY = height * 0.52;
    const radius = Math.min(width, height) * 0.25;

    context.save();
    context.translate(centerX, centerY);
    context.rotate(time * 0.00008);
    context.strokeStyle = "rgba(247, 241, 222, 0.16)";
    context.lineWidth = 0.75;
    context.setLineDash([2, 7]);

    for (let ring = 0; ring < 3; ring += 1) {
      context.beginPath();
      context.ellipse(0, 0, radius * (1 - ring * 0.13), radius * (0.38 + ring * 0.08), ring * 0.78, 0, Math.PI * 2);
      context.stroke();
    }

    context.setLineDash([]);
    context.fillStyle = "rgba(247, 241, 222, 0.32)";

    for (let index = 0; index < 18; index += 1) {
      const angle = (Math.PI * 2 * index) / 18 + time * 0.00012;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.46;
      context.beginPath();
      context.arc(x, y, index % 5 === 0 ? 2 : 1, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  };

  const drawContacts = (projected, time) => {
    contacts.forEach(([startIndex, endIndex], contactIndex) => {
      const start = projected[startIndex];
      const end = projected[endIndex];
      const pulse = (Math.sin(time * 0.003 + contactIndex * 1.7) + 1) / 2;

      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
      context.strokeStyle = `rgba(247, 241, 222, ${0.1 + pulse * 0.22})`;
      context.lineWidth = 0.75;
      context.setLineDash([3, 5]);
      context.stroke();
      context.setLineDash([]);

      const x = start.x + (end.x - start.x) * pulse;
      const y = start.y + (end.y - start.y) * pulse;
      context.fillStyle = "rgba(247, 241, 222, 0.82)";
      context.beginPath();
      context.arc(x, y, 1.7, 0, Math.PI * 2);
      context.fill();
    });
  };

  const drawBackbone = (projected) => {
    const segments = projected
      .slice(0, -1)
      .map((point, index) => ({
        start: point,
        end: projected[index + 1],
        depth: (point.z + projected[index + 1].z) / 2,
      }))
      .sort((a, b) => a.depth - b.depth);

    segments.forEach(({ start, end, depth }) => {
      const normalizedDepth = Math.max(0, Math.min(1, (depth + 170) / 340));

      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
      context.strokeStyle = `rgba(247, 241, 222, ${0.22 + normalizedDepth * 0.68})`;
      context.lineWidth = 1.6 + normalizedDepth * 3.7;
      context.lineCap = "round";
      context.stroke();

      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
      context.strokeStyle = `rgba(255, 255, 255, ${0.12 + normalizedDepth * 0.42})`;
      context.lineWidth = 0.6;
      context.stroke();
    });
  };

  const drawResidues = (projected, time) => {
    projected.forEach((point, index) => {
      if (index % 4 !== 0 && !highlightedResidues.has(index)) return;

      const isHighlighted = highlightedResidues.has(index);
      const pulse = isHighlighted ? 1 + Math.sin(time * 0.003 + index) * 0.22 : 1;
      const radius = (isHighlighted ? 4.3 : 1.5) * point.scale * pulse;

      if (isHighlighted) {
        context.strokeStyle = "rgba(247, 241, 222, 0.34)";
        context.lineWidth = 0.75;
        context.beginPath();
        context.arc(point.x, point.y, radius + 7, 0, Math.PI * 2);
        context.stroke();
      }

      context.fillStyle = isHighlighted ? "#f7f1de" : "rgba(247, 241, 222, 0.58)";
      context.beginPath();
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.fill();

      if (isHighlighted && width > 520) {
        context.fillStyle = "rgba(247, 241, 222, 0.78)";
        context.font = "7px ui-monospace, SFMono-Regular, Menlo, monospace";
        context.letterSpacing = "0.08em";
        context.fillText(highlightedResidues.get(index), point.x + 11, point.y - 9);
      }
    });
  };

  const draw = (time = 0) => {
    context.clearRect(0, 0, width, height);
    pointerX += (targetX - pointerX) * 0.045;
    pointerY += (targetY - pointerY) * 0.045;

    const projected = points.map((point) => projectPoint(point, time));
    drawAnalysisField(time);
    drawContacts(projected, time);
    drawBackbone(projected);
    drawResidues(projected, time);
  };

  const animate = (time) => {
    if (isVisible) draw(time);
    frame = window.requestAnimationFrame(animate);
  };

  visual.addEventListener("pointermove", (event) => {
    const bounds = visual.getBoundingClientRect();
    targetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    targetY = (event.clientY - bounds.top) / bounds.height - 0.5;
  });

  visual.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      isVisible = entry.isIntersecting;
    },
    { rootMargin: "120px" },
  );

  observer.observe(visual);
  window.addEventListener("resize", resize);
  resize();

  if (reduceMotion.matches) {
    draw(2800);
  } else {
    frame = window.requestAnimationFrame(animate);
  }

  reduceMotion.addEventListener("change", (event) => {
    window.cancelAnimationFrame(frame);
    if (event.matches) {
      draw(2800);
    } else {
      frame = window.requestAnimationFrame(animate);
    }
  });
})();
