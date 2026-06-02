import type { PlantResponse, ISODateString } from '@laplante/shared';
import { todayISO, addCalendarDays } from '@laplante/shared';

const API_BASE = '/api';
const PAST_DAYS = 7;
const FUTURE_DAYS = 7;

function getDateWindow(): { from: ISODateString; to: ISODateString } {
  const today = todayISO();
  return {
    from: addCalendarDays(today, -PAST_DAYS),
    to: addCalendarDays(today, FUTURE_DAYS),
  };
}

export async function fetchPlants(
  from: ISODateString,
  to: ISODateString
): Promise<PlantResponse[]> {
  const res = await fetch(`${API_BASE}/plants?from=${from}&to=${to}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function createPlant(formData: FormData): Promise<PlantResponse> {
  const { from, to } = getDateWindow();
  const res = await fetch(`${API_BASE}/plants?from=${from}&to=${to}`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    if (res.status === 413) throw new Error('Photo is too large. Please choose an image under 5 MB.');
    throw new Error('Could not add plant. Check your connection and try again.');
  }
  return res.json();
}

export async function updatePlant(plantId: string, formData: FormData): Promise<PlantResponse> {
  const { from, to } = getDateWindow();
  const res = await fetch(`${API_BASE}/plants/${plantId}?from=${from}&to=${to}`, {
    method: 'PUT',
    body: formData,
  });
  if (!res.ok) {
    if (res.status === 413) throw new Error('Photo is too large. Please choose an image under 5 MB.');
    throw new Error('Could not update plant. Check your connection and try again.');
  }
  return res.json();
}

export async function confirmWatering(plantId: string): Promise<void> {
  const { from, to } = getDateWindow();
  const res = await fetch(`${API_BASE}/plants/${plantId}/waterings?from=${from}&to=${to}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error('Could not confirm watering');
}
