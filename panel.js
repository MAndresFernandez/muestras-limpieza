// Red Rabbit Go Panel - Admin Application Script

// ========== STATE ==========
let appData = null;
let currentSession = null;
let deleteTargetId = null;

const SESSION_KEY = 'redrabbit_session';
const DATA_KEY = 'redrabbit_admin_data';
const PASS_KEY = 'redrabbit_pass_override';

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    checkSession();
    setupEventListeners();
    lucide.createIcons();
});

async function loadData() {
    try {
        const response = await fetch('data.json');
        appData = await response.json();

        // Merge with any localStorage overrides
        const localOverride = localStorage.getItem(DATA_KEY);
        if (localOverride) {
            try {
                const parsed = JSON.parse(localOverride);
                appData.staff = parsed.staff || appData.staff;
            } catch (e) {
                console.warn('Could not parse local data override');
            }
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function saveDataLocally() {
    localStorage.setItem(DATA_KEY, JSON.stringify({ staff: appData.staff }));
    // Also sync to workers_override so home page picks up changes
    localStorage.setItem('workers_override', JSON.stringify(appData.staff));
}

// ========== AUTH ==========
async function hashPassword(password, salt) {
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function checkSession() {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session) {
        try {
            currentSession = JSON.parse(session);
            showAdminPanel();
        } catch (e) {
            showLoginScreen();
        }
    } else {
        showLoginScreen();
    }
}

function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('adminPanel').classList.add('hidden');
    lucide.createIcons();
}

function showAdminPanel() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
    document.getElementById('currentUser').textContent = `Hola, ${currentSession?.user || 'Admin'}`;
    renderDashboard();
    renderWorkersTable();
    renderAllReviews();
    lucide.createIcons();
}

async function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;
    const errorEl = document.getElementById('loginError');

    if (!appData || !appData.auth) {
        errorEl.textContent = 'Error de configuración. Intente más tarde.';
        errorEl.classList.remove('hidden');
        return;
    }

    const expectedUser = appData.auth.username;
    const salt = appData.auth.salt;

    // Check for password override (changed password)
    const passOverride = localStorage.getItem(PASS_KEY);

    const hash = await hashPassword(pass, salt);

    let validPassword = false;
    if (passOverride) {
        validPassword = hash === passOverride;
    } else {
        validPassword = hash === appData.auth.passwordHash;
    }

    if (user === expectedUser && validPassword) {
        currentSession = { user, loginTime: Date.now() };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentSession));
        errorEl.classList.add('hidden');
        showAdminPanel();
    } else {
        errorEl.textContent = 'Usuario o contraseña incorrectos.';
        errorEl.classList.remove('hidden');
        // Login attempt rate limiting
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Espere...';
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '<i data-lucide="log-in" class="w-5 h-5"></i> Iniciar Sesión';
            lucide.createIcons();
        }, 2000);
    }
}

function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    currentSession = null;
    showLoginScreen();
}

// ========== TAB NAVIGATION ==========
function showTab(tab) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sidebar-link').forEach(l => {
        l.classList.remove('active');
        l.classList.remove('text-white');
        l.classList.add('text-gray-300');
    });

    const panel = document.getElementById(`tab-${tab}`);
    if (panel) panel.classList.add('active');

    const link = document.querySelector(`.sidebar-link[data-tab="${tab}"]`);
    if (link) {
        link.classList.add('active', 'text-white');
        link.classList.remove('text-gray-300');
    }

    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
        document.getElementById('sidebar').classList.add('hidden');
    }

    // Refresh data on tab switch
    if (tab === 'dashboard') renderDashboard();
    if (tab === 'workers') renderWorkersTable();
    if (tab === 'reviews') renderAllReviews();

    lucide.createIcons();
}

// ========== DASHBOARD ==========
function renderDashboard() {
    if (!appData?.staff) return;

    const staff = appData.staff;
    document.getElementById('statTotal').textContent = staff.length;
    document.getElementById('statDestacados').textContent = staff.filter(s => s.destacado).length;
    document.getElementById('statVerificados').textContent = staff.filter(s => s.verificado).length;
    document.getElementById('statResenas').textContent = staff.reduce((acc, s) => acc + (s.resenas?.length || 0), 0);

    const list = document.getElementById('dashboardWorkerList');
    list.innerHTML = staff.map(w => `
        <div class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <div class="flex items-center gap-3">
                <img src="${w.foto}" alt="${w.nombre}" class="w-10 h-10 rounded-full object-cover">
                <div>
                    <p class="font-semibold text-gray-900">${w.nombre}</p>
                    <p class="text-sm text-gray-500">${w.puesto}</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                ${w.destacado ? '<span class="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">⭐ Destacado</span>' : ''}
                ${w.verificado ? '<span class="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">✓ Verificado</span>' : ''}
                <span class="text-sm font-medium text-gray-600">${w.rating?.toFixed(1) || '-'}</span>
            </div>
        </div>
    `).join('');
}

