/* ═══════════════════════════════════════════════════════════
   CONFIG — SUBSTITUA COM SEUS DADOS DO SUPABASE
═══════════════════════════════════════════════════════════ */
const SUPABASE_URL = 'https://iwdvhgqnlgxfqsqsfhmz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3ZHZoZ3FubGd4ZnFzcXNmaG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NjY0ODksImV4cCI6MjA5NzA0MjQ4OX0.YOAZz0P2Uh-4pAPt7rIP1fB7cg-RfuobvUzTBx57HiY';

const SUPPORT_WHATSAPP = '5561991859761';

/* ═══════════════════════════════════════════════════════════
   SUPABASE INIT
═══════════════════════════════════════════════════════════ */
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ═══════════════════════════════════════════════════════════
   COURSE DATA
═══════════════════════════════════════════════════════════ */
const lessons = [
  { day:1, pillar:'Entender', title:'Entender IA de verdade', duration:'Live + prática', youtubeId:null,
    description:'Entenda por que contexto, critérios e iteração mudam a resposta do Claude. O objetivo não é decorar termos técnicos: é aprender a perceber quando um pedido está incompleto e saber como melhorá-lo.',
    exercise:'Escolha uma tarefa real. Faça primeiro um pedido curto ao Claude; depois acrescente contexto, resultado esperado e critérios. Compare as duas respostas e registre o que mudou.',
    resources:[{label:'Diagnóstico dos 5%',url:'/materiais/diagnostico',ready:true}],
    materials:[{title:'Diagnóstico dos 5%',type:'Ferramenta interativa · Descubra seu próximo passo',url:'/materiais/diagnostico',ready:true}]},
  { day:2, pillar:'Criar', title:'Criar algo real', duration:'Live + prática', youtubeId:null,
    description:'Use Claude para transformar uma ideia em uma primeira versão utilizável. Você vai aprender a dividir o projeto, construir por etapas e revisar a entrega com critérios claros.',
    exercise:'Escolha uma entrega pequena que você realmente possa usar ou compartilhar. Construa a primeira versão com Claude e publique o resultado na comunidade.',
    resources:[{label:'Roteiro de primeiro projeto',url:'#',ready:false}],
    materials:[{title:'Roteiro de primeiro projeto',type:'Template prático · Em construção com a comunidade',url:'#',ready:false}]},
  { day:3, pillar:'Resolver', title:'Resolver um problema', duration:'Live + prática', youtubeId:null,
    description:'Use Claude como parceiro de raciocínio para organizar um problema, explicitar critérios e comparar caminhos — mantendo a decisão final com você.',
    exercise:'Aplique o canvas a um problema real: descreva contexto, objetivo, opções, critérios e o menor teste possível. Compartilhe seu próximo passo.',
    resources:[{label:'Canvas de resolução',url:'#',ready:false}],
    materials:[{title:'Canvas de resolução',type:'Template prático · Em construção com a comunidade',url:'#',ready:false}]},
  { day:4, pillar:'Automatizar', title:'Automatizar uma rotina', duration:'Live + prática', youtubeId:null,
    description:'Identifique uma rotina repetitiva, transforme-a em etapas e defina onde Claude ajuda, onde uma ferramenta executa e onde a revisão humana continua necessária.',
    exercise:'Mapeie uma rotina que você repete. Descreva entrada, etapas, saída, exceções e ponto de revisão humana antes de pensar em ferramentas.',
    resources:[{label:'Mapa de automação',url:'#',ready:false}],
    materials:[{title:'Mapa de automação',type:'Template prático · Em construção com a comunidade',url:'#',ready:false}]},
  { day:5, pillar:'Construir', title:'Construir meu sistema', duration:'Live + prática', youtubeId:null,
    description:'Organize o que funcionou em um sistema pessoal: prompts, critérios, rotinas e aprendizados. O resultado é um AI Playbook simples que evolui com o uso.',
    exercise:'Monte seu AI Playbook inicial e escolha três hábitos para os próximos 30 dias. Compartilhe uma regra que você quer manter.',
    resources:[{label:'AI Playbook pessoal',url:'#',ready:false}],
    materials:[{title:'AI Playbook pessoal',type:'Template prático · Em construção com a comunidade',url:'#',ready:false}]}
];

/* ═══════════════════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════════════════ */
let state = { user: null, currentLesson: 0, completed: [], isNewUser: false, justLoggedIn: false };

function getCompletedKey() { return `startai_progress_${state.user?.id || 'guest'}`; }
function loadCompleted() { state.completed = JSON.parse(localStorage.getItem(getCompletedKey()) || '[]'); }
function saveCompleted() { localStorage.setItem(getCompletedKey(), JSON.stringify(state.completed)); }
function isCompleted(i) { return state.completed.includes(i); }
function getProgress() { return Math.round((state.completed.length / lessons.length) * 100); }
function getInitial(name) { return (name || '?').trim().charAt(0).toUpperCase(); }
function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>'); }

// Consistent avatar color per name
const AVATAR_COLORS = ['#1a3d0a,#2a6010','#0d1a2e,#1a2d4a','#2e0a1a,#4a1028','#1a2e0a,#2d4a10','#1a0d0a,#3a1a10'];
function avatarColor(name) { const i = (name||'A').charCodeAt(0) % AVATAR_COLORS.length; return AVATAR_COLORS[i]; }

function timeAgo(ts) {
  const d = (Date.now() - new Date(ts).getTime()) / 1000;
  if (d < 60) return 'agora mesmo';
  if (d < 3600) return `${Math.floor(d/60)} min atrás`;
  if (d < 86400) return `${Math.floor(d/3600)}h atrás`;
  if (d < 604800) return `${Math.floor(d/86400)} dias atrás`;
  return new Date(ts).toLocaleDateString('pt-BR');
}

function setBtn(id, loading, text) {
  const b = document.getElementById(id);
  b.disabled = loading;
  b.innerHTML = loading
    ? `<span class="spinner"></span> ${text || 'Aguarde...'}`
    : text;
}

function showMsg(id, msg, type = 'error') {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = `auth-msg ${type} visible`;
}
function hideMsg(id) { document.getElementById(id).className = 'auth-msg'; }

