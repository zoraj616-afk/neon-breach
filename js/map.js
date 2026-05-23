const MapGen = (() => {
  // SVG icons for map nodes
  const ICONS = {
    battle: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="16" cy="16" r="6"/><line x1="16" y1="2" x2="16" y2="8"/><line x1="16" y1="24" x2="16" y2="30"/><line x1="2" y1="16" x2="8" y2="16"/><line x1="24" y1="16" x2="30" y2="16"/><circle cx="16" cy="16" r="2" fill="currentColor"/></svg>`,
    elite: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="16,2 20,12 30,12 22,18 25,28 16,22 7,28 10,18 2,12 12,12"/><circle cx="16" cy="14" r="3" fill="currentColor" opacity="0.5"/></svg>`,
    shop: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="6" y="8" width="20" height="16" rx="2"/><line x1="6" y1="14" x2="26" y2="14"/><circle cx="12" cy="20" r="2"/><circle cx="20" cy="20" r="2"/><line x1="10" y1="4" x2="16" y2="8"/><line x1="22" y1="4" x2="16" y2="8"/></svg>`,
    rest: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16 6C10 6 6 12 6 16C6 22 10 26 16 26C22 26 26 22 26 16C26 12 22 6 16 6Z"/><path d="M16 12V18" stroke-width="2.5"/><circle cx="16" cy="22" r="1.5" fill="currentColor"/></svg>`,
    boss: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="16" cy="16" r="12"/><circle cx="16" cy="16" r="6"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/><line x1="16" y1="4" x2="16" y2="10"/><line x1="16" y1="22" x2="16" y2="28"/><line x1="4" y1="16" x2="10" y2="16"/><line x1="22" y1="16" x2="28" y2="16"/></svg>`,
  };
  const LABELS = { battle:'战斗', elite:'精英', shop:'商店', rest:'休息', boss:'BOSS' };

  const RINGS = [
    { ring:0, count:1,  radius:0,   tier:'hub' },
    { ring:1, count:9,  radius:110, tier:'node' },
    { ring:2, count:12, radius:220, tier:'terminal' },
    { ring:3, count:15, radius:330, tier:'sector' },
    { ring:4, count:1,  radius:440, tier:'singularity' },
  ];

  const RING_TYPES = {
    0: [{ type:'rest' }],
    1: [
      { type:'battle' }, { type:'battle' }, { type:'battle' },
      { type:'battle' }, { type:'elite' },
      { type:'shop' }, { type:'rest' },
      { type:'boss' }, { type:'boss' },
    ],
    2: [
      { type:'battle' }, { type:'battle' }, { type:'battle' },
      { type:'elite' }, { type:'elite' }, { type:'elite' },
      { type:'shop' }, { type:'rest' }, { type:'shop' },
      { type:'boss' }, { type:'boss' }, { type:'boss' },
    ],
    3: [
      { type:'battle' }, { type:'battle' }, { type:'battle' },
      { type:'elite' }, { type:'elite' }, { type:'elite' }, { type:'elite' },
      { type:'shop' }, { type:'rest' }, { type:'shop' }, { type:'rest' },
      { type:'boss' }, { type:'boss' }, { type:'boss' },
      { type:'boss' },
    ],
    4: [{ type:'boss' }],
  };

  // Boss pool per tier (randomly pick from these for each boss node)
  const TIER_BOSS_POOL = {
    node: ['core_guardian', 'firewall_warden'],
    terminal: ['sector_overseer', 'data_weaver', 'protocol_enforcer'],
    sector: ['singularity_herald', 'void_architect', 'cascade_emperor', 'neural_titan'],
    singularity: ['ai_singularity'],
  };

  // Seed-based random for reproducible layouts
  let seed = Date.now();
  function seededRandom() {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  function generate() {
    const nodes = {};
    seed = Date.now();

    // Track which bosses we've assigned per tier
    const usedBosses = {};

    for (const ringDef of RINGS) {
      const { ring, count, radius, tier } = ringDef;
      const types = RING_TYPES[ring];
      const bossIndices = types.map((t, i) => t.type === 'boss' ? i : -1).filter(i => i >= 0);

      // Generate organic angles with jitter
      const angles = [];
      if (count === 1) {
        angles.push(180);
      } else {
        const step = 360 / count;
        for (let i = 0; i < count; i++) {
          let angle = i * step + (seededRandom() - 0.5) * step * 0.5;
          angle = ((angle % 360) + 360) % 360;
          angles.push(angle);
        }
        // Scatter bosses randomly around the ring (not clustered at bottom)
        const firstBossIdx = bossIndices[0];
        if (firstBossIdx !== undefined) {
          const targetAngle = seededRandom() * 360;
          const rotation = targetAngle - angles[firstBossIdx] + (seededRandom() - 0.5) * 40;
          for (let i = 0; i < count; i++) {
            angles[i] = ((angles[i] + rotation) % 360 + 360) % 360;
          }
        }
      }

      // Shuffle boss pool for this tier
      const bossPool = [...(TIER_BOSS_POOL[tier] || ['core_guardian'])];
      for (let i = bossPool.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1));
        [bossPool[i], bossPool[j]] = [bossPool[j], bossPool[i]];
      }

      let bossAssignIdx = 0;
      for (let i = 0; i < count; i++) {
        const id = `r${ring}_${i}`;
        const nodeType = types[i].type;
        const angle = angles[i];
        const radiusJitter = radius > 0 ? radius + (seededRandom() - 0.5) * radius * 0.5 : 0;
        const posture = (angle >= 0 && angle < 180) ? 'attack' : 'defense';

        // Assign boss from pool
        let bossEnemy = null;
        if (nodeType === 'boss') {
          bossEnemy = bossPool[bossAssignIdx % bossPool.length];
          bossAssignIdx++;
        }

        nodes[id] = {
          id, ring, index: i, angle, radius: radiusJitter, type: nodeType, tier,
          visited: false,
          available: ring === 0,
          icon: ICONS[nodeType],
          connections: [],
          bossEnemy,
          posture,
        };
      }
    }

    buildConnections(nodes);
    return nodes;
  }

  function buildConnections(nodes) {
    const ringNodes = {};
    for (const n of Object.values(nodes)) {
      if (!ringNodes[n.ring]) ringNodes[n.ring] = [];
      ringNodes[n.ring].push(n);
    }

    // Hub → only 3 closest ring 1 nodes (not all)
    const r1 = ringNodes[1] || [];
    const r1Sorted = [...r1].sort((a, b) => angleDist(180, a.angle) - angleDist(180, b.angle));
    for (let i = 0; i < 3 && i < r1Sorted.length; i++) {
      nodes['r0_0'].connections.push(r1Sorted[i].id);
    }

    // Ring-to-ring connections (sparser)
    for (let r = 1; r <= 3; r++) {
      const current = ringNodes[r];
      const next = ringNodes[r + 1];
      if (!next) continue;

      const boss = current.find(n => n.type === 'boss');
      const nonBoss = current.filter(n => n.type !== 'boss');
      const nextNonBoss = next.filter(n => n.type !== 'boss');

      // Non-boss → only 1 closest in next ring
      for (const node of nonBoss) {
        const sorted = [...nextNonBoss].sort((a, b) =>
          angleDist(node.angle, a.angle) - angleDist(node.angle, b.angle)
        );
        if (sorted.length > 0 && !node.connections.includes(sorted[0].id)) {
          node.connections.push(sorted[0].id);
        }
      }

      // Boss → only 2-3 closest in next ring (not all)
      if (boss && nextNonBoss.length > 0) {
        const sorted = [...nextNonBoss].sort((a, b) =>
          angleDist(boss.angle, a.angle) - angleDist(boss.angle, b.angle)
        );
        const cnt = Math.min(3, sorted.length);
        for (let i = 0; i < cnt; i++) {
          if (!boss.connections.includes(sorted[i].id)) {
            boss.connections.push(sorted[i].id);
          }
        }
      }

      // Circumferential: only connect very close neighbors (angle < 70°)
      const sortedByAngle = [...nonBoss].sort((a, b) => a.angle - b.angle);
      for (let i = 0; i < sortedByAngle.length; i++) {
        const next_i = (i + 1) % sortedByAngle.length;
        const a = sortedByAngle[i], b = sortedByAngle[next_i];
        const dist = angleDist(a.angle, b.angle);
        if (dist < 70) {
          if (!a.connections.includes(b.id)) a.connections.push(b.id);
          if (!b.connections.includes(a.id)) b.connections.push(a.id);
        }
      }
      // No random skip connections, no cross-ring shortcuts
    }
  }

  function angleDist(a, b) {
    const d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
  }

  function advance(map, node) {
    node.visited = true;
    for (const connId of node.connections) {
      if (map[connId]) map[connId].available = true;
    }
    if (node.type === 'boss') {
      const nextRing = node.ring + 1;
      for (const n of Object.values(map)) {
        if (n.ring === nextRing) n.available = true;
      }
    }
    checkBossUnlock(map, node.ring);
  }

  function checkBossUnlock(map, ring) {
    const ringNodes = Object.values(map).filter(n => n.ring === ring);
    const nonBoss = ringNodes.filter(n => n.type !== 'boss');
    const bosses = ringNodes.filter(n => n.type === 'boss');
    if (nonBoss.length === 0 || bosses.length === 0) return;
    // Unlock bosses after 60% of non-boss nodes visited
    const visitedCount = nonBoss.filter(n => n.visited).length;
    const threshold = Math.ceil(nonBoss.length * 0.6);
    if (visitedCount >= threshold) {
      for (const boss of bosses) {
        if (!boss.available) boss.available = true;
      }
    }
  }

  // === RENDER ===
  function render(map, current) {
    const container = document.getElementById('map-container');
    container.innerHTML = '';

    const W = 1000, H = 1000;
    const centerX = W / 2, centerY = H / 2;
    const allNodes = Object.values(map);

    // SVG for connections
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svgEl.setAttribute('width', W);
    svgEl.setAttribute('height', H);
    svgEl.style.cssText = 'position:absolute; top:0; left:0; pointer-events:none; z-index:0;';
    container.appendChild(svgEl);

    // Ring guide circles (faint)
    for (const ringDef of RINGS) {
      if (ringDef.radius === 0) continue;
      const circle = document.createElement('div');
      circle.className = 'ring-guide';
      circle.style.cssText = `
        position:absolute;
        left:${centerX - ringDef.radius}px;
        top:${centerY - ringDef.radius}px;
        width:${ringDef.radius * 2}px;
        height:${ringDef.radius * 2}px;
        border:1px dashed rgba(0,255,245,0.03);
        border-radius:50%;
        pointer-events:none; z-index:0;
      `;
      container.appendChild(circle);
    }

    // Compute positions and render nodes
    const nodePositions = {};
    for (const node of allNodes) {
      const angleRad = (node.angle - 90) * Math.PI / 180;
      const x = centerX + node.radius * Math.cos(angleRad);
      const y = centerY + node.radius * Math.sin(angleRad);
      nodePositions[node.id] = { x, y };

      const el = document.createElement('div');
      let cls = `map-node tier-${node.tier}`;
      if (node.visited) cls += ' visited';
      if (node.available && !node.visited) cls += ' available';
      if (current && current.id === node.id) cls += ' current';
      if (node.type === 'boss') cls += ' boss-node';
      if (node.enhanced) cls += ' enhanced';
      cls += ` posture-${node.posture}`;
      el.className = cls;
      el.innerHTML = node.icon;
      el.title = `${LABELS[node.type]} · ${node.tier}级`;
      el.dataset.nodeId = node.id;
      el.style.cssText = `position:absolute; left:${x - 24}px; top:${y - 24}px; z-index:2;`;
      if (node.available && !node.visited) el.onclick = () => Game.onNode(node);
      container.appendChild(el);
    }

    // Draw SVG connections with organic curves
    const drawnLines = new Set();
    for (const node of allNodes) {
      const from = nodePositions[node.id];
      if (!from) continue;
      for (const connId of node.connections) {
        const to = nodePositions[connId];
        if (!to) continue;
        // Avoid drawing duplicate lines
        const lineKey = [node.id, connId].sort().join('-');
        if (drawnLines.has(lineKey)) continue;
        drawnLines.add(lineKey);

        const target = allNodes.find(n => n.id === connId);

        // Use quadratic bezier for organic feel
        const midX = (from.x + to.x) / 2 + (seededRandom() - 0.5) * 20;
        const midY = (from.y + to.y) / 2 + (seededRandom() - 0.5) * 20;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
        path.setAttribute('d', d);

        let cls = 'map-line';
        if (node.visited && target && target.visited) {
          cls += ' visited';
        } else if (node.visited && target && target.available) {
          cls += target.type === 'boss' ? ' boss-available' : ' available';
        } else if (node.visited) {
          cls += ' dim';
        } else {
          cls += ' hidden';
        }
        path.setAttribute('class', cls);
        path.setAttribute('fill', 'none');
        svgEl.appendChild(path);
      }
    }

    // Tier labels
    const tierLabels = [
      { ring:1, label:'NODE' }, { ring:2, label:'TERMINAL' },
      { ring:3, label:'SECTOR' }, { ring:4, label:'SINGULARITY' },
    ];
    for (const tl of tierLabels) {
      const rDef = RINGS[tl.ring];
      if (!rDef || rDef.radius === 0) continue;
      const lbl = document.createElement('div');
      lbl.className = 'ring-label';
      lbl.textContent = tl.label;
      lbl.style.cssText = `position:absolute; left:${centerX + rDef.radius + 12}px; top:${centerY - 6}px; z-index:1; pointer-events:none;`;
      container.appendChild(lbl);
    }
  }

  // === DRAGGABLE MAP ===
  let panX = 0, panY = 0, isDragging = false, dragStartX = 0, dragStartY = 0, startPanX = 0, startPanY = 0;

  function setupDrag() {
    const screen = document.getElementById('screen-map');
    if (!screen || screen._dragSetup) return;
    screen._dragSetup = true;

    screen.addEventListener('mousedown', (e) => {
      if (e.target.closest('.map-node') || e.target.closest('.map-hud') || e.target.closest('.neon-btn')) return;
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      startPanX = panX;
      startPanY = panY;
      screen.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      panX = startPanX + dx;
      panY = startPanY + dy;
      applyPan();
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        const screen = document.getElementById('screen-map');
        if (screen) screen.style.cursor = '';
      }
    });

    // Touch support
    screen.addEventListener('touchstart', (e) => {
      if (e.target.closest('.map-node') || e.target.closest('.map-hud') || e.target.closest('.neon-btn')) return;
      if (e.touches.length === 1) {
        isDragging = true;
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
        startPanX = panX;
        startPanY = panY;
      }
    }, { passive: true });

    screen.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - dragStartX;
      const dy = e.touches[0].clientY - dragStartY;
      panX = startPanX + dx;
      panY = startPanY + dy;
      applyPan();
    }, { passive: true });

    screen.addEventListener('touchend', () => { isDragging = false; });

    // Update scale on resize
    window.addEventListener('resize', () => applyPan());
  }

  function applyPan() {
    const container = document.getElementById('map-container');
    if (!container) return;
    // Preserve responsive scale when applying drag translate
    let scale = 1;
    if (window.innerWidth <= 600) scale = 0.5;
    else if (window.innerWidth <= 900) scale = 0.7;
    container.style.transform = `scale(${scale}) translate(${panX / scale}px, ${panY / scale}px)`;
  }

  function resetPan() {
    panX = 0;
    panY = 0;
    applyPan();
  }

  return { generate, render, advance, setupDrag, resetPan };
})();
