// CleanPro Solutions - Main Application Script
let appData = null;

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initializeComponents();
    setupEventListeners();
    checkLeadPopup();
});

// Load data from JSON
async function loadData() {
    try {
        const response = await fetch('data.json');
        appData = await response.json();
        console.log('Data loaded successfully', appData);
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback data
        appData = getFallbackData();
    }
}

// Get fallback data if JSON fails - robust fallback with complete data
function getFallbackData() {
    return {
        empresa: {
            nombre: "CleanPro Solutions"
        },
        servicios: [
            { id: "oficinas", nombre: "Oficinas Corporativas", descripcion: "Espacios de trabajo impecables que impulsan la productividad", icono: "building-2" },
            { id: "post-obra", nombre: "Final de Obra", descripcion: "Dejamos tu proyecto listo para la entrega", icono: "hard-hat" },
            { id: "hogar", nombre: "Hogar Premium", descripcion: "Tu hogar merece el mejor cuidado profesional", icono: "home" }
        ],
        staff: [
            { nombre: "Carlos García", puesto: "Supervisor General", especialidad: "Coordinación de equipos", experiencia: "8 años", verificado: true, foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face" },
            { nombre: "Marta Rodríguez", puesto: "Especialista Post-Obra", especialidad: "Limpieza técnica", experiencia: "6 años", verificado: true, foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face" },
            { nombre: "Luis Mendoza", puesto: "Técnico Industrial", especialidad: "Maquinaria pesada", experiencia: "10 años", verificado: true, foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face" }
        ],
        testimonios: [
            { cliente: "Tech Solutions S.A.", texto: "Servicio impecable y puntual. Nuestras oficinas nunca habían lucido tan bien.", autor: "María González", cargo: "Directora de Operaciones", rating: 5 },
            { cliente: "Constructora Moderna", texto: "Entregamos el edificio antes de tiempo gracias a su eficiencia.", autor: "Roberto Jiménez", cargo: "Gerente de Proyectos", rating: 5 },
            { cliente: "Hospital Central", texto: "Cumplen con todos los protocolos de bioseguridad.", autor: "Dra. Patricia Luna", cargo: "Directora Administrativa", rating: 5 }
        ],
        checklistBasica: [
            { item: "Aspirado de pisos y alfombras", incluido: true },
            { item: "Limpieza de superficies", incluido: true },
            { item: "Vaciado de papeleras", incluido: true },
            { item: "Limpieza de baños", incluido: true },
            { item: "Desinfección de puntos de contacto", incluido: false },
            { item: "Limpieza de techos y molduras", incluido: false }
        ],
        checklistProfunda: [
            { item: "Aspirado de pisos y alfombras", incluido: true },
            { item: "Limpieza de superficies", incluido: true },
            { item: "Vaciado de papeleras", incluido: true },
            { item: "Limpieza de baños", incluido: true },
            { item: "Desinfección de puntos de contacto", incluido: true },
            { item: "Limpieza de techos y molduras", incluido: true },
            { item: "Tratamiento de manchas", incluido: true },
            { item: "Pulido de pisos", incluido: true }
        ],
        frecuencias: [
            { id: "unica", nombre: "Única vez" },
            { id: "semanal", nombre: "Semanal" },
            { id: "quincenal", nombre: "Quincenal" },
            { id: "mensual", nombre: "Mensual" }
        ],
        proximasVisitas: [
            { fecha: "2024-02-15", hora: "09:00", servicio: "Limpieza de Oficina", estado: "confirmada" },
            { fecha: "2024-02-22", hora: "14:00", servicio: "Limpieza Profunda", estado: "pendiente" }
        ],
        historialFacturas: [
            { numero: "FAC-2024-001", fecha: "2024-01-15", concepto: "Limpieza mensual oficinas", estado: "pagada" },
            { numero: "FAC-2024-002", fecha: "2024-02-01", concepto: "Limpieza mensual oficinas", estado: "pendiente" }
        ]
    };
}

// Initialize all components
function initializeComponents() {
    renderStaffGrid();
    renderTestimonials();
    renderChecklist('basica');
    initializeBeforeAfterSlider();
    renderPortalData();
    lucide.createIcons();
}

// Setup all event listeners
function setupEventListeners() {
    // Mobile menu toggle
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Quoter form
    const quoterForm = document.getElementById('quoterForm');
    if (quoterForm) {
        quoterForm.addEventListener('submit', handleQuoterSubmit);
    }

    // Range slider
    const m2Range = document.getElementById('m2Range');
    const m2Value = document.getElementById('m2Value');
    if (m2Range && m2Value) {
        m2Range.addEventListener('input', (e) => {
            m2Value.textContent = e.target.value;
        });
    }

    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleTabChange(e));
    });

    // Recruitment form
    const recruitmentForm = document.getElementById('recruitmentForm');
    if (recruitmentForm) {
        recruitmentForm.addEventListener('submit', handleRecruitmentSubmit);
    }

    // File upload area
    setupFileUpload();

    // Lead magnet form
    const leadForm = document.getElementById('leadForm');
    if (leadForm) {
        leadForm.addEventListener('submit', handleLeadSubmit);
    }

    // Close popup button
    const closePopupBtn = document.getElementById('closePopup');
    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', closeLeadPopup);
    }

    // Smooth scroll for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                // Close mobile menu if open
                if (mobileMenu) mobileMenu.classList.add('hidden');
            }
        });
    });

    // Scroll-based navbar
    setupScrollNavbar();
}

