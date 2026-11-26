# 🧥 Mi Armario

App web para guardar tu ropa con foto y combinar outfits.
Hecha con **Astro + CSS propio (estilo MyOwnWardrobe) + Supabase**, hospedada gratis en **GitHub Pages**.

## Qué incluye

- **Cuenta y login** con email y contraseña (Supabase Auth).
- **Prendas con foto**: nombre, categoría, color y temporada. Las fotos se comprimen en el navegador antes de subirse.
- **Outfits**: selecciona varias prendas, ponle nombre y guárdalo.
- Cada usuario solo ve y borra sus propios datos (políticas RLS).

## Estructura

```
armario/
├── .github/workflows/deploy.yml   # despliegue automático en GitHub Pages
├── supabase/schema.sql            # tablas + políticas RLS + bucket de fotos
├── src/
│   ├── components/Icon.astro      # iconos SVG del diseño
│   ├── layouts/Layout.astro       # plantilla base con sidebar, topbar y sesión
│   ├── lib/
│   │   ├── supabase.ts            # cliente, sesión y tipos
│   │   └── wardrobe.ts            # consultas, subida y compresión de fotos
│   ├── pages/
│   │   ├── index.astro            # portada
│   │   ├── login.astro            # entrar / crear cuenta / recuperar contraseña
│   │   ├── armario.astro          # prendas (alta, listado, filtros, borrado)
│   │   └── outfits.astro          # combinar y guardar looks
│   └── styles/global.css
├── astro.config.mjs               # site/base calculados para GitHub Pages
└── .env.example                   # variables de Supabase (copia a .env)
```

## Puesta en marcha (una sola vez)

### 1. Supabase (5 minutos, plan gratis)

1. Crea el proyecto en <https://supabase.com> (Free plan).
2. En **SQL Editor** → pega y ejecuta el contenido de `supabase/schema.sql`.
3. En **Project Settings → API** copia:
   - `Project URL` → `PUBLIC_SUPABASE_URL`
   - `anon public` key → `PUBLIC_SUPABASE_ANON_KEY`
4. En **Authentication → URL Configuration**:
   - **Site URL**: `https://TU-USUARIO.github.io/` (o `https://TU-USUARIO.github.io/armario/` si el repo NO es un `.github.io`)
   - **Redirect URLs**: añade `https://TU-USUARIO.github.io/*` (y en local `http://localhost:4321/*`)

### 2. Variables de entorno en local

```powershell
Copy-Item .env.example .env   # Windows
# cp .env.example .env        # macOS / Linux
```

Rellena `.env` con tus valores. **Nunca subas `.env` a git** (ya está en `.gitignore`).

### 3. Ejecutar en local

```powershell
npm install
npm run dev
```

Abre <http://localhost:4321>. Para detener el servidor:

```powershell
astro dev stop
```

## Publicar en GitHub Pages

1. Crea el repositorio en GitHub (ej. `armario`) y sube el código:

   ```powershell
   git init
   git add .
   git commit -m "Mi Armario: primera versión"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/armario.git
   git push -u origin main
   ```

2. En el repo: **Settings → Pages → Source: GitHub Actions**.
3. Añade las variables de build (Settings → Secrets and variables → Actions → **Variables** → *New repository variable*):
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   (son dos valores públicos por diseño; por eso van como Variables y no como Secrets)
4. El workflow `.github/workflows/deploy.yml` compila y publica solo. La URL sale en
   **Settings → Pages** (algo así como `https://TU-USUARIO.github.io/armario/`).
5. Recuerda dejar esa URL en el **Site URL / Redirect URLs** de Supabase (paso 1.4).

> La `base` (subcarpeta) se calcula sola en `astro.config.mjs` a partir del nombre del
> repositorio, así que no hace falta tocar nada si el repo se llama distinto.

## Trabajar los dos en el mismo repo

1. Uno crea el repo y añade al otro en **Settings → Collaborators**.
2. Ambos trabajan en ramas y abren **Pull Requests** para revisar los cambios:

   ```powershell
   git checkout -b feat/nombre-del-cambio
   # ... trabajar ...
   git push -u origin feat/nombre-del-cambio
   ```

3. Tras el merge a `main`, GitHub Pages se redespliega solo.

## Solución de problemas

- **`Email rate limit exceeded` al registrarme**: el SMTP gratuito de Supabase solo envía ~2 emails/hora.
  Para un MVP, desactiva **Authentication → Providers → Email → Confirm email** y crea la cuenta sin verificación.
  Para producción, configura un SMTP propio (Resend, Gmail con app password, etc.).
- **`User already registered`**: el email ya existe (puede haberse creado antes de que fallara el email).
  Entra directamente o borra al usuario en **Authentication → Users**.
- **Las prendas no aparecen**: comprueba que ejecutaste `supabase/schema.sql` y que iniciaste sesión.

## Ideas para la siguiente iteración

- Compartir un armario entre las dos cuentas (tabla `armarios` con miembros).
- Planificador diario ("qué me pongo hoy") y calendario de uso.
- Login con Google (hay que habilitarlo en Supabase → Authentication → Providers).
- Favoritos, búsqueda por texto y estadísticas de uso.
