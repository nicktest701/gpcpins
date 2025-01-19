import _ from 'lodash';
export const CustomReducer = (state, { type, payload }) => {
  switch (type) {
    case 'set_user':
      return {
        ...state,
        user: {
          ...payload,
          loading: false,
        },
      };

    case 'remove_user':
      return {
        ...state,
        user: {
          loading: false,
        },
      };

    case 'setLoading':
      return {
        ...state,
        loading: {
          open: payload.open,
          message: payload.message,
        },
      };

    case 'viewEmployee':
      return {
        ...state,
        viewEmployee: payload,
      };

    case 'updateEmployee':
      return {
        ...state,
        updateEmployee: payload,
      };

    case 'ecgNotifications':
      return {
        ...state,
        ecgNotifications: {
          open: payload.open,
          messages: payload.messages,
        },
      };

    case 'checkECGNotifications':
      return {
        ...state,
        ecgNotifications: {
          ...state.ecgNotifications,
          messages: payload,
        },
      };

    case 'openAlert':
      return {
        ...state,
        alertData: {
          severity: payload.severity,
          message: payload.message,
          open: true,
        },
      };
    case 'closeAlert':
      return {
        ...state,
        alertData: {
          severity: '',
          message: '',
          open: false,
        },
      };
    case 'openSidebar':
      return {
        ...state,
        openSidebar: payload,
      };
    case 'openPreviewChecker':
      return {
        ...state,
        openPreviewChecker: payload,
      };

    case 'getVoucherPaymentDetails':
      return {
        ...state,
        voucherPaymentDetails: payload,
      };
    case 'getTicketPaymentDetails':
      return {
        ...state,
        ticketPaymentDetails: payload,
      };

    case 'loadedChecker':
      return {
        ...state,
        loadedChecker: {
          meta: payload.meta,
          data: payload.data,
        },
      };
    case 'newCheckers':
      return {
        ...state,
        newCheckers: payload,
      };

    case 'openAddWaecCategory':
      return {
        ...state,
        category: {
          ...state.category,
          open: payload.open,
        },
      };
    case 'openAddSecurityCategory':
      return {
        ...state,
        securityCategory: {
          ...state.category,
          open: payload.open,
        },
      };
    case 'openAddUniversityCategory':
      return {
        ...state,
        universityCategory: {
          ...state.category,
          open: payload.open,
        },
      };
    case 'openAddCinemaCategory':
      return {
        ...state,
        cinemaCategory: {
          ...state.category,
          open: payload.open,
        },
      };
    case 'openAddStadiumCategory':
      return {
        ...state,
        stadiumCategory: {
          ...state.category,
          open: payload.open,
        },
      };
    case 'openAddBusCategory':
      return {
        ...state,
        busCategory: {
          ...state.category,
          open: payload.open,
        },
      };

    case 'openEditWaecCategory':
      return {
        ...state,
        editWaecCategory: payload,
      };

    case 'openEditSecurityCategory':
      return {
        ...state,
        editSecurityCategory: payload,
      };

    case 'openEditUniversityCategory':
      return {
        ...state,
        editUniversityCategory: payload,
      };

    case 'openEditCinemaCategory':
      return {
        ...state,
        editCinemaCategory: payload,
      };

    case 'openEditStadiumCategory':
      return {
        ...state,
        editStadiumCategory: payload,
      };

    case 'openEditBusCategory':
      return {
        ...state,
        editBusCategory: payload,
      };

    case 'categoryType':
      return {
        ...state,
        category: {
          ...state.category,
          category: payload,
        },
      };

    case 'loadVouchers':
      return {
        ...state,
        transaction: payload,
      };

    ///Meter Details
    case 'addMeter':
      return {
        ...state,
        meters: [...state.meters, payload],
      };
    case 'openAddMeter':
      return {
        ...state,
        addMeter: {
          open: payload.open,
          type: payload.type,
          details: payload.details,
        },
      };
    case 'openVerifyNewMeter':
      return {
        ...state,
        verifyNewMeter: {
          open: payload.open,
          details: payload.details,
        },
      };
    case 'openViewMeter':
      return {
        ...state,
        viewMeter: {
          open: payload.open,
          details: payload.details,
        },
      };

    case 'openVerifyMeter':
      return {
        ...state,
        verifyMeter: {
          open: payload.open,
          details: payload.details,
        },
      };

    case 'viewEcgTransactionInfo':
      return {
        ...state,
        ecgTransactionInfo: {
          open: payload.open,
          details: payload.details,
        },
      };

    case 'viewEcgTransactionInfoEdit':
      return {
        ...state,
        ecgTransactionInfoEdit: {
          open: payload.open,
          details: payload.details,
        },
      };

    case 'openVerifyPrepaid':
      return {
        ...state,
        verifyPrepaid: {
          open: payload.open,
          details: payload.details,
        },
      };
    case 'ticketDetails':
      return {
        ...state,
        ticketDetails: payload,
      };

    case 'sumCinemaTotal':
      return {
        ...state,
        cinemaTicketTotal: _.values(
          _.merge(_.keyBy([...state.cinemaTicketTotal, ...payload], 'type'))
        ),
      };

    case 'sumStadiumTotal':
      return {
        ...state,
        stadiumTicketTotal: _.values(
          _.merge(_.keyBy([...state.stadiumTicketTotal, ...payload], 'type'))
        ),
      };
    case 'matchSearchDetails':
      return {
        ...state,
        matchSearchDetails: payload,
      };

    case 'viewMessage':
      return {
        ...state,
        viewMessage: payload,
      };
    default:
      return state;
  }
};
