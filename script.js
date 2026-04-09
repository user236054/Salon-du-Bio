
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

   
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}


function startCountdown() {
   
    const salonDate = new Date('April 15, 2026 08:00:00').getTime();

    const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = salonDate - now;

        if (distance < 0) {
            clearInterval(timer);
            document.getElementById('days').innerText = '00';
            document.getElementById('hours').innerText = '00';
            document.getElementById('minutes').innerText = '00';
            document.getElementById('seconds').innerText = '00';
            document.querySelector('.countdown').innerHTML = '<h3 style="color: #2D5016; text-align: center;">🎉 Le salon a commencé!</h3>';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
   document.getElementById('days').innerText = String(days).padStart(2, '0');
        document.getElementById('hours').innerText = String(hours).padStart(2, '0');
        document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
        document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
    }, 1000);
}

const sibio2022Images = [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVrGZ0517pUy7Zd9W5-6X27MxHdZo2smRubQ&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQybuT5dDG1ZgUorNPMR9Xnpan-J6ky4LPUYg&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTs56TAIvWHxHy1txlFG4ZJluadCUnxQEc1Jw&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRf2IcxndKG3qfMqQrA1iS5QGEd8qQHKd_chg&s'
];
const sibio2022ImagesPerPage = 3;
let sibio2022Page = 0;

function renderGallery2022Page() {
    const galleryImages = document.getElementById('gallery2022-images');
    const prevButton = document.getElementById('gallery2022-prev');
    const nextButton = document.getElementById('gallery2022-next');

    if (!galleryImages || !prevButton || !nextButton) return;

    const start = sibio2022Page * sibio2022ImagesPerPage;
    const pageImages = sibio2022Images.slice(start, start + sibio2022ImagesPerPage);

    galleryImages.innerHTML = pageImages.map((src, index) => {
        return `<img src="${src}" alt="Image SIBIO 2022 ${start + index + 1}">`;
    }).join('');

    const images = galleryImages.querySelectorAll('img');
    images.forEach(img => {
        img.classList.remove('loaded');
        img.onload = () => img.classList.add('loaded');
        if (img.complete) {
            img.classList.add('loaded');
        }
    });

    prevButton.style.display = sibio2022Page === 0 ? 'none' : 'inline-block';
    nextButton.style.display = (start + pageImages.length) >= sibio2022Images.length ? 'none' : 'inline-block';
}

function toggleGallery2022() {
    const gallery = document.getElementById('gallery2022');
    if (!gallery) return;

    if (gallery.style.display === 'block') {
        gallery.style.display = 'none';
    } else {
        sibio2022Page = 0;
        renderGallery2022Page();
        gallery.style.display = 'block';
    }
}

function gallery2022Next() {
    if ((sibio2022Page + 1) * sibio2022ImagesPerPage < sibio2022Images.length) {
        sibio2022Page += 1;
        renderGallery2022Page();
    }
}

function gallery2022Prev() {
    if (sibio2022Page > 0) {
        sibio2022Page -= 1;
        renderGallery2022Page();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startCountdown);
} else {
    startCountdown();
}

document.addEventListener('DOMContentLoaded', () => {
    const qrContainer = document.getElementById('qrcode');
    new QRCode(qrContainer, {
        text: "https://salon-bio.ci/reservation", 
        width: 200,
        height: 200,
        colorDark: '#2D5016',
        colorLight: '#FFFBF5',
        correctLevel: QRCode.CorrectLevel.H
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const qrInput = document.getElementById('qrInput');
    if (qrInput) {
        qrInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                generateQR();
            }
        });
    }
});

function handleContactSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const message = form.querySelector('textarea').value;
    if (!name || !email || !message) {
        alert('Veuillez remplir tous les champs');
        return;
    }

    console.log('Message envoyé:', { name, email, message });

    alert(`Merci ${name}! Votre message a été envoyé avec succès.\nNous vous répondrons à ${email} dès que possible.`);
    form.reset();
}

function handleExposantSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const nom = form.querySelector('input[name="nom"]').value.trim();
    const prenom = form.querySelector('input[name="prenom"]').value.trim();
    const telephone = form.querySelector('input[name="telephone"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const motdepasse = form.querySelector('input[name="motdepasse"]').value;
    const stand = form.querySelector('input[name="stand"]').value.trim();

    if (!nom || !prenom || !telephone || !email || !motdepasse || !stand) {
        alert('Tous les champs sont obligatoires pour devenir exposant.');
        return;
    }

    if (motdepasse.length < 8) {
        alert('Le mot de passe doit comporter au moins 8 caractères.');
        return;
    }

    // Simulation pour l'enregistrement et le paiement 
    const token = Math.random().toString(36).substring(2, 10).toUpperCase();
    const reservationCode = `${stand.toUpperCase()}-${token}`;
    const qrText = `https://salon-bio.ci/exposant/${encodeURIComponent(reservationCode)}`;

    const qrContainer = document.getElementById('qrExposant');
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
        text: qrText,
        width: 200,
        height: 200,
        colorDark: '#2D5016',
        colorLight: '#FFFBF5',
        correctLevel: QRCode.CorrectLevel.H
    });

    const successMessage = document.createElement('p');
    successMessage.style.marginTop = '15px';
    successMessage.style.color = '#4CAF50';
    successMessage.style.fontWeight = 'bold';
    successMessage.style.textAlign = 'center';
    successMessage.innerText = `Réservation stand confirmée: ${reservationCode}. Vous avez payé 10 000 FCFA.`;
    qrContainer.appendChild(successMessage);

    console.log('Nouveau exposant:', { nom, prenom, telephone, email, stand, reservationCode });
    alert(`Merci ${prenom}! Stand ${stand} réservé avec succès. QR code généré.`);
    form.reset();
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.programme-card, .exposant-card, .infos-card, .faq-item, .info-box').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

function copyEmail(email) {
    navigator.clipboard.writeText(email);
    alert('Email copié: ' + email);
}

function copyLink(link) {
    navigator.clipboard.writeText(link);
    alert('Lien copié!');
}
console.log('✓ Script Salon du Bio chargé avec succès');
console.log('Fonctionnalités: Countdown timer, QR Code generator, Mobile menu, Smooth scroll');





