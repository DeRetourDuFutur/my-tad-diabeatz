"use client";

import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading localStorage key “" + key + "”:", error);
      return initialValue;
    }
  });

  useEffect(() => {
    // This effect ensures that if the component using this hook mounts on the server first,
    // it will correctly initialize with localStorage value on the client after hydration.
    if (typeof window !== "undefined") {
      try {
        const item = window.localStorage.getItem(key);
        setStoredValue(item ? JSON.parse(item) : initialValue);
      } catch (error) {
        console.error("Error reading localStorage key “" + key + "”:", error);
        setStoredValue(initialValue);
      }
    }
  }, [key, initialValue]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    if (typeof window === "undefined") {
      console.warn(`Tried setting localStorage key “${key}” even though environment is not a client`);
      return;
    }
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("Error setting localStorage key “" + key + "”:", error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

export default useLocalStorage;
