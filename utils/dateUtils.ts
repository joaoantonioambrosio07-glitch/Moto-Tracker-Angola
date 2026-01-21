
import { ANGOLA_HOLIDAYS, GET_VARIABLE_HOLIDAYS } from '../constants';
import { format, isWeekend, isSameDay } from 'date-fns';

export const isHoliday = (date: Date): string | null => {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  const fixed = ANGOLA_HOLIDAYS.find(h => h.day === day && h.month === month);
  if (fixed) return fixed.name;

  const variable = GET_VARIABLE_HOLIDAYS(year).find(h => h.day === day && h.month === month);
  if (variable) return variable.name;

  return null;
};

export const canRegister = (date: Date): boolean => {
  if (isWeekend(date)) return false;
  return true;
};

export const getDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');
