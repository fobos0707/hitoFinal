/* Pruebas E2E de Ritmo con Playwright.
 * Uso:  npx http-server -p 8099 -s &   ;   node tests/e2e.js [http://localhost:8099]
 * Falla si hay cualquier error/aviso de consola, excepción JS o petición propia fallida. */
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8099';
let ok = 0, fail = 0;
const check = (cond, msg) => { cond ? ok++ : (fail++, console.log('  ✗ ' + msg)); if (cond) console.log('  ✓ ' + msg); };

async function nuevaPagina(browser, viewport, errores) {
  const ctx = await browser.newContext({ viewport });
  // Recursos externos (Unsplash, Google Fonts) se sustituyen por un stub para que la prueba sea determinista y sin red
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.request().resourceType() === 'image'
    ? r.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"/>' })
    : r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const pg = await ctx.newPage();
  pg.on('console', m => ['error', 'warning'].includes(m.type()) && errores.push(m.type() + ': ' + m.text()));
  pg.on('pageerror', e => errores.push('pageerror: ' + e.message));
  pg.on('requestfailed', r => errores.push('requestfailed: ' + r.url()));
  pg.on('response', r => r.status() >= 400 && errores.push(r.status() + ' ' + r.url()));
  return pg;
}

(async () => {
  const browser = await chromium.launch();
  const errores = [];

  console.log('\n[Dashboard · escritorio]');
  let pg = await nuevaPagina(browser, { width: 1440, height: 900 }, errores);
  await pg.goto(BASE + '/index.html');
  check(await pg.locator('#lista-eventos > li').count() === 9, '9 tarjetas renderizadas desde mockData');
  check(await pg.locator('#destacados article').count() === 3, '3 destacados (1 grande + 2 pequeños)');
  check(await pg.locator('#filtros label.chip').count() === 6, '6 chips de género');
  await pg.fill('#buscador', 'electronica');
  check(await pg.locator('#lista-eventos > li:visible').count() > 0, 'buscador ignora tildes/mayúsculas');
  await pg.fill('#buscador', 'zzzz');
  check(await pg.locator('#sin-resultados').isVisible(), 'estado "sin resultados" visible');
  await pg.click('#limpiar-filtros');
  check(await pg.locator('#lista-eventos > li:visible').count() === 9, '«Limpiar filtros» restaura los 9 eventos');
  await pg.locator('#filtros label.chip', { hasText: 'Rock' }).click();
  check(await pg.locator('#lista-eventos > li:visible').count() === 2, 'filtro Rock = 2 eventos');
  const corazon = pg.locator('#lista-eventos .heart-button').first();
  await corazon.click();
  check(await pg.locator('[role=status], .toast').first().isVisible().catch(() => false), 'favorito muestra aviso (toast)');

  console.log('\n[Menú móvil · 390px]');
  pg = await nuevaPagina(browser, { width: 390, height: 844 }, errores);
  await pg.goto(BASE + '/index.html');
  const tog = pg.locator('.mobile-menu__toggle');
  await tog.click();
  check(await tog.getAttribute('aria-expanded') === 'true' && await pg.locator('#menu-movil').isVisible(), 'menú se abre (aria-expanded=true)');
  await pg.keyboard.press('Escape');
  check(await tog.getAttribute('aria-expanded') === 'false', 'Esc cierra el menú');
  check(await pg.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'sin desbordamiento horizontal');

  console.log('\n[Login / Registro]');
  pg = await nuevaPagina(browser, { width: 1280, height: 800 }, errores);
  await pg.goto(BASE + '/login.html');
  await pg.fill('#email', 'mal'); await pg.press('#email', 'Tab');
  check(await pg.locator('.field__error:visible').count() >= 1, 'email inválido → mensaje propio en el DOM');
  check(await pg.evaluate(() => document.getElementById('form-login').noValidate), 'novalidate (sin tooltips nativos)');
  await pg.click('#rellenar-demo');
  await Promise.all([pg.waitForURL('**/index.html'), pg.click('#form-login button[type=submit]')]);
  check(true, 'login correcto redirige a index.html');
  await pg.goto(BASE + '/registro.html');
  await pg.fill('#nombre', 'Ana Ruiz'); await pg.fill('#email', 'ana@test.es'); await pg.fill('#password', 'abc');
  await pg.click('#form-registro button[type=submit]');
  check(await pg.locator('.field__error:visible').count() >= 1, 'contraseña débil rechazada');
  await pg.fill('#password', 'Segura2026');
  await pg.click('#form-registro button[type=submit]');
  check(await pg.locator('[role=dialog], [role=alertdialog]').isVisible(), 'registro correcto → modal de éxito');

  console.log('\n[Crear evento]');
  pg = await nuevaPagina(browser, { width: 1280, height: 900 }, errores);
  await pg.goto(BASE + '/crear.html');
  await pg.click('#form-crear button[type=submit]');
  check(await pg.locator('.field__error:visible').count() >= 8, 'envío vacío marca todos los campos');
  check(await pg.evaluate(() => document.activeElement && document.activeElement.id === 'titulo'), 'foco al primer campo inválido');

  console.log('\n[Detalle + compra]');
  pg = await nuevaPagina(browser, { width: 1280, height: 900 }, errores);
  await pg.goto(BASE + '/detalle.html?id=neon-pulse');
  check((await pg.locator('h1').first().textContent()).includes('Neon Pulse'), 'ficha dinámica por ?id=');
  await pg.click('#form-compra button[type=submit]');
  check(await pg.locator('[role=dialog], [role=alertdialog]').isVisible(), 'comprar abre modal de confirmación');
  await pg.goto(BASE + '/detalle.html?id=no-existe');
  check(await pg.locator('#detalle-vacio').isVisible(), 'id desconocido → pantalla «no encontrado»');

  await browser.close();
  console.log('\nErrores de consola/red propios: ' + errores.length);
  errores.forEach(e => console.log('  ! ' + e));
  console.log(`\n${ok} comprobaciones OK, ${fail} fallidas`);
  process.exit(fail || errores.length ? 1 : 0);
})();
