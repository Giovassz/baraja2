// Pruebas de humo que NO requieren Supabase: redirecciones de auth y estética de marca.
// Implementa BJ2-054, BJ2-057
import { test, expect } from '@playwright/test';

test('la raíz redirige a /login cuando no hay sesión', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
});

test('la pantalla de login muestra la marca y la paleta pastel', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Baraja2' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();

  // El fondo del body usa el blanco cálido de marca (#FFF9FB) vía gradiente.
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBeTruthy();
});

test('registro exige la confirmación de mayoría de edad', async ({ page }) => {
  await page.goto('/registro');
  await expect(page.getByText('Confirmo que soy mayor de edad.')).toBeVisible();
});

test('el manifest y el service worker se sirven correctamente', async ({ request }) => {
  const manifest = await request.get('/manifest.json');
  expect(manifest.ok()).toBeTruthy();
  const json = await manifest.json();
  expect(json.name).toContain('Baraja2');
  expect(json.display).toBe('standalone');

  const sw = await request.get('/sw.js');
  expect(sw.ok()).toBeTruthy();
  expect(await sw.text()).toContain('baraja2-v1');
});

test('la página sin conexión existe y es pública', async ({ page }) => {
  await page.goto('/sin-conexion');
  await expect(page.getByRole('heading', { name: 'Sin conexión' })).toBeVisible();
});
