/* ==========================================================================
   RITMO · Hito 2 · crear.js
   Formulario de publicación de eventos:
   - selects poblados desde mockData (géneros y recintos)
   - validación en tiempo real (texto, selects, fechas, horas y números)
   - validaciones cruzadas entre fecha del evento, hora y fecha de venta
   - contador de caracteres, modal de confirmación y de éxito
   - el evento publicado se guarda y aparece en el dashboard
   ========================================================================== */
(function () {
  'use strict';
  var R = window.Ritmo;
  var h = R.h;
  var F = R.formato;
  var V = R.validacion.reglas;

  var $ = function (id) { return document.getElementById(id); };

  function poblarSelects() {
    var genero = $('genero');
    R.datos.categorias().forEach(function (c) { genero.appendChild(h('option', { value: c.slug, text: c.nombre })); });
    var recinto = $('recinto');
    R.datos.recintos().forEach(function (r) { recinto.appendChild(h('option', { value: r.id, text: r.nombre + ' — ' + r.ciudad })); });
  }

  /* Contador "123 / 600" que cambia de color al acercarse al límite */
  function iniciarContador() {
    var area = $('descripcion');
    var pista = area.closest('.field').querySelector('.field__hint');
    var max = Number(area.getAttribute('maxlength')) || 600;
    function pintar() {
      var n = area.value.length;
      pista.textContent = n + ' / ' + max + ' caracteres';
      pista.classList.toggle('is-near', n >= max * 0.9);
    }
    area.addEventListener('input', pintar);
    pintar();
  }

  /* ¿Hay algo escrito? Sirve para avisar antes de descartar */
  function formularioSucio(form) {
    return Array.prototype.some.call(form.elements, function (c) {
      if (!c.name || c.type === 'submit') return false;
      if (c.tagName === 'SELECT') return c.selectedIndex > 0 && c.id !== 'tipo';
      return c.value.trim() !== '';
    });
  }

  function resumen(d, nombreGenero, nombreRecinto) {
    function fila(a, b) { return h('div', null, h('dt', { text: a }), h('dd', { text: b })); }
    return h('dl', { class: 'modal__summary' },
      fila('Evento', d.titulo),
      fila('Artista', d.artista + ' · ' + nombreGenero),
      fila('Cuándo', F.fechaLarga(d.fecha) + ' · ' + d.hora),
      fila('Dónde', nombreRecinto),
      fila('Entradas', d.cantidad + ' × ' + d.tipo + ' a ' + F.precio(Number(d.precio)))
    );
  }

  function iniciar() {
    var form = $('form-crear');
    if (!form) return;

    poblarSelects();
    iniciarContador();

    // Los selectores de fecha del navegador ya no dejan elegir días pasados
    var hoy = F.hoyISO();
    $('fecha').setAttribute('min', hoy);
    $('inicio-venta').setAttribute('min', hoy);

    var validador = R.validacion.conectar(form, {
      titulo: { reglas: [V.requerido('Ponle un nombre al evento.'), V.minLen(3), V.maxLen(80)] },
      genero: { reglas: [V.requerido('Selecciona un género musical.')] },
      artista: { reglas: [V.requerido('Indica el artista o grupo principal.'), V.minLen(2), V.maxLen(60)] },
      descripcion: { reglas: [V.requerido('Describe tu evento.'), V.minLen(20, 'Cuéntanos un poco más: mínimo 20 caracteres.'), V.maxLen(600)] },
      fecha: {
        reglas: [
          V.requerido('Indica la fecha del evento.'),
          V.fechaDesde(F.hoyISO, 'La fecha del evento no puede ser anterior a hoy.')
        ],
        revalida: ['hora', 'inicio-venta']
      },
      hora: {
        reglas: [
          V.requerido('Indica la hora de inicio.'),
          function (v) {
            // Si el evento es hoy, la hora no puede haber pasado ya
            return v && $('fecha').value === F.hoyISO() && v <= F.horaActual() ? 'Si el evento es hoy, la hora debe ser posterior a la actual.' : '';
          }
        ]
      },
      recinto: { reglas: [V.requerido('Selecciona un recinto.')] },
      direccion: { reglas: [V.maxLen(120, 'Máximo 120 caracteres.')] },
      precio: { reglas: [V.requerido('Indica el precio.'), V.numero({ min: 0, max: 5000, decimales: 2 })] },
      'cantidad-disp': { reglas: [V.requerido('Indica cuántas entradas hay.'), V.numero({ min: 1, max: 100000, entero: true })] },
      'inicio-venta': {
        reglas: [
          V.requerido('Indica cuándo empieza la venta.'),
          V.fechaDesde(F.hoyISO, 'La venta no puede empezar en el pasado.'),
          V.fechaHasta(function () { return $('fecha').value; }, 'La venta debe empezar antes o el mismo día del evento.')
        ]
      }
    }, {
      onValido: function (d, ui) {
        var cat = R.datos.categoria(d.genero);
        var rec = R.datos.recinto(d.recinto);
        var nombreRecinto = rec.nombre + ', ' + rec.ciudad;

        R.modal.confirmar({
          tipo: 'aviso',
          eyebrow: 'Antes de publicar',
          titulo: '¿Publicar este evento?',
          mensaje: 'Una vez publicado, la comunidad podrá descubrirlo y comprar entradas.',
          detalle: resumen(d, cat.nombre, nombreRecinto),
          textoCancelar: 'Seguir editando',
          textoConfirmar: 'Publicar evento'
        }).then(function (ok) {
          if (!ok) return;
          var usuario = R.sesion.usuario();
          var evento = {
            id: 'usr-' + Date.now().toString(36),
            titulo: d.titulo,
            categoria: d.genero,
            etiqueta: cat.nombre,
            fecha: d.fecha,
            hora: d.hora,
            horaFin: '',
            recintoId: d.recinto,
            imagen: R.datos.imagenPorCategoria(d.genero),
            destacado: false,
            subtitulo: d.artista + ' en directo',
            tituloDescripcion: d.titulo,
            descripcion: d.descripcion,
            direccion: d.direccion,
            lineup: [{ nombre: d.artista, estilo: cat.nombre, hora: d.hora }],
            entradas: [{ tipo: d.tipo, descripcion: 'Entrada ' + d.tipo.toLowerCase(), precio: Number(d.precio), disponibles: Number(d.cantidad) }],
            inicioVenta: d['inicio_venta'],
            creadoPor: usuario ? usuario.email : null
          };
          var guardado = R.datos.guardarEvento(evento);
          if (!guardado) {
            ui.mostrarEstado('No se ha podido guardar el evento en este navegador (almacenamiento bloqueado).', 'error');
            return;
          }
          validador.reiniciar();
          $('descripcion').dispatchEvent(new Event('input')); // reinicia el contador

          return R.modal.aviso({
            tipo: 'exito',
            eyebrow: 'Evento publicado',
            titulo: 'Ya está en el escenario',
            mensaje: 'Tu evento se ha publicado correctamente y ya puede ser descubierto por la comunidad.',
            cerrable: false,
            botones: [
              { id: 'otro', texto: 'Crear otro evento', variante: 'secondary' },
              { id: 'ver', texto: 'Ver en el dashboard', variante: 'primary', foco: true }
            ]
          }).then(function (id) {
            if (id === 'ver') window.location.href = 'index.html#explorar';
            else window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        });
      }
    });

    // "Cancelar": si hay datos escritos se pide confirmación antes de descartarlos
    document.querySelectorAll('[data-accion="cancelar"]').forEach(function (enlace) {
      enlace.addEventListener('click', function (ev) {
        if (!formularioSucio(form)) return; // sin cambios: navega con normalidad
        ev.preventDefault();
        R.modal.confirmar({
          tipo: 'peligro',
          eyebrow: 'Descartar cambios',
          titulo: '¿Salir sin publicar?',
          mensaje: 'Has empezado a rellenar el formulario. Si sales ahora perderás lo que has escrito.',
          textoCancelar: 'Seguir editando',
          textoConfirmar: 'Descartar y salir'
        }).then(function (ok) { if (ok) window.location.href = enlace.getAttribute('href'); });
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
