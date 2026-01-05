import { useState, useEffect } from "react";
import { COMMON_GENES } from "./constants";

// Debounce hook for search optimization
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook to load large gene list (can be extended to fetch from API)
export function useGeneList() {
  const [geneList, setGeneList] = useState<string[]>(COMMON_GENES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For now, use COMMON_GENES as fallback
    // In production, you can fetch from API:
    // const loadGenes = async () => {
    //   setLoading(true);
    //   try {
    //     const response = await fetch('/api/genes');
    //     const data = await response.json();
    //     setGeneList(data.genes || COMMON_GENES);
    //   } catch (err) {
    //     setError('Failed to load genes');
    //     setGeneList(COMMON_GENES);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // loadGenes();

    // For large lists (2-30k), you can:
    // 1. Load from API endpoint
    // 2. Use lazy loading (load on demand)
    // 3. Cache in localStorage/indexedDB
    // 4. Use Web Worker for filtering

    setGeneList(COMMON_GENES);
  }, []);

  return { geneList, loading, error };
}
