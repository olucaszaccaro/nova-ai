    /* ─────────────────────────────────────────────────
       SUPABASE CONFIG
       1. Crie uma conta em supabase.com (gratuito)
       2. Crie um projeto e execute o SQL abaixo no SQL Editor:

          create table leads (
            id         uuid default gen_random_uuid() primary key,
            nome       text,
            email      text,
            whatsapp   text,
            source     text default 'landing-page',
            created_at timestamptz default now()
          );

          alter table leads enable row level security;
          create policy "insert leads" on leads for insert with check (true);

       3. Vá em Project Settings > API e copie:
          - Project URL → cole em SUPABASE_URL
          - anon public key → cole em SUPABASE_KEY
    ───────────────────────────────────────────────── */
    const SUPABASE_URL = 'https://iwdvhgqnlgxfqsqsfhmz.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_tfU8VvGwJOFoi-oi-tKmgw_Gk_4cE2M';
    const WPP_LINK     = 'https://chat.whatsapp.com/F5000nSwSezL2sIER5dEtN?s=cl&p=i&mlu=3';

    async function salvarLead(nome, email, whatsapp) {
      if (!SUPABASE_URL.startsWith('https://')) return; // skip if not configured
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ nome, email, whatsapp, source: 'landing-page' })
        });
      } catch(e) {
        console.warn('Supabase:', e.message);
        // Fail silently — still redirect to WhatsApp
      }
    }

    /* ── MODAL ── */
    function openModal() {
      document.getElementById('modal').classList.add('open');
      document.body.style.overflow = 'hidden';
      document.getElementById('f-nome').focus();
    }
    function closeModal() {
      document.getElementById('modal').classList.remove('open');
      document.body.style.overflow = '';
    }
    function handleOverlayClick(e) {
      if (e.target === document.getElementById('modal')) closeModal();
    }
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeLegal(); } });

    // Legal modal
    function openLegal() {
      document.getElementById('modal-legal').classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLegal() {
      document.getElementById('modal-legal').classList.remove('open');
      document.body.style.overflow = '';
    }
    function handleLegalOverlay(e) {
      if (e.target === document.getElementById('modal-legal')) closeLegal();
    }
    function switchTab(id, btn) {
      document.querySelectorAll('.legal-section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.legal-tab').forEach(t => t.classList.remove('active'));
      document.getElementById('tab-' + id).classList.add('active');
      btn.classList.add('active');
      document.querySelector('.legal-body').scrollTop = 0;
    }

    async function handleSubmit(e) {
      e.preventDefault();
      const nome     = document.getElementById('f-nome').value.trim();
      const email    = document.getElementById('f-email').value.trim();
      const whatsapp = document.getElementById('f-wpp').value.trim();
      const btn      = document.getElementById('btn-submit');

      btn.disabled = true;
      btn.textContent = 'Salvando…';

      await salvarLead(nome, email, whatsapp);

      // Show success
      document.getElementById('modal-form').style.display = 'none';
      const suc = document.getElementById('modal-success');
      suc.style.display = 'block';
      document.getElementById('user-nome').textContent = nome.split(' ')[0];

      // Animate progress bar
      requestAnimationFrame(() => {
        document.getElementById('progress-bar').style.width = '100%';
      });

      // Redirect after 2.4s
      setTimeout(() => { window.open(WPP_LINK, '_blank'); closeModal(); }, 2400);
    }

    /* ── HERO CANVAS PARTICLES (disabled — replaced by hero video animation) ── */
    (function() {
      const canvas = document.getElementById('hero-canvas');
      if (!canvas) return;
      const ctx    = canvas.getContext('2d');
      let   W, H, particles = [];
      let   mouse = { x: null, y: null };
      const N = window.innerWidth < 600 ? 120 : 220;
      const COLORS = [
        '150,208,52',   // --nova green
        '197,240,106',  // --lime
        '100,200,40',   // deeper green
        '180,230,80',   // mid green
        '220,255,130',  // bright lime
      ];

      function resize() {
        const dpr = window.devicePixelRatio || 1;
        W = canvas.offsetWidth;  H = canvas.offsetHeight;
        canvas.width  = W * dpr; canvas.height = H * dpr;
        ctx.scale(dpr, dpr);
        build();
      }

      function build() {
        particles = Array.from({ length: N }, () => ({
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 2.8 + .6,
          vx: (Math.random() - .5) * .65,
          vy: (Math.random() - .5) * .65,
          alpha: Math.random() * .55 + .2,
          phase: Math.random() * Math.PI * 2,
          freq: Math.random() * .018 + .008,
          color: COLORS[Math.floor(Math.random() * COLORS.length)]
        }));
      }

      function draw() {
        ctx.clearRect(0, 0, W, H);

        // Draw connections first (behind particles)
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.hypot(dx, dy);
            if (dist < 90) {
              const lineAlpha = (1 - dist / 90) * 0.18;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(150,208,52,${lineAlpha})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }

        particles.forEach(p => {
          p.phase += p.freq;
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
          if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

          // mouse repulsion
          if (mouse.x) {
            const dx = p.x - mouse.x, dy = p.y - mouse.y;
            const d  = Math.hypot(dx, dy);
            if (d < 110) { p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
          }

          const a = p.alpha * (.6 + .4 * Math.sin(p.phase));
          // Outer glow
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 4.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color},${a * .12})`;
          ctx.fill();
          // Inner glow
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color},${a * .3})`;
          ctx.fill();
          // Core
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color},${a})`;
          ctx.fill();
        });
        requestAnimationFrame(draw);
      }

      canvas.parentElement.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      });
      canvas.parentElement.addEventListener('mouseleave', () => { mouse.x = null; });

      window.addEventListener('resize', resize);
      resize();
      draw();
    })();

    /* ── SCROLL REVEAL ── */
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    /* ── COUNTER ANIMATION ── */
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const end   = parseInt(el.dataset.count);
        const dur   = 1200;
        const start = performance.now();
        const suffix = el.nextElementSibling?.textContent.includes('hora') ? 'h' :
                       (el.nextElementSibling?.textContent.includes('conhecimento') ? '' : '');
        function step(now) {
          const pct = Math.min((now - start) / dur, 1);
          const val = Math.round(pct * end);
          el.textContent = val + suffix;
          if (pct < 1) requestAnimationFrame(step);
          else el.textContent = end + suffix;
        }
        requestAnimationFrame(step);
        counterObs.unobserve(el);
      });
    }, { threshold: .5 });
    document.querySelectorAll('[data-count]').forEach(el => counterObs.observe(el));

    /* ── NAV SCROLL STATE ── */
    window.addEventListener('scroll', () => {
      document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
