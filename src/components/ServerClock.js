import React from 'react';
import {Text} from 'react-native';
import {Moment} from '../utils';
import {useServerClock} from '../hooks';

export default function ServerClock({style}) {
  const now = useServerClock();

  return <Text style={style}>{Moment(now).format('ddd DD MMM · HH:mm:ss')}</Text>;
}
