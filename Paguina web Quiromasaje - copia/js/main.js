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
        // 1. Obtener reseñas locales de localStorage
        let localReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
        
        // Migración: asegurar que todas tengan ID
        let updated = false;
        localReviews = localReviews.map(rev => {
            if (!rev.id) {
                rev.id = 'rev-' + Math.random().toString(36).substr(2, 9);
                updated = true;
            }
            return rev;
        });
        if (updated) {
            console.log('Migración de IDs completada para localReviews');
            localStorage.setItem('userReviews', JSON.stringify(localReviews));
        }

        // 2. Obtener reseñas de la API para completar el grid
        const response = await fetch('https://randomuser.me/api/?results=3&nat=es');
        const data = await response.json();
        const apiUsers = data.results;

        const apiReviews = [
            "Excelente trato y profesionalidad. Salí como nuevo de la sesión de quiromasaje.",
            "El Reiki me ayudó muchísimo con mi ansiedad. Fátima transmite una paz increíble.",
            "Muy recomendado para deportistas. El masaje de descarga fue perfecto para mi recuperación."
        ];

        // Mezclamos locales (primero) y luego API
        const allReviews = [...localReviews, ...apiUsers.map((user, i) => ({
            name: `${user.name.first} ${user.name.last}`,
            text: apiReviews[i],
            rating: 5,
            image: user.picture.large,
            location: `${user.location.city}, ${user.location.country}`
        }))];

        reviewsContainer.innerHTML = '';
        
        // Mostrar hasta 20 reseñas en el grid
        let html = '';
        allReviews.slice(0, 20).forEach((review, index) => {
            const stars = '⭐'.repeat(review.rating);
            html += `
                <div class="review-card-premium fade-up" style="transition-delay: ${index * 0.1}s">
                    ${review.id ? `<button class="delete-review" onclick="deleteReview('${review.id}', event)" title="Eliminar reseña">🗑️</button>` : ''}
                    <div class="review-header">
                        <img src="${review.image || 'https://via.placeholder.com/60'}" alt="${review.name}" class="review-avatar-img">
                        <div class="review-meta">
                            <h4>${review.name}</h4>
                            <div class="review-stars">${stars}</div>
                            <small class="review-location">📍 Enviado desde: ${review.location || 'España'}</small>
                        </div>
                    </div>
                    <p class="review-text">"${review.text}"</p>
                </div>
            `;
        });
        reviewsContainer.innerHTML = html;

        // Activar animaciones
        setTimeout(() => {
            reviewsContainer.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
        }, 100);

    } catch (error) {
        console.error('Error cargando reseñas:', error);
        reviewsContainer.innerHTML = '<p>Error al cargar testimonios.</p>';
    }
}

// LÓGICA DEL MODAL DE RESEÑAS
const reviewModal = document.getElementById('reviewModal');
const openReviewBtn = document.getElementById('openReviewBtn');
const closeBtn = document.querySelector('.close-modal');
const newReviewForm = document.getElementById('newReviewForm');

if (openReviewBtn) {
    openReviewBtn.onclick = () => reviewModal.style.display = "block";
}

if (closeBtn) {
    closeBtn.onclick = () => reviewModal.style.display = "none";
}

window.onclick = (event) => {
    if (event.target == reviewModal) reviewModal.style.display = "none";
}

if (newReviewForm) {
    newReviewForm.onsubmit = async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('revName').value;
        const rating = parseInt(document.getElementById('revRating').value);
        const text = document.getElementById('revText').value;

        // Intentar obtener ubicación por IP
        let location = "Jerez, España";
        try {
            const locRes = await fetch('https://ipapi.co/json/');
            const locData = await locRes.json();
            if (locData.city) location = `${locData.city}, ${locData.country_name}`;
        } catch (err) { console.log("No se pudo obtener ubicación"); }

        const newReview = {
            id: 'rev-' + Date.now(),
            name,
            rating,
            text,
            location,
            image: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y', // Avatar por defecto
            date: new Date().toISOString()
        };

        const localReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
        localReviews.unshift(newReview); // Añadir al principio
        localStorage.setItem('userReviews', JSON.stringify(localReviews));

        reviewModal.style.display = "none";
        newReviewForm.reset();
        fetchReviews(); // Recargar el grid
        alert("¡Gracias por tu reseña! Se ha publicado correctamente.");
    };
}


/**
 * FETCH WELLNESS TIP: Consume Advice Slip API
 */
async function fetchWellnessTip() {
    const tipContainer = document.getElementById('wellness-tip');
    if (!tipContainer) return;

    try {
        // CONSUMIMOS NUESTRA PROPIA "API" INTERNA DE CONSEJOS
        const response = await fetch('data/tips.json');
        const tips = await response.json();
        
        // LÓGICA PARA QUE CAMBIE CADA DÍA (USANDO EL DÍA DEL AÑO)
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        
        // Seleccionamos el consejo basado en el día (ciclo de 30 días)
        const dailyTip = tips[dayOfYear % tips.length].tip;

        tipContainer.innerHTML = `
            <div class="tip-box fade-up">
                <span class="tip-icon">✨</span>
                <p class="tip-text"><strong>Consejo de Bienestar:</strong> ${dailyTip}</p>
            </div>
        `;
        
        // Activar animación
        setTimeout(() => {
            const box = tipContainer.querySelector('.tip-box');
            if (box) box.classList.add('visible');
        }, 100);

    } catch (error) {
        console.error('Error cargando consejo:', error);
    }
}

// Iniciar llamadas a APIs
document.addEventListener('DOMContentLoaded', () => {
    fetchReviews();
    fetchWellnessTip();
});

