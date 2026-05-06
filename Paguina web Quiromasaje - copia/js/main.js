// ========================================
// ARCHIVO: js/main.js
// NAVEGACION Y CONFIGURACION MULTI-PAGINA
// ========================================

const header = document.getElementById('header');
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Activar link actual segun URL
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

// Toggle menu mobile
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
}

// ========================================
// CONSUMO DE APIS EXTERNAS
// ========================================

async function fetchReviews() {
    const reviewsContainer = document.getElementById('reviews-container');
    if (!reviewsContainer) return;

    try {
        let localReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
        const response = await fetch('https://randomuser.me/api/?results=3&nat=es');
        const data = await response.json();
        const apiUsers = data.results;

        const apiReviews = [
            "Excelente trato y profesionalidad. Sali como nuevo de la sesion de quiromasaje.",
            "El Reiki me ayudo muchisimo con mi ansiedad. Fatima transmite una paz increible.",
            "Muy recomendado para deportistas. El masaje de descarga fue perfecto para mi recuperacion."
        ];

        const allReviews = [...localReviews, ...apiUsers.map((user, i) => ({
            name: `${user.name.first} ${user.name.last}`,
            text: apiReviews[i],
            rating: 5,
            image: user.picture.large,
            location: `${user.location.city}, ${user.location.country}`
        }))];

        reviewsContainer.innerHTML = '';
        let html = '';
        allReviews.slice(0, 20).forEach((review, index) => {
            html += `
                <div class="review-card-premium fade-up">
                    <div class="review-header">
                        <img src="${review.image || 'https://via.placeholder.com/60'}" alt="${review.name}" class="review-avatar-img">
                        <div class="review-meta">
                            <h4>${review.name}</h4>
                            <div class="review-stars">⭐⭐⭐⭐⭐</div>
                            <small class="review-location">Enviado desde: ${review.location || 'Espana'}</small>
                        </div>
                    </div>
                    <p class="review-text">"${review.text}"</p>
                </div>
            `;
        });
        reviewsContainer.innerHTML = html;
        setTimeout(() => { reviewsContainer.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible')); }, 100);
    } catch (error) { console.error('Error:', error); }
}

async function fetchWellnessTip() {
    const tipContainer = document.getElementById('wellness-tip');
    if (!tipContainer) return;
    try {
        const response = await fetch('data/tips.json');
        const tips = await response.json();
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        const dailyTip = tips[dayOfYear % tips.length].tip;
        tipContainer.innerHTML = `
            <div class="tip-box fade-up">
                <p class="tip-text"><strong>Consejo de Bienestar:</strong> ${dailyTip}</p>
            </div>
        `;
        setTimeout(() => { const box = tipContainer.querySelector('.tip-box'); if (box) box.classList.add('visible'); }, 100);
    } catch (error) { console.error('Error:', error); }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchReviews();
    fetchWellnessTip();
    updateFatimaAge();
});

function selectService(serviceKey) {
    window.location.href = serviceKey ? `reservar.html?servicio=${serviceKey}` : 'reservar.html';
}

// ========================================
// SISTEMA DE RESERVAS (MENSAJE LIMPIO)
// ========================================

const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    const fechaInput = document.getElementById('fecha');
    const hoy = new Date();
    fechaInput.min = hoy.toISOString().split('T')[0];

    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('servicio');
    const serviceSelect = document.getElementById('servicio');

    if (serviceParam && serviceSelect) {
        const serviceMap = {
            'relax': 'Masaje Relajante - 60min - 35€',
            'terapeutico': 'Masaje Terapeutico - 75min - 45€',
            'deportivo': 'Masaje Deportivo - 60min - 40€',
            'express': 'Masaje Express - 30min - 25€',
            'reiki': 'Sesion de Reiki - 60min - 30€',
            'pack': 'Quiromasaje + Reiki - 90min - 55€'
        };
        if (serviceMap[serviceParam]) serviceSelect.value = serviceMap[serviceParam];
    }

    bookingForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value;
        const servicio = document.getElementById('servicio').value;
        const fecha = document.getElementById('fecha').value;
        const hora = document.getElementById('hora').value;
        
        // MENSAJE 100% LIMPIO SIN EMOTICONOS
        const mensaje = `NUEVA RESERVA - Las Manos de Fatima\n\nCliente: ${nombre}\nServicio: ${servicio}\nFecha: ${fecha}\nHora: ${hora}\n\nEnviado desde la web`;
        const urlWhatsApp = `https://wa.me/34637805557?text=${encodeURIComponent(mensaje)}`;
        
        window.open(urlWhatsApp, '_blank');

        const SUPABASE_URL = 'https://hnldgzockufiknivvfaa.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhubGRnem9ja3VmaWtuaXZ2ZmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzkzMjIsImV4cCI6MjA5MzY1NTMyMn0.s8X1YX9qfeJXLD6PUVJkKoobgnpf_5A098JZQE7Feqk';
        const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

        if (supabase) {
            try {
                await supabase.from('citas').insert([{ nombre, servicio, fecha, hora, estado: 'Pendiente' }]);
            } catch (err) { console.error('Error Supabase:', err); }
        }

        const nuevaCita = { id: Date.now(), nombre, servicio, fecha, hora, estado: 'Pendiente' };
        const citasLocal = JSON.parse(localStorage.getItem('citas_manos_fatima')) || [];
        citasLocal.unshift(nuevaCita);
        localStorage.setItem('citas_manos_fatima', JSON.stringify(citasLocal));

        setTimeout(() => { window.location.href = 'gracias.html'; }, 400);
    });
}

// ========================================
// MODO NOCHE / DARK MODE
// ========================================

const themeToggle = document.getElementById('theme-toggle');
const bodyEl = document.documentElement;

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
    const icon = document.querySelector('.theme-icon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function updateFatimaAge() {
    const ageElement = document.getElementById('fatima-age');
    if (!ageElement) return;
    const birthDate = new Date(1969, 3, 22);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age--;
    ageElement.textContent = age;
}
