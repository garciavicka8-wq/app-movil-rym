import axios from 'axios';
import { RYM_API_URL } from '../../constants';
import { DeviceEventEmitter } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const api = axios.create({
  baseURL: RYM_API_URL,
});

api.interceptors.request.use(async (config) => {
  const buildNumber = await DeviceInfo.getBuildNumber();
  config.headers['X-App-Version-Code'] = buildNumber;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 403 && data.error_code === 'OUTDATED_VERSION') {
        DeviceEventEmitter.emit('FORCE_LOGOUT', { message: data.error_message });
      }

      if (status === 426) {
        DeviceEventEmitter.emit('FORCE_UPDATE', data);
      }
    } else if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      DeviceEventEmitter.emit('NO_INTERNET');
    }
    return Promise.reject(error);
  }
);

export default api;