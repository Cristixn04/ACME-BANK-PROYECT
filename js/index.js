// =============================================
// ACME BANK - JS PÁGINA DE INICIO DE SESIÓN
// =============================================

// Esperar a que el documento esté listo
document.addEventListener('DOMContentLoaded', function () {

  // Obtener el formulario y los campos
  var formulario = document.getElementById('formulario-login');
  var campoTipoId = document.getElementById('tipo-id');
  var campoNumeroId = document.getElementById('numero-id');
  var campoContrasena = document.getElementById('contrasena');
  var mensajeError = document.getElementById('mensaje-error');

  // Cargar usuarios desde localStorage (que se inicializa desde el JSON)
  function cargarUsuarios() {
    var datos = localStorage.getItem('usuarios');
    if (!datos) {
      var usuariosEjemplo = [
        {
          tipoId: "CC",
          numeroId: "1234567890",
          nombres: "Juan Carlos",
          apellidos: "Pérez Gómez",
          genero: "M",
          telefono: "3001234567",
          correo: "juan.perez@email.com",
          direccion: "Calle 10 # 5-20",
          ciudad: "Bogotá",
          contrasena: "Juan123*",
          numeroCuenta: "ACME-00001",
          saldo: 500000,
          fechaCreacion: "2024-01-15",
          transacciones: [
            {
              fecha: "2024-01-15",
              referencia: "REF-000001",
              tipo: "Consignación",
              concepto: "Consignación por canal electrónico",
              valor: 500000
            }
          ]
        }
      ];
      localStorage.setItem('usuarios', JSON.stringify(usuariosEjemplo));
      return usuariosEjemplo;
    }
    return JSON.parse(datos);
  }

  // Función para validar las credenciales del usuario
  function validarCredenciales(tipoId, numeroId, contrasena) {
    var usuarios = cargarUsuarios();

    // Buscar el usuario que coincida con los datos ingresados
    for (var i = 0; i < usuarios.length; i++) {
      var usuario = usuarios[i];
      if (
        usuario.tipoId === tipoId &&
        usuario.numeroId === numeroId &&
        usuario.contrasena === contrasena
      ) {
        return usuario; // Retornar el usuario si coincide
      }
    }
    return null; // Retornar null si no encontró el usuario
  }

  // Manejar el envío del formulario
  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault(); // Evitar que la página se recargue

    // Obtener los valores ingresados
    var tipoId = campoTipoId.value;
    var numeroId = campoNumeroId.value.trim();
    var contrasena = campoContrasena.value;

    // Ocultar mensaje de error anterior
    mensajeError.classList.remove('visible');

    // Validar que los campos no estén vacíos
    if (!tipoId || !numeroId || !contrasena) {
      mensajeError.textContent = 'Por favor complete todos los campos.';
      mensajeError.classList.add('visible');
      return;
    }

    // Validar las credenciales
    var usuarioEncontrado = validarCredenciales(tipoId, numeroId, contrasena);

    if (usuarioEncontrado) {
      // Guardar el usuario en sesión (sessionStorage para que se borre al cerrar)
      sessionStorage.setItem('usuarioActivo', JSON.stringify(usuarioEncontrado));
      // Redirigir al dashboard
      window.location.href = 'dashboard.html';
    } else {
      // Redirigir a página de contraseña incorrecta
      sessionStorage.setItem('intentoFallido', JSON.stringify({ tipoId, numeroId }));
      window.location.href = 'error-login.html';
    }
  });

});
