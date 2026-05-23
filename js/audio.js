const SFX = (() => {
  let ctx = null;
  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }
  function tone(freq, dur, type = 'square', vol = 0.12) {
    try {
      const c = getCtx();
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      o.connect(g); g.connect(c.destination);
      o.start(); o.stop(c.currentTime + dur);
    } catch(e) {}
  }
  function noise(dur, vol = 0.08) {
    try {
      const c = getCtx();
      const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const s = c.createBufferSource(); s.buffer = buf;
      const g = c.createGain();
      g.gain.setValueAtTime(vol, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      s.connect(g); g.connect(c.destination); s.start();
    } catch(e) {}
  }
  return {
    cardPlay() { tone(800, 0.08); setTimeout(() => tone(1200, 0.05, 'square', 0.08), 30); },
    cardDraw() { tone(600, 0.05, 'sine', 0.06); },
    hit() { noise(0.12, 0.12); tone(200, 0.1, 'sawtooth', 0.08); },
    playerHit() { tone(150, 0.2, 'sawtooth', 0.12); noise(0.15, 0.1); },
    shield() { tone(400, 0.12, 'sine', 0.08); tone(600, 0.08, 'sine', 0.06); },
    heal() { tone(500, 0.1, 'sine', 0.08); setTimeout(() => tone(700, 0.12, 'sine', 0.08), 80); },
    bossPhase() { tone(200, 0.3, 'sawtooth', 0.12); setTimeout(() => tone(150, 0.35, 'sawtooth', 0.1), 150); setTimeout(() => tone(100, 0.4, 'sawtooth', 0.08), 350); },
    victory() { [400,500,600,700,800].forEach((f,i) => setTimeout(() => tone(f, 0.2, 'sine', 0.08), i*100)); },
    defeat() { tone(300, 0.3, 'sawtooth', 0.1); setTimeout(() => tone(200, 0.4, 'sawtooth', 0.08), 200); },
    button() { tone(1000, 0.04, 'square', 0.05); },
    buy() { tone(800, 0.06, 'sine', 0.08); setTimeout(() => tone(1000, 0.06, 'sine', 0.08), 60); setTimeout(() => tone(1200, 0.08, 'sine', 0.08), 120); },
    poison() { noise(0.25, 0.06); tone(100, 0.2, 'sine', 0.05); },
  };
})();
