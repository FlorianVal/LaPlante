// Photo URLs are root-scoped (/photos/...), independent of the SPA base path
// (/laplante/ via vite `base`). Going through import.meta.env.BASE_URL would
// wrongly produce /laplante/photos/... — so we strip the base back off.
export function photoUrl(photoPath: string): string {
  const base = import.meta.env.BASE_URL || '/'; // e.g. '/laplante/'
  const rootBase = base === '/' ? '' : base.replace(/\/$/, '');
  return `${rootBase}/photos/${photoPath}`;
}
