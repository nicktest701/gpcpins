import {
  busTicketColumns,
  cinemaTicketColumns,
  stadiumTicketColumns,
  voucherCategoryColumns,
  universityCategoryColumns,
  waecCategoryColumns,
} from '../mocks/columns';

export function getColumns(category) {
  switch (category) {
    case 'waec':
      return waecCategoryColumns;
    case 'university':
      return universityCategoryColumns;
    case 'bus':
      return busTicketColumns;
    case 'cinema':
      return cinemaTicketColumns;
    case 'stadium':
      return stadiumTicketColumns;
    default:
      return voucherCategoryColumns;
  }
}
