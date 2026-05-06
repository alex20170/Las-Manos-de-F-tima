// ========================================
// ARCHIVO: js/main.js
// NAVEGACIÃ“N Y CONFIGURACIÃ“N MULTI-PÃGINA
// ========================================

const header = document.getElementById('header');
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Activar link actual segÃºn URL
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

// Toggle menÃº mobile
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
        // 1. Obtener reseÃ±as locales de localStorage
        let localReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
        
        // MigraciÃ³n: asegurar que todas tengan ID
        let updated = false;
        localReviews = localReviews.map(rev => {
            if (!rev.id) {
                rev.id = 'rev-' + Math.random().toString(36).substr(2, 9);
                updated = true;
            }
            return rev;
        });
        if (updated) {
            console.log('MigraciÃ³n de IDs completada para localReviews');
            localStorage.setItem('userReviews', JSON.stringify(localReviews));
        }

        // 2. Obtener reseÃ±as de la API para completar el grid
        const response = await fetch('https://randomuser.me/api/?results=3&nat=es');
        const data = await response.json();
        const apiUsers = data.results;

        const apiReviews = [
            "Excelente trato y profesionalidad. SalÃ­ como nuevo de la sesiÃ³n de quiromasaje.",
            "El Reiki me ayudÃ³ muchÃ­simo con mi ansiedad. FÃ¡tima transmite una paz increÃ­ble.",
            "Muy recomendado para deportistas. El masaje de descarga fue perfecto para mi recuperaciÃ³n."
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
        
        // Mostrar hasta 20 reseÃ±as en el grid
        let html = '';
        allReviews.slice(0, 20).forEach((review, index) => {
            const stars = 'â­'.repeat(review.rating);
            html += `
                <div class="review-card-premium fade-up" style="transition-delay: ${index * 0.1}s">
                    ${review.id ? `<button class="delete-review" onclick="deleteReview('${review.id}', event)" title="Eliminar reseÃ±a">ðŸ—‘ï¸</button>` : ''}
                    <div class="review-header">
                        <img src="${review.image || 'https://via.placeholder.com/60'}" alt="${review.name}" class="review-avatar-img">
                        <div class="review-meta">
                            <h4>${review.name}</h4>
                            <div class="review-stars">${stars}</div>
                            <small class="review-location">ðŸ“ Enviado desde: ${review.location || 'EspaÃ±a'}</small>
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
        console.error('Error cargando reseÃ±as:', error);
        reviewsContainer.innerHTML = '<p>Error al cargar testimonios.</p>';
    }
}

// LÃ“GICA DEL MODAL DE RESEÃ‘AS
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

        // Intentar obtener ubicaciÃ³n por IP
        let location = "Jerez, EspaÃ±a";
        try {
            const locRes = await fetch('https://ipapi.co/json/');
            const locData = await locRes.json();
            if (locData.city) location = `${locData.city}, ${locData.country_name}`;
        } catch (err) { console.log("No se pudo obtener ubicaciÃ³n"); }

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
        localReviews.unshift(newReview); // AÃ±adir al principio
        localStorage.setItem('userReviews', JSON.stringify(localReviews));

        reviewModal.style.display = "none";
        newReviewForm.reset();
        fetchReviews(); // Recargar el grid
        alert("Â¡Gracias por tu reseÃ±a! Se ha publicado correctamente.");
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
        
        // LÃ“GICA PARA QUE CAMBIE CADA DÃA (USANDO EL DÃA DEL AÃ‘O)
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        
        // Seleccionamos el consejo basado en el dÃ­a (ciclo de 30 dÃ­as)
        const dailyTip = tips[dayOfYear % tips.length].tip;

        tipContainer.innerHTML = `
            <div class="tip-box fade-up">
                <span class="tip-icon">âœ¨</span>
                <p class="tip-text"><strong>Consejo de Bienestar:</strong> ${dailyTip}</p>
            </div>
        `;
        
        // Activar animaciÃ³n
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

// FunciÃ³n para seleccionar servicio desde la home y redirigir
function selectService(serviceKey) {
    if (serviceKey) {
        window.location.href = `reservar.html?servicio=${serviceKey}`;
    } else {
        window.location.href = 'reservar.html';
    }
}

// FunciÃ³n para eliminar reseÃ±a
function deleteReview(id, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    if (confirm('Â¿Seguro que quieres borrar esta reseÃ±a?')) {
        try {
            let localReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
            const before = localReviews.length;
            
            // Usamos != para evitar problemas de tipo string/number
            localReviews = localReviews.filter(rev => rev.id != id);
            
            if (localReviews.length < before) {
                localStorage.setItem('userReviews', JSON.stringify(localReviews));
                console.log('ReseÃ±a eliminada. Recargando...');
                fetchReviews();
            } else {
                alert('No se pudo encontrar la reseÃ±a para borrar.');
            }
        } catch (e) {
            console.error('Error al borrar:', e);
            alert('Hubo un error al intentar borrar la reseÃ±a.');
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
    // Configurar fechas mÃ­nimas y mÃ¡ximas
    const fechaInput = document.getElementById('fecha');
    const hoy = new Date();
    fechaInput.min = hoy.toISOString().split('T')[0];

    // AUTO-SELECCIONAR SERVICIO DESDE URL
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('servicio');
    const serviceSelect = document.getElementById('servicio');

    if (serviceParam && serviceSelect) {
        const serviceMap = {
            'relax': 'Masaje Relajante - 60min - 35â‚¬',
            'terapeutico': 'Masaje TerapÃ©utico - 75min - 45â‚¬',
            'deportivo': 'Masaje Deportivo - 60min - 40â‚¬',
            'express': 'Masaje Express - 30min - 25â‚¬',
            'reiki': 'SesiÃ³n de Reiki - 60min - 30â‚¬',
            'combinado': 'Quiromasaje + Reiki - 90min - 55â‚¬'
        };
        
        if (serviceMap[serviceParam]) {
            serviceSelect.value = serviceMap[serviceParam];
            // Efecto visual de selecciÃ³n
            serviceSelect.style.borderColor = 'var(--color-primary)';
            serviceSelect.style.backgroundColor = '#f0f7f0';
        }
    }

    bookingForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Procesando...';
        
        const nombre = document.getElementById('nombre').value;
        const servicio = document.getElementById('servicio').value;
        const fecha = document.getElementById('fecha').value;
        const hora = document.getElementById('hora').value;
        
        const mensaje = `ðŸŒ¿ *NUEVA RESERVA - Las Manos de FÃ¡tima*\n\nðŸ‘¤ *Cliente:* ${nombre}\nðŸ’† *Servicio:* ${servicio}\nðŸ“… *Fecha:* ${fecha}\nðŸ• *Hora:* ${hora}\n\n_Enviado desde la web_`;
        const urlWhatsApp = `https://wa.me/34637805557?text=${encodeURIComponent(mensaje)}`;

        // ABRIR WHATSAPP INMEDIATAMENTE (antes del await para evitar bloqueo)
        window.open(urlWhatsApp, '_blank');

        // CONFIGURACIÃ“N SUPABASE
        const SUPABASE_URL = 'https://hnldgzockufiknivvfaa.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhubGRnem9ja3VmaWtuaXZ2ZmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzkzMjIsImV4cCI6MjA5MzY1NTMyMn0.s8X1YX9qfeJXLD6PUVJkKoobgnpf_5A098JZQE7Feqk';
        const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

        // GUARDAR EN SUPABASE (Esperar a que termine)
        if (supabase) {
            try {
                await supabase.from('citas').insert([{
                    nombre, servicio, fecha, hora, estado: 'Pendiente'
                }]);
                console.log('Cita guardada en Supabase');
            } catch (err) {
                console.error('Error guardando en la nube:', err);
            }
        }

        // GUARDAR EN LOCAL (Respaldo)
        const nuevaCita = {
            id: Date.now(),
            nombre, servicio, fecha, hora, estado: 'Pendiente',
            timestamp: new Date().toISOString()
        };
        const citasLocal = JSON.parse(localStorage.getItem('citas_manos_fatima')) || [];
        citasLocal.unshift(nuevaCita);
        localStorage.setItem('citas_manos_fatima', JSON.stringify(citasLocal));

        // Redirigir
        setTimeout(() => {
            window.location.href = 'gracias.html';
        }, 400);
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

// BotÃ³n de mÃºsica - Asegurar que funcione en todas las pÃ¡ginas
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
        themeIcon.textContent = theme === 'dark' ? 'â˜€ï¸' : '🌙';
    }
}

// ========================================
// ACTUALIZACIÃ“N AUTOMÃTICA DE EDAD
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

