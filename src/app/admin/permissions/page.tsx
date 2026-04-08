'use client';

import { useState } from 'react';
import { Key, Info, CheckCircle2, Minus, Shield } from 'lucide-react';
import { permissions, permissionGroups } from '@/lib/mock-data';
import type { Permission } from '@/lib/mock-data';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatPermissionName(name: string): string {
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function ScopeBadge({ scope }: { scope: Permission['scope'] }) {
  const isClient = scope === 'client';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide ${
        isClient
          ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200'
          : 'bg-purple-100 text-purple-700 ring-1 ring-purple-200'
      }`}
    >
      {isClient ? 'Client' : 'Manager'}
    </span>
  );
}

function PermissionCard({ permission }: { permission: Permission }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Key className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-semibold text-gray-900 leading-tight">
            {formatPermissionName(permission.name)}
          </span>
        </div>
        <ScopeBadge scope={permission.scope} />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed ml-6">
        {permission.description}
      </p>
      <div className="mt-3 ml-6">
        <code className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">
          {permission.name}
        </code>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Permission Matrix
// ─────────────────────────────────────────────

// Sample groups to display in the matrix — picked from existing mock data
const MATRIX_GROUPS = [
  { id: 'grp-acme-finance',     label: 'Finance',     org: 'Acme Corp' },
  { id: 'grp-acme-operations',  label: 'Operations',  org: 'Acme Corp' },
  { id: 'grp-acme-compliance',  label: 'Compliance',  org: 'Acme Corp' },
  { id: 'grp-acme-super-admin', label: 'Super Admin', org: 'Acme Corp' },
  { id: 'grp-flux-compliance',  label: 'Compliance',  org: 'Flux Ops' },
  { id: 'grp-flux-operations',  label: 'Operations',  org: 'Flux Ops' },
];

function PermissionMatrix() {
  // Build a lookup: groupId → Set<permissionId>
  const groupPermMap = new Map<string, Set<string>>();
  for (const g of permissionGroups) {
    groupPermMap.set(g.id, new Set(g.permission_ids));
  }

  const clientPerms = permissions.filter((p) => p.scope === 'client');
  const managerPerms = permissions.filter((p) => p.scope === 'manager');

  const renderRow = (perm: Permission) => {
    return (
      <tr key={perm.id} className="group hover:bg-gray-50 transition-colors">
        <td className="sticky left-0 bg-white group-hover:bg-gray-50 z-10 px-4 py-3 border-b border-gray-100">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">
              {formatPermissionName(perm.name)}
            </span>
            <ScopeBadge scope={perm.scope} />
          </div>
        </td>
        {MATRIX_GROUPS.map((group) => {
          const has = groupPermMap.get(group.id)?.has(perm.id) ?? false;
          return (
            <td
              key={group.id}
              className="px-4 py-3 border-b border-gray-100 text-center"
            >
              {has ? (
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-50 ring-1 ring-green-200">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </span>
              ) : (
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-50">
                  <Minus className="w-4 h-4 text-gray-300" />
                </span>
              )}
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <Shield className="w-5 h-5 text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900">Permission Matrix</h2>
        <span className="text-xs text-gray-400 ml-1">— read-only snapshot</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            {/* Org row */}
            <tr className="bg-gray-50">
              <th className="sticky left-0 bg-gray-50 z-10 px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-52">
                Permission
              </th>
              {/* Acme Corp header span */}
              <th
                colSpan={4}
                className="px-4 py-2 text-center text-xs font-semibold text-blue-600 uppercase tracking-wider border-b border-gray-200 border-l border-blue-100 bg-blue-50/50"
              >
                Acme Corp — Client Groups
              </th>
              {/* Flux Ops header span */}
              <th
                colSpan={2}
                className="px-4 py-2 text-center text-xs font-semibold text-purple-600 uppercase tracking-wider border-b border-gray-200 border-l border-purple-100 bg-purple-50/50"
              >
                Flux Ops — Manager Groups
              </th>
            </tr>
            {/* Group name row */}
            <tr className="bg-gray-50">
              <th className="sticky left-0 bg-gray-50 z-10 px-4 py-2 border-b border-gray-200" />
              {MATRIX_GROUPS.map((g, idx) => {
                const isFlux = g.org === 'Flux Ops';
                const isFirstFlux = idx === 4; // first Flux group column
                return (
                  <th
                    key={g.id}
                    className={`px-4 py-2 text-center text-xs font-medium text-gray-700 border-b border-gray-200 whitespace-nowrap ${
                      isFirstFlux ? 'border-l border-purple-100' : ''
                    } ${isFlux ? 'bg-purple-50/30' : 'bg-blue-50/30'}`}
                  >
                    {g.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/* Client permissions section */}
            <tr>
              <td
                colSpan={MATRIX_GROUPS.length + 1}
                className="px-4 py-2 bg-blue-50/60 border-b border-blue-100"
              >
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Client Permissions
                </span>
              </td>
            </tr>
            {clientPerms.map(renderRow)}

            {/* Manager permissions section */}
            <tr>
              <td
                colSpan={MATRIX_GROUPS.length + 1}
                className="px-4 py-2 bg-purple-50/60 border-b border-purple-100"
              >
                <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                  Manager Permissions
                </span>
              </td>
            </tr>
            {managerPerms.map(renderRow)}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-6">
        <span className="text-xs text-gray-500 font-medium">Legend:</span>
        <span className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-50 ring-1 ring-green-200">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
          </span>
          Permission assigned
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-50">
            <Minus className="w-3 h-3 text-gray-300" />
          </span>
          Not assigned
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

type TabId = 'client' | 'manager';

export default function PermissionsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('client');

  const clientPerms = permissions.filter((p) => p.scope === 'client');
  const managerPerms = permissions.filter((p) => p.scope === 'manager');

  const displayedPerms = activeTab === 'client' ? clientPerms : managerPerms;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 shadow-sm">
            <Key className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Permission Registry
          </h1>
        </div>
        <p className="text-sm text-gray-500 ml-12">
          Central registry of all platform permissions. Permissions are system-defined and cannot be created or deleted at runtime.
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Key className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{permissions.length}</p>
            <p className="text-xs text-gray-500">Total Permissions</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Key className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-700">{clientPerms.length}</p>
            <p className="text-xs text-gray-500">Client Permissions</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Key className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-700">{managerPerms.length}</p>
            <p className="text-xs text-gray-500">Manager Permissions</p>
          </div>
        </div>
      </div>

      {/* Tab view: Client / Manager */}
      <div>
        {/* Tab bar */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
          <button
            onClick={() => setActiveTab('client')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'client'
                ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-100'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Client Permissions
            <span
              className={`ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                activeTab === 'client'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {clientPerms.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('manager')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'manager'
                ? 'bg-white text-purple-700 shadow-sm ring-1 ring-purple-100'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Manager Permissions
            <span
              className={`ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                activeTab === 'manager'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {managerPerms.length}
            </span>
          </button>
        </div>

        {/* Tab description */}
        <p className="text-xs text-gray-500 mb-4">
          {activeTab === 'client'
            ? 'Permissions available to client organisation users. These control what actions client-side users can perform within their organisation.'
            : 'Permissions available to manager (Flux) users. These control operational and administrative actions performed on behalf of client organisations.'}
        </p>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayedPerms.map((perm) => (
            <PermissionCard key={perm.id} permission={perm} />
          ))}
        </div>
      </div>

      {/* Permission Matrix */}
      <PermissionMatrix />

      {/* Footer notice */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 shadow-sm">
        <div className="flex-shrink-0 mt-0.5">
          <Info className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800 mb-0.5">
            System-Defined Permissions
          </p>
          <p className="text-sm text-amber-700 leading-relaxed">
            Permissions are system-defined and can only be assigned to groups by Super Admins. They cannot be created, renamed, or deleted at runtime. To request a new permission, contact the platform engineering team.
          </p>
        </div>
      </div>
    </div>
  );
}
