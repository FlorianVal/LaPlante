import { useState, useEffect, useCallback, useRef } from 'react';
import type { PlantResponse, ISODateString } from '@laplante/shared';
import { todayISO, addCalendarDays } from '@laplante/shared';
import { fetchPlants } from '../lib/api';
import { getMockPlants } from '../lib/mock-data';

const POLL_INTERVAL_MS = 60_000;
const PAST_DAYS = 7;
const FUTURE_DAYS = 7;

function getDateWindow(): { from: ISODateString; to: ISODateString } {
  const today = todayISO();
  return {
    from: addCalendarDays(today, -PAST_DAYS),
    to: addCalendarDays(today, FUTURE_DAYS),
  };
}

export function usePlants() {
  const [plants, setPlants] = useState<PlantResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastDateRef = useRef<string>(todayISO());

  const fetchPlantsData = useCallback(async () => {
    try {
      const window = getDateWindow();
      const data = await fetchPlants(window.from, window.to);
      setPlants(data);
      setError(null);
    } catch {
      // On first load failure, fall back to mock data
      // On subsequent failures, keep existing data but set error
      setPlants((prev) => (prev.length === 0 ? getMockPlants() : prev));
      setError('Could not load plants');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlantsData();

    const interval = setInterval(() => {
      // Check for midnight crossover
      const currentDate = todayISO();
      if (currentDate !== lastDateRef.current) {
        lastDateRef.current = currentDate;
        setLoading(true);
      }
      fetchPlantsData();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchPlantsData]);

  return { plants, loading, error, retry: fetchPlantsData };
}
