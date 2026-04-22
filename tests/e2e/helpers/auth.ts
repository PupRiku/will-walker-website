export const ADMIN_USER = process.env.NEXT_PUBLIC_ADMIN_USER ?? 'admin';
export const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'password';

export function getAuthHeader(): string {
  return 'Basic ' + Buffer.from(`${ADMIN_USER}:${ADMIN_PASSWORD}`).toString('base64');
}
