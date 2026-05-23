const Enemies = (() => {
  // Enemy card pools — each deck now has counter-play mechanics
  const ENEMY_CARDS = {
    // Firewall: defensive + basic attack + reflect
    firewall_deck: [
      { name:'防火墙', desc:'获得 5 护盾', fx:{ shield:5 }, color:'#4488ff' },
      { name:'数据冲击', desc:'攻击 4', fx:{ damage:4 }, color:'#ff3333' },
      { name:'加固', desc:'获得 3 护盾', fx:{ shield:3 }, color:'#4488ff' },
      { name:'冲击', desc:'攻击 5', fx:{ damage:5 }, color:'#ff3333' },
      { name:'反射屏障', desc:'获得 3 护盾\n反弹 2', fx:{ shield:3, reflect:2 }, color:'#4488ff' },
    ],
    // Monitor: debuff + attack + purge
    monitor_deck: [
      { name:'监控扫描', desc:'攻击 3 + 中毒 1', fx:{ damage:3, poison:1 }, color:'#faff00' },
      { name:'数据干扰', desc:'攻击 2 + 中毒 1', fx:{ damage:2, poison:1 }, color:'#faff00' },
      { name:'信号追踪', desc:'攻击 4', fx:{ damage:4 }, color:'#ff3333' },
      { name:'病毒注入', desc:'中毒 2', fx:{ poison:2 }, color:'#00ff88' },
      { name:'数据清除', desc:'移除全部护盾', fx:{ purgePlayer:true }, color:'#ff4444' },
    ],
    // Encryption Guard: heavy shield + heavy attack + heal
    guard_deck: [
      { name:'加密屏障', desc:'获得 10 护盾', fx:{ shield:10 }, color:'#aa44ff' },
      { name:'重击', desc:'攻击 8', fx:{ damage:8 }, color:'#ff3333' },
      { name:'强化加密', desc:'获得 6 护盾', fx:{ shield:6 }, color:'#aa44ff' },
      { name:'破甲攻击', desc:'攻击 6', fx:{ damage:6 }, color:'#ff3333' },
      { name:'自我修复', desc:'回复 5 HP', fx:{ heal:5 }, color:'#00ff88' },
      { name:'反弹装甲', desc:'获得 5 护盾\n反弹 3', fx:{ shield:5, reflect:3 }, color:'#aa44ff' },
    ],
    // Data Hunter: fast attack + multi-hit + drain
    hunter_deck: [
      { name:'快速斩击', desc:'攻击 5', fx:{ damage:5 }, color:'#ff4444' },
      { name:'连击', desc:'攻击 3×2', fx:{ damage:3, hits:2 }, color:'#ff4444' },
      { name:'致命一击', desc:'攻击 10', fx:{ damage:10 }, color:'#ff3333' },
      { name:'闪避', desc:'获得 4 护盾', fx:{ shield:4 }, color:'#4488ff' },
      { name:'数据吸取', desc:'攻击 4\n回复 4 HP', fx:{ damage:4, drain:4 }, color:'#ff4444' },
    ],
    // AI Core Boss: all types, powerful, adaptive
    boss_deck: [
      { name:'AI 攻击', desc:'攻击 7', fx:{ damage:7 }, color:'#ff00ff' },
      { name:'数据洪流', desc:'攻击 5 + 中毒 2', fx:{ damage:5, poison:2 }, color:'#ff00ff' },
      { name:'核心防御', desc:'获得 12 护盾', fx:{ shield:12 }, color:'#ff00ff' },
      { name:'系统重启', desc:'获得 8 护盾 + 攻击 5', fx:{ shield:8, damage:5 }, color:'#ff00ff' },
      { name:'毁灭协议', desc:'攻击 12', fx:{ damage:12 }, color:'#ff0000' },
      { name:'病毒风暴', desc:'攻击 4 + 中毒 3', fx:{ damage:4, poison:3 }, color:'#00ff88' },
      { name:'反射矩阵', desc:'获得 8 护盾\n反弹 5', fx:{ shield:8, reflect:5 }, color:'#ff00ff' },
      { name:'核心修复', desc:'回复 10 HP', fx:{ heal:10 }, color:'#00ff88' },
    ],
    // NEW: Reflector — counters aggressive play
    reflector_deck: [
      { name:'镜面装甲', desc:'获得 4 护盾\n反弹 4', fx:{ shield:4, reflect:4 }, color:'#00ffff' },
      { name:'棱镜折射', desc:'反弹 6', fx:{ reflect:6 }, color:'#00ffff' },
      { name:'能量过载', desc:'攻击 6', fx:{ damage:6 }, color:'#ff3333' },
      { name:'全反射', desc:'获得 6 护盾\n反弹 3', fx:{ shield:6, reflect:3 }, color:'#00ffff' },
    ],
    // NEW: Purger — counters defensive play
    purger_deck: [
      { name:'数据擦除', desc:'移除全部护盾\n攻击 3', fx:{ purgePlayer:true, damage:3 }, color:'#ff6600' },
      { name:'格式化攻击', desc:'攻击 5 + 移除护盾', fx:{ damage:5, purgePlayer:true }, color:'#ff6600' },
      { name:'系统入侵', desc:'攻击 4 + 中毒 1', fx:{ damage:4, poison:1 }, color:'#ff6600' },
      { name:'协议破解', desc:'移除全部护盾', fx:{ purgePlayer:true }, color:'#ff6600' },
    ],
    // NEW: Healer — sustain + drain
    healer_deck: [
      { name:'纳米修复', desc:'回复 6 HP', fx:{ heal:6 }, color:'#00ff88' },
      { name:'生命吸取', desc:'攻击 4\n回复 4 HP', fx:{ damage:4, drain:4 }, color:'#00ff88' },
      { name:'毒素注射', desc:'中毒 3', fx:{ poison:3 }, color:'#00ff88' },
      { name:'再生协议', desc:'回复 4 HP\n获得 4 护盾', fx:{ heal:4, shield:4 }, color:'#00ff88' },
    ],
    // NEW: Berserker — escalating damage
    berserker_deck: [
      { name:'狂暴斩击', desc:'攻击 6', fx:{ damage:6 }, color:'#ff2222' },
      { name:'双重打击', desc:'攻击 4×2', fx:{ damage:4, hits:2 }, color:'#ff2222' },
      { name:'破釜沉舟', desc:'攻击 12\n受伤 3', fx:{ damage:12, selfDamage:3 }, color:'#ff2222' },
      { name:'嗜血', desc:'攻击 5\n回复 3 HP', fx:{ damage:5, drain:3 }, color:'#ff2222' },
    ],
    // === BOSS DECKS ===
    // Node Boss: balanced shield + attack
    node_boss_deck: [
      { name:'加密冲击', desc:'攻击 5 + 护盾 3', fx:{ damage:5, shield:3 }, color:'#00fff5' },
      { name:'核心加固', desc:'获得 8 护盾', fx:{ shield:8 }, color:'#00fff5' },
      { name:'数据重击', desc:'攻击 8', fx:{ damage:8 }, color:'#ff3333' },
      { name:'反射阵列', desc:'护盾 4 + 反弹 3', fx:{ shield:4, reflect:3 }, color:'#00fff5' },
      { name:'紧急修复', desc:'回复 6 HP', fx:{ heal:6 }, color:'#00ff88' },
      { name:'系统扫描', desc:'攻击 3 + 中毒 2', fx:{ damage:3, poison:2 }, color:'#faff00' },
    ],
    // Terminal Boss: purge + combo
    terminal_boss_deck: [
      { name:'系统入侵', desc:'攻击 6 + 移除护盾', fx:{ damage:6, purgePlayer:true }, color:'#3388ff' },
      { name:'连续打击', desc:'攻击 4×2', fx:{ damage:4, hits:2 }, color:'#ff3333' },
      { name:'加密壁垒', desc:'获得 10 护盾', fx:{ shield:10 }, color:'#3388ff' },
      { name:'数据吸取', desc:'攻击 5\n回复 5 HP', fx:{ damage:5, drain:5 }, color:'#3388ff' },
      { name:'病毒风暴', desc:'攻击 3 + 中毒 3', fx:{ damage:3, poison:3 }, color:'#00ff88' },
      { name:'棱镜反射', desc:'护盾 6 + 反弹 4', fx:{ shield:6, reflect:4 }, color:'#3388ff' },
    ],
    // Sector Boss: berserker + sustain
    sector_boss_deck: [
      { name:'毁灭打击', desc:'攻击 10', fx:{ damage:10 }, color:'#faff00' },
      { name:'双重粉碎', desc:'攻击 6×2', fx:{ damage:6, hits:2 }, color:'#ff3333' },
      { name:'纳米修复', desc:'回复 8 HP', fx:{ heal:8 }, color:'#00ff88' },
      { name:'能量过载', desc:'攻击 12\n自伤 3', fx:{ damage:12, selfDamage:3 }, color:'#faff00' },
      { name:'反弹矩阵', desc:'护盾 8 + 反弹 5', fx:{ shield:8, reflect:5 }, color:'#faff00' },
      { name:'病毒注入', desc:'攻击 4 + 中毒 3', fx:{ damage:4, poison:3 }, color:'#00ff88' },
      { name:'破甲猛击', desc:'攻击 8 + 移除护盾', fx:{ damage:8, purgePlayer:true }, color:'#ff6600' },
    ],
    // Firewall Warden: pure defense + reflect
    firewall_warden_deck: [
      { name:'烈焰屏障', desc:'获得 10 护盾\n反弹 3', fx:{ shield:10, reflect:3 }, color:'#ff6600' },
      { name:'灼烧', desc:'攻击 6', fx:{ damage:6 }, color:'#ff3333' },
      { name:'加固', desc:'获得 12 护盾', fx:{ shield:12 }, color:'#ff6600' },
      { name:'火焰风暴', desc:'攻击 4 + 中毒 2', fx:{ damage:4, poison:2 }, color:'#ff6600' },
      { name:'反射装甲', desc:'获得 6 护盾\n反弹 5', fx:{ shield:6, reflect:5 }, color:'#ff6600' },
      { name:'紧急修复', desc:'回复 5 HP', fx:{ heal:5 }, color:'#00ff88' },
    ],
    // Data Weaver: debuff + control
    data_weaver_deck: [
      { name:'数据缠绕', desc:'攻击 4 + 中毒 3', fx:{ damage:4, poison:3 }, color:'#aa44ff' },
      { name:'信息茧', desc:'获得 8 护盾\n反弹 4', fx:{ shield:8, reflect:4 }, color:'#aa44ff' },
      { name:'记忆篡改', desc:'移除护盾\n攻击 5', fx:{ purgePlayer:true, damage:5 }, color:'#aa44ff' },
      { name:'数据洪流', desc:'攻击 3×3', fx:{ damage:3, hits:3 }, color:'#ff3333' },
      { name:'自我修复', desc:'回复 6 HP', fx:{ heal:6 }, color:'#00ff88' },
      { name:'毒素扩散', desc:'中毒 4', fx:{ poison:4 }, color:'#00ff88' },
    ],
    // Protocol Enforcer: balanced + purge
    protocol_enforcer_deck: [
      { name:'协议执行', desc:'攻击 7', fx:{ damage:7 }, color:'#00ff88' },
      { name:'规则盾', desc:'获得 10 护盾', fx:{ shield:10 }, color:'#00ff88' },
      { name:'违规清除', desc:'移除护盾\n攻击 4', fx:{ purgePlayer:true, damage:4 }, color:'#00ff88' },
      { name:'连击', desc:'攻击 4×2', fx:{ damage:4, hits:2 }, color:'#ff3333' },
      { name:'反弹协议', desc:'护盾 6 + 反弹 4', fx:{ shield:6, reflect:4 }, color:'#00ff88' },
      { name:'修复', desc:'回复 5 HP', fx:{ heal:5 }, color:'#00ff88' },
    ],
    // Void Architect: shield + drain
    void_architect_deck: [
      { name:'虚空侵蚀', desc:'攻击 5\n回复 5 HP', fx:{ damage:5, drain:5 }, color:'#8844ff' },
      { name:'空间折叠', desc:'获得 12 护盾', fx:{ shield:12 }, color:'#8844ff' },
      { name:'维度切割', desc:'攻击 8', fx:{ damage:8 }, color:'#ff3333' },
      { name:'虚无之盾', desc:'护盾 8 + 反弹 5', fx:{ shield:8, reflect:5 }, color:'#8844ff' },
      { name:'黑洞吸引', desc:'移除护盾\n攻击 6', fx:{ purgePlayer:true, damage:6 }, color:'#8844ff' },
      { name:'暗物质', desc:'攻击 3 + 中毒 3', fx:{ damage:3, poison:3 }, color:'#8844ff' },
    ],
    // Cascade Emperor: multi-hit berserker
    cascade_emperor_deck: [
      { name:'级联打击', desc:'攻击 3×4', fx:{ damage:3, hits:4 }, color:'#ff4444' },
      { name:'暴君之怒', desc:'攻击 15', fx:{ damage:15 }, color:'#ff4444' },
      { name:'能量涌动', desc:'攻击 6×2', fx:{ damage:6, hits:2 }, color:'#ff4444' },
      { name:'铁壁', desc:'获得 8 护盾', fx:{ shield:8 }, color:'#ff4444' },
      { name:'嗜血', desc:'攻击 8\n回复 4 HP', fx:{ damage:8, drain:4 }, color:'#ff4444' },
      { name:'破甲猛击', desc:'攻击 10 + 移除护盾', fx:{ damage:10, purgePlayer:true }, color:'#ff6600' },
    ],
    // Neural Titan: debuff + sustain
    neural_titan_deck: [
      { name:'神经脉冲', desc:'攻击 6 + 中毒 2', fx:{ damage:6, poison:2 }, color:'#ff00ff' },
      { name:'思维控制', desc:'移除护盾\n攻击 5', fx:{ purgePlayer:true, damage:5 }, color:'#ff00ff' },
      { name:'神经再生', desc:'回复 10 HP', fx:{ heal:10 }, color:'#00ff88' },
      { name:'突触风暴', desc:'攻击 4×3', fx:{ damage:4, hits:3 }, color:'#ff00ff' },
      { name:'精神护盾', desc:'护盾 10 + 反弹 4', fx:{ shield:10, reflect:4 }, color:'#ff00ff' },
      { name:'毒素注射', desc:'中毒 4', fx:{ poison:4 }, color:'#00ff88' },
    ],
  };

  const DATA = {
    // === ACT 1: 数据层 (Data Layer) ===
    firewall_node: {
      id:'firewall_node', name:'防火墙节点', hp:20, act:1, type:'normal', icon:'🧱', color:'#ff3333',
      deckKey:'firewall_deck', cardsPerTurn:1,
    },
    monitor: {
      id:'monitor', name:'监控程序', hp:15, act:1, type:'normal', icon:'👁', color:'#faff00',
      deckKey:'monitor_deck', cardsPerTurn:1,
    },
    // === ACT 2: 神经网格 (Neural Grid) ===
    encrypt_guard: {
      id:'encrypt_guard', name:'加密守卫', hp:35, act:2, type:'elite', icon:'🛡', color:'#aa44ff',
      deckKey:'guard_deck', cardsPerTurn:2,
    },
    data_hunter: {
      id:'data_hunter', name:'数据猎手', hp:30, act:2, type:'elite', icon:'🗡', color:'#ff4444',
      deckKey:'hunter_deck', cardsPerTurn:2,
    },
    reflector: {
      id:'reflector', name:'棱镜守卫', hp:25, act:2, type:'normal', icon:'💎', color:'#00ffff',
      deckKey:'reflector_deck', cardsPerTurn:1,
    },
    purger: {
      id:'purger', name:'清除程序', hp:22, act:2, type:'normal', icon:'🔥', color:'#ff6600',
      deckKey:'purger_deck', cardsPerTurn:1,
    },
    // === ACT 3: AI 核心 (AI Core) ===
    healer: {
      id:'healer', name:'纳米修复体', hp:28, act:3, type:'elite', icon:'💚', color:'#00ff88',
      deckKey:'healer_deck', cardsPerTurn:2,
    },
    berserker: {
      id:'berserker', name:'狂暴机甲', hp:40, act:3, type:'elite', icon:'⚙', color:'#ff2222',
      deckKey:'berserker_deck', cardsPerTurn:2,
    },
    ai_core: {
      id:'ai_core', name:'AI 核心', hp:100, act:3, type:'boss', icon:'🔮', color:'#ff00ff',
      deckKey:'boss_deck', cardsPerTurn:2,
    },
    // === NODE BOSSES (Ring 1) ===
    core_guardian: {
      id:'core_guardian', name:'核心守卫', hp:45, act:1, type:'boss', icon:'🔰', color:'#00fff5',
      deckKey:'node_boss_deck', cardsPerTurn:2,
    },
    firewall_warden: {
      id:'firewall_warden', name:'防火墙典狱', hp:50, act:1, type:'boss', icon:'🔥', color:'#ff6600',
      deckKey:'firewall_warden_deck', cardsPerTurn:2,
    },
    // === TERMINAL BOSSES (Ring 2) ===
    sector_overseer: {
      id:'sector_overseer', name:'扇区主管', hp:70, act:2, type:'boss', icon:'🌀', color:'#3388ff',
      deckKey:'terminal_boss_deck', cardsPerTurn:2,
    },
    data_weaver: {
      id:'data_weaver', name:'数据编织者', hp:65, act:2, type:'boss', icon:'🕸', color:'#aa44ff',
      deckKey:'data_weaver_deck', cardsPerTurn:2,
    },
    protocol_enforcer: {
      id:'protocol_enforcer', name:'协议执法者', hp:75, act:2, type:'boss', icon:'⚖', color:'#00ff88',
      deckKey:'protocol_enforcer_deck', cardsPerTurn:2,
    },
    // === SECTOR BOSSES (Ring 3) ===
    singularity_herald: {
      id:'singularity_herald', name:'奇点先驱', hp:90, act:3, type:'boss', icon:'⚡', color:'#faff00',
      deckKey:'sector_boss_deck', cardsPerTurn:2,
    },
    void_architect: {
      id:'void_architect', name:'虚空建筑师', hp:85, act:3, type:'boss', icon:'🌑', color:'#8844ff',
      deckKey:'void_architect_deck', cardsPerTurn:2,
    },
    cascade_emperor: {
      id:'cascade_emperor', name:'级联暴君', hp:95, act:3, type:'boss', icon:'👑', color:'#ff4444',
      deckKey:'cascade_emperor_deck', cardsPerTurn:3,
    },
    neural_titan: {
      id:'neural_titan', name:'神经泰坦', hp:100, act:3, type:'boss', icon:'🧠', color:'#ff00ff',
      deckKey:'neural_titan_deck', cardsPerTurn:2,
    },
    // === SINGULARITY (Ring 4) — THE FINAL BOSS ===
    ai_singularity: {
      id:'ai_singularity', name:'AI 奇点', hp:150, act:4, type:'boss', icon:'◉', color:'#ff0000',
      deckKey:'boss_deck', cardsPerTurn:3,
    },
  };

  // === SINGULARITY ABSORBED CARDS ===
  // When a boss dies, the Singularity absorbs one signature card
  const ABSORBED_CARDS = {
    // Node bosses
    core_guardian:    { name:'核心反射', desc:'获得 6 护盾\n反弹 4', fx:{ shield:6, reflect:4 }, color:'#00fff5' },
    firewall_warden:  { name:'烈焰屏障', desc:'获得 10 护盾\n反弹 3', fx:{ shield:10, reflect:3 }, color:'#ff6600' },
    // Terminal bosses
    sector_overseer:  { name:'系统入侵', desc:'攻击 6 + 移除护盾', fx:{ damage:6, purgePlayer:true }, color:'#3388ff' },
    data_weaver:      { name:'毒素扩散', desc:'中毒 4', fx:{ poison:4 }, color:'#aa44ff' },
    protocol_enforcer:{ name:'违规清除', desc:'移除护盾\n攻击 4', fx:{ purgePlayer:true, damage:4 }, color:'#00ff88' },
    // Sector bosses
    singularity_herald:{ name:'能量过载', desc:'攻击 12\n自伤 3', fx:{ damage:12, selfDamage:3 }, color:'#faff00' },
    void_architect:   { name:'黑洞吸引', desc:'移除护盾\n攻击 6', fx:{ purgePlayer:true, damage:6 }, color:'#8844ff' },
    cascade_emperor:  { name:'暴君之怒', desc:'攻击 15', fx:{ damage:15 }, color:'#ff4444' },
    neural_titan:     { name:'神经再生', desc:'回复 10 HP', fx:{ heal:10 }, color:'#ff00ff' },
  };

  function shuffle(a) { for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

  function create(id, extraCards) {
    const d = DATA[id];
    const pool = ENEMY_CARDS[d.deckKey];
    const deck = shuffle([...pool, ...pool, ...pool]);
    // Inject absorbed cards for the Singularity
    if (extraCards && extraCards.length > 0) {
      for (const card of extraCards) {
        deck.push({ ...card });
        deck.push({ ...card }); // add twice for more impact
      }
    }
    return {
      ...d,
      curHp: d.hp, maxHp: d.hp, shield: 0, poison: 0, turn: 0,
      phase: d.type === 'boss' ? 1 : 0,
      deck: deck,
      hand: [],
      discard: [],
      playedThisTurn: [],
      cardsPerTurn: d.cardsPerTurn,
      reflect: 0, // reflected damage buffer
    };
  }

  function drawEnemyCards(enemy, count) {
    for (let i = 0; i < count; i++) {
      if (enemy.deck.length === 0) {
        if (enemy.discard.length === 0) return;
        enemy.deck.push(...shuffle(enemy.discard.splice(0)));
      }
      if (enemy.deck.length > 0) enemy.hand.push(enemy.deck.pop());
    }
  }

  function getIntent(enemy) {
    // If hand is empty, peek at deck without consuming cards
    if (enemy.hand.length === 0) {
      // Try to draw to show intent
      if (enemy.deck.length > 0 || enemy.discard.length > 0) {
        drawEnemyCards(enemy, enemy.cardsPerTurn);
      } else {
        return { desc:'蓄力中...', type:'charge' };
      }
    }
    if (enemy.hand.length === 0) return { desc:'蓄力中...', type:'charge' };
    let totalDmg = 0, totalShield = 0, hasPoison = false, hasReflect = false, hasHeal = false, hasPurge = false;
    for (const c of enemy.hand) {
      if (c.fx.damage) totalDmg += c.fx.damage * (c.fx.hits || 1);
      if (c.fx.shield) totalShield += c.fx.shield;
      if (c.fx.poison) hasPoison = true;
      if (c.fx.reflect) hasReflect = true;
      if (c.fx.heal || c.fx.drain) hasHeal = true;
      if (c.fx.purgePlayer) hasPurge = true;
    }
    const parts = [];
    if (totalDmg > 0) parts.push(`攻击 ${totalDmg}`);
    if (totalShield > 0) parts.push(`护盾 ${totalShield}`);
    if (hasPoison) parts.push('中毒');
    if (hasReflect) parts.push('反弹');
    if (hasHeal) parts.push('回复');
    if (hasPurge) parts.push('破盾');
    return { desc: parts.join(' + ') || '...', type:'cards' };
  }

  // Get enemies by act
  function byAct(act) {
    return Object.values(DATA).filter(d => d.act === act && d.type !== 'boss').map(d => d.id);
  }
  function bossOf(act) {
    if (act === 3) return 'ai_core';
    // Act 1 and 2 use elite enemies as mini-bosses
    const elites = Object.values(DATA).filter(d => d.act <= act && d.type === 'elite');
    return elites[Math.floor(Math.random() * elites.length)]?.id || 'encrypt_guard';
  }

  // Legacy compatibility
  function normals() { return ['firewall_node','monitor']; }
  function elites() { return ['encrypt_guard','data_hunter','reflector','purger','healer','berserker']; }
  function boss() { return 'ai_core'; }

  // Tier-based boss lookup
  const TIER_BOSS = {
    node: 'core_guardian',
    terminal: 'sector_overseer',
    sector: 'singularity_herald',
    singularity: 'ai_singularity',
  };
  function bossOfTier(tier) { return TIER_BOSS[tier] || 'ai_core'; }

  // Enemies by tier
  function byTier(tier) {
    const tierAct = { node:1, terminal:2, sector:3 };
    const act = tierAct[tier];
    if (!act) return [];
    return Object.values(DATA).filter(d => d.act === act && d.type !== 'boss').map(d => d.id);
  }

  return { DATA, ENEMY_CARDS, TIER_BOSS, ABSORBED_CARDS, create, drawEnemyCards, getIntent, normals, elites, boss, byAct, bossOf, bossOfTier, byTier };
})();
