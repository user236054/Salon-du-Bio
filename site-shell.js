document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("img").forEach((img) => {
    if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
    if (!img.hasAttribute("decoding")) img.setAttribute("decoding", "async");
  });

  const heroTimer = {
    days: document.getElementById("hero-days"),
    hours: document.getElementById("hero-hours"),
    minutes: document.getElementById("hero-minutes"),
    seconds: document.getElementById("hero-seconds"),
  };

  if (heroTimer.days && heroTimer.hours && heroTimer.minutes && heroTimer.seconds) {
    const countdownTarget = new Date("2026-10-28T08:00:00");
    const heroCountdownEl = document.querySelector('.hero-countdown');

    const updateCountdown = () => {
      const now = new Date();
      const delta = countdownTarget.getTime() - now.getTime();

      if (delta <= 0) {
        heroTimer.days.textContent = "00";
        heroTimer.hours.textContent = "00";
        heroTimer.minutes.textContent = "00";
        heroTimer.seconds.textContent = "00";
        if (heroCountdownEl) {
          heroCountdownEl.style.background = "linear-gradient(135deg, #ff1744, #d50000)";
          heroCountdownEl.innerHTML = '<p style="color:white;font-size:1.4rem;font-weight:800;text-align:center;margin:0;text-shadow:0 0 20px rgba(255,255,255,0.8);">🎉 L\'événement a commencé !</p>';
        }
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

      // Couleurs dynamiques selon la proximité de l'événement
      if (heroCountdownEl) {
        const timeUnits = heroCountdownEl.querySelectorAll('.time-unit span');
        let bgGradient, textColor, glowColor, pulseIntensity;

        if (days > 30) {
          // Loin : vert calme
          bgGradient = "linear-gradient(135deg, #e8f5e9, #c8e6c9)";
          textColor = "#2e7d32";
          glowColor = "rgba(46,125,50,0.3)";
          pulseIntensity = "0s";
        } else if (days > 7) {
          // Approche : vert vif
          bgGradient = "linear-gradient(135deg, #c8e6c9, #a5d6a7)";
          textColor = "#1b5e20";
          glowColor = "rgba(27,94,32,0.5)";
          pulseIntensity = "2s";
        } else if (days > 1) {
          // Proche : orange stressant
          bgGradient = "linear-gradient(135deg, #ffe0b2, #ffcc80)";
          textColor = "#e65100";
          glowColor = "rgba(230,81,0,0.6)";
          pulseIntensity = "1s";
        } else {
          // Très proche : rouge urgence
          bgGradient = "linear-gradient(135deg, #ffcdd2, #ef9a9a)";
          textColor = "#c62828";
          glowColor = "rgba(198,40,40,0.8)";
          pulseIntensity = "0.5s";
        }

        heroCountdownEl.style.background = bgGradient;
        heroCountdownEl.style.transition = "all 0.5s ease";

        timeUnits.forEach(unit => {
          unit.style.color = textColor;
          unit.style.textShadow = `0 0 ${days <= 7 ? '15px' : '8px'} ${glowColor}`;
          unit.style.transition = "all 0.3s ease";
        });

        // Effet pulse sur le container
        if (days <= 7) {
          heroCountdownEl.style.animation = `stressPulse ${pulseIntensity} ease-in-out infinite`;
        } else {
          heroCountdownEl.style.animation = "none";
        }
      }
    };

    // Ajouter le keyframe pour le pulse si pas déjà présent
    if (!document.getElementById('stress-anim')) {
      const style = document.createElement('style');
      style.id = 'stress-anim';
      style.textContent = `
        @keyframes stressPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
          50% { transform: scale(1.02); box-shadow: 0 25px 50px rgba(0,0,0,0.2); }
        }
        @keyframes urgencyShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
      `;
      document.head.appendChild(style);
    }

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

  // Fonction injectHiddenPitchButton supprimée
});
