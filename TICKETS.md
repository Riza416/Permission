# RBAC Implementation Tickets

---

## Phase 1 — Foundation

---

### RBAC-1: Create Organization Model

## User story

**As a developer**

I want to create an **organization model**

So that **all users, permissions, and groups are scoped to a specific organization**

## Description

Implement the foundational **organization entity** used to isolate tenants within the platform.

Each organization represents either:

- A **Client organization** (companies using the platform)
- A **Manager organization** (internal platform operators)

All RBAC structures must reference an organization.

Required fields:

- id
- type (client | manager)
- name
- created_at

All users must reference an organization.

---

## Definition of done

- Organization table created
- Organization includes required fields
- Users cannot exist without an organization
- Organizations are referenced by RBAC tables
- Unit tests validate organization requirement

---

## Feature flag

- [ ] no

---

## Success metrics

- 100% of users belong to an organization
- No cross-organization data access detected in testing

---

## Testing plan

- Product UAT and dev testing
    - Create organization
    - Create users under organization
    - Attempt user creation without organization (should fail)
    - Attempt cross-org access via API

---

### RBAC-2: User Type Classification

## User story

**As a developer**

I want users to be classified as **client or manager**

So that **application access can be restricted by user type**

## Description

Add a user type classification that determines system access.

User types:

- **Client users** — client settings, whitelist, trading, orders, and reporting
- **Manager users** — manage merchants, compliance, and platform-level reporting

The backend must enforce this separation. Client users must not access manager endpoints and vice versa.

---

## Definition of done

- User table includes `user_type`
- Allowed values: client, manager
- Middleware validates user type on protected routes
- Cross-type API access rejected

---

## Feature flag

- [ ] no

---

## Success metrics

- 0 successful cross-type API calls in testing
- All endpoints properly scoped

---

## Testing plan

- Dev testing
    - Test manager endpoints with client users
    - Test client endpoints with manager users
    - Verify middleware rejection

---

### RBAC-3: Spaces / Entities

## User story

**As a platform operator**

I want organizations to support **multiple spaces/entities in a single organization**

So that **clients can operate multiple businesses within one account**

## Description

Entities represent operational sub-units under an organization with isolated data boundaries. Users are assigned to one or more entities and can only see data from their assigned entities.

Example:

- Organization: Acme Corp
    - Entity: Acme US
    - Entity: Acme EU
    - Entity: Acme APAC

Entities are the primary boundary for data isolation. Groups are entity-scoped and do not cross entity boundaries. Each entity has its own admins (assigned by the Super Admin). An entity can have multiple admins, and admins can be assigned to multiple entities.

---

## Definition of done

- Entity table created with id, name, organization_id, created_at
- Entity scoping supported — users assigned to specific entities
- Data access respects entity boundaries
- Admin assignment to entities implemented (many-to-many)
- Groups are entity-scoped

---

## Feature flag

- [x] yes

---

## Success metrics

- Users restricted to their assigned entities
- Multi-entity clients supported
- Groups do not leak across entity boundaries

---

## Testing plan

- Dev testing
    - Create multiple entities
    - Assign users to entities
    - Validate data isolation across entities
    - Validate admin can only manage their assigned entities
    - Validate admin spanning multiple entities

---

## Phase 2 — Permissions Core

---

### RBAC-4: Central Permission Registry

## User story

**As a developer**

I want a **central permission registry**

So that **permissions can be assigned dynamically to groups**

## Description

Create a centralized permission table containing all supported permissions. Permissions are system-defined and cannot be created at runtime.

Client permissions:

- create_transactions
- approve_transactions
- create_invoices
- view_reporting
- request_user_resets (password and 2FA)
- edit_settings
- create_new_client_users
- deactivate_client_users

Manager permissions:

- edit_merchant_details
- edit_user_compliance_status_and_add_comment
- view_invoice_reporting
- view_trading_reporting
- approve_wire_details
- request_manager_resets (password and 2FA)
- create_new_manager_users
- deactivate_manager_users

Each permission is scoped to either client or manager.

---

## Definition of done

- Permission table created with id, name, description, scope
- Permissions seeded automatically
- Permissions include scope (client | manager)
- Permissions retrievable via API
- No permissions can be created at runtime

---

## Feature flag

- [ ] no

---

## Success metrics