const data = {
        abidjan: [
          {
            t: "Cacao urbain",
            d: "Production locale premium",
            p: "Produit très recherché sur le marché international.",
          },
          {
            t: "Légumes bio",
            d: "Culture sans pesticides",
            p: "Idéal pour une alimentation saine.",
          },
          {
            t: "Transformation agro",
            d: "Produits finis locaux",
            p: "Valorisation de l’économie locale.",
          },
        ],
        bafing: [
          {
            t: "Ignames bio",
            d: "Culture traditionnelle",
            p: "Riche en énergie naturelle.",
          },
          { t: "Miel pur", d: "Apiculture locale", p: "Renforce l’immunité." },
          {
            t: "Maïs",
            d: "Production vivrière",
            p: "Base alimentaire essentielle.",
          },
        ],
        bas_sassandra: [
          {
            t: "Huile de palme",
            d: "Extraction naturelle",
            p: "Très utilisée en cuisine.",
          },
          {
            t: "Cacao",
            d: "Culture export",
            p: "Produit stratégique ivoirien.",
            img: "https://images.rtl.fr/~c/2000v2000/rtl/www/1294836-des-fruits-et-legumes-bio-illustration.jpg",
          },
          { t: "Poisson", d: "Pêche locale", p: "Fraîcheur garantie." },
        ],
        denguele: [
          { t: "Mil", d: "Céréale sèche", p: "Résistant au climat." },
          {
            t: "Coton",
            d: "Culture industrielle",
            p: "Source de revenus importante.",
          },
          { t: "Karité", d: "Produit naturel", p: "Utilisé en cosmétique." },
        ],
        goh: [
          { t: "Café", d: "Production locale", p: "Saveur riche et exportée." },
          { t: "Banane", d: "Culture fruitière", p: "Énergie naturelle." },
          { t: "Manioc", d: "Aliment de base", p: "Très consommé localement." },
        ],
        gbeke: [
          { t: "Ananas", d: "Culture fruitière", p: "Très sucré et exporté." },
          { t: "Riz", d: "Production locale", p: "Alimentation quotidienne." },
          { t: "Maïs", d: "Culture vivrière", p: "Base alimentaire." },
        ],
        grands_ponts: [
          {
            t: "Palmier à huile",
            d: "Culture industrielle",
            p: "Fort potentiel économique.",
          },
          { t: "Manioc", d: "Culture vivrière", p: "Très consommé." },
          { t: "Poisson", d: "Pêche artisanale", p: "Produit frais local." },
        ],
        guemon: [
          {
            t: "Cacao",
            d: "Culture principale",
            p: "Produit d’exportation clé.",
          },
          { t: "Café", d: "Production locale", p: "Très apprécié." },
          { t: "Riz", d: "Culture vivrière", p: "Base alimentaire." },
        ],
        hambol: [
          { t: "Maïs", d: "Culture céréalière", p: "Alimentation de base." },
          { t: "Igname", d: "Tubercule local", p: "Très nutritif." },
          { t: "Coton", d: "Culture industrielle", p: "Revenu agricole." },
        ],
        iffou: [
          {
            t: "Manioc",
            d: "Culture vivrière",
            p: "Très consommé localement.",
          },
          { t: "Maïs", d: "Céréale locale", p: "Alimentation essentielle." },
          { t: "Ananas", d: "Fruit tropical", p: "Très sucré." },
        ],
        indenie: [
          { t: "Cacao", d: "Culture dominante", p: "Produit d’exportation." },
          { t: "Café", d: "Culture locale", p: "Très recherché." },
          { t: "Banane", d: "Fruit tropical", p: "Énergie naturelle." },
        ],
        kabadougou: [
          { t: "Mil", d: "Céréale résistante", p: "Adapté au climat sec." },
          { t: "Coton", d: "Culture industrielle", p: "Source de revenus." },
          { t: "Karité", d: "Produit naturel", p: "Cosmétique bio." },
        ],
        la_me: [
          { t: "Manioc", d: "Culture vivrière", p: "Base alimentaire." },
          { t: "Palmier", d: "Culture industrielle", p: "Production d’huile." },
          { t: "Banane", d: "Fruit local", p: "Très consommé." },
        ],
        lagunes: [
          { t: "Poisson", d: "Pêche lagunaire", p: "Très frais." },
          { t: "Riz", d: "Culture locale", p: "Alimentation quotidienne." },
          { t: "Légumes", d: "Agriculture urbaine", p: "Bio et sain." },
        ],
        marahoue: [
          { t: "Cacao", d: "Culture principale", p: "Export important." },
          { t: "Cola", d: "Produit local", p: "Traditionnel." },
          { t: "Ignames", d: "Tubercules", p: "Très nutritif." },
        ],
        moronou: [
          { t: "Manioc", d: "Culture locale", p: "Aliment de base." },
          { t: "Ananas", d: "Fruit tropical", p: "Très sucré." },
          { t: "Maïs", d: "Céréale", p: "Très consommée." },
        ],
        nawa: [
          { t: "Cacao", d: "Culture dominante", p: "Export majeur." },
          { t: "Hévéa", d: "Caoutchouc", p: "Industrie importante." },
          { t: "Riz", d: "Culture locale", p: "Alimentation." },
        ],
        poro: [
          { t: "Mil", d: "Céréale sèche", p: "Très résistant." },
          { t: "Coton", d: "Culture industrielle", p: "Revenus agricoles." },
          { t: "Maïs", d: "Culture vivrière", p: "Base alimentaire." },
        ],
        san_pedro: [
          { t: "Cacao", d: "Export portuaire", p: "Très stratégique." },
          { t: "Poisson", d: "Pêche maritime", p: "Produit frais." },
          { t: "Palmier", d: "Huile végétale", p: "Très utilisé." },
        ],
        sud_comoe: [
          { t: "Ananas", d: "Culture fruitière", p: "Très exporté." },
          { t: "Cacao", d: "Culture locale", p: "Très rentable." },
          { t: "Palmier", d: "Huile naturelle", p: "Industrie locale." },
        ],
        tchologo: [
          { t: "Coton", d: "Culture industrielle", p: "Très important." },
          { t: "Mil", d: "Céréale", p: "Résistant." },
          { t: "Maïs", d: "Culture locale", p: "Alimentation." },
        ],
        tonkpi: [
          { t: "Café", d: "Culture d’altitude", p: "Très aromatique." },
          { t: "Cacao", d: "Culture locale", p: "Export clé." },
          { t: "Riz", d: "Culture vivrière", p: "Base alimentaire." },
        ],
        worodougou: [
          { t: "Coton", d: "Culture industrielle", p: "Revenus agricoles." },
          { t: "Mil", d: "Céréale", p: "Très résistant." },
          { t: "Maïs", d: "Culture locale", p: "Alimentation." },
        ],
        zanzan: [
          { t: "Igname", d: "Tubercule", p: "Très nourrissant." },
          { t: "Coton", d: "Culture industrielle", p: "Export." },
          { t: "Maïs", d: "Céréale", p: "Base alimentaire." },
        ],
        gbokle: [
          { t: "Poisson", d: "Pêche locale", p: "Très frais." },
          { t: "Manioc", d: "Culture vivrière", p: "Très consommé." },
          { t: "Palmier", d: "Huile", p: "Industrie locale." },
        ],
        loh_djiboua: [
          { t: "Cacao", d: "Culture locale", p: "Export important." },
          { t: "Riz", d: "Culture vivrière", p: "Base alimentaire." },
          { t: "Manioc", d: "Culture locale", p: "Très consommé." },
        ],
        bere: [
          { t: "Coton", d: "Culture industrielle", p: "Revenus agricoles." },
          { t: "Mil", d: "Céréale", p: "Résistant." },
          { t: "Maïs", d: "Culture locale", p: "Alimentation." },
        ],
        folon: [
          { t: "Karité", d: "Produit naturel", p: "Cosmétique bio." },
          { t: "Mil", d: "Céréale", p: "Très résistant." },
          { t: "Coton", d: "Culture industrielle", p: "Export." },
        ],
        belier: [
          { t: "Igname", d: "Tubercule", p: "Très nutritif." },
          { t: "Maïs", d: "Céréale", p: "Alimentation." },
          { t: "Riz", d: "Culture locale", p: "Base alimentaire." },
        ],
        yacoli: [
          { t: "Riz", d: "Culture présidentielle", p: "Zone stratégique." },
          { t: "Poisson", d: "Production locale", p: "Très frais." },
          { t: "Légumes", d: "Agriculture urbaine", p: "Bio et sain." },
        ],
      };

      const grid = document.getElementById("exposantsGrid");
      const currentRegionBtn = document.getElementById("currentRegion");

      function setActive(region) {
        document.querySelectorAll(".region-item").forEach((item) => {
          item.classList.toggle("active", item.dataset.region === region);
        });
      }

      /* render avec animation */
      function render(region, save = true) {
        /* fade out */
        grid.classList.add("fade-out");

        setTimeout(() => {
          grid.innerHTML = "";

          const items = data[region] || [];

          items.forEach((item) => {
            const card = document.createElement("div");
            card.className = "exposant-card";
            card.innerHTML = `
        <img src="${item.img || "https://via.placeholder.com/150?text=Produit"}" alt="${item.t}">
        <h4>${item.t}</h4>
        <p>${item.d}</p>
        <p class="promo">${item.p}</p>
      `;
            grid.appendChild(card);
          });

          /* update navbar label avec 📍 */
          currentRegionBtn.textContent = "📍 " + region + " ▾";

          /* fade in */
          grid.classList.remove("fade-out");
        }, 200);

        if (save) {
          localStorage.setItem("region", region);
        }
      }

      /* click régions */
      document.querySelectorAll(".region-item").forEach((el) => {
        el.addEventListener("click", (e) => {
          e.preventDefault();

          const region = el.dataset.region;

          setActive(region);
          render(region);

          document.querySelector(".dropdown").classList.remove("active");
        });
      });

      /* load saved region */
      window.addEventListener("DOMContentLoaded", () => {
        const saved = localStorage.getItem("region") || "abidjan";

        setActive(saved);
        render(saved, false);
      });

      /* dropdown logic */
      const dropdowns = document.querySelectorAll(".dropdown");

      dropdowns.forEach((d) => {
        let timeoutId;
        let isLocked = false;

        const navLink = d.querySelector(".nav-link");

        // Hover pour ouvrir
        d.addEventListener("mouseenter", () => {
          if (!isLocked) {
            clearTimeout(timeoutId);
            dropdowns.forEach((x) => {
              x.classList.remove("active");
              x.isLocked = false; // Déverrouille les autres
            });
            d.classList.add("active");
          }
        });

        // Hover pour fermer avec délai
        d.addEventListener("mouseleave", () => {
          if (!isLocked) {
            timeoutId = setTimeout(() => {
              d.classList.remove("active");
            }, 200);
          }
        });

        // Clic pour verrouiller/ouvrir
        navLink.addEventListener("click", (e) => {
          e.preventDefault();
          isLocked = !isLocked;
          if (isLocked) {
            dropdowns.forEach((x) => {
              x.classList.remove("active");
              x.isLocked = false;
            });
            d.classList.add("active");
            d.isLocked = true;
          } else {
            d.classList.remove("active");
          }
        });
      });

      // Clic ailleurs pour fermer et déverrouiller
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".dropdown")) {
          dropdowns.forEach((d) => {
            d.classList.remove("active");
            d.isLocked = false;
          });
        }
      });