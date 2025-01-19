export const globalAlertType = (alertType, data) => {
  return {
    type: 'openAlert',
    payload: {
      severity: alertType,
      message: data,
      open: true,
    },
  };
};
