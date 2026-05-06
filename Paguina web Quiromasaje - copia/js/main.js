// ========================================
// ARCHIVO: js/main.js
// NAVEGACIÓN Y CONFIGURACIÓN MULTI-PÁGINA
// ========================================

const header = document.getElementById('header');
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Activar link actual según URL
const currentPath = window.location.pathname.split('/').pop() || 'index.html';
navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
    } else {
        link.classList.remove('active');
    }
});

// Efecto scroll en header
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 50) {
        header.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
        header.style.padding = '5px 0';
    } else {
        header.style.boxShadow = '0 1px 0 rgba(0,0,0,0.05)';
        header.style.padding = '15px 0';
    }
});

// Toggle menú mobile
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
}

// ========================================
// CONSUMO DE APIS EXTERNAS
// ========================================

/**
 * FETCH REVIEWS: Consume randomuser.me para simular testimonios reales
 */
async function fetchReviews() {
    const reviewsContainer = document.getElementById('reviews-container');
    if (!reviewsContainer) return;

    try {
        let localReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
        
        const response = await fetch('https://randomuser.me/api/?results=3&nat=es');
        const data = await response.json();
        const apiUsers = data.results;

        const apiReviews = [
            "Excelente trato y profesionalidad. Salí como nuevo de la sesión de quiromasaje.",
            "El Reiki me ayudó muchísimo con mi ansiedad. Fátima transmite una paz increíble.",
            "Muy recomendado para deportistas. El masaje de descarga fue perfecto para mi recuperación."
        ];

        const allReviews = [...localReviews, ...apiUsers.map((user, i) => ({
            name: `${user.name.first} ${user.name.last}`,
            text: apiReviews[i],
            rating: 5,
            image: user.picture.large,
            location: `${user.location.city}, España`
        }))];

        reviewsContainer.innerHTML = '';
        let html = '';
        allReviews.slice(0, 20).forEach((review, index) => {
            // Usamos Unicode para evitar errores de encoding
            const stars = "\u2B50".repeat(review.rating);
            html += `
                <div class="review-card-premium fade-up" style="transition-delay: ${index * 0.1}s">
                    ${review.id ? `<button class="delete-review" onclick="deleteReview('${review.id}', event)" title="Eliminar reseña">\uD83D\uDDD1\uFE0F</button>` : ''}
                    <div class="review-header">
                        <img src="${review.image || 'https://via.placeholder.com/60'}" alt="${review.name}" class="review-avatar-img">
                        <div class="review-meta">
                            <h4>${review.name}</h4>
                            <div class="review-stars">${stars}</div>
                            <small class="review-location">\uD83D\uDCCD Enviado desde: ${review.location || 'España'}</small>
                        </div>
                    </div>
                    <p class="review-text">"${review.text}"</p>
                </div>
            `;
        });
        reviewsContainer.innerHTML = html;
        setTimeout(() => {
            reviewsContainer.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
        }, 100);

    } catch (error) {
        console.error('Error cargando reseñas:', error);
        reviewsContainer.innerHTML = '<p>Error al cargar testimonios.</p>';
    }
}

// Lógica del modal de reseñas
const reviewModal = document.getElementById('reviewModal');
const openReviewBtn = document.getElementById('openReviewBtn');
const closeBtn = document.querySelector('.close-modal');
const newReviewForm = document.getElementById('newReviewForm');

if (openReviewBtn) { openReviewBtn.onclick = () => reviewModal.style.display = "block"; }
if (closeBtn) { closeBtn.onclick = () => reviewModal.style.display = "none"; }
window.onclick = (event) => { if (event.target == reviewModal) reviewModal.style.display = "none"; }

if (newReviewForm) {
    newReviewForm.onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('revName').value;
        const rating = parseInt(document.getElementById('revRating').value);
        const text = document.getElementById('revText').value;
        
        const newReview = {
            id: 'rev-' + Date.now(),
            name,
            rating,
            text,
            image: null,
            location: "Jerez, España"
        };

        const localReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
        localReviews.unshift(newReview);
        localStorage.setItem('userReviews', JSON.stringify(localReviews));

        newReviewForm.reset();
        reviewModal.style.display = "none";
        fetchReviews();
    };
}

