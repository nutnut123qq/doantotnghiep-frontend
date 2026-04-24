/**
 * Normalize role from backend to string.
 * Backend may return enum as number (1, 2, 3) or string ("Investor", "Admin", "Premium").
 */
export const normalizeRole = (role: string | number | undefined | null): string => {
  if (role == null) return 'Investor'
  if (typeof role === 'number') {
    if (role === 2) return 'Admin'
    if (role === 3) return 'Premium'
    return 'Investor'
  }
  // Already a string
  return role
}
