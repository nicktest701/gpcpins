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


export function getCreatePermission(category) {
  switch (category) {
    case 'waec':
      return "Create new checkers"
    case 'university':
      return "Create new forms"
    case 'security':
      return "Create security service forms"
    case 'cinema':
      return "Create cinema tickets"
    case 'stadium':
      return "Create stadium tickets"
    case "bus":
      return "Create bus tickets"
    default:
      return ""
  }
}
export function getEditPermission(category) {
  switch (category) {
    case 'waec':
      return "Edit checkers"
    case 'university':
      return "Edit forms"
    case 'security':
      return "Edit security service forms"
    case 'cinema':
      return "Edit cinema tickets"
    case 'stadium':
      return "Edit stadium tickets"
    case "bus":
      return "Edit bus tickets"
    default:
      return ""
  }
}
export function getDeletePermission(category) {
  switch (category) {
    case 'waec':
      return "Delete checkers"
    case 'university':
      return "Delete forms"
    case 'security':
      return "Delete security service forms"
    case 'cinema':
      return "Delete cinema tickets"
    case 'stadium':
      return "Delete stadium tickets"
    case "bus":
      return "Delete bus tickets"
    default:
      return ""
  }
}

export function getExportPermission(category) {
  switch (category) {
    case 'waec':
      return "Export checkers"
    case 'university':
      return "Export forms"
    case 'security':
      return "Export security service"
    case 'cinema':
      return "Export cinema tickets"
    case 'stadium':
      return "Export stadium tickets"
    case "bus":
      return "Export bus tickets"
    default:
      return ""
  }
}


export function getLoadPermission(category) {
  switch (category) {
    case 'waec':
      return "Load checkers pins & serials"
    case 'university':
      return "Load forms pins & serials"
    case 'security':
      return "Load security service pins & serials"
    case 'cinema':
      return "Load cinema tickets pins & serials"
    case 'stadium':
      return "Load stadium tickets pins & serials"
    case "bus":
      return "Load bus tickets pins & serials"
    default:
      return ""
  }
}


export function getDeletePinsPermission(category) {
  switch (category) {
    case 'waec':
      return "Delete checkers pins & serials"
    case 'university':
      return "Delete forms pins & serials"
    case 'security':
      return "Delete security service pins & serials"
    case 'cinema':
      return "Delete cinema tickets pins & serials"
    case 'stadium':
      return "Delete stadium tickets pins & serials"
    case "bus":
      return "Delete bus tickets pins & serials"
    default:
      return ""
  }
}

export function getExportPinsPermission(category) {
  switch (category) {
    case 'waec':
      return "Export checkers pins & serials"
    case 'university':
      return "Export forms pins & serials"
    case 'security':
      return "Export security service pins & serials"
    case 'cinema':
      return "Export cinema tickets pins & serials"
    case 'stadium':
      return "Export stadium tickets pins & serials"
    case "bus":
      return "Export bus tickets pins & serials"
    default:
      return ""
  }
}