function deleteReview(id, event) {
    event.stopPropagation();
    if (!confirm('¿Seguro que quieres borrar esta reseña?')) return;
    let localReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
    localReviews = localReviews.filter(rev => rev.id !== id);
    localStorage.setItem('userReviews', JSON.stringify(localReviews));
    fetchReviews();
}

// ========================================
// FORMULARIO DE RESERVA
// ========================================

const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const telefono = document.getElementById('telefono').value;
        const servicio = document.getElementById('servicio').value;
        const fecha = document.getElementById('fecha').value;
        const hora = document.getElementById('hora').value;
        const mensaje = document.getElementById('mensaje').value;

        // Formatear mensaje para WhatsApp (Sin Emojis)
        const msg = `NUEVA RESERVA - Las Manos de Fatima\n\nCliente: ${nombre}\nEmail: ${email}\nTel: ${telefono}\nServicio: ${servicio}\nFecha: ${fecha}\nHora: ${hora}\nMensaje: ${mensaje}`;
        const urlWhatsApp = `https://wa.me/34637805557?text=${encodeURIComponent(msg)}`;

        // Abrir WhatsApp inmediatamente
        window.open(urlWhatsApp, '_blank');

        // Guardar en Supabase (Background)
        const nuevaCita = {
            nombre, email, telefono, servicio, fecha, hora, mensaje,
            estado: 'Pendiente',
            created_at: new Date().toISOString()
        };

        if (window.supabase) {
            const S_URL = 'https://hnldgzockufiknivvfaa.supabase.co';
            const S_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhubGRnem9ja3VmaWtuaXZ2ZmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzkzMjIsImV4cCI6MjA5MzY1NTMyMn0.s8X1YX9qfeJXLD6PUVJkKoobgnpf_5A098JZQE7Feqk';
            const sup = window.supabase.createClient(S_URL, S_KEY);
            await sup.from('citas').insert([nuevaCita]);
        }

        // Local backup
        let citasLocal = JSON.parse(localStorage.getItem('citas_manos_fatima')) || [];
        citasLocal.unshift(nuevaCita);
        localStorage.setItem('citas_manos_fatima', JSON.stringify(citasLocal));

        setTimeout(() => { window.location.href = 'gracias.html'; }, 400);
    });
}

// Animaciones Scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card-premium, .about-content, .contact-card-premium').forEach(el => {
    el.classList.add('fade-up');
    observer.observe(el);
});

// FAQ Accordion
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', function() {
        const faqItem = this.parentElement;
        document.querySelectorAll('.faq-item').forEach(item => {
            if (item !== faqItem) item.classList.remove('active');
        });
        faqItem.classList.toggle('active');
    });
});

// Música
const musicToggle = document.getElementById('musicToggle');
if (musicToggle) {
    const bgMusic = document.getElementById('bgMusic');
    musicToggle.addEventListener('click', () => {
        if (bgMusic.paused) { bgMusic.play(); musicToggle.classList.add('playing'); }
        else { bgMusic.pause(); musicToggle.classList.remove('playing'); }
    });
}

// ========================================
// MODO NOCHE / DARK MODE (REVISADO)
// ========================================

const themeToggle = document.getElementById('theme-toggle');
const bodyEl = document.documentElement;
const themeIcon = document.getElementById('theme-icon');

const updateThemeIcon = (theme) => {
    if (themeIcon) {
        // Usamos Unicode para evitar errores de encoding
        themeIcon.textContent = (theme === 'dark') ? "\u2600\uFE0F" : "\uD83C\uDF19";
    }
};

const currentTheme = localStorage.getItem('theme') || 'light';
bodyEl.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const theme = bodyEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        bodyEl.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateThemeIcon(theme);
    });
}

// Iniciar carga de reseñas
document.addEventListener('DOMContentLoaded', fetchReviews);
