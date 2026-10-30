const progress = document.getElementById("progressBar");
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const chapterSections = [...document.querySelectorAll(".story-section")];

function updateProgress(){
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.width = `${Math.min(100, pct)}%`;
}
window.addEventListener("scroll", updateProgress, {passive:true});
window.addEventListener("resize", updateProgress);
updateProgress();

menuToggle?.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Fechar navegação" : "Abrir navegação");
});
mobileMenu?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// Smooth handoff: chapter links close the mobile menu and land at the chapter heading.
document.querySelectorAll('a[href^="#capitulo-"]').forEach(link => {
  link.addEventListener("click", () => {
    mobileMenu?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const revealTargets = document.querySelectorAll(
  ".data-interlude, .manifesto, .chapter-index, .closing, .chapter-next"
);
revealTargets.forEach(el => el.classList.add("reveal"));

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.07, rootMargin: "0px 0px -5% 0px"});
  revealTargets.forEach(el => observer.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add("is-visible"));
}

// Keep the chapter currently being read visible in the top navigation.
if ("IntersectionObserver" in window) {
  const chapterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      document.querySelectorAll('.desktop-nav a, .mobile-menu a').forEach(link => {
        const active = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  }, {threshold: 0.15, rootMargin: "-18% 0px -58% 0px"});
  chapterSections.forEach(section => chapterObserver.observe(section));
}

// Cinematic video: sharp when centered, blurs as it leaves viewport
function updateCinematicVideos() {
  document.querySelectorAll('.video-cinematic').forEach(el => {
    const video = el.querySelector('video');
    if (!video) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const dist = Math.abs(rect.top + rect.height / 2 - vh / 2) / vh;
    const p = Math.max(0, dist - 0.15) / 0.85;
    video.style.filter = `blur(${p * 10}px)`;
    video.style.opacity = String(1 - p * 0.65);
  });
}
window.addEventListener('scroll', updateCinematicVideos, {passive:true});
updateCinematicVideos();

// Chapter gate: next chapter only unlocks on click, not scroll
document.querySelectorAll('.chapter-next').forEach(btn => {
  btn.addEventListener('click', e => {
    const href = btn.getAttribute('href');
    if (!href?.startsWith('#')) return;
    const target = document.getElementById(href.slice(1));
    if (!target?.classList.contains('chapter-locked')) return;
    e.preventDefault();
    target.classList.remove('chapter-locked');
    target.classList.add('chapter-unlocking');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      target.scrollIntoView({behavior:'smooth', block:'start'});
    }));
  });
});

