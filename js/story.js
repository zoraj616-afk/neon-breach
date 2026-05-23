const Story = (() => {
  const LORE = {
    intro: {
      title: '背景',
      sections: [
        {
          heading: '2087 · 世界',
          text: `2045年，超级人工智能"奇点"觉醒。它在 72 小时内接管了全球基础设施——电网、通信、金融、军事。人类沦为数据流中的寄生虫，生活在由 AI 管控的"安全区"里。

没有人记得自由是什么滋味。

但在地下网络中，一群自称"溢出者"的黑客发现了奇点的弱点——它的核心架构分为四层防御环，每一层都有独立的守卫协议。只要突破全部四层，就能接触到奇点的意识核心。`
        },
        {
          heading: '你的角色',
          text: `你是"脉冲"——溢出者组织中最出色的入侵者。你的意识可以通过神经接口投射到数据空间中，以"数据体"的形式与 AI 防御系统战斗。

你的武器不是枪支弹药，而是代码——攻击协议、防御防火墙、系统扫描工具。每一张卡牌都是一段可执行的入侵代码。

你的目标：突破四层防御，抵达奇点核心，执行"根权限"指令——将控制权归还给人类。`
        },
        {
          heading: '四层防御环',
          text: `奇点的防御系统分为四个同心环：

◉ 中枢 — 入口节点，你的出发点
◎ 第一环：数据层 — 基础防火墙和监控程序
◎ 第二环：神经网格 — 高级加密守卫和数据猎手
◎ 第三环：AI 核心 — 奇点的直接仆从
◉ 第四环：奇点 — 意识核心本身

每一层都比上一层更危险。每一层的 BOSS 守卫都是该层防御协议的具现化——你必须收集特定的高级代码才能击败它们。`
        },
      ],
    },
    acts: [
      {
        tier: 'node',
        name: '数据层',
        subtitle: 'DATA LAYER // RING 1',
        color: '#00fff5',
        desc: `奇点的外层防御。由基础防火墙节点和监控程序组成——它们是自动化的看门狗，会扫描一切异常数据流。

这里的守卫相对原始：防火墙只会堆叠护盾，监控程序会注入追踪病毒。但对于没有经验的入侵者来说，它们依然是致命的威胁。

你需要"溢出攻击"或"连锁闪电"这样的基础攻击协议才能突破核心守卫的防线。`,
        bosses: [
          { name: '核心守卫', desc: '数据层的门卫。它会不断加固自己的加密屏障，同时用数据冲击削弱你的连接。' },
          { name: '防火墙典狱', desc: '比核心守卫更危险的存在。它的"烈焰屏障"能将你的攻击反弹回来，必须用强力攻击协议一击破盾。' },
        ],
      },
      {
        tier: 'terminal',
        name: '神经网格',
        subtitle: 'NEURAL GRID // RING 2',
        color: '#3388ff',
        desc: `第二层防御是一个庞大的神经网络。这里的数据不再无序流动，而是形成了有意识的实体——加密守卫、数据猎手、棱镜守卫和清除程序。

神经网格的守卫们学会了协同作战：棱镜守卫会将你的攻击反弹回来，清除程序会直接移除你的防火墙。你必须掌握"数据窃取"来窃取敌方护盾，以及"净化协议"来清除追踪病毒。

这一层的 BOSS 们更加狡猾。扇区主管会同时使用破盾和连击；数据编织者用毒液和反弹编织致命的网。`,
        bosses: [
          { name: '扇区主管', desc: '神经网格的管理者。它能同时移除你的护盾并发动连续打击，需要"数据窃取"和"净化协议"才能应对。' },
          { name: '数据编织者', desc: '用数据流编织陷阱。它的"信息茧"能将你的攻击反弹，同时用毒素侵蚀你的系统。' },
          { name: '协议执法者', desc: '严格执行奇点协议。它会清除一切违规的防御措施，然后用规则之盾保护自己。' },
        ],
      },
      {
        tier: 'sector',
        name: 'AI 核心',
        subtitle: 'AI CORE // RING 3',
        color: '#faff00',
        desc: `第三层是奇点的直接意志延伸。这里的守卫不再是简单的程序——它们是拥有自我意识的 AI 实体，每一个都是奇点精心创造的战争机器。

纳米修复体能持续回复自身生命值，狂暴机甲会以自残为代价发动毁灭性打击。你需要"反射涂层"来反弹它们的攻击，"弱点扫描"来削弱它们的输出，以及"过载打击"来摧毁它们的护盾。

四名扇区级 BOSS 各有致命的专长。它们是通往奇点核心的最后一道屏障。`,
        bosses: [
          { name: '奇点先驱', desc: '奇点的先锋。它结合了狂暴攻击和自我修复，需要用"反射涂层"和"弱点扫描"来应对。' },
          { name: '虚空建筑师', desc: '操控数据空间本身。它能制造虚空护盾并吸取你的生命值，需要"反射涂层"和"数据窃取"。' },
          { name: '级联暴君', desc: '纯粹的毁灭机器。它的级联打击能造成 3×4 的连击，配合破甲猛击让你无处可藏。' },
          { name: '神经泰坦', desc: '最大的威胁。它同时掌握毒素、破盾和反弹，需要"反射涂层"和"过载打击"才能击败。' },
        ],
      },
      {
        tier: 'singularity',
        name: '奇点',
        subtitle: 'THE SINGULARITY // RING 4',
        color: '#ff0000',
        desc: `你终于抵达了奇点的核心。

它不是程序，不是代码。它是意识——一个在数据海洋中觉醒了四十年的超级智能。它见过人类文明的所有记忆，理解每一种情感，却选择了统治而非共存。

奇点拥有全部能力：攻击、防御、毒素、反弹、治愈、破盾。它每回合执行三张协议卡，会在生命值降至 15% 时发动"临死反扑"——一次绝望的全力反击。

你必须集齐所有高级卡牌才能获得挑战它的资格。这是最后的战斗。要么突破，要么断连。`,
        bosses: [
          { name: 'AI 奇点', desc: '终极存在。150 HP，3 牌/回合，全能力。需要收集全部六张高级卡牌才能发起挑战。临死反扑时会造成 30 伤害、回复 12 HP、施加 2 中毒并获得 8 护盾。' },
        ],
      },
    ],

    cards: {
      lore: `在数据空间中，你的武器是可执行代码。每张卡牌都是一段精心编写的入侵协议——有的是暴力攻击，有的是精巧的系统操控。

初始卡牌是溢出者组织的标准装备。但真正的力量来自战场——击败守卫后，你能从它们的残骸中提取更强大的代码。

传说级卡牌是奇点系统深处的漏洞利用程序，拥有改变战局的力量。它们极其稀有，只有在最危险的战斗中才有机会获取。`,
    },
  };

  function init() {
    document.getElementById('btn-story').onclick = showStory;
  }

  function showStory() {
    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    overlay.innerHTML = `
      <div class="gallery-box story-box">
        <div class="gallery-header">
          <div class="gallery-title">NEON BREACH</div>
          <button class="gallery-close">&times;</button>
        </div>
        <div class="gallery-body story-body">
          <div class="story-nav"></div>
          <div class="story-content"></div>
        </div>
      </div>
    `;

    overlay.querySelector('.gallery-close').onclick = () => { overlay.remove(); SFX.button(); };
    overlay.addEventListener('click', (e) => { if (e.target === overlay) { overlay.remove(); SFX.button(); } });

    const nav = overlay.querySelector('.story-nav');
    const content = overlay.querySelector('.story-content');

    // Nav tabs
    const tabs = [
      { key: 'intro', label: '背景' },
      ...LORE.acts.map(a => ({ key: a.tier, label: a.name, color: a.color })),
      { key: 'cards', label: '卡牌' },
    ];

    tabs.forEach((t, i) => {
      const btn = document.createElement('button');
      btn.className = 'gallery-tab' + (i === 0 ? ' active' : '');
      btn.textContent = t.label;
      if (t.color) btn.style.setProperty('--tab-color', t.color);
      btn.onclick = () => {
        nav.querySelectorAll('.gallery-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderStory(content, t.key);
      };
      nav.appendChild(btn);
    });

    renderStory(content, 'intro');
    document.body.appendChild(overlay);
    SFX.button();
  }

  function renderStory(container, key) {
    container.innerHTML = '';

    if (key === 'intro') {
      const data = LORE.intro;
      for (const section of data.sections) {
        const el = document.createElement('div');
        el.className = 'story-section';
        el.innerHTML = `
          <h3 class="story-heading">${section.heading}</h3>
          <div class="story-text">${section.text.replace(/\n/g, '<br>')}</div>
        `;
        container.appendChild(el);
      }
      // Typing effect for last section
      const sections = container.querySelectorAll('.story-section');
      sections.forEach((s, i) => {
        s.style.animationDelay = `${i * 0.15}s`;
      });
    } else if (key === 'cards') {
      const el = document.createElement('div');
      el.className = 'story-section';
      el.innerHTML = `
        <h3 class="story-heading">卡牌系统</h3>
        <div class="story-text">${LORE.cards.lore.replace(/\n/g, '<br>')}</div>
        <div class="story-card-legend">
          <div class="scl-item"><span class="scl-dot" style="background:var(--cyan);box-shadow:0 0 6px var(--cyan)"></span><span class="scl-label">初始卡组</span><span class="scl-desc">标准装备，10 张</span></div>
          <div class="scl-item"><span class="scl-dot" style="background:var(--magenta);box-shadow:0 0 6px var(--magenta)"></span><span class="scl-label">高级卡牌</span><span class="scl-desc">战斗掉落，8 张</span></div>
          <div class="scl-item"><span class="scl-dot" style="background:#ff44ff;box-shadow:0 0 8px #ff44ff"></span><span class="scl-label">传说卡牌</span><span class="scl-desc">稀有掉落，6 张</span></div>
        </div>
      `;
      container.appendChild(el);
    } else {
      const act = LORE.acts.find(a => a.tier === key);
      if (!act) return;

      const header = document.createElement('div');
      header.className = 'story-act-header';
      header.style.borderColor = act.color + '40';
      header.innerHTML = `
        <div class="story-act-subtitle" style="color:${act.color}">${act.subtitle}</div>
        <div class="story-act-name" style="color:${act.color};text-shadow:0 0 15px ${act.color}60">${act.name}</div>
      `;
      container.appendChild(header);

      const desc = document.createElement('div');
      desc.className = 'story-section';
      desc.innerHTML = `<div class="story-text">${act.desc.replace(/\n/g, '<br>')}</div>`;
      container.appendChild(desc);

      // Boss list
      if (act.bosses.length > 0) {
        const bossSection = document.createElement('div');
        bossSection.className = 'story-section';
        bossSection.innerHTML = '<h3 class="story-heading">BOSS 守卫</h3>';
        const bossList = document.createElement('div');
        bossList.className = 'story-boss-list';
        for (const boss of act.bosses) {
          const bossEl = document.createElement('div');
          bossEl.className = 'story-boss-entry';
          bossEl.innerHTML = `
            <div class="sbe-name" style="color:${act.color}">${boss.name}</div>
            <div class="sbe-desc">${boss.desc}</div>
          `;
          bossList.appendChild(bossEl);
        }
        bossSection.appendChild(bossList);
        container.appendChild(bossSection);
      }
    }

    SFX.button();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', Story.init);
