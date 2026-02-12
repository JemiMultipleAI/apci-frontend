export type Role = 'super_admin' | 'admin' | 'manager' | 'viewer';

export interface RolePermissions {
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canViewUsers: boolean;
  canManageCampaigns: boolean;
  canManageSurveys: boolean;
  canManageContacts: boolean;
  canManageAccounts: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
  canExecuteCampaigns: boolean;
}

const rolePermissions: Record<Role, RolePermissions> = {
  super_admin: {
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canViewUsers: true,
    canManageCampaigns: true,
    canManageSurveys: true,
    canManageContacts: true,
    canManageAccounts: true,
    canViewAnalytics: true,
    canExportData: true,
    canExecuteCampaigns: true,
  },
  admin: {
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canViewUsers: true,
    canManageCampaigns: true,
    canManageSurveys: true,
    canManageContacts: true,
    canManageAccounts: false,
    canViewAnalytics: true,
    canExportData: true,
    canExecuteCampaigns: true,
  },
  manager: {
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canViewUsers: true,
    canManageCampaigns: true,
    canManageSurveys: true,
    canManageContacts: true,
    canManageAccounts: false,
    canViewAnalytics: true,
    canExportData: true,
    canExecuteCampaigns: true,
  },
  viewer: {
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canViewUsers: false,
    canManageCampaigns: false,
    canManageSurveys: false,
    canManageContacts: false,
    canManageAccounts: false,
    canViewAnalytics: true,
    canExportData: false,
    canExecuteCampaigns: false,
  },
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role | string, permission: keyof RolePermissions): boolean {
  if (!role || !(role in rolePermissions)) {
    return false;
  }
  return rolePermissions[role as Role]?.[permission] ?? false;
}

/**
 * Check if a role can perform write operations (create/update)
 */
export function canCreate(userRole: Role | string): boolean {
  return hasPermission(userRole, 'canCreate');
}

/**
 * Check if a role can perform update operations
 */
export function canUpdate(userRole: Role | string): boolean {
  return hasPermission(userRole, 'canUpdate');
}

/**
 * Check if a role can perform delete operations
 */
export function canDelete(userRole: Role | string): boolean {
  return hasPermission(userRole, 'canDelete');
}

/**
 * Check if a role can view users
 */
export function canViewUsers(userRole: Role | string): boolean {
  return hasPermission(userRole, 'canViewUsers');
}

/**
 * Check if a role can export data
 */
export function canExportData(userRole: Role | string): boolean {
  return hasPermission(userRole, 'canExportData');
}

/**
 * Check if a role can execute campaigns
 */
export function canExecuteCampaigns(userRole: Role | string): boolean {
  return hasPermission(userRole, 'canExecuteCampaigns');
}

/**
 * Check if a role can manage accounts/companies
 */
export function canManageAccounts(userRole: Role | string): boolean {
  return hasPermission(userRole, 'canManageAccounts');
}
