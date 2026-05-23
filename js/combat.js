const Combat = (() => {
  let S = null;
  let onEnd = null;
  let combatLog = [];

  function log(msg) {
    combatLog.push(msg);
    const el = document.getElementById('combat-log');
    if (el) el.innerHTML = combatLog.slice(-3).map(m => `<div class="log-line">${m}</div>`).join('');
  }

  function narrateCombat(text) {
    if (typeof Game !== 'undefined' && Game.narrate) {
      Game.narrate(text, '#ff0000');
    }
  }

  function start(enemyIds, callback, enhance, extraCards) {
    onEnd = callback;
    combatLog = [];
    const enemies = enemyIds.map(id => Enemies.create(id, extraCards));
    // Apply Singularity enhancement
    if (enhance && (enhance.hpBonus > 0 || enhance.shieldBonus > 0)) {
      for (const e of enemies) {
        e.maxHp += enhance.hpBonus;
        e.curHp += enhance.hpBonus;
        e.shield += enhance.shieldBonus;
      }
    }
    S = {
      p: { hp: window.playerHp||60, maxHp:60, shield:0, energy:3, maxEnergy:3, poison:0, costReduce:0, weaken:0 },
      enemies,
      deck: Cards.shuffle(Cards.makeDeck(window.playerDeck || Cards.STARTER)),
      hand: [], discard: [],
      turn: 0, phase: 'player', target: 0,
    };
    for (const e of S.enemies) Enemies.drawEnemyCards(e, e.cardsPerTurn);
    log('系统连接建立...');
    beginPlayerTurn();
  }

  function beginPlayerTurn() {
    S.turn++;
    S.p.shield = 0;
    S.p.energy = S.p.maxEnergy;
    S.p.costReduce = 0;
    S.p.weaken = 0;
    S.p.reflect = S.p.reflect || 0;
    Cards.draw(S.deck, S.hand, S.discard, 5);
    S.phase = 'player';
    // Apply poison to player
    if (S.p.poison > 0) {
      S.p.hp -= S.p.poison;
      showPlayerDmg(S.p.poison);
      log(`中毒 -${S.p.poison}`);
      S.p.poison = Math.max(0, S.p.poison - 1);
      if (S.p.hp <= 0) { end(false); return; }
    }
    // Decay enemy reflect at start of player turn
    for (const e of S.enemies) {
      if (e.curHp > 0) e.reflect = 0;
    }
    log(`— 回合 ${S.turn} —`);
    render();
  }

  function play(i) {
    if (S.phase !== 'player') return;
    const card = S.hand[i]; if (!card) return;
    const cost = Math.max(0, card.cost - S.p.costReduce);
    if (cost > S.p.energy) return;

    S.p.energy -= cost;
    S.hand.splice(i, 1);
    S.discard.push(card);
    S.p.costReduce = 0;

    const enemy = S.enemies[S.target];
    const eEl = document.querySelectorAll('#enemy-area .enemy')[S.target];
    const eRect = eEl ? eEl.getBoundingClientRect() : null;
    const color = Cards.colorOf(card.type);

    const cardEls = document.querySelectorAll('#hand .card');
    if (cardEls[i]) cardEls[i].classList.add('playing');

    let totalDmg = 0;

    // Apply effects
    if (card.fx.damage) {
      const hits = card.fx.hits || 1;
      let dmgPerHit = card.fx.damage;
      // Apply weaken debuff
      if (S.p.weaken > 0) {
        dmgPerHit = Math.max(1, dmgPerHit - S.p.weaken);
      }
      for (let h = 0; h < hits; h++) {
        let dmg = dmgPerHit;
        if (enemy.shield > 0) { const abs = Math.min(enemy.shield, dmg); enemy.shield -= abs; dmg -= abs; }
        enemy.curHp = Math.max(0, enemy.curHp - dmg);
        totalDmg += dmg;
      }
      if (eRect) {
        FX.burst(eRect.left + 40, eRect.top + 40, color, 20);
        FX.dmgNumber(eRect.left + 30, eRect.top, totalDmg);
      }
      FX.shake(4, 120); SFX.hit();
      if (eEl) { eEl.classList.add('hit'); setTimeout(() => eEl.classList.remove('hit'), 200); }

      // Reflect damage back to player
      if (enemy.reflect > 0 && totalDmg > 0) {
        const reflected = Math.min(enemy.reflect, totalDmg);
        S.p.hp -= reflected;
        log(`${enemy.name} 反弹 ${reflected} 伤害！`);
        showPlayerDmg(reflected);
        FX.flash('#00ffff', 300);
      }
    }
    if (card.fx.poison) { enemy.poison += card.fx.poison; SFX.poison(); log(`施加 ${card.fx.poison} 中毒`); }
    if (card.fx.purge) { enemy.shield = 0; log('移除敌方护盾'); }
    if (card.fx.shield) { S.p.shield += card.fx.shield; SFX.shield(); }
    if (card.fx.heal) { S.p.hp = Math.min(S.p.maxHp, S.p.hp + card.fx.heal); SFX.heal(); }
    if (card.fx.draw) { Cards.draw(S.deck, S.hand, S.discard, card.fx.draw); for(let d=0;d<card.fx.draw;d++) SFX.cardDraw(); }
    if (card.fx.energy) S.p.energy += card.fx.energy;
    if (card.fx.costReduce) S.p.costReduce += card.fx.costReduce;
    // NEW: Counter-play effects
    if (card.fx.stealShield && enemy.shield > 0) {
      const stolen = enemy.shield;
      enemy.shield = 0;
      S.p.shield += stolen;
      SFX.shield();
      log(`窃取 ${stolen} 护盾`);
    }
    if (card.fx.cleanse) {
      S.p.poison = 0;
      S.p.weaken = 0;
      SFX.heal();
      log('清除负面状态');
    }
    if (card.fx.playerReflect) {
      S.p.reflect = (S.p.reflect || 0) + card.fx.playerReflect;
      SFX.shield();
      log(`反弹 +${card.fx.playerReflect}`);
    }
    if (card.fx.weaken) {
      enemy.weaken = (enemy.weaken || 0) + card.fx.weaken;
      log(`敌方攻击 -${card.fx.weaken}`);
    }
    if (card.fx.bonusIfShield && enemy.shield > 0) {
      const bonus = card.fx.bonusIfShield;
      enemy.curHp = Math.max(0, enemy.curHp - bonus);
      if (eRect) {
        FX.burst(eRect.left + 40, eRect.top + 40, '#ff00ff', 15);
        FX.dmgNumber(eRect.left + 30, eRect.top - 20, bonus);
      }
      log(`过载 +${bonus} 伤害`);
    }

    SFX.cardPlay();
    render();

    // Boss Last Stand check
    if (enemy.type === 'boss' && enemy.curHp > 0 && !enemy.lastStand && enemy.curHp <= enemy.maxHp * 0.15) {
      enemy.lastStand = true;
      setTimeout(() => bossLastStand(enemy), 600);
      return;
    }

    if (S.p.hp <= 0) { setTimeout(() => end(false), 500); return; }
    if (S.enemies.filter(e => e.curHp > 0).length === 0) {
      setTimeout(() => end(true), 500);
    }
  }

  // === BOSS LAST STAND (临死反扑) ===
  function bossLastStand(enemy) {
    const eEl = document.querySelectorAll('#enemy-area .enemy')[S.enemies.indexOf(enemy)];
    const eRect = eEl ? eEl.getBoundingClientRect() : null;

    // Dramatic effects
    FX.flash('#ff0000', 600);
    FX.shake(10, 500);
    SFX.bossPhase();

    log(`⚠ ${enemy.name} 发动临死反扑！`);

    // Deal massive damage
    const lastStandDmg = Math.floor(enemy.maxHp * 0.2);
    let dmg = lastStandDmg;
    if (S.p.shield > 0) { const abs = Math.min(S.p.shield, dmg); S.p.shield -= abs; dmg -= abs; }
    S.p.hp -= dmg;

    showPlayerDmg(lastStandDmg);
    log(`临死反扑造成 ${lastStandDmg} 伤害！`);

    // Boss also heals a bit
    const healAmt = Math.floor(enemy.maxHp * 0.08);
    enemy.curHp = Math.min(enemy.maxHp, enemy.curHp + healAmt);
    log(`${enemy.name} 回复 ${healAmt} HP`);

    // Apply poison to player
    S.p.poison += 2;
    log('施加 2 中毒');

    // Boss gets shield
    enemy.shield += 8;
    log('获得 8 护盾');

    if (eRect) {
      FX.burst(eRect.left + 40, eRect.top + 40, '#ff0000', 30, 300);
      FX.burst(eRect.left + 40, eRect.top + 40, '#ff00ff', 20, 250);
    }

    render();

    if (S.p.hp <= 0) {
      setTimeout(() => end(false), 800);
    }
  }

  function endTurn() {
    if (S.phase !== 'player') return;
    S.phase = 'enemy';
    S.hand.forEach(c => S.discard.push(c));
    S.hand = [];
    log('— 敌方回合 —');
    render();
    setTimeout(() => enemyTurnStart(), 500);
  }

  function enemyTurnStart() {
    for (const e of S.enemies) {
      if (e.curHp > 0) {
        e.hand = [];
        e.playedThisTurn = [];
        Enemies.drawEnemyCards(e, e.cardsPerTurn);
      }
    }
    render();
    setTimeout(() => enemyPlayCard(0, 0), 600);
  }

  function enemyPlayCard(enemyIdx, cardIdx) {
    while (enemyIdx < S.enemies.length && S.enemies[enemyIdx].curHp <= 0) enemyIdx++;
    if (enemyIdx >= S.enemies.length) {
      setTimeout(() => beginPlayerTurn(), 400);
      return;
    }

    const enemy = S.enemies[enemyIdx];
    if (cardIdx >= enemy.hand.length) {
      setTimeout(() => enemyPlayCard(enemyIdx + 1, 0), 300);
      return;
    }

    const card = enemy.hand[cardIdx];
    enemy.playedThisTurn.push(card);

    // Apply poison to enemy at start of their turn (only for first card)
    if (cardIdx === 0 && enemy.poison > 0) {
      enemy.curHp -= enemy.poison;
      log(`${enemy.name} 中毒 -${enemy.poison}`);
      enemy.poison = Math.max(0, enemy.poison - 1);
      if (enemy.curHp <= 0) {
        render();
        setTimeout(() => enemyPlayCard(enemyIdx + 1, 0), 300);
        return;
      }
    }

    render();

    setTimeout(() => {
      let logParts = [`${enemy.name} 使用 ${card.name}`];

      // Attack
      if (card.fx.damage) {
        const hits = card.fx.hits || 1;
        let totalDmg = 0;
        let actualDmg = card.fx.damage;
        // Apply enemy weaken
        if (enemy.weaken > 0) {
          actualDmg = Math.max(1, actualDmg - enemy.weaken);
        }
        for (let h = 0; h < hits; h++) {
          let dmg = actualDmg;
          if (S.p.shield > 0) { const abs = Math.min(S.p.shield, dmg); S.p.shield -= abs; dmg -= abs; }
          S.p.hp -= dmg;
          totalDmg += dmg;
        }
        FX.shake(6, 200); SFX.playerHit();
        showPlayerDmg(totalDmg);
        logParts.push(`造成 ${totalDmg} 伤害`);
        // Player reflect
        if (S.p.reflect > 0 && totalDmg > 0) {
          const reflected = Math.min(S.p.reflect, totalDmg);
          enemy.curHp = Math.max(0, enemy.curHp - reflected);
          log(`反弹 ${reflected} 伤害给 ${enemy.name}！`);
          FX.flash('#00fff5', 200);
        }
      }

      // Poison
      if (card.fx.poison) {
        S.p.poison += card.fx.poison;
        SFX.poison();
        logParts.push(`中毒 ${card.fx.poison}`);
      }

      // Shield
      if (card.fx.shield) {
        enemy.shield += card.fx.shield;
        SFX.shield();
        logParts.push(`护盾 +${card.fx.shield}`);
      }

      // Reflect
      if (card.fx.reflect) {
        enemy.reflect += card.fx.reflect;
        logParts.push(`反弹 ${card.fx.reflect}`);
      }

      // Purge player shield
      if (card.fx.purgePlayer) {
        S.p.shield = 0;
        SFX.hit();
        logParts.push('移除你的护盾');
      }

      // Enemy heal
      if (card.fx.heal) {
        enemy.curHp = Math.min(enemy.maxHp, enemy.curHp + card.fx.heal);
        SFX.heal();
        logParts.push(`回复 ${card.fx.heal}`);
      }

      // Drain (damage + heal)
      if (card.fx.drain) {
        enemy.curHp = Math.min(enemy.maxHp, enemy.curHp + card.fx.drain);
        logParts.push(`吸取 ${card.fx.drain}`);
      }

      // Self damage (berserker)
      if (card.fx.selfDamage) {
        enemy.curHp = Math.max(1, enemy.curHp - card.fx.selfDamage);
        logParts.push(`自伤 ${card.fx.selfDamage}`);
      }

      log(logParts.join(' · '));

      // Boss phase check
      if (enemy.type === 'boss') {
        if (enemy.phase === 1 && enemy.curHp <= enemy.maxHp * 0.6) {
          enemy.phase = 2; SFX.bossPhase(); FX.flash('#ff00ff', 400); log(`${enemy.name} 进入阶段 2！`);
          if (enemy.id === 'ai_singularity') narrateCombat('「有趣... 你逼我动用了更多算力」');
        } else if (enemy.phase === 2 && enemy.curHp <= enemy.maxHp * 0.3) {
          enemy.phase = 3; SFX.bossPhase(); FX.flash('#ff0000', 500); FX.shake(12, 500); log(`${enemy.name} 进入最终阶段！`);
          if (enemy.id === 'ai_singularity') narrateCombat('「够了... 让这一切结束吧」');
        }
      }

      render();

      if (S.p.hp <= 0) {
        setTimeout(() => end(false), 500);
        return;
      }

      setTimeout(() => enemyPlayCard(enemyIdx, cardIdx + 1), 500);
    }, 400);
  }

  function showPlayerDmg(amount) {
    const stats = document.getElementById('player-stats');
    if (stats) {
      const r = stats.getBoundingClientRect();
      FX.burst(r.left + 50, r.top, '#ff3333', 10);
      FX.dmgNumber(r.left + 40, r.top - 10, amount);
    }
  }

  function selectTarget(i) { S.target = i; render(); }

  function end(won) {
    S.phase = 'ended';
    window.playerHp = Math.max(0, S.p.hp);
    if (won) { SFX.victory(); FX.rain('#00fff5', 50); log('入侵成功！'); }
    else { SFX.defeat(); FX.flash('#ff0000', 600); log('连接断开...'); }
    if (onEnd) onEnd(won);
  }

  function render() {
    if (!S) return;

    // === Enemy area ===
    const area = document.getElementById('enemy-area');
    area.innerHTML = '';

    S.enemies.forEach((e, i) => {
      if (e.curHp <= 0 && S.phase === 'player') return;
      const el = document.createElement('div');
      el.className = 'enemy' + (e.type==='boss'?' boss phase-'+e.phase:'') + (i===S.target?' selected':'');
      el.onclick = () => selectTarget(i);

      const hp = Math.max(0, e.curHp);
      const pct = (hp / e.maxHp) * 100;

      // Enemy hand — face-up cards
      let handHtml = '<div class="enemy-hand">';
      for (let c = 0; c < e.hand.length; c++) {
        const card = e.hand[c];
        const played = e.playedThisTurn.includes(card);
        const borderColor = card.color || '#ff2244';
        // Summarize effect
        let effectText = '';
        if (card.fx.damage) effectText += `⚔${card.fx.damage}${card.fx.hits > 1 ? '×' + card.fx.hits : ''} `;
        if (card.fx.shield) effectText += `🛡${card.fx.shield} `;
        if (card.fx.poison) effectText += `☠${card.fx.poison} `;
        if (card.fx.heal) effectText += `❤${card.fx.heal} `;
        if (card.fx.reflect) effectText += `↩${card.fx.reflect} `;
        if (card.fx.purgePlayer) effectText += '破盾 ';
        if (card.fx.drain) effectText += `吸${card.fx.drain} `;
        if (card.fx.selfDamage) effectText += `自伤${card.fx.selfDamage} `;
        if (card.fx.weaken) effectText += `↓${card.fx.weaken} `;
        handHtml += `<div class="enemy-card-open${played ? ' played' : ''}" style="border-color:${borderColor}">
          <div class="eco-name">${card.name}</div>
          <div class="eco-effect">${effectText.trim()}</div>
        </div>`;
      }
      handHtml += '</div>';

      // Played cards display
      let playedHtml = '';
      if (e.playedThisTurn.length > 0 && S.phase === 'enemy') {
        const lastPlayed = e.playedThisTurn[e.playedThisTurn.length - 1];
        playedHtml = `<div class="enemy-played-card" style="border-color:${lastPlayed.color}">
          <div class="ecp-name">${lastPlayed.name}</div>
          <div class="ecp-desc">${lastPlayed.desc}</div>
        </div>`;
      }

      // Intent (show during player turn)
      const intent = Enemies.getIntent(e);
      const intentHtml = S.phase === 'player' ? `<div class="enemy-intent">${intent.desc}</div>` : '';

      // Status text
      let statusParts = [];
      if (e.shield > 0) statusParts.push(`🛡${e.shield}`);
      if (e.poison > 0) statusParts.push(`☠${e.poison}`);
      if (e.reflect > 0) statusParts.push(`↩${e.reflect}`);
      const statusHtml = statusParts.length > 0 ? `<div class="enemy-hp-text">${statusParts.join(' ')}</div>` : '';

      el.innerHTML = `
        ${handHtml}
        <div class="enemy-sprite" style="border-color:${e.color};box-shadow:0 0 15px ${e.color}40">${e.icon}</div>
        <div class="enemy-name">${e.name}</div>
        <div class="enemy-hp-bar"><div class="enemy-hp-fill" style="width:${pct}%"></div></div>
        <div class="enemy-hp-text"><span class="current-hp">${hp}</span>/${e.maxHp}</div>
        ${statusHtml}
        ${intentHtml}
        ${playedHtml}
      `;
      area.appendChild(el);
    });

    // === Player stats ===
    const hpLow = S.p.hp <= S.p.maxHp * 0.3;
    let statsHtml = `<span class="stat-hp${hpLow?' low':''}">❤ ${Math.max(0,S.p.hp)}/${S.p.maxHp}</span>`;
    statsHtml += `<span class="stat-shield">🛡 ${S.p.shield}</span>`;
    if (S.p.poison > 0) statsHtml += `<span class="stat-poison">☠ ${S.p.poison}</span>`;
    if (S.p.weaken > 0) statsHtml += `<span class="stat-weaken">↓${S.p.weaken}</span>`;
    document.getElementById('player-stats').innerHTML = statsHtml;

    // === Energy display with pips ===
    const energyEl = document.getElementById('energy-display');
    let energyHtml = '';
    for (let i = 0; i < S.p.maxEnergy; i++) {
      energyHtml += `<span class="energy-pip${i < S.p.energy ? ' filled' : ' empty'}"></span>`;
    }
    energyEl.innerHTML = energyHtml;

    // === Deck / discard counts ===
    document.getElementById('deck-count').textContent = `牌组 ${S.deck.length}`;
    document.getElementById('discard-count').textContent = `弃牌 ${S.discard.length}`;

    // === Player hand ===
    const hand = document.getElementById('hand');
    hand.innerHTML = '';
    S.hand.forEach((card, i) => {
      const cost = Math.max(0, card.cost - S.p.costReduce);
      const ok = cost <= S.p.energy && S.phase === 'player';
      const el = document.createElement('div');
      el.className = `card ${card.type}` + (ok ? '' : ' unplayable');

      const iconHtml = card.icon ? `<div class="card-art">${card.icon}</div>` : '';
      const typeLabel = Cards.TYPE_LABELS[card.type] || card.type;

      el.innerHTML = `
        <div class="card-cost">${cost}</div>
        ${iconHtml}
        <div class="card-divider"></div>
        <div class="card-name">${card.name}</div>
        <div class="card-desc">${card.desc}</div>
        <div class="card-type-badge">${typeLabel}</div>
      `;
      if (ok) el.onclick = () => play(i);
      hand.appendChild(el);
    });

    document.getElementById('btn-end-turn').style.display = S.phase === 'player' ? '' : 'none';
  }

  return { start, play, endTurn, selectTarget, render, getState: () => S };
})();
