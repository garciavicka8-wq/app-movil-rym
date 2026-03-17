import axios from 'axios';
import { RYM_API_URL } from '../../constants';
import { DeviceEventEmitter } from 'react-native';

const api = axios.create({
  baseURL: RYM_API_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 403 && data.error_code === 'OUTDATED_VERSION') {
        // Emitimos el evento global
        DeviceEventEmitter.emit('FORCE_LOGOUT', { message: data.error_message });
      }
    }
    return Promise.reject(error);
  }
);

export default api;