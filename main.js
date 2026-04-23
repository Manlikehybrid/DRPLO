
(function(){
  const STORAGE_KEY = 'drplo_demo_auth';
  const APP_PAGES = new Set(['dashboard.html','create-drop.html','content-library.html','scheduler.html','analytics.html','settings.html']);
  const file = location.pathname.split('/').pop() || 'index.html';
  const auth = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');

  function toast(message, type='info') {
    let el = document.querySelector('.drplo-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'drplo-toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.dataset.type = type;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function redirect(url, delay=0){ setTimeout(()=>location.href=url, delay); }

  if (APP_PAGES.has(file) && !auth) {
    localStorage.setItem('drplo_post_login_redirect', file);
    location.replace('signin.html');
    return;
  }

  if (file === 'auth-placeholder.html') {
    const params = new URLSearchParams(location.search);
    const provider = params.get('provider');
    const name = provider === 'google' ? 'Google' : provider === 'x' ? 'X / Twitter' : 'Social';
    const h2 = document.querySelector('.auth-card-head h2');
    const p = document.querySelector('.auth-card-head .auth-sub');
    if (h2) h2.textContent = `${name} login setup pending`;
    if (p) p.textContent = `${name} sign-in needs a real OAuth setup before it can become functional.`;
  }

  document.querySelectorAll('form[data-auth-form]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const kind = form.dataset.authForm;
      if (kind === 'signin' || kind === 'signup') {
        const emailInput = form.querySelector('input[type="email"]');
        const firstText = form.querySelector('input[type="text"]');
        const user = {
          email: emailInput ? (emailInput.value || 'hybridgfx@example.com') : 'hybridgfx@example.com',
          name: firstText ? (firstText.value || 'HybridGfx') : 'HybridGfx'
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        toast(kind === 'signin' ? 'Signed in successfully.' : 'Account created successfully.', 'success');
        const next = localStorage.getItem('drplo_post_login_redirect') || 'dashboard.html';
        localStorage.removeItem('drplo_post_login_redirect');
        redirect(next, 500);
      } else if (kind === 'forgot') {
        toast('Reset link sent. Check your email.', 'success');
        redirect('signin.html', 900);
      }
    });
  });

  document.querySelectorAll('form[data-form-type]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const kind = form.dataset.formType;
      toast(kind === 'waitlist' ? 'You joined the waitlist.' : 'Your message has been sent.', 'success');
      form.reset();
    });
  });

  const menuBtn = document.querySelector('.menu-btn');
  const navWrap = document.querySelector('.nav-wrap');
  if (menuBtn && navWrap) {
    menuBtn.addEventListener('click', () => {
      const isOpen = navWrap.classList.toggle('menu-open');
      menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.classList.toggle('mobile-nav-open', isOpen);
    });
    document.querySelectorAll('.site-nav a, .nav-actions a').forEach(link => {
      link.addEventListener('click', () => {
        navWrap.classList.remove('menu-open');
        document.body.classList.remove('mobile-nav-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.querySelectorAll('a[href="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      toast('This action will be connected next.', 'info');
    });
  });

  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    const actionLike = a.classList.contains('btn') || a.classList.contains('app-panel-link') || a.classList.contains('quick-action-card');
    if (actionLike && href === file) {
      a.addEventListener('click', e => {
        e.preventDefault();
        const label = (a.textContent || '').trim().replace(/\s+/g,' ');
        const lower = label.toLowerCase();
        let message = `${label || 'This action'} is in demo mode for now.`;
        if (lower.includes('save')) message = 'Demo mode: changes are not persisted yet.';
        else if (lower.includes('reset')) message = 'Demo mode: settings reset is not wired yet.';
        else if (lower.includes('export')) message = 'Demo mode: export will be connected next.';
        else if (lower.includes('weekly')) message = 'Weekly filter is in demo mode for now.';
        else if (lower.includes('month')) message = 'Calendar view switching is not wired yet.';
        else if (lower.includes('sort')) message = 'Sorting options will be connected next.';
        else if (lower.includes('regenerate')) message = 'Regeneration is a demo action for now.';
        else if (lower.includes('2fa')) message = 'Two-factor authentication setup is not wired yet.';
        else if (lower.includes('delete')) message = 'Danger-zone actions are disabled in demo mode.';
        else if (lower.includes('sync')) message = 'Syncing will be available when integrations are connected.';
        toast(message, 'info');
      });
    }
  });

  if (auth) {
    document.querySelectorAll('.sidebar-user strong, .settings-profile-card strong').forEach(el => {
      if (el) el.textContent = auth.name || 'HybridGfx';
    });
    const h1 = document.querySelector('.app-topbar h1');
    if (h1 && /Welcome back/i.test(h1.textContent)) {
      h1.textContent = `Welcome back, ${auth.name || 'HybridGfx'}`;
    }
    document.querySelectorAll('.settings-profile-card span').forEach(el => {
      if (el && el.textContent.includes('@')) el.textContent = auth.email || el.textContent;
    });
    document.querySelectorAll('#settings-first-name').forEach(el => el.value = (auth.name || 'HybridGfx').split(' ')[0]);
    document.querySelectorAll('#settings-email').forEach(el => el.value = auth.email || 'hybridgfx@example.com');
  }

  if (APP_PAGES.has(file)) {
    const actions = document.querySelector('.app-topbar-actions');
    if (actions && !actions.querySelector('[data-logout]')) {
      const btn = document.createElement('a');
      btn.href = '#';
      btn.className = 'btn btn-ghost';
      btn.dataset.logout = '1';
      btn.textContent = 'Log Out';
      btn.addEventListener('click', e => {
        e.preventDefault();
        localStorage.removeItem(STORAGE_KEY);
        toast('Logged out.', 'success');
        redirect('signin.html', 250);
      });
      actions.appendChild(btn);
    }
  }

  document.querySelectorAll('a[href="YOUR-GITHUB-LINK-HERE"], a[href="https://github.com/"]').forEach(a => {
    a.href = 'https://github.com/manlikehybrid';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });
})();
