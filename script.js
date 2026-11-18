// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Scroll reveal
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.05 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Background: water vapor molecules (blue) pass through a selective membrane
// (the dotted line under the title); air molecules (grey) bounce off it.
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.getElementById('vapor');
  const hero = document.querySelector('.hero');
  const ctx = canvas.getContext('2d');
  // Inner pages use a plain gradient background (set in CSS), no particle canvas
  if (document.body.hasAttribute('data-static')) { canvas.style.display = 'none'; return; }
  let w, h, dpr, parts = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    const n = Math.min(170, Math.floor(innerWidth / 8));
    parts = Array.from({ length: n }, () => make(true));
  }
  function make(anywhere) {
    const vapor = Math.random() < 0.55;
    return {
      vapor,
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : -5,
      r: (vapor ? 1.8 : 2.6) * dpr * (0.7 + Math.random() * 0.8),
      vx: (Math.random() - 0.5) * 0.5 * dpr,
      vy: (0.25 + Math.random() * 0.6) * dpr
    };
  }
  let mx = -9999, my = -9999;
  addEventListener('pointermove', e => { mx = e.clientX * dpr; my = e.clientY * dpr; });

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const memY = hero.getBoundingClientRect().bottom * dpr; // membrane sits under the title

    // membrane (dotted line)
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, '#1560d600'); g.addColorStop(0.5, '#1560d6aa'); g.addColorStop(1, '#12a58c00');
    ctx.strokeStyle = g; ctx.lineWidth = 2 * dpr; ctx.setLineDash([2 * dpr, 8 * dpr]); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, memY); ctx.lineTo(w, memY); ctx.stroke(); ctx.setLineDash([]);

    for (const p of parts) {
      step(p, memY);
      drawParticle(p);
    }
  }

  function step(p, memY) {
    {
      // gentle repulsion from cursor
      const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy, R = 120 * dpr;
      if (d2 < R * R) { const d = Math.sqrt(d2) || 1; p.vx += dx / d * 0.08 * dpr; p.vy += dy / d * 0.08 * dpr; }

      p.vx += (Math.random() - 0.5) * 0.04 * dpr;
      p.vx *= 0.99;
      p.vy += (0.4 * dpr - p.vy) * 0.01;
      const prevY = p.y;
      p.x += p.vx; p.y += p.vy;

      // air bounces off the membrane, vapor passes through
      if (!p.vapor && prevY < memY && p.y >= memY) { p.y = memY - 1; p.vy = -Math.abs(p.vy) * 1.4; }
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y > h + 10 || p.y < -60) Object.assign(p, make(false));

    }
  }

  function drawParticle(p) {
    {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fillStyle = p.vapor ? '#1f6feb' : '#8aa4bd88';
      if (p.vapor) ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function frame() { draw(); requestAnimationFrame(frame); }

  {
    addEventListener('resize', resize);
    resize(); frame();
  }
})();