// Render staff grid
function renderStaffGrid() {
    const container = document.getElementById('staffGrid');
    if (!container || !appData?.staff) return;

    container.innerHTML = appData.staff.map(member => `
        <div class="staff-card bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer">
            <div class="relative">
                <img src="${member.foto}" alt="${member.nombre}" 
                     class="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500">
                ${member.verificado ? `
                    <div class="verified-badge absolute top-4 right-4 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow-lg">
                        <i data-lucide="check-circle" class="w-4 h-4"></i>
                        Verificado
                    </div>
                ` : ''}
            </div>
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900">${member.nombre}</h3>
                <p class="text-teal-600 font-medium">${member.puesto}</p>
                <p class="text-gray-500 text-sm mt-2">${member.especialidad || ''}</p>
                <div class="flex items-center gap-2 mt-3 text-gray-400 text-sm">
                    <i data-lucide="clock" class="w-4 h-4"></i>
                    <span>${member.experiencia || 'Experiencia verificada'}</span>
                </div>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

// Render testimonials
function renderTestimonials() {
    const container = document.getElementById('testimonialGrid');
    if (!container || !appData?.testimonios) return;

    container.innerHTML = appData.testimonios.map(t => `
        <div class="testimonial-card rounded-2xl p-8 shadow-lg">
            <div class="flex items-center gap-1 mb-4">
                ${Array(t.rating).fill().map(() => '<i data-lucide="star" class="w-5 h-5 text-amber-400 fill-amber-400"></i>').join('')}
            </div>
            <p class="text-gray-700 text-lg italic mb-6">"${t.texto}"</p>
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                    ${t.autor?.charAt(0) || 'C'}
                </div>
                <div>
                    <p class="font-bold text-gray-900">${t.autor || 'Cliente'}</p>
                    <p class="text-gray-500 text-sm">${t.cargo || ''} - ${t.cliente}</p>
                </div>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

// Render checklist
function renderChecklist(type) {
    const container = document.getElementById('checklistContainer');
    if (!container || !appData) return;

    const items = type === 'basica' ? appData.checklistBasica : appData.checklistProfunda;
    if (!items) return;

    container.innerHTML = `
        <div class="grid md:grid-cols-2 gap-4">
            ${items.map(item => `
                <div class="flex items-center gap-3 p-4 rounded-xl ${item.incluido ? 'bg-teal-50' : 'bg-gray-50'}">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center ${item.incluido ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-400'}">
                        <i data-lucide="${item.incluido ? 'check' : 'x'}" class="w-5 h-5"></i>
                    </div>
                    <span class="${item.incluido ? 'text-gray-800' : 'text-gray-400 line-through'}">${item.item}</span>
                </div>
            `).join('')}
        </div>
    `;

    lucide.createIcons();
}

// Handle tab change
function handleTabChange(e) {
    const type = e.target.dataset.tab;

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');

    renderChecklist(type);
}

// Initialize before/after slider
function initializeBeforeAfterSlider() {
    const container = document.querySelector('.before-after-container');
    const handle = document.querySelector('.slider-handle');
    const beforeImg = document.querySelector('.before-image');

    if (!container || !handle || !beforeImg) return;

    let isDragging = false;

    const updateSlider = (x) => {
        const rect = container.getBoundingClientRect();
        let percentage = ((x - rect.left) / rect.width) * 100;
        percentage = Math.max(0, Math.min(100, percentage));

        handle.style.left = `${percentage}%`;
        beforeImg.style.width = `${percentage}%`;
    };

    handle.addEventListener('mousedown', () => isDragging = true);
    document.addEventListener('mouseup', () => isDragging = false);
    document.addEventListener('mousemove', (e) => {
        if (isDragging) updateSlider(e.clientX);
    });

    // Touch support
    handle.addEventListener('touchstart', () => isDragging = true);
    document.addEventListener('touchend', () => isDragging = false);
    document.addEventListener('touchmove', (e) => {
        if (isDragging) updateSlider(e.touches[0].clientX);
    });

    // Click to move
    container.addEventListener('click', (e) => updateSlider(e.clientX));
}

// Render portal data
function renderPortalData() {
    const visitsContainer = document.getElementById('upcomingVisits');
    const invoicesContainer = document.getElementById('invoicesHistory');

    if (visitsContainer && appData?.proximasVisitas) {
        visitsContainer.innerHTML = appData.proximasVisitas.map(visit => `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white">
                        <i data-lucide="calendar" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-900">${visit.servicio}</p>
                        <p class="text-gray-500 text-sm">${formatDate(visit.fecha)} - ${visit.hora}</p>
                    </div>
                </div>
                <span class="px-3 py-1 rounded-full text-sm font-medium ${visit.estado === 'confirmada' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">
                    ${visit.estado === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                </span>
            </div>
        `).join('');
    }

    if (invoicesContainer && appData?.historialFacturas) {
        invoicesContainer.innerHTML = appData.historialFacturas.map(invoice => `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center text-gray-600">
                        <i data-lucide="file-text" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-900">${invoice.numero}</p>
                        <p class="text-gray-500 text-sm">${invoice.concepto}</p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="px-3 py-1 rounded-full text-sm font-medium ${invoice.estado === 'pagada' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">
                        ${invoice.estado === 'pagada' ? 'Pagada' : 'Pendiente'}
                    </span>
                    <p class="text-gray-400 text-sm mt-1">${formatDate(invoice.fecha)}</p>
                </div>
            </div>
        `).join('');
    }

    lucide.createIcons();
}

// Handle quoter form submission
function handleQuoterSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const telefono = form.querySelector('[name="telefono"]');

    // Validate phone number (only digits, +, -, spaces)
    if (telefono && !/^[\d\s\+\-\(\)]{7,20}$/.test(telefono.value)) {
        showNotification('Por favor, ingresa un número de teléfono válido.', 'error');
        telefono.focus();
        return;
    }

    const formData = new FormData(form);
    const data = {
        servicio: formData.get('servicio'),
        frecuencia: formData.get('frecuencia'),
        m2: document.getElementById('m2Range')?.value || '100',
        nombre: formData.get('nombre'),
        telefono: formData.get('telefono'),
        email: formData.get('email'),
        timestamp: new Date().toISOString()
    };

    // Save to localStorage
    const leads = JSON.parse(localStorage.getItem('cleanpro_leads') || '[]');
    leads.push(data);
    localStorage.setItem('cleanpro_leads', JSON.stringify(leads));

    // Get company name
    const empresaNombre = appData?.empresa?.nombre || 'CleanPro Solutions';

    // Replace form with success message
    const formContainer = document.getElementById('quoterFormContainer');
    if (formContainer) {
        formContainer.innerHTML = `
            <div class="text-center py-12 animate-fade-in">
                <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <i data-lucide="check" class="w-12 h-12 text-white"></i>
                </div>
                <h3 class="text-3xl font-bold text-gray-900 mb-4">¡Solicitud Recibida!</h3>
                <p class="text-lg text-gray-600 max-w-md mx-auto mb-6">
                    Un asesor de <strong class="text-primary-600">${empresaNombre}</strong> validará la disponibilidad en tu zona y te contactará en <strong>menos de 2 horas</strong>.
                </p>
                <div class="bg-gray-50 rounded-xl p-6 max-w-sm mx-auto">
                    <p class="text-sm text-gray-500 mb-2">Resumen de tu solicitud:</p>
                    <p class="font-semibold text-gray-800">${appData?.servicios?.find(s => s.id === data.servicio)?.nombre || data.servicio}</p>
                    <p class="text-gray-600">${data.m2} m² · ${appData?.frecuencias?.find(f => f.id === data.frecuencia)?.nombre || data.frecuencia}</p>
                </div>
                <button onclick="resetQuoterForm()" class="mt-8 text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 mx-auto">
                    <i data-lucide="arrow-left" class="w-4 h-4"></i>
                    Enviar otra solicitud
                </button>
            </div>
        `;
        lucide.createIcons();
    }
}

// Show quote summary
function showQuoteSummary(data) {
    const modal = document.getElementById('quoteSummaryModal');
    const content = document.getElementById('quoteSummaryContent');

    if (!modal || !content) return;

    const serviceName = appData?.servicios?.find(s => s.id === data.servicio)?.nombre || data.servicio;
    const frecuenciaName = appData?.frecuencias?.find(f => f.id === data.frecuencia)?.nombre || data.frecuencia;

    content.innerHTML = `
        <div class="space-y-4">
            <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="text-gray-600">Tipo de Servicio</span>
                <span class="font-semibold text-gray-900">${serviceName}</span>
            </div>
            <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="text-gray-600">Frecuencia</span>
                <span class="font-semibold text-gray-900">${frecuenciaName}</span>
            </div>
            <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="text-gray-600">Superficie</span>
                <span class="font-semibold text-gray-900">${data.m2} m²</span>
            </div>
            <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="text-gray-600">Contacto</span>
                <span class="font-semibold text-gray-900">${data.nombre}</span>
            </div>
            <div class="mt-6 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl">
                <p class="text-center text-gray-700">
                    <span class="block text-2xl font-bold text-teal-600 mb-2">Presupuesto Personalizado</span>
                    Un asesor se comunicará contigo en las próximas 24 horas hábiles para ofrecerte una cotización adaptada a tus necesidades.
                </p>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

// Close quote summary modal
function closeQuoteSummary() {
    const modal = document.getElementById('quoteSummaryModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// Setup file upload
function setupFileUpload() {
    const uploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('cvFile');
    const fileName = document.getElementById('fileName');

    if (!uploadArea || !fileInput) return;

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            updateFileName(e.dataTransfer.files[0].name);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            updateFileName(e.target.files[0].name);
        }
    });

    function updateFileName(name) {
        if (fileName) {
            fileName.textContent = name;
            fileName.classList.remove('hidden');
        }
    }
}

// Handle recruitment form submission
function handleRecruitmentSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {
        nombreCompleto: formData.get('nombreCompleto'),
        emailRecruit: formData.get('emailRecruit'),
        telefonoRecruit: formData.get('telefonoRecruit'),
        experiencia: formData.get('experiencia'),
        disponibilidad: formData.get('disponibilidad'),
        mensaje: formData.get('mensaje'),
        cvFileName: document.getElementById('fileName')?.textContent || 'No adjuntado',
        timestamp: new Date().toISOString()
    };

    // Save to localStorage
    const applications = JSON.parse(localStorage.getItem('cleanpro_applications') || '[]');
    applications.push(data);
    localStorage.setItem('cleanpro_applications', JSON.stringify(applications));

    // Show success message
    showNotification('¡Gracias por tu interés! Revisaremos tu solicitud y te contactaremos pronto.', 'success');
    e.target.reset();
    document.getElementById('fileName')?.classList.add('hidden');
}

// Lead popup functionality
function checkLeadPopup() {
    const hasSeenPopup = localStorage.getItem('cleanpro_popup_seen');
    if (!hasSeenPopup) {
        setTimeout(() => {
            showLeadPopup();
        }, 15000); // Show after 15 seconds
    }
}

function showLeadPopup() {
    const popup = document.getElementById('leadPopup');
    if (popup) {
        popup.classList.remove('hidden');
        popup.classList.add('flex');
    }
}

function closeLeadPopup() {
    const popup = document.getElementById('leadPopup');
    if (popup) {
        popup.classList.add('hidden');
        popup.classList.remove('flex');
        localStorage.setItem('cleanpro_popup_seen', 'true');
    }
}

// Handle lead form submission
function handleLeadSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('leadEmail')?.value;
    if (!email) return;

    const leads = JSON.parse(localStorage.getItem('cleanpro_newsletter') || '[]');
    leads.push({ email, timestamp: new Date().toISOString() });
    localStorage.setItem('cleanpro_newsletter', JSON.stringify(leads));

    showNotification('¡Gracias! Recibirás la guía en tu correo electrónico.', 'success');
    closeLeadPopup();
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl z-50 transform transition-all duration-500 ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-teal-500'
        } text-white font-medium`;
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}" class="w-5 h-5"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);
    lucide.createIcons();

    setTimeout(() => {
        notification.classList.add('translate-y-20', 'opacity-0');
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

// Setup scroll-based navbar
function setupScrollNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('bg-white/95', 'shadow-lg', 'backdrop-blur-md');
            navbar.classList.remove('bg-transparent');
        } else {
            navbar.classList.remove('bg-white/95', 'shadow-lg', 'backdrop-blur-md');
            navbar.classList.add('bg-transparent');
        }
    });
}

