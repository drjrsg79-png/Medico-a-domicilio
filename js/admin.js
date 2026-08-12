const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const loginForm = document.getElementById('loginForm');
const loginFeedback = document.getElementById('loginFeedback');
const logoutBtn = document.getElementById('logoutBtn');
const cardList = document.getElementById('cardList');
const filters = document.getElementById('filters');

const STATUSES = ['pendiente', 'confirmado', 'en_camino', 'completado', 'cancelado'];
const STATUS_LABELS = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_camino: 'En camino',
  completado: 'Completado',
  cancelado: 'Cancelado',
};

let allRequests = [];
let currentFilter = 'todas';

// ---------- AUTH ----------
async function checkSession() {
  const { data } = await supabaseClient.auth.getSession();
  if (data.session) {
    showDashboard();
  } else {
    showLogin();
  }
}

function showLogin() {
  loginView.style.display = 'block';
  dashboardView.style.display = 'none';
}

function showDashboard() {
  loginView.style.display = 'none';
  dashboardView.style.display = 'block';
  loadRequests();
  loadDoctors();
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginFeedback.style.display = 'none';
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    loginFeedback.className = 'err';
    loginFeedback.textContent = 'Correo o contraseña incorrectos.';
    loginFeedback.style.display = 'block';
    return;
  }
  showDashboard();
});

logoutBtn.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  showLogin();
});

// ---------- DATA ----------
async function loadRequests() {
  cardList.innerHTML = '<div class="empty">Cargando...</div>';
  const { data, error } = await supabaseClient
    .from('solicitudes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    cardList.innerHTML = '<div class="empty">No se pudieron cargar las solicitudes.</div>';
    console.error(error);
    return;
  }
  allRequests = data;
  render();
}

async function updateStatus(id, status) {
  const { error } = await supabaseClient.from('solicitudes').update({ status }).eq('id', id);
  if (error) {
    alert('No se pudo actualizar el estatus.');
    console.error(error);
    return;
  }
  const req = allRequests.find(r => r.id === id);
  if (req) req.status = status;
  render();
}

// ---------- RENDER ----------
filters.addEventListener('click', (e) => {
  if (e.target.tagName !== 'BUTTON') return;
  currentFilter = e.target.dataset.filter;
  [...filters.children].forEach(b => b.classList.toggle('active', b === e.target));
  render();
});

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function render() {
  const list = currentFilter === 'todas'
    ? allRequests
    : allRequests.filter(r => r.status === currentFilter);

  if (list.length === 0) {
    cardList.innerHTML = '<div class="empty">No hay solicitudes en esta categoría.</div>';
    return;
  }

  cardList.innerHTML = list.map(r => `
    <div class="req-card">
      <div class="top">
        <div>
          <div class="name">${escapeHtml(r.nombre)}</div>
          <div class="when">${formatDate(r.created_at)} · ${escapeHtml(r.colonia)}</div>
        </div>
        <span class="badge ${r.status}">${STATUS_LABELS[r.status]}</span>
      </div>
      <div class="body">
        <div><strong>Tel:</strong> ${escapeHtml(r.telefono)}</div>
        <div><strong>Dirección:</strong> ${escapeHtml(r.calle)} ${escapeHtml(r.numero || '')}, ${escapeHtml(r.colonia)}${r.referencias ? ' — ' + escapeHtml(r.referencias) : ''}</div>
        <div><strong>Motivo:</strong> ${escapeHtml(r.motivo)}</div>
        ${r.horario_preferido ? `<div><strong>Horario preferido:</strong> ${escapeHtml(r.horario_preferido)}</div>` : ''}
      </div>
      <div class="status-row">
        ${STATUSES.map(s => `<button data-id="${r.id}" data-status="${s}" class="${r.status === s ? 'active' : ''}">${STATUS_LABELS[s]}</button>`).join('')}
      </div>
    </div>
  `).join('');
}

