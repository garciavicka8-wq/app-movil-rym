import {useDispatch} from 'react-redux';
import {setIsUserLoggedIn} from '../features/auth/authSlice';
import {Storage, Utils} from '../utils';

export function useLogout() {
  const dispatch = useDispatch();

  const logout = () => {
    Storage.removeItem('usuario');
    Storage.removeItem('versionApp');
    Utils.removeLoginTime();
    dispatch(setIsUserLoggedIn(false));
  };

  return {
    logout,
  };
}
