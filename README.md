# Ritmo

Plataforma para descubrir conciertos y eventos de música en directo. Proyecto de Frontend con **HTML5, CSS3 y JavaScript ES6+** sin frameworks ni build.

- 🌐 **Web desplegada:** `https://<usuario>.github.io/<repositorio>/` _(pegar URL real)_
- 🎨 **Prototipo de Figma:** _(pegar enlace real)_
- 📄 **Memoria técnica:** [docs/MEMORIA.md](docs/MEMORIA.md) · [PDF](docs/Ritmo_Hito3_Memoria.pdf)
- 📋 **Tablero Kanban:** [KANBAN.md](KANBAN.md) · _(pegar enlace al GitHub Project)_

## Probar en local

No hace falta instalar nada: abre `index.html` con doble clic, o sirve la carpeta con la extensión **Live Server** de VS Code.

Cuenta de prueba: `marina@ritmo.com` / `Ritmo2026`.

## Calidad

```bash
# Validación W3C (HTML + CSS)
npm install --no-save vnu-jar
java -jar node_modules/vnu-jar/build/dist/vnu.jar --also-check-css *.html css/styles.css

# Pruebas funcionales (Playwright) – falla si hay errores en consola
npm install --no-save playwright http-server
npx http-server -p 8099 -s &
node tests/e2e.js
```

## Despliegue

Cada *push* a `main` ejecuta `.github/workflows/pages.yml`: valida con el W3C y publica en GitHub Pages
(Settings → Pages → Source: **GitHub Actions**). Alternativa: arrastrar la carpeta a [Netlify Drop](https://app.netlify.com/drop).

## Estructura

```
index.html · detalle.html · crear.html · login.html · registro.html · 404.html
css/styles.css
js/  mockData · core · modal · validacion · layout · dashboard · detalle · crear · auth
tests/e2e.js
docs/  MEMORIA.md · img/
```
