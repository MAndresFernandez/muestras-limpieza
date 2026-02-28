// ═══════════════════════════════════════════════════════════
// RED RABBIT GO — App Logic
// ═══════════════════════════════════════════════════════════

let appData = null;
const WA_NUMBER = '5492216924104';

// ── Initialize ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    renderFeaturedCollaborators();
    renderStaffGrid();
    renderTestimonials();
    renderChecklist('basica');
    setupNavbar();
    setupMobileMenu();
    setupTabs();
    setupRecruitmentForm();
    setupLeadPopup();
    setupRatingPopup();
    lucide.createIcons();
});

// ── Data Loading ───────────────────────────────────────────

async function loadData() {
    try {
        // Cache buster to ensure visitors always get the latest version after edits
        const res = await fetch('data.json?t=' + new Date().getTime());
        if (!res.ok) throw new Error('Failed to load data.json');
        appData = await res.json();
    } catch (err) {
        console.warn('Using fallback data:', err);
        appData = {
            empresa: { nombre: "Red Rabbit Go", whatsapp: WA_NUMBER },
            staff: [], testimonios: [],
            checklist: { basica: [], profunda: [] }
        };
    }
}

// ── Featured Collaborators ─────────────────────────────────

function renderFeaturedCollaborators() {
    const grid = document.getElementById('featuredGrid');
    if (!grid || !appData?.staff) return;

    const featured = appData.staff.filter(s => s.destacado);
    if (featured.length === 0) {
        grid.innerHTML = '<p class="text-gray-600 col-span-3 text-center py-8">No hay colaboradores destacados aún.</p>';
        return;
    }

    grid.innerHTML = featured.map(s => `
        <a href="trabajador.html?id=${s.id}" class="staff-card bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 block group">
            <div class="relative">
                <img src="${s.foto}" alt="${s.nombre}" class="w-full h-56 object-cover">
                ${s.verificado ? `<div class="absolute top-3 right-3 verified-badge px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1">
                    <i data-lucide="shield-check" class="w-3 h-3"></i> Verificado
                </div>` : ''}
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div class="flex items-center gap-1">
                        ${Array(5).fill().map((_, i) => `<i data-lucide="star" class="w-4 h-4 ${i < Math.round(s.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-white/40'}"></i>`).join('')}
                        <span class="text-white font-bold ml-2">${(s.rating || 0).toFixed(1)}</span>
                    </div>
                </div>
            </div>
            <div class="p-5">
                <h3 class="text-lg font-bold text-gray-900 group-hover:text-primary-500 transition-colors">${s.nombre}</h3>
                <p class="text-primary-600 font-medium text-sm">${s.puesto}</p>
                <p class="text-gray-600 text-sm mt-1">${s.especialidad || ''}</p>
            </div>
        </a>
    `).join('');
}

// ── Staff Grid (All workers) ───────────────────────────────

function renderStaffGrid() {
    const grid = document.getElementById('staffGrid');
    if (!grid || !appData?.staff) return;

    grid.innerHTML = appData.staff.map(s => `
        <a href="trabajador.html?id=${s.id}" class="staff-card bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 block group">
            <div class="relative">
                <img src="${s.foto}" alt="${s.nombre}" class="w-full h-48 object-cover">
                ${s.verificado ? `<div class="absolute top-3 right-3 verified-badge px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1">
                    <i data-lucide="shield-check" class="w-3 h-3"></i> Verificado
                </div>` : ''}
            </div>
            <div class="p-5">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-bold text-gray-900 group-hover:text-primary-500 transition-colors">${s.nombre}</h3>
                    <div class="flex items-center gap-1">
                        <i data-lucide="star" class="w-4 h-4 text-amber-400 fill-amber-400"></i>
                        <span class="font-semibold text-gray-900">${(s.rating || 0).toFixed(1)}</span>
                    </div>
                </div>
                <p class="text-primary-600 font-medium text-sm">${s.puesto}</p>
                <p class="text-gray-600 text-sm">${s.especialidad || ''}</p>
                <p class="text-xs text-gray-500 mt-2"><i data-lucide="clock" class="w-3 h-3 inline"></i> ${s.experiencia || ''}</p>
            </div>
        </a>
    `).join('');
}

// ── Testimonials ───────────────────────────────────────────

