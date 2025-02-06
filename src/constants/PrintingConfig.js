import {
  BluetoothEscposPrinter as BEP,
  ALIGN,
} from 'tp-react-native-bluetooth-printer';

const AMOUNT_ALIGNMENT = ALIGN.CENTER;
const AMOUNT_COL_SIZE_1 = BEP.width58 / 8 / 4;
const AMOUNT_COL_SIZE_2 = BEP.width58 / 8 / 5;
const AMOUNT_COL_SIZE_3 = BEP.width58 / 8 / 5.5;

export const PRINT_TABLE_HEADER = {
  1: {
    colData: ['NUM', 'PLU'],
    colSizes: [BEP.width58 / 8 / 5, AMOUNT_COL_SIZE_1],
    colAlignments: [AMOUNT_ALIGNMENT, AMOUNT_ALIGNMENT],
  },
  2: {
    colData: ['NUM', 'PLU', 'SLU'],
    colSizes: [BEP.width58 / 8 / 5, AMOUNT_COL_SIZE_2, AMOUNT_COL_SIZE_2],
    colAlignments: [AMOUNT_ALIGNMENT, AMOUNT_ALIGNMENT, AMOUNT_ALIGNMENT],
  },
  3: {
    colData: ['NUM', 'PLU', 'SLU', 'TLU'],
    colSizes: [
      AMOUNT_COL_SIZE_3,
      AMOUNT_COL_SIZE_3,
      AMOUNT_COL_SIZE_3,
      AMOUNT_COL_SIZE_3,
    ],
    colAlignments: [
      AMOUNT_ALIGNMENT,
      AMOUNT_ALIGNMENT,
      AMOUNT_ALIGNMENT,
      AMOUNT_ALIGNMENT,
    ],
  },
};

export const PRINT_TABLE = {
  2: {
    colSizes: [BEP.width58 / 8 / 5, AMOUNT_COL_SIZE_1],
    colAlignments: [AMOUNT_ALIGNMENT, AMOUNT_ALIGNMENT],
  },
  3: {
    colSizes: [AMOUNT_COL_SIZE_2, AMOUNT_COL_SIZE_2, AMOUNT_COL_SIZE_2],
    colAlignments: [AMOUNT_ALIGNMENT, AMOUNT_ALIGNMENT, AMOUNT_ALIGNMENT],
  },
  4: {
    colSizes: [
      AMOUNT_COL_SIZE_3,
      AMOUNT_COL_SIZE_3,
      AMOUNT_COL_SIZE_3,
      AMOUNT_COL_SIZE_3,
    ],
    colAlignments: [
      AMOUNT_ALIGNMENT,
      AMOUNT_ALIGNMENT,
      AMOUNT_ALIGNMENT,
      AMOUNT_ALIGNMENT,
    ],
  },
};
