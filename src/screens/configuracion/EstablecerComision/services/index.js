import { requestRymAPIConfig } from "../../../../services/http";

// SAVE RECHAGE COMISSION
export async function saveRechargeCommissionApi(comision, password) {
  try {
      const response = await requestRymAPIConfig({
        endpoint: 'taecel/establecerComision',
        data: {comision, password}
      });

      if(response.error){
        throw new Error(response.error_message);
      }

      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
}