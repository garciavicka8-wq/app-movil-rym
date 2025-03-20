import Database from '../../database';
import {DATABASE_TABLES} from '../constants';

export async function notifyAdmins(title, body) {
  try {
    const tokens = await Database.getItems(
      DATABASE_TABLES.NOTIFICATIONS_TOKENS,
    );
    const token = tokens[0].token;
    console.log(title, body);
  } catch (error) {
    console.log(error);
  }
}