- All permissions stored centrally
- Permissions referenced by groups only

---

## Testing plan

- Dev testing
    - Verify permissions seeded correctly
    - Validate scope filtering
    - Attempt to create a permission at runtime (should fail)

---

### RBAC-5: Permission Groups

## User story

**As a developer**

I want organizations to create **permission groups within entities**

So that **multiple permissions can be assigned to users easily**

## Description

Create a group model that allows bundling permissions. Admins create groups within their assigned entities and assign permissions from the registry. Users can belong to multiple groups — effective permissions are the union of all group permissions.

Groups are entity-scoped and do not cross entity boundaries. "Finance" in Acme US is a completely separate group from "Finance" in Acme EU.

Examples:

- Acme US groups: Finance, Compliance, Treasury Ops
- Acme EU groups: Operations, Compliance

Groups belong to a single entity within an organization. Groups may contain multiple permissions from the registry.

---

## Definition of done

- Permission group table created with id, name, organization_id, entity_id, permission_ids, is_super_admin, created_at
- Groups scoped to entity within organization
- Groups can include multiple permissions
- Groups cannot include permissions outside their org type scope
- Users can belong to multiple groups with union semantics

---

## Feature flag

- [x] yes

---

## Success metrics

- Groups created successfully within entities
- Permission assignment works
- No cross-entity group leakage

---

## Testing plan

- Product UAT and dev testing
    - Create group within an entity
    - Assign permissions to group
    - Attempt cross-scope permission assignment (should fail)
    - Verify user in multiple groups gets union of permissions

---

### RBAC-6: Super Admin Group

## User story

**As a developer**

I want each organization to have a **Super Admin group**

So that **RBAC management can be controlled securely**

## Description

Each organization must contain exactly one Super Admin group. Super Admins have all permissions auto-granted and can:

- Create entities
- Assign admins to entities (one admin can span multiple entities; entities can have multiple admins)
- Create groups
- Assign permissions
- Add and remove users
- Manage all wallets across all entities

Users cannot promote themselves to Super Admin. Only Super Admins can add other Super Admins.

---

## Definition of done

- Exactly one Super Admin group enforced per organization
- Super Admin permissions auto-granted (all org-type permissions)
- RBAC management restricted to Super Admins
- Admin-to-entity assignment implemented (many-to-many)
- Self-promotion prevented

---

## Feature flag

- [x] yes

---

## Success metrics

- No duplicate Super Admin groups
- Only Super Admins manage RBAC
- Admin entity assignments working correctly

---

## Testing plan

- Product UAT and dev testing
    - Attempt to create second Super Admin group (should fail)
    - Attempt privilege escalation (should fail)
    - Verify admin assignment to multiple entities
    - Verify entity with multiple admins

---

## Phase 3 — Enforcement

---

### RBAC-7: API Permission Enforcement / Middleware

## User story

**As a developer**

I want permissions enforced at the **API layer**

So that **unauthorized actions cannot be performed**

## Description

All protected endpoints must verify:

1. Authentication
2. Organization scope
3. Entity scope
4. Permission availability (derived from group membership)
5. User type scope (client vs manager)

Permissions are derived from group membership. Unauthorized requests return 403.

---

## Definition of done

- Middleware implemented
- Permissions validated for all endpoints
- Entity-scoped access enforced
- User type boundaries enforced (client cannot hit manager endpoints)
- Super Admin short-circuits individual permission checks
- Unauthorized actions logged

---

## Feature flag

- [x] yes

---

## Success metrics

- 100% endpoint coverage
- No unauthorized access

---

## Testing plan

- Test API access with missing permissions
- Test cross-entity access attempts
- Test cross-user-type access attempts
- Validate Super Admin bypass
- Validate enforcement bypass attempts

---

### RBAC-8: Build RBAC APIs

## User story

**As an administrator**

I want APIs to manage RBAC

So that **groups, permissions, and users can be controlled programmatically**

## Description

APIs required:

- Create / list / manage entities
- Assign admins to entities
- Create / update / delete groups (within entity scope)
- Assign permissions to groups
- Invite / deactivate users
- Assign users to groups and entities
- Retrieve permissions, groups, users (scoped)

All APIs restricted to admins (within their entities) and Super Admins.

---

## Definition of done

