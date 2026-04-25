// =============================================
// ACME BANK - JS DASHBOARD
// =============================================

document.addEventListener('DOMContentLoaded', function () {

  // ---- Verificar sesión activa ----
  var datosUsuario = sessionStorage.getItem('usuarioActivo');
  if (!datosUsuario) {
    window.location.href = 'index.html';
    return;
  }

  // Cargar el usuario activo
  var usuario = JSON.parse(datosUsuario);

  // ============================================================
  // FUNCIONES UTILITARIAS
  // ============================================================

  function obtenerFechaHoy() {
    var hoy = new Date();
    var anio = hoy.getFullYear();
    var mes = String(hoy.getMonth() + 1).padStart(2, '0');
    var dia = String(hoy.getDate()).padStart(2, '0');
    return anio + '-' + mes + '-' + dia;
  }

  function formatearMoneda(valor) {
    return '$' + Number(valor).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function generarReferencia() {
    var numero = Math.floor(Math.random() * 9000000) + 1000000;
    return 'REF-' + numero;
  }

  function cargarUsuarios() {
    var datos = localStorage.getItem('usuarios');
    if (!datos) return [];
    return JSON.parse(datos);
  }

  function guardarYActualizarUsuario(usuarioActualizado) {
    var usuarios = cargarUsuarios();
    for (var i = 0; i < usuarios.length; i++) {
      if (usuarios[i].tipoId === usuarioActualizado.tipoId && usuarios[i].numeroId === usuarioActualizado.numeroId) {
        usuarios[i] = usuarioActualizado;
        break;
      }
    }
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    sessionStorage.setItem('usuarioActivo', JSON.stringify(usuarioActualizado));
    usuario = usuarioActualizado;
  }

  // ============================================================
  // CARGAR DATOS DEL USUARIO EN SIDEBAR Y TARJETA
  // ============================================================

  function cargarDatosUsuario() {
    var nombreCompleto = usuario.nombres + ' ' + usuario.apellidos;
    document.getElementById('nombre-sidebar').textContent = nombreCompleto;
    document.getElementById('tarjeta-numero-cuenta').textContent = usuario.numeroCuenta;
    document.getElementById('tarjeta-nombre').textContent = nombreCompleto;
    document.getElementById('tarjeta-saldo').textContent = formatearMoneda(usuario.saldo);
    document.getElementById('tarjeta-fecha-creacion').textContent = usuario.fechaCreacion;
  }

  // ============================================================
  // NAVEGACIÓN — MOSTRAR SECCIÓN
  // ============================================================

  function mostrarSeccion(idSeccion) {
    var secciones = document.querySelectorAll('.seccion-dashboard');
    secciones.forEach(function (sec) {
      sec.classList.remove('activa');
    });

    var seccionActiva = document.getElementById(idSeccion);
    if (seccionActiva) seccionActiva.classList.add('activa');

    var links = document.querySelectorAll('.sidebar-menu a');
    links.forEach(function (link) {
      link.classList.remove('activo');
      if (link.getAttribute('data-seccion') === idSeccion) {
        link.classList.add('activo');
      }
    });

    var titulos = {
      'sec-inicio'          : 'Resumen de Cuenta',
      'sec-transacciones'   : 'Resumen de Transacciones',
      'sec-consignacion'    : 'Consignación Electrónica',
      'sec-retiro'          : 'Retiro de Dinero',
      'sec-servicios'       : 'Pago de Servicios Públicos',
      'sec-certificado'     : 'Certificado Bancario',
      'sec-recargas'        : 'Recargas Telefónicas',
      'sec-egresos'         : 'Reporte de Egresos Mensuales',
      'sec-reporte-saldos'  : 'Reporte de Saldos'
    };
    document.getElementById('titulo-barra').textContent = titulos[idSeccion] || 'Dashboard';

    document.getElementById('sidebar').classList.remove('abierto');
  }

  // ---- Eventos del menú ----
  var linksMenu = document.querySelectorAll('.sidebar-menu a[data-seccion]');
  linksMenu.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var seccion = this.getAttribute('data-seccion');
      mostrarSeccion(seccion);

      if (seccion === 'sec-transacciones')  cargarTablaTransacciones();
      if (seccion === 'sec-consignacion')   prepararConsignacion();
      if (seccion === 'sec-retiro')         prepararRetiro();
      if (seccion === 'sec-servicios')      prepararServicios();
      if (seccion === 'sec-certificado')    cargarCertificado();
      if (seccion === 'sec-recargas')       prepararRecargas();
      if (seccion === 'sec-egresos')        inicializarEgresos();
      if (seccion === 'sec-reporte-saldos') cargarReporteSaldos();
    });
  });

  // ---- Botón hamburguesa ----
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

    // Recargar datos frescos del usuario
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

  var btnImprimirTransacciones = document.getElementById('btn-imprimir-transacciones');
  if (btnImprimirTransacciones) {
    btnImprimirTransacciones.addEventListener('click', function () { window.print(); });
  }

  // ============================================================
  // SECCIÓN: CONSIGNACIÓN ELECTRÓNICA
  // ============================================================

  function prepararConsignacion() {
    document.getElementById('consig-numero-cuenta').value = usuario.numeroCuenta;
    document.getElementById('consig-nombre').value = usuario.nombres + ' ' + usuario.apellidos;
    document.getElementById('consig-cantidad').value = '';
    var resumen = document.getElementById('resumen-consignacion');
    if (resumen) resumen.style.display = 'none';
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

      var referencia = generarReferencia();
      var fecha = obtenerFechaHoy();
      var nuevaTransaccion = {
        fecha: fecha, referencia: referencia,
        tipo: 'Consignación', concepto: 'Consignación por canal electrónico', valor: cantidad
      };

      usuario.saldo = (usuario.saldo || 0) + cantidad;
      if (!usuario.transacciones) usuario.transacciones = [];
      usuario.transacciones.push(nuevaTransaccion);
      guardarYActualizarUsuario(usuario);

      document.getElementById('tarjeta-saldo').textContent = formatearMoneda(usuario.saldo);
      document.getElementById('consig-res-fecha').textContent       = fecha;
      document.getElementById('consig-res-referencia').textContent  = referencia;
      document.getElementById('consig-res-tipo').textContent        = 'Consignación';
      document.getElementById('consig-res-concepto').textContent    = 'Consignación por canal electrónico';
      document.getElementById('consig-res-valor').textContent       = formatearMoneda(cantidad);
      document.getElementById('consig-res-saldo').textContent       = formatearMoneda(usuario.saldo);
      document.getElementById('resumen-consignacion').style.display = 'block';
    });
  }

  var btnImprimirConsig = document.getElementById('btn-imprimir-consig');
  if (btnImprimirConsig) {
    btnImprimirConsig.addEventListener('click', function () { window.print(); });
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

      var referencia = generarReferencia();
      var fecha = obtenerFechaHoy();
      var nuevaTransaccion = {
        fecha: fecha, referencia: referencia,
        tipo: 'Retiro', concepto: 'Retiro de dinero', valor: cantidad
      };

      usuario.saldo = usuario.saldo - cantidad;
      if (!usuario.transacciones) usuario.transacciones = [];
      usuario.transacciones.push(nuevaTransaccion);
      guardarYActualizarUsuario(usuario);

      document.getElementById('tarjeta-saldo').textContent = formatearMoneda(usuario.saldo);
      document.getElementById('retiro-res-fecha').textContent     = fecha;
      document.getElementById('retiro-res-referencia').textContent = referencia;
      document.getElementById('retiro-res-tipo').textContent      = 'Retiro';
      document.getElementById('retiro-res-concepto').textContent  = 'Retiro de dinero';
      document.getElementById('retiro-res-valor').textContent     = formatearMoneda(cantidad);
      document.getElementById('retiro-res-saldo').textContent     = formatearMoneda(usuario.saldo);
      document.getElementById('resumen-retiro').style.display     = 'block';
    });
  }

  var btnImprimirRetiro = document.getElementById('btn-imprimir-retiro');
  if (btnImprimirRetiro) {
    btnImprimirRetiro.addEventListener('click', function () { window.print(); });
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

      var tipoServicio      = document.getElementById('serv-tipo').value;
      var referenciaServicio = document.getElementById('serv-referencia').value.trim();
      var valorServicio     = parseFloat(document.getElementById('serv-valor').value);

      if (!tipoServicio) {
        errorDiv.textContent = 'Seleccione el tipo de servicio a pagar.';
        errorDiv.classList.add('visible'); return;
      }
      if (!referenciaServicio) {
        errorDiv.textContent = 'Ingrese la referencia del servicio.';
        errorDiv.classList.add('visible'); return;
      }
      if (!valorServicio || valorServicio <= 0 || isNaN(valorServicio)) {
        errorDiv.textContent = 'Ingrese un valor válido mayor a cero.';
        errorDiv.classList.add('visible'); return;
      }
      if (valorServicio > usuario.saldo) {
        errorDiv.textContent = 'Saldo insuficiente. Su saldo disponible es ' + formatearMoneda(usuario.saldo) + '.';
        errorDiv.classList.add('visible'); return;
      }

      var referencia = generarReferencia();
      var fecha = obtenerFechaHoy();
      var concepto = 'Pago de servicio público ' + tipoServicio;
      var nuevaTransaccion = {
        fecha: fecha, referencia: referencia,
        tipo: 'Retiro', concepto: concepto, valor: valorServicio
      };

      usuario.saldo = usuario.saldo - valorServicio;
      if (!usuario.transacciones) usuario.transacciones = [];
      usuario.transacciones.push(nuevaTransaccion);
      guardarYActualizarUsuario(usuario);

      document.getElementById('tarjeta-saldo').textContent = formatearMoneda(usuario.saldo);
      document.getElementById('serv-res-fecha').textContent     = fecha;
      document.getElementById('serv-res-referencia').textContent = referencia;
      document.getElementById('serv-res-tipo').textContent      = 'Retiro';
      document.getElementById('serv-res-concepto').textContent  = concepto;
      document.getElementById('serv-res-valor').textContent     = formatearMoneda(valorServicio);
      document.getElementById('serv-res-saldo').textContent     = formatearMoneda(usuario.saldo);
      document.getElementById('resumen-servicios').style.display = 'block';
    });
  }

  var btnImprimirServicios = document.getElementById('btn-imprimir-servicios');
  if (btnImprimirServicios) {
    btnImprimirServicios.addEventListener('click', function () { window.print(); });
  }

  // ============================================================
  // SECCIÓN: CERTIFICADO BANCARIO
  // ============================================================

  function cargarCertificado() {
    var hoy = new Date();
    var opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    var fechaFormateada = hoy.toLocaleDateString('es-CO', opciones);

    document.getElementById('cert-nombre').textContent         = usuario.nombres + ' ' + usuario.apellidos;
    document.getElementById('cert-tipo-id').textContent        = usuario.tipoId;
    document.getElementById('cert-numero-id').textContent      = usuario.numeroId;
    document.getElementById('cert-numero-cuenta').textContent  = usuario.numeroCuenta;
    document.getElementById('cert-fecha-creacion').textContent = usuario.fechaCreacion;
    document.getElementById('cert-fecha-expedicion').textContent = fechaFormateada;
    document.getElementById('cert-ciudad').textContent         = usuario.ciudad || 'Colombia';
  }

  var btnImprimirCert = document.getElementById('btn-imprimir-cert');
  if (btnImprimirCert) {
    btnImprimirCert.addEventListener('click', function () { window.print(); });
  }

  // ============================================================
  // SECCIÓN: RECARGAS TELEFÓNICAS  ← NUEVA
  // ============================================================

  function prepararRecargas() {
    // Cargar datos del usuario en el formulario
    document.getElementById('recarga-numero-cuenta').value = usuario.numeroCuenta;
    document.getElementById('recarga-nombre').value = usuario.nombres + ' ' + usuario.apellidos;
    document.getElementById('recarga-telefono').value = '';
    document.getElementById('recarga-valor').value = '';
    document.getElementById('recarga-operador').value = '';

    // Ocultar resumen y error
    var resumen = document.getElementById('resumen-recargas');
    if (resumen) resumen.style.display = 'none';
    var errorDiv = document.getElementById('error-recargas');
    if (errorDiv) errorDiv.classList.remove('visible');

    // Limpiar selección visual de operadores
    document.querySelectorAll('.operador-card').forEach(function (card) {
      card.classList.remove('seleccionado');
    });

    // Activar selector visual de operadores (se registran una sola vez con bandera)
    if (!prepararRecargas._eventosRegistrados) {
      document.querySelectorAll('.operador-card').forEach(function (card) {
        card.addEventListener('click', function () {
          document.querySelectorAll('.operador-card').forEach(function (c) {
            c.classList.remove('seleccionado');
          });
          card.classList.add('seleccionado');
          document.getElementById('recarga-operador').value = card.getAttribute('data-operador');
        });
      });
      prepararRecargas._eventosRegistrados = true;
    }
  }

  var formRecargas = document.getElementById('form-recargas');
  if (formRecargas) {
    formRecargas.addEventListener('submit', function (e) {
      e.preventDefault();

      var errorDiv = document.getElementById('error-recargas');
      errorDiv.classList.remove('visible');

      var operador = document.getElementById('recarga-operador').value.trim();
      var telefono = document.getElementById('recarga-telefono').value.trim();
      var valor    = parseFloat(document.getElementById('recarga-valor').value);

      // ── Validaciones ──
      if (!operador) {
        errorDiv.textContent = 'Por favor selecciona un operador.';
        errorDiv.classList.add('visible'); return;
      }
      if (!/^\d{10}$/.test(telefono)) {
        errorDiv.textContent = 'El número telefónico debe tener exactamente 10 dígitos.';
        errorDiv.classList.add('visible'); return;
      }
      if (!valor || valor < 1000 || isNaN(valor)) {
        errorDiv.textContent = 'El valor mínimo de recarga es $1,000.';
        errorDiv.classList.add('visible'); return;
      }
      if (valor > usuario.saldo) {
        errorDiv.textContent = 'Saldo insuficiente. Su saldo disponible es ' + formatearMoneda(usuario.saldo) + '.';
        errorDiv.classList.add('visible'); return;
      }

      // ── Procesar recarga ──
      var referencia = generarReferencia();
      var fecha      = obtenerFechaHoy();
      var concepto   = 'Recarga ' + operador + ' - Nro. ' + telefono;

      var nuevaTransaccion = {
        fecha: fecha, referencia: referencia,
        tipo: 'Retiro', concepto: concepto, valor: valor
      };

      usuario.saldo = usuario.saldo - valor;
      if (!usuario.transacciones) usuario.transacciones = [];
      usuario.transacciones.push(nuevaTransaccion);
      guardarYActualizarUsuario(usuario);

      // Actualizar tarjeta de saldo
      document.getElementById('tarjeta-saldo').textContent = formatearMoneda(usuario.saldo);

      // Mostrar comprobante
      document.getElementById('rec-res-fecha').textContent      = fecha;
      document.getElementById('rec-res-referencia').textContent = referencia;
      document.getElementById('rec-res-operador').textContent   = operador;
      document.getElementById('rec-res-telefono').textContent   = telefono;
      document.getElementById('rec-res-valor').textContent      = formatearMoneda(valor);
      document.getElementById('rec-res-saldo').textContent      = formatearMoneda(usuario.saldo);
      document.getElementById('resumen-recargas').style.display = 'block';

      // Limpiar formulario
      document.getElementById('recarga-telefono').value = '';
      document.getElementById('recarga-valor').value    = '';
      document.getElementById('recarga-operador').value = '';
      document.querySelectorAll('.operador-card').forEach(function (c) {
        c.classList.remove('seleccionado');
      });
    });
  }

  var btnImprimirRecarga = document.getElementById('btn-imprimir-recarga');
  if (btnImprimirRecarga) {
    btnImprimirRecarga.addEventListener('click', function () { window.print(); });
  }

  // ============================================================
  // SECCIÓN: REPORTE DE EGRESOS MENSUALES  ← NUEVA
  // ============================================================

  var MESES = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];

  function inicializarEgresos() {
    // Poblar selector de años (año actual y 4 anteriores)
    var selectAnio = document.getElementById('egresos-anio');
    if (selectAnio && selectAnio.options.length === 0) {
      var anioActual = new Date().getFullYear();
      for (var a = anioActual; a >= anioActual - 4; a--) {
        var opt = document.createElement('option');
        opt.value = a;
        opt.textContent = a;
        selectAnio.appendChild(opt);
      }
    }

    // Ocultar resultados anteriores
    document.getElementById('egresos-tabla-wrap').style.display    = 'none';
    document.getElementById('egresos-resumen-cards').style.display = 'none';
    document.getElementById('egresos-vacio').style.display         = 'none';
    document.getElementById('btn-imprimir-egresos').style.display  = 'none';
  }

  function generarReporteEgresos() {
    // Recargar usuario con datos frescos
    var usuarios = cargarUsuarios();
    for (var i = 0; i < usuarios.length; i++) {
      if (usuarios[i].tipoId === usuario.tipoId && usuarios[i].numeroId === usuario.numeroId) {
        usuario = usuarios[i];
        sessionStorage.setItem('usuarioActivo', JSON.stringify(usuario));
        break;
      }
    }

    var anio = parseInt(document.getElementById('egresos-anio').value);
    var transacciones = usuario.transacciones || [];

    // Estructura por mes: { retiros, servicios, recargas }
    var resumen = {};
    for (var m = 0; m < 12; m++) {
      resumen[m] = { retiros: 0, servicios: 0, recargas: 0 };
    }

    var hayDatos = false;

    transacciones.forEach(function (tx) {
      // Las fechas se guardan como "YYYY-MM-DD"
      if (!tx.fecha) return;
      var partes = tx.fecha.split('-');
      if (partes.length < 3) return;
      var txAnio = parseInt(partes[0]);
      var txMes  = parseInt(partes[1]) - 1; // 0-based

      if (txAnio !== anio) return;

      // Solo egresos (Retiro)
      if (tx.tipo !== 'Retiro') return;

      var valor   = parseFloat(tx.valor) || 0;
      var concepto = (tx.concepto || '').toLowerCase();

      hayDatos = true;

      if (concepto.indexOf('recarga') !== -1) {
        resumen[txMes].recargas += valor;
      } else if (concepto.indexOf('retiro') !== -1) {
        resumen[txMes].retiros += valor;
      } else {
        // Servicios públicos y cualquier otro egreso
        resumen[txMes].servicios += valor;
      }
    });

    // ── Elementos del DOM ──
    var tbody       = document.getElementById('tbody-egresos');
    var wrapTabla   = document.getElementById('egresos-tabla-wrap');
    var wrapCards   = document.getElementById('egresos-resumen-cards');
    var wrapVacio   = document.getElementById('egresos-vacio');
    var btnImprimir = document.getElementById('btn-imprimir-egresos');

    tbody.innerHTML = '';

    if (!hayDatos) {
      wrapTabla.style.display   = 'none';
      wrapCards.style.display   = 'none';
      wrapVacio.style.display   = 'block';
      btnImprimir.style.display = 'none';
      return;
    }

    wrapVacio.style.display   = 'none';
    wrapTabla.style.display   = 'block';
    wrapCards.style.display   = 'grid';
    btnImprimir.style.display = 'inline-block';

    var totRetiros = 0, totServicios = 0, totRecargas = 0;

    MESES.forEach(function (nombreMes, idx) {
      var r = resumen[idx];
      var totalMes = r.retiros + r.servicios + r.recargas;
      totRetiros   += r.retiros;
      totServicios += r.servicios;
      totRecargas  += r.recargas;

      if (totalMes === 0) return; // omitir meses sin movimientos

      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + nombreMes + '</td>' +
        '<td>' + formatearMoneda(r.retiros) + '</td>' +
        '<td>' + formatearMoneda(r.servicios) + '</td>' +
        '<td>' + formatearMoneda(r.recargas) + '</td>' +
        '<td><strong>' + formatearMoneda(totalMes) + '</strong></td>';
      tbody.appendChild(tr);
    });

    var totalAnio = totRetiros + totServicios + totRecargas;

    // Totales en el footer
    document.getElementById('foot-retiros').textContent   = formatearMoneda(totRetiros);
    document.getElementById('foot-servicios').textContent = formatearMoneda(totServicios);
    document.getElementById('foot-recargas').textContent  = formatearMoneda(totRecargas);
    document.getElementById('foot-total').textContent     = formatearMoneda(totalAnio);

    // Cards resumen
    document.getElementById('egresos-total-anio').textContent      = formatearMoneda(totalAnio);
    document.getElementById('egresos-total-retiros').textContent   = formatearMoneda(totRetiros);
    document.getElementById('egresos-total-servicios').textContent = formatearMoneda(totServicios + totRecargas);
  }

  var btnGenerarEgresos = document.getElementById('btn-generar-egresos');
  if (btnGenerarEgresos) {
    btnGenerarEgresos.addEventListener('click', generarReporteEgresos);
  }

  var btnImprimirEgresos = document.getElementById('btn-imprimir-egresos');
  if (btnImprimirEgresos) {
    btnImprimirEgresos.addEventListener('click', function () { window.print(); });
  }

  // ============================================================
  // SECCIÓN: REPORTE DE SALDOS DE CUENTAS ACTIVAS  ← NUEVA
  // ============================================================

  function cargarReporteSaldos() {
    // Leer TODOS los usuarios registrados en localStorage
    var todasLasCuentas = cargarUsuarios();

    // Fecha de corte = hoy
    var ahora = new Date();
    var fechaCorte = ahora.toLocaleDateString('es-CO', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    document.getElementById('rep-fecha-corte').textContent   = fechaCorte;
    document.getElementById('rep-total-cuentas').textContent = todasLasCuentas.length;

    // Calcular saldo total de todas las cuentas
    var saldoTotal = todasLasCuentas.reduce(function (acc, c) {
      return acc + (parseFloat(c.saldo) || 0);
    }, 0);
    document.getElementById('rep-saldo-total').textContent = formatearMoneda(saldoTotal);

    var tbody = document.getElementById('tbody-saldos');
    tbody.innerHTML = '';

    if (todasLasCuentas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="sin-transacciones">No hay cuentas activas registradas.</td></tr>';
      return;
    }

    todasLasCuentas.forEach(function (cuenta, idx) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + (idx + 1) + '</td>' +
        '<td>' + (cuenta.numeroCuenta || '—') + '</td>' +
        '<td>' + (cuenta.fechaCreacion || '—') + '</td>' +
        '<td>' + (cuenta.tipoId || '—') + '</td>' +
        '<td>' + (cuenta.numeroId || '—') + '</td>' +
        '<td>' + ((cuenta.nombres || '') + ' ' + (cuenta.apellidos || '')).trim() + '</td>' +
        '<td>' + formatearMoneda(parseFloat(cuenta.saldo) || 0) + '</td>';
      tbody.appendChild(tr);
    });
  }

  var btnImprimirSaldos = document.getElementById('btn-imprimir-saldos');
  if (btnImprimirSaldos) {
    btnImprimirSaldos.addEventListener('click', function () { window.print(); });
  }

  // ============================================================
  // INICIALIZACIÓN
  // ============================================================

  var hoy = new Date();
  var opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('fecha-actual').textContent = hoy.toLocaleDateString('es-CO', opciones);

  cargarDatosUsuario();
  mostrarSeccion('sec-inicio');

});