function showToast(icon, title, subtitle, durationMs = 4000) {
  const tc = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<div class="toast-icon">${icon}</div><div class="toast-text"><strong>${title}</strong>${subtitle ? `<span>${subtitle}</span>` : ''}</div>`;
  tc.appendChild(t);
  setTimeout(() => {
    t.classList.add('toast-out');
    setTimeout(() => t.remove(), 260);
  }, durationMs);
}

/* ═══════════════════════════════════════════════════════════
   SCREEN ROUTING
═══════════════════════════════════════════════════════════ */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function goLogin()  { showScreen('loginScreen'); showSigninTab(); }
function goReset()  { showScreen('resetScreen'); window.scrollTo(0,0); }

function showSigninTab() {
  document.getElementById('tabSignin').classList.add('active');
  document.getElementById('tabSignup').classList.remove('active');
  document.getElementById('signinForm').classList.add('active');
  document.getElementById('signupForm').classList.remove('active');
  document.getElementById('forgotForm').classList.remove('active');
  document.getElementById('tabSignin').style.display = '';
  document.getElementById('tabSignup').style.display = '';
}
function showForgotForm() {
  document.getElementById('signinForm').classList.remove('active');
  document.getElementById('signupForm').classList.remove('active');
  document.getElementById('forgotForm').classList.add('active');
  document.getElementById('tabSignin').classList.remove('active');
  document.getElementById('tabSignup').classList.remove('active');
}
function goHome()   { loadCompleted(); renderHome(); showScreen('homeScreen'); window.scrollTo(0,0); }
function goLesson(idx) { state.currentLesson = idx; renderLesson(); showScreen('lessonScreen'); window.scrollTo(0,0); }

/* ═══════════════════════════════════════════════════════════
   AUTH — LOGIN TABS
═══════════════════════════════════════════════════════════ */
document.getElementById('tabSignin').addEventListener('click', () => {
  document.getElementById('tabSignin').classList.add('active');
  document.getElementById('tabSignup').classList.remove('active');
  document.getElementById('signinForm').classList.add('active');
  document.getElementById('signupForm').classList.remove('active');
  document.getElementById('forgotForm').classList.remove('active');
});
document.getElementById('tabSignup').addEventListener('click', () => {
  document.getElementById('tabSignup').classList.add('active');
  document.getElementById('tabSignin').classList.remove('active');
  document.getElementById('signupForm').classList.add('active');
  document.getElementById('signinForm').classList.remove('active');
  document.getElementById('forgotForm').classList.remove('active');
});
document.getElementById('forgotLink').addEventListener('click', showForgotForm);
document.getElementById('backToSignin').addEventListener('click', showSigninTab);

// Enter key
['siEmail','siPassword'].forEach(id => document.getElementById(id).addEventListener('keydown', e => e.key==='Enter' && document.getElementById('signinBtn').click()));
['suName','suEmail','suPassword'].forEach(id => document.getElementById(id).addEventListener('keydown', e => e.key==='Enter' && document.getElementById('signupBtn').click()));
document.getElementById('forgotEmail').addEventListener('keydown', e => e.key==='Enter' && document.getElementById('forgotBtn').click());
['resetPassword','resetConfirm'].forEach(id => document.getElementById(id).addEventListener('keydown', e => e.key==='Enter' && document.getElementById('resetBtn').click()));

/* ═══════════════════════════════════════════════════════════
   AUTH — SIGN IN
═══════════════════════════════════════════════════════════ */
document.getElementById('signinBtn').addEventListener('click', async () => {
  hideMsg('signinError');
  const email = document.getElementById('siEmail').value.trim();
  const password = document.getElementById('siPassword').value;
  if (!email || !password) { showMsg('signinError', 'Preencha email e senha.'); return; }

  setBtn('signinBtn', true, 'Entrando...');
  state.justLoggedIn = true;
  try {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // onAuthStateChange vai disparar e chamar goHome()
    // mas garantimos o redirect aqui também caso demore
    if (data?.session?.user) {
      const metaName = data.session.user.user_metadata?.name || data.session.user.email?.split('@')[0] || 'Aluno';
      state.user = { id: data.session.user.id, name: metaName };
      setBtn('signinBtn', false, 'Entrar no curso');
      goHome();
    }
  } catch(e) {
    state.justLoggedIn = false;
    setBtn('signinBtn', false, 'Entrar no curso');
    const msg = e.message?.includes('Invalid login') || e.message?.includes('invalid_credentials')
               ? 'Email ou senha incorretos.'
               : e.message?.includes('Email not confirmed')
               ? 'Confirme seu email antes de entrar.'
               : e.message || 'Erro ao entrar. Tente novamente.';
    showMsg('signinError', msg);
  }
});

/* ═══════════════════════════════════════════════════════════
   AUTH — SIGN UP
═══════════════════════════════════════════════════════════ */
document.getElementById('signupBtn').addEventListener('click', async () => {
  hideMsg('signupError'); hideMsg('signupSuccess');
  const name = document.getElementById('suName').value.trim();
  const email = document.getElementById('suEmail').value.trim();
  const password = document.getElementById('suPassword').value;

  if (!name)          { showMsg('signupError', 'Digite seu nome.'); return; }
  if (!email)         { showMsg('signupError', 'Digite seu email.'); return; }
  if (password.length < 6) { showMsg('signupError', 'A senha precisa ter pelo menos 6 caracteres.'); return; }
  if (!document.getElementById('termsCheck').checked) {
    showMsg('signupError', 'Você precisa aceitar os Termos de Uso para criar sua conta.');
    return;
  }

  const acceptedMarketing = document.getElementById('marketingCheck').checked;

  setBtn('signupBtn', true, 'Criando conta...');
  try {
    const { data, error } = await sb.auth.signUp({ email, password, options:{ data:{ name, accepted_terms: true, accepted_marketing: acceptedMarketing, terms_accepted_at: new Date().toISOString() } } });
    if (error) throw error;

    // Save profile name
    if (data.user) {
      await sb.from('profiles').upsert({ id: data.user.id, name, accepted_marketing: acceptedMarketing });
    }

    setBtn('signupBtn', false, 'Criar minha conta');

    if (!data.session) {
      // Email confirmation required
      showMsg('signupSuccess', `✓ Conta criada! Verifique seu email (${email}) para confirmar e depois entre abaixo.`, 'success');
    } else {
      // Session imediata — redirecionar direto sem esperar onAuthStateChange
      state.user = { id: data.user.id, name };
      state.isNewUser = true;
      goHome();
      setTimeout(() => showToast('<span class="material-symbols-rounded" style="font-size:1.1rem;color:var(--green)">celebration</span>', `Bem-vindo, ${name.split(' ')[0]}!`, 'Sua conta foi criada com sucesso.'), 400);
      state.isNewUser = false;
    }
  } catch(e) {
    setBtn('signupBtn', false, 'Criar minha conta');
    const msg = e.message?.includes('already registered') || e.message?.includes('User already registered')
               ? 'Este email já tem uma conta. Faça login.'
               : e.message || 'Erro ao criar conta. Tente novamente.';
    showMsg('signupError', msg);
  }
});

/* ═══════════════════════════════════════════════════════════
   AUTH — FORGOT PASSWORD
═══════════════════════════════════════════════════════════ */
document.getElementById('forgotBtn').addEventListener('click', async () => {
  hideMsg('forgotError'); hideMsg('forgotSuccess');
  const email = document.getElementById('forgotEmail').value.trim();
  if (!email) { showMsg('forgotError', 'Digite seu email.'); return; }

  setBtn('forgotBtn', true, 'Enviando...');
  try {
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://curso.revolucao.school'
    });
    if (error) throw error;
    showMsg('forgotSuccess', `✓ Email enviado para ${email}. Verifique sua caixa de entrada e clique no link para redefinir sua senha.`, 'success');
    setBtn('forgotBtn', false, 'Enviar link de recuperação');
  } catch(e) {
    setBtn('forgotBtn', false, 'Enviar link de recuperação');
    showMsg('forgotError', e.message || 'Erro ao enviar email. Tente novamente.');
  }
});

/* ═══════════════════════════════════════════════════════════
   AUTH — RESET PASSWORD
═══════════════════════════════════════════════════════════ */
document.getElementById('resetBtn').addEventListener('click', async () => {
  hideMsg('resetError'); hideMsg('resetSuccess');
  const password = document.getElementById('resetPassword').value;
  const confirm  = document.getElementById('resetConfirm').value;

  if (password.length < 6)  { showMsg('resetError', 'A senha precisa ter pelo menos 6 caracteres.'); return; }
  if (password !== confirm)  { showMsg('resetError', 'As senhas não coincidem.'); return; }

  setBtn('resetBtn', true, 'Salvando...');
  try {
    const { error } = await sb.auth.updateUser({ password });
    if (error) throw error;
    showMsg('resetSuccess', '✓ Senha atualizada com sucesso! Redirecionando...', 'success');
    setBtn('resetBtn', false, 'Salvar nova senha');
    setTimeout(() => goHome(), 1500);
  } catch(e) {
    setBtn('resetBtn', false, 'Salvar nova senha');
    showMsg('resetError', e.message || 'Erro ao atualizar senha. Tente novamente.');
  }
});

/* ═══════════════════════════════════════════════════════════
   AUTH — LOGOUT
═══════════════════════════════════════════════════════════ */
document.getElementById('homeLogout').addEventListener('click', async () => {
  await sb.auth.signOut();
});

/* ═══════════════════════════════════════════════════════════
   AUTH STATE LISTENER
═══════════════════════════════════════════════════════════ */
sb.auth.onAuthStateChange((event, session) => {
  // Link de recuperação de senha: mostrar formulário de nova senha
  if (event === 'PASSWORD_RECOVERY') {
    goReset();
    return;
  }

  if (session?.user) {
    // Use metadata name immediately — no await, never blocks redirect
    const metaName = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Aluno';
    state.user = { id: session.user.id, name: metaName };

    const wasNewUser = state.isNewUser;
    state.isNewUser = false;

    goHome();

    // Reset signin button in case it was loading
    const signinBtn = document.getElementById('signinBtn');
    if (signinBtn) setBtn('signinBtn', false, 'Entrar no curso');

    // Toast de boas-vindas
    if (wasNewUser) {
      setTimeout(() => showToast('<span class="material-symbols-rounded" style="font-size:1.1rem;color:var(--green)">celebration</span>', `Bem-vindo, ${metaName.split(' ')[0]}!`, 'Sua conta foi criada com sucesso.'), 400);
    } else if (event === 'SIGNED_IN' && state.justLoggedIn) {
      state.justLoggedIn = false;
      setTimeout(() => showToast('<span class="material-symbols-rounded" style="font-size:1.1rem;color:var(--green)">check_circle</span>', `Olá, ${metaName.split(' ')[0]}!`, 'Login realizado com sucesso.'), 400);
    }

    // Load real profile name + avatar in background (non-blocking)
    sb.from('profiles').select('name,avatar_url').eq('id', session.user.id).single().then(({ data: profile }) => {
      if (profile && state.user?.id === session.user.id) {
        if (profile.name) {
          state.user.name = profile.name;
          const nameEl = document.getElementById('homeUserName');
          if (nameEl) nameEl.textContent = profile.name;
        }
        if (profile.avatar_url) {
          state.user.avatarUrl = profile.avatar_url;
          updateHomeAvatar(state.user.name, profile.avatar_url);
          updateSidebarAvatar(state.user.name, profile.avatar_url);
        } else {
          updateHomeAvatar(state.user.name, null);
        }
      }
    }).catch(() => {});
  } else {
    state.user = null;
    state.completed = [];
    goLogin();
  }
});

/* ═══════════════════════════════════════════════════════════
   HOME SCREEN
═══════════════════════════════════════════════════════════ */
function renderHome() {
  const name = state.user?.name || '';
  const initial = getInitial(name);
  const pct = getProgress();

  updateHomeAvatar(name, state.user?.avatarUrl || null);
  document.getElementById('homeUserName').textContent = name;
  document.getElementById('heroProgressFill').style.width = `${pct}%`;
  document.getElementById('heroProgressText').innerHTML = `<strong>${state.completed.length}</strong> de 5 aulas concluídas`;

  // Find resume lesson
  let resumeIdx = 0;
  for (let i = 0; i < lessons.length; i++) { if (!isCompleted(i)) { resumeIdx = i; break; } if (i===lessons.length-1) resumeIdx=i; }
  const allDone = state.completed.length === lessons.length;
  document.getElementById('heroContinueBtn').innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> ${state.completed.length===0?'Começar agora':allDone?'Rever curso':'Continuar: Dia '+(resumeIdx+1)}`;
  document.getElementById('heroContinueBtn').onclick = () => goLesson(resumeIdx);

  // Cards
  const row = document.getElementById('homeCardsRow');
  row.innerHTML = '';
  lessons.forEach((l, i) => {
    const done = isCompleted(i);
    const accessible = i===0 || isCompleted(i-1) || done;
    const badge = done ? '<span class="card-state-badge done"><span class="material-symbols-rounded" style="font-size:12px;vertical-align:middle">check</span> Concluída</span>'
                : accessible ? '<span class="card-state-badge current">Disponível</span>'
                : '<span class="card-state-badge locked"><span class="material-symbols-rounded" style="font-size:12px;vertical-align:middle">lock</span></span>';
    const card = document.createElement('div');
    card.className = `lesson-card ${accessible||done ? '' : 'locked'}`;
    card.innerHTML = `
      <div class="card-thumb grad-${i}">
        <div class="card-thumb-inner">
          <div class="card-emoji">${l.pillar.split(' ')[0]}</div>
          <div class="card-day-num">Dia ${i+1}</div>
        </div>
        ${badge}
        <div class="card-hover-overlay"><div class="play-circle"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></div></div>
      </div>
      <div class="card-body">
        <div class="card-title-text">${l.title}</div>
        <div class="card-pillar-text">${l.pillar}</div>
        <div class="card-duration-text">${l.duration}</div>
      </div>`;
    if (accessible || done) card.addEventListener('click', () => goLesson(i));
    row.appendChild(card);
  });

  // Stats — rocket journey
  const streak = getStreak();
  const totalLessons = lessons.length;
  const doneLessons = state.completed.length;
  const lessonNames = ['Terra','Lua','Marte','Saturno','Estrela'];

  // Build nodes HTML
  let nodesHtml = '';
  for (let i = 0; i < totalLessons; i++) {
    const isDone = isCompleted(i);
    const isNext = !isDone && (i === 0 || isCompleted(i-1));
    const cls = isDone ? 'done' : isNext ? 'next' : '';
    nodesHtml += `<div class="journey-node ${cls}">
      <div class="journey-node-circle">
        <span class="node-num">${i+1}</span>
        <span class="material-symbols-rounded node-check" style="font-size:16px;">check</span>
      </div>
      <span class="journey-node-label">${lessonNames[i]}</span>
    </div>`;
  }

  // Rocket: position by node index, using flex percentages (node centers at 10%,30%,50%,70%,90%)
  const nodePositions = [10,30,50,70,90];
  const rocketPct = doneLessons === 0 ? 4
    : doneLessons >= totalLessons ? 88
    : nodePositions[doneLessons - 1] + 8;

  // Path fill width
  const pathFillPct = doneLessons === 0 ? 0
    : doneLessons >= totalLessons ? 100
    : Math.round((doneLessons / totalLessons) * 100);

  document.getElementById('homeStatsRow').innerHTML = `
    <div class="journey-card">
      <div class="journey-header">
        <div>
          <div class="journey-title">Jornada pelo universo Start.AI</div>
          <div class="journey-sub">${doneLessons} de ${totalLessons} aulas concluídas</div>
        </div>
        <span class="journey-pct">${pct}%</span>
      </div>
      <div class="journey-track">
        <div class="journey-path-bg"></div>
        <div class="journey-path-fill" style="width:calc(${pathFillPct}% - 20px)"></div>
        <div class="journey-nodes">${nodesHtml}</div>
        <div class="journey-rocket-wrap" style="left:${rocketPct}%">
          <span class="material-symbols-rounded journey-rocket-icon">rocket_launch</span>
        </div>
      </div>
      ${allDone ? `<div style="margin-top:16px;padding:10px 14px;background:rgba(150,208,52,0.08);border:1px solid rgba(150,208,52,0.2);border-radius:10px;font-size:0.75rem;color:var(--green);font-weight:600;text-align:center;position:relative;z-index:1;">
        <span class="material-symbols-rounded" style="font-size:16px;vertical-align:middle;margin-right:4px;">celebration</span>Missão completa! Você chegou às estrelas.</div>` : ''}
    </div>
    <div class="stats-mini-row">
      <div class="stat-mini">
        <span class="material-symbols-rounded stat-mini-icon" style="font-size:1.4rem;color:var(--green)">task_alt</span>
        <div><div class="stat-value">${doneLessons}<span style="font-size:0.85rem;font-weight:500;color:var(--muted)"> / ${totalLessons}</span></div><div class="stat-label">aulas concluídas</div></div>
      </div>
      <div class="stat-mini">
        <span class="material-symbols-rounded stat-mini-icon" style="font-size:1.4rem;color:${streak>0?'#f97316':'var(--muted)'}">${streak > 0 ? 'local_fire_department' : 'bedtime'}</span>
        <div><div class="stat-value">${streak}</div><div class="stat-label">dia${streak===1?'':'s'} em sequência</div></div>
      </div>
    </div>`;

}

