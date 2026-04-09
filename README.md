# RBAC Permissions UI Mock-up

Interactive mock-up of the Role-Based Access Control (RBAC) permission structure for the Flux platform. Built to visualize and validate the permissions model before implementation.

## Quick Start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the mock-up.

---

## How the Permission System Works

### Hierarchy

```
Organization (e.g. Acme Corp)
│
├── Super Admin (exactly one per org — creates entities, assigns admins)
│
├── Entity: Acme US
│   ├── Admins: Bob, Carol
│   ├── Groups (entity-scoped, created by admins):
│   │   ├── Finance      → [create_transactions, approve_transactions, ...]
│   │   ├── Compliance   → [view_reporting]
│   │   └── Treasury Ops → [custody.wallet.create, custody.wallet.manage, ...]
│   ├── Account: US Treasury (optional grouping)
│   │   ├── BTC Wallet  → Finance: Send, Compliance: View
│   │   └── ETH Wallet  → Finance: View
│   └── Account: US Payments
│       ├── USDC Wallet → Finance: Send
│       └── USD Wallet  → Finance: Send
│
├── Entity: Acme EU
│   ├── Admins: Carol, Fiona (Carol spans both US and EU)
│   ├── Groups:
│   │   ├── Operations  → [create_transactions, ...]
│   │   └── Compliance  → [view_reporting]  (separate from US Compliance)
│   └── ...wallets with different group assignments
│
└── Entity: Acme APAC
    ├── Admins: Fiona
    └── ...
```

### Key Concepts

| Concept | Description |
|---|---|
| **Organization** | Top-level tenant. Either a client (Acme Corp) or manager (Flux Operations). All structures scoped here. |
| **Entity** | Operational sub-unit (e.g. Acme US, Acme EU). Data isolation boundary. Has its own admins and groups. |
| **Account** | Optional container grouping related wallets within an entity (e.g. "Treasury" holds BTC + ETH wallets). |
| **Wallet** | A balance tied to an asset. Crypto: aggregate of all addresses for a keyset. Fiat: balance in custody. |
| **Group** | Entity-scoped bundle of permissions. "Finance" in Acme US is separate from "Finance" in Acme EU. |
| **Permission** | System-defined action from the central registry. Cannot be created at runtime. |
| **Super Admin** | Exactly one per org. All permissions auto-granted. Creates entities, assigns admins. Cannot self-promote. |
| **Admin** | Assigned to specific entities by Super Admin. Can span multiple entities. Manages groups/users/wallets within assigned entities. |
| **User** | Belongs to org, assigned to entities, member of groups. Access = entity assignment + group permissions. |

### Wallet Access Model

Wallet access is **per-wallet, not global**:

- Each wallet is individually assigned to specific groups with a **capability level**:
  - **View Only** — see balances, history, addresses
  - **Send Transactions** — create and submit transactions (includes View)
  - **Full Manage** — settings, freeze/unfreeze, group assignment (includes all)
- **Not all groups get all wallets.** Finance can Send from US Treasury but have zero access to EU wallets.
- **Having "Send Transactions" does NOT mean send from every wallet** — only wallets explicitly assigned to that group.
- When a wallet is created, it must be assigned to at least one group.
- Accounts are optional — wallets can be standalone or grouped into accounts.

### Role Summary

| Capability | Super Admin | Admin | User |
|---|---|---|---|
| Create entities | Yes | No | No |
| Assign admins to entities | Yes | No | No |
| Create groups & assign permissions | Yes | Within assigned entities | No |
| Create/deactivate users | Yes | Within assigned entities | No |
| Create custody wallets | Yes | If permitted | No |
| Assign groups to wallets | Yes | No | No |
| Request password/2FA resets | Yes | Yes | No |
| View audit logs | Yes | Yes | No |
| Perform actions (transactions, etc.) | Yes | Yes | Based on group permissions |

### Scoping Rules

- **Groups do not cross entity boundaries** — each entity's groups are independent
- **Admins only manage their assigned entities** — an admin of Acme US cannot manage Acme EU (unless also assigned there)
- **Entities can have multiple admins** and **admins can span multiple entities**
- **Client users cannot access manager endpoints** and vice versa
- **User permissions = union of all group memberships**
- **All RBAC actions are immutably audit-logged**

---

## Pages in the Mock-up

| Page | Route | Description |
|---|---|---|
| Roadmap | `/admin/roadmap` | Implementation ticket board with phases and dependencies |
| Architecture | `/admin/architecture` | Visual diagrams of the permission structure |
| Glossary | `/admin/glossary` | Definitions for all RBAC terms |
| Dashboard | `/admin/dashboard` | Stats overview, recent audit logs, pending resets |
| Organizations | `/admin/organizations` | Manage client & manager organizations |
| Users | `/admin/users` | User table with filters, group/entity assignment |
| Spaces/Entities | `/admin/spaces` | Entity hierarchy, user assignment, data isolation |
| Permission Registry | `/admin/permissions` | All platform permissions with matrix view |
| Permission Groups | `/admin/groups` | Group CRUD, permission assignment, Super Admin protection |
| Custody Wallets | `/admin/custody-wallets` | Wallet creation, account management, group assignment with capabilities |
| Reset Requests | `/admin/resets` | Password & 2FA reset workflow |
| Audit Logs | `/admin/audit-logs` | Immutable log timeline with filters |

The sidebar includes a **role switcher** (Super Admin / Admin / User) that changes what's accessible across all pages.

---

## Implementation Tickets

See [TICKETS.md](TICKETS.md) for all 16 implementation tickets across 5 phases with user stories, definitions of done, and dependency maps.

---

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React (icons)
