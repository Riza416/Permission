// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type OrgType = 'client' | 'manager';
export type UserType = 'client' | 'manager';
export type PermissionScope = 'client' | 'manager';
export type ResetType = 'password' | '2fa';
export type ResetStatus = 'pending' | 'completed' | 'rejected';
export type TicketStatus = 'not-started' | 'in-progress' | 'done';

export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  created_at: string;
}

export interface Entity {
  id: string;
  name: string;
  organization_id: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  user_type: UserType;
  organization_id: string;
  entity_ids: string[];
  group_ids: string[];
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  scope: PermissionScope;
}

export interface PermissionGroup {
  id: string;
  name: string;
  organization_id: string;
  permission_ids: string[];
  is_super_admin: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actor_id: string;
  actor_name: string;
  target_type: string;
  target_id: string;
  target_name: string;
  details: string;
  organization_id: string;
  created_at: string;
}

export interface ResetRequest {
  id: string;
  requester_id: string;
  requester_name: string;
  target_user_id: string;
  target_user_name: string;
  reset_type: ResetType;
  status: ResetStatus;
  created_at: string;
  completed_at: string | null;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: number;
  dependencies: string[];
  userStory: string;
  definitionOfDone: string[];
  featureFlag: boolean;
}

// ─────────────────────────────────────────────
// Organizations
// ─────────────────────────────────────────────

export const organizations: Organization[] = [
  {
    id: 'org-acme',
    name: 'Acme Corp',
    type: 'client',
    created_at: '2024-01-15T08:00:00Z',
  },
  {
    id: 'org-flux',
    name: 'Flux Operations',
    type: 'manager',
    created_at: '2023-06-01T08:00:00Z',
  },
];

// ─────────────────────────────────────────────
// Entities / Spaces
// ─────────────────────────────────────────────

export const entities: Entity[] = [
  {
    id: 'ent-acme-us',
    name: 'Acme US',
    organization_id: 'org-acme',
    created_at: '2024-01-20T09:00:00Z',
  },
  {
    id: 'ent-acme-eu',
    name: 'Acme EU',
    organization_id: 'org-acme',
    created_at: '2024-01-20T09:05:00Z',
  },
  {
    id: 'ent-acme-apac',
    name: 'Acme APAC',
    organization_id: 'org-acme',
    created_at: '2024-01-20T09:10:00Z',
  },
  {
    id: 'ent-flux-trading',
    name: 'Flux Trading',
    organization_id: 'org-flux',
    created_at: '2023-06-05T10:00:00Z',
  },
  {
    id: 'ent-flux-compliance',
    name: 'Flux Compliance',
    organization_id: 'org-flux',
    created_at: '2023-06-05T10:05:00Z',
  },
];

// ─────────────────────────────────────────────
// Permissions
// ─────────────────────────────────────────────

