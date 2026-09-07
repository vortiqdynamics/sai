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

  // Guided finder: collects answers and passes structured data directly to WhatsApp and quote page
  const finder = document.getElementById('finderCard');
  if (finder) {
    const stepViews = [...finder.querySelectorAll('.finder-step')];
    const progress = document.getElementById('progressBar');
    const stepPills = document.querySelectorAll('.finder-steps span');
    const finderWhatsAppBtn = document.getElementById('finderWhatsAppBtn') || finder.querySelector('a[href*="wa.me"]');
    const finderQuoteBtn = document.getElementById('finderQuoteBtn') || finder.querySelector('a[href*="contact.html"]');

    const finderAnswers = {
      usage: '',
      backup: '',
      inverter: ''
    };

    const buildFinderMessage = () => {
      const lines = [
        'BATTERY FINDER ENQUIRY - ENERGY NEXT',
        '----------------------------',
      ];
      if (finderAnswers.usage)    lines.push(`Usage        : ${finderAnswers.usage}`);
      if (finderAnswers.backup)   lines.push(`Backup Needed: ${finderAnswers.backup}`);
      if (finderAnswers.inverter) lines.push(`Has Inverter : ${finderAnswers.inverter}`);
      lines.push('----------------------------');
      lines.push('Need verified battery + inverter recommendation.');
      lines.push('----------------------------');
      lines.push('Sent via Energy Next Website');
      return lines.join('\n');
    };

    const updateFinderLinks = () => {
      const text = buildFinderMessage();
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
      if (finderWhatsAppBtn) {
        finderWhatsAppBtn.href = waUrl;
      }
      if (finderQuoteBtn) {
        const params = new URLSearchParams();
        if (finderAnswers.usage) params.set('type', finderAnswers.usage);
        if (finderAnswers.backup) params.set('backup', finderAnswers.backup);
        finderQuoteBtn.href = `contact.html?${params.toString()}#quote`;
      }
    };

    const setStep = (step) => {
      stepViews.forEach((view) => view.classList.toggle('active', Number(view.dataset.step) === step));
      if (progress) progress.style.width = `${Math.max(25, step * 25)}%`;
      stepPills.forEach((pill, index) => pill.classList.toggle('active', index < step));
      if (step === 4) {
        updateFinderLinks();
      }
    };

    finder.querySelectorAll('.finder-step').forEach((stepEl) => {
      const stepNum = Number(stepEl.dataset.step);
      stepEl.querySelectorAll('button[data-next]').forEach((button) => {
        button.addEventListener('click', () => {
          const val = button.textContent.trim();
          if (stepNum === 1) finderAnswers.usage = val;
          else if (stepNum === 2) finderAnswers.backup = val;
          else if (stepNum === 3) finderAnswers.inverter = val;

          stepEl.querySelectorAll('button').forEach((b) => b.classList.remove('selected'));
          button.classList.add('selected');

          setStep(Number(button.dataset.next));
        });
      });
    });

    finderWhatsAppBtn?.addEventListener('click', (event) => {
      event.preventDefault();
      updateFinderLinks();
      const text = buildFinderMessage();
      openWhatsApp(text);
    });
  }

  // Quote form handler: formats form inputs into a WhatsApp message and opens WhatsApp.
  const form = document.getElementById('quoteForm');
  const formMessage = document.getElementById('formMessage');
  const submitBtn = form?.querySelector('button[type="submit"]');
  const waBtn = document.getElementById('whatsappQuoteBtn');
  const WHATSAPP_NUMBER = '919061639695';

  // Auto-fill form from URL query parameters (if coming from Battery Finder)
  if (form) {
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');
    const backupParam = urlParams.get('backup');

    if (typeParam) {
      const typeSelect = form.querySelector('select[name="customerType"]');
      if (typeSelect) {
        for (let opt of typeSelect.options) {
          const lowerOpt = opt.value.toLowerCase();
          const lowerParam = typeParam.toLowerCase();
          if (lowerOpt === lowerParam ||
              (lowerParam === 'shop' && opt.value === 'Business') ||
              (lowerParam === 'office' && opt.value === 'Business')) {
            typeSelect.value = opt.value;
            break;
          }
        }
      }
    }
    if (backupParam) {
      const backupInput = form.querySelector('input[name="backup"]');
      if (backupInput) {
        backupInput.value = backupParam;
      }
    }
  }

  const buildWhatsAppMessage = (data) => {
    const lines = [
      'NEW QUOTE REQUEST - ENERGY NEXT',
      '----------------------------',
    ];

    if (data.name?.trim())         lines.push(`Name         : ${data.name.trim()}`);
    if (data.phone?.trim())        lines.push(`Mobile       : ${data.phone.trim()}`);
    if (data.location?.trim())     lines.push(`Location     : ${data.location.trim()}`);
    if (data.customerType?.trim()) lines.push(`Customer Type: ${data.customerType.trim()}`);
    if (data.requirement?.trim())  lines.push(`Requirement  : ${data.requirement.trim()}`);
    if (data.backup?.trim())       lines.push(`Backup Needed: ${data.backup.trim()}`);
    if (data.load?.trim())         lines.push(`Est. Load    : ${data.load.trim()}`);
    if (data.message?.trim()) {
      lines.push('----------------------------');
      lines.push(`Message:\n${data.message.trim()}`);
    }
    lines.push('----------------------------');
    lines.push('Sent via Energy Next Website');

    return lines.join('\n');
  };

  // Robust WhatsApp redirect that works across desktop, mobile and local files
  const openWhatsApp = (text) => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    const win = window.open(url, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = url;
    }
  };

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      localStorage.setItem('energyNextLeadDraft', JSON.stringify({ ...data, createdAt: new Date().toISOString() }));
    } catch (_) {}

    const text = buildWhatsAppMessage(data);

    if (formMessage) {
      formMessage.textContent = '✓ Opening WhatsApp with your enquiry details...';
      formMessage.classList.add('show');
    }

    openWhatsApp(text);
  });

  waBtn?.addEventListener('click', (event) => {
    if (!form) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const hasCustomData = (data.name && data.name.trim()) ||
                          (data.phone && data.phone.trim()) ||
                          (data.requirement && data.requirement.trim()) ||
                          (data.message && data.message.trim());
    if (hasCustomData) {
      event.preventDefault();
      const text = buildWhatsAppMessage(data);
      openWhatsApp(text);
    }
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
