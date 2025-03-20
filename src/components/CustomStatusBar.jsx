import {StatusBar} from 'react-native';
import {useCustomNavigation} from '../hooks';
import {Colors} from '../utils';

export default function CustomStatusBar({color = 'primary'}) {
  const {isFocused} = useCustomNavigation();

  if (!isFocused) return null;

  return (
    <StatusBar
      backgroundColor={__DEV__ ? Colors.dev : Colors[color] || Colors.primary}
    />
  );
}
