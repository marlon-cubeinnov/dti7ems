import { ForbiddenError } from '@dti-ems/shared-errors';
import type { AuthTokenPayload } from '@dti-ems/shared-types';

type AuthUser = Pick<AuthTokenPayload, 'permissions'>;

function getPermissions(user: AuthUser) {
  return Array.isArray(user.permissions) ? user.permissions : [];
}

export function hasPermission(user: AuthUser, permission: string) {
  return getPermissions(user).includes(permission);
}

export function hasAnyPermission(user: AuthUser, permissions: readonly string[]) {
  return permissions.some((permission) => hasPermission(user, permission));
}

export function requirePermission(user: AuthUser, permission: string, message: string) {
  if (!hasPermission(user, permission)) {
    throw new ForbiddenError(message);
  }
}

export function requireAnyPermission(user: AuthUser, permissions: readonly string[], message: string) {
  if (!hasAnyPermission(user, permissions)) {
    throw new ForbiddenError(message);
  }
}