window.addEventListener('scroll', () => {
  document.getElementById('homeNav')?.classList.toggle('scrolled', window.scrollY > 20);
});

/* ═══════════════════════════════════════════════════════════
   LESSON SCREEN
═══════════════════════════════════════════════════════════ */
function renderThread() {
  const list = document.getElementById('threadList');
  list.innerHTML = '';
  lessons.forEach((l, i) => {
    const done = isCompleted(i);
    const active = i === state.currentLesson;
    const accessible = i===0 || isCompleted(i-1) || done;
    const nodeClass = done ? 'done' : active ? 'current' : accessible ? 'current' : 'locked';
    const disabled = !accessible && !done ? 'disabled' : '';
    const li = document.createElement('li');
    li.className = 'thread-item';
    li.innerHTML = `<button class="thread-btn ${active?'active':''}" ${disabled} data-idx="${i}">
      <div class="node ${nodeClass}"></div>
      <div class="thread-info"><div class="day-num">Dia ${i+1}</div><div class="day-title">${l.title}</div><div class="day-pillar">${l.pillar}</div></div>
    </button>`;
    list.appendChild(li);
  });
  list.querySelectorAll('.thread-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => { goLesson(parseInt(btn.dataset.idx)); closeMobileDrawer(); });
  });
}

