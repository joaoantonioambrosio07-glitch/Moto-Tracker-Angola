
import { Holiday } from './types';

export const TRIP_COST_PER_WAY = 400; // 400 Kz
export const DAILY_TOTAL_POTENTIAL = TRIP_COST_PER_WAY * 2; // 800 Kz

export const ANGOLA_HOLIDAYS: Holiday[] = [
  { day: 1, month: 0, name: 'Ano Novo' },
  { day: 4, month: 1, name: 'Início da Luta Armada' },
  { day: 8, month: 2, name: 'Dia Internacional da Mulher' },
  { day: 23, month: 2, name: 'Dia da Libertação da África Austral' },
  { day: 4, month: 3, name: 'Dia da Paz e Reconciliação Nacional' },
  { day: 1, month: 4, name: 'Dia do Trabalho' },
  { day: 17, month: 8, name: 'Dia do Herói Nacional' },
  { day: 2, month: 10, name: 'Dia dos Finados' },
  { day: 11, month: 10, name: 'Dia da Independência Nacional' },
  { day: 25, month: 11, name: 'Dia de Natal' },
];

export const GET_VARIABLE_HOLIDAYS = (year: number): Holiday[] => {
  if (year === 2024) {
    return [
      { day: 13, month: 1, name: 'Carnaval' },
      { day: 29, month: 2, name: 'Sexta-feira Santa' },
    ];
  }
  if (year === 2025) {
    return [
      { day: 4, month: 2, name: 'Carnaval' },
      { day: 18, month: 3, name: 'Sexta-feira Santa' },
    ];
  }
  return [];
};
