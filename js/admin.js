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

checkSession();
