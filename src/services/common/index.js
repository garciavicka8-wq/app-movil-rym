import Database from '../../database';
import {Moment} from '../../utils';
import {DATABASE_TABLES} from '../constants';
import {getServerTime} from '../http';

// RETURNS THE SERVER TIMESTAMP
export async function getServerTimestamp() {
  try {
    return await getServerTime();
  } catch ({message}) {
    throw new Error(message);
  }
}
// GET USER
export async function getDbUser(userNumber) {
  try {
    const user = await Database.getItem(
      DATABASE_TABLES.USERS,
      'usuario',
      userNumber,
    );
    return user;
  } catch ({message}) {
    throw new Error(message);
  }
}
// RETURNS A PERIOD OF TIME FROM MONDAY TO NOW
// @param timestamp
export function getPeriodFromMonday(serverTimestamp) {
  const today = Moment(serverTimestamp);
  // IF TODAY IS MONDAY THEN RETURN INMEDIATELY
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
// GET USER WEEK INFORM
export async function getUserWeekInform(reference) {
  try {
    const userWeekInform = await Database.getItem(
      DATABASE_TABLES.WEEK_INFORMS,
      'reference',
      reference,
    );
    return userWeekInform;
  } catch ({message}) {
    throw new Error(message);
  }
}
// UPDATE USER
export async function updateDbUser(userKey, data) {
  try {
    await Database.update(DATABASE_TABLES.USERS, userKey, data);
  } catch ({message}) {
    throw new Error(message);
  }
}
// GET PAID PRIZES FROM A GIVEN DATE
export async function getPaidPrizesByDate(formattedDate) {
  try {
    const paidPrizes = await Database.getItemsByProp(
      DATABASE_TABLES.PAID_PRIZES,
      'fechaPago',
      formattedDate,
    );
    return paidPrizes;
  } catch ({message}) {
    throw new Error(message);
  }
}
// SAVE USER WEEK INFORM
export async function saveUserWeekInform(weekInform) {
  try {
    const weekInformExists = await getUserWeekInform(weekInform.reference);
    // IF WEEK INFORM DOES NOT EXISTS THEN SAVE IT
    if (!weekInformExists) {
      console.log('el informe no existe por lo tanto lo guardamos');
      await Database.save(DATABASE_TABLES.WEEK_INFORMS, weekInform);
    }
    console.log('el informe ya existe');
  } catch ({message}) {
    throw new Error(message);
  }
}

export async function getPaidPrizesByRange(start, end) {
  try {
    const paidPrizes = await Database.getItemsInRange(
      DATABASE_TABLES.PAID_PRIZES,
      'fechaPago',
      start,
      end,
    );
    return paidPrizes;
  } catch ({message}) {
    throw new Error(message);
  }
}
