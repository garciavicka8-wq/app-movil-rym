import {useAuthContext} from '../context/AuthContext';

export default function useLogout() {
  const {signout} = useAuthContext();

  const logout = () => {
    signout();
  };

  return {
    logout,
  };
}
