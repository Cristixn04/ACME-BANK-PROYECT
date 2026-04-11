// =============================================
// ACME BANK - JS DASHBOARD
// =============================================

document.addEventListener('DOMContentLoaded', function () {

  // ---- Verificar sesión activa ----
  var datosUsuario = sessionStorage.getItem('usuarioActivo');
  if (!datosUsuario) {
    // Si no hay sesión, redirigir al login
    window.location.href = 'index.html';
    return;
  }

  // Cargar el usuario activo
  var usuario = JSON.parse(datosUsuario);

  // ---- Funciones utilitarias ----

  // Obtener la fecha actual formateada
  function obtenerFechaHoy() {
    var hoy = new Date();
    var anio = hoy.getFullYear();
    var mes = String(hoy.getMonth() + 1).padStart(2, '0');
    var dia = String(hoy.getDate()).padStart(2, '0');
    return anio + '-' + mes + '-' + dia;
  }

  // Formatear número como moneda
  function formatearMoneda(valor) {
    return '$' + Number(valor).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Generar número de referencia aleatorio
  function generarReferencia() {
    var numero = Math.floor(Math.random() * 9000000) + 1000000;
    return 'REF-' + numero;
  }

  // Cargar todos los usuarios desde localStorage
  function cargarUsuarios() {
    var datos = localStorage.getItem('usuarios');
    if (!datos) return [];
    return JSON.parse(datos);
  }

  // Guardar usuarios en localStorage y actualizar la sesión activa
  function guardarYActualizarUsuario(usuarioActualizado) {
    var usuarios = cargarUsuarios();
    for (var i = 0; i < usuarios.length; i++) {
      if (usuarios[i].tipoId === usuarioActualizado.tipoId && usuarios[i].numeroId === usuarioActualizado.numeroId) {
        usuarios[i] = usuarioActualizado;
        break;
      }
    }
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    // Actualizar también la sesión activa
    sessionStorage.setItem('usuarioActivo', JSON.stringify(usuarioActualizado));
    usuario = usuarioActualizado;
  }

  // ---- Cargar datos del usuario en el sidebar y tarjeta ----
  function cargarDatosUsuario() {
    var nombreCompleto = usuario.nombres + ' ' + usuario.apellidos;

    // Sidebar
    document.getElementById('nombre-sidebar').textContent = nombreCompleto;

    // Tarjeta de cuenta
    document.getElementById('tarjeta-numero-cuenta').textContent = usuario.numeroCuenta;
    document.getElementById('tarjeta-nombre').textContent = nombreCompleto;
    document.getElementById('tarjeta-saldo').textContent = formatearMoneda(usuario.saldo);
    document.getElementById('tarjeta-fecha-creacion').textContent = usuario.fechaCreacion;
  }

  // ---- Mostrar sección del menú ----
  function mostrarSeccion(idSeccion) {
    // Ocultar todas las secciones
    var secciones = document.querySelectorAll('.seccion-dashboard');
    secciones.forEach(function (sec) {
      sec.classList.remove('activa');
    });

    // Mostrar la sección seleccionada
    var seccionActiva = document.getElementById(idSeccion);
    if (seccionActiva) {
      seccionActiva.classList.add('activa');
    }

    // Actualizar el link activo en el menú
    var links = document.querySelectorAll('.sidebar-menu a');
    links.forEach(function (link) {
      link.classList.remove('activo');
      if (link.getAttribute('data-seccion') === idSeccion) {
        link.classList.add('activo');
      }
    });

    // Actualizar el título de la barra superior
    var titulos = {
      'sec-inicio': 'Resumen de Cuenta',
      'sec-transacciones': 'Resumen de Transacciones',
      'sec-consignacion': 'Consignación Electrónica',
      'sec-retiro': 'Retiro de Dinero',
      'sec-servicios': 'Pago de Servicios Públicos',
      'sec-certificado': 'Certificado Bancario'
    };
    document.getElementById('titulo-barra').textContent = titulos[idSeccion] || 'Dashboard';

    // Cerrar sidebar en móvil
    document.getElementById('sidebar').classList.remove('abierto');
  }

  // ---- Eventos del menú ----
  var linksMenu = document.querySelectorAll('.sidebar-menu a[data-seccion]');
  linksMenu.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var seccion = this.getAttribute('data-seccion');
      mostrarSeccion(seccion);

      // Acciones adicionales al mostrar cada sección
      if (seccion === 'sec-transacciones') {
        cargarTablaTransacciones();
      }
      if (seccion === 'sec-consignacion') {
        prepararConsignacion();
      }
      if (seccion === 'sec-retiro') {
        prepararRetiro();
      }
      if (seccion === 'sec-servicios') {
        prepararServicios();
      }
      if (seccion === 'sec-certificado') {
        cargarCertificado();
      }
    });
  });

  // ---- Botón hamburguesa para móvil ----
  var btnMovil = document.getElementById('btn-menu-movil');
  if (btnMovil) {
    btnMovil.addEventListener('click', function () {
      document.getElementById('sidebar').classList.toggle('abierto');
    });
  }

  // ---- Cerrar sesión ----
  var btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', function (e) {
      e.preventDefault();
      sessionStorage.removeItem('usuarioActivo');
      window.location.href = 'index.html';
    });
  }

  // ============================================================
  // SECCIÓN: RESUMEN DE TRANSACCIONES
  // ============================================================
  function cargarTablaTransacciones() {
    var tbody = document.getElementById('tbody-transacciones');
    tbody.innerHTML = '';

    // Recargar usuario desde localStorage para tener datos frescos
    var usuarios = cargarUsuarios();
    for (var i = 0; i < usuarios.length; i++) {
      if (usuarios[i].tipoId === usuario.tipoId && usuarios[i].numeroId === usuario.numeroId) {
        usuario = usuarios[i];
        sessionStorage.setItem('usuarioActivo', JSON.stringify(usuario));
        break;
      }
    }

    var transacciones = usuario.transacciones || [];

    if (transacciones.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="sin-transacciones">No hay transacciones registradas.</td></tr>';
      return;
    }

    // Tomar las últimas 10 transacciones (de más reciente a más antigua)
    var ultimas10 = transacciones.slice(-10).reverse();

    ultimas10.forEach(function (trans) {
      var fila = document.createElement('tr');
      var claseValor = trans.tipo === 'Consignación' ? 'tipo-consignacion' : 'tipo-retiro';
      var signo = trans.tipo === 'Consignación' ? '+' : '-';

      fila.innerHTML =
        '<td>' + trans.fecha + '</td>' +
        '<td>' + trans.referencia + '</td>' +
        '<td class="' + claseValor + '">' + trans.tipo + '</td>' +
        '<td>' + trans.concepto + '</td>' +
        '<td class="' + claseValor + '">' + signo + formatearMoneda(trans.valor) + '</td>';

      tbody.appendChild(fila);
    });
  }

  // Botón de imprimir transacciones
  var btnImprimirTransacciones = document.getElementById('btn-imprimir-transacciones');
  if (btnImprimirTransacciones) {
    btnImprimirTransacciones.addEventListener('click', function () {
      window.print();
    });
  }

  // ============================================================
  // SECCIÓN: CONSIGNACIÓN ELECTRÓNICA
  // ============================================================
  function prepararConsignacion() {
    // Mostrar datos del usuario en el formulario
    document.getElementById('consig-numero-cuenta').value = usuario.numeroCuenta;
    document.getElementById('consig-nombre').value = usuario.nombres + ' ' + usuario.apellidos;
    document.getElementById('consig-cantidad').value = '';

    // Ocultar el resumen anterior
    var resumen = document.getElementById('resumen-consignacion');
    if (resumen) resumen.style.display = 'none';

    // Ocultar el error
    var error = document.getElementById('error-consignacion');
    if (error) error.classList.remove('visible');
  }

  var formConsignacion = document.getElementById('form-consignacion');
  if (formConsignacion) {
    formConsignacion.addEventListener('submit', function (e) {
      e.preventDefault();

      var errorDiv = document.getElementById('error-consignacion');
      errorDiv.classList.remove('visible');

      var cantidad = parseFloat(document.getElementById('consig-cantidad').value);

      if (!cantidad || cantidad <= 0 || isNaN(cantidad)) {
        errorDiv.textContent = 'Ingrese una cantidad válida mayor a cero.';
        errorDiv.classList.add('visible');
        return;
      }

      // Procesar la consignación
      var referencia = generarReferencia();
      var fecha = obtenerFechaHoy();
      var nuevaTransaccion = {
        fecha: fecha,
        referencia: referencia,
        tipo: 'Consignación',
        concepto: 'Consignación por canal electrónico',
        valor: cantidad
      };

      // Actualizar saldo y agregar transacción
      usuario.saldo = (usuario.saldo || 0) + cantidad;
      if (!usuario.transacciones) usuario.transacciones = [];
      usuario.transacciones.push(nuevaTransaccion);
      guardarYActualizarUsuario(usuario);

      // Actualizar tarjeta principal
      document.getElementById('tarjeta-saldo').textContent = formatearMoneda(usuario.saldo);

      // Mostrar resumen
      document.getElementById('consig-res-fecha').textContent = fecha;
      document.getElementById('consig-res-referencia').textContent = referencia;
      document.getElementById('consig-res-tipo').textContent = 'Consignación';
      document.getElementById('consig-res-concepto').textContent = 'Consignación por canal electrónico';
      document.getElementById('consig-res-valor').textContent = formatearMoneda(cantidad);
      document.getElementById('consig-res-saldo').textContent = formatearMoneda(usuario.saldo);

      var resumen = document.getElementById('resumen-consignacion');
      resumen.style.display = 'block';
    });
  }

  var btnImprimirConsig = document.getElementById('btn-imprimir-consig');
  if (btnImprimirConsig) {
    btnImprimirConsig.addEventListener('click', function () {
      window.print();
    });
  }

  // ============================================================
  // SECCIÓN: RETIRO DE DINERO
  // ============================================================
  function prepararRetiro() {
    document.getElementById('retiro-numero-cuenta').value = usuario.numeroCuenta;
    document.getElementById('retiro-nombre').value = usuario.nombres + ' ' + usuario.apellidos;
    document.getElementById('retiro-cantidad').value = '';

    var resumen = document.getElementById('resumen-retiro');
    if (resumen) resumen.style.display = 'none';

    var error = document.getElementById('error-retiro');
    if (error) error.classList.remove('visible');
  }

  var formRetiro = document.getElementById('form-retiro');
  if (formRetiro) {
    formRetiro.addEventListener('submit', function (e) {
      e.preventDefault();

      var errorDiv = document.getElementById('error-retiro');
      errorDiv.classList.remove('visible');

      var cantidad = parseFloat(document.getElementById('retiro-cantidad').value);

      if (!cantidad || cantidad <= 0 || isNaN(cantidad)) {
        errorDiv.textContent = 'Ingrese una cantidad válida mayor a cero.';
        errorDiv.classList.add('visible');
        return;
      }

      if (cantidad > usuario.saldo) {
        errorDiv.textContent = 'Saldo insuficiente. Su saldo disponible es ' + formatearMoneda(usuario.saldo) + '.';
        errorDiv.classList.add('visible');
        return;
      }

      // Procesar retiro
      var referencia = generarReferencia();
      var fecha = obtenerFechaHoy();
      var nuevaTransaccion = {
        fecha: fecha,
        referencia: referencia,
        tipo: 'Retiro',
        concepto: 'Retiro de dinero',
        valor: cantidad
      };

      usuario.saldo = usuario.saldo - cantidad;
      if (!usuario.transacciones) usuario.transacciones = [];
      usuario.transacciones.push(nuevaTransaccion);
      guardarYActualizarUsuario(usuario);

      // Actualizar tarjeta principal
      document.getElementById('tarjeta-saldo').textContent = formatearMoneda(usuario.saldo);

      // Mostrar resumen
      document.getElementById('retiro-res-fecha').textContent = fecha;
      document.getElementById('retiro-res-referencia').textContent = referencia;
      document.getElementById('retiro-res-tipo').textContent = 'Retiro';
      document.getElementById('retiro-res-concepto').textContent = 'Retiro de dinero';
      document.getElementById('retiro-res-valor').textContent = formatearMoneda(cantidad);
      document.getElementById('retiro-res-saldo').textContent = formatearMoneda(usuario.saldo);

      var resumen = document.getElementById('resumen-retiro');
      resumen.style.display = 'block';
    });
  }

  var btnImprimirRetiro = document.getElementById('btn-imprimir-retiro');
  if (btnImprimirRetiro) {
    btnImprimirRetiro.addEventListener('click', function () {
      window.print();
    });
  }

  // ============================================================
  // SECCIÓN: PAGO DE SERVICIOS PÚBLICOS
  // ============================================================
  function prepararServicios() {
    document.getElementById('serv-numero-cuenta').value = usuario.numeroCuenta;
    document.getElementById('serv-nombre').value = usuario.nombres + ' ' + usuario.apellidos;
    document.getElementById('serv-tipo').value = '';
    document.getElementById('serv-referencia').value = '';
    document.getElementById('serv-valor').value = '';

    var resumen = document.getElementById('resumen-servicios');
    if (resumen) resumen.style.display = 'none';

    var error = document.getElementById('error-servicios');
    if (error) error.classList.remove('visible');
  }

  var formServicios = document.getElementById('form-servicios');
  if (formServicios) {
    formServicios.addEventListener('submit', function (e) {
      e.preventDefault();

      var errorDiv = document.getElementById('error-servicios');
      errorDiv.classList.remove('visible');

      var tipoServicio = document.getElementById('serv-tipo').value;
      var referenciaServicio = document.getElementById('serv-referencia').value.trim();
      var valorServicio = parseFloat(document.getElementById('serv-valor').value);

      if (!tipoServicio) {
        errorDiv.textContent = 'Seleccione el tipo de servicio a pagar.';
        errorDiv.classList.add('visible');
        return;
      }

      if (!referenciaServicio) {
        errorDiv.textContent = 'Ingrese la referencia del servicio.';
        errorDiv.classList.add('visible');
        return;
      }

      if (!valorServicio || valorServicio <= 0 || isNaN(valorServicio)) {
        errorDiv.textContent = 'Ingrese un valor válido mayor a cero.';
        errorDiv.classList.add('visible');
        return;
      }

      if (valorServicio > usuario.saldo) {
        errorDiv.textContent = 'Saldo insuficiente. Su saldo disponible es ' + formatearMoneda(usuario.saldo) + '.';
        errorDiv.classList.add('visible');
        return;
      }

      // Procesar pago
      var referencia = generarReferencia();
      var fecha = obtenerFechaHoy();
      var concepto = 'Pago de servicio público ' + tipoServicio;
      var nuevaTransaccion = {
        fecha: fecha,
        referencia: referencia,
        tipo: 'Retiro',
        concepto: concepto,
        valor: valorServicio
      };

      usuario.saldo = usuario.saldo - valorServicio;
      if (!usuario.transacciones) usuario.transacciones = [];
      usuario.transacciones.push(nuevaTransaccion);
      guardarYActualizarUsuario(usuario);

      // Actualizar tarjeta principal
      document.getElementById('tarjeta-saldo').textContent = formatearMoneda(usuario.saldo);

      // Mostrar resumen
      document.getElementById('serv-res-fecha').textContent = fecha;
      document.getElementById('serv-res-referencia').textContent = referencia;
      document.getElementById('serv-res-tipo').textContent = 'Retiro';
      document.getElementById('serv-res-concepto').textContent = concepto;
      document.getElementById('serv-res-valor').textContent = formatearMoneda(valorServicio);
      document.getElementById('serv-res-saldo').textContent = formatearMoneda(usuario.saldo);

      var resumen = document.getElementById('resumen-servicios');
      resumen.style.display = 'block';
    });
  }

  var btnImprimirServicios = document.getElementById('btn-imprimir-servicios');
  if (btnImprimirServicios) {
    btnImprimirServicios.addEventListener('click', function () {
      window.print();
    });
  }

  // ============================================================
  // SECCIÓN: CERTIFICADO BANCARIO
  // ============================================================
  function cargarCertificado() {
    var hoy = new Date();
    var opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    var fechaFormateada = hoy.toLocaleDateString('es-CO', opciones);

    document.getElementById('cert-nombre').textContent = usuario.nombres + ' ' + usuario.apellidos;
    document.getElementById('cert-tipo-id').textContent = usuario.tipoId;
    document.getElementById('cert-numero-id').textContent = usuario.numeroId;
    document.getElementById('cert-numero-cuenta').textContent = usuario.numeroCuenta;
    document.getElementById('cert-fecha-creacion').textContent = usuario.fechaCreacion;
    document.getElementById('cert-fecha-expedicion').textContent = fechaFormateada;
    document.getElementById('cert-ciudad').textContent = usuario.ciudad || 'Colombia';
  }

  var btnImprimirCert = document.getElementById('btn-imprimir-cert');
  if (btnImprimirCert) {
    btnImprimirCert.addEventListener('click', function () {
      window.print();
    });
  }

  // ---- Fecha actual en la barra top ----
  var hoy = new Date();
  var opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('fecha-actual').textContent = hoy.toLocaleDateString('es-CO', opciones);

  // ---- Inicializar: cargar datos del usuario y mostrar inicio ----
  cargarDatosUsuario();
  mostrarSeccion('sec-inicio');

});
