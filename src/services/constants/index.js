export const DATABASE_TABLES = {
  USERS: 'usuarios',
  BET_LIMIT: 'ajustes/limiteApuestas',
  CANCELED_TICKETS: 'boletosCancelados',
  CREDITS: 'creditos',
  CLOSING_TIME: 'ajustes/horaCierre',
  DEPOSITS: 'depositos',
  DRAWS: 'ajustes/sorteos',
  DRAWS_LIST: 'ajustes/listaSorteos',
  MAINTENANCE: 'ajustes/mantenimiento',
  PAID_PRIZES: 'premiosPagados',
  PAYOUTS: 'ajustes/abonos',
  PAST_DUE_BALANCES: 'saldosVencidos',
  REGISTERED_DEVICES: 'dispositivosRegistrados',
  TICKETS: 'boletos',
  TRANSACTIONS: 'transacciones',
  VERSIONS: 'ajustes/versiones',
  WEEK_INFORMS: 'weekInforms',
  WINNER_NUMBERS: 'ajustes/numerosGanadores',
  VOUCHERS: 'vouchers',
  NOTIFICATIONS_TOKENS: 'notifications/tokens',
  // FOR TESTS PURPOSES
  TEST: 'test',
};

export const DEPOSIT_DAYS = {
  OUT_OF_LIMIT: ['jueves', 'viernes', 'sabado', 'domingo'],
  TOLERANCE_PERIOD: [],
};

export const TRANSACTION_STRUCTURE = {
  tempId: '', // SIRVE PARA PODER ACTUALIZAR LA TRANSACCION DEPUES DE RECIBIR LA RESPUESTA DE TAE
  TransID: '',
  Fecha: '', //YYYY-MM-DD HH:mm:ss
  Carrier: '', // Telcel
  Telefono: '', // 4771234567 | 12943458847882839 - ref
  Folio: '',
  Status: 'PROCESSING', // EXITOSA | FRACASADA | PROCESSING
  Monto: '', // $10.00
  Cargo: '$5.00', // SERVICIOS $1.00
  Abono: '$0.00', // GIFTCARDS 2% DEL MONTO
  Via: 'WS',
  Región: '',
  Timeout: '',
  IP: '',
  Bolsa: '', // TIEMPO AIRE | PAQUETE | SERVICIOS | GIFTCARDS
  'Saldo Final': '$0.00', // $10,000.00
  Comision: '', // SERVICIOS = $7.00 RECARGAS = $2.00
  // INFORMACION EXTRA AÑADIDA
  CategoriaID: '', // 1 | 2 | 3 | 4
  _usuario: '', // 37555
  _fecha: '', // YYYY-MM-DD
  _hora: '', // HH:mm:ss
  descripcionProducto: '', // DESCRIPCION DEL PRODUCTO | VIGENCIA
};