export const permissions: Permission[] = [
  // Client permissions
  {
    id: 'perm-create-transactions',
    name: 'create_transactions',
    description: 'Create new payment or transfer transactions',
    scope: 'client',
  },
  {
    id: 'perm-approve-transactions',
    name: 'approve_transactions',
    description: 'Approve pending transactions submitted by other users',
    scope: 'client',
  },
  {
    id: 'perm-create-invoices',
    name: 'create_invoices',
    description: 'Create and submit invoices for processing',
    scope: 'client',
  },
  {
    id: 'perm-view-reporting',
    name: 'view_reporting',
    description: 'Access reporting dashboards and export data',
    scope: 'client',
  },
  {
    id: 'perm-request-user-resets',
    name: 'request_user_resets',
    description: 'Request password or 2FA resets on behalf of other users',
    scope: 'client',
  },
  {
    id: 'perm-edit-settings',
    name: 'edit_settings',
    description: 'Edit organization-level settings and preferences',
    scope: 'client',
  },
  {
    id: 'perm-create-client-users',
    name: 'create_new_client_users',
    description: 'Invite and create new users within the client organization',
    scope: 'client',
  },
  {
    id: 'perm-deactivate-client-users',
    name: 'deactivate_client_users',
    description: 'Deactivate or suspend existing client users',
    scope: 'client',
  },
  // Custody wallet permissions (client)
  {
    id: 'perm-custody-wallet-create',
    name: 'custody.wallet.create',
    description: 'Create new crypto custody wallets scoped by currency',
    scope: 'client',
  },
  {
    id: 'perm-custody-wallet-assign-group',
    name: 'custody.wallet.assign_group',
    description: 'Assign or unassign user groups to/from custody wallets',
    scope: 'client',
  },
  // Manager permissions
  {
    id: 'perm-edit-merchant-details',
    name: 'edit_merchant_details',
    description: 'Edit merchant profile and banking details for client organizations',
    scope: 'manager',
  },
  {
    id: 'perm-edit-compliance-status',
    name: 'edit_user_compliance_status_and_add_comment',
    description: "Update a user's compliance status and attach internal comments",
    scope: 'manager',
  },
  {
    id: 'perm-view-invoice-reporting',
    name: 'view_invoice_reporting',
    description: 'Access invoice-level reporting across all client organizations',
    scope: 'manager',
  },
  {
    id: 'perm-view-trading-reporting',
    name: 'view_trading_reporting',
    description: 'Access trading and FX reporting across all client organizations',
    scope: 'manager',
  },
  {
    id: 'perm-approve-wire-details',
    name: 'approve_wire_details',
    description: 'Approve or reject wire transfer details submitted by clients',
    scope: 'manager',
  },
  {
    id: 'perm-request-manager-resets',
    name: 'request_manager_resets',
    description: 'Request password or 2FA resets for manager-side users',
    scope: 'manager',
  },
  {
    id: 'perm-create-manager-users',
    name: 'create_new_manager_users',
    description: 'Invite and create new users within the manager organization',
    scope: 'manager',
  },
  {
    id: 'perm-deactivate-manager-users',
    name: 'deactivate_manager_users',
    description: 'Deactivate or suspend existing manager users',
    scope: 'manager',
  },
];

// ─────────────────────────────────────────────
// Permission Groups
// ─────────────────────────────────────────────

export const permissionGroups: PermissionGroup[] = [
  // Acme Corp groups
  {
    id: 'grp-acme-super-admin',
    name: 'Super Admin',
    organization_id: 'org-acme',
    permission_ids: [
      'perm-create-transactions',
      'perm-approve-transactions',
      'perm-create-invoices',
      'perm-view-reporting',
      'perm-request-user-resets',
      'perm-edit-settings',
      'perm-create-client-users',
      'perm-deactivate-client-users',
      'perm-custody-wallet-create',
      'perm-custody-wallet-assign-group',
    ],
    is_super_admin: true,
    created_at: '2024-01-21T08:00:00Z',
  },
  {
    id: 'grp-acme-finance',
    name: 'Finance',
    organization_id: 'org-acme',
    permission_ids: [
      'perm-create-transactions',
      'perm-approve-transactions',
      'perm-create-invoices',
      'perm-view-reporting',
    ],
    is_super_admin: false,
    created_at: '2024-01-21T08:10:00Z',
  },
  {
    id: 'grp-acme-operations',
    name: 'Operations',
    organization_id: 'org-acme',
    permission_ids: [
      'perm-create-transactions',
      'perm-create-invoices',
      'perm-view-reporting',
    ],
    is_super_admin: false,
    created_at: '2024-01-21T08:20:00Z',
  },
  {
    id: 'grp-acme-compliance',
    name: 'Compliance',
    organization_id: 'org-acme',
    permission_ids: [
      'perm-view-reporting',
    ],
    is_super_admin: false,
    created_at: '2024-01-21T08:30:00Z',
  },
  // Flux Operations groups
  {
    id: 'grp-flux-super-admin',
    name: 'Super Admin',
    organization_id: 'org-flux',
    permission_ids: [
      'perm-edit-merchant-details',
      'perm-edit-compliance-status',
      'perm-view-invoice-reporting',
      'perm-view-trading-reporting',
      'perm-approve-wire-details',
      'perm-request-manager-resets',
      'perm-create-manager-users',
      'perm-deactivate-manager-users',
    ],
    is_super_admin: true,
    created_at: '2023-06-10T08:00:00Z',
  },
  {
    id: 'grp-flux-compliance',
    name: 'Compliance',
    organization_id: 'org-flux',
    permission_ids: [
      'perm-edit-compliance-status',
      'perm-view-invoice-reporting',
      'perm-view-trading-reporting',
    ],
    is_super_admin: false,
    created_at: '2023-06-10T08:10:00Z',
  },
  {
    id: 'grp-flux-operations',
    name: 'Operations',
    organization_id: 'org-flux',
    permission_ids: [
      'perm-edit-merchant-details',
      'perm-approve-wire-details',
      'perm-view-invoice-reporting',
      'perm-view-trading-reporting',
    ],
    is_super_admin: false,
    created_at: '2023-06-10T08:20:00Z',
  },
];

