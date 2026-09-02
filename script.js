(() => {
  const header = document.getElementById('siteHeader');
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 12);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  navToggle?.addEventListener('click', () => {
    const open = nav?.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(Boolean(open)));
  });

  nav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  // Product tabs
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.product-panel');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach((item) => {
        item.classList.toggle('active', item === tab);
        item.setAttribute('aria-selected', String(item === tab));
      });
      panels.forEach((panel) => {
        const active = panel.id === target;
        panel.hidden = !active;
        panel.classList.toggle('active', active);
      });
    });
  });

  // Guided finder
  const finder = document.getElementById('finderCard');
  if (finder) {
    const stepViews = [...finder.querySelectorAll('.finder-step')];
    const progress = document.getElementById('progressBar');
    const stepPills = document.querySelectorAll('.finder-steps span');
    const setStep = (step) => {
      stepViews.forEach((view) => view.classList.toggle('active', Number(view.dataset.step) === step));
      if (progress) progress.style.width = `${Math.max(25, step * 25)}%`;
      stepPills.forEach((pill, index) => pill.classList.toggle('active', index < step));
    };
    finder.querySelectorAll('[data-next]').forEach((button) => {
      button.addEventListener('click', () => setStep(Number(button.dataset.next)));
    });
  }

  // Quote form demo handler. Replace with a real API/CRM endpoint before launch.
  const form = document.getElementById('quoteForm');
  const formMessage = document.getElementById('formMessage');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    localStorage.setItem('voltivaLeadDraft', JSON.stringify({ ...data, createdAt: new Date().toISOString() }));
    formMessage.textContent = 'Thanks — your enquiry has been captured in this demo. Connect the handler to your backend/CRM to send it to the sales team.';
    formMessage.classList.add('show');
    form.reset();
  });

  // Gentle reveal for major cards.
  const revealItems = document.querySelectorAll('.solution-card, .product-card, .package-card, .benefit-card, .application-card, .contact-card');
  revealItems.forEach((el) => el.classList.add('reveal'));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((el) => observer.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('in'));
  }
})();
