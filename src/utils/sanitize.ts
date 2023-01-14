export function sanitizeString(value: string): string {
  return value.replaceAll(/[<>]/g, '').trim();
}