// ─────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────

export const users: User[] = [
  // Acme Corp users
  {
    id: 'usr-alice',
    name: 'Alice Nguyen',
    email: 'alice.nguyen@acmecorp.com',
    user_type: 'client',
    organization_id: 'org-acme',
    entity_ids: ['ent-acme-us', 'ent-acme-eu', 'ent-acme-apac'],
    group_ids: ['grp-acme-super-admin'],
    status: 'active',
    created_at: '2024-01-22T09:00:00Z',
  },
  {
    id: 'usr-bob',
    name: 'Bob Patel',
    email: 'bob.patel@acmecorp.com',
    user_type: 'client',
    organization_id: 'org-acme',
    entity_ids: ['ent-acme-us'],
    group_ids: ['grp-acme-finance'],
    status: 'active',
    created_at: '2024-02-01T10:00:00Z',
  },
  {
    id: 'usr-carol',
    name: 'Carol Smith',
    email: 'carol.smith@acmecorp.com',
    user_type: 'client',
    organization_id: 'org-acme',
    entity_ids: ['ent-acme-eu', 'ent-acme-apac'],
    group_ids: ['grp-acme-operations'],
    status: 'active',
    created_at: '2024-02-10T11:00:00Z',
  },
  {
    id: 'usr-dave',
    name: 'Dave Kim',
    email: 'dave.kim@acmecorp.com',
    user_type: 'client',
    organization_id: 'org-acme',
    entity_ids: ['ent-acme-us'],
    group_ids: ['grp-acme-compliance'],
    status: 'inactive',
    created_at: '2024-02-15T12:00:00Z',
  },
  // Flux Operations users
  {
    id: 'usr-eva',
    name: 'Eva Martinez',
    email: 'eva.martinez@fluxops.com',
    user_type: 'manager',
    organization_id: 'org-flux',
    entity_ids: ['ent-flux-trading', 'ent-flux-compliance'],
    group_ids: ['grp-flux-super-admin'],
    status: 'active',
    created_at: '2023-06-15T08:00:00Z',
  },
  {
    id: 'usr-frank',
    name: 'Frank Chen',
    email: 'frank.chen@fluxops.com',
    user_type: 'manager',
    organization_id: 'org-flux',
    entity_ids: ['ent-flux-compliance'],
    group_ids: ['grp-flux-compliance'],
    status: 'active',
    created_at: '2023-07-01T09:00:00Z',
  },
];

// ─────────────────────────────────────────────
// Audit Logs
// ─────────────────────────────────────────────

