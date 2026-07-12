/* ─────────────────────────────────────────────────────────────────────────────
   gsap-animations.js — animações GSAP para revolucao.school
   Requer: gsap.min.js + ScrollTrigger.min.js + SplitText.min.js (carregados antes)
───────────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* 0. Guards ---------------------------------------------------------------- */
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger, SplitText);

  /* ── helper: neutraliza a transição CSS em elementos que o GSAP vai animar.
     Sem isso, quando o IntersectionObserver existente adicionar a classe
     `.visible`, a transição CSS e a animação GSAP disputam o mesmo frame. ── */
  function neutralize(selector) {
    document.querySelectorAll(selector).forEach(el => {
      el.style.transition = 'none';
      el.style.animation  = 'none';
      // GSAP imediatamente define o estado inicial via from() com
      // immediateRender:true (padrão), então não precisa setar opacity:0 aqui.
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     1. HERO h1 — palavras entram uma por uma (substituição do hero-anim-2)
  ═══════════════════════════════════════════════════════════════════════════ */
  const h1 = document.querySelector('.hero-content h1');
  if (h1) {
    // Remove a animação CSS para o GSAP assumir
    h1.classList.remove('hero-anim-2');
    h1.style.animation = 'none';
    h1.style.opacity   = '0';

    const splitH1 = new SplitText(h1, { type: 'words' });

    gsap.from(splitH1.words, {
      opacity         : 0,
      y               : 52,
      rotationX       : 10,
      transformOrigin : '0% 50% -20px',
      duration        : 0.75,
      stagger         : 0.08,
      ease            : 'power3.out',
      delay           : 0.45,
      onStart() { h1.style.opacity = '1'; },
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     2. HERO VIDEO — flutuação ambiente suave
  ═══════════════════════════════════════════════════════════════════════════ */
  const heroVideoWrap = document.querySelector('.hero-video-wrap');
  if (heroVideoWrap) {
    gsap.to(heroVideoWrap, {
      y       : -14,
      duration: 3.2,
      ease    : 'power1.inOut',
      yoyo    : true,
      repeat  : -1,
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     3. HERO — parallax suave no scroll
  ═══════════════════════════════════════════════════════════════════════════ */
  gsap.to('.hero-content', {
    y    : -70,
    ease : 'none',
    scrollTrigger: {
      trigger: '.hero',
      start  : 'top top',
      end    : 'bottom top',
      scrub  : 1.8,
    },
  });

  /* ═══════════════════════════════════════════════════════════════════════════
     4. PAIN QUOTE — linhas deslizam da esquerda ao entrar na viewport
  ═══════════════════════════════════════════════════════════════════════════ */
  const painQuote = document.querySelector('.pain-quote');
  if (painQuote) {
    neutralize('.pain-quote');

    const splitPQ = new SplitText(painQuote, { type: 'lines', linesClass: 'pq-line' });

    gsap.from(splitPQ.lines, {
      opacity : 0,
      x       : -48,
      duration: 0.75,
      stagger : 0.14,
      ease    : 'power2.out',
      scrollTrigger: {
        trigger: painQuote,
        start  : 'top 80%',
      },
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     5. ACTIVATION LINE — cresce de cima para baixo (Sistema 2 Claude)
  ═══════════════════════════════════════════════════════════════════════════ */
  const actLine = document.querySelector('.activation-line');
  if (actLine) {
    neutralize('.activation-line');

    gsap.from(actLine, {
      scaleY          : 0,
      opacity         : 0,
      transformOrigin : 'top center',
      duration        : 0.9,
      ease            : 'power3.inOut',
      scrollTrigger: {
        trigger: actLine,
        start  : 'top 86%',
      },
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     6. RULE — revela horizontalmente da esquerda (clip-path wipe)
  ═══════════════════════════════════════════════════════════════════════════ */
  const rule = document.querySelector('.rule');
  if (rule) {
    neutralize('.rule');

    gsap.from(rule, {
      clipPath: 'inset(0 100% 0 0)',
      opacity : 0,
      duration: 1.1,
      ease    : 'power3.inOut',
      scrollTrigger: {
        trigger: rule,
        start  : 'top 84%',
      },
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     7. PILLARS (N·O·V·A) — stagger de baixo para cima
  ═══════════════════════════════════════════════════════════════════════════ */
  const pillars = document.querySelectorAll('.pillar');
  if (pillars.length) {
    neutralize('.pillar');

    gsap.from(pillars, {
      opacity : 0,
      y       : 65,
      duration: 0.7,
      stagger : 0.14,
      ease    : 'power3.out',
      scrollTrigger: {
        trigger: '.pillars',
        start  : 'top 76%',
      },
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     8. STEPS — stagger (step-result (Claude) entra por último, mais devagar)
  ═══════════════════════════════════════════════════════════════════════════ */
  const steps = document.querySelectorAll('.step');
  if (steps.length) {
    neutralize('.step');

    gsap.from(steps, {
      opacity : 0,
      y       : 48,
      duration: (i) => (i === steps.length - 1 ? 0.85 : 0.65),
      stagger : 0.18,
      ease    : 'power2.out',
      scrollTrigger: {
        trigger: '.steps',
        start  : 'top 78%',
      },
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     9. MOMENTO CLAUDE — card e blocos antes/depois com direções opostas
  ═══════════════════════════════════════════════════════════════════════════ */
  const claudeMoment = document.querySelector('.claude-moment');
  if (claudeMoment) {
    neutralize('.claude-moment');

    gsap.from(claudeMoment, {
      opacity : 0,
      y       : 40,
      duration: 0.85,
      ease    : 'power2.out',
      scrollTrigger: {
        trigger: claudeMoment,
        start  : 'top 82%',
      },
    });

    // Blocos antes/depois entram de lados opostos depois que o card aparece
    const ctBefore = document.querySelector('.ct-block.before');
    const ctAfter  = document.querySelector('.ct-block.after');

    if (ctBefore && ctAfter) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.ct-grid',
          start  : 'top 80%',
        },
        delay: 0.3,
      });

      tl.from(ctBefore, { opacity: 0, x: -35, duration: 0.65, ease: 'power2.out' })
        .from(ctAfter,  { opacity: 0, x:  35, duration: 0.65, ease: 'power2.out' }, '-=0.4');
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     10. SECTION HEADINGS (h2) — fade + slide genérico para os que restam
  ═══════════════════════════════════════════════════════════════════════════ */
  document.querySelectorAll('h2').forEach(el => {
    if (el.closest('.hero-content')) return; // hero já tratado
    neutralize('h2'); // ok chamar múltiplas vezes

    gsap.from(el, {
      opacity : 0,
      y       : 38,
      duration: 0.7,
      ease    : 'power2.out',
      scrollTrigger: {
        trigger: el,
        start  : 'top 82%',
      },
    });
  });

  /* ═══════════════════════════════════════════════════════════════════════════
     11. COURSE MODULES — entram em sequência (seção Start.ai)
  ═══════════════════════════════════════════════════════════════════════════ */
  const modules = document.querySelectorAll('.module');
  if (modules.length) {
    neutralize('.module');

    gsap.from(modules, {
      opacity : 0,
      x       : -30,
      duration: 0.55,
      stagger : 0.1,
      ease    : 'power2.out',
      scrollTrigger: {
        trigger: '.modules',
        start  : 'top 78%',
      },
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     12. TESTEMUNHOS / PROVA SOCIAL — stagger ao scroll (se existirem)
  ═══════════════════════════════════════════════════════════════════════════ */
  const testimonials = document.querySelectorAll('.testimonial, .proof-card, .social-card');
  if (testimonials.length) {
    neutralize('.testimonial, .proof-card, .social-card');

    gsap.from(testimonials, {
      opacity : 0,
      y       : 40,
      duration: 0.6,
      stagger : 0.12,
      ease    : 'power2.out',
      scrollTrigger: {
        trigger: testimonials[0],
        start  : 'top 80%',
      },
    });
  }

})();
