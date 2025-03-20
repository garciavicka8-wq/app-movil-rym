import DATABASE_TABLES from './DatabaseTables';
import APP_NAVIGATION from './AppNavigation';
import {
  CATEGORIAS_ICONS,
  CATEGORIAS_ICON_COLORS,
  TRANSACTION_STATES,
  TXN_CODES,
  TXN,
} from './TaecelConfig';
import {PRINT_TABLE_HEADER, PRINT_TABLE} from './PrintingConfig';
import {
  LOGO_MAGICO_BASE64,
  LOGO_BASE64,
  MELATERR_LOGO,
  MELATERR_LOGO2,
  CHISPAZO_LOGO,
} from './LogosBase64';

const RYM_BASE_URL = `${
  __DEV__ ? 'https://staging.' : 'https://'
}rym.recargasymas.com.mx`;
const RYM_API_URL = `${RYM_BASE_URL}/api/v1`;
const RYM_LOGOS_URL = `${RYM_BASE_URL}/storage/logos/`;

const MAX_AMOUNT_TO_PAY_WITHOUT_CAPTURE = 998;
const TICKET_TYPE = {
  PLUS: 'ticket plus',
  MAGICO: 'ticket magico',
};

const TKP_LOGO_URL =
  'https://recargasymas.com.mx/wp-content/uploads/2023/10/logo-ticket-100.jpg';

export {
  DATABASE_TABLES,
  APP_NAVIGATION,
  CATEGORIAS_ICONS,
  CATEGORIAS_ICON_COLORS,
  PRINT_TABLE_HEADER,
  PRINT_TABLE,
  TRANSACTION_STATES,
  TXN_CODES,
  LOGO_MAGICO_BASE64,
  LOGO_BASE64,
  MELATERR_LOGO,
  MELATERR_LOGO2,
  CHISPAZO_LOGO,
  TKP_LOGO_URL,
  TXN,
  RYM_API_URL,
  RYM_LOGOS_URL,
  MAX_AMOUNT_TO_PAY_WITHOUT_CAPTURE,
  TICKET_TYPE,
};
