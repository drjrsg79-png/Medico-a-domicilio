# Médico a Domicilio — guía de instalación

Sitio: landing pública con formulario (`index.html`) + panel privado para ti (`admin.html`).

## 1. Supabase (base de datos)

1. Entra a supabase.com → tu proyecto (o crea uno nuevo, región recomendada: `us-east` o `sa-east` para menor latencia con México).
2. Ve a **SQL Editor** → pega todo el contenido de `supabase.sql` → **Run**.
   - Esto crea la tabla `solicitudes` y las reglas de seguridad (pacientes pueden crear solicitudes, solo tú puedes verlas y actualizarlas).
3. Ve a **Authentication → Users → Add user** y crea tu propio usuario (correo y contraseña) — con eso entrarás al panel `admin.html`.
4. Ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon public key`
5. Pégalos en `js/config.js`, reemplazando `PEGA_AQUI_TU_SUPABASE_URL` y `PEGA_AQUI_TU_SUPABASE_ANON_KEY`.

## 2. GitHub (código)

```bash
cd medico-domicilio
git init
git add .
git commit -m "Sitio médico a domicilio"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/medico-domicilio.git
git push -u origin main
```

(O simplemente crea un repo nuevo en GitHub y sube estos archivos desde la web con "Add file → Upload files".)

## 3. Netlify (hosting)

- **Opción A — Zip:** en Netlify, arrastra la carpeta completa (o el .zip) a "Deploys" → listo, no necesita build ni configuración, es HTML puro.
- **Opción B — Conectado a GitHub (recomendado):** Netlify → "Add new site" → "Import from Git" → selecciona el repo. No hay build command ni carpeta especial que configurar; el sitio se sirve tal cual.

## 4. Tu dominio

En Netlify: **Site settings → Domain management → Add a domain** → escribe tu dominio → sigue las instrucciones para apuntar los DNS (Netlify te da los registros, normalmente un registro `A` o `CNAME` que agregas donde compraste el dominio). El HTTPS se activa solo, gratis, en unos minutos.

## Cómo usarlo día a día

- Pacientes entran a tu dominio → llenan el formulario → la solicitud cae en Supabase.
- Tú entras a `tudominio.com/admin.html`, inicias sesión con el usuario que creaste en el paso 1.3, y ves todas las solicitudes en tiempo real: puedes marcarlas como Pendiente / Confirmado / En camino / Completado / Cancelado.
- Para agregar más colonias en el futuro: edita el `<select>` en `index.html` y el `check` de la columna `colonia` en Supabase (Table Editor → columna `colonia` → editar constraint).

## Notas

- Cambia el número de teléfono de ejemplo (`tel:+525500000000`) en `index.html` por el tuyo, en dos lugares.
- Si en el futuro quieres varios médicos, se le agrega una tabla `doctores` y una columna `doctor_id` en `solicitudes` — avísame cuando llegues ahí y lo ampliamos.