export const auditLogs: AuditLog[] = [
  {
    id: 'log-001',
    action: 'USER_CREATED',
    actor_id: 'usr-alice',
    actor_name: 'Alice Nguyen',
    target_type: 'user',
    target_id: 'usr-bob',
    target_name: 'Bob Patel',
    details: 'Created new client user and assigned to Finance group',
    organization_id: 'org-acme',
    created_at: '2024-02-01T10:05:00Z',
  },
  {
    id: 'log-002',
    action: 'USER_CREATED',
    actor_id: 'usr-alice',
    actor_name: 'Alice Nguyen',
    target_type: 'user',
    target_id: 'usr-carol',
    target_name: 'Carol Smith',
    details: 'Created new client user and assigned to Operations group',
    organization_id: 'org-acme',
    created_at: '2024-02-10T11:05:00Z',
  },
  {
    id: 'log-003',
    action: 'USER_DEACTIVATED',
    actor_id: 'usr-alice',
    actor_name: 'Alice Nguyen',
    target_type: 'user',
    target_id: 'usr-dave',
    target_name: 'Dave Kim',
    details: 'User deactivated following offboarding request',
    organization_id: 'org-acme',
    created_at: '2024-03-05T14:00:00Z',
  },
  {
    id: 'log-004',
    action: 'GROUP_PERMISSION_UPDATED',
    actor_id: 'usr-alice',
    actor_name: 'Alice Nguyen',
    target_type: 'permission_group',
    target_id: 'grp-acme-finance',
    target_name: 'Finance',
    details: 'Added approve_transactions permission to Finance group',
    organization_id: 'org-acme',
    created_at: '2024-03-10T09:30:00Z',
  },
  {
    id: 'log-005',
    action: 'RESET_REQUESTED',
    actor_id: 'usr-alice',
    actor_name: 'Alice Nguyen',
    target_type: 'user',
    target_id: 'usr-bob',
    target_name: 'Bob Patel',
    details: 'Password reset requested on behalf of Bob Patel',
    organization_id: 'org-acme',
    created_at: '2024-03-12T10:00:00Z',
  },
  {
    id: 'log-006',
    action: 'USER_CREATED',
    actor_id: 'usr-eva',
    actor_name: 'Eva Martinez',
    target_type: 'user',
    target_id: 'usr-frank',
    target_name: 'Frank Chen',
    details: 'Created new manager user and assigned to Compliance group',
    organization_id: 'org-flux',
    created_at: '2023-07-01T09:05:00Z',
  },
  {
    id: 'log-007',
    action: 'COMPLIANCE_STATUS_UPDATED',
    actor_id: 'usr-frank',
    actor_name: 'Frank Chen',
    target_type: 'user',
    target_id: 'usr-carol',
    target_name: 'Carol Smith',
    details: 'Compliance status changed to verified; comment: "All documents reviewed and approved"',
    organization_id: 'org-flux',
    created_at: '2024-03-15T11:00:00Z',
  },
  {
    id: 'log-008',
    action: 'WIRE_DETAILS_APPROVED',
    actor_id: 'usr-eva',
    actor_name: 'Eva Martinez',
    target_type: 'transaction',
    target_id: 'txn-88291',
    target_name: 'Wire #88291',
    details: 'Wire transfer details approved for Acme Corp — $250,000 USD',
    organization_id: 'org-flux',
    created_at: '2024-03-18T13:45:00Z',
  },
];

// ─────────────────────────────────────────────
// Reset Requests
// ─────────────────────────────────────────────

export const resetRequests: ResetRequest[] = [
  {
    id: 'reset-001',
    requester_id: 'usr-alice',
    requester_name: 'Alice Nguyen',
    target_user_id: 'usr-bob',
    target_user_name: 'Bob Patel',
    reset_type: 'password',
    status: 'completed',
    created_at: '2024-03-12T10:00:00Z',
    completed_at: '2024-03-12T10:45:00Z',
  },
  {
    id: 'reset-002',
    requester_id: 'usr-alice',
    requester_name: 'Alice Nguyen',
    target_user_id: 'usr-carol',
    target_user_name: 'Carol Smith',
    reset_type: '2fa',
    status: 'pending',
    created_at: '2024-03-20T09:00:00Z',
    completed_at: null,
  },
  {
    id: 'reset-003',
    requester_id: 'usr-eva',
    requester_name: 'Eva Martinez',
    target_user_id: 'usr-frank',
    target_user_name: 'Frank Chen',
    reset_type: 'password',
    status: 'rejected',
    created_at: '2024-03-18T08:00:00Z',
    completed_at: '2024-03-18T08:30:00Z',
  },
];

