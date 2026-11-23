# Tablero Kanban · Ritmo

Plantilla de tarjetas para crear en **GitHub Projects** (pestaña *Projects* del repositorio → *New project* → plantilla *Board*).
Columnas: **Pendiente → En curso → Completado**. Cada tarjeta puede convertirse en *issue* y cerrarse desde el commit con `Closes #n`.

> Al entregar, **todas las tarjetas deben estar en «Completado»**. Los estados de abajo reflejan el trabajo que ya existe en el repositorio; marca como ☐ lo que aún no hayas hecho tú.

## Sesión 1 · Hito 1 · HTML semántico
- [x] Estructurar las 5 páginas con HTML5 semántico (`header`, `nav`, `main`, `section`, `form`)
- [x] Formularios con `label`, `fieldset` y atributos de validación nativa
- [x] Navegación lateral (tablet/escritorio) y barra inferior (móvil)

## Sesión 2 · Hito 1 · CSS mobile first
- [x] Variables CSS: paleta, tipografía y espaciados de la guía de Figma
- [x] Maquetación móvil → tablet (≥ 701 px) → escritorio (≥ 1001 px) con Grid y Flexbox
- [x] Componentes: tarjetas, chips, formularios, modales

## Sesión 3 · Hito 2 · Datos y validación
- [x] `mockData.js` y capa de acceso en `core.js`
- [x] Motor de validación en tiempo real (`validacion.js`) con mensajes propios en el DOM
- [x] Login, registro y crear evento conectados al motor

## Sesión 4 · Hito 2 · Renderizado e interacción
- [x] Renderizado dinámico del Dashboard y la ficha con `<template>`
- [x] Buscador en tiempo real + filtros por género
- [x] Menú hamburguesa, modales y toasts accesibles
- [x] Compra de entradas con control de stock

## Sesión 5 · Hito 3 · Pruebas, optimización y despliegue
- [x] Validar HTML y CSS con el validador W3C (0 errores)
- [x] Corregir desbordamiento horizontal en móvil (chips)
- [x] Corregir `<time>` vacío y lista `<dl>` inválida en el DOM renderizado
- [x] Añadir favicon y `404.html` (evitar 404 en consola)
- [x] Pruebas E2E con Playwright (21 comprobaciones, 0 errores de consola)
- [x] Workflow de GitHub Actions: validar + desplegar en Pages
- [ ] Publicar el sitio y comprobar la consola en la URL real
- [ ] Pasar Lighthouse sobre la URL desplegada y anotar la puntuación
- [ ] Comparar la web con el prototipo de Figma (tabla de fidelidad de la memoria)
- [ ] Pegar los enlaces reales (web, Figma, repo) en la memoria y el README
- [x] Redactar la memoria técnica (Markdown + PDF)
