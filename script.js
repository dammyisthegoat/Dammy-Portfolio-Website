const body = document.body;
const header = document.getElementById('site-header');
const progressBar = document.querySelector('.scroll-progress span');
const cursorGlow = document.querySelector('.cursor-glow');
const transition = document.querySelector('.page-transition');
const menuToggle = document.querySelector('.menu-toggle');
const menuClose = document.querySelector('.menu-close');
const mobileMenu = document.querySelector('.mobile-menu');
const yearEl = document.getElementById('year');
const lightbox = document.querySelector('.lightbox');
const lightboxImg = lightbox?.querySelector('img');
const lightboxTitle = lightbox?.querySelector('[data-lightbox-title]');
const lightboxType = lightbox?.querySelector('[data-lightbox-type]');

if (yearEl) yearEl.textContent = new Date().getFullYear();

window.addEventListener('load', () => {
  requestAnimationFrame(() => body.classList.add('page-ready'));
});

// Scroll progress + blurred navbar
function handleScroll() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  header.classList.toggle('scrolled', scrollTop > 30);
}
window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();

// Cursor-following glow
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  window.addEventListener('pointermove', (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  });
}

// Reveal on scroll
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.13 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

// Stagger cards within sections
['.service-card', '.skill-card', '.project-card', '.design-card', '.process-row'].forEach((selector) => {
  document.querySelectorAll(selector).forEach((el, index) => {
    el.style.transitionDelay = `${Math.min(index * 0.07, 0.28)}s`;
  });
});

// Magnetic buttons
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.magnetic').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.12;
      element.style.transform = `translate(${x}px, ${y}px)`;
    });
    element.addEventListener('pointerleave', () => {
      element.style.transform = '';
    });
  });
}

// Very subtle 3D card tilt
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 5;
      const rotateX = (0.5 - y) * 5;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
}

// Mobile navigation
function setMenu(open) {
  mobileMenu.classList.toggle('open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  menuToggle.setAttribute('aria-expanded', String(open));
  body.classList.toggle('no-scroll', open);
}
menuToggle?.addEventListener('click', () => setMenu(true));
menuClose?.addEventListener('click', () => setMenu(false));
mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

// Smooth internal navigation + page-exit transition
function smoothTo(target) {
  if (!target) return;
  const offset = header.offsetHeight + 10;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    smoothTo(target);
  });
});

// Page transition for external navigation clicks (opens in same tab only)
document.querySelectorAll('a[target="_self"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.href;
    if (!href || href.startsWith('#')) return;
    event.preventDefault();
    body.classList.remove('page-ready');
    body.classList.add('page-exit');
    setTimeout(() => { window.location.href = href; }, 420);
  });
});

// Project filters
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((btn) => {
      const active = btn === button;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    projectCards.forEach((card) => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.style.display = show ? '' : 'none';
      if (show) {
        card.animate(
          [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 420, easing: 'cubic-bezier(.22,.8,.24,1)' }
        );
      }
    });
  });
});

// Design lightbox
function openLightbox(card) {
  const image = card.dataset.image;
  const title = card.dataset.title || 'Artwork';
  const type = card.dataset.type || 'Graphic design';
  lightboxImg.src = image;
  lightboxImg.alt = `${title} — ${type}`;
  lightboxTitle.textContent = title;
  lightboxType.textContent = type;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  body.classList.add('no-scroll');
}
function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  body.classList.remove('no-scroll');
}
document.querySelectorAll('.design-card').forEach((card) => card.addEventListener('click', () => openLightbox(card)));
lightbox?.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
window.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeLightbox(); if (mobileMenu.classList.contains('open')) setMenu(false); } });

// Hero particles: small, lightweight canvas system
const canvas = document.getElementById('hero-canvas');
const ctx = canvas?.getContext('2d');
let particles = [];
let heroPointer = { x: 0.7, y: 0.42 };

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(110, Math.max(55, Math.floor(rect.width / 14)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * rect.width,
    y: Math.random() * rect.height,
    r: Math.random() * 1.7 + .35,
    vx: (Math.random() - .5) * .18,
    vy: (Math.random() - .5) * .18,
    alpha: Math.random() * .5 + .12,
    hue: Math.random() > .73 ? 'violet' : 'lime'
  }));
}

function animateParticles() {
  if (!canvas || !ctx) return;
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
  const mouseX = heroPointer.x * rect.width;
  const mouseY = heroPointer.y * rect.height;

  particles.forEach((p) => {
    const dx = mouseX - p.x;
    const dy = mouseY - p.y;
    const dist = Math.hypot(dx, dy) || 1;
    if (dist < 240) {
      p.vx += (dx / dist) * 0.0009;
      p.vy += (dy / dist) * 0.0009;
    }
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.995;
    p.vy *= 0.995;
    if (p.x < -20) p.x = rect.width + 20;
    if (p.x > rect.width + 20) p.x = -20;
    if (p.y < -20) p.y = rect.height + 20;
    if (p.y > rect.height + 20) p.y = -20;
    const base = p.hue === 'lime' ? '183,255,0' : '108,43,255';
    ctx.fillStyle = `rgba(${base},${p.alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // faint connections around the visual center
  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 120 && (a.hue === 'lime' || b.hue === 'lime')) {
        ctx.strokeStyle = `rgba(183,255,0,${0.055 * (1 - dist / 120)})`;
        ctx.lineWidth = .6;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
  }
  requestAnimationFrame(animateParticles);
}

window.addEventListener('pointermove', (event) => {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  heroPointer.x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  heroPointer.y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
});

if (canvas && ctx && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  resizeCanvas();
  animateParticles();
  window.addEventListener('resize', resizeCanvas);
}