// ─────────────────────────────────────────────
// Custody Wallets
// ─────────────────────────────────────────────

export interface CustodyWallet {
  id: string;
  currency: string;
  currency_name: string;
  address: string;
  organization_id: string;
  assigned_group_ids: string[];
  status: 'active' | 'frozen';
  created_by: string;
  created_at: string;
}

export const custodyWallets: CustodyWallet[] = [
  {
    id: 'wallet-btc-01',
    currency: 'BTC',
    currency_name: 'Bitcoin',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    organization_id: 'org-acme',
    assigned_group_ids: ['grp-acme-super-admin', 'grp-acme-finance'],
    status: 'active',
    created_by: 'usr-alice',
    created_at: '2024-04-01T09:00:00Z',
  },
  {
    id: 'wallet-eth-01',
    currency: 'ETH',
    currency_name: 'Ethereum',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28',
    organization_id: 'org-acme',
    assigned_group_ids: ['grp-acme-super-admin'],
    status: 'active',
    created_by: 'usr-alice',
    created_at: '2024-04-02T10:00:00Z',
  },
  {
    id: 'wallet-usdc-01',
    currency: 'USDC',
    currency_name: 'USD Coin',
    address: '0x8B3f5393bA08c24cc7ff5A66a832562aAB7bC95f',
    organization_id: 'org-acme',
    assigned_group_ids: ['grp-acme-super-admin', 'grp-acme-finance', 'grp-acme-operations'],
    status: 'active',
    created_by: 'usr-alice',
    created_at: '2024-04-03T11:00:00Z',
  },
  {
    id: 'wallet-btc-02',
    currency: 'BTC',
    currency_name: 'Bitcoin',
    address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
    organization_id: 'org-acme',
    assigned_group_ids: [],
    status: 'frozen',
    created_by: 'usr-alice',
    created_at: '2024-04-05T14:00:00Z',
  },
];

// ─────────────────────────────────────────────
// Implementation Roadmap Tickets
// ─────────────────────────────────────────────

