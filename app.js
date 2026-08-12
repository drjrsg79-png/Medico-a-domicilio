document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('requestForm');
const submitBtn = document.getElementById('submitBtn');
const feedback = document.getElementById('feedback');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';
  feedback.style.display = 'none';

  const payload = {
    nombre: document.getElementById('nombre').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    colonia: document.getElementById('colonia').value,
    calle: document.getElementById('calle').value.trim(),
    numero: document.getElementById('numero').value.trim(),
    referencias: document.getElementById('referencias').value.trim(),
    motivo: document.getElementById('motivo').value.trim(),
    horario_preferido: document.getElementById('horario').value.trim(),
  };

  const { error } = await supabaseClient.from('solicitudes').insert([payload]);

  submitBtn.disabled = false;
  submitBtn.textContent = 'Enviar solicitud';

  if (error) {
    feedback.className = 'err';
    feedback.textContent = 'No se pudo enviar la solicitud. Intenta de nuevo o llámanos directamente.';
    console.error(error);
    return;
  }

  feedback.className = 'ok';
  feedback.textContent = 'Solicitud enviada. Te contactaremos en breve para confirmar el horario.';
  form.reset();
});
