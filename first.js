// Footer year
(function () {
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = String(new Date().getFullYear());
})();

// Smooth in-page scroll for #anchors
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id && id.startsWith('#') && id.length > 1) {
      e.preventDefault();
      document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Temporary feature placeholders
document.querySelectorAll('a[href="#qr"], a[href="#share"], a[href="#reminders"]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    alert('This feature page is coming soon!');
  });
});

// --- NAVBAR MICRO-INTERACTIONS ---
// Indicator now resizes to match link size so the text is centered inside the purple oval.
const navbar = document.getElementById('navbar');
const navLinksWrap = document.getElementById('navLinks');
const indicator = document.getElementById('navIndicator');

if (navbar && navLinksWrap && indicator) {
  const links = Array.from(navLinksWrap.querySelectorAll('a'));

  let hideTimer;

  function moveIndicatorTo(link) {
    const wrapRect = navLinksWrap.getBoundingClientRect();
    const rect = link.getBoundingClientRect();

    // Calculate relative position within navLinks container
    const left = rect.left - wrapRect.left;
    const centerY = (rect.top - wrapRect.top) + (rect.height / 2);
    const width = rect.width + 16;    // add small horizontal breathing
    const height = rect.height + 8;   // add small vertical breathing

    indicator.style.opacity = '1';
    indicator.style.left = `${left - 8}px`;         // offset to account for added width
    indicator.style.top = `${centerY}px`;           // we use translateY(-50%) in CSS
    indicator.style.width = `${Math.max(64, width)}px`;
    indicator.style.height = `${Math.max(40, height)}px`;
  }

  function hideIndicatorSoon() {
    hideTimer = setTimeout(() => {
      indicator.style.opacity = '0';
      navbar.classList.remove('nav-active');
    }, 120);
  }

  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      clearTimeout(hideTimer);
      moveIndicatorTo(link);
      navbar.classList.add('nav-active');
    });
    link.addEventListener('focus', () => {
      clearTimeout(hideTimer);
      moveIndicatorTo(link);
      navbar.classList.add('nav-active');
    });
    link.addEventListener('mouseleave', hideIndicatorSoon);
    link.addEventListener('blur', hideIndicatorSoon);
  });

  navLinksWrap.addEventListener('mouseleave', hideIndicatorSoon);
}