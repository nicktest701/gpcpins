import React, { useReducer } from 'react';
import { ClientReducer } from '../reducers/ClientReducer';


export const ClientContext = React.createContext();
function ClientProvider({ children }) {
  const initialValues = {
    user: {},
    viewClient: {
      open: false,
      data: {},
    },
    updateClient: {
      open: false,
      data: {},
    },
  };

  const [clientState, clientDispatch] = useReducer(
    ClientReducer,
    initialValues
  );

  return (
    <ClientContext.Provider value={{ clientState, clientDispatch }}>
      {children}
    </ClientContext.Provider>
  );
}

export default ClientProvider;