function renderProgressBars() {
  const pct = `${getProgress()}%`;
  document.getElementById('sidebarProgressFill').style.width = pct;
  document.getElementById('topStripFill').style.width = pct;
  document.getElementById('sidebarProgressPct').textContent = `${state.completed.length} de ${lessons.length}`;
}

function renderLesson() {
  const idx = state.currentLesson;
  const l = lessons[idx];
  const name = state.user?.name || '';
  const initial = getInitial(name);

  updateSidebarAvatar(name, state.user?.avatarUrl || null);
  document.getElementById('sidebarName').textContent = name;
  document.getElementById('breadcrumbText').textContent = `Dia ${idx+1} — ${l.title}`;
  document.getElementById('pillarChip').textContent = l.pillar;
  document.getElementById('durationChip').textContent = l.duration;
  document.getElementById('dayLabel').textContent = `Dia ${idx+1}`;
  document.getElementById('lessonTitle').textContent = l.title;
  document.getElementById('lessonDesc').textContent = l.description;
  document.getElementById('exerciseText').textContent = l.exercise;
  document.getElementById('commentFormAvatar').textContent = initial;

  const done = isCompleted(idx);
  document.getElementById('completedBanner').classList.toggle('visible', done);
  const btn = document.getElementById('btnComplete');
  btn.classList.toggle('done', done);
  btn.innerHTML = done
    ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Concluída`
    : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Marcar como concluída`;
  btn.onclick = () => toggleComplete(idx);

  // Video
  const vw = document.getElementById('videoWrap');
  vw.innerHTML = l.youtubeId
    ? `<iframe src="https://www.youtube.com/embed/${l.youtubeId}?rel=0&modestbranding=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    : `<div class="video-placeholder"><div style="font-size:2.5rem">${l.pillar.split(' ')[0]}</div><div class="placeholder-play"><svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(150,208,52,0.6)"><polygon points="5 3 19 12 5 21 5 3"/></svg></div><div class="placeholder-text"><strong>${l.title}</strong><span>Vídeo disponível em breve</span></div><div class="coming-soon-badge">Em breve</div></div>`;

  // Resources
  const rg = document.getElementById('resourcesGrid');
  rg.innerHTML = '';
  l.resources.forEach(r => {
    const a = document.createElement('a');
    a.href = r.ready ? r.url : '#'; a.className = `resource-pill${r.ready?'':' placeholder'}`;
    if (!r.ready) a.addEventListener('click', e => e.preventDefault()); else { a.target='_blank'; a.rel='noopener'; }
    a.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${r.ready?'<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>':'<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'}</svg>${r.label}${!r.ready?'<span style="font-size:.6rem;opacity:.4;margin-left:3px">• em breve</span>':''}`;
    rg.appendChild(a);
  });

  // Next lesson
  const next = lessons[idx+1];
  const nl = document.getElementById('nextLesson');
  if (next) {
    document.getElementById('nextTitle').textContent = next.title;
    document.getElementById('nextPillar').textContent = next.pillar;
    nl.style.cursor = 'pointer'; nl.onclick = () => goLesson(idx+1);
  } else {
    nl.innerHTML = `<div class="next-info"><div class="next-label">Parabéns!</div><div class="next-title">Você concluiu o Start.AI!</div><div class="next-pillar">Pronto para o próximo nível?</div></div><div class="next-arrow"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>`;
    nl.style.cursor = 'default';
  }

  // Materials tab
  const ml = document.getElementById('materialsList');
  if (ml) {
    ml.innerHTML = '';
    (l.materials || []).forEach(m => {
      const isReady = m.ready;
      const a = document.createElement(isReady ? 'a' : 'div');
      a.className = `material-item${isReady ? '' : ' disabled'}`;
      if (isReady) { a.href = m.url; a.target = '_blank'; a.rel = 'noopener'; }
      a.innerHTML = `
        <div class="material-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${isReady ? '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>' : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'}</svg>
        </div>
        <div class="material-info">
          <div class="material-title">${m.title}</div>
          <div class="material-type">${m.type}</div>
        </div>
        ${!isReady ? '<span class="material-badge-soon">Em breve</span>' : ''}`;
      ml.appendChild(a);
    });
  }

  // Reset lesson tabs to Conteúdo
  document.querySelectorAll('.lesson-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === 'conteudo'));
  document.querySelectorAll('.lesson-tab-pane').forEach(p => p.classList.toggle('active', p.id === 'pane-conteudo'));

  renderThread();
  renderProgressBars();
  loadComments(idx);
}

function toggleComplete(idx) {
  const wasAllDone = state.completed.length === lessons.length;
  if (isCompleted(idx)) {
    state.completed = state.completed.filter(i => i!==idx);
  } else {
    state.completed.push(idx);
    updateStreak(); // mark today as a study day
  }
  saveCompleted();
  renderLesson();

  // Show completion screen if just finished all lessons
  if (!wasAllDone && state.completed.length === lessons.length) {
    setTimeout(() => showCompletionScreen(), 600);
  }
}

document.getElementById('backHomeBtn').addEventListener('click', goHome);

/* ═══════════════════════════════════════════════════════════
   COMMENTS — SUPABASE
═══════════════════════════════════════════════════════════ */
async function loadComments(lessonId) {
  const list = document.getElementById('commentsList');
  list.innerHTML = '<div class="comments-loading"><span class="spinner spinner-white"></span></div>';

  try {
    const { data, error } = await sb
      .from('comments')
      .select('*, comment_likes(user_id)')
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    renderComments(data || [], lessonId);
  } catch(e) {
    list.innerHTML = '<div class="comments-empty"><span class="material-symbols-rounded" style="font-size:1.2rem;color:var(--muted)">warning</span> Não foi possível carregar os comentários.</div>';
  }
}

function renderComments(comments, lessonId) {
  const list = document.getElementById('commentsList');
  document.getElementById('commentCount').textContent = comments.length;

  if (comments.length === 0) {
    list.innerHTML = '<div class="comments-empty"><span class="material-symbols-rounded" style="font-size:1.2rem;color:var(--muted)">chat_bubble</span> Seja o primeiro a comentar nesta aula!</div>';
    return;
  }

  list.innerHTML = '';
  comments.forEach(c => {
    const totalLikes = c.comment_likes?.length || 0;
    const likedByMe = c.comment_likes?.some(l => l.user_id === state.user?.id) || false;
    const isOwn = c.user_id === state.user?.id;
    const colors = avatarColor(c.user_name);
    const div = document.createElement('div');
    div.className = 'comment-item';
    div.innerHTML = `
      <div class="comment-avatar" style="background:linear-gradient(135deg,${colors});${!isOwn?'cursor:pointer;':''}" title="${!isOwn?'Ver perfil':''}" data-uid="${c.user_id||''}" data-uname="${escHtml(c.user_name)}">${getInitial(c.user_name)}</div>
      <div class="comment-body">
        <div class="comment-header">
          <span class="comment-name">${escHtml(c.user_name)}</span>
          <span class="comment-time">${timeAgo(c.created_at)}</span>
        </div>
        <div class="comment-text">${escHtml(c.text)}</div>
        <div class="comment-actions">
          <button class="btn-like ${likedByMe?'liked':''}" data-id="${c.id}" data-liked="${likedByMe}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="${likedByMe?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            ${totalLikes > 0 ? totalLikes : ''}
          </button>
          ${isOwn ? `<button class="btn-delete" data-id="${c.id}" title="Apagar"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>` : ''}
        </div>
      </div>`;
    list.appendChild(div);
  });

  // Bind like buttons
  list.querySelectorAll('.btn-like').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!state.user) return;
      const cid = btn.dataset.id;
      const liked = btn.dataset.liked === 'true';
      btn.disabled = true;
      if (liked) {
        await sb.from('comment_likes').delete().eq('user_id', state.user.id).eq('comment_id', cid);
      } else {
        await sb.from('comment_likes').insert({ user_id: state.user.id, comment_id: cid });
      }
      loadComments(lessonId);
    });
  });

  // Bind delete buttons
  list.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Apagar este comentário?')) return;
      btn.disabled = true;
      await sb.from('comments').delete().eq('id', btn.dataset.id).eq('user_id', state.user.id);
      loadComments(lessonId);
    });
  });

  // Bind avatar clicks to open public profile
  list.querySelectorAll('.comment-avatar[data-uid]').forEach(av => {
    const uid = av.dataset.uid;
    const uname = av.dataset.uname;
    if (uid && uid !== state.user?.id) {
      av.addEventListener('click', () => openProfileModal(uid, uname));
    }
  });
}

// Comment textarea
const commentInput = document.getElementById('commentInput');
const commentSubmitBtn = document.getElementById('commentSubmitBtn');

commentInput.addEventListener('input', () => {
  const len = commentInput.value.length;
  document.getElementById('commentCharCount').textContent = `${len} / 500`;
  commentSubmitBtn.disabled = len < 2;
});

commentSubmitBtn.addEventListener('click', async () => {
  const text = commentInput.value.trim();
  if (!text || !state.user) return;
  commentSubmitBtn.disabled = true;
  commentSubmitBtn.innerHTML = '<span class="spinner"></span> Enviando...';

  const { error } = await sb.from('comments').insert({
    user_id: state.user.id,
    user_name: state.user.name,
    lesson_id: state.currentLesson,
    text
  });

  commentInput.value = '';
  document.getElementById('commentCharCount').textContent = '0 / 500';
  commentSubmitBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Comentar`;
  commentSubmitBtn.disabled = true;
  loadComments(state.currentLesson);
});

/* ═══════════════════════════════════════════════════════════
   MOBILE DRAWER
═══════════════════════════════════════════════════════════ */
function openMobileDrawer() {
  const panel = document.getElementById('mobilePanel');
  panel.innerHTML = document.getElementById('sidebar').innerHTML;
  panel.querySelectorAll('.thread-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => { goLesson(parseInt(btn.dataset.idx)); closeMobileDrawer(); });
  });
  panel.querySelector('#backHomeBtn')?.addEventListener('click', () => { goHome(); closeMobileDrawer(); });
  document.getElementById('mobileDrawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobileDrawer() {
  document.getElementById('mobileDrawer').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('mobileMenuBtn').addEventListener('click', openMobileDrawer);
document.getElementById('mobileOverlay').addEventListener('click', closeMobileDrawer);

/* ═══════════════════════════════════════════════════════════
   LESSON TABS
═══════════════════════════════════════════════════════════ */
document.querySelectorAll('.lesson-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.lesson-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.lesson-tab-pane').forEach(p => p.classList.toggle('active', p.id === `pane-${tab}`));
  });
});