- APIs implemented
- APIs documented (OpenAPI/Swagger)
- Authorization enforced — admins can only manage their assigned entities
- Entity scoping validated on all endpoints

---

## Feature flag

- [ ] no

---

## Success metrics

- All RBAC functions accessible via API
- No unauthorized API usage
- Admin entity scoping respected

---

## Testing plan

- Test API endpoints
- Validate permission enforcement
- Test admin managing entity they are not assigned to (should fail)
- Test admin spanning multiple entities

---

## Phase 4 — Operations

---

### RBAC-9: Audit Logging

## User story

**As a compliance officer**

I want **all RBAC actions logged**

So that **access history is fully traceable**

## Description

Audit logs must capture:

- Group creation and deletion
- Permission changes
- User assignments and deactivations
- Admin entity assignments
- Reset requests
- Wallet creation, group assignment, capability changes
- All sensitive actions

Logs must be immutable (append-only, no update or delete).

---

## Definition of done

- Audit log table created
- All RBAC events recorded automatically via service hooks
- Logs queryable by organization, entity, actor, action type, date range
- Logs are append-only — no update or delete endpoints
- Wallet-related events captured

---

## Feature flag

- [x] yes

---

## Success metrics

- 100% RBAC actions logged
- Logs available for compliance review

---

## Testing plan

- Dev testing
    - Trigger all RBAC event types
    - Verify logs created for each
    - Validate immutability (attempt update/delete — should fail)
    - Validate queryability

---

### RBAC-10: Reset Requests

## User story

**As a platform administrator**

I want to **submit reset requests**

So that **password and 2FA resets are controlled and auditable**

## Description

Admins (entity, organization, and Super Admin) can request password and 2FA resets for users within their scope.

Each request includes:

- Requester
- Target user
- Reset type (password | 2FA)
- Timestamps
- Status (pending | completed | rejected)

Reset execution handled by platform processes. All requests are audit-logged.

---

## Definition of done

- Reset request table implemented
- Reset workflow implemented (submit → approve/reject → execute)
- Admins can only reset users within their assigned entities
- Audit logs generated for all reset events

---

## Feature flag

- [x] `rbac_reset_requests`

---

## Success metrics

- 100% of resets recorded
- No direct resets possible (must go through request workflow)

---

## Testing plan

- Submit reset request
- Execute reset (approve)
- Reject reset
- Verify audit trail
- Test admin resetting user outside their entity (should fail)

---

### RBAC-11: Admin UI

## User story

**As an administrator**

I want a UI to manage RBAC

So that **I can control user access without engineering support**

## Description

Admin UI should allow:

- User management (list, create, deactivate, assign to groups/entities)
- Group creation and permission assignment (within entity scope)
- Permission registry viewing (read-only)
- Entity management (create entities, assign admins) — Super Admin only
- Reset request queue (submit, approve, reject)
- Audit log viewing with filters

Super Admin UI includes all of the above plus:

- Entity creation and admin assignment
- Cross-entity visibility

UI must respect permissions — controls hidden or disabled based on the user's role and entity assignments. Non-admin users cannot access admin UI.

---

## Definition of done

- UI pages created for all admin functions
- UI respects permissions and entity scoping
- Non-admin users cannot access admin UI
- Admin can only manage their assigned entities in the UI

---

## Feature flag

- [x] yes

---

## Success metrics

- Admins can manage RBAC independently
- Reduced operational overhead

---

## Testing plan

- Product UAT and dev testing
    - Validate admin workflows within assigned entities
    - Validate restricted access for non-admins
    - Validate Super Admin cross-entity access
    - Validate admin cannot see/manage unassigned entities

---

## Phase 5 — Custody Wallets

---

### RBAC-12: Define Custody Wallet Permission Types

## User story

**As a platform administrator**

I want to define new permission types for custody wallet management

So that **only authorized users can create crypto wallets and assign groups to them**

## Description

Introduce new permission types within the permission registry for custody wallet operations:

- `custody.wallet.create` — allows creating new crypto/fiat wallets
- `custody.wallet.assign_group` — allows assigning groups to wallets with specific capabilities

These permissions follow the existing registry patterns and are scoped to client organizations.

---

## Definition of done

- New custody wallet permission types added to the permission registry
- Permission types follow naming conventions of the permissions framework
- Permissions documented in the registry with clear descriptions
- Unit tests cover permission type validation and registration

