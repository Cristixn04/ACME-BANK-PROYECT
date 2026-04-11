// =============================================
// ACME BANK - JS FORMULARIO DE REGISTRO
// =============================================

document.addEventListener('DOMContentLoaded', function () {

  // Obtener referencias a los elementos del formulario
  var formulario = document.getElementById('formulario-registro');
  var seccionFormulario = document.getElementById('seccion-formulario');
  var seccionResumen = document.getElementById('seccion-resumen');
  var mensajeError = document.getElementById('mensaje-error');

  // Función para obtener la fecha actual en formato YYYY-MM-DD
  function obtenerFechaHoy() {
    var hoy = new Date();
    var anio = hoy.getFullYear();
    var mes = String(hoy.getMonth() + 1).padStart(2, '0');
    var dia = String(hoy.getDate()).padStart(2, '0');
    return anio + '-' + mes + '-' + dia;
  }

  // Función para generar número de cuenta único
  function generarNumeroCuenta() {
    var usuarios = cargarUsuarios();
    var numero = usuarios.length + 1;
    return 'ACME-' + String(numero).padStart(5, '0');
  }

  // Función para cargar usuarios desde localStorage
  function cargarUsuarios() {
    var datos = localStorage.getItem('usuarios');
    if (!datos) return [];
    return JSON.parse(datos);
  }

  // Función para guardar usuarios en localStorage
  function guardarUsuarios(listaUsuarios) {
    localStorage.setItem('usuarios', JSON.stringify(listaUsuarios));
  }

  // Función para validar el correo electrónico
  function validarCorreo(correo) {
    var expresion = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return expresion.test(correo);
  }

  // Función para validar la contraseña (mínimo 8 caracteres, una mayúscula, un número, un especial)
  function validarContrasena(contrasena) {
    var expresion = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
    return expresion.test(contrasena);
  }

  // Función para validar el teléfono (solo números, 10 dígitos)
  function validarTelefono(telefono) {
    var expresion = /^[0-9]{10}$/;
    return expresion.test(telefono);
  }

  // Función para mostrar error en un campo
  function mostrarErrorCampo(idCampo, idError, mensaje) {
    var campo = document.getElementById(idCampo);
    var error = document.getElementById(idError);
    campo.classList.add('campo-error');
    error.textContent = mensaje;
    error.classList.add('visible');
  }

  // Función para limpiar error de un campo
  function limpiarErrorCampo(idCampo, idError) {
    var campo = document.getElementById(idCampo);
    var error = document.getElementById(idError);
    campo.classList.remove('campo-error');
    error.classList.remove('visible');
  }

  // Validación en tiempo real de los campos
  var campos = ['tipo-id', 'numero-id', 'nombres', 'apellidos', 'genero', 'telefono', 'correo', 'direccion', 'ciudad', 'contrasena', 'confirmar-contrasena'];
  campos.forEach(function (idCampo) {
    var campo = document.getElementById(idCampo);
    if (campo) {
      campo.addEventListener('input', function () {
        limpiarErrorCampo(idCampo, 'error-' + idCampo);
      });
      campo.addEventListener('change', function () {
        limpiarErrorCampo(idCampo, 'error-' + idCampo);
      });
    }
  });

  // Manejar el envío del formulario
  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();

    // Ocultar mensaje de error global
    mensajeError.classList.remove('visible');

    // Obtener los valores de los campos
    var tipoId = document.getElementById('tipo-id').value;
    var numeroId = document.getElementById('numero-id').value.trim();
    var nombres = document.getElementById('nombres').value.trim();
    var apellidos = document.getElementById('apellidos').value.trim();
    var genero = document.getElementById('genero').value;
    var telefono = document.getElementById('telefono').value.trim();
    var correo = document.getElementById('correo').value.trim();
    var direccion = document.getElementById('direccion').value.trim();
    var ciudad = document.getElementById('ciudad').value.trim();
    var contrasena = document.getElementById('contrasena').value;
    var confirmarContrasena = document.getElementById('confirmar-contrasena').value;

    // Variable para saber si hay errores
    var hayErrores = false;

    // Validar tipo de identificación
    if (!tipoId) {
      mostrarErrorCampo('tipo-id', 'error-tipo-id', 'Seleccione un tipo de identificación.');
      hayErrores = true;
    }

    // Validar número de identificación
    if (!numeroId) {
      mostrarErrorCampo('numero-id', 'error-numero-id', 'Ingrese su número de identificación.');
      hayErrores = true;
    }

    // Validar nombres
    if (!nombres) {
      mostrarErrorCampo('nombres', 'error-nombres', 'Ingrese sus nombres.');
      hayErrores = true;
    }

    // Validar apellidos
    if (!apellidos) {
      mostrarErrorCampo('apellidos', 'error-apellidos', 'Ingrese sus apellidos.');
      hayErrores = true;
    }

    // Validar género
    if (!genero) {
      mostrarErrorCampo('genero', 'error-genero', 'Seleccione su género.');
      hayErrores = true;
    }

    // Validar teléfono
    if (!telefono) {
      mostrarErrorCampo('telefono', 'error-telefono', 'Ingrese su teléfono.');
      hayErrores = true;
    } else if (!validarTelefono(telefono)) {
      mostrarErrorCampo('telefono', 'error-telefono', 'El teléfono debe tener 10 dígitos numéricos.');
      hayErrores = true;
    }

    // Validar correo
    if (!correo) {
      mostrarErrorCampo('correo', 'error-correo', 'Ingrese su correo electrónico.');
      hayErrores = true;
    } else if (!validarCorreo(correo)) {
      mostrarErrorCampo('correo', 'error-correo', 'Ingrese un correo electrónico válido.');
      hayErrores = true;
    }

    // Validar dirección
    if (!direccion) {
      mostrarErrorCampo('direccion', 'error-direccion', 'Ingrese su dirección de residencia.');
      hayErrores = true;
    }

    // Validar ciudad
    if (!ciudad) {
      mostrarErrorCampo('ciudad', 'error-ciudad', 'Ingrese su ciudad de residencia.');
      hayErrores = true;
    }

    // Validar contraseña
    if (!contrasena) {
      mostrarErrorCampo('contrasena', 'error-contrasena', 'Ingrese una contraseña.');
      hayErrores = true;
    } else if (!validarContrasena(contrasena)) {
      mostrarErrorCampo('contrasena', 'error-contrasena', 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial (!@#$%^&*).');
      hayErrores = true;
    }

    // Validar confirmar contraseña
    if (!confirmarContrasena) {
      mostrarErrorCampo('confirmar-contrasena', 'error-confirmar-contrasena', 'Confirme su contraseña.');
      hayErrores = true;
    } else if (contrasena !== confirmarContrasena) {
      mostrarErrorCampo('confirmar-contrasena', 'error-confirmar-contrasena', 'Las contraseñas no coinciden.');
      hayErrores = true;
    }

    // Si hay errores, detener el proceso
    if (hayErrores) {
      mensajeError.textContent = 'Por favor corrija los errores en el formulario.';
      mensajeError.classList.add('visible');
      window.scrollTo(0, 0);
      return;
    }

    // Verificar si el número de identificación ya está registrado
    var usuarios = cargarUsuarios();
    for (var i = 0; i < usuarios.length; i++) {
      if (usuarios[i].tipoId === tipoId && usuarios[i].numeroId === numeroId) {
        mensajeError.textContent = 'Ya existe una cuenta registrada con este número de identificación.';
        mensajeError.classList.add('visible');
        return;
      }
    }

    // Crear el nuevo usuario
    var numeroCuenta = generarNumeroCuenta();
    var fechaCreacion = obtenerFechaHoy();

    var nuevoUsuario = {
      tipoId: tipoId,
      numeroId: numeroId,
      nombres: nombres,
      apellidos: apellidos,
      genero: genero,
      telefono: telefono,
      correo: correo,
      direccion: direccion,
      ciudad: ciudad,
      contrasena: contrasena,
      numeroCuenta: numeroCuenta,
      saldo: 0,
      fechaCreacion: fechaCreacion,
      transacciones: []
    };

    // Guardar el usuario
    usuarios.push(nuevoUsuario);
    guardarUsuarios(usuarios);

    // Mostrar el resumen
    document.getElementById('resumen-numero-cuenta').textContent = numeroCuenta;
    document.getElementById('resumen-nombre').textContent = nombres + ' ' + apellidos;
    document.getElementById('resumen-tipo-id').textContent = tipoId;
    document.getElementById('resumen-numero-id').textContent = numeroId;
    document.getElementById('resumen-fecha').textContent = fechaCreacion;

    // Ocultar formulario y mostrar resumen
    seccionFormulario.classList.add('oculto');
    seccionResumen.classList.remove('oculto');

    window.scrollTo(0, 0);
  });

});
