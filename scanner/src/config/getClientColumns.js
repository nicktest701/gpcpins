import {
  CLIENT_BUS_COLUMNS,
  CLIENT_CINEMA_COLUMNS,
  CLIENT_STADIUM_COLUMNS,
  CLIENT_UNIV_CATEGORY_COLUMNS,
  MAIN_CATEGORY_COLUMNS,
} from '../mocks/clientColumns';

export function getClientColumns(category) {
  switch (category) {
    case 'university':
      return CLIENT_UNIV_CATEGORY_COLUMNS;
    case 'bus':
      return CLIENT_BUS_COLUMNS;
    case 'cinema':
      return CLIENT_CINEMA_COLUMNS;
    case 'stadium':
      return CLIENT_STADIUM_COLUMNS;
    default:
      return MAIN_CATEGORY_COLUMNS;
  }
}