---

## Feature flag

- [x] `custody_wallet_permissions`

---

## Success metrics

- Custody wallet permissions are registered and queryable from the permission registry
- No regressions in existing permission checks

---

## Testing plan

- Unit tests for permission type creation and validation
- Integration test confirming permissions appear in the registry
- Verify permissions follow the structure conventions

---

### RBAC-13: Account Model

## User story

**As a client user**

I want to create **accounts within my entity** to group related wallets together

So that **I can organize my crypto and fiat wallets logically**

## Description

Implement the Account model — an optional container that groups multiple wallets within an entity.

An account represents a logical grouping of related balances (e.g., a "Treasury" account holding BTC, ETH, and USD wallets). Accounts belong to a single entity and are created by entity admins or users with appropriate permissions.

Accounts are optional — wallets can exist without an account (standalone wallets assigned directly to groups).

Required fields:

- id
- name
- organization_id
- entity_id
- created_by
- created_at

---

## Definition of done

- Account table created with required fields
- Account scoped to entity within organization
- API endpoints: create, list, update, delete account
- Account is optional on wallet creation
- Wallets can reference an account_id (nullable)

---

## Feature flag

- [x] `custody_wallet_permissions`

---

## Success metrics

- Accounts created and managed within entities
- Wallets can optionally belong to accounts
- No regression in wallet functionality without accounts

---

## Testing plan

- Create account within entity
- Create wallet with and without account
- List wallets by account
- Delete account (validate wallet handling)
- Test cross-entity account creation (should fail)

---

### RBAC-14: Permission-Gated Wallet Creation by Currency

## User story

**As a user with the `custody.wallet.create` permission**

I want to create new crypto and fiat wallets for specific currencies

So that **I can manage custody wallets for different assets on the platform**

## Description

Implement the backend logic that allows authorized users to create new wallets scoped by currency within an entity. The endpoint must enforce the `custody.wallet.create` permission check.

Wallets can be created as:

- **Crypto wallets** — BTC, ETH, USDC, etc. (balance = aggregate of all addresses for a keyset)
- **Fiat wallets** — USD, EUR, etc. (balance = fiat held in custody)

Wallets belong to an entity and optionally to an account. When created, a wallet must be assigned to at least one group with a capability level (view, send_transactions, or manage).

---

## Definition of done

- API endpoint for creating a new wallet by currency is implemented
- Permission check enforces `custody.wallet.create`
- Wallet belongs to entity, optionally to account
- Wallet must be assigned to at least one group on creation
- Users without the correct permission receive 403
- Audit log entry created for each wallet creation event
- Unit and integration tests pass

---

## Feature flag

- [x] `custody_wallet_permissions`

---

## Success metrics

- Authorized users can successfully create wallets by currency
- Unauthorized users are blocked with 403
- Wallet creation events are logged

---

## Testing plan

- Unit tests for permission enforcement on the wallet creation endpoint
- Integration tests for end-to-end wallet creation with valid permissions
- Negative tests confirming unauthorized users are rejected
- Test wallet creation with and without account
- Test wallet creation across multiple supported currencies (crypto and fiat)

---

### RBAC-15: Permission-Gated Group Assignment to Wallets with Capabilities

## User story

**As a user with the `custody.wallet.assign_group` permission**

I want to assign user groups to crypto wallets **with specific capability levels**

So that **the correct teams have the right level of access to each wallet**

## Description

Implement the backend logic that allows authorized users to assign groups to wallets with specific capabilities. Each group-wallet assignment includes a capability level:

- **View Only** — view balances, transaction history, and addresses
- **Send Transactions** — create and submit transactions from the wallet (includes View)
- **Full Manage** — full control including settings, group assignment, and freezing (includes all)

Critical rules:

- Not all groups get access to all wallets. Each wallet is individually assigned.
- Having "Send Transactions" on one wallet does NOT mean send from all wallets.
- Capabilities can be updated (e.g., upgrade a group from View to Send on a specific wallet).
- Groups can be unassigned from wallets.

---

## Definition of done

