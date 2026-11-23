/* ==========================================================================
   RITMO · Hito 2 · layout.js
   Comportamiento común de las páginas con navegación (index, crear, detalle):
   1. Menú hamburguesa del móvil (abre/cierra, Esc, clic fuera, resize)
   2. Cerrar sesión con modal de confirmación
   3. Chip de usuario con los datos de la sesión
   4. Botón corazón (favoritos) con aviso toast
   ========================================================================== */
(function () {
  'use strict';
  var R = window.Ritmo;

  /* 1. Menú hamburguesa ---------------------------------------------------- */
  function iniciarMenu() {
    var contenedor = document.querySelector('.mobile-menu');
    if (!contenedor) return;
    var boton = contenedor.querySelector('.mobile-menu__toggle');
    var menu = contenedor.querySelector('.mobile-menu__nav');
    var trazo = boton.querySelector('path');
    var D_ABRIR = 'M4 6h16M4 12h16M4 18h16';
    var D_CERRAR = 'M6 6l12 12M18 6 6 18';

    function estaAbierto() { return !menu.hidden; }
    function fijar(abrir, devolverFoco) {
      menu.hidden = !abrir;
      boton.setAttribute('aria-expanded', String(abrir));
      boton.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
      trazo.setAttribute('d', abrir ? D_CERRAR : D_ABRIR);
      document.body.classList.toggle('menu-open', abrir);
      if (!abrir && devolverFoco) boton.focus();
    }

    boton.addEventListener('click', function () { fijar(!estaAbierto()); });
    // Clic en un enlace del menú: se cierra (útil si es un ancla de la misma página)
    menu.addEventListener('click', function (ev) { if (ev.target.closest('a')) fijar(false); });
    // Clic fuera del menú
    document.addEventListener('click', function (ev) {
      if (estaAbierto() && !contenedor.contains(ev.target)) fijar(false);
    });
    // Escape
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && estaAbierto()) fijar(false, true);
    });
    // Al pasar a tablet/escritorio el menú móvil deja de existir: se resetea
    var mq = window.matchMedia('(min-width: 701px)');
    var alCambiar = function (e) { if (e.matches) fijar(false); };
    if (mq.addEventListener) mq.addEventListener('change', alCambiar); else mq.addListener(alCambiar);
  }

  /* 2. Cerrar sesión ------------------------------------------------------- */
  function iniciarCerrarSesion() {
    document.querySelectorAll('[data-accion="cerrar-sesion"]').forEach(function (enlace) {
      enlace.addEventListener('click', function (ev) {
        ev.preventDefault();
        R.modal.confirmar({
          tipo: 'peligro',
          eyebrow: 'Cerrar sesión',
          titulo: '¿Seguro que quieres salir?',
          mensaje: 'Tendrás que volver a introducir tu email y contraseña para entrar.',
          textoCancelar: 'Quedarme',
          textoConfirmar: 'Cerrar sesión'
        }).then(function (ok) {
          if (!ok) return;
          R.sesion.cerrar();
          window.location.href = 'login.html';
        });
      });
    });
  }

  /* 3. Usuario de la sesión ------------------------------------------------- */
  function pintarUsuario() {
    var u = R.sesion.usuario();
    if (!u) return; // sin sesión se queda el usuario de ejemplo del HTML
    var avatar = document.querySelector('.user-chip__avatar');
    var nombre = document.querySelector('.user-chip__name strong');
    var rol = document.querySelector('.user-chip__name small');
    if (avatar) avatar.textContent = R.formato.iniciales(u.nombre);
    if (nombre) nombre.textContent = u.nombre;
    if (rol) rol.textContent = u.rol || '';
  }

  /* 4. Favoritos: un único listener delegado para todos los corazones ------ */
  function iniciarFavoritos() {
    document.addEventListener('change', function (ev) {
      var input = ev.target;
      if (!input.matches || !input.matches('.heart-button input[data-evento-id]')) return;
      var id = input.getAttribute('data-evento-id');
      var guardado = R.favoritos.alternar(id);
      // La misma tarjeta puede aparecer dos veces (destacados + explorar): se sincronizan
      document.querySelectorAll('.heart-button input[data-evento-id]').forEach(function (otro) {
        if (otro.getAttribute('data-evento-id') === id) otro.checked = guardado;
      });
      R.toast(guardado ? 'Evento guardado en tus favoritos' : 'Evento quitado de tus favoritos');
    });
  }

  function iniciar() {
    iniciarMenu();
    iniciarCerrarSesion();
    pintarUsuario();
    iniciarFavoritos();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
