'use client';

import { useState, useEffect } from 'react';
import { getState, subscribe, stepSimulation, AppState } from './store';

let intervalId: NodeJS.Timeout | null = null;

export function useAppState(): AppState {
  const [state, setState] = useState<AppState>(getState());

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setState(getState());
    });

    // Start background simulation timer on client once
    if (typeof window !== 'undefined' && !intervalId) {
      intervalId = setInterval(() => {
        stepSimulation();
      }, 1000);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  return state;
}