// ========== WORKERS TABLE ==========
function renderWorkersTable(filter = '') {
    if (!appData?.staff) return;

    const tbody = document.getElementById('workersTableBody');
    const filtered = appData.staff.filter(w => {
        const search = filter.toLowerCase();
        return !search || w.nombre.toLowerCase().includes(search) || w.puesto.toLowerCase().includes(search);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-12 text-center text-gray-400">No se encontraron trabajadores.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(w => `
        <tr class="worker-row">
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <img src="${w.foto}" alt="${w.nombre}" class="w-10 h-10 rounded-full object-cover">
                    <div>
                        <p class="font-semibold text-gray-900">${w.nombre}</p>
                        <p class="text-sm text-gray-500 md:hidden">${w.puesto}</p>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 text-gray-600 hidden md:table-cell">${w.puesto}</td>
            <td class="px-6 py-4 hidden lg:table-cell">
                <div class="flex items-center gap-1">
                    <i data-lucide="star" class="w-4 h-4 text-amber-400 fill-amber-400"></i>
                    <span class="font-medium text-gray-700">${w.rating?.toFixed(1) || '-'}</span>
                    <span class="text-gray-400 text-sm">(${w.resenas?.length || 0})</span>
                </div>
            </td>
            <td class="px-6 py-4 hidden sm:table-cell">
                <div class="flex items-center gap-2">
                    ${w.verificado ? '<span class="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Verificado</span>' : '<span class="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Sin verificar</span>'}
                    ${w.destacado ? '<span class="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Destacado</span>' : ''}
                </div>
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                    <button onclick="editWorker(${w.id})" class="p-2 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-600 transition-colors" title="Editar">
                        <i data-lucide="pencil" class="w-4 h-4"></i>
                    </button>
                    <a href="trabajador.html?id=${w.id}" target="_blank" class="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Ver ficha">
                        <i data-lucide="external-link" class="w-4 h-4"></i>
                    </a>
                    <button onclick="openDeleteModal(${w.id})" class="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    lucide.createIcons();
}

function filterWorkers() {
    const search = document.getElementById('workerSearch')?.value || '';
    renderWorkersTable(search);
}

// ========== WORKER MODAL ==========
function openWorkerModal(workerId = null) {
    const modal = document.getElementById('workerModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('workerForm');

    form.reset();

    if (workerId) {
        const worker = appData.staff.find(w => w.id === workerId);
        if (!worker) return;
        title.textContent = 'Editar Colaborador';
        document.getElementById('wf_id').value = worker.id;
        document.getElementById('wf_nombre').value = worker.nombre;
        document.getElementById('wf_puesto').value = worker.puesto;
        document.getElementById('wf_especialidad').value = worker.especialidad || '';
        document.getElementById('wf_experiencia').value = worker.experiencia || '';
        document.getElementById('wf_telefono').value = worker.telefono || '';
        document.getElementById('wf_email').value = worker.email || '';
        document.getElementById('wf_foto').value = worker.foto || '';
        document.getElementById('wf_bio').value = worker.bio || '';
        document.getElementById('wf_habilidades').value = (worker.habilidades || []).join(', ');
        document.getElementById('wf_disponibilidad').value = worker.disponibilidad || 'Tiempo completo';
        document.getElementById('wf_fechaIngreso').value = worker.fechaIngreso || '';
        document.getElementById('wf_verificado').checked = worker.verificado || false;
        document.getElementById('wf_destacado').checked = worker.destacado || false;
    } else {
        title.textContent = 'Agregar Colaborador';
        document.getElementById('wf_id').value = '';
    }

    modal.classList.remove('hidden');
    lucide.createIcons();
}

function closeWorkerModal() {
    document.getElementById('workerModal').classList.add('hidden');
}

function editWorker(id) {
    openWorkerModal(id);
}

function handleWorkerSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('wf_id').value;
    const workerData = {
        nombre: document.getElementById('wf_nombre').value.trim(),
        puesto: document.getElementById('wf_puesto').value.trim(),
        especialidad: document.getElementById('wf_especialidad').value.trim(),
        experiencia: document.getElementById('wf_experiencia').value.trim(),
        telefono: document.getElementById('wf_telefono').value.trim(),
        email: document.getElementById('wf_email').value.trim(),
        foto: document.getElementById('wf_foto').value.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&crop=face',
        bio: document.getElementById('wf_bio').value.trim(),
        habilidades: document.getElementById('wf_habilidades').value.split(',').map(s => s.trim()).filter(Boolean),
        disponibilidad: document.getElementById('wf_disponibilidad').value,
        fechaIngreso: document.getElementById('wf_fechaIngreso').value,
        verificado: document.getElementById('wf_verificado').checked,
        destacado: document.getElementById('wf_destacado').checked
    };

    if (id) {
        // Update existing
        const idx = appData.staff.findIndex(w => w.id === parseInt(id));
        if (idx !== -1) {
            appData.staff[idx] = { ...appData.staff[idx], ...workerData };
            showPanelNotification('Trabajador actualizado correctamente', 'success');
        }
    } else {
        // Create new
        const maxId = appData.staff.reduce((max, w) => Math.max(max, w.id), 0);
        const newWorker = {
            id: maxId + 1,
            ...workerData,
            rating: 0,
            resenas: [],
            documentosVerificados: workerData.verificado ? ['DNI', 'Antecedentes'] : []
        };
        appData.staff.push(newWorker);
        showPanelNotification('Trabajador agregado correctamente', 'success');
    }

    saveDataLocally();
    closeWorkerModal();
    renderDashboard();
    renderWorkersTable();
    renderAllReviews();
}

// ========== DELETE ==========
function openDeleteModal(id) {
    deleteTargetId = id;
    const worker = appData.staff.find(w => w.id === id);
    document.getElementById('deleteWorkerName').textContent = `Se eliminará a "${worker?.nombre}" permanentemente.`;
    document.getElementById('deleteModal').classList.remove('hidden');
    lucide.createIcons();
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
    deleteTargetId = null;
}

function confirmDelete() {
    if (deleteTargetId === null) return;
    appData.staff = appData.staff.filter(w => w.id !== deleteTargetId);
    saveDataLocally();
    closeDeleteModal();
    renderDashboard();
    renderWorkersTable();
    renderAllReviews();
    showPanelNotification('Trabajador eliminado', 'info');
}

// ========== REVIEWS ==========
function renderAllReviews() {
    if (!appData?.staff) return;
    const container = document.getElementById('allReviewsList');

    const allReviews = [];
    appData.staff.forEach(w => {
        (w.resenas || []).forEach(r => {
            allReviews.push({ ...r, workerName: w.nombre, workerFoto: w.foto, workerId: w.id });
        });
    });

    allReviews.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    if (allReviews.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-12">No hay reseñas aún.</p>';
        return;
    }

    container.innerHTML = allReviews.map(r => {
        const stars = Array(5).fill().map((_, i) =>
            `<i data-lucide="star" class="w-4 h-4 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}"></i>`
        ).join('');
        const date = new Date(r.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
        return `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <img src="${r.workerFoto}" alt="${r.workerName}" class="w-10 h-10 rounded-full object-cover">
                        <div>
                            <p class="font-semibold text-gray-900">Para: ${r.workerName}</p>
                            <p class="text-sm text-gray-500">Por: ${r.autor} · ${r.empresa}</p>
                        </div>
                    </div>
                    <span class="text-sm text-gray-400">${date}</span>
                </div>
                <div class="flex items-center gap-1 mb-2">${stars}</div>
                <p class="text-gray-600 italic">"${r.texto}"</p>
            </div>
        `;
    }).join('');

    lucide.createIcons();
}

// ========== SETTINGS - CHANGE PASSWORD ==========
async function handleChangePassword(e) {
    e.preventDefault();

    const currentPass = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;
    const msgEl = document.getElementById('passChangeMsg');

    // Validate current password
    const salt = appData.auth.salt;
    const currentHash = await hashPassword(currentPass, salt);
    const passOverride = localStorage.getItem(PASS_KEY);
    const validCurrentHash = passOverride || appData.auth.passwordHash;

    if (currentHash !== validCurrentHash) {
        showPassMessage('La contraseña actual es incorrecta.', 'error');
        return;
    }

    if (newPass.length < 6) {
        showPassMessage('La nueva contraseña debe tener al menos 6 caracteres.', 'error');
        return;
    }

    if (newPass !== confirmPass) {
        showPassMessage('Las contraseñas nuevas no coinciden.', 'error');
        return;
    }

    // Hash and save new password
    const newHash = await hashPassword(newPass, salt);
    localStorage.setItem(PASS_KEY, newHash);

    showPassMessage('¡Contraseña actualizada correctamente!', 'success');
    e.target.reset();
}

function showPassMessage(msg, type) {
    const el = document.getElementById('passChangeMsg');
    el.textContent = msg;
    el.className = `text-sm p-3 rounded-xl font-medium ${type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 5000);
}

// ========== EXPORT ==========
function exportData() {
    const dataStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redrabbitgo_data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showPanelNotification('Datos exportados correctamente', 'success');
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);

    // Toggle password visibility
    document.getElementById('togglePassBtn')?.addEventListener('click', () => {
        const passInput = document.getElementById('loginPass');
        const icon = document.getElementById('eyeIcon');
        if (passInput.type === 'password') {
            passInput.type = 'text';
            icon.setAttribute('data-lucide', 'eye-off');
        } else {
            passInput.type = 'password';
            icon.setAttribute('data-lucide', 'eye');
        }
        lucide.createIcons();
    });

    // Worker form
    document.getElementById('workerForm')?.addEventListener('submit', handleWorkerSubmit);

    // Change password form
    document.getElementById('changePassForm')?.addEventListener('submit', handleChangePassword);

    // Sidebar toggle (mobile)
    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('hidden');
    });
}

// ========== NOTIFICATIONS ==========
function showPanelNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl z-[60] transform transition-all duration-500 ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-primary-500'} text-white font-medium`;
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
    }, 3000);
}

// ========== GLOBAL FUNCTIONS ==========
window.handleLogout = handleLogout;
window.showTab = showTab;
window.openWorkerModal = openWorkerModal;
window.closeWorkerModal = closeWorkerModal;
window.editWorker = editWorker;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;
window.filterWorkers = filterWorkers;
window.exportData = exportData;
