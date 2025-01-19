
export const CustomReducer = (state, { type, payload }) => {
  switch (type) {
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

    case 'categoryType':
      return {
        ...state,
        category: {
          ...state.category,
          category: payload,
        },
      };

    case 'ticketDetails':
      return {
        ...state,
        ticketDetails: payload,
      };

   


    default:
      return state;
  }
};