function renderTestimonials() {
    const grid = document.getElementById('testimonialGrid');
    if (!grid || !appData?.testimonios) return;

    grid.innerHTML = appData.testimonios.map(t => `
        <div class="testimonial-card rounded-2xl p-8 border border-gray-100">
            <div class="flex items-center gap-1 mb-4">
                ${Array(5).fill().map((_, i) => `<i data-lucide="star" class="w-4 h-4 ${i < (t.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}"></i>`).join('')}
            </div>
            <p class="text-gray-700 mb-6 italic leading-relaxed">"${t.texto}"</p>
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                    ${t.nombre.charAt(0)}
                </div>
                <div>
                    <p class="font-semibold text-gray-900">${t.nombre}</p>
                    <p class="text-sm text-gray-500">${t.cargo}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// ── Checklist ──────────────────────────────────────────────

function renderChecklist(type) {
    const container = document.getElementById('checklistContainer');
    if (!container || !appData?.checklist) return;

    const items = appData.checklist[type] || [];
    container.innerHTML = `
        <div class="grid md:grid-cols-2 gap-4">
            ${items.map(item => `
                <div class="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div class="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <i data-lucide="check" class="w-4 h-4 text-primary-600"></i>
                    </div>
                    <span class="text-gray-700 font-medium">${item}</span>
                </div>
            `).join('')}
        </div>
    `;
    lucide.createIcons();
}

function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderChecklist(btn.dataset.tab);
        });
    });
}

// ── Sticky Navbar ──────────────────────────────────────────

function setupNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const updateNavbar = () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();
}

// ── Mobile Menu ────────────────────────────────────────────

function setupMobileMenu() {
    const btn = document.getElementById('menuBtn');
    const menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => menu.classList.toggle('hidden'));
    menu.querySelectorAll('a').forEach(link =>
        link.addEventListener('click', () => menu.classList.add('hidden'))
    );
}



// ── Recruitment Form ───────────────────────────────────────

function setupRecruitmentForm() {
    const form = document.getElementById('recruitmentForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Build WhatsApp message
        const msg = `Hola! Quiero sumarme al equipo de Red Rabbit Go.%0A` +
            `Nombre: ${data.nombreCompleto}%0A` +
            `Email: ${data.emailRecruit}%0A` +
            `Teléfono: ${data.telefonoRecruit}%0A` +
            `Experiencia: ${data.experiencia}%0A` +
            `Zona: ${data.zona || 'No especificada'}`;

        window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');

        // Show success feedback
        const btn = form.querySelector('button[type="submit"]');
        const original = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i> ¡Solicitud Enviada!';
        btn.disabled = true;
        setTimeout(() => {
            btn.innerHTML = original;
            btn.disabled = false;
            lucide.createIcons();
        }, 3000);
    });
}

// ── Lead Popup ─────────────────────────────────────────────

function setupLeadPopup() {
    const popup = document.getElementById('leadPopup');
    const form = document.getElementById('leadForm');
    const closeBtn = document.getElementById('closePopup');
    if (!popup || !form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('leadEmail').value;
        console.log('Lead captured:', email);
        popup.classList.add('hidden');
        popup.style.display = 'none';
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            popup.classList.add('hidden');
            popup.style.display = 'none';
        });
    }
}

function showLeadPopup() {
    const popup = document.getElementById('leadPopup');
    if (popup) {
        popup.classList.remove('hidden');
        popup.style.display = 'flex';
    }
}

// ── Rating Popup ───────────────────────────────────────────

function showRatingPopup() {
    const popup = document.getElementById('ratingPopup');
    if (popup) {
        popup.classList.remove('hidden');
        popup.style.display = 'flex';
        // Initial setup for 5 stars
        document.querySelector('.star-btn[data-val="5"]')?.click();
    }
}

function closeRatingPopup() {
    const popup = document.getElementById('ratingPopup');
    if (popup) {
        popup.classList.add('hidden');
        popup.style.display = 'none';
    }
}

function setupRatingPopup() {
    const form = document.getElementById('ratingForm');
    if (!form) return;

    // Initialize stars logic
    const starBtns = document.querySelectorAll('.star-btn');
    starBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const val = parseInt(btn.dataset.val);
            document.getElementById('ratingValue').value = val;

            starBtns.forEach((otherBtn, index) => {
                const icon = otherBtn.querySelector('svg') || otherBtn.querySelector('i');
                if (!icon) return;

                if (index < val) {
                    icon.classList.remove('text-gray-300');
                    icon.classList.add('text-amber-400', 'fill-amber-400');
                } else {
                    icon.classList.add('text-gray-300');
                    icon.classList.remove('text-amber-400', 'fill-amber-400');
                }
            });
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Enviando...';
        btn.disabled = true;

        const rating = document.getElementById('ratingValue').value;
        const comment = document.getElementById('ratingComment').value;
        const emailTo = "Redrabbitgo28@gmail.com";
        const subject = "Nueva Calificación del Servicio - Red Rabbit Go";

        try {
            const response = await fetch("https://formspree.io/f/Redrabbitgo28@gmail.com", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    _subject: subject,
                    "Valoración (Estrellas)": rating,
                    "Comentarios": comment || "Sin comentarios"
                })
            });

            if (response.ok) {
                btn.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i> ¡Enviado!';
                setTimeout(() => {
                    closeRatingPopup();
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    form.reset();
                    // Reset stars
                    document.querySelector('.star-btn[data-val="5"]').click();
                }, 2000);
            } else {
                throw new Error("Error respondiendo al servidor");
            }
        } catch (error) {
            console.error(error);
            btn.innerHTML = '<i data-lucide="x" class="w-5 h-5"></i> Error al enviar';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 3000);
        }
    });
}

// ── Quote Summary Modal (kept for compatibility) ──────────

function closeQuoteSummary() {
    const modal = document.getElementById('quoteSummaryModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}
