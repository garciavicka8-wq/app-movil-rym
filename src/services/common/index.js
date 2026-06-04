import {Moment} from '../../utils';
import {getServerTime} from '../http';

export async function getServerTimestamp() {
  try {
    return await getServerTime();
  } catch ({message}) {
    throw new Error(message);
  }
}

export function getPeriodFromMonday(serverTimestamp) {
  const today = Moment(serverTimestamp);
  if (today.format('dddd').toLowerCase() === 'lunes') {
    return {
      start: today.format('YYYY-MM-DD'),
      end: today.format('YYYY-MM-DD'),
    };
  }
  let daysCounter = 0;
  while (
    Moment(serverTimestamp)
      .subtract(daysCounter, 'days')
      .format('dddd')
      .toLowerCase() !== 'lunes'
  ) {
    daysCounter++;
  }
  return {
    start: Moment(serverTimestamp)
      .subtract(daysCounter, 'days')
      .format('YYYY-MM-DD'),
    end: today.format('YYYY-MM-DD'),
  };
}
