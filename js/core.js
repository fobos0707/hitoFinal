/* ==========================================================================
   RITMO · Hito 2 · core.js
   Utilidades compartidas por todas las páginas:
   - h()        crea elementos del DOM con createElement
   - formato    fechas, precios y normalización de texto
   - almacen    localStorage con try/catch (puede estar bloqueado)
   - datos      "capa de acceso" a mockData + eventos creados por el usuario
   - sesion     login / registro simulados
   - favoritos  eventos guardados con el corazón
   ========================================================================== */
(function () {
  'use strict';
  var R = (window.Ritmo = window.Ritmo || {});

  /* ---------- Creación de elementos ------------------------------------- */
  function h(tag, props) {
    var el = document.createElement(tag);
    var k;
    if (props) {
      for (k in props) {
        if (!Object.prototype.hasOwnProperty.call(props, k)) continue;
        var v = props[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'html') el.innerHTML = v; // solo con contenido propio (iconos), nunca con datos del usuario
        else if (k.indexOf('on') === 0 && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    for (var i = 2; i < arguments.length; i++) anadir(el, arguments[i]);
    return el;
  }
  function anadir(padre, hijo) {
    if (hijo === null || hijo === undefined || hijo === false) return;
    if (Array.isArray(hijo)) { hijo.forEach(function (x) { anadir(padre, x); }); return; }
    padre.appendChild(hijo.nodeType ? hijo : document.createTextNode(String(hijo)));
  }

  /* ---------- Iconos (SVG propios, mismo trazo que el Hito 1) ------------ */
  var ICONOS = {
    check:   '<path d="m5 12 5 5 9-10"/>',
    alerta:  '<path d="M12 3 2 21h20L12 3Z"/><path d="M12 10v5M12 18h.01"/>',
    salir:   '<path d="M10 17l5-5-5-5M15 12H3"/><path d="M14 3h6v18h-6"/>',
    entrada: '<path d="M3 8a2 2 0 0 0 0 4v5h18v-5a2 2 0 0 0 0-4V3H3v5Z"/><path d="M13 7h4M13 11h4M7 7v6"/>',
    info:    '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    flecha:  '<path d="m9 18 6-6-6-6"/>',
    cerrar:  '<path d="M6 6l12 12M18 6 6 18"/>',
    corazon: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>'
  };
  function icono(nombre, tam) {
    tam = tam || 20;
    var tpl = document.createElement('template');
    tpl.innerHTML = '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" width="' + tam + '" height="' + tam +
      '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      (ICONOS[nombre] || '') + '</svg>';
    return tpl.content.firstChild;
  }

  /* ---------- Formato ---------------------------------------------------- */
  var MESES_CORTO = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  var MESES_LARGO = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  /* Se parsea a mano para evitar el desfase de zona horaria de new Date('AAAA-MM-DD') */
  function parteFecha(iso) {
    var p = String(iso).split('-').map(Number);
    return { a: p[0], m: p[1], d: p[2], fecha: new Date(p[0], p[1] - 1, p[2]) };
  }
  var formato = {
    hoyISO: function () {
      var d = new Date();
      return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    },
    horaActual: function () {
      var d = new Date();
      return pad(d.getHours()) + ':' + pad(d.getMinutes());
    },
    fechaCorta: function (iso) {
      var f = parteFecha(iso);
      return { dia: pad(f.d), mes: MESES_CORTO[f.m - 1] };
    },
    fechaLarga: function (iso) {
      var f = parteFecha(iso);
      var dia = DIAS[f.fecha.getDay()];
      return dia.charAt(0).toUpperCase() + dia.slice(1) + ', ' + f.d + ' de ' + MESES_LARGO[f.m - 1];
    },
    fechaCompleta: function (iso) {
      var f = parteFecha(iso);
      return f.d + ' de ' + MESES_LARGO[f.m - 1] + ' de ' + f.a;
    },
    mesLargo: function (iso) { return MESES_LARGO[parteFecha(iso).m - 1]; },
    precio: function (n) {
      return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);
    },
    /* Minúsculas y sin tildes: "Electrónica" == "electronica" */
    normalizar: function (s) {
      return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    },
    iniciales: function (nombre) {
      var partes = String(nombre || '').trim().split(/\s+/).filter(Boolean);
      return ((partes[0] || '?').charAt(0) + (partes.length > 1 ? partes[1].charAt(0) : '')).toUpperCase();
    }
  };

  /* ---------- localStorage seguro ---------------------------------------- */
  var almacen = {
    leer: function (clave, defecto) {
      try {
        var v = window.localStorage.getItem('ritmo.' + clave);
        return v === null ? defecto : JSON.parse(v);
      } catch (e) { return defecto; }
    },
    guardar: function (clave, valor) {
      try { window.localStorage.setItem('ritmo.' + clave, JSON.stringify(valor)); return true; }
      catch (e) { return false; }
    },
    borrar: function (clave) {
      try { window.localStorage.removeItem('ritmo.' + clave); } catch (e) { /* sin almacenamiento */ }
    }
  };

  /* ---------- Capa de datos ---------------------------------------------- */
  var datos = {
    categorias: function () { return R.mock.categorias.slice(); },
    categoria: function (slug) {
      return R.mock.categorias.filter(function (c) { return c.slug === slug; })[0] || null;
    },
    recintos: function () { return R.mock.recintos.slice(); },
    recinto: function (id) {
      return R.mock.recintos.filter(function (r) { return r.id === id; })[0] || { id: id, nombre: 'Recinto por confirmar', ciudad: '' };
    },
    /* Une los eventos del "servidor" (mockData) con los publicados por el usuario */
    eventos: function () {
      var propios = almacen.leer('eventosCreados', []);
      return R.mock.eventos.concat(Array.isArray(propios) ? propios : []).map(datos.enriquecer);
    },
    evento: function (id) {
      return datos.eventos().filter(function (e) { return e.id === id; })[0] || null;
    },
    enriquecer: function (e) {
      var rec = datos.recinto(e.recintoId);
      var precios = e.entradas.map(function (t) { return t.precio; });
      return Object.assign({}, e, {
        recinto: rec,
        lugar: rec.nombre + (rec.ciudad ? ', ' + rec.ciudad : ''),
        precioDesde: precios.length ? Math.min.apply(null, precios) : 0,
        href: 'detalle.html?id=' + encodeURIComponent(e.id)
      });
    },
    guardarEvento: function (evento) {
      var propios = almacen.leer('eventosCreados', []);
      propios.push(evento);
      return almacen.guardar('eventosCreados', propios);
    },
    imagenPorCategoria: function (slug) {
      var I = R.mock.imagenes;
      return ({ electronica: I.festival, indie: I.indie, pop: I.stage, rock: I.rock, jazz: I.jazz })[slug] || I.live;
    }
  };

  /* ---------- Sesión simulada -------------------------------------------- */
  function todosLosUsuarios() {
    var propios = almacen.leer('usuarios', []);
    return R.mock.usuarios.concat(Array.isArray(propios) ? propios : []);
  }
  var sesion = {
    usuario: function () { return almacen.leer('sesion', null); },
    emailExiste: function (email) {
      var e = formato.normalizar(email);
      return todosLosUsuarios().some(function (u) { return formato.normalizar(u.email) === e; });
    },
    iniciar: function (email, password) {
      var e = formato.normalizar(email);
      var u = todosLosUsuarios().filter(function (x) { return formato.normalizar(x.email) === e && x.password === password; })[0];
      if (!u) return { ok: false, error: 'Email o contraseña incorrectos.' };
      almacen.guardar('sesion', { nombre: u.nombre, email: u.email, rol: u.rol || 'Exploradora musical' });
      return { ok: true, usuario: u };
    },
    registrar: function (nombre, email, password) {
      if (sesion.emailExiste(email)) return { ok: false, error: 'Ya existe una cuenta con este email.' };
      var propios = almacen.leer('usuarios', []);
      propios.push({ id: Date.now(), nombre: nombre.trim(), email: email.trim(), password: password, rol: 'Explorador musical' });
      almacen.guardar('usuarios', propios);
      return { ok: true };
    },
    cerrar: function () { almacen.borrar('sesion'); }
  };

  /* ---------- Favoritos (corazón de las tarjetas) ------------------------ */
  var favoritos = {
    lista: function () { var l = almacen.leer('favoritos', []); return Array.isArray(l) ? l : []; },
    tiene: function (id) { return favoritos.lista().indexOf(id) !== -1; },
    alternar: function (id) {
      var l = favoritos.lista();
      var i = l.indexOf(id);
      if (i === -1) l.push(id); else l.splice(i, 1);
      almacen.guardar('favoritos', l);
      return i === -1;
    }
  };

  R.h = h;
  R.icono = icono;
  R.formato = formato;
  R.almacen = almacen;
  R.datos = datos;
  R.sesion = sesion;
  R.favoritos = favoritos;
})();