/* ═══════════════════════════════════════════════════════════
   STREAK DE ESTUDO
═══════════════════════════════════════════════════════════ */
function getStreakKey() { return `startai_streak_${state.user?.id || 'guest'}`; }
function getStreak() {
  const data = JSON.parse(localStorage.getItem(getStreakKey()) || '{"count":0,"lastDate":null}');
  return data.count || 0;
}
function updateStreak() {
  const key = getStreakKey();
  const data = JSON.parse(localStorage.getItem(key) || '{"count":0,"lastDate":null}');
  const today = new Date().toISOString().slice(0, 10);
  if (data.lastDate === today) return; // already counted today
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  data.count = (data.lastDate === yesterday) ? (data.count || 0) + 1 : 1;
  data.lastDate = today;
  localStorage.setItem(key, JSON.stringify(data));
}

/* ═══════════════════════════════════════════════════════════
   CONFETTI
═══════════════════════════════════════════════════════════ */
function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const pieces = Array.from({length:120}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    w: 8 + Math.random() * 8,
    h: 4 + Math.random() * 6,
    color: ['#96D034','#C5F06A','#F0FAE0','#2a8a00','#fff176'][Math.floor(Math.random()*5)],
    vx: (Math.random()-0.5)*3,
    vy: 2 + Math.random()*4,
    angle: Math.random()*Math.PI*2,
    spin: (Math.random()-0.5)*0.15
  }));
  let frame;
  let ticks = 0;
  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
      p.x += p.vx; p.y += p.vy; p.angle += p.spin; p.vy += 0.06;
    });
    ticks++;
    if (ticks < 220) frame = requestAnimationFrame(draw);
    else ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  if (frame) cancelAnimationFrame(frame);
  draw();
}