cardList.addEventListener('click', (e) => {
  if (e.target.tagName !== 'BUTTON') return;
  updateStatus(e.target.dataset.id, e.target.dataset.status);
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

// ---------- TABS ----------
const tabFilters = document.getElementById('tabFilters');
const solicitudesTab = document.getElementById('solicitudesTab');
const medicosTab = document.getElementById('medicosTab');
const doctorFilters = document.getElementById('doctorFilters');
const doctorList = document.getElementById('doctorList');
const pendingDoctorsBadge = document.getElementById('pendingDoctorsBadge');

let allDoctors = [];
let currentDoctorFilter = 'pendiente';

tabFilters.addEventListener('click', (e) => {
  if (e.target.tagName !== 'BUTTON') return;
  const tab = e.target.dataset.tab;
  [...tabFilters.children].forEach(b => b.classList.toggle('active', b === e.target));
  solicitudesTab.style.display = tab === 'solicitudes' ? 'block' : 'none';
  medicosTab.style.display = tab === 'medicos' ? 'block' : 'none';
  if (tab === 'medicos') loadDoctors();
});

async function loadDoctors() {
  doctorList.innerHTML = '<div class="empty">Cargando...</div>';
  const { data, error } = await supabaseClient
    .from('doctores')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    doctorList.innerHTML = '<div class="empty">No se pudieron cargar los médicos.</div>';
    console.error(error);
    return;
  }
  allDoctors = data;
  updatePendingBadge();
  renderDoctors();
}

function updatePendingBadge() {
  const count = allDoctors.filter(d => d.status === 'pendiente').length;
  pendingDoctorsBadge.textContent = count > 0 ? ` (${count})` : '';
}

async function updateDoctorStatus(id, status) {
  const { error } = await supabaseClient.from('doctores').update({ status }).eq('id', id);
  if (error) {
    alert('No se pudo actualizar el estatus del médico.');
    console.error(error);
    return;
  }
  const doc = allDoctors.find(d => d.id === id);
  if (doc) doc.status = status;
  updatePendingBadge();
  renderDoctors();
}

doctorFilters.addEventListener('click', (e) => {
  if (e.target.tagName !== 'BUTTON') return;
  currentDoctorFilter = e.target.dataset.dfilter;
  [...doctorFilters.children].forEach(b => b.classList.toggle('active', b === e.target));
  renderDoctors();
});

function renderDoctors() {
  const list = allDoctors.filter(d => d.status === currentDoctorFilter);

  if (list.length === 0) {
    doctorList.innerHTML = '<div class="empty">No hay médicos en esta categoría.</div>';
    return;
  }

  doctorList.innerHTML = list.map(d => `
    <div class="req-card">
      <div class="top">
        <div>
          <div class="name">${escapeHtml(d.nombre_completo)}</div>
          <div class="when">${formatDate(d.created_at)}</div>
        </div>
        <span class="badge ${d.status}">${d.status}</span>
      </div>
      <div class="body">
        <div><strong>Cédula:</strong> ${escapeHtml(d.cedula_profesional)}</div>
        <div><strong>Tel:</strong> ${escapeHtml(d.telefono)}</div>
        <div><strong>Correo:</strong> ${escapeHtml(d.email)}</div>
        <div><strong>Zonas:</strong> ${(d.colonias || []).map(escapeHtml).join(', ')}</div>
      </div>
      <div class="status-row">
        <button data-doc="${d.id}" data-dstatus="aprobado" class="${d.status === 'aprobado' ? 'active' : ''}">Aprobar</button>
        <button data-doc="${d.id}" data-dstatus="rechazado" class="${d.status === 'rechazado' ? 'active' : ''}">Rechazar</button>
        <button data-doc="${d.id}" data-dstatus="inactivo" class="${d.status === 'inactivo' ? 'active' : ''}">Desactivar</button>
      </div>
    </div>
  `).join('');
}

doctorList.addEventListener('click', (e) => {
  if (e.target.tagName !== 'BUTTON') return;
  updateDoctorStatus(e.target.dataset.doc, e.target.dataset.dstatus);
});

checkSession();
