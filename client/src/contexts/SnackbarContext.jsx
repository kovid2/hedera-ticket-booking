import React, { createContext, useState, useContext } from 'react';
import Snackbar from '../components/Snackbar/Snackbar';

const SnackbarContext = createContext();

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({ message: '', type: 'success', open: false });

  const showSnackbar = (message, type = 'success') => {
    if (type !== 'success' && type !== 'error') {
      console.error('Invalid snackbar type');
      return;
    }
    setSnackbar({ message, type, open: true });
    setTimeout(() => setSnackbar({ ...snackbar, open: false }), 3000); // Automatically hide after 3 seconds
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      {snackbar.open && <Snackbar message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar({ ...snackbar, open: false })} />}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);
