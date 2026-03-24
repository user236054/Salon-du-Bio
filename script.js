
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
