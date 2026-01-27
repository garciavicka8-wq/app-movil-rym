import Database from '../../database';
import {ERROR_CODE_NAMES} from '../../errors';
import {Moment, Utils, Storage} from '../../utils';
import {obtenerUsuarioDb} from '../auth';
import {
  getPeriodFromMonday,
  getServerTimestamp,
  getUserWeekInform,
  updateDbUser,
} from '../common';
import * as Request from '../http';
import {DATABASE_TABLES, DEPOSIT_DAYS} from '../constants';
const {getPreviousWeekPeriod} = Utils;
// VERIFY USER ACCOUNT STATUS
export async function verifyUserAccountStatus() {
  try {
    const userDB = await obtenerUsuarioDb();
    const timestamp = await getServerTimestamp();
    const currentPeriod = getPeriodFromMonday(timestamp);
    const prevPeriod = getPreviousWeekPeriod(currentPeriod);
    const beforePrevPeriod = getPreviousWeekPeriod(prevPeriod);
    const prevInform = await getUserWeekInform(
      prevPeriod.start + ':' + prevPeriod.end + ':' + userDB.usuario,
    );
    const beforePrevInform = await getUserWeekInform(
      beforePrevPeriod.start +
        ':' +
        beforePrevPeriod.end +
        ':' +
        userDB.usuario,
    );
    // IF USER HAS DUE PAYMENTS BEHIND
    // LOG USER OUT AND UPDATE DISABLE ACCOUNT REASON PROP
    if (
      beforePrevInform &&
      prevInform &&
      !beforePrevInform.paymentCompleted &&
      !prevInform.paymentCompleted
    ) {
      await updateDbUser(userDB.key, {
        activo: false,
        disableAccountReason:
          'Su cuenta ha sido desactivada debido a que tiene un pago atrasado sin cubrir.',
      });
      throw new Error(ERROR_CODE_NAMES.DEACTIVATED_ACCOUNT);
    }
    // IF USER HAS PAID DUE BALANCES SO FAR EXCEPT THE LAST ONE
    // LOG USER OUT AND UPDATE DISABLE ACCOUNT REASON PROP
    if (
      DEPOSIT_DAYS.OUT_OF_LIMIT.includes(
        Moment(timestamp).format('dddd').toLowerCase(),
      ) &&
      beforePrevInform &&
      prevInform &&
      beforePrevInform.paymentCompleted &&
      !prevInform.paymentCompleted
    ) {
      await updateDbUser(userDB.key, {
        activo: false,
        disableAccountReason: `Su cuenta ha sido desactivada debido a que no ha cubierto en su totalidad el pago de liquidación semanal de ${prevInform.amount}`,
      });
      throw new Error(ERROR_CODE_NAMES.DEACTIVATED_ACCOUNT);
    }
  } catch ({message}) {
    throw new Error(message);
  }
}
// UPLOAD DEPOSIT RECEIPT
export async function uploadDepositReceipt(formData) {
  try {
    const response = await Request.post(
      'comprobantes/depositos/subirCaptura',
      formData,
      false,
    );
    if (response.data.error) {
      throw new Error(response.data.error_message);
    }

    return response.data.data.url || '';
  } catch (error) {
    throw new Error(error.message);
  }
}
// SAVE DEPOPSIT RECEIPT
export async function saveDepositReceipt(imageUrl) {
  try {
    const user = Storage.getUser()
      ? Storage.getUser()
      : Storage.getItem('tempUser', true);
    const timestamp = await getServerTimestamp();

    await Database.save(DATABASE_TABLES.VOUCHERS, {
      numeroUsuario: user.usuario,
      capturaUrl: imageUrl,
      fecha: Moment(timestamp).format('YYYY-MM-DD HH:mm:ss'),
    });

    const savedCapture = await Database.getItem(
      DATABASE_TABLES.VOUCHERS,
      'capturaUrl',
      imageUrl,
    );

    return savedCapture;
  } catch (error) {
    throw new Error(error.message);
  }
}
