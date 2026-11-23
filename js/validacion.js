/* ==========================================================================
   RITMO · Hito 2 · validacion.js
   Validación avanzada de formularios en JavaScript puro.

   - Sin tooltips del navegador: el <form> lleva novalidate y los mensajes
     se pintan en el DOM (<p class="field__error">) bajo cada campo.
   - Tiempo real: se valida en los eventos `input`, `change` y `blur`.
   - Accesible: aria-invalid, aria-describedby y aria-live en los errores.

   Uso:
     var form = Ritmo.validacion.conectar(formEl, {
       email:    { reglas: [V.requerido('Obligatorio'), V.email()] },
       password: { reglas: [...], revalida: ['otroCampo'] }
     }, { onValido: function (datos) { ... } });
   Cada regla es una función (valor, elemento, formulario) => '' | 'mensaje'.
   ========================================================================== */
(function () {
  'use strict';
  var R = window.Ritmo;
  var h = R.h;

  /* ---------- Reglas reutilizables --------------------------------------- */
  /* Todas devuelven '' si el valor está vacío (salvo `requerido`): así un
     campo opcional vacío es válido y `requerido` decide por separado.      */
  function vacio(v) { return String(v).trim() === ''; }

  var reglas = {
    requerido: function (msg) {
      return function (v) { return vacio(v) ? (msg || 'Este campo es obligatorio.') : ''; };
    },
    minLen: function (n, msg) {
      return function (v) {
        var t = String(v).trim();
        return t !== '' && t.length < n ? (msg || 'Escribe al menos ' + n + ' caracteres (llevas ' + t.length + ').') : '';
      };
    },
    maxLen: function (n, msg) {
      return function (v) {
        return String(v).trim().length > n ? (msg || 'No puede superar los ' + n + ' caracteres.') : '';
      };
    },
    email: function (msg) {
      var re = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;
      return function (v) {
        return !vacio(v) && !re.test(String(v).trim()) ? (msg || 'Introduce un email válido, por ejemplo nombre@ejemplo.com.') : '';
      };
    },
    /* Nombre y apellido: letras (con tildes), espacios, guion, apóstrofo y punto */
    nombreCompleto: function (msg) {
      var re = /^[\p{L}][\p{L}'’ .-]*$/u;
      return function (v) {
        var t = String(v).trim();
        if (t === '') return '';
        if (!re.test(t)) return 'El nombre solo puede contener letras, espacios, guiones y apóstrofos.';
        if (t.split(/\s+/).length < 2) return msg || 'Escribe tu nombre y al menos un apellido.';
        return '';
      };
    },
    password: function (opciones) {
      var o = Object.assign({ min: 8, mayuscula: true, minuscula: true, numero: true }, opciones);
      return function (v) {
        var t = String(v);
        if (t === '') return '';
        if (t.length < o.min) return 'Mínimo ' + o.min + ' caracteres (llevas ' + t.length + ').';
        if (o.minuscula && !/[a-zñáéíóúü]/.test(t)) return 'Incluye al menos una letra minúscula.';
        if (o.mayuscula && !/[A-ZÑÁÉÍÓÚÜ]/.test(t)) return 'Incluye al menos una letra mayúscula.';
        if (o.numero && !/\d/.test(t)) return 'Incluye al menos un número.';
        if (/\s/.test(t)) return 'La contraseña no puede contener espacios.';
        return '';
      };
    },
    /* Fecha ISO (AAAA-MM-DD) no anterior a la que devuelva `minimo()` */
    fechaDesde: function (minimo, msg) {
      return function (v) {
        var min = minimo();
        return !vacio(v) && min && v < min ? (typeof msg === 'function' ? msg(min) : msg || 'La fecha no puede ser anterior a hoy.') : '';
      };
    },
    fechaHasta: function (maximo, msg) {
      return function (v) {
        var max = maximo();
        return !vacio(v) && max && v > max ? (typeof msg === 'function' ? msg(max) : msg || 'La fecha es demasiado tardía.') : '';
      };
    },
    numero: function (o) {
      o = o || {};
      return function (v) {
        if (vacio(v)) return '';
        var n = Number(String(v).replace(',', '.'));
        if (!isFinite(n)) return 'Introduce un número válido.';
        if (o.entero && Math.floor(n) !== n) return 'Debe ser un número entero.';
        if (!o.entero && o.decimales !== undefined && Math.round(n * Math.pow(10, o.decimales)) / Math.pow(10, o.decimales) !== n) {
          return 'Máximo ' + o.decimales + ' decimales.';
        }
        if (o.min !== undefined && n < o.min) return 'El valor mínimo es ' + o.min + '.';
        if (o.max !== undefined && n > o.max) return 'El valor máximo es ' + o.max + '.';
        return '';
      };
    },
    /* Regla libre: test(valor, el, form) => true si es válido */
    personalizada: function (test, msg) {
      return function (v, el, form) { return !vacio(v) && !test(v, el, form) ? msg : ''; };
    }
  };

  /* ---------- Conexión de un formulario ---------------------------------- */
  function conectar(form, esquema, opciones) {
    var opts = Object.assign({ onValido: function () {} }, opciones);
    form.setAttribute('novalidate', ''); // desactiva los tooltips nativos
    var campos = {};

    Object.keys(esquema).forEach(function (id) {
      var el = form.querySelector('#' + id);
      if (!el) return;
      var control = el.closest('.input-shell') || el;
      var contenedor = el.closest('.field') || el.parentNode;
      var error = h('p', { class: 'field__error', id: id + '-error', 'aria-live': 'polite', hidden: true });
      control.insertAdjacentElement('afterend', error);

      var describe = (el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
      describe.push(error.id);
      el.setAttribute('aria-describedby', describe.join(' '));

      campos[id] = { el: el, contenedor: contenedor, error: error, def: esquema[id], tocado: false, visible: false };

      var alEscribir = function () {
        var c = campos[id];
        // Mientras el campo está virgen y vacío no se muestra nada
        if (!c.tocado && !c.visible && vacio(el.value)) return;
        validar(id);
      };
      el.addEventListener('input', alEscribir);
      el.addEventListener('change', alEscribir);
      el.addEventListener('blur', function () { campos[id].tocado = true; validar(id); });
    });

    var estado = h('p', { class: 'form-status', role: 'alert', hidden: true });
    var boton = form.querySelector('[type="submit"]');
    var ancla = boton ? (boton.closest('.form-actions') || boton) : null;
    if (ancla) ancla.parentNode.insertBefore(estado, ancla);

    function mensajeDe(id) {
      var c = campos[id];
      var el = c.el;
      if (el.validity && el.validity.badInput) return 'El valor introducido no es válido.';
      for (var i = 0; i < c.def.reglas.length; i++) {
        var m = c.def.reglas[i](el.value, el, form);
        if (m) return m;
      }
      return '';
    }

    function validar(id, sinPropagar) {
      var c = campos[id];
      if (!c) return true;
      var msg = mensajeDe(id);
      var conValor = !vacio(c.el.value);
      c.error.textContent = msg;
      c.error.hidden = !msg;
      c.contenedor.classList.toggle('is-invalid', !!msg);
      c.contenedor.classList.toggle('is-valid', !msg && conValor);
      c.visible = !!msg || conValor;
      if (msg) c.el.setAttribute('aria-invalid', 'true'); else c.el.removeAttribute('aria-invalid');

      // Campos que dependen de este (p. ej. la fecha de venta depende de la del evento)
      if (!sinPropagar && c.def.revalida) {
        c.def.revalida.forEach(function (otro) {
          var d = campos[otro];
          if (d && (d.tocado || d.visible)) validar(otro, true);
        });
      }
      if (estado && !estado.hidden && estado.classList.contains('form-status--error') && !msg && !hayErrores()) ocultarEstado();
      return !msg;
    }

    function hayErrores() {
      return Object.keys(campos).some(function (id) { return !!mensajeDe(id); });
    }

    function mostrarEstado(texto, tipo) {
      estado.textContent = texto;
      estado.className = 'form-status form-status--' + (tipo || 'error');
      estado.hidden = false;
    }
    function ocultarEstado() { estado.hidden = true; estado.textContent = ''; }

    function validarTodo() {
      var invalidos = [];
      Object.keys(campos).forEach(function (id) {
        campos[id].tocado = true;
        if (!validar(id, true)) invalidos.push(id);
      });
      return invalidos;
    }

    function datos() {
      var o = {};
      new FormData(form).forEach(function (v, k) { o[k] = typeof v === 'string' ? v.trim() : v; });
      return o;
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var invalidos = validarTodo();
      if (invalidos.length) {
        mostrarEstado(invalidos.length === 1 ? 'Hay 1 campo que corregir antes de continuar.' : 'Hay ' + invalidos.length + ' campos que corregir antes de continuar.', 'error');
        campos[invalidos[0]].el.focus();
        return;
      }
      ocultarEstado();
      opts.onValido(datos(), { mostrarEstado: mostrarEstado, ocultarEstado: ocultarEstado, boton: boton });
    });

    /* Deja el formulario como recién cargado (tras publicar, por ejemplo) */
    function reiniciar() {
      form.reset();
      Object.keys(campos).forEach(function (id) {
        var c = campos[id];
        c.tocado = false;
        c.visible = false;
        c.error.textContent = '';
        c.error.hidden = true;
        c.contenedor.classList.remove('is-invalid', 'is-valid');
        c.el.removeAttribute('aria-invalid');
      });
      ocultarEstado();
    }

    return {
      reiniciar: reiniciar,
      validar: validar,
      validarTodo: validarTodo,
      mostrarEstado: mostrarEstado,
      ocultarEstado: ocultarEstado,
      campo: function (id) { return campos[id] && campos[id].el; }
    };
  }

  R.validacion = { reglas: reglas, conectar: conectar };
})();
