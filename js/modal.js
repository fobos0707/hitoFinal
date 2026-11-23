/* ==========================================================================
   RITMO · Hito 2 · modal.js
   Modales y avisos interactivos reutilizables.
     Ritmo.modal.confirmar({...})  -> Promise<boolean>
     Ritmo.modal.aviso({...})      -> Promise<string>  (id del botón pulsado)
     Ritmo.toast('mensaje')        -> aviso efímero (aria-live)
   Accesibilidad: role="dialog", aria-modal, foco atrapado con Tab,
   cierre con Esc / clic en el fondo y foco devuelto al elemento anterior.
   ========================================================================== */
(function () {
  'use strict';
  var R = window.Ritmo;
  var h = R.h;

  var abierto = null; // solo hay un modal a la vez

  var ICONO_TIPO = { exito: 'check', aviso: 'alerta', peligro: 'salir', info: 'info', entrada: 'entrada' };

  function enfocables(raiz) {
    return Array.prototype.slice.call(raiz.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter(function (el) { return !el.disabled && !el.hidden; });
  }

  /**
   * opciones:
   *   tipo      'exito' | 'aviso' | 'peligro' | 'info' | 'entrada'
   *   eyebrow   texto pequeño en coral sobre el título
   *   titulo    título (obligatorio)
   *   mensaje   texto o nodo
   *   detalle   nodo extra (p. ej. resumen de compra)
   *   botones   [{ id, texto, variante: 'primary'|'secondary'|'danger', foco: true }]
   *   cerrable  (por defecto true) permite Esc y clic en el fondo; resuelve 'cancelar'
   */
  function abrir(opciones) {
    if (abierto) abierto.cerrar('cancelar');

    var o = Object.assign({ tipo: 'info', cerrable: true, botones: [{ id: 'ok', texto: 'Entendido', variante: 'primary' }] }, opciones);
    var idTitulo = 'modal-titulo';
    var idTexto = 'modal-texto';
    var anterior = document.activeElement;

    return new Promise(function (resolver) {
      var botones = o.botones.map(function (b) {
        var clase = 'btn ' + (b.variante === 'secondary' ? 'btn--secondary' : b.variante === 'danger' ? 'btn--danger' : 'btn--primary') + ' btn--block';
        return h('button', { class: clase, type: 'button', 'data-id': b.id, text: b.texto, onclick: function () { cerrar(b.id); } });
      });

      var texto = o.mensaje ? h('p', { id: idTexto }, o.mensaje) : null;
      var dialogo = h('section', { class: 'success-modal success-modal--' + o.tipo, tabindex: '-1' },
        h('span', { class: 'success-modal__icon' }, R.icono(ICONO_TIPO[o.tipo] || 'info', 28)),
        o.eyebrow ? h('span', { class: 'eyebrow eyebrow--coral', text: o.eyebrow }) : null,
        h('h2', { id: idTitulo, text: o.titulo }),
        texto,
        o.detalle || null,
        h('div', { class: 'modal__actions' }, botones)
      );

      var raiz = h('div', {
        class: 'modal is-open', role: o.tipo === 'peligro' || o.tipo === 'aviso' ? 'alertdialog' : 'dialog',
        'aria-modal': 'true', 'aria-labelledby': idTitulo, 'aria-describedby': texto ? idTexto : null
      },
        h('div', { class: 'modal__backdrop', onclick: function () { if (o.cerrable) cerrar('cancelar'); } }),
        dialogo
      );

      function teclado(ev) {
        if (ev.key === 'Escape' && o.cerrable) { ev.preventDefault(); cerrar('cancelar'); return; }
        if (ev.key !== 'Tab') return;
        var lista = enfocables(raiz);
        if (!lista.length) { ev.preventDefault(); return; }
        var primero = lista[0], ultimo = lista[lista.length - 1];
        if (ev.shiftKey && document.activeElement === primero) { ev.preventDefault(); ultimo.focus(); }
        else if (!ev.shiftKey && document.activeElement === ultimo) { ev.preventDefault(); primero.focus(); }
      }

      function cerrar(resultado) {
        if (abierto !== api) return;
        abierto = null;
        document.removeEventListener('keydown', teclado, true);
        raiz.remove();
        document.body.classList.remove('has-modal');
        if (anterior && typeof anterior.focus === 'function' && document.contains(anterior)) anterior.focus();
        resolver(resultado);
      }

      var api = { cerrar: cerrar };
      abierto = api;
      document.body.appendChild(raiz);
      document.body.classList.add('has-modal');
      document.addEventListener('keydown', teclado, true);

      var inicial = null;
      o.botones.forEach(function (b, i) { if (b.foco) inicial = botones[i]; });
      (inicial || botones[0] || dialogo).focus();
    });
  }

  function confirmar(opciones) {
    var o = Object.assign({
      tipo: 'aviso',
      botones: [
        { id: 'cancelar', texto: opciones && opciones.textoCancelar || 'Cancelar', variante: 'secondary' },
        { id: 'confirmar', texto: opciones && opciones.textoConfirmar || 'Confirmar', variante: opciones && opciones.tipo === 'peligro' ? 'danger' : 'primary', foco: true }
      ]
    }, opciones);
    return abrir(o).then(function (id) { return id === 'confirmar'; });
  }

  function aviso(opciones) { return abrir(opciones); }

  /* ---------- Toast ------------------------------------------------------ */
  var region = null;
  function toast(mensaje, tipo) {
    if (!region) {
      region = h('div', { class: 'toast-region', 'aria-live': 'polite', 'aria-atomic': 'false' });
      document.body.appendChild(region);
    }
    var t = h('p', { class: 'toast' + (tipo ? ' toast--' + tipo : ''), role: 'status' }, mensaje);
    region.appendChild(t);
    setTimeout(function () {
      t.classList.add('is-leaving');
      setTimeout(function () { t.remove(); }, 250);
    }, 2800);
  }

  R.modal = { abrir: abrir, confirmar: confirmar, aviso: aviso };
  R.toast = toast;
})();