- API endpoint for assigning groups to a wallet with capabilities is implemented
- API endpoint for updating capabilities on an existing assignment
- API endpoint for unassigning groups from a wallet
- Permission check enforces `custody.wallet.assign_group`
- Users without the correct permission receive 403
- Capability hierarchy enforced (manage includes send includes view)
- Audit log entry created for each assignment/unassignment/capability change
- Unit and integration tests pass

---

## Feature flag

- [x] `custody_wallet_permissions`

---

## Success metrics

- Authorized users can assign/unassign groups with capabilities
- Unauthorized users are blocked with 403
- Assignment changes are logged
- Capability hierarchy is respected

---

## Testing plan

- Unit tests for permission enforcement on group assignment endpoint
- Integration tests for end-to-end group assignment with capabilities
- Test assigning multiple groups to a single wallet with different capabilities
- Test updating capabilities on an existing assignment
- Test removing a group from a wallet
- Negative tests confirming unauthorized users are rejected
- Verify capability hierarchy (manage grants send and view)

---

### RBAC-16: Custody Wallet Management UI

## User story

**As a user with custody wallet permissions**

I want a UI to create wallets, manage accounts, and assign groups with capabilities

So that **I can manage custody operations directly from the platform**

## Description

Build the frontend interface for custody wallet management. The UI should allow:

1. Create accounts within entities (optional grouping)
2. Create new wallets by selecting a currency (crypto or fiat) within an entity, optionally within an account
3. Assign at least one group with capabilities when creating a wallet
4. View existing wallets grouped by entity and account
5. Assign and unassign groups to/from wallets with specific capability levels (View, Send, Manage)
6. Edit capabilities on existing group assignments

The UI must respect permissions:

- Wallet creation controls only visible to users with `custody.wallet.create`
- Group assignment controls only visible to users with `custody.wallet.assign_group`
- Non-permissioned users see read-only wallet information (if they have View capability)

---

## Definition of done

- UI for creating accounts within entities
- UI for creating a wallet with currency selection, optional account, and initial group assignment
- UI for assigning/unassigning groups to wallets with capabilities
- UI for editing capabilities on existing assignments
- Permission-based visibility: controls hidden for users without the relevant permissions
- Wallets displayed grouped by entity → account → wallet
- Entity and currency filtering
- Error states and loading states handled
- UI consistent with existing platform design patterns
- E2E tests pass

---

## Feature flag

- [x] `custody_wallet_permissions`

---

## Success metrics

- Users with correct permissions can create wallets and assign groups via the UI
- Users without permissions do not see restricted controls
- No UI errors during wallet management flows

---

## Testing plan

- E2E tests for account creation
- E2E tests for wallet creation flow (with and without account)
- E2E tests for group assignment with capabilities
- Test permission-based visibility (controls hidden for unauthorized users)
- Test capability editing on existing assignments
- Cross-browser testing for the wallet management page

---

## Dependency Map

```
Phase 1 — Foundation
  RBAC-1:  Organization Model                    (no dependencies)
  RBAC-2:  User Type Classification              (depends on: RBAC-1)
  RBAC-3:  Spaces / Entities                     (depends on: RBAC-1)

Phase 2 — Permissions Core
  RBAC-4:  Central Permission Registry           (depends on: RBAC-1, RBAC-2)
  RBAC-5:  Permission Groups                     (depends on: RBAC-4)
  RBAC-6:  Super Admin Group                     (depends on: RBAC-5)

Phase 3 — Enforcement
  RBAC-7:  API Permission Enforcement            (depends on: RBAC-2, RBAC-4, RBAC-5)
  RBAC-8:  Build RBAC APIs                       (depends on: RBAC-6, RBAC-7)

Phase 4 — Operations
  RBAC-9:  Audit Logging                         (depends on: RBAC-8)
  RBAC-10: Reset Requests                        (depends on: RBAC-8, RBAC-9)
  RBAC-11: Admin UI                              (depends on: RBAC-8, RBAC-9, RBAC-10)

Phase 5 — Custody Wallets
  RBAC-12: Custody Wallet Permission Types       (depends on: RBAC-4)
  RBAC-13: Account Model                         (depends on: RBAC-3, RBAC-12)
  RBAC-14: Wallet Creation by Currency           (depends on: RBAC-13)
  RBAC-15: Group Assignment with Capabilities    (depends on: RBAC-14)
  RBAC-16: Custody Wallet Management UI          (depends on: RBAC-14, RBAC-15)
```
