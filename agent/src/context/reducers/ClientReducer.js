export const ClientReducer = (state, { type, payload }) => {
  switch (type) {
    case 'setUser':
      return {
        ...state,
        user: payload,
      };

    case 'removeUser':
      return {
        ...state,
        user: {},
      };
    case 'viewClient':
      return {
        ...state,
        viewClient: payload,
      };
    case 'updateClient':
      return {
        ...state,
        updateClient: payload,
      };

    default:
      return state;
  }
};
