const Game = (() => {
  let map = null, current = null, gold = 0;
  let unlockedCards = []; // cards earned during this run

  // === SINGULARITY META STATE ===
  let singularity = {
    absorbedCards: [],     // cards absorbed from defeated bosses
    defeatedBosses: [],    // list of defeated boss IDs
    respawned: false,      // has the Singularity respawned
    respawnNode: null,     // node where Singularity respawned
  };

  // Enemy pools by tier
  const TIER_ENEMIES = {
    node: ['firewall_node', 'monitor'],
    terminal: ['reflector', 'purger', 'encrypt_guard', 'data_hunter'],
    sector: ['healer', 'berserker', 'encrypt_guard', 'data_hunter'],
  };
  const TIER_GOLD = { hub:0, node:15, terminal:25, sector:40, singularity:60 };
  const TIER_NAMES = { hub:'中枢', node:'节点级', terminal:'终端级', sector:'扇区级', singularity:'奇点级' };

  // === Card reward pool per tier ===
  const TIER_CARD_REWARDS = {
    node:     ['overflow', 'disconnect', 'backup'],
    terminal: ['virus', 'data_theft', 'purify'],
    sector:   ['reflect_coat', 'weakness_scan', 'overload_strike', 'system_rewrite', 'format'],
  };
  // Ultra-rare pool — 25% chance to drop from sector+ battles
  const ULTRA_POOL = ['data_storm', 'quantum_strike', 'aegis_protocol', 'data_vault', 'system_override', 'root_access'];

  // === Boss card requirements ===
  const BOSS_REQUIREMENTS = {
    // Node bosses — basic burst damage needed
    core_guardian: {
      name: '核心守卫',
      desc: '需要: 溢出攻击 / 连锁闪电 / 终极破解 (任一)',
      check: (deck) => deck.some(id => ['overflow','chain_lightning','ultimate'].includes(id)),
    },
    firewall_warden: {
      name: '防火墙典狱',
      desc: '需要: 溢出攻击 / 连锁闪电 (任一)',
      check: (deck) => deck.some(id => ['overflow','chain_lightning'].includes(id)),
    },
    // Terminal bosses — need counter-play cards
    sector_overseer: {
      name: '扇区主管',
      desc: '需要: 数据窃取 (破盾) + 净化协议 (清毒)',
      check: (deck) => deck.includes('data_theft') && deck.includes('purify'),
    },
    data_weaver: {
      name: '数据编织者',
      desc: '需要: 净化协议 (清毒)',
      check: (deck) => deck.includes('purify'),
    },
    protocol_enforcer: {
      name: '协议执法者',
      desc: '需要: 数据窃取 (破盾)',
      check: (deck) => deck.includes('data_theft'),
    },
    // Sector bosses — need advanced cards
    singularity_herald: {
      name: '奇点先驱',
      desc: '需要: 反射涂层 (反弹) + 弱点扫描 (削弱)',
      check: (deck) => deck.includes('reflect_coat') && deck.includes('weakness_scan'),
    },
    void_architect: {
      name: '虚空建筑师',
      desc: '需要: 反射涂层 + 数据窃取',
      check: (deck) => deck.includes('reflect_coat') && deck.includes('data_theft'),
    },
    cascade_emperor: {
      name: '级联暴君',
      desc: '需要: 弱点扫描 + 净化协议',
      check: (deck) => deck.includes('weakness_scan') && deck.includes('purify'),
    },
    neural_titan: {
      name: '神经泰坦',
      desc: '需要: 反射涂层 + 过载打击',
      check: (deck) => deck.includes('reflect_coat') && deck.includes('overload_strike'),
    },
    // Final boss — need everything
    ai_singularity: {
      name: 'AI 奇点',
      desc: '需要: 全部高级卡牌已收集',
      check: (deck) => ['overflow','data_theft','purify','reflect_coat','weakness_scan','overload_strike'].every(id => deck.includes(id)),
    },
  };

  function init() {
    document.getElementById('btn-start').onclick = newRun;
    document.getElementById('btn-end-turn').onclick = () => Combat.endTurn();
    document.getElementById('btn-leave-shop').onclick = () => { show('map'); MapGen.render(map, current); };
    document.getElementById('btn-rest-heal').onclick = restHeal;
    document.getElementById('btn-rest-upgrade').onclick = restUpgrade;
    document.getElementById('btn-rest-remove').onclick = restRemove;
    document.getElementById('btn-restart').onclick = newRun;
    MapGen.setupDrag();
    show('title');
  }

  function newRun() {
    window.playerHp = 60;
    window.playerDeck = [...Cards.STARTER];
    gold = 50;
    unlockedCards = [];
    singularity = { absorbedCards: [], defeatedBosses: [], respawned: false, respawnNode: null };
    enteredTiers.clear();
    map = MapGen.generate();
    current = null;
    MapGen.resetPan();
    show('map');
    MapGen.render(map, current);
    updateMapHud();
    SFX.button();
  }

  function show(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + name);
    if (el) el.classList.add('active');
    if (name === 'map') updateMapHud();
  }

  function updateMapHud() {
    const hpEl = document.getElementById('map-hp');
    if (hpEl) {
      const tier = current ? current.tier : 'hub';
      const cardCount = window.playerDeck ? window.playerDeck.length : 0;
      hpEl.textContent = `HP ${window.playerHp || 60}/60 · ${TIER_NAMES[tier] || '中枢'} · 卡组 ${cardCount}`;
    }
  }

  // Track which tiers have been entered
  const enteredTiers = new Set();

  function onNode(node) {
    current = node;
    MapGen.advance(map, node);
    SFX.button();

    const tier = node.tier;

    // Tier entry narration
    if (!enteredTiers.has(tier) && tier !== 'hub') {
      enteredTiers.add(tier);
      const tierNarrations = {
        node: '「欢迎来到数据层... 这里的守卫虽然原始，但足以撕裂你的连接」',
        terminal: '「你已进入神经网格... 这里的守卫学会了协同作战」',
        sector: '「AI 核心... 我的意志在这里具现化。准备好面对真正的力量吧」',
        singularity: '「你终于来了... 我等你很久了」',
      };
      if (tierNarrations[tier]) {
        narrate(tierNarrations[tier], tier === 'singularity' ? '#ff0000' : '#ff4444');
      }
    }

    if (node.type === 'battle') {
      const pool = TIER_ENEMIES[tier] || TIER_ENEMIES.node;
      const id = pool[Math.floor(Math.random() * pool.length)];
      show('combat');
      Combat.start([id], won => {
        setTimeout(() => {
          if (won) {
            gold += TIER_GOLD[tier] || 15;
            // Card reward
            const reward = pickCardReward(tier);
            if (reward) {
              window.playerDeck.push(reward.id);
              unlockedCards.push(reward.id);
              showCardReward(reward);
            } else {
              show('map');
              MapGen.render(map, current);
            }
          } else showResult(false);
        }, 800);
      });
    } else if (node.type === 'elite') {
      const pool = TIER_ENEMIES[tier] || TIER_ENEMIES.terminal;
      const id = pool[Math.floor(Math.random() * pool.length)];
      show('combat');
      Combat.start([id], won => {
        setTimeout(() => {
          if (won) {
            gold += (TIER_GOLD[tier] || 25) + 10;
            // Elite gives guaranteed higher-tier card
            const reward = pickCardReward(tier, true);
            if (reward) {
              window.playerDeck.push(reward.id);
              unlockedCards.push(reward.id);
              showCardReward(reward);
            } else {
              show('map');
              MapGen.render(map, current);
            }
          } else showResult(false);
        }, 800);
      });
    } else if (node.type === 'boss') {
      const bossId = node.bossEnemy || Enemies.bossOfTier(tier);

      // Check boss card requirements
      const req = BOSS_REQUIREMENTS[bossId];
      if (req && !req.check(window.playerDeck)) {
        showBossLocked(req);
        return;
      }

      // Get enhancement from Singularity
      const enhance = getEnhancement(node);

      // Pre-fight narration for enhanced bosses
      if (enhance.hpBonus > 0) {
        narrate(`「你来晚了... 它已接收了我的数据」`, '#ff4444');
      }

      // Pre-fight narration when approaching Singularity
      if (bossId === 'ai_singularity' && !singularity.respawned && singularity.defeatedBosses.length > 0) {
        narrate(`「你击败了我的守卫... 但它们的力量已成为我的一部分」`, '#ff0000');
      }

      // For Singularity, inject absorbed cards
      const extraCards = bossId === 'ai_singularity' ? singularity.absorbedCards : [];

      show('combat');
      Combat.start([bossId], won => {
        setTimeout(() => {
          if (won) {
            gold += (TIER_GOLD[tier] || 40) + 20;

            // Non-singularity boss defeated → absorption
            if (bossId !== 'ai_singularity') {
              onBossDefeated(bossId);
              show('map');
              MapGen.render(map, current);
            } else {
              // Singularity defeated → check respawn
              if (singularityRespawn()) {
                narrate(`「你以为...摧毁核心就能结束一切？我的意识...已传输至备用节点...」`, '#ff0000');
                setTimeout(() => {
                  narrate(`「奇点已重生于某个未探索节点... 找到它，彻底终结」`, '#ff4444');
                  show('map');
                  MapGen.render(map, current);
                }, 3500);
              } else {
                // Truly defeated — no more nodes
                narrate(`「不... 这不可能... 我的...意识...正在...消散...」`, '#ff0000');
                setTimeout(() => showResult(true), 2500);
              }
            }
          } else showResult(false);
        }, 1200);
      }, enhance, extraCards);
    } else if (node.type === 'shop') {
      renderShop();
      show('shop');
    } else if (node.type === 'rest') {
      show('rest');
    }
  }

  // === SINGULARITY NARRATION ===
  function narrate(text, color = '#ff0000') {
    const overlay = document.createElement('div');
    overlay.className = 'singularity-narrate';
    overlay.innerHTML = `<div class="narrate-text" style="color:${color};text-shadow:0 0 20px ${color}80">${text}</div>`;
    document.body.appendChild(overlay);
    SFX.bossPhase();
    setTimeout(() => overlay.classList.add('show'), 50);
    setTimeout(() => overlay.classList.remove('show'), 3500);
    setTimeout(() => overlay.remove(), 4000);
  }

  // === BOSS DEFEATED — SINGULARITY ABSORPTION ===
  function onBossDefeated(bossId) {
    const absorbed = Enemies.ABSORBED_CARDS[bossId];
    if (!absorbed) return;

    singularity.defeatedBosses.push(bossId);
    singularity.absorbedCards.push(absorbed);

    const bossName = Enemies.DATA[bossId]?.name || bossId;
    narrate(`「${bossName}的数据流回涌... 我已接管其核心协议：${absorbed.name}」`, '#ff0000');

    // Singularity enhances remaining bosses
    setTimeout(() => singularityEnhance(), 2000);
  }

  // === SINGULARITY ENHANCES REMAINING BOSSES ===
  function singularityEnhance() {
    if (!map) return;
    const bossNodes = Object.values(map).filter(n => n.type === 'boss' && !n.visited && n.tier !== 'singularity');
    if (bossNodes.length === 0) return;

    // Pick one random unvisited boss to enhance
    const target = bossNodes[Math.floor(Math.random() * bossNodes.length)];
    const bossId = target.bossEnemy || Enemies.bossOfTier(target.tier);
    const bossName = Enemies.DATA[bossId]?.name || '守卫';

    // Store enhancement on the node
    target.enhanced = (target.enhanced || 0) + 1;
    const boostHp = 10 + target.enhanced * 5;
    const boostShield = 3 + target.enhanced * 2;

    narrate(`「感知到威胁... 正在向${bossName}传输数据...」`, '#ff4444');

    setTimeout(() => {
      narrate(`「${bossName}已强化：+${boostHp} HP, +${boostShield} 护盾」`, '#ff00ff');
      SFX.hit();
      FX.flash('#ff0000', 300);
    }, 2500);
  }

  // === GET ENHANCEMENT STATS FOR A NODE ===
  function getEnhancement(node) {
    if (!node.enhanced) return { hpBonus: 0, shieldBonus: 0 };
    const n = node.enhanced;
    return { hpBonus: 10 + n * 5, shieldBonus: 3 + n * 2 };
  }

  // === SINGULARITY RESPAWN CHECK ===
  function singularityRespawn() {
    if (singularity.respawned) return false; // already respawned once
    const unvisited = Object.values(map).filter(n => !n.visited && n.type !== 'boss');
    if (unvisited.length === 0) return false;

    // Pick a random unvisited node to host the respawned Singularity
    const target = unvisited[Math.floor(Math.random() * unvisited.length)];
    singularity.respawned = true;
    singularity.respawnNode = target.id;
    target.type = 'boss';
    target.bossEnemy = 'ai_singularity';
    target.enhanced = 0;
    target.icon = `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="16" cy="16" r="12"/><circle cx="16" cy="16" r="6"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/><line x1="16" y1="4" x2="16" y2="10"/><line x1="16" y1="22" x2="16" y2="28"/><line x1="4" y1="16" x2="10" y2="16"/><line x1="22" y1="16" x2="28" y2="16"/></svg>`;

    return true;
  }

  // === Card reward system ===
  function pickCardReward(tier, isElite = false) {
    // Ultra-rare drop: 25% from sector, 40% from elite sector, guaranteed from singularity
    if (tier === 'sector' || tier === 'singularity') {
      const ultraChance = tier === 'singularity' ? 1 : isElite ? 0.4 : 0.25;
      if (Math.random() < ultraChance) {
        const available = ULTRA_POOL.filter(id => !window.playerDeck.includes(id));
        if (available.length > 0) {
          const id = available[Math.floor(Math.random() * available.length)];
          const card = Cards.ALL.find(c => c.id === id);
          if (card) return card;
        }
      }
    }

    const pool = TIER_CARD_REWARDS[tier];
    if (!pool) return null;
    // Filter out already-owned cards for elite, otherwise random
    const available = isElite
      ? pool.filter(id => !window.playerDeck.includes(id))
      : pool;
    if (available.length === 0) return null;
    const id = available[Math.floor(Math.random() * available.length)];
    const card = Cards.ALL.find(c => c.id === id);
    return card || null;
  }

  function showCardReward(card) {
    const isUltra = card.ultra;
    const overlay = document.createElement('div');
    overlay.className = 'reward-overlay' + (isUltra ? ' ultra-reward' : '');
    const titleText = isUltra ? '获得传说卡牌' : '获得新卡牌';
    const ultraClass = isUltra ? ' ultra-card' : '';
    overlay.innerHTML = `
      <div class="reward-box${isUltra ? ' ultra-box' : ''}">
        <div class="reward-title"${isUltra ? ' style="color:#ff00ff;text-shadow:0 0 20px rgba(255,0,255,0.6)"' : ''}>${titleText}</div>
        <div class="card ${card.type}${ultraClass}" style="margin:16px auto; pointer-events:none;">
          ${card.icon ? `<div class="card-art">${card.icon}</div>` : ''}
          <div class="card-divider"></div>
          <div class="card-name">${card.name}</div>
          <div class="card-desc">${card.desc}</div>
        </div>
        <button class="neon-btn reward-ok">继续</button>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('.reward-ok').onclick = () => {
      overlay.remove();
      show('map');
      MapGen.render(map, current);
    };
    SFX.buy();
  }

  function showBossLocked(req) {
    const overlay = document.createElement('div');
    overlay.className = 'reward-overlay';
    overlay.innerHTML = `
      <div class="reward-box boss-locked">
        <div class="reward-title" style="color:var(--magenta)">BOSS 锁定</div>
        <div class="reward-desc">${req.name}</div>
        <div class="reward-req">${req.desc}</div>
        <div class="reward-hint">通过战斗和精英关卡收集所需卡牌</div>
        <button class="neon-btn reward-ok">返回</button>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('.reward-ok').onclick = () => {
      overlay.remove();
      show('map');
      MapGen.render(map, current);
    };
    SFX.hit();
  }

  // === Rest options ===
  function restHeal() {
    window.playerHp = Math.min(60, (window.playerHp || 60) + 20);
    SFX.heal();
    show('map');
    MapGen.render(map, current);
  }

  function restUpgrade() {
    const deck = window.playerDeck;
    if (deck.length === 0) return;
    const idx = Math.floor(Math.random() * deck.length);
    const cardId = deck[idx];
    const card = Cards.ALL.find(c => c.id === cardId);
    if (card && card.cost > 0) {
      const upgraded = { ...card, cost: card.cost - 1, name: card.name + '+', id: card.id + '_plus' };
      if (!Cards.ALL.find(c => c.id === upgraded.id)) {
        Cards.ALL.push({ ...upgraded, icon: card.icon });
      }
      deck[idx] = upgraded.id;
      SFX.buy();
    }
    show('map');
    MapGen.render(map, current);
  }

  function restRemove() {
    const basics = ['data_pulse', 'firewall_card'];
    const deck = window.playerDeck;
    for (const basic of basics) {
      const idx = deck.indexOf(basic);
      if (idx !== -1) {
        deck.splice(idx, 1);
        SFX.hit();
        show('map');
        MapGen.render(map, current);
        return;
      }
    }
    if (deck.length > 5) {
      deck.splice(Math.floor(Math.random() * deck.length), 1);
      SFX.hit();
    }
    show('map');
    MapGen.render(map, current);
  }

  // === Shop ===
  function renderShop() {
    document.getElementById('shop-gold').textContent = `💰 ${gold}`;
    const container = document.getElementById('shop-cards');
    container.innerHTML = '';
    const pool = Cards.ALL.filter(c => !Cards.STARTER.includes(c.id) && !c.id.endsWith('_plus'));
    const offers = [...pool].sort(() => Math.random() - 0.5).slice(0, 4);
    for (const card of offers) {
      const isUltra = card.ultra;
      const price = isUltra ? card.cost * 25 + 40 : card.cost * 15 + 15;
      const wrap = document.createElement('div');
      wrap.style.textAlign = 'center';
      const el = document.createElement('div');
      el.className = `card ${card.type}` + (isUltra ? ' ultra-card' : '');
      const iconHtml = card.icon ? `<div class="card-art">${card.icon}</div>` : '';
      const typeLabel = Cards.TYPE_LABELS[card.type] || card.type;
      const ultraTag = isUltra ? '<div class="ultra-tag">传说</div>' : '';
      el.innerHTML = `<div class="card-cost">${card.cost}</div>${iconHtml}<div class="card-divider"></div><div class="card-name">${card.name}</div><div class="card-desc">${card.desc}</div><div class="card-type-badge">${typeLabel}</div>${ultraTag}`;
      const priceEl = document.createElement('div');
      priceEl.className = 'shop-card-price';
      priceEl.textContent = `${price} 金币`;
      wrap.appendChild(el); wrap.appendChild(priceEl);
      if (gold >= price) {
        el.onclick = () => {
          gold -= price;
          window.playerDeck.push(card.id);
          unlockedCards.push(card.id);
          SFX.buy();
          wrap.remove();
          document.getElementById('shop-gold').textContent = `💰 ${gold}`;
        };
      } else {
        el.classList.add('unplayable');
      }
      container.appendChild(wrap);
    }
  }

  // === Result ===
  function showResult(won) {
    const t = document.getElementById('result-title');
    const tx = document.getElementById('result-text');
    if (won) {
      t.textContent = '入侵成功';
      t.setAttribute('data-text', '入侵成功');
      tx.textContent = '奇点已被攻破。数据自由了。';
    } else {
      t.textContent = '连接断开';
      t.setAttribute('data-text', '连接断开');
      tx.textContent = '你的信号被追踪了...';
    }
    show('result');
  }

  function setSingularityState(state) {
    singularity = { ...singularity, ...state };
  }

  return { init, onNode, narrate, newRun, show, showResult, setSingularityState };
})();

document.addEventListener('DOMContentLoaded', Game.init);