// Utility: Format date
function formatDate(dateString) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Reset quoter form to initial state
function resetQuoterForm() {
    const formContainer = document.getElementById('quoterFormContainer');
    if (formContainer) {
        formContainer.innerHTML = getQuoterFormHTML();

        // Re-attach event listeners
        const quoterForm = document.getElementById('quoterForm');
        if (quoterForm) {
            quoterForm.addEventListener('submit', handleQuoterSubmit);
        }

        const m2Range = document.getElementById('m2Range');
        const m2Value = document.getElementById('m2Value');
        if (m2Range && m2Value) {
            m2Range.addEventListener('input', (e) => {
                m2Value.textContent = e.target.value;
            });
        }

        lucide.createIcons();
    }
}

// Get quoter form HTML template
function getQuoterFormHTML() {
    return `
        <form id="quoterForm" class="space-y-6">
            <div class="grid md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Tipo de Servicio *</label>
                    <select name="servicio" class="form-input w-full px-4 py-3 rounded-xl bg-white" required>
                        <option value="">Selecciona un servicio</option>
                        <option value="oficinas">Oficinas Corporativas</option>
                        <option value="post-obra">Final de Obra</option>
                        <option value="hospitalario">Hospitalario</option>
                        <option value="industrial">Industrial</option>
                        <option value="hogar">Hogar Premium</option>
                        <option value="eventos">Eventos</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Frecuencia *</label>
                    <select name="frecuencia" class="form-input w-full px-4 py-3 rounded-xl bg-white" required>
                        <option value="">Selecciona frecuencia</option>
                        <option value="unica">Única vez</option>
                        <option value="semanal">Semanal</option>
                        <option value="quincenal">Quincenal</option>
                        <option value="mensual">Mensual</option>
                        <option value="diario">Diario (L-V)</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-4">Superficie Aproximada: <span id="m2Value" class="text-primary-600 text-lg font-bold">100</span> m²</label>
                <input type="range" id="m2Range" min="20" max="1000" value="100" class="w-full" required>
                <div class="flex justify-between text-sm text-gray-500 mt-2">
                    <span>20 m²</span>
                    <span>1000 m²</span>
                </div>
            </div>
            <div class="grid md:grid-cols-3 gap-6">
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
                    <input type="text" name="nombre" class="form-input w-full px-4 py-3 rounded-xl bg-white" placeholder="Tu nombre" required>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Teléfono *</label>
                    <input type="tel" name="telefono" class="form-input w-full px-4 py-3 rounded-xl bg-white" placeholder="+1 555 123 4567" required pattern="[\\d\\s\\+\\-\\(\\)]{7,20}" title="Ingresa un número de teléfono válido">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input type="email" name="email" class="form-input w-full px-4 py-3 rounded-xl bg-white" placeholder="tu@email.com" required>
                </div>
            </div>
            <button type="submit" class="w-full btn-primary py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 min-h-[52px]">
                <i data-lucide="send" class="w-5 h-5"></i>
                Enviar para Validar Disponibilidad
            </button>
        </form>
    `;
}

// Make functions available globally
window.closeQuoteSummary = closeQuoteSummary;
window.closeLeadPopup = closeLeadPopup;
window.resetQuoterForm = resetQuoterForm;
window.showLeadPopup = showLeadPopup;
