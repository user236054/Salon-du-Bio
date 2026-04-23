document.addEventListener("DOMContentLoaded", () => {
  const titleTarget = document.getElementById("site-dynamic-title");
  const subtitleTarget = document.getElementById("site-dynamic-subtitle");

  if (titleTarget) {
    titleTarget.innerHTML =
      '<span class="hero-title-bottom">SIBIO 2026</span><span class="hero-title-edition">3E EDITION</span><span class="hero-title-top">Salon International du Bio</span>';
  }

  if (subtitleTarget) {
    subtitleTarget.textContent =
      "Le grand rendez-vous du bio, de l'innovation durable et des acteurs engages.";
  }

  const heroTimer = {
    days: document.getElementById("hero-days"),
    hours: document.getElementById("hero-hours"),
    minutes: document.getElementById("hero-minutes"),
    seconds: document.getElementById("hero-seconds"),
  };

  if (heroTimer.days && heroTimer.hours && heroTimer.minutes && heroTimer.seconds) {
    const countdownTarget = new Date("2026-11-17T08:00:00");

    const updateCountdown = () => {
      const now = new Date();
      const delta = countdownTarget.getTime() - now.getTime();

      if (delta <= 0) {
        heroTimer.days.textContent = "00";
        heroTimer.hours.textContent = "00";
        heroTimer.minutes.textContent = "00";
        heroTimer.seconds.textContent = "00";
        return;
      }

      const days = Math.floor(delta / (1000 * 60 * 60 * 24));
      const hours = Math.floor((delta / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((delta / (1000 * 60)) % 60);
      const seconds = Math.floor((delta / 1000) % 60);

      heroTimer.days.textContent = String(days).padStart(2, "0");
      heroTimer.hours.textContent = String(hours).padStart(2, "0");
      heroTimer.minutes.textContent = String(minutes).padStart(2, "0");
      heroTimer.seconds.textContent = String(seconds).padStart(2, "0");
    };

    updateCountdown();
    window.setInterval(updateCountdown, 1000);
  }

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-menu a").forEach((link) => {
    const href = (link.getAttribute("href") || "").replace(/^\.\//, "");
    if (href === currentPage) {
      link.classList.add("is-active");
    }
  });

  const revealElements = document.querySelectorAll(".reveal-on-scroll");
  if (revealElements.length) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  document.querySelectorAll("[data-slider]").forEach((slider) => {
    const track = slider.querySelector(".image-slider-track");
    const slides = slider.querySelectorAll(".image-slide");
    const prev = slider.querySelector(".slider-control.prev");
    const next = slider.querySelector(".slider-control.next");

    if (!track || slides.length === 0) {
      return;
    }

    let index = 0;

    const render = () => {
      track.style.transform = `translateX(-${index * 100}%)`;
    };

    prev?.addEventListener("click", () => {
      index = (index - 1 + slides.length) % slides.length;
      render();
    });

    next?.addEventListener("click", () => {
      index = (index + 1) % slides.length;
      render();
    });
  });
});
