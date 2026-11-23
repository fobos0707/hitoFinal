/* ==========================================================================
   RITMO · Hito 2 · auth.js
   Lógica de login.html y registro.html (validación + sesión simulada).
   ========================================================================== */
(function () {
  'use strict';
  var R = window.Ritmo;
  var V = R.validacion.reglas;

  function iniciarLogin(form) {
    var control = R.validacion.conectar(form, {
      email: { reglas: [V.requerido('Introduce tu email.'), V.email()] },
      password: { reglas: [V.requerido('Introduce tu contraseña.'), V.minLen(6, 'La contraseña tiene al menos 6 caracteres.')] }
    }, {
      onValido: function (datos, ui) {
        var r = R.sesion.iniciar(datos.email, datos.password);
        if (!r.ok) {
          ui.mostrarEstado(r.error + ' Revisa los datos e inténtalo de nuevo.', 'error');
          return;
        }
        ui.mostrarEstado('¡Bienvenido, ' + r.usuario.nombre.split(' ')[0] + '! Entrando…', 'ok');
        if (ui.boton) ui.boton.disabled = true;
        window.setTimeout(function () { window.location.href = 'index.html'; }, 600);
      }
    });

    // Botón de ayuda: rellena la cuenta de demostración y valida los campos
    var demo = document.getElementById('rellenar-demo');
    if (demo) {
      demo.addEventListener('click', function () {
        form.querySelector('#email').value = 'marina@ritmo.com';
        form.querySelector('#password').value = 'Ritmo2026';
        control.validar('email');
        control.validar('password');
        control.ocultarEstado();
        form.querySelector('[type="submit"]').focus();
      });
    }
  }

  function iniciarRegistro(form) {
    R.validacion.conectar(form, {
      nombre: { reglas: [V.requerido('Escribe tu nombre completo.'), V.nombreCompleto(), V.maxLen(60)] },
      email: {
        reglas: [
          V.requerido('Introduce tu email.'),
          V.email(),
          V.personalizada(function (v) { return !R.sesion.emailExiste(v); }, 'Ya existe una cuenta con este email. Prueba a iniciar sesión.')
        ]
      },
      password: { reglas: [V.requerido('Elige una contraseña.'), V.password({ min: 8 })] }
    }, {
      onValido: function (datos, ui) {
        var r = R.sesion.registrar(datos.nombre, datos.email, datos.password);
        if (!r.ok) { ui.mostrarEstado(r.error, 'error'); return; }
        R.modal.aviso({
          tipo: 'exito',
          eyebrow: 'Cuenta creada',
          titulo: '¡Bienvenido a Ritmo!',
          mensaje: 'Hemos creado tu cuenta con ' + datos.email + '. Ya puedes iniciar sesión.',
          cerrable: false,
          botones: [{ id: 'login', texto: 'Ir a iniciar sesión', variante: 'primary', foco: true }]
        }).then(function () { window.location.href = 'login.html'; });
      }
    });
  }

  function iniciar() {
    var login = document.getElementById('form-login');
    var registro = document.getElementById('form-registro');
    if (login) iniciarLogin(login);
    if (registro) iniciarRegistro(registro);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
