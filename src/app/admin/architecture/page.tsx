"use client";

import { useState } from "react";
import {
  Building2,
  Users,
  Layers,
  Key,
  Shield,
  FolderKey,
  ArrowDown,
  ArrowRight,
  Lock,
  Wallet,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
} from "lucide-react";

// ─────────────────────────────────────────────
// Data for the diagram
// ─────────────────────────────────────────────

const clientPermissions = [
  "create_transactions",
  "approve_transactions",
  "create_invoices",
  "view_reporting",
  "request_user_resets",
  "edit_settings",
  "create_new_client_users",
  "deactivate_client_users",
  "custody.wallet.create",
  "custody.wallet.assign_group",
];

const managerPermissions = [
  "edit_merchant_details",
  "edit_user_compliance_status",
  "view_invoice_reporting",
  "view_trading_reporting",
  "approve_wire_details",
  "request_manager_resets",
  "create_new_manager_users",
  "deactivate_manager_users",
];

const clientGroups = [
  {
    name: "Super Admin",
    isSuperAdmin: true,
    permissions: "ALL client permissions",
    permList: clientPermissions,
    color: "amber",
  },
  {
    name: "Finance",
    isSuperAdmin: false,
    permissions: "create_transactions, approve_transactions, create_invoices, view_reporting",
    permList: ["create_transactions", "approve_transactions", "create_invoices", "view_reporting"],
    color: "blue",
  },
  {
    name: "Operations",
    isSuperAdmin: false,
    permissions: "create_transactions, create_invoices, view_reporting",
    permList: ["create_transactions", "create_invoices", "view_reporting"],
    color: "emerald",
  },
  {
    name: "Compliance",
    isSuperAdmin: false,
    permissions: "view_reporting",
    permList: ["view_reporting"],
    color: "purple",
  },
];

const managerGroups = [
  {
    name: "Super Admin",
    isSuperAdmin: true,
    permissions: "ALL manager permissions",
    permList: managerPermissions,
    color: "amber",
  },
  {
    name: "Compliance",
    isSuperAdmin: false,
    permissions: "edit_user_compliance_status, view_invoice_reporting, view_trading_reporting",
    permList: ["edit_user_compliance_status", "view_invoice_reporting", "view_trading_reporting"],
    color: "purple",
  },
  {
    name: "Operations",
    isSuperAdmin: false,
    permissions: "edit_merchant_details, approve_wire_details, view_invoice_reporting, view_trading_reporting",
    permList: ["edit_merchant_details", "approve_wire_details", "view_invoice_reporting", "view_trading_reporting"],
    color: "emerald",
  },
];

// ─────────────────────────────────────────────
// Connector components
// ─────────────────────────────────────────────

function VerticalConnector({ label, dashed }: { label?: string; dashed?: boolean }) {
  return (
    <div className="flex flex-col items-center py-1">
      <div className={`w-0.5 h-6 ${dashed ? "border-l-2 border-dashed border-gray-300" : "bg-gray-300"}`} />
      {label && (
        <span className="text-[10px] text-gray-400 font-medium px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-full -my-1 z-10">
          {label}
        </span>
      )}
      <ArrowDown className="w-3 h-3 text-gray-400 -mt-0.5" />
    </div>
  );
}

// ─────────────────────────────────────────────
// Role access matrix
// ─────────────────────────────────────────────

