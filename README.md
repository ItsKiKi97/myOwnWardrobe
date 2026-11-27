# 🧥 Mi Armario

App web para guardar tu ropa con foto y combinar outfits.
Hecha con **Astro + CSS propio (estilo MyOwnWardrobe) + Supabase**, hospedada gratis en **GitHub Pages**.

## Qué incluye

- **Cuenta y login** con email y contraseña (Supabase Auth).
- **Prendas con foto**: nombre, categoría, color y temporada. Las fotos se comprimen en el navegador antes de subirse.
- **Quitar fondo**: opción al añadir/editar prenda que recorta la prenda en el navegador y guarda un PNG transparente (la primera vez descarga ~40 MB del modelo).
- **Edición completa**: pulsa una tarjeta para cambiar cualquier campo o la foto.
- **Dress Me**: 4 filas de prendas, botón «Mezclar» y filtros por temporada para crear looks.
- **Confirmaciones dentro de la app**: al borrar prendas u outfits no aparece el diálogo del navegador, sino un modal propio.
- **PWA instalable**: manifiesto, iconos y service worker; la interfaz abre offline. Los datos siguen necesitando conexión.
- **Tema claro/oscuro** con preferencia guardada.
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
│   │   ├── confirm.ts             # modal de confirmación propio
│   │   └── wardrobe.ts            # consultas, subida, compresión y recorte de fotos
│   ├── pages/
│   │   ├── index.astro            # portada
│   │   ├── login.astro            # entrar / crear cuenta / recuperar contraseña
│   │   ├── armario.astro          # prendas (alta, listado, filtros, borrado)
│   │   └── outfits.astro          # combinar y guardar looks
│   └── styles/global.css
├── public/
│   ├── manifest.webmanifest       # manifiesto PWA (iconos, nombre, atajos)
│   ├── sw.js                      # service worker (app shell offline)
│   ├── icon.svg / icon-192.png / icon-512.png
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
   - **Site URL**: `https://itskiki97.github.io/myOwnWardrobe/`
   - **Redirect URLs**: añade `https://itskiki97.github.io/myOwnWardrobe/**` (y en local `http://localhost:4321/*`)

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

## PWA (instalar en el móvil)

El service worker solo se registra en producción (o con `npm run preview`), para que no interfiera con el recarga en caliente de `npm run dev`. Para probarlo en local:

```powershell
npm run build
npm run preview
```

En Chrome/Edge abre la URL, espera a que cargue y pulsa **Instalar aplicación** en la barra o en el menú del navegador. En iOS: **Compartir → Añadir a pantalla de inicio**.

Lo que funciona offline es la interfaz (páginas, CSS, JS e iconos). Las prendas, fotos y outfits siguen viniendo de Supabase, así que necesitan conexión. El service worker nunca guarda peticiones de Supabase ni de Google Fonts.

## Publicar en GitHub Pages

1. Crea el repositorio en GitHub (ej. `armario`) y sube el código:

   ```powershell
   git init
   git add .
   git commit -m "Mi Armario: primera versión"
   git branch -M main
   git remote add origin https://github.com/ItsKiKi97/myOwnWardrobe.git
   git push -u origin main
   ```

2. En el repo: **Settings → Pages → Source: GitHub Actions**.
3. Añade las variables de build (Settings → Secrets and variables → Actions → **Variables** → *New repository variable*):
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   (son dos valores públicos por diseño; por eso van como Variables y no como Secrets)
4. El workflow `.github/workflows/deploy.yml` compila y publica solo. La URL sale en
   **Settings → Pages** (actualmente `https://itskiki97.github.io/myOwnWardrobe/`).
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
