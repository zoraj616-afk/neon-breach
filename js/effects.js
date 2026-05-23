const FX = (() => {
  const canvas = document.getElementById('fx-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let shakeEnd = 0;
  let flashEnd = 0;
  let flashColor = null;
  let W, H;

  // === Background state ===
  let bgParticles = [];
  let dataStreams = [];
  let hDataStreams = []; // horizontal streams
  let hexagons = [];
  let energyOrbs = [];
  let gridNodes = []; // pulsing grid intersections
  let circuitTraces = []; // animated circuit lines
  let gridOffset = 0;
  let glitchTimer = 0;
  let glitchActive = false;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initBg();
  }
  window.addEventListener('resize', resize);

  // === Initialize background elements ===
  function initBg() {
    bgParticles = [];
    dataStreams = [];
    hDataStreams = [];
    hexagons = [];
    energyOrbs = [];
    gridNodes = [];
    circuitTraces = [];

    // Floating particles — more dense
    const count = Math.floor((W * H) / 15000);
    for (let i = 0; i < count; i++) {
      bgParticles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 25,
        vy: (Math.random() - 0.5) * 25,
        size: 0.5 + Math.random() * 2,
        alpha: 0.03 + Math.random() * 0.12,
        color: ['#00fff5', '#ff00ff', '#faff00', '#00ff88', '#ff2244', '#3388ff'][Math.floor(Math.random() * 6)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.8 + Math.random() * 4,
      });
    }

    // Vertical data streams — matrix rain
    const streamCount = Math.floor(W / 35);
    for (let i = 0; i < streamCount; i++) {
      const len = 12 + Math.floor(Math.random() * 25);
      const chars = [];
      for (let j = 0; j < len; j++) {
        chars.push(String.fromCharCode(0x30 + Math.floor(Math.random() * 10)));
      }
      dataStreams.push({
        x: Math.random() * W,
        y: Math.random() * H * 2 - H,
        speed: 50 + Math.random() * 150,
        chars,
        alpha: 0.008 + Math.random() * 0.03,
        color: Math.random() > 0.3 ? '#00fff5' : '#ff00ff',
        length: len,
        charSize: 9 + Math.floor(Math.random() * 5),
      });
    }

    // Horizontal data streams
    const hStreamCount = Math.floor(H / 80);
    for (let i = 0; i < hStreamCount; i++) {
      const len = 15 + Math.floor(Math.random() * 30);
      const chars = [];
      for (let j = 0; j < len; j++) {
        chars.push(Math.random() > 0.5 ? String.fromCharCode(0x30 + Math.floor(Math.random() * 10)) : String.fromCharCode(0x41 + Math.floor(Math.random() * 6)));
      }
      hDataStreams.push({
        x: Math.random() * W * 2 - W,
        y: Math.random() * H,
        speed: 40 + Math.random() * 100,
        chars,
        alpha: 0.005 + Math.random() * 0.02,
        color: Math.random() > 0.5 ? '#faff00' : '#00ff88',
        length: len,
        charSize: 8 + Math.floor(Math.random() * 3),
      });
    }

    // Floating hexagons — more, varied sizes
    for (let i = 0; i < 14; i++) {
      hexagons.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: 20 + Math.random() * 100,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.4,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        alpha: 0.008 + Math.random() * 0.03,
        color: ['#00fff5', '#ff00ff', '#faff00', '#00ff88'][Math.floor(Math.random() * 4)],
        pulse: Math.random() * Math.PI * 2,
        filled: Math.random() > 0.7,
      });
    }

    // Energy orbs — subtle ambient glow
    for (let i = 0; i < 5; i++) {
      energyOrbs.push({
        x: Math.random() * W,
        y: Math.random() * H,
        radius: 30 + Math.random() * 80,
        alpha: 0.004 + Math.random() * 0.01,
        color: ['#00fff5', '#ff00ff', '#faff00', '#00ff88', '#ff2244'][Math.floor(Math.random() * 5)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.15 + Math.random() * 0.3,
        driftX: (Math.random() - 0.5) * 3,
        driftY: (Math.random() - 0.5) * 3,
      });
    }

    // Pulsing grid nodes (intersection points)
    const gridSpacing = 120;
    for (let x = 0; x < W; x += gridSpacing) {
      for (let y = 0; y < H; y += gridSpacing) {
        if (Math.random() > 0.3) continue;
        gridNodes.push({
          x: x + (Math.random() - 0.5) * 30,
          y: y + (Math.random() - 0.5) * 30,
          size: 1 + Math.random() * 2,
          alpha: 0.02 + Math.random() * 0.06,
          color: ['#00fff5', '#ff00ff', '#faff00'][Math.floor(Math.random() * 3)],
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.5 + Math.random() * 2,
        });
      }
    }

    // Animated circuit traces
    for (let i = 0; i < 12; i++) {
      const startX = Math.random() * W;
      const startY = Math.random() * H;
      const segments = [];
      let cx = startX, cy = startY;
      const numSeg = 3 + Math.floor(Math.random() * 5);
      for (let s = 0; s < numSeg; s++) {
        const horizontal = Math.random() > 0.5;
        const len = 40 + Math.random() * 120;
        const nx = horizontal ? cx + (Math.random() > 0.5 ? len : -len) : cx;
        const ny = horizontal ? cy : cy + (Math.random() > 0.5 ? len : -len);
        segments.push({ x1: cx, y1: cy, x2: nx, y2: ny });
        cx = nx; cy = ny;
      }
      circuitTraces.push({
        segments,
        color: ['#00fff5', '#ff00ff', '#faff00'][Math.floor(Math.random() * 3)],
        alpha: 0.01 + Math.random() * 0.02,
        progress: Math.random(),
        speed: 0.1 + Math.random() * 0.3,
        pulse: Math.random() * Math.PI * 2,
      });
    }
  }
  resize();

  // === Draw perspective grid ===
  function drawGrid(dt) {
    gridOffset += dt * 40;
    if (gridOffset > 60) gridOffset -= 60;

    ctx.save();
    ctx.globalAlpha = 0.02;
    ctx.strokeStyle = '#00fff5';
    ctx.lineWidth = 0.5;

    // Horizontal lines with perspective
    const horizon = H * 0.35;
    for (let i = 0; i < 30; i++) {
      const t = (i + gridOffset / 60) / 30;
      const y = horizon + (H - horizon) * t * t;
      ctx.globalAlpha = 0.015 * (1 - t * 0.5);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Vertical lines converging to vanishing point
    const vanishX = W * 0.5;
    for (let i = -15; i <= 15; i++) {
      const bottomX = vanishX + i * (W / 12);
      ctx.globalAlpha = 0.012;
      ctx.beginPath();
      ctx.moveTo(vanishX, horizon);
      ctx.lineTo(bottomX, H);
      ctx.stroke();
    }
    ctx.restore();
  }

  // === Draw data streams ===
  function drawDataStreams(dt) {
    for (const s of dataStreams) {
      s.y += s.speed * dt;
      if (s.y > H + s.length * 14) {
        s.y = -s.length * 14;
        s.x = Math.random() * W;
      }
      for (let i = 0; i < s.chars.length; i++) {
        const charY = s.y + i * s.charSize;
        if (charY < -s.charSize || charY > H + s.charSize) continue;
        const fade = i / s.chars.length;
        ctx.globalAlpha = s.alpha * (1 - fade * 0.8);
        ctx.fillStyle = s.color;
        ctx.font = `${s.charSize}px "Share Tech Mono", monospace`;
        ctx.fillText(s.chars[i], s.x, charY);
        if (Math.random() < 0.008) {
          s.chars[i] = String.fromCharCode(0x30 + Math.floor(Math.random() * 10));
        }
      }
    }
  }

  // === Draw floating hexagons ===
  function drawHexagons(dt) {
    for (const h of hexagons) {
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      h.rotation += h.rotSpeed * dt;
      h.pulse += dt * 1.5;
      if (h.x < -100) h.x = W + 100;
      if (h.x > W + 100) h.x = -100;
      if (h.y < -100) h.y = H + 100;
      if (h.y > H + 100) h.y = -100;

      const a = h.alpha * (0.5 + 0.5 * Math.sin(h.pulse));
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.rotate(h.rotation);
      ctx.globalAlpha = a;
      ctx.strokeStyle = h.color;
      ctx.lineWidth = 1;
      ctx.shadowColor = h.color;
      ctx.shadowBlur = 4;

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = Math.cos(angle) * h.size;
        const py = Math.sin(angle) * h.size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      if (h.filled) {
        ctx.globalAlpha = a * 0.08;
        ctx.fillStyle = h.color;
        ctx.fill();
        ctx.globalAlpha = a;
      }
      ctx.stroke();

      // Inner hexagon
      ctx.globalAlpha = a * 0.25;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + Math.PI / 6;
        const px = Math.cos(angle) * h.size * 0.5;
        const py = Math.sin(angle) * h.size * 0.5;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      // Center dot
      ctx.globalAlpha = a * 0.5;
      ctx.fillStyle = h.color;
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // === Draw horizontal data streams ===
  function drawHDataStreams(dt) {
    for (const s of hDataStreams) {
      s.x += s.speed * dt;
      if (s.x > W + s.length * 10) {
        s.x = -s.length * 10;
        s.y = Math.random() * H;
      }
      for (let i = 0; i < s.chars.length; i++) {
        const charX = s.x + i * s.charSize;
        if (charX < -s.charSize || charX > W + s.charSize) continue;
        const fade = i / s.chars.length;
        ctx.globalAlpha = s.alpha * (1 - fade * 0.8);
        ctx.fillStyle = s.color;
        ctx.font = `${s.charSize}px "Share Tech Mono", monospace`;
        ctx.fillText(s.chars[i], charX, s.y);
        if (Math.random() < 0.005) {
          s.chars[i] = Math.random() > 0.5 ? String.fromCharCode(0x30 + Math.floor(Math.random() * 10)) : String.fromCharCode(0x41 + Math.floor(Math.random() * 6));
        }
      }
    }
  }

  // === Draw pulsing grid nodes ===
  function drawGridNodes(dt) {
    ctx.shadowBlur = 0;
    for (const n of gridNodes) {
      n.pulse += n.pulseSpeed * dt;
      const a = n.alpha * (0.3 + 0.7 * Math.sin(n.pulse));
      ctx.globalAlpha = a;
      ctx.fillStyle = n.color;
      ctx.shadowColor = n.color;
      ctx.shadowBlur = 3;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // === Draw animated circuit traces ===
  function drawCircuitTraces(dt) {
    for (const c of circuitTraces) {
      c.progress += c.speed * dt;
      c.pulse += dt * 2;
      if (c.progress > 1) c.progress = 0;

      const totalSegs = c.segments.length;
      const currentSeg = Math.floor(c.progress * totalSegs);
      const segProgress = (c.progress * totalSegs) - currentSeg;

      ctx.globalAlpha = c.alpha * (0.5 + 0.5 * Math.sin(c.pulse));
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 1;
      ctx.shadowColor = c.color;
      ctx.shadowBlur = 2;

      for (let i = 0; i <= currentSeg && i < totalSegs; i++) {
        const seg = c.segments[i];
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        if (i === currentSeg) {
          const mx = seg.x1 + (seg.x2 - seg.x1) * segProgress;
          const my = seg.y1 + (seg.y2 - seg.y1) * segProgress;
          ctx.lineTo(mx, my);
        } else {
          ctx.lineTo(seg.x2, seg.y2);
        }
        ctx.stroke();
      }
    }
    ctx.shadowBlur = 0;
  }

  // === Draw energy orbs ===
  function drawEnergyOrbs(dt) {
    for (const o of energyOrbs) {
      o.x += o.driftX * dt;
      o.y += o.driftY * dt;
      o.pulse += o.pulseSpeed * dt;
      if (o.x < -o.radius) o.x = W + o.radius;
      if (o.x > W + o.radius) o.x = -o.radius;
      if (o.y < -o.radius) o.y = H + o.radius;
      if (o.y > H + o.radius) o.y = -o.radius;

      const a = o.alpha * (0.4 + 0.6 * Math.sin(o.pulse));
      const r = o.radius * (0.9 + 0.1 * Math.sin(o.pulse * 1.3));

      const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
      grad.addColorStop(0, o.color);
      grad.addColorStop(0.4, o.color + '40');
      grad.addColorStop(1, 'transparent');
      ctx.globalAlpha = a;
      ctx.fillStyle = grad;
      ctx.fillRect(o.x - r, o.y - r, r * 2, r * 2);
    }
  }

  // === Draw floating particles ===
  function drawParticles(dt) {
    ctx.shadowBlur = 0;
    for (const p of bgParticles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.pulse += dt * p.pulseSpeed;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      const a = p.alpha * (0.5 + 0.5 * Math.sin(p.pulse));
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // === Draw particle connections ===
  function drawConnections() {
    ctx.shadowBlur = 0;
    for (let i = 0; i < bgParticles.length; i++) {
      for (let j = i + 1; j < bgParticles.length; j++) {
        const a = bgParticles[i], b = bgParticles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          ctx.globalAlpha = 0.025 * (1 - dist / 80);
          ctx.strokeStyle = a.color;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  // === Glitch effect ===
  function drawGlitch(dt) {
    glitchTimer -= dt;
    if (glitchTimer <= 0) {
      glitchTimer = 3 + Math.random() * 8;
      glitchActive = true;
      setTimeout(() => { glitchActive = false; }, 80 + Math.random() * 150);
    }
    if (!glitchActive) return;

    // Horizontal slice displacement
    for (let i = 0; i < 3; i++) {
      const y = Math.random() * H;
      const sliceH = 2 + Math.random() * 8;
      const shift = (Math.random() - 0.5) * 30;
      ctx.drawImage(canvas, 0, y, W, sliceH, shift, y, W, sliceH);
    }

    // Color channel split
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(Math.random() * 10, 0, W, H);
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(-Math.random() * 10, 0, W, H);
    ctx.globalAlpha = 1;
  }

  // === Scan line sweep ===
  let scanY = 0;
  function drawScanLine(dt) {
    scanY += dt * 80;
    if (scanY > H) scanY = 0;
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = '#00fff5';
    ctx.fillRect(0, scanY, W, 2);
    ctx.globalAlpha = 0.01;
    ctx.fillRect(0, scanY - 20, W, 40);
    ctx.globalAlpha = 1;
  }

  // === Main background draw ===
  function drawBg(dt) {
    // Layer 1: Energy orbs (deepest ambient glow)
    drawEnergyOrbs(dt);
    // Layer 2: Perspective grid
    drawGrid(dt);
    // Layer 3: Circuit traces
    drawCircuitTraces(dt);
    // Layer 4: Pulsing grid nodes
    drawGridNodes(dt);
    // Layer 5: Floating hexagons
    drawHexagons(dt);
    // Layer 6: Vertical data streams
    drawDataStreams(dt);
    // Layer 7: Horizontal data streams
    drawHDataStreams(dt);
    // Layer 8: Floating particles
    drawParticles(dt);
    // Layer 9: Particle connections
    drawConnections();
    // Layer 10: Scan line sweep
    drawScanLine(dt);
    // Layer 11: Glitch
    drawGlitch(dt);
  }

  // === Combat particles ===
  class P {
    constructor(x, y, color, vx, vy, life, size) {
      this.x = x; this.y = y; this.color = color;
      this.vx = vx; this.vy = vy;
      this.life = life; this.maxLife = life; this.size = size;
    }
    update(dt) {
      this.x += this.vx * dt; this.y += this.vy * dt;
      this.life -= dt; this.vy += 120 * dt;
    }
    draw() {
      const a = Math.max(0, this.life / this.maxLife);
      ctx.globalAlpha = a;
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }

  function burst(x, y, color, count = 15, speed = 200) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
      const v = speed * (0.5 + Math.random() * 0.5);
      particles.push(new P(x, y, color, Math.cos(angle) * v, Math.sin(angle) * v, 0.5 + Math.random() * 0.4, 2 + Math.random() * 3));
    }
  }

  function beam(x1, y1, x2, y2, color, count = 15) {
    for (let i = 0; i < count; i++) {
      const t = i / count;
      particles.push(new P(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, color, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50, 0.3 + Math.random() * 0.3, 2 + Math.random() * 2));
    }
  }

  function rain(color, count = 40) {
    for (let i = 0; i < count; i++) {
      particles.push(new P(Math.random() * W, -10, color, 0, 200 + Math.random() * 200, 1 + Math.random(), 2));
    }
  }

  // === Card fly effect ===
  function cardFly(fromEl, toEl, color, callback) {
    if (!fromEl || !toEl) { if (callback) callback(); return; }
    const from = fromEl.getBoundingClientRect();
    const to = toEl.getBoundingClientRect();
    const startX = from.left + from.width / 2;
    const startY = from.top + from.height / 2;
    const endX = to.left + to.width / 2;
    const endY = to.top + to.height / 2;

    const card = document.createElement('div');
    card.style.cssText = `
      position:fixed; left:${startX}px; top:${startY}px; width:60px; height:80px;
      background:rgba(18,18,26,0.9); border:2px solid ${color}; border-radius:6px;
      box-shadow:0 0 15px ${color}; z-index:300; pointer-events:none;
      transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
      display:flex; align-items:center; justify-content:center;
      font-size:1.5rem; color:${color}; text-shadow:0 0 8px ${color};
    `;
    card.textContent = '?';
    document.body.appendChild(card);

    requestAnimationFrame(() => {
      card.style.left = endX - 30 + 'px';
      card.style.top = endY - 40 + 'px';
      card.style.transform = 'scale(0.5) rotate(10deg)';
      card.style.opacity = '0.3';
    });

    setTimeout(() => {
      card.remove();
      burst(endX, endY, color, 12, 150);
      if (callback) callback();
    }, 420);
  }

  // === Screen effects ===
  function shake(intensity = 6, duration = 250) {
    shakeEnd = Date.now() + duration;
    const el = document.getElementById('game-container');
    const start = Date.now();
    (function doShake() {
      if (Date.now() > shakeEnd) { el.style.transform = ''; return; }
      const p = 1 - (Date.now() - start) / duration;
      el.style.transform = `translate(${(Math.random() - 0.5) * intensity * 2 * p}px, ${(Math.random() - 0.5) * intensity * 2 * p}px)`;
      requestAnimationFrame(doShake);
    })();
  }

  function flash(color = '#ff0000', duration = 200) {
    flashColor = color; flashEnd = Date.now() + duration;
  }

  function dmgNumber(x, y, amount, type = 'damage') {
    const el = document.createElement('div');
    el.className = 'damage-number' + (type === 'heal' ? ' heal' : type === 'shield' ? ' shield' : '');
    el.textContent = (type === 'heal' ? '+' : '-') + amount;
    el.style.left = x + 'px'; el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  // === Main loop ===
  let lastT = performance.now();
  (function loop(now) {
    const dt = Math.min((now - lastT) / 1000, 0.05); lastT = now;
    ctx.clearRect(0, 0, W, H);

    drawBg(dt);

    // Flash overlay
    if (flashColor && Date.now() < flashEnd) {
      const a = 0.25 * Math.max(0, 1 - (Date.now() - (flashEnd - 200)) / 200);
      ctx.globalAlpha = a; ctx.fillStyle = flashColor;
      ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
    }

    // Combat particles
    particles = particles.filter(p => p.life > 0);
    for (const p of particles) { p.update(dt); p.draw(); }

    requestAnimationFrame(loop);
  })(performance.now());

  return { burst, beam, rain, shake, flash, dmgNumber, cardFly };
})();