function RoleAccessMatrix() {
  const capabilities = [
    { action: "View dashboard & reporting", superAdmin: true, admin: true, user: true },
    { action: "Manage own profile", superAdmin: true, admin: true, user: true },
    { action: "Create transactions / invoices", superAdmin: true, admin: true, user: "if permitted" },
    { action: "View other users", superAdmin: true, admin: true, user: false },
    { action: "Create / deactivate users", superAdmin: true, admin: "own org", user: false },
    { action: "Request password / 2FA resets", superAdmin: true, admin: true, user: false },
    { action: "Approve / reject resets", superAdmin: true, admin: true, user: false },
    { action: "Create permission groups", superAdmin: true, admin: false, user: false },
    { action: "Assign permissions to groups", superAdmin: true, admin: false, user: false },
    { action: "Assign users to groups", superAdmin: true, admin: false, user: false },
    { action: "Manage organizations", superAdmin: true, admin: false, user: false },
    { action: "Assign entities to users", superAdmin: true, admin: false, user: false },
    { action: "Create custody wallets", superAdmin: true, admin: "if permitted", user: false },
    { action: "Assign groups to wallets", superAdmin: true, admin: false, user: false },
    { action: "View audit logs", superAdmin: true, admin: true, user: false },
    { action: "Access Admin UI", superAdmin: true, admin: true, user: false },
  ];

  function renderCell(value: boolean | string) {
    if (value === true) {
      return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600"><Eye className="w-3.5 h-3.5" /></span>;
    }
    if (value === false) {
      return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50 text-red-400"><EyeOff className="w-3.5 h-3.5" /></span>;
    }
    return <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{value}</span>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Capability</th>
            <th className="text-center py-3 px-4">
              <div className="flex flex-col items-center gap-1">
                <Shield className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-amber-700">Super Admin</span>
              </div>
            </th>
            <th className="text-center py-3 px-4">
              <div className="flex flex-col items-center gap-1">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold text-blue-700">Admin</span>
              </div>
            </th>
            <th className="text-center py-3 px-4">
              <div className="flex flex-col items-center gap-1">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-600">User</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {capabilities.map((cap, i) => (
            <tr key={i} className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} border-b border-gray-100`}>
              <td className="py-2.5 px-4 text-xs text-gray-700">{cap.action}</td>
              <td className="py-2.5 px-4 text-center">{renderCell(cap.superAdmin)}</td>
              <td className="py-2.5 px-4 text-center">{renderCell(cap.admin)}</td>
              <td className="py-2.5 px-4 text-center">{renderCell(cap.user)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────
// Organization block
// ─────────────────────────────────────────────

function OrgBlock({
  type,
  orgName,
  entities,
  groups,
  perms,
  users: userList,
}: {
  type: "client" | "manager";
  orgName: string;
  entities: string[];
  groups: typeof clientGroups;
  perms: string[];
  users: { name: string; role: string; entities: string[] }[];
}) {
  const [expanded, setExpanded] = useState(true);
  const isClient = type === "client";
  const borderColor = isClient ? "border-blue-300" : "border-violet-300";
  const headerBg = isClient ? "bg-blue-600" : "bg-violet-600";
  const badgeBg = isClient ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700";
  const lightBg = isClient ? "bg-blue-50" : "bg-violet-50";

  const colorMap: Record<string, string> = {
    amber: "border-amber-300 bg-amber-50",
    blue: "border-blue-300 bg-blue-50",
    emerald: "border-emerald-300 bg-emerald-50",
    purple: "border-purple-300 bg-purple-50",
  };

  return (
    <div className={`rounded-2xl border-2 ${borderColor} overflow-hidden shadow-sm`}>
      {/* Org header */}
      <div
        className={`${headerBg} px-5 py-3 flex items-center justify-between cursor-pointer`}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-white/80" />
          <span className="text-white font-bold">{orgName}</span>
          <span className="text-white/70 text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">
            {type}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-white/60" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/60" />
        )}
      </div>

      {expanded && (
        <div className={`${lightBg} p-5 space-y-5`}>
          {/* Entities */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-gray-500" />
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Entities / Spaces
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {entities.map((e) => (
                <div
                  key={e}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                  <Layers className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-700">{e}</span>
                  <Lock className="w-3 h-3 text-gray-300" />
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-[10px] text-gray-400 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Each entity has isolated data boundaries &mdash; users only see data from their assigned entities
            </p>
          </div>

          <VerticalConnector label="scoped to" dashed />

          {/* Permission Groups */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FolderKey className="w-4 h-4 text-gray-500" />
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Permission Groups
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {groups.map((g) => (
                <div
                  key={g.name}
                  className={`rounded-xl border-2 p-3 ${colorMap[g.color] || "border-gray-200 bg-white"}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {g.isSuperAdmin ? (
                      <Shield className="w-4 h-4 text-amber-500" />
                    ) : (
                      <FolderKey className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm font-semibold text-gray-800">{g.name}</span>
                    {g.isSuperAdmin && (
                      <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-bold">
                        SUPER ADMIN
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {g.isSuperAdmin ? (
                      <span className="text-[10px] text-amber-600 font-medium italic">
                        All {type} permissions (auto-granted)
                      </span>
                    ) : (
                      g.permList.map((p) => (
                        <span
                          key={p}
                          className="text-[10px] bg-white/80 border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-mono"
                        >
                          {p}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <VerticalConnector label="contain" dashed />

          {/* Permission Registry */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-gray-500" />
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {type === "client" ? "Client" : "Manager"} Permissions ({perms.length})
              </h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {perms.map((p) => (
                <span
                  key={p}
                  className={`text-[10px] px-2 py-1 rounded-md border font-mono font-medium ${badgeBg}`}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <VerticalConnector label="assigned to" dashed />

          {/* Users */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-gray-500" />
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Users
              </h4>
            </div>
            <div className="space-y-2">
              {userList.map((u) => (
                <div
                  key={u.name}
                  className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                    {u.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800">{u.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        u.role === "Super Admin"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {u.role}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {u.entities.join(", ")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────

export default function ArchitecturePage() {
  const [showMatrix, setShowMatrix] = useState(true);

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-500 via-violet-500 to-amber-500" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            RBAC Architecture
          </h1>
        </div>
        <p className="text-sm text-gray-500 ml-4 pl-3">
          How organizations, entities, permissions, groups, and users relate to each other
        </p>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SIMPLIFIED OVERVIEW
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="bg-white border-2 border-gray-900 rounded-2xl shadow-md overflow-hidden">
        <div className="bg-gray-900 px-6 py-4">
          <h2 className="text-base font-bold text-white">Simplified Overview</h2>
          <p className="text-xs text-gray-400 mt-0.5">How the permission system flows from top to bottom</p>
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center">

            {/* ── ORGANIZATION ── */}
            <div className="w-full max-w-2xl border-2 border-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-5 py-2.5 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-white/70" />
                <span className="text-white font-bold text-sm">Organization</span>
                <span className="text-gray-400 text-[10px] ml-auto">e.g. Acme Corp</span>
              </div>
              <div className="bg-gray-50 px-5 py-3 text-[11px] text-gray-600 space-y-1">
                <p className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span><strong className="text-gray-800">Super Admin</strong> is created with the organization (exactly one, cannot self-promote)</span>
                </p>
              </div>
            </div>

            {/* Arrow: Super Admin creates entities & assigns admins */}
            <div className="flex flex-col items-center py-1">
              <div className="w-0.5 h-4 bg-gray-300" />
              <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Super Admin creates entities &amp; assigns admins to them
              </span>
              <ArrowDown className="w-3 h-3 text-gray-400" />
            </div>

            {/* ── ENTITIES WITH THEIR OWN ADMINS & GROUPS ── */}
            <div className="w-full max-w-2xl space-y-3">
              {[
                {
                  name: "Acme US",
                  admins: ["Bob", "Carol"],
                  groups: [
                    { name: "Finance", color: "bg-blue-50 border-blue-200" },
                    { name: "Compliance", color: "bg-purple-50 border-purple-200" },
                    { name: "Treasury Ops", color: "bg-cyan-50 border-cyan-200" },
                  ],
                },
                {
                  name: "Acme EU",
                  admins: ["Carol", "Fiona"],
                  groups: [
                    { name: "Operations", color: "bg-emerald-50 border-emerald-200" },
                    { name: "Compliance", color: "bg-purple-50 border-purple-200" },
                  ],
                },
                {
                  name: "Acme APAC",
                  admins: ["Fiona"],
                  groups: [
                    { name: "Operations", color: "bg-emerald-50 border-emerald-200" },
                  ],
                },
              ].map((ent) => (
                <div key={ent.name} className="border-2 border-indigo-300 rounded-xl overflow-hidden">
                  <div className="bg-indigo-100 px-4 py-2 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-xs font-bold text-indigo-700">{ent.name}</span>
                    <div className="ml-auto flex items-center gap-1.5">
                      {ent.admins.map((a) => (
                        <span key={a} className="flex items-center gap-1 text-[10px] text-indigo-600 bg-indigo-200/60 px-1.5 py-0.5 rounded-full font-medium">
                          <Shield className="w-2.5 h-2.5" />
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="px-4 py-2.5 bg-white">
                    <p className="text-[10px] text-gray-400 mb-2">Groups in this entity:</p>
                    <div className="flex flex-wrap gap-2">
                      {ent.groups.map((g) => (
                        <div key={g.name} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium text-gray-700 ${g.color}`}>
                          <FolderKey className="w-3 h-3 text-gray-400" />
                          {g.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Callout: groups are entity-scoped, admins can span entities */}
            <div className="w-full max-w-2xl mt-2 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <p className="text-[11px] font-bold text-indigo-800 mb-1.5">Groups are entity-scoped &mdash; admins can span multiple entities</p>
              <ul className="space-y-1 text-[10px] text-indigo-700">
                <li className="flex items-start gap-1.5">
                  <span className="mt-1 w-1 h-1 rounded-full bg-indigo-500 flex-shrink-0" />
                  <span><strong>Entities can have multiple admins.</strong> Acme US has both Bob and Carol as admins.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-1 w-1 h-1 rounded-full bg-indigo-500 flex-shrink-0" />
                  <span><strong>Admins can be assigned to multiple entities</strong> by the Super Admin. Carol is admin of both Acme US and Acme EU.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-1 w-1 h-1 rounded-full bg-indigo-500 flex-shrink-0" />
                  <span><strong>Groups do not cross entity boundaries.</strong> &quot;Finance&quot; in Acme US is a completely separate group from &quot;Compliance&quot; in Acme EU.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-1 w-1 h-1 rounded-full bg-indigo-500 flex-shrink-0" />
                  <span><strong>An admin can only manage groups, permissions, and users within entities they are assigned to.</strong></span>
                </li>
              </ul>
            </div>

            {/* Arrow: Admin creates groups within their entity */}
            <div className="flex flex-col items-center py-1">
              <div className="w-0.5 h-4 bg-gray-300" />
              <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                each entity admin assigns permissions from the registry to their entity&apos;s groups
              </span>
              <ArrowDown className="w-3 h-3 text-gray-400" />
            </div>

            {/* Arrow: Permissions are assigned to groups */}
            <div className="flex flex-col items-center py-1">
              <div className="w-0.5 h-4 bg-gray-300" />
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                each group gets permissions from the registry
              </span>
              <ArrowDown className="w-3 h-3 text-gray-400" />
            </div>

            {/* ── PERMISSION REGISTRY ── */}
            <div className="w-full max-w-2xl border-2 border-emerald-300 rounded-xl overflow-hidden">
              <div className="bg-emerald-100 px-5 py-2.5 flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-800">Permission Registry</span>
                <span className="text-emerald-500 text-[10px] ml-auto">system-defined, single source of truth</span>
              </div>
              <div className="bg-white p-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider col-span-2 mb-1">Platform Permissions</p>
                  {[
                    "create_transactions",
                    "approve_transactions",
                    "create_invoices",
                    "view_reporting",
                    "edit_settings",
                    "create_new_client_users",
                    "request_user_resets",
                    "deactivate_client_users",
                  ].map((p) => (
                    <span key={p} className="text-[10px] font-mono text-gray-500 py-0.5">{p}</span>
                  ))}
                  <div className="col-span-2 border-t border-gray-100 my-2" />
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider col-span-2 mb-1">
                    Custody Wallet Permissions
                    <span className="ml-2 text-rose-500 font-normal normal-case">(wallets are just permissions like everything else)</span>
                  </p>
                  {[
                    "custody.wallet.create",
                    "custody.wallet.view",
                    "custody.wallet.send_transactions",
                    "custody.wallet.manage",
                    "custody.wallet.assign_group",
                  ].map((p) => (
                    <span key={p} className="text-[10px] font-mono text-rose-600 py-0.5">{p}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Arrow: wallets are created and assigned to groups */}
            <div className="flex flex-col items-center py-1">
              <div className="w-0.5 h-4 bg-gray-300" />
              <span className="text-[10px] text-rose-600 font-semibold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                wallets are created within entities &amp; assigned to specific groups
              </span>
              <ArrowDown className="w-3 h-3 text-gray-400" />
            </div>

            {/* ── WALLETS ── */}
            <div className="w-full max-w-2xl border-2 border-rose-300 rounded-xl overflow-hidden">
              <div className="bg-rose-100 px-5 py-2.5 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-rose-600" />
                <span className="text-sm font-bold text-rose-800">Custody Wallets</span>
                <span className="text-rose-500 text-[10px] ml-auto">each wallet is assigned to specific groups</span>
              </div>
              <div className="bg-white p-4 space-y-3">
                {/* Example wallets with their group assignments */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      name: "US Treasury (BTC)",
                      entity: "Acme US",
                      groups: [
                        { name: "Finance", cap: "Send", capColor: "bg-amber-100 text-amber-700" },
                        { name: "Compliance", cap: "View", capColor: "bg-blue-100 text-blue-700" },
                      ],
                      noAccess: ["Operations", "Treasury Ops"],
                    },
                    {
                      name: "EU Ops (ETH)",
                      entity: "Acme EU",
                      groups: [
                        { name: "Operations", cap: "Send", capColor: "bg-amber-100 text-amber-700" },
                      ],
                      noAccess: ["Finance", "Compliance", "Treasury Ops"],
                    },
                    {
                      name: "US Payments (USDC)",
                      entity: "Acme US",
                      groups: [
                        { name: "Finance", cap: "Send", capColor: "bg-amber-100 text-amber-700" },
                        { name: "Treasury Ops", cap: "Manage", capColor: "bg-rose-100 text-rose-700" },
                      ],
                      noAccess: ["Compliance", "Operations"],
                    },
                    {
                      name: "EU Payments (USDC)",
                      entity: "Acme EU",
                      groups: [
                        { name: "Compliance", cap: "View", capColor: "bg-blue-100 text-blue-700" },
                        { name: "Operations", cap: "View", capColor: "bg-blue-100 text-blue-700" },
                      ],
                      noAccess: ["Finance", "Treasury Ops"],
                    },
                  ].map((w) => (
                    <div key={w.name} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-3.5 h-3.5 text-rose-400" />
                        <span className="text-xs font-semibold text-gray-800">{w.name}</span>
                      </div>
                      <p className="text-[10px] text-indigo-500 font-medium mb-2">{w.entity}</p>
                      <div className="space-y-1">
                        {w.groups.map((g) => (
                          <div key={g.name} className="flex items-center gap-2">
                            <Eye className="w-3 h-3 text-emerald-500" />
                            <span className="text-[10px] text-gray-600">{g.name}</span>
                            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${g.capColor}`}>{g.cap}</span>
                          </div>
                        ))}
                        {w.noAccess.map((g) => (
                          <div key={g} className="flex items-center gap-2">
                            <EyeOff className="w-3 h-3 text-red-300" />
                            <span className="text-[10px] text-gray-300">{g}</span>
                            <span className="text-[9px] text-red-300">no access</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Critical callout */}
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 space-y-2">
                  <p className="text-[11px] font-bold text-rose-800">Important: wallet access is per-wallet, not global</p>
                  <ul className="space-y-1.5 text-[10px] text-rose-700">
                    <li className="flex items-start gap-1.5">
                      <span className="mt-1 w-1 h-1 rounded-full bg-rose-500 flex-shrink-0" />
                      <span><strong>Not all groups have access to the same wallets.</strong> Finance can access US wallets but has zero access to EU wallets.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="mt-1 w-1 h-1 rounded-full bg-rose-500 flex-shrink-0" />
                      <span><strong>Having &quot;Send Transactions&quot; does not mean send from all wallets.</strong> Finance can send from US Treasury but cannot even see EU Operations.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="mt-1 w-1 h-1 rounded-full bg-rose-500 flex-shrink-0" />
                      <span><strong>Each wallet is individually assigned to groups</strong> with a specific capability level (View, Send, or Manage) per group.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="mt-1 w-1 h-1 rounded-full bg-rose-500 flex-shrink-0" />
                      <span><strong>When a wallet is created, it must be assigned to at least one group.</strong> Unassigned wallets are inaccessible.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Arrow: groups assigned to users */}
            <div className="flex flex-col items-center py-1">
              <div className="w-0.5 h-4 bg-gray-300" />
              <span className="text-[10px] text-gray-500 font-semibold bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                users are added to groups &rarr; inherit group permissions + wallet access
              </span>
              <ArrowDown className="w-3 h-3 text-gray-400" />
            </div>

            {/* ── USERS ── */}
            <div className="w-full max-w-2xl bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-bold text-gray-700">Users</span>
                <span className="text-[10px] text-gray-400">&mdash; what each user can actually do</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    name: "Bob", group: "Finance", entity: "Acme US",
                    can: ["Send from US Treasury (BTC)", "Send from US Payments (USDC)", "Create transactions & invoices"],
                    cannot: ["Access any EU wallet", "Access EU Operations wallet"],
                  },
                  {
                    name: "Carol", group: "Operations", entity: "Acme EU",
                    can: ["Send from EU Ops (ETH)", "View EU Payments (USDC)", "Create transactions & invoices"],
                    cannot: ["Access any US wallet", "Send from EU Payments"],
                  },
                  {
                    name: "Dave", group: "Compliance", entity: "Acme US",
                    can: ["View US Treasury (BTC)", "View EU Payments (USDC)", "View reporting"],
                    cannot: ["Access US Payments", "Access EU Ops", "Send from any wallet"],
                  },
                  {
                    name: "Eve", group: "Treasury Ops", entity: "Acme US",
                    can: ["Manage US Payments (USDC)", "Create new wallets"],
                    cannot: ["Access US Treasury", "Access any EU wallet"],
                  },
                ].map((u) => (
                  <div key={u.name} className="bg-white border border-gray-200 rounded-lg p-2.5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                        {u.name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-800">{u.name}</p>
                        <p className="text-[10px] text-gray-400">{u.group} &middot; {u.entity}</p>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      {u.can.map((c) => (
                        <div key={c} className="flex items-center gap-1.5 text-[9px]">
                          <Eye className="w-2.5 h-2.5 text-emerald-500 flex-shrink-0" />
                          <span className="text-emerald-700">{c}</span>
                        </div>
                      ))}
                      {u.cannot.map((c) => (
                        <div key={c} className="flex items-center gap-1.5 text-[9px]">
                          <EyeOff className="w-2.5 h-2.5 text-red-300 flex-shrink-0" />
                          <span className="text-red-400">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary box */}
            <div className="w-full max-w-2xl mt-4 bg-gray-900 text-white rounded-xl p-4">
              <p className="text-xs font-bold mb-2">How it all connects</p>
              <ol className="space-y-1.5 text-[11px] text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="bg-amber-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <span><strong className="text-white">Super Admin</strong> creates <strong className="text-indigo-300">entities</strong> and assigns an <strong className="text-blue-300">admin</strong> to each entity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <span><strong className="text-white">Each entity admin</strong> creates <strong className="text-emerald-300">groups within their entity only</strong> and assigns permissions from the registry. Groups are <strong className="text-indigo-300">not shared</strong> across entities.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <span><strong className="text-white">Wallets</strong> are created within entities and <strong className="text-rose-300">individually assigned to specific groups in that entity</strong> with a capability level (View, Send, or Manage)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">!</span>
                  <span><strong className="text-rose-300">Not every group gets every wallet.</strong> A group with &quot;Send Transactions&quot; can only send from wallets it is explicitly assigned to &mdash; not all wallets in the entity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-gray-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                  <span><strong className="text-white">Users</strong> belong to an entity, inherit their group&apos;s permissions, and only get wallet access that their group has been granted on each specific wallet</span>
                </li>
              </ol>
            </div>

          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          DETAILED SECTIONS BELOW
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

      {/* High-level hierarchy diagram */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">System Hierarchy (Detailed)</h2>
        <div className="flex flex-col items-center">
          {/* Platform level */}
          <div className="w-full max-w-md bg-gray-900 text-white rounded-xl px-5 py-3 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Platform</p>
            <p className="text-sm font-bold mt-0.5">Flux Platform</p>
            <p className="text-[10px] text-gray-400 mt-1">Central permission registry lives here &mdash; all permissions are system-defined</p>
          </div>

          <VerticalConnector label="contains" />

          {/* Organization level */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                <p className="text-sm font-bold text-blue-800">Client Organizations</p>
              </div>
              <p className="text-[10px] text-blue-500 mt-1">e.g. Acme Corp, 40 Acres</p>
              <p className="text-[10px] text-blue-400 mt-0.5">Scope: client permissions only</p>
            </div>
            <div className="bg-violet-50 border-2 border-violet-200 rounded-xl px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <Building2 className="w-4 h-4 text-violet-500" />
                <p className="text-sm font-bold text-violet-800">Manager Organizations</p>
              </div>
              <p className="text-[10px] text-violet-500 mt-1">e.g. Flux Operations</p>
              <p className="text-[10px] text-violet-400 mt-0.5">Scope: manager permissions only</p>
            </div>
          </div>

          <VerticalConnector label="subdivided into" />

          {/* Entity level */}
          <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-gray-500" />
              <p className="text-sm font-bold text-gray-800">Entities / Spaces</p>
            </div>
            <p className="text-[10px] text-gray-500">Operational sub-units within an organization (e.g. Acme US, Acme EU, Acme APAC)</p>
            <p className="text-[10px] text-gray-400 mt-1">Data isolation enforced per entity &mdash; users only see data from assigned entities</p>
          </div>

          <VerticalConnector label="access controlled by" />

          {/* Groups + Permissions level */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <FolderKey className="w-4 h-4 text-amber-500" />
                <p className="text-sm font-bold text-amber-800">Permission Groups</p>
              </div>
              <p className="text-[10px] text-amber-600 mt-1">Named bundles of permissions scoped to an org</p>
              <p className="text-[10px] text-amber-500 mt-0.5">Users can belong to multiple groups &mdash; permissions are the union</p>
            </div>
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <Key className="w-4 h-4 text-emerald-500" />
                <p className="text-sm font-bold text-emerald-800">Permission Registry</p>
              </div>
              <p className="text-[10px] text-emerald-600 mt-1">Central list of all named permissions</p>
              <p className="text-[10px] text-emerald-500 mt-0.5">System-defined, cannot be created at runtime</p>
            </div>
          </div>

          <VerticalConnector label="assigned to" />

          {/* Users level */}
          <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="w-4 h-4 text-gray-500" />
              <p className="text-sm font-bold text-gray-800">Users</p>
            </div>
            <p className="text-[10px] text-gray-500">Each user has a type (client | manager), belongs to an organization, is assigned to entities, and is a member of one or more groups</p>
          </div>
        </div>
      </div>

      {/* Role hierarchy */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Role Hierarchy &amp; Capabilities</h2>
        <div className="flex flex-col items-center space-y-3">
          {/* Super Admin */}
          <div className="w-full max-w-lg">
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-800">Super Admin</h3>
                  <p className="text-[10px] text-amber-600">Exactly one per organization &mdash; full RBAC control</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                {[
                  "All permissions (auto-granted)",
                  "Create & delete groups",
                  "Assign permissions to groups",
                  "Add & remove users",
                  "Assign entities to users",
                  "Manage custody wallets",
                  "View & manage audit logs",
                  "Cannot be self-promoted",
                ].map((cap) => (
                  <div key={cap} className="flex items-center gap-1.5 text-amber-700">
                    <Eye className="w-3 h-3 flex-shrink-0" />
                    {cap}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center gap-2">
            <div className="h-px w-8 border-t-2 border-dashed border-gray-300" />
            <span className="text-[10px] text-gray-400 font-medium">delegates to</span>
            <div className="h-px w-8 border-t-2 border-dashed border-gray-300" />
          </div>

          {/* Admin */}
          <div className="w-full max-w-lg">
            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-800">Admin</h3>
                  <p className="text-[10px] text-blue-600">Org-scoped management &mdash; permissions derived from group membership</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                {[
                  { cap: "Manage users in own org", ok: true },
                  { cap: "Request resets", ok: true },
                  { cap: "Create custody wallets", ok: "if permitted" },
                  { cap: "View audit logs", ok: true },
                  { cap: "Create/modify groups", ok: false },
                  { cap: "Assign permissions", ok: false },
                  { cap: "Manage other orgs", ok: false },
                  { cap: "Assign groups to wallets", ok: false },
                ].map((item) => (
                  <div key={item.cap} className={`flex items-center gap-1.5 ${item.ok === false ? "text-gray-400" : "text-blue-700"}`}>
                    {item.ok === false ? <EyeOff className="w-3 h-3 flex-shrink-0" /> : <Eye className="w-3 h-3 flex-shrink-0" />}
                    {item.cap}
                    {typeof item.ok === "string" && (
                      <span className="text-amber-600 font-medium">*</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center gap-2">
            <div className="h-px w-8 border-t-2 border-dashed border-gray-300" />
            <span className="text-[10px] text-gray-400 font-medium">restricted from</span>
            <div className="h-px w-8 border-t-2 border-dashed border-gray-300" />
          </div>

          {/* User */}
          <div className="w-full max-w-lg">
            <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">User</h3>
                  <p className="text-[10px] text-gray-500">Standard user &mdash; permissions strictly from group membership</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                {[
                  { cap: "Actions permitted by groups", ok: true },
                  { cap: "View own entity data only", ok: true },
                  { cap: "No Admin UI access", ok: false },
                  { cap: "No user management", ok: false },
                  { cap: "No group management", ok: false },
                  { cap: "No custody wallet access", ok: false },
                ].map((item) => (
                  <div key={item.cap} className={`flex items-center gap-1.5 ${item.ok ? "text-gray-700" : "text-gray-400"}`}>
                    {item.ok ? <Eye className="w-3 h-3 flex-shrink-0" /> : <Lock className="w-3 h-3 flex-shrink-0" />}
                    {item.cap}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Access Matrix */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-gray-100 cursor-pointer"
          onClick={() => setShowMatrix((v) => !v)}
        >
          <h2 className="text-sm font-semibold text-gray-800">Detailed Access Matrix</h2>
          {showMatrix ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
        {showMatrix && <RoleAccessMatrix />}
      </div>

      {/* Concrete examples: Client org */}
      <div>
        <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          Example: Client Organization (Acme Corp)
        </h2>
        <OrgBlock
          type="client"
          orgName="Acme Corp"
          entities={["Acme US", "Acme EU", "Acme APAC"]}
          groups={clientGroups}
          perms={clientPermissions}
          users={[
            { name: "Alice Nguyen", role: "Super Admin", entities: ["Acme US", "Acme EU", "Acme APAC"] },
            { name: "Bob Patel", role: "Finance", entities: ["Acme US"] },
            { name: "Carol Smith", role: "Operations", entities: ["Acme EU", "Acme APAC"] },
            { name: "Dave Kim", role: "Compliance (inactive)", entities: ["Acme US"] },
          ]}
        />

        {/* Wallet access per entity — shows Finance vs Compliance differences */}
        <div className="mt-4 bg-white border-2 border-blue-200 rounded-2xl overflow-hidden">
          <div className="bg-blue-600 px-5 py-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-white/80" />
              <span className="text-white font-bold text-sm">Acme Corp &mdash; Wallet Access by Entity</span>
            </div>
            <p className="text-blue-200 text-[10px] mt-1">
              Different groups have access to different wallets across entities. Finance and Compliance each see wallets the other cannot.
            </p>
          </div>
          <div className="p-5 space-y-5">
            {/* Acme US */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-indigo-700">Acme US</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-gray-500 font-semibold">Wallet</th>
                      <th className="text-center py-2 px-3"><span className="text-amber-700 font-semibold">Super Admin</span></th>
                      <th className="text-center py-2 px-3"><span className="text-blue-700 font-semibold">Finance</span></th>
                      <th className="text-center py-2 px-3"><span className="text-purple-700 font-semibold">Compliance</span></th>
                      <th className="text-center py-2 px-3"><span className="text-emerald-700 font-semibold">Operations</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-3 font-medium text-gray-700">US Treasury (BTC)</td>
                      <td className="py-2 px-3 text-center"><span className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded text-[10px] font-medium">Manage</span></td>
                      <td className="py-2 px-3 text-center"><span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-medium">Send</span></td>
                      <td className="py-2 px-3 text-center"><span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-medium">View</span></td>
                      <td className="py-2 px-3 text-center"><span className="text-gray-300">&mdash;</span></td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-gray-700">US Payments (USDC)</td>
                      <td className="py-2 px-3 text-center"><span className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded text-[10px] font-medium">Manage</span></td>
                      <td className="py-2 px-3 text-center"><span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-medium">Send</span></td>
                      <td className="py-2 px-3 text-center"><span className="text-gray-300">&mdash;</span></td>
                      <td className="py-2 px-3 text-center"><span className="text-gray-300">&mdash;</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 italic px-3">
                Finance can <strong>send</strong> from both US wallets. Compliance can <strong>view</strong> the Treasury but has <strong>no access</strong> to Payments.
              </p>
            </div>

            {/* Acme EU */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-indigo-700">Acme EU</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-gray-500 font-semibold">Wallet</th>
                      <th className="text-center py-2 px-3"><span className="text-amber-700 font-semibold">Super Admin</span></th>
                      <th className="text-center py-2 px-3"><span className="text-blue-700 font-semibold">Finance</span></th>
                      <th className="text-center py-2 px-3"><span className="text-purple-700 font-semibold">Compliance</span></th>
                      <th className="text-center py-2 px-3"><span className="text-emerald-700 font-semibold">Operations</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-3 font-medium text-gray-700">EU Operations (ETH)</td>
                      <td className="py-2 px-3 text-center"><span className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded text-[10px] font-medium">Manage</span></td>
                      <td className="py-2 px-3 text-center"><span className="text-gray-300">&mdash;</span></td>
                      <td className="py-2 px-3 text-center"><span className="text-gray-300">&mdash;</span></td>
                      <td className="py-2 px-3 text-center"><span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-medium">Send</span></td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-gray-700">EU Payments (USDC)</td>
                      <td className="py-2 px-3 text-center"><span className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded text-[10px] font-medium">Manage</span></td>
                      <td className="py-2 px-3 text-center"><span className="text-gray-300">&mdash;</span></td>
                      <td className="py-2 px-3 text-center"><span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-medium">View</span></td>
                      <td className="py-2 px-3 text-center"><span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-medium">View</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 italic px-3">
                Finance has <strong>no access</strong> to any EU wallets. Compliance can <strong>view</strong> EU Payments but not EU Operations. Operations can <strong>send</strong> from EU Operations.
              </p>
            </div>

            {/* Acme APAC */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-indigo-700">Acme APAC</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-gray-500 font-semibold">Wallet</th>
                      <th className="text-center py-2 px-3" colSpan={4}><span className="text-gray-400 font-medium">All Groups</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-3 font-medium text-gray-700">APAC Cold Storage (BTC)</td>
                      <td className="py-2 px-3 text-center" colSpan={4}>
                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-medium">Frozen &mdash; no groups assigned</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary callout */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-800 mb-2">Key Takeaway</p>
              <ul className="space-y-1 text-[10px] text-blue-700">
                <li className="flex items-start gap-1.5">
                  <span className="mt-1 w-1 h-1 rounded-full bg-blue-500 flex-shrink-0" />
                  <span><strong>Finance</strong> can send from US Treasury &amp; US Payments, but has <strong>zero access</strong> to any EU wallet</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-1 w-1 h-1 rounded-full bg-blue-500 flex-shrink-0" />
                  <span><strong>Compliance</strong> can view US Treasury &amp; EU Payments, but has <strong>zero access</strong> to US Payments or EU Operations</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-1 w-1 h-1 rounded-full bg-blue-500 flex-shrink-0" />
                  <span><strong>Operations</strong> can send from EU Operations &amp; view EU Payments, but has <strong>zero access</strong> to any US wallet</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-1 w-1 h-1 rounded-full bg-blue-500 flex-shrink-0" />
                  <span>Each group sees a <strong>different set of wallets</strong> &mdash; access is not uniform across the organization</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Concrete examples: Manager org */}
      <div>
        <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          Example: Manager Organization (Flux Operations)
        </h2>
        <OrgBlock
          type="manager"
          orgName="Flux Operations"
          entities={["Flux Trading", "Flux Compliance"]}
          groups={managerGroups}
          perms={managerPermissions}
          users={[
            { name: "Eva Martinez", role: "Super Admin", entities: ["Flux Trading", "Flux Compliance"] },
            { name: "Frank Chen", role: "Compliance", entities: ["Flux Compliance"] },
          ]}
        />
      </div>

      {/* Custody Wallets relationship */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-gray-400" />
          Custody Wallets &mdash; Capability-Based Access
        </h2>
        <div className="flex flex-col items-center space-y-3">
          {/* Entity → Wallet relationship */}
          <div className="w-full max-w-2xl bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-bold text-indigo-800">Entity / Space</span>
              <span className="text-[10px] bg-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded-full font-medium">e.g. Acme US, Acme EU</span>
            </div>
            <p className="text-[10px] text-indigo-600">Wallets belong to a specific entity within an organization</p>
            <p className="text-[10px] text-indigo-500 mt-1">Different entities can have different wallets with different group access</p>
          </div>

          <VerticalConnector label="contains" dashed />

          {/* Wallet */}
          <div className="w-full max-w-2xl bg-rose-50 border-2 border-rose-200 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-rose-500" />
              <span className="text-sm font-bold text-rose-800">Custody Wallet</span>
              <span className="text-[10px] bg-rose-200 text-rose-700 px-1.5 py-0.5 rounded-full font-medium">e.g. US Treasury Wallet (BTC)</span>
            </div>
            <p className="text-[10px] text-rose-600">Created by users with <code className="bg-rose-100 px-1 rounded">custody.wallet.create</code></p>
            <p className="text-[10px] text-rose-500 mt-1">Labelled, scoped by currency, and scoped to an entity</p>
          </div>

          <div className="flex flex-col items-center">
            <ArrowDown className="w-3 h-3 text-gray-400" />
            <span className="text-[10px] text-gray-400 font-medium mt-1">groups assigned with <strong>specific capabilities</strong> via</span>
            <code className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded mt-0.5 text-gray-600">custody.wallet.assign_group</code>
          </div>

          {/* Capability levels */}
          <div className="w-full max-w-2xl">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center">
              Three Capability Levels per Group Assignment
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 text-center">
                <Eye className="w-5 h-5 text-blue-500 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-blue-700">View Only</p>
                <p className="text-[10px] text-blue-500 mt-1">See balances, transaction history, and addresses</p>
              </div>
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-3 text-center">
                <ArrowRight className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-amber-700">Send Transactions</p>
                <p className="text-[10px] text-amber-500 mt-1">Create and submit transactions from the wallet (includes View)</p>
              </div>
              <div className="bg-rose-50 border-2 border-rose-200 rounded-lg p-3 text-center">
                <Shield className="w-5 h-5 text-rose-500 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-rose-700">Full Manage</p>
                <p className="text-[10px] text-rose-500 mt-1">Settings, freeze/unfreeze, group assignment (includes all)</p>
              </div>
            </div>
          </div>

          <ArrowDown className="w-3 h-3 text-gray-400" />

          {/* Example: Treasury Wallet */}
          {/* Example: two entities, different access */}
          <div className="w-full max-w-2xl space-y-4">
            {/* Acme US */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-indigo-500" />
                <p className="text-xs font-semibold text-indigo-700">Acme US</p>
                <span className="text-[10px] text-gray-400">&mdash; US Treasury Wallet (BTC)</span>
              </div>
              <div className="space-y-2">
                {[
                  { group: "Super Admin", caps: ["View Only", "Send Transactions", "Full Manage"], capColors: ["bg-blue-100 text-blue-700", "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700"] },
                  { group: "Finance", caps: ["View Only", "Send Transactions"], capColors: ["bg-blue-100 text-blue-700", "bg-amber-100 text-amber-700"] },
                  { group: "Compliance", caps: ["View Only"], capColors: ["bg-blue-100 text-blue-700"] },
                ].map((row) => (
                  <div key={row.group} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 w-32 flex-shrink-0">
                      <FolderKey className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-medium text-gray-700">{row.group}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {row.caps.map((cap, i) => (
                        <span key={cap} className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${row.capColors[i]}`}>{cap}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Acme EU - different groups, different capabilities */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-indigo-500" />
                <p className="text-xs font-semibold text-indigo-700">Acme EU</p>
                <span className="text-[10px] text-gray-400">&mdash; EU Operations Wallet (ETH)</span>
              </div>
              <div className="space-y-2">
                {[
                  { group: "Super Admin", caps: ["View Only", "Send Transactions", "Full Manage"], capColors: ["bg-blue-100 text-blue-700", "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700"] },
                  { group: "Operations", caps: ["View Only", "Send Transactions"], capColors: ["bg-blue-100 text-blue-700", "bg-amber-100 text-amber-700"] },
                ].map((row) => (
                  <div key={row.group} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 w-32 flex-shrink-0">
                      <FolderKey className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-medium text-gray-700">{row.group}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {row.caps.map((cap, i) => (
                        <span key={cap} className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${row.capColors[i]}`}>{cap}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-2 italic">
                Note: Finance has no access to the EU wallet &mdash; only Operations does. Different entities, different group assignments.
              </p>
            </div>
          </div>

          <ArrowDown className="w-3 h-3 text-gray-400" />

          <div className="w-full max-w-2xl bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-600 font-medium">Users inherit wallet capabilities from their group membership within each entity</p>
            <p className="text-[10px] text-gray-400 mt-1">
              A user&apos;s effective wallet access = their entity assignment + group membership + each group&apos;s per-wallet capability level
            </p>
          </div>
        </div>
      </div>

      {/* Key rules */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Key Rules &amp; Constraints</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { rule: "Exactly one Super Admin group per organization", icon: Shield },
            { rule: "Users cannot promote themselves to Super Admin", icon: Lock },
            { rule: "Client users cannot access manager endpoints (and vice versa)", icon: EyeOff },
            { rule: "All RBAC actions are immutably audit-logged", icon: Eye },
            { rule: "Permissions are system-defined — not created at runtime", icon: Key },
            { rule: "Users can belong to multiple groups — effective permissions are the union", icon: Users },
            { rule: "Entity data is isolated — users only see their assigned entities", icon: Layers },
            { rule: "Unauthorized API calls return 403 Forbidden", icon: Lock },
            { rule: "Custody wallets are entity-scoped with per-group capabilities: View, Send, or Manage", icon: Wallet },
            { rule: "All features are gated behind feature flags for phased rollout", icon: Shield },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.rule} className="flex items-start gap-2 bg-white border border-gray-200 rounded-lg p-3">
                <Icon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700">{item.rule}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
