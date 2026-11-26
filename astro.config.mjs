// @ts-check
import { defineConfig } from 'astro/config';

// URL del sitio y base calculadas automáticamente para GitHub Pages:
// - repo "miusuario.github.io"  -> site https://miusuario.github.io, base "/"
// - repo "armario"              -> site https://miusuario.github.io, base "/armario"
// Se pueden sobrescribir con PUBLIC_SITE_URL / PUBLIC_BASE_PATH.
const [owner, repo] = (process.env.GITHUB_REPOSITORY ?? '').split('/');
const isUserSite = repo ? /\.github\.io$/i.test(repo) : true;
const site = process.env.PUBLIC_SITE_URL ?? (owner ? `https://${owner}.github.io` : undefined);
const base = process.env.PUBLIC_BASE_PATH ?? (isUserSite || !repo ? '/' : `/${repo}/`);

// https://astro.build/config
export default defineConfig({
  site,
  base
});
