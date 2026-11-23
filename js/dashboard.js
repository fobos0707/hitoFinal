/* ==========================================================================
   RITMO · Hito 2 · dashboard.js
   - Renderiza las tarjetas del dashboard desde mockData (<template> + DOM)
   - Filtro por género (chips) y buscador en tiempo real, combinables
   ========================================================================== */
(function () {
  'use strict';
  var R = window.Ritmo;
  var h = R.h;
  var F = R.formato;

  var estado = { texto: '', categoria: 'todos' };
  var todos = [];

  var $ = function (id) { return document.getElementById(id); };
  var el = {};

  /* ---------- Tarjeta a partir del <template> ----------------------------- */
  function crearTarjeta(e, grande) {
    var nodo = el.plantilla.content.cloneNode(true);
    var q = function (campo) { return nodo.querySelector('[data-campo="' + campo + '"]'); };
    var tarjeta = nodo.querySelector('.event-card');
    var fecha = F.fechaCorta(e.fecha);

    var img = q('imagen');
    img.src = e.imagen;
    // Si la imagen no carga se queda el fondo oscuro de la tarjeta
    img.addEventListener('error', function () { img.remove(); });

    q('etiqueta').textContent = e.etiqueta;
    q('dia').textContent = fecha.dia;
    q('mes').textContent = fecha.mes;
    var enlace = q('enlace');
    enlace.textContent = e.titulo;
    enlace.href = e.href;
    q('lugar').textContent = e.lugar;
    var hora = q('hora');
    hora.textContent = e.hora;
    hora.setAttribute('datetime', e.hora);
    q('precio').textContent = F.precio(e.precioDesde);

    var corazon = q('favorito');
    corazon.setAttribute('aria-label', 'Guardar ' + e.titulo);
    corazon.setAttribute('data-evento-id', e.id);
    corazon.checked = R.favoritos.tiene(e.id);

    var distintivo = q('destacado');
    if (grande) tarjeta.classList.add('event-card--featured'); else distintivo.remove();
    return nodo;
  }

  /* ---------- Filtrado ----------------------------------------------------- */
  function textoBuscable(e) {
    return F.normalizar([
      e.titulo, e.etiqueta, e.categoria, e.recinto.nombre, e.recinto.ciudad, F.mesLargo(e.fecha),
      e.lineup.map(function (a) { return a.nombre; }).join(' ')
    ].join(' '));
  }
  function coincideTexto(e) {
    if (!estado.texto) return true;
    var palabras = F.normalizar(estado.texto).split(/\s+/);
    var pajar = textoBuscable(e);
    return palabras.every(function (p) { return pajar.indexOf(p) !== -1; });
  }
  function coincideCategoria(e) { return estado.categoria === 'todos' || e.categoria === estado.categoria; }

  /* ---------- Pintado ------------------------------------------------------ */
  function pintarDestacados() {
    var lista = todos.filter(function (e) { return e.destacado && coincideTexto(e); });
    el.destacados.textContent = '';
    el.seccionDestacados.hidden = lista.length === 0;
    if (!lista.length) return;

    el.destacados.classList.toggle('featured-grid--solo', lista.length === 1);
    el.destacados.appendChild(crearTarjeta(lista[0], true));
    if (lista.length > 1) {
      var mini = h('div', { class: 'mini-events' });
      lista.slice(1, 3).forEach(function (e) { mini.appendChild(crearTarjeta(e, false)); });
      el.destacados.appendChild(mini);
    }
  }

  function pintarLista() {
    var lista = todos.filter(function (e) { return coincideTexto(e) && coincideCategoria(e); });
    el.lista.textContent = '';
    var frag = document.createDocumentFragment();
    lista.forEach(function (e) {
      frag.appendChild(h('li', { 'data-category': e.categoria }, crearTarjeta(e, false)));
    });
    el.lista.appendChild(frag);

    el.contador.textContent = lista.length === todos.length
      ? todos.length + ' eventos'
      : lista.length + ' de ' + todos.length + ' eventos';

    var vacio = lista.length === 0;
    el.sinResultados.hidden = !vacio;
    el.lista.hidden = vacio;
    if (vacio) {
      var partes = [];
      if (estado.texto) partes.push('«' + estado.texto + '»');
      if (estado.categoria !== 'todos') partes.push('el género ' + (R.datos.categoria(estado.categoria) || {}).nombre);
      el.sinResultadosTexto.textContent = 'No hay eventos que coincidan con ' + partes.join(' en ') + '.';
    }
  }

  function pintar() { pintarDestacados(); pintarLista(); }

  /* ---------- Chips de género ---------------------------------------------- */
  function pintarFiltros() {
    var opciones = [{ slug: 'todos', nombre: 'Todos' }].concat(R.datos.categorias());
    el.filtros.textContent = '';
    opciones.forEach(function (c) {
      var radio = h('input', { class: 'visually-hidden', type: 'radio', name: 'filtro', id: 'f-' + c.slug, value: c.slug });
      if (c.slug === estado.categoria) radio.checked = true;
      radio.addEventListener('change', function () {
        estado.categoria = c.slug;
        pintarLista();
      });
      el.filtros.appendChild(h('li', null, h('label', { class: 'chip' }, radio, c.nombre)));
    });
  }

  function limpiar() {
    estado.texto = '';
    estado.categoria = 'todos';
    el.buscador.value = '';
    var radio = $('f-todos');
    if (radio) radio.checked = true;
    pintar();
    el.buscador.focus();
  }

  /* ---------- Inicio --------------------------------------------------------- */
  function iniciar() {
    el.plantilla = $('tpl-evento');
    el.destacados = $('destacados');
    el.seccionDestacados = $('seccion-destacados');
    el.lista = $('lista-eventos');
    el.filtros = $('filtros');
    el.contador = $('contador');
    el.sinResultados = $('sin-resultados');
    el.sinResultadosTexto = $('sin-resultados-texto');
    el.buscador = $('buscador');
    if (!el.plantilla || !el.lista) return;

    todos = R.datos.eventos();

    // Búsqueda inicial desde la URL (?q=...) y foco desde el botón "Buscar" del móvil
    var q = new URLSearchParams(window.location.search).get('q');
    if (q) { estado.texto = q.trim(); el.buscador.value = q; }

    pintarFiltros();
    pintar();

    el.buscador.addEventListener('input', function () {
      estado.texto = el.buscador.value.trim();
      pintar();
    });
    // Enter en el buscador no recarga la página
    $('form-buscador').addEventListener('submit', function (ev) { ev.preventDefault(); });
    $('limpiar-filtros').addEventListener('click', limpiar);

    function enfocarSiHash() { if (window.location.hash === '#buscador') el.buscador.focus(); }
    enfocarSiHash();
    window.addEventListener('hashchange', enfocarSiHash);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