// Función para seleccionar servicio desde la home y redirigir
function selectService(serviceKey) {
    if (serviceKey) {
        window.location.href = `reservar.html?servicio=${serviceKey}`;
    } else {
        window.location.href = 'reservar.html';
    }
}

// Función para eliminar reseña
function deleteReview(id, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    if (confirm('¿Seguro que quieres borrar esta reseña?')) {
        try {
            let localReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
            const before = localReviews.length;
            
            // Usamos != para evitar problemas de tipo string/number
            localReviews = localReviews.filter(rev => rev.id != id);
            
            if (localReviews.length < before) {
                localStorage.setItem('userReviews', JSON.stringify(localReviews));
                console.log('Reseña eliminada. Recargando...');
                fetchReviews();
            } else {
                alert('No se pudo encontrar la reseña para borrar.');
            }
        } catch (e) {
            console.error('Error al borrar:', e);
            alert('Hubo un error al intentar borrar la reseña.');
        }
    }
}

// Exportar a global para los onclick
window.selectService = selectService;
window.deleteReview = deleteReview;

// ========================================
// SLIDER HERO (Solo si existe)
// ========================================

const slides = document.querySelectorAll('.hero-slide');
const indicators = document.querySelectorAll('.indicator');
let currentSlide = 0;
let slideInterval;

if (slides.length > 0) {
    function changeSlide(slideIndex) {
        slides.forEach(s => s.classList.remove('active'));
        indicators.forEach(i => i.classList.remove('active'));
        slides[slideIndex].classList.add('active');
        indicators[slideIndex].classList.add('active');
        currentSlide = slideIndex;
    }

    function startSlideShow() {
        slideInterval = setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            changeSlide(currentSlide);
        }, 5000);
    }

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            clearInterval(slideInterval);
            changeSlide(index);
            startSlideShow();
        });
    });

    startSlideShow();
}

// ========================================
// SISTEMA DE RESERVAS - ACTUALIZADO
// ========================================

const bookingForm = document.getElementById('bookingForm');

if (bookingForm) {
    // Configurar fechas mínimas y máximas
    const fechaInput = document.getElementById('fecha');
    const hoy = new Date();
    fechaInput.min = hoy.toISOString().split('T')[0];

    // AUTO-SELECCIONAR SERVICIO DESDE URL
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('servicio');
    const serviceSelect = document.getElementById('servicio');

    if (serviceParam && serviceSelect) {
        const serviceMap = {
            'relax': 'Masaje Relajante - 60min - 35€',
            'terapeutico': 'Masaje Terapéutico - 75min - 45€',
            'deportivo': 'Masaje Deportivo - 60min - 40€',
            'express': 'Masaje Express - 30min - 25€',
            'reiki': 'Sesión de Reiki - 60min - 30€',
            'combinado': 'Quiromasaje + Reiki - 90min - 55€'
        };
        
        if (serviceMap[serviceParam]) {
            serviceSelect.value = serviceMap[serviceParam];
            // Efecto visual de selección
            serviceSelect.style.borderColor = 'var(--color-primary)';
            serviceSelect.style.backgroundColor = '#f0f7f0';
        }
    }

    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Procesando...';
        
        const nombre = document.getElementById('nombre').value;
        const servicio = document.getElementById('servicio').value;
        const fecha = document.getElementById('fecha').value;
        const hora = document.getElementById('hora').value;
        
        const mensaje = `🌿 *NUEVA RESERVA - Las Manos de Fátima*\n\n👤 *Cliente:* ${nombre}\n💆 *Servicio:* ${servicio}\n📅 *Fecha:* ${fecha}\n🕐 *Hora:* ${hora}\n\n_Enviado desde la web_`;
        const urlWhatsApp = `https://wa.me/34637805557?text=${encodeURIComponent(mensaje)}`;
        
        // Simular un pequeño delay y redirigir
        setTimeout(() => {
            window.open(urlWhatsApp, '_blank');
            window.location.href = 'gracias.html';
        }, 800);
    });
}

// ========================================
// ANIMACIONES SCROLL
// ========================================

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

// ========================================
// FAQ ACCORDION
// ========================================

const faqQuestions = document.querySelectorAll('.faq-question');
faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
        const faqItem = this.parentElement;
        
        // Cerrar otros si se desea (opcional, lo activamos para mejor UX)
        document.querySelectorAll('.faq-item').forEach(item => {
            if (item !== faqItem) item.classList.remove('active');
        });
        
        faqItem.classList.toggle('active');
    });
});

// Botón de música - Asegurar que funcione en todas las páginas
const musicToggle = document.getElementById('musicToggle');
if (musicToggle) {
    const bgMusic = document.getElementById('bgMusic');
    musicToggle.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play();
            musicToggle.classList.add('playing');
        } else {
            bgMusic.pause();
            musicToggle.classList.remove('playing');
        }
    });
}

// ========================================
// MODO NOCHE / DARK MODE
// ========================================

const themeToggle = document.getElementById('theme-toggle');
const bodyEl = document.documentElement;
const themeIcon = document.querySelector('.theme-icon');

// Cargar tema guardado
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

function updateThemeIcon(theme) {
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// ========================================
// ACTUALIZACIÓN AUTOMÁTICA DE EDAD
// ========================================

function updateFatimaAge() {
    const ageElement = document.getElementById('fatima-age');
    if (!ageElement) return;

    const birthDate = new Date(1969, 3, 22); // 22 de Abril de 1969
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    ageElement.textContent = age;
}

// Ejecutar al cargar
updateFatimaAge();
