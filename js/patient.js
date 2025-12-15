/* ============================================================
   HEALTHFLO — PATIENT OS STANDALONE SCRIPT
   - Scroll reveal animations
   - Mobile menu toggle
   - Hero particle canvas animation
   - Orbit subtle floating animation
============================================================ */

/* ------------------------------------------------------------
   1. MOBILE NAV MENU
------------------------------------------------------------ */
const menuBtn = document.getElementById("menuBtn");
const mobileNav = document.getElementById("mobileNav");

menuBtn.addEventListener("click", () => {
  mobileNav.classList.toggle("open");
});

mobileNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => mobileNav.classList.remove("open"));
});

/* ------------------------------------------------------------
   2. SCROLL REVEAL ANIMATIONS
------------------------------------------------------------ */
const revealElements = document.querySelectorAll("[data-animate]");

function scrollReveal() {
  const triggerPoint = window.innerHeight * 0.85;

  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < triggerPoint) {
      el.classList.add("show");
    }
  });
}

window.addEventListener("scroll", scrollReveal);
window.addEventListener("load", scrollReveal);

/* ------------------------------------------------------------
   3. HERO PARTICLE ANIMATION (Soft White Bokeh)
------------------------------------------------------------ */
const canvas = document.getElementById("heroCanvas");
const ctx = canvas.getContext("2d");

let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = 420;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function createParticles() {
  particles = [];
  const count = Math.floor(window.innerWidth / 12);

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.6 + 0.2
    });
  }
}

createParticles();
window.addEventListener("resize", createParticles);

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
    ctx.fill();

    p.x += p.dx;
    p.y += p.dy;

    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
  });

  requestAnimationFrame(animateParticles);
}

animateParticles();

/* ------------------------------------------------------------
   4. ORBIT FLOATING ANIMATION (Subtle Drift)
------------------------------------------------------------ */
const orbitNodes = document.querySelectorAll(".orbit-node");

orbitNodes.forEach((node, idx) => {
  let angle = Math.random() * Math.PI * 2;
  let radius = 6 + Math.random() * 6;

  function float() {
    angle += 0.015;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    node.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(float);
  }

  float();
});