/* ═══════════════════════════════════════════════════════════
   COMPLETION SCREEN
═══════════════════════════════════════════════════════════ */
function showCompletionScreen() {
  launchConfetti();
  buildNpsButtons();
  drawCertificate();
  document.getElementById('shareCardName').textContent = state.user?.name || 'Aluno';
  showScreen('completionScreen');
  window.scrollTo(0,0);
}

document.getElementById('btnBackFromCompletion').addEventListener('click', goHome);
document.getElementById('btnCommunity').addEventListener('click', () => {
  window.open('https://chat.whatsapp.com/F5000nSwSezL2sIER5dEtN', '_blank', 'noopener');
});
document.getElementById('btnShareProgress').addEventListener('click', () => {
  document.getElementById('shareCardName').textContent = state.user?.name || 'Aluno';
  document.getElementById('shareModal').classList.add('open');
});

/* ═══════════════════════════════════════════════════════════
   NPS
═══════════════════════════════════════════════════════════ */
function buildNpsButtons() {
  const container = document.getElementById('npsButtons');
  container.innerHTML = '';
  document.getElementById('npsThanks').style.display = 'none';
  for (let i = 0; i <= 10; i++) {
    const btn = document.createElement('button');
    btn.className = 'nps-btn';
    btn.textContent = i;
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.nps-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      document.getElementById('npsThanks').style.display = 'block';
      // Save to Supabase (best-effort, table may not exist yet)
      try {
        await sb.from('nps_responses').insert({
          user_id: state.user?.id,
          score: i,
          course: 'startai'
        });
      } catch(e) { /* silently ignore if table doesn't exist */ }
    });
    container.appendChild(btn);
  }
}

