// ===== Clinic details — edit these to rebrand the demo for each client =====
const CLINIC = {
  name: "BrightSmile Dental",
  phone: "(555) 012-3456",
  email: "hello@brightsmile.example",
  address: "123 Main Street, Your City, ST 12345",
  theme: "teal",          // teal | ocean | violet | gold | mint | rose
  showThemePicker: true,  // set false on the final site you deliver to a clinic
};

// Theme: ?theme=violet in the URL overrides the default (handy for sending pitch links)
const THEMES = { teal: "#0e9aa7", ocean: "#2563eb", violet: "#7c3aed", gold: "#b7791f", mint: "#15803d", rose: "#d6336c" };
const setTheme = (name) => {
  if (!THEMES[name]) name = "teal";
  if (name === "teal") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = name;
  document.querySelectorAll(".theme-picker button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.theme === name));
};
setTheme(new URLSearchParams(location.search).get("theme") || CLINIC.theme);

if (CLINIC.showThemePicker) {
  const picker = document.createElement("div");
  picker.className = "theme-picker";
  picker.setAttribute("aria-label", "Colour theme");
  picker.innerHTML = "<span>Theme</span>";
  Object.entries(THEMES).forEach(([name, color]) => {
    const b = document.createElement("button");
    b.dataset.theme = name;
    b.style.setProperty("--swatch", color);
    b.setAttribute("aria-label", name + " theme");
    b.title = name;
    b.addEventListener("click", () => {
      // On phones the picker shows only the active swatch until tapped
      if (matchMedia("(max-width: 640px)").matches && !picker.classList.contains("open")) {
        picker.classList.add("open");
        return;
      }
      picker.classList.remove("open");
      setTheme(name);
      const url = new URL(location.href);
      url.searchParams.set("theme", name);
      history.replaceState(null, "", url);
    });
    picker.appendChild(b);
  });
  document.body.appendChild(picker);
  setTheme(document.documentElement.dataset.theme || "teal");
}

document.querySelectorAll("[data-brand]").forEach((el) => {
  const key = el.dataset.brand.replace(/\d+$/, "");
  if (!CLINIC[key]) return;
  el.textContent = CLINIC[key];
  if (key === "phone") el.href = "tel:" + CLINIC.phone.replace(/[^\d+]/g, "");
  if (key === "email") el.href = "mailto:" + CLINIC.email;
});
document.querySelectorAll(".call-btn").forEach((a) => (a.href = "tel:" + CLINIC.phone.replace(/[^\d+]/g, "")));
document.getElementById("yr").textContent = new Date().getFullYear();

// Header shadow + mobile sticky CTA
const header = document.querySelector(".site-header");
const sticky = document.querySelector(".sticky-cta");
const bookSection = document.getElementById("book");
const progress = document.getElementById("progress");
const onScroll = () => {
  header.classList.toggle("scrolled", scrollY > 10);
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  const bookTop = bookSection.getBoundingClientRect().top;
  sticky.classList.toggle("show", scrollY > 600 && bookTop > innerHeight);
};
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Mobile menu
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
const setMenu = (open) => {
  nav.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", open);
};
menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

// Scroll reveal + stat counters
const countUp = (el, from = 0, ms = 1600) => {
  const target = parseFloat(el.dataset.count);
  const decimals = +(el.dataset.decimals || 0);
  const start = performance.now();
  cancelAnimationFrame(el._count);
  const step = (now) => {
    const t = Math.min((now - start) / ms, 1);
    const val = from + (target - from) * (1 - Math.pow(1 - t, 3));
    el.textContent = decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString() + (t === 1 && "plus" in el.dataset ? "+" : "");
    if (t < 1) el._count = requestAnimationFrame(step);
  };
  el._count = requestAnimationFrame(step);
};
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    // Counters start with the element's stagger delay, so the numbers build one after another
    const delay = parseFloat(e.target.style.transitionDelay) || 0;
    e.target.querySelectorAll("[data-count]").forEach((el) => setTimeout(() => countUp(el), delay));
    io.unobserve(e.target);
    // Drop the stagger delay once revealed
    setTimeout(() => {
      e.target.style.transitionDelay = "";
      e.target.classList.add("settled");
    }, 1400);
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => {
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
  el.style.transitionDelay = (siblings.indexOf(el) % 4) * 150 + "ms";
  io.observe(el);
});

// Testimonial slider
const slides = [...document.querySelectorAll(".slide")];
const dots = document.getElementById("dots");
let current = 0;
const show = (i) => {
  current = (i + slides.length) % slides.length;
  slides.forEach((s, j) => s.classList.toggle("active", j === current));
  [...dots.children].forEach((d) => d.classList.remove("on"));
  void dots.offsetWidth; // restart the dot's fill animation
  dots.children[current]?.classList.add("on");
};
slides.forEach((_, i) => {
  const b = document.createElement("button");
  b.setAttribute("aria-label", "Show review " + (i + 1));
  b.addEventListener("click", () => show(i));
  dots.appendChild(b);
});
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
// Advance when the dot's fill animation completes
if (reduceMotion) setInterval(() => show(current + 1), 6000);
else dots.addEventListener("animationend", () => show(current + 1));
show(0);

// Highlight the nav link for the section in view
const navLinks = [...nav.querySelectorAll("a:not(.btn)")];
const spy = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
navLinks.forEach((a) => {
  const section = document.querySelector(a.getAttribute("href"));
  if (section) spy.observe(section);
});

// Booking form (demo — no data is sent anywhere)
const form = document.getElementById("bookForm");
const msg = document.getElementById("formMsg");
form.date.min = new Date().toISOString().split("T")[0];
form.addEventListener("submit", (e) => {
  e.preventDefault();
  let ok = true;
  form.querySelectorAll("[required]").forEach((f) => {
    const bad = !f.value.trim() || !f.checkValidity();
    f.classList.toggle("invalid", bad);
    if (bad) ok = false;
  });
  msg.classList.toggle("err", !ok);
  if (!ok) { msg.textContent = "Please fill in the highlighted fields."; return; }
  const first = form.name.value.trim().split(" ")[0];
  msg.classList.remove("pop");
  void msg.offsetWidth;
  msg.classList.add("pop");
  msg.textContent = `Thanks, ${first}! We'll call you shortly to confirm your ${form.service.value.toLowerCase()} appointment.`;
  form.reset();
});
form.addEventListener("input", (e) => e.target.classList.remove("invalid"));
