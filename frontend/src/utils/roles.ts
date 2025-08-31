export const hasRole = (role: string, allowed: string[]): boolean => {
  if (!role) return false;
  // Owner automatically counts as admin privileges
  if (role === 'OWNER') return true;
  return allowed.includes(role);
};
