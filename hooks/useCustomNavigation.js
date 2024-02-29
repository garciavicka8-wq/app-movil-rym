import {
  useNavigation,
  CommonActions,
  StackActions,
  useIsFocused,
} from '@react-navigation/native';

export function useCustomNavigation() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const navigate = routeName => {
    navigation.navigate(routeName);
  };

  const resetStack = routeName => {
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{name: routeName}],
      }),
    );
  };

  const changeStack = (index, routes = []) => {
    navigation.dispatch(
      CommonActions.reset({
        index,
        routes,
      }),
    );
  };

  const replace = routeName => {
    navigation.dispatch(StackActions.replace(routeName));
  };

  const goBack = () => {
    navigation.goBack();
  };

  return {
    navigate,
    resetStack,
    replace,
    isFocused,
    goBack,
    changeStack,
  };
}
