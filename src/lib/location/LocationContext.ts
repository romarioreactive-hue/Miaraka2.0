import { createContext } from 'react';

import type { LocationContextValue } from '@/types/location';

export const LocationContext = createContext<LocationContextValue | null>(null);
