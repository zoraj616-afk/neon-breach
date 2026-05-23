const Demo = (() => {
  let active = false;
  let speed = 1; // 1=normal, 2=fast, 4=ultra
  let autoTimer = null;

  const SPEED_LABELS = { 1: '1×', 2: '2×', 4: '4×' };

  function init() {
    document.getElementById('btn-demo').onclick = startDemo;
  }

  function startDemo() {
    active = true;
    speed = 1;
    // Start a new run
    Game.newRun();
    showDemoControls();
    SFX.button();
    // Start auto-play loop
    setTimeout(() => autoLoop(), 1000);
  }

  function stopDemo() {
    active = false;
    if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
    removeDemoControls();
    SFX.button();
  }

  function showDemoControls() {
    removeDemoControls();
    const bar = document.createElement('div');
    bar.id = 'demo-bar';
    bar.innerHTML = `
      <div class="demo-label">DEMO MODE</div>
      <button class="demo-btn" id="demo-speed">1×</button>
      <button class="demo-btn demo-stop" id="demo-stop">STOP</button>
    `;
    document.body.appendChild(bar);
    document.getElementById('demo-speed').onclick = cycleSpeed;
    document.getElementById('demo-stop').onclick = stopDemo;
  }

  function removeDemoControls() {
    const bar = document.getElementById('demo-bar');
    if (bar) bar.remove();
  }

  function cycleSpeed() {
    speed = speed === 1 ? 2 : speed === 2 ? 4 : 1;
    const el = document.getElementById('demo-speed');
    if (el) el.textContent = SPEED_LABELS[speed];
    SFX.button();
  }

  function delay(ms) {
    return new Promise(resolve => { autoTimer = setTimeout(resolve, ms / speed); });
  }

  async function autoLoop() {
    while (active) {
      const screen = getCurrentScreen();

      if (screen === 'map') {
        await autoMap();
      } else if (screen === 'combat') {
        await autoCombat();
      } else if (screen === 'shop') {
        await autoShop();
      } else if (screen === 'rest') {
        await autoRest();
      } else if (screen === 'result') {
        await delay(3000);
        stopDemo();
        return;
      } else {
        await delay(500);
      }
    }
  }

  function getCurrentScreen() {
    const screens = document.querySelectorAll('.screen.active');
    for (const s of screens) {
      const id = s.id.replace('screen-', '');
      if (id) return id;
    }
    return 'title';
  }

  // === MAP AUTO-PLAY ===
  async function autoMap() {
    await delay(800);
    const nodes = document.querySelectorAll('.map-node.available:not(.visited)');
    if (nodes.length === 0) {
      // Try clicking current node connections
      const allAvailable = document.querySelectorAll('.map-node.available');
      if (allAvailable.length > 0) {
        allAvailable[0].click();
      }
      return;
    }
    // Pick a random available node (prefer battle/elite for variety)
    const nodeEls = Array.from(nodes);
    const preferred = nodeEls.filter(el => {
      const id = el.dataset.nodeId;
      return true; // click any available
    });
    const target = preferred[Math.floor(Math.random() * preferred.length)] || nodeEls[0];
    target.click();
    await delay(600);
  }

  // === COMBAT AUTO-PLAY ===
  async function autoCombat() {
    await delay(500);

    const state = Combat.getState();
    if (!state || state.phase !== 'player') {
      await delay(300);
      return;
    }

    // Play cards strategically
    const hand = state.hand;
    const energy = state.p.energy;
    const hp = state.p.hp;
    const maxHp = state.p.maxHp;

    // Sort cards by priority
    const prioritized = hand.map((card, i) => {
      const cost = Math.max(0, card.cost - (state.p.costReduce || 0));
      let priority = 0;

      // Low HP → prioritize defense/heal
      if (hp < maxHp * 0.3) {
        if (card.fx.shield) priority += 10;
        if (card.fx.heal) priority += 10;
        if (card.fx.cleanse) priority += 8;
      }

      // Has shield on enemy → prioritize purge/steal
      const enemy = state.enemies[state.target];
      if (enemy && enemy.shield > 0) {
        if (card.fx.stealShield) priority += 9;
        if (card.fx.purge) priority += 7;
        if (card.fx.bonusIfShield) priority += 8;
      }

      // Normal priority
      if (card.fx.damage) priority += 5 + (card.fx.hits || 1);
      if (card.fx.draw) priority += 4;
      if (card.fx.energy) priority += 6;
      if (card.fx.poison) priority += 3;
      if (card.fx.shield) priority += 3;
      if (card.fx.costReduce) priority += 4;
      if (card.fx.weaken) priority += 3;

      // Low cost cards are more flexible
      priority += (3 - cost);

      return { index: i, card, cost, priority };
    }).filter(c => c.cost <= energy).sort((a, b) => b.priority - a.priority);

    // Play cards one by one
    for (const { index, cost } of prioritized) {
      if (!active) return;
      const currentState = Combat.getState();
      if (!currentState || currentState.phase !== 'player') break;

      const currentCost = Math.max(0, hand[index]?.cost - (currentState.p.costReduce || 0));
      if (currentCost > currentState.p.energy) continue;

      Combat.play(index);
      await delay(400 / speed);

      // Check if combat ended
      const afterState = Combat.getState();
      if (!afterState || afterState.phase === 'ended') return;
    }

    // End turn
    await delay(300 / speed);
    const endState = Combat.getState();
    if (endState && endState.phase === 'player') {
      Combat.endTurn();
    }

    // Wait for enemy turn to finish
    await delay(2000 / speed);
  }

  // === SHOP AUTO-PLAY ===
  async function autoShop() {
    await delay(1000);
    // Buy cheapest card we can afford
    const cards = document.querySelectorAll('#shop-cards > div');
    for (const wrap of cards) {
      const cardEl = wrap.querySelector('.card:not(.unplayable)');
      if (cardEl) {
        cardEl.click();
        await delay(500);
      }
    }
    // Leave shop
    await delay(800);
    const leaveBtn = document.getElementById('btn-leave-shop');
    if (leaveBtn) leaveBtn.click();
  }

  // === REST AUTO-PLAY ===
  async function autoRest() {
    await delay(800);
    // Heal if HP < 80%, otherwise upgrade
    const hp = window.playerHp || 60;
    if (hp < 48) {
      document.getElementById('btn-rest-heal')?.click();
    } else {
      document.getElementById('btn-rest-upgrade')?.click();
    }
  }

  // === HANDLE OVERLAYS (card reward, boss locked, etc.) ===
  const observer = new MutationObserver(() => {
    if (!active) return;
    // Auto-click reward OK buttons
    const rewardOk = document.querySelector('.reward-ok');
    if (rewardOk) {
      setTimeout(() => rewardOk.click(), 1200 / speed);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  return { init, startDemo, stopDemo, isActive: () => active };
})();

document.addEventListener('DOMContentLoaded', Demo.init);
