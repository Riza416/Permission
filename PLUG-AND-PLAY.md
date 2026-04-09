# Plug and Play — RBAC Permissions Schema

A ready-to-use permissions schema that can be dropped into new or existing projects. Core system handles organizations, entities, users, groups, and permissions. Custody wallet support is available as an optional add-on.

---

## Table of Contents

1. [Core Schema (SQL)](#1-core-schema-sql)
2. [Seed Data](#2-seed-data)
3. [Middleware Logic](#3-middleware-logic)
4. [Integration Guide — New Projects](#4-integration-guide--new-projects)
5. [Integration Guide — Existing Projects](#5-integration-guide--existing-projects)
6. [API Reference](#6-api-reference)
7. [Optional Add-on: Custody Wallets](#7-optional-add-on-custody-wallets)

---

## 1. Core Schema (SQL)

Copy and run this migration to set up the full RBAC schema. Written for PostgreSQL — adapt syntax for your database.

```sql
-- ============================================
-- RBAC CORE SCHEMA
-- Drop in this file as a single migration
-- ============================================

-- Organizations
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('client', 'manager')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Entities (sub-units within an organization)
CREATE TABLE entities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_entities_org ON entities(organization_id);

-- Permission registry (system-defined, immutable at runtime)
CREATE TABLE permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  scope       TEXT NOT NULL CHECK (scope IN ('client', 'manager')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Permission groups (entity-scoped bundles of permissions)
CREATE TABLE permission_groups (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  entity_id       UUID NOT NULL REFERENCES entities(id),
  is_super_admin  BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(name, entity_id)
);

CREATE INDEX idx_groups_entity ON permission_groups(entity_id);

-- Group ↔ Permission junction
CREATE TABLE group_permissions (
  group_id      UUID NOT NULL REFERENCES permission_groups(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id),
  PRIMARY KEY (group_id, permission_id)
);

-- Users
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  user_type       TEXT NOT NULL CHECK (user_type IN ('client', 'manager')),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_org ON users(organization_id);

-- User ↔ Entity assignment (many-to-many)
CREATE TABLE user_entities (
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id),
  PRIMARY KEY (user_id, entity_id)
);

-- User ↔ Group membership (many-to-many)
CREATE TABLE user_groups (
  user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES permission_groups(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, group_id)
);

-- Admin ↔ Entity assignment (which admins manage which entities)
CREATE TABLE entity_admins (
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id),
  PRIMARY KEY (user_id, entity_id)
);

-- Audit log (immutable — no UPDATE or DELETE should be exposed)
CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action          TEXT NOT NULL,
  actor_id        UUID NOT NULL REFERENCES users(id),
  target_type     TEXT NOT NULL,
  target_id       UUID NOT NULL,
  details         TEXT,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  entity_id       UUID REFERENCES entities(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_id);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- Reset requests
CREATE TABLE reset_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id    UUID NOT NULL REFERENCES users(id),
  target_user_id  UUID NOT NULL REFERENCES users(id),
  reset_type      TEXT NOT NULL CHECK (reset_type IN ('password', '2fa')),
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

-- Enforce exactly one super admin group per entity
CREATE UNIQUE INDEX idx_one_super_admin_per_entity
  ON permission_groups(entity_id) WHERE is_super_admin = true;
```

---

## 2. Seed Data

Run after the schema migration to populate the permission registry. Customize the permission names to match your platform.

```sql
-- ============================================
-- SEED: Permission Registry
-- Modify these to match your platform's actions
-- ============================================

-- Client permissions
INSERT INTO permissions (name, description, scope) VALUES
  ('create_transactions',       'Create new payment or transfer transactions',            'client'),
  ('approve_transactions',      'Approve pending transactions submitted by other users',  'client'),
  ('create_invoices',           'Create and submit invoices for processing',              'client'),
  ('view_reporting',            'Access reporting dashboards and export data',             'client'),
  ('request_user_resets',       'Request password or 2FA resets for other users',          'client'),
  ('edit_settings',             'Edit organization-level settings and preferences',        'client'),
  ('create_new_client_users',   'Invite and create new users within the organization',    'client'),
  ('deactivate_client_users',   'Deactivate or suspend existing users',                   'client');

-- Manager permissions
INSERT INTO permissions (name, description, scope) VALUES
  ('edit_merchant_details',                     'Edit merchant profile and banking details',                       'manager'),
  ('edit_user_compliance_status_and_add_comment','Update user compliance status and attach comments',               'manager'),
  ('view_invoice_reporting',                    'Access invoice-level reporting across organizations',             'manager'),
  ('view_trading_reporting',                    'Access trading and FX reporting across organizations',            'manager'),
  ('approve_wire_details',                      'Approve or reject wire transfer details',                        'manager'),
  ('request_manager_resets',                    'Request password or 2FA resets for manager-side users',           'manager'),
  ('create_new_manager_users',                  'Invite and create new users within the manager organization',    'manager'),
  ('deactivate_manager_users',                  'Deactivate or suspend existing manager users',                   'manager');
```

**Adding new permissions later:**

```sql
-- Just insert a new row. No schema changes needed.
INSERT INTO permissions (name, description, scope)
VALUES ('reporting.export_csv', 'Export reports as CSV files', 'client');

-- Admins can now assign this to any group through the UI or API.
```

---

## 3. Middleware Logic

Drop this into your API layer. This is framework-agnostic pseudocode — adapt to Express, Next.js, Fastify, etc.

### Permission Check

```typescript
// resolveUserPermissions.ts
// Call this once per request and cache on the request context

async function resolveUserPermissions(userId: string): Promise<Set<string>> {
  // 1. Get user's group memberships
  const groups = await db.query(`
    SELECT pg.id, pg.is_super_admin, pg.entity_id
    FROM user_groups ug
    JOIN permission_groups pg ON pg.id = ug.group_id
    WHERE ug.user_id = $1
  `, [userId]);

  // 2. If user is in a super admin group, return ALL permissions for their org type
  const isSuperAdmin = groups.some(g => g.is_super_admin);
  if (isSuperAdmin) {
    const user = await db.query('SELECT user_type FROM users WHERE id = $1', [userId]);
    const allPerms = await db.query(
      'SELECT name FROM permissions WHERE scope = $1',
      [user.user_type]
    );
    return new Set(allPerms.map(p => p.name));
  }

  // 3. Otherwise, union all permissions from all groups
  const groupIds = groups.map(g => g.id);
  if (groupIds.length === 0) return new Set();

  const perms = await db.query(`
    SELECT DISTINCT p.name
    FROM group_permissions gp
    JOIN permissions p ON p.id = gp.permission_id
    WHERE gp.group_id = ANY($1)
  `, [groupIds]);

  return new Set(perms.map(p => p.name));
}
```

### Middleware

```typescript
// requirePermission.ts
// Use as middleware on any protected endpoint

function requirePermission(...requiredPermissions: string[]) {
  return async (req, res, next) => {
    const user = req.user; // from your auth layer
    if (!user) return res.status(401).json({ error: 'Unauthenticated' });

    // Resolve permissions (cache per request)
    if (!req.permissions) {
      req.permissions = await resolveUserPermissions(user.id);
    }

    // Check all required permissions
    const missing = requiredPermissions.filter(p => !req.permissions.has(p));
    if (missing.length > 0) {
      return res.status(403).json({
        error: 'Forbidden',
        missing_permissions: missing,
      });
    }

    next();
  };
}

// Usage on routes:
app.post('/api/transactions', requirePermission('create_transactions'), handler);
app.post('/api/users/invite',  requirePermission('create_new_client_users'), handler);
app.get('/api/reporting',      requirePermission('view_reporting'), handler);
```

### Entity Scope Check

```typescript
// requireEntityAccess.ts
// Ensures user can only access data from their assigned entities

function requireEntityAccess(entityIdParam: string = 'entityId') {
  return async (req, res, next) => {
    const userId = req.user.id;
    const entityId = req.params[entityIdParam] || req.body.entity_id;

    const assignment = await db.query(
      'SELECT 1 FROM user_entities WHERE user_id = $1 AND entity_id = $2',
      [userId, entityId]
    );

    if (assignment.rows.length === 0) {
      return res.status(403).json({ error: 'No access to this entity' });
    }

    next();
  };
}

// Usage:
app.get('/api/entities/:entityId/data', requireEntityAccess(), handler);
```

### User Type Scope Check

```typescript
// requireUserType.ts
// Prevents client users from hitting manager endpoints and vice versa

function requireUserType(allowedType: 'client' | 'manager') {
  return (req, res, next) => {
    if (req.user.user_type !== allowedType) {
      return res.status(403).json({ error: 'Wrong user type for this endpoint' });
    }
    next();
  };
}

// Usage:
app.get('/api/manager/merchants', requireUserType('manager'), handler);
app.get('/api/client/settings',   requireUserType('client'), handler);
```

---

## 4. Integration Guide — New Projects

For a new project, follow these steps in order:

### Step 1: Run the schema migration

Copy the SQL from [Section 1](#1-core-schema-sql) into a single migration file and run it.

### Step 2: Seed permissions

Copy the SQL from [Section 2](#2-seed-data) and customize the permission names to match your platform's actions. Run it.

### Step 3: Create your first organization

```sql
INSERT INTO organizations (name, type) VALUES ('My Company', 'client')
RETURNING id;
-- save this id
```

### Step 4: Create the first entity

```sql
INSERT INTO entities (name, organization_id)
VALUES ('Main', '<org_id>')
RETURNING id;
```

### Step 5: Create the Super Admin group

```sql
INSERT INTO permission_groups (name, organization_id, entity_id, is_super_admin)
VALUES ('Super Admin', '<org_id>', '<entity_id>', true)
RETURNING id;

-- Grant all client permissions to the super admin group
INSERT INTO group_permissions (group_id, permission_id)
SELECT '<super_admin_group_id>', id FROM permissions WHERE scope = 'client';
```

### Step 6: Create the first user and make them Super Admin

```sql
INSERT INTO users (name, email, user_type, organization_id)
VALUES ('Admin User', 'admin@example.com', 'client', '<org_id>')
RETURNING id;

INSERT INTO user_entities (user_id, entity_id)
VALUES ('<user_id>', '<entity_id>');

INSERT INTO user_groups (user_id, group_id)
VALUES ('<user_id>', '<super_admin_group_id>');

INSERT INTO entity_admins (user_id, entity_id)
VALUES ('<user_id>', '<entity_id>');
```

### Step 7: Add middleware to your API

Copy the middleware from [Section 3](#3-middleware-logic) and integrate it into your framework. Protect each route with the appropriate permission check.

### Step 8: Build your admin UI (or use the API directly)

From here, the Super Admin can:
- Create more entities
- Assign admins to entities
- Admins create groups, assign permissions, and add users

Everything flows from the registry through groups to users.

---

## 5. Integration Guide — Existing Projects

For an existing project with users already in a database:

### Step 1: Run the schema migration

Same as new projects — run the SQL from [Section 1](#1-core-schema-sql). This creates new tables alongside your existing ones.

### Step 2: Seed permissions

Same as new projects — run the SQL from [Section 2](#2-seed-data), customized for your platform.

### Step 3: Create organization and entity for existing users

```sql
-- Create the org
INSERT INTO organizations (name, type) VALUES ('My Company', 'client')
RETURNING id;

-- Create a default entity
INSERT INTO entities (name, organization_id)
VALUES ('Default', '<org_id>')
RETURNING id;
```

### Step 4: Link existing users

Add `organization_id` and `user_type` to your existing users table, or create rows in the RBAC `users` table that reference your existing user IDs:

```sql
-- Option A: Add columns to your existing users table
ALTER TABLE your_existing_users
  ADD COLUMN organization_id UUID REFERENCES organizations(id),
  ADD COLUMN user_type TEXT DEFAULT 'client' CHECK (user_type IN ('client', 'manager'));

UPDATE your_existing_users SET organization_id = '<org_id>', user_type = 'client';

-- Option B: Map existing users into the RBAC users table
INSERT INTO users (id, name, email, user_type, organization_id)
SELECT id, name, email, 'client', '<org_id>'
FROM your_existing_users;
```

### Step 5: Assign all existing users to the default entity

```sql
INSERT INTO user_entities (user_id, entity_id)
SELECT id, '<entity_id>' FROM users;
```

### Step 6: Create a Super Admin group and assign your admin user

```sql
INSERT INTO permission_groups (name, organization_id, entity_id, is_super_admin)
VALUES ('Super Admin', '<org_id>', '<entity_id>', true)
RETURNING id;

INSERT INTO group_permissions (group_id, permission_id)
SELECT '<super_admin_group_id>', id FROM permissions WHERE scope = 'client';

-- Make your existing admin the super admin
INSERT INTO user_groups (user_id, group_id)
VALUES ('<your_admin_user_id>', '<super_admin_group_id>');

INSERT INTO entity_admins (user_id, entity_id)
VALUES ('<your_admin_user_id>', '<entity_id>');
```

### Step 7: Create a default group for existing users

```sql
-- Create a group with the permissions your existing users currently have
INSERT INTO permission_groups (name, organization_id, entity_id, is_super_admin)
VALUES ('Default Users', '<org_id>', '<entity_id>', false)
RETURNING id;

-- Assign the permissions that match your existing access patterns
INSERT INTO group_permissions (group_id, permission_id)
SELECT '<default_group_id>', id FROM permissions
WHERE name IN ('create_transactions', 'view_reporting');
-- ↑ adjust to match what your users can currently do

-- Put all existing non-admin users in this group
INSERT INTO user_groups (user_id, group_id)
SELECT id, '<default_group_id>' FROM users
WHERE id != '<your_admin_user_id>';
```

### Step 8: Gradually add middleware

You don't need to protect every endpoint at once. Start with sensitive routes:

```typescript
// Phase 1: Protect admin-only routes
app.post('/api/users/invite', requirePermission('create_new_client_users'), handler);
app.post('/api/users/deactivate', requirePermission('deactivate_client_users'), handler);

// Phase 2: Protect financial routes
app.post('/api/transactions', requirePermission('create_transactions'), handler);

// Phase 3: Protect everything else
app.get('/api/reporting', requirePermission('view_reporting'), handler);
```

### Step 9: Refine over time

Once the base system is running:
- Split the default entity into multiple entities if needed
- Create more granular groups
- Assign users to the appropriate groups
- Remove users from the catch-all "Default Users" group

---

## 6. API Reference

Minimum endpoints needed for a working RBAC system:

### Organizations
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/organizations/:id` | authenticated | Get organization details |

### Entities
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/api/entities` | super_admin | Create entity |
| GET | `/api/entities` | authenticated | List entities (filtered by user access) |
| POST | `/api/entities/:id/admins` | super_admin | Assign admin to entity |
| DELETE | `/api/entities/:id/admins/:userId` | super_admin | Remove admin from entity |

### Permissions
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/permissions` | authenticated | List all permissions (filtered by scope) |

### Groups
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/api/entities/:entityId/groups` | entity_admin | Create group |
| GET | `/api/entities/:entityId/groups` | entity_admin | List groups in entity |
| PUT | `/api/groups/:id/permissions` | entity_admin | Update group permissions |
| DELETE | `/api/groups/:id` | entity_admin | Delete group |
| POST | `/api/groups/:id/users` | entity_admin | Add user to group |
| DELETE | `/api/groups/:id/users/:userId` | entity_admin | Remove user from group |

### Users
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/api/users/invite` | `create_new_client_users` | Invite new user |
| GET | `/api/entities/:entityId/users` | entity_admin | List users in entity |
| PATCH | `/api/users/:id/deactivate` | `deactivate_client_users` | Deactivate user |
| PUT | `/api/users/:id/entities` | entity_admin | Update user entity assignments |
| PUT | `/api/users/:id/groups` | entity_admin | Update user group memberships |

### Reset Requests
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/api/reset-requests` | `request_user_resets` | Submit reset request |
| PATCH | `/api/reset-requests/:id` | entity_admin | Approve or reject request |
| GET | `/api/reset-requests` | entity_admin | List reset requests |

### Audit Logs
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/audit-logs` | entity_admin | Query audit logs (filtered by org/entity/actor/date) |

---

## 7. Optional Add-on: Custody Wallets

If your platform manages crypto or fiat wallets, add this schema on top of the core RBAC system. This introduces accounts (optional wallet containers), wallets, and per-wallet group capabilities.

**Skip this section entirely if you don't need wallet management.**

### Additional Schema

```sql
-- ============================================
-- ADD-ON: Custody Wallet Schema
-- Run after the core RBAC schema
-- ============================================

-- Accounts (optional wallet containers within entities)
CREATE TABLE accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  entity_id       UUID NOT NULL REFERENCES entities(id),
  created_by      UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_accounts_entity ON accounts(entity_id);

-- Custody wallets
CREATE TABLE custody_wallets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency        TEXT NOT NULL,
  currency_name   TEXT NOT NULL,
  label           TEXT NOT NULL,
  address         TEXT NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  entity_id       UUID NOT NULL REFERENCES entities(id),
  account_id      UUID REFERENCES accounts(id),  -- nullable, wallets can be standalone
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen')),
  created_by      UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wallets_entity ON custody_wallets(entity_id);
CREATE INDEX idx_wallets_account ON custody_wallets(account_id);

-- Wallet ↔ Group assignment with capabilities
CREATE TABLE wallet_group_assignments (
  wallet_id    UUID NOT NULL REFERENCES custody_wallets(id) ON DELETE CASCADE,
  group_id     UUID NOT NULL REFERENCES permission_groups(id) ON DELETE CASCADE,
  capabilities TEXT[] NOT NULL DEFAULT '{view}',
  -- capabilities: 'view', 'send_transactions', 'manage'
  PRIMARY KEY (wallet_id, group_id),
  CONSTRAINT valid_capabilities CHECK (
    capabilities <@ ARRAY['view', 'send_transactions', 'manage']::TEXT[]
  )
);
```

### Additional Seed Permissions

```sql
INSERT INTO permissions (name, description, scope) VALUES
  ('custody.wallet.create',       'Create new crypto or fiat custody wallets',          'client'),
  ('custody.wallet.assign_group', 'Assign groups to wallets with capability levels',    'client');
```

### Wallet Capability Check Middleware

```typescript
// requireWalletCapability.ts
// Checks that user's group has the required capability on a specific wallet

async function resolveWalletCapability(
  userId: string,
  walletId: string
): Promise<Set<string>> {
  const result = await db.query(`
    SELECT wga.capabilities
    FROM wallet_group_assignments wga
    JOIN user_groups ug ON ug.group_id = wga.group_id
    WHERE ug.user_id = $1 AND wga.wallet_id = $2
  `, [userId, walletId]);

  const caps = new Set<string>();
  for (const row of result.rows) {
    for (const cap of row.capabilities) {
      caps.add(cap);
    }
  }
  return caps;
}

function requireWalletCapability(capability: 'view' | 'send_transactions' | 'manage') {
  return async (req, res, next) => {
    const walletId = req.params.walletId;
    const caps = await resolveWalletCapability(req.user.id, walletId);

    // Capability hierarchy: manage > send_transactions > view
    const hasAccess =
      caps.has(capability) ||
      (capability === 'view' && (caps.has('send_transactions') || caps.has('manage'))) ||
      (capability === 'send_transactions' && caps.has('manage'));

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Insufficient wallet capability',
        required: capability,
      });
    }

    next();
  };
}

// Usage:
app.get('/api/wallets/:walletId',              requireWalletCapability('view'), handler);
app.post('/api/wallets/:walletId/transactions', requireWalletCapability('send_transactions'), handler);
app.put('/api/wallets/:walletId/settings',      requireWalletCapability('manage'), handler);
```

### Additional API Endpoints

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/api/entities/:entityId/accounts` | entity_admin | Create account |
| GET | `/api/entities/:entityId/accounts` | authenticated | List accounts in entity |
| POST | `/api/wallets` | `custody.wallet.create` | Create wallet (with initial group assignments) |
| GET | `/api/entities/:entityId/wallets` | authenticated (filtered by capability) | List wallets |
| POST | `/api/wallets/:walletId/groups` | `custody.wallet.assign_group` | Assign group with capabilities |
| PUT | `/api/wallets/:walletId/groups/:groupId` | `custody.wallet.assign_group` | Update capabilities |
| DELETE | `/api/wallets/:walletId/groups/:groupId` | `custody.wallet.assign_group` | Unassign group |

### Key Rules

- **Not all groups see all wallets.** Each wallet is individually assigned to specific groups.
- **Having `send_transactions` capability on one wallet does NOT mean send from all wallets.**
- **Capabilities are per-wallet, per-group:** Finance might have Send on Wallet A but only View on Wallet B.
- **Accounts are optional.** Wallets can exist without an account (standalone).
- **Wallets must be assigned to at least one group when created.**