export const tickets: Ticket[] = [
  {
    id: 'RBAC-1',
    title: 'Organization Model',
    description:
      'Define the core Organization entity that distinguishes client organizations from the manager (Flux) organization. All other RBAC constructs are scoped to an organization.',
    status: 'not-started',
    priority: 1,
    dependencies: [],
    userStory:
      'As a platform engineer, I want a first-class Organization model so that all users, groups, and permissions can be scoped to either a client org or the manager org.',
    definitionOfDone: [
      'Organization schema created with id, name, type (client | manager), and created_at fields',
      'Database migration written and tested',
      'Seed data includes at least one client org and the manager org',
      'Unit tests cover org creation and type validation',
    ],
    featureFlag: false,
  },
  {
    id: 'RBAC-2',
    title: 'User Type Classification',
    description:
      'Extend the User model with a user_type field (client | manager) that controls which permission scopes and UI surfaces a user can access.',
    status: 'not-started',
    priority: 2,
    dependencies: ['RBAC-1'],
    userStory:
      'As a platform engineer, I want every user to have an explicit type so the system can enforce scope boundaries between client-side and manager-side functionality.',
    definitionOfDone: [
      'user_type field added to User schema with enum constraint',
      'Existing users backfilled with correct type',
      'Registration and invitation flows set user_type based on the inviting organization\'s type',
      'Unit tests cover type assignment and validation',
    ],
    featureFlag: false,
  },
  {
    id: 'RBAC-3',
    title: 'Spaces / Entities',
    description:
      'Introduce the Entity (Space) model representing a sub-unit of an organization (e.g., Acme US, Acme EU). Users are assigned to one or more entities, and permissions can be entity-scoped.',
    status: 'not-started',
    priority: 3,
    dependencies: ['RBAC-1'],
    userStory:
      'As an Acme Corp admin, I want to segment my users by regional entity so that each user only sees data relevant to their assigned space.',
    definitionOfDone: [
      'Entity schema created with id, name, organization_id, and created_at',
      'User model updated with entity_ids array',
      'API endpoints exist to create, list, and assign entities',
      'Data isolation verified: users in Entity A cannot access Entity B data',
      'Integration tests cover entity assignment and access control',
    ],
    featureFlag: true,
  },
  {
    id: 'RBAC-4',
    title: 'Central Permission Registry',
    description:
      'Define all named permissions in a central registry with scope (client | manager). This is the single source of truth for what actions exist in the system.',
    status: 'not-started',
    priority: 4,
    dependencies: ['RBAC-1', 'RBAC-2'],
    userStory:
      'As a platform engineer, I want a canonical list of permissions so that groups and middleware can reference them by stable ID rather than magic strings.',
    definitionOfDone: [
      'Permission schema created with id, name, description, and scope',
      'All 16 permissions (8 client, 8 manager) seeded into the database',
      'No permission can be created at runtime — registry is code-defined and migrated',
      'Unit tests assert all expected permissions exist with correct scope',
    ],
    featureFlag: false,
  },
  {
    id: 'RBAC-5',
    title: 'Permission Groups',
    description:
      'Implement PermissionGroup as a named, org-scoped bundle of permissions that can be assigned to users. Admins can create and modify groups.',
    status: 'not-started',
    priority: 5,
    dependencies: ['RBAC-4'],
    userStory:
      'As an Acme Corp admin, I want to create permission groups (e.g., Finance, Operations) so I can manage access by role rather than per-user.',
    definitionOfDone: [
      'PermissionGroup schema created with id, name, organization_id, permission_ids, is_super_admin, and created_at',
      'API endpoints: create, read, update (add/remove permissions), delete group',
      'Users can be assigned to multiple groups; effective permissions are the union',
      'Changing a group\'s permissions takes effect immediately for all members',
      'Integration tests cover CRUD operations and effective-permission resolution',
    ],
    featureFlag: false,
  },
  {
    id: 'RBAC-6',
    title: 'Super Admin Group',
    description:
      'Implement the is_super_admin flag on PermissionGroup. Super Admin members automatically receive all permissions for their org type and bypass per-permission checks.',
    status: 'not-started',
    priority: 6,
    dependencies: ['RBAC-5'],
    userStory:
      'As an organization admin, I want a Super Admin group that grants full access so I can delegate unrestricted management to trusted users.',
    definitionOfDone: [
      'is_super_admin flag respected in permission resolution — super admins receive all permissions for their scope',
      'Super Admin group cannot have permissions removed individually (all-or-nothing)',
      'At least one Super Admin must exist per organization at all times (deletion guard)',
      'Audit log entry created whenever super admin status is granted or revoked',
      'Tests confirm super admin bypasses individual permission gates',
    ],
    featureFlag: false,
  },
  {
    id: 'RBAC-7',
    title: 'API Permission Enforcement / Middleware',
    description:
      'Implement request-level middleware that checks the authenticated user\'s resolved permissions before allowing access to protected API routes.',
    status: 'not-started',
    priority: 7,
    dependencies: ['RBAC-2', 'RBAC-4', 'RBAC-5'],
    userStory:
      'As a platform engineer, I want every API route to declaratively require a permission so that unauthorized calls are rejected at the boundary.',
    definitionOfDone: [
      'Middleware reads user\'s group memberships and resolves effective permission set',
      'Each protected route declares required permission(s) via decorator or config',
      'Requests missing required permission receive 403 with a structured error body',
      'Super admin flag short-circuits individual permission checks correctly',
      'Scope boundary enforced: client users cannot call manager-scoped endpoints and vice versa',
      'Unit and integration tests cover allow, deny, and super-admin cases',
    ],
    featureFlag: false,
  },
  {
    id: 'RBAC-8',
    title: 'Build RBAC APIs',
    description:
      'Expose the full set of RBAC management endpoints: user CRUD, group management, entity assignment, and org-level admin operations.',
    status: 'not-started',
    priority: 8,
    dependencies: ['RBAC-6', 'RBAC-7'],
    userStory:
      'As an admin, I want a complete set of RBAC APIs so the frontend (and future integrations) can manage users, groups, and permissions programmatically.',
    definitionOfDone: [
      'Endpoints: invite user, deactivate user, assign user to group(s), assign user to entity(s)',
      'Endpoints: create group, update group permissions, delete group',
      'Endpoints: list users, list groups, list permissions (scoped by org type)',
      'All endpoints protected by appropriate permissions from the registry',
      'OpenAPI/Swagger spec generated and accurate',
      'End-to-end tests cover primary admin workflows',
    ],
    featureFlag: false,
  },
  {
    id: 'RBAC-9',
    title: 'Audit Logging',
    description:
      'Record an immutable audit log entry for every RBAC-significant action: user creation/deactivation, group changes, permission changes, and reset requests.',
    status: 'not-started',
    priority: 9,
    dependencies: ['RBAC-8'],
    userStory:
      'As a compliance officer, I want a tamper-evident audit trail so I can review who changed what and when across the entire access control system.',
    definitionOfDone: [
      'AuditLog schema created with all required fields (actor, target, action, details, org, timestamp)',
      'Log entries created automatically via service hooks — no manual log calls in controllers',
      'Logs are append-only; no update or delete endpoints exposed',
      'API endpoint to query logs with filters: org, actor, action type, date range',
      'Logs queryable by target_type and target_id for per-resource history',
      'Tests assert that all auditable actions produce a log entry',
    ],
    featureFlag: false,
  },
  {
    id: 'RBAC-10',
    title: 'Reset Requests',
    description:
      'Implement the reset request workflow: authorized users submit password or 2FA reset requests for other users; manager-side admins review and fulfill or reject them.',
    status: 'not-started',
    priority: 10,
    dependencies: ['RBAC-8', 'RBAC-9'],
    userStory:
      'As an Acme Corp admin with request_user_resets permission, I want to submit a reset request for a colleague so that Flux Operations can securely action it.',
    definitionOfDone: [
      'ResetRequest schema created with all required fields',
      'POST endpoint to create a reset request (requires request_user_resets or request_manager_resets permission)',
      'PATCH endpoint for manager to mark request completed or rejected',
      'Audit log entries created on request creation and status change',
      'Notification triggered to the relevant admin on new pending request',
      'Integration tests cover full lifecycle: create → complete and create → reject',
    ],
    featureFlag: true,
  },
  {
    id: 'RBAC-11',
    title: 'Admin UI',
    description:
      'Build the RBAC administration interface allowing org admins and Flux managers to manage users, groups, permissions, entities, and reset requests through a web UI.',
    status: 'not-started',
    priority: 11,
    dependencies: ['RBAC-8', 'RBAC-9', 'RBAC-10'],
    userStory:
      'As an org admin, I want a dedicated admin UI so I can manage all aspects of access control without needing direct API access.',
    definitionOfDone: [
      'User list view with search, filter by status/group/entity, and deactivate action',
      'User detail view showing group memberships, entity assignments, and audit history',
      'Group management view: create, edit permissions, delete, assign users',
      'Permission registry view (read-only) showing all permissions and their scope',
      'Entity management view: create entities, assign users',
      'Reset requests queue with approve/reject actions for manager users',
      'Audit log view with filters for org, actor, action, and date range',
      'All UI actions disabled/hidden based on the logged-in user\'s own permissions',
      'Accessibility: WCAG 2.1 AA compliant',
      'E2E tests cover primary admin workflows using a test account',
    ],
    featureFlag: true,
  },
  // ── Custody Wallet Tickets ──
  {
    id: 'RBAC-12',
    title: 'Define Custody Wallet Permission Types',
    description:
      'Introduce custody.wallet.create and custody.wallet.assign_group permission types into the central permission registry for custody wallet operations.',
    status: 'not-started',
    priority: 12,
    dependencies: ['RBAC-4'],
    userStory:
      'As a platform administrator, I want to define new permission types for custody wallet management so that only authorized users can create crypto wallets and assign groups to them.',
    definitionOfDone: [
      'New custody wallet permission types are defined and added to the permission registry',
      'Permission types follow the naming conventions and structure of the new permissions framework',
      'Permissions are documented in the permissions registry with clear descriptions',
      'Unit tests cover permission type validation and registration',
    ],
    featureFlag: true,
  },
  {
    id: 'RBAC-13',
    title: 'Permission-Gated Wallet Creation by Currency',
    description:
      'Implement the backend logic that allows authorized users to create new crypto wallets scoped by currency. Enforces custody.wallet.create permission check.',
    status: 'not-started',
    priority: 13,
    dependencies: ['RBAC-12'],
    userStory:
      'As a user with the custody.wallet.create permission, I want to create new crypto wallets for specific currencies so that I can manage custody wallets for different assets on the platform.',
    definitionOfDone: [
      'API endpoint for creating a new crypto wallet by currency is implemented',
      'Permission check enforces custody.wallet.create before allowing wallet creation',
      'Users without the correct permission receive a 403 Forbidden response',
      'Wallet is created and associated with the specified currency',
      'Audit log entry is created for each wallet creation event',
      'Unit and integration tests pass',
    ],
    featureFlag: true,
  },
  {
    id: 'RBAC-14',
    title: 'Permission-Gated Group Assignment to Wallets',
    description:
      'Implement the backend logic that allows authorized users to assign user groups to crypto wallets. Enforces custody.wallet.assign_group permission check.',
    status: 'not-started',
    priority: 14,
    dependencies: ['RBAC-12', 'RBAC-13'],
    userStory:
      'As a user with the custody.wallet.assign_group permission, I want to assign user groups to crypto wallets so that the correct teams have access to the appropriate wallets.',
    definitionOfDone: [
      'API endpoint for assigning groups to a wallet is implemented',
      'Permission check enforces custody.wallet.assign_group before allowing assignment',
      'Users without the correct permission receive a 403 Forbidden response',
      'Groups can be assigned and unassigned from wallets',
      'Audit log entry is created for each group assignment/unassignment event',
      'Unit and integration tests pass',
    ],
    featureFlag: true,
  },
  {
    id: 'RBAC-15',
    title: 'Custody Wallet Management UI',
    description:
      'Build the frontend interface for custody wallet management: create wallets by currency, view wallets with assigned groups, and assign/unassign groups. UI respects custody wallet permissions.',
    status: 'not-started',
    priority: 15,
    dependencies: ['RBAC-13', 'RBAC-14'],
    userStory:
      'As a user with custody wallet permissions, I want a UI to create new crypto wallets by currency and assign groups to those wallets so that I can manage custody operations directly from the platform.',
    definitionOfDone: [
      'UI for creating a new wallet with currency selection is implemented',
      'UI for assigning/unassigning groups to wallets is implemented',
      'Permission-based visibility: controls are hidden or disabled for users without the relevant permissions',
      'Error states and loading states are handled gracefully',
      'UI is consistent with existing platform design patterns',
      'E2E tests pass',
    ],
    featureFlag: true,
  },
];
