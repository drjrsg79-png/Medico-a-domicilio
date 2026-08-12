
document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('doctorForm');
const submitBtn = document.getElementById('submitBtn');
const feedback = document.getElementById('feedback');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const colonias = [...document.querySelectorAll('.colonia-check:checked')].map(c => c.value);
  if (colonias.length === 0) {
    feedback.className = 'err';
    feedback.textContent = 'Selecciona al menos una zona que puedas cubrir.';
    feedback.style.display = 'block';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';
  feedback.style.display = 'none';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // 1. Crear su cuenta de acceso
  const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({ email, password });

  if (signUpError) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar registro';
    feedback.className = 'err';
    feedback.textContent = 'No se pudo crear tu cuenta: ' + signUpError.message;
    feedback.style.display = 'block';
    return;
  }

  // 2. Guardar su registro como médico pendiente de aprobación
  const payload = {
    auth_user_id: signUpData.user ? signUpData.user.id : null,
    nombre_completo: document.getElementById('nombre').value.trim(),
    cedula_profesional: document.getElementById('cedula').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    email,
    colonias,
  };

  const { error: insertError } = await supabaseClient.from('doctores').insert([payload]);

  submitBtn.disabled = false;
  submitBtn.textContent = 'Enviar registro';

  if (insertError) {
    feedback.className = 'err';
    feedback.textContent = 'No se pudo guardar tu registro. Intenta de nuevo.';
    console.error(insertError);
    return;
  }

  feedback.className = 'ok';
  feedback.textContent = 'Registro enviado. Te avisaremos por correo cuando tu cuenta sea aprobada.';
  form.reset();
});
