import * as Request from '../../../../services/http';

const {requestRymAPIConfig} = Request;

export async function saveUserAppPINCodeAPi(password, codigoPin){
    const response = await requestRymAPIConfig({
        endpoint: 'authentication/guardarCodigoPin',
        data: {
            password,
            codigoPin
        }
      });
      
      if (response.error) {
        throw new Error(response.error_message);
      }
      
      return response.data;
}