/* ==========================================================================
   RITMO · Hito 2 · detalle.js
   Ficha de evento dinámica: detalle.html?id=<id del evento>
   - Rellena la ficha desde mockData con <template>
   - Selector de entradas y cantidad con total calculado en JS
   - Stock simulado (entradas vendidas guardadas en localStorage)
   - Compra con modal de confirmación y modal de éxito
   ========================================================================== */
(function () {
  'use strict';
  var R = window.Ritmo;
  var h = R.h;
  var F = R.formato;

  var MAX_POR_COMPRA = 6;
  var evento = null;
  var sel = { tipo: 0, cantidad: 1 };
  var ui = {};

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- Stock -------------------------------------------------------- */
  function vendidas(i) { return (R.almacen.leer('ventas', {}) || {})[evento.id + '|' + i] || 0; }
  function restantes(i) { return Math.max(0, evento.entradas[i].disponibles - vendidas(i)); }
  function maximo(i) { return Math.min(MAX_POR_COMPRA, restantes(i)); }

  /* ---------- Ficha -------------------------------------------------------- */
  function rellenarFicha(raiz) {
    var q = function (campo) { return raiz.querySelector('[data-campo="' + campo + '"]'); };
    var fecha = F.fechaCorta(evento.fecha);

    var img = q('imagen');
    img.src = evento.imagen;
    img.alt = 'Imagen de ' + evento.titulo;
    img.addEventListener('error', function () { img.remove(); });

    q('etiqueta').textContent = evento.etiqueta;
    q('eyebrow').textContent = fecha.dia + ' ' + F.mesLargo(evento.fecha) + (evento.recinto.ciudad ? ' · ' + evento.recinto.ciudad : '');

    // El título se parte antes de la última palabra, como en el diseño ("Neon Pulse / Festival")
    var titulo = q('titulo');
    var palabras = evento.titulo.split(/\s+/);
    if (palabras.length > 1) {
      titulo.appendChild(document.createTextNode(palabras.slice(0, -1).join(' ')));
      titulo.appendChild(document.createElement('br'));
      titulo.appendChild(document.createTextNode(palabras[palabras.length - 1]));
    } else {
      titulo.textContent = evento.titulo;
    }
    q('subtitulo').textContent = evento.subtitulo || '';

    var corazon = q('favorito');
    corazon.setAttribute('aria-label', 'Guardar ' + evento.titulo);
    corazon.setAttribute('data-evento-id', evento.id);
    corazon.checked = R.favoritos.tiene(evento.id);

    q('fecha').textContent = F.fechaLarga(evento.fecha);
    q('horario').textContent = evento.horaFin ? evento.hora + ' — ' + evento.horaFin : evento.hora;
    q('lugar').textContent = evento.lugar;

    q('tituloDescripcion').textContent = evento.tituloDescripcion || evento.titulo;
    q('descripcion').textContent = evento.descripcion;

    var lista = q('lineup');
    var plantillaArtista = $('tpl-artista');
    evento.lineup.forEach(function (a, i) {
      var li = plantillaArtista.content.cloneNode(true);
      var f = function (c) { return li.querySelector('[data-campo="' + c + '"]'); };
      f('num').textContent = (i < 9 ? '0' : '') + (i + 1);
      f('nombre').textContent = a.nombre;
      f('estilo').textContent = a.estilo;
      f('hora').textContent = a.hora;
      f('hora').setAttribute('datetime', a.hora);
      var hueco = f('foto');
      if (a.foto) {
        var foto = h('img', { src: a.foto, alt: 'Foto de ' + a.nombre, loading: 'lazy' });
        foto.addEventListener('error', function () { foto.replaceWith(h('span', { class: 'artist-list__avatar', 'aria-hidden': 'true', text: F.iniciales(a.nombre) })); });
        hueco.replaceWith(foto);
      } else {
        hueco.replaceWith(h('span', { class: 'artist-list__avatar', 'aria-hidden': 'true', text: F.iniciales(a.nombre) }));
      }
      lista.appendChild(li);
    });

    ui.tipos = q('tipos');
    ui.cantidades = q('cantidades');
    ui.maximo = q('maximo');
    ui.resumen = q('resumen');
    ui.total = q('total');
    ui.comprar = q('comprar');
    ui.form = raiz.querySelector('#form-compra');
  }

  /* ---------- Selector de entradas ---------------------------------------- */
  function pintarTipos() {
    ui.tipos.querySelectorAll('.ticket-option').forEach(function (n) { n.remove(); });
    evento.entradas.forEach(function (t, i) {
      var quedan = restantes(i);
      var radio = h('input', { class: 'visually-hidden', type: 'radio', name: 'tipo', value: i, id: 't-' + i });
      radio.checked = i === sel.tipo;
      radio.disabled = quedan === 0;
      var nota = quedan === 0 ? 'Agotadas' : quedan <= 10 ? 'Quedan ' + quedan : t.descripcion;
      ui.tipos.appendChild(h('label', { class: 'ticket-option' + (quedan === 0 ? ' is-soldout' : '') },
        radio,
        h('span', null, h('strong', { text: t.tipo }), h('small', { text: nota })),
        h('strong', { text: F.precio(t.precio) })
      ));
    });
  }

  function pintarCantidades() {
    var max = maximo(sel.tipo);
    if (sel.cantidad > max) sel.cantidad = Math.max(1, max);
    ui.cantidades.textContent = '';
    for (var n = 1; n <= MAX_POR_COMPRA; n++) {
      var radio = h('input', { class: 'visually-hidden', type: 'radio', name: 'cantidad', value: n, id: 'q' + n });
      radio.checked = n === sel.cantidad;
      radio.disabled = n > max;
      ui.cantidades.appendChild(h('label', { class: 'qty__opt' }, radio, h('span', { text: n })));
    }
    ui.maximo.textContent = max === 0 ? 'Sin entradas disponibles'
      : max < MAX_POR_COMPRA ? 'Máximo ' + max + (max === 1 ? ' entrada' : ' entradas') + ' (quedan pocas)'
      : 'Máximo ' + MAX_POR_COMPRA + ' entradas';
  }

  function total() { return evento.entradas[sel.tipo].precio * sel.cantidad; }

  function actualizarTotal() {
    var t = evento.entradas[sel.tipo];
    var agotado = restantes(sel.tipo) === 0;
    ui.total.textContent = F.precio(agotado ? 0 : total());
    ui.resumen.textContent = agotado ? t.tipo + ': entradas agotadas.' : sel.cantidad + ' × ' + t.tipo + ' (' + F.precio(t.precio) + ' cada una)';
    ui.comprar.disabled = agotado;
  }

  function refrescarTodo() {
    // Si el tipo elegido se agota, se pasa al primero que tenga stock
    if (restantes(sel.tipo) === 0) {
      var libre = evento.entradas.findIndex(function (_, i) { return restantes(i) > 0; });
      if (libre !== -1) sel.tipo = libre;
    }
    pintarTipos();
    pintarCantidades();
    actualizarTotal();
  }

  /* ---------- Compra -------------------------------------------------------- */
  function fila(etiqueta, valor, clase) {
    return h('div', { class: clase || null }, h('dt', { text: etiqueta }), h('dd', { text: valor }));
  }
  function resumenCompra() {
    var t = evento.entradas[sel.tipo];
    return h('dl', { class: 'modal__summary' },
      fila('Evento', evento.titulo),
      fila('Fecha', F.fechaLarga(evento.fecha) + ' · ' + evento.hora),
      fila('Recinto', evento.lugar),
      fila('Entradas', sel.cantidad + ' × ' + t.tipo),
      fila('Total', F.precio(total()), 'modal__summary-total')
    );
  }

  function comprar(ev) {
    ev.preventDefault();
    if (restantes(sel.tipo) < sel.cantidad) {
      R.toast('Ya no quedan tantas entradas de este tipo.', 'error');
      refrescarTodo();
      return;
    }
    var snapshot = { tipo: sel.tipo, cantidad: sel.cantidad, total: total() };

    R.modal.confirmar({
      tipo: 'entrada',
      eyebrow: 'Confirma tu compra',
      titulo: '¿Comprar ' + snapshot.cantidad + (snapshot.cantidad === 1 ? ' entrada' : ' entradas') + '?',
      mensaje: 'Revisa el resumen antes de pagar.',
      detalle: resumenCompra(),
      textoCancelar: 'Volver',
      textoConfirmar: 'Pagar ' + F.precio(snapshot.total)
    }).then(function (ok) {
      if (!ok) return;
      var ventas = R.almacen.leer('ventas', {}) || {};
      var clave = evento.id + '|' + snapshot.tipo;
      ventas[clave] = (ventas[clave] || 0) + snapshot.cantidad;
      R.almacen.guardar('ventas', ventas);

      var compras = R.almacen.leer('compras', []);
      compras.push({ eventoId: evento.id, titulo: evento.titulo, tipo: evento.entradas[snapshot.tipo].tipo, cantidad: snapshot.cantidad, total: snapshot.total, fecha: new Date().toISOString() });
      R.almacen.guardar('compras', compras);

      return R.modal.aviso({
        tipo: 'exito',
        eyebrow: 'Compra completada',
        titulo: 'Tu noche ya tiene ritmo',
        mensaje: 'Hemos enviado tus entradas a tu email. También puedes verlas en “Mis entradas”.',
        cerrable: false,
        botones: [
          { id: 'seguir', texto: 'Seguir en el evento', variante: 'secondary' },
          { id: 'inicio', texto: 'Volver al inicio', variante: 'primary', foco: true }
        ]
      }).then(function (id) {
        if (id === 'inicio') { window.location.href = 'index.html'; return; }
        sel.cantidad = 1;
        refrescarTodo();
      });
    });
  }

  /* ---------- Inicio --------------------------------------------------------- */
  function iniciar() {
    var contenedor = $('detalle-contenido');
    if (!contenedor) return;

    var id = new URLSearchParams(window.location.search).get('id');
    // Sin ?id= se muestra el primer evento, para que detalle.html funcione abierto a mano
    evento = id ? R.datos.evento(id) : R.datos.eventos()[0];

    if (!evento) {
      $('detalle-vacio').hidden = false;
      document.title = 'Ritmo · Evento no encontrado';
      return;
    }

    document.title = 'Ritmo · ' + evento.titulo;
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', evento.titulo + ', ' + F.fechaCompleta(evento.fecha) + ' en ' + evento.lugar + '. Line-up, horarios y entradas.');

    var raiz = $('tpl-detalle').content.cloneNode(true);
    rellenarFicha(raiz);
    contenedor.appendChild(raiz);

    refrescarTodo();
    ui.form.addEventListener('change', function (ev) {
      var t = ev.target;
      if (t.name === 'tipo') { sel.tipo = Number(t.value); pintarCantidades(); actualizarTotal(); }
      if (t.name === 'cantidad') { sel.cantidad = Number(t.value); actualizarTotal(); }
    });
    ui.form.addEventListener('submit', comprar);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
