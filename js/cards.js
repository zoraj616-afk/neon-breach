const Cards = (() => {
  // SVG icons for each card — small inline SVGs
  const ICONS = {
    data_pulse: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 4L24 16H30L18 22L22 36L10 24H16Z"/></svg>`,
    overflow: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 28C10 18 16 12 20 8C24 12 30 18 34 28"/><path d="M10 32C14 24 18 20 20 16C22 20 26 24 30 32"/><circle cx="20" cy="6" r="2" fill="currentColor"/></svg>`,
    chain_lightning: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M22 4L14 18H20L16 36L28 20H22Z"/><circle cx="8" cy="12" r="3"/><circle cx="32" cy="12" r="3"/><path d="M8 15L14 18M32 15L26 20"/></svg>`,
    virus: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="20" cy="20" r="8"/><circle cx="20" cy="20" r="3" fill="currentColor"/><path d="M20 12V4M20 36V28M12 20H4M36 20H28M14.3 14.3L8.5 8.5M31.5 31.5L25.7 25.7M25.7 14.3L31.5 8.5M8.5 31.5L14.3 25.7"/></svg>`,
    ultimate: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="20,2 24,14 37,14 27,22 30,35 20,27 10,35 13,22 3,14 16,14" fill="currentColor" opacity="0.3"/><polygon points="20,6 23,15 33,15 25,21 28,31 20,25 12,31 15,21 7,15 17,15"/></svg>`,
    firewall_card: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 4L34 12V22C34 30 28 35 20 38C12 35 6 30 6 22V12Z" fill="currentColor" opacity="0.15"/><path d="M20 4L34 12V22C34 30 28 35 20 38C12 35 6 30 6 22V12Z"/><path d="M14 20L18 24L26 16"/></svg>`,
    backup: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="8" y="8" width="24" height="6" rx="2"/><rect x="8" y="17" width="24" height="6" rx="2"/><rect x="8" y="26" width="24" height="6" rx="2"/><circle cx="14" cy="11" r="1.5" fill="currentColor"/><circle cx="14" cy="20" r="1.5" fill="currentColor"/><circle cx="14" cy="29" r="1.5" fill="currentColor"/></svg>`,
    disconnect: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 14L18 20L12 26"/><path d="M22 14L28 20L22 26"/><line x1="17" y1="30" x2="27" y2="30"/></svg>`,
    scan: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="20" cy="20" r="10"/><circle cx="20" cy="20" r="4"/><path d="M20 6V10M20 30V34M6 20H10M30 20H34"/><line x1="20" y1="16" x2="20" y2="24" stroke-dasharray="2 2"/></svg>`,
    overclock: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="20" cy="20" r="12"/><path d="M20 10V20L26 26"/><path d="M32 12L34 8M8 12L6 8M36 20H32M8 20H4"/></svg>`,
    buffer: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="6" y="10" width="28" height="20" rx="3"/><path d="M12 16L16 20L12 24"/><line x1="20" y1="16" x2="28" y2="16"/><line x1="20" y1="20" x2="24" y2="20"/><line x1="20" y1="24" x2="26" y2="24"/></svg>`,
    format: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="20" cy="20" r="14"/><path d="M14 14L26 26M26 14L14 26"/><circle cx="20" cy="20" r="6" stroke-dasharray="3 3"/></svg>`,
    // NEW counter-play cards
    data_theft: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 6L26 14H14Z"/><rect x="10" y="16" width="20" height="14" rx="2"/><path d="M16 22H24M16 26H22"/><path d="M30 10L34 6M30 10L34 14"/></svg>`,
    purify: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="20" cy="20" r="12"/><path d="M14 20L18 24L26 16"/><path d="M20 8V4M20 36V32M8 20H4M36 20H32"/></svg>`,
    reflect_coat: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 4L34 12V22C34 30 28 35 20 38C12 35 6 30 6 22V12Z"/><path d="M12 18L20 26L28 18" stroke-dasharray="3 2"/></svg>`,
    weakness_scan: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="20" cy="20" r="10"/><circle cx="20" cy="20" r="4"/><path d="M10 10L16 16M30 10L24 16M10 30L16 24M30 30L24 24"/></svg>`,
    overload_strike: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 4L24 16H30L18 22L22 36L10 24H16Z"/><circle cx="20" cy="20" r="16" stroke-dasharray="4 3"/></svg>`,
    system_rewrite: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="6" y="6" width="28" height="28" rx="4"/><path d="M12 14H28M12 20H24M12 26H20"/><path d="M30 10L34 6M30 10L34 14"/></svg>`,
    // ULTRA-RARE cards
    data_storm: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 8L14 16H10L16 28H12L20 38L16 26H20L14 16H18Z"/><path d="M24 4L28 12H26L32 24H28L34 34L28 22H32L26 12H30Z" opacity="0.6"/><circle cx="20" cy="20" r="3" fill="currentColor"/></svg>`,
    quantum_strike: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="20" cy="20" r="14" stroke-dasharray="3 2"/><circle cx="20" cy="20" r="8"/><path d="M20 6V12M20 28V34M6 20H12M28 20H34"/><circle cx="20" cy="20" r="2" fill="currentColor"/></svg>`,
    aegis_protocol: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 4L34 12V22C34 30 28 35 20 38C12 35 6 30 6 22V12Z" fill="currentColor" opacity="0.1"/><path d="M20 4L34 12V22C34 30 28 35 20 38C12 35 6 30 6 22V12Z"/><path d="M14 18L20 24L26 18"/><path d="M14 24L20 30L26 24" opacity="0.5"/></svg>`,
    data_vault: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="6" y="10" width="28" height="22" rx="3"/><rect x="10" y="14" width="20" height="14" rx="2"/><circle cx="20" cy="21" r="4"/><circle cx="20" cy="21" r="1.5" fill="currentColor"/><path d="M16 10V6H24V10"/></svg>`,
    system_override: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="8" width="32" height="24" rx="3"/><path d="M10 14H30M10 20H26M10 26H22"/><path d="M32 12L36 8M32 12L36 16" stroke-width="2.5"/><circle cx="8" cy="14" r="1" fill="currentColor"/></svg>`,
    root_access: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 4L26 14H14Z" fill="currentColor" opacity="0.2"/><path d="M20 4L26 14H14Z"/><rect x="10" y="16" width="20" height="16" rx="2"/><path d="M16 22H24M16 26H24"/><path d="M20 16V14"/><circle cx="20" cy="10" r="2" fill="currentColor"/></svg>`,
  };

  const ALL = [
    { id:'data_pulse', name:'数据脉冲', type:'attack', cost:1, desc:'造成 6 伤害', fx:{ damage:6 } },
    { id:'overflow', name:'溢出攻击', type:'attack', cost:2, desc:'造成 10 伤害', fx:{ damage:10 } },
    { id:'chain_lightning', name:'连锁闪电', type:'attack', cost:1, desc:'造成 3×3 伤害', fx:{ damage:3, hits:3 } },
    { id:'virus', name:'病毒注入', type:'attack', cost:2, desc:'造成 4 伤害\n施加 2 中毒', fx:{ damage:4, poison:2 } },
    { id:'ultimate', name:'终极破解', type:'attack', cost:3, desc:'造成 20 伤害', fx:{ damage:20 } },
    { id:'firewall_card', name:'防火墙', type:'defense', cost:1, desc:'获得 5 护盾', fx:{ shield:5 } },
    { id:'backup', name:'数据备份', type:'defense', cost:2, desc:'获得 8 护盾\n回复 3 HP', fx:{ shield:8, heal:3 } },
    { id:'disconnect', name:'紧急断连', type:'defense', cost:1, desc:'获得 4 护盾\n抽 1 张牌', fx:{ shield:4, draw:1 } },
    { id:'scan', name:'系统扫描', type:'skill', cost:1, desc:'抽 2 张牌', fx:{ draw:2 } },
    { id:'overclock', name:'超频', type:'skill', cost:0, desc:'本回合 +1 能量', fx:{ energy:1 } },
    { id:'buffer', name:'缓冲溢出', type:'skill', cost:1, desc:'下张牌费用 -1', fx:{ costReduce:1 } },
    { id:'format', name:'格式化', type:'skill', cost:2, desc:'造成 8 伤害\n移除增益', fx:{ damage:8, purge:true } },
    // NEW counter-play cards
    { id:'data_theft', name:'数据窃取', type:'attack', cost:1, desc:'造成 4 伤害\n窃取护盾', fx:{ damage:4, stealShield:true } },
    { id:'purify', name:'净化协议', type:'defense', cost:1, desc:'获得 4 护盾\n清除负面状态', fx:{ shield:4, cleanse:true } },
    { id:'reflect_coat', name:'反射涂层', type:'defense', cost:2, desc:'获得 6 护盾\n反弹 3', fx:{ shield:6, playerReflect:3 } },
    { id:'weakness_scan', name:'弱点扫描', type:'skill', cost:1, desc:'造成 3 伤害\n敌方攻击 -2', fx:{ damage:3, weaken:2 } },
    { id:'overload_strike', name:'过载打击', type:'attack', cost:2, desc:'造成 8 伤害\n若敌方有护盾 +8', fx:{ damage:8, bonusIfShield:8 } },
    { id:'system_rewrite', name:'系统重写', type:'skill', cost:2, desc:'造成 6 伤害\n移除护盾 抽 1 牌', fx:{ damage:6, purge:true, draw:1 } },
    // ULTRA-RARE — high stats, expensive, low drop rate
    { id:'data_storm', name:'数据风暴', type:'attack', cost:3, desc:'造成 5×4 伤害', fx:{ damage:5, hits:4 }, ultra:true },
    { id:'quantum_strike', name:'量子打击', type:'attack', cost:4, desc:'造成 28 伤害', fx:{ damage:28 }, ultra:true },
    { id:'aegis_protocol', name:'神盾协议', type:'defense', cost:3, desc:'获得 15 护盾\n反弹 5', fx:{ shield:15, playerReflect:5 }, ultra:true },
    { id:'data_vault', name:'数据金库', type:'defense', cost:2, desc:'获得 10 护盾\n抽 2 张牌', fx:{ shield:10, draw:2 }, ultra:true },
    { id:'system_override', name:'系统覆盖', type:'skill', cost:2, desc:'获得 2 能量\n抽 2 张牌', fx:{ energy:2, draw:2 }, ultra:true },
    { id:'root_access', name:'根权限', type:'skill', cost:3, desc:'造成 10 伤害\n移除护盾\n敌方攻击 -3', fx:{ damage:10, purge:true, weaken:3 }, ultra:true },
  ].map(c => ({ ...c, icon: ICONS[c.id] || '' }));

  const STARTER = [
    'data_pulse','data_pulse','data_pulse',
    'overflow',
    'firewall_card','firewall_card','firewall_card',
    'scan','overclock','chain_lightning',
  ];

  const TYPE_LABELS = { attack:'攻击', defense:'防御', skill:'技能' };

  function get(id) { return { ...ALL.find(c => c.id === id) }; }
  function makeDeck(ids) { return ids.map(id => ({ ...get(id), uid: Math.random().toString(36).slice(2,8) })); }
  function shuffle(a) { for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
  function draw(deck, hand, discard, n) {
    for (let i=0;i<n;i++){
      if(!deck.length){ if(!discard.length) return; deck.push(...shuffle(discard.splice(0))); }
      if(deck.length) hand.push(deck.pop());
    }
  }
  function colorOf(type) {
    return type==='attack' ? '#ff3333' : type==='defense' ? '#4488ff' : '#faff00';
  }
  return { ALL, STARTER, TYPE_LABELS, get, makeDeck, shuffle, draw, colorOf };
})();
