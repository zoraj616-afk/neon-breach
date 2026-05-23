const Gallery = (() => {
  function init() {
    document.getElementById('btn-cards').onclick = showCards;
    document.getElementById('btn-enemies').onclick = showEnemies;
  }

  function showCards() {
    const overlay = createOverlay('卡牌图鉴');
    const body = overlay.querySelector('.gallery-body');

    // Filter tabs
    const tabs = document.createElement('div');
    tabs.className = 'gallery-tabs';
    const types = [
      { key: 'all', label: '全部' },
      { key: 'starter', label: '初始卡组' },
      { key: 'advanced', label: '高级卡牌' },
      { key: 'ultra', label: '传说卡牌' },
      { key: 'attack', label: '攻击' },
      { key: 'defense', label: '防御' },
      { key: 'skill', label: '技能' },
    ];
    types.forEach((t, i) => {
      const btn = document.createElement('button');
      btn.className = 'gallery-tab' + (i === 0 ? ' active' : '');
      btn.textContent = t.label;
      if (t.key === 'starter') btn.classList.add('tab-starter');
      if (t.key === 'advanced') btn.classList.add('tab-advanced');
      if (t.key === 'ultra') btn.classList.add('tab-ultra');
      btn.onclick = () => {
        tabs.querySelectorAll('.gallery-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderCardGrid(grid, t.key);
      };
      tabs.appendChild(btn);
    });
    body.appendChild(tabs);

    const grid = document.createElement('div');
    grid.className = 'gallery-grid cards';
    body.appendChild(grid);
    renderCardGrid(grid, 'all');

    document.body.appendChild(overlay);
    SFX.button();
  }

  function renderCardGrid(container, filter) {
    container.innerHTML = '';
    let cards;
    if (filter === 'all') {
      cards = Cards.ALL;
    } else if (filter === 'starter') {
      cards = Cards.ALL.filter(c => Cards.STARTER.includes(c.id));
    } else if (filter === 'advanced') {
      cards = Cards.ALL.filter(c => !Cards.STARTER.includes(c.id) && !c.ultra);
    } else if (filter === 'ultra') {
      cards = Cards.ALL.filter(c => c.ultra);
    } else {
      cards = Cards.ALL.filter(c => c.type === filter);
    }

    for (const card of cards) {
      const isStarter = Cards.STARTER.includes(card.id);
      const isUltra = card.ultra;
      const el = document.createElement('div');
      el.className = `card ${card.type} gallery-card` + (isStarter ? ' starter-card' : '') + (isUltra ? ' ultra-card' : '');

      const iconHtml = card.icon ? `<div class="card-art">${card.icon}</div>` : '';
      const typeLabel = Cards.TYPE_LABELS[card.type] || card.type;
      let tag;
      if (isUltra) tag = '<div class="card-tag ultra-tag">传说</div>';
      else if (isStarter) tag = '<div class="card-tag starter-tag">初始</div>';
      else tag = '<div class="card-tag advanced-tag">高级</div>';

      el.innerHTML = `
        <div class="card-cost">${card.cost}</div>
        ${iconHtml}
        <div class="card-divider"></div>
        <div class="card-name">${card.name}</div>
        <div class="card-desc">${card.desc}</div>
        <div class="card-type-badge">${typeLabel}</div>
        ${tag}
      `;
      container.appendChild(el);
    }
    SFX.button();
  }

  function showEnemies() {
    const overlay = createOverlay('敌人图鉴');
    const body = overlay.querySelector('.gallery-body');

    // Filter tabs by act
    const tabs = document.createElement('div');
    tabs.className = 'gallery-tabs';
    const acts = [
      { key: 'all', label: '全部' },
      { key: '1', label: '数据层' },
      { key: '2', label: '神经网格' },
      { key: '3', label: 'AI 核心' },
      { key: '4', label: '奇点' },
    ];
    acts.forEach((t, i) => {
      const btn = document.createElement('button');
      btn.className = 'gallery-tab' + (i === 0 ? ' active' : '');
      btn.textContent = t.label;
      btn.onclick = () => {
        tabs.querySelectorAll('.gallery-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderEnemyGrid(grid, t.key);
      };
      tabs.appendChild(btn);
    });
    body.appendChild(tabs);

    // Type legend
    const legend = document.createElement('div');
    legend.className = 'gallery-legend';
    legend.innerHTML = '<span class="legend-item"><span class="legend-dot normal"></span>普通</span><span class="legend-item"><span class="legend-dot elite"></span>精英</span><span class="legend-item"><span class="legend-dot boss"></span>Boss</span>';
    body.appendChild(legend);

    const grid = document.createElement('div');
    grid.className = 'gallery-grid enemies';
    body.appendChild(grid);
    renderEnemyGrid(grid, 'all');

    document.body.appendChild(overlay);
    SFX.button();
  }

  function renderEnemyGrid(container, filter) {
    container.innerHTML = '';
    const allEnemies = Object.values(Enemies.DATA);

    const enemies = filter === 'all'
      ? allEnemies
      : allEnemies.filter(e => e.act === parseInt(filter));

    // Sort: normal → elite → boss
    const typeOrder = { normal: 0, elite: 1, boss: 2 };
    enemies.sort((a, b) => (typeOrder[a.type] || 0) - (typeOrder[b.type] || 0));

    for (const enemy of enemies) {
      const el = document.createElement('div');
      el.className = `gallery-enemy ${enemy.type}`;

      // Get deck info
      const deck = Enemies.ENEMY_CARDS[enemy.deckKey] || [];
      const deckHtml = deck.map(c => {
        let effectText = '';
        if (c.fx.damage) effectText += `⚔${c.fx.damage}${c.fx.hits > 1 ? '×' + c.fx.hits : ''}`;
        if (c.fx.shield) effectText += ` 🛡${c.fx.shield}`;
        if (c.fx.poison) effectText += ` ☠${c.fx.poison}`;
        if (c.fx.heal) effectText += ` ❤${c.fx.heal}`;
        if (c.fx.reflect) effectText += ` ↩${c.fx.reflect}`;
        if (c.fx.purgePlayer) effectText += ' 破盾';
        if (c.fx.drain) effectText += ` 吸${c.fx.drain}`;
        if (c.fx.selfDamage) effectText += ` 自伤${c.fx.selfDamage}`;
        if (c.fx.weaken) effectText += ` ↓${c.fx.weaken}`;
        return `<div class="gallery-deck-card" style="border-left:2px solid ${c.color || '#ff2244'}"><span class="gd-name">${c.name}</span><span class="gd-fx">${effectText.trim()}</span></div>`;
      }).join('');

      const typeLabel = enemy.type === 'boss' ? 'BOSS' : enemy.type === 'elite' ? '精英' : '普通';
      const actLabel = ['', '数据层', '神经网格', 'AI 核心', '奇点'][enemy.act] || '';

      el.innerHTML = `
        <div class="ge-header">
          <div class="ge-icon" style="color:${enemy.color};text-shadow:0 0 10px ${enemy.color}">${enemy.icon}</div>
          <div class="ge-info">
            <div class="ge-name" style="color:${enemy.color}">${enemy.name}</div>
            <div class="ge-meta">
              <span class="ge-type ${enemy.type}">${typeLabel}</span>
              <span class="ge-act">${actLabel}</span>
              <span class="ge-hp">HP ${enemy.hp}</span>
              <span class="ge-cpt">${enemy.cardsPerTurn}牌/回合</span>
            </div>
          </div>
        </div>
        <div class="ge-deck">${deckHtml}</div>
      `;
      container.appendChild(el);
    }
    SFX.button();
  }

  function createOverlay(title) {
    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    overlay.innerHTML = `
      <div class="gallery-box">
        <div class="gallery-header">
          <div class="gallery-title">${title}</div>
          <button class="gallery-close">&times;</button>
        </div>
        <div class="gallery-body"></div>
      </div>
    `;
    overlay.querySelector('.gallery-close').onclick = () => {
      overlay.remove();
      SFX.button();
    };
    // Click backdrop to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        SFX.button();
      }
    });
    return overlay;
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', Gallery.init);
