// Flujo end-to-end de una pareja: registro -> vinculación -> juego de una semana -> historial.
// Implementa BJ2-054, BJ2-055
//
// Requiere un backend real (Supabase local o de pruebas) con el catálogo cargado.
// Actívalo con la variable de entorno E2E_BACKEND_LISTO=1:
//   supabase start
//   npm run importar-catalogo
//   E2E_BACKEND_LISTO=1 npm run test:e2e -- pareja-semana-completa
import { test, expect } from '@playwright/test';

const backendListo = process.env.E2E_BACKEND_LISTO === '1';

test.describe('una semana completa en pareja', () => {
  test.skip(!backendListo, 'Necesita Supabase con catálogo cargado (E2E_BACKEND_LISTO=1).');

  const sello = Date.now();
  const ana = { nombre: 'Ana', email: `ana+${sello}@baraja2.test`, password: 'contrasena123' };
  const luis = { nombre: 'Luis', email: `luis+${sello}@baraja2.test`, password: 'contrasena123' };

  async function registrar(page: import('@playwright/test').Page, u: typeof ana) {
    await page.goto('/registro');
    await page.getByLabel('Tu nombre').fill(u.nombre);
    await page.getByLabel('Correo').fill(u.email);
    await page.getByLabel('Contraseña').fill(u.password);
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(page).toHaveURL(/\/vincular$/);
  }

  test('registro, vinculación, jugar y cumplir una carta, historial', async ({ browser }) => {
    const ctxAna = await browser.newContext();
    const ctxLuis = await browser.newContext();
    const pageAna = await ctxAna.newPage();
    const pageLuis = await ctxLuis.newPage();

    // 1. Ana crea el espacio
    await registrar(pageAna, ana);
    await pageAna.getByRole('link', { name: 'Crear un espacio nuevo' }).click();
    await pageAna.getByRole('button', { name: 'Presencial' }).click();
    await pageAna.getByRole('button', { name: 'Continuar' }).click();
    await pageAna.getByLabel('Nombre del espacio').fill('Nuestro rincón');
    await pageAna.getByRole('button', { name: 'Crear espacio' }).click();
    await expect(pageAna).toHaveURL(/\/avatar$/);
    await pageAna.locator('button[title]').first().click();
    await pageAna.getByRole('button', { name: 'Continuar' }).click();

    const codigo = (await pageAna.locator('text=/^[A-Z0-9]{6}$/').first().textContent())?.trim();
    expect(codigo).toBeTruthy();

    // 2. Luis se une con el código
    await registrar(pageLuis, luis);
    await pageLuis.getByRole('button', { name: 'Tengo un código de invitación' }).click();
    await pageLuis.getByPlaceholder('ABC123').fill(codigo!);
    await pageLuis.getByRole('button', { name: 'Unirme' }).click();
    await expect(pageLuis).toHaveURL(/\/avatar$/);
    await pageLuis.locator('button[title]').first().click();
    await pageLuis.getByRole('button', { name: 'Continuar' }).click();
    await expect(pageLuis).toHaveURL(/\/dashboard$/);

    // 3. Ana juega una carta
    await pageAna.goto('/dashboard');
    await expect(pageAna.getByText('Tus 5 cartas')).toBeVisible();
    await pageAna.getByRole('button', { name: /^Jugar/ }).first().click();

    // 4. Luis la confirma
    await pageLuis.goto('/dashboard');
    await expect(pageLuis.getByText('Retos que te jugaron')).toBeVisible();
    await pageLuis.getByRole('button', { name: 'Marcar como cumplida' }).first().click();

    // 5. El historial de ambos registra el evento
    await pageAna.goto('/historial');
    await expect(pageAna.getByText('Carta cumplida').first()).toBeVisible();
    await pageLuis.goto('/historial');
    await expect(pageLuis.getByText('Carta cumplida').first()).toBeVisible();

    await ctxAna.close();
    await ctxLuis.close();
  });
});
