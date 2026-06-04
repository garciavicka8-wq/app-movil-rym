import {Storage} from '../../utils';
import * as Request from '../http';

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

export async function saveDepositReceipt(imageUrl) {
  try {
    const user = Storage.getUser()
      ? Storage.getUser()
      : Storage.getItem('tempUser', true);

    const response = await Request.post('comprobantes/depositos/receipt', {
      imageUrl,
      numeroUsuario: user.usuario,
    });

    if (response.data.error) {
      throw new Error(response.data.error_message);
    }

    return response.data.data;
  } catch (error) {
    throw new Error(error.message);
  }
}
