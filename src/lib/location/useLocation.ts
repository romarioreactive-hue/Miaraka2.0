import { useContext } from 'react';

import { LocationContext } from './LocationContext';

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation doit être utilisé à l\'intérieur de <LocationProvider>.');
  }
  return context;
}
