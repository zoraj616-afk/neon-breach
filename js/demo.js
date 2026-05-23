const Demo = (() => {
  let active = false;
  let speed = 1; // 1=normal, 2=fast, 4=ultra
  let autoTimer = null;

  const SPEED_LABELS = { 1: '1×', 2: '2×', 4: '4×' };

  function init() {
    document.getElementById('btn-demo').onclick = startDemo;
    document.getElementById('btn-singularity-demo').onclick = startSingularityDemo;
  }

  function startDemo() {
    active = true;
    speed = 1;
    Game.newRun();
    showDemoControls();
    SFX.button();
    setTimeout(() => autoLoop(), 1000);
  }

  function startSingularityDemo() {
    active = true;
    speed = 1;

    // Set up player with full deck for Singularity fight
    window.playerHp = 60;
    window.playerDeck = [
      // Starter cards
      'data_pulse', 'data_pulse', 'firewall_card', 'firewall_card', 'scan', 'overclock',
      // Advanced cards
      'overflow', 'chain_lightning', 'virus', 'data_theft', 'purify', 'reflect_coat',
      'weakness_scan', 'overload_strike',
      // Ultra-rare cards
      'data_storm', 'quantum_strike', 'aegis_protocol', 'root_access',
    ];

    // Set up singularity state with all bosses defeated
    Game.setSingularityState({
      absorbedCards: [
        { name:'核心反射', desc:'获得 6 护盾\n反弹 4', fx:{ shield:6, reflect:4 }, color:'#00fff5' },
        { name:'系统入侵', desc:'攻击 6 + 移除护盾', fx:{ damage:6, purgePlayer:true }, color:'#3388ff' },
        { name:'能量过载', desc:'攻击 12\n自伤 3', fx:{ damage:12, selfDamage:3 }, color:'#faff00' },
        { name:'暴君之怒', desc:'攻击 15', fx:{ damage:15 }, color:'#ff4444' },
      ],
      defeatedBosses: ['core_guardian', 'sector_overseer', 'singularity_herald', 'cascade_emperor'],
      respawned: false,
      respawnNode: null,
    });

    // Show combat directly against Singularity
    Game.show('combat');
    const extraCards = [
      { name:'核心反射', desc:'获得 6 护盾\n反弹 4', fx:{ shield:6, reflect:4 }, color:'#00fff5' },
      { name:'系统入侵', desc:'攻击 6 + 移除护盾', fx:{ damage:6, purgePlayer:true }, color:'#3388ff' },
      { name:'能量过载', desc:'攻击 12\n自伤 3', fx:{ damage:12, selfDamage:3 }, color:'#faff00' },
      { name:'暴君之怒', desc:'攻击 15', fx:{ damage:15 }, color:'#ff4444' },
    ];

    Combat.start(['ai_singularity'], (won) => {
      setTimeout(() => {
        if (won) {
          Game.narrate('「不... 这不可能... 我的...意识...正在...消散...」', '#ff0000');
          setTimeout(() => Game.showResult(true), 2500);
        } else {
          Game.showResult(false);
        }
      }, 1200);
    }, { hpBonus: 0, shieldBonus: 0 }, extraCards);

    showDemoControls('SINGULARITY');
    SFX.bossPhase();

    // Narration
    setTimeout(() => {
      Game.narrate('「你终于来了... 我等你很久了」', '#ff0000');
    }, 500);
    setTimeout(() => {
      Game.narrate('「你击败了我的守卫... 但它们的力量已成为我的一部分」', '#ff0000');
    }, 3000);

    // Auto-play combat
    setTimeout(() => autoCombatLoop(), 4000);
  }

  async function autoCombatLoop() {
    while (active) {
      const state = Combat.getState();
      if (!state) { await delay(500); continue; }
      if (state.phase === 'ended') { await delay(2000); return; }
      if (state.phase !== 'player') { await delay(300); continue; }

      await autoCombat();
      await delay(500);
    }
  }

  function stopDemo() {
    active = false;
    if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
    removeDemoControls();
    SFX.button();
  }

  function showDemoControls(label) {
    removeDemoControls();
    const bar = document.createElement('div');
    bar.id = 'demo-bar';
    bar.innerHTML = `
      <div class="demo-label">${label || 'DEMO MODE'}</div>
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
