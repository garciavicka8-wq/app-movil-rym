import {useAuthContext} from '../context/AuthContext';

export function useLogout() {
  const {signout} = useAuthContext();

  const logout = () => {
    signout();
  };

  return {
    logout,
  };
}
