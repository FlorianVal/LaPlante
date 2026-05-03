import type { PlantResponse, ISODateString } from '@laplante/shared';

const API_BASE = '/api';

export async function fetchPlants(
  from: ISODateString,
  to: ISODateString
): Promise<PlantResponse[]> {
  const res = await fetch(`${API_BASE}/plants?from=${from}&to=${to}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