/* ═══════════════════════════════════════════════════════════
   CERTIFICATE
═══════════════════════════════════════════════════════════ */
function drawCertificate() {
  const canvas = document.getElementById('certCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0d1a06');
  bg.addColorStop(0.5, '#1a3a08');
  bg.addColorStop(1, '#0a1204');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Border
  ctx.strokeStyle = 'rgba(150,208,52,0.5)';
  ctx.lineWidth = 3;
  ctx.strokeRect(18, 18, W-36, H-36);
  ctx.strokeStyle = 'rgba(150,208,52,0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(26, 26, W-52, H-52);

  // Corner accents
  const corners = [[36,36],[W-36,36],[36,H-36],[W-36,H-36]];
  corners.forEach(([cx,cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(150,208,52,0.6)';
    ctx.fill();
  });

  // Logo
  ctx.font = 'bold 36px Outfit, sans-serif';
  ctx.fillStyle = '#96D034';
  ctx.textAlign = 'center';
  ctx.fillText('Start.AI', W/2, 80);

  // Subtitle
  ctx.font = '500 14px Inter, sans-serif';
  ctx.fillStyle = 'rgba(240,250,224,0.45)';
  ctx.fillText('by Nova AI · (R)evolução&reg; School', W/2, 106);

  // Divider line
  ctx.beginPath();
  ctx.moveTo(W/2-120, 122); ctx.lineTo(W/2+120, 122);
  ctx.strokeStyle = 'rgba(150,208,52,0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Certificate of
  ctx.font = '500 13px Inter, sans-serif';
  ctx.fillStyle = 'rgba(240,250,224,0.5)';
  ctx.letterSpacing = '2px';
  ctx.fillText('CERTIFICADO DE CONCLUSÃO', W/2, 160);

  // Name
  const name = state.user?.name || 'Aluno';
  ctx.font = 'bold 38px Outfit, sans-serif';
  ctx.fillStyle = '#F0FAE0';
  ctx.fillText(name, W/2, 225);

  // Description
  ctx.font = '400 15px Inter, sans-serif';
  ctx.fillStyle = 'rgba(240,250,224,0.65)';
  ctx.fillText('concluiu com sucesso o curso', W/2, 268);
  ctx.font = 'bold 18px Outfit, sans-serif';
  ctx.fillStyle = '#96D034';
  ctx.fillText('Start.AI — Inteligência Artificial na Prática', W/2, 298);
  ctx.font = '400 13px Inter, sans-serif';
  ctx.fillStyle = 'rgba(240,250,224,0.45)';
  ctx.fillText('5 módulos · 75 minutos de conteúdo', W/2, 325);

  // Date
  const date = new Date().toLocaleDateString('pt-BR', {day:'numeric',month:'long',year:'numeric'});
  ctx.font = '400 12px Inter, sans-serif';
  ctx.fillStyle = 'rgba(240,250,224,0.35)';
  ctx.fillText(date, W/2, H-50);

  // Seal circle
  ctx.beginPath();
  ctx.arc(W/2, 410, 40, 0, Math.PI*2);
  ctx.strokeStyle = 'rgba(150,208,52,0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.font = '500 10px Inter, sans-serif';
  ctx.fillStyle = 'rgba(150,208,52,0.8)';
  ctx.fillText('CONCLUÍDO', W/2, 406);
  ctx.fillText('100%', W/2, 420);
}

document.getElementById('btnDownloadCert').addEventListener('click', () => {
  const canvas = document.getElementById('certCanvas');
  const link = document.createElement('a');
  link.download = `certificado-startai-${(state.user?.name||'aluno').replace(/\s+/g,'-').toLowerCase()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});

/* ═══════════════════════════════════════════════════════════
   SHARE MODAL
═══════════════════════════════════════════════════════════ */
document.getElementById('btnCloseShareModal').addEventListener('click', () => {
  document.getElementById('shareModal').classList.remove('open');
});
document.getElementById('shareModal').addEventListener('click', e => {
  if (e.target === document.getElementById('shareModal'))
    document.getElementById('shareModal').classList.remove('open');
});
document.getElementById('btnCopyShareText').addEventListener('click', () => {
  const name = state.user?.name || 'Aluno';
  const text = `Acabei de concluir o Start.AI!\n\nAprendi a usar IA de verdade em 5 dias — e mudou completamente a forma como trabalho.\n\nO melhor: é gratuito! Se você ainda não fez, acessa: nova-ai.com.br\n\n#StartAI #InteligênciaArtificial #NovaAI`;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('btnCopyShareText');
    btn.textContent = 'Copiado!';
    setTimeout(() => {
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copiar texto para postar`;
    }, 2000);
  }).catch(() => {
    showToast('<span class="material-symbols-rounded" style="font-size:1.1rem;color:var(--green)">content_paste</span>', 'Copie o texto abaixo', 'Ctrl+C / Cmd+C');
  });
});

/* ═══════════════════════════════════════════════════════════
   SUPPORT FORM
═══════════════════════════════════════════════════════════ */

// Toggle colapsável
document.getElementById('supportCardToggle').addEventListener('click', () => {
  document.getElementById('supportCard').classList.toggle('open');
});


// Tally embed é carregado via script no <head> — sem JS adicional necessário

/* ═══════════════════════════════════════════════════════════
   TERMS MODAL
═══════════════════════════════════════════════════════════ */
function openTermsModal(tab) {
  const modal = document.getElementById('termsModal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (tab) switchModalTab(tab);
}
function closeTermsModal() {
  document.getElementById('termsModal').classList.remove('open');
  document.body.style.overflow = '';
}
function switchModalTab(name) {
  document.querySelectorAll('.modal-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('.legal-tab-content').forEach(c => c.classList.toggle('active', c.id === `modal-${name}`));
}

/* ═══════════════════════════════════════════════════════════
   PROFILE — tela de perfil e visualização de perfis alheios
═══════════════════════════════════════════════════════════ */

// Navigate to profile screen
function goProfile() {
  showScreen('profileScreen');
  window.scrollTo(0,0);
  loadProfileScreen();
}

// Load current user profile data into form
async function loadProfileScreen() {
  if (!state.user) return;
  const { data } = await sb.from('profiles')
    .select('name,bio,profession,city,linkedin_url,goal,is_public,avatar_url')
    .eq('id', state.user.id).single();
  if (!data) return;
  document.getElementById('profileName').value = data.name || '';
  document.getElementById('profileBio').value = data.bio || '';
  document.getElementById('profileProfession').value = data.profession || '';
  document.getElementById('profileCity').value = data.city || '';
  document.getElementById('profileLinkedin').value = data.linkedin_url || '';
  document.getElementById('profileGoal').value = data.goal || '';
  document.getElementById('profilePublicToggle').checked = !!data.is_public;
  // cache in state so it survives screen navigation
  if (data.avatar_url) state.user.avatarUrl = data.avatar_url;
  renderProfileAvatar(data.avatar_url || state.user.avatarUrl, data.name || state.user.name);
}

function renderProfileAvatar(avatarUrl, name) {
  const el = document.getElementById('profileAvatarDisplay');
  if (!el) return;
  if (avatarUrl) {
    el.innerHTML = `<img src="${avatarUrl}" class="profile-avatar-img" onerror="this.parentElement.innerHTML=getInitialsAvatar('${escHtml(name)}','90px','2rem')">`;
  } else {
    el.innerHTML = getInitialsAvatar(name, '90px', '2rem');
  }
}

function getInitialsAvatar(name, size='90px', fontSize='2rem') {
  const colors = avatarColor(name);
  return `<div class="profile-avatar-initials" style="width:${size};height:${size};font-size:${fontSize};background:linear-gradient(135deg,${colors})">${getInitial(name)}</div>`;
}

// Upload avatar to Supabase Storage
async function handleAvatarUpload(input) {
  const file = input.files[0];
  if (!file || !state.user) return;
  const progressEl = document.getElementById('avatarUploadProgress');
  progressEl.style.display = 'block';
  try {
    const ext = file.name.split('.').pop();
    const path = `${state.user.id}/avatar.${ext}`;
    const { error: upErr } = await sb.storage.from('avatars').upload(path, file, { upsert: true });
    if (upErr) throw upErr;
    const { data: urlData } = sb.storage.from('avatars').getPublicUrl(path);
    const avatarUrl = urlData.publicUrl + '?t=' + Date.now();
    await sb.from('profiles').upsert({ id: state.user.id, avatar_url: avatarUrl });
    state.user.avatarUrl = avatarUrl;
    renderProfileAvatar(avatarUrl, state.user.name);
    updateHomeAvatar(state.user.name, avatarUrl);
    updateSidebarAvatar(state.user.name, avatarUrl);
    showToast('<span class="material-symbols-rounded" style="font-size:1.1rem;color:var(--green)">check_circle</span>', 'Foto atualizada!', '');
  } catch(e) {
    showToast('<span class="material-symbols-rounded" style="font-size:1.1rem;color:#f59e0b">warning</span>', 'Erro ao enviar foto', 'Verifique se o bucket "avatars" foi criado no Supabase.');
  } finally {
    progressEl.style.display = 'none';
    input.value = '';
  }
}

// Save profile data
async function saveProfile() {
  if (!state.user) return;
  const btn = document.getElementById('profileSaveBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="material-symbols-rounded" style="font-size:18px;">hourglass_empty</span> Salvando...';
  const name = document.getElementById('profileName').value.trim();
  const bio = document.getElementById('profileBio').value.trim();
  const profession = document.getElementById('profileProfession').value.trim();
  const city = document.getElementById('profileCity').value.trim();
  const linkedin_url = document.getElementById('profileLinkedin').value.trim();
  const goal = document.getElementById('profileGoal').value.trim();
  const is_public = document.getElementById('profilePublicToggle').checked;
  try {
    const upsertPayload = {
      id: state.user.id, name: name || state.user.name,
      bio, profession, city, linkedin_url, goal, is_public
    };
    // preserve avatar_url — never let saveProfile clear it
    if (state.user.avatarUrl) upsertPayload.avatar_url = state.user.avatarUrl;
    const { error } = await sb.from('profiles').upsert(upsertPayload);
    if (error) throw error;
    if (name) {
      state.user.name = name;
      const nameEl = document.getElementById('sidebarName');
      if (nameEl) nameEl.textContent = name;
    }
    showToast('<span class="material-symbols-rounded" style="font-size:1.1rem;color:var(--green)">check_circle</span>', 'Perfil salvo!', 'Suas informações foram atualizadas.');
  } catch(e) {
    showToast('<span class="material-symbols-rounded" style="font-size:1.1rem;color:#ef4444">error</span>', 'Erro ao salvar', 'Tente novamente.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-rounded" style="font-size:18px;">save</span> Salvar perfil';
  }
}

// Update home nav avatar (#homeAvatar, top-right circle)
function updateHomeAvatar(name, avatarUrl) {
  const el = document.getElementById('homeAvatar');
  if (!el) return;
  if (avatarUrl) {
    el.innerHTML = '';
    el.style.background = 'none';
    el.style.padding = '0';
    const img = document.createElement('img');
    img.src = avatarUrl;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;';
    img.onerror = () => { el.innerHTML = ''; el.style = ''; el.textContent = getInitial(name); };
    el.appendChild(img);
  } else {
    el.innerHTML = '';
    el.style = '';
    el.textContent = getInitial(name);
  }
}

// Update sidebar avatar after photo change
function updateSidebarAvatar(name, avatarUrl) {
  const sidebarAvEl = document.getElementById('sidebarAvatar');
  if (!sidebarAvEl) return;
  if (avatarUrl) {
    sidebarAvEl.innerHTML = '';
    sidebarAvEl.style.background = 'none';
    sidebarAvEl.style.padding = '0';
    const img = document.createElement('img');
    img.src = avatarUrl;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;';
    img.onerror = () => { sidebarAvEl.innerHTML = ''; sidebarAvEl.style = ''; sidebarAvEl.textContent = getInitial(name); };
    sidebarAvEl.appendChild(img);
  } else {
    sidebarAvEl.innerHTML = '';
    sidebarAvEl.style = '';
    sidebarAvEl.textContent = getInitial(name);
  }
}

// Open public profile modal for another user
async function openProfileModal(userId, fallbackName) {
  if (!userId) return;
  const { data } = await sb.from('profiles')
    .select('name,bio,profession,city,linkedin_url,avatar_url,is_public')
    .eq('id', userId).single();
  if (!data || !data.is_public) return; // private profile — do nothing
  const modal = document.getElementById('profileModal');
  const displayName = data.name || fallbackName || 'Aluno';
  // Avatar
  const avatarContainer = document.getElementById('profileModalAvatar');
  if (data.avatar_url) {
    avatarContainer.innerHTML = `<img src="${data.avatar_url}" class="profile-modal-avatar" onerror="this.outerHTML='<div class=\\'profile-modal-avatar-init\\'>${getInitial(displayName)}</div>'">`;
  } else {
    const colors = avatarColor(displayName);
    avatarContainer.innerHTML = `<div class="profile-modal-avatar-init" style="background:linear-gradient(135deg,${colors})">${getInitial(displayName)}</div>`;
  }
  document.getElementById('profileModalName').textContent = displayName;
  document.getElementById('profileModalRole').textContent = data.profession || '';
  document.getElementById('profileModalBio').textContent = data.bio || '';
  // Tags
  const tagsEl = document.getElementById('profileModalTags');
  const tags = [];
  if (data.city) tags.push(`<div class="profile-modal-tag"><span class="material-symbols-rounded" style="font-size:13px">location_on</span>${escHtml(data.city)}</div>`);
  if (data.linkedin_url) tags.push(`<div class="profile-modal-tag"><span class="material-symbols-rounded" style="font-size:13px">link</span><a href="${escHtml(data.linkedin_url)}" target="_blank" rel="noopener">LinkedIn</a></div>`);
  tagsEl.innerHTML = tags.join('');
  modal.classList.add('open');
}

function closeProfileModal() {
  document.getElementById('profileModal').classList.remove('open');
}

document.getElementById('profileModal').addEventListener('click', e => {
  if (e.target === document.getElementById('profileModal')) closeProfileModal();
});

document.getElementById('openTermsLink').addEventListener('click', () => openTermsModal('termos'));
document.getElementById('termsModalClose').addEventListener('click', closeTermsModal);
document.getElementById('termsModal').addEventListener('click', e => { if (e.target === document.getElementById('termsModal')) closeTermsModal(); });
document.querySelectorAll('.modal-tab').forEach(tab => tab.addEventListener('click', () => switchModalTab(tab.dataset.tab)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeTermsModal(); });

/* ═══════════════════════════════════════════════════════════
   INIT — verifica sessão existente
═══════════════════════════════════════════════════════════ */
(async () => {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) goLogin();
  // session exists — onAuthStateChange fires automatically and calls goHome()
  // If session exists, onAuthStateChange fires automatically
})();
