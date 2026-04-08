"use client";

import {
  Building2,
  Layers,
  Wallet,
  FolderKey,
  Key,
  Users,
  Shield,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const glossaryEntries = [
  {
    term: "Organization",
    icon: Building2,
    color: "bg-gray-900 text-white",
    iconColor: "text-white/70",
    definition:
      "The top-level tenant in the platform. An organization represents a single company or operator — either a client organization (companies using the platform) or a manager organization (internal platform operators like Flux). All entities, users, groups, permissions, and wallets are scoped under an organization.",
    examples: ["Acme Corp (client)", "Flux Operations (manager)"],
    keyPoints: [
      "Every user, group, and wallet belongs to exactly one organization",
      "Client organizations and manager organizations have separate permission scopes",
      "An organization contains one or more entities",
    ],
  },
  {
    term: "Entity",
    icon: Layers,
    color: "bg-indigo-600 text-white",
    iconColor: "text-white/70",
    definition:
      "A subdivision within an organization representing an operational unit, region, or business line. Entities are the primary boundary for data isolation — users, groups, and wallets are scoped to entities. Each entity operates independently with its own admins, groups, and wallets.",
    examples: ["Acme US", "Acme EU", "Acme APAC"],
    keyPoints: [
      "Data is isolated per entity — users only see data from their assigned entities",
      "Groups are entity-scoped and do not cross entity boundaries",
      "An entity can have multiple admins, and admins can span multiple entities",
      "Wallets belong to a specific entity",
    ],
  },
  {
    term: "Wallet",
    icon: Wallet,
    color: "bg-rose-600 text-white",
    iconColor: "text-white/70",
    definition:
      "A custody wallet representing a balance tied to a specific asset. For crypto assets (e.g. BTC, ETH), a wallet holds the aggregate balance across all addresses derived from a set of private keys — for example, all Bitcoin address balances for a given BTC wallet. For fiat currencies, a wallet represents the fiat balance held in custody. Wallets are scoped to an entity and individually assigned to groups with specific capability levels.",
    examples: [
      "US Treasury Wallet (BTC) — all BTC address balances under one set of keys",
      "EU Payments Wallet (USDC) — USDC balance for the EU entity",
      "US Payments Wallet (USD) — fiat USD balance held in custody",
    ],
    keyPoints: [
      "Each wallet belongs to one entity",
      "Wallets are assigned to specific groups — not all groups see all wallets",
      "Each group gets a capability level per wallet: View, Send Transactions, or Full Manage",
      "Having 'Send Transactions' permission does not mean send from every wallet — only wallets explicitly assigned to that group",
      "When a wallet is created, it must be assigned to at least one group",
    ],
  },
  {
    term: "Group",
    icon: FolderKey,
    color: "bg-blue-600 text-white",
    iconColor: "text-white/70",
    definition:
      "A named bundle of permissions scoped to a single entity. Groups are the primary mechanism for granting access — rather than assigning permissions directly to users, permissions are assigned to groups and users are added to groups. A user can belong to multiple groups, and their effective permissions are the union of all their groups' permissions.",
    examples: [
      "Finance (Acme US) — can create transactions, view reporting, send from assigned wallets",
      "Compliance (Acme EU) — can view reporting and view assigned wallets",
      "Operations (Acme EU) — can create transactions, send from assigned wallets",
    ],
    keyPoints: [
      "Groups are entity-scoped — 'Finance' in Acme US is completely separate from 'Finance' in Acme EU",
      "Groups are not shared across entities",
      "Admins create and manage groups within the entities they are assigned to",
      "Groups receive both platform permissions (from the registry) and per-wallet capabilities",
      "A user in multiple groups gets the union of all permissions",
    ],
  },
  {
    term: "Permission",
    icon: Key,
    color: "bg-emerald-600 text-white",
    iconColor: "text-white/70",
    definition:
      "A named, system-defined action that can be performed on the platform. Permissions are stored in a central registry and cannot be created at runtime — they are defined by the platform and assigned to groups by admins. Permissions cover both platform operations (transactions, invoices, reporting) and custody wallet operations (create wallets, view, send, manage).",
    examples: [
      "create_transactions — create new payment or transfer transactions",
      "view_reporting — access reporting dashboards",
      "custody.wallet.create — create new crypto/fiat wallets",
      "custody.wallet.send_transactions — send transactions from assigned wallets",
    ],
    keyPoints: [
      "Permissions are system-defined — admins choose from the registry, they don't create new ones",
      "Each permission is scoped to either client or manager organizations",
      "Permissions are assigned to groups, not directly to users",
      "Wallet operations (create, view, send, manage) are permissions in the registry like everything else",
    ],
  },
  {
    term: "User",
    icon: Users,
    color: "bg-gray-600 text-white",
    iconColor: "text-white/70",
    definition:
      "A person with an account on the platform. Each user belongs to an organization, is assigned to one or more entities, and is a member of one or more groups. A user's effective access is determined by their entity assignments (what data they can see) and their group memberships (what actions they can perform, including which wallets they can access and at what capability level).",
    examples: [
      "Bob — Finance group in Acme US, can send from US Treasury wallet",
      "Carol — Operations group in Acme EU, can send from EU Ops wallet",
      "Dave — Compliance group in Acme US, can only view US Treasury wallet",
    ],
    keyPoints: [
      "Users are classified as either client or manager — this controls which permission scopes they can access",
      "A user can belong to multiple groups (effective permissions are the union)",
      "A user can be assigned to multiple entities",
      "Users cannot promote themselves to admin or super admin",
    ],
  },
  {
    term: "Super Admin",
    icon: Shield,
    color: "bg-amber-600 text-white",
    iconColor: "text-white/70",
    definition:
      "The highest-privilege role within an organization. Exactly one Super Admin group exists per organization and is created when the organization is created. Super Admins have full control over the entire organization — they create entities, assign admins to entities, and have all permissions automatically granted. Only a Super Admin can promote another user to Super Admin.",
    examples: [
      "Alice — Super Admin of Acme Corp, created all three entities and assigned admins",
    ],
    keyPoints: [
      "Exactly one Super Admin group per organization — cannot create a second one",
      "All permissions are auto-granted (not individually assigned)",
      "Creates entities and assigns admins to them",
      "Can manage any entity within the organization",
      "Users cannot promote themselves to Super Admin — only existing Super Admins can add others",
    ],
  },
  {
    term: "Admin",
    icon: ShieldCheck,
    color: "bg-blue-600 text-white",
    iconColor: "text-white/70",
    definition:
      "A user who has been assigned as an administrator of one or more entities by the Super Admin. An admin can create groups, assign permissions to groups, add users, and manage wallets — but only within the entities they are assigned to. An entity can have multiple admins, and a single admin can be assigned to multiple entities by the Super Admin.",
    examples: [
      "Bob — admin of Acme US only",
      "Carol — admin of both Acme US and Acme EU",
      "Fiona — admin of both Acme EU and Acme APAC",
    ],
    keyPoints: [
      "Assigned to specific entities by the Super Admin",
      "Can be admin of multiple entities simultaneously",
      "Entities can have multiple admins",
      "Can create groups, assign permissions, add users, and manage wallets within their assigned entities",
      "Cannot manage entities they are not assigned to",
      "Cannot promote themselves or others to Super Admin",
    ],
  },
];

export default function GlossaryPage() {
  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-gray-900 via-indigo-500 to-emerald-500" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Glossary</h1>
        </div>
        <p className="text-sm text-gray-500 ml-4 pl-3">
          Definitions for all key terms in the RBAC permissions structure
        </p>
      </div>

      {/* Quick nav */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Jump to</p>
        <div className="flex flex-wrap gap-2">
          {glossaryEntries.map((entry) => {
            const Icon = entry.icon;
            return (
              <a
                key={entry.term}
                href={`#${entry.term.toLowerCase().replace(/ /g, "-")}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${entry.color} hover:opacity-90 transition-opacity`}
              >
                <Icon className="w-3.5 h-3.5" />
                {entry.term}
              </a>
            );
          })}
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-6">
        {glossaryEntries.map((entry) => {
          const Icon = entry.icon;
          return (
            <div
              key={entry.term}
              id={entry.term.toLowerCase().replace(/ /g, "-")}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm scroll-mt-8"
            >
              {/* Term header */}
              <div className={`px-6 py-4 flex items-center gap-3 ${entry.color}`}>
                <Icon className={`w-6 h-6 ${entry.iconColor}`} />
                <h2 className="text-lg font-bold">{entry.term}</h2>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Definition */}
                <div>
                  <p className="text-sm text-gray-700 leading-relaxed">{entry.definition}</p>
                </div>

                {/* Examples */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Examples</h3>
                  <div className="space-y-1.5">
                    {entry.examples.map((ex) => (
                      <div key={ex} className="flex items-start gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600">{ex}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key points */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Key Points</h3>
                  <ul className="space-y-1.5">
                    {entry.keyPoints.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                        <p className="text-sm text-gray-600">{point}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
