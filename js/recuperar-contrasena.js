// =============================================
// ACME BANK - JS RECUPERAR CONTRASEÑA
// =============================================

document.addEventListener('DOMContentLoaded', function () {

  // Referencias a los elementos
  var formularioRecuperar = document.getElementById('formulario-recuperar');
  var formularioNuevaContrasena = document.getElementById('formulario-nueva-contrasena');
  var seccionRecuperar = document.getElementById('seccion-recuperar');
  var seccionNuevaContrasena = document.getElementById('seccion-nueva-contrasena');
  var seccionExito = document.getElementById('seccion-exito');
  var mensajeError = document.getElementById('mensaje-error');

  // Variable para guardar el usuario encontrado
  var usuarioEncontrado = null;

  // Función para cargar usuarios
  function cargarUsuarios() {
    var datos = localStorage.getItem('usuarios');
    if (!datos) return [];
    return JSON.parse(datos);
  }

  // Función para guardar usuarios
  function guardarUsuarios(listaUsuarios) {
    localStorage.setItem('usuarios', JSON.stringify(listaUsuarios));
  }

  // Función para validar contraseña
  function validarContrasena(contrasena) {
    var expresion = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
    return expresion.test(contrasena);
  }

  // Manejar envío del formulario de recuperación
  formularioRecuperar.addEventListener('submit', function (evento) {
    evento.preventDefault();

    mensajeError.classList.remove('visible');

    var tipoId = document.getElementById('tipo-id').value;
    var numeroId = document.getElementById('numero-id').value.trim();
    var correo = document.getElementById('correo').value.trim();

    // Validar campos vacíos
    if (!tipoId || !numeroId || !correo) {
      mensajeError.textContent = 'Por favor complete todos los campos.';
      mensajeError.classList.add('visible');
      return;
    }

    // Buscar el usuario en la base de datos
    var usuarios = cargarUsuarios();
    usuarioEncontrado = null;

    for (var i = 0; i < usuarios.length; i++) {
      if (
        usuarios[i].tipoId === tipoId &&
        usuarios[i].numeroId === numeroId &&
        usuarios[i].correo === correo
      ) {
        usuarioEncontrado = usuarios[i];
        break;
      }
    }

    if (!usuarioEncontrado) {
      mensajeError.textContent = 'No se encontró una cuenta con los datos ingresados. Verifique la información.';
      mensajeError.classList.add('visible');
      return;
    }

    // Ocultar formulario de recuperación y mostrar el de nueva contraseña
    seccionRecuperar.classList.add('oculto');
    seccionNuevaContrasena.classList.remove('oculto');
  });

  // Manejar envío del formulario de nueva contraseña
  formularioNuevaContrasena.addEventListener('submit', function (evento) {
    evento.preventDefault();

    var mensajeErrorNueva = document.getElementById('mensaje-error-nueva');
    mensajeErrorNueva.classList.remove('visible');

    var nuevaContrasena = document.getElementById('nueva-contrasena').value;
    var confirmarNueva = document.getElementById('confirmar-nueva').value;

    // Validar campos vacíos
    if (!nuevaContrasena || !confirmarNueva) {
      mensajeErrorNueva.textContent = 'Por favor complete ambos campos.';
      mensajeErrorNueva.classList.add('visible');
      return;
    }

    // Validar formato de contraseña
    if (!validarContrasena(nuevaContrasena)) {
      mensajeErrorNueva.textContent = 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial (!@#$%^&*).';
      mensajeErrorNueva.classList.add('visible');
      return;
    }

    // Validar que coincidan
    if (nuevaContrasena !== confirmarNueva) {
      mensajeErrorNueva.textContent = 'Las contraseñas no coinciden.';
      mensajeErrorNueva.classList.add('visible');
      return;
    }

    // Actualizar la contraseña en localStorage
    var usuarios = cargarUsuarios();
    for (var i = 0; i < usuarios.length; i++) {
      if (
        usuarios[i].tipoId === usuarioEncontrado.tipoId &&
        usuarios[i].numeroId === usuarioEncontrado.numeroId
      ) {
        usuarios[i].contrasena = nuevaContrasena;
        break;
      }
    }
    guardarUsuarios(usuarios);

    // Mostrar sección de éxito
    seccionNuevaContrasena.classList.add('oculto');
    seccionExito.classList.remove('oculto');
  });

});
