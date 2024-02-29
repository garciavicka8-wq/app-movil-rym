export const DATABASE_TABLES = {
  BOLETOS: 'boletos',
  AGENCIAS: 'usuarios',
  // AGENCIAS: 'users',
  SORTEOS: 'ajustes/sorteos',
  FECHA_SERVIDOR: 'fechaServidor',
  LIMITE_APUESTAS: 'ajustes/limiteApuestas',
  HORA_CIERRE: 'ajustes/horaCierre',
  ABONOS: 'ajustes/abonos',
  PRONOSTICOS: 'futbol/pronosticos',
  NUMEROS_GANADORES: 'ajustes/numerosGanadores',
  PREMIOS_PAGADOS: 'premiosPagados',
  BOLETOS_CANCELADOS: 'boletosCancelados',
  VERSIONES: 'ajustes/versiones',
  MANTENIMIENTO: 'ajustes/mantenimiento',
  LISTA_SORTEOS: 'ajustes/listaSorteos',
  LIBERAR_ESPACIO: 'ajustes/liberarEspacio',
  TRANSACCIONES: 'transacciones',
  ESTADOS_DE_CUENTA: 'estadosDeCuenta',
  DEPOSITOS: 'depositos',
  DISPOSITIVOS_REGISTRADOS: 'dispositivosRegistrados',
  CREDITOS: 'creditos',
};
export const APP_NAVIGATION = {
  TABS: {
    TICKETS: 'TicketsTab',
    RECARGAS: 'RecargasTab',
    CONFIG: 'ConfiguracionTab',
    REPORTES: 'ReportesTab',
  },
  SCREENS: {
    // MAIN APP SCREENS
    MAIN: 'Main',
    LOGIN: 'Login',
    // TICKETS SCREENS
    TICKETS_MENU: 'TicketsMenu',
    JUGAR_TICKETS: 'JugarTickets',
    TOTAL_ACUMULADO: 'TotalAcumulado',
    MAGICO: 'Magico',
    TICKETS_REPORTES: 'Reportes',
    VENTAS: 'Ventas',
    NUMEROS_GANADORES: 'NumerosGanadores',
    PAGOS: 'Pagos',
    CANCELAR: 'Cancelar',
    REIMPRIMIR: 'Reimprimir',
    // REPORTES
    REPORTES_MENU: 'ReportesMenu',
    // RECARGAS SCREEN
    RECARGAS: 'Recargas',
    RECARGAS_MENU: 'RecargasMenu',
    CATEGORIAS: 'Categorias',
    VENDER: 'Vender',
    SELECCIONAR_COMP: 'SeleccionarComp',
    REPORTES_RECARGAS: 'Reportes',
    TRANSACCIONES: 'Transacciones',
    DETALLE_TRANSACCION: 'DetalleTransaccion',
    // CONFIGURACION SCREENS
    CONFIG_MENU: 'ConfigMenu',
    PERFIL: 'Perfil',
    REGISTRAR_IMPRESORA: 'RegistrarImpresora',
    CODIGO_PIN: 'CodigoPin',
    ESTADO_DE_CUENTA: 'EstadoDeCuenta',
    ESTABLECER_COMISION: 'EstablecerComision',
    SEGURIDAD: 'Seguridad',
  },
};

export const CATEGORIAS_ICONS = {
  1: 'cellphone',
  2: 'package-variant',
  3: 'receipt',
  4: 'credit-card',
};

export const CATEGORIAS_ICON_COLORS = {
  1: '#000',
  2: '#EA906C',
  3: '#00B13C',
  4: '#FF4242',
};

export const LOGOS_URL = 'https://rym-api.recargasymas.com.mx/storage/logos/';
